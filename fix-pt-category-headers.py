#!/usr/bin/env python3
"""
Fix all PT category page headers to Portuguese
"""

import os
import re

# Category translations
TRANSLATIONS = {
    'adult-content-uncensored-companions.html': {
        'title': 'Melhores Plataformas de Adult Content & Ongecensureerd',
        'description': 'Explore as melhores plataformas de AI sex chat incluindo Candy AI, Hammer AI, FantasyGF, ThotChat AI, Kupid AI, GirlfriendGPT, JOI AI, SpicyChat, Janitor AI, Muah.AI e outros AI companions NSFW ongecensureerd. Estas plataformas de AI adulta oferecem liberdade criativa completa para conversas maduras, AI sexting e experiências de chat erótico sem restrições de conteúdo.',
        'breadcrumb': 'Plataformas de AI Adult Content & Ongecensureerd'
    },
    'adult-image-generation-companions.html': {
        'title': 'Melhores Plataformas de Geração de Imagens Adultas com AI',
        'description': 'Descubra as melhores plataformas de AI para criar NSFW art e conteúdo visual adulto (apenas +18). Estas plataformas oferecem geração de imagens adultas avançada, criação de conteúdo NSFW e ferramentas de arte erótica usando AI generativa de última geração.',
        'breadcrumb': 'Plataformas de Geração de Imagens Adultas com AI'
    },
    'ai-boyfriend-companions.html': {
        'title': 'Melhores Plataformas de AI Boyfriend',
        'description': 'Descubra as principais plataformas de AI boyfriend para relacionamentos românticos virtuais e companions masculinos. Estas plataformas oferecem experiências personalizadas de dating virtual, conversas românticas e conexões emocionais com parceiros de AI personalizáveis.',
        'breadcrumb': 'Plataformas de AI Boyfriend'
    },
    'ai-girlfriend-companions.html': {
        'title': 'Melhores Plataformas de AI Girlfriend',
        'description': 'Descubra as melhores plataformas de AI girlfriend para relacionamentos românticos virtuais. Estas plataformas oferecem experiências personalizadas de dating virtual, conversas românticas e conexões emocionais com partners de AI personalizáveis.',
        'breadcrumb': 'Plataformas de AI Girlfriend'
    },
    'hentai-ai-chat-platforms.html': {
        'title': 'Melhores Plataformas de Hentai AI',
        'description': 'Descubra geradores especializados de AI para conteúdo adulto em estilo anime e mangá em vários estilos de arte (apenas +18). Estas plataformas oferecem criação de hentai de alta qualidade, geração de NSFW anime e ferramentas de arte erótica estilo mangá.',
        'breadcrumb': 'Plataformas de Hentai AI'
    },
    'learning-companions.html': {
        'title': 'Melhores AI Tutors e Companions Educacionais',
        'description': 'Descubra AI tutors e companions educacionais para desenvolvimento de habilidades e suporte acadêmico. Estas plataformas oferecem assistência personalizada de aprendizagem, tutoria adaptativa e ferramentas educacionais interativas.',
        'breadcrumb': 'AI Tutors e Companions Educacionais'
    },
    'roleplay-character-chat-companions.html': {
        'title': 'Melhores Plataformas de Roleplay & Character Chat com AI',
        'description': 'Explore as melhores plataformas de AI para experiências de roleplay e character chat. Estas plataformas se destacam em storytelling interativo, conversas criativas e interações imersivas com characters para entretenimento e expressão criativa.',
        'breadcrumb': 'Plataformas de Roleplay & Character Chat com AI'
    },
    'video-companions-companions.html': {
        'title': 'Melhores Video AI Companions',
        'description': 'AI companions com recursos de video chat e geração de vídeo para experiências imersivas. Descubra plataformas que vão além de texto e voz com capacidades de vídeo.',
        'breadcrumb': 'Video AI Companions'
    },
    'wellness-companions.html': {
        'title': 'Melhores AI Wellness Companions',
        'description': 'AI companions focados em saúde mental, bem-estar emocional e suporte pessoal. Estas plataformas oferecem conversas empáticas, ferramentas de mindfulness e orientação para bem-estar.',
        'breadcrumb': 'AI Wellness Companions'
    },
    'whatsapp-only-companions.html': {
        'title': 'Melhores AI Companions Nativos do WhatsApp',
        'description': 'AI companions que se integram nativamente ao WhatsApp - sem necessidade de aplicativos separados. Chat direto com AI no seu aplicativo de mensagens favorito.',
        'breadcrumb': 'AI Companions Nativos do WhatsApp'
    },
    'ai-porn-chat-platforms.html': {
        'title': 'Melhores Plataformas de AI Porn',
        'description': 'Plataformas avançadas de AI para geração de conteúdo adulto fotorrealista e experiências interativas (apenas +18). Criação de AI porn de alta qualidade e chat adulto interativo.',
        'breadcrumb': 'Plataformas de AI Porn'
    }
}

def fix_category_page(filename, translations):
    """Fix a single PT category page"""
    filepath = f'pt/categories/{filename}'

    if not os.path.exists(filepath):
        print(f"  ⚠️  File not found: {filename}")
        return False

    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    original_content = content

    # Fix hero H1
    content = re.sub(
        r'<h1>Best [^<]+</h1>',
        f'<h1>{translations["title"]}</h1>',
        content
    )

    # Fix category description
    content = re.sub(
        r'<p class="category-description">[^<]+</p>',
        f'<p class="category-description">{translations["description"]}</p>',
        content
    )

    # Fix breadcrumb
    content = re.sub(
        r'<span>>[^<]+</span> <span>[^<]+</span>',
        f'<span>></span> <span>{translations["breadcrumb"]}</span>',
        content
    )

    if content != original_content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        return True

    return False

print("🇵🇹 Fixing PT category page headers...")
print("=" * 70)

updated_count = 0
for filename, translations in TRANSLATIONS.items():
    print(f"📝 {filename}... ", end='', flush=True)

    if fix_category_page(filename, translations):
        print("✅ Updated")
        updated_count += 1
    else:
        print("❌ No changes")

print()
print("=" * 70)
print(f"✅ Fixed {updated_count}/{len(TRANSLATIONS)} PT category pages")
print("=" * 70)
