#!/usr/bin/env python3
"""
Clean nl/pt category companion pages by removing scripts between FAQ schema and footer.
Keep only: content up to FAQ schema end → footer → new scripts → </body></html>
"""

import re
import glob

def clean_page(filepath):
    print(f"Cleaning: {filepath}")

    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Find FAQ schema end (the </script> that closes the JSON-LD)
    # Look for the pattern: } followed by optional whitespace and </script>
    faq_schema_pattern = r'}\s*</script>'
    faq_matches = list(re.finditer(faq_schema_pattern, content))

    if not faq_matches:
        print(f"  ⚠️  No FAQ schema found in {filepath}")
        return

    # Get the last match (should be the FAQ schema)
    faq_end = faq_matches[-1].end()

    # Find the footer start after FAQ schema
    footer_match = re.search(r'<footer', content[faq_end:])
    if not footer_match:
        print(f"  ⚠️  No footer found after FAQ schema in {filepath}")
        return

    footer_start = faq_end + footer_match.start()

    # Find footer end
    footer_end_match = re.search(r'</footer>', content[footer_start:])
    if not footer_end_match:
        print(f"  ⚠️  No footer end found in {filepath}")
        return

    footer_end = footer_start + footer_end_match.end()

    # Extract the parts we want to keep
    before_footer = content[:faq_end]
    footer_section = content[footer_start:footer_end]

    # Build clean structure
    clean_content = f"""{before_footer}

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

    # Write cleaned content
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(clean_content)

    print(f"  ✅ Cleaned {filepath}")

def main():
    # Clean all nl and pt category companion pages
    for pattern in ['nl/categories/*-companions.html', 'pt/categories/*-companions.html']:
        for filepath in glob.glob(pattern):
            try:
                clean_page(filepath)
            except Exception as e:
                print(f"  ❌ Error cleaning {filepath}: {e}")

    print("\n✅ All category companion pages cleaned!")

if __name__ == "__main__":
    main()
