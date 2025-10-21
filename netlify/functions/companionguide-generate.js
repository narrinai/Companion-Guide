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

    // Fetch all URLs with delays between requests
    const htmlContents = [];
    for (let i = 0; i < urls.length; i++) {
      const url = urls[i];
      try {
        console.log(`Fetching ${i + 1}/${urls.length}: ${url}`);
        const html = await fetchWebsite(url);
        htmlContents.push({ url, html });

        // Add delay between requests (2 seconds) to avoid rate limiting and allow proper loading
        if (i < urls.length - 1) {
          console.log('Waiting 2 seconds before next request...');
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
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

    req.setTimeout(30000, () => {
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
    pricing_plans: [],
    features: []
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

  // Detect features FIRST (before building short description)
  const hasVoice = combinedText.includes('voice') || combinedText.includes('audio');
  const hasImage = combinedText.includes('image generat');
  const hasVideo = combinedText.includes('video');
  const hasMemory = combinedText.includes('memory') || combinedText.includes('remember');
  const hasRoleplay = combinedText.includes('roleplay') || combinedText.includes('character');
  const hasCustom = combinedText.includes('custom') || combinedText.includes('personality');
  const hasCommunity = combinedText.includes('discord') || combinedText.includes('community');

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

  // Extract pricing information with improved context-aware parsing
  const allPrices = [];
  const pricingContext = new Map(); // Store context around each price

  // Extract pricing sections from HTML
  const pricingSections = [];

  // Look for common pricing section patterns
  const pricingSectionPatterns = [
    /<(?:div|section)[^>]*(?:class|id)=["'][^"']*(?:pric|plan|tier|subscription|package)[^"']*["'][^>]*>[\s\S]{0,2000}?<\/(?:div|section)>/gi,
    /<table[^>]*(?:class|id)=["'][^"']*pric[^"']*["'][^>]*>[\s\S]{0,2000}?<\/table>/gi,
  ];

  for (const pattern of pricingSectionPatterns) {
    const matches = allHtml.matchAll(pattern);
    for (const match of matches) {
      pricingSections.push(match[0]);
    }
  }

  console.log(`Found ${pricingSections.length} pricing sections`);

  // If we found pricing sections, extract from those, otherwise use full text
  const textsToSearch = pricingSections.length > 0 ? pricingSections : [allHtml, combinedText];

  // Enhanced price patterns with context
  const pricePatterns = [
    /\$(\d+(?:\.\d{2})?)\s*(?:\/|per)?\s*(?:mo|month|monthly)?/gi,  // $19.99/mo
    /(\d+(?:\.\d{2})?)\s*(?:USD|usd|\$)\s*(?:\/|per)?\s*(?:mo|month)?/gi, // 19.99 USD/mo
    /(?:price|cost|pay|from)[:\s]+\$?(\d+(?:\.\d{2})?)/gi,         // price: $19.99
    /(\d+(?:\.\d{2})?)\s*\/\s*(?:month|mo)/gi,                      // 19.99/month
    /(\d+(?:\.\d{2})?)\s*per\s+month/gi,                            // 19.99 per month
  ];

  for (const text of textsToSearch) {
    // Remove HTML tags but keep structure
    const cleanText = text.replace(/<script[\s\S]*?<\/script>/gi, '')
                          .replace(/<style[\s\S]*?<\/style>/gi, '');

    for (const pattern of pricePatterns) {
      const matches = cleanText.matchAll(pattern);
      for (const match of matches) {
        const price = parseFloat(match[1]);

        // Filter out unrealistic prices
        if (price >= 1 && price <= 500) {
          // Get context around the price (50 chars before and after)
          const startIdx = Math.max(0, match.index - 50);
          const endIdx = Math.min(cleanText.length, match.index + match[0].length + 50);
          const context = cleanText.substring(startIdx, endIdx).toLowerCase();

          // Skip prices that seem unrelated to subscriptions
          const skipKeywords = ['year', 'lifetime', 'one-time', 'credit', 'token', 'coin'];
          const shouldSkip = skipKeywords.some(keyword => context.includes(keyword));

          if (!shouldSkip) {
            allPrices.push(price);
            pricingContext.set(price, context);
          }
        }
      }
    }
  }

  const uniquePrices = [...new Set(allPrices)].sort((a, b) => a - b);

  console.log(`Found ${allPrices.length} prices: ${allPrices.join(', ')}`);
  console.log(`Unique prices: ${uniquePrices.join(', ')}`);

  // Build pricing plans based on detected prices
  const plans = [];

  // Add free plan if mentioned (but only if we also found paid prices)
  if ((combinedText.includes('free') || combinedText.includes('no cost')) && uniquePrices.length > 0) {
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

  // Try to detect plan names from the HTML with improved matching
  const detectedPlanNames = [];
  const planNameSet = new Set();

  // Look for plan names in pricing sections first
  const planSearchTexts = pricingSections.length > 0 ? pricingSections : [allHtml];

  for (const text of planSearchTexts) {
    // Remove HTML but keep text structure
    const cleanText = text.replace(/<[^>]+>/g, ' ')
                         .replace(/&[^;]+;/g, ' ')
                         .replace(/\s+/g, ' ');

    // Enhanced plan name patterns
    const planNamePatterns = [
      /(basic|starter|standard|premium|pro|plus|elite|ultimate|deluxe|enterprise)\s+(?:plan|tier|package|subscription)?/gi,
      /(?:plan|tier|package)[:\s]+([a-z]{3,15})/gi,
      /<h[1-6][^>]*>([^<]{3,20}(?:plan|tier|package))<\/h[1-6]>/gi,
    ];

    for (const pattern of planNamePatterns) {
      const matches = cleanText.matchAll(pattern);
      for (const match of matches) {
        let name = match[1].trim();

        // Clean up the name
        name = name.replace(/\s+(?:plan|tier|package|subscription)$/i, '').trim();

        if (name.length >= 3 && name.length <= 15 && !planNameSet.has(name.toLowerCase())) {
          const formattedName = name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();

          // Only add if it's a reasonable plan name
          if (!/\d{3,}/.test(formattedName) && !/[^a-zA-Z\s]/.test(formattedName)) {
            planNameSet.add(name.toLowerCase());
            detectedPlanNames.push(formattedName);
          }
        }
      }
    }
  }

  console.log(`Detected plan names: ${detectedPlanNames.join(', ')}`);

  // Add paid plans for each detected price
  const tierNames = detectedPlanNames.length > 0
    ? detectedPlanNames
    : ["Basic", "Premium", "Pro", "Ultimate"];

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

  // Build features array with improved detection
  const features = [];
  const featureKeywords = new Map();

  // Scan for feature-related sections in HTML
  const featureSections = [];
  const featureSectionPatterns = [
    /<(?:div|section|ul)[^>]*(?:class|id)=["'][^"']*(?:feature|benefit|capability|highlight)[^"']*["'][^>]*>[\s\S]{0,1500}?<\/(?:div|section|ul)>/gi,
  ];

  for (const pattern of featureSectionPatterns) {
    const matches = allHtml.matchAll(pattern);
    for (const match of matches) {
      featureSections.push(match[0]);
    }
  }

  const featureSearchText = featureSections.length > 0
    ? featureSections.join(' ')
    : combinedText;

  // Enhanced feature detection with frequency tracking
  const featureTests = [
    { test: () => hasVoice || /voice|audio|speak|talk/i.test(featureSearchText), icon: "🎤", title: "Voice Chat", desc: "AI voice messages" },
    { test: () => hasImage || /image generat|photo|picture|visual|art/i.test(featureSearchText), icon: "🎨", title: "AI Art", desc: "Image generation" },
    { test: () => hasVideo || /video|cam|stream/i.test(featureSearchText), icon: "🎬", title: "Video Content", desc: "AI-generated videos" },
    { test: () => hasMemory || /memory|remember|context|history/i.test(featureSearchText), icon: "🧠", title: "Memory System", desc: "Remembers context" },
    { test: () => hasRoleplay || /roleplay|role-play|scenario|character/i.test(featureSearchText), icon: "🎭", title: "Roleplay", desc: "Character scenarios" },
    { test: () => hasCustom || /customiz|personali|tailor|configure/i.test(featureSearchText), icon: "⚙️", title: "Customization", desc: "Personalized AI" },
    { test: () => /multilingual|multi-language|languages|translation/i.test(featureSearchText), icon: "🌍", title: "Multilingual", desc: "Multiple languages" },
    { test: () => hasCommunity || /community|discord|forum/i.test(featureSearchText), icon: "👥", title: "Community", desc: "Discord & forums" },
    { test: () => /24\/7|always available|anytime|any time/i.test(featureSearchText), icon: "⏰", title: "24/7 Available", desc: "Always online" },
    { test: () => /privat|secure|encrypt|anonymous|confidential/i.test(featureSearchText), icon: "🔒", title: "Private", desc: "Secure conversations" },
    { test: () => /mobile|app|ios|android|smartphone/i.test(featureSearchText), icon: "📱", title: "Mobile App", desc: "iOS & Android" },
    { test: () => /unlimited|no limit|infinite/i.test(featureSearchText), icon: "∞", title: "Unlimited", desc: "No message limits" },
    { test: () => /nsfw|adult|18\+|mature|uncensored/i.test(featureSearchText), icon: "🔞", title: "NSFW", desc: "Adult content allowed" },
    { test: () => /emotion|empathy|feeling|mood/i.test(featureSearchText), icon: "❤️", title: "Emotional AI", desc: "Empathetic responses" },
  ];

  // Test each feature and add if detected
  for (const { test, icon, title, desc } of featureTests) {
    if (test()) {
      features.push({
        icon: icon,
        title: title,
        description: desc
      });
    }
  }

  console.log(`Detected ${features.length} features from content`);

  // If we still don't have enough features, add defaults
  if (features.length === 0) {
    features.push(
      { icon: "💬", title: "AI Chat", description: "Natural conversations" },
      { icon: "💕", title: "Personalized", description: "Custom companions" },
      { icon: "🎯", title: "Smart AI", description: "Advanced models" }
    );
  }

  // Prioritize and limit to 6 most relevant features
  result.features = features.slice(0, 6);

  return result;
}
