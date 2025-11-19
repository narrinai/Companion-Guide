/**
 * Companion Image Gallery/Carousel Manager
 * Handles dynamic image loading from Airtable and carousel navigation
 */

class CompanionGallery {
    constructor(containerId, images = [], options = {}) {
        this.container = document.getElementById(containerId);
        if (!this.container) {
            console.warn(`Gallery container ${containerId} not found`);
            return;
        }

        this.images = images;
        this.currentIndex = 0;
        this.isTransitioning = false;
        this.isUncensored = options.isUncensored || false;
        this.isBlurred = this.isUncensored;
        this.websiteUrl = options.websiteUrl || '';

        this.init();
    }

    init() {
        if (!this.images || this.images.length === 0) {
            this.showEmptyState();
            return;
        }

        this.render();
        this.attachEventListeners();
        this.enableSwipeGestures();
    }

    render() {
        const blurClass = this.isBlurred ? 'gallery-blurred' : '';

        const html = `
            <div class="gallery-grid-container ${blurClass}">
                <!-- Main Image -->
                <div class="gallery-main-image" id="galleryMainImage">
                    <img src="${this.escapeHtml(this.images[0].url)}"
                         alt="${this.escapeHtml(this.images[0].caption || 'Gallery image')}"
                         id="mainImage">
                    ${this.images[0].caption ? `<div class="gallery-caption">${this.escapeHtml(this.images[0].caption)}</div>` : ''}
                </div>

                <!-- Thumbnail Sidebar -->
                ${this.images.length > 1 ? `
                    <div class="gallery-thumbnails-sidebar" id="galleryThumbnails">
                        ${this.images.map((img, index) => `
                            <div class="gallery-thumbnail ${index === 0 ? 'active' : ''}"
                                 data-index="${index}"
                                 role="button"
                                 tabindex="0"
                                 aria-label="Thumbnail ${index + 1}">
                                <img src="${this.escapeHtml(img.url)}"
                                     alt="${this.escapeHtml(img.caption || `Thumbnail ${index + 1}`)}"
                                     loading="lazy">
                            </div>
                        `).join('')}
                    </div>
                ` : ''}

                <!-- 18+ Blur Overlay -->
                ${this.isBlurred ? `
                    <div class="gallery-blur-overlay" id="galleryBlurOverlay">
                        <div class="gallery-blur-warning">
                            <p>This gallery contains uncensored NSFW content intended for adults only (18+).</p>
                            <button class="blur-reveal-btn" id="revealGalleryBtn">
                                I am 18+ - Show Content
                            </button>
                        </div>
                    </div>
                ` : ''}
            </div>

            ${this.websiteUrl ? `
                <div class="gallery-cta-link" style="text-align: center; margin-top: 1.5rem;">
                    <a href="${this.escapeHtml(this.websiteUrl)}"
                       class="pricing-cta"
                       target="_blank"
                       data-i18n="companionCard.visitWebsite">Visit Website</a>
                </div>
            ` : ''}
        `;

        this.container.innerHTML = html;
        this.cacheElements();

        if (this.isBlurred) {
            this.attachBlurHandlers();
        }
    }

    cacheElements() {
        this.mainImage = document.getElementById('mainImage');
        this.mainImageContainer = document.getElementById('galleryMainImage');
        this.thumbnails = document.querySelectorAll('.gallery-thumbnail');
    }

    attachEventListeners() {
        // Thumbnail navigation
        this.thumbnails.forEach(thumb => {
            thumb.addEventListener('click', (e) => {
                const index = parseInt(e.currentTarget.dataset.index);
                this.switchToImage(index);
            });

            // Keyboard support for thumbnails
            thumb.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    const index = parseInt(e.currentTarget.dataset.index);
                    this.switchToImage(index);
                }
            });
        });
    }

    attachBlurHandlers() {
        const revealBtn = document.getElementById('revealGalleryBtn');
        if (revealBtn) {
            revealBtn.addEventListener('click', () => {
                this.revealContent();
            });
        }
    }

    revealContent() {
        this.isBlurred = false;
        const container = this.container.querySelector('.gallery-grid-container');
        const overlay = document.getElementById('galleryBlurOverlay');

        if (container) {
            container.classList.remove('gallery-blurred');
        }

        if (overlay) {
            overlay.style.opacity = '0';
            setTimeout(() => {
                overlay.remove();
            }, 300);
        }
    }

    enableSwipeGestures() {
        // Removed - not needed for grid layout
    }

    switchToImage(index) {
        if (index === this.currentIndex) return;
        if (index < 0 || index >= this.images.length) return;

        this.currentIndex = index;
        const selectedImage = this.images[index];

        // Update main image with fade effect
        this.mainImage.style.opacity = '0';

        setTimeout(() => {
            this.mainImage.src = selectedImage.url;
            this.mainImage.alt = selectedImage.caption || 'Gallery image';

            // Update caption
            const existingCaption = this.mainImageContainer.querySelector('.gallery-caption');
            if (selectedImage.caption) {
                if (existingCaption) {
                    existingCaption.textContent = selectedImage.caption;
                } else {
                    const caption = document.createElement('div');
                    caption.className = 'gallery-caption';
                    caption.textContent = selectedImage.caption;
                    this.mainImageContainer.appendChild(caption);
                }
            } else if (existingCaption) {
                existingCaption.remove();
            }

            this.mainImage.style.opacity = '1';
        }, 150);

        // Update active states
        this.updateActiveStates();
    }

    updateActiveStates() {
        // Update thumbnails
        this.thumbnails.forEach((thumb, index) => {
            thumb.classList.toggle('active', index === this.currentIndex);
        });
    }

    showEmptyState() {
        this.container.innerHTML = `
            <div class="gallery-empty">
                <p>No images available for this companion yet.</p>
            </div>
        `;
    }

    showLoadingState() {
        this.container.innerHTML = `<div class="gallery-loading"></div>`;
    }

    updateImages(images) {
        this.images = images;
        this.currentIndex = 0;
        this.init();
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    destroy() {
        if (this.container) {
            this.container.innerHTML = '';
        }
    }
}

// Auto-initialize if window.companionGalleryImages is available
if (typeof window !== 'undefined') {
    window.CompanionGallery = CompanionGallery;
}
