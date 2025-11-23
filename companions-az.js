// A-Z Companions Page Dynamic Functionality
class CompanionsAZ {
    constructor() {
        this.companions = [];

        this.init();
    }

    async init() {
        await this.loadCompanions();
        this.renderCompanions();
        this.updateStats();
        this.hideLoading();
    }

    async loadCompanions() {
        try {
            const response = await fetch('/.netlify/functions/companionguide-get?lang=en');
            const data = await response.json();

            if (data.companions && Array.isArray(data.companions)) {
                // Filter for only active companions and sort alphabetically
                this.companions = data.companions
                    .filter(c => c.status === 'active' || c.status === 'Active')
                    .sort((a, b) => a.name.localeCompare(b.name));

                console.log(`Loaded ${this.companions.length} active companions from API`);
            } else {
                console.warn('No companions data received, falling back to static data');
                this.companions = this.getStaticCompanions();
            }
        } catch (error) {
            console.error('Error loading companions:', error);
            // Fallback to static data
            this.companions = this.getStaticCompanions();
        }
    }

    getStaticCompanions() {
        // Fallback static data based on existing HTML
        return [
            { name: 'Candy AI', slug: 'candy-ai', status: 'active' },
            { name: 'CaveDuck', slug: 'caveduck', status: 'active' },
            { name: 'Chai AI', slug: 'chai-ai', status: 'active' },
            { name: 'Character AI', slug: 'character-ai', status: 'active' },
            { name: 'Cuties AI', slug: 'cuties-ai', status: 'active' },
            { name: 'DreamGF AI', slug: 'dreamgf-ai', status: 'active' },
            { name: 'FantasyGF AI', slug: 'fantasygf-ai', status: 'active' },
            { name: 'Girlfriend GPT', slug: 'girlfriend-gpt', status: 'active' },
            { name: 'Hammer AI', slug: 'hammer-ai', status: 'active' },
            { name: 'Janitor AI', slug: 'janitor-ai', status: 'active' },
            { name: 'Joi AI', slug: 'joi-ai', status: 'active' },
            { name: 'Joyland AI', slug: 'joyland-ai', status: 'active' },
            { name: 'Junipero AI', slug: 'junipero-ai', status: 'active' },
            { name: 'Kajiwoto AI', slug: 'kajiwoto-ai', status: 'active' },
            { name: 'Kupid AI', slug: 'kupid-ai', status: 'active' },
            { name: 'Lovescape', slug: 'lovescape', status: 'active' },
            { name: 'Muah AI', slug: 'muah-ai', status: 'active' },
            { name: 'Narrin AI', slug: 'narrin-ai', status: 'active' },
            { name: 'Nectar AI', slug: 'nectar-ai', status: 'active' },
            { name: 'Nomi AI', slug: 'nomi-ai', status: 'active' },
            { name: 'OurDream AI', slug: 'ourdream-ai', status: 'active' },
            { name: 'PromptChan AI', slug: 'promptchan-ai', status: 'active' },
            { name: 'Replika', slug: 'replika', status: 'active' },
            { name: 'Sakura AI', slug: 'sakura-ai', status: 'active' },
            { name: 'Secrets AI', slug: 'secrets-ai', status: 'active' },
            { name: 'Selira AI', slug: 'selira-ai', status: 'active' },
            { name: 'Simone', slug: 'simone', status: 'active' },
            { name: 'SoulGen AI', slug: 'soulgen-ai', status: 'active' },
            { name: 'Soulkyn AI', slug: 'soulkyn-ai', status: 'active' },
            { name: 'SpicyChat AI', slug: 'spicychat-ai', status: 'active' },
            { name: 'Stories AI', slug: 'stories-ai', status: 'active' },
            { name: 'Swipey AI', slug: 'swipey-ai', status: 'active' },
            { name: 'ThotChat AI', slug: 'thotchat-ai', status: 'active' }
        ];
    }


    renderCompanions() {
        const container = document.getElementById('az-grid');
        const noResults = document.getElementById('no-results');

        if (this.companions.length === 0) {
            container.innerHTML = '';
            noResults.style.display = 'block';
            return;
        } else {
            noResults.style.display = 'none';
        }

        // Sort companions alphabetically
        const sortedCompanions = [...this.companions].sort((a, b) =>
            a.name.localeCompare(b.name)
        );

        // Divide companions into 4 columns
        const columns = [[], [], [], []];
        const itemsPerColumn = Math.ceil(sortedCompanions.length / 4);

        sortedCompanions.forEach((companion, index) => {
            const columnIndex = Math.floor(index / itemsPerColumn);
            if (columnIndex < 4) {
                columns[columnIndex].push(companion);
            }
        });

        // Generate HTML for 4 columns
        const html = columns.map((columnCompanions, columnIndex) => {
            if (columnCompanions.length === 0) return '';

            // Get first and last letter of this column
            const firstLetter = columnCompanions[0].name.charAt(0).toUpperCase();
            const lastLetter = columnCompanions[columnCompanions.length - 1].name.charAt(0).toUpperCase();
            const title = firstLetter === lastLetter ? firstLetter : `${firstLetter} - ${lastLetter}`;

            // Generate companion list items
            const companionItems = columnCompanions.map((companion, index) => {
                let html = `
                    <li>
                        <a href="/companions/${companion.slug}">
                            <span>${companion.name}</span>
                        </a>
                    </li>`;

                // Insert OurDream AI ad after 5th companion in first column
                if (columnIndex === 0 && index === 4) {
                    html += `
                    <li class="advertisement-item">
                        <div class="advertisement-card" id="ourdream-ad-az">
                            <div class="ad-label">FEATURED</div>
                            <div class="ad-header">
                                <img src="/images/companions/ourdream-ai-logo.svg" alt="OurDream AI" class="ad-logo" id="ourdream-logo-az">
                                <div class="ad-info">
                                    <h3 class="ad-companion-name">OurDream AI</h3>
                                    <div class="ad-rating">
                                        <span class="stars">★★★★★</span>
                                        <span class="rating-value" id="ourdream-rating-az">9.5</span>
                                    </div>
                                </div>
                            </div>
                            <p class="ad-description" id="ourdream-best-for-az">Advanced AI roleplay, voice chat, and image generation</p>
                            <div class="ad-buttons">
                                <a href="#" class="ad-btn-primary" id="ourdream-visit-az">Visit Website</a>
                            </div>
                        </div>
                    </li>`;
                }

                return html;
            }).join('');

            return `
                <div class="az-column">
                    <h3>${title}</h3>
                    <ul>
                        ${companionItems}
                    </ul>
                </div>
            `;
        }).join('');

        container.innerHTML = html;

        // Load OurDream AI data after rendering
        this.loadOurDreamAd();
    }

    groupByLetter(companions) {
        return companions.reduce((groups, companion) => {
            const letter = companion.name.charAt(0).toUpperCase();
            if (!groups[letter]) {
                groups[letter] = [];
            }
            groups[letter].push(companion);
            return groups;
        }, {});
    }

    createSmartGroups(grouped) {
        const letters = Object.keys(grouped).sort();
        const groups = [];
        let currentGroup = null;

        letters.forEach(letter => {
            const companions = grouped[letter];
            const companionCount = companions.length;

            // If current group doesn't exist or would be too big, start a new one
            if (!currentGroup ||
                (currentGroup.companions.length + companionCount > 8) ||
                (currentGroup.companions.length >= 5 && companionCount >= 3)) {

                // Save current group if it exists
                if (currentGroup) {
                    groups.push(currentGroup);
                }

                // Start new group
                currentGroup = {
                    letters: [letter],
                    title: letter,
                    companions: [...companions]
                };
            } else {
                // Add to current group
                currentGroup.letters.push(letter);
                currentGroup.companions.push(...companions);

                // Update title to show range
                if (currentGroup.letters.length > 1) {
                    const firstLetter = currentGroup.letters[0];
                    const lastLetter = currentGroup.letters[currentGroup.letters.length - 1];
                    currentGroup.title = firstLetter === lastLetter ? firstLetter : `${firstLetter} - ${lastLetter}`;
                }
            }
        });

        // Add the last group
        if (currentGroup) {
            groups.push(currentGroup);
        }

        // Sort companions within each group alphabetically
        groups.forEach(group => {
            group.companions.sort((a, b) => a.name.localeCompare(b.name));
        });

        return groups;
    }


    updateStats() {
        const totalElement = document.getElementById('total-companions');
        const letterCategoriesElement = document.getElementById('letter-categories');
        const freeTiersElement = document.getElementById('free-tiers-percent');
        const averageRatingElement = document.getElementById('average-rating');

        if (totalElement) {
            totalElement.textContent = this.companions.length;
        }

        if (letterCategoriesElement) {
            // Always 4 columns
            letterCategoriesElement.textContent = '4';
        }

        // Calculate free tiers percentage (mock data for now)
        if (freeTiersElement) {
            const freePercentage = Math.round((this.companions.length * 0.95)); // 95% mock
            freeTiersElement.textContent = `${Math.round(freePercentage / this.companions.length * 100)}%`;
        }

        // Calculate average rating (mock data for now)
        if (averageRatingElement) {
            const avgRating = this.companions.reduce((sum, companion) => {
                return sum + (companion.rating || 4.2);
            }, 0) / this.companions.length;
            averageRatingElement.textContent = (avgRating || 4.2).toFixed(1);
        }
    }

    hideLoading() {
        const loadingContainer = document.getElementById('loading-state');
        const azIndex = document.getElementById('az-index');
        const directoryStats = document.getElementById('directory-stats');

        if (loadingContainer) {
            loadingContainer.style.display = 'none';
        }

        if (azIndex) {
            azIndex.style.display = 'block';
        }

        if (directoryStats) {
            directoryStats.style.display = 'block';
        }
    }

    async loadOurDreamAd() {
        try {
            const response = await fetch('/.netlify/functions/companionguide-get?lang=en');
            const data = await response.json();

            const ourdream = data.companions?.find(c => c.slug === 'ourdream-ai');

            if (ourdream) {
                // Update logo
                const logoElement = document.getElementById('ourdream-logo-az');
                if (logoElement && ourdream.logo_svg) {
                    logoElement.src = ourdream.logo_svg;
                }

                // Update rating
                const ratingElement = document.getElementById('ourdream-rating-az');
                if (ratingElement && ourdream.rating) {
                    ratingElement.textContent = ourdream.rating;
                }

                // Update best for description
                const bestForElement = document.getElementById('ourdream-best-for-az');
                if (bestForElement) {
                    const bestFor = ourdream.best_for || ourdream.Best_for || ourdream['Best for'] || ourdream.short_description || 'Advanced AI roleplay, voice chat, and image generation';
                    bestForElement.textContent = bestFor;
                }

                // Update visit website link
                const visitButton = document.getElementById('ourdream-visit-az');
                if (visitButton) {
                    const affiliateUrl = ourdream.website_url || 'https://ourdream.ai/?via=companionguide';
                    visitButton.href = affiliateUrl;
                }

                console.log('OurDream AI ad loaded on A-Z page');
            }
        } catch (error) {
            console.error('Error loading OurDream AI ad:', error);
        }
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new CompanionsAZ();
});