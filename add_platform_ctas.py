#!/usr/bin/env python3
"""
Script to add platform CTA buttons to blog posts after 'Best For:' sections
"""

import re
import os

# Platform URLs mapping (synced with Airtable website_url)
PLATFORM_URLS = {
    'secrets-ai': 'http://secrets.ai/?spicy=true&gender=female&fpr=companionguide',
    'soulkyn-ai': 'https://soulkyn.com/?_go=companionguide',
    'soulkyn': 'https://soulkyn.com/?_go=companionguide',
    'hammer-ai': 'https://gumroad.com/a/748605075/zrsof',
    'hammer': 'https://gumroad.com/a/748605075/zrsof',
    'girlfriend-gpt': 'https://www.gptgirlfriend.online/?ref=ztrhn2z',
    'girlfriendgpt': 'https://www.gptgirlfriend.online/?ref=ztrhn2z',
    'ourdream-ai': 'https://www.df4qnp8trk.com/3CQWRGN/9B9DM/?uid=36&sub5=companionguide',
    'ourdream': 'https://www.df4qnp8trk.com/3CQWRGN/9B9DM/?uid=36&sub5=companionguide',
    'replika': 'https://replika.com',
    'joi-ai': 'https://edenai.go2cloud.org/aff_c?offer_id=35&aff_id=1583&url_id=287&source=companionguide.ai',
    'joi': 'https://edenai.go2cloud.org/aff_c?offer_id=35&aff_id=1583&url_id=287&source=companionguide.ai',
    'spicychat-ai': 'https://spicychat.ai?ref=njq1ogy',
    'spicychat': 'https://spicychat.ai?ref=njq1ogy',
    'crushon-ai': 'https://crushon.ai/?ref=companionguide&mist=1',
    'crushon': 'https://crushon.ai/?ref=companionguide&mist=1',
    'character-ai': 'https://character.ai',
    'character': 'https://character.ai',
    'candy-ai': 'https://t.crjmpy.com/388589/7793?aff_sub5=SF_006OG000004lmDN',
    'candy': 'https://t.crjmpy.com/388589/7793?aff_sub5=SF_006OG000004lmDN',
    'dreamgf-ai': 'https://t.crjmpy.com/388589/6523?aff_sub5=SF_006OG000004lmDN',
    'dreamgf': 'https://t.crjmpy.com/388589/6523?aff_sub5=SF_006OG000004lmDN',
    'nomi-ai': 'https://nomi.ai/?via=companionguide',
    'nomi': 'https://nomi.ai/?via=companionguide',
    'janitor-ai': 'https://janitorai.com',
    'janitor': 'https://janitorai.com',
    'chai-ai': 'https://chai.ml',
    'chai': 'https://chai.ml',
    'soulgen-ai': 'https://www.soulgen.net?utm_source=LlAv94T0IrfL&cp_id=sBjxcqRnKZ7CM',
    'soulgen': 'https://www.soulgen.net?utm_source=LlAv94T0IrfL&cp_id=sBjxcqRnKZ7CM',
    'fantasygf-ai': 'https://fantasygf.com/create-ai-girl?via=53hyme',
    'fantasygf': 'https://fantasygf.com/create-ai-girl?via=53hyme',
    'promptchan-ai': 'https://promptchan.com/m/BGSMAfDGH6ffLdgSLoy8tfMFMh03/cg',
    'promptchan': 'https://promptchan.com/m/BGSMAfDGH6ffLdgSLoy8tfMFMh03/cg',
    'selira-ai': 'https://selira.ai?ref=hello90',
    'selira': 'https://selira.ai?ref=hello90',
    'nectar-ai': 'https://www.k0mgd8qtw3trk.com/C5PWF/2CTPL/?uid=2',
    'nectar': 'https://www.k0mgd8qtw3trk.com/C5PWF/2CTPL/?uid=2',
    'kupid-ai': 'https://t.avlmy.com/388589/6924?popUnder=true&source=companionguide&aff_sub5=SF_006OG000004lmDN',
    'kupid': 'https://t.avlmy.com/388589/6924?popUnder=true&source=companionguide&aff_sub5=SF_006OG000004lmDN',
    'simone': 'https://simone.app',
    'ehentai-ai': 'https://t.crjmpy.com/388589/6558?aff_sub5=SF_006OG000004lmDN',
    'ehentai': 'https://t.crjmpy.com/388589/6558?aff_sub5=SF_006OG000004lmDN',
    'chub-ai': 'https://chub.ai',
    'chub': 'https://chub.ai',
}

# Platform display names
PLATFORM_NAMES = {
    'secrets-ai': 'Secrets AI',
    'soulkyn-ai': 'Soulkyn AI',
    'soulkyn': 'Soulkyn AI',
    'hammer-ai': 'Hammer AI',
    'hammer': 'Hammer AI',
    'girlfriend-gpt': 'GirlfriendGPT',
    'girlfriendgpt': 'GirlfriendGPT',
    'ourdream-ai': 'OurDream AI',
    'ourdream': 'OurDream AI',
    'replika': 'Replika',
    'joi-ai': 'JOI AI',
    'joi': 'JOI AI',
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
    'kupid-ai': 'Kupid AI',
    'kupid': 'Kupid AI',
    'simone': 'Simone',
    'ehentai-ai': 'eHentai AI',
    'ehentai': 'eHentai AI',
    'chub-ai': 'Chub AI',
    'chub': 'Chub AI',
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
