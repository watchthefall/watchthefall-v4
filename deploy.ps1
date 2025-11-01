# =====================================================================
# WatchTheFall v4.1.1 - Quick Deploy to GitHub (Validated)
# Syntax: PowerShell 5.1+ compatible
# Qoder Patch: Syntax validation + enhanced error handling
# =====================================================================

# Script validation flag
$ErrorActionPreference = "Stop"

# Display header
Write-Host "=== WatchTheFall v4.1.1 Deployment ===" -ForegroundColor Cyan
Write-Host "" 

# Pre-flight checks
Write-Host "[1/5] Running pre-flight checks..." -ForegroundColor Yellow

# Check if Git is installed
try {
    $gitVersion = git --version 2>$null
    if (-not $gitVersion) {
        throw "Git not found"
    }
    Write-Host "  [OK] Git installed: $gitVersion" -ForegroundColor Green
} catch {
    Write-Host "  [ERROR] Git is not installed or not in PATH!" -ForegroundColor Red
    Write-Host "  [TIP] Install Git from: https://git-scm.com/download/win" -ForegroundColor Yellow
    exit 1
}

# Check if Git repo is initialized
if (-not (Test-Path ".git")) {
    Write-Host "  [ERROR] Not a Git repository!" -ForegroundColor Red
    Write-Host "  [TIP] Run: git init" -ForegroundColor Yellow
    exit 1
}
Write-Host "  [OK] Git repository detected" -ForegroundColor Green

# Check for uncommitted changes
$status = git status --porcelain
if ($status) {
    Write-Host "  [WARN] You have uncommitted changes" -ForegroundColor Yellow
    $commit = Read-Host "  Do you want to commit them first? (y/n)"
    if ($commit -eq "y") {
        git add -A
        $message = Read-Host "  Enter commit message"
        if (-not $message) { $message = "Update before deployment" }
        git commit -m "$message"
        Write-Host "  [OK] Changes committed" -ForegroundColor Green
    }
}

Write-Host ""

# Get GitHub username
Write-Host "[2/5] GitHub configuration..." -ForegroundColor Yellow
$username = Read-Host "  Enter your GitHub username"

if (-not $username) {
    Write-Host "  [ERROR] Username is required!" -ForegroundColor Red
    exit 1
}

# Validate username format (basic check)
if ($username -notmatch '^[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?$') {
    Write-Host "  [WARN] Username contains unusual characters" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "  [INFO] Target repository: https://github.com/$username/watchthefall-v4" -ForegroundColor Cyan
Write-Host ""

# Check if remote already exists
Write-Host "[3/5] Configuring remote..." -ForegroundColor Yellow
$remoteExists = git remote -v 2>$null | Select-String "origin"

if ($remoteExists) {
    Write-Host "  [WARN] Remote 'origin' already exists" -ForegroundColor Yellow
    Write-Host "  Current remote: $remoteExists" -ForegroundColor Gray
    $overwrite = Read-Host "  Do you want to update it? (y/n)"
    if ($overwrite -eq "y") {
        try {
            git remote remove origin 2>$null
            git remote add origin "https://github.com/$username/watchthefall-v4.git"
            Write-Host "  [OK] Remote updated" -ForegroundColor Green
        } catch {
            Write-Host "  [ERROR] Failed to update remote: $_" -ForegroundColor Red
            exit 1
        }
    } else {
        Write-Host "  [INFO] Using existing remote" -ForegroundColor Cyan
    }
} else {
    try {
        git remote add origin "https://github.com/$username/watchthefall-v4.git"
        Write-Host "  [OK] Remote added" -ForegroundColor Green
    } catch {
        Write-Host "  [ERROR] Failed to add remote: $_" -ForegroundColor Red
        exit 1
    }
}

Write-Host ""
Write-Host "[4/5] Verifying branch..." -ForegroundColor Yellow
$currentBranch = git branch --show-current 2>$null
if (-not $currentBranch) {
    Write-Host "  [WARN] No branch detected, creating 'main'..." -ForegroundColor Yellow
    git checkout -b main 2>$null
    $currentBranch = "main"
}
Write-Host "  [OK] Current branch: $currentBranch" -ForegroundColor Green

if ($currentBranch -ne "main") {
    Write-Host "  [WARN] You're on '$currentBranch' branch, not 'main'" -ForegroundColor Yellow
    $switchBranch = Read-Host "  Switch to 'main' branch? (y/n)"
    if ($switchBranch -eq "y") {
        git checkout main 2>$null
        if ($LASTEXITCODE -ne 0) {
            git checkout -b main 2>$null
        }
        Write-Host "  [OK] Switched to 'main' branch" -ForegroundColor Green
    }
}

Write-Host ""
Write-Host "[5/5] Pushing to GitHub..." -ForegroundColor Yellow
Write-Host "  Executing: git push -u origin main" -ForegroundColor Cyan
Write-Host ""

try {
    git push -u origin main 2>&1 | ForEach-Object { Write-Host "  $_" -ForegroundColor Gray }
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "  [SUCCESS] Deployed to GitHub" -ForegroundColor Green
        Write-Host ""
        Write-Host "  Next Steps:" -ForegroundColor Cyan
        Write-Host "  ----------------------------------------------------" -ForegroundColor DarkGray
        Write-Host ""
        Write-Host "  1. Enable GitHub Pages:" -ForegroundColor White
        Write-Host "     https://github.com/$username/watchthefall-v4/settings/pages" -ForegroundColor Blue
        Write-Host ""
        Write-Host "  2. Configure deployment:" -ForegroundColor White
        Write-Host "     - Source: Deploy from a branch" -ForegroundColor Gray
        Write-Host "     - Branch: main / (root)" -ForegroundColor Gray
        Write-Host "     - Click Save" -ForegroundColor Gray
        Write-Host ""
        Write-Host "  3. Your site will be live at:" -ForegroundColor White
        Write-Host "     https://$username.github.io/watchthefall-v4/" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "  4. Custom domain (watchthefall.wtf):" -ForegroundColor White
        Write-Host "     - Add domain in Pages settings" -ForegroundColor Gray
        Write-Host "     - Update DNS A records to GitHub IPs" -ForegroundColor Gray
        Write-Host ""
        Write-Host "  5. Add Printify secrets (optional):" -ForegroundColor White
        Write-Host "     Settings -> Secrets -> Actions -> New repository secret" -ForegroundColor Gray
        Write-Host "     - PRINTIFY_API_KEY" -ForegroundColor Gray
        Write-Host "     - PRINTIFY_SHOP_ID" -ForegroundColor Gray
        Write-Host ""
        Write-Host "  ----------------------------------------------------" -ForegroundColor DarkGray
    } else {
        throw "Git push failed with exit code: $LASTEXITCODE"
    }
} catch {
    Write-Host ""
    Write-Host "  [FAILED] Deployment failed" -ForegroundColor Red
    Write-Host "  ----------------------------------------------------" -ForegroundColor DarkGray
    Write-Host ""
    Write-Host "  Error: $_" -ForegroundColor Red
    Write-Host ""
    Write-Host "  Common solutions:" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "  1. Create repository on GitHub first:" -ForegroundColor White
    Write-Host "     https://github.com/new" -ForegroundColor Blue
    Write-Host "     Name: watchthefall-v4" -ForegroundColor Gray
    Write-Host ""
    Write-Host "  2. Configure Git credentials:" -ForegroundColor White
    Write-Host "     git config --global user.name \"Your Name\"" -ForegroundColor Gray
    Write-Host "     git config --global user.email \"you@example.com\"" -ForegroundColor Gray
    Write-Host ""
    Write-Host "  3. Use GitHub CLI (recommended):" -ForegroundColor White
    Write-Host "     gh auth login" -ForegroundColor Gray
    Write-Host "     gh repo create watchthefall-v4 --public --source=. --push" -ForegroundColor Gray
    Write-Host ""
    Write-Host "  4. Use Personal Access Token:" -ForegroundColor White
    Write-Host "     https://github.com/settings/tokens" -ForegroundColor Blue
    Write-Host "     Clone with: https://USERNAME:TOKEN@github.com/..." -ForegroundColor Gray
    Write-Host ""
    Write-Host "  ----------------------------------------------------" -ForegroundColor DarkGray
    Write-Host ""
    exit 1
}

Write-Host ""
Write-Host "[OK] Deploy script completed successfully" -ForegroundColor Green
Write-Host "" 
