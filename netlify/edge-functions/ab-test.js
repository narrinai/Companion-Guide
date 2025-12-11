/**
 * A/B Testing Edge Function for Companion Pages
 *
 * Replaces website_url with website_url_2 for 50% of visitors
 * Uses cookies for consistent experience across sessions
 */

// URL mapping: website_url -> website_url_2
// Add new mappings here when setting up A/B tests for companions
const URL_MAPPINGS = {
  // Soulkyn AI
  'https://soulkyn.com/?_go=companionguide': 'https://soulkyn.ai/?_go=companionguide',

  // Secrets AI
  'http://secrets.ai/?spicy=true&gender=female&fpr=companionguide': 'https://www.secrets.ai/custom?spicy=true&fpr=companion88',

  // Dream Companion (match full Airtable URL)
  'https://www.mydreamcompanion.com/?deal=companionguide': 'https://www.mydreamcompanion.com/create-character/?mode=presets&deal=companionguide',

  // FantasyGF (HTML uses generate-image path)
  'https://fantasygf.com/generate-image?via=53hyme': 'https://fantasygf.com/?via=53hyme',
};

const COOKIE_NAME = 'ab_variant';
const COOKIE_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

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

  // If variant B, replace URLs
  if (variant === 'B') {
    for (const [urlA, urlB] of Object.entries(URL_MAPPINGS)) {
      // Replace all occurrences of urlA with urlB
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
