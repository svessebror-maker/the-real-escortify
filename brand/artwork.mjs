// Letsseeeify brand artwork as SVG, drawn on a 1024 x 1024 design canvas.
// The mark is a tilted stack of profile cards (the discovery deck) whose front
// card carries two overlapping circles: shared interests, the basis of a match.
// scripts/generate-brand-assets.mjs renders every app icon from these.

export const colors = {
  violet: "#7C3AED",
  indigo: "#4F46E5",
  cyan: "#06B6D4",
  deep: "#1E1B4B",
  indigo200: "#C7D2FE",
  indigo100: "#E0E7FF",
};

const SIZE = 1024;
const CENTER = SIZE / 2;

// Superellipse ("squircle") outline, smoother than a rounded rectangle.
export function squirclePath(size = SIZE, exponent = 5, steps = 720) {
  const half = size / 2;
  const points = [];
  for (let i = 0; i < steps; i += 1) {
    const t = (i / steps) * 2 * Math.PI;
    const cos = Math.cos(t);
    const sin = Math.sin(t);
    const x = half + half * Math.sign(cos) * Math.abs(cos) ** (2 / exponent);
    const y = half + half * Math.sign(sin) * Math.abs(sin) ** (2 / exponent);
    points.push(`${x.toFixed(2)} ${y.toFixed(2)}`);
  }
  return `M${points.join("L")}Z`;
}

function backgroundDefs(p, width = SIZE, height = SIZE) {
  return `
    <linearGradient id="${p}bg" x1="0" y1="0" x2="${width}" y2="${height}" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="${colors.violet}"/>
      <stop offset="0.5" stop-color="${colors.indigo}"/>
      <stop offset="1" stop-color="${colors.cyan}"/>
    </linearGradient>
    <radialGradient id="${p}glow" cx="${width * 0.27}" cy="${height * 0.18}" r="${Math.max(width, height) * 0.7}" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="#FFFFFF" stop-opacity="0.28"/>
      <stop offset="1" stop-color="#FFFFFF" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="${p}shade" x1="0" y1="0" x2="0" y2="${height}" gradientUnits="userSpaceOnUse">
      <stop offset="0.5" stop-color="${colors.deep}" stop-opacity="0"/>
      <stop offset="1" stop-color="${colors.deep}" stop-opacity="0.3"/>
    </linearGradient>`;
}

function background(p, width = SIZE, height = SIZE) {
  return `
    <rect width="${width}" height="${height}" fill="url(#${p}bg)"/>
    <rect width="${width}" height="${height}" fill="url(#${p}glow)"/>
    <rect width="${width}" height="${height}" fill="url(#${p}shade)"/>`;
}

function markDefs(p) {
  return `
    <linearGradient id="${p}accent" x1="-150" y1="-144" x2="150" y2="40" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="${colors.violet}"/>
      <stop offset="1" stop-color="${colors.cyan}"/>
    </linearGradient>
    <clipPath id="${p}vennA"><circle cx="-58" cy="-52" r="92"/></clipPath>
    <filter id="${p}shadow" x="-50%" y="-50%" width="200%" height="200%" color-interpolation-filters="sRGB">
      <feGaussianBlur in="SourceAlpha" stdDeviation="34"/>
      <feOffset dy="28" result="blur"/>
      <feFlood flood-color="${colors.deep}" flood-opacity="0.38"/>
      <feComposite in2="blur" operator="in"/>
      <feMerge><feMergeNode/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
    <mask id="${p}knockout" maskUnits="userSpaceOnUse" x="-300" y="-340" width="600" height="680">
      <rect x="-300" y="-340" width="600" height="680" fill="#FFFFFF"/>
      <g fill="none" stroke="#000000" stroke-width="18">
        <circle cx="-58" cy="-52" r="92"/>
        <circle cx="58" cy="-52" r="92"/>
      </g>
      <circle cx="58" cy="-52" r="92" fill="#000000" clip-path="url(#${p}vennA)"/>
      <rect x="-118" y="92" width="236" height="26" rx="13" fill="#000000"/>
      <rect x="-82" y="138" width="164" height="26" rx="13" fill="#000000"/>
    </mask>`;
}

// The card stack. `mono` draws a single-color silhouette for Android themed icons.
function mark(p, { mono = false } = {}) {
  const backCard = mono
    ? `<rect x="-200" y="-260" width="400" height="520" rx="80" fill="#FFFFFF" fill-opacity="0.5"/>`
    : `<rect x="-200" y="-260" width="400" height="520" rx="80" fill="#FFFFFF" fill-opacity="0.26" stroke="#FFFFFF" stroke-opacity="0.5" stroke-width="3"/>`;

  const frontCard = mono
    ? `<rect x="-210" y="-270" width="420" height="540" rx="84" fill="#FFFFFF" mask="url(#${p}knockout)"/>`
    : `
      <rect x="-210" y="-270" width="420" height="540" rx="84" fill="#FFFFFF" filter="url(#${p}shadow)"/>
      <circle cx="-58" cy="-52" r="92" fill="${colors.violet}" fill-opacity="0.1"/>
      <circle cx="58" cy="-52" r="92" fill="${colors.cyan}" fill-opacity="0.1"/>
      <circle cx="58" cy="-52" r="92" fill="url(#${p}accent)" clip-path="url(#${p}vennA)"/>
      <g fill="none" stroke="url(#${p}accent)" stroke-width="18">
        <circle cx="-58" cy="-52" r="92"/>
        <circle cx="58" cy="-52" r="92"/>
      </g>
      <rect x="-118" y="92" width="236" height="26" rx="13" fill="${colors.indigo200}"/>
      <rect x="-82" y="138" width="164" height="26" rx="13" fill="${colors.indigo100}"/>`;

  return `
    <g transform="translate(462 540) rotate(-9)">${backCard}</g>
    <g transform="translate(556 500) rotate(7)">${frontCard}</g>`;
}

function scaled(content, scale) {
  return `<g transform="translate(${CENTER} ${CENTER}) scale(${scale}) translate(${-CENTER} ${-CENTER})">${content}</g>`;
}

function svg(content, defs, width = SIZE, height = SIZE) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}"><defs>${defs}</defs>${content}</svg>`;
}

/** Full-bleed square icon (iOS applies its own mask; no transparency). */
export function appIcon(p = "a-") {
  return svg(`${background(p)}${scaled(mark(p), 0.94)}`, backgroundDefs(p) + markDefs(p));
}

/** Android adaptive icon background layer. */
export function adaptiveBackground(p = "b-") {
  return svg(background(p), backgroundDefs(p));
}

/** Android adaptive icon foreground: kept inside the 66/108 safe zone. */
export function adaptiveForeground(p = "f-") {
  return svg(scaled(mark(p), 0.76), markDefs(p));
}

/** Android 13+ themed icon: single-color silhouette in the safe zone. */
export function adaptiveMonochrome(p = "m-") {
  return svg(scaled(mark(p, { mono: true }), 0.76), markDefs(p));
}

/** The icon inside a squircle with transparent corners (splash, in-app logo). */
export function roundedIcon(p = "r-") {
  const defs = `${backgroundDefs(p)}${markDefs(p)}<clipPath id="${p}squircle"><path d="${squirclePath()}"/></clipPath>`;
  return svg(`<g clip-path="url(#${p}squircle)">${background(p)}${scaled(mark(p), 0.94)}</g>`, defs);
}

/** Simplified mark for tiny sizes (browser tabs): overlapping circles only. */
export function smallIcon(p = "s-") {
  const defs = `${backgroundDefs(p)}
    <clipPath id="${p}squircle"><path d="${squirclePath()}"/></clipPath>
    <clipPath id="${p}left"><circle cx="374" cy="512" r="240"/></clipPath>`;
  const content = `
    <g clip-path="url(#${p}squircle)">
      ${background(p)}
      <circle cx="650" cy="512" r="240" fill="#FFFFFF" clip-path="url(#${p}left)"/>
      <g fill="none" stroke="#FFFFFF" stroke-width="76">
        <circle cx="374" cy="512" r="240"/>
        <circle cx="650" cy="512" r="240"/>
      </g>
    </g>`;
  return svg(content, defs);
}

/** 1200 x 630 link-preview image. Text uses the Geist font. */
export function openGraphImage({ title, tagline }, p = "o-") {
  const width = 1200;
  const height = 630;
  const [line1, line2] = tagline;
  const content = `
    ${background(p, width, height)}
    <circle cx="1080" cy="585" r="270" fill="#FFFFFF" fill-opacity="0.06"/>
    <circle cx="1130" cy="60" r="150" fill="#FFFFFF" fill-opacity="0.05"/>
    <g transform="translate(-66 -5) scale(0.62)">${mark(p)}</g>
    <text x="480" y="292" font-family="Geist" font-weight="600" font-size="96" letter-spacing="-2.5" fill="#FFFFFF">${title}</text>
    <text x="483" y="362" font-family="Geist" font-weight="400" font-size="36" fill="#FFFFFF" fill-opacity="0.9">${line1}</text>
    <text x="483" y="410" font-family="Geist" font-weight="400" font-size="36" fill="#FFFFFF" fill-opacity="0.9">${line2}</text>`;
  return svg(content, backgroundDefs(p, width, height) + markDefs(p), width, height);
}
