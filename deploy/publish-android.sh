#!/usr/bin/env bash
# Builds the Android release APK locally and uploads it to the server, where
# nginx serves it at /downloads/letsseeeify.apk. Run from the repo root on the
# development machine (needs JDK 17 and the Android SDK; see apps/mobile/README.md).
set -euo pipefail
cd "$(dirname "$0")/.."

server="${1:-ubuntu@57.131.157.44}"
apk=apps/mobile/android/app/build/outputs/apk/release/app-release.apk

(cd apps/mobile/android && NODE_ENV=production ./gradlew assembleRelease --console=plain -q)

# Release builds must never contain the local placeholder photos of real people.
if unzip -l "$apk" | grep -qiE '\.(jpe?g)$'; then
  echo "Refusing to publish: the APK contains JPEG images." >&2
  exit 1
fi

scp "$apk" "$server:/tmp/letsseeeify.apk"
ssh "$server" 'sudo install -m 644 /tmp/letsseeeify.apk /var/www/letsseeeify/downloads/letsseeeify.apk && rm /tmp/letsseeeify.apk'
echo "Published: http://${server#*@}/downloads/letsseeeify.apk"
