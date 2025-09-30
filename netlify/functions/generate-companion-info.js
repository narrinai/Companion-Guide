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

  // Build comprehensive description (single sentence, 30-40 words)
  const descParts = [];
  descParts.push(`${companionName} is an AI companion platform`);

  if (keywordsFound.size > 0) {
    const features = Array.from(keywordsFound).slice(0, 4).join(', ');
    descParts.push(`offering ${features}`);
  }

  // Add purpose/benefit
  if (combinedText.includes('personal growth') || combinedText.includes('wellness')) {
    descParts.push('for personal growth and emotional wellness');
  } else if (combinedText.includes('girlfriend') || combinedText.includes('romance')) {
    descParts.push('for intimate virtual relationships and companionship');
  } else if (combinedText.includes('roleplay') || combinedText.includes('character')) {
    descParts.push('for immersive character interactions and roleplay experiences');
  } else {
    descParts.push('for personalized AI conversations and meaningful connections');
  }

  result.description = descParts.join(' ') + '.';

  // Build short description (2 sentences, 25-35 words total)
  let shortDesc = '';

  // Extract title for first part
  for (const { html } of htmlContents) {
    const titleMatch = html.match(/<title[^>]*>(.*?)<\/title>/i);
    if (titleMatch && !shortDesc) {
      let title = titleMatch[1]
        .replace(/<[^>]*>/g, '')
        .replace(/&[^;]+;/g, ' ')
        .trim();
      title = title.split(/[|\-–—]/)[0].trim();
      if (title.length > 10 && title.length < 80) {
        shortDesc = title;
        break;
      }
    }
  }

  // If no good title, build one
  if (!shortDesc) {
    if (combinedText.includes('girlfriend')) {
      shortDesc = `AI girlfriend platform with ${featuresFound.slice(0, 2).join(' and ')}`;
    } else {
      shortDesc = `AI companion platform featuring ${featuresFound.slice(0, 2).join(' and ')}`;
    }
  }

  // Add second sentence with key features
  const keyFeatures = Array.from(keywordsFound).slice(0, 3).join(', ');
  if (keyFeatures) {
    shortDesc += `. Features ${keyFeatures} for enhanced AI interactions`;
  } else {
    shortDesc += `. Personalized AI companion for meaningful conversations and connections`;
  }

  result.short_description = shortDesc + '.';

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

  // Build comprehensive pricing plans with detailed features
  const plans = [];
  const planEmojis = ["🔨", "🥉", "🥈", "🥇"];
  const tierNames = ["Free", "Starter", "Premium", "Ultimate"];

  // Extract detailed features from content
  const detectedFeatures = {
    hasUnlimited: combinedText.includes('unlimited'),
    hasVoice: combinedText.includes('voice') || combinedText.includes('audio'),
    hasImage: combinedText.includes('image generat'),
    hasVideo: combinedText.includes('video'),
    hasMemory: combinedText.includes('memory') || combinedText.includes('remember'),
    hasRoleplay: combinedText.includes('roleplay') || combinedText.includes('character'),
    hasCustomization: combinedText.includes('custom') || combinedText.includes('personality'),
    hasNoAds: combinedText.includes('no ads') || combinedText.includes('ad-free'),
    hasPriority: combinedText.includes('priority'),
    hasSupport: combinedText.includes('support') || combinedText.includes('help'),
    hasMultipleModels: combinedText.includes('model') || combinedText.includes('llm'),
    hasAPI: combinedText.includes('api'),
    hasCommunity: combinedText.includes('discord') || combinedText.includes('community')
  };

  // Free plan
  if (combinedText.includes('free') || uniquePrices.length > 0) {
    const freeFeatures = [
      "✅ Basic AI conversations",
      "✅ Limited messages per day",
      detectedFeatures.hasMemory ? "✅ Basic memory system" : "✅ Standard AI responses",
      detectedFeatures.hasRoleplay ? "✅ Basic character interactions" : "✅ Core features access",
    ];

    if (detectedFeatures.hasNoAds) freeFeatures.push("✅ No advertisements");
    if (detectedFeatures.hasCommunity) freeFeatures.push("✅ Community access");

    freeFeatures.push("❌ Unlimited messaging");
    freeFeatures.push("❌ Premium AI models");
    if (detectedFeatures.hasImage) freeFeatures.push("❌ Image generation");
    if (detectedFeatures.hasVideo) freeFeatures.push("❌ Video generation");

    plans.push({
      name: `${tierNames[0]} ${planEmojis[0]}`,
      price: 0,
      period: "free",
      features: freeFeatures
    });
  }

  // Build paid plans based on detected prices
  uniquePrices.slice(0, 3).forEach((price, index) => {
    const planIndex = index + 1;
    const features = [];

    // Core features
    features.push("✅ Unlimited conversations");
    if (detectedFeatures.hasRoleplay) features.push("✅ Unlimited characters");

    // AI features
    if (detectedFeatures.hasMemory) {
      features.push(planIndex >= 2 ? "✅ Enhanced memory system" : "✅ Advanced memory system");
    }
    if (detectedFeatures.hasMultipleModels) {
      features.push(`✅ Access to ${planIndex >= 2 ? 'premium' : 'multiple'} AI models`);
    }

    // Content generation
    if (detectedFeatures.hasImage) {
      const limit = planIndex === 1 ? "20 images/hour" : planIndex === 2 ? "50 images/hour" : "Unlimited images";
      features.push(`✅ Image generation: ${limit}`);
    }
    if (detectedFeatures.hasVideo) {
      features.push(`✅ Video generation${planIndex >= 2 ? ': Enhanced' : ''}`);
    }
    if (detectedFeatures.hasVoice) {
      const limit = planIndex === 1 ? "40 messages/day" : planIndex === 2 ? "100 messages/day" : "Unlimited";
      features.push(`✅ Voice/audio messages: ${limit}`);
    }

    // Platform features
    if (detectedFeatures.hasNoAds) features.push("✅ Ad-free experience");
    if (detectedFeatures.hasCustomization) {
      features.push(`✅ ${planIndex >= 2 ? 'Advanced' : 'Full'} customization`);
    }
    if (detectedFeatures.hasPriority && planIndex >= 2) {
      features.push("✅ Priority response times");
    }

    // Community & support
    if (detectedFeatures.hasCommunity) features.push("✅ Private community access");
    if (detectedFeatures.hasSupport && planIndex >= 2) {
      features.push(`✅ ${planIndex === 3 ? '24/7' : 'Priority'} support`);
    }

    // Premium features for higher tiers
    if (planIndex >= 2) {
      features.push("✅ Early access to new features");
      if (detectedFeatures.hasAPI && planIndex === 3) features.push("✅ API access");
    }

    plans.push({
      name: `${tierNames[planIndex]} ${planEmojis[planIndex]}`,
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
