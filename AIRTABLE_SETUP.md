# Airtable Integration Setup

This document explains how to set up the Airtable integration for dynamic companion data management.

## Airtable Database Schema

Create a table in Airtable with the following fields (all lowercase):

### Required Fields

| Field Name | Field Type | Description |
|------------|------------|-------------|
| `name` | Single line text | Companion name (e.g., "Secrets AI") |
| `slug` | Single line text | URL slug (e.g., "secrets-ai") |
| `rating` | Number | Rating out of 5 (e.g., 4.8) |
| `description` | Long text | Full description for companion pages |
| `short_description` | Long text | Brief description for cards |
| `website_url` | URL | Official website URL |
| `affiliate_url` | URL | Affiliate/tracking URL |
| `image_url` | URL | Logo/image URL |
| `categories` | Single line text | Comma-separated (e.g., "ai-girlfriend,nsfw") |
| `badges` | Single line text | Comma-separated (e.g., "Leader,Popular") |
| `pricing_plans` | Long text | JSON format (see below) |
| `featured` | Checkbox | Whether to show on homepage |
| `status` | Single select | Options: "Active", "Inactive", "Draft" |

### Categories
Available categories: `ai-girlfriend`, `roleplaying`, `nsfw`, `video`, `wellness`, `learning`, `whatsapp`, `image-gen`

### Badges
Available badges: `Leader`, `Popular`, `Adult`, `New`, `Featured`, `Top Rated`

### Pricing Plans JSON Format

```json
[
  {
    "name": "Free",
    "price": "0",
    "features": ["Limited messages", "Basic AI"]
  },
  {
    "name": "Premium",
    "price": "5.99",
    "features": ["Unlimited messages", "Advanced AI", "Image generation"]
  }
]
```

## Environment Variables

Set the following environment variables in your Netlify dashboard:

```bash
AIRTABLE_TOKEN_CG=your_airtable_token
AIRTABLE_BASE_ID_CG=your_base_id
AIRTABLE_TABLE_ID_CG=your_table_id
```

## Getting Airtable Credentials

1. **API Key**: Go to https://airtable.com/create/tokens and create a new personal access token
2. **Base ID**: Found in your Airtable URL: `https://airtable.com/[BASE_ID]/...`
3. **Table ID**: Found in your Airtable URL: `https://airtable.com/BASE_ID/[TABLE_ID]/...`

## Testing the Integration

1. Install dependencies: `npm install`
2. Set environment variables in `.env` file
3. Run locally: `netlify dev`
4. Test the API: `http://localhost:8888/.netlify/functions/get-companions`

## Enabling Dynamic Loading

Once Airtable is configured:

1. In `index.html`, uncomment the line:
   ```javascript
   companionManager.renderFeaturedCompanions('featured-companions-dynamic', 8);
   ```

2. Hide the static companions and show dynamic ones:
   ```javascript
   document.querySelector('.companions-grid').style.display = 'none';
   document.getElementById('featured-companions-dynamic').style.display = 'grid';
   ```

## API Endpoints

- `/.netlify/functions/get-companions` - Get all companions
- `/.netlify/functions/get-companions?category=ai-girlfriend` - Filter by category
- `/.netlify/functions/get-companions?sort=rating&limit=6` - Sort and limit results

## Migration Strategy

1. **Phase 1**: Set up Airtable with current static data
2. **Phase 2**: Test API endpoints and verify data accuracy
3. **Phase 3**: Enable dynamic loading on index page
4. **Phase 4**: Migrate category pages to use dynamic data
5. **Phase 5**: Remove static HTML companion cards