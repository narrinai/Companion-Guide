# Generate Companion Pages

Er zijn twee scripts om companion pagina's te genereren:

## 1. Simple Generator (Snelle Template Replace)

**Gebruik:** Snelle pagina generatie met basis template replacements

```bash
node generate-single-companion.js <slug>
```

**Voorbeeld:**
```bash
node generate-single-companion.js ehentai-ai
```

**Voordelen:**
- ✅ Snel (< 1 seconde)
- ✅ Geen API key nodig
- ✅ Betrouwbaar

**Nadelen:**
- ❌ Basis content (gekopieerd van template)
- ❌ Handmatige aanpassingen nodig

---

## 2. Advanced Generator (AI-Generated Content)

**Gebruik:** Complete pagina met unieke, AI-gegenereerde content

```bash
# Zet eerst je API key
export ANTHROPIC_API_KEY="your-api-key-here"

# Genereer pagina
node generate-companion-advanced.js <slug>
```

**Voorbeeld:**
```bash
export ANTHROPIC_API_KEY="sk-ant-..."
node generate-companion-advanced.js ehentai-ai
```

**Voordelen:**
- ✅ Unieke, SEO-geoptimaliseerde content
- ✅ Complete secties (features, pricing, FAQ)
- ✅ Professionele schrijfstijl
- ✅ Gebaseerd op Airtable data + AI research

**Nadelen:**
- ❌ Langzamer (~20-30 seconden)
- ❌ Vereist ANTHROPIC_API_KEY
- ❌ API kosten (~$0.10 per pagina)

---

## Workflow

### Nieuwe Companion Toevoegen

1. **Voeg companion toe in Airtable** via https://companionguide.ai/create-companion.html
   - Vul alle vereiste velden in
   - Selecteer categorieën
   - Voeg pricing plans toe

2. **Genereer pagina lokaal**

   **Optie A: Snelle basis pagina**
   ```bash
   node generate-single-companion.js ehentai-ai
   ```

   **Optie B: AI-gegenereerde pagina (aanbevolen)**
   ```bash
   export ANTHROPIC_API_KEY="your-key"
   node generate-companion-advanced.js ehentai-ai
   ```

3. **Review en test**
   ```bash
   # Open in browser
   open companions/ehentai-ai.html

   # Of start lokale server
   python3 -m http.server 8000
   # Ga naar http://localhost:8000/companions/ehentai-ai
   ```

4. **Commit en deploy**
   ```bash
   git add companions/ehentai-ai.html
   git commit -m "Add eHentai AI companion page"
   git push
   ```

5. **Verify live**
   - Pagina: https://companionguide.ai/companions/ehentai-ai
   - Check dat alle links werken
   - Test op mobile

---

## Troubleshooting

### "Companion not found in Airtable"
- Check dat de slug correct is
- Verify dat status = "Active" in Airtable
- Wacht 1-2 minuten voor cache refresh

### "ANTHROPIC_API_KEY not set"
```bash
# MacOS/Linux
export ANTHROPIC_API_KEY="sk-ant-..."

# Permanent (voeg toe aan ~/.zshrc of ~/.bashrc)
echo 'export ANTHROPIC_API_KEY="sk-ant-..."' >> ~/.zshrc
source ~/.zshrc
```

### "Invalid response from Claude API"
- Check dat API key geldig is
- Verify internet connectie
- Check API rate limits

### Pagina ziet er niet goed uit
- Controleer dat alle SVG icons bestaan in icons.svg
- Check dat CSS en JS paths kloppen
- Verify template structuur is behouden

---

## Files Locations

- **Templates:** `companions/hammer-ai.html` (advanced), `companions/secrets-ai.html` (simple)
- **Generated pages:** `companions/<slug>.html`
- **Scripts:** Root directory
- **Icons:** `icons.svg`

---

## Tips

1. **Gebruik de advanced generator** voor nieuwe companions - de content is veel beter
2. **Review altijd de output** - AI is goed maar niet perfect
3. **Test lokaal eerst** voordat je commit
4. **Check broken links** vooral naar logo images
5. **Verify pricing plans** formatting en data
