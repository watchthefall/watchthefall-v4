# ============================================
# WatchTheFall.wtf - Safe Cleanup Script (V4+)
# ============================================
# Keeps all custom scripts (including logo_diagnostic.py & deploy.ps1)
# Creates /cleanup_restore/ for temporary recoveries (24 hours retention)
# Generates a detailed cleanup_report.txt log file.
# ============================================

$RootPath = "C:\Users\Jamie\OneDrive\Desktop\WatchTheFall_V4"
$LogDir = "$RootPath\logs"
$RestoreDir = "$RootPath\cleanup_restore"
$LogFile = "$RootPath\cleanup_report.txt"

# Ensure restore directory exists
if (-not (Test-Path $RestoreDir)) {
    New-Item -ItemType Directory -Path $RestoreDir | Out-Null
}

# Start log
"[CLEANUP] WatchTheFall.wtf Cleanup Log - $(Get-Date)" | Out-File -FilePath $LogFile -Encoding utf8
"------------------------------------------------------------" | Out-File -Append $LogFile

Write-Host "`n[CLEANUP] Starting safe cleanup for WatchTheFall V4 project...`n"

# Directories to remove (moved to restore first)
$DirsToRemove = @(
    "$RootPath\backups",
    "$RootPath\logs"
)

# Empty HTML placeholder files in root
$EmptyHtmlFiles = @(
    "australia.html","britain.html","canada.html","england.html","europe.html",
    "france.html","germany.html","ireland.html","italy.html","netherlands.html",
    "poland.html","scotland.html","spain.html","sweden.html","usa.html"
)

# Function to move items to restore instead of instant deletion
function Move-ToRestore($path) {
    if (Test-Path $path) {
        $itemName = Split-Path $path -Leaf
        $target = Join-Path $RestoreDir $itemName
        Move-Item -Path $path -Destination $target -Force
        "[RESTORE] Moved to restore: $itemName" | Tee-Object -Append -FilePath $LogFile
        return $true
    }
    return $false
}

# 1️⃣ Move backup and log directories to restore
$totalSaved = 0
foreach ($dir in $DirsToRemove) {
    if (Test-Path $dir) {
        $size = (Get-ChildItem -Recurse -File $dir | Measure-Object -Property Length -Sum).Sum
        $sizeKB = [math]::Round($size / 1KB, 2)
        if (Move-ToRestore $dir) {
            "[OK] Moved directory: $(Split-Path $dir -Leaf) ($sizeKB KB)" | Tee-Object -Append -FilePath $LogFile
            $totalSaved += $size
        }
    } else {
        "[SKIP] Skipped (not found): $(Split-Path $dir -Leaf)" | Tee-Object -Append -FilePath $LogFile
    }
}

# 2️⃣ Move empty placeholder HTML files to restore
$placeholderCount = 0
foreach ($file in $EmptyHtmlFiles) {
    $FilePath = Join-Path $RootPath $file
    if (Test-Path $FilePath) {
        if (Move-ToRestore $FilePath) {
            "[OK] Moved placeholder: $file" | Tee-Object -Append -FilePath $LogFile
            $placeholderCount++
        }
    } else {
        "[SKIP] Skipped (not found): $file" | Tee-Object -Append -FilePath $LogFile
    }
}

# 3️⃣ Verify critical directories are still intact
"------------------------------------------------------------" | Out-File -Append $LogFile
"[VERIFY] Verifying critical project structure..." | Out-File -Append $LogFile
$CriticalDirs = @("data","scripts","styles","assets","regional\pages",".github")
$allGood = $true
foreach ($dir in $CriticalDirs) {
    $CheckPath = Join-Path $RootPath $dir
    if (Test-Path $CheckPath) {
        "[GOOD] Verified: $dir" | Tee-Object -Append -FilePath $LogFile
    } else {
        "[WARNING] Missing directory: $dir" | Tee-Object -Append -FilePath $LogFile
        $allGood = $false
    }
}

# 4️⃣ Summary
"------------------------------------------------------------" | Out-File -Append $LogFile
$totalSavedKB = [math]::Round($totalSaved / 1KB, 2)
"[SUMMARY] CLEANUP SUMMARY:" | Out-File -Append $LogFile
"   - Directories moved: $($DirsToRemove.Count)" | Out-File -Append $LogFile
"   - Placeholder files moved: $placeholderCount" | Out-File -Append $LogFile
"   - Space cleaned: $totalSavedKB KB" | Out-File -Append $LogFile
"   - All critical files intact: $(if($allGood){'YES'}else{'NO'})" | Out-File -Append $LogFile
"------------------------------------------------------------" | Out-File -Append $LogFile
"[INFO] Files moved to cleanup_restore/ will be kept for 24 hours." | Out-File -Append $LogFile
"       To permanently delete, remove the cleanup_restore folder." | Out-File -Append $LogFile
"       To restore, move files back to their original locations." | Out-File -Append $LogFile
"[DONE] Cleanup complete at $(Get-Date)" | Out-File -Append $LogFile

Write-Host "`n[DONE] Cleanup complete! Report saved to: cleanup_report.txt`n"
Write-Host "[INFO] Deleted files are safely stored in: cleanup_restore/ for 24 hours.`n"
Write-Host "[SUMMARY] Space cleaned: $totalSavedKB KB`n"
