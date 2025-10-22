#!/bin/bash

# Add redirects to netlify.toml for individual pages
# Main pages stay as full Dutch HTML, individual pages use ?lang=nl parameter

echo "🔧 Setting up Netlify redirects for individual companion & category pages..."

# Backup netlify.toml
cp netlify.toml netlify.toml.backup

# Check if redirects already exist
if grep -q "from = \"/nl/companions/:slug\"" netlify.toml; then
    echo "ℹ️  Redirects already configured"
    exit 0
fi

# Add redirects for individual companion pages
cat >> netlify.toml << 'TOML'

# Dutch individual companion pages - use English HTML with ?lang=nl parameter
[[redirects]]
  from = "/nl/companions/:slug"
  to = "/companions/:slug?lang=nl"
  status = 200
  force = false

# Dutch individual category pages - use English HTML with ?lang=nl parameter  
[[redirects]]
  from = "/nl/categories/:slug"
  to = "/categories/:slug?lang=nl"
  status = 200
  force = false

# Keep main Dutch pages as separate HTML files
# /nl/ -> nl/index.html
# /nl/companions -> nl/companions.html (overview)
# /nl/categories -> nl/categories.html (overview)
# etc.
TOML

echo "✅ Redirects added to netlify.toml"
echo ""
echo "📋 Configuration:"
echo "   ✓ /nl/companions/:slug → /companions/:slug?lang=nl (uses Airtable NL data)"
echo "   ✓ /nl/categories/:slug → /categories/:slug?lang=nl (uses Airtable NL data)"
echo ""
echo "💡 Now you can delete nl/companions/* and nl/categories/* folders"
