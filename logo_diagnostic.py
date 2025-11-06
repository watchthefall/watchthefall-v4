import os
import re

# Get all regional HTML files
regional_pages_dir = 'regional/pages'
logo_assets_dir = 'assets/logos'

# Get all logo files
logo_files = os.listdir(logo_assets_dir)
logo_files_set = set(logo_files)

# Results storage
results = []

# Check each regional page
for filename in os.listdir(regional_pages_dir):
    if filename.endswith('.html'):
        filepath = os.path.join(regional_pages_dir, filename)
        
        # Read the file content
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
            
        # Find logo references
        logo_matches = re.findall(r'src="../../assets/logos/([^"]*-wtf-logo\.[^"]*)"', content)
        
        for logo in logo_matches:
            if logo in logo_files_set:
                results.append(f"{filename} -> {logo} [MATCH FOUND]")
            else:
                # Check for extension mismatches
                base_name = logo.rsplit('.', 1)[0]
                found_alternate = False
                for existing_logo in logo_files_set:
                    if existing_logo.startswith(base_name + '.'):
                        results.append(f"{filename} -> {logo} [EXTENSION MISMATCH] ({existing_logo})")
                        found_alternate = True
                        break
                if not found_alternate:
                    results.append(f"{filename} -> {logo} [MISSING]")

# Create logs directory if it doesn't exist
if not os.path.exists('logs'):
    os.makedirs('logs')

# Write results to file
with open('logs/logo_diagnostic_report.txt', 'w', encoding='utf-8') as f:
    for result in results:
        f.write(result + '\n')

print("Logo diagnostic report generated successfully!")

# =====================================================================
# Additional Diagnostics: Hero Parity & Cache Coverage
# =====================================================================

def check_hero_parity():
    hero_results = []
    required_fragments = [
        '<span class="region-logo-block">',
        'class="region-flag-logo"',
        '<span class="region-name">',
        '<span class="wtf-text">WatchTheFall</span>'
    ]
    for filename in os.listdir(regional_pages_dir):
        if filename.endswith('.html'):
            filepath = os.path.join(regional_pages_dir, filename)
            with open(filepath, 'r', encoding='utf-8') as f:
                content = f.read()
            missing = [frag for frag in required_fragments if frag not in content]
            if not missing:
                hero_results.append(f"{filename} [HERO OK]")
            else:
                hero_results.append(f"{filename} [HERO MISMATCH] Missing: {', '.join(missing)}")
    return hero_results

def check_cache_coverage():
    cache_results = []
    sw_path = 'sw.js'
    try:
        with open(sw_path, 'r', encoding='utf-8') as f:
            sw = f.read()
        # Extract ASSETS_TO_CACHE entries
        assets = re.findall(r"ASSETS_TO_CACHE\s*=\s*\[(.*?)\]", sw, re.S)
        entries = []
        if assets:
            entries = re.findall(r"['\"](\/[^'\"]+)['\"]", assets[0])
        # Build expected regional pages list
        expected_pages = [f"/regional/pages/{name}" for name in os.listdir(regional_pages_dir) if name.endswith('.html')]
        # Check coverage for pages
        for page in expected_pages:
            if page in entries:
                cache_results.append(f"{page} [CACHED]")
            else:
                cache_results.append(f"{page} [NOT IN STATIC CACHE]")
        # Check logos (png only as per standard)
        expected_logos = [f"/assets/logos/{name}" for name in os.listdir(logo_assets_dir) if name.endswith('.png')]
        for logo in expected_logos:
            if logo in entries:
                cache_results.append(f"{logo} [CACHED]")
            else:
                cache_results.append(f"{logo} [NOT IN STATIC CACHE]")
    except Exception as e:
        cache_results.append(f"[CACHE CHECK ERROR] {e}")
    return cache_results

# Append extra sections
with open('logs/logo_diagnostic_report.txt', 'a', encoding='utf-8') as f:
    f.write("\n=== HERO PARITY ===\n")
    for line in check_hero_parity():
        f.write(line + '\n')
    f.write("\n=== CACHE COVERAGE ===\n")
    for line in check_cache_coverage():
        f.write(line + '\n')

print("Extended diagnostics complete: hero parity & cache coverage added.")