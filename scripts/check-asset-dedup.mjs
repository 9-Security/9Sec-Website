#!/usr/bin/env node
// Guard against the duplicated/accumulated asset-bundle problem reaching the live site.
// See scripts/ASSET-DEDUP.md for background.
//
// FAILS (exit 1) on the duplication that actually breaks the site:
//   • duplicate family       — more than one variant of the same chunk family/ext
//                              (e.g. two different main-*.js → loaded/booted twice)
//   • multi-variant HTML ref  — a single .html references >1 variant of a family
//
// WARNS (non-fatal) on:
//   • accumulated filename    — a bundle name with a dash-token repeated 2+ times
//                              (e.g. main-...-B0bvABPC-B0bvABPC-...js). A single such
//                              file is only a pipeline smell, not a load bug, so it is
//                              reported but does not fail the build.
//
// No dependencies; run from the repo root: `node scripts/check-asset-dedup.mjs`.

import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

const ASSETS = 'assets';
const HASH = /^[A-Za-z0-9_]{8}$/; // Vite content-hash token (8 chars)
const problems = []; // fatal
const warnings = []; // non-fatal (pipeline smell)

// Family key = basename prefix before the first content-hash token, plus extension.
// e.g. main-C6k6dQLZ-...js -> "main.js"; modulepreload-polyfill-B5Qt9EMX.js -> "modulepreload-polyfill.js"
function familyKey(file) {
  const ext = file.includes('.') ? file.slice(file.lastIndexOf('.')) : '';
  const stem = ext ? file.slice(0, -ext.length) : file;
  const parts = stem.split('-');
  const idx = parts.findIndex((p) => HASH.test(p));
  const base = idx === -1 ? stem : parts.slice(0, idx).join('-');
  return `${base}${ext}`;
}

// A name is "accumulated" if any dash-delimited token repeats within it.
function isAccumulated(file) {
  const stem = file.includes('.') ? file.slice(0, file.lastIndexOf('.')) : file;
  const tokens = stem.split('-').filter(Boolean);
  const counts = new Map();
  for (const t of tokens) counts.set(t, (counts.get(t) || 0) + 1);
  return [...counts.entries()].filter(([, n]) => n >= 2).map(([t]) => t);
}

// --- collect asset files ---
let assetFiles = [];
try {
  assetFiles = readdirSync(ASSETS).filter((f) => /\.(js|css)$/.test(f) && statSync(join(ASSETS, f)).isFile());
} catch {
  console.error(`[check-asset-dedup] cannot read ./${ASSETS} — run from the repo root.`);
  process.exit(2);
}

// 1) accumulated filenames (warn only)
for (const f of assetFiles) {
  const repeated = isAccumulated(f);
  if (repeated.length) {
    warnings.push(`accumulated filename: ${ASSETS}/${f}  (repeated token(s): ${repeated.join(', ')})`);
  }
}

// 2) duplicate families
const families = new Map();
for (const f of assetFiles) {
  const k = familyKey(f);
  (families.get(k) || families.set(k, []).get(k)).push(f);
}
for (const [k, files] of families) {
  if (files.length > 1) {
    problems.push(`duplicate family "${k}" — ${files.length} variants:\n    ${files.join('\n    ')}`);
  }
}

// 3) multi-variant references within a single HTML file
const htmls = readdirSync('.').filter((f) => f.endsWith('.html'));
for (const h of htmls) {
  const src = readFileSync(h, 'utf8');
  const refs = [...src.matchAll(/\/assets\/([A-Za-z0-9_.\-]+\.(?:js|css))/g)].map((m) => m[1]);
  const byFamily = new Map();
  for (const r of refs) {
    const k = familyKey(r);
    if (!byFamily.has(k)) byFamily.set(k, new Set());
    byFamily.get(k).add(r);
  }
  for (const [k, set] of byFamily) {
    if (set.size > 1) {
      problems.push(`${h}: references ${set.size} variants of family "${k}":\n    ${[...set].join('\n    ')}`);
    }
  }
}

if (warnings.length) {
  console.warn('\n[check-asset-dedup] warnings (pipeline smell — accumulated hash names, non-fatal):');
  for (const w of warnings) console.warn('  ! ' + w);
}

if (problems.length) {
  console.error('\n[check-asset-dedup] FAILED — bundle duplication detected (loaded/booted multiple times):\n');
  for (const p of problems) console.error('  • ' + p);
  console.error('\nFix: consolidate to one canonical file per family (see scripts/ASSET-DEDUP.md),');
  console.error('and address the build pipeline so it does not append hashes / inject duplicate refs.\n');
  process.exit(1);
}

console.log(`\n[check-asset-dedup] OK — ${assetFiles.length} asset files, ${families.size} families, single variant each; no multi-variant HTML refs.${warnings.length ? ` (${warnings.length} non-fatal name warning(s) above)` : ''}`);
