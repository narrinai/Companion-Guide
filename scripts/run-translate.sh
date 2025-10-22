#!/bin/bash
# Wrapper script to run bulk-translate.js with Netlify environment variables

echo "🔐 Loading environment variables from Netlify..."

# Load ALL environment variables from Netlify production context
export AIRTABLE_TOKEN_CG=$(netlify env:get AIRTABLE_TOKEN_CG --context production)
export AIRTABLE_BASE_ID_CG=$(netlify env:get AIRTABLE_BASE_ID_CG --context production)
export AIRTABLE_TABLE_ID_CG=$(netlify env:get AIRTABLE_TABLE_ID_CG --context production)
export AIRTABLE_TRANSLATIONS_TABLE_ID_CG=$(netlify env:get AIRTABLE_TRANSLATIONS_TABLE_ID_CG --context production)
export OPENAI_API_KEY_COMPANIONGUIDE=$(netlify env:get OPENAI_API_KEY_COMPANIONGUIDE --context production)

echo "✅ Environment variables loaded from production"
echo ""

# Run the translation script with all arguments passed to this script
node scripts/bulk-translate.js "$@"
