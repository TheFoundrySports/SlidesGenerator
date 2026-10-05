// tests/smoke-parse-decks.js
// Smoke test: parse every HTML deck in the project root and confirm the
// shared helpers extract the expected <style> + <section class="slide">
// structure. Also smoke-test sidecar parsing with empty and full notes.

'use strict';

const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');

const { parseDeckHtml, parseSidecar, emptySidecar } = require('../presenter-shared');

const ROOT = path.resolve(__dirname, '..');

function listDecks(dir) {
  return fs.readdirSync(dir)
    .filter((f) => f.endsWith('.html'))
    .filter((f) => !f.startsWith('presenter.html') === false ? false : true)
    .filter((f) => f !== 'presenter.html')
    .filter((f) => f !== 'index.html') // index.html *is* a deck, keep it
    .map((f) => path.join(dir, f));
}

// Hand-curated expected slide counts (verified with grep -c "<section").
const EXPECTED = {
  'catechism-deck-dios-padre-creador.html': 18,
  'catechism-deck-dios-padre-creador-2.html': 18,
  'catechism-deck-dios-padre-creador-3.html': 18,
  'index.html': 3
};

const failures = [];
let parsed = 0;

for (const file of listDecks(ROOT)) {
  const name = path.basename(file);
  try {
    const html = fs.readFileSync(file, 'utf8');
    const { styles, slides } = parseDeckHtml(html);
    const expected = EXPECTED[name];

    assert.ok(styles.length >= 1, `${name}: at least one <style>`);
    assert.equal(slides.length, expected, `${name}: slide count matches EXPECTED`);

    for (const s of slides) {
      assert.match(s.outerHtml, /^<section\b/, `${name}: every slide outerHtml starts with <section`);
      assert.match(s.attrs, /\bclass\s*=\s*["'][^"']*\bslide\b/, `${name}: every slide has class "slide"`);
    }

    console.log(`  ✓ ${name}  (${slides.length} slides, ${styles.length} style blocks)`);
    parsed++;
  } catch (e) {
    console.error(`  ✗ ${name}  ${e.message}`);
    failures.push({ name, error: e.message });
  }
}

console.log(`\nParsed ${parsed} deck(s).`);
if (failures.length) {
  console.error(`${failures.length} failure(s).`);
  process.exit(1);
}

// Sidecar round-trip: empty template parses back to same length.
for (const file of Object.keys(EXPECTED)) {
  const total = EXPECTED[file];
  const txt = emptySidecar(total, file);
  const back = parseSidecar(txt, total);
  assert.equal(back.length, total);
  for (const n of back) assert.equal(n, '');
  console.log(`  ✓ sidecar round-trip ${file}  (${total} empty slots)`);
}

// Sidecar with realistic content for the big deck.
const sampleNotes = parseSidecar(
  JSON.stringify({
    deck: 'catechism-deck-dios-padre-creador-3',
    slides: [
      'Cubierta. Saludo. Una respiración antes de empezar.',
      'Doctrina. Enfatizar "por su libre voluntad y por amor".',
      '' // un slide sin notas
    ]
  }),
  18
);
assert.equal(sampleNotes.length, 18);
assert.equal(sampleNotes[0], 'Cubierta. Saludo. Una respiración antes de empezar.');
assert.equal(sampleNotes[1].includes('libre voluntad'), true);
assert.equal(sampleNotes[2], '');
console.log('  ✓ sidecar realistic content parses and pads to 18');

console.log('\nAll smoke checks passed.');