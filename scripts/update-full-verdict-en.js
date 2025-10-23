#!/usr/bin/env node

/**
 * Update my_verdict field with FULL verdict content including personal experience
 * Extracts both the verdict section and the entire personal experience section
 */

const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');
const Airtable = require('airtable');

require('dotenv').config();

const COMPANIONS_DIR = path.join(__dirname, '../companions');

const base = new Airtable({ apiKey: process.env.AIRTABLE_TOKEN_CG })
  .base(process.env.AIRTABLE_BASE_ID_CG);

const COMPANIONS_TABLE = process.env.AIRTABLE_TABLE_ID_CG;
const TRANSLATIONS_TABLE = process.env.AIRTABLE_TRANSLATIONS_TABLE_ID_CG;

/**
 * Extract full my_verdict from HTML file including verdict + personal experience + pros/cons
 */
function extractFullVerdictFromHTML(htmlPath) {
  const html = fs.readFileSync(htmlPath, 'utf-8');
  const dom = new JSDOM(html);
  const document = dom.window.document;

  const sections = [];

  // 1. Extract verdict section
  const verdictSection = document.querySelector('.verdict, section.verdict');
  if (verdictSection) {
    const heading = verdictSection.querySelector('h3');
    if (heading) {
      sections.push(heading.textContent.trim());
    }

    const paragraphs = Array.from(verdictSection.querySelectorAll('.verdict-text p, p'))
      .map(p => p.textContent.trim())
      .filter(p => p && !p.includes('Ready to Try') && !p.includes('Our Verdict'));

    sections.push(...paragraphs);
  }

  // 2. Extract personal experience section (full content)
  const personalExpSection = document.querySelector('.personal-experience, section.personal-experience');
  if (personalExpSection) {
    const mainHeading = personalExpSection.querySelector('h2');
    if (mainHeading) {
      sections.push('\n' + mainHeading.textContent.trim());
    }

    // Get all text content from the personal experience section
    const allElements = personalExpSection.querySelectorAll('p, h3, h4, li');
    let currentText = '';

    for (const element of allElements) {
      const text = element.textContent.trim();
      if (!text) continue;

      if (element.tagName === 'H3') {
        if (currentText) sections.push(currentText);
        sections.push('\n' + text);
        currentText = '';
      } else if (element.tagName === 'H4') {
        if (currentText) sections.push(currentText);
        sections.push(text);
        currentText = '';
      } else if (element.tagName === 'LI') {
        sections.push('- ' + text);
      } else {
        sections.push(text);
      }
    }
    if (currentText) sections.push(currentText);
  }

  // 3. Extract pros section (titled section)
  const prosSection = document.querySelector('.pros, section.pros');
  if (prosSection) {
    const heading = prosSection.querySelector('h3, h2');
    if (heading && heading.textContent.toLowerCase().includes('pros')) {
      sections.push('\n' + heading.textContent.trim());

      const prosList = prosSection.querySelectorAll('li');
      for (const item of prosList) {
        const text = item.textContent.trim();
        if (text) {
          sections.push(text);
        }
      }
    }
  }

  return sections.join('\n\n');
}

/**
 * Find companion record ID by slug
 */
async function findCompanionRecordId(slug) {
  try {
    const records = await base(COMPANIONS_TABLE)
      .select({
        filterByFormula: `{slug} = "${slug}"`,
        maxRecords: 1
      })
      .all();

    return records.length > 0 ? records[0].id : null;
  } catch (error) {
    console.error(`Error finding companion ${slug}:`, error.message);
    return null;
  }
}

/**
 * Get all English translation records (cached)
 */
let allEnglishRecords = null;

async function getAllEnglishTranslations() {
  if (allEnglishRecords) {
    return allEnglishRecords;
  }

  try {
    allEnglishRecords = await base(TRANSLATIONS_TABLE)
      .select({
        filterByFormula: '{language} = "en"'
      })
      .all();

    return allEnglishRecords;
  } catch (error) {
    console.error('Error fetching English translations:', error.message);
    return [];
  }
}

/**
 * Get English translation record for a specific companion
 */
async function getEnglishTranslation(companionRecordId) {
  const allRecords = await getAllEnglishTranslations();

  return allRecords.find(record => {
    const companionIds = record.fields.companion || [];
    return companionIds.includes(companionRecordId);
  }) || null;
}

/**
 * Update English translation with my_verdict
 */
async function updateEnglishTranslation(recordId, myVerdict) {
  try {
    await base(TRANSLATIONS_TABLE).update([
      {
        id: recordId,
        fields: {
          my_verdict: myVerdict
        }
      }
    ]);
    return true;
  } catch (error) {
    console.error('Error updating translation:', error.message);
    return false;
  }
}

/**
 * Main function
 */
async function main() {
  console.log('\n📝 Updating FULL my_verdict in English Translation Records\n');
  console.log('This includes: verdict + personal experience + pros\n');

  const files = fs.readdirSync(COMPANIONS_DIR);
  const htmlFiles = files.filter(file => file.endsWith('.html'));

  // Filter to specific files if provided as argument
  let filesToProcess = htmlFiles;
  if (process.argv[2]) {
    const slugPattern = process.argv[2];
    filesToProcess = htmlFiles.filter(f => f.includes(slugPattern));
    console.log(`🎯 Filtering to files matching: ${slugPattern}`);
  }

  console.log(`Found ${filesToProcess.length} companion HTML files to process\n`);

  let successCount = 0;
  let skipCount = 0;
  let errorCount = 0;

  for (const file of filesToProcess) {
    const slug = file.replace('.html', '');
    const htmlPath = path.join(COMPANIONS_DIR, file);

    console.log(`\n📄 Processing: ${slug}`);

    try {
      // Extract FULL my_verdict from HTML
      const myVerdict = extractFullVerdictFromHTML(htmlPath);

      if (!myVerdict || myVerdict.length < 100) {
        console.log('   ⏭️  No verdict found or too short in HTML - skipping');
        skipCount++;
        continue;
      }

      console.log(`   📏 Extracted ${myVerdict.length} characters`);

      // Find companion record ID
      const companionRecordId = await findCompanionRecordId(slug);

      if (!companionRecordId) {
        console.log('   ❌ Companion not found in Airtable');
        errorCount++;
        continue;
      }

      // Get English translation record
      const englishRecord = await getEnglishTranslation(companionRecordId);

      if (!englishRecord) {
        console.log('   ❌ No English translation record found');
        errorCount++;
        continue;
      }

      const currentVerdict = englishRecord.fields.my_verdict || '';
      console.log(`   📊 Current verdict length: ${currentVerdict.length} characters`);

      // Always update to get full content
      console.log('   ✍️  Updating with FULL verdict...');
      const success = await updateEnglishTranslation(englishRecord.id, myVerdict);

      if (success) {
        console.log('   ✅ Updated successfully');
        successCount++;
      } else {
        console.log('   ❌ Update failed');
        errorCount++;
      }

      // Rate limiting
      await new Promise(resolve => setTimeout(resolve, 200));

    } catch (error) {
      console.error(`   ❌ Error processing ${slug}:`, error.message);
      errorCount++;
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log(`\n✅ Done!`);
  console.log(`   Processed: ${filesToProcess.length} companions`);
  console.log(`   Updated: ${successCount}`);
  console.log(`   Skipped: ${skipCount}`);
  console.log(`   Errors: ${errorCount}`);
  console.log('\n');
}

main();
