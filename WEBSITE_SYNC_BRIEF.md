# watchthefall.com — Sync Brief (from the Brandr app chat, 2026-07-18)

Point of this file: bring the marketing website in line with decisions locked in the Brandr chat. Repos are separate — this is `watchthefall_website`; the Brandr app is `wtf_brandr_app/watchthefall_orchestrator_v3`; the "Build the Machine" deck is a Cloudflare Worker at `build.watchthefall.com`.

## 1. Canonical pricing (LOCKED — must match everywhere)
| Tier | Founder | Standard |
|---|---|---|
| Explorer | Free | Free |
| Creator | £4.99 | £6.99 |
| Studio | £9.99 | £14.99 |
| Platinum | £19.99 | £24.99 |
| Elite | invite-only | — |
No stray £7.99 Creator (that was a typo); no old £9/£19/£49 or £12/£25/£59 anywhere.

## 2. Founder policy (CORRECTED — do NOT use old wording)
Use this framing only — it's a permanent **status/access** promise, NOT a fixed-price promise:
> **Founder Status is a permanent account entitlement.** Founders always keep access to **exclusive Founder pricing and Founder benefits**, even if they cancel and return later. The exact prices, discounts, benefits and perks **may evolve** as Brandr grows.

❌ BANNED phrasing (removed everywhere else, don't reintroduce): "locked for life", "the price you join at never rises", "always below standard", "locked for 12 months", "first 10 Founding Members", "protected window". These make contractual promises the founder does NOT want.
- **Card line:** "Founder Status Included — Your Founder Status stays attached to your account for life. Return at any time and continue receiving exclusive Founder pricing and Founder benefits."
- **FAQ:** "Is my exact founder price locked forever? No — Founder Status is permanent, but Brandr may evolve; founders always receive exclusive Founder pricing and benefits, though exact prices, discounts, features and perks may change."

## 3. Documented Instagram network reach (NEW — great for the geo map)
Exported per-account analytics, 30 days to 16 Jul 2026 (see `Instagram_Network_Evidence_2026-07.md` in this repo):
- **19 IG accounts · ~58.9k followers · ~8.38M Reel views · ~5.07M reached/viewers · ~192 posts**
- **Instagram alone** (cross-platform higher — treat as a floor).
- **Reach ≫ followers** (germany.wtf 947K views/862 followers; italy_wtf 3.1M/3,368; england.wtf 43K/82).
- Honesty caveats to keep: IG-only; combined reach is a per-account sum, **not deduplicated**; IG shows rounded values.
- **For FALL_MAP_GEO_PLAN:** the evidence file has per-region rows (Scotland, Australia, USA, England, Germany, Italy, Spain, Netherlands, France, Ireland, Wales, Poland, Sweden, Canada, Britain, N.Ireland, The West, Europe) with followers/views/reach — ready to drive an interactive geographic network map.

## 4. Product / positioning (keep public-facing restrained)
- Brandr = paste clips → apply brand → render → download; vertical 9:16 + square 1:1; live at **brandr.online**.
- Waitlist is **live**: `brandr.online/waitlist` (primary CTA).
- Discord invite (real): `https://discord.gg/ZTEtyQz7V`.
- Do **NOT** publicly name future tools (Creator Profiles, WTF Learn/Labs/Records). Hint only: *"More creator tools are planned after launch."*

## 5. Context — the "Build the Machine" deck (separate from this site)
Live at `build.watchthefall.com`: public `/` (marketing) + Access-gated `/roadmap/` (the founder/investor hub). Deployed via wrangler (Cloudflare Worker `white-band-778a`). Not part of watchthefall.com, but shares the pricing/founder/reach facts above — keep them consistent.

## Sources of truth
- Pricing/founder/reach detail: handbook `Build_the_Machine_Handbook_FULL_MASTER.md` (Sections 5/7/15/24 + Appendix F).
- Reach data: `Instagram_Network_Evidence_2026-07.md` (this repo).
- Cross-session memory + `wtf_brandr_app/HANDOFF.md` carry the same decisions.
