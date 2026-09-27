#!/usr/bin/env bash
# Updates the web app to the latest commit of a branch (default: main),
# rebuilds it and restarts the service. Run on the server from any directory.
set -euo pipefail
cd "$(dirname "$0")/.."

branch="${1:-main}"
git fetch --prune origin
git checkout -B "$branch" "origin/$branch"
npm ci --no-audit --no-fund
npm run build
sudo systemctl restart letsseeeify

for _ in $(seq 1 30); do
  if curl -fsS -o /dev/null http://127.0
  .0.1:3000/; then
    echo "Deployed $(git rev-parse --short HEAD) from $branch."
    exit 0
  fi
  sleep 1
done
echo "The app did not answer on port 3000. Logs: sudo journalctl -u letsseeeify -n 50" >&2
exit 1
