const fs = require('fs');
const path = require('path');

/**
 * Translate category page HTML files to NL and PT
 *
 * Translates hardcoded English text in category HTML pages including:
 * - Title and meta descriptions
 * - H1, breadcrumbs, category descriptions
 * - Insight sections
 * - Comparison table headers
 */

// Translation mappings for common category page elements
const translations = {
  nl: {
    // Page titles pattern
    'Best Adult AI Image Generation Platforms': 'Beste Adult AI Beeldgeneratie Platforms',
    'Best AI Girlfriend Chat Platforms': 'Beste AI Girlfriend Chat Platforms',
    'Best AI Girlfriend Platforms': 'Beste AI Girlfriend Platforms',
    'Best AI Boyfriend Chat Platforms': 'Beste AI Boyfriend Chat Platforms',
    'Best AI Boyfriend Platforms': 'Beste AI Boyfriend Platforms',
    'Best Adult Content Uncensored AI Platforms': 'Beste Ongecensureerde Adult Content AI Platforms',
    'Best AI Porn Chat Platforms': 'Beste AI Porn Chat Platforms',
    'Best Hentai AI Chat Platforms': 'Beste Hentai AI Chat Platforms',
    'Best Roleplay Character Chat Platforms': 'Beste Roleplay Character Chat Platforms',
    'Best AI Video Companion Platforms': 'Beste AI Video Companion Platforms',
    'Best WhatsApp AI Companion Platforms': 'Beste WhatsApp AI Companion Platforms',
    'Best Learning AI Companion Platforms': 'Beste Leer AI Companion Platforms',
    'Best Wellness AI Companion Platforms': 'Beste Wellness AI Companion Platforms',

    // Meta descriptions
    'Top AI girlfriend chat Platforms': 'Top AI girlfriend chat Platforms',
    'Top AI boyfriend chat Platforms': 'Top AI boyfriend chat Platforms',
    'Virtual romantic AI chat partners': 'Virtuele romantische AI chat partners',
    'for dating experiences': 'voor dating ervaringen',
    'Compare': 'Vergelijk',
    'with expert reviews': 'met expert reviews',
    'Discover top adult AI image generation platforms': 'Ontdek de beste adult AI beeldgeneratie platforms',
    'Discover the best AI girlfriend platforms': 'Ontdek de beste AI girlfriend platforms',
    'Discover the best AI boyfriend platforms': 'Ontdek de beste AI boyfriend platforms',
    'Discover top adult content': 'Ontdek de beste adult content',
    'Discover the best AI porn chat platforms': 'Ontdek de beste AI porn chat platforms',
    'Discover the best hentai AI chat platforms': 'Ontdek de beste hentai AI chat platforms',
    'Discover the best roleplay': 'Ontdek de beste roleplay',
    'Discover AI platforms with video': 'Ontdek AI platforms met video',
    'Discover WhatsApp-integrated AI companions': 'Ontdek WhatsApp-geïntegreerde AI companions',
    'Discover AI companions for learning': 'Ontdek AI companions voor leren',
    'Discover AI companions for wellness': 'Ontdek AI companions voor wellness',
    'for creating NSFW art and visual content': 'voor NSFW art en visuele content',
    'for romantic companionship': 'voor romantisch gezelschap',
    'for male companionship': 'voor mannelijk gezelschap',
    'with no restrictions': 'zonder beperkingen',
    'for adult conversations': 'voor adult gesprekken',
    'for anime-style adult content': 'voor anime-stijl adult content',
    'and character interactions': 'en character interacties',
    'capabilities': 'mogelijkheden',
    'and messaging features': 'en messaging functies',
    'and educational support': 'en educatieve ondersteuning',
    'and mental health support': 'en mentale gezondheid ondersteuning',
    'Compare the best AI tools': 'Vergelijk de beste AI tools',
    'Compare AI platforms': 'Vergelijk AI platforms',
    'for adult content creation': 'voor adult content creatie',

    // H1 headings
    'Companions': 'Companions',

    // Breadcrumbs
    'Home': 'Home',
    'Platforms': 'Platforms',

    // Category descriptions (generic patterns)
    'Explore AI platforms specialized in': 'Ontdek AI platforms gespecialiseerd in',
    'These platforms offer': 'Deze platforms bieden',
    'These tools': 'Deze tools',
    'Explore': 'Ontdek',
    'specialized in': 'gespecialiseerd in',
    'creating adult and NSFW visual content': 'het creëren van adult en NSFW visuele content',
    'romantic companionship and virtual relationships': 'romantisch gezelschap en virtuele relaties',
    'male companionship and virtual relationships': 'mannelijk gezelschap en virtuele relaties',
    'uncensored adult content': 'ongecensureerde adult content',
    'explicit adult conversations': 'expliciete adult gesprekken',
    'anime-style hentai content': 'anime-stijl hentai content',
    'character roleplay and interactive scenarios': 'character roleplay en interactieve scenario\'s',
    'video generation and visual interactions': 'videogeneratie en visuele interacties',
    'WhatsApp integration': 'WhatsApp integratie',
    'educational support and learning': 'educatieve ondersteuning en leren',
    'wellness and mental health support': 'wellness en mentale gezondheid ondersteuning',
    'uncensored image generation capabilities': 'ongecensureerde beeldgeneratie mogelijkheden',
    'for mature artistic expression': 'voor volwassen artistieke expressie',
    'and adult content creation': 'en adult content creatie',

    // Insights section
    'Platform Insights': 'Platform Inzichten',
    'Insights': 'Inzichten',
    'Uncensored Content': 'Ongecensureerde Content',
    'Multiple Art Styles': 'Meerdere Art Stijlen',
    'Video Generation': 'Video Generatie',
    'Advanced Editing': 'Geavanceerde Bewerking',
    'Romantic Features': 'Romantische Functies',
    'Emotional Connection': 'Emotionele Verbinding',
    'Customization Options': 'Aanpassingsopties',
    'Voice Features': 'Voice Functies',
    'No Restrictions': 'Geen Beperkingen',
    'Privacy Focused': 'Privacy Gericht',
    'Character Variety': 'Character Variëteit',
    'Fantasy Scenarios': 'Fantasy Scenario\'s',
    'Video Capabilities': 'Video Mogelijkheden',
    'Realistic Animations': 'Realistische Animaties',
    'Instant Messaging': 'Instant Messaging',
    'Native Integration': 'Native Integratie',
    'Educational Content': 'Educatieve Content',
    'Personalized Learning': 'Gepersonaliseerd Leren',
    'Mental Health': 'Mentale Gezondheid',
    'Therapeutic Support': 'Therapeutische Ondersteuning',

    // Insight descriptions (keep short, general patterns)
    'These platforms specialize in': 'Deze platforms zijn gespecialiseerd in',
    'without the restrictions': 'zonder de beperkingen',
    'found on mainstream': 'van reguliere',
    'Support for various': 'Ondersteuning voor verschillende',
    'including realistic': 'waaronder realistisch',
    'for diverse creative needs': 'voor diverse creatieve behoeften',
    'Advanced platforms': 'Geavanceerde platforms',
    'now offer': 'bieden nu',
    'creating animated': 'waarmee geanimeerde',
    'from static images or text prompts': 'vanuit statische beelden of tekst prompts',
    'Professional editing tools': 'Professionele bewerkingstools',
    'for enhanced creative control': 'voor verbeterde creatieve controle',

    // Comparison table
    'Platform Comparison': 'Platform Vergelijking',
    'Comparison': 'Vergelijking',

    // Loading state
    'Loading companions': 'Companions laden'
  },
  pt: {
    // Page titles
    'Best Adult AI Image Generation Platforms': 'Melhores Plataformas de Geração de Imagens AI Adultas',
    'Best AI Girlfriend Chat Platforms': 'Melhores Plataformas de Chat com Namorada AI',
    'Best AI Girlfriend Platforms': 'Melhores Plataformas de Namorada AI',
    'Best AI Boyfriend Chat Platforms': 'Melhores Plataformas de Chat com Namorado AI',
    'Best AI Boyfriend Platforms': 'Melhores Plataformas de Namorado AI',
    'Best Adult Content Uncensored AI Platforms': 'Melhores Plataformas AI de Conteúdo Adulto Sem Censura',
    'Best AI Porn Chat Platforms': 'Melhores Plataformas de Chat Pornô AI',
    'Best Hentai AI Chat Platforms': 'Melhores Plataformas de Chat Hentai AI',
    'Best Roleplay Character Chat Platforms': 'Melhores Plataformas de Chat de Personagens Roleplay',
    'Best AI Video Companion Platforms': 'Melhores Plataformas de Companions AI com Vídeo',
    'Best WhatsApp AI Companion Platforms': 'Melhores Plataformas de Companions AI para WhatsApp',
    'Best Learning AI Companion Platforms': 'Melhores Plataformas de Companions AI para Aprendizado',
    'Best Wellness AI Companion Platforms': 'Melhores Plataformas de Companions AI para Bem-Estar',

    // Meta descriptions
    'Top AI girlfriend chat Platforms': 'Principais Plataformas de Chat com Namorada AI',
    'Top AI boyfriend chat Platforms': 'Principais Plataformas de Chat com Namorado AI',
    'Virtual romantic AI chat partners': 'Parceiros de chat romântico AI virtuais',
    'for dating experiences': 'para experiências de namoro',
    'Compare': 'Compare',
    'with expert reviews': 'com análises de especialistas',
    'Discover top adult AI image generation platforms': 'Descubra as melhores plataformas de geração de imagens AI adultas',
    'Discover the best AI girlfriend platforms': 'Descubra as melhores plataformas de namorada AI',
    'Discover the best AI boyfriend platforms': 'Descubra as melhores plataformas de namorado AI',
    'Discover top adult content': 'Descubra o melhor conteúdo adulto',
    'Discover the best AI porn chat platforms': 'Descubra as melhores plataformas de chat pornô AI',
    'Discover the best hentai AI chat platforms': 'Descubra as melhores plataformas de chat hentai AI',
    'Discover the best roleplay': 'Descubra as melhores plataformas de roleplay',
    'Discover AI platforms with video': 'Descubra plataformas AI com vídeo',
    'Discover WhatsApp-integrated AI companions': 'Descubra companions AI integrados ao WhatsApp',
    'Discover AI companions for learning': 'Descubra companions AI para aprendizado',
    'Discover AI companions for wellness': 'Descubra companions AI para bem-estar',
    'for creating NSFW art and visual content': 'para criar arte NSFW e conteúdo visual',
    'for romantic companionship': 'para companhia romântica',
    'for male companionship': 'para companhia masculina',
    'with no restrictions': 'sem restrições',
    'for adult conversations': 'para conversas adultas',
    'for anime-style adult content': 'para conteúdo adulto estilo anime',
    'and character interactions': 'e interações de personagens',
    'capabilities': 'capacidades',
    'and messaging features': 'e recursos de mensagens',
    'and educational support': 'e suporte educacional',
    'and mental health support': 'e suporte de saúde mental',
    'Compare the best AI tools': 'Compare as melhores ferramentas AI',
    'Compare AI platforms': 'Compare plataformas AI',
    'for adult content creation': 'para criação de conteúdo adulto',

    // H1 headings
    'Companions': 'Companions',

    // Breadcrumbs
    'Home': 'Home',
    'Platforms': 'Plataformas',

    // Category descriptions
    'Explore AI platforms specialized in': 'Explore plataformas AI especializadas em',
    'These platforms offer': 'Essas plataformas oferecem',
    'These tools': 'Essas ferramentas',
    'Explore': 'Explore',
    'specialized in': 'especializadas em',
    'creating adult and NSFW visual content': 'criar conteúdo visual adulto e NSFW',
    'romantic companionship and virtual relationships': 'companhia romântica e relacionamentos virtuais',
    'male companionship and virtual relationships': 'companhia masculina e relacionamentos virtuais',
    'uncensored adult content': 'conteúdo adulto sem censura',
    'explicit adult conversations': 'conversas adultas explícitas',
    'anime-style hentai content': 'conteúdo hentai estilo anime',
    'character roleplay and interactive scenarios': 'roleplay de personagens e cenários interativos',
    'video generation and visual interactions': 'geração de vídeo e interações visuais',
    'WhatsApp integration': 'integração com WhatsApp',
    'educational support and learning': 'suporte educacional e aprendizado',
    'wellness and mental health support': 'suporte de bem-estar e saúde mental',
    'uncensored image generation capabilities': 'capacidades de geração de imagens sem censura',
    'for mature artistic expression': 'para expressão artística madura',
    'and adult content creation': 'e criação de conteúdo adulto',

    // Insights section
    'Platform Insights': 'Insights da Plataforma',
    'Insights': 'Insights',
    'Uncensored Content': 'Conteúdo Sem Censura',
    'Multiple Art Styles': 'Múltiplos Estilos de Arte',
    'Video Generation': 'Geração de Vídeo',
    'Advanced Editing': 'Edição Avançada',
    'Romantic Features': 'Recursos Românticos',
    'Emotional Connection': 'Conexão Emocional',
    'Customization Options': 'Opções de Personalização',
    'Voice Features': 'Recursos de Voz',
    'No Restrictions': 'Sem Restrições',
    'Privacy Focused': 'Focado em Privacidade',
    'Character Variety': 'Variedade de Personagens',
    'Fantasy Scenarios': 'Cenários de Fantasia',
    'Video Capabilities': 'Capacidades de Vídeo',
    'Realistic Animations': 'Animações Realistas',
    'Instant Messaging': 'Mensagens Instantâneas',
    'Native Integration': 'Integração Nativa',
    'Educational Content': 'Conteúdo Educacional',
    'Personalized Learning': 'Aprendizado Personalizado',
    'Mental Health': 'Saúde Mental',
    'Therapeutic Support': 'Suporte Terapêutico',

    // Insight descriptions
    'These platforms specialize in': 'Essas plataformas são especializadas em',
    'without the restrictions': 'sem as restrições',
    'found on mainstream': 'encontradas em plataformas convencionais',
    'Support for various': 'Suporte para vários',
    'including realistic': 'incluindo realista',
    'for diverse creative needs': 'para diversas necessidades criativas',
    'Advanced platforms': 'Plataformas avançadas',
    'now offer': 'agora oferecem',
    'creating animated': 'criando conteúdo animado',
    'from static images or text prompts': 'a partir de imagens estáticas ou prompts de texto',
    'Professional editing tools': 'Ferramentas profissionais de edição',
    'for enhanced creative control': 'para maior controle criativo',

    // Comparison table
    'Platform Comparison': 'Comparação de Plataformas',
    'Comparison': 'Comparação',

    // Loading state
    'Loading companions': 'Carregando companions'
  }
};

function translateText(text, lang) {
  if (!text || lang === 'en') return text;

  const langTranslations = translations[lang];
  if (!langTranslations) return text;

  let translated = text;

  // Apply translations in order (longer phrases first to avoid partial matches)
  const sortedKeys = Object.keys(langTranslations).sort((a, b) => b.length - a.length);

  for (const key of sortedKeys) {
    const value = langTranslations[key];
    // Use global replace with case-insensitive flag
    translated = translated.replace(new RegExp(key, 'gi'), value);
  }

  return translated;
}

function translateCategoryPage(filePath, lang) {
  console.log(`\n📄 Processing: ${path.basename(filePath)} (${lang})`);

  let content = fs.readFileSync(filePath, 'utf8');
  const originalContent = content;

  // Track what was translated
  let changes = 0;

  // 1. Translate <title>
  content = content.replace(/<title>(.*?)<\/title>/g, (match, title) => {
    const translated = translateText(title, lang);
    if (translated !== title) changes++;
    return `<title>${translated}</title>`;
  });

  // 2. Translate meta descriptions
  content = content.replace(/(<meta name="description" content=")([^"]+)(")/g, (match, before, desc, after) => {
    const translated = translateText(desc, lang);
    if (translated !== desc) changes++;
    return before + translated + after;
  });

  // 3. Translate Open Graph titles and descriptions
  content = content.replace(/(<meta property="og:title" content=")([^"]+)(")/g, (match, before, title, after) => {
    const translated = translateText(title, lang);
    if (translated !== title) changes++;
    return before + translated + after;
  });

  content = content.replace(/(<meta property="og:description" content=")([^"]+)(")/g, (match, before, desc, after) => {
    const translated = translateText(desc, lang);
    if (translated !== desc) changes++;
    return before + translated + after;
  });

  // 4. Translate Twitter meta
  content = content.replace(/(<meta property="twitter:title" content=")([^"]+)(")/g, (match, before, title, after) => {
    const translated = translateText(title, lang);
    if (translated !== title) changes++;
    return before + translated + after;
  });

  content = content.replace(/(<meta property="twitter:description" content=")([^"]+)(")/g, (match, before, desc, after) => {
    const translated = translateText(desc, lang);
    if (translated !== desc) changes++;
    return before + translated + after;
  });

  // 5. Translate H1
  content = content.replace(/<h1>(.*?)<\/h1>/g, (match, heading) => {
    const translated = translateText(heading, lang);
    if (translated !== heading) changes++;
    return `<h1>${translated}</h1>`;
  });

  // 6. Translate H2
  content = content.replace(/<h2>(.*?)<\/h2>/g, (match, heading) => {
    const translated = translateText(heading, lang);
    if (translated !== heading) changes++;
    return `<h2>${translated}</h2>`;
  });

  // 7. Translate H3
  content = content.replace(/<h3>(.*?)<\/h3>/g, (match, heading) => {
    const translated = translateText(heading, lang);
    if (translated !== heading) changes++;
    return `<h3>${translated}</h3>`;
  });

  // 8. Translate category-description paragraphs
  content = content.replace(/(<p class="category-description">)(.*?)(<\/p>)/g, (match, before, desc, after) => {
    const translated = translateText(desc, lang);
    if (translated !== desc) changes++;
    return before + translated + after;
  });

  // 9. Translate insight card paragraphs
  content = content.replace(/(<div class="insight-card">.*?<p>)(.*?)(<\/p>)/gs, (match, before, text, after) => {
    const translated = translateText(text, lang);
    if (translated !== text) changes++;
    return before + translated + after;
  });

  // 10. Translate breadcrumb spans
  content = content.replace(/(<div class="category-breadcrumb">.*?<span>)(.*?)(<\/span>)/gs, (match, before, text, after) => {
    const translated = translateText(text, lang);
    if (translated !== text) changes++;
    return before + translated + after;
  });

  // 11. Translate loading state
  content = content.replace(/(<p>Loading companions\.\.\.<\/p>)/g, (match) => {
    const translated = translateText('Loading companions...', lang);
    if (translated !== 'Loading companions...') changes++;
    return `<p>${translated}</p>`;
  });

  if (changes > 0) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`   ✅ Translated ${changes} elements`);
    return true;
  } else {
    console.log(`   ⏭️  No changes needed`);
    return false;
  }
}

// Main execution
async function main() {
  const nlDir = path.join(__dirname, '../nl/categories');
  const ptDir = path.join(__dirname, '../pt/categories');

  const nlFiles = fs.readdirSync(nlDir)
    .filter(f => f.endsWith('-companions.html'))
    .filter(f => !f.includes('backup'))
    .map(f => path.join(nlDir, f));

  const ptFiles = fs.readdirSync(ptDir)
    .filter(f => f.endsWith('-companions.html'))
    .filter(f => !f.includes('backup'))
    .map(f => path.join(ptDir, f));

  console.log(`🌍 Translating ${nlFiles.length} NL pages and ${ptFiles.length} PT pages...\n`);

  let nlCount = 0;
  let ptCount = 0;

  // Translate NL pages
  console.log('📝 Translating Dutch (NL) pages...');
  for (const file of nlFiles) {
    if (translateCategoryPage(file, 'nl')) {
      nlCount++;
    }
  }

  // Translate PT pages
  console.log('\n📝 Translating Portuguese (PT) pages...');
  for (const file of ptFiles) {
    if (translateCategoryPage(file, 'pt')) {
      ptCount++;
    }
  }

  console.log(`\n✅ Translation complete!`);
  console.log(`   📊 NL: ${nlCount}/${nlFiles.length} pages translated`);
  console.log(`   📊 PT: ${ptCount}/${ptFiles.length} pages translated`);
}

main().catch(console.error);
