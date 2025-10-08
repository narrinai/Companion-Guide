const https = require('https');

// Fetch Hammer AI template from GitHub to use as reference
async function fetchHammerTemplate() {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'raw.githubusercontent.com',
      port: 443,
      path: '/narrinai/Companion-Guide/main/companions/hammer-ai.html',
      method: 'GET',
      headers: {
        'User-Agent': 'CompanionGuide-Generator'
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => resolve(data));
    });

    req.on('error', reject);
    req.setTimeout(10000, () => {
      req.destroy();
      reject(new Error('Timeout fetching template'));
    });
    req.end();
  });
}

// Call OpenAI API to generate page content
async function generateWithOpenAI(prompt, apiKey) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({
      model: "gpt-4-turbo-preview",
      messages: [
        {
          role: "system",
          content: "You are an expert web developer creating AI companion review pages. Generate clean, well-structured HTML that follows the exact template structure provided. Output ONLY the complete HTML code, no explanations."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 16000,
      temperature: 0.7
    });

    const options = {
      hostname: 'api.openai.com',
      port: 443,
      path: '/v1/chat/completions',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          if (response.choices && response.choices[0]) {
            resolve(response.choices[0].message.content);
          } else {
            reject(new Error('Invalid OpenAI response'));
          }
        } catch (error) {
          reject(error);
        }
      });
    });

    req.on('error', reject);
    req.setTimeout(60000, () => {
      req.destroy();
      reject(new Error('OpenAI API timeout'));
    });

    req.write(postData);
    req.end();
  });
}

// Upload file to GitHub via API
async function uploadToGitHub(slug, content, githubToken) {
  return new Promise((resolve, reject) => {
    const filePath = `companions/${slug}.html`;
    const message = `Add ${slug} companion page via API`;

    const postData = JSON.stringify({
      message: message,
      content: Buffer.from(content).toString('base64'),
      branch: 'main'
    });

    const options = {
      hostname: 'api.github.com',
      port: 443,
      path: `/repos/narrinai/Companion-Guide/contents/${filePath}`,
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${githubToken}`,
        'User-Agent': 'CompanionGuide-Generator',
        'Accept': 'application/vnd.github.v3+json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        if (res.statusCode === 201) {
          resolve(JSON.parse(data));
        } else {
          reject(new Error(`GitHub API error: ${res.statusCode} - ${data}`));
        }
      });
    });

    req.on('error', reject);
    req.setTimeout(30000, () => {
      req.destroy();
      reject(new Error('GitHub API timeout'));
    });

    req.write(postData);
    req.end();
  });
}

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

    // Check for required API keys
    const openaiKey = process.env.OPENAI_API_KEY_COMPANIONGUIDE || process.env.OPENAI_API_KEY;
    if (!openaiKey) {
      throw new Error('OPENAI_API_KEY_COMPANIONGUIDE or OPENAI_API_KEY not configured');
    }
    if (!process.env.GITHUB_TOKEN_COMPANIONGUIDE) {
      throw new Error('GITHUB_TOKEN_COMPANIONGUIDE not configured');
    }

    console.log(`Generating companion page for: ${name} (${slug})`);

    // Fetch Hammer AI template as reference
    console.log('Fetching Hammer AI template...');
    const hammerTemplate = await fetchHammerTemplate();

    // Create comprehensive prompt for OpenAI
    const prompt = `You are creating a new companion review HTML page for "${name}" (slug: ${slug}).

Use the Hammer AI template structure as your guide, but generate NEW unique content for ${name}.

IMPORTANT INSTRUCTIONS:
1. Keep the EXACT same HTML structure as Hammer AI (all sections, classes, IDs)
2. Keep all the same JavaScript includes at the bottom
3. Replace "Hammer AI" with "${name}" throughout
4. Replace "hammer-ai" slug with "${slug}"
5. Use rating: ${rating || 8.5}/10 (display as 5 stars visually, but text shows /10)
6. IMPORTANT: Use "bestRating": "10" in structured data (NOT "5")
7. Generate unique, engaging content based on this data:
   - Description: ${description || 'AI companion platform'}
   - Short description: ${short_description || 'Premium AI companion'}
   - Categories: ${categories?.join(', ') || 'ai-girlfriend'}
   - Website: ${website_url || 'https://example.com'}
   - Pricing: ${pricing_plans || 'Generate 3-4 realistic pricing tiers'}
   - Features: ${features || 'Generate 4-6 key features'}

CONTENT TO GENERATE (similar depth as Hammer AI):
- Complete meta tags (title, description, OG tags, structured data)
- Hero section with tagline
- Quick Facts section (4 boxes: Pricing, Best For, Platform, Content Policy)
- "What is ${name}?" overview with 6 intro highlights
- Detailed pricing section with 3-4 tiers (Free/Starter/Advanced/Ultimate style)
- Pros & Cons lists (8-10 pros, 4-5 cons)
- Verdict section (2 paragraphs)
- Personal Experience section (4-5 week deep dive, 3000+ words like Hammer AI)
- User Reviews section (6 reviews, varied ratings)
- FAQ section (10 questions)

KEEP EXACT SAME:
- All CSS classes and IDs
- Navigation structure
- Footer structure with dynamic featured companions
- All JavaScript includes at bottom

Generate the COMPLETE HTML page now:`;

    // Call OpenAI to generate the page
    console.log('Calling OpenAI API...');
    let generatedHTML = await generateWithOpenAI(prompt, openaiKey);

    // Clean up any markdown code blocks
    generatedHTML = generatedHTML.replace(/```html\n?/g, '').replace(/```\n?$/g, '').trim();

    // Upload to GitHub
    console.log('Uploading to GitHub...');
    await uploadToGitHub(slug, generatedHTML, process.env.GITHUB_TOKEN_COMPANIONGUIDE);

    console.log(`Successfully generated and uploaded page for ${name}`);

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
