# Companion Screenshot Tool

Automatically capture screenshots from all companion websites.

## Features

- ✅ Captures 5 screenshots per companion website
- ✅ Different scroll positions (homepage, features, chat, gallery, footer)
- ✅ Full HD screenshots (1920x1080)
- ✅ Automatic retry on failures
- ✅ Progress tracking
- ✅ Reads companion URLs directly from Airtable CSV

## Installation

```bash
npm install
```

This will install Puppeteer and all dependencies.

## Usage

### Screenshot ALL companions (30+ websites)

```bash
npm run screenshot
```

This will:
- Load all companions from `airtable_import_final.csv`
- Capture 5 screenshots per website
- Save to `images/screenshots/`
- Take approximately 15-20 minutes for 30+ sites

### Output Files

Screenshots are saved as:
```
images/screenshots/
  ├── secrets-ai-homepage.png
  ├── secrets-ai-features.png
  ├── secrets-ai-chat.png
  ├── secrets-ai-gallery.png
  ├── secrets-ai-footer.png
  ├── candy-ai-homepage.png
  ├── candy-ai-features.png
  └── ...
```

## Screenshot Types

Each companion gets 5 screenshots at different scroll positions:

1. **homepage** (0% scroll) - Hero section, main CTA
2. **features** (30% scroll) - Features or pricing section
3. **chat** (50% scroll) - Chat interface if visible
4. **gallery** (70% scroll) - Gallery or examples section
5. **footer** (100% scroll) - Footer and bottom content

## Configuration

Edit `screenshot-companions.js` to customize:

```javascript
const SCREENSHOTS_PER_SITE = 5;      // Number of screenshots per site
const VIEWPORT_WIDTH = 1920;          // Screenshot width
const VIEWPORT_HEIGHT = 1080;         // Screenshot height
```

## Troubleshooting

### Puppeteer installation issues

If Puppeteer fails to install Chrome:

```bash
# macOS
brew install chromium
export PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
export PUPPETEER_EXECUTABLE_PATH=`which chromium`

# Linux
sudo apt-get install chromium-browser
export PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser
```

### Site blocking/rate limiting

The script includes:
- 2-second delay between sites
- Realistic user agent
- 3-second wait for dynamic content

If a site still blocks, you may need to:
- Add longer delays
- Use a VPN
- Screenshot manually

### Memory issues

For 30+ sites, ensure you have:
- At least 4GB RAM available
- Sufficient disk space (~500MB for screenshots)

## Manual Screenshot for Single Site

To test on one site before running all:

```javascript
// In screenshot-companions.js, add at the bottom:
if (process.argv[2] === '--single') {
  const testCompanion = {
    name: 'Test Site',
    slug: 'test-site',
    website_url: 'https://example.com'
  };
  captureScreenshots(testCompanion);
}
```

Then run:
```bash
npm run screenshot:single
```

## Notes

- Screenshots are saved as PNG (lossless quality)
- Each screenshot is approximately 500KB - 2MB
- Total storage for 30 sites: ~300-500MB
- Some sites may have anti-bot protection
- Adult content sites may require age verification (handle manually)

## License

Same as main project.
