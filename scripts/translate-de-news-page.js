const fs = require('fs');
const path = require('path');

const newsFile = 'de/news.html';
const filePath = path.join('/Users/sebastiaansmits/Documents/AI-Companion-Reviews', newsFile);

console.log(`Translating ${newsFile} to German\n`);

let content = fs.readFileSync(filePath, 'utf8');

// Replace all insight cards with data-i18n attributes
const replacements = [
    // Header already has data-i18n, just verify the text is correct
    {
        from: /<h1 data-i18n="news\.title">AI Chat & Companion Platform Nieuws<\/h1>/g,
        to: '<h1 data-i18n="news.title">KI-Chat & Companion-Plattform News</h1>'
    },
    {
        from: /<p data-i18n="news\.subtitle">Blijf op de hoogte van de laatste ontwikkelingen in AI chat platforms en AI companion platforms, industrie analyse en markttrends<\/p>/g,
        to: '<p data-i18n="news.subtitle">Bleiben Sie auf dem Laufenden über die neuesten Entwicklungen bei KI-Chat-Plattformen und KI-Companion-Plattformen, Branchenanalysen und Markttrends</p>'
    },
    // Latest News section
    {
        from: /<h2 data-i18n="news\.latestNews">Laatste AI Chat & Companion Platform Nieuws<\/h2>/g,
        to: '<h2 data-i18n="news.latestNews">Neueste KI-Chat & Companion-Plattform News</h2>'
    },
    {
        from: /<p data-i18n="news\.recentDevelopments">Recente ontwikkelingen en industrie updates<\/p>/g,
        to: '<p data-i18n="news.recentDevelopments">Aktuelle Entwicklungen und Branchenupdates</p>'
    },
    // Key Findings section
    {
        from: /<h2 data-i18n="news\.keyFindings">🔍 Belangrijkste Industrie Bevindingen<\/h2>/g,
        to: '<h2 data-i18n="news.keyFindings">🔍 Wichtigste Branchenerkenntnisse</h2>'
    },
    {
        from: /<p data-i18n="news\.keyFindingsDesc">Belangrijke inzichten over de ontwikkeling van AI companion platforms<\/p>/g,
        to: '<p data-i18n="news.keyFindingsDesc">Wichtige Einblicke in die Entwicklung von KI-Companion-Plattformen</p>'
    },
    // Market Analysis section
    {
        from: /<h2 data-i18n="news\.marketAnalysis">📊 Marktanalyse & Trends<\/h2>/g,
        to: '<h2 data-i18n="news.marketAnalysis">📊 Marktanalyse & Trends</h2>'
    },
    {
        from: /<p data-i18n="news\.marketAnalysisDesc">Belangrijke inzichten uit de AI companion platform industrie<\/p>/g,
        to: '<p data-i18n="news.marketAnalysisDesc">Wichtige Einblicke aus der KI-Companion-Plattform-Branche</p>'
    },
    // Insight cards - Market Growth
    {
        from: /<h3>📈 Market Growth<\/h3>/g,
        to: '<h3 data-i18n="news.insights.marketGrowth">📈 Marktwachstum</h3>'
    },
    {
        from: /<p>Entertainment platforms dominate the market, with revenue per download increasing from \$0\.52 to \$1\.18<\/p>/g,
        to: '<p data-i18n="news.insights.marketGrowthDesc">Unterhaltungsplattformen dominieren den Markt, wobei der Umsatz pro Download von $0,52 auf $1,18 gestiegen ist</p>'
    },
    // Pricing Models
    {
        from: /<h3>💰 Pricing Models<\/h3>/g,
        to: '<h3 data-i18n="news.insights.pricingModels">💰 Preismodelle</h3>'
    },
    {
        from: /<p>Freemium model is standard across AI companion platforms, with premium tiers ranging €5-50\/month<\/p>/g,
        to: '<p data-i18n="news.insights.pricingModelsDesc">Freemium-Modell ist Standard bei KI-Companion-Plattformen, mit Premium-Stufen von €5-50/Monat</p>'
    },
    // Safety Concerns
    {
        from: /<h3>⚠️ Safety Concerns<\/h3>/g,
        to: '<h3 data-i18n="news.insights.safetyConcerns">⚠️ Sicherheitsbedenken</h3>'
    },
    {
        from: /<p>Increasing legal scrutiny over child safety and content moderation in AI companion platforms<\/p>/g,
        to: '<p data-i18n="news.insights.safetyConcernsDesc">Zunehmende rechtliche Prüfung der Kindersicherheit und Content-Moderation bei KI-Companion-Plattformen</p>'
    },
    // Memory Systems
    {
        from: /<h3>🧠 Memory Systems<\/h3>/g,
        to: '<h3 data-i18n="news.insights.memorySystems">🧠 Speichersysteme</h3>'
    },
    {
        from: /<p>Advanced memory capabilities are becoming the biggest differentiator between AI companion platforms<\/p>/g,
        to: '<p data-i18n="news.insights.memorySystemsDesc">Fortgeschrittene Speicherfähigkeiten werden zum größten Unterscheidungsmerkmal zwischen KI-Companion-Plattformen</p>'
    },
    // Demographics
    {
        from: /<h3>🌍 Demographics<\/h3>/g,
        to: '<h3 data-i18n="news.insights.demographics">🌍 Demografie</h3>'
    },
    {
        from: /<p>65\.4% of users are aged 18-24, with growing adoption across diverse age groups and genders<\/p>/g,
        to: '<p data-i18n="news.insights.demographicsDesc">65,4% der Nutzer sind zwischen 18 und 24 Jahre alt, mit wachsender Akzeptanz in verschiedenen Altersgruppen und Geschlechtern</p>'
    },
    // Global Distribution
    {
        from: /<h3>🌍 Global Distribution<\/h3>/g,
        to: '<h3 data-i18n="news.insights.globalDistribution">🌍 Globale Verteilung</h3>'
    },
    {
        from: /<p>US 42%, Europe 28%, Asia 23%, Rest of World 7% - North America leads AI companion adoption<\/p>/g,
        to: '<p data-i18n="news.insights.globalDistributionDesc">USA 42%, Europa 28%, Asien 23%, Rest der Welt 7% - Nordamerika führt bei der KI-Companion-Akzeptanz</p>'
    },
    // Stat labels
    {
        from: /<div class="stat-label">Expected market size by 2031<\/div>/g,
        to: '<div class="stat-label" data-i18n="news.stats.expectedMarketSize">Erwartete Marktgröße bis 2031</div>'
    },
    {
        from: /<div class="stat-label">Revenue-generating AI companion apps<\/div>/g,
        to: '<div class="stat-label" data-i18n="news.stats.revenueGeneratingApps">Umsatzgenerierende KI-Companion-Apps</div>'
    },
    {
        from: /<div class="stat-label">Revenue in first half of 2025<\/div>/g,
        to: '<div class="stat-label" data-i18n="news.stats.revenueFirstHalf">Umsatz in der ersten Jahreshälfte 2025</div>'
    },
    {
        from: /<div class="stat-label">Users aged 18-24<\/div>/g,
        to: '<div class="stat-label" data-i18n="news.stats.usersAged18to24">Nutzer im Alter von 18-24 Jahren</div>'
    }
];

let changesMade = 0;

replacements.forEach(replacement => {
    const matches = content.match(replacement.from);
    if (matches) {
        console.log(`✓ Found ${matches.length}x: ${replacement.from.source.slice(0, 60)}...`);
        content = content.replace(replacement.from, replacement.to);
        changesMade += matches.length;
    } else {
        console.log(`✗ Not found: ${replacement.from.source.slice(0, 60)}...`);
    }
});

fs.writeFileSync(filePath, content, 'utf8');

console.log(`\n✅ Updated ${newsFile} with ${changesMade} translations`);
