# WatchTheFall v4 - Country Subpage Mass Generator
# Generates HTML pages and CSS color schemes for all countries with anthems
# Based on Scotland template with performance optimizations

Write-Host "=================================" -ForegroundColor Cyan
Write-Host "WatchTheFall v4 Country Generator" -ForegroundColor Cyan
Write-Host "=================================" -ForegroundColor Cyan
Write-Host ""

$baseDir = "c:\Users\Jamie\OneDrive\Desktop\WatchTheFall_V4"
$templateHTML = Get-Content "$baseDir\regional\pages\scotland.html" -Raw
$templateCSS = Get-Content "$baseDir\regional\templates\scotland_colors.css" -Raw

$countries = @(
    @{name="england"; display="England"; tagline="St George - Witnessing England's descent"; desc="From city streets to countryside, documenting the decline of the English nation"; color1="#C8102E"; color2="#FFFFFF"; region="EnglandWTF"; growth=800; content=20},
    @{name="wales"; display="Wales"; tagline="Cymru Am Byth - Witnessing the decay of Wales"; desc="From Cardiff to the valleys, tracking the fall of the Welsh nation"; color1="#00B140"; color2="#C8102E"; region="WalesWTF"; growth=600; content=18},
    @{name="ireland"; display="Ireland"; tagline="Eire Go Brach - Tracking Ireland's unraveling"; desc="From Dublin to Galway, documenting the Irish descent into chaos"; color1="#169B62"; color2="#FF883E"; region="IrelandWTF"; growth=900; content=22},
    @{name="france"; display="France"; tagline="Liberte, Egalite, Fragilite - Observing France's ongoing crisis"; desc="From Paris to the provinces, tracking the fall of the French Republic"; color1="#0055A4"; color2="#EF4135"; region="FranceWTF"; growth=750; content=21},
    @{name="germany"; display="Germany"; tagline="Einigkeit und Recht und Freiheit - Monitoring the collapse of German stability"; desc="From Berlin to Bavaria, documenting the decline of Deutschland"; color1="#DD0000"; color2="#FFCE00"; region="GermanyWTF"; growth=850; content=23},
    @{name="spain"; display="Spain"; tagline="Viva Espana - Documenting Spain's decline"; desc="From Madrid to Barcelona, tracking the fall of the Spanish Kingdom"; color1="#AA151B"; color2="#F1BF00"; region="SpainWTF"; growth=700; content=19},
    @{name="italy"; display="Italy"; tagline="L'Italia - Recording Italy's decline"; desc="From Rome to Milan, documenting the fall of the Italian Republic"; color1="#009246"; color2="#CE2B37"; region="ItalyWTF"; growth=680; content=20},
    @{name="netherlands"; display="Netherlands"; tagline="Nederland - Following the fall of Dutch sanity"; desc="From Amsterdam to Rotterdam, tracking the descent of the Netherlands"; color1="#FF6C00"; color2="#21468B"; region="NetherlandsWTF"; growth=650; content=19},
    @{name="poland"; display="Poland"; tagline="Polska - Tracking Poland's transformation"; desc="From Warsaw to Krakow, documenting the Polish decline"; color1="#DC143C"; color2="#FFFFFF"; region="PolandWTF"; growth=620; content=18},
    @{name="sweden"; display="Sweden"; tagline="Sverige - Observing Sweden's transformation"; desc="From Stockholm to Gothenburg, tracking the fall of Swedish stability"; color1="#006AA7"; color2="#FECC00"; region="SwedenWTF"; growth=640; content=19},
    @{name="usa"; display="USA"; tagline="United We Fall - Tracking America's decline"; desc="From coast to coast, documenting the fall of the American empire"; color1="#B22234"; color2="#3C3B6E"; region="USAmericaWTF"; growth=1100; content=27},
    @{name="australia"; display="Australia"; tagline="Down Under, Going Down - Watching Australia's unraveling"; desc="From Sydney to Perth, tracking civilization's descent across the Southern Cross"; color1="#012169"; color2="#FFFFFF"; region="AustraliaWTF"; growth=1050; content=26},
    @{name="canada"; display="Canada"; tagline="True North Strong and Free (For Now) - Following Canada's social decay"; desc="From Vancouver to Montreal, documenting the Great White North's decline"; color1="#FF0000"; color2="#FFFFFF"; region="CanadaWTF"; growth=700; content=21},
    @{name="europe"; display="Europe"; tagline="In Varietate Concordia - Tracking the fall across Europe"; desc="Across the continent, documenting the European project's unraveling"; color1="#003399"; color2="#FFCC00"; region="EuropeWTF"; growth=950; content=24}
)

$created = 0

foreach ($country in $countries) {
    Write-Host "Creating $($country.display) subpage..." -ForegroundColor Yellow
    
    # Generate HTML
    $html = $templateHTML
    $html = $html -replace 'Scotland WTF', "$($country.display) WTF"
    $html = $html -replace 'scotland\.wtf', "$($country.name).wtf"
    $html = $html -replace '@scotland\.wtf', "@$($country.name).wtf"
    $html = $html -replace 'scotlandwtf', "$($country.name)wtf"
    $html = $html -replace 'scotland-wtf-logo\.png', "$($country.name)-wtf-logo.png"
    $html = $html -replace 'scotland_colors\.css', "$($country.name)_colors.css"
    $html = $html -replace 'page-scotland', "page-$($country.name)"
    $html = $html -replace 'scotland-overlay', "$($country.name)-overlay"
    $html = $html -replace 'scotland-hero', "$($country.name)-hero"
    $html = $html -replace 'scotland-title', "$($country.name)-title"
    $html = $html -replace 'scotland-text', "$($country.name)-text"
    $html = $html -replace 'scotland-flag-logo', "$($country.name)-flag-logo"
    $html = $html -replace 'scotland-stats', "$($country.name)-stats"
    $html = $html -replace 'Scotland Anthem', "$($country.display) Anthem"
    $html = $html -replace 'Scotland WTF Anthem\.m4a', "$($country.display) WTF Anthem.mp3"
    $html = $html -replace 'Scotland WTF Anthem\.mp3', "$($country.display) WTF Anthem.mp3"
    $html = $html -replace 'scotland-anthem', "$($country.name)-anthem"
    $html = $html -replace 'Alba Gu Bràth — Documenting the fall in Scotland', $country.tagline
    $html = $html -replace 'From Edinburgh to the Highlands, tracking civilization''s descent through Scottish eyes', $country.desc
    $html = $html -replace 'Documenting the fall in Alba', "Documenting the fall of $($country.display)"
    $html = $html -replace 'Scotland Network', "$($country.display) Network"
    $html = $html -replace 'Scotland Regional Hub', "$($country.display) Regional Hub"
    $html = $html -replace 'Alba Gu Bràth', $country.tagline.Split(' - ')[0]
    $html = $html -replace 'loadScotlandStats', "load$($country.display)Stats"
    $html = $html -replace 'ScotlandWTF', $country.region
    $html = $html -replace '\+2\.4K', "+$([math]::Round($country.growth/1000, 1))K"
    $html = $html -replace '2400', $country.growth
    $html = $html -replace '30\+', "$($country.content)+"
    $html = $html -replace 'baseContent = 30', "baseContent = $($country.content)"
    $html = $html -replace '17\.7K', '0'
    $html = $html -replace 'bg_video_scotland\.mp4', 'main_bg.mp4'
    
    $htmlPath = "$baseDir\regional\pages\$($country.name).html"
    $html | Out-File -FilePath $htmlPath -Encoding UTF8
    
    # Generate CSS
    $css = $templateCSS
    $css = $css -replace 'SCOTLAND WTF', "$($country.display.ToUpper()) WTF"
    $css = $css -replace 'Scottish Blue', "$($country.display) Colors"
    $css = $css -replace 'scotland', $country.name
    $css = $css -replace '--color-scotland-blue: #4D9DE0', "--color-$($country.name)-primary: $($country.color1)"
    $css = $css -replace '--color-scotland-blue-light: #6FB1FF', "--color-$($country.name)-primary-light: $($country.color1)"
    $css = $css -replace '--color-scotland-glow: rgba\(77, 157, 224, 0\.5\)', "--color-$($country.name)-glow: rgba$(([System.Drawing.ColorTranslator]::FromHtml($country.color1).R)), $(([System.Drawing.ColorTranslator]::FromHtml($country.color1).G)), $(([System.Drawing.ColorTranslator]::FromHtml($country.color1).B)), 0.5)"
    $css = $css -replace 'var\(--color-scotland-blue-light\)', "var(--color-$($country.name)-primary-light)"
    $css = $css -replace 'var\(--color-scotland-blue\)', "var(--color-$($country.name)-primary)"
    $css = $css -replace 'var\(--color-scotland-glow\)', "var(--color-$($country.name)-glow)"
    $css = $css -replace 'rgba\(77, 157, 224', "rgba$(([System.Drawing.ColorTranslator]::FromHtml($country.color1).R)), $(([System.Drawing.ColorTranslator]::FromHtml($country.color1).G)), $(([System.Drawing.ColorTranslator]::FromHtml($country.color1).B))"
    
    $cssPath = "$baseDir\regional\templates\$($country.name)_colors.css"
    $css | Out-File -FilePath $cssPath -Encoding UTF8
    
    $created++
    Write-Host "  Created: $htmlPath" -ForegroundColor Green
    Write-Host "  Created: $cssPath" -ForegroundColor Green
}

Write-Host ""
Write-Host "=================================" -ForegroundColor Cyan
Write-Host "COMPLETE!" -ForegroundColor Green
Write-Host "$created countries generated successfully" -ForegroundColor Green
Write-Host "=================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Review the generated files"
Write-Host "2. Run: git add -A"
Write-Host "3. Run: git commit -m '🌍 Mass Country Subpage Deployment - 14 Countries'"
Write-Host "4. Run: git push origin main"
Write-Host ""
