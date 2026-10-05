#!/usr/bin/env node
// scripts/pptx-to-deck.js
// PPTX → catechetical HTML deck importer.
//
// Usage:
//   node scripts/pptx-to-deck.js <input.pptx> <output-deck-name>
//     [--map "1:cover,2:scripture,3:doctrine,4:summary,5:closing"]
//     [--auto]
//     [--out-dir <path>]   (default: user-decks/)
//
// Modes:
//   - Default (interactive): for each slide, prints the extracted
//     content and a heuristic guess, then prompts for the archetype.
//   - --map "...": non-interactive. Uses the explicit slide→archetype map.
//   - --auto: non-interactive. Uses the heuristic for every slide.
//
// Extracts: text, position, font size, bold, italic, images.
// Discards: colors, fonts, themes, layouts, animations, transitions.
// Applies: the 7 catechism tokens, the catechism fonts, the 8 archetypes.

'use strict';

const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');
const readline = require('node:readline');
const JSZip = require('jszip');

const { emptySidecar } = require('../presenter-shared');

// ── Pure helpers (exported for testing) ──────────────────────────────

function emuToPx(emu) {
  return Math.round(emu / 9525);
}

function parseRpr(rprXml) {
  if (!rprXml) return { size: null, bold: false, italic: false };
  const szMatch = rprXml.match(/\bsz="(\d+)"/);
  return {
    size: szMatch ? parseInt(szMatch[1], 10) / 100 : null,
    bold: /\bb="1"/.test(rprXml),
    italic: /\bi="1"/.test(rprXml)
  };
}

function parseShape(shapeXml) {
  const xfrmMatch = shapeXml.match(/<a:xfrm[^>]*>([\s\S]*?)<\/a:xfrm>/);
  if (!xfrmMatch) return null;
  const offMatch = xfrmMatch[1].match(/<a:off\s+x="(-?\d+)"\s+y="(-?\d+)"\s*\/>/);
  const extMatch = xfrmMatch[1].match(/<a:ext\s+cx="(\d+)"\s+cy="(\d+)"\s*\/>/);
  if (!offMatch || !extMatch) return null;
  const x = emuToPx(parseInt(offMatch[1], 10));
  const y = emuToPx(parseInt(offMatch[2], 10));
  const w = emuToPx(parseInt(extMatch[1], 10));
  const h = emuToPx(parseInt(extMatch[2], 10));

  if (/<p:pic\b/.test(shapeXml)) {
    const blipMatch = shapeXml.match(/<a:blip\s+r:embed="(rId\d+)"/);
    return { kind: 'image', x, y, w, h, rId: blipMatch ? blipMatch[1] : null };
  }

  if (/<p:sp\b/.test(shapeXml)) {
    const runs = [];
    const runRe = /<a:r>([\s\S]*?)<\/a:r>/g;
    let m;
    while ((m = runRe.exec(shapeXml)) !== null) {
      const runXml = m[1];
      const textMatch = runXml.match(/<a:t>([\s\S]*?)<\/a:t>/);
      if (!textMatch) continue;
      const rprMatch = runXml.match(/<a:rPr([^/>]*?)\/>/);
      const rpr = parseRpr(rprMatch ? rprMatch[1] : '');
      runs.push({
        text: decodeXmlEntities(textMatch[1]),
        size: rpr.size,
        bold: rpr.bold,
        italic: rpr.italic
      });
    }
    if (runs.length === 0) return null;
    return {
      kind: 'text',
      x, y, w, h,
      runs,
      text: runs.map(r => r.text).join(''),
      maxSize: runs.reduce((m, r) => Math.max(m, r.size || 0), 0),
      anyBold: runs.some(r => r.bold),
      anyItalic: runs.some(r => r.italic)
    };
  }

  return null;
}

function decodeXmlEntities(s) {
  return s
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, '&');
}

function parseSlideXml(xml) {
  const shapes = [];
  const shapeRe = /<p:(sp|pic)\b[^>]*>([\s\S]*?)<\/p:\1>/g;
  let m;
  while ((m = shapeRe.exec(xml)) !== null) {
    const s = parseShape(m[0]);
    if (s) shapes.push(s);
  }
  return shapes;
}

function parseRelsXml(relsXml) {
  const rels = {};
  const relRe = /<Relationship\s+([^>]*?)\/>/g;
  let m;
  while ((m = relRe.exec(relsXml)) !== null) {
    const attrs = m[1];
    const id = attrs.match(/\bId="([^"]+)"/);
    const target = attrs.match(/\bTarget="([^"]+)"/);
    if (id && target) rels[id[1]] = target[1];
  }
  return rels;
}

function parseSlideSize(presentationXml) {
  const m = presentationXml.match(/<p:sldSz\s+cx="(\d+)"\s+cy="(\d+)"(?:\s+type="[^"]+")?\s*\/>/);
  if (!m) return { w: 9144000, h: 6858000 };
  return { w: parseInt(m[1], 10), h: parseInt(m[2], 10) };
}

function heuristicArchetype(slide) {
  const shapes = slide.shapes;
  const textShapes = shapes.filter(s => s.kind === 'text');
  const imageShapes = shapes.filter(s => s.kind === 'image');
  const totalChars = textShapes.reduce((sum, s) => sum + s.text.length, 0);
  const numText = textShapes.length;
  const hasImage = imageShapes.length > 0;
  const index = slide.index;
  const total = slide.total;

  if (index === 1) return 'cover';
  if (index === total) return 'closing';
  if (hasImage && totalChars < 30) return 'cover';
  if (numText === 1 && totalChars > 5 && totalChars < 200) return 'reflection';
  if (numText >= 3) return 'doctrine';
  if (totalChars > 200) return 'prayer';
  return 'prayer';
}

function summarizeSlide(slide) {
  const textShapes = slide.shapes.filter(s => s.kind === 'text');
  const imageCount = slide.shapes.filter(s => s.kind === 'image').length;
  const totalChars = textShapes.reduce((sum, s) => sum + s.text.length, 0);
  const top = [...textShapes].sort((a, b) => (b.maxSize || 0) - (a.maxSize || 0)).slice(0, 3);
  return {
    index: slide.index,
    total: slide.total,
    textShapeCount: textShapes.length,
    imageCount,
    totalChars,
    topTexts: top.map(s => truncate(s.text.replace(/\s+/g, ' ').trim(), 60))
  };
}

function truncate(s, n) {
  return s.length > n ? s.slice(0, n - 1) + '…' : s;
}

const ARCHETYPES = ['cover', 'scripture', 'doctrine', 'reflection', 'prayer', 'summary', 'divider', 'closing'];

function buildPrompt(slideSummary, suggested) {
  return [
    `Slide ${slideSummary.index} of ${slideSummary.total}:`,
    `  ${slideSummary.textShapeCount} text block(s), ${slideSummary.imageCount} image(s), ${slideSummary.totalChars} chars`,
    ...slideSummary.topTexts.map(t => `  > ${t}`),
    ``,
    `  Suggested archetype: ${suggested}`,
    `  Choose [${ARCHETYPES.join('/')}] (enter = accept): `
  ].join('\n');
}

async function askArchetype(rl, slideSummary, suggested) {
  return new Promise((resolve) => {
    rl.question(buildPrompt(slideSummary, suggested), (answer) => {
      const trimmed = (answer || '').trim().toLowerCase();
      if (!trimmed) return resolve(suggested);
      if (ARCHETYPES.includes(trimmed)) return resolve(trimmed);
      console.error(`  Unknown archetype "${answer}". Try again.`);
      resolve(askArchetype(rl, slideSummary, suggested));
    });
  });
}

function parseMapArg(mapArg) {
  const map = {};
  if (!mapArg) return map;
  for (const pair of mapArg.split(',')) {
    const [k, v] = pair.split(':').map(s => s.trim());
    const idx = parseInt(k, 10);
    if (Number.isInteger(idx) && ARCHETYPES.includes(v)) {
      map[idx] = v;
    }
  }
  return map;
}

function parseArgs(argv) {
  const args = { input: null, deckName: null, map: {}, mode: 'interactive', outDir: 'user-decks' };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--map') args.map = parseMapArg(argv[++i]);
    else if (a === '--auto') args.mode = 'auto';
    else if (a === '--out-dir') args.outDir = argv[++i];
    else if (!args.input) args.input = a;
    else if (!args.deckName) args.deckName = a.replace(/\.html?$/i, '');
  }
  return args;
}

// ── HTML generation ──────────────────────────────────────────────────

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// Faithful extraction mode: no archetype templates. Each PPTX shape is
// rendered as an absolutely-positioned child of the slide section, at
// its source coordinates. The section uses position:relative; the
// shapes are placed via inline style. Text inherits the catechism font
// family and color tokens from the framework; layout comes from the
// source PPTX (which the user built with @DESIGN.md).
function renderTextShape(shape) {
  const fontSize = shape.maxSize || 22;
  const weight = shape.anyBold ? '600' : '400';
  const fontStyle = shape.anyItalic ? 'italic' : 'normal';
  return `<div class="shape-text" style="position:absolute;left:${Math.round(shape.x)}px;top:${Math.round(shape.y)}px;width:${Math.round(shape.w)}px;height:${Math.round(shape.h)}px;font-size:${fontSize}pt;font-weight:${weight};font-style:${fontStyle};display:flex;align-items:center;padding:8px;box-sizing:border-box;overflow:hidden;line-height:1.25;">${escapeHtml(shape.text)}</div>`;
}

function renderSlide(slide, index) {
  // Faithful extraction: each shape at its PPTX position. The source
  // PPTX's layout is preserved as-is; no archetype templates.
  const elements = slide.shapes
    .map(shape => {
      if (shape.kind === 'image') {
        return `<img class="slide-img" src="${escapeHtml(shape.src || '')}" alt="" loading="lazy" decoding="async" style="position:absolute;left:${Math.round(shape.x)}px;top:${Math.round(shape.y)}px;width:${Math.round(shape.w)}px;height:${Math.round(shape.h)}px;object-fit:contain;">`;
      }
      if (shape.kind === 'text') {
        return renderTextShape(shape);
      }
      return '';
    })
    .join('\n  ');

  const isActive = index === 1 ? ' is-active' : '';
  return `<section class="slide slide-faithful${isActive}" data-screen-label="Slide ${String(index).padStart(2, '0')}">\n  ${elements}\n</section>`;
}

function renderDeck(extracted, deckName) {
  const slides = extracted
    .sort((a, b) => a.index - b.index)
    .map(s => renderSlide(s, s.index))
    .join('\n\n');

  return `<!doctype html>
<html lang="es" class="look-monastic shape-landscape-16-9">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${escapeHtml(deckName)}</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@500;600;700&family=EB+Garamond:ital,wght@0,400;0,500;1,400;1,500&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
<link rel="stylesheet" href="slides/_looks/monastic.css">
<link rel="stylesheet" href="slides/_shapes/landscape-16-9.css">
<style>
:root {
  --bg: #F5EBD9; --surface: #EFE3CC; --fg: #5C1A1B; --muted: #8A7560;
  --border: #B5A285; --accent: #73201D; --gold: #A8915C;
  --font-display: "Cormorant Garamond", "EB Garamond", Georgia, serif;
  --font-body: "EB Garamond", Georgia, serif;
  --font-mono: "JetBrains Mono", ui-monospace, Menlo, monospace;
  --text-meta: 18px; --text-sm: 22px; --text-base: 28px; --text-lg: 36px;
  --text-xl: 56px; --text-2xl: 80px; --text-3xl: 112px;
  --leading-tight: 1.15; --leading-body: 1.45;
  --tracking-display: -0.01em;
}
* { box-sizing: border-box; }
html, body { margin: 0; padding: 0; height: 100%; overflow: hidden; }
body {
  width: 100vw; height: 100vh; display: grid; place-items: center;
  background: var(--bg);
  background-image: radial-gradient(ellipse at center, var(--bg) 0%, color-mix(in oklab, var(--bg), var(--fg) 12%) 100%);
  color: var(--fg); font-family: var(--font-body); font-size: var(--text-base); line-height: var(--leading-body);
}
.stage {
  width: 1920px; height: 1080px;
  transform: scale(var(--scale, 1)); transform-origin: center center;
  position: relative; background: var(--bg);
  background-image: radial-gradient(ellipse at center, var(--bg) 0%, color-mix(in oklab, var(--bg), var(--fg) 12%) 100%);
  flex-shrink: 0;
}
.slide {
  position: absolute; inset: 0; display: none; padding: 96px 140px;
  opacity: 0; transform: translateY(16px);
  transition: opacity 350ms cubic-bezier(.2,.7,.3,1), transform 350ms cubic-bezier(.2,.7,.3,1);
}
.slide.is-active { display: flex; flex-direction: column; justify-content: center; opacity: 1; transform: translateY(0); }
.slide h1 { font-family: var(--font-display); font-weight: 600; font-size: var(--text-2xl); line-height: var(--leading-tight); letter-spacing: var(--tracking-display); color: var(--fg); margin: 0 0 var(--space-3); text-align: center; }
.slide h2 { font-family: var(--font-display); font-weight: 600; font-size: var(--text-xl); line-height: var(--leading-tight); color: var(--fg); }
.slide p { font-family: var(--font-body); font-size: var(--text-base); line-height: var(--leading-body); color: var(--fg); }
.scripture { font-family: var(--font-body); font-style: italic; font-size: var(--text-lg); line-height: 1.55; text-align: center; max-width: 32ch; margin: auto; }
.scripture-ref { font-family: var(--font-mono); font-size: var(--text-sm); color: var(--muted); text-align: center; display: block; letter-spacing: 0.02em; }
.ccc-ref { font-family: var(--font-mono); font-size: var(--text-meta); color: var(--muted); }
.doctrine-list { list-style: none; padding: 0; margin: auto; max-width: 56ch; counter-reset: doctrine; }
.doctrine-list li { counter-increment: doctrine; margin-bottom: var(--space-3); font-family: var(--font-body); font-size: var(--text-base); line-height: var(--leading-body); padding-left: 4ch; position: relative; }
.doctrine-list li::before { content: counter(doctrine, upper-roman) "."; position: absolute; left: 0; font-family: var(--font-mono); color: var(--gold); font-weight: 500; }
.reflection { font-family: var(--font-display); font-style: italic; font-weight: 500; font-size: var(--text-xl); line-height: 1.4; text-align: center; max-width: 28ch; margin: auto; }
.summary-list { list-style: none; padding: 0; margin: 0 auto; max-width: 56ch; counter-reset: r; }
.summary-list li { counter-increment: r; margin-bottom: var(--space-4); font-family: var(--font-body); font-size: var(--text-lg); line-height: 1.4; display: grid; grid-template-columns: 48px 1fr; gap: var(--space-2); align-items: baseline; }
.summary-list li::before { content: counter(r); font-family: var(--font-display); font-weight: 600; font-size: var(--text-xl); color: var(--gold); }
.prayer { font-family: var(--font-body); font-size: var(--text-lg); line-height: 1.6; text-align: center; max-width: 46ch; margin: auto; }
.amen { position: absolute; bottom: 96px; left: 0; right: 0; text-align: center; font-family: var(--font-display); font-style: italic; font-size: var(--text-lg); color: var(--fg); }
.blessing { margin: auto; max-width: 32ch; font-family: var(--font-display); font-style: italic; font-size: var(--text-xl); line-height: 1.45; text-align: center; }
.ornament { display: grid; place-items: center; color: var(--gold); margin: auto; }
.ornament svg { width: 200px; height: 200px; display: block; }
.counter { position: absolute; bottom: 32px; right: 48px; font-family: var(--font-mono); font-size: var(--text-meta); letter-spacing: 0.18em; color: var(--muted); z-index: 100; }
.help { position: absolute; bottom: 32px; left: 48px; font-family: var(--font-mono); font-size: var(--text-meta); letter-spacing: 0.10em; color: var(--muted); z-index: 100; }
.help kbd { display: inline-block; font-family: var(--font-mono); font-size: 16px; padding: 1px 6px; border: 1px solid var(--border); border-radius: 3px; background: var(--surface); color: var(--muted); margin: 0 1px; }
.subtitle { text-align: center; font-family: var(--font-body); font-size: var(--text-lg); color: var(--muted); margin: 0 auto; max-width: 56ch; }

/* Faithful extraction mode: each slide is a relative container with
   absolutely-positioned children. Override the presenter's default
   .slide (which uses flex + padding + center) so the PPTX layout
   renders 1:1. The presenter's hide/show (display:none/flex) still
   works because we keep the .slide class; we just neutralize the
   layout-affecting properties when the section is faithful. */
.slide-faithful { padding: 0; }
.slide-faithful.is-active {
  display: block;
  flex-direction: initial;
  justify-content: initial;
  align-items: initial;
}
.slide-faithful .shape-text {
  font-family: var(--font-body);
  color: var(--fg);
}
@media print {
  @page { size: landscape; margin: 0; }
  .slide {
    display: flex !important;
    flex-direction: column;
    justify-content: center;
    opacity: 1 !important;
    transform: none !important;
    page-break-after: always;
    page-break-inside: avoid;
  }
  .slide:last-of-type { page-break-after: auto; }
  .counter, .help { display: none !important; }
  .slide-img { max-width: 100%; max-height: 100%; object-fit: contain; }
}
</style>
</head>
<body>

<div class="stage">
${slides}
</div>

<div class="counter" aria-live="polite">
  <span id="cNow">01</span><span class="counter-sep">/</span><span id="cTotal">${extracted.length}</span>
</div>
<div class="help" aria-hidden="true">
  <kbd>←</kbd> <kbd>→</kbd> navegar · <kbd>Inicio</kbd> <kbd>Fin</kbd> extremos
</div>

<script>
(function () {
  'use strict';
  const stage = document.querySelector('.stage');
  const slides = Array.from(stage.querySelectorAll('.slide'));
  const total = slides.length;
  const cNow = document.getElementById('cNow');
  const cTotal = document.getElementById('cTotal');
  cTotal.textContent = String(total).padStart(2, '0');

  function fit() {
    const s = Math.min(window.innerWidth / 1920, window.innerHeight / 1080);
    stage.style.setProperty('--scale', s);
  }
  window.addEventListener('resize', fit);
  fit();

  function show(i) {
    const clamped = Math.max(0, Math.min(total - 1, i));
    slides.forEach((s, j) => s.classList.toggle('is-active', j === clamped));
    cNow.textContent = String(clamped + 1).padStart(2, '0');
  }
  document.addEventListener('keydown', (e) => {
    const cur = slides.findIndex((s) => s.classList.contains('is-active'));
    if (cur < 0) return;
    switch (e.key) {
      case 'ArrowRight': case 'PageDown': case ' ': show(cur + 1); e.preventDefault(); break;
      case 'ArrowLeft':  case 'PageUp':     show(cur - 1); e.preventDefault(); break;
      case 'Home': show(0); e.preventDefault(); break;
      case 'End':  show(total - 1); e.preventDefault(); break;
    }
  });
  show(0);
})();
</script>
</body>
</html>
`;
}

// ── CLI integration ──────────────────────────────────────────────────

async function extractPptx(pptxPath) {
  const buffer = fs.readFileSync(pptxPath);
  const zip = await JSZip.loadAsync(buffer);

  const presentationXml = await zip.file('ppt/presentation.xml').async('string');
  const slideSize = parseSlideSize(presentationXml);

  const slideFiles = Object.keys(zip.files)
    .filter(f => /^ppt\/slides\/slide\d+\.xml$/.test(f))
    .sort();

  const extracted = [];
  const savedImages = [];
  const imageRelPaths = new Set();

  for (const f of slideFiles) {
    const slideN = parseInt(f.match(/slide(\d+)\.xml$/)[1], 10);
    const slideXml = await zip.file(f).async('string');
    const relsPath = f.replace('slides/', 'slides/_rels/').replace('.xml', '.xml.rels');
    const relsXml = zip.file(relsPath) ? await zip.file(relsPath).async('string') : '';
    const rels = relsXml ? parseRelsXml(relsXml) : {};

    const shapes = parseSlideXml(slideXml);

    for (const shape of shapes) {
      if (shape.kind !== 'image' || !shape.rId || !rels[shape.rId]) continue;
      const target = rels[shape.rId];
      const zipPath = 'ppt/' + target.replace(/^\.\.\//, '');
      if (!zip.file(zipPath) || imageRelPaths.has(zipPath)) continue;
      imageRelPaths.add(zipPath);
      const data = await zip.file(zipPath).async('nodebuffer');
      const imageName = path.basename(target);
      shape.imageName = imageName;
      shape.zipPath = zipPath;
      savedImages.push({ name: imageName, data });
    }

    extracted.push({
      index: slideN,
      total: slideFiles.length,
      shapes
    });
  }

  return { extracted, slideSize, savedImages };
}

function pickArchetypes(extracted, args) {
  const map = {};
  for (const slide of extracted) {
    if (args.map[slide.index]) {
      map[slide.index] = args.map[slide.index];
    } else {
      map[slide.index] = heuristicArchetype(slide);
    }
  }
  return map;
}

async function confirmArchetypesInteractive(extracted, suggested) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  const final = {};
  try {
    for (const slide of extracted) {
      const summary = summarizeSlide(slide);
      const guess = suggested[slide.index];
      const arch = await askArchetype(rl, summary, guess);
      final[slide.index] = arch;
    }
  } finally {
    rl.close();
  }
  return final;
}

function writeImages(outDir, deckName, savedImages) {
  const destDir = path.join(outDir, 'img', deckName);
  fs.mkdirSync(destDir, { recursive: true });
  for (const img of savedImages) {
    const dest = path.join(destDir, img.name);
    fs.writeFileSync(dest, img.data);
  }
  return destDir;
}

function patchImageSrcs(extracted, deckName) {
  for (const slide of extracted) {
    for (const shape of slide.shapes) {
      if (shape.kind === 'image' && shape.imageName) {
        shape.src = `img/${deckName}/${shape.imageName}`;
      }
    }
  }
}

function runLint(htmlPath) {
  try {
    execFileSync('node', ['scripts/lint-deck.js', htmlPath], { stdio: 'inherit' });
    return { ok: true };
  } catch (e) {
    return { ok: false, code: e.status };
  }
}

async function main(argv) {
  const args = parseArgs(argv);
  if (!args.input || !args.deckName) {
    console.error('Usage: node scripts/pptx-to-deck.js <input.pptx> <output-deck-name>');
    console.error('       [--map "1:cover,2:scripture,..."] [--auto]');
    process.exit(2);
  }
  if (!fs.existsSync(args.input)) {
    console.error(`File not found: ${args.input}`);
    process.exit(2);
  }

  console.error(`Extracting ${args.input}...`);
  const { extracted, savedImages } = await extractPptx(args.input);
  console.error(`  ${extracted.length} slides, ${savedImages.length} image(s).`);

  let archetypes = pickArchetypes(extracted, args);
  if (args.mode === 'interactive' && Object.keys(args.map).length === 0) {
    console.error('Asking archetype per slide (Ctrl-C to abort):');
    archetypes = await confirmArchetypesInteractive(extracted, archetypes);
  }

  console.error('Writing images...');
  fs.mkdirSync(args.outDir, { recursive: true });
  const imgDir = writeImages(args.outDir, args.deckName, savedImages);
  patchImageSrcs(extracted, args.deckName);

  console.error('Generating HTML...');
  const html = renderDeck(extracted, args.deckName);
  const htmlPath = path.join(args.outDir, `${args.deckName}.html`);
  fs.writeFileSync(htmlPath, html);

  console.error('Writing empty notes sidecar...');
  const notesPath = path.join(args.outDir, `${args.deckName}.notes.json`);
  fs.writeFileSync(notesPath, emptySidecar(extracted.length, args.deckName));

  console.error('Running lint...');
  const lintResult = runLint(htmlPath);

  console.log(`\nDone.`);
  console.log(`  HTML:       ${htmlPath}`);
  console.log(`  Notes:      ${notesPath}`);
  console.log(`  Images:     ${imgDir}/`);
  console.log(`  Lint:       ${lintResult.ok ? 'clean' : 'has issues (run with --auto to skip prompts and inspect)'}`);
  console.log(`\nNext: add to DECKS in presenter.js:`);
  console.log(`  { file: '${path.relative(process.cwd(), htmlPath)}', title: '${args.deckName}', label: '01 Cover' }`);
}

if (require.main === module) {
  main(process.argv.slice(2)).catch((e) => {
    console.error('Error:', e.message);
    process.exit(1);
  });
}

module.exports = {
  emuToPx,
  parseShape,
  parseSlideXml,
  parseRelsXml,
  parseSlideSize,
  heuristicArchetype,
  summarizeSlide,
  parseMapArg,
  parseArgs,
  escapeHtml,
  renderSlide,
  renderDeck,
  extractPptx,
  pickArchetypes,
  writeImages,
  patchImageSrcs,
  ARCHETYPES
};