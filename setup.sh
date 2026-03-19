#!/usr/bin/env bash
# =============================================================================
# Packman - Prerequisite Checker & Installer
# =============================================================================
#
# This script checks whether all required tools and libraries are installed
# for each language implementation of the Packman game:
#
#   - Java      : java (JDK), mvn (Maven)
#   - Python    : python3, pip3, pygame module
#   - JavaScript: node, npm, a browser launcher (xdg-open or open)
#   - TypeScript: node, npm, npx
#   - C++       : g++, cmake, libsdl2-dev
#
# For each prerequisite it prints a green checkmark or red X.
# At the end it shows a summary and offers to install missing items
# on Debian/Ubuntu systems (via apt-get) and pygame (via pip3).
#
# Usage:
#   chmod +x setup.sh
#   ./setup.sh
#
# =============================================================================

set -euo pipefail

# ---------------------------------------------------------------------------
# ANSI color codes
# ---------------------------------------------------------------------------
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
BOLD='\033[1m'
RESET='\033[0m'

# Unicode symbols (with fallbacks for terminals that don't support them)
CHECK="${GREEN}\xE2\x9C\x94${RESET}"   # green checkmark
CROSS="${RED}\xE2\x9C\x98${RESET}"     # red X

# ---------------------------------------------------------------------------
# Counters
# ---------------------------------------------------------------------------
TOTAL=0          # total number of prerequisites checked
PASSED=0         # number that are satisfied
FAILED=0         # number that are missing

# Arrays that accumulate missing items for the install offer
MISSING_APT=()       # apt package names
MISSING_PYGAME=false # whether pygame is missing

# ---------------------------------------------------------------------------
# Helper: check a single prerequisite
#
# Arguments:
#   $1 - category label   (e.g. "Java")
#   $2 - human-readable name for display
#   $3 - shell command that succeeds (exit 0) when the prerequisite is met
#   $4 - (optional) apt package name to install if missing
# ---------------------------------------------------------------------------
check() {
    local category="$1"
    local name="$2"
    local cmd="$3"
    local apt_pkg="${4:-}"

    TOTAL=$((TOTAL + 1))

    if eval "$cmd" &>/dev/null; then
        PASSED=$((PASSED + 1))
        printf "  ${CHECK}  %-14s %s\n" "[$category]" "$name"
    else
        FAILED=$((FAILED + 1))
        printf "  ${CROSS}  %-14s %s\n" "[$category]" "$name"

        # Remember which apt packages we could offer to install
        if [[ -n "$apt_pkg" ]]; then
            MISSING_APT+=("$apt_pkg")
        fi
    fi
}

# ---------------------------------------------------------------------------
# Header
# ---------------------------------------------------------------------------
echo ""
printf "${BOLD}${CYAN}============================================${RESET}\n"
printf "${BOLD}${CYAN}   Packman - Prerequisite Checker${RESET}\n"
printf "${BOLD}${CYAN}============================================${RESET}\n"
echo ""

# ---------------------------------------------------------------------------
# Java prerequisites
# ---------------------------------------------------------------------------
printf "${BOLD}${YELLOW}Java implementation:${RESET}\n"
check "Java" "java (JDK runtime)"         "command -v java"       "default-jdk"
check "Java" "mvn  (Maven build tool)"     "command -v mvn"        "maven"
echo ""

# ---------------------------------------------------------------------------
# Python prerequisites
# ---------------------------------------------------------------------------
printf "${BOLD}${YELLOW}Python implementation:${RESET}\n"
check "Python" "python3"                   "command -v python3"    "python3"
check "Python" "pip3"                      "command -v pip3"       "python3-pip"
# pygame is installed via pip, not apt, so we leave the apt_pkg field empty
# and track it separately.
TOTAL=$((TOTAL + 1))
if python3 -c "import pygame" &>/dev/null; then
    PASSED=$((PASSED + 1))
    printf "  ${CHECK}  %-14s %s\n" "[Python]" "pygame module"
else
    FAILED=$((FAILED + 1))
    printf "  ${CROSS}  %-14s %s\n" "[Python]" "pygame module"
    MISSING_PYGAME=true
fi
echo ""

# ---------------------------------------------------------------------------
# JavaScript prerequisites
# ---------------------------------------------------------------------------
printf "${BOLD}${YELLOW}JavaScript implementation:${RESET}\n"
check "JS" "node (Node.js runtime)"       "command -v node"       "nodejs"
check "JS" "npm  (package manager)"       "command -v npm"        "npm"
# Browser launcher: xdg-open on Linux, open on macOS
check "JS" "browser launcher (xdg-open/open)" \
    "command -v xdg-open || command -v open" \
    "xdg-utils"
echo ""

# ---------------------------------------------------------------------------
# TypeScript prerequisites
# ---------------------------------------------------------------------------
printf "${BOLD}${YELLOW}TypeScript implementation:${RESET}\n"
check "TS" "node (Node.js runtime)"       "command -v node"       "nodejs"
check "TS" "npm  (package manager)"       "command -v npm"        "npm"
check "TS" "npx  (package runner)"        "command -v npx"        "npm"
echo ""

# ---------------------------------------------------------------------------
# C++ prerequisites
# ---------------------------------------------------------------------------
printf "${BOLD}${YELLOW}C++ implementation:${RESET}\n"
check "C++" "g++   (GNU C++ compiler)"    "command -v g++"        "g++"
check "C++" "cmake (build system)"        "command -v cmake"      "cmake"
# SDL2 can be detected via pkg-config or dpkg
check "C++" "libsdl2-dev (SDL2 library)" \
    "pkg-config --exists sdl2 2>/dev/null || dpkg -s libsdl2-dev 2>/dev/null | grep -q 'Status:.*installed'" \
    "libsdl2-dev"
echo ""

# ---------------------------------------------------------------------------
# Summary
# ---------------------------------------------------------------------------
printf "${BOLD}${CYAN}============================================${RESET}\n"
printf "${BOLD}${CYAN}   Summary${RESET}\n"
printf "${BOLD}${CYAN}============================================${RESET}\n"
echo ""
if [[ $FAILED -eq 0 ]]; then
    printf "  ${GREEN}${BOLD}All %d of %d prerequisites met!${RESET}\n" "$PASSED" "$TOTAL"
else
    printf "  ${BOLD}%d of %d${RESET} prerequisites met.  " "$PASSED" "$TOTAL"
    printf "${RED}${BOLD}%d missing.${RESET}\n" "$FAILED"
fi
echo ""

# ---------------------------------------------------------------------------
# Offer to install missing system packages (Debian/Ubuntu only)
# ---------------------------------------------------------------------------
# De-duplicate the apt list (e.g. nodejs / npm may appear twice)
if [[ ${#MISSING_APT[@]} -gt 0 ]]; then
    # Remove duplicates while preserving order
    declare -A _seen
    UNIQUE_APT=()
    for pkg in "${MISSING_APT[@]}"; do
        if [[ -z "${_seen[$pkg]+x}" ]]; then
            _seen[$pkg]=1
            UNIQUE_APT+=("$pkg")
        fi
    done

    # Check if we are on a Debian/Ubuntu system that has apt-get
    if command -v apt-get &>/dev/null; then
        printf "${YELLOW}The following system packages can be installed via apt-get:${RESET}\n"
        printf "  %s\n" "${UNIQUE_APT[@]}"
        echo ""
        read -r -p "Install them now with sudo apt-get? [y/N] " answer
        if [[ "${answer,,}" == "y" ]]; then
            echo ""
            echo "Running: sudo apt-get update && sudo apt-get install -y ${UNIQUE_APT[*]}"
            sudo apt-get update -qq
            sudo apt-get install -y "${UNIQUE_APT[@]}"
            echo ""
            printf "${GREEN}System packages installed.${RESET}\n"
        else
            echo "Skipped."
        fi
    else
        printf "${YELLOW}Missing system packages: %s${RESET}\n" "${UNIQUE_APT[*]}"
        printf "  (apt-get not found -- install these packages manually for your OS)\n"
    fi
    echo ""
fi

# ---------------------------------------------------------------------------
# Offer to install pygame via pip3
# ---------------------------------------------------------------------------
if [[ "$MISSING_PYGAME" == true ]]; then
    if command -v pip3 &>/dev/null; then
        printf "${YELLOW}The pygame module is missing.${RESET}\n"
        read -r -p "Install it now with pip3? [y/N] " answer
        if [[ "${answer,,}" == "y" ]]; then
            echo ""
            echo "Running: pip3 install pygame"
            pip3 install pygame
            echo ""
            printf "${GREEN}pygame installed.${RESET}\n"
        else
            echo "Skipped."
        fi
    else
        printf "${YELLOW}pygame is missing and pip3 is not available.${RESET}\n"
        printf "  Install python3-pip first, then run: pip3 install pygame\n"
    fi
    echo ""
fi

# ---------------------------------------------------------------------------
# Final status
# ---------------------------------------------------------------------------
if [[ $FAILED -eq 0 ]]; then
    printf "${GREEN}${BOLD}You are all set! Happy coding!${RESET}\n"
else
    printf "${YELLOW}Re-run this script after installing the missing prerequisites.${RESET}\n"
fi
echo ""

exit 0
