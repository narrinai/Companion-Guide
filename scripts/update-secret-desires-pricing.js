const Airtable = require('airtable');

const base = new Airtable({apiKey: process.env.AIRTABLE_TOKEN_CG})
  .base(process.env.AIRTABLE_BASE_ID_CG);

const pricingPlansEN = [
  {
    "name": "Pro",
    "price": 7.99,
    "period": "monthly",
    "features": [
      "♾️ Unlimited Messaging",
      "🌈 Unlimited Character Creation",
      "📸 Image Generation",
      "🔊 Message Narration",
      "⚙️ Unlimited Pro Engine Usage",
      "🗨️ Realistic Messaging",
      "🗣️ Voice Notes",
      "🧠 Cutting-edge Engines",
      "❤️‍🔥 Monthly 100 Hearts",
      "📞 Real-time Phone Calls"
    ]
  },
  {
    "name": "Ultra",
    "price": 13.99,
    "period": "monthly",
    "features": [
      "🔥 Everything in Pro Tier",
      "⚙️ Unlimited Ultra Engine Usage",
      "🧠 Cutting-edge Engines",
      "❤️‍🔥 Monthly 200 Hearts"
    ]
  },
  {
    "name": "Max",
    "price": 19.99,
    "period": "monthly",
    "badge": "Most Popular Plan",
    "features": [
      "🔥 Everything in Ultra Tier",
      "⚙️ Unlimited Max Engine Usage",
      "🧠 Cutting-edge Engines",
      "❤️‍🔥 Monthly 300 Hearts"
    ]
  }
];

const pricingPlansNL = [
  {
    "name": "Pro",
    "price": 7.99,
    "period": "monthly",
    "features": [
      "♾️ Onbeperkt Berichten",
      "🌈 Onbeperkt Karakters Maken",
      "📸 Afbeelding Generatie",
      "🔊 Bericht Vertelling",
      "⚙️ Onbeperkt Pro Engine Gebruik",
      "🗨️ Realistische Berichten",
      "🗣️ Spraaknotities",
      "🧠 Geavanceerde Engines",
      "❤️‍🔥 Maandelijks 100 Harten",
      "📞 Real-time Telefoongesprekken"
    ]
  },
  {
    "name": "Ultra",
    "price": 13.99,
    "period": "monthly",
    "features": [
      "🔥 Alles in Pro Tier",
      "⚙️ Onbeperkt Ultra Engine Gebruik",
      "🧠 Geavanceerde Engines",
      "❤️‍🔥 Maandelijks 200 Harten"
    ]
  },
  {
    "name": "Max",
    "price": 19.99,
    "period": "monthly",
    "badge": "Meest Populaire Plan",
    "features": [
      "🔥 Alles in Ultra Tier",
      "⚙️ Onbeperkt Max Engine Gebruik",
      "🧠 Geavanceerde Engines",
      "❤️‍🔥 Maandelijks 300 Harten"
    ]
  }
];

const pricingPlansPT = [
  {
    "name": "Pro",
    "price": 7.99,
    "period": "monthly",
    "features": [
      "♾️ Mensagens Ilimitadas",
      "🌈 Criação Ilimitada de Personagens",
      "📸 Geração de Imagens",
      "🔊 Narração de Mensagens",
      "⚙️ Uso Ilimitado do Motor Pro",
      "🗨️ Mensagens Realistas",
      "🗣️ Notas de Voz",
      "🧠 Motores de Ponta",
      "❤️‍🔥 100 Corações Mensais",
      "📞 Chamadas Telefônicas em Tempo Real"
    ]
  },
  {
    "name": "Ultra",
    "price": 13.99,
    "period": "monthly",
    "features": [
      "🔥 Tudo no Plano Pro",
      "⚙️ Uso Ilimitado do Motor Ultra",
      "🧠 Motores de Ponta",
      "❤️‍🔥 200 Corações Mensais"
    ]
  },
  {
    "name": "Max",
    "price": 19.99,
    "period": "monthly",
    "badge": "Plano Mais Popular",
    "features": [
      "🔥 Tudo no Plano Ultra",
      "⚙️ Uso Ilimitado do Motor Max",
      "🧠 Motores de Ponta",
      "❤️‍🔥 300 Corações Mensais"
    ]
  }
];

async function updateSecretDesiresPricing() {
  try {
    console.log('🔄 Updating Secret Desires AI pricing for EN, NL, PT...\n');

    const languages = [
      { lang: 'en', plans: pricingPlansEN },
      { lang: 'nl', plans: pricingPlansNL },
      { lang: 'pt', plans: pricingPlansPT }
    ];

    for (const { lang, plans } of languages) {
      console.log(`\n=== ${lang.toUpperCase()} ===`);

      // Find the record
      const records = await base(process.env.AIRTABLE_TRANSLATIONS_TABLE_ID_CG)
        .select({
          filterByFormula: `AND({language} = "${lang}", FIND("secret-desires-ai", ARRAYJOIN({slug (from companion)})))`,
          maxRecords: 1
        })
        .all();

      if (records.length === 0) {
        console.log(`❌ No ${lang.toUpperCase()} record found`);
        continue;
      }

      const record = records[0];
      console.log(`✅ Found record (${record.id})`);

      // Update the pricing_plans field
      await base(process.env.AIRTABLE_TRANSLATIONS_TABLE_ID_CG).update([
        {
          id: record.id,
          fields: {
            pricing_plans: JSON.stringify(plans, null, 2)
          }
        }
      ]);

      console.log(`✅ Updated pricing_plans (${plans.length} plans)`);
      plans.forEach((p, i) => {
        console.log(`   ${i + 1}. ${p.name} - $${p.price}/month`);
      });
    }

    console.log('\n✨ All languages updated successfully!');

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

updateSecretDesiresPricing();
