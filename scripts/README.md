# Companion Page Generator Scripts

## generate-companion-page.js

Automatically generates companion review pages using the same structure as secrets-ai.html by fetching data from Airtable.

### Features

- Fetches companion data from Airtable by slug
- Generates complete HTML page with both dynamic and static content
- Includes:
  - **Dynamic content** (from Airtable):
    - Name, tagline, description
    - Rating and logo
    - Pricing plans (parsed from JSON)
    - Features (parsed from JSON)
    - Categories
    - Website URL
  - **Static content** (template-based):
    - 4-week personal experience section
    - User reviews section with review form
    - FAQ section
    - Pros/cons section
    - Structured data for SEO

### Prerequisites

```bash
npm install airtable dotenv
```

### Environment Variables

Make sure your `.env` file contains:
```
AIRTABLE_TOKEN_CG=your_airtable_token
AIRTABLE_BASE_ID_CG=your_base_id
AIRTABLE_TABLE_ID_CG=your_table_id
```

### Usage

```bash
# Generate a companion page by slug
node scripts/generate-companion-page.js <slug>

# Example:
node scripts/generate-companion-page.js nextpart-ai
```

### What It Does

1. **Fetches from Airtable**: Retrieves companion data using the provided slug
2. **Parses Data**: Processes pricing plans and features from JSON strings
3. **Generates HTML**: Creates complete page using secrets-ai.html structure
4. **Saves File**: Writes to `/companions/<slug>.html`

### Output Structure

The generated page includes:

- ✅ Complete meta tags (title, description, OG, Twitter)
- ✅ Structured data (Schema.org) for SEO
- ✅ Hero section with logo, rating, tagline
- ✅ Quick facts section
- ✅ Overview with highlights
- ✅ Pricing section (auto-generated from Airtable JSON)
- ✅ Pros & cons section
- ✅ Verdict section
- ✅ Personal 4-week experience (static template)
- ✅ User reviews section with submit form
- ✅ Similar alternatives section
- ✅ FAQ section with structured data
- ✅ Footer with navigation and featured guides

### Customization After Generation

After generating the page, you should manually customize:

1. **Personal Experience Section**: Replace generic content with platform-specific details
2. **Pros & Cons**: Add specific strengths and weaknesses
3. **Verdict**: Customize the verdict to match the platform
4. **User Reviews**: Add real user reviews if available
5. **Alternatives**: Update similar platforms in the alternatives section

### Example Workflow

```bash
# 1. Add companion to Airtable with:
#    - name, slug, tagline, description
#    - pricing_plans (JSON array)
#    - features (JSON array)
#    - rating, website_url, categories

# 2. Generate the page
node scripts/generate-companion-page.js nextpart-ai

# 3. Customize static content in companions/nextpart-ai.html
#    - Edit personal experience section
#    - Add specific pros/cons
#    - Customize verdict

# 4. Deploy
netlify deploy --prod
```

### Pricing Plans JSON Format

```json
[
  {
    "name": "Premium",
    "price": "$9.99",
    "period": "month",
    "billing_note": "BILLED MONTHLY",
    "description": "Enhanced features",
    "features": [
      { "name": "Unlimited messages", "included": true },
      { "name": "Premium AI models", "included": true },
      { "name": "Early access", "included": false }
    ],
    "featured": true,
    "badge": "MOST POPULAR"
  }
]
```

### Features JSON Format

```json
[
  {
    "icon": "🎭",
    "title": "Roleplay Scenarios",
    "description": "Immersive roleplay with diverse scenarios"
  },
  {
    "icon": "🎨",
    "title": "Character Creation",
    "description": "Customize appearance and personality"
  }
]
```

### Notes

- The script uses the secrets-ai.html structure as the base template
- Static content is intentionally generic and should be customized per platform
- Pricing plans are auto-formatted with proper badges and tiers
- Features are displayed as highlight cards in the overview section
- All pages include proper SEO markup and structured data
