// Dynamic alternatives loader for companion pages
document.addEventListener('DOMContentLoaded', async function() {
    // Get current page slug from URL
    const currentPath = window.location.pathname;
    const currentSlug = currentPath.split('/').pop().replace('.html', '');

    try {
        const response = await fetch('/.netlify/functions/companionguide-get');
        const data = await response.json();

        // First, find the current companion to get its categories
        const currentCompanion = data.companions?.find(c => c.slug === currentSlug);

        if (!currentCompanion || !currentCompanion.categories || currentCompanion.categories.length === 0) {
            console.log('No category found for current companion, using fallback alternatives');
            // Fallback to rating-based alternatives
            const highRatedCompanions = data.companions
                ?.filter(c =>
                    c.rating >= 4.1 &&
                    c.slug !== currentSlug &&
                    c.name
                )
                ?.sort((a, b) => b.rating - a.rating)
                ?.slice(0, 3);

            if (highRatedCompanions && highRatedCompanions.length > 0) {
                updateAlternatives(highRatedCompanions);
            }
            return;
        }

        // Get companions from the same categories
        const sameCategoryCompanions = data.companions
            ?.filter(c => {
                if (c.slug === currentSlug || !c.name || !c.categories) return false;

                // Check if companion shares at least one category with current companion
                const hasSharedCategory = c.categories.some(cat =>
                    currentCompanion.categories.includes(cat)
                );

                return hasSharedCategory;
            })
            ?.sort((a, b) => b.rating - a.rating)
            ?.slice(0, 3); // Top 3 alternatives from same category

        if (sameCategoryCompanions && sameCategoryCompanions.length > 0) {
            updateAlternatives(sameCategoryCompanions);
        } else {
            console.log('No companions found in same category, using fallback');
            // Fallback to rating-based if no companions in same category
            const highRatedCompanions = data.companions
                ?.filter(c =>
                    c.rating >= 4.1 &&
                    c.slug !== currentSlug &&
                    c.name
                )
                ?.sort((a, b) => b.rating - a.rating)
                ?.slice(0, 3);

            if (highRatedCompanions && highRatedCompanions.length > 0) {
                updateAlternatives(highRatedCompanions);
            }
        }
    } catch (error) {
        console.error('Error loading alternatives:', error);
        // Keep static alternatives as fallback
    }
});

function updateAlternatives(companions) {
    const alternativesGrid = document.querySelector('.alternatives-grid');
    if (!alternativesGrid || !Array.isArray(companions)) return;

    const alternativesHTML = companions.map(companion => {
        // Use logo_url from Airtable if available, otherwise fallback to local path
        const logoSrc = companion.logo_url || `../images/logos/${companion.slug}.png`;

        // Use short_description if available, otherwise first sentence of description
        const shortDescription = companion.short_description ||
            (companion.description ? companion.description.split('.')[0].trim() : 'Premium AI companion platform');

        return `
            <a href="${companion.slug}" class="alternative">
                <img src="${logoSrc}" alt="${companion.name} logo" onerror="this.src='../images/logos/default.png'">
                <h3>${companion.name}</h3>
                <p>${shortDescription}</p>
            </a>
        `;
    }).join('');

    alternativesGrid.innerHTML = alternativesHTML;
}