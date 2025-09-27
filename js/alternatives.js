// Dynamic alternatives loader for companion pages
document.addEventListener('DOMContentLoaded', async function() {
    // Get current page slug from URL
    const currentPath = window.location.pathname;
    const currentSlug = currentPath.split('/').pop().replace('.html', '');

    try {
        const response = await fetch('/.netlify/functions/get-companions');
        const data = await response.json();

        // Filter companions with rating 4.1+ and exclude current page
        const highRatedCompanions = data.companions
            ?.filter(c =>
                c.rating >= 4.1 &&
                c.slug !== currentSlug &&
                c.name // Ensure companion has a name
            )
            ?.sort((a, b) => b.rating - a.rating)
            ?.slice(0, 3); // Top 3 alternatives

        if (highRatedCompanions && highRatedCompanions.length > 0) {
            updateAlternatives(highRatedCompanions);
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

        // Use first sentence of description or fallback
        const shortDescription = companion.description
            ? companion.description.split('.')[0].trim()
            : 'Premium AI companion platform';

        return `
            <a href="${companion.slug}" class="alternative">
                <img src="${logoSrc}" alt="${companion.name}">
                <h3>${companion.name}</h3>
                <p>${shortDescription} (${companion.rating}/5)</p>
            </a>
        `;
    }).join('');

    alternativesGrid.innerHTML = alternativesHTML;
}