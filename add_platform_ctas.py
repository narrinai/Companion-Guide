#!/usr/bin/env python3
"""
Script to add platform CTA buttons to blog posts after 'Best For:' sections
"""

import re
import os

# Platform URLs mapping
PLATFORM_URLS = {
    'secrets-ai': 'https://www.secrets.ai/categories?fpr=companionguide',
    'soulkyn-ai': 'https://soulkyn.com/?via=companionguide',
    'hammer-ai': 'https://hammer.app?via=companionguide',
    'girlfriend-gpt': 'https://www.girlfriendgpt.com?via=companionguide',
    'girlfriendgpt': 'https://www.girlfriendgpt.com?via=companionguide',
    'ourdream-ai': 'https://ourdream.ai?via=companionguide',
    'replika': 'https://replika.com?via=companionguide',
    'joi-ai': 'https://joi.ai?via=companionguide',
    'spicychat-ai': 'https://spicychat.ai?via=companionguide',
    'spicychat': 'https://spicychat.ai?via=companionguide',
    'crushon-ai': 'https://crushon.ai?via=companionguide',
    'crushon': 'https://crushon.ai?via=companionguide',
    'character-ai': 'https://character.ai?via=companionguide',
    'character': 'https://character.ai?via=companionguide',
    'candy-ai': 'https://candy.ai?via=companionguide',
    'candy': 'https://candy.ai?via=companionguide',
    'dreamgf-ai': 'https://dreamgf.ai?via=companionguide',
    'dreamgf': 'https://dreamgf.ai?via=companionguide',
    'nomi-ai': 'https://nomi.ai?via=companionguide',
    'nomi': 'https://nomi.ai?via=companionguide',
    'janitor-ai': 'https://janitorai.com?via=companionguide',
    'janitor': 'https://janitorai.com?via=companionguide',
    'chai-ai': 'https://chai.ml?via=companionguide',
    'chai': 'https://chai.ml?via=companionguide',
    'soulgen-ai': 'https://soulgen.ai?via=companionguide',
    'soulgen': 'https://soulgen.ai?via=companionguide',
    'fantasygf-ai': 'https://fantasygf.ai?via=companionguide',
    'fantasygf': 'https://fantasygf.ai?via=companionguide',
    'promptchan-ai': 'https://promptchan.ai?via=companionguide',
    'promptchan': 'https://promptchan.ai?via=companionguide',
    'selira-ai': 'https://selira.ai?via=companionguide',
    'selira': 'https://selira.ai?via=companionguide',
    'nectar-ai': 'https://nectar.ai?via=companionguide',
    'nectar': 'https://nectar.ai?via=companionguide',
    'narrin-ai': 'https://narrin.ai?via=companionguide',
    'narrin': 'https://narrin.ai?via=companionguide',
    'simone': 'https://simone.ai?via=companionguide',
    'kupid-ai': 'https://kupid.ai?via=companionguide',
    'kupid': 'https://kupid.ai?via=companionguide',
}

# Platform display names
PLATFORM_NAMES = {
    'secrets-ai': 'Secrets AI',
    'soulkyn-ai': 'Soulkyn AI',
    'hammer-ai': 'Hammer AI',
    'girlfriend-gpt': 'GirlfriendGPT',
    'girlfriendgpt': 'GirlfriendGPT',
    'ourdream-ai': 'OurDream AI',
    'replika': 'Replika',
    'joi-ai': 'JOI AI',
    'spicychat-ai': 'SpicyChat AI',
    'spicychat': 'SpicyChat AI',
    'crushon-ai': 'CrushOn AI',
    'crushon': 'CrushOn AI',
    'character-ai': 'Character AI',
    'character': 'Character AI',
    'candy-ai': 'Candy AI',
    'candy': 'Candy AI',
    'dreamgf-ai': 'DreamGF AI',
    'dreamgf': 'DreamGF AI',
    'nomi-ai': 'Nomi AI',
    'nomi': 'Nomi AI',
    'janitor-ai': 'Janitor AI',
    'janitor': 'Janitor AI',
    'chai-ai': 'Chai AI',
    'chai': 'Chai AI',
    'soulgen-ai': 'SoulGen AI',
    'soulgen': 'SoulGen AI',
    'fantasygf-ai': 'FantasyGF AI',
    'fantasygf': 'FantasyGF AI',
    'promptchan-ai': 'PromptChan AI',
    'promptchan': 'PromptChan AI',
    'selira-ai': 'Selira AI',
    'selira': 'Selira AI',
    'nectar-ai': 'Nectar AI',
    'nectar': 'Nectar AI',
    'narrin-ai': 'Narrin AI',
    'narrin': 'Narrin AI',
    'simone': 'Simone',
    'kupid-ai': 'Kupid AI',
    'kupid': 'Kupid AI',
}

def extract_platform_slug(section_text):
    """Extract platform slug from section content"""
    # Look for href="/companions/SLUG"
    match = re.search(r'href="/companions/([^"]+)"', section_text)
    if match:
        return match.group(1)
    return None

def generate_cta_html(platform_slug):
    """Generate CTA button HTML for a platform"""
    if platform_slug not in PLATFORM_URLS:
        print(f"Warning: No URL found for platform '{platform_slug}'")
        return None

    platform_name = PLATFORM_NAMES.get(platform_slug, platform_slug.replace('-', ' ').title())
    platform_url = PLATFORM_URLS[platform_slug]

    cta_html = f'''
                        <div class="platform-cta">
                            <a href="/companions/{platform_slug}" class="btn-primary">Read Full Review</a>
                            <a href="{platform_url}" class="btn-secondary" target="_blank" rel="noopener">Visit {platform_name}</a>
                        </div>'''

    return cta_html

def process_blog_post(file_path):
    """Process a single blog post file"""
    print(f"Processing {os.path.basename(file_path)}...")

    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Check if file already has platform-cta divs
    if 'class="platform-cta"' in content:
        print(f"  Skipping - already has platform-cta divs")
        return False

    # Find all sections with "Best For:" that end with </section>
    pattern = r'(<p><strong>Best For:</strong>.*?</p>)\s*(</section>)'

    sections_found = 0

    def replace_section(match):
        nonlocal sections_found
        best_for_p = match.group(1)
        closing_section = match.group(2)

        # Look backwards from this match to find the section content
        start_pos = match.start()
        # Find the last <section before this position
        section_start = content.rfind('<section', 0, start_pos)
        if section_start == -1:
            return match.group(0)  # No section found, return unchanged

        section_content = content[section_start:start_pos]

        # Extract platform slug
        platform_slug = extract_platform_slug(section_content)

        if not platform_slug:
            print(f"  Warning: Could not extract platform slug from section")
            return match.group(0)

        # Generate CTA HTML
        cta_html = generate_cta_html(platform_slug)

        if not cta_html:
            return match.group(0)

        sections_found += 1
        return f"{best_for_p}{cta_html}\n                    {closing_section}"

    # Replace all occurrences
    new_content = re.sub(pattern, replace_section, content, flags=re.DOTALL)

    if sections_found > 0:
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"  Added {sections_found} platform CTA sections")
        return True
    else:
        print(f"  No sections to update")
        return False

def main():
    """Main function"""
    blog_posts = [
        'spicychat-ai-alternatives-complete-guide-2025.html',
        'crushon-ai-alternatives-complete-guide-2025.html',
        'soulkyn-ai-alternatives-complete-guide-2025.html',
        'spicychat-ai-complete-guide-2025.html',
        'replika-ai-alternatives-complete-guide-2025.html',
        'character-ai-alternatives-complete-guide-2025.html',
        'candy-ai-alternatives-complete-guide-2025.html',
        'comprehensive-ai-chat-market-guide-2025.html',
        'free-ai-chat-no-signup-guide-2025.html',
        'hammer-ai-complete-review-2025.html',
        'soulgen-ai-adult-image-generation-guide-2025.html',
        'fantasygf-ai-complete-guide-2025.html',
        'ai-sex-chat-comprehensive-guide-2025.html',
        'character-ai-complete-guide-2025.html',
    ]

    news_dir = '/Users/sebastiaansmits/Documents/AI-Companion-Reviews/news'
    updated_count = 0

    for blog_post in blog_posts:
        file_path = os.path.join(news_dir, blog_post)
        if os.path.exists(file_path):
            if process_blog_post(file_path):
                updated_count += 1
        else:
            print(f"File not found: {blog_post}")

    print(f"\nCompleted! Updated {updated_count} files.")

if __name__ == '__main__':
    main()
