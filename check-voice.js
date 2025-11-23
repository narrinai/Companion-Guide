const https = require('http');

https.get('http://localhost:8888/.netlify/functions/companionguide-get?lang=pt', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    try {
      const companions = JSON.parse(data);
      console.log('Total companions:', companions.length);
      console.log('\nCompanions with voice category:');
      companions.forEach(c => {
        if (c.categories && c.categories.includes('voice')) {
          let featuresInfo = 'no features';
          if (c.features) {
            if (typeof c.features === 'string') {
              try {
                const parsed = JSON.parse(c.features);
                featuresInfo = `${parsed.length} features (string)`;
              } catch (e) {
                featuresInfo = `ERROR parsing: ${e.message}`;
              }
            } else if (Array.isArray(c.features)) {
              featuresInfo = `${c.features.length} features (array)`;
            }
          }
          console.log(`- ${c.name}: ${featuresInfo}`);
        }
      });
    } catch (e) {
      console.error('Error:', e.message);
    }
  });
});
