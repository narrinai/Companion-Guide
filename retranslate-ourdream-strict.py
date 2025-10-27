#!/usr/bin/env python3
"""
Re-translate OurDream AI with STRICT English AI term preservation
"""

import os
import requests
import time
from anthropic import Anthropic

AIRTABLE_TOKEN = os.getenv('AIRTABLE_TOKEN_CG')
AIRTABLE_BASE_ID = os.getenv('AIRTABLE_BASE_ID_CG')
API_URL = f'https://api.airtable.com/v0/{AIRTABLE_BASE_ID}/Companion_Translations'
headers = {
    'Authorization': f'Bearer {AIRTABLE_TOKEN}',
    'Content-Type': 'application/json'
}

anthropic = Anthropic(api_key=os.getenv('ANTHROPIC_API_KEY'))

def translate_with_claude(text_chunk):
    """Translate text using Claude API with STRICT rules"""

    prompt = f"""Translate this AI companion review from English to Dutch.

CRITICAL TRANSLATION RULES - KEEP IN ENGLISH:
1. ALL AI terminology: AI girlfriend, AI companion, AI chatbot, AI boyfriend, AI character, AI porn, AI hentai
2. Product category terms: roleplay, chat, NSFW, SFW, character creation, playground, chatbot, companion
3. Technical terms: Stable Diffusion, Deepseek, tokens, API, image generation, video generation
4. Feature names: playground, character creator, image generator, video creation, memory, personality
5. Brand names: OurDream AI, Character.AI, Replika, DreamGF, etc.
6. Review section titles: "My Month Testing...", "The Bottom Line", "Pros and Cons"
7. Common phrases: "bottom line", "use case", "power users", "creative freedom", "free tier"

TRANSLATE TO DUTCH:
- Regular descriptive words (comprehensive, innovative, high-quality, etc.)
- Sentences and explanations
- Benefits and drawbacks
- User experience descriptions

EXAMPLES:
❌ WRONG: "Innovatief AI Companion Speelterrein"
✅ CORRECT: "Innovatief AI Companion Playground"

❌ WRONG: "Mijn Maand OurDream AI Testen"
✅ CORRECT: "My Month Testing OurDream AI"

❌ WRONG: "karakter creatie"
✅ CORRECT: "character creation"

Now translate this text:

{text_chunk}"""

    response = anthropic.messages.create(
        model="claude-3-5-sonnet-20241022",
        max_tokens=8000,
        messages=[{"role": "user", "content": prompt}]
    )

    return response.content[0].text.strip()

def chunk_text(text, max_chars=9000):
    """Split text into chunks at paragraph boundaries"""
    if len(text) <= max_chars:
        return [text]

    chunks = []
    current_chunk = ""
    paragraphs = text.split('\n\n')

    for para in paragraphs:
        if len(current_chunk) + len(para) + 2 > max_chars and current_chunk:
            chunks.append(current_chunk.strip())
            current_chunk = para
        else:
            if current_chunk:
                current_chunk += '\n\n' + para
            else:
                current_chunk = para

    if current_chunk:
        chunks.append(current_chunk.strip())

    return chunks

print("🔄 Re-translating OurDream AI with STRICT English term preservation...")
print("=" * 70)

# Fetch EN version
response = requests.get(API_URL, headers=headers)
data = response.json()

en_verdict = None
nl_record_id = None

for record in data['records']:
    fields = record['fields']
    lang = fields.get('language', '')
    slug_field = fields.get('slug (from companion)', [])
    slug = slug_field[0] if isinstance(slug_field, list) and slug_field else ''

    if lang == 'en' and slug == 'ourdream-ai':
        en_verdict = fields.get('my_verdict', '')
    elif lang == 'nl' and slug == 'ourdream-ai':
        nl_record_id = record['id']

if not en_verdict:
    print("❌ EN version not found")
    exit(1)

if not nl_record_id:
    print("❌ NL record not found")
    exit(1)

print(f"📊 EN verdict: {len(en_verdict):,} chars")

# Chunk and translate
chunks = chunk_text(en_verdict, max_chars=9000)
print(f"🔄 Translating {len(chunks)} chunk(s) with STRICT English term rules...\n")

translated_chunks = []
for i, chunk in enumerate(chunks, 1):
    print(f"[{i}/{len(chunks)}] {len(chunk):,} chars... ", end='', flush=True)

    translated = translate_with_claude(chunk)
    print(f"✅ {len(translated):,} chars")

    translated_chunks.append(translated)
    time.sleep(2)

# Combine
full_translation = '\n\n'.join(translated_chunks)
print(f"\n✅ NL verdict: {len(full_translation):,} chars")

# Show preview
print("\n📝 Translation preview:")
print("First 300 chars:")
print(full_translation[:300])
print("\n...")

# Update
print("\n💾 Updating Airtable...")
url = f'{API_URL}/{nl_record_id}'
data = {'fields': {'my_verdict': full_translation}}
response = requests.patch(url, headers=headers, json=data)

if response.status_code == 200:
    print("✅ Updated successfully")
else:
    print(f"❌ Update failed: {response.status_code}")
    print(response.text)

print("=" * 70)
