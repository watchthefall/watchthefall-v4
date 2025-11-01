# WatchTheFall v4

**A network documenting the collapse of civilization through the lens of social media analytics.**

## 🌟 Features

- **Cinematic Homepage**: Video background with gold particle network overlay
- **TikTok 5-Pack**: Latest viral content from the WatchTheFall network
- **World Cup Leaderboard**: Global rankings of creators documenting the fall
- **WTF Creations**: Official merchandise powered by Printify
- **Regional Directory**: Explore WatchTheFall hubs around the world
- **PWA Support**: Full Progressive Web App with offline capabilities
- **GitHub Actions**: Automated deployment and Printify sync

## 🚀 Quick Start

1. Clone the repository
2. Copy `.env.template` to `.env` and add your API keys
3. Open `index.html` in a browser or deploy to GitHub Pages

## 🎨 Design Philosophy

- **Dark Backgrounds**: `#0a0a0a` for that dystopian feel
- **Antique Gold Accents**: `#d4af37` for highlights and CTAs
- **Cinematic Layers**:
  - Video background (z-index: -1000)
  - Particle network canvas (z-index: -999)
  - Content layer (z-index: 0+)

## 📁 Project Structure

```
WatchTheFall_V4/
├── index.html              # Homepage
├── watchthefallrecords.html # Printify shop
├── feed.html               # Regional directory
├── styles/
│   └── app.css            # Main stylesheet
├── scripts/
│   ├── network.js         # Particle network
│   ├── tiktok_section.js  # TikTok integration
│   ├── worldcup_display.js # Leaderboard
│   ├── social_links.js    # Social media
│   └── printify_sync.js   # Product sync
├── data/                  # JSON data files
├── assets/                # Images, videos, logos
├── regional/              # Regional pages
├── .github/workflows/     # CI/CD automation
├── manifest.json          # PWA manifest
└── sw.js                  # Service worker
```

## 🔧 Configuration

### API Keys (`.env`)
- `PRINTIFY_API_KEY` - Printify API access
- `PRINTIFY_SHOP_ID` - Your Printify shop ID
- Other keys for AI services (optional)

### Data Files
- `data/tiktoks.json` - TikTok video URLs
- `data/worldcup.json` - Leaderboard data
- `data/social_links.json` - Social media links
- `data/brands.json` - Printify products

## 🌐 Deployment

### GitHub Pages
1. Push to `main` branch
2. GitHub Actions will auto-deploy
3. Configure custom domain in repo settings

### Custom Domain
- Update `CNAME` with your domain
- Point DNS to GitHub Pages IPs

## 📊 Automation

- **Daily Printify Sync**: Updates product catalog at 2 AM UTC
- **Auto-deployment**: Pushes to main trigger deployment

## 🤝 Contributing

Built by Jamie for the WatchTheFall network.

## 📄 License

MIT License - See LICENSE file for details

---

**WatchTheFall v4.0.0** - Built 2025-11-01

*Documenting the fall, one post at a time.*
