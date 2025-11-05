const Airtable = require('airtable');
require('dotenv').config();

const base = new Airtable({apiKey: process.env.AIRTABLE_TOKEN_CG}).base(process.env.AIRTABLE_BASE_ID_CG);

async function updateMiocAI() {
    try {
        console.log('Searching for mioc-ai record...\n');

        // Find the record
        const records = await base('Table 1').select({
            filterByFormula: "{slug} = 'mioc-ai'"
        }).firstPage();

        if (records.length === 0) {
            console.error('Record not found for slug: mioc-ai');
            return;
        }

        const record = records[0];
        console.log('Found record:', record.id);
        console.log('Current fields:', JSON.stringify(record.fields, null, 2));

        // Prepare updated fields
        const updatedFields = {
            'name': 'Mioc AI',
            'tagline': 'The first Role-Play site with a 1 Trillion parameter Model',
            'description': 'MiocAI is a revolutionary role-play platform featuring a 1 trillion parameter AI model (Aetherion). Experience next-level conversations with 10+ leading text and image models, complete privacy with encrypted chats, and unlimited memory that never forgets your details.',
            'features': JSON.stringify([
                {
                    "icon": "🤖",
                    "title": "1T Parameter Model",
                    "description": "Aetherion AI model"
                },
                {
                    "icon": "🔒",
                    "title": "Private & Encrypted",
                    "description": "End-to-end encryption"
                },
                {
                    "icon": "🧠",
                    "title": "Unlimited Memory",
                    "description": "Never forgets details"
                },
                {
                    "icon": "🎨",
                    "title": "Image Generation",
                    "description": "AI-powered visuals"
                },
                {
                    "icon": "🎬",
                    "title": "Video Generation",
                    "description": "Create AI videos"
                },
                {
                    "icon": "⬆️",
                    "title": "Image Upscaling",
                    "description": "4x resolution boost"
                },
                {
                    "icon": "🎭",
                    "title": "Role-Play Ready",
                    "description": "10+ AI models"
                },
                {
                    "icon": "📌",
                    "title": "Pin Messages",
                    "description": "Keep key info"
                }
            ]),
            'pricing_plans': JSON.stringify([
                {
                    'name': 'Free',
                    'price': 0,
                    'billing': 'Free forever',
                    'features': [
                        '5 credits per week',
                        'Access to standard models',
                        'Basic image generation (1 credit)',
                        'Encrypted conversations',
                        'Unlimited memory'
                    ]
                },
                {
                    'name': 'Premium',
                    'price': 9.99,
                    'billing': 'per month',
                    'features': [
                        '40 credits per week',
                        'Access to all models including Aetherion 1T',
                        'Image generation (1 credit)',
                        'Image upscaling (3 credits)',
                        'Aetherion messages (1 credit each)',
                        'Daily bonus credits',
                        'Priority support'
                    ]
                },
                {
                    'name': 'Elite',
                    'price': 19.99,
                    'billing': 'per month',
                    'features': [
                        '100 credits per week',
                        'All Premium features',
                        'Video generation (30 credits)',
                        'Higher daily bonuses',
                        'Early access to new models',
                        'VIP support',
                        'Purchased credits valid 1 year'
                    ]
                }
            ]),
            'rating': 8.5
        };

        console.log('\nUpdating record with new fields...\n');

        // Update the record
        await base('Table 1').update(record.id, updatedFields);

        console.log('✅ Successfully updated mioc-ai record!');
        console.log('\nUpdated fields:');
        console.log('- Name:', updatedFields.name);
        console.log('- Tagline:', updatedFields.tagline);
        console.log('- Features:', JSON.parse(updatedFields.features).length, 'features');
        console.log('- Pricing Plans:', JSON.parse(updatedFields.pricing_plans).length, 'plans');
        console.log('- Rating:', updatedFields.rating);

    } catch (error) {
        console.error('Error:', error);
    }
}

updateMiocAI();
