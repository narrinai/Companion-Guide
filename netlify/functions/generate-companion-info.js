const https = require('https');

exports.handler = async (event, context) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const { url, pricing_url } = JSON.parse(event.body);

    if (!url) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'URL is required' })
      };
    }

    // Extract companion name from URL
    const companionName = extractCompanionName(url);

    // Fetch website content
    const html = await fetchWebsite(url);

    // Fetch pricing page if provided
    let pricingHtml = '';
    if (pricing_url) {
      try {
        pricingHtml = await fetchWebsite(pricing_url);
      } catch (error) {
        console.log('Could not fetch pricing URL:', error.message);
      }
    }

    // Search the web for additional information
    let searchResults = [];
    try {
      searchResults = await searchWeb(companionName);
      console.log(`Found ${searchResults.length} search results for ${companionName}`);
    } catch (error) {
      console.log('Could not perform web search:', error.message);
    }

    // Analyze the website with additional context
    const analysis = await analyzeWebsite(html, url, pricingHtml, searchResults);

    return {
      statusCode: 200,
      body: JSON.stringify(analysis)
    };

  } catch (error) {
    console.error('Error generating companion info:', error);
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
        'User-Agent': 'Mozilla/5.0 (compatible; CompanionGuideBot/1.0)'
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

    req.setTimeout(10000, () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    req.end();
  });
}

function extractCompanionName(url) {
  try {
    const urlObj = new URL(url);
    // Remove common TLDs and www
    let name = urlObj.hostname
      .replace(/^www\./, '')
      .replace(/\.(com|ai|io|net|org|app|gg|chat)$/, '');

    // Convert to readable format
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
  return new Promise((resolve, reject) => {
    // Using DuckDuckGo HTML search (no API key needed)
    const searchQuery = encodeURIComponent(`${query} AI companion review features pricing`);
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
          // Extract snippets from search results
          const results = [];
          const snippetMatches = data.matchAll(/<a class="result__snippet"[^>]*>(.*?)<\/a>/gi);

          for (const match of snippetMatches) {
            const snippet = match[1]
              .replace(/<[^>]*>/g, '')
              .replace(/&[^;]+;/g, ' ')
              .trim();

            if (snippet.length > 20) {
              results.push(snippet);
            }

            if (results.length >= 5) break;
          }

          resolve(results);
        } catch (error) {
          resolve([]);
        }
      });
    });

    req.on('error', (error) => {
      resolve([]); // Don't fail if search fails
    });

    req.setTimeout(5000, () => {
      req.destroy();
      resolve([]);
    });

    req.end();
  });
}

async function analyzeWebsite(html, url, pricingHtml = '', searchResults = []) {
  // Simple HTML parsing to extract key information
  const result = {
    description: '',
    short_description: '',
    key_features: '',
    categories: [],
    badges: ['New'],
    pricing_plans: null,
    benefits: null,
    pros: '',
    cons: '',
    platform: 'Web App/Browser'
  };

  // Extract title for short description
  const titleMatch = html.match(/<title[^>]*>(.*?)<\/title>/i);
  if (titleMatch) {
    let title = titleMatch[1]
      .replace(/<[^>]*>/g, '') // Remove any HTML tags
      .replace(/&[^;]+;/g, ' ') // Replace HTML entities
      .trim();

    // Clean up common title separators
    title = title.split(/[|\-–—]/)[0].trim();
    result.short_description = title;
  }

  // Extract meta description for full description
  const metaDescMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["'](.*?)["']/i);
  const ogDescMatch = html.match(/<meta[^>]*property=["']og:description["'][^>]*content=["'](.*?)["']/i);

  const description = metaDescMatch?.[1] || ogDescMatch?.[1] || '';
  if (description) {
    result.description = description
      .replace(/<[^>]*>/g, '')
      .replace(/&[^;]+;/g, ' ')
      .trim();
  }

  // If no description found, try to extract from first paragraph
  if (!result.description) {
    const firstPMatch = html.match(/<p[^>]*>(.*?)<\/p>/i);
    if (firstPMatch) {
      result.description = firstPMatch[1]
        .replace(/<[^>]*>/g, '')
        .replace(/&[^;]+;/g, ' ')
        .trim()
        .substring(0, 300);
    }
  }

  // Enhance description with search results
  if (!result.description && searchResults.length > 0) {
    result.description = searchResults[0];
  }

  // If we have search results, try to extract more features
  const searchText = searchResults.join(' ').toLowerCase();
  if (searchText.length > 0) {
    // Extract additional features from search results
    const additionalFeatures = [];

    if (searchText.includes('voice') || searchText.includes('audio')) {
      additionalFeatures.push('Voice interactions');
    }
    if (searchText.includes('image generat')) {
      additionalFeatures.push('Image generation');
    }
    if (searchText.includes('video')) {
      additionalFeatures.push('Video content');
    }
    if (searchText.includes('memory') || searchText.includes('remember')) {
      additionalFeatures.push('Advanced memory');
    }
    if (searchText.includes('personality') || searchText.includes('custom')) {
      additionalFeatures.push('Customizable personality');
    }
    if (searchText.includes('roleplay')) {
      additionalFeatures.push('Roleplay scenarios');
    }

    if (additionalFeatures.length > 0) {
      result.key_features = result.key_features + ', ' + additionalFeatures.join(', ');
    }

    // Try to find pricing info in search results
    const priceMatches = searchText.match(/\$(\d+(?:\.\d{2})?)/g);
    if (priceMatches && priceMatches.length > 0 && !pricingHtml) {
      pricingHtml = searchText; // Use search results as pricing source
    }
  }

  // Check for common keywords to determine categories (from HTML and search results)
  const htmlLower = html.toLowerCase();
  const combinedText = (htmlLower + ' ' + searchText).toLowerCase();

  if (combinedText.includes('telegram') || url.includes('t.me')) {
    result.categories.push('Telegram');
    result.platform = 'Telegram Bot';
  }
  if (combinedText.includes('roleplay') || combinedText.includes('character chat')) {
    result.categories.push('Roleplay & Character Chat');
  }
  if (combinedText.includes('image generat')) {
    result.categories.push('Image Generation');
  }
  if (combinedText.includes('video')) {
    result.categories.push('Video');
  }
  if (combinedText.includes('whatsapp')) {
    result.categories.push('WhatsApp');
    result.platform = 'WhatsApp Bot';
  }
  if (combinedText.includes('learning') || combinedText.includes('education')) {
    result.categories.push('Learning');
  }
  if (combinedText.includes('wellness') || combinedText.includes('mental health')) {
    result.categories.push('Wellness');
  }

  // Default category if none found
  if (result.categories.length === 0) {
    result.categories.push('AI Companion');
  }

  // Enhanced pros/cons from search results
  if (searchText.length > 0) {
    const prosKeywords = [];
    const consKeywords = [];

    if (searchText.includes('easy to use') || searchText.includes('user-friendly')) {
      prosKeywords.push('User-friendly interface');
    }
    if (searchText.includes('realistic') || searchText.includes('natural')) {
      prosKeywords.push('Realistic conversations');
    }
    if (searchText.includes('free') || searchText.includes('no cost')) {
      prosKeywords.push('Free tier available');
    }
    if (searchText.includes('24/7') || searchText.includes('always available')) {
      prosKeywords.push('24/7 availability');
    }
    if (searchText.includes('fast') || searchText.includes('quick response')) {
      prosKeywords.push('Fast responses');
    }

    if (searchText.includes('expensive') || searchText.includes('pricey')) {
      consKeywords.push('Higher pricing');
    }
    if (searchText.includes('limited free') || searchText.includes('restricted')) {
      consKeywords.push('Limited free features');
    }
    if (searchText.includes('slow') || searchText.includes('laggy')) {
      consKeywords.push('Occasional slow responses');
    }

    if (prosKeywords.length > 0) {
      result.pros = prosKeywords.join(', ') + (result.pros ? ', ' + result.pros : '');
    }
    if (consKeywords.length > 0) {
      result.cons = consKeywords.join(', ') + (result.cons ? ', ' + result.cons : '');
    }
  }

  // Try to extract pricing information from pricing page or main page
  const pricingContent = pricingHtml || html;
  const priceMatches = pricingContent.match(/\$(\d+(?:\.\d{2})?)/g);

  if (priceMatches && priceMatches.length > 0) {
    const prices = priceMatches.map(p => parseFloat(p.replace('$', ''))).filter(p => p > 0);
    const uniquePrices = [...new Set(prices)].sort((a, b) => a - b);

    const plans = [];

    // Add free plan if mentioned
    if (htmlLower.includes('free') || htmlLower.includes('no credit card')) {
      plans.push({
        name: "Free Plan",
        price: 0,
        period: "free",
        features: [
          "✅ Basic access",
          "✅ Limited messages",
          "❌ Premium features"
        ]
      });
    }

    // Add pricing tiers based on found prices
    uniquePrices.slice(0, 3).forEach((price, index) => {
      const tierNames = ["Starter", "Premium", "Pro"];
      plans.push({
        name: `${tierNames[index] || 'Premium'} Plan`,
        price: price,
        period: "monthly",
        features: [
          "✅ Unlimited messages",
          "✅ Premium features",
          "✅ Priority support"
        ]
      });
    });

    if (plans.length > 0) {
      result.pricing_plans = plans;
    }
  }

  // Generate basic benefits
  result.benefits = [
    {
      icon: "💬",
      title: "AI Conversations",
      description: "Natural chat interactions"
    },
    {
      icon: "🔒",
      title: "Privacy",
      description: "Secure conversations"
    },
    {
      icon: "⚡",
      title: "Fast Responses",
      description: "Quick AI replies"
    }
  ];

  // Set basic features, pros, cons
  result.key_features = "AI chat, Personalized conversations, Memory system";
  result.pros = "Easy to use, Good AI responses, Accessible platform";
  result.cons = "Limited free tier, Requires account";

  // Add AI-specific improvements based on URL domain
  if (url.includes('telegram') || url.includes('t.me')) {
    result.benefits[0].icon = "📱";
    result.benefits[0].title = "Telegram Integration";
    result.benefits[0].description = "Direct messaging convenience";
  }

  return result;
}
