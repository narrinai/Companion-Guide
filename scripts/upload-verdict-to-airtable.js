#!/usr/bin/env node
/**
 * Upload Verdicts to Airtable
 *
 * Usage:
 *   node scripts/upload-verdict-to-airtable.js <record_id_en> <record_id_nl> <record_id_de> <record_id_pt>
 *
 * Example:
 *   node scripts/upload-verdict-to-airtable.js recKLQQShq9XfzaXa rec3IzIBEYZKHmF9K recaAgkrgF3LwjYYF recRpSnsdWGpxeqPn
 *
 * This script reads the temp-verdict-*.txt files and uploads them to Airtable.
 *
 * Environment variables required:
 *   AIRTABLE_TOKEN_CG - Your Airtable Personal Access Token
 *
 * The record IDs are from the Companion_Translations table (tblTYIfn48xFMPTcl)
 */

const fs = require('fs');
const https = require('https');

const AIRTABLE_BASE_ID = 'appUwBhZ6sR4Grnbg';
const AIRTABLE_TABLE_ID = 'tblTYIfn48xFMPTcl'; // Companion_Translations table

function uploadToAirtable(recordId, verdictText, lang) {
  return new Promise((resolve, reject) => {
    const token = process.env.AIRTABLE_TOKEN_CG;

    if (!token) {
      reject(new Error('AIRTABLE_TOKEN_CG environment variable not set'));
      return;
    }

    const payload = JSON.stringify({
      fields: {
        my_verdict: verdictText
      }
    });

    const options = {
      hostname: 'api.airtable.com',
      port: 443,
      path: `/v0/${AIRTABLE_BASE_ID}/${AIRTABLE_TABLE_ID}/${recordId}`,
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload)
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          if (response.error) {
            reject(new Error(`Airtable error for ${lang}: ${response.error.message}`));
          } else {
            resolve(response);
          }
        } catch (e) {
          reject(new Error(`Failed to parse response for ${lang}: ${data}`));
        }
      });
    });

    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}

async function main() {
  const args = process.argv.slice(2);

  if (args.length < 4) {
    console.log(`
Usage: node scripts/upload-verdict-to-airtable.js <record_id_en> <record_id_nl> <record_id_de> <record_id_pt>

Example:
  node scripts/upload-verdict-to-airtable.js recKLQQShq9XfzaXa rec3IzIBEYZKHmF9K recaAgkrgF3LwjYYF recRpSnsdWGpxeqPn

The record IDs come from the Companion_Translations table in Airtable.
You can find them by opening the record and looking at the URL.

Required files in current directory:
  - temp-verdict-en.txt
  - temp-verdict-nl.txt
  - temp-verdict-de.txt
  - temp-verdict-pt.txt
`);
    process.exit(1);
  }

  const [recordEN, recordNL, recordDE, recordPT] = args;

  // Check if files exist
  const files = {
    en: 'temp-verdict-en.txt',
    nl: 'temp-verdict-nl.txt',
    de: 'temp-verdict-de.txt',
    pt: 'temp-verdict-pt.txt'
  };

  for (const [lang, file] of Object.entries(files)) {
    if (!fs.existsSync(file)) {
      console.error(`Error: ${file} not found. Run create-companion-verdict.js first.`);
      process.exit(1);
    }
  }

  const records = {
    en: { id: recordEN, file: files.en },
    nl: { id: recordNL, file: files.nl },
    de: { id: recordDE, file: files.de },
    pt: { id: recordPT, file: files.pt }
  };

  console.log('\n=== Uploading verdicts to Airtable ===\n');

  for (const [lang, record] of Object.entries(records)) {
    try {
      const verdictText = fs.readFileSync(record.file, 'utf8');
      console.log(`Uploading ${lang.toUpperCase()} (${verdictText.length} chars) to ${record.id}...`);

      await uploadToAirtable(record.id, verdictText, lang);
      console.log(`  ✓ ${lang.toUpperCase()} uploaded successfully`);
    } catch (error) {
      console.error(`  ✗ ${lang.toUpperCase()} failed: ${error.message}`);
    }
  }

  console.log('\n=== Upload complete ===\n');
}

main().catch(console.error);
