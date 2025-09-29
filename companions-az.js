// A-Z Companions Page Dynamic Functionality
class CompanionsAZ {
    constructor() {
        this.companions = [];
        this.filteredCompanions = [];
        this.currentFilter = 'all';
        this.searchTerm = '';

        this.init();
    }

    async init() {
        this.bindEvents();
        await this.loadCompanions();
        this.renderCompanions();
        this.updateStats();
        this.hideLoading();
    }

    bindEvents() {
        // Status filter buttons
        document.querySelectorAll('.status-filter').forEach(button => {
            button.addEventListener('click', (e) => {
                this.handleStatusFilter(e.target.dataset.status);
            });
        });

        // Search input
        const searchInput = document.getElementById('companion-search');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.handleSearch(e.target.value);
            });
        }
    }

    async loadCompanions() {
        try {
            const response = await fetch('/.netlify/functions/get-companions');
            const data = await response.json();

            if (data.companions) {
                this.companions = data.companions;
                this.filteredCompanions = [...this.companions];
            } else {
                console.warn('No companions data received, falling back to static data');
                this.companions = this.getStaticCompanions();
                this.filteredCompanions = [...this.companions];
            }
        } catch (error) {
            console.error('Error loading companions:', error);
            // Fallback to static data
            this.companions = this.getStaticCompanions();
            this.filteredCompanions = [...this.companions];
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

    handleStatusFilter(status) {
        this.currentFilter = status;

        // Update active button
        document.querySelectorAll('.status-filter').forEach(button => {
            button.classList.remove('active');
        });
        document.querySelector(`[data-status="${status}"]`).classList.add('active');

        this.applyFilters();
    }

    handleSearch(searchTerm) {
        this.searchTerm = searchTerm.toLowerCase().trim();
        this.applyFilters();
    }

    applyFilters() {
        let filtered = [...this.companions];

        // Apply status filter
        if (this.currentFilter !== 'all') {
            const filterStatus = this.currentFilter === 'coming-soon' ? 'Coming Soon' :
                               this.currentFilter === 'active' ? 'active' : this.currentFilter;
            filtered = filtered.filter(companion => {
                const status = companion.status || 'active';
                return status.toLowerCase() === filterStatus.toLowerCase();
            });
        }

        // Apply search filter
        if (this.searchTerm) {
            filtered = filtered.filter(companion =>
                companion.name.toLowerCase().includes(this.searchTerm)
            );
        }

        this.filteredCompanions = filtered;
        this.renderCompanions();
        this.updateStats();
    }

    renderCompanions() {
        const container = document.getElementById('az-grid');
        const noResults = document.getElementById('no-results');

        if (this.filteredCompanions.length === 0) {
            container.innerHTML = '';
            noResults.style.display = 'block';
            return;
        } else {
            noResults.style.display = 'none';
        }

        // Group companions by first letter
        const grouped = this.groupByLetter(this.filteredCompanions);

        // Generate HTML
        const html = Object.keys(grouped).sort().map(letter => {
            const companions = grouped[letter].sort((a, b) => a.name.localeCompare(b.name));

            return `
                <div class="az-column">
                    <h3>${this.getLetterRange(letter, grouped)}</h3>
                    <ul>
                        ${companions.map(companion => `
                            <li>
                                <a href="/companions/${companion.slug}">
                                    <span>${companion.name}</span>
                                </a>
                            </li>
                        `).join('')}
                    </ul>
                </div>
            `;
        }).join('');

        container.innerHTML = html;
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

    getLetterRange(letter, grouped) {
        // Simply return the letter - we'll keep it simple and clear
        return letter;
    }


    updateStats() {
        const totalElement = document.getElementById('total-companions');
        const letterCategoriesElement = document.getElementById('letter-categories');
        const freeTiersElement = document.getElementById('free-tiers-percent');
        const averageRatingElement = document.getElementById('average-rating');

        if (totalElement) {
            totalElement.textContent = this.filteredCompanions.length;
        }

        if (letterCategoriesElement) {
            const grouped = this.groupByLetter(this.filteredCompanions);
            letterCategoriesElement.textContent = Object.keys(grouped).length;
        }

        // Calculate free tiers percentage (mock data for now)
        if (freeTiersElement) {
            const freePercentage = Math.round((this.filteredCompanions.length * 0.95)); // 95% mock
            freeTiersElement.textContent = `${Math.round(freePercentage / this.filteredCompanions.length * 100)}%`;
        }

        // Calculate average rating (mock data for now)
        if (averageRatingElement) {
            const avgRating = this.filteredCompanions.reduce((sum, companion) => {
                return sum + (companion.rating || 4.2);
            }, 0) / this.filteredCompanions.length;
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
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new CompanionsAZ();
});