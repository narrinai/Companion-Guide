# Create "Best [Category] AI Companions" Article

Create a comprehensive "Best X AI Companions 2025" blog article based on an existing category page ranking.

## Input: $ARGUMENTS

The user provides:
- Category name (e.g., "Anime", "Voice", "Porn", "Girlfriend", "Roleplay")
- Category URL slug (e.g., "ai-anime-companions", "ai-voice-companions")
- Optional: Header image path (default: use screenshot from top-ranked companion)
- Optional: Number of companions to feature (default: 10)

## Complete Workflow

### STEP 1: Research the Category

1. Check the category page at `/categories/[category-slug].html` to understand the category
2. Look at existing "Best" articles for structure reference:
   - `/news/top-ai-voice-companions-2025.html`
   - `/news/best-ai-porn-companions-2025.html`
   - `/news/best-ai-anime-companions-2025.html`
3. Identify the top companions from the category (via Airtable or category page)
4. **IMPORTANT**: The category tag in Airtable determines which companions appear in rankings

### STEP 2: Create the Article

Create `/news/best-[category-slug]-2025.html` with this structure:

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <!-- Meta tags: title, description, keywords -->
    <!-- Open Graph & Twitter cards with header image -->
    <!-- Canonical URL -->
    <!-- Schema.org Article markup with current date -->
    <!-- Standard CSS: style.css, floating-cta.css, article-styles.css -->
    <!-- Analytics: gtag + Meta Pixel -->
</head>
<body>
    <header><!-- Standard nav with language switcher --></header>

    <section class="article-hero">
        <!-- Breadcrumb: Home → News → Article Title -->
        <!-- Publish date & read time -->
        <h1>Top [N] AI [Category] Companions in 2025</h1>
        <h2>Subtitle describing the category benefits</h2>
        <p class="hero-description">Introduction paragraph</p>
        <div class="hero-image"><img src="[header-image]" alt="..."></div>
    </section>

    <main class="article-main">
        <div class="container">
            <div class="article-layout">
                <aside class="toc-sidebar">
                    <!-- Table of Contents with numbered sections -->
                    <!-- Reading progress bar -->
                </aside>

                <article class="article-content">
                    <!-- Key Takeaways Box -->
                    <div class="key-takeaways">
                        <h3>🎯 Key Takeaways</h3>
                        <ul>
                            <li><strong>Top Rated:</strong> ...</li>
                            <li><strong>Best Value/Free:</strong> ...</li>
                            <li><strong>Key Features:</strong> ...</li>
                            <li>...</li>
                        </ul>
                    </div>

                    <!-- Section 1: Overview & Rankings (DYNAMIC from Airtable) -->
                    <section id="overview">
                        <h2>🏆 AI [Category] Companion Rankings 2025</h2>
                        <p class="category-link"><a href="/categories/[slug]">Browse all →</a></p>
                        <p>Introduction explaining the category...</p>
                        <p>Our evaluation criteria:</p>
                        <ul><!-- Criteria list --></ul>
                        <div id="top-companions-ranking">
                            <!-- DYNAMIC: Rankings loaded from Airtable -->
                            <div class="loading-message">Loading top companions...</div>
                        </div>
                    </section>

                    <!-- Section 2: Quick Picks -->
                    <!-- IMPORTANT: Only include companions with rating >= 8.5/10 -->
                    <section id="top-picks">
                        <h2>🎯 Quick Picks by Category</h2>
                        <div class="recommendation-grid">
                            <div class="rec-item">
                                <h4>🏆 Best Overall: <a href="/companions/[slug]">[Name]</a></h4>
                                <p>Description</p>
                            </div>
                            <!-- 3-4 more rec-items for Best Art/Best Free/Best NSFW/etc -->
                            <!-- ONLY companions with rating >= 8.5/10 should appear here -->
                        </div>
                    </section>

                    <!-- Sections 3-N+2: Individual Platform Reviews -->
                    <!-- IMPORTANT: section id MUST match companion slug for dynamic updates -->
                    <section class="content-section platform-review" id="[companion-slug]">
                        <div class="platform-header">
                            <div class="platform-rank">#[N]</div>
                            <div class="platform-title-section">
                                <h2><a href="/companions/[slug]">[Name]</a> - [Tagline]</h2>
                                <div class="platform-rating">
                                    <!-- DYNAMIC: Rating updated from Airtable -->
                                    <span class="rating-badge dynamic-rating" data-slug="[slug]">X.X/10</span>
                                    <span class="category-badge">[Badge1]</span>
                                    <span class="category-badge">[Badge2]</span>
                                </div>
                            </div>
                        </div>
                        <!-- DYNAMIC: nsfw-blur class added/removed based on is_uncensored field in Airtable -->
                        <div class="platform-image">
                            <img src="/images/screenshots/[image]" alt="..." loading="lazy">
                            <!-- nsfw-overlay added dynamically if is_uncensored=true in Airtable -->
                        </div>
                        <p class="lead-paragraph">Opening summary...</p>
                        <h3>Category-Specific Heading</h3>
                        <p>Detailed review content...</p>
                        <h3>Key Features</h3>
                        <p>Features overview...</p>
                        <h3>Pricing</h3>
                        <p>Pricing information...</p>
                        <div class="platform-cta">
                            <!-- DYNAMIC: href updated from website_url in Airtable -->
                            <a href="[affiliate-url]" class="btn-primary">Try [Name] →</a>
                            <a href="/companions/[slug]" class="btn-secondary">Read Full Review</a>
                        </div>
                    </section>
                    <!-- Repeat for each companion -->

                    <!-- Comparison Table Section (DYNAMIC) -->
                    <section id="comparison">
                        <h2>📊 [Category] Companion Comparison</h2>
                        <div class="comparison-table-wrapper">
                            <table class="comparison-table">
                                <thead>
                                    <tr>
                                        <th>Platform</th>
                                        <th>Rating</th>
                                        <th>NSFW</th>
                                        <th>Free Tier</th>
                                        <th>Best For</th>
                                    </tr>
                                </thead>
                                <!-- DYNAMIC: tbody populated from Airtable -->
                                <tbody></tbody>
                            </table>
                        </div>
                    </section>

                    <!-- Category-Specific Info Section -->
                    <section id="[category]-features">
                        <h2>🎨 What Makes Great [Category] AI</h2>
                        <p>Educational content about the category...</p>
                        <h3>Subheading 1</h3>
                        <p>Details...</p>
                        <!-- More subheadings -->
                    </section>

                    <!-- How to Choose Section -->
                    <section id="how-to-choose">
                        <h2>🤔 How to Choose Your [Category] Companion</h2>
                        <h3>For [Use Case 1]</h3>
                        <p>Recommendations...</p>
                        <!-- More use cases -->
                    </section>

                    <!-- FAQ Section -->
                    <section class="faq-section" id="faq">
                        <h2>❓ Frequently Asked Questions</h2>
                        <div class="faq-grid">
                            <div class="faq-item">
                                <h3>Question 1?</h3>
                                <p>Answer...</p>
                            </div>
                            <!-- 9 more FAQ items (10 total) -->
                        </div>
                    </section>
                </article>
            </div>
        </div>
    </main>

    <!-- Last Updated -->
    <div class="last-updated">
        <p>Last updated: <span id="last-updated-date"></span></p>
    </div>

    <footer><!-- Standard footer with related guides --></footer>

    <!-- Scripts -->
    <script src="/js/i18n.js"></script>
    <script src="/script.js"></script>
    <script src="/js/companions.js"></script>
    <script src="/js/companion-manager.js"></script>
    <script src="/js/floating-cta.js"></script>
    <script src="/js/meta-companion-tracking.js"></script>
    <script src="/js/ga-external-tracking.js"></script>

    <script>
        // DYNAMIC COMPANION RANKING FROM AIRTABLE
        // This script loads companions dynamically based on category tags in Airtable
        document.addEventListener('DOMContentLoaded', async function() {
            if (typeof window.companionManager === 'undefined') {
                window.companionManager = new CompanionManager();
            }

            const manager = window.companionManager;
            const CATEGORY_TAG = '[category-tag]'; // e.g., 'anime', 'voice', 'porn'

            try {
                // Fetch all companions sorted by rating
                const companions = await manager.fetchCompanions({ sort: 'rating' });

                // Filter companions that have the category tag and sort by rating
                const categoryCompanions = companions
                    .filter(c => c.categories && c.categories.some(cat =>
                        cat.toLowerCase().includes(CATEGORY_TAG)
                    ))
                    .sort((a, b) => (b.rating || 0) - (a.rating || 0))
                    .slice(0, 10); // Top 10 companions

                console.log(`${CATEGORY_TAG} companions from Airtable:`, categoryCompanions.map(c => `${c.name} (${c.rating})`));

                // Update dynamic ratings throughout the page
                document.querySelectorAll('.dynamic-rating').forEach(el => {
                    const slug = el.dataset.slug;
                    const companion = companions.find(c => c.slug === slug);
                    if (companion) {
                        el.textContent = `${companion.rating}/10`;
                    }
                });

                // DYNAMIC NSFW BLUR based on is_uncensored field from Airtable
                document.querySelectorAll('.platform-image').forEach(el => {
                    const section = el.closest('.platform-review');
                    if (section) {
                        const sectionId = section.id;
                        const companion = companions.find(c => c.slug === sectionId);
                        if (companion) {
                            // Add or remove nsfw-blur based on is_uncensored
                            if (companion.is_uncensored === true) {
                                el.classList.add('nsfw-blur');
                                // Add overlay if not present
                                if (!el.querySelector('.nsfw-overlay')) {
                                    const overlay = document.createElement('div');
                                    overlay.className = 'nsfw-overlay';
                                    overlay.innerHTML = `
                                        <svg class="nsfw-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                                            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                                        </svg>
                                        <span>18+</span>
                                    `;
                                    el.appendChild(overlay);
                                }
                            } else {
                                el.classList.remove('nsfw-blur');
                                const existingOverlay = el.querySelector('.nsfw-overlay');
                                if (existingOverlay) existingOverlay.remove();
                            }
                        }
                    }
                });

                // Render ranking container with dynamic data
                const rankingContainer = document.getElementById('top-companions-ranking');
                if (rankingContainer && categoryCompanions.length > 0) {
                    rankingContainer.innerHTML = `
                        <div class="ranking-list">
                            ${categoryCompanions.map((companion, index) => `
                                <div class="ranking-item">
                                    <div class="rank-number">#${index + 1}</div>
                                    <img src="${companion.logo_url || '/images/logos/default.png'}" alt="${companion.name}" class="rank-logo">
                                    <div class="rank-info">
                                        <h3><a href="/companions/${companion.slug}">${companion.name}</a></h3>
                                        <div class="rank-rating">
                                            ${manager.generateStarRating(companion.rating)}
                                            <span class="rating-score">${companion.rating}/10</span>
                                        </div>
                                        <p>${companion.tagline || companion.short_description || companion.description || ''}</p>
                                    </div>
                                    <div class="card-actions">
                                        <a href="#${companion.slug}" class="btn-secondary">Read Review →</a>
                                        <a href="${companion.website_url}" target="_blank" rel="noopener noreferrer" class="btn-primary">Visit Website</a>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    `;
                }

                // Update comparison table with dynamic data
                const comparisonTable = document.querySelector('#comparison .comparison-table tbody');
                if (comparisonTable && categoryCompanions.length > 0) {
                    comparisonTable.innerHTML = categoryCompanions.map(companion => {
                        const hasNSFW = companion.is_uncensored || (companion.categories &&
                            (companion.categories.includes('nsfw') || companion.categories.includes('porn')));
                        const hasFreeTier = (() => {
                            if (!companion.pricing_plans) return true;
                            try {
                                const plans = typeof companion.pricing_plans === 'string'
                                    ? JSON.parse(companion.pricing_plans)
                                    : companion.pricing_plans;
                                return plans.some(p => p.price === 0 || p.price === '0' || p.price === 'Free');
                            } catch { return true; }
                        })();

                        return `
                            <tr>
                                <td><a href="/companions/${companion.slug}">${companion.name}</a></td>
                                <td class="dynamic-rating" data-slug="${companion.slug}">${companion.rating}/10</td>
                                <td>${hasNSFW ? 'Yes' : 'Limited'}</td>
                                <td>${hasFreeTier ? 'Yes' : 'Limited'}</td>
                                <td>${companion.best_for || 'General use'}</td>
                            </tr>
                        `;
                    }).join('');
                }

                // Update "Visit Website" links with affiliate URLs from Airtable
                categoryCompanions.forEach(companion => {
                    if (companion && companion.slug && companion.website_url) {
                        const section = document.getElementById(companion.slug);
                        if (section) {
                            const visitButton = section.querySelector('.platform-cta .btn-primary');
                            if (visitButton) {
                                visitButton.href = companion.website_url;
                            }
                        }
                    }
                });

                // Load footer companions
                await manager.renderFooterFeaturedCompanions('featured-companions-footer');

            } catch (error) {
                console.error('Error loading companion data:', error);
            }
        });

        // Reading progress
        window.addEventListener('scroll', function() {
            const article = document.querySelector('.article-content');
            if (!article) return;
            const articleTop = article.offsetTop;
            const articleHeight = article.offsetHeight;
            const windowHeight = window.innerHeight;
            const scrolled = window.scrollY - articleTop + windowHeight;
            const progress = Math.min(Math.max(scrolled / articleHeight * 100, 0), 100);
            const progressBar = document.getElementById('reading-progress');
            if (progressBar) progressBar.style.width = progress + '%';
        });

        // Smooth scroll for TOC
        document.querySelectorAll('.toc-link').forEach(link => {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            });
        });
    </script>
    <script src="/js/article-last-updated.js"></script>
</body>
</html>
```

### STEP 3: Add to news.html and index.html

Add the article as the FIRST item in both files:

**news.html** (inside `<div class="news-grid">`):
```html
<article class="news-card featured">
    <div class="news-badge">Latest</div>
    <div class="news-source">CompanionGuide.ai</div>
    <h3><a href="/news/best-[slug]-2025">Top [N] AI [Category] Companions 2025 - [Subtitle]</a></h3>
    <p>Description of the article...</p>
    <div class="news-meta">
        <span class="date">[Current Date]</span>
        <span class="category">Platform Guide</span>
    </div>
</article>
```

**index.html** (inside `<div class="news-grid">`):
Same structure as above.

### STEP 4: Create Redirect Pages

Create redirect pages for NL, DE, PT that redirect to the English article:

For each language (`nl`, `de`, `pt`), create:
`/[lang]/news/best-[slug]-2025.html`

```html
<!DOCTYPE html>
<html lang="[lang]">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="refresh" content="0; url=/news/best-[slug]-2025">
    <link rel="canonical" href="https://companionguide.ai/news/best-[slug]-2025">
    <title>Redirecting to Best AI [Category] Companions 2025...</title>
</head>
<body>
    <p>Redirecting to <a href="/news/best-[slug]-2025">Best AI [Category] Companions 2025</a>...</p>
</body>
</html>
```

### STEP 5: Verify

1. Show the local URL to test: `http://localhost:8888/news/best-[slug]-2025`
2. List all created files
3. Remind to run `netlify dev` to test locally

## Key Implementation Notes

### Dynamic Rankings from Airtable
- Rankings are loaded dynamically based on the **category tag** in Airtable
- Companions are sorted by rating (highest first)
- The JavaScript filters companions that have the matching category in their `categories` array

### Dynamic NSFW Blur from Airtable
- The `is_uncensored` field in Airtable determines if the blur is applied
- If `is_uncensored === true`: adds `nsfw-blur` class and overlay
- If `is_uncensored === false` or not set: removes blur
- **IMPORTANT**: Do NOT hardcode `nsfw-blur` class in HTML - it's applied dynamically

### Section IDs Must Match Companion Slugs
- Each platform review section's `id` attribute MUST match the companion's slug in Airtable
- Example: `<section class="platform-review" id="ehentai-ai">` for eHentai AI
- This enables dynamic updates for:
  - NSFW blur
  - Visit Website button href
  - Rating badge

### Comparison Table
- The `<tbody>` is populated dynamically from Airtable data
- Shows: Platform name, Rating, NSFW availability, Free tier, Best For

## Content Guidelines

### Writing Style
- Casual, expert tone
- First-person perspective where appropriate
- Specific examples and comparisons
- Honest pros/cons for each platform
- Natural transitions between sections

### NSFW Handling
- **Do NOT hardcode `nsfw-blur` class** - it's applied dynamically from Airtable
- The `is_uncensored` field in Airtable controls this
- Be clear about content policies in descriptions

### SEO
- Include category keywords naturally throughout
- Use proper heading hierarchy (H1 > H2 > H3)
- Write compelling meta description (~160 chars)
- Include internal links to companion pages and related articles

## Example Usage

```
/best-article Anime
- Category URL: ai-anime-companions
- Category tag for filtering: anime
- Header image: /images/screenshots/ehentai-ai-review-image-gallery-1.png
- Companions: 10 (filtered from Airtable by anime category)
```

```
/best-article Girlfriend
- Category URL: ai-girlfriend-companions
- Category tag for filtering: ai-girlfriend
- Header image: /images/screenshots/candy-ai.png
- Companions: 10 (filtered from Airtable by ai-girlfriend category)
```

## Critical Rules

### 1. Rankings Must Match Airtable
- The top 10 companions in the article MUST match the dynamic ranking from Airtable
- The dynamic ranking box at the top shows the true Airtable ranking
- Individual platform reviews MUST be in the same order as the dynamic ranking
- Do NOT include companions that don't have the category tag in Airtable

### 2. Quick Picks Rating Requirement
- **Quick Picks section MUST only include companions with rating >= 8.5/10**
- Check companion ratings in Airtable before including in Quick Picks
- It's okay to be selective - don't include low-rated companions just to fill spots

### 3. Do NOT Invent Companions
- **NEVER mention companions that don't exist on CompanionGuide.ai**
- All companion slugs must exist in Airtable
- Verify companion exists by checking `/companions/[slug].html` or Airtable

### 4. Image Paths Must Be Correct
- Verify screenshot paths exist before using them
- Common patterns: `/images/screenshots/[slug]-image-1.png` or `/images/screenshots/[slug]-review.png`
- Use `Glob` to find available screenshots for a companion

### 5. Body Text Must Match Rankings
- Platform review sections must be in order matching the dynamic ranking
- If Airtable ranking changes, the hardcoded platform reviews may become out of sync
- Section IDs must match companion slugs exactly

## Checklist

- [ ] Article HTML created at `/news/best-[slug]-2025.html`
- [ ] JavaScript uses correct category tag for filtering (e.g., 'anime', 'voice', 'porn')
- [ ] Section IDs match companion slugs in Airtable
- [ ] Platform review order matches Airtable ranking order
- [ ] Comparison table tbody is empty (populated dynamically)
- [ ] No hardcoded `nsfw-blur` classes (applied dynamically from is_uncensored field)
- [ ] Quick Picks only include companions with rating >= 8.5/10
- [ ] All mentioned companions exist on CompanionGuide.ai
- [ ] All screenshot paths verified to exist
- [ ] Article added to `news.html` as first item
- [ ] Article added to `index.html` as first item
- [ ] Redirect page created for NL
- [ ] Redirect page created for DE
- [ ] Redirect page created for PT
- [ ] Verify header image exists
- [ ] Local test URL provided
