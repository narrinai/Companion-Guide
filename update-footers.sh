#!/bin/bash

# Footer content to replace with
footer_content='    <footer>
        <div class="container">
            <div class="footer-content">
                <div class="footer-section">
                    <h4>Companion Guide</h4>
                    <p>Your trusted source for AI companion reviews and guides</p>
                </div>
                <div class="footer-section">
                    <h4>Navigation</h4>
                    <ul>
                        <li><a href="/">Home</a></li>
                        <li><a href="/companions">Companions</a></li>
                        <li><a href="/categories">Categories</a></li>
                        <li><a href="/news">News & Insights</a></li>
                        <li><a href="/companions-az">Companions A-Z</a></li>
                        <li><a href="/contact">Contact</a></li>
                    </ul>
                </div>
                <div class="footer-section">
                    <h4>Featured AI Companions</h4>
                    <ul>
                        <li><a href="/companions/hammer-ai">Hammer AI</a></li>
                        <li><a href="/companions/narrin-ai">Narrin AI</a></li>
                        <li><a href="/companions/candy-ai">Candy AI</a></li>
                        <li><a href="/companions/fantasygf-ai">FantasyGF</a></li>
                        <li><a href="/companions/dreamgf-ai">DreamGF</a></li>
                        <li><a href="/companions/secrets-ai">Secrets AI</a></li>
                    </ul>
                </div>
                <div class="footer-section">
                    <h4>Featured Guides</h4>
                    <ul>
                        <li><a href="/news/dreamgf-ai-complete-review-2025">DreamGF AI Complete Guide</a></li>
                        <li><a href="/news/replika-ai-comprehensive-review-2025">Replika Complete Guide</a></li>
                        <li><a href="/news/character-ai-complete-guide-2025">Character AI Review Guide</a></li>
                        <li><a href="/news/fantasygf-ai-complete-guide-2025">FantasyGF Guide</a></li>
                        <li><a href="/news/ai-sex-chat-comprehensive-guide-2025">Complete Guide to NSFW AI Platforms</a></li>
                    </ul>
                </div>
            </div>
            <div class="footer-bottom">
                <p>&copy; 2025 Companion Guide. All rights reserved.</p>
            </div>
        </div>
    </footer>'

# Process each HTML file in categories folder
for file in categories/*.html; do
    echo "Updating footer in: $(basename $file)"

    # Create a temporary file
    temp_file="${file}.tmp"

    # Extract everything before footer
    awk '/<footer>/{exit} {print}' "$file" > "$temp_file"

    # Add new footer
    echo "$footer_content" >> "$temp_file"

    # Add closing tags
    echo "" >> "$temp_file"
    echo "    <script src=\"../script.js\"></script>" >> "$temp_file"
    echo "</body>" >> "$temp_file"
    echo "</html>" >> "$temp_file"

    # Replace original file
    mv "$temp_file" "$file"
done

echo "All category page footers updated!"