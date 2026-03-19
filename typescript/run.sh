#!/usr/bin/env bash
# Build and launch the TypeScript Pacman game in a browser.

set -euo pipefail

# cd to the directory where this script lives
cd "$(dirname "$0")"

# Install dependencies if node_modules is missing
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm install
fi

# Build the bundle
echo "Building TypeScript bundle..."
npm run build

# Open index.html in the default browser
echo "Opening game in browser..."
if command -v xdg-open &> /dev/null; then
    xdg-open index.html
elif command -v open &> /dev/null; then
    open index.html
else
    echo "Cannot detect browser opener. Please open index.html manually."
fi
