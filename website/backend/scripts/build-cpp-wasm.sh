#!/bin/bash
# ============================================================================
# Build script: Pacman C++/SDL2 → WebAssembly via Emscripten
# ============================================================================
# Prerequisites:
#   - Emscripten SDK installed and activated (source emsdk_env.sh)
#   - cmake >= 3.14
#
# Output files are copied to website/frontend/public/game/cpp/
# ============================================================================

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/../../.." && pwd)"
WASM_DIR="${PROJECT_ROOT}/website/backend/wasm/cpp"
BUILD_DIR="${WASM_DIR}/build"
OUTPUT_DIR="${PROJECT_ROOT}/website/frontend/public/game/cpp"

echo "=== Pacman C++/SDL2 → WebAssembly Build ==="
echo "Project root : ${PROJECT_ROOT}"
echo "WASM config  : ${WASM_DIR}"
echo "Build dir    : ${BUILD_DIR}"
echo "Output dir   : ${OUTPUT_DIR}"
echo ""

# ---------------------------------------------------------------------------
# 1. Check that Emscripten is available
# ---------------------------------------------------------------------------
if ! command -v emcc &> /dev/null; then
    echo "ERROR: emcc not found in PATH."
    echo "Install and activate the Emscripten SDK first:"
    echo "  git clone https://github.com/emscripten-core/emsdk.git"
    echo "  cd emsdk && ./emsdk install latest && ./emsdk activate latest"
    echo "  source emsdk_env.sh"
    exit 1
fi

EMCC_VERSION=$(emcc --version | head -n1)
echo "Found Emscripten: ${EMCC_VERSION}"
echo ""

# ---------------------------------------------------------------------------
# 2. Create / clean the build directory
# ---------------------------------------------------------------------------
mkdir -p "${BUILD_DIR}"
cd "${BUILD_DIR}"

# ---------------------------------------------------------------------------
# 3. Configure with emcmake (Emscripten CMake wrapper)
# ---------------------------------------------------------------------------
# CMake requires the entry file to be named CMakeLists.txt.
# We symlink CMakeLists.emscripten.txt → CMakeLists.txt in the WASM dir
# so the explicitly-named overlay file is used while satisfying CMake.
if [ ! -f "${WASM_DIR}/CMakeLists.txt" ]; then
    ln -sf CMakeLists.emscripten.txt "${WASM_DIR}/CMakeLists.txt"
fi

echo "--- Configuring CMake (Emscripten) ---"
emcmake cmake "${WASM_DIR}" \
    -DCMAKE_BUILD_TYPE=Release

# ---------------------------------------------------------------------------
# 4. Build with emmake
# ---------------------------------------------------------------------------
echo ""
echo "--- Building ---"
emmake make -j"$(nproc 2>/dev/null || echo 4)"

# ---------------------------------------------------------------------------
# 5. Copy output files to the frontend public directory
# ---------------------------------------------------------------------------
echo ""
echo "--- Copying output to ${OUTPUT_DIR} ---"
mkdir -p "${OUTPUT_DIR}"

# Emscripten produces: pacman_wasm.html, pacman_wasm.js, pacman_wasm.wasm
# We copy the HTML as index.html for convenience, plus the JS and WASM files.
if [ -f "${BUILD_DIR}/pacman_wasm.html" ]; then
    cp "${BUILD_DIR}/pacman_wasm.html" "${OUTPUT_DIR}/index.html"
fi

if [ -f "${BUILD_DIR}/pacman_wasm.js" ]; then
    cp "${BUILD_DIR}/pacman_wasm.js" "${OUTPUT_DIR}/pacman_wasm.js"
fi

if [ -f "${BUILD_DIR}/pacman_wasm.wasm" ]; then
    cp "${BUILD_DIR}/pacman_wasm.wasm" "${OUTPUT_DIR}/pacman_wasm.wasm"
fi

# Also copy .data file if Emscripten generated one (for preloaded assets)
if [ -f "${BUILD_DIR}/pacman_wasm.data" ]; then
    cp "${BUILD_DIR}/pacman_wasm.data" "${OUTPUT_DIR}/pacman_wasm.data"
fi

echo ""
echo "=== Build complete ==="
echo "Output files:"
ls -lh "${OUTPUT_DIR}"/pacman_wasm.* "${OUTPUT_DIR}"/index.html 2>/dev/null || echo "(no output files found)"
echo ""
echo "To serve locally:  cd ${OUTPUT_DIR} && python3 -m http.server 8080"
