# Meta Companion Tracking Documentation

## Overview

Custom Meta Pixel event tracking for monitoring when users click on external companion website links. This allows you to measure conversion rates and optimize your ad campaigns.

## Custom Event: `CompanionExternalClick`

### Event Details

- **Event Name:** `CompanionExternalClick`
- **Event Type:** Custom Event (trackCustom)
- **Trigger:** When a user clicks any external companion website link
- **Meta Pixel ID:** `1384707780100464`

### Event Parameters

The event tracks the following data:

```javascript
{
  companion_name: string,      // Name of the companion or domain (e.g., "Secrets AI" or "secrets.ai")
  companion_url: string,       // Full URL of the external link
  page_location: string,       // Path where the click occurred (e.g., "/companions/secrets-ai")
  button_type: string,         // Button text (e.g., "Visit Website")
  companion_slug: string,      // Companion slug ID (e.g., "secrets-ai")
  link_type: string           // Type: "companion_page", "companion_card", "domain_link", or "external_link"
}
```

### Implementation

#### 1. Tracking Script Location
- File: `/js/meta-companion-tracking.js`
- Loaded on: All HTML pages (automatically added before `</body>`)

#### 2. Tracked Elements
The script automatically tracks clicks on **ALL external links**:
- Any link with `target="_blank"` and `href` starting with "http"
- This includes companion website links, affiliate links, and any other external links
- Works with both static and dynamically loaded content

#### 3. How It Works

```javascript
// When a user clicks a tracked link:
fbq('trackCustom', 'CompanionExternalClick', {
  companion_name: 'Secrets AI',
  companion_url: 'https://www.secrets.ai/browse?fpr=companionguide',
  page_location: '/companions/secrets-ai',
  button_type: 'Visit Website',
  companion_slug: 'secrets-ai'
});
```

## Testing

### Test Page
Open `/test-meta-tracking.html` in your browser to test the tracking:

1. Open browser DevTools Console (F12)
2. Click any "Visit Website" button
3. Verify console output shows: "Meta Pixel: CompanionExternalClick tracked"
4. Check Meta Events Manager for the event

### Verification Steps

1. **Local Testing:**
   - Open any page with companion links
   - Open browser console
   - Click a companion link
   - Look for: `Meta Pixel: CompanionExternalClick tracked`

2. **Meta Events Manager:**
   - Go to: https://business.facebook.com/events_manager2
   - Select your Pixel (1384707780100464)
   - Click "Test Events" tab
   - Verify `CompanionExternalClick` events appear

3. **Check Event Parameters:**
   - In Events Manager, click on an event
   - Verify all parameters are captured correctly

## Using the Event Data

### 1. Create Custom Audiences

In Meta Ads Manager:
1. Go to Audiences
2. Create Audience → Custom Audience
3. Choose "Website"
4. Select your Pixel
5. Add condition: `Custom Event = CompanionExternalClick`
6. (Optional) Refine by companion_name, companion_slug, etc.

### 2. Track Conversions

The event appears in:
- **Ads Manager** → Columns → Customize Columns → Custom Conversions
- **Events Manager** → Custom Conversions
- **Analytics** → Event Source Groups

### 3. Optimize Campaigns

Use `CompanionExternalClick` to:
- Measure which companions get the most clicks
- Calculate conversion rates
- Build lookalike audiences
- Optimize ad delivery
- A/B test different companions

### 4. Create Custom Conversions

1. Go to Events Manager
2. Click "Custom Conversions"
3. Create New Custom Conversion
4. Select `CompanionExternalClick` as the event
5. Add filters (e.g., companion_name = "Secrets AI")
6. Name it (e.g., "Secrets AI Clicks")
7. Use in campaigns for optimization

## Advanced Filtering

### Filter by Companion

Track specific companions:
```javascript
// In Events Manager, filter by:
companion_name equals "Secrets AI"
// or
companion_slug equals "secrets-ai"
```

### Filter by Page

Track clicks from specific pages:
```javascript
// Filter by:
page_location contains "/companions/"
// or
page_location equals "/index.html"
```

### Combine Filters

Example: Track Secrets AI clicks from homepage only:
```javascript
companion_name equals "Secrets AI" AND page_location equals "/"
```

## Reporting

### Available Metrics

In Meta Ads Manager, you can view:
- Total CompanionExternalClick events
- Events by companion_name
- Events by page_location
- Events by campaign/ad set/ad
- Cost per CompanionExternalClick
- Return on ad spend (ROAS)

### Custom Reports

Create custom reports showing:
1. Which companions drive most external clicks
2. Which pages have highest click-through rates
3. Which ads lead to most companion visits
4. Conversion funnel from ad view → click → external visit

## Troubleshooting

### Event Not Firing

1. **Check Console:**
   - Open DevTools Console
   - Look for error messages
   - Verify: "Meta Companion Tracking: X links initialized"

2. **Verify Script Loaded:**
   ```javascript
   // In console, check:
   document.querySelector('script[src*="meta-companion-tracking.js"]')
   // Should return the script element
   ```

3. **Check Meta Pixel:**
   ```javascript
   // In console, check:
   typeof fbq
   // Should return: "function"
   ```

### Event Not in Events Manager

1. **Check Test Events:**
   - Use browser extension: Meta Pixel Helper
   - Or use Events Manager → Test Events
   - Click a link and verify it appears

2. **Verify Pixel ID:**
   - Check that pixel ID `1384707780100464` is correct
   - Verify in Events Manager settings

### Dynamic Content Issues

For dynamically loaded content (e.g., from Airtable):
- The script uses MutationObserver
- Automatically tracks new links added to the page
- No additional configuration needed

## Files Modified

All HTML files have been updated with the tracking script:
- `/js/meta-companion-tracking.js` - Main tracking script
- All `*.html` files - Include the tracking script

## Maintenance

### Adding New Pages

New HTML pages automatically get tracking if they:
1. Include the Meta Pixel base code
2. Include `/js/meta-companion-tracking.js` before `</body>`

Or run the setup script:
```bash
./add-meta-tracking.sh
```

### Updating Tracking Logic

To modify what gets tracked, edit:
- `/js/meta-companion-tracking.js`
- Update the selector in `trackCompanionLinks()` function

## Best Practices

1. **Always test** new implementations in Test Events first
2. **Use descriptive names** for custom conversions
3. **Document** any changes to event parameters
4. **Monitor** event volume regularly
5. **Archive** old custom conversions when no longer used

## Support Resources

- **Meta Events Manager:** https://business.facebook.com/events_manager2
- **Meta Pixel Documentation:** https://developers.facebook.com/docs/meta-pixel
- **Custom Events Guide:** https://developers.facebook.com/docs/meta-pixel/reference#custom-events
- **Test Page:** `/test-meta-tracking.html`

## Questions?

For issues or questions about the tracking implementation, check:
1. Browser console for error messages
2. Meta Pixel Helper browser extension
3. Events Manager → Diagnostics
4. This documentation file
