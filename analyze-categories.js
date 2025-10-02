const fetch = require('node-fetch');

(async () => {
    const response = await fetch('https://companionguide.ai/.netlify/functions/companionguide-get');
    const data = await response.json();

    console.log('ANALYZING COMPANIONS FOR CATEGORY GAPS\n');
    console.log('='.repeat(80));

    // Current category counts
    const categoryCounts = {
        'video': 0,
        'image-gen': 0,
        'whatsapp': 0,
        'wellness': 0,
        'learning': 0
    };

    data.companions.forEach(c => {
        if (c.categories) {
            c.categories.forEach(cat => {
                if (categoryCounts.hasOwnProperty(cat)) categoryCounts[cat]++;
            });
        }
    });

    console.log('\nCURRENT CATEGORY COUNTS:');
    Object.entries(categoryCounts).forEach(([cat, count]) => {
        console.log(`  ${cat}: ${count} companions`);
    });

    console.log('\n' + '='.repeat(80));
    console.log('\nANALYZING FEATURES FOR MISSING CATEGORIES:\n');

    const suggestions = {};

    data.companions.forEach(companion => {
        const features = companion.features || [];
        const categories = companion.categories || [];
        const companionSuggestions = [];

        // Check for VIDEO features
        const hasVideoFeature = features.some(f =>
            f.title && (
                f.title.toLowerCase().includes('video') ||
                (f.description && f.description.toLowerCase().includes('video'))
            )
        );

        if (hasVideoFeature && !categories.includes('video')) {
            companionSuggestions.push('video');
        }

        // Check for IMAGE GEN features
        const hasImageGen = features.some(f =>
            f.title && (
                f.title.toLowerCase().includes('image') ||
                f.title.toLowerCase().includes('photo') ||
                f.title.toLowerCase().includes('picture') ||
                f.title.toLowerCase().includes('visual') ||
                f.title.toLowerCase().includes('art generation') ||
                (f.description && (
                    f.description.toLowerCase().includes('image gen') ||
                    f.description.toLowerCase().includes('photo gen') ||
                    f.description.toLowerCase().includes('generate image')
                ))
            )
        );

        if (hasImageGen && !categories.includes('image-gen')) {
            companionSuggestions.push('image-gen');
        }

        // Check for WELLNESS features
        const hasWellness = features.some(f =>
            f.title && (
                f.title.toLowerCase().includes('mental') ||
                f.title.toLowerCase().includes('wellness') ||
                f.title.toLowerCase().includes('therapy') ||
                f.title.toLowerCase().includes('emotional') ||
                f.title.toLowerCase().includes('support')
            )
        );

        if (hasWellness && !categories.includes('wellness')) {
            companionSuggestions.push('wellness');
        }

        // Check for LEARNING features
        const hasLearning = features.some(f =>
            f.title && (
                f.title.toLowerCase().includes('learn') ||
                f.title.toLowerCase().includes('education') ||
                f.title.toLowerCase().includes('tutor') ||
                f.title.toLowerCase().includes('teach')
            )
        );

        if (hasLearning && !categories.includes('learning')) {
            companionSuggestions.push('learning');
        }

        if (companionSuggestions.length > 0) {
            suggestions[companion.name] = {
                current: categories,
                suggested: companionSuggestions,
                features: features.slice(0, 4)
            };
        }
    });

    // Print suggestions by category
    console.log('\n📹 VIDEO CATEGORY SUGGESTIONS:');
    console.log('-'.repeat(80));
    Object.entries(suggestions).forEach(([name, info]) => {
        if (info.suggested.includes('video')) {
            console.log(`\n${name}:`);
            console.log(`  Current: [${info.current.join(', ')}]`);
            console.log(`  Features with video:`);
            info.features.forEach(f => {
                if (f.title.toLowerCase().includes('video') ||
                    (f.description && f.description.toLowerCase().includes('video'))) {
                    console.log(`    ✓ ${f.title}: ${f.description}`);
                }
            });
        }
    });

    console.log('\n\n🎨 IMAGE-GEN CATEGORY SUGGESTIONS:');
    console.log('-'.repeat(80));
    Object.entries(suggestions).forEach(([name, info]) => {
        if (info.suggested.includes('image-gen')) {
            console.log(`\n${name}:`);
            console.log(`  Current: [${info.current.join(', ')}]`);
            console.log(`  Features with image generation:`);
            info.features.forEach(f => {
                const hasImageKeyword = f.title.toLowerCase().includes('image') ||
                                       f.title.toLowerCase().includes('photo') ||
                                       f.title.toLowerCase().includes('picture') ||
                                       f.title.toLowerCase().includes('visual') ||
                                       (f.description && (
                                           f.description.toLowerCase().includes('image') ||
                                           f.description.toLowerCase().includes('photo')
                                       ));
                if (hasImageKeyword) {
                    console.log(`    ✓ ${f.title}: ${f.description}`);
                }
            });
        }
    });

    console.log('\n\n🧠 WELLNESS CATEGORY SUGGESTIONS:');
    console.log('-'.repeat(80));
    Object.entries(suggestions).forEach(([name, info]) => {
        if (info.suggested.includes('wellness')) {
            console.log(`\n${name}:`);
            console.log(`  Current: [${info.current.join(', ')}]`);
            console.log(`  Wellness-related features:`);
            info.features.forEach(f => {
                console.log(`    - ${f.title}: ${f.description}`);
            });
        }
    });

    console.log('\n\n📚 LEARNING CATEGORY SUGGESTIONS:');
    console.log('-'.repeat(80));
    Object.entries(suggestions).forEach(([name, info]) => {
        if (info.suggested.includes('learning')) {
            console.log(`\n${name}:`);
            console.log(`  Current: [${info.current.join(', ')}]`);
            console.log(`  Learning-related features:`);
            info.features.forEach(f => {
                console.log(`    - ${f.title}: ${f.description}`);
            });
        }
    });

    console.log('\n\n' + '='.repeat(80));
    console.log('\nSUMMARY:');
    const videoSuggestions = Object.values(suggestions).filter(s => s.suggested.includes('video')).length;
    const imageGenSuggestions = Object.values(suggestions).filter(s => s.suggested.includes('image-gen')).length;
    const wellnessSuggestions = Object.values(suggestions).filter(s => s.suggested.includes('wellness')).length;
    const learningSuggestions = Object.values(suggestions).filter(s => s.suggested.includes('learning')).length;

    console.log(`  Video: ${categoryCounts.video} companions → ${categoryCounts.video + videoSuggestions} with suggestions (+${videoSuggestions})`);
    console.log(`  Image-gen: ${categoryCounts['image-gen']} companions → ${categoryCounts['image-gen'] + imageGenSuggestions} with suggestions (+${imageGenSuggestions})`);
    console.log(`  Wellness: ${categoryCounts.wellness} companions → ${categoryCounts.wellness + wellnessSuggestions} with suggestions (+${wellnessSuggestions})`);
    console.log(`  Learning: ${categoryCounts.learning} companions → ${categoryCounts.learning + learningSuggestions} with suggestions (+${learningSuggestions})`);

})();
