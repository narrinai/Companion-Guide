#!/usr/bin/env python3
"""
Restructure category companion pages to have proper HTML structure:
<body>
  <header>...</header>
  <main>...</main>
  <footer>...</footer>
  <scripts>
</body>
</html>
"""

import re
import os
import glob

def restructure_page(filepath):
    print(f"Processing: {filepath}")

    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Find the FAQ schema end (</script> after FAQ schema)
    faq_schema_end = content.rfind('</script>', 0, content.find('<footer'))

    if faq_schema_end == -1:
        print(f"  ⚠️  Could not find FAQ schema end in {filepath}")
        return

    # Find footer start
    footer_start = content.find('<footer', faq_schema_end)
    if footer_start == -1:
        print(f"  ⚠️  Could not find footer in {filepath}")
        return

    # Find footer end
    footer_end = content.find('</footer>', footer_start)
    if footer_end == -1:
        print(f"  ⚠️  Could not find footer end in {filepath}")
        return
    footer_end += len('</footer>')

    # Extract parts
    before_scripts = content[:faq_schema_end + len('</script>')]
    footer_section = content[footer_start:footer_end]

    # Build proper structure
    proper_structure = f"""{before_scripts}

    {footer_section}

    <script src="/js/i18n.js?v=20251023"></script>
    <script src="/script.js?v=20251023"></script>
    <script src="/js/companions.js?v=20251023"></script>
    <script src="/category-companions.js?v=20251023"></script>
    <script src="/faq-interactions.js?v=20251023"></script>
    <script src="/js/faq-dynamic-ratings.js?v=20251023"></script>
    <script>
        // Load featured companions in footer
        document.addEventListener("DOMContentLoaded", async function() {{
            if (typeof window.companionManager === "undefined") {{
                window.companionManager = new CompanionManager();
            }}
            try {{
                await window.companionManager.renderFooterFeaturedCompanions("featured-companions-footer");
            }} catch (error) {{
                console.error("Error loading footer featured companions:", error);
            }}
        }});
    </script>
    <script src="/js/meta-companion-tracking.js?v=20251023"></script>
    <script src="/js/ga-external-tracking.js?v=20251023"></script>
</body>
</html>
"""

    # Write the restructured content
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(proper_structure)

    print(f"  ✅ Fixed {filepath}")

def main():
    os.chdir('/Users/sebastiaansmits/Documents/AI-Companion-Reviews')

    # Process all *-companions.html files in categories/
    for filepath in glob.glob('categories/*-companions.html'):
        try:
            restructure_page(filepath)
        except Exception as e:
            print(f"  ❌ Error processing {filepath}: {e}")

    print("\n✅ All category companion pages restructured!")

if __name__ == "__main__":
    main()
