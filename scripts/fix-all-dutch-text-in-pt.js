#!/usr/bin/env node

/**
 * Fix all Dutch text in PT pages by replacing with data-i18n attributes
 */

const fs = require('fs');
const path = require('path');

console.log('🔧 Fixing all Dutch text in PT pages...\n');

// ===== FIX PT INDEX.HTML =====
console.log('1️⃣  Fixing pt/index.html...');
const ptIndexPath = path.join(__dirname, '..', 'pt', 'index.html');
let ptIndex = fs.readFileSync(ptIndexPath, 'utf-8');

// Fix "Blijf op de hoogte" in news section
ptIndex = ptIndex.replace(
  /<p>Blijf op de hoogte van het laatste nieuws en inzichten uit de AI companion industrie<\/p>/g,
  '<p data-i18n="sections.latestNewsDescription">Blijf op de hoogte van het laatste nieuws en inzichten uit de AI companion industrie</p>'
);

// Fix "Vind AI companion platforms"
ptIndex = ptIndex.replace(
  /<p>Vind AI companion platforms die passen bij jouw specifieke behoeften<\/p>/g,
  '<p data-i18n="sections.explorePlatformsDescription">Vind AI companion platforms die passen bij jouw specifieke behoeften</p>'
);

// Fix "Ontdek AI Platforms per Categorie"
ptIndex = ptIndex.replace(
  /<h2 data-i18n="sections\.exploreCategory">Ontdek AI Platforms per Categorie<\/h2>/g,
  '<h2 data-i18n="sections.explorePlatformsTitle">Ontdek AI Platforms per Categorie</h2>'
);

// Fix "Veelgestelde Vragen"
ptIndex = ptIndex.replace(
  /<h2 data-i18n="faq\.title">Veelgestelde Vragen over AI Companion Platforms<\/h2>/g,
  '<h2 data-i18n="faq.title">Veelgestelde Vragen over AI Companion Platforms</h2>'
);

// Fix "Laatste Nieuws & Gidsen"
ptIndex = ptIndex.replace(
  /<h2 data-i18n="sections\.latestNews">Laatste Nieuws & Gidsen<\/h2>/g,
  '<h2 data-i18n="sections.latestNews">Laatste Nieuws & Gidsen</h2>'
);

// Fix hardcoded "laatste nieuws" in lowercase
ptIndex = ptIndex.replace(
  /laatste nieuws en inzichten/gi,
  'latest news and insights'
);

// Fix "Hoe kies ik het juiste AI companion platform?"
ptIndex = ptIndex.replace(
  /<h3 class="faq-question" itemprop="name">Hoe kies ik het juiste AI companion platform\?<\/h3>/g,
  '<h3 class="faq-question" itemprop="name" data-i18n="faq.q1.question">Hoe kies ik het juiste AI companion platform?</h3>'
);

fs.writeFileSync(ptIndexPath, ptIndex, 'utf-8');
console.log('   ✅ Fixed pt/index.html\n');

// ===== FIX PT COMPANIONS.HTML =====
console.log('2️⃣  Fixing pt/companions.html...');
const ptCompanionsPath = path.join(__dirname, '..', 'pt', 'companions.html');
let ptCompanions = fs.readFileSync(ptCompanionsPath, 'utf-8');

// Fix "Veelgestelde Vragen"
ptCompanions = ptCompanions.replace(
  /<h2 data-i18n="faq\.title">Veelgestelde Vragen over AI Companion Platforms<\/h2>/g,
  '<h2 data-i18n="faq.title">Veelgestelde Vragen over AI Companion Platforms</h2>'
);

// Add FAQ translations to locales/pt.json
const ptJsonPath = path.join(__dirname, '..', 'locales', 'pt.json');
const ptJson = JSON.parse(fs.readFileSync(ptJsonPath, 'utf-8'));

// Add companions page FAQ translations
ptJson.companionsPage = ptJson.companionsPage || {};
ptJson.companionsPage.faq = {
  title: "Perguntas Frequentes sobre Plataformas de Companion de IA",
  q1: {
    question: "Como escolho a plataforma de companion de IA certa?",
    answer: "Considere suas necessidades: chat casual vs. companheirismo profundo, tipo de personalidade desejada, recursos específicos (geração de imagens, voz, vídeo), orçamento e preocupações com privacidade. Nossa tabela de comparação ajuda você a comparar recursos, preços e classificações."
  },
  q2: {
    question: "Quais são as plataformas de companion de IA mais bem avaliadas em 2025?",
    answer: "As plataformas de maior classificação incluem Secrets AI (4.8/5), Hammer AI (4.7/5), DreamGF (4.6/5) e Candy AI (4.5/5). Cada uma se destaca em diferentes áreas - Secrets AI em realismo, Hammer AI em privacidade e recursos gratuitos, DreamGF em customização e Candy AI em geração de imagens."
  },
  q3: {
    question: "Quais companions de IA oferecem acesso totalmente gratuito?",
    answer: "Hammer AI oferece uso totalmente gratuito e ilimitado com modelos locais. Character.AI tem um plano gratuito robusto com funcionalidade central. Outras plataformas como Replika e Anima oferecem níveis gratuitos com funcionalidade limitada."
  },
  q4: {
    question: "Como funcionam os sistemas de memória dos companions de IA?",
    answer: "Companions de IA usam diferentes abordagens de memória: alguns mantêm memória de conversa de curto prazo, enquanto plataformas avançadas armazenam memórias de longo prazo sobre suas preferências, relacionamentos e conversas passadas. Plataformas premium como Replika e Romantic AI oferecem sistemas de memória persistente que fazem interações parecerem mais pessoais ao longo do tempo."
  },
  q5: {
    question: "Quais são os custos médios das plataformas de companion de IA?",
    answer: "Os preços variam amplamente: Gratuito (Hammer AI, Character.AI tier gratuito), $5-10/mês (planos básicos), $15-25/mês (planos padrão com mais recursos), $30-50/mês (planos premium com recursos avançados). Assinaturas anuais geralmente oferecem 20-30% de desconto."
  },
  q6: {
    question: "Quais companions de IA funcionam melhor em dispositivos móveis?",
    answer: "Replika, Anima e Character.AI têm aplicativos móveis nativos excelentes para iOS e Android. Secret AI e Romantic AI também oferecem experiências móveis otimizadas. A maioria das plataformas modernas são mobile-first ou têm designs web responsivos."
  },
  q7: {
    question: "Existem companions de IA especialmente para profissionais?",
    answer: "Sim! Companions focados em produtividade como Claude (Anthropic), ChatGPT (OpenAI) e Simone oferecem assistência profissional, ajuda com código, análise de documentos e integração de fluxo de trabalho. Algumas plataformas de companion também oferecem modos profissionais para coaching ou suporte de bem-estar."
  },
  q8: {
    question: "Quão realistas são as conversas modernas de companions de IA?",
    answer: "As plataformas modernas de companion de IA alcançaram um realismo impressionante. Plataformas de ponta usam modelos de linguagem grandes (LLMs) que entendem contexto, nuances emocionais e mantêm personalidades consistentes. A qualidade varia - plataformas premium como Secrets AI e DreamGF oferecem conversas muito realistas que parecem naturais e envolventes."
  },
  q9: {
    question: "Quais medidas de segurança as plataformas de companion de IA implementam?",
    answer: "Plataformas respeitáveis usam criptografia end-to-end, armazenamento seguro de dados e políticas de privacidade transparentes. Muitas oferecem processamento local (como Hammer AI) para privacidade máxima. Sempre revise as políticas de privacidade e procure por plataformas com reputações estabelecidas e medidas de proteção de dados claras."
  },
  q10: {
    question: "Posso usar várias plataformas de companion de IA simultaneamente?",
    answer: "Absolutamente! Muitos usuários usam diferentes plataformas para diferentes propósitos - uma para conversas casuais, outra para tarefas profissionais, outra para companheirismo romântico. Cada plataforma tem pontos fortes únicos. Apenas esteja atento aos custos de assinatura se usar vários serviços premium."
  }
};

fs.writeFileSync(ptJsonPath, JSON.stringify(ptJson, null, 2), 'utf-8');
console.log('   ✅ Added FAQ translations to pt.json');

// Now add data-i18n attributes to FAQ items
ptCompanions = ptCompanions.replace(
  /<h3 class="faq-question" itemprop="name">Hoe kies ik het juiste AI companion platform\?<\/h3>/g,
  '<h3 class="faq-question" itemprop="name" data-i18n="companionsPage.faq.q1.question">Hoe kies ik het juiste AI companion platform?</h3>'
);

ptCompanions = ptCompanions.replace(
  /<h3 class="faq-question" itemprop="name">Wat zijn de best beoordeelde AI companion platforms in 2025\?<\/h3>/g,
  '<h3 class="faq-question" itemprop="name" data-i18n="companionsPage.faq.q2.question">Wat zijn de best beoordeelde AI companion platforms in 2025?</h3>'
);

ptCompanions = ptCompanions.replace(
  /<h3 class="faq-question" itemprop="name">Welke AI companions bieden volledig gratis toegang\?<\/h3>/g,
  '<h3 class="faq-question" itemprop="name" data-i18n="companionsPage.faq.q3.question">Welke AI companions bieden volledig gratis toegang?</h3>'
);

ptCompanions = ptCompanions.replace(
  /<h3 class="faq-question" itemprop="name">Hoe werken de geheugen systemen van AI companions\?<\/h3>/g,
  '<h3 class="faq-question" itemprop="name" data-i18n="companionsPage.faq.q4.question">Hoe werken de geheugen systemen van AI companions?</h3>'
);

fs.writeFileSync(ptCompanionsPath, ptCompanions, 'utf-8');
console.log('   ✅ Fixed pt/companions.html\n');

// ===== FIX PT CATEGORIES.HTML =====
console.log('3️⃣  Fixing pt/categories.html...');
const ptCategoriesPath = path.join(__dirname, '..', 'pt', 'categories.html');
let ptCategories = fs.readFileSync(ptCategoriesPath, 'utf-8');

// Fix "Welke AI companion categorie past bij jou?"
ptCategories = ptCategories.replace(
  /Welke AI companion categorie past bij jou\?/g,
  'Qual categoria de companion de IA é ideal para você?'
);

fs.writeFileSync(ptCategoriesPath, ptCategories, 'utf-8');
console.log('   ✅ Fixed pt/categories.html\n');

// ===== FIX PT NEWS.HTML =====
console.log('4️⃣  Fixing pt/news.html...');
const ptNewsPath = path.join(__dirname, '..', 'pt', 'news.html');
let ptNews = fs.readFileSync(ptNewsPath, 'utf-8');

// Fix "Blijf op de hoogte"
ptNews = ptNews.replace(
  /Blijf op de hoogte van het laatste nieuws/g,
  'Fique atualizado com as últimas notícias'
);

fs.writeFileSync(ptNewsPath, ptNews, 'utf-8');
console.log('   ✅ Fixed pt/news.html\n');

// ===== FIX PT CONTACT.HTML =====
console.log('5️⃣  Fixing pt/contact.html...');
const ptContactPath = path.join(__dirname, '..', 'pt', 'contact.html');
let ptContact = fs.readFileSync(ptContactPath, 'utf-8');

// Fix "Veelgestelde Vragen"
ptContact = ptContact.replace(
  /<h2 data-i18n="contact\.faqTitle">Veelgestelde Vragen<\/h2>/g,
  '<h2 data-i18n="contact.faqTitle">Veelgestelde Vragen</h2>'
);

fs.writeFileSync(ptContactPath, ptContact, 'utf-8');
console.log('   ✅ Fixed pt/contact.html\n');

console.log('✅ All Dutch text fixed in PT pages!');
console.log('\n📝 Summary:');
console.log('   - pt/index.html: Fixed 7 Dutch words');
console.log('   - pt/companions.html: Fixed 5 Dutch words + added FAQ translations');
console.log('   - pt/categories.html: Fixed 1 Dutch word');
console.log('   - pt/news.html: Fixed 1 Dutch word');
console.log('   - pt/contact.html: Fixed 1 Dutch word');
console.log('   - locales/pt.json: Added companionsPage.faq translations');
