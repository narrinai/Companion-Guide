# Category Pages Translation - Implementatie Uitleg

## Vraag
> **"en de losse category pages, hoe worden die vertaald? En zijn daar nog velden voor nodig oid?"**

## Antwoord: Optie 2 - Volledig Dynamisch via i18n.js ✅

---

## Hoe Category Pages Nu Werken

### Hybride Aanpak: Statische HTML + Dynamische i18n

**1. Dynamisch via `data-i18n` (✅ Geïmplementeerd):**
   - Hero titel en beschrijving
   - Breadcrumb
   - Insight cards (titel + tekst)
   - Comparison table headers
   - FAQ titel

**2. Dynamisch via Airtable API (✅ Werkt Automatisch):**
   - Companion cards in de grid
   - Companion data (beschrijving, pricing, ratings)

**3. FAQ Content (⚠️ Deels - zie uitleg hieronder):**
   - FAQ vragen: via `data-i18n` ✅
   - FAQ antwoorden: **bevatten HTML links** → blijven Engels (of handmatig vertalen)

---

## Wat Is Er Gedaan?

### 1. JSON Files Uitgebreid

**`/locales/nl.json` en `/locales/pt.json`** uitgebreid met:

```json
"categoryPages": {
  "roleplay": {
    "title": "...",
    "description": "...",
    "insights": {
      "characterVariety": {
        "title": "Karaktervariëteit",
        "text": "Deze platforms excelleren..."
      },
      "storytelling": {...},
      "expression": {...},
      "community": {...}
    },
    "comparison": {
      "platform": "Platform",
      "rating": "Beoordeling",
      "pricing": "Prijzen",
      "keyFeature": "Belangrijkste Functie",
      "bestFor": "Beste Voor"
    },
    "faqTitle": "AI Roleplay & Character Chat FAQ's",
    "faqs": {
      "q1": {
        "question": "Wat zijn de beste AI roleplay platforms in 2025?",
        "answer": "Top AI roleplay platforms zijn..."
      }
      // ... q2 t/m q9
    }
  }
}
```

### 2. HTML Aangepast met `data-i18n` Attributen

**Voor:**
```html
<h3>Character Variety</h3>
<p>These platforms excel at offering...</p>
```

**Na:**
```html
<h3><span data-i18n="categoryPages.roleplay.insights.characterVariety.title">Character Variety</span></h3>
<p data-i18n="categoryPages.roleplay.insights.characterVariety.text">These platforms excel at offering...</p>
```

**Toegepast op:**
- ✅ 4 insight cards (titel + tekst)
- ✅ Comparison table headers (5 kolommen)
- ✅ FAQ titel
- ✅ FAQ vragen (9 vragen)

### 3. Script Gemaakt: `add-i18n-to-category-pages.js`

Automatisch `data-i18n` attributen toevoegen aan:
- `/categories/roleplay-character-chat-companions.html`
- `/nl/categories/roleplay-character-chat-companions.html`
- `/pt/categories/roleplay-character-chat-companions.html`

---

## Hoe Het Werkt (Runtime)

### Stap 1: Taaldetectie
```
URL: /nl/categories/roleplay-character-chat-companions
→ i18n.detectLanguage() → 'nl'
```

### Stap 2: JSON Laden
```
i18n.loadTranslations('nl')
→ Laadt /locales/nl.json
```

### Stap 3: DOM Update
```
i18n.applyTranslations()
→ Zoekt alle [data-i18n] attributen
→ Vervangt tekst met nl.json waarden
```

**Resultaat:**
```html
<!-- VOOR (Engels HTML): -->
<h3><span data-i18n="categoryPages.roleplay.insights.characterVariety.title">Character Variety</span></h3>

<!-- NA (Runtime in browser): -->
<h3><span>Karaktervariëteit</span></h3>
```

---

## Wat Werkt Nu?

### ✅ Volledig Vertaald (Roleplay Category):

| Element | Engels | Nederlands | Português |
|---------|--------|------------|-----------|
| Hero titel | ✅ | ✅ (via i18n) | ✅ (via i18n) |
| Hero beschrijving | ✅ | ✅ (via i18n) | ✅ (via i18n) |
| Breadcrumb | ✅ | ✅ (via i18n) | ✅ (via i18n) |
| Insight card 1 | ✅ | ✅ (via i18n) | ✅ (via i18n) |
| Insight card 2 | ✅ | ✅ (via i18n) | ✅ (via i18n) |
| Insight card 3 | ✅ | ✅ (via i18n) | ✅ (via i18n) |
| Insight card 4 | ✅ | ✅ (via i18n) | ✅ (via i18n) |
| Comparison table headers | ✅ | ✅ (via i18n) | ✅ (via i18n) |
| FAQ titel | ✅ | ✅ (via i18n) | ✅ (via i18n) |
| FAQ vragen (9x) | ✅ | ✅ (via i18n) | ✅ (via i18n) |
| Companion cards | ✅ | ✅ (via Airtable) | ✅ (via Airtable) |

### ⚠️ Deels Vertaald:

**FAQ Antwoorden:**
- Bevatten `<a href="/companions/...">` links
- i18n.js vervangt alleen text nodes, niet HTML
- **Opties:**
  1. Laten zoals het is (Engels) → Gebruikers begrijpen het meestal wel
  2. Handmatig vertalen in elk HTML bestand
  3. i18n.js uitbreiden om HTML content te ondersteunen

**Huidige Keuze:** Laten zoals het is (FAQ antwoorden blijven Engels)
**Reden:** Companion namen blijven toch in het Engels (Character.AI, Janitor AI, etc.)

---

## Andere Category Pages?

**Status:** Alleen **roleplay-character-chat-companions.html** is volledig geïmplementeerd als voorbeeld.

**Voor andere categorieën:**
1. Voeg content toe aan `nl.json` en `pt.json` onder `categoryPages.{categoryName}`
2. Pas het script aan om andere category files te updaten
3. Run het script

**Voorbeeld Pattern:**
```json
"categoryPages": {
  "roleplay": { ... },  // ✅ Done
  "aiGirlfriend": { ... },  // ❌ To do
  "nsfw": { ... },  // ❌ To do
  // etc.
}
```

---

## Voordelen van Deze Aanpak

1. **✅ Geen Airtable velden nodig** - Alles via JSON files
2. **✅ Volledig dynamisch** - Werkt automatisch in EN/NL/PT
3. **✅ Makkelijk onderhoudbaar** - Eén plek voor vertalingen
4. **✅ Herbruikbaar** - Zelfde pattern voor alle 25 categorieën
5. **✅ SEO-vriendelijk** - Elke taal heeft eigen URL

---

## Nadelen / Limitaties

1. **⚠️ FAQ antwoorden met HTML links** - Blijven Engels of handmatig vertalen
2. **⚠️ Andere 24 categorieën** - Moeten nog gedaan worden (zelfde pattern)
3. **⚠️ JSON files groeien** - 25 categorieën × 3 talen = veel content

---

## Volgende Stappen (Optioneel)

Als je alle 25 categorieën wilt vertalen:

### Optie A: Script Generaliseren
Maak een script dat:
1. Alle 25 category pages leest
2. Automatisch i18n keys genereert
3. Claude API gebruikt om te vertalen
4. JSON files update
5. HTML update met data-i18n attributen

### Optie B: Prioriteren
Vertaal alleen de **top 5-10 populairste categorieën**:
- Roleplay & Character Chat ✅
- AI Girlfriend
- NSFW
- Adult Image Generation
- Learning

Rest blijft Engels.

---

## Test Resultaat

**Roleplay category page:**
- ✅ `/categories/roleplay-character-chat-companions` - Engels
- ✅ `/nl/categories/roleplay-character-chat-companions` - Nederlands (hero, insights, table, FAQ vragen)
- ✅ `/pt/categories/roleplay-character-chat-companions` - Português (hero, insights, table, FAQ vragen)
- ✅ Companion cards - Dynamisch in alle 3 talen via Airtable API

---

## Samenvatting

**Vraag:** "Hoe worden de losse category pages vertaald? En zijn daar nog velden voor nodig oid?"

**Antwoord:**
- ✅ **Geen extra Airtable velden nodig**
- ✅ **Volledig via i18n.js + JSON files**
- ✅ **Companion cards automatisch via bestaande Airtable setup**
- ✅ **Roleplay category volledig geïmplementeerd als voorbeeld**
- ⚠️ **FAQ antwoorden blijven Engels (bevatten HTML links)**
- 📝 **Andere 24 categorieën kunnen zelfde pattern volgen**

**Resultaat:** Category pages werken nu **volledig dynamisch** in EN/NL/PT zonder extra database velden!
