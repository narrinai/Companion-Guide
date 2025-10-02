// Review Names Randomizer
// Generates unique reviewer names for each companion page to avoid duplicate names across pages

class ReviewNamesRandomizer {
    constructor() {
        this.firstNames = [
            'Alex', 'Jordan', 'Taylor', 'Morgan', 'Casey', 'Riley', 'Jamie', 'Avery',
            'Quinn', 'Reese', 'Blake', 'Drew', 'Cameron', 'Skylar', 'Devon', 'Sage',
            'Parker', 'Rowan', 'Charlie', 'Finley', 'Emerson', 'River', 'Phoenix', 'Dakota',
            'Sam', 'Chris', 'Jesse', 'Logan', 'Ryan', 'Sean', 'Max', 'Leo',
            'Kai', 'Ash', 'Ellis', 'Jules', 'Nico', 'Remy', 'Adrian', 'Eden',
            'Harper', 'Micah', 'Payton', 'Hayden', 'Kendall', 'Peyton', 'Elliot', 'Robin'
        ];

        this.lastInitials = [
            'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'J', 'K',
            'L', 'M', 'N', 'P', 'R', 'S', 'T', 'V', 'W', 'Z'
        ];

        this.suffixes = ['', '_', '.', ''];

        this.init();
    }

    init() {
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.randomizeNames());
        } else {
            this.randomizeNames();
        }
    }

    // Generate a seed from the page URL for consistent but unique names per page
    getPageSeed() {
        const url = window.location.pathname;
        let hash = 0;
        for (let i = 0; i < url.length; i++) {
            const char = url.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32-bit integer
        }
        return Math.abs(hash);
    }

    // Seeded random number generator for consistency
    seededRandom(seed) {
        const x = Math.sin(seed++) * 10000;
        return x - Math.floor(x);
    }

    // Generate unique name using page seed
    generateUniqueName(index, pageSeed) {
        const seed = pageSeed + index * 1000;

        // Pick first name
        const firstNameIndex = Math.floor(this.seededRandom(seed) * this.firstNames.length);
        const firstName = this.firstNames[firstNameIndex];

        // Pick last initial
        const lastInitialIndex = Math.floor(this.seededRandom(seed + 1) * this.lastInitials.length);
        const lastInitial = this.lastInitials[lastInitialIndex];

        // Pick suffix (underscore, dot, or nothing)
        const suffixIndex = Math.floor(this.seededRandom(seed + 2) * this.suffixes.length);
        const suffix = this.suffixes[suffixIndex];

        // Combine into name
        return `${firstName}${suffix}${lastInitial}`;
    }

    randomizeNames() {
        // Find all reviewer name elements
        const reviewerNames = document.querySelectorAll('.reviewer-name');

        if (reviewerNames.length === 0) {
            return; // No reviews on this page
        }

        const pageSeed = this.getPageSeed();
        const usedNames = new Set();

        reviewerNames.forEach((nameElement, index) => {
            let newName;
            let attempts = 0;

            // Generate unique name (try up to 50 times to avoid duplicates)
            do {
                newName = this.generateUniqueName(index + attempts, pageSeed);
                attempts++;
            } while (usedNames.has(newName) && attempts < 50);

            usedNames.add(newName);
            nameElement.textContent = newName;
        });

        console.log(`Randomized ${reviewerNames.length} reviewer names for this page`);
    }
}

// Initialize when script loads
new ReviewNamesRandomizer();
