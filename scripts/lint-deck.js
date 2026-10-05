#!/usr/bin/env node
// scripts/lint-deck.js
// Slide-craft deterministic lint.
// Usage: node scripts/lint-deck.js <file.html> [...]
//        node scripts/lint-deck.js <dir>     # all *.html inside (recursive)
//
// Exit codes:
//   0 = no P0 issues (P1/P2 are tolerated)
//   1 = at least one P0 issue
//   2 = invocation error
//
// Severity model:
//   P0 = blocker, must fix before ship (canvas, motif budget, sans-serif display, emoji, raw hex outside tokens, shape-dimensions)
//   P1 = warning, fix when convenient   (counter HUD, screen-label, script count, image rules, look/shape validity, combinations, budgets)
//   P2 = info, optional polish          (transition duration outside canonical)

'use strict';

const fs = require('node:fs');
const path = require('node:path');

// ── Rule constants ───────────────────────────────────────────────────
const ALLOWED_TOKENS = ['--bg', '--surface', '--fg', '--muted', '--border', '--accent', '--gold'];
const SEVEN_TOKEN_HEXES = new Set(['#F5EBD9', '#EFE3CC', '#5C1A1B', '#8A7560', '#B5A285', '#73201D', '#A8915C']);
const FORBIDDEN_DISPLAY_FONTS = ['Inter', 'Roboto', 'Arial', 'Helvetica', 'Montserrat', 'Open Sans', 'Lato', 'Poppins'];
const ALLOWED_SVG_PER_SLIDE = 2;
const MAX_SLIDES = 40;
const CANONICAL_TRANSITION_MS = 350;
const ALLOWED_EMOJI = new Set(['✝']);

// ── v0.1.1 axes: look + shape ────────────────────────────────────────
const VALID_LOOKS = new Set(['monastic', 'festive', 'typographic']);
const VALID_SHAPES = new Set(['landscape-16-9', 'portrait-3-4', 'square-1-1', 'ultrawide-21-9']);
const SHAPE_DIMENSIONS = {
  'landscape-16-9': [1920, 1080],
  'portrait-3-4':   [1440, 1920],
  'square-1-1':     [1440, 1440],
  'ultrawide-21-9': [2520, 1080]
};
const LOOK_BUDGETS = {
  'festive':      2,
  'typographic':  1
};
const VALID_COMBINATIONS = {
  cover:       ['monastic', 'festive'],
  scripture:   ['monastic', 'typographic'],
  doctrine:    ['monastic'],
  reflection:  ['monastic', 'typographic'],
  prayer:      ['monastic', 'festive'],
  summary:     ['monastic'],
  divider:     ['monastic', 'festive'],
  closing:     ['monastic', 'festive']
};

// ── Helpers ─────────────────────────────────────────────────────────
function listHtmlFiles(target) {
  const stat = fs.statSync(target);
  if (stat.isFile()) return [target];
  const out = [];
  function walk(dir) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const p = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(p);
      else if (entry.isFile() && p.endsWith('.html')) out.push(p);
    }
  }
  walk(target);
  return out;
}

function splitSections(html) {
  return html.match(/<section\b[^>]*>[\s\S]*?<\/section>/g) || [];
}

function extractDeclared(html) {
  const htmlTagMatch = html.match(/<html\b([^>]*)>/);
  const attrs = htmlTagMatch ? htmlTagMatch[1] : '';
  const look = (attrs.match(/\blook-([\w-]+)\b/) || [])[1] || 'monastic';
  const shape = (attrs.match(/\bshape-([\w-]+)\b/) || [])[1] || 'landscape-16-9';
  return { look, shape };
}

function effectiveLook(slideHTML, defaultLook) {
  const m = slideHTML.match(/\blook-([\w-]+)\b/);
  return m ? m[1] : defaultLook;
}

function archetypeOf(slideHTML) {
  const m = slideHTML.match(/\bslide--(\w+)/);
  return m ? m[1] : null;
}

// ── Lint checks ─────────────────────────────────────────────────────
function lintHtml(file, html) {
  const issues = [];
  const slides = splitSections(html);
  const declared = extractDeclared(html);

  // 1. Canvas — .stage with explicit dimensions (any valid shape).
  const stageMatch = html.match(/\.stage\s*\{[^}]*width:\s*(\d+)px[^}]*height:\s*(\d+)px/);
  if (!stageMatch) {
    issues.push({ rule: 'canvas', severity: 'P0', message: '.stage with explicit pixel dimensions not found' });
  } else if (stageMatch[1] !== '1920' || stageMatch[2] !== '1080') {
    // OK if matches one of the declared shapes (caught by shape-dimensions below).
    // Otherwise P0.
  }

  // 2. Counter HUD present.
  if (!/<div[^>]*class="[^"]*\bcounter\b[^"]*"/.test(html)) {
    issues.push({ rule: 'counter', severity: 'P1', message: 'No .counter HUD element found' });
  }

  // 3. data-screen-label on every slide.
  for (let i = 0; i < slides.length; i++) {
    if (!/\bdata-screen-label=/.test(slides[i])) {
      issues.push({ rule: 'screen-label', severity: 'P1', message: `Slide #${i + 1} is missing data-screen-label` });
    }
  }

  // 4. ≤MAX_SLIDES.
  if (slides.length > MAX_SLIDES) {
    issues.push({ rule: 'slide-count', severity: 'P1', message: `Deck has ${slides.length} slides; soft cap is ${MAX_SLIDES}` });
  }

  // 5. Sans-serif display fonts forbidden as primary.
  const fontDecls = [...html.matchAll(/font-family\s*:\s*([^;}]+)/g)].map((m) => m[1]);
  for (const decl of fontDecls) {
    const firstToken = decl.split(',')[0].trim().replace(/^["']|["']$/g, '').trim();
    const isBannedPrimary = FORBIDDEN_DISPLAY_FONTS.some(
      (f) => firstToken.toLowerCase() === f.toLowerCase()
    );
    if (isBannedPrimary) {
      issues.push({ rule: 'sans-serif-display', severity: 'P0', message: `font-family uses sans-serif "${firstToken}" as primary; catechism system is serif throughout` });
    }
  }

  // 6. ≤ALLOWED_SVG_PER_SLIDE motifs per slide.
  for (const [i, s] of slides.entries()) {
    const svg = (s.match(/<svg\b/g) || []).length;
    if (svg > ALLOWED_SVG_PER_SLIDE) {
      issues.push({ rule: 'motif-budget', severity: 'P0', message: `Slide #${i + 1} has ${svg} SVG motifs; max ${ALLOWED_SVG_PER_SLIDE}` });
    }
  }

  // 7. Emoji (only ✝ allowed).
  const emojiRe = /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{1F1E6}-\u{1F1FF}]/gu;
  const emojis = html.match(emojiRe) || [];
  const offenders = [...new Set(emojis.filter((e) => !ALLOWED_EMOJI.has(e)))];
  if (offenders.length > 0) {
    issues.push({ rule: 'emoji', severity: 'P0', message: `Emoji found: ${offenders.join(' ')}; only ✝ is permitted` });
  }

  // 8. <script> tags — only the framework nav script should be present.
  const scripts = html.match(/<script\b[^>]*>[\s\S]*?<\/script>/g) || [];
  if (scripts.length > 1) {
    issues.push({ rule: 'script-tags', severity: 'P1', message: `Deck has ${scripts.length} <script> blocks; only one (the framework nav) is expected` });
  }
  if (scripts.length === 1 && !/is-active/.test(scripts[0])) {
    issues.push({ rule: 'script-shape', severity: 'P1', message: 'Single <script> does not look like the framework nav script (no `is-active` toggle)' });
  }

  // 9. Raw hex outside the seven tokens.
  const hexRe = /#[0-9A-Fa-f]{6}\b/g;
  const hexes = [...new Set((html.match(hexRe) || []).map((h) => h.toUpperCase()))];
  const strayHexes = hexes.filter((h) => !SEVEN_TOKEN_HEXES.has(h));
  if (strayHexes.length > 0) {
    issues.push({ rule: 'palette-tokens', severity: 'P0', message: `Raw hex outside the seven tokens: ${strayHexes.join(' ')}` });
  }

  // 10. Image rules.
  const imgTags = [...html.matchAll(/<img\b([^>]*)>/g)];
  for (const m of imgTags) {
    const attrs = m[1];
    if (!/\bloading="lazy"/.test(attrs)) {
      issues.push({ rule: 'image-lazy', severity: 'P1', message: '<img> missing loading="lazy"' });
    }
    if (!/\bdecoding="async"/.test(attrs)) {
      issues.push({ rule: 'image-decode', severity: 'P1', message: '<img> missing decoding="async"' });
    }
  }

  // 11. Animation duration (canonical 350 ms).
  const transitions = [...html.matchAll(/transition\s*:\s*([^;}]+)/gi)];
  for (const m of transitions) {
    const decl = m[1];
    const dur = decl.match(/(\d+)ms/);
    if (dur && dur[1] !== String(CANONICAL_TRANSITION_MS)) {
      issues.push({ rule: 'animation-duration', severity: 'P2', message: `Transition duration ${dur[1]}ms; canonical is ${CANONICAL_TRANSITION_MS}ms` });
    }
  }

  // 12. v0.1.1 — declared look + shape are valid names.
  if (!VALID_LOOKS.has(declared.look)) {
    issues.push({ rule: 'look-valid', severity: 'P1', message: `look "${declared.look}" is not in the valid set: ${[...VALID_LOOKS].join(', ')}` });
  }
  if (!VALID_SHAPES.has(declared.shape)) {
    issues.push({ rule: 'shape-valid', severity: 'P1', message: `shape "${declared.shape}" is not in the valid set: ${[...VALID_SHAPES].join(', ')}` });
  }

  // 13. Stage dimensions match declared shape (P0).
  const expected = SHAPE_DIMENSIONS[declared.shape];
  if (stageMatch && expected) {
    const w = parseInt(stageMatch[1], 10);
    const h = parseInt(stageMatch[2], 10);
    if (w !== expected[0] || h !== expected[1]) {
      issues.push({ rule: 'shape-dimensions', severity: 'P0', message: `stage is ${w}×${h}; declared shape "${declared.shape}" requires ${expected[0]}×${expected[1]}` });
    }
  }

  // 14. v0.1.1 — combination valid per slide (archetype × look).
  for (let i = 0; i < slides.length; i++) {
    const look = effectiveLook(slides[i], declared.look);
    const arch = archetypeOf(slides[i]);
    if (arch && VALID_COMBINATIONS[arch] && !VALID_COMBINATIONS[arch].includes(look)) {
      issues.push({ rule: 'combination', severity: 'P1', message: `Slide #${i + 1} (${arch}) does not pair with look "${look}"; valid: ${VALID_COMBINATIONS[arch].join(', ')}` });
    }
  }

  // 15. v0.1.1 — look budget per deck (effective look per slide).
  const lookCounts = {};
  for (let i = 0; i < slides.length; i++) {
    const look = effectiveLook(slides[i], declared.look);
    lookCounts[look] = (lookCounts[look] || 0) + 1;
  }
  for (const [look, count] of Object.entries(lookCounts)) {
    const budget = LOOK_BUDGETS[look];
    if (budget && count > budget) {
      issues.push({ rule: 'look-budget', severity: 'P1', message: `look "${look}" allows max ${budget} per deck; this deck has ${count}` });
    }
  }

  return { file, slideCount: slides.length, issues };
}

// ── CLI ─────────────────────────────────────────────────────────────
function main(argv) {
  if (argv.length === 0) {
    console.error('Usage: node scripts/lint-deck.js <file-or-dir> [...]');
    process.exit(2);
  }

  let files = [];
  for (const arg of argv) {
    if (!fs.existsSync(arg)) {
      console.error(`Not found: ${arg}`);
      process.exit(2);
    }
    files = files.concat(listHtmlFiles(arg));
  }

  let hasP0 = false;
  let totalIssues = 0;
  for (const file of files) {
    const html = fs.readFileSync(file, 'utf8');
    const result = lintHtml(file, html);
    console.log(`\n${path.relative(process.cwd(), result.file)} — ${result.slideCount} slide(s)`);
    if (result.issues.length === 0) {
      console.log('  ✓ clean');
      continue;
    }
    totalIssues += result.issues.length;
    for (const issue of result.issues) {
      console.log(`  ✗ [${issue.severity}] ${issue.rule}: ${issue.message}`);
      if (issue.severity === 'P0') hasP0 = true;
    }
  }

  console.log(`\n${files.length} file(s), ${totalIssues} issue(s).`);
  process.exit(hasP0 ? 1 : 0);
}

if (require.main === module) {
  main(process.argv.slice(2));
}

module.exports = { lintHtml };