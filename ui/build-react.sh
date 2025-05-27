#!/bin/bash

# Install dependencies if node_modules doesn't exist or if package.json has changed
echo "Installing dependencies..."
npm install

# Build the React application
echo "Building React application..."
npm run build

# Copy the sample report to the dist folder
echo "Copying sample report to dist folder..."
cp ui/sample-report.json ui/dist/

echo "Build completed successfully!"
echo "To start a development server, run: npm run dev"
