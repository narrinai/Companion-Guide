const puppeteer = require('puppeteer');
const fs = require('fs').promises;
const path = require('path');

// Configuration
const SCREENSHOTS_DIR = path.join(__dirname, 'images/screenshots');
const AIRTABLE_CSV = path.join(__dirname, 'airtable_import_final.csv');
const SCREENSHOTS_PER_SITE = 5;
const VIEWPORT_WIDTH = 1920;
const VIEWPORT_HEIGHT = 1080;

// Screenshot types to capture
const SCREENSHOT_TYPES = [
  { name: 'homepage', scroll: 0, description: 'Homepage hero section' },
  { name: 'features', scroll: 0.3, description: 'Features/pricing section' },
  { name: 'chat', scroll: 0.5, description: 'Chat interface (if visible)' },
  { name: 'gallery', scroll: 0.7, description: 'Gallery/examples section' },
  { name: 'footer', scroll: 1, description: 'Footer/bottom section' }
];

async function ensureDirectoryExists(dir) {
  try {
    await fs.access(dir);
  } catch {
    await fs.mkdir(dir, { recursive: true });
    console.log(`✓ Created directory: ${dir}`);
  }
}

async function parseCompanionsFromCSV() {
  const csvContent = await fs.readFile(AIRTABLE_CSV, 'utf-8');
  const lines = csvContent.split('\n');
  const companions = [];

  // Skip header
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    // Simple CSV parse (handle quoted fields)
    const matches = line.match(/(".*?"|[^,]+)(?=\s*,|\s*$)/g);
    if (!matches || matches.length < 4) continue;

    const name = matches[0].replace(/^"|"$/g, '');
    const slug = matches[1].replace(/^"|"$/g, '');
    const website_url = matches[3].replace(/^"|"$/g, '');

    if (name && slug && website_url && website_url.startsWith('http')) {
      companions.push({ name, slug, website_url });
    }
  }

  return companions;
}

async function captureScreenshots(companion) {
  console.log(`\n📸 Capturing screenshots for: ${companion.name}`);
  console.log(`   URL: ${companion.website_url}`);

  const browser = await puppeteer.launch({
    headless: 'new',
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-web-security',
      '--disable-features=IsolateOrigins,site-per-process'
    ]
  });

  try {
    const page = await browser.newPage();

    // Set viewport
    await page.setViewport({
      width: VIEWPORT_WIDTH,
      height: VIEWPORT_HEIGHT,
      deviceScaleFactor: 1
    });

    // Set user agent to avoid bot detection
    await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

    // Navigate to page with timeout
    console.log(`   Loading page...`);
    await page.goto(companion.website_url, {
      waitUntil: 'networkidle2',
      timeout: 30000
    });

    // Wait a bit for any dynamic content
    await page.waitForTimeout(3000);

    // Get page height for scrolling
    const bodyHeight = await page.evaluate(() => document.body.scrollHeight);

    // Capture screenshots at different scroll positions
    for (let i = 0; i < SCREENSHOT_TYPES.length; i++) {
      const screenshot = SCREENSHOT_TYPES[i];
      const scrollPosition = Math.floor(bodyHeight * screenshot.scroll);

      // Scroll to position
      await page.evaluate((y) => window.scrollTo(0, y), scrollPosition);
      await page.waitForTimeout(1000); // Wait for scroll

      // Take screenshot
      const filename = `${companion.slug}-${screenshot.name}.png`;
      const filepath = path.join(SCREENSHOTS_DIR, filename);

      await page.screenshot({
        path: filepath,
        fullPage: false
      });

      console.log(`   ✓ Captured: ${filename} (${screenshot.description})`);
    }

    console.log(`   ✅ Completed ${companion.name}`);

  } catch (error) {
    console.error(`   ❌ Error capturing ${companion.name}: ${error.message}`);
  } finally {
    await browser.close();
  }
}

async function main() {
  console.log('🚀 Companion Screenshot Tool\n');
  console.log(`Screenshots per site: ${SCREENSHOTS_PER_SITE}`);
  console.log(`Viewport: ${VIEWPORT_WIDTH}x${VIEWPORT_HEIGHT}\n`);

  // Ensure screenshots directory exists
  await ensureDirectoryExists(SCREENSHOTS_DIR);

  // Parse companions from Airtable CSV
  console.log('📋 Loading companions from Airtable CSV...');
  const companions = await parseCompanionsFromCSV();
  console.log(`✓ Found ${companions.length} companions\n`);

  // Ask for confirmation
  console.log('⚠️  This will capture 5 screenshots for each companion.');
  console.log(`   Total screenshots: ${companions.length * 5}`);
  console.log(`   Estimated time: ~${Math.ceil(companions.length * 0.5)} minutes\n`);

  // Process companions
  let successCount = 0;
  let failCount = 0;

  for (let i = 0; i < companions.length; i++) {
    const companion = companions[i];
    console.log(`\n[${i + 1}/${companions.length}] Processing: ${companion.name}`);

    try {
      await captureScreenshots(companion);
      successCount++;

      // Small delay between companions to avoid rate limiting
      if (i < companions.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    } catch (error) {
      console.error(`❌ Failed to process ${companion.name}: ${error.message}`);
      failCount++;
    }
  }

  // Summary
  console.log('\n\n' + '='.repeat(60));
  console.log('📊 SUMMARY');
  console.log('='.repeat(60));
  console.log(`✅ Successful: ${successCount} companions (${successCount * 5} screenshots)`);
  console.log(`❌ Failed: ${failCount} companions`);
  console.log(`📁 Screenshots saved to: ${SCREENSHOTS_DIR}`);
  console.log('='.repeat(60) + '\n');
}

// Run if called directly
if (require.main === module) {
  main().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

module.exports = { captureScreenshots, parseCompanionsFromCSV };
