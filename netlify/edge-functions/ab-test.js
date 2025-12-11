/**
 * A/B Testing Edge Function for Companion Pages
 *
 * Replaces website_url with website_url_2 for 50% of visitors
 * Uses cookies for consistent experience across sessions
 * Fetches URL mappings dynamically from Airtable
 */

const COOKIE_NAME = 'ab_variant';
const COOKIE_MAX_AGE = 60 * 60 * 24 * 30; // 30 days
const CACHE_TTL = 60 * 5; // 5 minutes cache for Airtable data

// In-memory cache for URL mappings
let urlMappingsCache = null;
let cacheTimestamp = 0;

/**
 * Fetch companion data from Airtable and build URL mappings
 */
async function getUrlMappings(siteUrl) {
  const now = Date.now();

  // Return cached data if still valid
  if (urlMappingsCache && (now - cacheTimestamp) < CACHE_TTL * 1000) {
    return urlMappingsCache;
  }

  try {
    // Fetch from the Netlify function
    const apiUrl = `${siteUrl}/.netlify/functions/companionguide-get?limit=100`;
    const response = await fetch(apiUrl);

    if (!response.ok) {
      console.error('Failed to fetch companion data:', response.status);
      return urlMappingsCache || {}; // Return stale cache or empty object
    }

    const data = await response.json();
    const companions = data.companions || [];

    // Build URL mappings from companions that have both website_url and website_url_2
    const mappings = {};
    for (const companion of companions) {
      if (companion.website_url && companion.website_url_2) {
        // Only add if both URLs are different and non-empty
        const url1 = companion.website_url.trim();
        const url2 = companion.website_url_2.trim();
        if (url1 && url2 && url1 !== url2) {
          mappings[url1] = url2;
        }
      }
    }

    // Update cache
    urlMappingsCache = mappings;
    cacheTimestamp = now;

    console.log(`Loaded ${Object.keys(mappings).length} A/B test URL mappings from Airtable`);
    return mappings;
  } catch (error) {
    console.error('Error fetching companion data:', error);
    return urlMappingsCache || {}; // Return stale cache or empty object
  }
}

export default async function handler(request, context) {
  // Get the response from the origin
  const response = await context.next();

  // Only process HTML responses
  const contentType = response.headers.get('content-type') || '';
  if (!contentType.includes('text/html')) {
    return response;
  }

  // Determine A/B variant from cookie or assign new one
  let variant = context.cookies.get(COOKIE_NAME);
  let isNewVisitor = false;

  if (!variant) {
    // New visitor: randomly assign A or B (50/50)
    variant = Math.random() > 0.5 ? 'B' : 'A';
    isNewVisitor = true;
  }

  // Get the HTML content
  let html = await response.text();

  // If variant B, fetch URL mappings and replace URLs
  if (variant === 'B') {
    // Get site URL from request
    const url = new URL(request.url);
    const siteUrl = `${url.protocol}//${url.host}`;

    // Fetch URL mappings from Airtable
    const urlMappings = await getUrlMappings(siteUrl);

    // Replace all occurrences
    for (const [urlA, urlB] of Object.entries(urlMappings)) {
      html = html.split(urlA).join(urlB);
    }

    // Add a comment to indicate variant B was served (for debugging)
    html = html.replace('</head>', '<!-- A/B Variant: B -->\n</head>');
  } else {
    html = html.replace('</head>', '<!-- A/B Variant: A -->\n</head>');
  }

  // Create new response with modified HTML
  const newResponse = new Response(html, {
    status: response.status,
    headers: response.headers,
  });

  // Set cookie for new visitors
  if (isNewVisitor) {
    context.cookies.set({
      name: COOKIE_NAME,
      value: variant,
      path: '/',
      maxAge: COOKIE_MAX_AGE,
      httpOnly: false, // Allow JS to read it for analytics
      secure: true,
      sameSite: 'Lax',
    });
  }

  return newResponse;
}

// Configure which paths this edge function runs on
// Run on ALL pages to ensure A/B testing works everywhere
export const config = {
  path: [
    '/*',
  ],
  // Exclude static assets and API endpoints
  excludedPath: [
    '/images/*',
    '/css/*',
    '/js/*',
    '/.netlify/*',
    '/favicon.*',
    '/*.css',
    '/*.js',
    '/*.svg',
    '/*.png',
    '/*.jpg',
    '/*.ico',
  ],
};
