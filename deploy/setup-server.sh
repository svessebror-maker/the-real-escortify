#!/usr/bin/env bash
# One-time server setup (Ubuntu, run as the `ubuntu` user from the repo root on
# the server). Installs the systemd unit and the nginx site. Idempotent.
set -euo pipefail
cd "$(dirname "$0")/.."

if [ ! -f apps/web/.env.local ]; then
  echo "Create apps/web/.env.local first (see apps/web/.env.example)." >&2
  exit 1
fi
chmod 600 apps/web/.env.local

sudo install -m 644 deploy/letsseeeify-web.service /etc/systemd/system/letsseeeify-web.service
sudo install -m 644 deploy/nginx-letsseeeify.conf /etc/nginx/sites-available/letsseeeify
sudo ln -sf /etc/nginx/sites-available/letsseeeify /etc/nginx/sites-enabled/letsseeeify
sudo rm -f /etc/nginx/sites-enabled/default
sudo install -d -m 755 /var/www/letsseeeify/downloads
sudo nginx -t
sudo systemctl daemon-reload
sudo systemctl enable letsseeeify-web
sudo systemctl reload nginx
echo "Setup done. Now run deploy/deploy.sh."
