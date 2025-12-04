# Event Tracking Registry

Central documentation for all tracking events on CompanionGuide.ai. Update this document when adding new events.

---

## Table of Contents

1. [Google Analytics 4 Events](#google-analytics-4-events)
2. [Meta Pixel Events](#meta-pixel-events)
3. [Ad Placement Events](#ad-placement-events)
4. [Ad Placements by Page](#ad-placements-by-page)

---

## Google Analytics 4 Events

**File:** `js/ga-external-tracking.js`

### 1. outbound_click

Tracks clicks on external links (affiliate links, companion websites).

| Parameter | Description | Example |
|-----------|-------------|---------|
| `event_category` | Always "outbound" | `outbound` |
| `event_label` | Unique link identifier | `candy_ai_hero_cta` |
| `link_text` | Button/link text | `Try Candy AI` |
| `link_url` | Full destination URL | `https://candy.ai/?ref=...` |
| `link_domain` | External domain | `candy.ai` |
| `page_location` | Source page path | `/companions/candy-ai` |
| `companion_name` | Companion name | `Candy AI` |
| `companion_slug` | Airtable slug | `candy-ai` |
| `companion_rating` | Rating (0-10) | `8.5` |
| `companion_categories` | Categories (comma-separated) | `AI Girlfriend, Image Generation` |
| `companion_is_featured` | Featured status | `true` |
| `companion_is_cotm` | Companion of the Month | `false` |
| `link_type` | Type of link | `hero_cta`, `pricing_cta`, `companion_card_link` |
| `link_position` | Position on page | `hero`, `pricing`, `alternatives`, `footer` |
| `pricing_tier` | Pricing tier (if applicable) | `Premium Plan` |
| `section_name` | Section heading | `Pricing Plans` |
| `value` | Conversion value | `1` |

---

### 2. form_submit

Tracks form submissions.

| Parameter | Description | Example |
|-----------|-------------|---------|
| `event_category` | Always "engagement" | `engagement` |
| `event_label` | Form name/ID | `contact_form` |
| `form_name` | Form identifier | `contactForm` |
| `page_location` | Page path | `/contact` |

---

### 3. scroll

Tracks scroll depth milestones (25%, 50%, 75%, 100%).

| Parameter | Description | Example |
|-----------|-------------|---------|
| `event_category` | Always "engagement" | `engagement` |
| `event_label` | Scroll percentage | `50%` |
| `scroll_depth` | Numeric depth | `50` |
| `page_location` | Page path | `/companions/replika` |

---

### 4. cta_click

Tracks internal CTA button clicks.

| Parameter | Description | Example |
|-----------|-------------|---------|
| `event_category` | Always "engagement" | `engagement` |
| `event_label` | Button text | `View All Companions` |
| `button_text` | Button text | `View All Companions` |
| `button_location` | Source page | `/` |
| `button_destination` | Destination URL | `/companions` |

---

### 5. page_view (Enhanced)

Enhanced page view with additional context.

| Parameter | Description | Example |
|-----------|-------------|---------|
| `page_title` | Document title | `Candy AI Review 2025` |
| `page_location` | Full URL | `https://companionguide.ai/companions/candy-ai` |
| `page_path` | Path only | `/companions/candy-ai` |
| `companion_slug` | Companion slug (if applicable) | `candy-ai` |
| `article_slug` | Article slug (if applicable) | `best-ai-girlfriends-2025` |
| `page_type` | Page type | `companion_detail`, `article` |

---

### 6. ad_click

Tracks advertisement clicks.

| Parameter | Description | Example |
|-----------|-------------|---------|
| `event_category` | Always "Advertisement" | `Advertisement` |
| `event_label` | Placement + click type | `news_feed - primary_button` |
| `companion_name` | Advertiser name | `OurDream AI` |
| `click_type` | Type of click | `primary_button`, `secondary_button`, `video`, `name_link` |
| `placement` | Ad placement location | `news_feed`, `category_page` |

---

### 7. newsletter_signup

Tracks newsletter subscriptions.

| Parameter | Description | Example |
|-----------|-------------|---------|
| `event_category` | Always "engagement" | `engagement` |
| `event_label` | Email address | `user@example.com` |

**File:** `js/newsletter-signup.js`

---

## Meta Pixel Events

### Standard Events

**File:** `js/meta-companion-tracking.js`

#### 1. ViewContent

Fires on companion detail pages and news articles.

| Parameter | Description | Example |
|-----------|-------------|---------|
| `content_name` | Companion/article name | `Replika AI` |
| `content_category` | Category | `AI Companion`, `Article` |
| `content_ids` | Array with slug | `['replika-ai']` |
| `content_type` | Content type | `product`, `article` |

---

#### 2. Search

Fires when user performs a search.

| Parameter | Description | Example |
|-----------|-------------|---------|
| `search_string` | Search query | `best ai girlfriend` |
| `content_category` | Always "AI Companion" | `AI Companion` |

---

### Standard Events (Form Tracking)

**File:** `js/meta-form-tracking.js`

#### 3. Lead

Fires on contact form and review form submissions.

| Parameter | Description | Example |
|-----------|-------------|---------|
| `content_name` | Form type | `Contact Form`, `Review Submission` |
| `content_category` | Subject/category | `general`, `User Review` |
| `status` | Submission status | `submitted` |
| `value` | Rating (reviews only) | `8` |

---

#### 4. CompleteRegistration

Fires on newsletter signups.

| Parameter | Description | Example |
|-----------|-------------|---------|
| `content_name` | Always "Newsletter Signup" | `Newsletter Signup` |
| `registration_method` | Signup source | `contact_form`, `newsletter_form` |
| `status` | Status | `subscribed` |

---

### Custom Events

**File:** `js/meta-companion-tracking.js`

#### 5. CompanionExternalClick

Fires on external link clicks.

| Parameter | Description | Example |
|-----------|-------------|---------|
| `companion_name` | Companion name | `Candy AI` |
| `companion_url` | Destination URL | `https://candy.ai` |
| `page_location` | Source page | `/companions/candy-ai` |
| `button_type` | Button text | `Try Candy AI` |
| `companion_slug` | Companion slug | `candy-ai` |
| `link_type` | Link context | `companion_page`, `companion_card`, `domain_link` |

---

**File:** `js/ad-tracking.js`

#### 6. AdClick

Fires on advertisement clicks.

| Parameter | Description | Example |
|-----------|-------------|---------|
| `companion_name` | Advertiser | `OurDream AI` |
| `placement` | Ad placement | `news_feed`, `category_page` |
| `click_type` | Click element | `primary_button`, `secondary_button`, `video`, `name_link` |
| `button_text` | Button text | `Try OurDream AI` |
| `destination_url` | Destination | `https://ourdream.ai/?via=companionguide` |
| `page_location` | Page path | `/news` |
| `page_url` | Full URL | `https://companionguide.ai/news` |

---

## Ad Placement Events

### Events Triggered on Ad Click

When a user clicks on an ad placement, the following events are fired:

| Event | Platform | Source File | Description |
|-------|----------|-------------|-------------|
| `outbound_click` | GA4 | `ga-external-tracking.js` | Tracks as external link (automatic) |
| `ad_click` | GA4 | `ad-tracking.js` | Ad-specific tracking with placement info |
| `CompanionExternalClick` | Meta | `meta-companion-tracking.js` | External link tracking (automatic) |
| `AdClick` | Meta | `ad-tracking.js` | Ad-specific custom event |

**Note:** The `outbound_click` and `CompanionExternalClick` events fire automatically because ad links use `target="_blank"` with external URLs. The ad-specific events (`ad_click`, `AdClick`) add additional context like placement type and click element.

---

### Current Active Advertisers

| Advertiser | Rating | Affiliate Link | Status |
|------------|--------|----------------|--------|
| OurDream AI | 9.6/10 | `https://ourdream.ai/?via=companionguide` | Active |

---

## Ad Placements by Page

### news.html

| # | Element ID | Position | After Article |
|---|------------|----------|---------------|
| 1 | `news-ad-ourdream-1` | After article 5 | "Character.AI Bans Minors Following Wave of Teen Suicide Lawsuits" |
| 2 | `news-ad-ourdream-2` | After article 12 | "Best Crushon AI Alternatives 2025" |
| 3 | `news-ad-ourdream-3` | After article 18 | "Best Candy.AI Alternatives 2025" |
| 4 | `news-ad-ourdream-4` | After article 23 | "My Complete Hammer AI Experience After 4 Weeks" |
| 5 | `news-ad-ourdream-5` | After article 28 | "My Brutally Honest Replika AI Review After 7 Weeks" |
| 6 | `news-ad-ourdream-6` | After article 33 | "AI App Replika Accused of Deceptive Marketing" |

**Ad content:** Video ad (950x250), "Try OurDream AI" CTA

---

### index.html (EN Homepage)

| # | Element ID | Position | Description |
|---|------------|----------|-------------|
| 1 | `news-ad-ourdream` | News section | Single ad placement in latest news grid |

---

### de/index.html (German Homepage)

| # | Element ID | Position | Description |
|---|------------|----------|-------------|
| 1 | `news-ad-ourdream` | News section | Single ad placement in latest news grid |

---

### nl/index.html (Dutch Homepage)

| # | Element ID | Position | Description |
|---|------------|----------|-------------|
| 1 | `news-ad-ourdream` | News section | Single ad placement in latest news grid |

---

### pt/index.html (Portuguese Homepage)

| # | Element ID | Position | Description |
|---|------------|----------|-------------|
| 1 | `news-ad-ourdream` | News section | Single ad placement in latest news grid |

---

## Ad Creative Specifications

### News Feed Ad Card (`.news-ad-card`)

| Element | Specification |
|---------|---------------|
| Badge | "Spotlight" with `.spotlight-badge` class |
| Logo | 48x48px, PNG format |
| Video | 950x250px, MP4, autoplay, loop, muted |
| Rating | Stars (★★★★★) + numeric (9.6/10) |
| Description | "Best for:" tagline |
| Primary CTA | `.ad-btn-primary` - "Try [Name]" |
| Secondary CTA | `.ad-btn-secondary` - "Visit Website" |

---

## Adding New Events

### Google Analytics 4

1. Add event in `js/ga-external-tracking.js`
2. Use `gtag('event', 'event_name', { parameters })`
3. Document in this file under GA4 Events section

### Meta Pixel

1. Add event in `js/meta-companion-tracking.js` or `js/meta-form-tracking.js`
2. Use `fbq('track', 'StandardEvent', { parameters })` or `fbq('trackCustom', 'CustomEvent', { parameters })`
3. Document in this file under Meta Pixel Events section

### New Ad Placement

1. Add HTML to target page using existing ad card structure
2. Assign unique ID following pattern: `news-ad-[advertiser]-[number]`
3. Update this file under "Ad Placements by Page" section
4. Tracking is automatic via `js/ad-tracking.js`

---

## Changelog

| Date | Change | Author |
|------|--------|--------|
| Dec 2025 | Initial documentation created | - |
| Dec 2025 | Added 6 OurDream AI placements to news.html | - |

---

*Last updated: December 2025*
