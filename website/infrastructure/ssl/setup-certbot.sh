#!/usr/bin/env bash
# ──────────────────────────────────────────────────────────────
# Packman-Edu  —  SSL certificate setup via Certbot
# Run after provision.sh has configured nginx.
# ──────────────────────────────────────────────────────────────
set -euo pipefail

DOMAIN="${1:-packman-edu.example.com}"
EMAIL="${2:-admin@example.com}"

echo "==> Requesting SSL certificate for ${DOMAIN}..."
certbot --nginx \
    -d "${DOMAIN}" \
    --non-interactive \
    --agree-tos \
    --email "${EMAIL}" \
    --redirect

echo "==> Setting up automatic renewal via cron..."
# Certbot installs a systemd timer by default on modern Ubuntu;
# add a cron entry as a fallback to ensure renewal runs twice daily.
CRON_LINE="0 3,15 * * * certbot renew --quiet --deploy-hook 'systemctl reload nginx'"

# Avoid duplicate entries
( crontab -l 2>/dev/null | grep -v 'certbot renew' ; echo "${CRON_LINE}" ) | crontab -

echo "==> Verifying certificate..."
certbot certificates -d "${DOMAIN}"

echo "==> SSL setup complete."
echo "    Certificate will auto-renew via cron (03:00 and 15:00 daily)."
