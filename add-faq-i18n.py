#!/usr/bin/env python3
"""
Add data-i18n attributes to FAQ questions and answers in category pages
"""

import re
import sys

def add_faq_i18n(filepath, category_key, num_faqs=10):
    """Add data-i18n to FAQ questions and answers"""

    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Find all FAQ items
    faq_pattern = r'(<div class="faq-item"[^>]*>.*?<h3 class="faq-question"[^>]*>)(.*?)(</h3>.*?<p itemprop="text">)(.*?)(</p>.*?</div>.*?</div>)'

    faq_matches = list(re.finditer(faq_pattern, content, re.DOTALL))

    print(f"Found {len(faq_matches)} FAQ items")

    # Update each FAQ with data-i18n attributes
    for i, match in enumerate(faq_matches, 1):
        if i > num_faqs:
            break

        old_text = match.group(0)

        # Extract parts
        before_question = match.group(1)
        question_text = match.group(2)
        between = match.group(3)
        answer_text = match.group(4)
        after_answer = match.group(5)

        # Add data-i18n to question (only if not already there)
        if 'data-i18n' not in before_question:
            new_before_question = before_question.replace(
                '<h3 class="faq-question"',
                f'<h3 class="faq-question" data-i18n="categoryPages.{category_key}.faqs.q{i}.question"'
            )
        else:
            new_before_question = before_question

        # Add data-i18n to answer (only if not already there)
        if 'data-i18n' not in between:
            new_between = between.replace(
                '<p itemprop="text">',
                f'<p itemprop="text" data-i18n="categoryPages.{category_key}.faqs.q{i}.answer">'
            )
        else:
            new_between = between

        new_text = new_before_question + question_text + new_between + answer_text + after_answer
        content = content.replace(old_text, new_text, 1)

        print(f"✓ Updated FAQ {i}")

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

    print(f"✓ Completed {filepath}")

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: python add-faq-i18n.py <filepath> <category_key> [num_faqs]")
        sys.exit(1)

    filepath = sys.argv[1]
    category_key = sys.argv[2]
    num_faqs = int(sys.argv[3]) if len(sys.argv) > 3 else 10

    add_faq_i18n(filepath, category_key, num_faqs)
