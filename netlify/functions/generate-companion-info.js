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

  // Extract features and key information for better descriptions
  const featuresFound = [];
  const keywordsFound = new Set();

  if (combinedText.includes('telegram')) keywordsFound.add('Telegram-based');
  if (combinedText.includes('voice') || combinedText.includes('audio')) {
    keywordsFound.add('voice interactions');
    featuresFound.push('voice chat');
  }
  if (combinedText.includes('image generat')) {
    keywordsFound.add('image generation');
    featuresFound.push('AI image generation');
  }
  if (combinedText.includes('video')) {
    keywordsFound.add('video generation');
    featuresFound.push('video content');
  }
  if (combinedText.includes('memory') || combinedText.includes('remember')) {
    keywordsFound.add('advanced memory');
    featuresFound.push('memory system');
  }
  if (combinedText.includes('roleplay') || combinedText.includes('character')) {
    keywordsFound.add('roleplay scenarios');
    featuresFound.push('character roleplay');
  }
  if (combinedText.includes('personality') || combinedText.includes('custom')) {
    keywordsFound.add('customizable personalities');
    featuresFound.push('personality customization');
  }
  if (combinedText.includes('nsfw') || combinedText.includes('adult') || combinedText.includes('18+')) {
    keywordsFound.add('NSFW content');
  }
  if (combinedText.includes('girlfriend') || combinedText.includes('dating')) {
    keywordsFound.add('AI girlfriend');
  }
  if (combinedText.includes('wellness') || combinedText.includes('mental health')) {
    keywordsFound.add('emotional support');
  }
  if (combinedText.includes('story') || combinedText.includes('narrative')) {
    keywordsFound.add('storytelling');
    featuresFound.push('interactive stories');
  }

  // Build description (25-30 words, factual, third person)
  let description = '';

  // Try meta description first
  for (const { html } of htmlContents) {
    const metaDescMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["'](.*?)["']/i);
    const ogDescMatch = html.match(/<meta[^>]*property=["']og:description["'][^>]*content=["'](.*?)["']/i);

    const desc = metaDescMatch?.[1] || ogDescMatch?.[1] || '';
    if (desc && desc.length > 50) {
      description = desc
        .replace(/<[^>]*>/g, '')
        .replace(/&[^;]+;/g, ' ')
        .trim();
      break;
    }
  }

  // If no meta or too long, build concise description
  if (!description || description.length > 200) {
    const features = Array.from(keywordsFound).slice(0, 3);
    const featureText = features.length > 0 ? features.join(', ') : 'AI conversations';

    // Build third-person description
    if (combinedText.includes('telegram')) {
      description = `Telegram-based AI companion bot with ${featureText}. Offers encrypted messaging and personalized chat experiences.`;
    } else if (combinedText.includes('girlfriend')) {
      description = `AI girlfriend platform featuring ${featureText}. Provides virtual companionship with personalized interactions.`;
    } else if (combinedText.includes('roleplay') || combinedText.includes('character')) {
      description = `AI character chat platform supporting ${featureText}. Offers diverse character interactions and immersive roleplay scenarios.`;
    } else {
      description = `AI companion platform with ${featureText}. Provides personalized conversations and meaningful virtual interactions.`;
    }
  }

  // Trim to reasonable length (keep under 200 chars, ~25-30 words)
  if (description.length > 200) {
    description = description.substring(0, 200).trim();
    const lastPeriod = description.lastIndexOf('.');
    if (lastPeriod > 100) {
      description = description.substring(0, lastPeriod + 1);
    }
  }

  result.description = description;

  // Build short description (10-15 words, very concise)
  let shortDesc = '';
  const topFeatures = Array.from(keywordsFound).slice(0, 3);

  // Build ultra-concise description
  if (combinedText.includes('girlfriend')) {
    const nsfw = combinedText.includes('nsfw') || combinedText.includes('adult') ? 'NSFW ' : '';
    const features = [];
    if (combinedText.includes('uncensored')) features.push('uncensored chat');
    if (hasImage) features.push('images');
    if (hasVoice) features.push('voice messages');
    if (hasVideo) features.push('video');

    if (features.length > 0) {
      shortDesc = `${nsfw}AI girlfriend with ${features.join(', ')}`;
    } else {
      shortDesc = `${nsfw}AI girlfriend for virtual companionship`;
    }
  } else if (combinedText.includes('telegram')) {
    shortDesc = `Telegram AI companion bot with private encrypted messaging`;
  } else if (combinedText.includes('roleplay') || combinedText.includes('character')) {
    shortDesc = `AI character chat with roleplay scenarios and customization`;
  } else {
    // Generic companion
    if (topFeatures.length > 0) {
      shortDesc = `AI companion platform with ${topFeatures.slice(0, 2).join(' and ')}`;
    } else {
      shortDesc = `AI-powered virtual companion for personalized conversations`;
    }
  }

  // Ensure it's concise (max 100 chars, ~10-15 words)
  if (shortDesc.length > 100) {
    shortDesc = shortDesc.substring(0, 100).trim();
  }

  result.short_description = shortDesc;

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

  // Build pricing plans based on detected prices
  const plans = [];

  // Detect features
  const hasVoice = combinedText.includes('voice') || combinedText.includes('audio');
  const hasImage = combinedText.includes('image generat');
  const hasVideo = combinedText.includes('video');
  const hasMemory = combinedText.includes('memory') || combinedText.includes('remember');
  const hasRoleplay = combinedText.includes('roleplay') || combinedText.includes('character');
  const hasCustom = combinedText.includes('custom') || combinedText.includes('personality');
  const hasCommunity = combinedText.includes('discord') || combinedText.includes('community');

  // Add free plan if mentioned
  if (combinedText.includes('free') || combinedText.includes('no cost') || uniquePrices.length > 0) {
    const freeFeatures = [
      "✅ Basic AI chat",
      "✅ Limited daily messages",
      "✅ Core features"
    ];

    if (hasMemory) freeFeatures.push("✅ Basic memory");
    if (hasRoleplay) freeFeatures.push("✅ Basic character access");

    freeFeatures.push("❌ Unlimited messages");
    freeFeatures.push("❌ Premium features");

    plans.push({
      name: "Free Plan",
      price: 0,
      period: "free",
      features: freeFeatures
    });
  }

  // Add paid plans for each detected price
  const tierNames = ["Basic", "Premium", "Pro", "Ultimate"];
  uniquePrices.slice(0, 4).forEach((price, index) => {
    const features = [];

    // Core features
    features.push("✅ Unlimited messages");
    features.push("✅ Premium AI models");

    if (hasRoleplay) features.push("✅ All characters");
    if (hasMemory) features.push("✅ Advanced memory");
    if (hasCustom) features.push("✅ Customization");
    if (hasImage) features.push("✅ Image generation");
    if (hasVideo) features.push("✅ Video generation");
    if (hasVoice) features.push("✅ Voice messages");
    if (hasCommunity) features.push("✅ Community access");

    // Add more features for higher tiers
    if (index >= 1) {
      features.push("✅ Priority support");
    }
    if (index >= 2) {
      features.push("✅ Early access");
    }

    plans.push({
      name: tierNames[index] || `Tier ${index + 1}`,
      price: Math.round(price),
      period: "monthly",
      features: features
    });
  });

  if (plans.length > 0) {
    result.pricing_plans = plans;
  }

  return result;
}
