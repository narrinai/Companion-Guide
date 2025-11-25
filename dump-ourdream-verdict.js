const fetch = require('node-fetch');
const fs = require('fs');
require('dotenv').config();

const AIRTABLE_TOKEN = process.env.AIRTABLE_TOKEN_CG;
const BASE_ID = 'appUwBhZ6sR4Grnbg';
const TABLE_ID = 'tblTYIfn48xFMPTcl';

async function dumpVerdict() {
  const url = `https://api.airtable.com/v0/${BASE_ID}/${TABLE_ID}`;
  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${AIRTABLE_TOKEN}`,
      'Content-Type': 'application/json'
    }
  });

  const data = await response.json();
  const records = data.records;

  const ourdream = records.find(r =>
    r.fields['name (from companion)']?.[0]?.toLowerCase().includes('ourdream') &&
    r.fields.language === 'en'
  );

  if (ourdream && ourdream.fields.my_verdict) {
    const verdict = ourdream.fields.my_verdict;

    // Save to file
    fs.writeFileSync('/tmp/ourdream-verdict.txt', verdict);
    console.log('✅ Verdict saved to /tmp/ourdream-verdict.txt');
    console.log(`Length: ${verdict.length} characters`);

    // Check for exact duplicates
    const half = Math.floor(verdict.length / 2);
    const firstHalf = verdict.substring(0, half);
    const secondHalf = verdict.substring(half);

    console.log(`\nFirst half: ${firstHalf.length} chars`);
    console.log(`Second half: ${secondHalf.length} chars`);
    console.log(`Are halves equal? ${firstHalf === secondHalf}`);

    // Search for specific repeated sections
    const lines = verdict.split('\n');
    console.log(`\nTotal lines: ${lines.length}`);
    console.log(`First line: ${lines[0]}`);
    console.log(`Middle line: ${lines[Math.floor(lines.length / 2)]}`);
    console.log(`Last line: ${lines[lines.length - 1]}`);
  }
}

dumpVerdict().catch(console.error);
