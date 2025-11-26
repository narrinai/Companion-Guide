/**
 * CompanionGuide.ai Newsletter Email Template
 * Generates HTML email with deals, companion of the month, featured companions, and latest articles
 */

// Helper function to convert 10-scale rating to 5 stars
function getStarRating(rating) {
  const stars = Math.round((rating || 0) / 2);
  return '★'.repeat(Math.min(5, stars)) + '☆'.repeat(Math.max(0, 5 - stars));
}

// Helper function to ensure absolute URL for images
function getAbsoluteImageUrl(url) {
  if (!url) return 'https://companionguide.ai/images/logos/default.png';
  if (url.startsWith('http')) return url;
  return `https://companionguide.ai${url.startsWith('/') ? '' : '/'}${url}`;
}

function generateNewsletterEmail(data) {
  const {
    deals = [],
    companionOfTheMonth = null,
    featuredCompanions = [],
    latestArticles = [],
    recipientEmail = ''
  } = data;

  // Filter out Simone and Dream Companion
  const filteredCompanions = featuredCompanions.filter(
    c => c.slug !== 'simone' && c.slug !== 'dream-companion'
  );

  const emailHTML = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>CompanionGuide.ai Newsletter</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      background-color: #f5f5f5;
    }
    .email-wrapper {
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
    }
    .header {
      background: #1a1a1a;
      padding: 30px 20px;
      text-align: center;
    }
    .header-logo {
      width: 48px;
      height: 48px;
      margin-bottom: 12px;
    }
    .header h1 {
      color: #ffffff;
      font-size: 24px;
      margin: 0;
      font-weight: 600;
    }
    .header p {
      color: rgba(255, 255, 255, 0.9);
      font-size: 14px;
      margin-top: 8px;
    }
    .content {
      padding: 30px 20px;
    }
    .section {
      margin-bottom: 35px;
    }
    .section-title {
      font-size: 20px;
      font-weight: 600;
      color: #1a1a1a;
      margin-bottom: 18px;
      padding-bottom: 10px;
      border-bottom: 2px solid #3b82f6;
    }
    .cotm-card {
      background: #f0f7ff;
      border: 2px solid #3b82f6;
      border-radius: 12px;
      padding: 20px;
      margin-bottom: 20px;
      text-align: center;
    }
    .cotm-badge {
      background: #3b82f6;
      color: #ffffff;
      padding: 6px 16px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 600;
      display: inline-block;
      margin-bottom: 15px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .cotm-logo {
      width: 80px;
      height: 80px;
      border-radius: 12px;
      margin: 0 auto 15px;
      display: block;
      border: 3px solid #3b82f6;
      object-fit: cover;
    }
    .cotm-name {
      font-size: 22px;
      font-weight: 700;
      color: #1a1a1a;
      margin-bottom: 8px;
    }
    .cotm-rating {
      font-size: 16px;
      color: #ffa500;
      margin-bottom: 12px;
    }
    .cotm-rating-score {
      color: #3b82f6;
      font-weight: 600;
      margin-left: 8px;
    }
    .cotm-description {
      font-size: 14px;
      color: #666;
      line-height: 1.5;
      margin-bottom: 18px;
    }
    .cotm-button {
      display: inline-block;
      background: #3b82f6;
      color: #ffffff !important;
      padding: 12px 28px;
      border-radius: 8px;
      text-decoration: none;
      font-weight: 600;
      font-size: 14px;
    }
    .deal-card {
      background: #ffffff;
      border: 1px solid #e0e0e0;
      border-radius: 10px;
      padding: 16px;
      margin-bottom: 15px;
    }
    .deal-header {
      display: flex;
      align-items: center;
      margin-bottom: 12px;
    }
    .deal-logo {
      width: 50px;
      height: 50px;
      border-radius: 8px;
      margin-right: 12px;
      border: 1px solid #e0e0e0;
      object-fit: cover;
    }
    .deal-title {
      flex: 1;
    }
    .deal-name {
      font-size: 16px;
      font-weight: 600;
      color: #1a1a1a;
      margin-bottom: 2px;
    }
    .deal-rating {
      font-size: 13px;
      color: #ffa500;
    }
    .deal-rating-score {
      color: #666;
      margin-left: 6px;
    }
    .deal-description {
      font-size: 14px;
      color: #666;
      margin-bottom: 12px;
      line-height: 1.4;
    }
    .deal-badge {
      background: #ff4444;
      color: white;
      padding: 4px 10px;
      border-radius: 4px;
      font-size: 11px;
      font-weight: 600;
      display: inline-block;
      margin-bottom: 10px;
      text-transform: uppercase;
    }
    .deal-button {
      display: inline-block;
      background: #3b82f6;
      color: #ffffff !important;
      padding: 10px 20px;
      border-radius: 6px;
      text-decoration: none;
      font-weight: 600;
      font-size: 13px;
      width: 100%;
      text-align: center;
    }
    .companions-grid {
      width: 100%;
    }
    .companion-card {
      background: #f8f9fa;
      border: 1px solid #e0e0e0;
      border-radius: 10px;
      padding: 12px;
      margin-bottom: 12px;
      text-decoration: none;
      display: block;
    }
    .companion-card-inner {
      display: flex;
      align-items: center;
    }
    .companion-logo {
      width: 70px;
      height: 45px;
      border-radius: 8px;
      border: 1px solid #e0e0e0;
      object-fit: contain;
      background: #fff;
      margin-right: 12px;
    }
    .companion-info {
      flex: 1;
    }
    .companion-name {
      font-size: 14px;
      color: #1a1a1a;
      font-weight: 600;
      margin-bottom: 4px;
      text-decoration: none;
    }
    .companion-rating {
      font-size: 12px;
      color: #ffa500;
    }
    .companion-rating-score {
      color: #666;
      margin-left: 4px;
    }
    .companion-best-for {
      font-size: 12px;
      color: #888;
      margin-top: 4px;
    }
    .articles-grid {
      width: 100%;
    }
    .article-card {
      background: #f8f9fa;
      border: 1px solid #e0e0e0;
      border-radius: 10px;
      padding: 16px;
      margin-bottom: 12px;
      text-decoration: none;
      display: block;
    }
    .article-title {
      font-size: 15px;
      color: #1a1a1a;
      font-weight: 600;
      margin-bottom: 8px;
      text-decoration: none;
      line-height: 1.4;
    }
    .article-excerpt {
      font-size: 13px;
      color: #666;
      line-height: 1.4;
      margin-bottom: 10px;
    }
    .article-link {
      font-size: 13px;
      color: #3b82f6;
      font-weight: 600;
      text-decoration: none;
    }
    .footer {
      background-color: #1a1a1a;
      color: #999;
      padding: 25px 20px;
      text-align: center;
      font-size: 12px;
    }
    .footer a {
      color: #3b82f6;
      text-decoration: none;
    }
    .footer-links {
      margin: 15px 0;
    }
    .footer-links a {
      margin: 0 10px;
      color: #999;
    }
    @media only screen and (max-width: 600px) {
      .section-title {
        font-size: 18px;
      }
      .cotm-name {
        font-size: 20px;
      }
    }
  </style>
</head>
<body>
  <div class="email-wrapper">
    <!-- Header -->
    <div class="header">
      <img src="https://companionguide.ai/images/new-logo-icon.png" alt="CompanionGuide.ai" class="header-logo">
      <h1>CompanionGuide.ai</h1>
      <p>Your trusted source for AI companion reviews</p>
    </div>

    <!-- Content -->
    <div class="content">
      ${companionOfTheMonth ? `
      <!-- Companion of the Month -->
      <div class="section">
        <h2 class="section-title">🏆 Companion of the Month</h2>
        <div class="cotm-card">
          <div class="cotm-badge">Companion of the Month</div>
          <img src="${getAbsoluteImageUrl(companionOfTheMonth.logo_url)}" alt="${companionOfTheMonth.name}" class="cotm-logo">
          <div class="cotm-name">${companionOfTheMonth.name}</div>
          <div class="cotm-rating">${getStarRating(companionOfTheMonth.rating)}<span class="cotm-rating-score">${companionOfTheMonth.rating}/10</span></div>
          <p class="cotm-description">${companionOfTheMonth.short_description || companionOfTheMonth.description || ''}</p>
          <a href="${companionOfTheMonth.website_url}" class="cotm-button">Visit ${companionOfTheMonth.name}</a>
        </div>
      </div>
      ` : ''}

      ${deals.length > 0 ? `
      <!-- Latest Deals -->
      <div class="section">
        <h2 class="section-title">🔥 Latest Deals</h2>
        ${deals.map(deal => `
          <div class="deal-card">
            <div class="deal-header">
              <img src="${getAbsoluteImageUrl(deal.logo_url)}" alt="${deal.name}" class="deal-logo">
              <div class="deal-title">
                <div class="deal-name">${deal.name}</div>
                <div class="deal-rating">${getStarRating(deal.rating)}<span class="deal-rating-score">${deal.rating || 0}/10</span></div>
              </div>
            </div>
            ${deal.deal_badge ? `<div class="deal-badge">${deal.deal_badge}</div>` : ''}
            <p class="deal-description">${deal.deal_description || deal.short_description || ''}</p>
            <a href="${deal.website_url}" class="deal-button">Claim Deal</a>
          </div>
        `).join('')}
      </div>
      ` : ''}

      ${filteredCompanions.length > 0 ? `
      <!-- Featured Companions -->
      <div class="section">
        <h2 class="section-title">✨ Featured AI Companions</h2>
        <div class="companions-grid">
          ${filteredCompanions.slice(0, 6).map(companion => `
            <a href="${companion.website_url}" class="companion-card" style="text-decoration: none;">
              <div class="companion-card-inner">
                <img src="${getAbsoluteImageUrl(companion.logo_url)}" alt="${companion.name}" class="companion-logo">
                <div class="companion-info">
                  <div class="companion-name">${companion.name}</div>
                  <div class="companion-rating">${getStarRating(companion.rating)}<span class="companion-rating-score">${companion.rating || 0}/10</span></div>
                  ${companion.best_for ? `<div class="companion-best-for">Best for: ${companion.best_for}</div>` : ''}
                </div>
              </div>
            </a>
          `).join('')}
        </div>
      </div>
      ` : ''}

      ${latestArticles.length > 0 ? `
      <!-- Latest Articles -->
      <div class="section">
        <h2 class="section-title">📰 Latest News & Guides</h2>
        <div class="articles-grid">
          ${latestArticles.slice(0, 3).map(article => `
            <a href="https://companionguide.ai/news/${article.slug}" class="article-card" style="text-decoration: none;">
              <div class="article-title">${article.title}</div>
              ${article.excerpt ? `<p class="article-excerpt">${article.excerpt}</p>` : ''}
              <span class="article-link">Read more →</span>
            </a>
          `).join('')}
        </div>
      </div>
      ` : ''}

      <!-- Call to Action -->
      <div class="section" style="text-align: center; background: #f8f9fa; padding: 25px; border-radius: 10px;">
        <h3 style="margin-bottom: 12px; color: #1a1a1a;">Discover More AI Companions</h3>
        <p style="color: #666; margin-bottom: 18px; font-size: 14px;">Explore our complete directory of AI companions, reviews, and guides.</p>
        <a href="https://companionguide.ai/companions" style="display: inline-block; background: #3b82f6; color: #ffffff; padding: 12px 28px; border-radius: 8px; text-decoration: none; font-weight: 600;">Browse All Companions</a>
      </div>
    </div>

    <!-- Footer -->
    <div class="footer">
      <p style="margin-bottom: 10px;">© 2025 CompanionGuide.ai. All rights reserved.</p>
      <div class="footer-links">
        <a href="https://companionguide.ai">Home</a> |
        <a href="https://companionguide.ai/companions">Companions</a> |
        <a href="https://companionguide.ai/news">News</a> |
        <a href="https://companionguide.ai/contact">Contact</a>
      </div>
      <p style="margin-top: 15px; font-size: 11px;">
        You're receiving this email because you subscribed to CompanionGuide.ai updates.<br>
        <a href="https://companionguide.ai/unsubscribe.html?email=${encodeURIComponent(recipientEmail)}">Unsubscribe</a>
      </p>
    </div>
  </div>
</body>
</html>
  `;

  return emailHTML;
}

module.exports = { generateNewsletterEmail };
