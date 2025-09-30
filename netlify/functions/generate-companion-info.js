const https = require('https');

exports.handler = async (event, context) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const { url } = JSON.parse(event.body);

    if (!url) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'URL is required' })
      };
    }

    // Fetch website content
    const html = await fetchWebsite(url);

    // Use Claude to analyze the website
    const analysis = await analyzeWebsite(html, url);

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

async function analyzeWebsite(html, url) {
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
    best_for: '',
    content_policy: '',
    min_price: 0,
    platform: 'Web App/Browser'
  };

  // Extract title
  const titleMatch = html.match(/<title[^>]*>(.*?)<\/title>/i);
  if (titleMatch) {
    const title = titleMatch[1].replace(/[<>]/g, '').trim();
    result.short_description = title;
  }

  // Extract meta description
  const metaDescMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["'](.*?)["']/i);
  if (metaDescMatch) {
    result.description = metaDescMatch[1].trim();
  }

  // Check for common keywords to determine categories
  const htmlLower = html.toLowerCase();

  if (htmlLower.includes('telegram') || url.includes('t.me')) {
    result.categories.push('Telegram');
    result.platform = 'Telegram Bot';
  }
  if (htmlLower.includes('girlfriend') || htmlLower.includes('dating')) {
    result.categories.push('AI Girlfriend');
  }
  if (htmlLower.includes('roleplay') || htmlLower.includes('character')) {
    result.categories.push('Roleplay & Character Chat');
  }
  if (htmlLower.includes('nsfw') || htmlLower.includes('adult') || htmlLower.includes('18+')) {
    result.categories.push('NSFW');
  }
  if (htmlLower.includes('image') && htmlLower.includes('generat')) {
    result.categories.push('Image Generation');
  }
  if (htmlLower.includes('video')) {
    result.categories.push('Video');
  }
  if (htmlLower.includes('whatsapp')) {
    result.categories.push('WhatsApp');
    result.platform = 'WhatsApp Bot';
  }

  // Default category if none found
  if (result.categories.length === 0) {
    result.categories.push('AI Companion');
  }

  // Try to extract pricing information
  const priceMatches = html.match(/\$(\d+(?:\.\d{2})?)/g);
  if (priceMatches && priceMatches.length > 0) {
    const prices = priceMatches.map(p => parseFloat(p.replace('$', '')));
    result.min_price = Math.min(...prices);
  }

  // Check for free tier
  if (htmlLower.includes('free') || htmlLower.includes('no credit card')) {
    result.min_price = 0;
  }

  // Generate basic pricing plans structure if prices found
  if (priceMatches && priceMatches.length > 0) {
    result.pricing_plans = [
      {
        name: "Free Plan",
        price: 0,
        period: "free",
        features: [
          "✅ Basic access",
          "✅ Limited messages",
          "❌ Premium features"
        ]
      },
      {
        name: "Premium Plan",
        price: result.min_price > 0 ? result.min_price : 9.99,
        period: "monthly",
        features: [
          "✅ Unlimited messages",
          "✅ Premium features",
          "✅ Priority support"
        ]
      }
    ];
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
  result.best_for = "AI companion experiences";
  result.content_policy = "AI companion interactions";

  // Add AI-specific improvements based on URL domain
  if (url.includes('telegram') || url.includes('t.me')) {
    result.benefits[0].icon = "📱";
    result.benefits[0].title = "Telegram Integration";
    result.benefits[0].description = "Direct messaging convenience";
    result.best_for = "Telegram-based AI conversations";
  }

  return result;
}
