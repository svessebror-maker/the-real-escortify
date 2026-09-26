// Renders every app icon, splash image and link-preview image from the vector
// artwork in brand/artwork.mjs. Run with `npm run brand:generate` after changing
// the artwork, then commit the regenerated files.
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

import { Resvg } from "@resvg/resvg-js";

import {
  adaptiveBackground,
  adaptiveForeground,
  adaptiveMonochrome,
  appIcon,
  openGraphImage,
  roundedIcon,
  smallIcon,
} from "../brand/artwork.mjs";
import { APP_NAME, APP_TAGLINE } from "../packages/shared/src/brand.ts";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const fontDir = join(root, "node_modules", "geist", "dist", "fonts", "geist-sans");

function render(svg, width, { withFonts = false } = {}) {
  const font = withFonts
    ? {
        fontFiles: ["Geist-Regular.ttf", "Geist-SemiBold.ttf"].map((file) => join(fontDir, file)),
        loadSystemFonts: false,
        defaultFontFamily: "Geist",
      }
    : { loadSystemFonts: false };
  return new Resvg(svg, { fitTo: { mode: "width", value: width }, font }).render().asPng();
}

// An .ico holding PNG-encoded images, which every current browser supports.
function ico(images) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(images.length, 4);
  const directory = Buffer.alloc(16 * images.length);
  let offset = header.length + directory.length;
  images.forEach(({ size, data }, index) => {
    const entry = index * 16;
    directory.writeUInt8(size >= 256 ? 0 : size, entry);
    directory.writeUInt8(size >= 256 ? 0 : size, entry + 1);
    directory.writeUInt16LE(1, entry + 4);
    directory.writeUInt16LE(32, entry + 6);
    directory.writeUInt32LE(data.length, entry + 8);
    directory.writeUInt32LE(offset, entry + 12);
    offset += data.length;
  });
  return Buffer.concat([header, directory, ...images.map((image) => image.data)]);
}

function escapeXml(text) {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

// Splits text into two lines of roughly equal length at a word boundary.
function twoLines(text) {
  const words = text.split(" ");
  let best = 1;
  for (let i = 1; i < words.length; i += 1) {
    const diff = Math.abs(words.slice(0, i).join(" ").length - words.slice(i).join(" ").length);
    const bestDiff = Math.abs(words.slice(0, best).join(" ").length - words.slice(best).join(" ").length);
    if (diff < bestDiff) best = i;
  }
  return [words.slice(0, best).join(" "), words.slice(best).join(" ")];
}

function write(path, data) {
  const file = join(root, path);
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, data);
  const bytes = typeof data === "string" ? Buffer.byteLength(data) : data.length;
  console.log(`  ${relative(root, file).replaceAll("\\", "/")}  ${(bytes / 1024).toFixed(1)} KB`);
}

console.log("Mobile (apps/mobile/assets):");
write("apps/mobile/assets/icon.png", render(appIcon(), 1024));
write("apps/mobile/assets/android-icon-background.png", render(adaptiveBackground(), 1024));
write("apps/mobile/assets/android-icon-foreground.png", render(adaptiveForeground(), 1024));
write("apps/mobile/assets/android-icon-monochrome.png", render(adaptiveMonochrome(), 1024));
write("apps/mobile/assets/splash-icon.png", render(roundedIcon(), 1024));
for (const [suffix, size] of [["", 96], ["@2x", 192], ["@3x", 288]]) {
  write(`apps/mobile/assets/logo${suffix}.png`, render(roundedIcon(), size));
}

console.log("Web (apps/web/src/app, apps/web/public):");
write("apps/web/src/app/icon.svg", smallIcon());
write("apps/web/src/app/favicon.ico", ico([16, 32, 48].map((size) => ({ size, data: render(smallIcon(), size) }))));
write("apps/web/src/app/apple-icon.png", render(appIcon(), 180));
const tagline = twoLines(escapeXml(APP_TAGLINE));
write(
  "apps/web/src/app/opengraph-image.png",
  render(openGraphImage({ title: escapeXml(APP_NAME), tagline }), 1200, { withFonts: true }),
);
write("apps/web/src/app/opengraph-image.alt.txt", `${APP_NAME}: ${APP_TAGLINE}`);
write("apps/web/public/brand/logo.svg", roundedIcon());
