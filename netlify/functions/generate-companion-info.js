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

    // Analyze the website
    const analysis = await analyzeWebsite(html, url, pricingHtml);

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

async function analyzeWebsite(html, url, pricingHtml = '') {
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

  // Check for common keywords to determine categories
  const htmlLower = html.toLowerCase();

  if (htmlLower.includes('telegram') || url.includes('t.me')) {
    result.categories.push('Telegram');
    result.platform = 'Telegram Bot';
  }
  if (htmlLower.includes('roleplay') || htmlLower.includes('character')) {
    result.categories.push('Roleplay & Character Chat');
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
