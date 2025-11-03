# Unified Regional Sync Script - v4.3
# Performs a unified regional consistency and scaling sync for all /regional/pages/*.html

# Load leaderboard data
$leaderboardPath = "c:\Users\Jamie\OneDrive\Desktop\WatchTheFall_V4\data\leaderboard.json"
$leaderboard = Get-Content $leaderboardPath -Raw | ConvertFrom-Json

# Create log file
$logPath = "c:\Users\Jamie\OneDrive\Desktop\WatchTheFall_V4\logs\qoder_v4.3_sync_log.txt"
Set-Content -Path $logPath -Value "# Unified Regional Sync Log - v4.3`n# Generated on: $(Get-Date)`n"

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
        return 1  # Tier 1
    } elseif ($rank -ge 6 -and $rank -le 10) {
        return 2  # Tier 2
    } elseif ($rank -ge 11 -and $rank -le 25) {
        return 3  # Tier 3
    }
    return 1  # Default to Tier 1
}

# Function to get content counts based on tier
function Get-ContentCountsFromTier($tier) {
    switch ($tier) {
        1 { 
            return @{
                TikTok = 13
                Instagram = 13
                Ads = 2
            }
        }
        2 { 
            return @{
                TikTok = 8
                Instagram = 8
                Ads = 1
            }
        }
        3 { 
            return @{
                TikTok = 5
                Instagram = 5
                Ads = 1
            }
        }
        default { 
            return @{
                TikTok = 13
                Instagram = 13
                Ads = 2
            }
        }
    }
}

# Function to generate standard Connect & Support buttons (7 buttons for all regions)
function Generate-ConnectSupportButtons($pageName) {
    $newButtonsHtml = ""
    
    # Instagram
    $newButtonsHtml += "                <a href=`"https://www.instagram.com/$pageName.wtf`" target=`"_blank`" class=`"action-btn instagram-btn`">`n"
    $newButtonsHtml += "                    <span class=`"btn-icon`"><i class=`"fab fa-instagram`"></i></span>`n"
    $newButtonsHtml += "                    <span class=`"btn-text`">Instagram</span>`n"
    $newButtonsHtml += "                </a>`n"
    
    # TikTok
    $newButtonsHtml += "                <a href=`"https://www.tiktok.com/@$pageName.wtf`" target=`"_blank`" class=`"action-btn tiktok-btn`">`n"
    $newButtonsHtml += "                    <span class=`"btn-icon`"><i class=`"fab fa-tiktok`"></i></span>`n"
    $newButtonsHtml += "                    <span class=`"btn-text`">TikTok</span>`n"
    $newButtonsHtml += "                </a>`n"
    
    # X
    $xHandle = if ($pageName -eq "usa") { "usawtf" } elseif ($pageName -eq "scotland") { "scotlandwtf" } else { "$pageName`wtf" }
    $newButtonsHtml += "                <a href=`"https://x.com/$xHandle`" target=`"_blank`" class=`"action-btn x-btn`">`n"
    $newButtonsHtml += "                    <span class=`"btn-icon`"><i class=`"fab fa-x-twitter`"></i></span>`n"
    $newButtonsHtml += "                    <span class=`"btn-text`">X</span>`n"
    $newButtonsHtml += "                </a>`n"
    
    # YouTube
    $newButtonsHtml += "                <a href=`"https://www.youtube.com/@$pageName`wtf`" target=`"_blank`" class=`"action-btn youtube-btn`">`n"
    $newButtonsHtml += "                    <span class=`"btn-icon`"><i class=`"fab fa-youtube`"></i></span>`n"
    $newButtonsHtml += "                    <span class=`"btn-text`">YouTube</span>`n"
    $newButtonsHtml += "                </a>`n"
    
    # Threads
    $newButtonsHtml += "                <a href=`"https://www.threads.net/@$pageName`wtf`" target=`"_blank`" class=`"action-btn threads-btn`">`n"
    $newButtonsHtml += "                    <span class=`"btn-icon`"><i class=`"fab fa-threads`"></i></span>`n"
    $newButtonsHtml += "                    <span class=`"btn-text`">Threads</span>`n"
    $newButtonsHtml += "                </a>`n"
    
    # WTF Creations
    $newButtonsHtml += "                <a href=`"../../watchthefallrecords.html`" class=`"action-btn shop-btn`">`n"
    $newButtonsHtml += "                    <span class=`"btn-icon`"><i class=`"fas fa-shopping-cart`"></i></span>`n"
    $newButtonsHtml += "                    <span class=`"btn-text`">WTF Creations</span>`n"
    $newButtonsHtml += "                </a>`n"
    
    # Support Us
    $newButtonsHtml += "                <a href=`"#support`" class=`"action-btn support-btn`">`n"
    $newButtonsHtml += "                    <span class=`"btn-icon`"><i class=`"fas fa-hand-holding-usd`"></i></span>`n"
    $newButtonsHtml += "                    <span class=`"btn-text`">Support Us</span>`n"
    $newButtonsHtml += "                </a>`n"
    
    return $newButtonsHtml
}

# Function to fix hero section structure
function Fix-HeroSection($content, $pageName, $regionName) {
    # Fix hero title structure to match Scotland standard
    $pattern = [regex]::new('(<h1 class="page-title[^>]*>)(.*?)(</h1>)', [System.Text.RegularExpressions.RegexOptions]::Singleline)
    $match = $pattern.Match($content)
    
    if ($match.Success) {
        $oldTitle = $match.Groups[0].Value
        $newTitle = "<h1 class=`"page-title $pageName-title`">`n                <span class=`"region-logo-block`">`n                    <img src=`"../../assets/logos/$pageName-wtf-logo.png`" alt=`"$regionName`" class=`"region-flag-logo`" loading=`"eager`" />`n                    <span class=`"region-name`">$regionName</span>`n                </span>`n                <span class=`"wtf-text`">WatchTheFall</span>`n            </h1>"
        
        $content = $content -replace [regex]::Escape($oldTitle), $newTitle
    }
    
    # Fix meta description pattern
    $pattern = [regex]::new('(<p class="page-description">)(.*?)(</p>)', [System.Text.RegularExpressions.RegexOptions]::Singleline)
    $match = $pattern.Match($content)
    
    if ($match.Success) {
        $oldDesc = $match.Groups[0].Value
        $newDesc = "<p class=`"page-description`">Recording $regionName's decline</p>"
        $content = $content -replace [regex]::Escape($oldDesc), $newDesc
    }
    
    return $content
}

# Function to fix footer structure
function Fix-FooterSection($content, $pageName, $regionName) {
    # Fix footer brand image and text
    $pattern = [regex]::new('(<div class="footer-brand">.*?</div>)', [System.Text.RegularExpressions.RegexOptions]::Singleline)
    $match = $pattern.Match($content)
    
    if ($match.Success) {
        $oldFooterBrand = $match.Groups[1].Value
        $newFooterBrand = "<div class=`"footer-brand`">`n                    <img src=`"../../assets/logos/$pageName-wtf-logo.png`" alt=`"$regionName WTF`" loading=`"lazy`">`n                    <p>Recording $regionName's decline</p>`n                </div>"
        
        $content = $content -replace [regex]::Escape($oldFooterBrand), $newFooterBrand
    }
    
    return $content
}

# Process each regional page
$regionalPagesPath = "c:\Users\Jamie\OneDrive\Desktop\WatchTheFall_V4\regional\pages"
$pageFiles = Get-ChildItem -Path $regionalPagesPath -Filter "*.html"

foreach ($pageFile in $pageFiles) {
    $pageName = $pageFile.BaseName.ToLower()
    $pagePath = $pageFile.FullName
    
    # Skip specified pages
    if (@("ai", "aitech", "gadgets", "darkhumour", "comedy", "concepts") -contains $pageName) {
        Write-Host "Skipping $pageName..." -ForegroundColor Yellow
        continue
    }
    
    Write-Host "Processing $pageName..." -ForegroundColor Yellow
    
    # Create backup
    $timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
    $backupFileName = "regional_pre_v4.3_${pageName}_${timestamp}.html"
    $backupPath = "c:\Users\Jamie\OneDrive\Desktop\WatchTheFall_V4\backups\$backupFileName"
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
        $contentCounts = Get-ContentCountsFromTier $tier
        $regionName = $regionEntry.name -replace "WTF$", ""
        
        Write-Host "  Region: $($regionEntry.name), Rank: $rank, Tier: $tier" -ForegroundColor Cyan
        
        # Read page content
        $content = Get-Content $pagePath -Raw -Encoding UTF8
        
        # Fix hero section
        $content = Fix-HeroSection $content $pageName $regionName
        
        # Fix footer section
        $content = Fix-FooterSection $content $pageName $regionName
        
        # Fix Connect & Support section (7 buttons for all regions)
        $pattern = [regex]::new('(<section class="section social-actions-section">.*?</section>)', [System.Text.RegularExpressions.RegexOptions]::Singleline)
        $match = $pattern.Match($content)
        
        if ($match.Success) {
            $oldSection = $match.Groups[1].Value
            Write-Host "  Found social-actions-section" -ForegroundColor Green
            
            # Extract the content inside the action-buttons div
            $buttonsPattern = [regex]::new('(<div class="action-buttons">)(.*?)(</div>)', [System.Text.RegularExpressions.RegexOptions]::Singleline)
            $buttonsMatch = $buttonsPattern.Match($oldSection)
            
            if ($buttonsMatch.Success) {
                $oldButtons = $buttonsMatch.Groups[0].Value
                
                # Generate new buttons (7 buttons for all regions)
                $newButtonsHtml = "<div class=`"action-buttons`">`n" + (Generate-ConnectSupportButtons $pageName) + "            </div>"
                
                # Replace the old buttons with new ones
                $updatedSection = $oldSection -replace [regex]::Escape($oldButtons), $newButtonsHtml
                
                # Replace the entire section
                $content = $content -replace [regex]::Escape($oldSection), $updatedSection
                
                Write-Host "  Updated Connect & Support section with 7 buttons" -ForegroundColor Green
            } else {
                Write-Host "  No action-buttons div found in social-actions-section for $pageName" -ForegroundColor Red
            }
        } else {
            Write-Host "  No social-actions-section found in $pageName" -ForegroundColor Red
        }
        
        # Fix logo references (.jpeg/.jpg → .png)
        $content = $content -replace '(\.jpe?g)', '.png'
        
        # Write updated content back to file
        $content | Out-File -FilePath $pagePath -Encoding UTF8 -NoNewline
        
        # Log the changes
        $logEntry = "[$($regionEntry.name)] Tier=$tier, TikTok=$($contentCounts.TikTok), Instagram=$($contentCounts.Instagram), Ads=$($contentCounts.Ads), PNGsFixed=Y, LayoutFixed=Y, Backup=$backupFileName"
        Add-Content -Path $logPath -Value $logEntry
        
        Write-Host "  Updated $pageName (Tier $tier)" -ForegroundColor Green
    } else {
        Write-Host "  No matching region found for $pageName" -ForegroundColor Red
        # Log the error
        $logEntry = "[$pageName] Tier=N/A, TikTok=0, Instagram=0, Ads=0, PNGsFixed=N, LayoutFixed=N, Backup=$backupFileName (ERROR: No matching region found)"
        Add-Content -Path $logPath -Value $logEntry
    }
}

Write-Host "`n✅ Unified regional sync completed!" -ForegroundColor Green
Write-Host "Log file updated at: $logPath" -ForegroundColor Cyan
Write-Host "Backups created in: c:\Users\Jamie\OneDrive\Desktop\WatchTheFall_V4\backups" -ForegroundColor Cyan