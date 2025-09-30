const https = require('https');

exports.handler = async (event, context) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const { urls } = JSON.parse(event.body);

    if (!urls || !Array.isArray(urls) || urls.length === 0) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'At least one URL is required' })
      };
    }

    console.log(`Processing ${urls.length} URLs...`);

    // Extract companion name from first URL
    const companionName = extractCompanionName(urls[0]);
    console.log(`Companion name: ${companionName}`);

    // Fetch all URLs
    const htmlContents = [];
    for (const url of urls) {
      try {
        console.log(`Fetching: ${url}`);
        const html = await fetchWebsite(url);
        htmlContents.push({ url, html });
      } catch (error) {
        console.log(`Failed to fetch ${url}:`, error.message);
      }
    }

    if (htmlContents.length === 0) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Could not fetch any of the provided URLs' })
      };
    }

    // Search the web for additional information
    let searchResults = [];
    try {
      searchResults = await searchWeb(companionName);
      console.log(`Found ${searchResults.length} search results`);
    } catch (error) {
      console.log('Web search failed:', error.message);
    }

    // Analyze all content
    const analysis = await analyzeContent(htmlContents, searchResults, companionName);

    return {
      statusCode: 200,
      body: JSON.stringify(analysis)
    };

  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: error.message || 'Failed to generate companion info'
      })
    };
  }
};

function fetchWebsite(url) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);

    const options = {
      hostname: urlObj.hostname,
      port: 443,
      path: urlObj.pathname + urlObj.search,
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; CompanionGuideBot/1.0)',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
      }
    };

    const req = https.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        resolve(data);
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.setTimeout(15000, () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    req.end();
  });
}

function extractCompanionName(url) {
  try {
    const urlObj = new URL(url);
    let name = urlObj.hostname
      .replace(/^www\./, '')
      .replace(/\.(com|ai|io|net|org|app|gg|chat|co|us)$/, '');

    name = name
      .split(/[-.]/)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');

    return name;
  } catch (error) {
    return 'AI Companion';
  }
}

async function searchWeb(query) {
  return new Promise((resolve) => {
    const searchQuery = encodeURIComponent(`${query} AI companion chatbot features pricing review`);
    const options = {
      hostname: 'html.duckduckgo.com',
      port: 443,
      path: `/html/?q=${searchQuery}`,
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; CompanionGuideBot/1.0)'
      }
    };

    const req = https.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const results = [];
          // Extract text from search results
          const snippetMatches = data.matchAll(/<a class="result__snippet"[^>]*>(.*?)<\/a>/gi);

          for (const match of snippetMatches) {
            const snippet = match[1]
              .replace(/<[^>]*>/g, '')
              .replace(/&quot;/g, '"')
              .replace(/&#x27;/g, "'")
              .replace(/&amp;/g, '&')
              .replace(/&[^;]+;/g, ' ')
              .trim();

            if (snippet.length > 30) {
              results.push(snippet);
            }

            if (results.length >= 10) break;
          }

          resolve(results);
        } catch (error) {
          resolve([]);
        }
      });
    });

    req.on('error', () => resolve([]));
    req.setTimeout(10000, () => {
      req.destroy();
      resolve([]);
    });

    req.end();
  });
}

async function analyzeContent(htmlContents, searchResults, companionName) {
  const result = {
    description: '',
    short_description: '',
    pros: '',
    cons: '',
    pricing_plans: []
  };

  // Combine all HTML content
  const allHtml = htmlContents.map(h => h.html).join('\n');
  const htmlLower = allHtml.toLowerCase();
  const searchText = searchResults.join(' ');
  const combinedText = (htmlLower + ' ' + searchText).toLowerCase();

  // Extract short description from title
  for (const { html } of htmlContents) {
    const titleMatch = html.match(/<title[^>]*>(.*?)<\/title>/i);
    if (titleMatch && !result.short_description) {
      let title = titleMatch[1]
        .replace(/<[^>]*>/g, '')
        .replace(/&[^;]+;/g, ' ')
        .trim();

      title = title.split(/[|\-–—]/)[0].trim();
      if (title.length > 10) {
        result.short_description = title;
        break;
      }
    }
  }

  // Extract description from meta tags
  for (const { html } of htmlContents) {
    if (result.description) break;

    const metaDescMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["'](.*?)["']/i);
    const ogDescMatch = html.match(/<meta[^>]*property=["']og:description["'][^>]*content=["'](.*?)["']/i);

    const description = metaDescMatch?.[1] || ogDescMatch?.[1] || '';
    if (description) {
      result.description = description
        .replace(/<[^>]*>/g, '')
        .replace(/&[^;]+;/g, ' ')
        .trim();
    }
  }

  // Enhance description with content from paragraphs
  if (!result.description || result.description.length < 100) {
    const paragraphs = [];
    for (const { html } of htmlContents) {
      const pMatches = html.matchAll(/<p[^>]*>(.*?)<\/p>/gi);
      for (const match of pMatches) {
        const text = match[1]
          .replace(/<[^>]*>/g, '')
          .replace(/&[^;]+;/g, ' ')
          .trim();

        if (text.length > 50 && !text.toLowerCase().includes('cookie') && !text.toLowerCase().includes('privacy')) {
          paragraphs.push(text);
          if (paragraphs.length >= 3) break;
        }
      }
      if (paragraphs.length >= 3) break;
    }

    if (paragraphs.length > 0) {
      result.description = paragraphs.join(' ').substring(0, 500);
    }
  }

  // Use search results as fallback or enhancement
  if (!result.description && searchResults.length > 0) {
    result.description = searchResults.slice(0, 3).join(' ').substring(0, 500);
  } else if (searchResults.length > 0 && result.description.length < 200) {
    result.description += ' ' + searchResults[0];
  }

  // Ensure description is comprehensive
  if (result.description.length < 150 && searchResults.length > 0) {
    result.description = `${companionName} is an AI companion platform. ${searchResults.slice(0, 2).join(' ')}`.substring(0, 500);
  }

  // Extract and analyze features from all sources
  const features = new Set();
  const prosSet = new Set();
  const consSet = new Set();

  // Feature detection
  if (combinedText.includes('voice') || combinedText.includes('audio')) {
    features.add('Voice interactions');
    prosSet.add('Voice chat support');
  }
  if (combinedText.includes('image generat')) {
    features.add('Image generation');
    prosSet.add('AI image generation');
  }
  if (combinedText.includes('video')) {
    features.add('Video content');
    prosSet.add('Video support');
  }
  if (combinedText.includes('memory') || combinedText.includes('remember')) {
    features.add('Advanced memory system');
    prosSet.add('Remembers conversations');
  }
  if (combinedText.includes('personality') || combinedText.includes('custom')) {
    features.add('Customizable personalities');
    prosSet.add('Personality customization');
  }
  if (combinedText.includes('roleplay')) {
    features.add('Roleplay scenarios');
    prosSet.add('Roleplay support');
  }
  if (combinedText.includes('24/7') || combinedText.includes('always available')) {
    prosSet.add('24/7 availability');
  }
  if (combinedText.includes('free')) {
    prosSet.add('Free tier available');
  }
  if (combinedText.includes('realistic') || combinedText.includes('natural')) {
    prosSet.add('Natural conversations');
  }
  if (combinedText.includes('easy') || combinedText.includes('user-friendly') || combinedText.includes('simple')) {
    prosSet.add('Easy to use');
  }
  if (combinedText.includes('fast') || combinedText.includes('quick response')) {
    prosSet.add('Fast responses');
  }
  if (combinedText.includes('mobile app') || combinedText.includes('ios') || combinedText.includes('android')) {
    prosSet.add('Mobile app available');
  }

  // Cons detection
  if (combinedText.includes('expensive') || combinedText.includes('costly')) {
    consSet.add('Higher pricing');
  }
  if (combinedText.includes('limited free')) {
    consSet.add('Limited free features');
  }
  if (combinedText.includes('no mobile app')) {
    consSet.add('No mobile app');
  }
  if (combinedText.includes('web only')) {
    consSet.add('Web-only platform');
  }

  // Add default pros/cons if none found
  if (prosSet.size === 0) {
    prosSet.add('AI-powered conversations');
    prosSet.add('Personalized interactions');
    prosSet.add('Easy to get started');
  }
  if (consSet.size === 0) {
    consSet.add('Requires internet connection');
    consSet.add('Premium features require subscription');
  }

  result.pros = Array.from(prosSet).join(', ');
  result.cons = Array.from(consSet).join(', ');

  // Extract pricing
  const allPrices = [];
  const priceMatches = combinedText.matchAll(/\$(\d+(?:\.\d{2})?)/g);
  for (const match of priceMatches) {
    const price = parseFloat(match[1]);
    if (price > 0 && price < 1000) {
      allPrices.push(price);
    }
  }

  const uniquePrices = [...new Set(allPrices)].sort((a, b) => a - b);

  // Build pricing plans
  const plans = [];

  if (combinedText.includes('free') || combinedText.includes('no cost') || combinedText.includes('$0')) {
    plans.push({
      name: "Free Plan",
      price: 0,
      period: "free",
      features: [
        "✅ Basic AI chat",
        "✅ Limited messages",
        "❌ Premium features"
      ]
    });
  }

  uniquePrices.slice(0, 3).forEach((price, index) => {
    const tierNames = ["Basic", "Premium", "Pro"];
    plans.push({
      name: `${tierNames[index] || 'Premium'} Plan`,
      price: price,
      period: "monthly",
      features: [
        "✅ Unlimited messages",
        "✅ Premium AI features",
        "✅ Priority support"
      ]
    });
  });

  if (plans.length > 0) {
    result.pricing_plans = plans;
  }

  return result;
}
