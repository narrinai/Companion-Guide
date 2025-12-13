const fs = require('fs');
const path = require('path');

const enPath = path.join(__dirname, '..', 'companions.html');
const esPath = path.join(__dirname, '..', 'es', 'companions.html');

let content = fs.readFileSync(enPath, 'utf8');

// Change lang attribute
content = content.replace('<html lang="en">', '<html lang="es">');

// Update title
content = content.replace(/<title>.*?<\/title>/,
    '<title>Mejores Plataformas de Chat IA 2025 - Top 30 Reviews</title>');

// Update meta description
content = content.replace(/<meta name="description" content="[^"]*">/,
    '<meta name="description" content="Ranking completo de todas las plataformas de chat IA y AI companions por valoraciones de usuarios. Compara Character.AI, Narrin.AI, Replika, plataformas de chat IA gratuitas y más en una lista completa.">');

// Update keywords
content = content.replace(/<meta name="keywords" content="[^"]*">/,
    '<meta name="keywords" content="plataformas chat IA ranking, mejor chat IA 2025, AI companions ranking, comparación chat IA, ranking plataformas IA, Character.AI vs Replika, mejores plataformas chat IA, chat IA gratis">');

// Update canonical URL
content = content.replace(/<link rel="canonical" href="https:\/\/companionguide\.ai\/companions">/,
    '<link rel="canonical" href="https://companionguide.ai/es/companions">');

// Add Spanish hreflang
if (!content.includes('hreflang="es"')) {
    content = content.replace(/<link rel="alternate" hreflang="x-default" href="https:\/\/companionguide\.ai\/companions">/,
        '<link rel="alternate" hreflang="es" href="https://companionguide.ai/es/companions">\n    <link rel="alternate" hreflang="x-default" href="https://companionguide.ai/companions">');
}

// Add og:locale
if (!content.includes('og:locale')) {
    content = content.replace(/<meta property="og:type" content="article">/,
        '<meta property="og:locale" content="es_ES">\n    <meta property="og:locale:alternate" content="en_US">\n    <meta property="og:type" content="article">');
}

// Update OG tags
content = content.replace(/<meta property="og:url" content="https:\/\/companionguide\.ai\/companions">/,
    '<meta property="og:url" content="https://companionguide.ai/es/companions">');
content = content.replace(/<meta property="og:title" content="[^"]*">/,
    '<meta property="og:title" content="Mejores Plataformas de Chat IA & Companions - Lista Completa 2025">');
content = content.replace(/<meta property="og:description" content="[^"]*">/,
    '<meta property="og:description" content="Ranking completo de todas las plataformas de chat IA y AI companions por valoraciones de usuarios y características.">');

// Update Twitter tags
content = content.replace(/<meta property="twitter:url" content="https:\/\/companionguide\.ai\/companions">/,
    '<meta property="twitter:url" content="https://companionguide.ai/es/companions">');
content = content.replace(/<meta property="twitter:title" content="[^"]*">/,
    '<meta property="twitter:title" content="Mejores Plataformas de Chat IA & Companions 2025">');
content = content.replace(/<meta property="twitter:description" content="[^"]*">/,
    '<meta property="twitter:description" content="Ranking completo de plataformas de chat IA y AI companions por valoraciones.">');

// Fix relative CSS path to absolute
content = content.replace(/href="style\.css"/g, 'href="/style.css"');

// Fix relative JS paths to absolute
content = content.replace(/src="script\.js/g, 'src="/script.js');
content = content.replace(/src="js\//g, 'src="/js/');

// Update home link
content = content.replace(/<h1><a href="\/">/g, '<h1><a href="/es/">');

// Update navigation - replace entire nav-menu ul
const spanishNav = `<ul class="nav-menu">
                <div class="mobile-menu-logo">
                    <img src="/images/logo.svg" alt="CompanionGuide.ai" width="48" height="48">
                    <span>CompanionGuide.ai</span>
                </div>
                <li><a href="/es/" data-i18n="nav.home">Inicio</a></li>
                <li><a href="/es/companions" class="active" data-i18n="nav.companions">Companions</a></li>
                <li><a href="/es/categories" data-i18n="nav.categories">Categorías</a></li>
                <li><a href="/es/best-for" data-i18n="nav.bestFor">Mejor Para</a></li>
                <li><a href="/es/news" data-i18n="nav.news">Noticias y Guías</a></li>
                <li><a href="/es/deals" data-i18n="nav.deals">Ofertas</a></li>
                <li><a href="/es/contact" data-i18n="nav.contact">Contacto</a></li>
            </ul>`;
content = content.replace(/<ul class="nav-menu">[\s\S]*?<\/ul>/m, spanishNav);

// Update language switcher
const langSwitcher = `<div class="language-switcher">
                <button id="lang-toggle" class="lang-current"></button>
                <div class="lang-dropdown" id="lang-dropdown" style="display: none;">
                    <a href="/companions" class="lang-option">🇬🇧</a>
                    <a href="/de/companions" class="lang-option">🇩🇪</a>
                    <a href="/nl/companions" class="lang-option">🇳🇱</a>
                    <a href="/pt/companions" class="lang-option">🇧🇷</a>
                    <a href="/es/companions" class="lang-option active">🇪🇸</a>
                </div>
            </div>`;
content = content.replace(/<div class="language-switcher">[\s\S]*?<\/div>\s*<\/div>(?=\s*<div class="hamburger")/m, langSwitcher);

// Update hero section
content = content.replace(/<h1>Best AI Chat Platforms & Companions Ranked by Rating<\/h1>/,
    '<h1>Mejores Plataformas de Chat IA & Companions Ordenadas por Valoración</h1>');
content = content.replace(/<p>Complete ranking of AI chat platforms and AI companion platforms based on user ratings, features, and performance\. Find the perfect AI chat platform or AI companion for your specific needs and preferences\.<\/p>/,
    '<p>Ranking completo de plataformas de chat IA y AI companions basado en valoraciones de usuarios, características y rendimiento. Encuentra la plataforma de chat IA o AI companion perfecta para tus necesidades y preferencias específicas.</p>');

// Update FAQ header
content = content.replace(/<h2>AI Chat Platform FAQs<\/h2>/g,
    '<h2>Preguntas Frecuentes sobre Plataformas de Chat IA</h2>');
content = content.replace(/<h2>AI Companion Platform Guide FAQs<\/h2>/g,
    '<h2>Preguntas Frecuentes sobre Plataformas de AI Companions</h2>');

// Translate "More AI Companions Coming Soon" section
content = content.replace(/>More AI Companions Coming Soon</g, '>Más AI Companions Próximamente<');
content = content.replace(/>We're actively reviewing new AI companion platforms/g, '>Estamos revisando activamente nuevas plataformas de AI companions');
content = content.replace(/>Suggest a Platform</g, '>Sugerir una Plataforma');
content = content.replace(/>Explore Categories →</g, '>Explorar Categorías →');

// Translate FAQ Q&A - Question 1
content = content.replace(/How do I choose the right AI companion platform\?/g,
    '¿Cómo elijo la plataforma de AI companion adecuada?');
content = content.replace(/Consider your primary goals: <a href="\/companions\/character-ai">Character\.AI<\/a> for variety and education, <a href="\/companions\/replika">Replika<\/a> for emotional support, <a href="\/companions\/candy-ai">Candy AI<\/a> for AI girlfriend experience, <a href="\/companions\/hammer-ai">Hammer AI<\/a> for privacy-focused free chat, or <a href="\/companions\/narrin-ai">Narrin\.AI<\/a> for wellness\. Factor in pricing, features, and content policies\./g,
    'Considera tus objetivos principales: <a href="/es/companions/character-ai">Character.AI</a> para variedad y educación, <a href="/es/companions/replika">Replika</a> para apoyo emocional, <a href="/es/companions/candy-ai">Candy AI</a> para experiencia de novia IA, <a href="/es/companions/hammer-ai">Hammer AI</a> para chat gratuito enfocado en privacidad, o <a href="/es/companions/narrin-ai">Narrin.AI</a> para bienestar. Ten en cuenta precios, características y políticas de contenido.');

// Translate FAQ Q&A - Question 2
content = content.replace(/What are the top-rated AI companion platforms in 2026\?/g,
    '¿Cuáles son las plataformas de AI companion mejor valoradas en 2026?');

// Translate FAQ Q&A - Question 3
content = content.replace(/Which AI companions offer completely free access\?/g,
    '¿Qué AI companions ofrecen acceso completamente gratuito?');

// Translate FAQ Q&A - Question 4
content = content.replace(/How do AI companion memory systems work\?/g,
    '¿Cómo funcionan los sistemas de memoria de los AI companions?');

// Translate FAQ Q&A - Question 5
content = content.replace(/What's the average cost of AI companion platforms\?/g,
    '¿Cuál es el costo promedio de las plataformas de AI companion?');

// Translate FAQ Q&A - Question 6
content = content.replace(/Which AI companions work best on mobile devices\?/g,
    '¿Qué AI companions funcionan mejor en dispositivos móviles?');

// Translate FAQ Q&A - Question 7
content = content.replace(/Are there AI companions specifically for professionals\?/g,
    '¿Existen AI companions específicamente para profesionales?');

// Translate FAQ Q&A - Question 8
content = content.replace(/How realistic are modern AI companion conversations\?/g,
    '¿Qué tan realistas son las conversaciones de AI companions modernos?');

// Translate FAQ Q&A - Question 9
content = content.replace(/What safety measures do AI companion platforms implement\?/g,
    '¿Qué medidas de seguridad implementan las plataformas de AI companion?');

// Translate FAQ Q&A - Question 10
content = content.replace(/Can I use multiple AI companion platforms simultaneously\?/g,
    '¿Puedo usar múltiples plataformas de AI companion simultáneamente?');

// Update internal links in FAQ to Spanish versions
content = content.replace(/href="\/companions\//g, 'href="/es/companions/');
content = content.replace(/href="\/contact"/g, 'href="/es/contact"');
content = content.replace(/href="\/categories"/g, 'href="/es/categories"');

// Update footer section headers
content = content.replace(/<h4>Companion Guide<\/h4>\s*<p>Your trusted source for AI companion reviews and guides<\/p>/,
    '<h4>Companion Guide</h4>\n                    <p>Tu fuente confiable para reviews y guías de AI companions</p>');

// Update footer navigation header
content = content.replace(/<h4>Navigation<\/h4>/g, '<h4>Navegación</h4>');

// Update footer navigation links
content = content.replace(/<a href="\/" data-i18n="nav\.home">Home<\/a>/g, '<a href="/es/" data-i18n="nav.home">Inicio</a>');
content = content.replace(/<a href="\/companions" data-i18n="nav\.companions">Companions<\/a>/g, '<a href="/es/companions" data-i18n="nav.companions">Companions</a>');
content = content.replace(/<a href="\/categories" data-i18n="nav\.categories">Categories<\/a>/g, '<a href="/es/categories" data-i18n="nav.categories">Categorías</a>');
content = content.replace(/<a href="\/best-for" data-i18n="nav\.bestFor">Best For<\/a>/g, '<a href="/es/best-for" data-i18n="nav.bestFor">Mejor Para</a>');
content = content.replace(/<a href="\/news" data-i18n="nav\.news">News & Guides<\/a>/g, '<a href="/es/news" data-i18n="nav.news">Noticias y Guías</a>');
content = content.replace(/<a href="\/deals" data-i18n="nav\.deals">Deals<\/a>/g, '<a href="/es/deals" data-i18n="nav.deals">Ofertas</a>');
content = content.replace(/<a href="\/contact">Contact<\/a>/g, '<a href="/es/contact">Contacto</a>');

// Update footer links
content = content.replace(/<a href="\/companions-az">Companions A-Z<\/a>/g, '<a href="/es/companions-az">Companions A-Z</a>');
content = content.replace(/<a href="\/cookie-policy">Cookie Policy<\/a>/g, '<a href="/es/cookie-policy">Política de Cookies</a>');

// Update footer headers
content = content.replace(/<h4>Featured AI Companions<\/h4>/g, '<h4>AI Companions Destacados</h4>');
content = content.replace(/<h4>Featured Guides<\/h4>/g, '<h4>Guías Destacadas</h4>');

// Update footer bottom
content = content.replace(/All rights reserved\./g, 'Todos los derechos reservados.');
content = content.replace(/This site contains affiliate links\. We may earn a commission at no extra cost to you\./g,
    'Este sitio contiene enlaces de afiliados. Podemos ganar una comisión sin costo adicional para ti.');

// Add i18n.js script if not present
if (!content.includes('i18n.js')) {
    content = content.replace('</body>', '    <script src="/js/i18n.js?v=20251213"></script>\n</body>');
}

// Write file
fs.writeFileSync(esPath, content);
console.log('Created Spanish companions.html');
