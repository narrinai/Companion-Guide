/**
 * Script to generate Spanish companion pages from EN templates
 * Uses Airtable Spanish translations for ALL dynamic content
 */

const fs = require('fs');
const path = require('path');
const Airtable = require('airtable');

const base = new Airtable({ apiKey: process.env.AIRTABLE_TOKEN }).base(process.env.AIRTABLE_BASE_ID);

const EN_DIR = '/Users/sebastiaansmits/Documents/AI-Companion-Reviews/companions';
const ES_DIR = '/Users/sebastiaansmits/Documents/AI-Companion-Reviews/es/companions';

// Get slug from command line or use default
const targetSlug = process.argv[2] || 'secrets-ai';

async function getCompanionData(slug) {
    // Get companion from Table 1
    const companions = await new Promise((resolve, reject) => {
        const results = [];
        base('Table 1').select({
            filterByFormula: `slug = '${slug}'`,
            maxRecords: 1
        }).eachPage(
            (records, next) => { records.forEach(r => results.push({ id: r.id, ...r.fields })); next(); },
            (err) => err ? reject(err) : resolve(results)
        );
    });

    if (companions.length === 0) {
        throw new Error(`Companion not found: ${slug}`);
    }

    const companion = companions[0];

    // Get Spanish translation
    const esTranslation = await new Promise((resolve, reject) => {
        base('Companion_Translations').select({
            filterByFormula: `AND(language = 'es', companion = '${companion.id}')`,
            maxRecords: 1
        }).eachPage(
            (records, next) => { records.forEach(r => resolve(r.fields)); next(); },
            (err) => err ? reject(err) : resolve(null)
        );
    });

    return { companion, esTranslation };
}

function generatePricingHTML(pricingPlansJson, websiteUrl) {
    if (!pricingPlansJson) return null;

    try {
        const plans = JSON.parse(pricingPlansJson);
        if (!Array.isArray(plans) || plans.length === 0) return null;

        let html = '';
        plans.forEach((plan, index) => {
            const isFeatured = plan.featured || plan.popular || index === Math.floor(plans.length / 2);
            const featuredClass = isFeatured ? ' featured' : '';
            const badge = plan.badge || (isFeatured ? 'MÁS POPULAR' : '');

            html += `                <div class="pricing-tier${featuredClass}">
`;
            if (badge) {
                html += `                    <div class="tier-badge">${badge}</div>
`;
            }
            html += `                    <h3>${plan.name || plan.plan || 'Plan'}</h3>
                    <div class="price">${plan.price || 'Gratis'} <span class="period">${plan.period || ''}</span></div>
                    <p>${plan.description || ''}</p>
                    <ul>
`;
            if (plan.features && Array.isArray(plan.features)) {
                plan.features.forEach(feature => {
                    if (typeof feature === 'string') {
                        html += `                        <li>${feature}</li>
`;
                    } else if (feature.included === false) {
                        html += `                        <li class="feature-excluded">${feature.text || feature.name}</li>
`;
                    } else {
                        html += `                        <li>${feature.text || feature.name}</li>
`;
                    }
                });
            }
            html += `                    </ul>
                    <a href="${websiteUrl}" class="pricing-cta" target="_blank">Visitar Web →</a>
                </div>

`;
        });

        return html;
    } catch (e) {
        console.log('Error parsing pricing_plans:', e.message);
        return null;
    }
}

function generateProsCons(prosConsJson) {
    if (!prosConsJson) return null;

    try {
        const data = JSON.parse(prosConsJson);
        let prosHtml = '';
        let consHtml = '';

        if (data.pros && Array.isArray(data.pros)) {
            data.pros.forEach(pro => {
                prosHtml += `                        <li>${pro}</li>
`;
            });
        }

        if (data.cons && Array.isArray(data.cons)) {
            data.cons.forEach(con => {
                consHtml += `                        <li>${con}</li>
`;
            });
        }

        return { prosHtml, consHtml };
    } catch (e) {
        console.log('Error parsing pros_cons:', e.message);
        return null;
    }
}

function generateFAQHtml(faqJson) {
    if (!faqJson) return null;

    try {
        const faqs = JSON.parse(faqJson);
        if (!Array.isArray(faqs) || faqs.length === 0) return null;

        let html = '';
        faqs.forEach(faq => {
            html += `                <div class="faq-item">
                    <button class="faq-question" onclick="toggleFaq(this)">
                        ${faq.question || faq.q}
                        <span class="faq-icon">+</span>
                    </button>
                    <div class="faq-answer">
                        <p>${faq.answer || faq.a}</p>
                    </div>
                </div>
`;
        });

        return html;
    } catch (e) {
        console.log('Error parsing faq:', e.message);
        return null;
    }
}

function convertEnToEs(html, companion, esTranslation) {
    let result = html;
    const websiteUrl = companion.website_url || '#';

    // 1. Change lang attribute
    result = result.replace(/lang="en"/g, 'lang="es"');

    // 2. Add /es/ prefix to internal links
    result = result.replace(/href="\/companions\//g, 'href="/es/companions/');
    result = result.replace(/href="\/categories\//g, 'href="/es/categories/');
    result = result.replace(/href="\/news\//g, 'href="/es/news/');
    result = result.replace(/href="\/deals"/g, 'href="/es/deals"');
    result = result.replace(/href="\/contact"/g, 'href="/es/contact"');
    result = result.replace(/href="\/best-for"/g, 'href="/es/best-for"');

    // Fix nav links - home link
    result = result.replace(/<li><a href="\/" data-i18n="nav\.home">/g, '<li><a href="/es/" data-i18n="nav.home">');

    // 3. Update canonical and og:url
    result = result.replace(
        /href="https:\/\/companionguide\.ai\/companions\//g,
        'href="https://companionguide.ai/es/companions/'
    );
    result = result.replace(
        /content="https:\/\/companionguide\.ai\/companions\//g,
        'content="https://companionguide.ai/es/companions/'
    );

    // 4. Add ES hreflang
    if (!result.includes('hreflang="es"')) {
        result = result.replace(
            /<link rel="alternate" hreflang="x-default"/,
            `<link rel="alternate" hreflang="es" href="https://companionguide.ai/es/companions/${companion.slug}">\n    <link rel="alternate" hreflang="x-default"`
        );
    }

    // 5. Update language switcher
    result = result.replace(
        /<a href="\/companions\/([^"]*)" class="lang-option">🇬🇧<\/a>/,
        `<a href="/companions/$1" class="lang-option">🇬🇧</a>
                    <a href="/es/companions/$1" class="lang-option active">🇪🇸</a>`
    );

    // 6. Apply Spanish translations from Airtable
    if (esTranslation) {
        // Meta title
        if (esTranslation.meta_title) {
            result = result.replace(/<title>[^<]*<\/title>/, `<title>${esTranslation.meta_title}</title>`);
            result = result.replace(/<meta property="og:title" content="[^"]*">/, `<meta property="og:title" content="${esTranslation.meta_title}">`);
            result = result.replace(/<meta property="twitter:title" content="[^"]*">/, `<meta property="twitter:title" content="${esTranslation.meta_title}">`);
        }

        // Meta description
        if (esTranslation.meta_description) {
            result = result.replace(/<meta name="description" content="[^"]*">/, `<meta name="description" content="${esTranslation.meta_description}">`);
            result = result.replace(/<meta property="og:description" content="[^"]*">/, `<meta property="og:description" content="${esTranslation.meta_description}">`);
            result = result.replace(/<meta property="twitter:description" content="[^"]*">/, `<meta property="twitter:description" content="${esTranslation.meta_description}">`);
        }

        // Tagline in hero
        if (esTranslation.tagline) {
            result = result.replace(/<p class="tagline">[^<]*<\/p>/, `<p class="tagline">${esTranslation.tagline}</p>`);
        }

        // Best for in quick facts
        if (esTranslation.best_for) {
            const bestForRegex = /(<div class="fact">\s*<h3 data-i18n="companion\.bestForLabel">[^<]*<\/h3>\s*<p>)[^<]*(<\/p>)/s;
            result = result.replace(bestForRegex, `$1${esTranslation.best_for}$2`);
        }

        // Hero specs
        if (esTranslation.hero_specs) {
            try {
                const specs = JSON.parse(esTranslation.hero_specs);
                // Replace individual quick facts based on hero_specs
                if (specs.pricing) {
                    const pricingRegex = /(<div class="fact">\s*<h3 data-i18n="companion\.pricingLabel">[^<]*<\/h3>\s*<p>)[^<]*(<\/p>)/s;
                    result = result.replace(pricingRegex, `$1${specs.pricing}$2`);
                }
                if (specs.platform) {
                    const platformRegex = /(<div class="fact">\s*<h3 data-i18n="companion\.platformLabel">[^<]*<\/h3>\s*<p>)[^<]*(<\/p>)/s;
                    result = result.replace(platformRegex, `$1${specs.platform}$2`);
                }
                if (specs.content_policy) {
                    const contentRegex = /(<div class="fact">\s*<h3 data-i18n="companion\.contentPolicyLabel">[^<]*<\/h3>\s*<p>)[^<]*(<\/p>)/s;
                    result = result.replace(contentRegex, `$1${specs.content_policy}$2`);
                }
            } catch (e) {
                console.log('Error parsing hero_specs:', e.message);
            }
        }

        // Overview/description
        if (esTranslation.description) {
            // Replace What is X section content
            const whatIsRegex = /(<section class="overview">\s*<h2[^>]*>)[^<]*(<\/h2>\s*<p>)[^<]*(<\/p>)/s;
            result = result.replace(whatIsRegex, `$1¿Qué es ${companion.name}?$2${esTranslation.description}$3`);
        }

        // Pricing plans - replace entire pricing grid
        if (esTranslation.pricing_plans) {
            const pricingHtml = generatePricingHTML(esTranslation.pricing_plans, websiteUrl);
            if (pricingHtml) {
                const pricingGridRegex = /<div class="pricing-grid">[\s\S]*?<\/div>\s*<\/section>\s*(?=<!--|\s*<section)/;
                result = result.replace(pricingGridRegex, `<div class="pricing-grid">
${pricingHtml}            </div>
        </section>

        `);
            }
        }

        // Pros & Cons
        if (esTranslation.pros_cons) {
            const prosConsData = generateProsCons(esTranslation.pros_cons);
            if (prosConsData) {
                // Replace pros list
                const prosRegex = /(<div class="pros">\s*<h3>[^<]*<\/h3>\s*<ul>)[\s\S]*?(<\/ul>)/;
                result = result.replace(prosRegex, `$1
${prosConsData.prosHtml}                    $2`);

                // Replace cons list
                const consRegex = /(<div class="cons">\s*<h3>[^<]*<\/h3>\s*<ul>)[\s\S]*?(<\/ul>)/;
                result = result.replace(consRegex, `$1
${prosConsData.consHtml}                    $2`);
            }
        }

        // My Verdict
        if (esTranslation.my_verdict) {
            // Replace verdict content - look for the collapsible verdict section
            const verdictRegex = /(<div class="verdict-content"[^>]*>\s*<p>)[\s\S]*?(<\/p>\s*<\/div>\s*<button class="verdict-toggle)/s;
            result = result.replace(verdictRegex, `$1${esTranslation.my_verdict}$2`);
        }

        // FAQ
        if (esTranslation.faq) {
            const faqHtml = generateFAQHtml(esTranslation.faq);
            if (faqHtml) {
                const faqRegex = /(<section class="faq"[^>]*>\s*<h2[^>]*>[^<]*<\/h2>\s*<div class="faq-list">)[\s\S]*?(<\/div>\s*<\/section>)/;
                result = result.replace(faqRegex, `$1
${faqHtml}            $2`);
            }
        }

        // Body text - for the body content sections
        if (esTranslation.body_text) {
            // This is more complex - body_text might contain multiple sections
            // For now, skip as it requires more analysis of structure
        }

        // Ready to try CTA
        if (esTranslation.ready_try) {
            const readyTryRegex = /<p class="cta-description">[^<]*<\/p>/;
            result = result.replace(readyTryRegex, `<p class="cta-description">${esTranslation.ready_try}</p>`);
        }
    }

    // 7. Translate remaining English static text to Spanish
    const enToEs = {
        'Visit Website': 'Visitar Web',
        'Read Review': 'Leer Análisis',
        'Read Full Verdict': 'Leer Opinión Completa',
        'Image Gallery': 'Galería de Imágenes',
        'Pricing': 'Precios',
        'Best For': 'Mejor Para',
        'Platform': 'Plataforma',
        'Content Policy': 'Política de Contenido',
        'Home': 'Inicio',
        'Categories': 'Categorías',
        'News & Guides': 'Noticias y Guías',
        'Deals': 'Ofertas',
        'Contact': 'Contacto',
        'FAQ': 'Preguntas Frecuentes',
        'Our Verdict': 'Nuestra Opinión',
        'Similar Alternatives': 'Alternativas Similares',
        'Pros & Cons': 'Ventajas y Desventajas',
        'Most Recent User Reviews': 'Reseñas Más Recientes de Usuarios',
        '/month': '/mes',
        '/year': '/año',
        'Free': 'Gratis',
        'from': 'desde',
        'What is': '¿Qué es',
        'Ready to Try': '¿Listo para Probar',
        'MOST POPULAR': 'MÁS POPULAR',
        'Key Features': 'Características Principales',
        'Companions': 'Companions',
        'Best For': 'Mejor Para'
    };

    for (const [en, es] of Object.entries(enToEs)) {
        // Use word boundaries to avoid partial replacements
        const regex = new RegExp(en.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
        result = result.replace(regex, es);
    }

    return result;
}

async function generateSpanishCompanion(slug) {
    console.log(`\n📝 Generating Spanish page for: ${slug}`);

    // Check if EN template exists
    const enPath = path.join(EN_DIR, `${slug}.html`);
    if (!fs.existsSync(enPath)) {
        console.log(`❌ EN template not found: ${enPath}`);
        return false;
    }

    // Get companion data and Spanish translation
    const { companion, esTranslation } = await getCompanionData(slug);

    if (!esTranslation) {
        console.log(`⚠️ No Spanish translation found for ${slug}`);
        return false;
    }

    console.log(`  Found translation with fields: ${Object.keys(esTranslation).filter(k => esTranslation[k]).join(', ')}`);

    // Read EN template
    const enHtml = fs.readFileSync(enPath, 'utf8');

    // Convert to Spanish
    const esHtml = convertEnToEs(enHtml, companion, esTranslation);

    // Write ES file
    const esPath = path.join(ES_DIR, `${slug}.html`);
    fs.writeFileSync(esPath, esHtml);

    console.log(`✅ Created: ${esPath}`);
    return true;
}

async function main() {
    console.log('🇪🇸 Generating Spanish companion page(s) v2\n');

    // Ensure ES directory exists
    if (!fs.existsSync(ES_DIR)) {
        fs.mkdirSync(ES_DIR, { recursive: true });
    }

    if (targetSlug === 'all') {
        // Generate all companions
        const enFiles = fs.readdirSync(EN_DIR).filter(f => f.endsWith('.html'));
        console.log(`Found ${enFiles.length} EN templates\n`);

        let success = 0;
        let failed = 0;

        for (const file of enFiles) {
            const slug = file.replace('.html', '');
            try {
                const result = await generateSpanishCompanion(slug);
                if (result) success++;
                else failed++;
            } catch (error) {
                console.log(`❌ Error for ${slug}: ${error.message}`);
                failed++;
            }
            // Small delay to avoid rate limiting
            await new Promise(r => setTimeout(r, 100));
        }

        console.log(`\n🏁 Done! Success: ${success}, Failed: ${failed}`);
    } else {
        // Generate single companion
        await generateSpanishCompanion(targetSlug);
    }
}

main().catch(console.error);
