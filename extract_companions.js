const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

// Utility functions to extract data from HTML
function extractTextBetween(text, startStr, endStr) {
    const start = text.indexOf(startStr);
    if (start === -1) return null;
    const startPos = start + startStr.length;
    const end = text.indexOf(endStr, startPos);
    if (end === -1) return null;
    return text.substring(startPos, end).trim();
}

function extractBasicInfo(dom) {
    const doc = dom.window.document;

    // Extract name from title first, then h1 as fallback
    let name = '';
    const title = doc.querySelector('title');
    if (title) {
        const titleText = title.textContent;
        // Extract name from patterns like "Candy AI Review 2025 - ..." or "Replika Review - ..."
        let match = titleText.match(/^([^-]+(?:AI|GPT|Chat|Bot|App))\s*(?:Review|Guide)?\s*(?:\d{4})?/i);
        if (!match) {
            // Try alternative patterns for names like "Replika", "Simone"
            match = titleText.match(/^([A-Za-z0-9\s\.]+?)\s+(?:Review|Guide|AI|\s*-)/i);
        }
        if (match) {
            name = match[1].replace(/\s*Review$/, '').trim();
        }
    }

    // Fallback to h1 if title extraction failed
    if (!name) {
        const h1 = doc.querySelector('.hero-text h1, .companion-hero h1');
        if (h1) {
            name = h1.textContent.replace(' Review', '').trim();
        }
    }

    // Extract rating from structured data or rating display
    let rating = null;
    const structuredData = doc.querySelector('script[type="application/ld+json"]');
    if (structuredData) {
        try {
            const data = JSON.parse(structuredData.textContent);
            if (data.reviewRating && data.reviewRating.ratingValue) {
                rating = parseFloat(data.reviewRating.ratingValue);
            }
        } catch (e) {
            console.error('Error parsing structured data:', e);
        }
    }

    // Fallback: extract from rating display element
    if (!rating) {
        const ratingEl = doc.querySelector('.rating');
        if (ratingEl) {
            const ratingMatch = ratingEl.textContent.match(/(\d+\.?\d*)\s*\/\s*5/);
            if (ratingMatch) {
                rating = parseFloat(ratingMatch[1]);
            }
        }
    }

    // Extract description from meta tag
    const metaDesc = doc.querySelector('meta[name="description"]');
    const description = metaDesc ? metaDesc.getAttribute('content') : '';

    // Extract tagline
    const taglineEl = doc.querySelector('.tagline');
    const short_description = taglineEl ? taglineEl.textContent.trim() : '';

    // Extract affiliate URL from Visit Website button
    const visitBtn = doc.querySelector('.platform-btn, .btn-secondary');
    const affiliate_url = visitBtn ? visitBtn.getAttribute('href') : '';

    // Extract website URL from structured data
    let website_url = '';
    if (structuredData) {
        try {
            const data = JSON.parse(structuredData.textContent);
            if (data.itemReviewed && data.itemReviewed.url) {
                website_url = data.itemReviewed.url;
            }
        } catch (e) {
            console.error('Error extracting website URL:', e);
        }
    }

    // Extract image from companion-logo
    const logoImg = doc.querySelector('.companion-logo');
    const image_url = logoImg ? logoImg.getAttribute('src') : '';

    return {
        name,
        rating,
        description,
        short_description,
        affiliate_url,
        website_url,
        image_url
    };
}

function extractPricing(dom) {
    const doc = dom.window.document;
    const pricing_plans = [];

    // Look for pricing tiers
    const pricingTiers = doc.querySelectorAll('.pricing-tier');

    pricingTiers.forEach(tier => {
        const nameEl = tier.querySelector('h3');
        const priceEl = tier.querySelector('.price');
        const featuresEls = tier.querySelectorAll('li');

        if (nameEl && priceEl) {
            const name = nameEl.textContent.trim();
            const priceText = priceEl.textContent.trim();
            const features = Array.from(featuresEls).map(el => el.textContent.trim());

            // Extract price number
            const priceMatch = priceText.match(/\$?([0-9.]+)/);
            const price = priceMatch ? parseFloat(priceMatch[1]) : 0;

            pricing_plans.push({
                name,
                price,
                features
            });
        }
    });

    return pricing_plans;
}

function determineCategories(companionData) {
    const categories = [];
    const { name, description, short_description } = companionData;
    const fullText = `${name} ${description} ${short_description}`.toLowerCase();

    // Determine categories based on content
    if (fullText.includes('girlfriend') || fullText.includes('romantic') || fullText.includes('dating')) {
        categories.push('ai-girlfriend');
    }
    if (fullText.includes('roleplay') || fullText.includes('character') || fullText.includes('fantasy')) {
        categories.push('roleplaying');
    }
    if (fullText.includes('nsfw') || fullText.includes('adult') || fullText.includes('uncensored') || fullText.includes('intimate')) {
        categories.push('nsfw');
    }
    if (fullText.includes('video') || fullText.includes('visual')) {
        categories.push('video');
    }
    if (fullText.includes('wellness') || fullText.includes('mental') || fullText.includes('therapy')) {
        categories.push('wellness');
    }
    if (fullText.includes('learning') || fullText.includes('education') || fullText.includes('study')) {
        categories.push('learning');
    }
    if (fullText.includes('whatsapp') || fullText.includes('telegram')) {
        categories.push('whatsapp');
    }
    if (fullText.includes('image') || fullText.includes('generation') || fullText.includes('picture')) {
        categories.push('image-gen');
    }

    return categories;
}

function determineBadges(companionData, isFeatured) {
    const badges = [];
    const { rating, name } = companionData;

    if (isFeatured) badges.push('Featured');
    if (rating >= 4.7) badges.push('Top Rated');
    if (rating >= 4.5) badges.push('Popular');

    const nameText = name.toLowerCase();
    if (nameText.includes('nsfw') || nameText.includes('adult')) badges.push('Adult');

    return badges;
}

// Get featured companions from index.html
function getFeaturedCompanions() {
    const indexPath = '/Users/sebastiaansmits/Documents/AI-Companion-Reviews/index.html';
    const indexContent = fs.readFileSync(indexPath, 'utf8');
    const dom = new JSDOM(indexContent);
    const doc = dom.window.document;

    const featured = [];
    const companionCards = doc.querySelectorAll('.companion-card');

    companionCards.forEach(card => {
        const linkEl = card.querySelector('h3 a');
        if (linkEl) {
            const href = linkEl.getAttribute('href');
            const slug = href.replace('/companions/', '');
            featured.push(slug);
        }
    });

    return featured;
}

// Main extraction function
function extractAllCompanions() {
    const companionsDir = '/Users/sebastiaansmits/Documents/AI-Companion-Reviews/companions';
    const files = fs.readdirSync(companionsDir).filter(f => f.endsWith('.html') && !f.includes('.backup'));

    const featuredCompanions = getFeaturedCompanions();
    const companions = [];

    files.forEach(filename => {
        try {
            const slug = filename.replace('.html', '');
            const filePath = path.join(companionsDir, filename);
            const content = fs.readFileSync(filePath, 'utf8');
            const dom = new JSDOM(content);

            // Extract basic information
            const basicInfo = extractBasicInfo(dom);

            // Extract pricing
            const pricing_plans = extractPricing(dom);

            // Determine categories and badges
            const categories = determineCategories(basicInfo);
            const isFeatured = featuredCompanions.includes(slug);
            const badges = determineBadges(basicInfo, isFeatured);

            const companion = {
                slug,
                featured: isFeatured,
                categories,
                badges,
                pricing_plans,
                ...basicInfo
            };

            companions.push(companion);

        } catch (error) {
            console.error(`Error processing ${filename}:`, error);
        }
    });

    return companions;
}

// Extract and save to JSON
const companions = extractAllCompanions();
const output = JSON.stringify(companions, null, 2);
fs.writeFileSync('/Users/sebastiaansmits/Documents/AI-Companion-Reviews/companions_data.json', output);

console.log(`Extracted data for ${companions.length} companions`);
console.log('Data saved to companions_data.json');