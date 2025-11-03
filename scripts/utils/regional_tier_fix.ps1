# Regional Tier Fix Script - v4.1
# Focuses ONLY on the <section class="social-actions-section"> block

# Load leaderboard data
$leaderboardPath = "c:\Users\Jamie\OneDrive\Desktop\WatchTheFall_V4\data\leaderboard.json"
$leaderboard = Get-Content $leaderboardPath -Raw | ConvertFrom-Json

# Create log file
$logPath = "c:\Users\Jamie\OneDrive\Desktop\WatchTheFall_V4\logs\qoder_regional_update_log.txt"

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
    } elseif ($rank -ge 11 -and $rank -le 25) {
        return 3  # Tier 3: 3 buttons
    }
    return 1  # Default to Tier 1
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

# Function to generate button HTML based on tier and page name
function Generate-ButtonHtml($tier, $pageName) {
    $buttonNames = Get-ButtonNamesFromTier $tier
    $newButtonsHtml = ""
    
    # Add buttons based on tier
    if ($buttonNames -contains "Instagram") {
        $newButtonsHtml += "                <a href=`"https://www.instagram.com/$pageName.wtf`" target=`"_blank`" class=`"action-btn instagram-btn`">`n"
        $newButtonsHtml += "                    <span class=`"btn-icon`"><i class=`"fab fa-instagram`"></i></span>`n"
        $newButtonsHtml += "                    <span class=`"btn-text`">Instagram</span>`n"
        $newButtonsHtml += "                </a>`n"
    }
    
    if ($buttonNames -contains "TikTok") {
        $newButtonsHtml += "                <a href=`"https://www.tiktok.com/@$pageName.wtf`" target=`"_blank`" class=`"action-btn tiktok-btn`">`n"
        $newButtonsHtml += "                    <span class=`"btn-icon`"><i class=`"fab fa-tiktok`"></i></span>`n"
        $newButtonsHtml += "                    <span class=`"btn-text`">TikTok</span>`n"
        $newButtonsHtml += "                </a>`n"
    }
    
    if ($buttonNames -contains "X") {
        $xHandle = if ($pageName -eq "usa") { "usawtf" } elseif ($pageName -eq "scotland") { "scotlandwtf" } else { "$pageName`wtf" }
        $newButtonsHtml += "                <a href=`"https://x.com/$xHandle`" target=`"_blank`" class=`"action-btn x-btn`">`n"
        $newButtonsHtml += "                    <span class=`"btn-icon`"><i class=`"fab fa-x-twitter`"></i></span>`n"
        $newButtonsHtml += "                    <span class=`"btn-text`">X</span>`n"
        $newButtonsHtml += "                </a>`n"
    }
    
    if ($buttonNames -contains "YouTube") {
        $newButtonsHtml += "                <a href=`"https://www.youtube.com/@$pageName`wtf`" target=`"_blank`" class=`"action-btn youtube-btn`">`n"
        $newButtonsHtml += "                    <span class=`"btn-icon`"><i class=`"fab fa-youtube`"></i></span>`n"
        $newButtonsHtml += "                    <span class=`"btn-text`">YouTube</span>`n"
        $newButtonsHtml += "                </a>`n"
    }
    
    if ($buttonNames -contains "Threads") {
        $newButtonsHtml += "                <a href=`"https://www.threads.net/@$pageName`wtf`" target=`"_blank`" class=`"action-btn threads-btn`">`n"
        $newButtonsHtml += "                    <span class=`"btn-icon`"><i class=`"fab fa-threads`"></i></span>`n"
        $newButtonsHtml += "                    <span class=`"btn-text`">Threads</span>`n"
        $newButtonsHtml += "                </a>`n"
    }
    
    if ($buttonNames -contains "WTF Creations") {
        $newButtonsHtml += "                <a href=`"../../watchthefallrecords.html`" class=`"action-btn shop-btn`">`n"
        $newButtonsHtml += "                    <span class=`"btn-icon`"><i class=`"fas fa-shopping-cart`"></i></span>`n"
        $newButtonsHtml += "                    <span class=`"btn-text`">WTF Creations</span>`n"
        $newButtonsHtml += "                </a>`n"
    }
    
    if ($buttonNames -contains "Support Us") {
        $newButtonsHtml += "                <a href=`"#support`" class=`"action-btn support-btn`">`n"
        $newButtonsHtml += "                    <span class=`"btn-icon`"><i class=`"fas fa-hand-holding-usd`"></i></span>`n"
        $newButtonsHtml += "                    <span class=`"btn-text`">Support Us</span>`n"
        $newButtonsHtml += "                </a>`n"
    }
    
    return $newButtonsHtml
}

# Process each regional page
$regionalPagesPath = "c:\Users\Jamie\OneDrive\Desktop\WatchTheFall_V4\regional\pages"
$pageFiles = Get-ChildItem -Path $regionalPagesPath -Filter "*.html"

foreach ($pageFile in $pageFiles) {
    $pageName = $pageFile.BaseName.ToLower()
    $pagePath = $pageFile.FullName
    
    # Skip specified pages
    if (@("ai", "gadgets", "aitech", "darkhumour", "comedy", "concepts") -contains $pageName) {
        Write-Host "Skipping $pageName..." -ForegroundColor Yellow
        continue
    }
    
    Write-Host "Processing $pageName..." -ForegroundColor Yellow
    
    # Create backup
    $timestamp = Get-Date -Format "yyyyMMdd_HHmm"
    $backupFileName = "${pageName}_pre_v4.1_${timestamp}.html"
    $backupPath = "c:\Users\Jamie\OneDrive\Desktop\WatchTheFall_V4\backups\qoder_autosave\$backupFileName"
    Copy-Item $pagePath $backupPath
    
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
    
    if ($regionEntry -and $regionId) {
        $rank = $regionRanks[$regionId]
        $tier = Get-TierFromRank $rank
        $buttonNames = Get-ButtonNamesFromTier $tier
        $buttonCount = $buttonNames.Count
        
        Write-Host "  Region: $($regionEntry.name), Rank: $rank, Tier: $tier, Buttons: $buttonCount" -ForegroundColor Cyan
        
        # Read page content
        $content = Get-Content $pagePath -Raw -Encoding UTF8
        
        # Find the social-actions-section using multi-line regex
        $pattern = [regex]::new('(<section class="section social-actions-section">.*?</section>)', [System.Text.RegularExpressions.RegexOptions]::Singleline)
        $match = $pattern.Match($content)
        
        if ($match.Success) {
            $oldSection = $match.Groups[1].Value
            Write-Host "  Found social-actions-section" -ForegroundColor Green
            
            # Extract the content inside the action-buttons div
            $buttonsPattern = [regex]::new('(<div class="action-buttons">.*?</div>)', [System.Text.RegularExpressions.RegexOptions]::Singleline)
            $buttonsMatch = $buttonsPattern.Match($oldSection)
            
            if ($buttonsMatch.Success) {
                $oldButtons = $buttonsMatch.Groups[1].Value
                
                # Generate new buttons based on tier
                $newButtonsHtml = "<div class=`"action-buttons`">`n" + (Generate-ButtonHtml $tier $pageName) + "            </div>"
                
                # Replace the old buttons with new ones
                $updatedSection = $oldSection -replace [regex]::Escape($oldButtons), $newButtonsHtml
                
                # Replace the entire section
                $content = $content -replace [regex]::Escape($oldSection), $updatedSection
                
                # Write updated content back to file
                $content | Out-File -FilePath $pagePath -Encoding UTF8 -NoNewline
                
                # Log the changes
                $logEntry = "[$($regionEntry.name)] Tier: $tier, Buttons Added: $buttonCount, Verified: Y, Backup: $backupFileName"
                Add-Content -Path $logPath -Value $logEntry
                
                Write-Host "  Updated buttons for $pageName (Tier $tier)" -ForegroundColor Green
            } else {
                Write-Host "  No action-buttons div found in social-actions-section for $pageName" -ForegroundColor Red
                # Log the error
                $logEntry = "[$($regionEntry.name)] Tier: $tier, Buttons Added: 0, Verified: N, Backup: $backupFileName (ERROR: No action-buttons div found)"
                Add-Content -Path $logPath -Value $logEntry
            }
        } else {
            Write-Host "  No social-actions-section found in $pageName" -ForegroundColor Red
            # Log the error
            $logEntry = "[$($regionEntry.name)] Tier: $tier, Buttons Added: 0, Verified: N, Backup: $backupFileName (ERROR: No social-actions-section found)"
            Add-Content -Path $logPath -Value $logEntry
        }
    } else {
        Write-Host "  No matching region found for $pageName" -ForegroundColor Red
        # Log the error
        $logEntry = "[$pageName] Tier: N/A, Buttons Added: 0, Verified: N, Backup: $backupFileName (ERROR: No matching region found)"
        Add-Content -Path $logPath -Value $logEntry
    }
}

Write-Host "`n✅ Regional tier fix completed!" -ForegroundColor Green
Write-Host "Log file updated at: $logPath" -ForegroundColor Cyan
Write-Host "Backups created in: c:\Users\Jamie\OneDrive\Desktop\WatchTheFall_V4\backups\qoder_autosave" -ForegroundColor Cyan