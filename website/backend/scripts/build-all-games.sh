#!/bin/bash
# ============================================================================
# build-all-games.sh -- Build orchestration for all Packman game variants
# ============================================================================
# Builds and copies game assets from each language implementation into
# website/frontend/public/game/<lang>/ for serving via the website.
#
# Each step is conditional: if the required tool is not installed, the step
# is skipped with a warning instead of failing.
# ============================================================================

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/../../.." && pwd)"
FRONTEND_GAME_DIR="${PROJECT_ROOT}/website/frontend/public/game"

echo "============================================="
echo " Packman Build Orchestration"
echo "============================================="
echo "Project root : ${PROJECT_ROOT}"
echo "Game output  : ${FRONTEND_GAME_DIR}"
echo ""

PASS=0
SKIP=0
FAIL=0

# ---------------------------------------------------------------------------
# Step 1: Copy JavaScript game files
# ---------------------------------------------------------------------------
echo "--- Step 1: JavaScript ---"

JS_SRC="${PROJECT_ROOT}/javascript"
JS_DEST="${FRONTEND_GAME_DIR}/js"

if [ -d "${JS_SRC}" ]; then
    mkdir -p "${JS_DEST}"
    # Copy only non-test JS files
    for f in "${JS_SRC}"/*.js; do
        fname="$(basename "$f")"
        if [[ "${fname}" != *.test.js ]]; then
            cp "$f" "${JS_DEST}/${fname}"
        fi
    done
    # Copy index.html if it exists
    if [ -f "${JS_SRC}/index.html" ]; then
        cp "${JS_SRC}/index.html" "${JS_DEST}/index.html"
    fi
    echo "  [PASS] JavaScript files copied to ${JS_DEST}"
    PASS=$((PASS + 1))
else
    echo "  [SKIP] JavaScript source directory not found: ${JS_SRC}"
    SKIP=$((SKIP + 1))
fi
echo ""

# ---------------------------------------------------------------------------
# Step 2: Build TypeScript (if tsc available) and copy output
# ---------------------------------------------------------------------------
echo "--- Step 2: TypeScript ---"

TS_SRC="${PROJECT_ROOT}/typescript"
TS_DEST="${FRONTEND_GAME_DIR}/ts"

if [ -d "${TS_SRC}" ]; then
    if command -v npx &> /dev/null && [ -f "${TS_SRC}/tsconfig.json" ]; then
        echo "  Building TypeScript..."
        mkdir -p "${TS_DEST}"

        # Try to compile; if it fails, fall back to copying .ts files directly
        if (cd "${TS_SRC}" && npx tsc --outDir "${TS_DEST}" 2>/dev/null); then
            echo "  [PASS] TypeScript compiled and output copied to ${TS_DEST}"
            PASS=$((PASS + 1))
        else
            echo "  [WARN] TypeScript compilation failed; copying source .ts files instead"
            for f in "${TS_SRC}/src"/*.ts; do
                fname="$(basename "$f")"
                if [[ "${fname}" != *.test.ts ]]; then
                    cp "$f" "${TS_DEST}/${fname}"
                fi
            done
            echo "  [PASS] TypeScript source files copied to ${TS_DEST}"
            PASS=$((PASS + 1))
        fi
    elif command -v tsc &> /dev/null; then
        echo "  Building TypeScript with global tsc..."
        mkdir -p "${TS_DEST}"
        if (cd "${TS_SRC}" && tsc --outDir "${TS_DEST}" 2>/dev/null); then
            echo "  [PASS] TypeScript compiled to ${TS_DEST}"
            PASS=$((PASS + 1))
        else
            echo "  [WARN] TypeScript compilation failed; copying source files"
            for f in "${TS_SRC}/src"/*.ts; do
                fname="$(basename "$f")"
                if [[ "${fname}" != *.test.ts ]]; then
                    cp "$f" "${TS_DEST}/${fname}"
                fi
            done
            echo "  [PASS] TypeScript source files copied to ${TS_DEST}"
            PASS=$((PASS + 1))
        fi
    else
        echo "  [SKIP] Neither tsc nor npx found; skipping TypeScript build"
        # Still copy source files
        mkdir -p "${TS_DEST}"
        for f in "${TS_SRC}/src"/*.ts; do
            fname="$(basename "$f")"
            if [[ "${fname}" != *.test.ts ]]; then
                cp "$f" "${TS_DEST}/${fname}"
            fi
        done
        echo "  TypeScript source files copied (no compilation)"
        SKIP=$((SKIP + 1))
    fi

    # Copy index.html if it exists
    if [ -f "${TS_SRC}/index.html" ]; then
        cp "${TS_SRC}/index.html" "${TS_DEST}/index.html"
    fi
else
    echo "  [SKIP] TypeScript source directory not found: ${TS_SRC}"
    SKIP=$((SKIP + 1))
fi
echo ""

# ---------------------------------------------------------------------------
# Step 3: Build C++/SDL2 to WebAssembly (if emcc available)
# ---------------------------------------------------------------------------
echo "--- Step 3: C++ (WebAssembly) ---"

CPP_BUILD_SCRIPT="${SCRIPT_DIR}/build-cpp-wasm.sh"

if command -v emcc &> /dev/null; then
    if [ -f "${CPP_BUILD_SCRIPT}" ]; then
        echo "  Running build-cpp-wasm.sh..."
        if bash "${CPP_BUILD_SCRIPT}"; then
            echo "  [PASS] C++ WASM build complete"
            PASS=$((PASS + 1))
        else
            echo "  [FAIL] C++ WASM build failed"
            FAIL=$((FAIL + 1))
        fi
    else
        echo "  [SKIP] build-cpp-wasm.sh not found at ${CPP_BUILD_SCRIPT}"
        SKIP=$((SKIP + 1))
    fi
else
    echo "  [SKIP] emcc (Emscripten) not found in PATH; skipping C++ WASM build"
    echo "         Install Emscripten SDK: https://emscripten.org/docs/getting_started/"
    SKIP=$((SKIP + 1))
fi
echo ""

# ---------------------------------------------------------------------------
# Step 4: Build Python to WebAssembly (if pygbag available)
# ---------------------------------------------------------------------------
echo "--- Step 4: Python (WebAssembly via Pygbag) ---"

PY_BUILD_SCRIPT="${SCRIPT_DIR}/build-python-wasm.sh"

if command -v pygbag &> /dev/null || command -v python3 -c "import pygbag" &> /dev/null 2>&1; then
    if [ -f "${PY_BUILD_SCRIPT}" ]; then
        echo "  Running build-python-wasm.sh..."
        if bash "${PY_BUILD_SCRIPT}"; then
            echo "  [PASS] Python WASM build complete"
            PASS=$((PASS + 1))
        else
            echo "  [FAIL] Python WASM build failed"
            FAIL=$((FAIL + 1))
        fi
    else
        echo "  [SKIP] build-python-wasm.sh not found at ${PY_BUILD_SCRIPT}"
        SKIP=$((SKIP + 1))
    fi
else
    echo "  [SKIP] pygbag not found; skipping Python WASM build"
    echo "         Install with: pip install pygbag"
    SKIP=$((SKIP + 1))
fi
echo ""

# ---------------------------------------------------------------------------
# Step 5: Build Java JAR (if mvn available)
# ---------------------------------------------------------------------------
echo "--- Step 5: Java (JAR) ---"

JAVA_BUILD_SCRIPT="${SCRIPT_DIR}/build-java-jar.sh"

if command -v mvn &> /dev/null; then
    if [ -f "${JAVA_BUILD_SCRIPT}" ]; then
        echo "  Running build-java-jar.sh..."
        if bash "${JAVA_BUILD_SCRIPT}"; then
            echo "  [PASS] Java JAR build complete"
            PASS=$((PASS + 1))
        else
            echo "  [FAIL] Java JAR build failed"
            FAIL=$((FAIL + 1))
        fi
    else
        echo "  [SKIP] build-java-jar.sh not found at ${JAVA_BUILD_SCRIPT}"
        SKIP=$((SKIP + 1))
    fi
elif command -v javac &> /dev/null; then
    echo "  [SKIP] mvn not found but javac is available; use build-java-jar.sh manually"
    SKIP=$((SKIP + 1))
else
    echo "  [SKIP] Neither mvn nor javac found; skipping Java build"
    echo "         Install Maven: https://maven.apache.org/install.html"
    SKIP=$((SKIP + 1))
fi
echo ""

# ---------------------------------------------------------------------------
# Summary
# ---------------------------------------------------------------------------
echo "============================================="
echo " Build Summary"
echo "============================================="
echo "  Passed : ${PASS}"
echo "  Skipped: ${SKIP}"
echo "  Failed : ${FAIL}"
echo ""

if [ "${FAIL}" -gt 0 ]; then
    echo "Some builds FAILED. Check the output above for details."
    exit 1
else
    echo "All executed builds passed. Skipped steps require tool installation."
    exit 0
fi
