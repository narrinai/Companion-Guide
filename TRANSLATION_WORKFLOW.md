# Translation Workflow for CompanionGuide.ai

## Overview

This document explains the complete workflow for translating companion pages from English to Dutch using Airtable as the content management system.

## Architecture

### URL Structure
- **English**: `https://companionguide.ai/companions/[slug]`
- **Dutch**: `https://companionguide.ai/nl/companions/[slug]`

### Two-Layer Translation System

1. **Dynamic Content (Airtable)**
   - Companion-specific content (descriptions, features, pricing, etc.)
   - Stored in `Companion_Translations` table
   - Linked to main `Companions` table via `companion` field
   - Language-specific records with `language` field ('en' or 'nl')

2. **Static UI (nl.json)**
   - Generic labels, buttons, navigation
   - Stored in `/locales/nl.json`
   - Loaded by i18n.js based on URL path detection

## Airtable Setup

### Tables

#### 1. Companions (Main Table)
- Stores base companion data
- Fields: name, slug, rating, website_url, logo_url, categories, badges, status

#### 2. Companion_Translations
- Stores all translatable content
- **Key Fields**:
  - `companion` (Linked Record) - Links to Companions table
  - `language` (Single Select) - 'en' or 'nl'
  - `description` (Long Text) - Full description
  - `best_for` (Long Text) - "Best for..." text
  - `tagline` (Long Text) - Hero section tagline
  - `meta_title` (Long Text) - SEO title
  - `meta_description` (Long Text) - SEO description
  - `body_text` (Long Text) - Main article content
  - `features` (Long Text - JSON) - Array of feature objects
  - `pros_cons` (Long Text - JSON) - Object with pros/cons arrays
  - `pricing_plans` (Long Text - JSON) - Array of pricing plan objects
  - `my_verdict` (Long Text) - Review verdict text
  - `faq` (Long Text - JSON) - Array of FAQ objects

#### Fields to Add (Optional - for complete translation):
- `hero_specs` (Long Text - JSON) - Pricing/Platform/Content Policy specs
- `ready_try` (Long Text) - "Ready to try [companion]?" CTA text
- `review_form_text` (Long Text - JSON) - All review form labels
- `verdict_subtitle` (Long Text) - Subtitle for verdict section

### Field Formats (JSON Examples)

#### features
```json
[
  {
    "title": "Advanced AI Chat",
    "description": "Engage in natural conversations..."
  },
  {
    "title": "Character Creation",
    "description": "Create custom AI personalities..."
  }
]
```

#### pros_cons
```json
{
  "pros": [
    "Free tier available",
    "Large character library",
    "Mobile apps"
  ],
  "cons": [
    "Limited free messages",
    "Occasional response delays"
  ]
}
```

#### pricing_plans
```json
[
  {
    "name": "Free",
    "price": "$0/month",
    "features": [
      "Limited messages",
      "Basic features"
    ]
  },
  {
    "name": "Plus",
    "price": "$9.99/month",
    "features": [
      "Unlimited messages",
      "Priority responses"
    ]
  }
]
```

#### faq
```json
[
  {
    "question": "Is Character.AI free?",
    "answer": "Yes, Character.AI offers a free tier..."
  },
  {
    "question": "Can I create my own characters?",
    "answer": "Absolutely! You can create custom characters..."
  }
]
```

## Translation Workflow

### Step 1: Extract English Content (Automated)

Run the extraction script to populate Airtable with English content from all 42 HTML files:

```bash
node scripts/extract-english-to-airtable.js
```

**What it does**:
- Reads all `/companions/*.html` files
- Extracts content from each section
- Formats JSON fields properly
- Uploads to Airtable with `language='en'`
- Creates or updates records as needed

### Step 2: Translate in Airtable (Manual)

For each companion:

1. **Find the English record** in Companion_Translations table
   - Filter: `language = 'en'`
   - Sort by companion name

2. **Duplicate the record**
   - Right-click → Duplicate record
   - Or copy all fields manually

3. **Update the duplicate**:
   - Change `language` from 'en' to 'nl'
   - Keep the same `companion` link
   - Translate all text fields to Dutch

4. **Translate JSON fields**:
   - Copy JSON content to text editor
   - Translate text values (keep JSON structure intact)
   - Paste back into Airtable

**Pro Tips**:
- Use ChatGPT/Claude for bulk translation
- Keep JSON structure exactly the same
- Test one companion first before doing all 42
- Character.AI is already done as an example

### Step 3: Generate Dutch HTML Pages (Automated)

Create Dutch versions of all HTML files:

```bash
node scripts/create-nl-pages.js
```

**What it does**:
- Copies all `/companions/*.html` to `/nl/companions/`
- Updates `<html lang="nl">`
- Converts relative CSS/JS paths to absolute
- Adds canonical and hreflang tags
- Updates Open Graph URLs

### Step 4: Deploy & Test

1. **Test locally**:
   ```bash
   netlify dev --port 8888
   ```
   - Visit: `http://localhost:8888/nl/companions/character-ai`
   - Check all translated content loads properly

2. **Deploy to production**:
   ```bash
   netlify deploy --prod
   ```

## How Translation Works at Runtime

### 1. Language Detection

`/js/i18n.js` detects language from URL:
- `/nl/companions/character-ai` → language = 'nl'
- `/companions/character-ai` → language = 'en' (default)

### 2. Static UI Translation

`i18n.js` loads `/locales/nl.json` and replaces text:
- Navigation items
- Section headings
- Button labels
- Common phrases

### 3. Dynamic Content Loading

`/js/companion-header.js`:
1. Detects current companion slug
2. Fetches from Netlify function with `?lang=nl` parameter
3. Netlify function queries Airtable for Dutch translation
4. Injects translated content into page

### 4. Netlify Function Flow

`/netlify/functions/companionguide-get.js`:
1. Receives `lang` parameter ('nl')
2. Fetches all active companions
3. Queries `Companion_Translations` for matching language
4. Overlays translated fields onto base companion data
5. Returns merged data

## Content That Gets Translated

### From Airtable (Dynamic)
✅ Meta title & description
✅ Hero tagline
✅ Description
✅ Best for
✅ Features list
✅ Pros & cons
✅ Pricing plans
✅ FAQ
✅ Verdict text
✅ Body content sections

### From nl.json (Static)
✅ Navigation menu
✅ "Read Review" button
✅ "Visit Website" button
✅ Section headings (Reviews, FAQ, etc.)
✅ Star rating label
✅ Form labels
✅ Category names
✅ Footer text

### Currently Not Translated (To Add)
⚠️ "Visit Website" in pricing cards
⚠️ Verdict subtitle
⚠️ Review form subtitle
⚠️ "Ready to try [companion]?" CTA

**Fix**: Add missing fields to Airtable (hero_specs, ready_try, review_form_text, verdict_subtitle)

## Files Reference

### Scripts
- `/scripts/extract-english-to-airtable.js` - Extract EN content to Airtable
- `/scripts/create-nl-pages.js` - Generate Dutch HTML files

### JavaScript
- `/js/i18n.js` - Language detection & static UI translation
- `/js/companion-header.js` - Dynamic Airtable content injection
- `/js/alternatives.js` - Alternative companions with translations

### Translations
- `/locales/nl.json` - Dutch static UI translations
- Airtable `Companion_Translations` - Dynamic content

### Configuration
- `/_redirects` - Netlify URL routing
- `/netlify/functions/companionguide-get.js` - API endpoint

## Troubleshooting

### Issue: Dutch page has no styling
**Cause**: CSS paths are relative
**Fix**: Run `create-nl-pages.js` to convert to absolute paths

### Issue: Translation not showing
**Cause**: Airtable record missing or wrong language
**Fix**: Check `Companion_Translations` table has `language='nl'` record

### Issue: API returns English content on /nl/ pages
**Cause**: Language parameter not passed or translation missing
**Fix**: Check browser console for API URL, verify Airtable has nl record

### Issue: "Unknown field name" error
**Cause**: Field doesn't exist in Airtable
**Fix**: Add field to Companion_Translations table or remove from script

## Next Steps

1. ✅ **Add "en" option** to `language` field in Airtable
2. ✅ **Run extraction script** to populate English content
3. ⏳ **Translate Character.AI** as a test (already done!)
4. ⏳ **Translate remaining 41 companions**
5. ⏳ **Add optional fields** (hero_specs, ready_try, review_form_text, verdict_subtitle)
6. ⏳ **Update scripts** to include new fields
7. ⏳ **Re-extract and translate** with complete field set

## Questions?

Contact: [Your contact info]

Last updated: 2025-10-23
