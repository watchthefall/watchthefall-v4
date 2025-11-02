# Fix all country subpages - Replace Scotland references with correct country names
$baseDir = "c:\Users\Jamie\OneDrive\Desktop\WatchTheFall_V4"

$countries = @(
    @{name="europe"; display="Europe"; region="EuropeWTF"; desc="Across the continent, witnessing Europe's transformation"},
    @{name="ireland"; display="Ireland"; region="IrelandWTF"; desc="From Dublin to the countryside, tracking Ireland's unraveling"},
    @{name="germany"; display="Germany"; region="GermanyWTF"; desc="From Berlin to Bavaria, monitoring the collapse of German stability"},
    @{name="france"; display="France"; region="FranceWTF"; desc="From Paris to the provinces, observing France's ongoing crisis"},
    @{name="poland"; display="Poland"; region="PolandWTF"; desc="From Warsaw to the borders, tracking Poland's transformation"},
    @{name="wales"; display="Wales"; region="WalesWTF"; desc="From Cardiff to the valleys, witnessing the decay of Wales"},
    @{name="canada"; display="Canada"; region="CanadaWTF"; desc="From Vancouver to Toronto, following Canada's social decay"},
    @{name="sweden"; display="Sweden"; region="SwedenWTF"; desc="From Stockholm to Malmö, observing Sweden's transformation"},
    @{name="spain"; display="Spain"; region="SpainWTF"; desc="From Madrid to Barcelona, documenting Spain's decline"},
    @{name="italy"; display="Italy"; region="ItalyWTF"; desc="From Rome to Milan, recording Italy's decline"},
    @{name="netherlands"; display="Netherlands"; region="NetherlandsWTF"; desc="From Amsterdam to Rotterdam, following the fall of Dutch sanity"}
)

foreach ($country in $countries) {
    $htmlPath = "$baseDir\regional\pages\$($country.name).html"
    
    if (Test-Path $htmlPath) {
        Write-Host "Fixing $($country.display)..." -ForegroundColor Cyan
        
        $content = Get-Content $htmlPath -Raw -Encoding UTF8
        
        # Fix breadcrumb
        $content = $content -replace '<span>Scotland</span>', "<span>$($country.display)</span>"
        
        # Fix hero title and alt text
        $content = $content -replace "alt=`"Scotland`"", "alt=`"$($country.display)`""
        $content = $content -replace ">Scotland</span>", ">$($country.display)</span>"
        
        # Fix description (keep subtitle as is, only change description)
        $content = $content -replace 'From Edinburgh to the Highlands, tracking civilization.s descent through Scottish eyes', $country.desc
        $content = $content -replace 'From Edinburgh to the Highlands, tracking civilizationâ€™s descent through Scottish eyes', $country.desc
        
        # Fix footer tagline - find the incomplete <p> tag
        $pattern = "<p>(St|Cymru|Éire|Deutschland|La|Rzeczpospolita|Cymru|O|Sverige|España|La|Oranje)</p>"
        $replacement = switch ($country.name) {
            "europe" { "<p>Unity in Decline</p>" }
            "ireland" { "<p>Éire - The Emerald Unravels</p>" }
            "germany" { "<p>Deutschland Über Alles No More</p>" }
            "france" { "<p>Liberté, Égalité, Déclin</p>" }
            "poland" { "<p>Rzeczpospolita in Turmoil</p>" }
            "wales" { "<p>Cymru Am Byth</p>" }
            "canada" { "<p>O Canada, We Stand Not On Guard</p>" }
            "sweden" { "<p>Sverige - The Nordic Decline</p>" }
            "spain" { "<p>España - Empire's End</p>" }
            "italy" { "<p>La Bella Decadenza</p>" }
            "netherlands" { "<p>Oranje Boven - Or Below?</p>" }
        }
        $content = $content -replace $pattern, $replacement
        
        # Fix JavaScript region lookup
        $content = $content -replace "c\.region === 'scotlandwtf'", "c.region === '$($country.region)'"
        $content = $content -replace 'const scotlandHub =', "const $($country.name)Hub ="
        $content = $content -replace 'if \(scotlandHub\)', "if ($($country.name)Hub)"
        $content = $content -replace "scotlandHub\.followers", "$($country.name)Hub.followers"
        
        # Fix error console messages
        $content = $content -replace "Failed to load Scotland stats", "Failed to load $($country.display) stats"
        
        # Fix function comment
        $content = $content -replace '// Load Scotland stats', "// Load $($country.display) stats"
        
        # Save with UTF-8 encoding
        $content | Out-File -FilePath $htmlPath -Encoding UTF8 -NoNewline
        
        Write-Host "✓ Fixed $($country.display)" -ForegroundColor Green
    } else {
        Write-Host "✗ Not found: $htmlPath" -ForegroundColor Red
    }
}

Write-Host "`n✅ All country pages fixed!" -ForegroundColor Green
