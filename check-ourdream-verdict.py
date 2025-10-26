import os, requests

AIRTABLE_TOKEN = os.getenv('AIRTABLE_TOKEN_CG')
AIRTABLE_BASE_ID = os.getenv('AIRTABLE_BASE_ID_CG')
API_URL = f'https://api.airtable.com/v0/{AIRTABLE_BASE_ID}/Companion_Translations'
headers = {'Authorization': f'Bearer {AIRTABLE_TOKEN}'}

response = requests.get(f'{API_URL}?filterByFormula=AND({{language}}="nl", FIND("ourdream", {{slug (from companion)}}))&maxRecords=1', headers=headers)
data = response.json()

if data.get('records'):
    verdict = data['records'][0]['fields'].get('my_verdict', '')
    print(f"Character count: {len(verdict)}")
    print(f"\nFirst 500 chars:\n{verdict[:500]}")
    print(f"\n...\n\nLast 500 chars:\n{verdict[-500:]}")
    
    # Check if it ends mid-sentence
    if not verdict.endswith(('.', '!', '?', '"')):
        print(f"\n⚠️ WARNING: Verdict appears incomplete (doesn't end with punctuation)")
        print(f"Last 100 characters: {verdict[-100:]}")
