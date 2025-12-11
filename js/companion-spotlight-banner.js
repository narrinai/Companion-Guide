/**
 * Companion Spotlight Banner
 * Dynamically loads companion data and renders a spotlight banner
 */

// Button translations
const buttonTranslations = {
    en: { tryButton: 'Try', readReview: 'Read Review' },
    nl: { tryButton: 'Probeer', readReview: 'Lees Review' },
    de: { tryButton: 'Testen', readReview: 'Review Lesen' },
    pt: { tryButton: 'Experimente', readReview: 'Ler Análise' }
};

async function loadSpotlightBanner(slug, lang = 'en') {
    try {
        const response = await fetch(`/.netlify/functions/companionguide-get?lang=${lang}&limit=100`);
        const data = await response.json();
        const companion = data.companions.find(c => c.slug === slug);

        if (!companion) {
            console.error('Companion not found:', slug);
            return;
        }

        const translations = buttonTranslations[lang] || buttonTranslations.en;
        const basePath = lang === 'en' ? '' : `/${lang}`;

        // Logo
        const logo = document.getElementById('banner-logo');
        if (logo) {
            logo.src = companion.logo_url || `/images/logos/${slug}.png`;
            logo.alt = companion.name;
        }

        // Name & Link
        const nameLink = document.getElementById('banner-name-link');
        if (nameLink) {
            nameLink.textContent = companion.name;
            nameLink.href = `${basePath}/companions/${slug}`;
        }

        // Rating - 5 full stars + /10 score + review count
        const rating = parseFloat(companion.rating) || 0;
        const starsEl = document.getElementById('banner-stars');
        const ratingEl = document.getElementById('banner-rating');
        const reviewCountEl = document.getElementById('banner-review-count');
        if (starsEl) starsEl.textContent = '★★★★★';
        if (ratingEl) ratingEl.textContent = `${rating}/10`;
        if (reviewCountEl && companion.review_count > 0) {
            const reviewText = companion.review_count === 1 ? 'review' : 'reviews';
            reviewCountEl.textContent = `(${companion.review_count} ${reviewText})`;
        }

        // Website URL & Review URL
        const websiteUrl = companion.website_url || '#';
        const reviewUrl = `${basePath}/companions/${slug}`;
        const btnPrimary = document.getElementById('banner-btn-primary');
        const btnSecondary = document.getElementById('banner-btn-secondary');

        if (btnPrimary) {
            btnPrimary.href = websiteUrl;
            btnPrimary.textContent = `${translations.tryButton} ${companion.name}`;
        }
        if (btnSecondary) {
            btnSecondary.href = reviewUrl;
            btnSecondary.textContent = translations.readReview;
            btnSecondary.removeAttribute('target');
            btnSecondary.removeAttribute('rel');
        }

        // Gallery Images
        const imagesContainer = document.getElementById('banner-images');
        if (imagesContainer) {
            imagesContainer.innerHTML = '';

            let galleryImages = [];
            if (companion.gallery_images) {
                try {
                    galleryImages = JSON.parse(companion.gallery_images);
                } catch (e) {
                    console.error('Error parsing gallery_images:', e);
                }
            }

            // Fallback to default gallery images if none in Airtable
            if (galleryImages.length === 0) {
                galleryImages = [
                    { url: `/images/screenshots/${slug}-image-gallery-1.png` },
                    { url: `/images/screenshots/${slug}-image-gallery-2.png` },
                    { url: `/images/screenshots/${slug}-image-gallery-3.png` }
                ];
            }

            // Render up to 3 images
            galleryImages.slice(0, 3).forEach((img, index) => {
                const link = document.createElement('a');
                link.href = websiteUrl;
                link.target = '_blank';
                link.rel = 'noopener';
                link.className = 'banner-image-link';

                const image = document.createElement('img');
                image.src = img.url;
                image.alt = `${companion.name} Screenshot ${index + 1}`;
                image.className = 'banner-image';

                link.appendChild(image);
                imagesContainer.appendChild(link);
            });
        }

    } catch (error) {
        console.error('Error loading spotlight banner data:', error);
    }
}

// Auto-initialize if data attribute is present
document.addEventListener('DOMContentLoaded', function() {
    const banner = document.getElementById('companion-spotlight-banner');
    if (banner) {
        const slug = banner.dataset.slug || 'joi-ai';
        const lang = banner.dataset.lang || document.documentElement.lang || 'en';
        loadSpotlightBanner(slug, lang);
    }
});
