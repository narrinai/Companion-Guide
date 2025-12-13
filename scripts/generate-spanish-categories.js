const fs = require('fs');
const path = require('path');

// Category translations for Spanish
const categoryTranslations = {
    'roleplay-character-chat-companions': {
        title: 'Mejores Aplicaciones de IA para Roleplay y Chat de Personajes 2025',
        metaDescription: 'Compara las 14 mejores aplicaciones de IA para roleplay y chat de personajes en 2025. Reviews de expertos de Character AI, Chai, Janitor AI y más.',
        keywords: 'roleplay IA, chat de personajes, narrativa interactiva, IA roleplay, character AI, chat creativo IA, storytelling IA, chatbot roleplay',
        ogTitle: 'Mejores Plataformas de IA para Roleplay y Chat de Personajes 2025',
        ogDescription: 'Descubre las mejores plataformas de IA para roleplay y chat de personajes para narrativa interactiva y conversaciones creativas.'
    },
    'adult-content-uncensored-companions': {
        title: 'Mejores Plataformas de IA para Adultos Sin Censura 2025',
        metaDescription: 'Compara las mejores plataformas de IA para adultos sin censura en 2025. Reviews de expertos con características NSFW, precios y comparaciones.',
        keywords: 'IA sin censura, NSFW IA, chat adultos IA, plataformas IA adultos, IA sin filtros',
        ogTitle: 'Mejores Plataformas de IA para Adultos Sin Censura 2025',
        ogDescription: 'Descubre las mejores plataformas de IA para adultos sin restricciones de contenido.'
    },
    'adult-image-generation-companions': {
        title: 'Mejores Generadores de Imágenes IA para Adultos 2025',
        metaDescription: 'Compara los mejores generadores de imágenes IA para adultos en 2025. Reviews de expertos de plataformas de arte AI NSFW.',
        keywords: 'generador imagenes IA adultos, arte IA NSFW, imagenes IA sin censura, generador IA adultos',
        ogTitle: 'Mejores Generadores de Imágenes IA para Adultos 2025',
        ogDescription: 'Descubre los mejores generadores de imágenes IA para contenido adulto.'
    },
    'ai-anime-companions': {
        title: 'Mejores Compañeros de IA Anime 2025',
        metaDescription: 'Compara los mejores compañeros de IA anime en 2025. Reviews de expertos de chatbots anime, personajes virtuales y plataformas de roleplay.',
        keywords: 'IA anime, chat anime IA, personaje anime virtual, waifu IA, compañero anime',
        ogTitle: 'Mejores Compañeros de IA Anime 2025',
        ogDescription: 'Descubre los mejores compañeros de IA con estilo anime para chat y roleplay.',
        heroTitle: 'Mejores Compañeros de IA Anime',
        heroBreadcrumb: 'Compañeros IA Anime',
        heroDescription: 'Descubre plataformas de IA diseñadas para compañeros estilo anime. Estas plataformas ofrecen interacciones auténticas con personajes anime, waifus personalizables y experiencias de chat inmersivas con tus arquetipos de personajes favoritos.'
    },
    'ai-girlfriend-companions': {
        title: 'Mejores Plataformas de AI Girlfriend 2025',
        metaDescription: 'Compara las mejores plataformas de AI girlfriend en 2025. Reviews de expertos de novias virtuales IA personalizables.',
        keywords: 'AI girlfriend, novia virtual, chat romantico IA, relacion virtual, novia IA',
        ogTitle: 'Mejores Plataformas de AI Girlfriend 2025',
        ogDescription: 'Descubre las mejores plataformas de AI girlfriend para relaciones románticas virtuales.',
        heroTitle: 'Mejores Plataformas de AI Girlfriend',
        heroBreadcrumb: 'AI Girlfriend',
        heroDescription: 'Explora las mejores plataformas de AI girlfriend para conversaciones románticas y compañía virtual. Encuentra tu compañera virtual perfecta con personalidades personalizables.'
    },
    'ai-boyfriend-companions': {
        title: 'Mejores Plataformas de AI Boyfriend 2025',
        metaDescription: 'Compara las mejores plataformas de AI boyfriend en 2025. Reviews de expertos de novios virtuales IA personalizables.',
        keywords: 'AI boyfriend, novio virtual, chat romantico IA, relacion virtual, novio IA',
        ogTitle: 'Mejores Plataformas de AI Boyfriend 2025',
        ogDescription: 'Descubre las mejores plataformas de AI boyfriend para relaciones románticas virtuales.'
    },
    'ai-romantic-companions': {
        title: 'Mejores Compañeros Románticos de IA 2025',
        metaDescription: 'Compara los mejores compañeros románticos de IA en 2025. Reviews de expertos de plataformas de chat romántico y relaciones virtuales.',
        keywords: 'romance IA, chat romantico IA, relacion virtual, pareja IA, compañero romantico',
        ogTitle: 'Mejores Compañeros Románticos de IA 2025',
        ogDescription: 'Descubre los mejores compañeros de IA para conversaciones románticas y conexiones emocionales.'
    },
    'ai-video-companions': {
        title: 'Mejores Compañeros de Video IA 2025',
        metaDescription: 'Compara los mejores compañeros de video IA en 2025. Reviews de expertos de avatares de video, streaming IA y videollamadas virtuales.',
        keywords: 'video IA, avatar video, streaming IA, videollamada virtual, compañero video',
        ogTitle: 'Mejores Compañeros de Video IA 2025',
        ogDescription: 'Descubre los mejores compañeros de IA con capacidades de video y avatares animados.'
    },
    'ai-voice-companions': {
        title: 'Mejores Compañeros de Voz IA 2025',
        metaDescription: 'Compara los mejores compañeros de voz IA en 2025. Reviews de expertos de chat por voz, síntesis de voz y conversaciones habladas.',
        keywords: 'voz IA, chat voz IA, sintesis voz, conversacion hablada, compañero voz',
        ogTitle: 'Mejores Compañeros de Voz IA 2025',
        ogDescription: 'Descubre los mejores compañeros de IA con capacidades de voz para conversaciones naturales.'
    },
    'wellness-companions': {
        title: 'Mejores Compañeros de Bienestar IA 2025',
        metaDescription: 'Compara los mejores compañeros de bienestar IA en 2025. Reviews de expertos de aplicaciones de salud mental, meditación y apoyo emocional.',
        keywords: 'bienestar IA, salud mental IA, meditacion IA, apoyo emocional, terapia IA',
        ogTitle: 'Mejores Compañeros de Bienestar IA 2025',
        ogDescription: 'Descubre los mejores compañeros de IA para bienestar mental y apoyo emocional.'
    },
    'whatsapp-companions-companions': {
        title: 'Mejores Compañeros de IA para WhatsApp 2025',
        metaDescription: 'Compara los mejores compañeros de IA para WhatsApp en 2025. Reviews de expertos de chatbots y asistentes virtuales para WhatsApp.',
        keywords: 'WhatsApp IA, chatbot WhatsApp, asistente WhatsApp, compañero WhatsApp',
        ogTitle: 'Mejores Compañeros de IA para WhatsApp 2025',
        ogDescription: 'Descubre los mejores compañeros de IA que funcionan directamente en WhatsApp.'
    },
    'ai-porn-chat-platforms': {
        title: 'Mejores Plataformas de Chat de IA para Adultos 2025',
        metaDescription: 'Compara las mejores plataformas de chat de IA para adultos en 2025. Reviews de expertos de chatbots NSFW y plataformas de contenido adulto.',
        keywords: 'chat adultos IA, plataformas NSFW, chatbot adultos, contenido adulto IA',
        ogTitle: 'Mejores Plataformas de Chat de IA para Adultos 2025',
        ogDescription: 'Descubre las mejores plataformas de chat de IA para contenido adulto.'
    },
    'hentai-ai-chat-platforms': {
        title: 'Mejores Plataformas de Chat de IA Hentai 2025',
        metaDescription: 'Compara las mejores plataformas de chat de IA hentai en 2025. Reviews de expertos de chatbots anime para adultos.',
        keywords: 'hentai IA, chat hentai, anime adultos IA, plataforma hentai',
        ogTitle: 'Mejores Plataformas de Chat de IA Hentai 2025',
        ogDescription: 'Descubre las mejores plataformas de chat de IA con contenido hentai.'
    }
};

// Spanish navigation HTML
const spanishNav = `
            <ul class="nav-menu">
                <div class="mobile-menu-logo">
                    <img src="/images/logo.svg" alt="CompanionGuide.ai" width="48" height="48">
                    <span>CompanionGuide.ai</span>
                </div>
                <li><a href="/es/" data-i18n="nav.home">Inicio</a></li>
                <li><a href="/es/companions" data-i18n="nav.companions">Companions</a></li>
                <li><a href="/es/categories" data-i18n="nav.categories" class="active">Categorías</a></li>
                <li><a href="/es/best-for" data-i18n="nav.bestFor">Mejor Para</a></li>
                <li><a href="/es/news" data-i18n="nav.news">Noticias y Guías</a></li>
                <li><a href="/es/deals" data-i18n="nav.deals">Ofertas</a></li>
                <li><a href="/es/contact" data-i18n="nav.contact">Contacto</a></li>
            </ul>`;

function generateSpanishCategory(categorySlug) {
    const enPath = path.join(__dirname, '..', 'categories', `${categorySlug}.html`);
    const esPath = path.join(__dirname, '..', 'es', 'categories', `${categorySlug}.html`);

    if (!fs.existsSync(enPath)) {
        console.log(`English file not found: ${enPath}`);
        return;
    }

    const translation = categoryTranslations[categorySlug];
    if (!translation) {
        console.log(`No translation found for: ${categorySlug}`);
        return;
    }

    let content = fs.readFileSync(enPath, 'utf8');

    // Change lang attribute
    content = content.replace('<html lang="en">', '<html lang="es">');

    // Update title
    content = content.replace(/<title[^>]*>.*?<\/title>/i, `<title>${translation.title}</title>`);

    // Update meta description
    content = content.replace(/<meta name="description" content="[^"]*"[^>]*>/i,
        `<meta name="description" content="${translation.metaDescription}">`);

    // Update keywords
    content = content.replace(/<meta name="keywords" content="[^"]*">/i,
        `<meta name="keywords" content="${translation.keywords}">`);

    // Update canonical URL
    content = content.replace(/<link rel="canonical" href="https:\/\/companionguide\.ai\/categories\//g,
        '<link rel="canonical" href="https://companionguide.ai/es/categories/');

    // Add Spanish hreflang if not exists
    if (!content.includes('hreflang="es"')) {
        content = content.replace(
            /<link rel="alternate" hreflang="x-default"/,
            `<link rel="alternate" hreflang="es" href="https://companionguide.ai/es/categories/${categorySlug}">\n    <link rel="alternate" hreflang="x-default"`
        );
    }

    // Update OG tags
    content = content.replace(/<meta property="og:url" content="[^"]*">/,
        `<meta property="og:url" content="https://companionguide.ai/es/categories/${categorySlug}">`);
    content = content.replace(/<meta property="og:title" content="[^"]*">/,
        `<meta property="og:title" content="${translation.ogTitle}">`);
    content = content.replace(/<meta property="og:description" content="[^"]*">/,
        `<meta property="og:description" content="${translation.ogDescription}">`);

    // Add og:locale
    if (!content.includes('og:locale')) {
        content = content.replace(/<meta property="og:type"/,
            '<meta property="og:locale" content="es_ES">\n    <meta property="og:locale:alternate" content="en_US">\n    <meta property="og:type"');
    }

    // Update Twitter tags
    content = content.replace(/<meta property="twitter:url" content="[^"]*">/,
        `<meta property="twitter:url" content="https://companionguide.ai/es/categories/${categorySlug}">`);
    content = content.replace(/<meta property="twitter:title" content="[^"]*">/,
        `<meta property="twitter:title" content="${translation.ogTitle}">`);
    content = content.replace(/<meta property="twitter:description" content="[^"]*">/,
        `<meta property="twitter:description" content="${translation.ogDescription}">`);

    // Update navigation - replace entire nav-menu
    content = content.replace(/<ul class="nav-menu">[\s\S]*?<\/ul>/m, spanishNav);

    // Update home link in header
    content = content.replace(/<h1><a href="\/">/g, '<h1><a href="/es/">');

    // Update language switcher links
    content = content.replace(/href="\/categories\//g, 'href="/es/categories/');

    // Add Spanish to language dropdown and mark as active
    const langDropdownRegex = /<div class="lang-dropdown"[^>]*>[\s\S]*?<\/div>/;
    const newLangDropdown = `<div class="lang-dropdown" id="lang-dropdown" style="display: none;">
                    <a href="/categories/${categorySlug}" class="lang-option">🇬🇧</a>
                    <a href="/nl/categories/${categorySlug}" class="lang-option">🇳🇱</a>
                    <a href="/pt/categories/${categorySlug}" class="lang-option">🇧🇷</a>
                    <a href="/de/categories/${categorySlug}" class="lang-option">🇩🇪</a>
                    <a href="/es/categories/${categorySlug}" class="lang-option active">🇪🇸</a>
                </div>`;
    content = content.replace(langDropdownRegex, newLangDropdown);

    // Update spotlight banner data-lang
    content = content.replace(/data-lang="en"/g, 'data-lang="es"');

    // Update Schema.org URLs
    content = content.replace(/"url": "https:\/\/companionguide\.ai\/categories\//g,
        '"url": "https://companionguide.ai/es/categories/');
    content = content.replace(/"url": "https:\/\/companionguide\.ai\/companions\//g,
        '"url": "https://companionguide.ai/es/companions/');

    // Update version for cache busting
    content = content.replace(/category-companions\.js\?v=\d+/g, 'category-companions.js?v=20251213');

    // Write the file
    fs.writeFileSync(esPath, content);
    console.log(`Created: ${esPath}`);
}

// Main execution
const categoriesToGenerate = [
    'roleplay-character-chat-companions',
    'adult-content-uncensored-companions',
    'adult-image-generation-companions',
    'ai-anime-companions',
    'ai-boyfriend-companions',
    'ai-romantic-companions',
    'ai-video-companions',
    'ai-voice-companions',
    'wellness-companions',
    'whatsapp-companions-companions',
    'ai-porn-chat-platforms',
    'hentai-ai-chat-platforms'
];

// Ensure es/categories directory exists
const esCategoriesDir = path.join(__dirname, '..', 'es', 'categories');
if (!fs.existsSync(esCategoriesDir)) {
    fs.mkdirSync(esCategoriesDir, { recursive: true });
}

categoriesToGenerate.forEach(generateSpanishCategory);
console.log('\nDone generating Spanish category pages!');
