#!/usr/bin/env bash
# Build and run the C++/SDL2 Pacman game.
# Usage: bash run.sh   (or ./run.sh after chmod +x)

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo "=== Building Pacman (C++/SDL2) ==="
mkdir -p build
cd build
cmake ..
cmake --build .

echo ""
echo "=== Running Pacman ==="
./pacman
