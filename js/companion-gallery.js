/**
 * Companion Image Gallery/Carousel Manager
 * Handles dynamic image loading from Airtable and carousel navigation
 */

class CompanionGallery {
    constructor(containerId, images = []) {
        this.container = document.getElementById(containerId);
        if (!this.container) {
            console.warn(`Gallery container ${containerId} not found`);
            return;
        }

        this.images = images;
        this.currentIndex = 0;
        this.isTransitioning = false;

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
        const html = `
            <div class="gallery-container" id="galleryContainer">
                <div class="gallery-track" id="galleryTrack">
                    ${this.images.map((img, index) => `
                        <div class="gallery-slide" data-index="${index}">
                            <img src="${this.escapeHtml(img.url)}"
                                 alt="${this.escapeHtml(img.caption || 'Gallery image')}"
                                 loading="${index === 0 ? 'eager' : 'lazy'}">
                            ${img.caption ? `<div class="gallery-caption">${this.escapeHtml(img.caption)}</div>` : ''}
                        </div>
                    `).join('')}
                </div>

                ${this.images.length > 1 ? `
                    <button class="gallery-nav prev" id="galleryPrev" aria-label="Previous image">‹</button>
                    <button class="gallery-nav next" id="galleryNext" aria-label="Next image">›</button>
                ` : ''}
            </div>

            ${this.images.length > 1 ? `
                <ul class="gallery-dots" id="galleryDots">
                    ${this.images.map((_, index) => `
                        <li>
                            <button class="gallery-dot ${index === 0 ? 'active' : ''}"
                                    data-index="${index}"
                                    aria-label="Go to image ${index + 1}"></button>
                        </li>
                    `).join('')}
                </ul>

                <div class="gallery-thumbnails" id="galleryThumbnails">
                    ${this.images.map((img, index) => `
                        <div class="gallery-thumbnail ${index === 0 ? 'active' : ''}"
                             data-index="${index}"
                             role="button"
                             tabindex="0"
                             aria-label="Thumbnail ${index + 1}">
                            <img src="${this.escapeHtml(img.url)}"
                                 alt="Thumbnail ${index + 1}"
                                 loading="lazy">
                        </div>
                    `).join('')}
                </div>
            ` : ''}
        `;

        this.container.innerHTML = html;
        this.cacheElements();
    }

    cacheElements() {
        this.track = document.getElementById('galleryTrack');
        this.prevBtn = document.getElementById('galleryPrev');
        this.nextBtn = document.getElementById('galleryNext');
        this.dots = document.querySelectorAll('.gallery-dot');
        this.thumbnails = document.querySelectorAll('.gallery-thumbnail');
    }

    attachEventListeners() {
        if (this.prevBtn) {
            this.prevBtn.addEventListener('click', () => this.prev());
        }

        if (this.nextBtn) {
            this.nextBtn.addEventListener('click', () => this.next());
        }

        // Dot navigation
        this.dots.forEach(dot => {
            dot.addEventListener('click', (e) => {
                const index = parseInt(e.target.dataset.index);
                this.goToSlide(index);
            });
        });

        // Thumbnail navigation
        this.thumbnails.forEach(thumb => {
            thumb.addEventListener('click', (e) => {
                const index = parseInt(e.currentTarget.dataset.index);
                this.goToSlide(index);
            });

            // Keyboard support for thumbnails
            thumb.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    const index = parseInt(e.currentTarget.dataset.index);
                    this.goToSlide(index);
                }
            });
        });

        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (!this.container.matches(':hover')) return;

            if (e.key === 'ArrowLeft') {
                e.preventDefault();
                this.prev();
            } else if (e.key === 'ArrowRight') {
                e.preventDefault();
                this.next();
            }
        });
    }

    enableSwipeGestures() {
        let startX = 0;
        let currentX = 0;
        let isDragging = false;

        this.track.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
            isDragging = true;
        }, { passive: true });

        this.track.addEventListener('touchmove', (e) => {
            if (!isDragging) return;
            currentX = e.touches[0].clientX;
        }, { passive: true });

        this.track.addEventListener('touchend', () => {
            if (!isDragging) return;
            isDragging = false;

            const diff = startX - currentX;
            const threshold = 50; // Minimum swipe distance

            if (Math.abs(diff) > threshold) {
                if (diff > 0) {
                    this.next();
                } else {
                    this.prev();
                }
            }
        }, { passive: true });
    }

    goToSlide(index) {
        if (this.isTransitioning || index === this.currentIndex) return;
        if (index < 0 || index >= this.images.length) return;

        this.isTransitioning = true;
        this.currentIndex = index;

        // Update track position
        this.track.style.transform = `translateX(-${index * 100}%)`;

        // Update active states
        this.updateActiveStates();

        // Reset transition lock
        setTimeout(() => {
            this.isTransitioning = false;
        }, 400);
    }

    next() {
        const nextIndex = (this.currentIndex + 1) % this.images.length;
        this.goToSlide(nextIndex);
    }

    prev() {
        const prevIndex = (this.currentIndex - 1 + this.images.length) % this.images.length;
        this.goToSlide(prevIndex);
    }

    updateActiveStates() {
        // Update dots
        this.dots.forEach((dot, index) => {
            dot.classList.toggle('active', index === this.currentIndex);
        });

        // Update thumbnails
        this.thumbnails.forEach((thumb, index) => {
            thumb.classList.toggle('active', index === this.currentIndex);

            // Scroll active thumbnail into view
            if (index === this.currentIndex) {
                thumb.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
            }
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
