#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🌐 Translating news cards in pt/index.html...\n');

const filePath = path.join(__dirname, '..', 'pt', 'index.html');
let content = fs.readFileSync(filePath, 'utf-8');

// News card translations
const translations = [
  {
    nl: 'Beste Crushon AI Alternatieven 2025: Complete NSFW AI Companion Gids met Roleplay & Character Chat',
    pt: 'Melhores Alternativas ao Crushon AI 2025: Guia Completo de AI Companion NSFW com Roleplay & Chat de Personagens'
  },
  {
    nl: 'Ontdek de beste Crushon AI alternatieven in 2025. Uitgebreide vergelijking van ongecensureerde AI companions inclusief Spicy Chat, Character AI, Candy AI, en meer met NSFW functies, roleplay en character customization.',
    pt: 'Descubra as melhores alternativas ao Crushon AI em 2025. Comparação abrangente de AI companions sem censura incluindo Spicy Chat, Character AI, Candy AI e mais com recursos NSFW, roleplay e customização de personagens.'
  },
  {
    nl: 'Beste Soulkyn AI Alternatieven 2025: Complete AI Companion Gids met Video & NSFW Functies',
    pt: 'Melhores Alternativas ao Soulkyn AI 2025: Guia Completo de AI Companion com Vídeo & Recursos NSFW'
  },
  {
    nl: 'Ontdek de beste Soulkyn AI alternatieven in 2025. Uitgebreide vergelijking van AI companions inclusief Secrets AI, OurDream AI, SpicyChat, en meer met video generatie, NSFW functies en intieme relaties.',
    pt: 'Descubra as melhores alternativas ao Soulkyn AI em 2025. Comparação abrangente de AI companions incluindo Secrets AI, OurDream AI, SpicyChat e mais com geração de vídeo, recursos NSFW e relações íntimas.'
  },
  {
    nl: 'Gratis AI Chat Zonder Aanmelden: Complete Gids 2025',
    pt: 'Chat de IA Grátis Sem Cadastro: Guia Completo 2025'
  },
  {
    nl: 'Ontdek de beste gratis AI chat platforms zonder aanmeldvereisten. Complete gids over gratis sex chat, roleplay AI chatbots, AI girlfriends en ongecensureerde gesprekken - allemaal met minimale drempels.',
    pt: 'Descubra as melhores plataformas de chat de IA grátis sem requisitos de cadastro. Guia completo sobre chat de sexo grátis, chatbots de IA de roleplay, AI girlfriends e conversas sem censura - tudo com barreiras mínimas.'
  },
  {
    nl: 'Complete Gids',
    pt: 'Guia Completo'
  },
  {
    nl: 'SpicyChat AI Complete Gids 2025: Beste AI Sex Chat Platform Review',
    pt: 'Guia Completo do SpicyChat AI 2025: Análise da Melhor Plataforma de Chat de Sexo com IA'
  },
  {
    nl: 'Ultieme SpicyChat AI gids 2025: Complete review van het beste AI sex chat platform. Ongecensureerde NSFW functies, prijzen, character creatie',
    pt: 'Guia definitivo do SpicyChat AI 2025: Análise completa da melhor plataforma de chat de sexo com IA. Recursos NSFW sem censura, preços, criação de personagens'
  },
  {
    nl: 'alternatieven. Expert 8-weken analyse van dit toonaangevende adult AI platform.',
    pt: 'e alternativas. Análise especializada de 8 semanas desta plataforma de IA adulta líder.'
  },
  {
    nl: 'Beste Replika AI Alternatieven in 2025 - Complete Emotionele AI Companion Gids',
    pt: 'Melhores Alternativas ao Replika AI em 2025 - Guia Completo de AI Companion Emocional'
  },
  {
    nl: 'Op zoek naar alternatieven voor Replika AI? Ontdek platforms gericht op emotionele ondersteuning, mentaal welzijn en echte companionship. Van gespecialiseerde therapie AI tot productiviteitsgerichte companions, vind jouw perfecte emotionele AI partner.',
    pt: 'Procurando alternativas ao Replika AI? Descubra plataformas focadas em suporte emocional, bem-estar mental e companheirismo genuíno. De IA de terapia especializada a companions focados em produtividade, encontre seu parceiro de IA emocional perfeito.'
  },
  {
    nl: 'Alternatieven Gids',
    pt: 'Guia de Alternativas'
  },
  {
    nl: 'Beste Character AI Alternatieven in 2025 - Complete Roleplay Platform Gids',
    pt: 'Melhores Alternativas ao Character AI em 2025 - Guia Completo de Plataformas de Roleplay'
  },
  {
    nl: 'Kijk verder dan Character.AI? Ontdek de beste alternatieven voor roleplay, storytelling en ongecensureerde gesprekken. Van NSFW-vriendelijke platforms tot geavanceerde AI companions, vind jouw perfecte roleplay partner.',
    pt: 'Olhando além do Character.AI? Descubra as melhores alternativas para roleplay, narrativa e conversas sem censura. De plataformas NSFW-friendly a AI companions avançados, encontre seu parceiro de roleplay perfeito.'
  },
  {
    nl: 'Platform Gids',
    pt: 'Guia de Plataformas'
  }
];

// Apply translations
translations.forEach(({ nl, pt }) => {
  const escaped = nl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(escaped, 'g');
  content = content.replace(regex, pt);
});

// Also fix duplicate/malformed content
content = content.replace(
  /<h3><a href="\/pt\/news\/spicychat-ai-complete-guide-2025">SpicyChat AI Complete Gids 2025: Beste AI Sex Chat Platform Review <h3><a href="\/pt\/news\/spicychat-ai-complete-guide-2025">SpicyChat AI Complete Guide 2025: Best AI Sex Chat Platform Review & Features<\/a><\/h3> Functies<\/a><\/h3>/g,
  '<h3><a href="/pt/news/spicychat-ai-complete-guide-2025">Guia Completo do SpicyChat AI 2025: Análise da Melhor Plataforma de Chat de Sexo com IA & Recursos</a></h3>'
);

content = content.replace(
  /<p>Ultieme SpicyChat AI gids 2025: Complete review van het beste AI sex chat platform\. Ongecensureerde NSFW functies, prijzen, character creatie <p>Ultimate SpicyChat AI guide 2025: Complete review of the best AI sex chat platform\. Uncensored NSFW features, pricing, character creation & alternatives\. Expert 8-week analysis of this leading adult AI platform\.<\/p> alternatieven\. Expert 8-weken analyse van dit toonaangevende adult AI platform\.<\/p>/g,
  '<p>Guia definitivo do SpicyChat AI 2025: Análise completa da melhor plataforma de chat de sexo com IA. Recursos NSFW sem censura, preços, criação de personagens e alternativas. Análise especializada de 8 semanas desta plataforma de IA adulta líder.</p>'
);

fs.writeFileSync(filePath, content, 'utf-8');
console.log('✅ All news cards translated!');
