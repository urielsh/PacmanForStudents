#!/usr/bin/env bash
# ──────────────────────────────────────────────────────────────
# Packman-Edu  —  Manual deploy via rsync
#
# Usage:
#   ./deploy.sh <VM_HOST> <SSH_KEY_PATH> [DIST_DIR]
#
# Examples:
#   ./deploy.sh user@203.0.113.10 ~/.ssh/oci_key
#   ./deploy.sh user@203.0.113.10 ~/.ssh/oci_key ./build
# ──────────────────────────────────────────────────────────────
set -euo pipefail

if [[ $# -lt 2 ]]; then
    echo "Usage: $0 <VM_HOST> <SSH_KEY_PATH> [DIST_DIR]"
    echo "  VM_HOST      — SSH destination, e.g. user@1.2.3.4"
    echo "  SSH_KEY_PATH  — path to private SSH key"
    echo "  DIST_DIR      — local build directory (default: ../../frontend/dist)"
    exit 1
fi

VM_HOST="$1"
SSH_KEY="$2"
DIST_DIR="${3:-$(cd "$(dirname "$0")/../../frontend/dist" && pwd)}"
REMOTE_ROOT="/var/www/packman-edu"

if [[ ! -d "${DIST_DIR}" ]]; then
    echo "ERROR: dist directory not found at ${DIST_DIR}"
    echo "       Build the frontend first, then re-run this script."
    exit 1
fi

echo "==> Deploying ${DIST_DIR} -> ${VM_HOST}:${REMOTE_ROOT}"
rsync -avz --delete \
    -e "ssh -i ${SSH_KEY} -o StrictHostKeyChecking=accept-new" \
    "${DIST_DIR}/" \
    "${VM_HOST}:${REMOTE_ROOT}/"

echo "==> Deploy complete."
