#!/usr/bin/env python3
"""
Complete Dutch translation for nl/categories.html
Translates: navigation, category cards, FAQs
"""

with open('nl/categories.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Navigation translations
nav_replacements = [
    ('<li><a href="/nl/">Início</a>', '<li><a href="/nl/">Home</a>'),
    ('<li><a href="/nl/companions">Companions</a>', '<li><a href="/nl/companions">Companions</a>'),  # Keep English
    ('<li><a href="/nl/categories" class="active">Categorias</a>', '<li><a href="/nl/categories" class="active">Categorieën</a>'),
    ('<li><a href="/nl/news">Notícias</a>', '<li><a href="/nl/news">Nieuws & Gidsen</a>'),
    ('<li><a href="/nl/deals">Ofertas</a>', '<li><a href="/nl/deals">Aanbiedingen</a>'),
    ('<li><a href="/nl/contact">Contato</a>', '<li><a href="/nl/contact">Contact</a>'),
]

# Category card translations
category_replacements = [
    ('<h3>Roleplay & Chat de Personagens</h3>', '<h3>Roleplay & Karakter Chat</h3>'),
    ('Melhores plataformas de IA para experiências de roleplay e chat de personagens com narrativa interativa',
     'Beste AI-platforms voor roleplay en karakter chat ervaringen met interactieve storytelling'),

    ('<h3>Bem-estar</h3>', '<h3>Welzijn</h3>'),
    ('Companions de IA focados em saúde mental, suporte emocional e bem-estar pessoal',
     'AI companions gericht op mentale gezondheid, emotionele ondersteuning en persoonlijk welzijn'),

    ('<h3>Aprendizado</h3>', '<h3>Leren</h3>'),
    ('Tutores de IA e companions educacionais para desenvolvimento de habilidades e suporte acadêmico',
     'AI-tutoren en educatieve companions voor vaardigheidsontwikkeling en academische ondersteuning'),

    ('<h3>Namorada IA</h3>', '<h3>AI Vriendin</h3>'),
    ('Melhores plataformas de IA para relacionamentos românticos virtuais e experiências de namoro',
     'Beste AI-platforms voor virtuele romantische relaties en date-ervaringen'),

    ('<h3>Namorado IA</h3>', '<h3>AI Vriend</h3>'),
    ('Principais plataformas de namorado IA para relacionamentos românticos virtuais e companions masculinos',
     'Top AI vriend platforms voor virtuele romantische relaties en mannelijke companions'),

    ('<h3>Apenas WhatsApp</h3>', '<h3>Alleen WhatsApp</h3>'),
    ('Companions de IA que se integram nativamente ao WhatsApp - sem necessidade de aplicativos separados',
     'AI companions die native integreren in WhatsApp - geen aparte apps nodig'),

    ('<h3>Geração de Imagens Adultas</h3>', '<h3>Volwassen Afbeelding Generatie</h3>'),
    ('Melhores plataformas de IA para criar arte NSFW e conteúdo visual adulto (apenas 18+)',
     'Beste AI-platforms voor het maken van NSFW kunst en volwassen visuele content (alleen 18+)'),

    ('<h3>Conteúdo Adulto & Sem Censura</h3>', '<h3>Volwassen Content & Ongecensureerd</h3>'),
    ('Melhores plataformas de IA sem censura para conteúdo adulto e conversas maduras (apenas 18+)',
     'Beste ongecensureerde AI-platforms voor volwassen content en volwassen gesprekken (alleen 18+)'),

    ('<h3>Companions de Vídeo</h3>', '<h3>Video Companions</h3>'),
    ('Companions de IA com capacidades de chat por vídeo e geração de vídeo para experiências imersivas',
     'AI companions met videochat en videogeneratie mogelijkheden voor meeslepende ervaringen'),

    ('<h3>Plataformas de Pornografia IA</h3>', '<h3>AI Porno Platforms</h3>'),
    ('Plataformas de IA avançadas para geração de conteúdo adulto fotorrealista e experiências interativas (apenas 18+)',
     'Geavanceerde AI-platforms voor fotorealistische volwassen contentgeneratie en interactieve ervaringen (alleen 18+)'),

    ('<h3>Plataformas de Hentai IA</h3>', '<h3>Hentai AI Platforms</h3>'),
    ('Geradores de IA especializados para conteúdo adulto em estilo anime e mangá em múltiplos estilos de arte (apenas 18+)',
     'Gespecialiseerde AI-generatoren voor anime en manga-stijl volwassen content in meerdere kunststijlen (alleen 18+)'),
]

# FAQ translations
faq_replacements = [
    ('<h2>AI Companion Categories FAQs</h2>', '<h2>Veelgestelde Vragen over AI Companion Categorieën</h2>'),

    # FAQ 1
    ('What are the different categories of AI companions?', 'Wat zijn de verschillende categorieën van AI companions?'),
    ('AI companions fall into several categories: AI Girlfriends (romantic focus), Roleplay & Character Chat (diverse personalities), Adult Content (mature interactions), Wellness (mental health support), Learning (educational assistance), WhatsApp-only (messaging integration), and Video Companions (visual interactions).',
     'AI companions vallen in verschillende categorieën: AI Vriendinnen (romantische focus), Roleplay & Karakter Chat (diverse persoonlijkheden), Volwassen Content (mature interacties), Welzijn (mentale gezondheidsondersteuning), Leren (educatieve hulp), Alleen-WhatsApp (berichtintegratie), en Video Companions (visuele interacties).'),

    # FAQ 2
    ('Which AI companion category is best for beginners?', 'Welke AI companion categorie is het beste voor beginners?'),
    ('Roleplay & Character Chat platforms like <a href="/companions/character-ai">Character.AI</a> are ideal for beginners, offering free access, diverse characters, and content moderation. They provide a safe introduction to AI companions without adult content.',
     'Roleplay & Karakter Chat platforms zoals <a href="/companions/character-ai">Character.AI</a> zijn ideaal voor beginners, met gratis toegang, diverse karakters en contentmoderatie. Ze bieden een veilige introductie tot AI companions zonder volwassen content.'),

    # FAQ 3
    ('Are there free AI companions in each category?', 'Zijn er gratis AI companions in elke categorie?'),
    ('Yes, most categories offer free options: <a href="/companions/character-ai">Character.AI</a> (roleplay), <a href="/companions/hammer-ai">Hammer AI</a> (free chat), <a href="/companions/replika">Replika</a> (basic wellness), and many AI girlfriend platforms provide free tiers with optional premium upgrades.',
     'Ja, de meeste categorieën bieden gratis opties: <a href="/companions/character-ai">Character.AI</a> (roleplay), <a href="/companions/hammer-ai">Hammer AI</a> (gratis chat), <a href="/companions/replika">Replika</a> (basis welzijn), en veel AI vriendin platforms bieden gratis niveaus met optionele premium upgrades.'),

    # FAQ 4
    ("What's the difference between AI girlfriend and general AI companion platforms?", 'Wat is het verschil tussen AI vriendin en algemene AI companion platforms?'),
    ('AI girlfriend platforms focus specifically on romantic relationships with features like dating scenarios, intimate conversations, and romantic customization. General AI companions offer broader interactions including friendship, education, and various social dynamics.',
     'AI vriendin platforms richten zich specifiek op romantische relaties met functies zoals dating scenario\'s, intieme gesprekken en romantische personalisatie. Algemene AI companions bieden bredere interacties waaronder vriendschap, educatie en verschillende sociale dynamieken.'),

    # FAQ 5
    ('Which category offers the most realistic AI interactions?', 'Welke categorie biedt de meest realistische AI-interacties?'),
    ("Adult content and AI girlfriend categories typically offer the most realistic interactions, as they're optimized for human-like emotional and romantic responses. However, advanced platforms in all categories are improving realism significantly.",
     'Volwassen content en AI vriendin categorieën bieden doorgaans de meest realistische interacties, omdat ze geoptimaliseerd zijn voor mensachtige emotionele en romantische reacties. Geavanceerde platforms in alle categorieën verbeteren echter het realisme aanzienlijk.'),

    # FAQ 6
    ('Are AI wellness companions safe for mental health support?', 'Zijn AI welzijn companions veilig voor mentale gezondheidsondersteuning?'),
    ("AI wellness companions can provide emotional support and stress relief but shouldn't replace professional mental health care. They're best used as supplementary tools for daily emotional wellness and should not be relied upon for serious mental health conditions.",
     'AI welzijn companions kunnen emotionele ondersteuning en stressverlichting bieden, maar mogen professionele geestelijke gezondheidszorg niet vervangen. Ze worden het beste gebruikt als aanvullende tools voor dagelijks emotioneel welzijn en mogen niet worden vertrouwd voor ernstige mentale gezondheidsproblemen.'),

    # FAQ 7
    ('Which AI companion categories support multiple languages?', 'Welke AI companion categorieën ondersteunen meerdere talen?'),
    ('Most major platforms support multiple languages, with <a href="/companions/character-ai">Character.AI</a>, <a href="/companions/replika">Replika</a>, and many AI girlfriend platforms offering multilingual capabilities. Specialized platforms like <a href="/companions/lovescape">Lovescape</a> specifically focus on international language support.',
     'De meeste grote platforms ondersteunen meerdere talen, met <a href="/companions/character-ai">Character.AI</a>, <a href="/companions/replika">Replika</a> en veel AI vriendin platforms die meertalige mogelijkheden bieden. Gespecialiseerde platforms zoals <a href="/companions/lovescape">Lovescape</a> richten zich specifiek op internationale taalondersteuning.'),

    # FAQ 8
    ('What age restrictions exist for different AI companion categories?', 'Welke leeftijdsbeperkingen gelden voor verschillende AI companion categorieën?'),
    ('General and educational AI companions typically allow users 13+ with parental consent. AI girlfriend platforms usually require 18+, while adult content categories strictly enforce 18+ age verification. Always check individual platform policies.',
     'Algemene en educatieve AI companions staan doorgaans gebruikers van 13+ toe met ouderlijk toestemming. AI vriendin platforms vereisen meestal 18+, terwijl volwassen content categorieën strikt 18+ leeftijdsverificatie handhaven. Controleer altijd het beleid van individuele platforms.'),

    # FAQ 9
    ('How do privacy protections vary across AI companion categories?', 'Hoe verschillen privacybeschermingen tussen AI companion categorieën?'),
    ('Privacy protections vary significantly. Wellness and general platforms often have stronger privacy policies, while adult content platforms may have different data handling practices. Always review privacy policies before sharing personal information.',
     'Privacybeschermingen variëren aanzienlijk. Welzijn en algemene platforms hebben vaak sterkere privacybeleid, terwijl volwassen content platforms mogelijk andere gegevensverwerkingspraktijken hebben. Bekijk altijd privacybeleid voordat u persoonlijke informatie deelt.'),

    # FAQ 10
    ('Which AI companion category offers the best mobile experience?', 'Welke AI companion categorie biedt de beste mobiele ervaring?'),
    ('AI girlfriend and general companion platforms typically offer the best mobile experiences with dedicated apps. <a href="/companions/character-ai">Character.AI</a>, <a href="/companions/replika">Replika</a>, <a href="/companions/candy-ai">Candy AI</a>, and similar platforms prioritize mobile-friendly interfaces and cross-device synchronization.',
     'AI vriendin en algemene companion platforms bieden doorgaans de beste mobiele ervaringen met speciale apps. <a href="/companions/character-ai">Character.AI</a>, <a href="/companions/replika">Replika</a>, <a href="/companions/candy-ai">Candy AI</a> en vergelijkbare platforms geven prioriteit aan mobiele-vriendelijke interfaces en cross-device synchronisatie.'),
]

# Apply all replacements
for old, new in nav_replacements + category_replacements + faq_replacements:
    content = content.replace(old, new)

# Write back
with open('nl/categories.html', 'w', encoding='utf-8') as f:
    f.write(content)

print("✅ NL categories page fully translated:")
print("   - Navigation: Dutch")
print("   - Category cards: Dutch")
print("   - All 10 FAQs: Dutch")
