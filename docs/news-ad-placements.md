# News Page Ad Placements Overview

## Summary

The news.html page contains **6 identical OurDream AI advertisement placements**, inserted between news articles at regular intervals (approximately every 5 articles).

---

## Placement Details

| # | Element ID | Position | Appears After Article |
|---|------------|----------|----------------------|
| 1 | `news-ad-ourdream-1` | After article 5 | "Character.AI Bans Minors Following Wave of Teen Suicide Lawsuits" |
| 2 | `news-ad-ourdream-2` | After article 12 | "Best Crushon AI Alternatives 2025" |
| 3 | `news-ad-ourdream-3` | After article 18 | "Best Candy.AI Alternatives 2025" |
| 4 | `news-ad-ourdream-4` | After article 23 | "My Complete Hammer AI Experience After 4 Weeks" |
| 5 | `news-ad-ourdream-5` | After article 28 | "My Brutally Honest Replika AI Review After 7 Weeks" |
| 6 | `news-ad-ourdream-6` | After article 33 | "AI App Replika Accused of Deceptive Marketing" |

---

## Ad Content Structure

All 6 placements share the same structure and content:

### Visual Elements
- **Badge**: "Spotlight" (uses `.spotlight-badge` class)
- **Logo**: `/images/logos/ourdream-ai.png`
- **Video**: `/videos/950x250-ourdream-ai-video-companionguide-v2.mp4`
  - Autoplay enabled
  - Loop enabled
  - Muted
  - Playsinline for mobile

### Content
- **Advertiser**: OurDream AI
- **Rating**: 9.6/10 with 5 stars (★★★★★)
- **Description**: "Best for: NSFW AI sex chat, adult content creation & explicit videos"

### Call-to-Action Buttons
| Button | Class | Text | Link |
|--------|-------|------|------|
| Primary | `.ad-btn-primary` | "Try OurDream AI" | https://ourdream.ai/?via=companionguide |
| Secondary | `.ad-btn-secondary` | "Visit Website" | https://ourdream.ai/?via=companionguide |

### Internal Links
- Companion page link: `/companions/ourdream-ai`

---

## Element ID Naming Convention

Each placement uses numbered IDs for tracking purposes:

```
ourdream-logo-{n}
ourdream-name-{n}
ourdream-stars-{n}
ourdream-rating-{n}
ourdream-video-link-{n}
ourdream-best-for-{n}
ourdream-btn-primary-{n}
ourdream-btn-secondary-{n}
```

Where `{n}` = 1-6

---

## CSS Classes Used

- `.news-card` - Base card styling
- `.news-ad-card` - Ad-specific card styling
- `.spotlight-badge` - Badge styling for "Spotlight" label
- `.ad-header` - Header container with logo and title
- `.ad-logo` - Logo image styling
- `.ad-title-section` - Title and rating container
- `.ad-companion-name` - Companion name link styling
- `.ad-rating-line` - Rating display container
- `.ad-stars` - Star rating styling
- `.ad-rating-score` - Numeric rating styling
- `.ad-video-link` - Video link wrapper
- `.ad-video-news` - Video element styling
- `.ad-description` - Description text styling
- `.ad-actions` - Button container
- `.ad-btn-primary` - Primary CTA button
- `.ad-btn-secondary` - Secondary CTA button

---

## Affiliate Tracking

All external links use the affiliate parameter: `?via=companionguide`

---

*Last updated: December 2025*
