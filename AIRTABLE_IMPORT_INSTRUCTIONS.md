# Airtable Import Instructions

## 📊 Import de 32 Companions in Airtable

### Stap 1: Configureer je bestaande Airtable Database

1. Ga naar je bestaande Airtable Base (die je al hebt aangemaakt)
2. Ga naar de tabel die je gebruikt voor companions
3. Voeg de volgende velden toe (als ze nog niet bestaan):

#### Verplichte Velden (exact deze namen):

| Field Name | Field Type | Options |
|------------|------------|---------|
| `name` | Single line text | |
| `slug` | Single line text | |
| `rating` | Number | Precision: 0.1 |
| `description` | Long text | |
| `short_description` | Long text | |
| `website_url` | URL | |
| `affiliate_url` | URL | |
| `image_url` | URL | |
| `categories` | Multiple select | Options: ai-girlfriend, roleplaying, nsfw, video, wellness, learning, whatsapp, image-gen |
| `badges` | Multiple select | Options: Leader, Popular, Adult, New, Featured, Top Rated |
| `featured` | Checkbox | |
| `pricing_plans` | Long text | |
| `status` | Single select | Options: Active, Inactive, Draft |

#### Extra informatievelden:
| Field Name | Field Type |
|------------|------------|
| `is_ai_girlfriend` | Checkbox |
| `is_nsfw` | Checkbox |
| `is_free` | Checkbox |
| `min_price` | Number |
| `created_date` | Date |
| `updated_date` | Date |

### Stap 2: Import de Data

**Optie A: JSON Import (aanbevolen)**
1. Gebruik de `airtable_import.json` file
2. Kopieer de records uit het JSON bestand
3. Plak ze in Airtable via de API of import functie

**Optie B: CSV Import**
1. Gebruik de `airtable_import.csv` file (wordt hieronder gegenereerd)
2. Ga naar Airtable > Import > CSV
3. Upload het CSV bestand

### Stap 3: Data Verificatie

Na import controleer:
- ✅ 32 companions geïmporteerd
- ✅ 8 companions met `featured = true`
- ✅ Alle ratings tussen 3.0 - 4.8
- ✅ Pricing plans als JSON string format
- ✅ Categories correct toegewezen
- ✅ Featured companions: Secrets AI, Soulkyn AI, Candy AI, Narrin AI, Hammer AI, Simone, GirlfriendGPT, FantasyGF

### Stap 4: Test de API

1. Ga naar `companionguide.ai/test-airtable.html`
2. Klik "Test API Connection"
3. Controleer of alle 32 companions worden opgehaald
4. Test filters en sorting

## 🔧 Troubleshooting

**"No companions found"**
- Controleer of alle environment variables correct zijn ingesteld
- Controleer of de tabel naam exact "Companions" is
- Controleer of de `status` veld "Active" bevat

**"Schema validation failed"**
- Controleer of alle verplichte velden bestaan in Airtable
- Controleer of veldnamen exact overeenkomen (case-sensitive)

**"API Error"**
- Controleer Airtable API token permissions
- Controleer Base ID en Table ID in Netlify environment variables

## 📋 Featured Companions (featured = true):
1. Secrets AI (4.8★)
2. Soulkyn AI (4.7★)
3. Candy AI (4.5★)
4. Narrin AI (4.6★)
5. Hammer AI (4.7★)
6. Simone (4.6★)
7. GirlfriendGPT (4.6★)
8. FantasyGF (4.2★)

## 💡 Tips:
- Alle image_url paden zijn relatief (/images/logos/...) - deze zullen automatisch worden omgezet naar absolute URLs
- Pricing plans zijn opgeslagen als JSON strings die kunnen worden geparsed
- Categories en badges zijn arrays die automatisch worden samengevoegd
- Min_price wordt automatisch berekend uit pricing plans