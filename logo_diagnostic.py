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