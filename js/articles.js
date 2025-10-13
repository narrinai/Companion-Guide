// Article Manager - for handling featured guides in footer
class ArticleManager {
  constructor() {
    this.apiBaseUrl = '/.netlify/functions/companionguide-get';
    this.articles = [];
  }

  async fetchArticles(options = {}) {
    try {
      const params = new URLSearchParams();
      params.append('table', 'Articles');

      if (options.featured) params.append('featured', 'true');
      if (options.sort) params.append('sort', options.sort);
      if (options.limit) params.append('limit', options.limit);

      const url = `${this.apiBaseUrl}?${params.toString()}`;
      console.log('Fetching articles from:', url);

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      this.articles = data.articles || data.companions || []; // Support both response formats
      console.log('Articles loaded:', this.articles.length);

      return this.articles;
    } catch (error) {
      console.error('Error fetching articles:', error);
      return [];
    }
  }

  async renderFooterFeaturedArticles(containerId) {
    try {
      const container = document.getElementById(containerId);
      if (!container) {
        console.warn(`Container ${containerId} not found`);
        return;
      }

      // Fetch featured articles
      const allArticles = await this.fetchArticles({
        sort: 'featured_order'
      });

      // Filter only featured articles
      const featuredArticles = allArticles.filter(article =>
        article.featured === true || article.featured === 'true' || article.is_featured === true
      );

      console.log('Featured articles found:', featuredArticles.length);

      if (!featuredArticles || featuredArticles.length === 0) {
        console.warn('No featured articles found');
        return;
      }

      // Clear existing content
      container.innerHTML = '';

      // Render each article as a list item
      featuredArticles.forEach(article => {
        const li = document.createElement('li');
        const a = document.createElement('a');

        // Use short_title if available, otherwise use title
        const displayTitle = article.short_title || article.title;
        const slug = article.slug;

        a.href = `/news/${slug}`;
        a.textContent = displayTitle;

        li.appendChild(a);
        container.appendChild(li);
      });

      console.log(`✓ Rendered ${featuredArticles.length} featured articles in footer`);
    } catch (error) {
      console.error('Error rendering footer featured articles:', error);
    }
  }
}

// Create global instance
if (typeof window !== 'undefined') {
  window.articleManager = new ArticleManager();
}
