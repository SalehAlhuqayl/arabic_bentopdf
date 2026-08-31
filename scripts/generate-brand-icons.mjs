// Regenerates the PNG/ICO brand icons for المحرر from the SVG mark.
// Run: node scripts/generate-brand-icons.mjs
import { Resvg } from '@resvg/resvg-js';
import pngToIco from 'png-to-ico';
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const imagesDir = resolve(__dirname, '../public/images');
const publicDir = resolve(__dirname, '../public');

// The brand mark (indigo insertion-caret over a baseline).
const MARK = `
  <defs>
    <linearGradient id="g" x1="32" y1="16" x2="32" y2="52" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="#A5B4FC"/>
      <stop offset="1" stop-color="#6366F1"/>
    </linearGradient>
  </defs>
  <path d="M17 37 L32 20 L47 37" fill="none" stroke="url(#g)" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M22 48 H42" fill="none" stroke="url(#g)" stroke-width="8" stroke-linecap="round"/>
`;

// Circular disc version (small favicons).
const circleSvg = `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
  <circle cx="32" cy="32" r="32" fill="#111827"/>${MARK}</svg>`;

// Full-bleed square version with safe-zone padding (PWA maskable + apple-touch).
const squareSvg = `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
  <rect width="64" height="64" fill="#111827"/>
  <g transform="translate(32,32) scale(0.72) translate(-32,-32)">${MARK}</g></svg>`;

function render(svg, size) {
  const r = new Resvg(svg, { fitTo: { mode: 'width', value: size } });
  return r.render().asPng();
}

const jobs = [
  ['favicon.png', circleSvg, 48],
  ['favicon-192x192.png', squareSvg, 192],
  ['favicon-512x512.png', squareSvg, 512],
  ['apple-touch-icon.png', squareSvg, 180],
];

for (const [name, svg, size] of jobs) {
  writeFileSync(resolve(imagesDir, name), render(svg, size));
  console.log('wrote', name, size);
}

// Multi-resolution .ico from the circular mark.
const icoBuf = await pngToIco([
  render(circleSvg, 16),
  render(circleSvg, 32),
  render(circleSvg, 48),
]);
writeFileSync(resolve(publicDir, 'favicon.ico'), icoBuf);
console.log('wrote favicon.ico');
