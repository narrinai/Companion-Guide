#!/bin/bash

# Limit index pages to show only first 10 news articles

for file in index.html nl/index.html pt/index.html de/index.html; do
    if [ ! -f "$file" ]; then
        echo "⚠️  Skipping $file - not found"
        continue
    fi

    # Count current articles
    count=$(grep -c '<article class="news-card' "$file")
    echo "📰 $file currently has $count articles"

    if [ "$count" -le 10 ]; then
        echo "✅ $file already has 10 or fewer articles"
        continue
    fi

    # Find line numbers of all <article class="news-card" tags
    article_lines=$(grep -n '<article class="news-card' "$file" | cut -d: -f1)

    # Get the 11th article line number
    article_11_line=$(echo "$article_lines" | sed -n '11p')

    if [ -z "$article_11_line" ]; then
        echo "✅ $file has 10 or fewer articles"
        continue
    fi

    # Find the news-grid closing tag after article 10
    news_grid_close=$(awk "NR>=$article_11_line" "$file" | grep -n "^            </div>" | head -1 | cut -d: -f1)

    if [ -z "$news_grid_close" ]; then
        echo "⚠️  Could not find closing tag for $file"
        continue
    fi

    # Calculate the actual line to delete until (subtract 1 for the closing tag)
    delete_until=$((article_11_line + news_grid_close - 2))

    echo "  Deleting lines $article_11_line to $delete_until"

    # Delete the lines
    sed -i.bak "${article_11_line},${delete_until}d" "$file"

    # Verify
    new_count=$(grep -c '<article class="news-card' "$file")
    echo "✅ $file now has $new_count articles (removed $((count - new_count)))"
done

echo ""
echo "✨ Done! All index pages now show maximum 10 news articles."
