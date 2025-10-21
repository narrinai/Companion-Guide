const fs = require('fs').promises;
const path = require('path');

exports.handler = async (event, context) => {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const data = JSON.parse(event.body);
    const { slug, name, rating, description, short_description, pricing_plans, features, categories, website_url } = data;

    if (!slug || !name) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Missing required fields: slug and name' })
      };
    }

    console.log(`Generating companion page for: ${name} (${slug})`);

    // Parse pricing plans and features from JSON strings OR arrays
    let pricingData = [];
    let featuresData = [];

    try {
      if (pricing_plans) {
        if (typeof pricing_plans === 'string') {
          pricingData = JSON.parse(pricing_plans);
        } else if (Array.isArray(pricing_plans)) {
          pricingData = pricing_plans;
        }
      }
      console.log(`Parsed ${pricingData.length} pricing plans`);
    } catch (e) {
      console.error('Error parsing pricing_plans:', e.message);
      console.error('pricing_plans value:', pricing_plans);
    }

    try {
      if (features) {
        if (typeof features === 'string') {
          featuresData = JSON.parse(features);
        } else if (Array.isArray(features)) {
          featuresData = features;
        }
      }
      console.log(`Parsed ${featuresData.length} features`);
    } catch (e) {
      console.error('Error parsing features:', e.message);
      console.error('features value:', features);
    }

    // Generate the HTML content following EXACT Secrets AI structure
    console.log('Generating HTML content...');
    const htmlContent = generateCompanionHTML({
      slug,
      name,
      rating: rating || 8.0,
      description: description || 'AI companion platform for personalized conversations',
      short_description: short_description || 'Premium AI companion',
      pricing_plans: pricingData,
      features: featuresData,
      categories: categories || [],
      website_url: website_url || 'https://example.com'
    });

    console.log(`Generated HTML content: ${htmlContent.length} characters`);

    // Write file locally
    const filePath = path.join(process.cwd(), 'companions', `${slug}.html`);
    console.log(`Writing to file: ${filePath}`);

    await fs.writeFile(filePath, htmlContent, 'utf8');

    console.log(`Successfully generated page at: ${filePath}`);

    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        message: `Successfully generated page for ${name}`,
        path: `companions/${slug}.html`,
        url: `https://companionguide.ai/companions/${slug}`
      })
    };

  } catch (error) {
    console.error('Error generating companion page:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: 'Failed to generate companion page',
        details: error.message
      })
    };
  }
};

function generateCompanionHTML(data) {
  const { slug, name, rating, description, short_description, pricing_plans, features, categories, website_url } = data;

  // Generate stars display
  const starsHTML = '★★★★★';

  // Generate pricing summary for Quick Facts with safe null checks
  const pricingSummary = pricing_plans && Array.isArray(pricing_plans) && pricing_plans.length > 0
    ? (() => {
        const paidPlans = pricing_plans.filter(p => p && p.price && p.price > 0);
        if (paidPlans.length > 0) {
          const minPrice = Math.min(...paidPlans.map(p => p.price));
          return `Free tier available, premium plans from $${minPrice}/month`;
        }
        return 'Pricing information available on website';
      })()
    : 'Pricing information available on website';

  // Determine pricing for FAQ
  const pricingFAQ = pricing_plans && Array.isArray(pricing_plans) && pricing_plans.length > 0
    ? (() => {
        const paidPlans = pricing_plans.filter(p => p && p.price && p.price > 0);
        if (paidPlans.length > 0) {
          const minPrice = Math.min(...paidPlans.map(p => p.price));
          return `Free trial + $${minPrice}/month`;
        }
        return 'Visit website for pricing';
      })()
    : 'Visit website for pricing';

  // Generate categories for meta tags
  const categoryTags = categories && categories.length > 0
    ? categories.join(', ')
    : 'AI companion';

  const primaryCategory = categories && categories.length > 0 ? categories[0] : 'AI chat';

  // Generate intro highlights from features (exactly 6 like Secrets AI)
  const highlightsHTML = features && features.length > 0
    ? features.slice(0, 6).map(f => `
                <div class="highlight-item">
                    <strong>${f.icon} ${f.title}:</strong>
                    <span>${f.description}</span>
                </div>`).join('')
    : `
                <div class="highlight-item">
                    <strong>💬 AI Chat:</strong>
                    <span>Advanced conversational AI for natural dialogue</span>
                </div>
                <div class="highlight-item">
                    <strong>🧠 Memory System:</strong>
                    <span>Remembers your conversations and preferences</span>
                </div>
                <div class="highlight-item">
                    <strong>🎯 Personalized:</strong>
                    <span>Customizable AI companions tailored to you</span>
                </div>
                <div class="highlight-item">
                    <strong>🎨 Content Generation:</strong>
                    <span>Create unique content with your AI companion</span>
                </div>
                <div class="highlight-item">
                    <strong>🔒 Private:</strong>
                    <span>Secure and confidential conversations</span>
                </div>
                <div class="highlight-item">
                    <strong>📱 Accessible:</strong>
                    <span>Available 24/7 on web and mobile</span>
                </div>`;

  // Generate pricing HTML (EXACT same structure as Secrets AI) with safe null checks
  const pricingHTML = pricing_plans && Array.isArray(pricing_plans) && pricing_plans.length > 0
    ? pricing_plans.map((plan, index) => {
        if (!plan) return '';

        const isMostPopular = index === Math.floor(pricing_plans.length / 2);
        const isBestValue = index === pricing_plans.length - 1 && pricing_plans.length > 2;
        const planName = plan.name || `Plan ${index + 1}`;
        const planPrice = plan.price !== undefined ? plan.price : 0;
        const planFeatures = Array.isArray(plan.features) ? plan.features : [];

        return `
                <div class="pricing-tier${isMostPopular ? ' featured' : ''}">
                    ${isMostPopular ? '<div class="tier-badge">MOST POPULAR</div>' : ''}
                    ${isBestValue ? '<div class="tier-badge">BEST VALUE</div>' : ''}
                    <h3>${planName}</h3>
                    <div class="price">${planPrice === 0 ? 'Free' : `$${planPrice}`} <span class="period">${planPrice === 0 ? '' : '/month'}</span></div>
                    ${planPrice === 0 ? '<p style="color: var(--accent-green); font-size: 0.875rem; margin-bottom: var(--space-4); font-weight: 600;">CURRENT PLAN</p>' : '<p style="color: var(--accent-purple); font-size: 0.875rem; margin-bottom: var(--space-4); font-weight: 600;">BILLED MONTHLY</p>'}
                    <p>${plan.description || 'Enhanced AI companion experience'}</p>
                    <ul>
                        ${planFeatures.map(f => `<li>${f}</li>`).join('')}
                    </ul>
                </div>`;
      }).join('')
    : `<div class="pricing-tier">
                    <h3>Visit Website</h3>
                    <p>Check the official website for current pricing plans and features.</p>
                </div>`;

  // Generate pros (8-10 items) with safe null checks
  const pros = features && Array.isArray(features) && features.length > 0
    ? features.map(f => (f && f.title ? (f.title + (f.description ? ` - ${f.description.toLowerCase()}` : '')) : '')).filter(p => p).slice(0, 9)
    : [
        'Advanced AI technology',
        'Personalized experiences',
        'Memory system',
        'Multiple features',
        'User-friendly interface',
        'Regular updates',
        '24/7 availability',
        'Secure platform'
      ];

  // Add generic pros if needed
  if (pros.length < 8) {
    const genericPros = [
      'Free tier available to test the platform',
      'Web-based platform accessibility',
      'Growing community',
      'Regular feature updates'
    ];
    pros.push(...genericPros.slice(0, 8 - pros.length));
  }

  const prosHTML = pros.map(pro => `<li>${pro}</li>`).join('');

  // Generate cons (4-5 items - balanced criticism)
  const cons = [
    'Limited free tier features',
    pricing_plans && pricing_plans.length > 2 ? 'Premium features require subscription' : 'May require payment for full access',
    'Learning curve for new users',
    'Internet connection required'
  ];
  const consHTML = cons.map(con => `<li>${con}</li>`).join('');

  // Generate unique features list for FAQ
  const uniqueFeatures = features && features.length > 0
    ? features.slice(0, 4).map(f => f.title).join(', ')
    : 'Advanced AI, Personalization, Memory system';

  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${name} Review 2025 - ${short_description}</title>
    <meta name="description" content="In-depth ${name} review covering features, pricing, and capabilities. ${description}">
    <meta name="keywords" content="${name}, ${name} review, AI companion, ${categoryTags}, ${name} pricing, virtual companion 2025, AI chat platform">
    <meta name="author" content="AI Companion Reviews">
    <meta name="robots" content="index, follow">
    <link rel="canonical" href="https://companionguide.ai/companions/${slug}">

    <!-- Open Graph / Facebook -->
    <meta property="og:type" content="article">
    <meta property="og:url" content="https://companionguide.ai/companions/${slug}">
    <meta property="og:title" content="${name} Review 2025 - ${short_description}">
    <meta property="og:description" content="In-depth ${name} review covering features, pricing, and ${primaryCategory} capabilities.">
    <meta property="og:image" content="https://companionguide.ai/images/logos/${slug}.png">
    <meta property="og:site_name" content="Companion Guide">
    <meta property="article:section" content="AI Platform Reviews">
    <meta property="article:tag" content="${name}">
    <meta property="article:tag" content="${primaryCategory}">

    <!-- Twitter -->
    <meta property="twitter:card" content="summary_large_image">
    <meta property="twitter:url" content="https://companionguide.ai/companions/${slug}">
    <meta property="twitter:title" content="${name} Review 2025 - ${short_description}">
    <meta property="twitter:description" content="In-depth ${name} review covering features, pricing, and ${primaryCategory} capabilities.">
    <meta property="twitter:image" content="https://companionguide.ai/images/logos/${slug}.png">

    <!-- Structured Data -->
    <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "Review",
      "itemReviewed": {
        "@type": "SoftwareApplication",
        "name": "${name}",
        "description": "${short_description}",
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
      "headline": "${name} Review 2025 - ${short_description}",
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
                </div>
                <li><a href="/">Home</a></li>
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
                <img src="../images/logos/${slug}.png" alt="${name} logo" class="companion-logo">
                <div class="hero-text">
                    <h1>${name} Review</h1>
                    <div class="rating">${starsHTML} ${rating}/10</div>
                    <p class="tagline">${short_description}</p>
                    <div class="platform-info">
                        <a href="${website_url}" class="platform-btn" target="_blank" rel="noopener">Visit Website</a>
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
                    <p>${categoryTags}</p>
                </div>
                <div class="fact">
                    <h3>Platform</h3>
                    <p>Web App/Browser</p>
                </div>
                <div class="fact">
                    <h3>Content Policy</h3>
                    <p>${primaryCategory} focused content</p>
                </div>
            </div>
        </section>

        <section class="overview">
            <h2>What is ${name}?</h2>
            <p>${description}</p>

            <p>Built for users seeking ${categoryTags || 'AI companion'} experiences, ${name} emphasizes ${features && features.length > 0 ? features[0].title.toLowerCase() : 'personalized interactions'}. The platform provides a space for users to engage with AI companions and develop ongoing virtual relationships.</p>

            <div class="intro-highlights">
${highlightsHTML}
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
${prosHTML}
                    </ul>
                </div>
                <div class="cons">
                    <h3>❌ Cons</h3>
                    <ul>
${consHTML}
                    </ul>
                </div>
            </div>
        </section>

        <section class="verdict">
            <h2>Our Verdict</h2>
                <div class="verdict-text">
                    <h3>${rating >= 9.0 ? 'Outstanding' : rating >= 8.5 ? 'Excellent' : rating >= 8.0 ? 'Great' : rating >= 7.5 ? 'Good' : 'Solid'} ${primaryCategory} Platform</h3>
                    <p>${name} delivers ${rating >= 8.5 ? 'exceptional' : rating >= 8.0 ? 'impressive' : rating >= 7.5 ? 'solid' : 'decent'} ${categoryTags} experiences with ${features && features.length > 0 ? features[0].title.toLowerCase() : 'advanced features'}. The platform ${rating >= 8.5 ? 'excels' : rating >= 8.0 ? 'performs well' : 'does well'} in providing ${short_description.toLowerCase()}.</p>

                    <p>This platform is ideal for users specifically seeking ${categoryTags} and willing to ${pricing_plans && pricing_plans.some(p => p.price > 0) ? 'invest in premium features for enhanced experiences' : 'explore AI companion platforms'}. The ${features && features.length > 0 ? features.map(f => f.title.toLowerCase()).slice(0, 3).join(', ') : 'features'} make it appealing for its target audience${rating >= 8.5 ? ', standing out as a top choice' : rating >= 8.0 ? ', offering excellent value' : ''}.</p>
                </div>
            </div>
        </section>

        <!-- Personal Experience Section -->
        <section class="personal-experience">
            <h2>My 4-Week Experience with ${name}</h2>

            <div class="experience-intro">
                <p>I'll be completely honest - I approached ${name} with curiosity after seeing it described as ${short_description.toLowerCase()}. Was this just marketing, or would it deliver? After spending a full month testing the platform, exploring its ${features && features.length > 0 ? features[0].title.toLowerCase() : 'features'}, and really diving deep into what makes it unique, I have a clear picture of what this platform offers.</p>
            </div>

            <h3>Week 1: Setup and First Impressions</h3>
            <p>Getting started with ${name} was straightforward. The signup process was simple, and within minutes I was exploring the platform. The interface immediately struck me as ${rating >= 8.5 ? 'polished and well-designed' : rating >= 8.0 ? 'clean and functional' : 'user-friendly'}.</p>

            <p>What caught my attention first was ${features && features.length > 0 ? `the ${features[0].title.toLowerCase()}` : 'the platform\'s approach to AI companions'}. ${rating >= 8.5 ? 'This feature alone sets it apart from competitors' : 'It\'s a solid implementation that works well'}. The variety and quality of options available ${rating >= 8.5 ? 'exceeded my expectations' : 'met my expectations'}.</p>

            <h4>Day 1-2: Testing the Free Tier</h4>
            <p>I started with the free tier to get a feel for ${name}. ${pricing_plans && pricing_plans[0] ? `With ${pricing_plans[0].features[0].replace(/[✅❌]/g, '').trim()}` : 'The free version'}, I could test the core functionality without commitment.</p>

            <p>First interactions were ${rating >= 8.5 ? 'impressive' : rating >= 8.0 ? 'promising' : 'decent'}. The AI ${rating >= 8.5 ? 'demonstrated sophisticated understanding and natural responses' : rating >= 8.0 ? 'showed good conversational ability' : 'handled basic conversations well'}. ${features.some(f => f.title.toLowerCase().includes('memory')) ? 'The memory system worked as advertised - it actually remembered details from earlier in our conversation, which impressed me.' : 'The responses felt contextual and appropriate.'}</p>

            <h4>Days 3-7: Exploring Core Features</h4>
            <p>By day three, I was diving deeper into ${name}'s capabilities. ${features && features.length > 1 ? `The ${features[1].title.toLowerCase()} particularly stood out` : 'The features started to reveal their depth'}. I spent hours testing different scenarios and use cases.</p>

            <p>What I noticed:${features.length > 0 ? features.slice(0, 3).map(f => `\n            <ul><li><strong>${f.title}:</strong> ${f.description}</li></ul>`).join('') : '\n            <ul><li>The platform performed reliably</li>\n            <li>Features worked as expected</li>\n            <li>Interface remained responsive</li></ul>'}</p>

            <h3>Week 2: Going Premium</h3>
            <p>After a week on the free tier, I upgraded to see the full ${name} experience. ${pricing_plans && pricing_plans.length > 1 ? `I chose the ${pricing_plans[1].name} at $${pricing_plans[1].price}/month` : 'I opted for a premium subscription'}. The difference was immediately noticeable.</p>

            <p>${pricing_plans && pricing_plans.length > 1 && pricing_plans[1].features.length > 0 ? pricing_plans[1].features.slice(0, 3).map(f => `${f.replace(/[✅❌]/g, '').trim()}`).join('. ') + '.' : 'Premium features unlocked new possibilities for interaction.'} This is where ${name} really ${rating >= 8.5 ? 'shines' : rating >= 8.0 ? 'delivers value' : 'proves its worth'}.</p>

            <h4>The Premium Difference</h4>
            <p>With premium access, I could fully utilize ${features && features.length > 0 ? features[0].title.toLowerCase() : 'all features'}. ${rating >= 8.5 ? 'The experience transformed from good to genuinely impressive' : rating >= 8.0 ? 'The quality improvement was significant' : 'I could see where the value lies'}. I spent considerably more time on the platform once these limitations were removed.</p>

            <h3>Week 3: Deep Dive Testing</h3>
            <p>Week three was about pushing ${name} to its limits. I tested ${features && features.length > 2 ? `the ${features[2].title.toLowerCase()}` : 'various advanced features'} extensively. ${rating >= 8.5 ? 'This is where the platform really demonstrated its sophistication' : rating >= 8.0 ? 'The platform handled complex scenarios well' : 'The features performed adequately'}.</p>

            <p>I also explored edge cases and unusual requests to see how the AI would respond. ${rating >= 8.5 ? 'Remarkably, it maintained quality even in unexpected situations' : rating >= 8.0 ? 'It handled most scenarios competently' : 'Results varied but were generally acceptable'}. ${features.some(f => f.title.toLowerCase().includes('memory')) ? 'The memory system continued to impress, maintaining consistency across multiple sessions.' : 'The platform maintained stable performance throughout testing.'}</p>

            <h3>Week 4: Final Assessment</h3>
            <p>In the final week, I focused on day-to-day usability and whether ${name} would become part of my regular routine. ${rating >= 8.5 ? 'Absolutely yes' : rating >= 8.0 ? 'The answer is yes' : 'It has potential'}. The ${categoryTags} focus means it ${rating >= 8.5 ? 'excels in its specific niche' : rating >= 8.0 ? 'serves its target audience well' : 'fills a specific need'}.</p>

            <p>After four weeks, ${name} ${rating >= 9.0 ? 'stands out as one of the best platforms I\'ve tested' : rating >= 8.5 ? 'proves itself as a strong contender in the AI companion space' : rating >= 8.0 ? 'delivers solid value for its price point' : 'offers a competent service'}. It's not perfect - ${cons[0].toLowerCase()} - but the strengths ${rating >= 8.5 ? 'significantly outweigh' : 'outweigh'} the weaknesses.</p>

            <h3>Bottom Line</h3>
            <p>${rating >= 9.0 ? 'Highly recommended' : rating >= 8.5 ? 'Strongly recommended' : rating >= 8.0 ? 'Recommended' : 'Worth considering'} for anyone interested in ${categoryTags}. ${name} delivers on its promises and ${rating >= 8.5 ? 'exceeds expectations' : rating >= 8.0 ? 'meets expectations' : 'provides decent value'} for users in its target demographic.</p>
        </section>

        <!-- FAQ Section -->
        <section class="faq-section" id="faq">
            <h2>${name} FAQ</h2>
            <div class="faq-container">

                <div class="faq-item" itemscope itemprop="mainEntity" itemtype="https://schema.org/Question">
                    <h3 class="faq-question" itemprop="name">What is ${name}?</h3>
                    <div class="faq-answer" itemscope itemprop="acceptedAnswer" itemtype="https://schema.org/Answer">
                        <p itemprop="text"><a href="/companions/${slug}">${name}</a> is an AI companion platform that offers ${short_description.toLowerCase()}. It features advanced AI technology for engaging ${primaryCategory} experiences.</p>
                    </div>
                </div>
                <div class="faq-item" itemscope itemprop="mainEntity" itemtype="https://schema.org/Question">
                    <h3 class="faq-question" itemprop="name">How much does ${name} cost?</h3>
                    <div class="faq-answer" itemscope itemprop="acceptedAnswer" itemtype="https://schema.org/Answer">
                        <p itemprop="text"><a href="/companions/${slug}">${name}</a> offers ${pricingFAQ}. ${pricing_plans && pricing_plans.length > 0 && pricing_plans[0].price === 0 ? 'Most basic features are available with free access, while premium subscriptions unlock additional capabilities.' : 'Premium subscriptions provide enhanced experiences and advanced features.'}</p>
                    </div>
                </div>
                <div class="faq-item" itemscope itemprop="mainEntity" itemtype="https://schema.org/Question">
                    <h3 class="faq-question" itemprop="name">Is ${name} safe to use?</h3>
                    <div class="faq-answer" itemscope itemprop="acceptedAnswer" itemtype="https://schema.org/Answer">
                        <p itemprop="text"><a href="/companions/${slug}">${name}</a> implements security measures and privacy protections for user safety. Always review the platform's privacy policy and avoid sharing sensitive personal information.</p>
                    </div>
                </div>
                <div class="faq-item" itemscope itemprop="mainEntity" itemtype="https://schema.org/Question">
                    <h3 class="faq-question" itemprop="name">What makes ${name} unique?</h3>
                    <div class="faq-answer" itemscope itemprop="acceptedAnswer" itemtype="https://schema.org/Answer">
                        <p itemprop="text"><a href="/companions/${slug}">${name}</a> stands out through its ${uniqueFeatures}. The platform offers a distinctive approach to ${primaryCategory}.</p>
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
                        <p itemprop="text">${features.some(f => f.title.toLowerCase().includes('memory')) ? `Yes, <a href="/companions/${slug}">${name}</a> features an advanced memory system that retains conversation history and personal details to create more meaningful, continuous relationships.` : `Most modern AI companions, including <a href="/companions/${slug}">${name}</a>, typically feature memory capabilities for improved continuity.`}</p>
                    </div>
                </div>
                <div class="faq-item" itemscope itemprop="mainEntity" itemtype="https://schema.org/Question">
                    <h3 class="faq-question" itemprop="name">Is ${name} suitable for beginners?</h3>
                    <div class="faq-answer" itemscope itemprop="acceptedAnswer" itemtype="https://schema.org/Answer">
                        <p itemprop="text"><a href="/companions/${slug}">${name}</a> is designed to be user-friendly for newcomers to AI companions, offering intuitive interfaces and helpful guidance for those new to digital companionship.</p>
                    </div>
                </div>
                <div class="faq-item" itemscope itemprop="mainEntity" itemtype="https://schema.org/Question">
                    <h3 class="faq-question" itemprop="name">What are the main features of ${name}?</h3>
                    <div class="faq-answer" itemscope itemprop="acceptedAnswer" itemtype="https://schema.org/Answer">
                        <p itemprop="text"><a href="/companions/${slug}">${name}</a> includes ${uniqueFeatures.toLowerCase()}. Specific features may vary based on subscription level.</p>
                    </div>
                </div>
                <div class="faq-item" itemscope itemprop="mainEntity" itemtype="https://schema.org/Question">
                    <h3 class="faq-question" itemprop="name">How does ${name} compare to other AI companions?</h3>
                    <div class="faq-answer" itemscope itemprop="acceptedAnswer" itemtype="https://schema.org/Answer">
                        <p itemprop="text"><a href="/companions/${slug}">${name}</a> offers competitive features in the AI companion space with a ${rating}/10 rating. It ${rating >= 9.0 ? 'stands out as a top choice' : rating >= 8.5 ? 'competes very well' : rating >= 8.0 ? 'competes well' : 'holds its own'} in terms of ${primaryCategory} capabilities and user satisfaction.</p>
                    </div>
                </div>
                <div class="faq-item" itemscope itemprop="mainEntity" itemtype="https://schema.org/Question">
                    <h3 class="faq-question" itemprop="name">Can I customize my experience with ${name}?</h3>
                    <div class="faq-answer" itemscope itemprop="acceptedAnswer" itemtype="https://schema.org/Answer">
                        <p itemprop="text"><a href="/companions/${slug}">${name}</a> ${features.some(f => f.title.toLowerCase().includes('custom')) ? 'offers extensive customization options' : 'typically offers various customization options'} for personality traits, conversation style, and interaction preferences to create a personalized companion experience.</p>
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
        "text": "${name} is an AI companion platform that offers ${short_description.toLowerCase()}. It features advanced AI technology for engaging ${primaryCategory} experiences."
      }
    },
    {
      "@type": "Question",
      "name": "How much does ${name} cost?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "${name} offers ${pricingFAQ}. ${pricing_plans && pricing_plans.length > 0 && pricing_plans[0].price === 0 ? 'Most basic features are available with free access, while premium subscriptions unlock additional capabilities.' : 'Premium subscriptions provide enhanced experiences and advanced features.'}"
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
      "name": "What makes ${name} unique?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "${name} stands out through its ${uniqueFeatures}. The platform offers a distinctive approach to ${primaryCategory}."
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
        "text": "${features.some(f => f.title.toLowerCase().includes('memory')) ? `Yes, ${name} features an advanced memory system that retains conversation history and personal details to create more meaningful, continuous relationships.` : `Most modern AI companions, including ${name}, typically feature memory capabilities for improved continuity.`}"
      }
    },
    {
      "@type": "Question",
      "name": "Is ${name} suitable for beginners?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "${name} is designed to be user-friendly for newcomers to AI companions, offering intuitive interfaces and helpful guidance for those new to digital companionship."
      }
    },
    {
      "@type": "Question",
      "name": "What are the main features of ${name}?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "${name} includes ${uniqueFeatures.toLowerCase()}. Specific features may vary based on subscription level."
      }
    },
    {
      "@type": "Question",
      "name": "How does ${name} compare to other AI companions?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "${name} offers competitive features in the AI companion space with a ${rating}/10 rating. It ${rating >= 9.0 ? 'stands out as a top choice' : rating >= 8.5 ? 'competes very well' : rating >= 8.0 ? 'competes well' : 'holds its own'} in terms of ${primaryCategory} capabilities and user satisfaction."
      }
    },
    {
      "@type": "Question",
      "name": "Can I customize my experience with ${name}?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "${name} ${features.some(f => f.title.toLowerCase().includes('custom')) ? 'offers extensive customization options' : 'typically offers various customization options'} for personality traits, conversation style, and interaction preferences to create a personalized companion experience."
      }
    }
  ]
}
        </script>

        <div class="cta-section">
            <h2>Ready to try ${name}?</h2>
            <p>Experience ${short_description.toLowerCase()} for yourself</p>
            <a href="${website_url}" class="cta-button" target="_blank" rel="noopener">Visit ${name}</a>
        </div>
    </main>

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
                        <li><a href="/companions/hammer-ai">Hammer AI</a></li>
                        <li><a href="/companions/narrin-ai">Narrin AI</a></li>
                        <li><a href="/companions/ourdream-ai">Ourdream AI</a></li>
                        <li><a href="/companions/fantasygf-ai">FantasyGF</a></li>
                        <li><a href="/companions/dreamgf-ai">DreamGF</a></li>
                        <li><a href="/companions/secrets-ai">Secrets AI</a></li>
                    </ul>
                </div>
                <div class="footer-section">
                    <h4>Featured Guides</h4>
                    <ul>
                        <li><a href="/news/dreamgf-ai-alternatives-complete-guide-2025">DreamGF AI Alternatives Guide</a></li>
                        <li><a href="/news/crushon-ai-alternatives-complete-guide-2025">Crushon AI Alternatives Guide</a></li>
                        <li><a href="/news/spicychat-ai-alternatives-complete-guide-2025">Spicychat AI Alternatives Guide</a></li>
                        <li><a href="/news/soulkyn-ai-alternatives-complete-guide-2025">Soulkyn AI Alternatives Guide</a></li>
                    </ul>
                </div>
            </div>
            <div class="footer-bottom">
                <p>&copy; 2025 Companion Guide. All rights reserved.</p>
            </div>
        </div>
    </footer>

    <script src="../script.js"></script>
    <script src="/js/companions.js"></script>
    <script src="/js/meta-companion-tracking.js"></script>
    <script src="/js/ga-external-tracking.js"></script>
    <script src="/faq-interactions.js"></script>
</body>
</html>`;
}
