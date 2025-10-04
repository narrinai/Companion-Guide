# Meta Pixel Events - Tracking Overzicht

## ✅ Geïnstalleerde Events

### 1. **PageView** (Standard Event)
**Status:** ✅ Actief op alle pagina's
- **Wanneer:** Bij elke pagina load
- **Gebruikt voor:** Basic traffic tracking, retargeting audiences
- **Implementatie:** Automatisch in Meta Pixel base code

---

### 2. **ViewContent** (Standard Event)
**Status:** ✅ Nieuw geïmplementeerd
- **Wanneer:**
  - Op companion detail pages (`/companions/*`)
  - Op news/guide artikelen (`/news/*`)
- **Parameters:**
  - `content_name`: Naam van companion/artikel
  - `content_category`: Categorie (AI Companion, Article, etc.)
  - `content_ids`: Array met slug
  - `content_type`: "product" of "article"
- **Gebruikt voor:**
  - Product catalog retargeting
  - Dynamic ads
  - Lookalike audiences based on content interest
- **File:** `/js/meta-companion-tracking.js`

**Voorbeeld:**
```javascript
fbq('track', 'ViewContent', {
    content_name: 'Secrets AI',
    content_category: 'AI Girlfriend',
    content_ids: ['secrets-ai'],
    content_type: 'product'
});
```

---

### 3. **Search** (Standard Event)
**Status:** ✅ Nieuw geïmplementeerd
- **Wanneer:** User voert zoekopdracht uit
- **Parameters:**
  - `search_string`: De zoekterm
  - `content_category`: "AI Companion"
- **Gebruikt voor:**
  - Understanding user intent
  - Search retargeting
  - Product recommendations
- **File:** `/js/meta-companion-tracking.js`

**Voorbeeld:**
```javascript
fbq('track', 'Search', {
    search_string: 'best ai girlfriend',
    content_category: 'AI Companion'
});
```

---

### 4. **Lead** (Standard Event)
**Status:** ✅ Nieuw geïmplementeerd
- **Wanneer:**
  - Contact formulier wordt verzonden
  - Review wordt gesubmit
  - Success page wordt bezocht (`/success`)
- **Parameters:**
  - `content_name`: Type formulier
  - `content_category`: Subject/categorie
  - `status`: "submitted" of "completed"
- **Gebruikt voor:**
  - Lead generation campaigns
  - CRM integration
  - Conversion tracking
- **File:** `/js/meta-form-tracking.js`

**Voorbeeld:**
```javascript
fbq('track', 'Lead', {
    content_name: 'Contact Form',
    content_category: 'partnership',
    status: 'submitted'
});
```

---

### 5. **CompleteRegistration** (Standard Event)
**Status:** ✅ Nieuw geïmplementeerd
- **Wanneer:**
  - Newsletter checkbox wordt aangevinkt in contact form
  - Standalone newsletter signup
- **Parameters:**
  - `content_name`: "Newsletter Signup"
  - `registration_method`: "contact_form" of "newsletter_form"
  - `status`: "subscribed"
- **Gebruikt voor:**
  - Email list building campaigns
  - Registration conversion tracking
  - Lookalike audiences van subscribers
- **File:** `/js/meta-form-tracking.js`

**Voorbeeld:**
```javascript
fbq('track', 'CompleteRegistration', {
    content_name: 'Newsletter Signup',
    registration_method: 'contact_form'
});
```

---

### 6. **CompanionExternalClick** (Custom Event)
**Status:** ✅ Al bestaand (affiliate conversie)
- **Wanneer:** User klikt op "Visit Website" link naar companion platform
- **Parameters:**
  - `companion_name`: Naam van de companion
  - `companion_url`: Externe URL
  - `page_location`: Huidige pagina path
  - `button_type`: Button tekst
  - `companion_slug`: Companion identifier
  - `link_type`: Type link (companion_page, companion_card, etc.)
- **Gebruikt voor:**
  - Affiliate conversion tracking
  - User journey analysis
  - Custom audience creation voor affiliate clickers
- **File:** `/js/meta-companion-tracking.js`

**Voorbeeld:**
```javascript
fbq('trackCustom', 'CompanionExternalClick', {
    companion_name: 'Secrets AI',
    companion_url: 'https://secrets.ai/...',
    page_location: '/companions/secrets-ai',
    button_type: 'Visit Website',
    companion_slug: 'secrets-ai',
    link_type: 'companion_page'
});
```

---

## 📊 Event Overzicht per Pagina Type

### Homepage (`/index.html`)
- ✅ PageView
- ✅ ViewContent (voor featured companions in cards)
- ✅ Search (als search functie bestaat)
- ✅ CompanionExternalClick (bij klik op Visit Website)

### Companion Detail (`/companions/*`)
- ✅ PageView
- ✅ ViewContent (automatisch bij page load)
- ✅ CompanionExternalClick (bij klik op Visit Website)

### News Articles (`/news/*`)
- ✅ PageView
- ✅ ViewContent (automatisch bij page load)
- ✅ CompanionExternalClick (bij klik op links in artikel)

### Contact Page (`/contact.html`)
- ✅ PageView
- ✅ Lead (bij form submit)
- ✅ CompleteRegistration (als newsletter checkbox checked)

### Success Page (`/success.html`)
- ✅ PageView
- ✅ Lead (conversie bevestiging)

---

## 🎯 Gebruik in Facebook Ads Manager

### Custom Audiences (Publiek):
1. **ViewContent - Companion Viewers**: Mensen die specific companion pagina's bekeken
2. **Search - Active Searchers**: Mensen die zochten naar companions
3. **Lead - Form Submitters**: Mensen die contact/review formulier invulden
4. **CompleteRegistration - Newsletter Subscribers**: Email list voor remarketing
5. **CompanionExternalClick - Affiliate Clickers**: Mensen die affiliate links klikten

### Custom Conversions:
Je kunt nu custom conversions maken op basis van:
- **URL-based**: `/success` voor Lead conversions
- **Event-based**: ViewContent + specific `content_ids` voor companion interest
- **Parameter-based**: Lead met `content_category: 'partnership'` voor business leads

### Lookalike Audiences:
Maak lookalike audiences van:
- Mensen die ViewContent events hadden op top-performing companions
- Affiliate clickers (CompanionExternalClick event)
- Newsletter subscribers (CompleteRegistration event)
- Form submitters (Lead event)

### Conversion Optimization:
Optimaliseer je ads voor:
- **ViewContent**: Meer companion page views
- **Lead**: Meer contact form submissions
- **CompleteRegistration**: Meer newsletter signups
- **CompanionExternalClick**: Meer affiliate clicks

---

## 🔧 Testing & Validatie

### Facebook Events Manager:
1. Ga naar Events Manager
2. Selecteer je Pixel (1384707780100464)
3. Klik op "Test Events" tab
4. Browse je website en check of events binnenkomen

### Browser Console:
Alle events loggen naar console met prefix: `Meta Pixel: [EventName] tracked`

### Chrome Extension:
Installeer "Meta Pixel Helper" Chrome extension voor real-time event validation

---

## 📈 Volgende Stappen (Optioneel)

### Events die je nog KUNT toevoegen:
1. **AddToWishlist**: Als je een favorites/wishlist functie toevoegt
2. **Purchase**: Als je ooit direct sales hebt (niet affiliate)
3. **Contact**: Alternative voor Lead (deprecated maar soms nog gebruikt)
4. **ViewCategory**: Bij categorie pagina views
5. **Subscribe**: Alternative voor newsletter signup

### Enhanced Parameters:
- **Value**: Geschatte waarde per affiliate click
- **Currency**: USD voor value optimization
- **predicted_ltv**: Lifetime value van user

---

## 📝 Notes

- Alle Standard Events ondersteunen **Conversion API** voor server-side tracking
- Events worden ook gebruikt voor **iOS 14+ tracking** via Aggregated Event Measurement
- Custom Events (CompanionExternalClick) kunnen NIET gebruikt worden voor ad optimization, alleen voor audiences
- Parameters moeten **geen spaties** bevatten in key names voor audience filtering

---

Laatste update: 2025-10-04
