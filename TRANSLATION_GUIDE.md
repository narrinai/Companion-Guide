# CompanionGuide.ai - Translation System Guide

This guide explains how to use the translation scripts to add new languages to CompanionGuide.ai.

## Overview

The translation system consists of modular scripts that can translate different types of pages independently. This makes it easy to:
- Add new languages page by page
- Update translations for specific pages
- Manage translations at scale

## Directory Structure

```
/
├── scripts/
│   ├── translate-companions-page.sh       # Homepage /companions
│   ├── translate-categories-page.sh       # Categories overview
│   ├── translate-deals-page.sh            # Deals page
│   ├── translate-news-page.sh             # News overview
│   ├── translate-contact-page.sh          # Contact page
│   ├── translate-companions-az-page.sh    # A-Z listing
│   ├── translate-companion-page.sh        # Individual companion (dynamic)
│   ├── translate-category-page.sh         # Individual category (dynamic)
│   ├── translate-all-companions.sh        # Batch: all companions
│   ├── translate-all-categories.sh        # Batch: all categories
│   ├── populate-translations.js           # Populate Airtable translations
│   └── add-meta-fields-to-companions.js   # Add meta fields to Airtable
├── nl/                                     # Dutch translations
│   ├── index.html
│   ├── companions.html
│   ├── categories.html
│   ├── companions/
│   │   ├── character-ai.html
│   │   └── ...
│   └── categories/
│       ├── roleplay-character-chat-companions.html
│       └── ...
└── locales/
    ├── en.json                             # English translations
    └── nl.json                             # Dutch translations
```

## How It Works

### 1. Static Pages (Homepage, Main Sections)

Each main page has its own translation script:

```bash
# Translate the companions listing page to Dutch
./scripts/translate-companions-page.sh

# Translate the categories overview page
./scripts/translate-categories-page.sh

# Translate the deals page
./scripts/translate-deals-page.sh

# Translate the news overview
./scripts/translate-news-page.sh

# Translate the contact page
./scripts/translate-contact-page.sh

# Translate the A-Z listing
./scripts/translate-companions-az-page.sh
```

Each script:
- Copies the English HTML to `/nl/[page].html`
- Updates `<html lang="en">` to `<html lang="nl">`
- Updates meta tags (title, description, OG tags)
- Adds hreflang tags for SEO
- Fixes CSS/JS paths to absolute URLs
- Translates navigation menu
- Translates page content
- Updates footer
- Adds i18n.js script

### 2. Dynamic Pages (Individual Companions & Categories)

For individual companion and category pages, use the dynamic scripts:

```bash
# Translate a single companion page
./scripts/translate-companion-page.sh character-ai

# Translate a single category page
./scripts/translate-category-page.sh roleplay-character-chat-companions

# Translate ALL companion pages at once
./scripts/translate-all-companions.sh

# Translate ALL category pages at once
./scripts/translate-all-categories.sh
```

## Airtable Integration

### Main Companions Table

The Companions table should have these fields:
- `slug` (text) - URL slug
- `name` (text) - Companion name
- `tagline` (text) - English tagline
- `description` (text) - English description
- `best_for` (text) - English "Best for" text
- **`meta_title`** (text) - Default English SEO title
- **`meta_description`** (text) - Default English SEO description
- ... other fields

### Companion_Translations Table

This table stores translations for each language:
- `companion` (link to Companions table)
- `language` (text) - Language code (en, nl, de, etc.)
- `tagline` (text) - Translated tagline
- `description` (text) - Translated description
- `best_for` (text) - Translated "Best for" text
- `meta_title` (text) - Translated SEO title
- `meta_description` (text) - Translated SEO description

### Adding Meta Fields to Companions Table

To add `meta_title` and `meta_description` to existing companions:

```bash
# Extract meta tags from HTML files and populate Airtable
node scripts/add-meta-fields-to-companions.js
```

This script:
1. Reads all companion HTML files
2. Extracts `<title>` and meta description
3. Updates Airtable Companions table with the values

### Populating Translations

To add Dutch translations to Airtable:

```bash
# Populate Dutch translations for companions
node scripts/populate-translations.js
```

Edit `populate-translations.js` to add more companions or change translations.

## Adding a New Language

To add a new language (e.g., German):

### Step 1: Create Language Directory
```bash
mkdir de
mkdir de/companions
mkdir de/categories
```

### Step 2: Create Translation File
Create `locales/de.json` with German translations:

```json
{
  "nav": {
    "home": "Startseite",
    "companions": "Companions",
    "categories": "Kategorien",
    ...
  }
}
```

### Step 3: Modify Scripts

For each script, create a German version or add a language parameter:

**Option A: Copy and modify scripts**
```bash
cp scripts/translate-companions-page.sh scripts/translate-companions-page-de.sh
# Edit to replace 'nl' with 'de' and Dutch text with German
```

**Option B: Make scripts language-aware** (recommended)
Modify scripts to accept a language parameter:

```bash
./scripts/translate-companion-page.sh character-ai de
```

### Step 4: Update Netlify Redirects

Add German redirects to `netlify.toml`:

```toml
[[redirects]]
  from = "/de"
  to = "/de/index.html"
  status = 200

[[redirects]]
  from = "/de/*"
  to = "/de/:splat"
  status = 200
```

### Step 5: Update Language Switcher

In translated pages, update the language switcher HTML:

```html
<div class="language-switcher">
  <a href="/" class="">🇬🇧 EN</a>
  <a href="/nl/" class="">🇳🇱 NL</a>
  <a href="/de/" class="active">🇩🇪 DE</a>
</div>
```

## Testing Translations

### Local Testing
```bash
# Start Netlify dev server
netlify dev --port 8888

# Visit pages
open http://localhost:8888/nl/
open http://localhost:8888/nl/companions
open http://localhost:8888/nl/companions/character-ai
```

### Check for Issues
1. **CSS/JS loading**: All paths should be absolute (`/style.css` not `style.css`)
2. **Navigation links**: All links should include language prefix (`/nl/companions`)
3. **Hreflang tags**: Check SEO tags are correct
4. **i18n.js**: Verify language detection works
5. **Companion cards**: Check translations from Airtable load correctly

## File Naming Conventions

- Main pages: `[page-name].html` → `nl/[page-name].html`
- Companion pages: `companions/[slug].html` → `nl/companions/[slug].html`
- Category pages: `categories/[slug].html` → `nl/categories/[slug].html`
- News articles: `news/[slug].html` → `nl/news/[slug].html`

## Common Translation Patterns

### Meta Tags
```bash
# Title
sed -i '' 's|<title>English Title</title>|<title>Dutch Title</title>|g' "$FILE"

# Description
sed -i '' 's|<meta name="description" content="English description">|<meta name="description" content="Dutch description">|g' "$FILE"
```

### Navigation
```bash
sed -i '' 's|<li><a href="/companions">Companions</a></li>|<li><a href="/nl/companions" data-i18n="nav.companions">Companions</a></li>|g' "$FILE"
```

### Content
```bash
sed -i '' 's|<h1>English Heading</h1>|<h1 data-i18n="key">Dutch Heading</h1>|g' "$FILE"
```

### URL Updates
```bash
# Add canonical and hreflang
sed -i '' 's|<link rel="canonical" href="https://companionguide.ai/page">|<link rel="canonical" href="https://companionguide.ai/nl/page">\n    <link rel="alternate" hreflang="en" href="https://companionguide.ai/page">\n    <link rel="alternate" hreflang="nl" href="https://companionguide.ai/nl/page">\n    <link rel="alternate" hreflang="x-default" href="https://companionguide.ai/page">|g' "$FILE"
```

## Best Practices

### 1. Always Use Absolute Paths
```html
<!-- ✅ Good -->
<link rel="stylesheet" href="/style.css">
<script src="/js/i18n.js"></script>

<!-- ❌ Bad -->
<link rel="stylesheet" href="style.css">
<script src="../script.js"></script>
```

### 2. Include data-i18n Attributes
```html
<h1 data-i18n="page.title">Dutch Title</h1>
```

This makes it easier to update translations programmatically later.

### 3. Test Each Page Type
Before running batch scripts, test individual pages first.

### 4. Maintain Consistency
Use the same translation for repeated phrases across all pages.

### 5. SEO Optimization
- Always include hreflang tags
- Update all Open Graph and Twitter meta tags
- Keep URLs consistent with language codes

## Deployment

### Commit Changes
```bash
git add nl/
git add scripts/
git commit -m "Add Dutch translations for [pages]"
git push origin main
```

### Netlify Auto-Deploy
Netlify will automatically deploy changes when pushed to main branch.

### Verify Live
After deployment, check:
- https://companionguide.ai/nl/
- https://companionguide.ai/nl/companions
- https://companionguide.ai/nl/companions/character-ai

## Troubleshooting

### Issue: CSS Not Loading
**Cause**: Relative paths in subdirectories
**Fix**: Change to absolute paths: `href="/style.css"`

### Issue: Companion Cards Not Showing
**Cause**: i18n not initialized before API call
**Fix**: Ensure i18n.js loads first and is initialized

### Issue: Links Going to English Pages
**Cause**: Missing language prefix in links
**Fix**: Update all `href="/page"` to `href="/nl/page"`

### Issue: Translations Not Loading from Airtable
**Cause**: Language parameter not sent to API
**Fix**: Check `companionManager.fetchCompanions()` includes `?lang=nl`

## Future Enhancements

- [ ] Parameterize scripts to accept language codes
- [ ] Add meta field translations to Companion_Translations table
- [ ] Create unified translation dashboard
- [ ] Automate translation updates when English content changes
- [ ] Add support for blog post translations
- [ ] Create translation validation tests

## Questions?

Contact the development team or check the existing scripts for examples.
