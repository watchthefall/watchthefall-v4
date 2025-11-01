# =====================================================================
# WatchTheFall v4.1 - Quick Deploy to GitHub
# =====================================================================

Write-Host "=== WatchTheFall v4.1 Deployment ===" -ForegroundColor Cyan
Write-Host ""

# Check if Git repo is initialized
if (-not (Test-Path ".git")) {
    Write-Host "❌ Not a Git repository!" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Git repository detected" -ForegroundColor Green

# Get GitHub username
$username = Read-Host "Enter your GitHub username"

if (-not $username) {
    Write-Host "❌ Username is required!" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "📦 Repository: https://github.com/$username/watchthefall-v4" -ForegroundColor Yellow
Write-Host ""

# Check if remote already exists
$remoteExists = git remote -v | Select-String "origin"

if ($remoteExists) {
    Write-Host "⚠️  Remote 'origin' already exists" -ForegroundColor Yellow
    $overwrite = Read-Host "Do you want to update it? (y/n)"
    if ($overwrite -eq "y") {
        git remote remove origin
        git remote add origin "https://github.com/$username/watchthefall-v4.git"
        Write-Host "✅ Remote updated" -ForegroundColor Green
    }
} else {
    git remote add origin "https://github.com/$username/watchthefall-v4.git"
    Write-Host "✅ Remote added" -ForegroundColor Green
}

Write-Host ""
Write-Host "🚀 Pushing to GitHub..." -ForegroundColor Cyan

try {
    git push -u origin main
    Write-Host ""
    Write-Host "✅ SUCCESS! Deployed to GitHub" -ForegroundColor Green
    Write-Host ""
    Write-Host "📋 Next Steps:" -ForegroundColor Cyan
    Write-Host "1. Go to: https://github.com/$username/watchthefall-v4/settings/pages"
    Write-Host "2. Under 'Build and deployment':"
    Write-Host "   - Source: Deploy from a branch"
    Write-Host "   - Branch: main / (root)"
    Write-Host "   - Click Save"
    Write-Host ""
    Write-Host "3. Your site will be live at:"
    Write-Host "   https://$username.github.io/watchthefall-v4/" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "4. To use custom domain (watchthefall.wtf):"
    Write-Host "   - Add domain in Pages settings"
    Write-Host "   - Update DNS records to point to GitHub Pages"
    Write-Host ""
    Write-Host "5. Add Printify secrets (optional):"
    Write-Host "   Settings → Secrets → Actions → New repository secret"
    Write-Host "   - PRINTIFY_API_KEY"
    Write-Host "   - PRINTIFY_SHOP_ID"
    Write-Host ""
} catch {
    Write-Host "❌ Push failed!" -ForegroundColor Red
    Write-Host "Error: $_" -ForegroundColor Red
    Write-Host ""
    Write-Host "💡 Possible solutions:" -ForegroundColor Yellow
    Write-Host "1. Make sure the repository exists on GitHub"
    Write-Host "2. Check your authentication (use GitHub CLI or personal access token)"
    Write-Host "3. Try: gh repo create watchthefall-v4 --public --source=. --remote=origin --push"
}
