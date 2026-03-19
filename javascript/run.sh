#!/usr/bin/env bash
# Launch the Pacman game in a browser

cd "$(dirname "$0")"

if command -v xdg-open &>/dev/null; then
    echo "Opening index.html with xdg-open..."
    xdg-open index.html
elif command -v open &>/dev/null; then
    echo "Opening index.html with open..."
    open index.html
else
    echo "No browser launcher found (tried xdg-open, open)."
    echo ""
    echo "You can serve the game locally with:"
    echo "  cd $(pwd)"
    echo "  python3 -m http.server 8000"
    echo ""
    echo "Then open http://localhost:8000 in your browser."
    exit 1
fi
