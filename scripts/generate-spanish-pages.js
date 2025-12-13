const fs = require('fs');
const path = require('path');

// Spanish navigation HTML
const spanishNav = `<ul class="nav-menu">
                <div class="mobile-menu-logo">
                    <img src="/images/logo.svg" alt="CompanionGuide.ai" width="48" height="48">
                    <span>CompanionGuide.ai</span>
                </div>
                <li><a href="/es/" data-i18n="nav.home">Inicio</a></li>
                <li><a href="/es/companions" data-i18n="nav.companions">Companions</a></li>
                <li><a href="/es/categories" data-i18n="nav.categories">Categorías</a></li>
                <li><a href="/es/best-for" data-i18n="nav.bestFor">Mejor Para</a></li>
                <li><a href="/es/news" data-i18n="nav.news">Noticias y Guías</a></li>
                <li><a href="/es/deals" data-i18n="nav.deals">Ofertas</a></li>
                <li><a href="/es/contact" data-i18n="nav.contact">Contacto</a></li>
            </ul>`;

// Generate Spanish news.html
function generateSpanishNews() {
    const enPath = path.join(__dirname, '..', 'news.html');
    const esPath = path.join(__dirname, '..', 'es', 'news.html');

    let content = fs.readFileSync(enPath, 'utf8');

    // Change lang attribute
    content = content.replace('<html lang="en">', '<html lang="es">');

    // Update title
    content = content.replace(/<title>.*?<\/title>/,
        '<title>Noticias de IA Chat 2025 - Últimas Actualizaciones y Tendencias</title>');

    // Update meta description
    content = content.replace(/<meta name="description" content="[^"]*">/,
        '<meta name="description" content="Mantente actualizado con las últimas noticias de plataformas de chat IA y AI companions, análisis de la industria y tendencias del mercado.">');

    // Update keywords
    content = content.replace(/<meta name="keywords" content="[^"]*">/,
        '<meta name="keywords" content="noticias IA chat, noticias AI companion, actualizaciones plataformas IA, noticias Character.AI, actualizaciones Replika, industria chatbot IA">');

    // Update canonical URL
    content = content.replace(/<link rel="canonical" href="https:\/\/companionguide\.ai\/news">/,
        '<link rel="canonical" href="https://companionguide.ai/es/news">');

    // Add Spanish hreflang
    if (!content.includes('hreflang="es"')) {
        content = content.replace(
            /<link rel="alternate" hreflang="x-default"/,
            '<link rel="alternate" hreflang="es" href="https://companionguide.ai/es/news">\n    <link rel="alternate" hreflang="x-default"'
        );
    }

    // Add og:locale
    if (!content.includes('og:locale')) {
        content = content.replace(/<meta property="og:type"/,
            '<meta property="og:locale" content="es_ES">\n    <meta property="og:locale:alternate" content="en_US">\n    <meta property="og:type"');
    }

    // Update OG tags
    content = content.replace(/<meta property="og:url" content="https:\/\/companionguide\.ai\/news">/,
        '<meta property="og:url" content="https://companionguide.ai/es/news">');
    content = content.replace(/<meta property="og:title" content="[^"]*">/,
        '<meta property="og:title" content="Noticias de Plataformas de Chat IA y Companions 2025">');
    content = content.replace(/<meta property="og:description" content="[^"]*">/,
        '<meta property="og:description" content="Últimas noticias y análisis sobre plataformas de chat IA y AI companions.">');

    // Update Twitter tags
    content = content.replace(/<meta property="twitter:url" content="https:\/\/companionguide\.ai\/news">/,
        '<meta property="twitter:url" content="https://companionguide.ai/es/news">');
    content = content.replace(/<meta property="twitter:title" content="[^"]*">/,
        '<meta property="twitter:title" content="Noticias de Chat IA y Companions 2025">');
    content = content.replace(/<meta property="twitter:description" content="[^"]*">/,
        '<meta property="twitter:description" content="Últimas noticias y análisis de plataformas de chat IA.">');

    // Update home link
    content = content.replace(/<h1><a href="\/">/g, '<h1><a href="/es/">');

    // Update navigation
    content = content.replace(/<ul class="nav-menu">[\s\S]*?<\/ul>/m, spanishNav);

    // Update nav active class for news
    content = content.replace('href="/es/news" data-i18n="nav.news">Noticias y Guías</a>',
        'href="/es/news" class="active" data-i18n="nav.news">Noticias y Guías</a>');

    // Update language switcher
    const langDropdown = `<div class="lang-dropdown" id="lang-dropdown" style="display: none;">
                    <a href="/news" class="lang-option">🇬🇧</a>
                    <a href="/de/news" class="lang-option">🇩🇪</a>
                    <a href="/nl/news" class="lang-option">🇳🇱</a>
                    <a href="/pt/news" class="lang-option">🇧🇷</a>
                    <a href="/es/news" class="lang-option active">🇪🇸</a>
                </div>`;
    content = content.replace(/<div class="lang-dropdown"[^>]*>[\s\S]*?<\/div>(?=\s*<\/div>\s*<\/nav>)/m, langDropdown);

    // Update hero section
    content = content.replace(/<h1>AI Chat & Companion Platform News<\/h1>/,
        '<h1>Noticias de Plataformas de Chat IA y Companions</h1>');
    content = content.replace(/Stay updated with the latest developments in AI chat platforms and AI companion platforms, industry analysis, and market trends/,
        'Mantente actualizado con los últimos desarrollos en plataformas de chat IA y AI companions, análisis de la industria y tendencias del mercado');

    // Update section headers
    content = content.replace(/<h2>Latest AI Chat & Companion Platform News<\/h2>/,
        '<h2>Últimas Noticias de Plataformas de Chat IA</h2>');
    content = content.replace(/Recent developments and industry updates/,
        'Últimos desarrollos y actualizaciones de la industria');

    // Update news badges
    content = content.replace(/<div class="news-badge">Latest<\/div>/g,
        '<div class="news-badge">Nuevo</div>');

    // Update Schema.org URLs
    content = content.replace(/"url": "https:\/\/companionguide\.ai\/news"/g,
        '"url": "https://companionguide.ai/es/news"');

    // Add i18n.js script if not present
    if (!content.includes('i18n.js')) {
        content = content.replace('</body>', '    <script src="/js/i18n.js?v=20251213"></script>\n</body>');
    }

    fs.writeFileSync(esPath, content);
    console.log('Created Spanish news.html');
}

// Generate Spanish contact.html
function generateSpanishContact() {
    const enPath = path.join(__dirname, '..', 'contact.html');
    const esPath = path.join(__dirname, '..', 'es', 'contact.html');

    let content = fs.readFileSync(enPath, 'utf8');

    // Change lang attribute
    content = content.replace('<html lang="en">', '<html lang="es">');

    // Update title
    content = content.replace(/<title>.*?<\/title>/,
        '<title>Contáctanos - Companion Guide | Ponte en Contacto</title>');

    // Update meta description
    content = content.replace(/<meta name="description" content="[^"]*">/,
        '<meta name="description" content="Contacta con Companion Guide para preguntas, sugerencias u oportunidades de colaboración. Estamos aquí para ayudarte a encontrar el AI companion perfecto.">');

    // Update keywords
    content = content.replace(/<meta name="keywords" content="[^"]*">/,
        '<meta name="keywords" content="contacto, companion guide, soporte AI companion, ponte en contacto, colaboración">');

    // Update canonical URL
    content = content.replace(/<link rel="canonical" href="https:\/\/companionguide\.ai\/contact">/,
        '<link rel="canonical" href="https://companionguide.ai/es/contact">');

    // Add Spanish hreflang
    if (!content.includes('hreflang="es"')) {
        content = content.replace(
            /<link rel="alternate" hreflang="x-default"/,
            '<link rel="alternate" hreflang="es" href="https://companionguide.ai/es/contact">\n    <link rel="alternate" hreflang="x-default"'
        );
    }

    // Add og:locale
    if (!content.includes('og:locale')) {
        content = content.replace(/<meta property="og:type"/,
            '<meta property="og:locale" content="es_ES">\n    <meta property="og:locale:alternate" content="en_US">\n    <meta property="og:type"');
    }

    // Update OG tags
    content = content.replace(/<meta property="og:url" content="https:\/\/companionguide\.ai\/contact">/,
        '<meta property="og:url" content="https://companionguide.ai/es/contact">');
    content = content.replace(/<meta property="og:title" content="[^"]*">/,
        '<meta property="og:title" content="Contáctanos - Companion Guide">');
    content = content.replace(/<meta property="og:description" content="[^"]*">/,
        '<meta property="og:description" content="Ponte en contacto con Companion Guide para preguntas, sugerencias u oportunidades de colaboración.">');

    // Update Twitter tags
    content = content.replace(/<meta property="twitter:url" content="https:\/\/companionguide\.ai\/contact">/,
        '<meta property="twitter:url" content="https://companionguide.ai/es/contact">');
    content = content.replace(/<meta property="twitter:title" content="[^"]*">/,
        '<meta property="twitter:title" content="Contáctanos - Companion Guide">');
    content = content.replace(/<meta property="twitter:description" content="[^"]*">/,
        '<meta property="twitter:description" content="Ponte en contacto con Companion Guide para preguntas, sugerencias u oportunidades de colaboración.">');

    // Update home link
    content = content.replace(/<h1><a href="\/">/g, '<h1><a href="/es/">');

    // Update navigation
    content = content.replace(/<ul class="nav-menu">[\s\S]*?<\/ul>/m, spanishNav);

    // Update nav active class for contact
    content = content.replace('href="/es/contact" data-i18n="nav.contact">Contacto</a>',
        'href="/es/contact" class="active" data-i18n="nav.contact">Contacto</a>');

    // Update language switcher
    const langDropdown = `<div class="lang-dropdown" id="lang-dropdown" style="display: none;">
                    <a href="/contact" class="lang-option">🇬🇧</a>
                    <a href="/de/contact" class="lang-option">🇩🇪</a>
                    <a href="/nl/contact" class="lang-option">🇳🇱</a>
                    <a href="/pt/contact" class="lang-option">🇧🇷</a>
                    <a href="/es/contact" class="lang-option active">🇪🇸</a>
                </div>`;
    content = content.replace(/<div class="lang-dropdown"[^>]*>[\s\S]*?<\/div>(?=\s*<\/div>\s*<\/nav>)/m, langDropdown);

    // Update hero section
    content = content.replace(/<h1>Get in Touch<\/h1>/,
        '<h1>Ponte en Contacto</h1>');
    content = content.replace(/Add your companion, ask questions, add suggestions, or explore partnership opportunities\?<br>We'd love to hear from you\./,
        '¿Quieres añadir tu companion, hacer preguntas, sugerencias o explorar oportunidades de colaboración?<br>Nos encantaría saber de ti.');

    // Update contact info section
    content = content.replace(/<h2>Contact Information<\/h2>/,
        '<h2>Información de Contacto</h2>');
    content = content.replace(/<h3>Response Time<\/h3>/,
        '<h3>Tiempo de Respuesta</h3>');
    content = content.replace(/Within 24-48 hours/,
        'Dentro de 24-48 horas');
    content = content.replace(/<h3>Coverage<\/h3>/,
        '<h3>Cobertura</h3>');
    content = content.replace(/Global AI companion platforms/,
        'Plataformas de AI companion globales');

    // Update contact reasons
    content = content.replace(/<h3>What can we help you with\?<\/h3>/,
        '<h3>¿En qué podemos ayudarte?</h3>');
    content = content.replace(/Platform reviews and recommendations/,
        'Reviews y recomendaciones de plataformas');
    content = content.replace(/Partnership and collaboration opportunities/,
        'Oportunidades de colaboración y partnerships');
    content = content.replace(/Content suggestions and feedback/,
        'Sugerencias de contenido y feedback');
    content = content.replace(/Technical questions about AI companions/,
        'Preguntas técnicas sobre AI companions');
    content = content.replace(/Media inquiries and interviews/,
        'Consultas de medios y entrevistas');

    // Update community section
    content = content.replace(/<h3>Join Our Community<\/h3>/,
        '<h3>Únete a Nuestra Comunidad</h3>');

    // Update form section
    content = content.replace(/<h2>Send us a Message<\/h2>/,
        '<h2>Envíanos un Mensaje</h2>');
    content = content.replace(/<label for="name">Full Name<\/label>/,
        '<label for="name">Nombre Completo</label>');
    content = content.replace(/<label for="email">Email Address<\/label>/,
        '<label for="email">Correo Electrónico</label>');
    content = content.replace(/<label for="company">Company\/Organization \(Optional\)<\/label>/,
        '<label for="company">Empresa/Organización (Opcional)</label>');
    content = content.replace(/<label for="subject">Subject<\/label>/,
        '<label for="subject">Asunto</label>');
    content = content.replace(/Select a subject/,
        'Selecciona un asunto');
    content = content.replace(/General Inquiry/,
        'Consulta General');
    content = content.replace(/Review Request/,
        'Solicitud de Review');
    content = content.replace(/Partnership Opportunity/,
        'Oportunidad de Colaboración');
    content = content.replace(/Feedback & Suggestions/,
        'Feedback y Sugerencias');
    content = content.replace(/Media Inquiry/,
        'Consulta de Medios');

    // Update Schema.org
    content = content.replace(/"url": "https:\/\/companionguide\.ai\/contact"/,
        '"url": "https://companionguide.ai/es/contact"');
    content = content.replace(/"availableLanguage": \["English", "Dutch", "Portuguese", "German"\]/,
        '"availableLanguage": ["Spanish", "English", "Dutch", "Portuguese", "German"]');

    // Add i18n.js script if not present
    if (!content.includes('i18n.js')) {
        content = content.replace('</body>', '    <script src="/js/i18n.js?v=20251213"></script>\n</body>');
    }

    fs.writeFileSync(esPath, content);
    console.log('Created Spanish contact.html');
}

// Generate Spanish deals.html
function generateSpanishDeals() {
    const enPath = path.join(__dirname, '..', 'deals.html');
    const esPath = path.join(__dirname, '..', 'es', 'deals.html');

    let content = fs.readFileSync(enPath, 'utf8');

    // Change lang attribute
    content = content.replace('<html lang="en">', '<html lang="es">');

    // Update title
    content = content.replace(/<title>.*?<\/title>/,
        '<title>Ofertas de Plataformas de Chat IA 2025 - Mejores Descuentos</title>');

    // Update meta description
    content = content.replace(/<meta name="description" content="[^"]*">/,
        '<meta name="description" content="Ahorra hasta 70% en plataformas de chat IA. Ofertas exclusivas en Soulkyn AI, DreamGF, Secrets AI. Descuentos en suscripciones premium de chat IA actualizados diariamente.">');

    // Update keywords
    content = content.replace(/<meta name="keywords" content="[^"]*">/,
        '<meta name="keywords" content="ofertas chat IA, descuentos AI companion, ofertas plataformas chat IA, descuento Soulkyn AI, códigos promo chat IA, mejores ofertas chat IA 2025">');

    // Update canonical URL
    content = content.replace(/<link rel="canonical" href="https:\/\/companionguide\.ai\/deals">/,
        '<link rel="canonical" href="https://companionguide.ai/es/deals">');

    // Add Spanish hreflang
    if (!content.includes('hreflang="es"')) {
        content = content.replace(
            /<link rel="alternate" hreflang="x-default"/,
            '<link rel="alternate" hreflang="es" href="https://companionguide.ai/es/deals">\n    <link rel="alternate" hreflang="x-default"'
        );
    }

    // Add og:locale
    if (!content.includes('og:locale')) {
        content = content.replace(/<meta property="og:type"/,
            '<meta property="og:locale" content="es_ES">\n    <meta property="og:locale:alternate" content="en_US">\n    <meta property="og:type"');
    }

    // Update OG tags
    content = content.replace(/<meta property="og:url" content="https:\/\/companionguide\.ai\/deals">/,
        '<meta property="og:url" content="https://companionguide.ai/es/deals">');
    content = content.replace(/<meta property="og:title" content="[^"]*">/,
        '<meta property="og:title" content="Ofertas y Descuentos de AI Companion - Ahorra hasta 50%">');
    content = content.replace(/<meta property="og:description" content="[^"]*">/,
        '<meta property="og:description" content="Ofertas exclusivas en plataformas de AI companion. Ahorra en suscripciones premium con nuestras ofertas seleccionadas.">');

    // Update Twitter tags
    content = content.replace(/<meta property="twitter:url" content="https:\/\/companionguide\.ai\/deals">/,
        '<meta property="twitter:url" content="https://companionguide.ai/es/deals">');
    content = content.replace(/<meta property="twitter:title" content="[^"]*">/,
        '<meta property="twitter:title" content="Ofertas y Descuentos de AI Companion 2025">');
    content = content.replace(/<meta property="twitter:description" content="[^"]*">/,
        '<meta property="twitter:description" content="Ahorra hasta 50% en suscripciones de AI companion con ofertas exclusivas.">');

    // Update home link
    content = content.replace(/<h1><a href="\/">/g, '<h1><a href="/es/">');

    // Update navigation
    content = content.replace(/<ul class="nav-menu">[\s\S]*?<\/ul>/m, spanishNav);

    // Update nav active class for deals
    content = content.replace('href="/es/deals" data-i18n="nav.deals">Ofertas</a>',
        'href="/es/deals" class="active" data-i18n="nav.deals">Ofertas</a>');

    // Update language switcher
    const langDropdown = `<div class="lang-dropdown" id="lang-dropdown" style="display: none;">
                    <a href="/deals" class="lang-option">🇬🇧</a>
                    <a href="/de/deals" class="lang-option">🇩🇪</a>
                    <a href="/nl/deals" class="lang-option">🇳🇱</a>
                    <a href="/pt/deals" class="lang-option">🇧🇷</a>
                    <a href="/es/deals" class="lang-option active">🇪🇸</a>
                </div>`;
    content = content.replace(/<div class="lang-dropdown"[^>]*>[\s\S]*?<\/div>(?=\s*<\/div>\s*<\/nav>)/m, langDropdown);

    // Update hero section - use regex to be more flexible
    content = content.replace(/AI Chat Platform Deals/g, 'Ofertas de Plataformas de Chat IA');
    content = content.replace(/Best Discounts & Offers/g, 'Mejores Descuentos y Ofertas');
    content = content.replace(/Save up to \d+% on AI chat platforms/g, 'Ahorra hasta 70% en plataformas de chat IA');
    content = content.replace(/Exclusive deals on AI companion platforms/g, 'Ofertas exclusivas en plataformas de AI companion');

    // Update deal labels
    content = content.replace(/>Featured Deal</g, '>Oferta Destacada<');
    content = content.replace(/>Limited Time</g, '>Tiempo Limitado<');
    content = content.replace(/>Best Value</g, '>Mejor Valor<');
    content = content.replace(/>Get Deal</g, '>Ver Oferta<');
    content = content.replace(/>Claim Offer</g, '>Reclamar Oferta<');

    // Add i18n.js script if not present
    if (!content.includes('i18n.js')) {
        content = content.replace('</body>', '    <script src="/js/i18n.js?v=20251213"></script>\n</body>');
    }

    fs.writeFileSync(esPath, content);
    console.log('Created Spanish deals.html');
}

// Ensure es directory exists
const esDir = path.join(__dirname, '..', 'es');
if (!fs.existsSync(esDir)) {
    fs.mkdirSync(esDir, { recursive: true });
}

// Generate all pages
generateSpanishNews();
generateSpanishContact();
generateSpanishDeals();

console.log('\nDone generating Spanish pages!');
