#!/usr/bin/env node

/**
 * Update Companion URLs Script
 *
 * This script fetches the latest companion data from Airtable and updates
 * all hard-coded URLs in companion HTML files with the correct website_url
 * from Airtable.
 *
 * Usage: node scripts/update-companion-urls.js [companion-slug]
 *
 * Examples:
 *   node scripts/update-companion-urls.js                    # Update all companions
 *   node scripts/update-companion-urls.js ourdream-ai       # Update only OurDream AI
 */

const fs = require('fs');
const path = require('path');
const fetch = require('node-fetch');

// Configuration
const API_URL = 'http://localhost:8888/.netlify/functions/companionguide-get';
const COMPANION_DIRS = [
    './companions',
    './nl/companions',
    './pt/companions',
    './de/companions'
];

// Colors for console output
const colors = {
    reset: '\x1b[0m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    red: '\x1b[31m',
    gray: '\x1b[90m'
};

function log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

async function fetchCompanions() {
    log('\n📡 Fetching companion data from Airtable...', 'blue');

    try {
        const response = await fetch(API_URL);
        const data = await response.json();

        if (!data.companions || !Array.isArray(data.companions)) {
            throw new Error('Invalid API response');
        }

        log(`✅ Fetched ${data.companions.length} companions`, 'green');
        return data.companions;
    } catch (error) {
        log(`❌ Error fetching companions: ${error.message}`, 'red');
        throw error;
    }
}

function findCompanionHtmlFiles(slug = null) {
    const files = [];

    COMPANION_DIRS.forEach(dir => {
        if (!fs.existsSync(dir)) {
            log(`⚠️  Directory not found: ${dir}`, 'yellow');
            return;
        }

        const items = fs.readdirSync(dir);
        items.forEach(item => {
            if (item.endsWith('.html')) {
                // If slug is provided, only include matching files
                if (!slug || item === `${slug}.html`) {
                    files.push(path.join(dir, item));
                }
            }
        });
    });

    return files;
}

function extractOldUrls(html, companionName) {
    // Try to find existing URLs in the HTML
    // Look for various URL patterns that might be used
    const urlPatterns = [
        // Direct domain URLs
        new RegExp(`https?://[^"'\\s]+${companionName.toLowerCase().replace(/\\s+/g, '')}[^"'\\s]*`, 'gi'),
        // Affiliate tracking URLs
        /https?:\/\/[^"'\s]+(?:ref=|fpr=|aff=)[^"'\s]*/gi,
        // Common tracking domains
        /https?:\/\/(?:www\.)?(?:t\.mbsrv2\.com|df4qnp8trk\.com|track\.[^"'\s]+)[^"'\s]*/gi
    ];

    const foundUrls = new Set();

    urlPatterns.forEach(pattern => {
        const matches = html.match(pattern);
        if (matches) {
            matches.forEach(url => foundUrls.add(url));
        }
    });

    return Array.from(foundUrls);
}

function updateHtmlUrls(html, oldUrls, newUrl, companionSlug) {
    let updatedHtml = html;
    let changeCount = 0;

    // Replace each old URL with the new one
    oldUrls.forEach(oldUrl => {
        // Only replace if it's in an href attribute and not a language switcher
        const hrefPattern = new RegExp(`href=["']${oldUrl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}["']`, 'g');
        const matches = updatedHtml.match(hrefPattern);

        if (matches) {
            // Check if this is not a language switcher link
            matches.forEach(match => {
                const context = updatedHtml.substring(
                    Math.max(0, updatedHtml.indexOf(match) - 100),
                    updatedHtml.indexOf(match) + match.length + 100
                );

                // Skip if it's a language switcher (has lang-option class nearby)
                if (context.includes('lang-option')) {
                    return;
                }

                // Replace the URL
                const newHref = `href="${newUrl}"`;
                updatedHtml = updatedHtml.replace(hrefPattern, newHref);
                changeCount++;
            });
        }
    });

    return { html: updatedHtml, changeCount };
}

function updateStructuredDataUrl(html, newUrl) {
    // Update JSON-LD structured data
    const scriptPattern = /<script type="application\/ld\+json">([\s\S]*?)<\/script>/g;
    let updatedHtml = html;
    let updated = false;

    const matches = [...html.matchAll(scriptPattern)];
    matches.forEach(match => {
        try {
            const jsonString = match[1].trim();
            const data = JSON.parse(jsonString);

            // Update Review schema url
            if (data['@type'] === 'Review' && data.itemReviewed && data.itemReviewed.url) {
                data.itemReviewed.url = newUrl;
                const newJsonString = JSON.stringify(data, null, 2);
                updatedHtml = updatedHtml.replace(match[1], `\n    ${newJsonString}\n    `);
                updated = true;
            }
        } catch (e) {
            // Skip invalid JSON
        }
    });

    return { html: updatedHtml, updated };
}

async function updateCompanionFile(filePath, companion) {
    const companionName = companion.name;
    const companionSlug = companion.slug;
    const websiteUrl = companion.website_url || companion.affiliate_url;

    if (!websiteUrl) {
        log(`  ⚠️  No website_url found for ${companionName}`, 'yellow');
        return { updated: false, changes: 0 };
    }

    // Read HTML file
    const html = fs.readFileSync(filePath, 'utf8');

    // Find old URLs to replace
    const oldUrls = extractOldUrls(html, companionName);

    if (oldUrls.length === 0) {
        log(`  ℹ️  No URLs found to update in ${path.basename(filePath)}`, 'gray');
        return { updated: false, changes: 0 };
    }

    log(`  🔍 Found ${oldUrls.length} URL pattern(s) to update`, 'blue');
    oldUrls.forEach(url => {
        log(`     ${url.substring(0, 60)}...`, 'gray');
    });

    // Update URLs in HTML
    let result = updateHtmlUrls(html, oldUrls, websiteUrl, companionSlug);
    let updatedHtml = result.html;
    let totalChanges = result.changeCount;

    // Update structured data
    const structuredResult = updateStructuredDataUrl(updatedHtml, websiteUrl);
    updatedHtml = structuredResult.html;
    if (structuredResult.updated) {
        totalChanges++;
        log(`  ✅ Updated JSON-LD structured data`, 'green');
    }

    if (totalChanges === 0) {
        log(`  ℹ️  No changes needed in ${path.basename(filePath)}`, 'gray');
        return { updated: false, changes: 0 };
    }

    // Write updated HTML back to file
    fs.writeFileSync(filePath, updatedHtml, 'utf8');

    log(`  ✅ Updated ${totalChanges} URL(s) → ${websiteUrl.substring(0, 50)}...`, 'green');
    return { updated: true, changes: totalChanges };
}

async function main() {
    log('\n🚀 Companion URL Update Script', 'blue');
    log('═══════════════════════════════════════════', 'blue');

    // Get optional companion slug from command line
    const targetSlug = process.argv[2];

    if (targetSlug) {
        log(`\n🎯 Targeting specific companion: ${targetSlug}`, 'yellow');
    } else {
        log('\n📦 Updating all companions', 'blue');
    }

    try {
        // Fetch companions from Airtable
        const companions = await fetchCompanions();

        // Find HTML files to update
        const htmlFiles = findCompanionHtmlFiles(targetSlug);
        log(`\n📁 Found ${htmlFiles.length} HTML file(s) to check`, 'blue');

        if (htmlFiles.length === 0) {
            log('⚠️  No HTML files found to update', 'yellow');
            return;
        }

        // Group files by companion slug
        const filesBySlug = {};
        htmlFiles.forEach(file => {
            const basename = path.basename(file, '.html');
            if (!filesBySlug[basename]) {
                filesBySlug[basename] = [];
            }
            filesBySlug[basename].push(file);
        });

        // Update each companion
        let totalUpdated = 0;
        let totalChanges = 0;

        for (const [slug, files] of Object.entries(filesBySlug)) {
            // Find companion data
            const companion = companions.find(c => c.slug === slug);

            if (!companion) {
                log(`\n⚠️  No Airtable data found for: ${slug}`, 'yellow');
                continue;
            }

            log(`\n📝 Processing: ${companion.name} (${slug})`, 'blue');
            log(`   Website URL: ${companion.website_url?.substring(0, 60) || 'N/A'}...`, 'gray');

            // Update each language version
            for (const file of files) {
                const lang = file.includes('/nl/') ? 'NL' :
                           file.includes('/pt/') ? 'PT' :
                           file.includes('/de/') ? 'DE' : 'EN';

                log(`  📄 ${lang}: ${path.relative('.', file)}`, 'blue');

                const result = await updateCompanionFile(file, companion);
                if (result.updated) {
                    totalUpdated++;
                    totalChanges += result.changes;
                }
            }
        }

        // Summary
        log('\n═══════════════════════════════════════════', 'blue');
        log('📊 SUMMARY', 'blue');
        log('═══════════════════════════════════════════', 'blue');
        log(`✅ Files updated: ${totalUpdated}`, 'green');
        log(`🔗 Total URL changes: ${totalChanges}`, 'green');
        log('\n✨ Done!', 'green');

    } catch (error) {
        log(`\n❌ Error: ${error.message}`, 'red');
        console.error(error);
        process.exit(1);
    }
}

// Run the script
main();
