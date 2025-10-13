# Dynamic Featured Guides Setup

Dit document legt uit hoe je het dynamische Featured Guides systeem gebruikt met Airtable.

## Stap 1: Airtable Table Aanmaken

Maak in Airtable een nieuwe table aan genaamd **"Articles"** met deze velden:

### Velden:

1. **title** (Single line text)
   - Volledige titel van het artikel
   - Voorbeeld: `"Crushon AI Alternatives Complete Guide 2025"`

2. **slug** (Single line text)
   - URL-vriendelijke versie voor in de link
   - Voorbeeld: `"crushon-ai-alternatives-complete-guide-2025"`

3. **short_title** (Single line text)
   - Korte titel voor in de footer
   - Voorbeeld: `"Crushon AI Alternatives Guide"`

4. **is_featured** (Checkbox)
   - Aan = wordt getoond in footer Featured Guides
   - Uit = wordt niet getoond

5. **featured_order** (Number)
   - Volgorde in de footer (1, 2, 3, etc.)
   - Lagere nummers verschijnen eerst

6. **status** (Single select)
   - Opties: `Active`, `Inactive`
   - Alleen Active articles worden getoond

## Stap 2: Netlify Environment Variable

Voeg in Netlify een nieuwe environment variable toe:

```
AIRTABLE_ARTICLES_TABLE_ID_CG = "tblXXXXXXXXXXXXXX"
```

De Table ID vind je in de Airtable URL:
```
https://airtable.com/appXXXXXX/tblYYYYYY/viwZZZZZ
                              ^^^^^^^^^ = dit is je Table ID
```

## Stap 3: HTML Footer Updaten

Voeg dit toe aan de footer van elke pagina (voor de closing `</body>` tag):

```html
<!-- Load articles.js -->
<script src="/js/articles.js"></script>

<!-- Initialize article manager en load featured articles -->
<script>
document.addEventListener('DOMContentLoaded', async function() {
    if (typeof window.articleManager === 'undefined') {
        window.articleManager = new ArticleManager();
    }

    try {
        await window.articleManager.renderFooterFeaturedArticles('featured-articles-footer');
    } catch (error) {
        console.error('Error loading featured articles:', error);
    }
});
</script>
```

Update ook de Featured Guides sectie in de footer HTML:

```html
<div class="footer-section">
    <h4>Featured Guides</h4>
    <ul id="featured-articles-footer">
        <!-- Dynamic content will be loaded here -->
        <li><a href="/news/crushon-ai-alternatives-complete-guide-2025">Crushon AI Alternatives Guide</a></li>
        <li><a href="/news/spicychat-ai-alternatives-complete-guide-2025">Spicychat AI Alternatives Guide</a></li>
    </ul>
</div>
```

## Stap 4: Airtable Vullen met Articles

Voeg al je bestaande articles toe aan de Articles table:

| title | slug | short_title | is_featured | featured_order | status |
|-------|------|-------------|-------------|----------------|--------|
| Crushon AI Alternatives Complete Guide 2025 | crushon-ai-alternatives-complete-guide-2025 | Crushon AI Alternatives Guide | ✓ | 1 | Active |
| Spicychat AI Alternatives Complete Guide 2025 | spicychat-ai-alternatives-complete-guide-2025 | Spicychat AI Alternatives Guide | ✓ | 2 | Active |
| Soulkyn AI Alternatives Complete Guide 2025 | soulkyn-ai-alternatives-complete-guide-2025 | Soulkyn AI Alternatives Guide | ✓ | 3 | Active |
| Character AI Alternatives Complete Guide 2025 | character-ai-alternatives-complete-guide-2025 | Character AI Alternatives Guide | ✓ | 4 | Active |
| ... | ... | ... | ... | ... | ... |

## Voordelen

✅ **Centraal beheer**: Wijzig featured guides vanuit Airtable zonder code te deployen
✅ **Volgorde aanpassen**: Verander `featured_order` om de volgorde te wijzigen
✅ **On/off schakelen**: Toggle `is_featured` checkbox om guides te tonen/verbergen
✅ **Consistentie**: Alle pagina's laden dezelfde featured guides
✅ **Performance**: Caching in ArticleManager voor snellere laadtijden

## API Endpoints

### Featured articles ophalen
```
GET /.netlify/functions/companionguide-get?table=Articles&featured=true
```

### Alle active articles ophalen
```
GET /.netlify/functions/companionguide-get?table=Articles
```

### Met limiet en custom sortering
```
GET /.netlify/functions/companionguide-get?table=Articles&featured=true&limit=10&sort=featured_order
```

## Testing

1. Vul de Articles table in Airtable
2. Zet environment variable in Netlify
3. Deploy de site
4. Check de footer - articles moeten dynamisch laden
5. Check console voor logs: "✓ Rendered X featured articles in footer"

## Troubleshooting

**Articles laden niet?**
- Check of AIRTABLE_ARTICLES_TABLE_ID_CG correct is ingesteld
- Check console voor errors
- Verify dat articles `status = "Active"` hebben
- Check dat `is_featured` checkbox aangevinkt is

**Verkeerde volgorde?**
- Controleer `featured_order` nummers in Airtable
- Lagere nummers komen eerst

**Sommige articles missen?**
- Check of `status = "Active"`
- Check of `is_featured` checkbox aangevinkt is
- Verify dat `slug` correct is ingevuld
