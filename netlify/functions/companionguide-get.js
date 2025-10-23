const Airtable = require('airtable');

exports.handler = async (event, context) => {
  try {
    // Check environment variables
    if (!process.env.AIRTABLE_TOKEN_CG) {
      throw new Error('AIRTABLE_TOKEN_CG environment variable is not set');
    }
    if (!process.env.AIRTABLE_BASE_ID_CG) {
      throw new Error('AIRTABLE_BASE_ID_CG environment variable is not set');
    }
    if (!process.env.AIRTABLE_TABLE_ID_CG) {
      throw new Error('AIRTABLE_TABLE_ID_CG environment variable is not set');
    }

    console.log('Initializing Airtable connection...');
    const base = new Airtable({apiKey: process.env.AIRTABLE_TOKEN_CG})
      .base(process.env.AIRTABLE_BASE_ID_CG);

    const { filter, category, sort, limit, order, featured, table, lang, slug } = event.queryStringParameters || {};
    console.log('Query parameters:', { filter, category, sort, limit, order, featured, table, lang, slug });

    // Determine which table to use
    const tableId = table === 'Articles' ? process.env.AIRTABLE_ARTICLES_TABLE_ID_CG : process.env.AIRTABLE_TABLE_ID_CG;
    const tableName = table === 'Articles' ? 'Articles' : 'Companions';

    if (!tableId) {
      throw new Error(`Table ID not configured for: ${tableName}`);
    }

    console.log('Using table:', tableName);

    let filterByFormula = '{status} = "Active"';

    if (category) {
      // Simple category filtering - let client side handle filtering for now
      console.log('Category filtering requested for:', category);
      // Remove category from server-side filtering temporarily to debug
      // filterByFormula += ` AND FIND("${category}", {categories}) > 0`;
    }

    if (featured === 'true') {
      filterByFormula += ' AND {is_featured} = 1';
      console.log('Filtering for featured companions only');
    }

    // Different default sort for Articles vs Companions
    const defaultSortField = tableName === 'Articles' ? 'featured_order' : 'rating';

    const selectOptions = {
      filterByFormula,
      sort: [
        { field: sort || defaultSortField, direction: 'desc' }
      ]
    };

    console.log('Filter formula:', filterByFormula);
    console.log('Select options:', selectOptions);

    if (limit) {
      selectOptions.maxRecords = parseInt(limit);
    } else {
      // No limit specified - get all records (set to high number to bypass Airtable's default)
      selectOptions.maxRecords = 1000;
    }

    const records = await base(tableId)
      .select(selectOptions)
      .all();

    // Map records differently based on table type
    const items = records.map(record => {
      const fields = record.fields;
      let pricingPlans = [];

      try {
        pricingPlans = fields.pricing_plans ? JSON.parse(fields.pricing_plans) : [];
      } catch (e) {
        console.error('Error parsing pricing plans for', fields.name, ':', e);
        pricingPlans = [];
      }

      // Handle categories - can be array (multiselect) or string (semicolon separated)
      let categories = [];
      if (fields.categories) {
        if (Array.isArray(fields.categories)) {
          categories = fields.categories;
        } else if (typeof fields.categories === 'string') {
          categories = fields.categories.split(';').filter(cat => cat.trim());
        }
      }

      // Handle badges - can be array (multiselect) or string (semicolon separated)
      let badges = [];
      if (fields.badges) {
        if (Array.isArray(fields.badges)) {
          badges = fields.badges;
        } else if (typeof fields.badges === 'string') {
          badges = fields.badges.split(';').filter(badge => badge.trim());
        }
      }

      // Handle features - can be JSON string or array
      let features = [];
      if (fields.features) {
        if (typeof fields.features === 'string') {
          try {
            features = JSON.parse(fields.features);
          } catch (e) {
            console.error('Error parsing features for', fields.name, ':', e);
            features = [];
          }
        } else if (Array.isArray(fields.features)) {
          features = fields.features;
        }
      }

      // Return different structure based on table type
      if (tableName === 'Articles') {
        return {
          id: record.id,
          title: fields.title || 'Untitled',
          short_title: fields.short_title || fields.title || 'Untitled',
          slug: fields.slug || 'untitled',
          featured: !!fields.is_featured,
          featured_order: parseInt(fields.featured_order) || 999,
          status: fields.status || 'Active'
        };
      } else {
        // Companions table
        return {
          id: record.id,
          name: fields.name || 'Unknown',
          slug: fields.slug || 'unknown',
          rating: fields.rating || 0,
          description: fields.description || '',
          short_description: fields.short_description || '',
          tagline: fields.tagline || fields.short_description || '',
          website_url: fields.website_url || '',
          affiliate_url: fields.affiliate_url || fields.website_url || '',
          logo_url: fields.logo_url || fields.image_url || '/images/logos/default.png',
          image_url: fields.image_url || fields.logo_url || '/images/logos/default.png',
          categories: categories,
          badges: badges,
          features: features,
          pricing_plans: pricingPlans,
          featured: !!fields.is_featured, // Convert checkbox to boolean
          status: fields.status || 'active',
          review_count: parseInt(fields.review_count) || 0,
          best_for: fields.best_for || '',
          my_verdict: fields.my_verdict || '',
          nl_my_verdict: fields.nl_my_verdict || '',
          pt_my_verdict: fields.pt_my_verdict || ''
        };
      }
    });

    // Sort based on table type
    if (tableName === 'Articles') {
      items.sort((a, b) => a.featured_order - b.featured_order);
    } else {
      // Secondary sort by review_count when ratings are equal
      items.sort((a, b) => {
        // First sort by rating (descending)
        if (b.rating !== a.rating) {
          return b.rating - a.rating;
        }
        // If ratings are equal, sort by review_count (descending)
        return b.review_count - a.review_count;
      });
    }

    // Apply translations if language is specified and not English
    if (lang && lang !== 'en' && tableName === 'Companions') {
      console.log(`Fetching translations for language: ${lang}`);

      try {
        // Check if translations table is configured
        if (!process.env.AIRTABLE_TRANSLATIONS_TABLE_ID_CG) {
          console.warn('AIRTABLE_TRANSLATIONS_TABLE_ID_CG not configured, skipping translations');
        } else {
          const translationsTableId = process.env.AIRTABLE_TRANSLATIONS_TABLE_ID_CG;

          // Fetch all translations for this language
          const translationsFormula = `{language} = "${lang}"`;
          const translationRecords = await base(translationsTableId)
            .select({
              filterByFormula: translationsFormula,
              maxRecords: 1000
            })
            .all();

          console.log(`Found ${translationRecords.length} translations for ${lang}`);

          // Create a map of companion ID to translation
          const translationMap = new Map();
          translationRecords.forEach(record => {
            const fields = record.fields;
            // companion field is a linked record, so it's an array of record IDs
            if (fields.companion && fields.companion.length > 0) {
              const companionId = fields.companion[0];
              translationMap.set(companionId, {
                description: fields.description || '',
                best_for: fields.best_for || '',
                tagline: fields.tagline || '',
                meta_title: fields.meta_title || '',
                meta_description: fields.meta_description || '',
                body_text: fields.body_text || '',
                features: fields.features || '',
                pros_cons: fields.pros_cons || '',
                pricing_plans: fields.pricing_plans || '',
                my_verdict: fields.my_verdict || '',
                faq: fields.faq || '',
                hero_specs: fields.hero_specs || '',
                ready_to_try: fields.ready_to_try || fields.ready_try || '',
                review_form_text: fields.review_form_text || '',
                verdict_subtitle: fields.verdict_subtitle || ''
              });
            }
          });

          // Apply translations to items
          items.forEach(item => {
            const translation = translationMap.get(item.id);
            if (translation) {
              // Override with translated content
              if (translation.description) item.description = translation.description;
              if (translation.best_for) item.best_for = translation.best_for;
              if (translation.tagline) item.tagline = translation.tagline;
              if (translation.meta_title) item.meta_title = translation.meta_title;
              if (translation.meta_description) item.meta_description = translation.meta_description;
              if (translation.body_text) item.body_text = translation.body_text;
              if (translation.features) item.features = translation.features;
              if (translation.pros_cons) item.pros_cons = translation.pros_cons;
              if (translation.pricing_plans) item.pricing_plans = translation.pricing_plans;
              if (translation.my_verdict) item.my_verdict = translation.my_verdict;
              if (translation.faq) item.faq = translation.faq;
              if (translation.hero_specs) item.hero_specs = translation.hero_specs;
              if (translation.ready_to_try) item.ready_to_try = translation.ready_to_try;
              if (translation.review_form_text) item.review_form_text = translation.review_form_text;
              if (translation.verdict_subtitle) item.verdict_subtitle = translation.verdict_subtitle;

              console.log(`Applied translation for: ${item.name} (${lang})`);
            }
          });
        }
      } catch (error) {
        console.error('Error fetching translations:', error);
        // Continue without translations rather than failing
      }
    }

    // Return different response key based on table type
    const responseKey = tableName === 'Articles' ? 'articles' : 'companions';

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE'
      },
      body: JSON.stringify({
        [responseKey]: items,
        total: items.length
      })
    };

  } catch (error) {
    console.error('Error fetching companions:', error);
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        error: 'Failed to fetch companions',
        message: error.message
      })
    };
  }
};