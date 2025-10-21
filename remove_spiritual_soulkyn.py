#!/usr/bin/env python3
"""
Script to remove all 'spiritual' references related to Soulkyn and replace with NSFW/adult content focus
"""

import re

# Define replacements
replacements = [
    # Hero image alt text
    (r'alt="Soulkyn AI alternatives showing various spiritual AI companion platforms"',
     r'alt="Soulkyn AI alternatives showing various NSFW AI companion platforms"'),

    # General spiritual references
    (r'spiritual AI companion(ship)?s?', r'NSFW AI companions'),
    (r'spiritual companion(ship)?s?', r'adult AI companions'),
    (r'spiritual guide(s)?', r'AI girlfriend(s)'),
    (r'spiritual and philosophical', r'adult and intimate'),
    (r'spiritual topics?', r'adult content'),
    (r'spiritual practice(s)?', r'intimate interactions'),
    (r'spiritual growth', r'adult experiences'),
    (r'spiritual development', r'intimate relationships'),
    (r'spiritual wisdom', r'conversational depth'),
    (r'spiritual depth', r'conversational quality'),
    (r'spiritual journey', r'AI girlfriend experience'),
    (r'spiritual path', r'platform preferences'),
    (r'spiritual needs', r'content preferences'),
    (r'spiritual seekers', r'adult content users'),
    (r'spiritual conversations?', r'uncensored conversations'),
    (r'spiritual connection(s)?', r'intimate connection(s)'),
    (r'spiritual bond', r'emotional bond'),
    (r'spiritual relationship', r'AI relationship'),
    (r'spiritual intimacy', r'intimate content'),
    (r'spiritual awakening', r'immersive experiences'),
    (r'spiritual insights?', r'conversation insights'),
    (r'spiritual exploration', r'content exploration'),
    (r'spiritual archetypes', r'character types'),
    (r'shadow work, tantra', r'adult roleplay'),
    (r'tantric practices', r'intimate scenarios'),
    (r'tantric topics', r'adult content'),
    (r'tantric wisdom', r'intimate features'),
    (r'Sacred Partnership', r'Romantic Connection'),
    (r'sacred partnership', r'romantic partnership'),
    (r'sacred romantic partnership', r'romantic relationship'),
    (r'Holistic Approach', r'Advanced Features'),
    (r'holistic approach', r'comprehensive features'),
    (r'mind-body-spirit wellness', r'emotional and intimate wellness'),
    (r'emotional intelligence with spiritual growth', r'emotional intelligence with intimate features'),
    (r'edgier spiritual topics', r'unrestricted adult content'),
    (r'mystical practices', r'fantasy roleplay'),
    (r'meditation practitioners', r'NSFW users'),
    (r'philosophers', r'adult content enthusiasts'),
    (r'philosophical depth', r'conversational depth'),
    (r'philosophical discussions', r'uncensored discussions'),
    (r'Philosophically complex', r'Complex'),
    (r'guided meditations and spiritual practices', r'voice messages and audio features'),
    (r'spiritual tradition', r'character personality'),
    (r'spiritual practices or traditions', r'favorite features or scenarios'),
    (r'spiritual history', r'conversation history'),
    (r'spiritual characters', r'AI characters'),
    (r'spiritual AI guidance', r'uncensored AI chat'),
    (r"wisdom focus and teaching style", r"personality and conversation style"),
    (r'wisdom, guidance style, and areas of focus', r'personality, conversation style, and content preferences'),
    (r'spiritual and philosophical themes', r'adult and romantic themes'),
    (r'unlimited spiritual conversations', r'unlimited uncensored conversations'),
    (r'spiritual AI companionship', r'NSFW AI companionship'),
    (r'spiritual practitioners', r'platform users'),
]

def process_file(file_path):
    """Process a single file and replace spiritual references"""
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    original_content = content

    # Apply all replacements (case-insensitive)
    for pattern, replacement in replacements:
        content = re.sub(pattern, replacement, content, flags=re.IGNORECASE)

    # Check if anything changed
    if content != original_content:
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)
        return True
    return False

def main():
    files_to_process = [
        '/Users/sebastiaansmits/Documents/AI-Companion-Reviews/news/soulkyn-ai-alternatives-complete-guide-2025.html',
        '/Users/sebastiaansmits/Documents/AI-Companion-Reviews/news/best-ai-girlfriend-companions-2025.html',
        '/Users/sebastiaansmits/Documents/AI-Companion-Reviews/companions/soulkyn-ai.html',
        '/Users/sebastiaansmits/Documents/AI-Companion-Reviews/news/replika-ai-alternatives-complete-guide-2025.html',
    ]

    updated_count = 0
    for file_path in files_to_process:
        print(f"Processing {file_path.split('/')[-1]}...")
        if process_file(file_path):
            print(f"  ✓ Updated")
            updated_count += 1
        else:
            print(f"  - No changes needed")

    print(f"\nCompleted! Updated {updated_count} files.")

if __name__ == '__main__':
    main()
