# Deploying to the server

The web app runs on an Ubuntu server as a systemd service (`letsseeeify`). It listens on `127.0.0.1:3000`, and nginx forwards public traffic on port 80 (and 443 once HTTPS is set up) to it. nginx also serves an optional Android test build at `/downloads/letsseeeify.apk`.

| File | Purpose |
|---|---|
| `setup-server.sh` | One-time setup on the server: installs the service and the nginx site |
| `deploy.sh [branch]` | On the server: pulls the branch (default `main`), builds and restarts |
| `publish-android.sh [user@host]` | On your computer: builds the Android APK and uploads it |
| `letsseeeify.service` | systemd unit |
| `nginx-letsseeeify.conf` | nginx site |

## First setup (on the server)

Needs Node 24, git and nginx.

```bash
git clone https://github.com/svessebror-maker/the-real-escortify.git ~/letsseeeify
cd ~/letsseeeify
cp apps/web/.env.example apps/web/.env.local   # then fill it in
deploy/setup-server.sh
deploy/deploy.sh
```

In `.env.local`, set `NEXT_PUBLIC_APP_URL` to the public address. Until the auth phase exists, `LETSSEEEIFY_PREVIEW=1` lets the site start without Supabase and Stytch keys. Remove it once sign-in ships. `NEXT_PUBLIC_*` values are built into the pages, so run `deploy/deploy.sh` again after changing them.

Never copy the `local/` folder or any other personal files to the server.

## HTTPS

Point a domain's A record at the server, replace `server_name _;` in `/etc/nginx/sites-available/letsseeeify` with the domain, then run `sudo certbot --nginx -d <domain>` and update `NEXT_PUBLIC_APP_URL`.

## Updating

```bash
~/letsseeeify/deploy/deploy.sh
```

Logs: `sudo journalctl -u letsseeeify -n 50`.

## Mobile apps

- **Android test build:** `deploy/publish-android.sh` builds a release APK and uploads it. Set `NEXT_PUBLIC_ANDROID_APK_URL=/downloads/letsseeeify.apk` so the home page links to it. The APK is signed with the debug key, so it installs only by download ("install unknown apps"), not through Google Play.
- **iOS, and store releases:** these need an Apple Developer account and a Google Play developer account, then an EAS build (`eas build`, see `apps/mobile/README.md`).
