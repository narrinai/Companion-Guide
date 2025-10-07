const Anthropic = require("@anthropic-ai/sdk");
const fs = require('fs').promises;
const path = require('path');

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

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

    // Read the Secrets AI template
    const templatePath = path.join(__dirname, '../../companions/secrets-ai.html');
    const secretsTemplate = await fs.readFile(templatePath, 'utf-8');

    // Create prompt for Claude to generate the companion page
    const prompt = `You are creating a new companion review HTML page for "${name}" (slug: ${slug}).

Use the Secrets AI template as a reference for structure, but generate NEW unique content for ${name}.

IMPORTANT INSTRUCTIONS:
1. Keep the EXACT same HTML structure as Secrets AI (all sections, classes, IDs)
2. Keep all the same JavaScript includes at the bottom
3. Replace "Secrets AI" with "${name}" throughout
4. Replace "secrets-ai" slug with "${slug}"
5. Use rating: ${rating}/5
6. Generate unique, engaging content based on this data:
   - Description: ${description || 'AI companion platform'}
   - Short description: ${short_description || 'Premium AI companion'}
   - Categories: ${categories?.join(', ') || 'ai-girlfriend'}
   - Website: ${website_url || 'https://example.com'}

STATIC CONTENT TO GENERATE:
- Meta tags (title, description, OG tags) specific to ${name}
- Hero section tagline
- "What is ${name}?" overview section with 6 intro highlights
- Pricing section with tiers (use provided pricing_plans if available: ${pricing_plans || 'generate 3 tiers'})
- Pros & Cons lists (8-10 pros, 4-5 cons)
- Verdict section
- 4-5 user reviews (realistic, varied ratings)
- FAQ section (10 questions specific to ${name})

DYNAMIC CONTENT (keep placeholders for JavaScript):
- Logo: ../images/logos/${slug}.png
- Rating stars (will be filled by companion-page.js)
- Alternatives section (will be filled by alternatives.js)
- Footer featured companions (will be filled dynamically)

KEEP THESE SCRIPTS AT THE BOTTOM (EXACT):
- ../script.js
- ../js/companions.js
- ../js/companion-page.js
- ../js/alternatives.js
- ../js/companion-header.js
- /faq-interactions.js
- ../js/review-names.js
- /js/meta-companion-tracking.js

Generate the complete HTML page following Secrets AI's structure exactly.`;

    // Call Claude API to generate the page
    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 16000,
      messages: [{
        role: "user",
        content: prompt
      }],
      system: "You are an expert web developer creating AI companion review pages. Generate clean, well-structured HTML that follows the exact template structure provided. Output ONLY the complete HTML code, no explanations."
    });

    // Extract the generated HTML from Claude's response
    let generatedHTML = message.content[0].text;

    // Remove any markdown code blocks if present
    generatedHTML = generatedHTML.replace(/```html\n?/g, '').replace(/```\n?/g, '');

    // Write the generated HTML to the companions directory
    const outputPath = path.join(__dirname, `../../companions/${slug}.html`);
    await fs.writeFile(outputPath, generatedHTML, 'utf-8');

    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        message: `Successfully generated page for ${name}`,
        path: `companions/${slug}.html`
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
