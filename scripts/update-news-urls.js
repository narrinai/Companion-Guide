#!/usr/bin/env node

/**
 * Update News Article URLs Script
 *
 * This script updates hard-coded companion URLs in news articles with the
 * correct URLs from Airtable.
 *
 * Usage: node scripts/update-news-urls.js
 */

const fs = require('fs');
const path = require('path');
const fetch = require('node-fetch');

const API_URL = 'http://localhost:8888/.netlify/functions/companionguide-get';
const NEWS_DIR = './news';

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
    const response = await fetch(API_URL);
    const data = await response.json();
    log(`✅ Fetched ${data.companions.length} companions`, 'green');
    return data.companions;
}

async function main() {
    log('\n🚀 News Article URL Update Script', 'blue');
    log('═══════════════════════════════════════════', 'blue');

    const companions = await fetchCompanions();

    // Create URL mapping for all companions
    const urlMap = {};
    companions.forEach(c => {
        if (c.website_url || c.affiliate_url) {
            const url = c.website_url || c.affiliate_url;
            urlMap[c.slug] = url;
            urlMap[c.name.toLowerCase().replace(/\s+/g, '')] = url;
        }
    });

    log(`\n📝 Created URL mapping for ${Object.keys(urlMap).length / 2} companions`, 'blue');

    // Read all news HTML files
    const newsFiles = fs.readdirSync(NEWS_DIR)
        .filter(f => f.endsWith('.html'))
        .map(f => path.join(NEWS_DIR, f));

    log(`\n📁 Found ${newsFiles.length} news articles`, 'blue');

    let totalUpdated = 0;
    let totalChanges = 0;

    for (const filePath of newsFiles) {
        const fileName = path.basename(filePath);
        let html = fs.readFileSync(filePath, 'utf8');
        let hasChanges = false;
        let changeCount = 0;

        // Find all URLs to replace
        for (const [companionKey, correctUrl] of Object.entries(urlMap)) {
            // Skip name-based keys (only use slug-based)
            if (companionKey.includes('-')) {
                // Pattern: look for old URLs that should be replaced
                const patterns = [
                    // Direct companion domain URLs
                    new RegExp(`https?://[^"'\\s]*${companionKey.replace(/-/g, '')}[^"'\\s]*(?:\\?[^"'\\s]*)?`, 'gi'),
                    // Common old patterns
                    new RegExp(`https?://[^"'\\s]*/${companionKey}[^"'\\s]*`, 'gi')
                ];

                patterns.forEach(pattern => {
                    const matches = html.match(pattern);
                    if (matches) {
                        matches.forEach(oldUrl => {
                            // Only replace if it's in an href and not already correct
                            if (oldUrl !== correctUrl && html.includes(`href="${oldUrl}"`)) {
                                const before = html;
                                html = html.replace(new RegExp(`href="${oldUrl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}"`, 'g'), `href="${correctUrl}"`);
                                if (html !== before) {
                                    log(`  🔄 ${fileName}: ${oldUrl.substring(0, 50)}... → ${correctUrl.substring(0, 50)}...`, 'gray');
                                    hasChanges = true;
                                    changeCount++;
                                }
                            }
                        });
                    }
                });
            }
        }

        if (hasChanges) {
            fs.writeFileSync(filePath, html, 'utf8');
            log(`✅ Updated ${fileName}: ${changeCount} URL(s) changed`, 'green');
            totalUpdated++;
            totalChanges += changeCount;
        }
    }

    log('\n═══════════════════════════════════════════', 'blue');
    log('📊 SUMMARY', 'blue');
    log('═══════════════════════════════════════════', 'blue');
    log(`✅ Articles updated: ${totalUpdated}`, 'green');
    log(`🔗 Total URL changes: ${totalChanges}`, 'green');
    log('\n✨ Done!', 'green');
}

main().catch(error => {
    log(`\n❌ Error: ${error.message}`, 'red');
    console.error(error);
    process.exit(1);
});
