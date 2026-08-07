// =====================================================================
// WatchTheFall v4 - Regional Pages Builder
// Generates regional hub pages from template
// =====================================================================

const fs = require('fs');
const path = require('path');

const regions = [
    {
        slug: 'north-america',
        name: 'North America',
        icon: '🌎',
        description: 'United States, Canada, Mexico'
    },
    {
        slug: 'europe',
        name: 'Europe',
        icon: '🌍',
        description: 'United Kingdom, EU, Eastern Europe'
    },
    {
        slug: 'asia',
        name: 'Asia-Pacific',
        icon: '🌏',
        description: 'Asia, Australia, Oceania'
    },
    {
        slug: 'global',
        name: 'Global South',
        icon: '🌐',
        description: 'South America, Africa, Middle East'
    }
];

function buildRegionalPages() {
    const templatePath = path.join(__dirname, '../regional/templates/regional-template.html');
    const outputDir = path.join(__dirname, '../regional/pages');
    
    // Read template
    const template = fs.readFileSync(templatePath, 'utf8');
    
    // Create output directory if it doesn't exist
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }
    
    // Generate pages for each region
    regions.forEach(region => {
        let pageContent = template
            .replace(/{{REGION_NAME}}/g, region.name)
            .replace(/{{REGION_ICON}}/g, region.icon)
            .replace(/{{REGION_DESCRIPTION}}/g, region.description);
        
        const outputPath = path.join(outputDir, `${region.slug}.html`);
        fs.writeFileSync(outputPath, pageContent, 'utf8');
        
        console.log(`✅ Created: ${region.slug}.html`);
    });
    
    console.log(`\n🎉 Generated ${regions.length} regional pages`);
}

// Run if called directly
if (require.main === module) {
    buildRegionalPages();
}

module.exports = { buildRegionalPages };
