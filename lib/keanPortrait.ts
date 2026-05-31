import type { ImageAsset, Person, PersonCategory } from "@/data/kean/types";

const portraitPalette: Record<PersonCategory, { ink: string; accent: string; blush: string }> = {
  journalist: { ink: "#232723", accent: "#6f8f7e", blush: "#b59b72" },
  whistleblower: { ink: "#232723", accent: "#6f8f7e", blush: "#b67f67" },
  pilot: { ink: "#232723", accent: "#5c7282", blush: "#ab8e6b" },
  government: { ink: "#232723", accent: "#7a8a68", blush: "#aa8a62" },
  senator: { ink: "#232723", accent: "#6e7d91", blush: "#b38d65" },
  researcher: { ink: "#232723", accent: "#7f7b63", blush: "#a89573" },
  skeptic: { ink: "#232723", accent: "#68726e", blush: "#b0886c" },
  filmmaker: { ink: "#232723", accent: "#7f6f62", blush: "#ae8c68" },
  "japan-politics": { ink: "#232723", accent: "#6f7d6b", blush: "#ad8a62" },
  "public-figure": { ink: "#232723", accent: "#70827a", blush: "#ab8d67" },
  "controversial-claimant": { ink: "#232723", accent: "#85705e", blush: "#a97b6a" },
};

function hashString(value: string) {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) >>> 0;
  }
  return hash || 1;
}

function pick<T>(items: T[], seed: number, offset = 0) {
  return items[(seed + offset) % items.length];
}

export function makeKeanPortraitAsset(person: Pick<Person, "id" | "name" | "jaName" | "category">): ImageAsset {
  return {
    src: `/kean/portrait/${person.id}.svg`,
    alt: `${person.name}のKean資料イラスト`,
    caption: `${person.jaName}のKean資料イラスト。`,
    credit: "Kean editorial illustration",
    license: "Original generated illustration",
    sourceUrl: `/kean/portrait/${person.id}.svg`,
    sourceName: "Kean generated portrait",
  };
}

export function renderKeanPortraitSvg(person: Pick<Person, "id" | "name" | "jaName" | "category">) {
  const seed = hashString(person.id);
  const palette = portraitPalette[person.category];
  const hairStyle = seed % 4;
  const glasses = seed % 3 === 0;
  const mouth = seed % 4;
  const collar = seed % 2 === 0;
  const shoulder = 92 + (seed % 18);
  const accentBand = pick(["top", "left", "right"], seed);
  const lineCount = 8 + (seed % 4);
  const dots = Array.from({ length: 10 }, (_, index) => {
    const x = 70 + ((seed >> (index % 8)) % 24) + index * 52;
    const y = 86 + ((seed >> ((index + 2) % 8)) % 18) + (index % 3) * 48;
    return `<circle cx="${x}" cy="${y}" r="${(index % 3) + 1}" fill="${palette.accent}" fill-opacity="0.22" />`;
  }).join("");

  const lines = Array.from({ length: lineCount }, (_, index) => {
    const x1 = 28 + ((seed >> (index % 8)) % 40);
    const x2 = 604 - ((seed >> ((index + 1) % 8)) % 44);
    const y = 88 + index * 60;
    return `<path d="M ${x1} ${y} L ${x2} ${y}" stroke="${palette.accent}" stroke-opacity="${0.08 + (index % 3) * 0.03}" stroke-width="2" />`;
  }).join("");

  const hair = [
    `<path d="M 210 226 C 210 144, 264 106, 323 104 C 382 102, 440 141, 444 225 C 430 219, 407 207, 372 200 C 343 194, 308 193, 280 199 C 248 206, 229 216, 210 226 Z" fill="${palette.ink}" fill-opacity="0.95" />`,
    `<path d="M 205 230 C 210 162, 258 120, 323 114 C 386 108, 439 145, 447 221 C 430 214, 409 206, 374 198 C 344 192, 306 191, 278 198 C 243 206, 223 216, 205 230 Z" fill="${palette.ink}" fill-opacity="0.92" />`,
    `<path d="M 214 236 C 216 151, 262 112, 325 109 C 393 106, 438 149, 442 228 C 425 221, 405 214, 374 206 C 344 198, 307 196, 279 202 C 247 209, 228 218, 214 236 Z" fill="${palette.ink}" fill-opacity="0.94" />`,
    `<path d="M 218 228 C 223 160, 266 120, 324 118 C 383 116, 432 152, 438 222 C 422 216, 402 208, 372 202 C 343 196, 309 195, 281 201 C 249 208, 233 217, 218 228 Z" fill="${palette.ink}" fill-opacity="0.93" />`,
  ][hairStyle];

  const glassesSvg = glasses
    ? `<g stroke="${palette.ink}" stroke-width="7" stroke-linecap="round" stroke-linejoin="round" fill="none" opacity="0.72">
        <rect x="250" y="256" width="68" height="34" rx="14" />
        <rect x="350" y="256" width="68" height="34" rx="14" />
        <path d="M 318 274 L 349 274" />
      </g>`
    : "";

  const mouthSvg = [
    `<path d="M 286 368 C 305 378, 339 378, 358 368" stroke="${palette.ink}" stroke-width="6" stroke-linecap="round" fill="none" opacity="0.88" />`,
    `<path d="M 289 368 C 307 381, 337 381, 356 368" stroke="${palette.ink}" stroke-width="6" stroke-linecap="round" fill="none" opacity="0.88" />`,
    `<path d="M 289 371 C 306 369, 337 369, 355 371" stroke="${palette.ink}" stroke-width="6" stroke-linecap="round" fill="none" opacity="0.88" />`,
    `<path d="M 289 366 C 309 374, 337 374, 355 366" stroke="${palette.ink}" stroke-width="6" stroke-linecap="round" fill="none" opacity="0.88" />`,
  ][mouth];

  const accentBlock = accentBand === "top"
    ? `<rect x="108" y="90" width="424" height="26" rx="13" fill="${palette.accent}" fill-opacity="0.18" />`
    : accentBand === "left"
      ? `<rect x="92" y="116" width="24" height="510" rx="12" fill="${palette.accent}" fill-opacity="0.18" />`
      : `<rect x="524" y="116" width="24" height="510" rx="12" fill="${palette.accent}" fill-opacity="0.18" />`;

  const collarSvg = collar
    ? `<path d="M 228 501 C 256 470, 282 455, 323 455 C 364 455, 390 470, 418 501 L 448 674 L 192 674 Z" fill="${palette.accent}" fill-opacity="0.14" />`
    : `<path d="M 228 501 C 260 477, 286 466, 323 466 C 360 466, 386 477, 418 501 L 448 674 L 192 674 Z" fill="${palette.ink}" fill-opacity="0.09" />`;

  const tieSvg = collar
    ? `<path d="M 322 462 L 345 501 L 326 663 L 299 663 L 279 501 Z" fill="${palette.blush}" fill-opacity="0.78" />`
    : `<path d="M 318 460 L 344 508 L 326 663 L 299 663 L 279 508 Z" fill="${palette.blush}" fill-opacity="0.72" />`;

  const faceSvg = `
    <ellipse cx="322" cy="298" rx="92" ry="110" fill="#f4f1e8" />
    <ellipse cx="322" cy="296" rx="78" ry="96" fill="#efe8db" opacity="0.9" />
    <path d="M 250 326 C 252 292, 265 254, 292 234 C 307 223, 339 220, 355 231 C 382 251, 394 287, 394 325 C 374 340, 353 348, 321 349 C 289 348, 269 341, 250 326 Z" fill="${palette.ink}" fill-opacity="0.08" />
    <path d="M 287 255 C 292 247, 304 241, 317 241 C 330 241, 343 247, 348 255" stroke="${palette.ink}" stroke-width="5" stroke-linecap="round" fill="none" opacity="0.54" />
    <path d="M 270 292 C 279 285, 293 282, 304 284" stroke="${palette.ink}" stroke-width="5" stroke-linecap="round" fill="none" opacity="0.45" />
    <path d="M 340 292 C 351 285, 365 282, 375 284" stroke="${palette.ink}" stroke-width="5" stroke-linecap="round" fill="none" opacity="0.45" />
    <path d="M 321 275 C 318 289, 318 303, 321 315" stroke="${palette.ink}" stroke-width="4" stroke-linecap="round" fill="none" opacity="0.38" />
    ${mouthSvg}
    ${glassesSvg}
  `;

  const shouldersSvg = `
    <path d="M ${322 - shoulder} 676 C ${252 - shoulder / 2} 607, ${274 - shoulder / 3} 552, 322 552 C 370 ${552 - shoulder / 15}, ${392 + shoulder / 3} 607, ${322 + shoulder} 676 Z" fill="${palette.ink}" fill-opacity="0.12" />
    <path d="M 210 676 C 236 608, 270 566, 322 566 C 374 566, 408 608, 434 676 Z" fill="${palette.ink}" fill-opacity="0.08" />
  `;

  const backgroundGrad = `
    <defs>
      <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#f7f4ec" />
        <stop offset="100%" stop-color="#ece9de" />
      </linearGradient>
      <pattern id="microgrid" width="24" height="24" patternUnits="userSpaceOnUse">
        <path d="M 24 0 L 0 0 0 24" fill="none" stroke="${palette.accent}" stroke-opacity="0.08" stroke-width="1" />
      </pattern>
      <pattern id="dots" width="26" height="26" patternUnits="userSpaceOnUse">
        <circle cx="4" cy="4" r="1.4" fill="${palette.accent}" fill-opacity="0.22" />
      </pattern>
      <filter id="grain">
        <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="1" stitchTiles="stitch" />
        <feColorMatrix type="saturate" values="0" />
        <feComponentTransfer>
          <feFuncA type="table" tableValues="0 0.18" />
        </feComponentTransfer>
      </filter>
    </defs>
  `;

  const frame = `
    <rect x="26" y="26" width="588" height="748" rx="28" fill="url(#bg)" />
    <rect x="34" y="34" width="572" height="732" rx="24" fill="none" stroke="${palette.ink}" stroke-opacity="0.12" stroke-width="2" />
    <rect x="54" y="54" width="532" height="692" rx="22" fill="none" stroke="${palette.accent}" stroke-opacity="0.12" stroke-width="1.5" stroke-dasharray="8 10" />
    <rect x="60" y="60" width="520" height="680" rx="20" fill="url(#microgrid)" opacity="0.42" />
    <rect x="60" y="60" width="520" height="680" rx="20" fill="url(#dots)" opacity="0.12" />
    <rect x="48" y="50" width="544" height="686" rx="24" filter="url(#grain)" opacity="0.35" />
    ${accentBlock}
    ${lines}
    ${dots}
    ${collarSvg}
    ${tieSvg}
    ${hair}
    ${faceSvg}
    ${shouldersSvg}
  `;

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 800" role="img" aria-label="${person.name}のKean資料イラスト">
  ${backgroundGrad}
  ${frame}
</svg>`;
}
