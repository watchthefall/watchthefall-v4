"""
WTF World Cup — Daily Snapshot
Runs once per day at midnight.

1. Syncs fresh follower counts from followers.json → worldcup.json
2. Copies updated 'followers' into 'previous' for each region
3. Commits and pushes, then deploys to main

This means CHANGE on the leaderboard always = last 24 hours.
"""

import json
import subprocess
import sys
from datetime import datetime, timezone
from pathlib import Path

REPO     = Path(r"C:\Users\PC\Desktop\watchthefall_website")
DEPLOY   = Path(r"C:\Users\PC\Desktop\wtf-main-deploy")
WC_FILE  = REPO / "data" / "worldcup.json"
FOL_FILE = REPO / "data" / "followers.json"
HIST_FILE = REPO / "data" / "worldcup_history.json"
LOCKS    = [REPO / ".git" / "HEAD.lock", REPO / ".git" / "index.lock"]

# Maps followers.json id → worldcup.json region name
REGION_MAP = {
    "scotlandwtf":    "ScotlandWTF",
    "australiawtf":   "AustraliaWTF",
    "britainwtf":     "BritainWTF",
    "canadawtf":      "CanadaWTF",
    "englandwtf":     "EnglandWTF",
    "europewtf":      "EuropeWTF",
    "francewtf":      "FranceWTF",
    "germanywtf":     "GermanyWTF",
    "irelandwtf":     "IrelandWTF",
    "italywtf":       "ItalyWTF",
    "netherlandswtf": "NetherlandsWTF",
    "polandwtf":      "PolandWTF",
    "spainwtf":       "SpainWTF",
    "swedenwtf":      "SwedenWTF",
    "usamericawtf":   "USAmericaWTF",
    "waleswtf":       "WalesWTF",
    "worldwtf":       "WatchTheFallWTF",
}


def clear_locks():
    for lock in LOCKS:
        if lock.exists():
            lock.unlink()
            print(f"Cleared {lock.name}")


def run(cmd, cwd=None):
    result = subprocess.run(cmd, cwd=cwd or REPO, capture_output=True, text=True, shell=True)
    if result.stdout:
        print(result.stdout.strip())
    if result.stderr:
        print(result.stderr.strip(), file=sys.stderr)
    return result.returncode


def main():
    print(f"[WTF Daily Snapshot] {datetime.now().isoformat()}")

    # Load both files
    with open(WC_FILE, encoding="utf-8") as f:
        wc = json.load(f)
    with open(FOL_FILE, encoding="utf-8") as f:
        fol_list = json.load(f)

    # Index followers.json by id
    fol_index = {entry["id"]: entry for entry in fol_list}

    regions = wc.get("regions", [])
    synced = 0
    snapshotted = 0

    for region in regions:
        region_name = region.get("region", "")
        # Find matching followers.json entry
        fol_id = next((k for k, v in REGION_MAP.items() if v == region_name), None)
        fol_entry = fol_index.get(fol_id) if fol_id else None

        # Step 1: sync fresh counts from followers.json
        if fol_entry:
            region["followers"] = {
                "tiktok":    fol_entry.get("tiktok_followers", 0),
                "instagram": fol_entry.get("instagram_followers", 0),
                "youtube":   fol_entry.get("youtube_subs", 0),
                "x":         fol_entry.get("x_followers", 0),
            }
            synced += 1

        # Step 2: snapshot current followers → previous
        if region.get("followers"):
            region["previous"] = dict(region["followers"])
            snapshotted += 1

    today = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    wc["last_updated"] = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")

    with open(WC_FILE, "w", encoding="utf-8") as f:
        json.dump(wc, f, indent=2, ensure_ascii=False)

    print(f"Synced {synced} regions from followers.json, snapshotted {snapshotted}.")

    # Append today's counts to worldcup_history.json
    with open(HIST_FILE, encoding="utf-8") as f:
        hist = json.load(f)

    # Avoid duplicate entries for the same day
    existing_dates = {e["date"] for e in hist.get("history", [])}
    if today not in existing_dates:
        daily_entry = {
            "date": today,
            "regions": [
                {
                    "region": r["region"],
                    "tiktok":    r.get("followers", {}).get("tiktok", 0),
                    "instagram": r.get("followers", {}).get("instagram", 0),
                    "youtube":   r.get("followers", {}).get("youtube", 0),
                    "x":         r.get("followers", {}).get("x", 0),
                }
                for r in regions
            ]
        }
        hist["history"].append(daily_entry)
        with open(HIST_FILE, "w", encoding="utf-8") as f:
            json.dump(hist, f, indent=2, ensure_ascii=False)
        print(f"Appended history entry for {today}.")
    else:
        print(f"History entry for {today} already exists — skipped.")

    # Commit and push dev branch
    clear_locks()
    run("git add data/worldcup.json data/worldcup_history.json", cwd=REPO)
    run(f'git commit -m "Daily snapshot: worldcup.json {datetime.now().strftime(\'%Y-%m-%d\')}"', cwd=REPO)
    run("git push origin fall-map-v2-coded-atlas", cwd=REPO)
    print("Pushed to dev branch.")

    # Deploy to main
    print("Deploying to main...")
    run("git fetch origin", cwd=DEPLOY)
    run("git checkout main", cwd=DEPLOY)
    run("git pull origin main", cwd=DEPLOY)
    run("git fetch origin", cwd=REPO)

    rc = run('git merge --ff-only "origin/fall-map-v2-coded-atlas"', cwd=DEPLOY)
    if rc != 0:
        run('git merge "origin/fall-map-v2-coded-atlas" -m "Deploy: daily snapshot merge"', cwd=DEPLOY)

    run("git push origin main", cwd=DEPLOY)
    print("Deployed to main. GitHub Actions will update in ~1 minute.")


if __name__ == "__main__":
    main()
