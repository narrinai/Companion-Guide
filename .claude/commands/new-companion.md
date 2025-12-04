# Create New AI Companion Page

Create a complete new AI companion page with all translations and Airtable records.

## Input: $ARGUMENTS

The user provides companion details like:
- Name (e.g., "Replika AI")
- Website URL with affiliate link
- Rating (e.g., 8.5)
- Categories (e.g., ai-girlfriend, nsfw, voice)
- Brief description
- Pricing tiers
- Key features
- Pros and cons

## Complete Workflow

### STEP 1: Create Airtable Records

#### 1.1 Create Main Companion Record (Table: tblFxeZtNIL06jfX5)

Create a POST request to create the main companion record with these fields:

```json
{
  "fields": {
    "id": "[Companion Name]",
    "name": "[Companion Name]",
    "slug": "[companion-slug]",
    "description": "[Brief description ~150 chars]",
    "tagline": "[Short tagline ~80 chars]",
    "rating": [number 1-10],
    "review_count": 0,
    "logo_url": "/images/logos/[slug]-review-companionguide.png",
    "website_url": "[Full URL with affiliate params]",
    "categories": ["category1", "category2"],
    "badges": ["Featured"],
    "is_featured": true,
    "status": "Active",
    "is_month": true,
    "best_for": "[Best for description]",
    "features": "[{\"icon\":\"💖\",\"title\":\"Feature 1\",\"description\":\"Description\"},{\"icon\":\"🎭\",\"title\":\"Feature 2\",\"description\":\"Description\"},{\"icon\":\"🧠\",\"title\":\"Feature 3\",\"description\":\"Description\"},{\"icon\":\"🎬\",\"title\":\"Feature 4\",\"description\":\"Description\"}]",
    "pricing_plans": "\"[{\\\"name\\\":\\\"Free Plan\\\",\\\"price\\\":0,\\\"period\\\":\\\"free\\\",\\\"features\\\":[\\\"Feature 1\\\",\\\"Feature 2\\\",\\\"❌ Locked Feature\\\"]},{\\\"name\\\":\\\"Premium Plan\\\",\\\"price\\\":9.99,\\\"period\\\":\\\"monthly\\\",\\\"features\\\":[\\\"All features\\\",\\\"Premium support\\\"]}]\"",
    "gallery_images": "[\n    {\"url\": \"/images/screenshots/[slug]-image-1.webp\", \"alt\": \"[Name] Screenshot 1\"},\n    {\"url\": \"/images/screenshots/[slug]-image-2.webp\", \"alt\": \"[Name] Screenshot 2\"},\n    {\"url\": \"/images/screenshots/[slug]-image-3.webp\", \"alt\": \"[Name] Screenshot 3\"}\n  ]"
  }
}
```

Save the returned record ID (e.g., `recXXXXXXXXXXXXX`).

#### 1.2 Create Translation Records (Table: tblTYIfn48xFMPTcl)

Create 4 records - one for each language (en, nl, de, pt). Each links to the main companion record.

For EACH language, create a record with:

```json
{
  "fields": {
    "companion": ["[main_record_id]"],
    "language": "[en|nl|de|pt]",
    "description": "[Translated description]",
    "best_for": "[Translated best_for]",
    "tagline": "[Translated tagline]",
    "meta_title": "[Name] Review - CompanionGuide.ai",
    "meta_description": "[Translated meta description ~160 chars]",
    "pros_cons": "{\n  \"pros\": [\n    \"Pro 1\",\n    \"Pro 2\",\n    \"Pro 3\"\n  ],\n  \"cons\": [\n    \"Con 1\",\n    \"Con 2\"\n  ]\n}",
    "pricing_plans": "[Same JSON as main but with translated plan names if needed]",
    "my_verdict": "[Extended verdict 15,000-20,000 chars - see below]"
  }
}
```

### STEP 2: Generate Extended Verdict (my_verdict)

Write an extensive personal review (~15,000-20,000 characters) in this style:

**Structure:**
1. Opening Summary (2-3 paragraphs) - What it delivers, who it's for
2. "My X-Week Experience with [Platform]" header
3. Week 1: First Impressions - Signup, interface, initial exploration
4. Week 2: Deeper Exploration - Premium features, customization
5. Week 3: Community & Ecosystem - Users, content quality
6. Week 4+: Advanced Features - Power user capabilities
7. Final Assessment - Edge cases, limitations
8. Value Assessment - Pricing comparison to competitors
9. Final Thoughts - Rating justification

**Rules:**
- Casual, first-person conversational tone
- Include specific examples and anecdotes
- Be honest about pros and cons
- DO NOT include pros/cons bullet list at the end
- End with: "With a X.X/10 rating, [Platform] excels in..."

**Translate to NL, DE, PT:**
- Keep brand names in English
- Keep technical terms (API, AI, NSFW) in English
- Keep ratings and pricing format unchanged

### STEP 3: Create HTML Pages

Create 4 HTML files based on the Secrets AI template:

1. `/companions/[slug].html` (English)
2. `/nl/companions/[slug].html` (Dutch)
3. `/de/companions/[slug].html` (German)
4. `/pt/companions/[slug].html` (Portuguese)

**Key elements to include:**

```html
<!DOCTYPE html>
<html lang="[en|nl|de|pt]">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>[Name] Review 2025 - CompanionGuide.ai</title>
    <meta name="description" content="[Meta description]">
    <meta name="keywords" content="[Name], [Name] review, AI companion...">
    <link rel="canonical" href="https://companionguide.ai/companions/[slug]">

    <!-- Hreflang tags for all 4 languages -->
    <link rel="alternate" hreflang="en" href="https://companionguide.ai/companions/[slug]">
    <link rel="alternate" hreflang="nl" href="https://companionguide.ai/nl/companions/[slug]">
    <link rel="alternate" hreflang="de" href="https://companionguide.ai/de/companions/[slug]">
    <link rel="alternate" hreflang="pt" href="https://companionguide.ai/pt/companions/[slug]">
    <link rel="alternate" hreflang="x-default" href="https://companionguide.ai/companions/[slug]">

    <!-- Open Graph / Twitter meta tags -->
    <!-- Structured Data (Review schema) -->
    <!-- Standard CSS includes -->
    <link rel="stylesheet" href="../style.css">
    <link rel="stylesheet" href="/css/companion-floating-cta.css">
    <link rel="stylesheet" href="/css/companion-gallery.css">

    <!-- Analytics (gtag + Meta Pixel) -->
</head>
<body>
    <header><!-- Standard nav with language switcher --></header>

    <main class="container">
        <section class="companion-hero"><!-- Logo, title, rating, tagline, visit button --></section>
        <section class="quick-facts"><!-- Pricing, Best For, Platform, Content Policy --></section>
        <section class="overview"><!-- What is [Name]? + dynamic features --></section>
        <section class="pricing"><!-- Pricing tiers grid --></section>
        <section class="companion-gallery"><!-- Image gallery --></section>
        <section class="pros-cons"><!-- Pros & cons grid --></section>
        <section class="alternatives"><!-- Similar alternatives (dynamic) --></section>
        <section class="verdict"><!-- Our Verdict (loaded from Airtable) --></section>
        <section class="user-reviews"><!-- Reviews + submission form --></section>
        <section class="cta-section"><!-- Final CTA --></section>
    </main>

    <section class="faq-section"><!-- FAQ with schema markup --></section>
    <footer><!-- Standard footer --></footer>

    <!-- Standard JS includes -->
    <script src="../js/i18n.js"></script>
    <script src="../script.js"></script>
    <script src="../js/companions.js"></script>
    <script src="../js/companion-page.js"></script>
    <script src="../js/alternatives.js"></script>
    <script src="../js/companion-header.js"></script>
    <script src="/faq-interactions.js"></script>
    <script src="../js/review-names.js"></script>
    <script src="/js/companion-floating-cta.js"></script>
    <script src="/js/companion-gallery.js"></script>
</body>
</html>
```

**i18n data attributes to use:**
- `data-i18n="companion.pricingLabel"` - "Pricing"
- `data-i18n="companion.bestForLabel"` - "Best For"
- `data-i18n="companion.platformLabel"` - "Platform"
- `data-i18n="companion.contentPolicyLabel"` - "Content Policy"
- `data-i18n="companion.pricing"` - "Pricing" (section header)
- `data-i18n="companion.gallery"` - "Image Gallery"
- `data-i18n="companion.pros"` - "Pros & Cons"
- `data-i18n="companion.alternatives"` - "Similar Alternatives"
- `data-i18n="companion.verdict"` - "Our Verdict"
- `data-i18n="companion.reviews"` - "User Reviews"
- `data-i18n="companionCard.visitWebsite"` - "Visit Website"
- `data-i18n="pricing.perMonth"` - "/month"

### STEP 4: Create Logo Image

Remind user to add logo image at:
`/images/logos/[slug]-review-companionguide.png`

### STEP 5: Add Gallery Screenshots (Optional)

If screenshots are available, add them at:
- `/images/screenshots/[slug]-image-1.webp`
- `/images/screenshots/[slug]-image-2.webp`
- `/images/screenshots/[slug]-image-3.webp`

## Airtable API Reference

**Base ID:** `appUwBhZ6sR4Grnbg`
**Main Table (Companions):** `tblFxeZtNIL06jfX5`
**Translations Table:** `tblTYIfn48xFMPTcl`
**Token env var:** `AIRTABLE_TOKEN_CG`

**Create record:**
```bash
curl -X POST "https://api.airtable.com/v0/appUwBhZ6sR4Grnbg/[TABLE_ID]" \
  -H "Authorization: Bearer $AIRTABLE_TOKEN_CG" \
  -H "Content-Type: application/json" \
  -d '{"fields": {...}}'
```

**Update record:**
```bash
curl -X PATCH "https://api.airtable.com/v0/appUwBhZ6sR4Grnbg/[TABLE_ID]/[RECORD_ID]" \
  -H "Authorization: Bearer $AIRTABLE_TOKEN_CG" \
  -H "Content-Type: application/json" \
  -d '{"fields": {...}}'
```

## Valid Categories
- ai-girlfriend
- ai-boyfriend
- nsfw
- sfw
- voice
- video
- image-gen
- romantic
- roleplay
- character-creation
- free
- premium

## Example Usage

```
/new-companion Replika AI
- URL: https://replika.ai/?ref=companionguide
- Rating: 7.5
- Categories: ai-girlfriend, voice, sfw, romantic
- Description: AI companion focused on emotional support and meaningful conversations
- Pricing: Free tier, Pro $19.99/month
- Features: Voice calls, AR mode, Memory system, Personality customization
- Pros: Great for emotional support, Voice conversations, Strong memory
- Cons: Limited NSFW, Can feel repetitive, Expensive premium
```

## Checklist

- [ ] Main Airtable record created
- [ ] EN translation record created with extended verdict
- [ ] NL translation record created with translated verdict
- [ ] DE translation record created with translated verdict
- [ ] PT translation record created with translated verdict
- [ ] EN HTML page created at /companions/[slug].html
- [ ] NL HTML page created at /nl/companions/[slug].html
- [ ] DE HTML page created at /de/companions/[slug].html
- [ ] PT HTML page created at /pt/companions/[slug].html
- [ ] Logo image reminder sent
- [ ] Gallery images reminder sent (optional)
- [ ] Test locally with `netlify dev`
