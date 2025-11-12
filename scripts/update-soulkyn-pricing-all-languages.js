const Airtable = require('airtable');

const base = new Airtable({apiKey: process.env.AIRTABLE_TOKEN_CG})
  .base(process.env.AIRTABLE_BASE_ID_CG);

const tableId = process.env.AIRTABLE_TABLE_ID_CG;

// English pricing plans (same as before)
const pricingPlansEN = [
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

// Dutch pricing plans (translated)
const pricingPlansNL = [
  {
    "name": "💬 Gewoon Chatten",
    "price": 11.99,
    "period": "monthly",
    "features": [
      "🔞 Alle galerijen ongecensureerd",
      "📩 5000 Chat Berichten",
      "👩‍👦‍👦 Unlimited Kyns",
      "🧠 Unlimited Herinneringen",
      "🌟 70B Ongecensureerd Model",
      "🖼️ 5 Afbeeldingen Quotum (tot 30 afbeeldingen)",
      "🎧 5 Voice Messages",
      "💬 Chat Badge"
    ]
  },
  {
    "name": "⭐ Premium (Maandelijks)",
    "price": 24.99,
    "period": "monthly",
    "features": [
      "🔞 Alle galerijen ongecensureerd",
      "📩 Unlimited Berichten",
      "👩‍👦‍👦 Unlimited Kyns",
      "🖼️ 300 Afbeeldingen Quotum (tot 1800 afbeeldingen)",
      "🎧 300 Voice Messages",
      "🧠 Unlimited Herinneringen",
      "🌟 70B Ongecensureerd Model",
      "⭐ Premium Badge"
    ]
  },
  {
    "name": "💗 Deluxe (Maandelijks)",
    "price": 49.99,
    "period": "monthly",
    "features": [
      "🔞 Alle galerijen ongecensureerd",
      "📩 Unlimited Berichten",
      "👩‍👦‍👦 Unlimited Kyns",
      "🖼️ Unlimited Afbeeldingen Generaties",
      "♾️ Unlimited In-chat Afbeeldingen",
      "🎧 Unlimited Voice Messages",
      "🧠 Unlimited Herinneringen",
      "🌟 70B Ongecensureerd Model",
      "🔗 Link publieke Kyns aan chat/scenario tot 4",
      "👥 Groepschat met publieke Kyns tot 3",
      "❤️ Deluxe Badge"
    ]
  },
  {
    "name": "🫶 Deluxe Plus (Maandelijks)",
    "price": 99.99,
    "period": "monthly",
    "features": [
      "🔞 Alle galerijen ongecensureerd",
      "📩 Unlimited Berichten",
      "👩‍👦‍👦 Unlimited Kyns",
      "🖼️ Unlimited Afbeeldingen Generaties",
      "♾️ Unlimited In-chat Afbeeldingen",
      "🎧 Unlimited Voice Messages",
      "🧠 Unlimited Herinneringen",
      "🌟 70B Ongecensureerd Model",
      "🔗 Link publieke Kyns aan chat/scenario tot 4",
      "👥 Groepschat met publieke Kyns tot 3",
      "🎥 50 Videos Quotum (Alle kwaliteiten)",
      "🖼️ 300 AI Ondersteunde Afbeelding Bewerkingen",
      "🚀 Prioriteit Video Generaties",
      "🚀 Prioriteit Afbeelding Bewerkingen",
      "🥇 Soulkyn Backer",
      "🚀 Vroegste Toegang tot Nieuwe Features",
      "🫶 Deluxe Plus Badge"
    ]
  },
  {
    "name": "⭐ Premium (3 Maanden)",
    "price": 22.50,
    "period": "quarterly",
    "features": [
      "💝 Bespaar 20% of €6.75",
      "🔞 Alle galerijen ongecensureerd",
      "📩 Unlimited Berichten",
      "👩‍👦‍👦 Unlimited Kyns",
      "🖼️ 300 Afbeeldingen Quotum (tot 1800 afbeeldingen)",
      "🎧 300 Voice Messages",
      "🧠 Unlimited Herinneringen",
      "🌟 70B Ongecensureerd Model",
      "⭐ Premium Badge",
      "Gefactureerd €67.49/3 maanden (was €74.24)"
    ]
  },
  {
    "name": "💗 Deluxe (3 Maanden)",
    "price": 45.00,
    "period": "quarterly",
    "features": [
      "💝 Bespaar 20% of €13.50",
      "🔞 Alle galerijen ongecensureerd",
      "📩 Unlimited Berichten",
      "👩‍👦‍👦 Unlimited Kyns",
      "🖼️ Unlimited Afbeeldingen Generaties",
      "♾️ Unlimited In-chat Afbeeldingen",
      "🎧 Unlimited Voice Messages",
      "🧠 Unlimited Herinneringen",
      "🌟 70B Ongecensureerd Model",
      "🔗 Link publieke Kyns aan chat/scenario tot 4",
      "👥 Groepschat met publieke Kyns tot 3",
      "❤️ Deluxe Badge",
      "Gefactureerd €134.99/3 maanden (was €148.49)"
    ]
  },
  {
    "name": "🫶 Deluxe Plus (3 Maanden)",
    "price": 90.00,
    "period": "quarterly",
    "features": [
      "💝 Bespaar 20% of €27.00",
      "🔞 Alle galerijen ongecensureerd",
      "📩 Unlimited Berichten",
      "👩‍👦‍👦 Unlimited Kyns",
      "🖼️ Unlimited Afbeeldingen Generaties",
      "♾️ Unlimited In-chat Afbeeldingen",
      "🎧 Unlimited Voice Messages",
      "🧠 Unlimited Herinneringen",
      "🌟 70B Ongecensureerd Model",
      "🔗 Link publieke Kyns aan chat/scenario tot 4",
      "👥 Groepschat met publieke Kyns tot 3",
      "🎥 50 Videos Quotum (Alle kwaliteiten)",
      "🖼️ 300 AI Ondersteunde Afbeelding Bewerkingen",
      "🚀 Prioriteit Video Generaties",
      "🚀 Prioriteit Afbeelding Bewerkingen",
      "🥇 Soulkyn Backer",
      "🚀 Vroegste Toegang tot Nieuwe Features",
      "🫶 Deluxe Plus Badge",
      "Gefactureerd €269.99/3 maanden (was €296.99)"
    ]
  },
  {
    "name": "⭐ Premium (Jaarlijks)",
    "price": 20.82,
    "period": "yearly",
    "features": [
      "💎 Bespaar 20% of €49.98",
      "🔞 Alle galerijen ongecensureerd",
      "📩 Unlimited Berichten",
      "👩‍👦‍👦 Unlimited Kyns",
      "🖼️ 300 Afbeeldingen Quotum (tot 1800 afbeeldingen)",
      "🎧 300 Voice Messages",
      "🧠 Unlimited Herinneringen",
      "🌟 70B Ongecensureerd Model",
      "⭐ Premium Badge",
      "Gefactureerd €249.90/jaar (was €299.88)"
    ]
  },
  {
    "name": "💗 Deluxe (Jaarlijks)",
    "price": 41.58,
    "period": "yearly",
    "features": [
      "💎 Bespaar 20% of €99.80",
      "🔞 Alle galerijen ongecensureerd",
      "📩 Unlimited Berichten",
      "👩‍👦‍👦 Unlimited Kyns",
      "🖼️ Unlimited Afbeeldingen Generaties",
      "♾️ Unlimited In-chat Afbeeldingen",
      "🎧 Unlimited Voice Messages",
      "🧠 Unlimited Herinneringen",
      "🌟 70B Ongecensureerd Model",
      "🔗 Link publieke Kyns aan chat/scenario tot 4",
      "👥 Groepschat met publieke Kyns tot 3",
      "❤️ Deluxe Badge",
      "Gefactureerd €499.00/jaar (was €598.80)"
    ]
  },
  {
    "name": "🫶 Deluxe Plus (Jaarlijks)",
    "price": 83.33,
    "period": "yearly",
    "features": [
      "💎 Bespaar 20% of €199.98",
      "🔞 Alle galerijen ongecensureerd",
      "📩 Unlimited Berichten",
      "👩‍👦‍👦 Unlimited Kyns",
      "🖼️ Unlimited Afbeeldingen Generaties",
      "♾️ Unlimited In-chat Afbeeldingen",
      "🎧 Unlimited Voice Messages",
      "🧠 Unlimited Herinneringen",
      "🌟 70B Ongecensureerd Model",
      "🔗 Link publieke Kyns aan chat/scenario tot 4",
      "👥 Groepschat met publieke Kyns tot 3",
      "🎥 50 Videos Quotum (Alle kwaliteiten)",
      "🖼️ 300 AI Ondersteunde Afbeelding Bewerkingen",
      "🚀 Prioriteit Video Generaties",
      "🚀 Prioriteit Afbeelding Bewerkingen",
      "🥇 Soulkyn Backer",
      "🚀 Vroegste Toegang tot Nieuwe Features",
      "🫶 Deluxe Plus Badge",
      "Gefactureerd €999.90/jaar (was €1199.88)"
    ]
  }
];

// Portuguese pricing plans (translated)
const pricingPlansPT = [
  {
    "name": "💬 Apenas Conversando",
    "price": 11.99,
    "period": "monthly",
    "features": [
      "🔞 Todas as galerias sem censura",
      "📩 5000 Mensagens de Chat",
      "👩‍👦‍👦 Kyns Ilimitados",
      "🧠 Memórias Ilimitadas",
      "🌟 Modelo 70B Sem Censura",
      "🖼️ 5 Cota de Imagens (até 30 imagens)",
      "🎧 5 Mensagens de Voz",
      "💬 Badge Chat"
    ]
  },
  {
    "name": "⭐ Premium (Mensal)",
    "price": 24.99,
    "period": "monthly",
    "features": [
      "🔞 Todas as galerias sem censura",
      "📩 Mensagens Ilimitadas",
      "👩‍👦‍👦 Kyns Ilimitados",
      "🖼️ 300 Cota de Imagens (até 1800 imagens)",
      "🎧 300 Mensagens de Voz",
      "🧠 Memórias Ilimitadas",
      "🌟 Modelo 70B Sem Censura",
      "⭐ Badge Premium"
    ]
  },
  {
    "name": "💗 Deluxe (Mensal)",
    "price": 49.99,
    "period": "monthly",
    "features": [
      "🔞 Todas as galerias sem censura",
      "📩 Mensagens Ilimitadas",
      "👩‍👦‍👦 Kyns Ilimitados",
      "🖼️ Gerações de Imagens Ilimitadas",
      "♾️ Imagens no Chat Ilimitadas",
      "🎧 Mensagens de Voz Ilimitadas",
      "🧠 Memórias Ilimitadas",
      "🌟 Modelo 70B Sem Censura",
      "🔗 Link Kyns públicos ao chat/cenário até 4",
      "👥 Chat em grupo com Kyns públicos até 3",
      "❤️ Badge Deluxe"
    ]
  },
  {
    "name": "🫶 Deluxe Plus (Mensal)",
    "price": 99.99,
    "period": "monthly",
    "features": [
      "🔞 Todas as galerias sem censura",
      "📩 Mensagens Ilimitadas",
      "👩‍👦‍👦 Kyns Ilimitados",
      "🖼️ Gerações de Imagens Ilimitadas",
      "♾️ Imagens no Chat Ilimitadas",
      "🎧 Mensagens de Voz Ilimitadas",
      "🧠 Memórias Ilimitadas",
      "🌟 Modelo 70B Sem Censura",
      "🔗 Link Kyns públicos ao chat/cenário até 4",
      "👥 Chat em grupo com Kyns públicos até 3",
      "🎥 50 Cota de Vídeos (Todas as qualidades)",
      "🖼️ 300 Edições de Imagens Assistidas por IA",
      "🚀 Gerações de Vídeo Prioritárias",
      "🚀 Edições de Imagem Prioritárias",
      "🥇 Apoiador Soulkyn",
      "🚀 Acesso Antecipado aos Novos Recursos",
      "🫶 Badge Deluxe Plus"
    ]
  },
  {
    "name": "⭐ Premium (3 Meses)",
    "price": 22.50,
    "period": "quarterly",
    "features": [
      "💝 Economize 20% ou €6.75",
      "🔞 Todas as galerias sem censura",
      "📩 Mensagens Ilimitadas",
      "👩‍👦‍👦 Kyns Ilimitados",
      "🖼️ 300 Cota de Imagens (até 1800 imagens)",
      "🎧 300 Mensagens de Voz",
      "🧠 Memórias Ilimitadas",
      "🌟 Modelo 70B Sem Censura",
      "⭐ Badge Premium",
      "Faturado €67.49/3 meses (era €74.24)"
    ]
  },
  {
    "name": "💗 Deluxe (3 Meses)",
    "price": 45.00,
    "period": "quarterly",
    "features": [
      "💝 Economize 20% ou €13.50",
      "🔞 Todas as galerias sem censura",
      "📩 Mensagens Ilimitadas",
      "👩‍👦‍👦 Kyns Ilimitados",
      "🖼️ Gerações de Imagens Ilimitadas",
      "♾️ Imagens no Chat Ilimitadas",
      "🎧 Mensagens de Voz Ilimitadas",
      "🧠 Memórias Ilimitadas",
      "🌟 Modelo 70B Sem Censura",
      "🔗 Link Kyns públicos ao chat/cenário até 4",
      "👥 Chat em grupo com Kyns públicos até 3",
      "❤️ Badge Deluxe",
      "Faturado €134.99/3 meses (era €148.49)"
    ]
  },
  {
    "name": "🫶 Deluxe Plus (3 Meses)",
    "price": 90.00,
    "period": "quarterly",
    "features": [
      "💝 Economize 20% ou €27.00",
      "🔞 Todas as galerias sem censura",
      "📩 Mensagens Ilimitadas",
      "👩‍👦‍👦 Kyns Ilimitados",
      "🖼️ Gerações de Imagens Ilimitadas",
      "♾️ Imagens no Chat Ilimitadas",
      "🎧 Mensagens de Voz Ilimitadas",
      "🧠 Memórias Ilimitadas",
      "🌟 Modelo 70B Sem Censura",
      "🔗 Link Kyns públicos ao chat/cenário até 4",
      "👥 Chat em grupo com Kyns públicos até 3",
      "🎥 50 Cota de Vídeos (Todas as qualidades)",
      "🖼️ 300 Edições de Imagens Assistidas por IA",
      "🚀 Gerações de Vídeo Prioritárias",
      "🚀 Edições de Imagem Prioritárias",
      "🥇 Apoiador Soulkyn",
      "🚀 Acesso Antecipado aos Novos Recursos",
      "🫶 Badge Deluxe Plus",
      "Faturado €269.99/3 meses (era €296.99)"
    ]
  },
  {
    "name": "⭐ Premium (Anual)",
    "price": 20.82,
    "period": "yearly",
    "features": [
      "💎 Economize 20% ou €49.98",
      "🔞 Todas as galerias sem censura",
      "📩 Mensagens Ilimitadas",
      "👩‍👦‍👦 Kyns Ilimitados",
      "🖼️ 300 Cota de Imagens (até 1800 imagens)",
      "🎧 300 Mensagens de Voz",
      "🧠 Memórias Ilimitadas",
      "🌟 Modelo 70B Sem Censura",
      "⭐ Badge Premium",
      "Faturado €249.90/ano (era €299.88)"
    ]
  },
  {
    "name": "💗 Deluxe (Anual)",
    "price": 41.58,
    "period": "yearly",
    "features": [
      "💎 Economize 20% ou €99.80",
      "🔞 Todas as galerias sem censura",
      "📩 Mensagens Ilimitadas",
      "👩‍👦‍👦 Kyns Ilimitados",
      "🖼️ Gerações de Imagens Ilimitadas",
      "♾️ Imagens no Chat Ilimitadas",
      "🎧 Mensagens de Voz Ilimitadas",
      "🧠 Memórias Ilimitadas",
      "🌟 Modelo 70B Sem Censura",
      "🔗 Link Kyns públicos ao chat/cenário até 4",
      "👥 Chat em grupo com Kyns públicos até 3",
      "❤️ Badge Deluxe",
      "Faturado €499.00/ano (era €598.80)"
    ]
  },
  {
    "name": "🫶 Deluxe Plus (Anual)",
    "price": 83.33,
    "period": "yearly",
    "features": [
      "💎 Economize 20% ou €199.98",
      "🔞 Todas as galerias sem censura",
      "📩 Mensagens Ilimitadas",
      "👩‍👦‍👦 Kyns Ilimitados",
      "🖼️ Gerações de Imagens Ilimitadas",
      "♾️ Imagens no Chat Ilimitadas",
      "🎧 Mensagens de Voz Ilimitadas",
      "🧠 Memórias Ilimitadas",
      "🌟 Modelo 70B Sem Censura",
      "🔗 Link Kyns públicos ao chat/cenário até 4",
      "👥 Chat em grupo com Kyns públicos até 3",
      "🎥 50 Cota de Vídeos (Todas as qualidades)",
      "🖼️ 300 Edições de Imagens Assistidas por IA",
      "🚀 Gerações de Vídeo Prioritárias",
      "🚀 Edições de Imagem Prioritárias",
      "🥇 Apoiador Soulkyn",
      "🚀 Acesso Antecipado aos Novos Recursos",
      "🫶 Badge Deluxe Plus",
      "Faturado €999.90/ano (era €1199.88)"
    ]
  }
];

async function updateSoulkynPricingAllLanguages() {
  try {
    console.log('🔍 Searching for Soulkyn AI record...\n');

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

    // Update all three language pricing fields
    await base(tableId).update([
      {
        id: record.id,
        fields: {
          pricing_plans: JSON.stringify(pricingPlansEN, null, 2),
          pricing_plans_nl: JSON.stringify(pricingPlansNL, null, 2),
          pricing_plans_pt: JSON.stringify(pricingPlansPT, null, 2)
        }
      }
    ]);

    console.log('✅ Successfully updated Soulkyn AI pricing for ALL languages!\n');
    console.log('🇬🇧 English (EN): 10 pricing plans');
    console.log('🇳🇱 Nederlands (NL): 10 pricing plans');
    console.log('🇧🇷 Português (PT): 10 pricing plans');
    console.log('\n📋 Plan structure:');
    console.log('   - Monthly: Just Chatting, Premium, Deluxe, Deluxe Plus');
    console.log('   - 3 Months: Premium, Deluxe, Deluxe Plus (20% OFF)');
    console.log('   - Yearly: Premium, Deluxe, Deluxe Plus (20% OFF)');
    console.log('\n✨ All languages now show € pricing!');

  } catch (error) {
    console.error('❌ Error updating Soulkyn pricing:', error.message);
    if (error.statusCode) {
      console.error('Status code:', error.statusCode);
    }
  }
}

updateSoulkynPricingAllLanguages();
