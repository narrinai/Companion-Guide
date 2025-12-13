const fs = require('fs');
const path = require('path');

// Translations for best-for page
const translations = {
    es: {
        jumpToCategory: '↓ Ir a categoría',
        loadingRecommendations: 'Cargando recomendaciones...',
        visitWebsite: 'Visitar Web',
        readReview: 'Leer Análisis',
        navButtons: {
            'NSFW Video': 'Video NSFW',
            'AI Girlfriend': 'Novia IA',
            'Anime': 'Anime',
            'Hentai': 'Hentai',
            'Roleplay': 'Roleplay',
            'Voice': 'Voz',
            'NSFW Images': 'Imágenes NSFW',
            'Free NSFW': 'NSFW Gratis',
            'Memory': 'Memoria',
            'Custom': 'Personalización',
            'Romantic': 'Romántico',
            'AI Boyfriend': 'Novio IA',
            'Free SFW': 'SFW Gratis'
        },
        categories: {
            'nsfw-video': {
                title: 'Mejor para Generación de Video NSFW',
                guide: 'Guía Mejores Videos IA',
                category: 'Todos los Videos IA'
            },
            'girlfriend': {
                title: 'Mejor para Experiencia de Novia IA',
                guide: 'Guía Mejores Novias IA',
                category: 'Todas las Novias IA'
            },
            'anime': {
                title: 'Mejor para Personajes Anime',
                guide: 'Guía Mejores Anime IA',
                category: 'Todo Anime IA'
            },
            'hentai': {
                title: 'Mejor para Contenido Hentai',
                category: 'Todo Hentai IA'
            },
            'roleplay': {
                title: 'Mejor para Roleplay e Historias',
                guide: 'Guía Mejores Roleplay IA',
                category: 'Todo Roleplay IA'
            },
            'voice': {
                title: 'Mejor para Chat de Voz',
                category: 'Toda la Voz IA'
            },
            'nsfw-image-gen': {
                title: 'Mejor para Generación de Imágenes NSFW',
                category: 'Toda la Generación de Imágenes IA'
            },
            'free-nsfw': {
                title: 'Mejores Plataformas NSFW Gratis'
            },
            'memory': {
                title: 'Mejor para Memoria y Chat a Largo Plazo'
            },
            'customization': {
                title: 'Mejor para Personalización de Personajes'
            },
            'romantic': {
                title: 'Mejor para Conversaciones Románticas',
                category: 'Todo Romántico IA'
            },
            'boyfriend': {
                title: 'Mejor para Experiencia de Novio IA',
                category: 'Todos los Novios IA'
            },
            'free-sfw': {
                title: 'Mejores Plataformas SFW Gratis'
            },
            'porn': {
                title: 'Mejor para Contenido Adulto',
                category: 'Todo Adulto IA'
            },
            'video': {
                title: 'Mejor para Generación de Video',
                category: 'Todos los Videos IA'
            },
            'image-gen': {
                title: 'Mejor para Generación de Imágenes',
                category: 'Toda la Generación de Imágenes IA'
            }
        }
    },
    nl: {
        jumpToCategory: '↓ Ga naar categorie',
        loadingRecommendations: 'Aanbevelingen laden...',
        visitWebsite: 'Bezoek Website',
        readReview: 'Lees Review',
        navButtons: {
            'NSFW Video': 'NSFW Video',
            'AI Girlfriend': 'AI Vriendin',
            'Anime': 'Anime',
            'Hentai': 'Hentai',
            'Roleplay': 'Roleplay',
            'Voice': 'Spraak',
            'NSFW Images': 'NSFW Afbeeldingen',
            'Free NSFW': 'Gratis NSFW',
            'Memory': 'Geheugen',
            'Custom': 'Aangepast',
            'Romantic': 'Romantisch',
            'AI Boyfriend': 'AI Vriend',
            'Free SFW': 'Gratis SFW'
        },
        categories: {
            'nsfw-video': {
                title: 'Beste voor NSFW Video Generatie',
                guide: 'Beste AI Video Gids',
                category: 'Alle AI Video'
            },
            'girlfriend': {
                title: 'Beste voor AI Vriendin Ervaring',
                guide: 'Beste AI Vriendinnen Gids',
                category: 'Alle AI Vriendinnen'
            },
            'anime': {
                title: 'Beste voor Anime Karakters',
                guide: 'Beste AI Anime Gids',
                category: 'Alle AI Anime'
            },
            'hentai': {
                title: 'Beste voor Hentai Content',
                category: 'Alle AI Hentai'
            },
            'roleplay': {
                title: 'Beste voor Roleplay & Verhalen',
                guide: 'Beste AI Roleplay Gids',
                category: 'Alle AI Roleplay'
            },
            'voice': {
                title: 'Beste voor Spraakchat',
                category: 'Alle AI Spraak'
            },
            'nsfw-image-gen': {
                title: 'Beste voor NSFW Afbeelding Generatie',
                category: 'Alle AI Afbeelding Gen'
            },
            'free-nsfw': {
                title: 'Beste Gratis NSFW Platforms'
            },
            'memory': {
                title: 'Beste voor Geheugen & Langdurige Chat'
            },
            'customization': {
                title: 'Beste voor Karakter Aanpassing'
            },
            'romantic': {
                title: 'Beste voor Romantische Gesprekken',
                category: 'Alle AI Romantisch'
            },
            'boyfriend': {
                title: 'Beste voor AI Vriend Ervaring',
                category: 'Alle AI Vrienden'
            },
            'free-sfw': {
                title: 'Beste Gratis SFW Platforms'
            },
            'porn': {
                title: 'Beste voor Volwassen Content',
                category: 'Alle AI Volwassen'
            },
            'video': {
                title: 'Beste voor Video Generatie',
                category: 'Alle AI Video'
            },
            'image-gen': {
                title: 'Beste voor Afbeelding Generatie',
                category: 'Alle AI Afbeelding Gen'
            }
        }
    },
    de: {
        jumpToCategory: '↓ Zur Kategorie',
        loadingRecommendations: 'Empfehlungen werden geladen...',
        visitWebsite: 'Website besuchen',
        readReview: 'Bewertung lesen',
        navButtons: {
            'NSFW Video': 'NSFW Video',
            'AI Girlfriend': 'KI Freundin',
            'Anime': 'Anime',
            'Hentai': 'Hentai',
            'Roleplay': 'Rollenspiel',
            'Voice': 'Stimme',
            'NSFW Images': 'NSFW Bilder',
            'Free NSFW': 'Gratis NSFW',
            'Memory': 'Gedächtnis',
            'Custom': 'Anpassung',
            'Romantic': 'Romantisch',
            'AI Boyfriend': 'KI Freund',
            'Free SFW': 'Gratis SFW'
        },
        categories: {
            'nsfw-video': {
                title: 'Beste für NSFW Video-Generierung',
                guide: 'Beste KI Video Ratgeber',
                category: 'Alle KI Video'
            },
            'girlfriend': {
                title: 'Beste für KI Freundin Erfahrung',
                guide: 'Beste KI Freundinnen Ratgeber',
                category: 'Alle KI Freundinnen'
            },
            'anime': {
                title: 'Beste für Anime Charaktere',
                guide: 'Beste KI Anime Ratgeber',
                category: 'Alle KI Anime'
            },
            'hentai': {
                title: 'Beste für Hentai Inhalte',
                category: 'Alle KI Hentai'
            },
            'roleplay': {
                title: 'Beste für Rollenspiel & Geschichten',
                guide: 'Beste KI Rollenspiel Ratgeber',
                category: 'Alle KI Rollenspiel'
            },
            'voice': {
                title: 'Beste für Sprachchat',
                category: 'Alle KI Stimme'
            },
            'nsfw-image-gen': {
                title: 'Beste für NSFW Bild-Generierung',
                category: 'Alle KI Bild Gen'
            },
            'free-nsfw': {
                title: 'Beste Kostenlose NSFW Plattformen'
            },
            'memory': {
                title: 'Beste für Gedächtnis & Langzeit-Chat'
            },
            'customization': {
                title: 'Beste für Charakter-Anpassung'
            },
            'romantic': {
                title: 'Beste für Romantische Gespräche',
                category: 'Alle KI Romantisch'
            },
            'boyfriend': {
                title: 'Beste für KI Freund Erfahrung',
                category: 'Alle KI Freunde'
            },
            'free-sfw': {
                title: 'Beste Kostenlose SFW Plattformen'
            },
            'porn': {
                title: 'Beste für Erwachsenen-Inhalte',
                category: 'Alle KI Erwachsenen'
            },
            'video': {
                title: 'Beste für Video-Generierung',
                category: 'Alle KI Video'
            },
            'image-gen': {
                title: 'Beste für Bild-Generierung',
                category: 'Alle KI Bild Gen'
            }
        }
    },
    pt: {
        jumpToCategory: '↓ Ir para categoria',
        loadingRecommendations: 'Carregando recomendações...',
        visitWebsite: 'Visitar Site',
        readReview: 'Ler Análise',
        navButtons: {
            'NSFW Video': 'Vídeo NSFW',
            'AI Girlfriend': 'Namorada IA',
            'Anime': 'Anime',
            'Hentai': 'Hentai',
            'Roleplay': 'Roleplay',
            'Voice': 'Voz',
            'NSFW Images': 'Imagens NSFW',
            'Free NSFW': 'NSFW Grátis',
            'Memory': 'Memória',
            'Custom': 'Personalização',
            'Romantic': 'Romântico',
            'AI Boyfriend': 'Namorado IA',
            'Free SFW': 'SFW Grátis'
        },
        categories: {
            'nsfw-video': {
                title: 'Melhor para Geração de Vídeo NSFW',
                guide: 'Guia Melhores Vídeos IA',
                category: 'Todos os Vídeos IA'
            },
            'girlfriend': {
                title: 'Melhor para Experiência de Namorada IA',
                guide: 'Guia Melhores Namoradas IA',
                category: 'Todas as Namoradas IA'
            },
            'anime': {
                title: 'Melhor para Personagens Anime',
                guide: 'Guia Melhores Anime IA',
                category: 'Todo Anime IA'
            },
            'hentai': {
                title: 'Melhor para Conteúdo Hentai',
                category: 'Todo Hentai IA'
            },
            'roleplay': {
                title: 'Melhor para Roleplay e Histórias',
                guide: 'Guia Melhores Roleplay IA',
                category: 'Todo Roleplay IA'
            },
            'voice': {
                title: 'Melhor para Chat de Voz',
                category: 'Toda a Voz IA'
            },
            'nsfw-image-gen': {
                title: 'Melhor para Geração de Imagens NSFW',
                category: 'Toda a Geração de Imagens IA'
            },
            'free-nsfw': {
                title: 'Melhores Plataformas NSFW Grátis'
            },
            'memory': {
                title: 'Melhor para Memória e Chat de Longo Prazo'
            },
            'customization': {
                title: 'Melhor para Personalização de Personagens'
            },
            'romantic': {
                title: 'Melhor para Conversas Românticas',
                category: 'Todo Romântico IA'
            },
            'boyfriend': {
                title: 'Melhor para Experiência de Namorado IA',
                category: 'Todos os Namorados IA'
            },
            'free-sfw': {
                title: 'Melhores Plataformas SFW Grátis'
            },
            'porn': {
                title: 'Melhor para Conteúdo Adulto',
                category: 'Todo Adulto IA'
            },
            'video': {
                title: 'Melhor para Geração de Vídeo',
                category: 'Todos os Vídeos IA'
            },
            'image-gen': {
                title: 'Melhor para Geração de Imagens',
                category: 'Toda a Geração de Imagens IA'
            }
        }
    }
};

function translateBestFor(lang) {
    const t = translations[lang];
    if (!t) {
        console.error(`No translations for language: ${lang}`);
        return;
    }

    const filePath = path.join(__dirname, '..', lang, 'best-for.html');

    if (!fs.existsSync(filePath)) {
        console.error(`File not found: ${filePath}`);
        return;
    }

    let content = fs.readFileSync(filePath, 'utf8');

    // 1. Translate nav-label "Jump to category"
    content = content.replace(
        /<span class="nav-label">↓ Jump to category<\/span>/g,
        `<span class="nav-label">${t.jumpToCategory}</span>`
    );

    // 2. Translate nav buttons
    for (const [eng, translated] of Object.entries(t.navButtons)) {
        // Match the anchor pattern with href and text
        const regex = new RegExp(`(<a href="#[^"]+">)${eng.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(</a>)`, 'g');
        content = content.replace(regex, `$1${translated}$2`);
    }

    // 3. Translate loading text
    content = content.replace(
        /Loading recommendations\.\.\./g,
        t.loadingRecommendations
    );

    // 4. Translate bestForCategories in JavaScript
    // Replace each category title
    for (const [id, cat] of Object.entries(t.categories)) {
        // Find and replace title for this category
        const titleRegex = new RegExp(
            `(\\{ id: '${id}'[^}]*title: ')Best for [^']+(')`,'g'
        );
        content = content.replace(titleRegex, `$1${cat.title}$2`);

        // Also handle variations like "Best Free"
        const titleRegex2 = new RegExp(
            `(\\{ id: '${id}'[^}]*title: ')Best Free [^']+(')`,'g'
        );
        content = content.replace(titleRegex2, `$1${cat.title}$2`);

        // Replace guide text if present
        if (cat.guide) {
            const guideRegex = new RegExp(
                `(id: '${id}'[^}]*guide: \\{ url: '[^']+', text: ')Best [^']+(')`,'g'
            );
            content = content.replace(guideRegex, `$1${cat.guide}$2`);
        }

        // Replace category text if present
        if (cat.category) {
            const categoryRegex = new RegExp(
                `(id: '${id}'[^}]*category: \\{ url: '[^']+', text: ')All [^']+(')`,'g'
            );
            content = content.replace(categoryRegex, `$1${cat.category}$2`);
        }
    }

    // 5. Translate CTA buttons in createCompactCard function
    content = content.replace(
        />Visit Website</g,
        `>${t.visitWebsite}<`
    );
    content = content.replace(
        />Read Review</g,
        `>${t.readReview}<`
    );

    // Write back
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated ${lang}/best-for.html`);
}

// Run for all languages
['es', 'nl', 'de', 'pt'].forEach(translateBestFor);
console.log('Done!');
