const Airtable = require('airtable');

// Configuration
const AIRTABLE_TOKEN = process.env.AIRTABLE_TOKEN_CG;
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID_CG;
const COMPANIONS_TABLE_ID = process.env.AIRTABLE_TABLE_ID_CG;
const TRANSLATIONS_TABLE_ID = process.env.AIRTABLE_TRANSLATIONS_TABLE_ID_CG;

if (!AIRTABLE_TOKEN || !AIRTABLE_BASE_ID || !COMPANIONS_TABLE_ID || !TRANSLATIONS_TABLE_ID) {
  console.error('❌ Missing required environment variables');
  console.error('Required: AIRTABLE_TOKEN_CG, AIRTABLE_BASE_ID_CG, AIRTABLE_TABLE_ID_CG, AIRTABLE_TRANSLATIONS_TABLE_ID_CG');
  process.exit(1);
}

const base = new Airtable({apiKey: AIRTABLE_TOKEN}).base(AIRTABLE_BASE_ID);

// Dutch translations for companions
const dutchTranslations = {
  'secrets-ai': {
    tagline: 'Premium AI Companion met video generatie en geen censuur',
    best_for: 'Video generatie, NSFW content en geavanceerde AI gesprekken',
    description: 'Secrets AI is een premium AI companion platform dat zich onderscheidt door innovatieve video generatie en volledig ongecensureerde gesprekken. Perfect voor gebruikers die op zoek zijn naar een geavanceerde virtuele partner.'
  },
  'dream-companion': {
    tagline: 'De ultieme AI companion met video en spraak',
    best_for: 'Video gesprekken, spraakberichten en realistische interacties',
    description: 'Dream Companion biedt de meest geavanceerde AI companion ervaring met video generatie, spraakberichten en uitzonderlijk realistische gesprekken.'
  },
  'candy-ai': {
    tagline: 'Populaire AI girlfriend platform met afbeelding generatie',
    best_for: 'AI girlfriends, afbeelding generatie en romantische gesprekken',
    description: 'Candy AI is een van de meest populaire AI girlfriend platforms, bekend om hoogwaardige afbeelding generatie en emotionele verbindingen.'
  },
  'character-ai': {
    tagline: 'Gratis AI platform met miljoen characters',
    best_for: 'Gratis gebruik, roleplay en educatieve gesprekken',
    description: 'Character.AI is het grootste gratis AI chat platform met miljoenen gebruikersgemaakt characters voor roleplay, educatie en entertainment.'
  },
  'replika': {
    tagline: 'AI companion gericht op emotionele ondersteuning',
    best_for: 'Emotionele ondersteuning, mentale gezondheid en dagelijks gesprek',
    description: 'Replika is een AI companion speciaal ontworpen voor emotionele ondersteuning en mentaal welzijn, met focus op betekenisvolle gesprekken.'
  },
  'hammer-ai': {
    tagline: 'Privacy-first gratis AI chat zonder censuur',
    best_for: 'Privacy, gratis onbeperkt gebruik en ongecensureerde gesprekken',
    description: 'Hammer AI is een volledig gratis platform zonder beperkingen, met sterke focus op privacy en ongecensureerde AI gesprekken.'
  },
  'spicychat-ai': {
    tagline: 'NSFW AI chat met grote character bibliotheek',
    best_for: 'NSFW gesprekken, roleplay en community characters',
    description: 'SpicyChat AI biedt een uitgebreide bibliotheek met NSFW characters en ongecensureerde gesprekken in een actieve community.'
  },
  'crushon-ai': {
    tagline: 'NSFW AI companion met emotionele intelligentie',
    best_for: 'NSFW content, emotionele verbindingen en romantische roleplay',
    description: 'Crushon AI combineert NSFW mogelijkheden met emotionele intelligentie voor realistische virtuele relaties.'
  },
  'fantasygf-ai': {
    tagline: 'Virtuele dating simulator met beloningen systeem',
    best_for: 'Virtual dating, afbeelding generatie en gamification',
    description: 'FantasyGF biedt een unieke virtuele dating ervaring compleet met XP systeem, beloningen en gepersonaliseerde AI girlfriends.'
  },
  'dreamgf-ai': {
    tagline: 'Premium AI girlfriend met geavanceerde afbeelding generatie',
    best_for: 'Premium AI girlfriends, hoogwaardige afbeeldingen en spraakberichten',
    description: 'DreamGF is een premium AI girlfriend platform met state-of-the-art afbeelding generatie en spraak functionaliteit.'
  },
  'ourdream-ai': {
    tagline: 'Betaalbare AI companion met video mogelijkheden',
    best_for: 'Betaalbare pricing, video generatie en flexibele characters',
    description: 'OurDream AI biedt uitstekende waarde met video generatie functionaliteit tegen een betaalbare prijs.'
  },
  'narrin-ai': {
    tagline: 'AI companion voor mentale gezondheid en wellness',
    best_for: 'Mentale gezondheid, wellness coaching en therapeutische gesprekken',
    description: 'Narrin AI is gespecialiseerd in mentale gezondheid ondersteuning met therapeutisch getrainde AI companions.'
  }
};

async function getCompanionIdBySlug(slug) {
  try {
    const records = await base(COMPANIONS_TABLE_ID)
      .select({
        filterByFormula: `{slug} = "${slug}"`,
        maxRecords: 1
      })
      .all();

    if (records.length > 0) {
      return records[0].id;
    }
    return null;
  } catch (error) {
    console.error(`❌ Error finding companion ${slug}:`, error.message);
    return null;
  }
}

async function checkExistingTranslation(companionId, language) {
  try {
    const records = await base(TRANSLATIONS_TABLE_ID)
      .select({
        filterByFormula: `AND({language} = "${language}", {companion} = "${companionId}")`,
        maxRecords: 1
      })
      .all();

    return records.length > 0 ? records[0] : null;
  } catch (error) {
    console.error('❌ Error checking existing translation:', error.message);
    return null;
  }
}

async function createTranslation(companionId, companionSlug, translation, language = 'nl') {
  try {
    const existing = await checkExistingTranslation(companionId, language);

    const translationData = {
      companion: [companionId],
      language: language,
      tagline: translation.tagline || '',
      best_for: translation.best_for || '',
      description: translation.description || ''
    };

    if (existing) {
      // Update existing translation
      console.log(`🔄 Updating existing ${language} translation for ${companionSlug}...`);
      await base(TRANSLATIONS_TABLE_ID).update(existing.id, translationData);
      console.log(`✅ Updated ${language} translation for ${companionSlug}`);
    } else {
      // Create new translation
      console.log(`➕ Creating new ${language} translation for ${companionSlug}...`);
      await base(TRANSLATIONS_TABLE_ID).create(translationData);
      console.log(`✅ Created ${language} translation for ${companionSlug}`);
    }

    return true;
  } catch (error) {
    console.error(`❌ Error creating/updating translation for ${companionSlug}:`, error.message);
    return false;
  }
}

async function populateTranslations() {
  console.log('🚀 Starting Dutch translations population...');
  console.log(`📦 Using Companions Table: ${COMPANIONS_TABLE_ID}`);
  console.log(`🌐 Using Translations Table: ${TRANSLATIONS_TABLE_ID}`);
  console.log('');

  let successCount = 0;
  let failCount = 0;

  for (const [slug, translation] of Object.entries(dutchTranslations)) {
    console.log(`\n📝 Processing ${slug}...`);

    const companionId = await getCompanionIdBySlug(slug);

    if (!companionId) {
      console.log(`⚠️  Companion ${slug} not found in Airtable, skipping...`);
      failCount++;
      continue;
    }

    console.log(`   Found companion ID: ${companionId}`);

    const success = await createTranslation(companionId, slug, translation, 'nl');

    if (success) {
      successCount++;
    } else {
      failCount++;
    }

    // Small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 300));
  }

  console.log('\n' + '='.repeat(50));
  console.log('✅ Translation population complete!');
  console.log(`   Success: ${successCount}`);
  console.log(`   Failed: ${failCount}`);
  console.log('='.repeat(50));
}

// Run the script
populateTranslations().catch(error => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});
