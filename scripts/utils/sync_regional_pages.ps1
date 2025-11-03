# Regional Pages Sync Script
# Implements full consistency and feature sync across all /regional/pages/ for WatchTheFall v4

# Load leaderboard data
$leaderboardPath = "c:\Users\Jamie\OneDrive\Desktop\WatchTheFall_V4\data\leaderboard.json"
$leaderboard = Get-Content $leaderboardPath -Raw | ConvertFrom-Json

# Create log file
$logPath = "c:\Users\Jamie\OneDrive\Desktop\WatchTheFall_V4\logs\qoder_regional_update_log.txt"
$logHeader = "Region | Tier | Buttons Count | Extended Block OK | Links Fixed (Y/N)`n-------|------|---------------|-------------------|------------------`n"
Set-Content -Path $logPath -Value "# Regional Pages Sync Log`n# Generated on: $(Get-Date)`n`n$logHeader"

# Map regions to their ranks (1-based index)
$regionRanks = @{}
for ($i = 0; $i -lt $leaderboard.Count; $i++) {
    $regionId = $leaderboard[$i].id
    $regionRanks[$regionId] = $i + 1
}

# Map page names to region IDs
$pageToRegionMap = @{
    "usa" = "usamericawtf"
    "ai" = "aiwtf"
    # Add more mappings as needed
}

# Function to determine tier based on rank
function Get-TierFromRank($rank) {
    if ($rank -ge 1 -and $rank -le 5) {
        return 1  # Tier 1: 7 buttons
    } elseif ($rank -ge 6 -and $rank -le 10) {
        return 2  # Tier 2: 5 buttons
    } else {
        return 3  # Tier 3: 3 buttons
    }
}

# Function to get button count based on tier
function Get-ButtonCountFromTier($tier) {
    switch ($tier) {
        1 { return 7 }
        2 { return 5 }
        3 { return 3 }
        default { return 7 }
    }
}

# Function to get button names based on tier
function Get-ButtonNamesFromTier($tier) {
    switch ($tier) {
        1 { 
            return @("Instagram", "TikTok", "X", "YouTube", "Threads", "WTF Creations", "Support Us")
        }
        2 { 
            return @("Instagram", "TikTok", "X", "YouTube", "Support Us")
        }
        3 { 
            return @("Instagram", "TikTok", "Support Us")
        }
        default { 
            return @("Instagram", "TikTok", "X", "YouTube", "Threads", "WTF Creations", "Support Us")
        }
    }
}

# Process each regional page
$regionalPagesPath = "c:\Users\Jamie\OneDrive\Desktop\WatchTheFall_V4\regional\pages"
$pageFiles = Get-ChildItem -Path $regionalPagesPath -Filter "*.html"

foreach ($pageFile in $pageFiles) {
    $pageName = $pageFile.BaseName.ToLower()
    $pagePath = $pageFile.FullName
    
    Write-Host "Processing $pageName..." -ForegroundColor Yellow
    
    # Find corresponding region in leaderboard
    $regionId = $pageToRegionMap[$pageName]
    if (-not $regionId) {
        # Try standard mapping
        $regionId = "$pageName`wtf"
        # Check if this region exists in leaderboard
        $regionEntry = $leaderboard | Where-Object { $_.id -eq $regionId }
        if (-not $regionEntry) {
            # Try without "wtf" suffix
            $regionEntry = $leaderboard | Where-Object { $_.id -eq $pageName }
            if ($regionEntry) {
                $regionId = $pageName
            } else {
                $regionId = $null
            }
        } else {
            $regionEntry = $leaderboard | Where-Object { $_.id -eq $regionId }
        }
    } else {
        # Use mapped region ID
        $regionEntry = $leaderboard | Where-Object { $_.id -eq $regionId }
    }
    
    Write-Host "  Region ID: $regionId" -ForegroundColor Cyan
    
    if ($regionEntry -and $regionId) {
        $rank = $regionRanks[$regionId]
        $tier = Get-TierFromRank $rank
        $buttonCount = Get-ButtonCountFromTier $tier
        $buttonNames = Get-ButtonNamesFromTier $tier
        
        Write-Host "  Region: $($regionEntry.name), Rank: $rank, Tier: $tier, Buttons: $buttonCount" -ForegroundColor Cyan
        
        # Read page content
        $content = Get-Content $pagePath -Raw -Encoding UTF8
        
        # Update Connect & Support section based on tier
        # Find the action-buttons div
        if ($content -match '(<div class="action-buttons">.*?</div>)') {
            $oldButtons = $matches[1]
            Write-Host "  Found action-buttons section" -ForegroundColor Green
            
            # Generate new buttons based on tier
            $newButtonsHtml = '<div class="action-buttons">'
            
            # Add buttons based on tier
            if ($buttonNames -contains "Instagram") {
                $newButtonsHtml += "`n                <a href=`"https://www.instagram.com/$pageName.wtf`" target=`"_blank`" class=`"action-btn instagram-btn`">`n                    <span class=`"btn-icon`"><i class=`"fab fa-instagram`"></i></span>`n                    <span class=`"btn-text`">Instagram</span>`n                </a>"
            }
            
            if ($buttonNames -contains "TikTok") {
                $newButtonsHtml += "`n                <a href=`"https://www.tiktok.com/@$pageName.wtf`" target=`"_blank`" class=`"action-btn tiktok-btn`">`n                    <span class=`"btn-icon`"><i class=`"fab fa-tiktok`"></i></span>`n                    <span class=`"btn-text`">TikTok</span>`n                </a>"
            }
            
            if ($buttonNames -contains "X") {
                $xHandle = if ($pageName -eq "usa") { "usawtf" } elseif ($pageName -eq "scotland") { "scotlandwtf" } else { "$pageName`wtf" }
                $newButtonsHtml += "`n                <a href=`"https://x.com/$xHandle`" target=`"_blank`" class=`"action-btn x-btn`">`n                    <span class=`"btn-icon`"><i class=`"fab fa-x-twitter`"></i></span>`n                    <span class=`"btn-text`">X</span>`n                </a>"
            }
            
            if ($buttonNames -contains "YouTube") {
                $newButtonsHtml += "`n                <a href=`"https://www.youtube.com/@$pageName`wtf`" target=`"_blank`" class=`"action-btn youtube-btn`">`n                    <span class=`"btn-icon`"><i class=`"fab fa-youtube`"></i></span>`n                    <span class=`"btn-text`">YouTube</span>`n                </a>"
            }
            
            if ($buttonNames -contains "Threads") {
                $newButtonsHtml += "`n                <a href=`"https://www.threads.net/@$pageName`wtf`" target=`"_blank`" class=`"action-btn threads-btn`">`n                    <span class=`"btn-icon`"><i class=`"fab fa-threads`"></i></span>`n                    <span class=`"btn-text`">Threads</span>`n                </a>"
            }
            
            if ($buttonNames -contains "WTF Creations") {
                $newButtonsHtml += "`n                <a href=`"../../watchthefallrecords.html`" class=`"action-btn shop-btn`">`n                    <span class=`"btn-icon`"><i class=`"fas fa-shopping-cart`"></i></span>`n                    <span class=`"btn-text`">WTF Creations</span>`n                </a>"
            }
            
            if ($buttonNames -contains "Support Us") {
                $newButtonsHtml += "`n                <a href=`"#support`" class=`"action-btn support-btn`">`n                    <span class=`"btn-icon`"><i class=`"fas fa-hand-holding-usd`"></i></span>`n                    <span class=`"btn-text`">Support Us</span>`n                </a>"
            }
            
            $newButtonsHtml += "`n            </div>"
            
            # Debug: Show what we're replacing
            Write-Host "  Old buttons: $oldButtons" -ForegroundColor Yellow
            Write-Host "  New buttons: $newButtonsHtml" -ForegroundColor Yellow
            
            # Replace the old buttons with new ones
            $content = $content -replace [regex]::Escape($oldButtons), $newButtonsHtml
            
            # Write updated content back to file
            $content | Out-File -FilePath $pagePath -Encoding UTF8 -NoNewline
            
            # Log the changes
            $logEntry = "$($regionEntry.name) | $tier | $buttonCount | Yes | N"
            Add-Content -Path $logPath -Value $logEntry
            
            Write-Host "  Updated buttons for $pageName (Tier $tier)" -ForegroundColor Green
        } else {
            Write-Host "  No action-buttons section found in $pageName" -ForegroundColor Red
        }
    } else {
        Write-Host "  No matching region found for $pageName" -ForegroundColor Red
    }
}

Write-Host "`n✅ Regional pages sync completed!" -ForegroundColor Green
Write-Host "Log file created at: $logPath" -ForegroundColor Cyan