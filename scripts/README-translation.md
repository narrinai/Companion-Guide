# AI-Powered Translation Script

Automatically translate companion pages using Claude AI API.

## Features

- ✅ **Context-aware translation** - Understands AI companion terminology
- ✅ **Preserves HTML structure** - Maintains all styling, JavaScript, and functionality
- ✅ **SEO-friendly** - Generates static HTML files with proper metadata
- ✅ **Batch processing** - Efficient API usage with batching
- ✅ **Smart content detection** - Skips technical elements (code, ratings, etc.)
- ✅ **Dry-run mode** - Preview before translating

## Prerequisites

1. **Anthropic API Key**
   ```bash
   export ANTHROPIC_API_KEY="sk-ant-..."
   ```
   Get your key from: https://console.anthropic.com/

2. **Node.js packages** (already installed)
   - `jsdom` - HTML parsing
   - `@anthropic-ai/sdk` - Claude API client

## Usage

### Translate all companion pages to Dutch

```bash
npm run translate:companions
```

### Translate a single page (for testing)

```bash
node scripts/translate-companion-pages.js --file=character-ai
```

### Dry run (preview without creating files)

```bash
node scripts/translate-companion-pages.js --file=character-ai --dry-run
```

### Translate to different language

```bash
node scripts/translate-companion-pages.js --lang=de --file=character-ai
```

### Force overwrite existing translations

```bash
node scripts/translate-companion-pages.js --force
```

## How It Works

1. **Parse HTML** - Extracts all translatable text nodes
2. **Skip technical content** - Ignores scripts, code blocks, dynamic elements
3. **Batch translate** - Groups texts into batches for efficient API calls
4. **Apply translations** - Updates DOM with translated content
5. **Update metadata** - Fixes canonical links, hreflang tags, navigation
6. **Generate files** - Writes to `/nl/companions/*.html`

## Cost Estimation

- **Per page**: ~$0.01 - $0.02 (depending on content length)
- **All 42 pages**: ~$0.50 - $1.00
- Uses Claude 3.5 Sonnet for high-quality translations

## Configuration

Edit `scripts/translate-companion-pages.js`:

```javascript
const CONFIG = {
  targetLang: 'nl',        // Target language
  claudeModel: 'claude-3-5-sonnet-20241022',
  maxTokens: 4096,

  // Elements to skip during translation
  skipSelectors: [
    'script',
    'style',
    'code',
    '[data-dynamic]',
    '.rating-stars'
  ]
};
```

## Output

Generated files in `/nl/companions/`:
- `character-ai.html`
- `replika-ai.html`
- ... (42 files total)

Each file:
- ✅ Fully translated content
- ✅ Updated metadata (lang, canonical, hreflang)
- ✅ Fixed navigation links
- ✅ Preserved JavaScript functionality
- ✅ Airtable integration still works (dynamic ratings, etc.)

## Updating Translations

When you update English pages:

1. Delete specific Dutch pages:
   ```bash
   rm nl/companions/character-ai.html
   ```

2. Re-translate:
   ```bash
   node scripts/translate-companion-pages.js --file=character-ai
   ```

Or re-translate all:
```bash
rm -rf nl/companions/*.html
npm run translate:companions
```

## Adding New Languages

1. Translate to German:
   ```bash
   node scripts/translate-companion-pages.js --lang=de
   ```

2. Update `netlify.toml` redirects:
   ```toml
   [[redirects]]
     from = "/de/*"
     to = "/de/index.html"
     status = 200
   ```

3. Add German translations to Airtable `Companion_Translations` table

## Troubleshooting

### "ANTHROPIC_API_KEY not set"
```bash
export ANTHROPIC_API_KEY="your-key-here"
```

### "Error translating batch"
- Check API key validity
- Check rate limits (script has 500ms delays between batches)
- Try with single file first

### Translations look wrong
- Review dry-run output first: `--dry-run`
- Adjust `skipSelectors` if technical content is being translated
- Check Claude API response in console logs

## NPM Scripts

Add to `package.json`:

```json
{
  "scripts": {
    "translate:companions": "node scripts/translate-companion-pages.js",
    "translate:test": "node scripts/translate-companion-pages.js --file=character-ai --dry-run",
    "translate:force": "node scripts/translate-companion-pages.js --force"
  }
}
```

## SEO Benefits

✅ **Static HTML files** - Fast loading, perfect for SEO
✅ **Proper hreflang tags** - Google knows which language to show
✅ **Canonical links** - Avoids duplicate content penalties
✅ **No JavaScript required** - Content visible to crawlers immediately
✅ **Fast indexing** - Pre-rendered content, not client-side translation

## Integration with Airtable

The script preserves all dynamic elements:
- Rating displays (`data-rating-slug`)
- Star ratings (`.rating-stars`)
- Review counts (`.rating-count`)
- Any element with `[data-dynamic]` attribute

These continue to work with your existing JavaScript (`companion-header.js`, etc.)
