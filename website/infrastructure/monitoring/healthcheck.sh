#!/usr/bin/env bash
# ──────────────────────────────────────────────────────────────
# Packman-Edu  —  Simple HTTP health check
#
# Usage:
#   ./healthcheck.sh [DOMAIN]
#
# Returns exit code 0 on success, 1 on failure.
# ──────────────────────────────────────────────────────────────
set -euo pipefail

DOMAIN="${1:-packman-edu.example.com}"
URL="https://${DOMAIN}"

echo "==> Health-checking ${URL} ..."

HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 "${URL}" 2>/dev/null || echo "000")

if [[ "${HTTP_STATUS}" == "200" ]]; then
    echo "PASS — ${URL} returned HTTP ${HTTP_STATUS}"
    exit 0
else
    echo "FAIL — ${URL} returned HTTP ${HTTP_STATUS}"
    exit 1
fi
