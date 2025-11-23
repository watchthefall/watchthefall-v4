#!/usr/bin/env python3
"""
WatchTheFall Poster Renaming and Index Generator
Renames all posters to WTF_Poster_<REGION>_<NUMBER>.<ext>
Generates data/posters.json index
"""

import os
import re
import json
from pathlib import Path

# Base paths
POSTERS_DIR = Path(__file__).parent.parent.parent / 'assets' / 'posters'
OUTPUT_JSON = Path(__file__).parent.parent.parent / 'data' / 'posters.json'

# Region detection keywords (case-insensitive)
REGION_KEYWORDS = {
    'France': ['france', 'fr', 'sacre', 'paris', 'louvre', 'versailles', 'eiffel', 'notre-dame',
               'montmartre', 'bastille', 'chambord', 'chenonceau', 'moulin', 'arc de triomphe',
               'guillotine', 'fleur-de-lis', 'chute', 'décadence', 'château'],
    'Scotland': ['scotland', 'sco', 'stirling', 'skye', 'gaelic', 'brains'],
    'USA': ['usa', 'washington', 'nyc', 'america', 'us_'],
    'Germany': ['germany', 'berlin', 'ger', 'bavaria', 'neuschwanstein', 'kölner', 'brandenburger'],
    'Australia': ['australia', 'aus'],
    'Britain': ['britain', 'brit'],
    'Europe': ['europe', 'eu_']
}

def detect_region(filename):
    """Detect region from filename using keyword matching"""
    lower_name = filename.lower()
    
    for region, keywords in REGION_KEYWORDS.items():
        for keyword in keywords:
            if keyword in lower_name:
                return region
    
    return 'GLOBAL'

def get_all_poster_files():
    """Get all image files from posters directory"""
    if not POSTERS_DIR.exists():
        print(f"Error: Posters directory not found at {POSTERS_DIR}")
        return []
    
    image_extensions = {'.png', '.jpg', '.jpeg'}
    files = []
    
    for file in POSTERS_DIR.iterdir():
        if file.is_file() and file.suffix.lower() in image_extensions:
            files.append(file)
    
    return sorted(files, key=lambda f: f.name.lower())

def rename_posters():
    """Rename all posters and build index"""
    posters = get_all_poster_files()
    
    if not posters:
        print("No poster files found!")
        return
    
    # Group by region
    regions = {}
    
    for poster_file in posters:
        region = detect_region(poster_file.name)
        if region not in regions:
            regions[region] = []
        regions[region].append(poster_file)
    
    # Rename files and build index
    index = {
        "regions": {region: [] for region in regions.keys()}
    }
    
    rename_map = []
    
    for region, files in regions.items():
        for idx, file in enumerate(files, start=1):
            ext = file.suffix
            new_name = f"WTF_Poster_{region}_{idx:02d}{ext}"
            new_path = POSTERS_DIR / new_name
            
            # Track rename
            rename_map.append({
                'old': file,
                'new': new_path,
                'region': region
            })
            
            # Add to index
            index['regions'][region].append({
                'file': new_name,
                'path': f'assets/posters/{new_name}'
            })
    
    # Execute renames
    print(f"\n🔄 Renaming {len(rename_map)} posters...\n")
    
    for item in rename_map:
        old_file = item['old']
        new_file = item['new']
        
        if old_file.name == new_file.name:
            print(f"✓ {old_file.name} (already correct)")
            continue
        
        try:
            old_file.rename(new_file)
            print(f"✓ {old_file.name} → {new_file.name}")
        except Exception as e:
            print(f"✗ Error renaming {old_file.name}: {e}")
    
    # Write JSON index
    OUTPUT_JSON.parent.mkdir(exist_ok=True)
    with open(OUTPUT_JSON, 'w', encoding='utf-8') as f:
        json.dump(index, f, indent=2, ensure_ascii=False)
    
    print(f"\n✅ Posters renamed and index created at {OUTPUT_JSON}")
    print(f"\n📊 Summary:")
    for region, items in index['regions'].items():
        print(f"   {region}: {len(items)} posters")

if __name__ == '__main__':
    rename_posters()
