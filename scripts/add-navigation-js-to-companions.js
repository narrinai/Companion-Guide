#!/usr/bin/env node

/**
 * Add navigation.js to all PT and NL companion pages
 */

const fs = require('fs');
const path = require('path');

const directories = ['pt/companions', 'nl/companions'];

let filesUpdated = 0;
let filesSkipped = 0;

for (const dir of directories) {
    const dirPath = path.join(__dirname, '..', dir);

    if (!fs.existsSync(dirPath)) {
        console.log(`⚠️  Directory not found: ${dirPath}`);
        continue;
    }

    const files = fs.readdirSync(dirPath).filter(f => f.endsWith('.html'));

    console.log(`\n📁 Processing ${dir} (${files.length} files)...`);

    for (const file of files) {
        const filePath = path.join(dirPath, file);
        let content = fs.readFileSync(filePath, 'utf-8');

        // Check if navigation.js already exists
        if (content.includes('navigation.js')) {
            filesSkipped++;
            continue;
        }

        // Find where to insert navigation.js
        // Should be after i18n.js or before companion-page.js
        const i18nMatch = content.match(/(<script src="[^"]*i18n\.js[^"]*"><\/script>)/);

        if (i18nMatch) {
            // Insert after i18n.js
            const insertAfter = i18nMatch[0];
            const navigationScript = '\n    <script src="/js/navigation.js"></script>';

            content = content.replace(insertAfter, insertAfter + navigationScript);

            fs.writeFileSync(filePath, content, 'utf-8');
            filesUpdated++;
            console.log(`  ✅ ${file}`);
        } else {
            console.log(`  ⚠️  ${file} - Could not find i18n.js`);
            filesSkipped++;
        }
    }
}

console.log(`\n📊 Summary:`);
console.log(`  ✅ Updated: ${filesUpdated}`);
console.log(`  ⏭️  Skipped: ${filesSkipped}`);
console.log(`  📦 Total: ${filesUpdated + filesSkipped}`);
