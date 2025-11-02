# Fix all country color themes and icons
$baseDir = "c:\Users\Jamie\OneDrive\Desktop\WatchTheFall_V4"

# Define correct colors for each country
$countries = @(
    @{name="australia"; color="#00843D"; colorDark="#005E2B"; colorLight="#33A166"; desc="Green and Gold"},
    @{name="usa"; color="#B22234"; colorDark="#8B1A2A"; colorLight="#D94452"; desc="Old Glory Red"},
    @{name="europe"; color="#003399"; colorDark="#002266"; colorLight="#3366CC"; desc="EU Blue"},
    @{name="ireland"; color="#169B62"; colorDark="#0F7A4D"; colorLight="#3DB87A"; desc="Irish Green"},
    @{name="germany"; color="#000000"; colorDark="#000000"; colorLight="#333333"; desc="Black Red Gold"},
    @{name="france"; color="#0055A4"; colorDark="#003D7A"; colorLight="#3377BB"; desc="Tricolore Blue"},
    @{name="poland"; color="#DC143C"; colorDark="#B01030"; colorLight="#E6425C"; desc="Polish Red"},
    @{name="canada"; color="#FF0000"; colorDark="#CC0000"; colorLight="#FF3333"; desc="Maple Leaf Red"},
    @{name="sweden"; color="#006AA7"; colorDark="#004A78"; colorLight="#3388BB"; desc="Swedish Blue"},
    @{name="spain"; color="#AA151B"; colorDark="#880F15"; colorLight="#C73339"; desc="Spanish Red"},
    @{name="italy"; color="#009246"; colorDark="#006B33"; colorLight="#33AA66"; desc="Italian Green"},
    @{name="netherlands"; color="#FF6600"; colorDark="#CC5200"; colorLight="#FF8533"; desc="Oranje"}
)

foreach ($country in $countries) {
    Write-Host "Fixing $($country.name) - $($country.desc)..." -ForegroundColor Cyan
    
    $cssPath = "$baseDir\regional\templates\$($country.name)_colors.css"
    
    if (Test-Path $cssPath) {
        $css = Get-Content $cssPath -Raw -Encoding UTF8
        
        # Replace all blue color references with country-specific colors
        $css = $css -replace '--color-\w+-blue:\s*#[0-9A-Fa-f]{6};', "--color-$($country.name)-primary: $($country.color);"
        $css = $css -replace '--color-\w+-blue-dark:\s*#[0-9A-Fa-f]{6};', "--color-$($country.name)-primary-dark: $($country.colorDark);"
        $css = $css -replace '--color-\w+-blue-light:\s*#[0-9A-Fa-f]{6};', "--color-$($country.name)-primary-light: $($country.colorLight);"
        
        # Fix glow colors
        $glowR = [Convert]::ToInt32($country.color.Substring(1,2), 16)
        $glowG = [Convert]::ToInt32($country.color.Substring(3,2), 16)
        $glowB = [Convert]::ToInt32($country.color.Substring(5,2), 16)
        $glowRgba = "rgba($glowR, $glowG, $glowB, 0.4)"
        
        $css = $css -replace '--color-\w+-glow:\s*rgba\([^)]+\);', "--color-$($country.name)-glow: $glowRgba;"
        
        # Replace color variable references in the CSS
        $css = $css -replace 'var\(--color-\w+-blue-light\)', "var(--color-$($country.name)-primary-light)"
        $css = $css -replace 'var\(--color-\w+-blue-dark\)', "var(--color-$($country.name)-primary-dark)"
        $css = $css -replace 'var\(--color-\w+-blue\)', "var(--color-$($country.name)-primary)"
        
        # Fix rgba color references in gradients and shadows
        $css = $css -replace 'rgba\(0,\s*101,\s*189,', "rgba($glowR, $glowG, $glowB,"
        $css = $css -replace 'rgba\(0,\s*61,\s*130,', "rgba($glowR, $glowG, $glowB,"
        
        $css | Out-File -FilePath $cssPath -Encoding UTF8 -NoNewline
        
        Write-Host "  ✓ Updated CSS colors" -ForegroundColor Green
    }
    
    # Fix HTML emoji encoding issues
    $htmlPath = "$baseDir\regional\pages\$($country.name).html"
    
    if (Test-Path $htmlPath) {
        $html = Get-Content $htmlPath -Raw -Encoding UTF8
        
        # Fix emoji encoding issues
        $html = $html -replace 'ðŸŽµ', '🎵'
        $html = $html -replace 'ðŸ"ˆ', '📈'
        $html = $html -replace 'ðŸ'¥', '👥'
        $html = $html -replace 'ðŸŽ¬', '🎬'
        $html = $html -replace 'ðŸ"·', '📷'
        $html = $html -replace 'ðŸ"±', '📱'
        $html = $html -replace 'ð•', '𝕏'
        $html = $html -replace 'â–¶ï¸', '▶️'
        $html = $html -replace 'ðŸ§µ', '🧵'
        $html = $html -replace 'ðŸ›'', '🛒'
        $html = $html -replace 'ðŸ'°', '💰'
        
        $html | Out-File -FilePath $htmlPath -Encoding UTF8 -NoNewline
        
        Write-Host "  ✓ Fixed emoji encoding" -ForegroundColor Green
    }
}

Write-Host "`n✅ All country colors and emojis fixed!" -ForegroundColor Green
