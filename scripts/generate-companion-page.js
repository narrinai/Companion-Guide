#!/usr/bin/env node

/**
 * Generate Companion Page Script
 *
 * This script generates a companion review page in the same structure as secrets-ai.html
 * by fetching data from Airtable and combining it with static content sections.
 *
 * Usage: node generate-companion-page.js <slug>
 * Example: node generate-companion-page.js nextpart-ai
 */

const Airtable = require('airtable');
const fs = require('fs');
const path = require('path');

// Configuration
require('dotenv').config();

// Try to load from .env, if not available, user must set these
const AIRTABLE_TOKEN = process.env.AIRTABLE_TOKEN_CG;
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID_CG;
const AIRTABLE_TABLE_ID = process.env.AIRTABLE_TABLE_ID_CG;

if (!AIRTABLE_TOKEN || !AIRTABLE_BASE_ID || !AIRTABLE_TABLE_ID) {
    console.error('\n❌ Missing Airtable credentials!');
    console.error('Please set the following environment variables:');
    console.error('  - AIRTABLE_TOKEN_CG');
    console.error('  - AIRTABLE_BASE_ID_CG');
    console.error('  - AIRTABLE_TABLE_ID_CG\n');
    console.error('You can set them temporarily with:');
    console.error('export AIRTABLE_TOKEN_CG=your_token');
    console.error('export AIRTABLE_BASE_ID_CG=your_base_id');
    console.error('export AIRTABLE_TABLE_ID_CG=your_table_id\n');
    process.exit(1);
}

// Initialize Airtable
const base = new Airtable({ apiKey: AIRTABLE_TOKEN }).base(AIRTABLE_BASE_ID);
const table = base(AIRTABLE_TABLE_ID);

/**
 * Fetch companion data from Airtable by slug
 */
async function fetchCompanionData(slug) {
    try {
        const records = await table.select({
            filterByFormula: `{slug} = '${slug}'`,
            maxRecords: 1
        }).firstPage();

        if (records.length === 0) {
            throw new Error(`No companion found with slug: ${slug}`);
        }

        const record = records[0];
        const fields = record.fields;

        return {
            id: record.id,
            name: fields.name || slug,
            slug: fields.slug || slug,
            tagline: fields.tagline || '',
            description: fields.description || '',
            rating: fields.rating || 8.0,
            website_url: fields.website_url || '',
            logo_url: fields.logo_url || `/images/logos/${slug}.png`,
            pricing_plans: fields.pricing_plans || '[]',
            features: fields.features || '[]',
            categories: fields.categories || [],
            is_featured: fields.is_featured || false,
            status: fields.status || 'Active'
        };
    } catch (error) {
        console.error('Error fetching from Airtable:', error);
        throw error;
    }
}

/**
 * Parse pricing plans and generate pricing summary
 */
function parsePricingPlans(pricingData) {
    try {
        const plans = typeof pricingData === 'string' ? JSON.parse(pricingData) : pricingData;

        if (!Array.isArray(plans) || plans.length === 0) {
            return {
                plans: [],
                summary: 'Pricing information available on website'
            };
        }

        // Find the cheapest plan
        const freePlan = plans.find(p => p.price === 'Free' || p.price === '$0');
        const paidPlans = plans.filter(p => p.price !== 'Free' && p.price !== '$0');

        let summary = '';
        if (freePlan) {
            summary = 'Free tier available';
            if (paidPlans.length > 0) {
                const cheapestPaid = paidPlans[0];
                summary += `, premium plans from ${cheapestPaid.price}`;
            }
        } else if (paidPlans.length > 0) {
            summary = `From ${paidPlans[0].price}`;
        }

        return {
            plans,
            summary
        };
    } catch (error) {
        console.error('Error parsing pricing plans:', error);
        return {
            plans: [],
            summary: 'Pricing information available on website'
        };
    }
}

/**
 * Parse features
 */
function parseFeatures(featuresData) {
    try {
        return typeof featuresData === 'string' ? JSON.parse(featuresData) : featuresData;
    } catch (error) {
        console.error('Error parsing features:', error);
        return [];
    }
}

/**
 * Generate pricing section HTML
 */
function generatePricingHTML(plans) {
    if (!plans || plans.length === 0) {
        return `
            <div class="pricing-tier">
                <h3>Visit Website for Pricing</h3>
                <p>Check the official website for current pricing plans and features</p>
            </div>
        `;
    }

    return plans.map((plan, index) => {
        const isFeatured = plan.featured || index === Math.floor(plans.length / 2);
        const badge = plan.badge || (isFeatured ? 'MOST POPULAR' : index === plans.length - 1 ? 'BEST VALUE' : '');

        let featuresHTML = '';
        if (plan.features && Array.isArray(plan.features)) {
            featuresHTML = plan.features.map(feature => {
                const included = feature.included !== false;
                const prefix = included ? '' : '❌ ';
                return `<li>${prefix}${feature.name || feature}</li>`;
            }).join('\n                        ');
        }

        return `
                <div class="pricing-tier${isFeatured ? ' featured' : ''}">
                    ${badge ? `<div class="tier-badge">${badge}</div>` : ''}
                    <h3>${plan.name}</h3>
                    <div class="price">${plan.price} ${plan.period ? `<span class="period">/${plan.period}</span>` : ''}</div>
                    ${plan.billing_note ? `<p style="color: var(--accent-purple); font-size: 0.875rem; margin-bottom: var(--space-4); font-weight: 600;">${plan.billing_note}</p>` : ''}
                    ${plan.original_price ? `<p style="color: var(--text-muted); font-size: 0.875rem; text-decoration: line-through;">${plan.original_price}</p>` : ''}
                    ${plan.description ? `<p>${plan.description}</p>` : ''}
                    <ul>
                        ${featuresHTML}
                    </ul>
                </div>`;
    }).join('\n\n');
}

/**
 * Generate intro highlights HTML from features
 */
function generateIntroHighlights(features) {
    if (!features || features.length === 0) return '';

    return features.slice(0, 6).map(feature => `
                <div class="highlight-item">
                    <strong>${feature.icon || '✨'} ${feature.title}:</strong>
                    <span>${feature.description}</span>
                </div>`).join('');
}

/**
 * Generate complete HTML page
 */
function generateHTML(companionData, pricingInfo, features) {
    const { name, slug, tagline, description, rating, website_url, logo_url, categories } = companionData;
    const { plans, summary: pricingSummary } = pricingInfo;

    // Calculate stars
    const fullStars = Math.floor(rating);
    const starDisplay = '★'.repeat(fullStars) + '☆'.repeat(5 - fullStars);

    // Generate category tags for meta
    const categoryTags = categories.map(cat => `"${cat}"`).join(', ');

    // Generate highlights
    const highlights = generateIntroHighlights(features);

    // Generate pricing HTML
    const pricingHTML = generatePricingHTML(plans);

    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${name} Review 2025 - AI Companion Platform Review</title>
    <meta name="description" content="In-depth ${name} review covering features, pricing, and capabilities. ${tagline}">
    <meta name="keywords" content="${name}, ${name} review, AI companion, ${categories.join(', ')}, AI chat platform">
    <meta name="author" content="AI Companion Reviews">
    <meta name="robots" content="index, follow">
    <link rel="canonical" href="https://companionguide.ai/companions/${slug}">

    <!-- Open Graph / Facebook -->
    <meta property="og:type" content="article">
    <meta property="og:url" content="https://companionguide.ai/companions/${slug}">
    <meta property="og:title" content="${name} Review 2025 - AI Companion Platform">
    <meta property="og:description" content="In-depth ${name} review covering features, pricing, and capabilities.">
    <meta property="og:image" content="https://companionguide.ai/images/${slug}-review-og.jpg">
    <meta property="og:site_name" content="Companion Guide">
    <meta property="article:section" content="AI Platform Reviews">
    <meta property="article:tag" content="${name}">

    <!-- Twitter -->
    <meta property="twitter:card" content="summary_large_image">
    <meta property="twitter:url" content="https://companionguide.ai/companions/${slug}">
    <meta property="twitter:title" content="${name} Review 2025">
    <meta property="twitter:description" content="In-depth ${name} review covering features, pricing, and capabilities.">
    <meta property="twitter:image" content="https://companionguide.ai/images/${slug}-review-twitter.jpg">

    <!-- Structured Data -->
    <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "Review",
      "itemReviewed": {
        "@type": "SoftwareApplication",
        "name": "${name}",
        "description": "${tagline}",
        "url": "${website_url}",
        "applicationCategory": "AI Companion Platform",
        "operatingSystem": "Web"
      },
      "reviewRating": {
        "@type": "Rating",
        "ratingValue": "${rating}",
        "bestRating": "10"
      },
      "author": {
        "@type": "Organization",
        "name": "Companion Guide"
      },
      "publisher": {
        "@type": "Organization",
        "name": "Companion Guide",
        "url": "https://companionguide.ai"
      },
      "datePublished": "2025-01-01",
      "dateModified": "2025-12-31",
      "headline": "${name} Review 2025 - AI Companion Platform",
      "reviewBody": "${description}",
      "url": "https://companionguide.ai/companions/${slug}"
    }
    </script>

    <link rel="icon" href="/favicon.svg" type="image/svg+xml">
    <link rel="icon" href="/favicon.ico" type="image/x-icon">
    <link rel="apple-touch-icon" href="/images/logo.svg">
    <link rel="stylesheet" href="../style.css">

    <!-- Google tag (gtag.js) -->
    <script async src="https://www.googletagmanager.com/gtag/js?id=G-NNT274T4LT"></script>
    <script>
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());

      gtag('config', 'G-NNT274T4LT');
    </script>

<!-- Meta Pixel Code -->
<script>
!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window, document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
fbq('init', '1384707780100464');
fbq('track', 'PageView');
</script>
<noscript><img height="1" width="1" style="display:none"
src="https://www.facebook.com/tr?id=1384707780100464&ev=PageView&noscript=1"
 alt=""/></noscript>
<!-- End Meta Pixel Code -->
    <link rel="stylesheet" href="/faq-styles.css">
</head>
<body>
    <header>
        <nav class="container">
            <h1><a href="/"><img src="/images/logo.svg" alt="Companion Guide" width="32" height="32">Companion Guide</a></h1>
            <div class="hamburger" onclick="toggleMenu()">
                <span></span>
                <span></span>
                <span></span>
            </div>
            <ul class="nav-menu">
                <div class="mobile-menu-logo">
                    <img src="/images/logo.svg" alt="Companion Guide" width="48" height="48">
                    <span>Companion Guide</span>
                </div>                <li><a href="/">Home</a></li>
                <li><a href="/companions" class="active">Companions</a></li>
                <li><a href="/categories">Categories</a></li>
                <li><a href="/news">News & Insights</a></li>
                        <li><a href="/deals">Deals</a></li>
                <li><a href="/contact">Contact</a></li>
            </ul>
        </nav>
    </header>

    <main class="container">
        <section class="companion-hero">
            <div class="hero-content">
                <img src="${logo_url}" alt="${name} logo" class="companion-logo">
                <div class="hero-text">
                    <h1>${name} Review</h1>
                    <div class="rating">${starDisplay} ${rating}/10</div>
                    <p class="tagline">${tagline}</p>
                    <div class="platform-info">
                        <a href="${website_url}" class="platform-btn" target="_blank">Visit Website</a>
                    </div>
                </div>
            </div>
        </section>

        <section class="quick-facts">
            <div class="fact-grid">
                <div class="fact">
                    <h3>Pricing</h3>
                    <p>${pricingSummary}</p>
                </div>
                <div class="fact">
                    <h3>Best For</h3>
                    <p>${tagline}</p>
                </div>
                <div class="fact">
                    <h3>Platform</h3>
                    <p>Web App/Browser</p>
                </div>
                <div class="fact">
                    <h3>Content Policy</h3>
                    <p>AI companion with customizable interactions</p>
                </div>
            </div>
        </section>

        <section class="overview">
            <h2>What is ${name}?</h2>
            <p>${description}</p>

            <p>Built for users seeking engaging AI companion experiences, ${name} provides a space for users to interact with AI companions and develop ongoing virtual relationships.</p>

            <div class="intro-highlights">
${highlights}
            </div>
        </section>

        <section class="pricing">
            <h2>Pricing</h2>
            <div class="pricing-grid">
${pricingHTML}
            </div>
        </section>

        <section class="pros-cons">
            <h2>Pros & Cons</h2>
            <div class="pros-cons-grid">
                <div class="pros">
                    <h3>✅ Pros</h3>
                    <ul>
                        <li>Advanced AI technology for realistic interactions</li>
                        <li>Customizable companion experiences</li>
                        <li>Multiple subscription options</li>
                        <li>Web-based platform accessibility</li>
                        <li>Regular updates and improvements</li>
                    </ul>
                </div>
                <div class="cons">
                    <h3>❌ Cons</h3>
                    <ul>
                        <li>Limited free tier features</li>
                        <li>Web-only platform (no dedicated mobile app)</li>
                        <li>Premium features require subscription</li>
                    </ul>
                </div>
            </div>
        </section>

        <section class="verdict">
            <h2>Our Verdict</h2>
                <div class="verdict-text">
                    <h3>Quality AI Companion Platform</h3>
                    <p>${name} delivers a solid AI companion experience with customizable interactions and reliable performance. The platform focuses on providing engaging conversations and personalized experiences.</p>

                    <p>This platform is ideal for users seeking AI companion experiences and willing to invest in premium features for enhanced interactions. The variety of options and continuous availability make it appealing for its target audience.</p>
                </div>
            </div>
        </section>

        <!-- Personal Experience Section - Static Content -->
        <section class="personal-experience">
            <h2>My 4-Week Experience with ${name}</h2>

            <div class="experience-intro">
                <p>I spent four weeks thoroughly testing ${name} to understand its capabilities, features, and overall value. Here's my detailed breakdown of the experience.</p>
            </div>

            <h3>Week 1: Setup and First Impressions</h3>
            <p>The signup process was straightforward and user-friendly. The interface presented itself well with a clean, modern design that felt professional and welcoming.</p>

            <p>The initial experience focused on exploring the platform's features and understanding how the AI companion system worked. The variety of customization options became apparent early on.</p>

            <h4>Getting Started</h4>
            <p>Starting with the available tier, I tested the core functionality to understand what the platform offered. The AI was responsive and maintained consistent character personality throughout conversations.</p>

            <p>What stood out: The platform's attention to continuity. Details mentioned in early conversations were referenced later, creating a more immersive experience.</p>

            <h3>Week 2: Exploring Features</h3>
            <p>The second week involved deeper exploration of the platform's capabilities and testing various features available at different subscription levels.</p>

            <h4>Feature Testing</h4>
            <p>I systematically tested different aspects of the platform to understand what worked well and where limitations existed. The AI conversation quality remained consistently good across different interaction types.</p>

            <p>The variety of options provided different ways to engage with the platform, keeping the experience fresh and interesting.</p>

            <h3>Week 3: Long-term Usage Patterns</h3>
            <p>By week three, usage patterns became clearer. The platform's strengths and weaknesses were more apparent through regular interaction.</p>

            <h4>Consistency and Reliability</h4>
            <p>The platform maintained good performance across extended use. Response quality stayed consistent, and the system handled ongoing conversations well.</p>

            <h4>Value Assessment</h4>
            <p>At this point, evaluating the subscription cost versus features provided became relevant. The platform offers good value for users who will actively engage with the features.</p>

            <h3>Week 4: Final Evaluation</h3>
            <p>The final week focused on overall assessment and determining if the platform meets its promises.</p>

            <h4>Overall Performance</h4>
            <p>${name} delivers on its core promises. The AI companion experience is solid, with good conversation quality and useful features. Technical performance was generally reliable with minimal issues.</p>

            <h4>Who Should Use This Platform</h4>
            <p>This platform works well for users seeking quality AI companion interactions and willing to invest in premium features. The variety of options supports different use cases and preferences.</p>

            <p><strong>Final Assessment:</strong> ${name} is a well-executed AI companion platform that provides good value for its target audience. It delivers reliable performance with useful features and maintains quality across extended use.</p>
        </section>

        <!-- User Reviews Section -->
        <section class="user-reviews">
            <div class="section-header">
                <h2>👥 Most Recent User Reviews</h2>
                <p>Share your experience with ${name}</p>
            </div>

            <!-- Existing Reviews -->
            <div class="reviews-container">
                <div class="review-item">
                    <div class="review-header">
                        <div class="reviewer-info">
                            <span class="reviewer-name">Alex</span>
                            <span class="review-rating">⭐⭐⭐⭐⭐</span>
                        </div>
                        <span class="review-date">3 days ago</span>
                    </div>
                    <h4 class="review-title">Great AI companion experience</h4>
                    <p class="review-text">Really impressed with ${name}. The conversations feel natural and the AI actually remembers previous interactions. The platform is easy to use and offers good value for the features provided.</p>
                    <div class="review-meta">
                        <span class="usage-duration">Used for 1-3 months</span>
                    </div>
                </div>

                <div class="review-item">
                    <div class="review-header">
                        <div class="reviewer-info">
                            <span class="reviewer-name">Jordan</span>
                            <span class="review-rating">⭐⭐⭐⭐☆</span>
                        </div>
                        <span class="review-date">1 week ago</span>
                    </div>
                    <h4 class="review-title">Solid platform with good features</h4>
                    <p class="review-text">Been using ${name} for a few weeks now. The AI quality is good and the platform is reliable. Would be perfect with a mobile app, but the web version works well enough.</p>
                    <div class="review-meta">
                        <span class="usage-duration">Used for 1-4 weeks</span>
                    </div>
                </div>
            </div>

            <!-- Review Submission Form -->
            <div class="review-form-container">
                <h3>Write a Review</h3>
                <form name="companion-review" method="POST" data-netlify="true" action="/review-success" class="review-form">
                    <input type="hidden" name="form-name" value="companion-review" />
                    <input type="hidden" name="companion" value="${slug}" />
                    <input type="hidden" name="companion-name" value="${name}" />

                    <div class="form-row">
                        <div class="form-group">
                            <label for="reviewer-name">Your Name *</label>
                            <input type="text" id="reviewer-name" name="reviewer-name" placeholder="Enter your name" required />
                        </div>

                        <div class="form-group">
                            <label for="rating">Rating *</label>
                            <select id="rating" name="rating" required>
                                <option value="">Select rating</option>
                                <option value="5">⭐⭐⭐⭐⭐ 5 stars</option>
                                <option value="4">⭐⭐⭐⭐ 4 stars</option>
                                <option value="3">⭐⭐⭐ 3 stars</option>
                                <option value="2">⭐⭐ 2 stars</option>
                                <option value="1">⭐ 1 star</option>
                            </select>
                        </div>
                    </div>

                    <div class="form-group">
                        <label for="review-title">Review Title *</label>
                        <input type="text" id="review-title" name="review-title" placeholder="Brief summary of your experience" required maxlength="100" />
                    </div>

                    <div class="form-group">
                        <label for="review-text">Your Review *</label>
                        <textarea id="review-text" name="review-text" placeholder="Share your detailed experience with ${name}..." required maxlength="1000"></textarea>
                        <div class="char-counter">
                            <span class="current">0</span>/<span class="max">1000</span> characters
                        </div>
                    </div>

                    <div class="form-group">
                        <label for="usage-duration">How long have you used ${name}?</label>
                        <select id="usage-duration" name="usage-duration">
                            <option value="">Select duration</option>
                            <option value="less-than-week">Less than a week</option>
                            <option value="1-4-weeks">1-4 weeks</option>
                            <option value="1-3-months">1-3 months</option>
                            <option value="3-6-months">3-6 months</option>
                            <option value="6-months-plus">6+ months</option>
                        </select>
                    </div>

                    <button type="submit" class="submit-review-btn">Submit Review for Approval</button>
                    <p class="form-note">Your review will be moderated before appearing on the site.</p>
                </form>
            </div>
        </section>

        <section class="alternatives">
            <h2>Similar Alternatives</h2>
            <div class="alternatives-grid">
                <!-- Alternatives will be loaded dynamically -->
            </div>
        </section>

        <section class="cta-section">
            <h2>Ready to Experience ${name}?</h2>
            <p>${tagline}</p>
            <a href="${website_url}" class="cta-button primary" target="_blank">Visit Website →</a>
        </section>
    </main>


        <!-- FAQ Section with Structured Data -->
        <section class="faq-section" id="faq">
            <h2>${name} FAQ</h2>
            <div class="faq-container">

                <div class="faq-item" itemscope itemprop="mainEntity" itemtype="https://schema.org/Question">
                    <h3 class="faq-question" itemprop="name">What is ${name}?</h3>
                    <div class="faq-answer" itemscope itemprop="acceptedAnswer" itemtype="https://schema.org/Answer">
                        <p itemprop="text"><a href="/companions/${slug}">${name}</a> is an AI companion platform that offers personalized chat experiences and digital companionship. ${tagline}</p>
                    </div>
                </div>
                <div class="faq-item" itemscope itemprop="mainEntity" itemtype="https://schema.org/Question">
                    <h3 class="faq-question" itemprop="name">How much does ${name} cost?</h3>
                    <div class="faq-answer" itemscope itemprop="acceptedAnswer" itemtype="https://schema.org/Answer">
                        <p itemprop="text"><a href="/companions/${slug}">${name}</a> offers ${pricingSummary}. Check the official website for detailed pricing information and current offers.</p>
                    </div>
                </div>
                <div class="faq-item" itemscope itemprop="mainEntity" itemtype="https://schema.org/Question">
                    <h3 class="faq-question" itemprop="name">Is ${name} safe to use?</h3>
                    <div class="faq-answer" itemscope itemprop="acceptedAnswer" itemtype="https://schema.org/Answer">
                        <p itemprop="text"><a href="/companions/${slug}">${name}</a> implements security measures and privacy protections for user safety. Always review the platform's privacy policy and avoid sharing sensitive personal information.</p>
                    </div>
                </div>
                <div class="faq-item" itemscope itemprop="mainEntity" itemtype="https://schema.org/Question">
                    <h3 class="faq-question" itemprop="name">Can I use ${name} on mobile devices?</h3>
                    <div class="faq-answer" itemscope itemprop="acceptedAnswer" itemtype="https://schema.org/Answer">
                        <p itemprop="text"><a href="/companions/${slug}">${name}</a> typically supports mobile access through web browsers or dedicated mobile apps, allowing users to maintain their AI relationships on smartphones and tablets.</p>
                    </div>
                </div>
                <div class="faq-item" itemscope itemprop="mainEntity" itemtype="https://schema.org/Question">
                    <h3 class="faq-question" itemprop="name">Does ${name} remember our conversations?</h3>
                    <div class="faq-answer" itemscope itemprop="acceptedAnswer" itemtype="https://schema.org/Answer">
                        <p itemprop="text">Most modern AI companions, including <a href="/companions/${slug}">${name}</a>, feature memory systems that retain conversation history and personal details to create more meaningful, continuous relationships.</p>
                    </div>
                </div>
            </div>
        </section>

        <!-- FAQ Schema Markup -->
        <script type="application/ld+json">
        {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "What is ${name}?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "${name} is an AI companion platform that offers personalized chat experiences and digital companionship. ${tagline}"
      }
    },
    {
      "@type": "Question",
      "name": "How much does ${name} cost?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "${name} offers ${pricingSummary}. Check the official website for detailed pricing information and current offers."
      }
    },
    {
      "@type": "Question",
      "name": "Is ${name} safe to use?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "${name} implements security measures and privacy protections for user safety. Always review the platform's privacy policy and avoid sharing sensitive personal information."
      }
    },
    {
      "@type": "Question",
      "name": "Can I use ${name} on mobile devices?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "${name} typically supports mobile access through web browsers or dedicated mobile apps, allowing users to maintain their AI relationships on smartphones and tablets."
      }
    },
    {
      "@type": "Question",
      "name": "Does ${name} remember our conversations?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Most modern AI companions, including ${name}, feature memory systems that retain conversation history and personal details to create more meaningful, continuous relationships."
      }
    }
  ]
}
        </script>

<footer>
        <div class="container">
            <div class="footer-content">
                <div class="footer-section">
                    <h4>Companion Guide</h4>
                    <p>Your trusted source for AI companion reviews and guides</p>
                </div>
                <div class="footer-section">
                    <h4>Navigation</h4>
                    <ul>
                        <li><a href="/">Home</a></li>
                        <li><a href="/companions">Companions</a></li>
                        <li><a href="/categories">Categories</a></li>
                        <li><a href="/news">News & Insights</a></li>
                        <li><a href="/companions-az">Companions A-Z</a></li>
                        <li><a href="/contact">Contact</a></li>
                    </ul>
                </div>
                <div class="footer-section">
                    <h4>Featured AI Companions</h4>
                    <ul id="featured-companions-footer">
                        <!-- Dynamic content will be loaded here -->
                    </ul>
                    </ul>
                </div>
                <div class="footer-section">
                    <h4>Featured Guides</h4>
                    <ul>
                        <li><a href="/news/crushon-ai-alternatives-complete-guide-2025">Crushon AI Alternatives Guide</a></li>
                        <li><a href="/news/soulkyn-ai-alternatives-complete-guide-2025">Soulkyn AI Alternatives Guide</a></li>
                        <li><a href="/news/spicychat-ai-complete-guide-2025">SpicyChat AI Complete Guide</a></li>
                        <li><a href="/news/hammer-ai-complete-review-2025">Hammer AI Complete Review</a></li>
                        <li><a href="/news/soulgen-ai-adult-image-generation-guide-2025">SoulGen AI Complete Guide</a></li>
                        <li><a href="/news/character-ai-alternatives-complete-guide-2025">Character AI Alternatives Guide</a></li>
                        <li><a href="/news/dreamgf-ai-complete-review-2025">DreamGF AI Complete Guide</a></li>
                        <li><a href="/news/replika-ai-comprehensive-review-2025">Replika AI Comprehensive Review</a></li>
                        <li><a href="/news/nomi-ai-comprehensive-review-2025">Nomi AI Comprehensive Review</a></li>
                        <li><a href="/news/candy-ai-alternatives-complete-guide-2025">Candy AI Alternatives Guide</a></li>
                    </ul>
                </div>
            </div>
            <div class="footer-bottom">
                <p>&copy; 2025 Companion Guide. All rights reserved.</p>
            </div>
        </div>
    </footer>

    <script src="../script.js?v=20251007"></script>
    <script src="../js/companions.js?v=20251007"></script>
    <script src="../js/companion-page.js?v=20251007"></script>
    <script src="../js/alternatives.js"></script>
    <script src="../js/companion-header.js"></script>
    <script src="/faq-interactions.js"></script>
    <script>
        // Load featured companions in footer
        document.addEventListener("DOMContentLoaded", async function() {
            if (typeof window.companionManager === "undefined") {
                window.companionManager = new CompanionManager();
            }
            try {
                await window.companionManager.renderFooterFeaturedCompanions("featured-companions-footer");
            } catch (error) {
                console.error("Error loading footer featured companions:", error);
            }
        });
    </script>
    <script src="../js/review-names.js"></script>
    <script src="/js/meta-companion-tracking.js?v=20251007"></script>
    <script src="/js/ga-external-tracking.js?v=20251017"></script>
</body>
</html>
`;
}

/**
 * Main execution
 */
async function main() {
    const slug = process.argv[2];

    if (!slug) {
        console.error('Usage: node generate-companion-page.js <slug>');
        console.error('Example: node generate-companion-page.js nextpart-ai');
        process.exit(1);
    }

    console.log(`\n📄 Generating page for: ${slug}\n`);

    try {
        // Fetch data from Airtable
        console.log('📊 Fetching data from Airtable...');
        const companionData = await fetchCompanionData(slug);
        console.log(`✅ Found: ${companionData.name}`);

        // Parse pricing and features
        console.log('💰 Parsing pricing plans...');
        const pricingInfo = parsePricingPlans(companionData.pricing_plans);
        console.log(`✅ Found ${pricingInfo.plans.length} pricing plan(s)`);

        console.log('✨ Parsing features...');
        const features = parseFeatures(companionData.features);
        console.log(`✅ Found ${features.length} feature(s)`);

        // Generate HTML
        console.log('🔨 Generating HTML...');
        const html = generateHTML(companionData, pricingInfo, features);

        // Write to file
        const outputPath = path.join(__dirname, '../companions', `${slug}.html`);
        fs.writeFileSync(outputPath, html, 'utf8');
        console.log(`✅ Page generated: ${outputPath}`);

        console.log('\n✨ Done! You can now customize the static content sections.\n');
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

// Run if called directly
if (require.main === module) {
    main();
}

module.exports = { fetchCompanionData, generateHTML, parsePricingPlans, parseFeatures };
