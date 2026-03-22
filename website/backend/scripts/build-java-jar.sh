#!/bin/bash
set -e

# ────────────────────────────────────────────────────────────────
# build-java-jar.sh
# Builds the Java Pacman game JAR with Maven, then copies the
# artifact and the CheerpJ loader page into the public game
# directory so the website can serve them.
#
# Prerequisites:
#   - JDK 11+ (javac)
#   - Apache Maven 3.6+
# ────────────────────────────────────────────────────────────────

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../../.." && pwd)"
JAVA_DIR="$PROJECT_ROOT/java"
CHEERPJ_LOADER="$PROJECT_ROOT/website/backend/wasm/java/cheerpj-loader.html"
OUTPUT_DIR="$PROJECT_ROOT/website/frontend/public/game/java"

# ── Pre-flight checks ──────────────────────────────────────────

if ! command -v mvn &>/dev/null; then
    echo "ERROR: Maven (mvn) is not installed or not on PATH."
    echo "Install it with:"
    echo "  Ubuntu/Debian:  sudo apt install maven"
    echo "  macOS (brew):   brew install maven"
    exit 1
fi

if ! command -v java &>/dev/null; then
    echo "ERROR: Java (java) is not installed or not on PATH."
    exit 1
fi

# ── Build the JAR ──────────────────────────────────────────────

echo "==> Building Java Pacman JAR with Maven..."
cd "$JAVA_DIR"

# Clean previous build artifacts and compile a fresh JAR.
# The maven-jar-plugin in pom.xml sets the Main-Class manifest
# entry to com.packman.PacmanGame so the JAR is directly runnable
# with `java -jar pacman-game-1.0.0.jar` (or via CheerpJ).
mvn clean package -q -DskipTests

# Locate the built JAR. Maven places it in target/.
BUILT_JAR="$JAVA_DIR/target/pacman-game-1.0.0.jar"

if [ ! -f "$BUILT_JAR" ]; then
    echo "ERROR: Expected JAR not found at $BUILT_JAR"
    echo "Listing target/ contents:"
    ls -la "$JAVA_DIR/target/" 2>/dev/null || echo "  (target/ directory does not exist)"
    exit 1
fi

# ── Copy artifacts to public game directory ────────────────────

echo "==> Copying artifacts to $OUTPUT_DIR"
mkdir -p "$OUTPUT_DIR"

# Copy JAR with the filename CheerpJ expects
cp "$BUILT_JAR" "$OUTPUT_DIR/pacman-1.0.jar"

# Copy the CheerpJ loader HTML as index.html so the game page
# can be loaded at /game/java/ without specifying a filename.
cp "$CHEERPJ_LOADER" "$OUTPUT_DIR/index.html"

echo "==> Java build complete."
echo "    JAR:   $OUTPUT_DIR/pacman-1.0.jar"
echo "    HTML:  $OUTPUT_DIR/index.html"
