# WatchTheFall V4 - Cleanup Plan

## Performance Improvements Applied ✅
1. **Disabled video autoplay on homepage** - All videos now lazy-load on user interaction
2. **Disabled video autoplay on subpages** - All content loads only when scrolled into view
3. **Changed preloadCount from 2-3 to 0** - Massive initial load time reduction

## Safe Files to Delete (Recommended)

### 1. Backup Files (backups/)
- **Size**: ~200KB
- **Safe to delete**: Yes - These are pre-v4.3 regional page backups
- **Files**:
  - All `regional_pre_v4.3_*.html` files (16 files)
  - `qoder_autosave/` directory (32 autosaved files)
- **Reason**: Backups are in Git history, no longer needed locally

### 2. Log Files (logs/)
- **Size**: ~18KB
- **Safe to delete**: Yes - Diagnostic logs from build process
- **Files**:
  - deploy_syntax_check.txt
  - logo_diagnostic_report.txt
  - logo_reference_update.txt
  - qoder_regional_update_log.txt
  - qoder_v4.3_sync_log.txt
- **Reason**: Logs are informational only, not required for site operation

### 3. Development Scripts
- **logo_diagnostic.py** (4.4KB) - Python diagnostic script, not used in production
- **deploy.ps1** (8.0KB) - PowerShell deployment script (GitHub Actions handles deployment)
- **Safe to delete**: Yes, but keep if you use them for local testing

### 4. Empty HTML Files (Root Directory)
These 0-byte placeholder files should be deleted - actual pages are in `regional/pages/`:
- australia.html (0KB)
- britain.html (0KB)
- canada.html (0KB)
- england.html (0KB)
- europe.html (0KB)
- france.html (0KB)
- germany.html (0KB)
- ireland.html (0KB)
- italy.html (0KB)
- netherlands.html (0KB)
- poland.html (0KB)
- scotland.html (0KB)
- spain.html (0KB)
- sweden.html (0KB)
- usa.html (0KB)

### 5. Documentation (Optional)
- **DEPLOYMENT.md** (3.7KB) - Deployment guide
- **README.md** (2.9KB) - Project readme
- **Safe to delete**: Only if you don't need documentation
- **Recommendation**: Keep DEPLOYMENT.md, delete README.md if not needed

## Total Space Savings
- Backups: ~200KB
- Logs: ~18KB
- Empty HTML: ~0KB (but cleaner structure)
- Scripts: ~12KB
- **Total**: ~230KB + cleaner project structure

## Files to KEEP (Critical)
- ✅ All files in `data/` directory (JSON content)
- ✅ All files in `scripts/` directory (site functionality)
- ✅ All files in `styles/` directory (CSS)
- ✅ All files in `assets/` directory (images, videos, logos)
- ✅ `regional/pages/` directory (actual regional pages)
- ✅ `.github/` workflows (deployment automation)
- ✅ Root HTML files: index.html, ai.html, feed.html, wtfcreations.html, watchthefallrecords.html
- ✅ PWA files: manifest.json, sw.js
- ✅ Config files: .gitignore, CNAME, package.json, .env.template

## Recommended Action
**Safe delete in this order:**
1. Delete `backups/` directory entirely
2. Delete `logs/` directory entirely
3. Delete empty HTML files in root
4. (Optional) Delete logo_diagnostic.py and deploy.ps1

Would you like me to proceed with the cleanup?
