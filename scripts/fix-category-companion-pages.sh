#!/bin/bash

# Fix category companion pages that are missing closing tags and scripts

CLOSING_SECTION='
    <script src="../js/i18n.js?v=20251023"></script>
    <script src="../script.js?v=20251023"></script>
    <script src="/js/companions.js?v=20251023"></script>
    <script src="/category-companions.js?v=20251023"></script>
    <script>
        // Load featured companions in footer
        document.addEventListener("DOMContentLoaded", async function() {
            if (typeof window.companionManager === "undefined") {
                window.companionManager = new CompanionManager();
            }
            try {
                await window.companionManager.renderFooterFeaturedCompanions("featured-companions-footer");
            } catch (error) {
                console.error("Error loading footer featured companions:", error);
            }
        });
    </script>
    <script src="/js/meta-companion-tracking.js?v=20251023"></script>
    <script src="/js/ga-external-tracking.js?v=20251023"></script>
</body>
</html>'

cd /Users/sebastiaansmits/Documents/AI-Companion-Reviews

# Find all category companion pages that end with </footer> (incomplete)
for file in categories/*-companions.html; do
    if [ -f "$file" ] && tail -1 "$file" | grep -q "</footer>"; then
        echo "Fixing: $file"

        # Append the closing section
        echo "$CLOSING_SECTION" >> "$file"

        echo "  ✅ Fixed $file"
    fi
done

echo ""
echo "✅ All category companion pages fixed!"
