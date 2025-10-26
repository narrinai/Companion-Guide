#!/usr/bin/env python3
"""
Fix NL categories page by copying PT structure and replacing with Dutch translations
"""

# Read PT version (working version)
with open('pt/categories.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace PT with NL
replacements = [
    # Language
    ('<html lang="pt">', '<html lang="nl">'),

    # Canonical and OG URLs
    ('https://companionguide.ai/pt/categories', 'https://companionguide.ai/nl/categories'),

    # Navigation
    ('/pt/', '/nl/'),
    ('Início', 'Home'),
    ('Categorias', 'Categories'),
    ('Notícias', 'News & Guides'),
    ('Ofertas', 'Deals'),
    ('Contato', 'Contact'),

    # Hero title and subtitle
    ('Categorias de Plataformas de Companhia IA', 'AI Companion Platform Categorieën'),
    ('Explore as melhores plataformas de companhia IA organizadas por categoria e caso de uso. Encontre o tipo de plataforma perfeito para suas necessidades e preferências específicas.',
     'Ontdek de beste AI companion platformen georganiseerd per categorie en gebruiksdoel. Vind het perfecte platformtype voor jouw specifieke behoeften en voorkeuren.'),

    # Category names
    ('Roleplay & Chat de Personagens', 'Roleplay & Karakter Chat'),
    ('Melhores plataformas de IA para experiências de roleplay e chat de personagens com narrativa interativa',
     'Beste AI-platforms voor roleplay en karakter chat ervaringen met interactieve storytelling'),

    ('Bem-estar', 'Welzijn'),
    ('Companions de IA focados em saúde mental, suporte emocional e bem-estar pessoal',
     'AI companions gericht op mentale gezondheid, emotionele ondersteuning en persoonlijk welzijn'),

    ('Aprendizado', 'Leren'),
    ('Tutores de IA e companions educacionais para desenvolvimento de habilidades e suporte acadêmico',
     'AI-tutoren en educatieve companions voor vaardigheidsontwikkeling en academische ondersteuning'),

    ('Namorada IA', 'AI Vriendin'),
    ('Melhores plataformas de IA para relacionamentos românticos virtuais e experiências de namoro',
     'Beste AI-platforms voor virtuele romantische relaties en date-ervaringen'),

    ('Namorado IA', 'AI Vriend'),
    ('Principais plataformas de namorado IA para relacionamentos românticos virtuais e companions masculinos',
     'Top AI vriend platforms voor virtuele romantische relaties en mannelijke companions'),

    ('Apenas WhatsApp', 'Alleen WhatsApp'),
    ('Companions de IA que se integram nativamente ao WhatsApp - sem necessidade de aplicativos separados',
     'AI companions die native integreren in WhatsApp - geen aparte apps nodig'),

    ('Geração de Imagens Adultas', 'Volwassen Afbeelding Generatie'),
    ('Melhores plataformas de IA para criar arte NSFW e conteúdo visual adulto (apenas 18+)',
     'Beste AI-platforms voor het maken van NSFW kunst en volwassen visuele content (alleen 18+)'),

    ('Conteúdo Adulto & Sem Censura', 'Volwassen Content & Ongecensureerd'),
    ('Melhores plataformas de IA sem censura para conteúdo adulto e conversas maduras (apenas 18+)',
     'Beste ongecensureerde AI-platforms voor volwassen content en volwassen gesprekken (alleen 18+)'),

    ('Companions de Vídeo', 'Video Companions'),
    ('Companions de IA com capacidades de chat por vídeo e geração de vídeo para experiências imersivas',
     'AI companions met videochat en videogeneratie mogelijkheden voor meeslepende ervaringen'),

    ('Plataformas de Pornografia IA', 'AI Porno Platforms'),
    ('Plataformas de IA avançadas para geração de conteúdo adulto fotorrealista e experiências interativas (apenas 18+)',
     'Geavanceerde AI-platforms voor fotorealistische volwassen contentgeneratie en interactieve ervaringen (alleen 18+)'),

    ('Plataformas de Hentai IA', 'Hentai AI Platforms'),
    ('Geradores de IA especializados para conteúdo adulto em estilo anime e mangá em múltiplos estilos de arte (apenas 18+)',
     'Gespecialiseerde AI-generatoren voor anime en manga-stijl volwassen content in meerdere kunststijlen (alleen 18+)'),

    # Footer
    ('Companion Guide', 'Companion Guide'),  # Keep same
    ('Sua fonte confiável para avaliações e guias de companions de IA',
     'Jouw betrouwbare bron voor AI companion reviews en gidsen'),
    ('Navegação', 'Navigatie'),
    ('Notícias e Guias', 'Nieuws & Gidsen'),
    ('Guias em Destaque', 'Uitgelichte Gidsen'),
]

for old, new in replacements:
    content = content.replace(old, new)

# Write to NL file
with open('nl/categories.html', 'w', encoding='utf-8') as f:
    f.write(content)

print("✅ NL categories page updated with correct structure and Dutch translations")
