#!/usr/bin/env node

/**
 * Generate a complete companion HTML page with AI-generated content
 * Usage: node generate-companion-advanced.js <slug>
 * Example: node generate-companion-advanced.js ehentai-ai
 *
 * Requires: ANTHROPIC_API_KEY environment variable
 */

const https = require('https');
const http = require('http');
const fs = require('fs').promises;
const path = require('path');

const slug = process.argv[2];
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

if (!slug) {
  console.error('❌ Please provide a slug as argument');
  console.error('Usage: node generate-companion-advanced.js <slug>');
  console.error('Example: node generate-companion-advanced.js ehentai-ai');
  process.exit(1);
}

if (!ANTHROPIC_API_KEY) {
  console.error('❌ ANTHROPIC_API_KEY environment variable not set');
  console.error('Please set it in your shell or .env file');
  process.exit(1);
}

async function fetchCompanionData(slug) {
  return new Promise((resolve, reject) => {
    https.get(`https://companionguide.ai/.netlify/functions/companionguide-get`, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          const companion = json.companions.find(c => c.slug === slug);
          if (companion) {
            resolve(companion);
          } else {
            reject(new Error(`Companion with slug "${slug}" not found in Airtable`));
          }
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

async function callClaudeAPI(prompt) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 16000,
      messages: [{
        role: "user",
        content: prompt
      }],
      system: "You are an expert web developer creating AI companion review pages. Generate clean, well-structured HTML that follows the exact template structure provided. Output ONLY the complete HTML code, no explanations or markdown formatting."
    });

    const options = {
      hostname: 'api.anthropic.com',
      port: 443,
      path: '/v1/messages',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
        'Content-Length': data.length
      }
    };

    const req = https.request(options, (res) => {
      let responseData = '';
      res.on('data', chunk => responseData += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(responseData);
          if (json.content && json.content[0] && json.content[0].text) {
            resolve(json.content[0].text);
          } else {
            reject(new Error('Invalid response from Claude API'));
          }
        } catch (e) {
          reject(e);
        }
      });
    });

    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

async function generatePageWithAI(companion, template) {
  console.log('🤖 Generating content with Claude AI...');

  const pricingPlans = companion.pricing_plans ?
    (typeof companion.pricing_plans === 'string' ? JSON.parse(companion.pricing_plans) : companion.pricing_plans) :
    [];

  const features = companion.features ?
    (typeof companion.features === 'string' ? JSON.parse(companion.features) : companion.features) :
    [];

  const prompt = `You are creating a new companion review HTML page for "${companion.name}" (slug: ${companion.slug}).

Use the provided template as a reference for structure, but generate NEW unique content for ${companion.name}.

COMPANION DATA FROM AIRTABLE:
- Name: ${companion.name}
- Rating: ${companion.rating}/10
- Description: ${companion.description}
- Website: ${companion.website_url || companion.affiliate_url}
- Categories: ${companion.categories?.join(', ') || 'ai-girlfriend'}
- Review Count: ${companion.review_count || 0}
- Pricing Plans: ${JSON.stringify(pricingPlans, null, 2)}
- Features: ${JSON.stringify(features, null, 2)}

IMPORTANT INSTRUCTIONS:
1. Keep the EXACT same HTML structure as the template (all sections, classes, IDs)
2. Keep all the same JavaScript includes at the bottom
3. Replace template companion name with "${companion.name}"
4. Replace template slug with "${companion.slug}"
5. Use rating: ${companion.rating}/10 (show as 5 stars visually with Math.round(rating/2), text shows /10)
6. Use "bestRating": "10" in structured data
7. Generate unique, engaging, SEO-optimized content based on the data above
8. Write detailed sections about features, pricing, pros/cons
9. Create compelling FAQ section with 5-8 questions
10. Use SVG icons (not emojis) for all icons: <svg class="icon icon-sm"><use href="#icon-name"/></svg>
11. Available icons: girlfriend, roleplay, video, adult, image-gen, wellness, learning, whatsapp, brain, palette, mobile, chat, target, privacy, voice, memory, characters

Generate the complete HTML page following the template structure exactly.

TEMPLATE:
${template}`;

  const html = await callClaudeAPI(prompt);

  // Remove any markdown code blocks if present
  let cleanHTML = html.replace(/```html\n?/g, '').replace(/```\n?/g, '').trim();

  // Ensure it starts with <!DOCTYPE html>
  if (!cleanHTML.startsWith('<!DOCTYPE')) {
    cleanHTML = '<!DOCTYPE html>\n' + cleanHTML;
  }

  return cleanHTML;
}

async function main() {
  try {
    console.log(`🔍 Fetching data for "${slug}" from Airtable...`);
    const companion = await fetchCompanionData(slug);

    console.log(`✅ Found companion: ${companion.name}`);
    console.log(`   Rating: ${companion.rating}/10`);
    console.log(`   Categories: ${companion.categories?.join(', ') || 'none'}`);
    console.log(`   Reviews: ${companion.review_count || 0}`);

    // Read template
    const templatePath = path.join(__dirname, 'companions/hammer-ai.html');
    const template = await fs.readFile(templatePath, 'utf-8');
    console.log('📄 Loaded Hammer AI template');

    // Generate with AI
    const html = await generatePageWithAI(companion, template);

    // Write file
    const outputPath = path.join(__dirname, `companions/${companion.slug}.html`);
    await fs.writeFile(outputPath, html, 'utf-8');

    console.log(`✅ Successfully generated companions/${companion.slug}.html`);
    console.log(`   File size: ${(html.length / 1024).toFixed(1)} KB`);
    console.log(`🌐 View at: https://companionguide.ai/companions/${companion.slug}`);
    console.log('\n✨ Done! Review the file and commit when ready.');
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    if (error.stack) {
      console.error(error.stack);
    }
    process.exit(1);
  }
}

main();
