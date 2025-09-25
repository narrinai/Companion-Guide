#!/bin/bash

# Meta Pixel Code to add (as a separate file)
cat > meta_pixel_temp.txt << 'EOF'
    <!-- Meta Pixel Code -->
    <script>
    !function(f,b,e,v,n,t,s)
    {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
    n.callMethod.apply(n,arguments):n.queue.push(arguments)};
    if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
    n.queue=[];t=b.createElement(e);t.async=!0;
    t.src=v;s=b.getElementsByTagName(e)[0];
    s.parentNode.insertBefore(t,s)}(window, document,'script',
    'https://connect.facebook.net/en_US/fbevents.js');
    fbq('init', '1384707780100464');
    fbq('track', 'PageView');
    </script>
    <noscript><img height="1" width="1" style="display:none"
    src="https://www.facebook.com/tr?id=1384707780100464&ev=PageView&noscript=1"
    /></noscript>
    <!-- End Meta Pixel Code -->
EOF

# Get all HTML files (excluding node_modules and .netlify)
find . -name "*.html" -not -path "./node_modules/*" -not -path "./.netlify/*" -type f | while read -r file; do
    # Check if file already contains the Meta Pixel Code
    if ! grep -q "1384707780100464" "$file"; then
        echo "Adding Meta Pixel Code to: $file"
        # Use awk to insert before </head>
        awk '
        /<\/head>/ {
            while ((getline line < "meta_pixel_temp.txt") > 0) {
                print line
            }
            close("meta_pixel_temp.txt")
        }
        { print }
        ' "$file" > "$file.tmp" && mv "$file.tmp" "$file"
    else
        echo "Meta Pixel Code already exists in: $file"
    fi
done

# Clean up temp file
rm -f meta_pixel_temp.txt

echo "Meta Pixel Code installation complete!"