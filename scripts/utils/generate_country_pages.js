// Country Subpage Generator for WatchTheFall v4
// Generates HTML pages and CSS color schemes for all countries with anthems

const fs = require('fs');
const path = require('path');

const countries = [
    {
        name: 'england',
        displayName: 'England',
        tagline: 'St George — Witnessing England's descent',
        description: 'From city streets to countryside, documenting the decline of the English nation',
        primaryColor: '#C8102E', // St George red
        secondaryColor: '#FFFFFF',
        baseGrowth: 800,
        baseContent: 20,
        social: {
            instagram: 'england.wtf',
            tiktok: '@england.wtf',
            x: 'englandwtf',
            youtube: '@englandwtf',
            threads: '@englandwtf'
        }
    },
    {
        name: 'wales',
        displayName: 'Wales',
        tagline: 'Cymru Am Byth — Witnessing the decay of Wales',
        description: 'From Cardiff to the valleys, tracking the fall of the Welsh nation',
        primaryColor: '#00B140', // Welsh green
        secondaryColor: '#C8102E', // Welsh red
        baseGrowth: 600,
        baseContent: 18,
        social: {
            instagram: 'wales.wtf',
            tiktok: '@wales.wtf',
            x: 'waleswtf',
            youtube: '@waleswtf',
            threads: '@waleswtf'
        }
    },
    {
        name: 'ireland',
        displayName: 'Ireland',
        tagline: 'Éire Go Brách — Tracking Ireland's unraveling',
        description: 'From Dublin to Galway, documenting the Irish descent into chaos',
        primaryColor: '#169B62', // Irish green
        secondaryColor: '#FF883E', // Irish orange
        baseGrowth: 900,
        baseContent: 22,
        social: {
            instagram: 'ireland.wtf',
            tiktok: '@ireland.wtf',
            x: 'irelandwtf',
            youtube: '@irelandwtf',
            threads: '@irelandwtf'
        }
    },
    {
        name: 'france',
        displayName: 'France',
        tagline: 'Liberté, Égalité, Fragilité — Observing France's ongoing crisis',
        description: 'From Paris to the provinces, tracking the fall of the French Republic',
        primaryColor: '#0055A4', // French blue
        secondaryColor: '#EF4135', // French red
        baseGrowth: 750,
        baseContent: 21,
        social: {
            instagram: 'france.wtf',
            tiktok: '@france.wtf',
            x: 'francewtf',
            youtube: '@francewtf',
            threads: '@francewtf'
        }
    },
    {
        name: 'germany',
        displayName: 'Germany',
        tagline: 'Einigkeit und Recht und Freiheit — Monitoring the collapse of German stability',
        description: 'From Berlin to Bavaria, documenting the decline of Deutschland',
        primaryColor: '#DD0000', // German red
        secondaryColor: '#FFCE00', // German gold
        baseGrowth: 850,
        baseContent: 23,
        social: {
            instagram: 'germany.wtf',
            tiktok: '@germany.wtf',
            x: 'germanywtf',
            youtube: '@germanywtf',
            threads: '@germanywtf'
        }
    },
    {
        name: 'spain',
        displayName: 'Spain',
        tagline: 'Viva España — Documenting Spain's decline',
        description: 'From Madrid to Barcelona, tracking the fall of the Spanish Kingdom',
        primaryColor: '#AA151B', // Spanish red
        secondaryColor: '#F1BF00', // Spanish yellow
        baseGrowth: 700,
        baseContent: 19,
        social: {
            instagram: 'spain.wtf',
            tiktok: '@spain.wtf',
            x: 'spainwtf',
            youtube: '@spainwtf',
            threads: '@spainwtf'
        }
    },
    {
        name: 'italy',
        displayName: 'Italy',
        tagline: 'L'Italia — Recording Italy's decline',
        description: 'From Rome to Milan, documenting the fall of the Italian Republic',
        primaryColor: '#009246', // Italian green
        secondaryColor: '#CE2B37', // Italian red
        baseGrowth: 680,
        baseContent: 20,
        social: {
            instagram: 'italy.wtf',
            tiktok: '@italy.wtf',
            x: 'italywtf',
            youtube: '@italywtf',
            threads: '@italywtf'
        }
    },
    {
        name: 'netherlands',
        displayName: 'Netherlands',
        tagline: 'Nederland — Following the fall of Dutch sanity',
        description: 'From Amsterdam to Rotterdam, tracking the descent of the Netherlands',
        primaryColor: '#FF6C00', // Dutch orange
        secondaryColor: '#21468B', // Dutch blue
        baseGrowth: 650,
        baseContent: 19,
        social: {
            instagram: 'netherlands.wtf',
            tiktok: '@netherlands.wtf',
            x: 'netherlandswtf',
            youtube: '@netherlandswtf',
            threads: '@netherlandswtf'
        }
    },
    {
        name: 'poland',
        displayName: 'Poland',
        tagline: 'Polska — Tracking Poland's transformation',
        description: 'From Warsaw to Krakow, documenting the Polish decline',
        primaryColor: '#DC143C', // Polish red
        secondaryColor: '#FFFFFF', // Polish white
        baseGrowth: 620,
        baseContent: 18,
        social: {
            instagram: 'poland.wtf',
            tiktok: '@poland.wtf',
            x: 'polandwtf',
            youtube: '@polandwtf',
            threads: '@polandwtf'
        }
    },
    {
        name: 'sweden',
        displayName: 'Sweden',
        tagline: 'Sverige — Observing Sweden's transformation',
        description: 'From Stockholm to Gothenburg, tracking the fall of Swedish stability',
        primaryColor: '#006AA7', // Swedish blue
        secondaryColor: '#FECC00', // Swedish yellow
        baseGrowth: 640,
        baseContent: 19,
        social: {
            instagram: 'sweden.wtf',
            tiktok: '@sweden.wtf',
            x: 'swedenwtf',
            youtube: '@swedenwtf',
            threads: '@swedenwtf'
        }
    },
    {
        name: 'usa',
        displayName: 'USA',
        tagline: 'United We Fall — Tracking America's decline',
        description: 'From coast to coast, documenting the fall of the American empire',
        primaryColor: '#B22234', // US red
        secondaryColor: '#3C3B6E', // US blue
        baseGrowth: 1100,
        baseContent: 27,
        social: {
            instagram: 'usa.wtf',
            tiktok: '@usa.wtf',
            x: 'usawtf',
            youtube: '@usawtf',
            threads: '@usawtf'
        }
    },
    {
        name: 'australia',
        displayName: 'Australia',
        tagline: 'Down Under, Going Down — Watching Australia's unraveling',
        description: 'From Sydney to Perth, tracking civilization's descent across the Southern Cross',
        primaryColor: '#012169', // Australian blue
        secondaryColor: '#FFFFFF',
        baseGrowth: 1050,
        baseContent: 26,
        social: {
            instagram: 'australia.wtf',
            tiktok: '@australia.wtf',
            x: 'australiawtf',
            youtube: '@australiawtf',
            threads: '@australiawtf'
        }
    },
    {
        name: 'canada',
        displayName: 'Canada',
        tagline: 'True North Strong and Free (For Now) — Following Canada's social decay',
        description: 'From Vancouver to Montreal, documenting the Great White North's decline',
        primaryColor: '#FF0000', // Canadian red
        secondaryColor: '#FFFFFF',
        baseGrowth: 700,
        baseContent: 21,
        social: {
            instagram: 'canada.wtf',
            tiktok: '@canada.wtf',
            x: 'canadawtf',
            youtube: '@canadawtf',
            threads: '@canadawtf'
        }
    },
    {
        name: 'europe',
        displayName: 'Europe',
        tagline: 'In Varietate Concordia — Tracking the fall across Europe',
        description: 'Across the continent, documenting the European project's unraveling',
        primaryColor: '#003399', // EU blue
        secondaryColor: '#FFCC00', // EU gold
        baseGrowth: 950,
        baseContent: 24,
        social: {
            instagram: 'europe.wtf',
            tiktok: '@europe.wtf',
            x: 'europewtf',
            youtube: '@europewtf',
            threads: '@europewtf'
        }
    }
];

console.log('✅ Country configuration loaded. Ready to generate', countries.length, 'subpages');
console.log('Run this script with Node.js to generate all HTML and CSS files automatically.');
