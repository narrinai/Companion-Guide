#!/usr/bin/env node
/**
 * Create Extended Verdict for AI Companion
 *
 * Usage:
 *   node scripts/create-companion-verdict.js "Companion Name" "Brief description of the platform"
 *
 * Example:
 *   node scripts/create-companion-verdict.js "Replika AI" "AI companion app focused on emotional support and friendship"
 *
 * This script will:
 * 1. Generate an extended English verdict (~15-20k chars) in the style of existing reviews
 * 2. Translate to Dutch, German, and Portuguese
 * 3. Output JSON payloads ready for Airtable upload
 *
 * Environment variables required:
 *   ANTHROPIC_API_KEY - Your Anthropic API key
 *
 * After running, you'll have files:
 *   - temp-verdict-en.txt
 *   - temp-verdict-nl.txt
 *   - temp-verdict-de.txt
 *   - temp-verdict-pt.txt
 *   - temp-verdict-payloads.json (ready for Airtable)
 */

const Anthropic = require('@anthropic-ai/sdk');
const fs = require('fs');

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
});

const VERDICT_STYLE_GUIDE = `
Write an extensive, personal review of the AI companion platform in a casual, first-person style.
The review should be approximately 15,000-20,000 characters long.

Structure the review as follows:

1. Opening Summary (2-3 paragraphs)
   - What the platform delivers
   - Who it's ideal for
   - Key differentiators

2. "My X-Week Experience with [Platform]" section
   - Personal narrative of testing the platform
   - Week-by-week breakdown of discoveries
   - Specific examples and anecdotes

3. Week 1: First Impressions
   - Signup process
   - Interface and design
   - Initial character/feature exploration
   - First conversations and impressions

4. Week 2: Deeper Exploration
   - Premium features (if applicable)
   - Character creation or customization
   - Specific examples of what worked well

5. Week 3: Community and Ecosystem
   - User community aspects
   - Content library quality
   - Social features

6. Week 4: Advanced Features
   - Power user features
   - Unique capabilities
   - Comparisons to alternatives

7. Week 5/6: Final Assessment
   - Edge cases and limitations
   - Memory and consistency
   - Server stability

8. Value Assessment
   - Pricing breakdown
   - Comparison to competitors
   - Who should/shouldn't use it

9. Final Thoughts (2-3 paragraphs)
   - Summary of experience
   - Rating with brief justification

IMPORTANT RULES:
- Write in casual, conversational first-person
- Include specific examples and anecdotes
- Be honest about both pros and cons
- DO NOT include a pros/cons bullet list at the end
- Keep brand names in English
- Include specific pricing if known
- End with a rating like "With a X.X/10 rating, [Platform] excels in..."
`;

async function generateVerdict(companionName, description, additionalContext = '') {
  console.log(`Generating extended verdict for ${companionName}...`);

  const prompt = `${VERDICT_STYLE_GUIDE}

Platform to review: ${companionName}
Platform description: ${description}
${additionalContext ? `Additional context: ${additionalContext}` : ''}

Write the complete review now. Make it detailed, personal, and approximately 15,000-20,000 characters.`;

  const message = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 16000,
    messages: [
      {
        role: "user",
        content: prompt
      }
    ]
  });

  return message.content[0].text;
}

async function translateVerdict(text, targetLang, langName) {
  console.log(`Translating to ${langName}...`);

  const message = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 20000,
    messages: [
      {
        role: "user",
        content: `Translate the following AI companion platform review to ${langName}.

IMPORTANT RULES:
- Keep the same structure and formatting (headers, paragraphs, etc.)
- Keep English brand names and platform names as-is
- Keep technical terms that are commonly used in English (e.g., "API", "AI", "NSFW")
- Maintain the casual, personal tone of the review
- Keep ratings (e.g., "7.6/10", "8.2/10") in the same format
- Keep pricing (e.g., "$9.99/month") in the same format

TEXT TO TRANSLATE:

${text}

Respond with ONLY the translated text, no explanations or notes.`
      }
    ]
  });

  return message.content[0].text;
}

async function main() {
  const args = process.argv.slice(2);

  if (args.length < 2) {
    console.log(`
Usage: node scripts/create-companion-verdict.js "Companion Name" "Description" ["Additional context"]

Example:
  node scripts/create-companion-verdict.js "Replika AI" "AI companion focused on emotional support"

  node scripts/create-companion-verdict.js "Candy AI" "NSFW AI girlfriend platform with image generation" "Rating: 7.8/10, Pricing: $12.99/month"
`);
    process.exit(1);
  }

  const companionName = args[0];
  const description = args[1];
  const additionalContext = args[2] || '';

  console.log(`\n=== Creating verdict for ${companionName} ===\n`);

  // Generate English verdict
  const verdictEN = await generateVerdict(companionName, description, additionalContext);
  fs.writeFileSync('temp-verdict-en.txt', verdictEN);
  console.log(`EN verdict saved (${verdictEN.length} chars)`);

  // Translate to other languages
  console.log('\n=== Translating ===\n');

  const verdictNL = await translateVerdict(verdictEN, 'nl', 'Dutch');
  fs.writeFileSync('temp-verdict-nl.txt', verdictNL);
  console.log(`NL translation saved (${verdictNL.length} chars)`);

  const verdictDE = await translateVerdict(verdictEN, 'de', 'German');
  fs.writeFileSync('temp-verdict-de.txt', verdictDE);
  console.log(`DE translation saved (${verdictDE.length} chars)`);

  const verdictPT = await translateVerdict(verdictEN, 'pt-BR', 'Brazilian Portuguese');
  fs.writeFileSync('temp-verdict-pt.txt', verdictPT);
  console.log(`PT translation saved (${verdictPT.length} chars)`);

  // Create payload file for easy Airtable upload
  const payloads = {
    companion: companionName,
    verdicts: {
      en: { fields: { my_verdict: verdictEN } },
      nl: { fields: { my_verdict: verdictNL } },
      de: { fields: { my_verdict: verdictDE } },
      pt: { fields: { my_verdict: verdictPT } }
    }
  };

  fs.writeFileSync('temp-verdict-payloads.json', JSON.stringify(payloads, null, 2));

  console.log(`
=== Complete ===

Files created:
  - temp-verdict-en.txt (${verdictEN.length} chars)
  - temp-verdict-nl.txt (${verdictNL.length} chars)
  - temp-verdict-de.txt (${verdictDE.length} chars)
  - temp-verdict-pt.txt (${verdictPT.length} chars)
  - temp-verdict-payloads.json

To upload to Airtable, use the upload script:
  node scripts/upload-verdict-to-airtable.js <record_id_en> <record_id_nl> <record_id_de> <record_id_pt>
`);
}

main().catch(console.error);
