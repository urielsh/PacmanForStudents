#!/bin/bash
set -e

# ────────────────────────────────────────────────────────────────
# build-python-wasm.sh
# Builds the Python/Pygame Pacman game for the web using pygbag.
#
# pygbag compiles a Pygame project into a WebAssembly + JS bundle
# that runs inside an HTML page served from a local web server.
#
# Prerequisites:
#   pip install pygbag
# ────────────────────────────────────────────────────────────────

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../../.." && pwd)"
PYTHON_SRC="$PROJECT_ROOT/python"
WEB_MAIN="$PROJECT_ROOT/website/backend/wasm/python/web_main.py"
PYGBAG_TOML="$PROJECT_ROOT/website/backend/wasm/python/pygbag.toml"
OUTPUT_DIR="$PROJECT_ROOT/website/frontend/public/game/python"
BUILD_DIR="$(mktemp -d)"

# ── Pre-flight checks ──────────────────────────────────────────

if ! command -v pygbag &>/dev/null; then
    echo "ERROR: pygbag is not installed."
    echo "Install it with:  pip install pygbag"
    exit 1
fi

echo "==> Preparing build directory: $BUILD_DIR"

# ── Copy all Python source files into the temp build dir ───────

cp "$PYTHON_SRC"/maze.py       "$BUILD_DIR/"
cp "$PYTHON_SRC"/pacman.py     "$BUILD_DIR/"
cp "$PYTHON_SRC"/ghost.py      "$BUILD_DIR/"
cp "$PYTHON_SRC"/game_logic.py "$BUILD_DIR/"
cp "$PYTHON_SRC"/game_panel.py "$BUILD_DIR/"

# Replace the original main.py with the async web_main.py.
# pygbag expects the entry point to be named main.py.
cp "$WEB_MAIN" "$BUILD_DIR/main.py"

# Copy pygbag configuration
cp "$PYGBAG_TOML" "$BUILD_DIR/pygbag.toml"

echo "==> Building with pygbag..."

# pygbag --build generates the web build in <dir>/build/web/
pygbag --build "$BUILD_DIR"

# ── Copy output to the public game directory ───────────────────

echo "==> Copying build output to $OUTPUT_DIR"
mkdir -p "$OUTPUT_DIR"

# pygbag outputs the web build into build/web/ under the source directory
if [ -d "$BUILD_DIR/build/web" ]; then
    cp -r "$BUILD_DIR/build/web/"* "$OUTPUT_DIR/"
else
    echo "ERROR: pygbag build output not found at $BUILD_DIR/build/web/"
    echo "Listing $BUILD_DIR contents for debugging:"
    find "$BUILD_DIR" -type f | head -30
    rm -rf "$BUILD_DIR"
    exit 1
fi

# ── Cleanup ────────────────────────────────────────────────────

rm -rf "$BUILD_DIR"

echo "==> Python WASM build complete. Output at: $OUTPUT_DIR"
