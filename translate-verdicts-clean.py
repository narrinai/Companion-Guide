"""Clean batch translation of NL my_verdict fields - removes instruction text"""
import os, requests, time, json, re
from anthropic import Anthropic

AIRTABLE_TOKEN = os.getenv('AIRTABLE_TOKEN_CG')
AIRTABLE_BASE_ID = os.getenv('AIRTABLE_BASE_ID_CG')
ANTHROPIC_API_KEY = os.getenv('ANTHROPIC_API_KEY')

API_URL = f'https://api.airtable.com/v0/{AIRTABLE_BASE_ID}/Companion_Translations'
headers = {'Authorization': f'Bearer {AIRTABLE_TOKEN}', 'Content-Type': 'application/json'}

anthropic = Anthropic(api_key=ANTHROPIC_API_KEY)

# Load list of records to translate
with open('/tmp/nl_verdicts_to_translate.json') as f:
    to_translate = json.load(f)

def clean_translation(text):
    """Remove Claude's instruction/meta text from translation"""
    
    # Remove common instruction phrases
    patterns_to_remove = [
        r"Here's the Dutch translation.*?:\s*\n*",
        r"Here is the Dutch translation.*?:\s*\n*",
        r"Hier is de Nederlandse vertaling.*?:\s*\n*",
        r"\[Note:.*?\]",
        r"\[Continue.*?\]",
        r"\[Would you like.*?\]",
        r"\[Bericht me.*?\]",
        r"Note: Would you like.*",
        r"Would you like me to continue.*",
        r"I can do it in parts if you prefer.*",
        r"Due to length limitations.*",
        r"I've shown.*example.*",
        r"Continued translation follows.*",
    ]
    
    cleaned = text
    for pattern in patterns_to_remove:
        cleaned = re.sub(pattern, '', cleaned, flags=re.IGNORECASE | re.DOTALL)
    
    # Remove multiple consecutive newlines
    cleaned = re.sub(r'\n{3,}', '\n\n', cleaned)
    
    # Trim whitespace
    cleaned = cleaned.strip()
    
    return cleaned

print(f"🚀 Starting CLEAN batch translation of {len(to_translate)} NL my_verdict fields...")
print("=" * 70)

updated = 0
skipped = 0
errors = 0

for i, (slug, name, nl_record_id) in enumerate(to_translate, 1):
    print(f"\n[{i}/{len(to_translate)}] 📝 {name} ({slug})")
    
    # Get EN verdict
    try:
        response_en = requests.get(API_URL, headers=headers, params={
            'filterByFormula': f'AND({{language}}="en", {{slug (from companion)}}="{slug}")',
            'maxRecords': 1
        })
        en_data = response_en.json()
        
        if not en_data.get('records'):
            print(f"   ⏭️  No EN record found - skipping")
            skipped += 1
            continue
        
        english_verdict = en_data['records'][0]['fields'].get('my_verdict', '')
        
        if not english_verdict or len(english_verdict) < 100:
            print(f"   ⏭️  EN verdict too short - skipping")
            skipped += 1
            continue
        
        print(f"   📊 EN: {len(english_verdict)} chars")
        
        # Split into chunks
        chunks = []
        if len(english_verdict) <= 10000:
            chunks = [english_verdict]
        else:
            paragraphs = english_verdict.split('\n\n')
            current = ""
            for para in paragraphs:
                if len(current) + len(para) > 10000:
                    if current: chunks.append(current)
                    current = para
                else:
                    current += ("\n\n" if current else "") + para
            if current: chunks.append(current)
        
        print(f"   🔄 Translating {len(chunks)} chunk(s)...")
        
        # Translate each chunk
        translated_chunks = []
        
        for chunk_i, chunk in enumerate(chunks, 1):
            print(f"      [{chunk_i}/{len(chunks)}] {len(chunk)} chars... ", end="", flush=True)
            
            # More explicit prompt to avoid meta-commentary
            prompt = f"""Vertaal deze Engelse tekst naar Nederlands. Gebruik ALLEEN de vertaling in je antwoord, GEEN uitleg, GEEN notities, GEEN vragen.

REGELS:
- Behoud Engelse AI-termen: AI companion, AI girlfriend, NSFW, roleplay, chat
- Vertaal de rest natuurlijk naar Nederlands
- Behoud alle opmaak en structuur
- GEEN toevoegingen zoals "Hier is de vertaling" of "[Note: ...]"
- ALLEEN de pure Nederlandse vertaling

Tekst om te vertalen:

{chunk}

Nederlandse vertaling:"""

            try:
                response = anthropic.messages.create(
                    model="claude-3-5-sonnet-20241022",
                    max_tokens=8000,
                    messages=[{"role": "user", "content": prompt}]
                )
                
                dutch_chunk = response.content[0].text.strip()
                
                # Clean up any instruction text
                dutch_chunk = clean_translation(dutch_chunk)
                
                translated_chunks.append(dutch_chunk)
                print(f"✅ {len(dutch_chunk)} chars")
                
                time.sleep(2)  # Rate limiting
                
            except Exception as e:
                print(f"❌ {str(e)[:50]}")
                errors += 1
                break
        
        if len(translated_chunks) != len(chunks):
            print(f"   ❌ Incomplete - skipping")
            errors += 1
            continue
        
        # Combine chunks
        full_translation = '\n\n'.join(translated_chunks)
        
        # Final cleanup
        full_translation = clean_translation(full_translation)
        
        print(f"   ✅ NL: {len(full_translation)} chars")
        
        # Verify translation looks good (basic sanity check)
        if len(full_translation) < len(english_verdict) * 0.3:
            print(f"   ⚠️  WARNING: Translation seems too short, skipping update")
            errors += 1
            continue
        
        # Update Airtable
        url = f'{API_URL}/{nl_record_id}'
        update_response = requests.patch(url, headers=headers, json={
            'fields': {'my_verdict': full_translation}
        })
        
        if update_response.status_code == 200:
            print(f"   💾 Updated")
            updated += 1
        else:
            print(f"   ❌ Update failed: {update_response.status_code}")
            errors += 1
        
    except Exception as e:
        print(f"   ❌ Error: {str(e)[:80]}")
        errors += 1

print("\n" + "=" * 70)
print(f"✅ Clean translation completed!")
print(f"   Updated: {updated}")
print(f"   Skipped: {skipped}")
print(f"   Errors:  {errors}")
print(f"   Total:   {len(to_translate)}")
print("=" * 70)

