#!/bin/bash

# Script to reorder companion page sections:
# Move "Similar Alternatives" section to after "Pros & Cons" and before "Our Verdict"

for file in companions/*.html; do
    echo "Processing: $file"

    # Run Python script with filename as argument
    python3 - "$file" <<'EOF'
import sys
import re

filename = sys.argv[1]

with open(filename, 'r', encoding='utf-8') as f:
    content = f.read()

# Find the pros-cons section end
pros_cons_pattern = r'(<section class="pros-cons">.*?</section>)\s*'
# Find the alternatives section (anywhere in the file)
alternatives_pattern = r'\s*(<section class="alternatives">.*?</section>)\s*'
# Find the verdict section start
verdict_pattern = r'(<section class="verdict">)'

# Extract the alternatives section
alternatives_match = re.search(alternatives_pattern, content, re.DOTALL)
if not alternatives_match:
    print(f"No alternatives section found in {filename}")
    sys.exit(0)

alternatives_section = alternatives_match.group(1)

# Check if alternatives is already after pros-cons
pros_cons_match = re.search(pros_cons_pattern, content, re.DOTALL)
verdict_match = re.search(verdict_pattern, content, re.DOTALL)

if pros_cons_match and verdict_match:
    pros_cons_end = pros_cons_match.end()
    alternatives_start = alternatives_match.start()
    verdict_start = verdict_match.start()

    # If alternatives is already between pros-cons and verdict, skip
    if pros_cons_end < alternatives_start < verdict_start:
        print(f"Alternatives already in correct position in {filename}")
        sys.exit(0)

# Remove the alternatives section from its current location
content_without_alternatives = re.sub(alternatives_pattern, '', content, count=1, flags=re.DOTALL)

# Insert alternatives after pros-cons section
# Find pros-cons section end in the modified content
pros_cons_match = re.search(pros_cons_pattern, content_without_alternatives, re.DOTALL)

if pros_cons_match:
    insert_position = pros_cons_match.end()
    new_content = (
        content_without_alternatives[:insert_position] +
        '\n        ' + alternatives_section + '\n' +
        content_without_alternatives[insert_position:]
    )

    with open(filename, 'w', encoding='utf-8') as f:
        f.write(new_content)

    print(f"✓ Reordered sections in {filename}")
else:
    print(f"Could not find pros-cons section in {filename}")

EOF

done

echo "Done! All companion pages have been reordered."
