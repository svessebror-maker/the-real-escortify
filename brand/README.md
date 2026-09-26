# Brand artwork

All Letsseeeify icons and preview images are drawn as vector artwork in [`artwork.mjs`](artwork.mjs) and rendered to exact-size PNGs with [resvg](https://github.com/linebender/resvg). Never edit the generated images by hand: change the artwork, then run:

```bash
npm run brand:generate
```

The mark is a tilted stack of profile cards (the discovery deck). Its front card carries two overlapping circles, standing for the shared interests behind a match. Colors run from violet `#7C3AED` through indigo `#4F46E5` to cyan `#06B6D4`.

| File | Use |
|---|---|
| `apps/mobile/assets/icon.png` | iOS app icon: 1024 px, full-bleed and opaque (iOS applies its own mask) |
| `apps/mobile/assets/android-icon-*.png` | Android adaptive icon layers; the mark stays inside the 66/108 safe zone. `monochrome` is the Android 13+ themed icon |
| `apps/mobile/assets/splash-icon.png` | Splash screen, shown on white (light mode) or `#0a0a0a` (dark mode) |
| `apps/mobile/assets/logo(@2x, @3x).png` | Home-screen logo, rendered separately for each pixel density |
| `apps/web/src/app/icon.svg`, `favicon.ico` | Browser tab icons: a simplified mark that stays legible at 16 px |
| `apps/web/src/app/apple-icon.png` | iOS home-screen icon for the website (180 px) |
| `apps/web/src/app/opengraph-image.png` | 1200 × 630 link preview, set in Geist (from the `geist` package, SIL Open Font License) |
| `apps/web/public/brand/logo.svg` | Vector logo on the web home page |
