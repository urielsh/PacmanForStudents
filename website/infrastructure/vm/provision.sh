#!/usr/bin/env bash
# ──────────────────────────────────────────────────────────────
# Packman-Edu  —  OCI VM initial provisioning
# Run once on a fresh Ubuntu 22.04+ instance as root (or sudo).
# ──────────────────────────────────────────────────────────────
set -euo pipefail

DOMAIN="packman-edu.example.com"
WEB_ROOT="/var/www/packman-edu"
NGINX_CONF_SRC="$(cd "$(dirname "$0")/../nginx" && pwd)"

echo "==> Updating system packages..."
apt-get update -y
apt-get upgrade -y

echo "==> Installing nginx, certbot, and certbot nginx plugin..."
apt-get install -y nginx certbot python3-certbot-nginx

echo "==> Creating web root at ${WEB_ROOT}..."
mkdir -p "${WEB_ROOT}"
chown -R www-data:www-data "${WEB_ROOT}"

echo "==> Opening firewall ports 80 and 443 (iptables)..."
iptables -I INPUT -p tcp --dport 80  -j ACCEPT 2>/dev/null || true
iptables -I INPUT -p tcp --dport 443 -j ACCEPT 2>/dev/null || true

# Persist iptables rules if iptables-persistent is available
if command -v netfilter-persistent &>/dev/null; then
    netfilter-persistent save
fi

echo "==> Deploying nginx configuration..."
cp "${NGINX_CONF_SRC}/packman-edu.conf" /etc/nginx/sites-available/packman-edu.conf
cp "${NGINX_CONF_SRC}/headers.conf"     /etc/nginx/snippets/headers.conf

# Enable the site (disable default if present)
ln -sf /etc/nginx/sites-available/packman-edu.conf /etc/nginx/sites-enabled/packman-edu.conf
rm -f /etc/nginx/sites-enabled/default

echo "==> Testing nginx configuration..."
nginx -t

echo "==> Reloading nginx..."
systemctl reload nginx

echo "==> Provisioning complete."
echo "    Next step: run ssl/setup-certbot.sh to obtain the TLS certificate."
