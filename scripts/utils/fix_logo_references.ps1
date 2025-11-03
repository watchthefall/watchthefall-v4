# Fix Logo References Script
# This script fixes incorrect logo references in data files and HTML files
# It converts .jpg/.webp references to .png where appropriate and updates mismatched references

$baseDir = "c:\Users\Jamie\OneDrive\Desktop\WatchTheFall_V4"

Write-Host "Fixing Logo References..." -ForegroundColor Cyan
Write-Host "========================" -ForegroundColor Cyan

# Fix The West logo references (change .jpg to .png)
Write-Host "Fixing The West logo references..." -ForegroundColor Yellow

# Update leaderboard.json
$leaderboardPath = "$baseDir\data\leaderboard.json"
if (Test-Path $leaderboardPath) {
    $content = Get-Content $leaderboardPath -Raw -Encoding UTF8
    $original = $content
    $content = $content -replace 'assets/logos/the-west-wtf\.jpg', 'assets/logos/the-west-wtf.png'
    
    if ($content -ne $original) {
        $content | Out-File -FilePath $leaderboardPath -Encoding UTF8 -NoNewline
        Write-Host "  Updated leaderboard.json" -ForegroundColor Green
    }
}

# Update worldcup.json
$worldcupPath = "$baseDir\data\worldcup.json"
if (Test-Path $worldcupPath) {
    $content = Get-Content $worldcupPath -Raw -Encoding UTF8
    $original = $content
    $content = $content -replace 'assets/logos/the-west-wtf\.jpg', 'assets/logos/the-west-wtf.png'
    
    if ($content -ne $original) {
        $content | Out-File -FilePath $worldcupPath -Encoding UTF8 -NoNewline
        Write-Host "  Updated worldcup.json" -ForegroundColor Green
    }
}

# Update feed.html
$feedPath = "$baseDir\feed.html"
if (Test-Path $feedPath) {
    $content = Get-Content $feedPath -Raw -Encoding UTF8
    $original = $content
    $content = $content -replace 'assets/logos/the-west-wtf\.jpg', 'assets/logos/the-west-wtf.png'
    
    if ($content -ne $original) {
        $content | Out-File -FilePath $feedPath -Encoding UTF8 -NoNewline
        Write-Host "  Updated feed.html" -ForegroundColor Green
    }
}

# Fix AI logo references (change .png to .webp since that's what we have)
Write-Host "Fixing AI logo references..." -ForegroundColor Yellow

# Update leaderboard.json
if (Test-Path $leaderboardPath) {
    $content = Get-Content $leaderboardPath -Raw -Encoding UTF8
    $original = $content
    $content = $content -replace 'assets/logos/ai-wtf-logo\.png', 'assets/logos/ai-wtf-logo.webp'
    
    if ($content -ne $original) {
        $content | Out-File -FilePath $leaderboardPath -Encoding UTF8 -NoNewline
        Write-Host "  Updated leaderboard.json" -ForegroundColor Green
    }
}

# Update worldcup.json
if (Test-Path $worldcupPath) {
    $content = Get-Content $worldcupPath -Raw -Encoding UTF8
    $original = $content
    $content = $content -replace 'assets/logos/ai-wtf-logo\.png', 'assets/logos/ai-wtf-logo.webp'
    
    if ($content -ne $original) {
        $content | Out-File -FilePath $worldcupPath -Encoding UTF8 -NoNewline
        Write-Host "  Updated worldcup.json" -ForegroundColor Green
    }
}

# Update feed.html
if (Test-Path $feedPath) {
    $content = Get-Content $feedPath -Raw -Encoding UTF8
    $original = $content
    $content = $content -replace 'assets/logos/ai-wtf-logo\.png', 'assets/logos/ai-wtf-logo.webp'
    
    if ($content -ne $original) {
        $content | Out-File -FilePath $feedPath -Encoding UTF8 -NoNewline
        Write-Host "  Updated feed.html" -ForegroundColor Green
    }
}

Write-Host ""
Write-Host "Logo reference fixes completed!" -ForegroundColor Green
Write-Host ""
Write-Host "Changes made:" -ForegroundColor Cyan
Write-Host "  - Updated The West logo references from .jpg to .png" -ForegroundColor White
Write-Host "  - Updated AI logo references from .png to .webp (to match existing files)" -ForegroundColor White
Write-Host ""
Write-Host "You can now run this script with: powershell -ExecutionPolicy Bypass -File scripts/utils/fix_logo_references.ps1" -ForegroundColor Yellow