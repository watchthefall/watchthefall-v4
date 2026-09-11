#!/usr/bin/env python3
"""
WatchTheFall Network Updater
Usage:
  python update_network.py post scotlandwtf spainwtf francewtf
  python update_network.py post scotlandwtf --url https://www.instagram.com/scotlandwtf/reel/ABC123/
  python update_network.py followers
  python update_network.py followers scotlandwtf --ig 17000 --tiktok 4500

Designed to be called from Dispatch or a GitHub Action.
"""

import json, os, sys, subprocess, re, time
from pathlib import Path
from datetime import datetime, timezone

REPO = Path(__file__).parent.parent
DATA = REPO / "data"

# Map account slugs to their library JSON files and Instagram usernames
ACCOUNTS = {
    "scotlandwtf":      {"lib": "scotlandwtf_library.json",    "ig": "scotlandwtf",      "followers_id": "scotlandwtf"},
    "australiawtf":     {"lib": "australiawtf_library.json",   "ig": "australiawtf_",    "followers_id": "australiawtf"},
    "britainwtf":       {"lib": "britainwtf_library.json",     "ig": "britainwtf",       "followers_id": "britainwtf"},
    "canadawtf":        {"lib": "canadawtf_library.json",      "ig": "canadawtf_",       "followers_id": "canadawtf"},
    "englandwtf":       {"lib": "englandwtf_library.json",     "ig": "england.wtf",      "followers_id": "englandwtf"},
    "europewtf":        {"lib": "europewtf_library.json",      "ig": "europewtf",        "followers_id": "europewtf"},
    "francewtf":        {"lib": "francewtf_library.json",      "ig": "france_wtf",       "followers_id": "francewtf"},
    "germanywtf":       {"lib": "germanywtf_library.json",     "ig": "germany.wtf",      "followers_id": "germanywtf"},
    "irelandwtf":       {"lib": "irelandwtf_library.json",     "ig": "irelandwtf",       "followers_id": "irelandwtf"},
    "italywtf":         {"lib": "italywtf_library.json",       "ig": "italy_wtf",        "followers_id": "italywtf"},
    "netherlandswtf":   {"lib": "netherlandswtf_library.json", "ig": "netherlands.wtf",  "followers_id": "netherlandswtf"},
    "polandwtf":        {"lib": "polandwtf_library.json",      "ig": "polandwtf",        "followers_id": "polandwtf"},
    "spainwtf":         {"lib": "spainwtf_library.json",       "ig": "spainwtf",         "followers_id": "spainwtf"},
    "swedenwtf":        {"lib": "swedenwtf_library.json",      "ig": "swedenwtf",        "followers_id": "swedenwtf"},
    "usamericawtf":     {"lib": "usamericawtf_library.json",   "ig": "usamericawtf",     "followers_id": "usamericawtf"},
    "waleswtf":         {"lib": "waleswtf_library.json",       "ig": "waleswtf",         "followers_id": "waleswtf"},
    "worldwtf":         {"lib": None,                          "ig": "worldwtf",         "followers_id": "worldwtf"},
}

# ── Helpers ──────────────────────────────────────────────────────────────────

def load_json(path):
    with open(path, encoding="utf-8") as f:
        return json.load(f)

def save_json(path, data):
    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
    print(f"  saved: {path.name}")

def git_commit_push(message):
    try:
        subprocess.run(["git", "-C", str(REPO), "add", "-A"], check=True)
        result = subprocess.run(
            ["git", "-C", str(REPO), "commit", "-m", message],
            capture_output=True, text=True
        )
        if "nothing to commit" in result.stdout:
            print("  git: nothing to commit")
            return False
        subprocess.run(["git", "-C", str(REPO), "push"], check=True)
        print(f"  git: committed and pushed — {message}")
        return True
    except subprocess.CalledProcessError as e:
        print(f"  git error: {e}")
        return False

def fetch_ig_followers(username):
    """
    Try to extract follower count from Instagram's public profile page.
    Returns int or None if unavailable.
    """
    try:
        import urllib.request
        url = f"https://www.instagram.com/{username}/"
        req = urllib.request.Request(url, headers={
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
            "Accept-Language": "en-US,en;q=0.9",
        })
        with urllib.request.urlopen(req, timeout=10) as resp:
            html = resp.read().decode("utf-8", errors="ignore")

        # Instagram embeds counts in JSON-LD or meta tags
        # Try meta description: "X Followers, Y Following, Z Posts"
        m = re.search(r'"edge_followed_by":\{"count":(\d+)\}', html)
        if m:
            return int(m.group(1))

        # Try og:description fallback
        m = re.search(r'([\d,]+)\s+Followers', html)
        if m:
            return int(m.group(1).replace(",", ""))

    except Exception as e:
        print(f"    fetch failed for {username}: {e}")
    return None

def fetch_ig_latest_reel(username):
    """
    Try to get the most recent reel URL from the public profile.
    Returns URL string or None.
    """
    try:
        import urllib.request
        url = f"https://www.instagram.com/{username}/"
        req = urllib.request.Request(url, headers={
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        })
        with urllib.request.urlopen(req, timeout=10) as resp:
            html = resp.read().decode("utf-8", errors="ignore")

        # Look for reel shortcodes in the page
        reels = re.findall(r'"shortcode":"([A-Za-z0-9_-]{10,})"', html)
        if reels:
            return f"https://www.instagram.com/{username}/reel/{reels[0]}/"
    except Exception as e:
        print(f"    reel fetch failed for {username}: {e}")
    return None

# ── Commands ─────────────────────────────────────────────────────────────────

def cmd_post(accounts_to_update, provided_url=None):
    """
    Mark new post(s) as 'latest' in library JSONs.
    If a URL is provided, use it. Otherwise try to fetch from public profile.
    If fetch fails, leave latest unchanged and report.
    """
    updated = []
    skipped = []

    for slug in accounts_to_update:
        slug = slug.lower().strip()
        if slug not in ACCOUNTS:
            print(f"  unknown account: {slug}")
            skipped.append(slug)
            continue

        cfg = ACCOUNTS[slug]
        if not cfg["lib"]:
            print(f"  {slug}: no library file configured")
            skipped.append(slug)
            continue

        lib_path = DATA / cfg["lib"]
        if not lib_path.exists():
            print(f"  {slug}: library file not found at {lib_path}")
            skipped.append(slug)
            continue

        lib = load_json(lib_path)

        # Determine URL to use
        url = provided_url
        if not url:
            print(f"  {slug}: trying to fetch latest reel from Instagram...")
            url = fetch_ig_latest_reel(cfg["ig"])

        if url:
            old = lib.get("latest", "")
            lib["latest"] = url
            lib["_meta"] = lib.get("_meta", {})
            lib["_meta"]["last_updated"] = datetime.now(timezone.utc).isoformat()
            save_json(lib_path, lib)
            updated.append(f"{slug} → {url}")
            print(f"  ✓ {slug}: latest = {url}")
        else:
            print(f"  ⚠ {slug}: couldn't fetch latest URL — provide it manually with --url")
            skipped.append(slug)

    if updated:
        msg = f"Update latest posts: {', '.join(a.split(' →')[0] for a in updated)}"
        git_commit_push(msg)

    print(f"\nDone. Updated: {len(updated)}, Skipped: {len(skipped)}")
    if updated:
        print("Updated:")
        for u in updated: print(f"  {u}")
    if skipped:
        print(f"Skipped: {', '.join(skipped)}")


def cmd_followers(specific_accounts=None, manual_ig=None, manual_tiktok=None):
    """
    Refresh follower counts.
    If specific_accounts + manual counts provided: direct update.
    Otherwise: try to auto-fetch all accounts from Instagram.
    """
    followers_path = DATA / "followers.json"
    followers = load_json(followers_path)

    # Build lookup by id
    by_id = {f["id"]: f for f in followers}

    updated_count = 0
    now = datetime.now(timezone.utc).isoformat()

    if specific_accounts and manual_ig is not None:
        # Manual update for specific accounts
        for slug in specific_accounts:
            slug = slug.lower().strip()
            fid = ACCOUNTS.get(slug, {}).get("followers_id", slug)
            if fid in by_id:
                old = by_id[fid].get("instagram_followers", 0)
                by_id[fid]["instagram_followers"] = int(manual_ig)
                if manual_tiktok is not None:
                    by_id[fid]["tiktok_followers"] = int(manual_tiktok)
                by_id[fid]["_last_updated"] = now
                print(f"  ✓ {slug}: IG {old} → {manual_ig}")
                updated_count += 1
            else:
                print(f"  unknown in followers.json: {slug}")
    else:
        # Auto-fetch attempt for all accounts
        print("  Attempting auto-fetch from Instagram (may not work due to auth requirements)...")
        for slug, cfg in ACCOUNTS.items():
            fid = cfg["followers_id"]
            if fid not in by_id:
                continue
            print(f"  checking {slug}...", end=" ", flush=True)
            count = fetch_ig_followers(cfg["ig"])
            if count is not None:
                old = by_id[fid].get("instagram_followers", 0)
                by_id[fid]["instagram_followers"] = count
                by_id[fid]["_last_updated"] = now
                print(f"✓ {old} → {count}")
                updated_count += 1
            else:
                print("skipped (login required or blocked)")
            time.sleep(1.5)  # be polite

    # Rebuild list and save
    updated_followers = list(by_id.values())
    save_json(followers_path, updated_followers)

    if updated_count > 0:
        git_commit_push(f"Auto-update follower counts ({updated_count} accounts, {now[:10]})")
    else:
        print("  No counts updated — Instagram may require login. Use manual mode:")
        print("  python update_network.py followers scotlandwtf --ig 17000 --tiktok 4500")

    print(f"\nDone. {updated_count} account(s) updated.")


# ── Entry point ───────────────────────────────────────────────────────────────

if __name__ == "__main__":
    args = sys.argv[1:]

    if not args:
        print(__doc__)
        sys.exit(0)

    cmd = args[0].lower()

    if cmd == "post":
        # python update_network.py post scotlandwtf spainwtf [--url URL]
        rest = args[1:]
        url = None
        account_args = []
        i = 0
        while i < len(rest):
            if rest[i] == "--url" and i + 1 < len(rest):
                url = rest[i + 1]
                i += 2
            else:
                account_args.append(rest[i])
                i += 1
        if not account_args:
            print("Usage: python update_network.py post <account1> [account2] [--url URL]")
            sys.exit(1)
        cmd_post(account_args, provided_url=url)

    elif cmd == "followers":
        # python update_network.py followers [account] [--ig COUNT] [--tiktok COUNT]
        rest = args[1:]
        ig = None
        tiktok = None
        account_args = []
        i = 0
        while i < len(rest):
            if rest[i] == "--ig" and i + 1 < len(rest):
                ig = rest[i + 1]; i += 2
            elif rest[i] == "--tiktok" and i + 1 < len(rest):
                tiktok = rest[i + 1]; i += 2
            else:
                account_args.append(rest[i]); i += 1
        cmd_followers(
            specific_accounts=account_args if account_args else None,
            manual_ig=ig,
            manual_tiktok=tiktok
        )

    else:
        print(f"Unknown command: {cmd}")
        print("Commands: post, followers")
        sys.exit(1)
