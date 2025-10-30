const Airtable = require('airtable');

const base = new Airtable({apiKey: process.env.AIRTABLE_TOKEN_CG})
  .base(process.env.AIRTABLE_BASE_ID_CG);

const tableId = process.env.AIRTABLE_TABLE_ID_CG;

const newPricingPlans = [
  {
    "name": "💬 Just Chatting",
    "price": 11.99,
    "period": "monthly",
    "features": [
      "🔞 All galleries uncensored",
      "📩 5000 Chat Messages",
      "👩‍👦‍👦 Unlimited Kyns",
      "🧠 Unlimited Memories",
      "🌟 70B Uncensored Model",
      "🖼️ 5 Image Quota (up to 30 Images)",
      "🎧 5 Voice Messages",
      "💬 Chat Badge"
    ]
  },
  {
    "name": "⭐ Premium (Monthly)",
    "price": 24.99,
    "period": "monthly",
    "features": [
      "🔞 All galleries uncensored",
      "📩 Unlimited Messages",
      "👩‍👦‍👦 Unlimited Kyns",
      "🖼️ 300 Image Quota (up to 1800 Images)",
      "🎧 300 Voice Messages",
      "🧠 Unlimited Memories",
      "🌟 70B Uncensored Model",
      "⭐ Premium Badge"
    ]
  },
  {
    "name": "💗 Deluxe (Monthly)",
    "price": 49.99,
    "period": "monthly",
    "features": [
      "🔞 All galleries uncensored",
      "📩 Unlimited Messages",
      "👩‍👦‍👦 Unlimited Kyns",
      "🖼️ Unlimited Images Generations",
      "♾️ Unlimited In-chat Images",
      "🎧 Unlimited Voice Messages",
      "🧠 Unlimited Memories",
      "🌟 70B Uncensored Model",
      "🔗 Link public Kyns to chat/scenario up to 4",
      "👥 Group chat with public Kyns up to 3",
      "❤️ Deluxe Badge"
    ]
  },
  {
    "name": "🫶 Deluxe Plus (Monthly)",
    "price": 99.99,
    "period": "monthly",
    "features": [
      "🔞 All galleries uncensored",
      "📩 Unlimited Messages",
      "👩‍👦‍👦 Unlimited Kyns",
      "🖼️ Unlimited Images Generations",
      "♾️ Unlimited In-chat Images",
      "🎧 Unlimited Voice Messages",
      "🧠 Unlimited Memories",
      "🌟 70B Uncensored Model",
      "🔗 Link public Kyns to chat/scenario up to 4",
      "👥 Group chat with public Kyns up to 3",
      "🎥 50 Videos Quota (All qualities)",
      "🖼️ 300 AI Assisted Images Edits",
      "🚀 Priority Video Generations",
      "🚀 Priority Image Edits",
      "🥇 Soulkyn Backer",
      "🚀 Earliest Access to New Features",
      "🫶 Deluxe Plus Badge"
    ]
  },
  {
    "name": "⭐ Premium (3 Months)",
    "price": 22.50,
    "period": "quarterly",
    "features": [
      "💝 Save 20% or €6.75",
      "🔞 All galleries uncensored",
      "📩 Unlimited Messages",
      "👩‍👦‍👦 Unlimited Kyns",
      "🖼️ 300 Image Quota (up to 1800 Images)",
      "🎧 300 Voice Messages",
      "🧠 Unlimited Memories",
      "🌟 70B Uncensored Model",
      "⭐ Premium Badge",
      "Billed €67.49/3 months (was €74.24)"
    ]
  },
  {
    "name": "💗 Deluxe (3 Months)",
    "price": 45.00,
    "period": "quarterly",
    "features": [
      "💝 Save 20% or €13.50",
      "🔞 All galleries uncensored",
      "📩 Unlimited Messages",
      "👩‍👦‍👦 Unlimited Kyns",
      "🖼️ Unlimited Images Generations",
      "♾️ Unlimited In-chat Images",
      "🎧 Unlimited Voice Messages",
      "🧠 Unlimited Memories",
      "🌟 70B Uncensored Model",
      "🔗 Link public Kyns to chat/scenario up to 4",
      "👥 Group chat with public Kyns up to 3",
      "❤️ Deluxe Badge",
      "Billed €134.99/3 months (was €148.49)"
    ]
  },
  {
    "name": "🫶 Deluxe Plus (3 Months)",
    "price": 90.00,
    "period": "quarterly",
    "features": [
      "💝 Save 20% or €27.00",
      "🔞 All galleries uncensored",
      "📩 Unlimited Messages",
      "👩‍👦‍👦 Unlimited Kyns",
      "🖼️ Unlimited Images Generations",
      "♾️ Unlimited In-chat Images",
      "🎧 Unlimited Voice Messages",
      "🧠 Unlimited Memories",
      "🌟 70B Uncensored Model",
      "🔗 Link public Kyns to chat/scenario up to 4",
      "👥 Group chat with public Kyns up to 3",
      "🎥 50 Videos Quota (All qualities)",
      "🖼️ 300 AI Assisted Images Edits",
      "🚀 Priority Video Generations",
      "🚀 Priority Image Edits",
      "🥇 Soulkyn Backer",
      "🚀 Earliest Access to New Features",
      "🫶 Deluxe Plus Badge",
      "Billed €269.99/3 months (was €296.99)"
    ]
  },
  {
    "name": "⭐ Premium (Yearly)",
    "price": 20.82,
    "period": "yearly",
    "features": [
      "💎 Save 20% or €49.98",
      "🔞 All galleries uncensored",
      "📩 Unlimited Messages",
      "👩‍👦‍👦 Unlimited Kyns",
      "🖼️ 300 Image Quota (up to 1800 Images)",
      "🎧 300 Voice Messages",
      "🧠 Unlimited Memories",
      "🌟 70B Uncensored Model",
      "⭐ Premium Badge",
      "Billed €249.90/year (was €299.88)"
    ]
  },
  {
    "name": "💗 Deluxe (Yearly)",
    "price": 41.58,
    "period": "yearly",
    "features": [
      "💎 Save 20% or €99.80",
      "🔞 All galleries uncensored",
      "📩 Unlimited Messages",
      "👩‍👦‍👦 Unlimited Kyns",
      "🖼️ Unlimited Images Generations",
      "♾️ Unlimited In-chat Images",
      "🎧 Unlimited Voice Messages",
      "🧠 Unlimited Memories",
      "🌟 70B Uncensored Model",
      "🔗 Link public Kyns to chat/scenario up to 4",
      "👥 Group chat with public Kyns up to 3",
      "❤️ Deluxe Badge",
      "Billed €499.00/year (was €598.80)"
    ]
  },
  {
    "name": "🫶 Deluxe Plus (Yearly)",
    "price": 83.33,
    "period": "yearly",
    "features": [
      "💎 Save 20% or €199.98",
      "🔞 All galleries uncensored",
      "📩 Unlimited Messages",
      "👩‍👦‍👦 Unlimited Kyns",
      "🖼️ Unlimited Images Generations",
      "♾️ Unlimited In-chat Images",
      "🎧 Unlimited Voice Messages",
      "🧠 Unlimited Memories",
      "🌟 70B Uncensored Model",
      "🔗 Link public Kyns to chat/scenario up to 4",
      "👥 Group chat with public Kyns up to 3",
      "🎥 50 Videos Quota (All qualities)",
      "🖼️ 300 AI Assisted Images Edits",
      "🚀 Priority Video Generations",
      "🚀 Priority Image Edits",
      "🥇 Soulkyn Backer",
      "🚀 Earliest Access to New Features",
      "🫶 Deluxe Plus Badge",
      "Billed €999.90/year (was €1199.88)"
    ]
  }
];

async function updateSoulkynPricing() {
  try {
    console.log('🔍 Searching for Soulkyn AI record...\n');

    // Find Soulkyn AI record
    const records = await base(tableId)
      .select({
        filterByFormula: "OR({slug} = 'soulkyn-ai', {name} = 'Soulkyn AI')",
        maxRecords: 1
      })
      .firstPage();

    if (records.length === 0) {
      console.log('❌ Soulkyn AI record not found!');
      return;
    }

    const record = records[0];
    console.log(`✅ Found: ${record.fields.name} (${record.id})\n`);

    // Update the pricing_plans field
    await base(tableId).update([
      {
        id: record.id,
        fields: {
          pricing_plans: JSON.stringify(newPricingPlans, null, 2)
        }
      }
    ]);

    console.log('✅ Successfully updated Soulkyn AI pricing plans!\n');
    console.log('📋 New pricing structure:');
    console.log('   - 💬 Just Chatting: €11.99/month');
    console.log('   - ⭐ Premium (Monthly): €24.99/month');
    console.log('   - 💗 Deluxe (Monthly): €49.99/month');
    console.log('   - 🫶 Deluxe Plus (Monthly): €99.99/month');
    console.log('   - ⭐ Premium (3 Months): €22.50/month (20% off)');
    console.log('   - 💗 Deluxe (3 Months): €45.00/month (20% off)');
    console.log('   - 🫶 Deluxe Plus (3 Months): €90.00/month (20% off)');
    console.log('   - ⭐ Premium (Yearly): €20.82/month (20% off)');
    console.log('   - 💗 Deluxe (Yearly): €41.58/month (20% off)');
    console.log('   - 🫶 Deluxe Plus (Yearly): €83.33/month (20% off)');
    console.log('\n✨ Done!');

  } catch (error) {
    console.error('❌ Error updating Soulkyn pricing:', error.message);
    if (error.statusCode) {
      console.error('Status code:', error.statusCode);
    }
  }
}

updateSoulkynPricing();
