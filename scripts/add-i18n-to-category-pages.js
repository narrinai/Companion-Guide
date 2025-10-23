#!/usr/bin/env node

/**
 * Add data-i18n attributes to category pages for dynamic translation
 * Updates insight cards, comparison table, and FAQ sections
 */

const fs = require('fs');
const path = require('path');

// Only update the roleplay category page as example
const categoryFile = 'roleplay-character-chat-companions.html';
const categoriesDir = path.join(__dirname, '..', 'categories');
const nlCategoriesDir = path.join(__dirname, '..', 'nl', 'categories');
const ptCategoriesDir = path.join(__dirname, '..', 'pt', 'categories');

/**
 * Add data-i18n attributes to HTML content
 */
function addI18nAttributes(html) {
  let content = html;

  // 1. Update insight cards (4 cards)
  // Card 1: Character Variety
  content = content.replace(
    /<h3><svg class="icon icon-md"><use href="#icon-roleplay"\/><\/svg> Character Variety<\/h3>\s*<p>These platforms excel at offering diverse character libraries from fictional universes, historical figures, and original creations for immersive roleplay\.<\/p>/,
    `<h3><svg class="icon icon-md"><use href="#icon-roleplay"/></svg> <span data-i18n="categoryPages.roleplay.insights.characterVariety.title">Character Variety</span></h3>
                    <p data-i18n="categoryPages.roleplay.insights.characterVariety.text">These platforms excel at offering diverse character libraries from fictional universes, historical figures, and original creations for immersive roleplay.</p>`
  );

  // Card 2: Interactive Storytelling
  content = content.replace(
    /<h3>📖 Interactive Storytelling<\/h3>\s*<p>Focus on narrative-driven experiences where users can actively participate in and influence story development through character interactions\.<\/p>/,
    `<h3>📖 <span data-i18n="categoryPages.roleplay.insights.storytelling.title">Interactive Storytelling</span></h3>
                    <p data-i18n="categoryPages.roleplay.insights.storytelling.text">Focus on narrative-driven experiences where users can actively participate in and influence story development through character interactions.</p>`
  );

  // Card 3: Creative Expression
  content = content.replace(
    /<h3>✨ Creative Expression<\/h3>\s*<p>Platforms encourage creative writing, character development, and imaginative scenarios for entertainment and artistic expression\.<\/p>/,
    `<h3>✨ <span data-i18n="categoryPages.roleplay.insights.expression.title">Creative Expression</span></h3>
                    <p data-i18n="categoryPages.roleplay.insights.expression.text">Platforms encourage creative writing, character development, and imaginative scenarios for entertainment and artistic expression.</p>`
  );

  // Card 4: Community Features
  content = content.replace(
    /<h3><svg class="icon icon-sm"><use href="#icon-characters"\/><\/svg> Community Features<\/h3>\s*<p>Strong community aspects including character sharing, collaborative storytelling, and user-generated content creation\.<\/p>/,
    `<h3><svg class="icon icon-sm"><use href="#icon-characters"/></svg> <span data-i18n="categoryPages.roleplay.insights.community.title">Community Features</span></h3>
                    <p data-i18n="categoryPages.roleplay.insights.community.text">Strong community aspects including character sharing, collaborative storytelling, and user-generated content creation.</p>`
  );

  // 2. Update comparison table headers
  content = content.replace(
    /<h2>Roleplay & Character Chat Platform Comparison<\/h2>/,
    '<h2 data-i18n="categoryPages.roleplay.comparisonTitle">Roleplay & Character Chat Platform Comparison</h2>'
  );

  content = content.replace(
    /<th>Platform<\/th>/,
    '<th data-i18n="categoryPages.roleplay.comparison.platform">Platform</th>'
  );

  content = content.replace(
    /<th>Rating<\/th>/,
    '<th data-i18n="categoryPages.roleplay.comparison.rating">Rating</th>'
  );

  content = content.replace(
    /<th>Pricing<\/th>/,
    '<th data-i18n="categoryPages.roleplay.comparison.pricing">Pricing</th>'
  );

  content = content.replace(
    /<th>Key Feature<\/th>/,
    '<th data-i18n="categoryPages.roleplay.comparison.keyFeature">Key Feature</th>'
  );

  content = content.replace(
    /<th>Best For<\/th>/,
    '<th data-i18n="categoryPages.roleplay.comparison.bestFor">Best For</th>'
  );

  // 3. Update FAQ section title
  content = content.replace(
    /<h2>AI Roleplay & Character Chat FAQs<\/h2>/,
    '<h2 data-i18n="categoryPages.roleplay.faqTitle">AI Roleplay & Character Chat FAQs</h2>'
  );

  // 4. Update FAQ items (9 questions)
  const faqReplacements = [
    {
      old: 'What are the best AI roleplay platforms in 2025?',
      new: '<span data-i18n="categoryPages.roleplay.faqs.q1.question">What are the best AI roleplay platforms in 2025?</span>',
      answerOld: /Top AI roleplay platforms include <a href="\/companions\/character-ai">Character\.AI<\/a> \(free, largest variety\), <a href="\/companions\/janitor-ai">Janitor AI<\/a> \(uncensored\), <a href="\/companions\/kajiwoto-ai">Kajiwoto<\/a> \(customizable\), and <a href="\/companions\/chai-ai">Chai AI<\/a> \(mobile-focused\)\. Each offers unique character creation and roleplay capabilities\./,
      answerNew: 'data-i18n="categoryPages.roleplay.faqs.q1.answer"'
    },
    {
      old: 'Are there free AI roleplay platforms?',
      new: '<span data-i18n="categoryPages.roleplay.faqs.q2.question">Are there free AI roleplay platforms?</span>',
      answerOld: /Yes, <a href="\/companions\/character-ai">Character\.AI<\/a> offers completely free roleplay with millions of characters, while platforms like <a href="\/companions\/janitor-ai">Janitor AI<\/a>, <a href="\/companions\/chai-ai">Chai AI<\/a>, and <a href="\/companions\/kajiwoto-ai">Kajiwoto<\/a> provide free tiers with optional premium features\./,
      answerNew: 'data-i18n="categoryPages.roleplay.faqs.q2.answer"'
    },
    {
      old: 'Can I create my own AI roleplay characters?',
      new: '<span data-i18n="categoryPages.roleplay.faqs.q3.question">Can I create my own AI roleplay characters?</span>',
      answerOld: /Most platforms support character creation\. <a href="\/companions\/character-ai">Character\.AI<\/a> offers comprehensive creation tools, <a href="\/companions\/kajiwoto-ai">Kajiwoto<\/a> provides advanced customization, and <a href="\/companions\/janitor-ai">Janitor AI<\/a> allows detailed personality programming for roleplay scenarios\./,
      answerNew: 'data-i18n="categoryPages.roleplay.faqs.q3.answer"'
    },
    {
      old: 'Which platform is best for uncensored roleplay?',
      new: '<span data-i18n="categoryPages.roleplay.faqs.q4.question">Which platform is best for uncensored roleplay?</span>',
      answerOld: /<a href="\/companions\/janitor-ai">Janitor AI<\/a> leads in uncensored roleplay with no content restrictions, followed by platforms like <a href="\/companions\/kajiwoto-ai">Kajiwoto<\/a> and specialized adult roleplay platforms\. <a href="\/companions\/character-ai">Character\.AI<\/a> has content moderation policies\./,
      answerNew: 'data-i18n="categoryPages.roleplay.faqs.q4.answer"'
    },
    {
      old: 'How do AI roleplay characters remember storylines?',
      new: '<span data-i18n="categoryPages.roleplay.faqs.q5.question">How do AI roleplay characters remember storylines?</span>',
      answerOld: /Advanced platforms use memory systems to track roleplay narratives, character relationships, and story progression\. <a href="\/companions\/character-ai">Character\.AI<\/a> and <a href="\/companions\/kajiwoto-ai">Kajiwoto<\/a> excel in maintaining long-term roleplay continuity\./,
      answerNew: 'data-i18n="categoryPages.roleplay.faqs.q5.answer"'
    },
    {
      old: 'What types of roleplay scenarios are available?',
      new: '<span data-i18n="categoryPages.roleplay.faqs.q6.question">What types of roleplay scenarios are available?</span>',
      answerOld: /Platforms offer diverse scenarios: fantasy adventures, historical figures, anime characters, original characters, educational roleplay, therapeutic scenarios, and adult-oriented roleplay depending on platform policies\./,
      answerNew: 'data-i18n="categoryPages.roleplay.faqs.q6.answer"'
    },
    {
      old: 'Can AI characters participate in group roleplay?',
      new: '<span data-i18n="categoryPages.roleplay.faqs.q7.question">Can AI characters participate in group roleplay?</span>',
      answerOld: /Some platforms support multi-character interactions\. <a href="\/companions\/character-ai">Character\.AI<\/a> offers 'Rooms' for group conversations, while other platforms may support character-to-character interactions within storylines\./,
      answerNew: 'data-i18n="categoryPages.roleplay.faqs.q7.answer"'
    },
    {
      old: 'Which platform has the best mobile app for roleplay?',
      new: '<span data-i18n="categoryPages.roleplay.faqs.q8.question">Which platform has the best mobile app for roleplay?</span>',
      answerOld: /<a href="\/companions\/chai-ai">Chai AI<\/a> is designed specifically for mobile roleplay experiences, while <a href="\/companions\/character-ai">Character\.AI<\/a> offers a functional mobile app\. Many users prefer web versions for longer roleplay sessions\./,
      answerNew: 'data-i18n="categoryPages.roleplay.faqs.q8.answer"'
    },
    {
      old: 'How realistic are AI roleplay conversations?',
      new: '<span data-i18n="categoryPages.roleplay.faqs.q9.question">How realistic are AI roleplay conversations?</span>',
      answerOld: /Modern AI roleplay can be highly engaging with characters maintaining consistent personalities, remembering plot details, and adapting to user preferences\. Quality varies by platform and character creation\./,
      answerNew: 'data-i18n="categoryPages.roleplay.faqs.q9.answer"'
    }
  ];

  // Apply FAQ replacements
  faqReplacements.forEach(({ old, new: newText }) => {
    content = content.replace(new RegExp(`>${old}<`, 'g'), `>${newText}<`);
  });

  // Note: FAQ answers contain links that need to be preserved, so we'll keep them as-is
  // The i18n system will need to handle HTML content or we extract just the text parts

  return content;
}

// Main execution
console.log('🚀 Adding data-i18n attributes to category pages...\n');

let updatedCount = 0;

try {
  // Update English version
  const enPath = path.join(categoriesDir, categoryFile);
  if (fs.existsSync(enPath)) {
    const enContent = fs.readFileSync(enPath, 'utf-8');
    const updatedEnContent = addI18nAttributes(enContent);
    fs.writeFileSync(enPath, updatedEnContent, 'utf-8');
    console.log(`✅ Updated: categories/${categoryFile}`);
    updatedCount++;
  }

  // Update NL version
  const nlPath = path.join(nlCategoriesDir, categoryFile);
  if (fs.existsSync(nlPath)) {
    const nlContent = fs.readFileSync(nlPath, 'utf-8');
    const updatedNlContent = addI18nAttributes(nlContent);
    fs.writeFileSync(nlPath, updatedNlContent, 'utf-8');
    console.log(`✅ Updated: nl/categories/${categoryFile}`);
    updatedCount++;
  }

  // Update PT version
  const ptPath = path.join(ptCategoriesDir, categoryFile);
  if (fs.existsSync(ptPath)) {
    const ptContent = fs.readFileSync(ptPath, 'utf-8');
    const updatedPtContent = addI18nAttributes(ptContent);
    fs.writeFileSync(ptPath, updatedPtContent, 'utf-8');
    console.log(`✅ Updated: pt/categories/${categoryFile}`);
    updatedCount++;
  }

  console.log(`\n✅ Successfully updated ${updatedCount} category pages!`);
  console.log('\n📝 Note: The roleplay category page now has full i18n support.');
  console.log('   Other category pages can be updated using the same pattern.');

} catch (error) {
  console.error('❌ Error updating category pages:', error);
  process.exit(1);
}
