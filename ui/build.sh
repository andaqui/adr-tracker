#!/bin/bash

# Create dist directory if it doesn't exist
mkdir -p ui/dist

# Combine JS files
cat ui/src/dashboard.js ui/src/dashboard-part2.js ui/src/dashboard-part3.js > ui/dist/dashboard.js

# Build CSS with Tailwind
npx tailwindcss -i ui/src/styles.css -o ui/dist/styles.css --minify

# Copy HTML file
cp ui/src/index.html ui/index.html

echo "Build completed successfully!"
