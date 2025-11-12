/**
 * Article Last Updated Date Manager
 * Adds a "Last updated" date to news articles that shows today's date
 */

class ArticleLastUpdated {
  constructor() {
    this.init();
  }

  init() {
    // Only run on news article pages
    if (!window.location.pathname.startsWith('/news/')) {
      return;
    }

    this.addLastUpdatedDate();
  }

  addLastUpdatedDate() {
    // Find the publish date element
    const publishDateElement = document.querySelector('.publish-date');
    if (!publishDateElement) {
      console.warn('Publish date element not found');
      return;
    }

    // Get today's date in the same format as the publish date
    const today = new Date();
    const formattedDate = this.formatDate(today);

    // Create the "Last updated" span to add inline
    const lastUpdatedSpan = document.createElement('span');
    lastUpdatedSpan.className = 'last-updated-date';
    lastUpdatedSpan.style.cssText = 'color: #888; font-style: italic; margin-left: 1rem;';
    lastUpdatedSpan.innerHTML = `Last updated: ${formattedDate}`;

    // Append to the publish date element (same line)
    publishDateElement.appendChild(lastUpdatedSpan);
  }

  formatDate(date) {
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];

    const month = months[date.getMonth()];
    const day = date.getDate();
    const year = date.getFullYear();

    return `${month} ${day}, ${year}`;
  }
}

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    new ArticleLastUpdated();
  });
} else {
  new ArticleLastUpdated();
}
