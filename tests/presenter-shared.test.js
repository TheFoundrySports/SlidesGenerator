// tests/presenter-shared.test.js
// Run with: `node --test tests/`
// Pure-helper tests. No DOM, no network.

'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const {
  parseDeckHtml,
  parseSidecar,
  emptySidecar,
  computeStageScale,
  createBus,
  SHAPE_DIMENSIONS,
  extractShape,
  shapeDimensions
} = require('../presenter-shared');

const FIXTURES = path.join(__dirname, 'fixtures');

// ── parseDeckHtml ────────────────────────────────────────────────────
test('parseDeckHtml: throws TypeError on non-string', () => {
  assert.throws(() => parseDeckHtml(null), TypeError);
  assert.throws(() => parseDeckHtml(42), TypeError);
  assert.throws(() => parseDeckHtml({}), TypeError);
});

test('parseDeckHtml: extracts a single style block', () => {
  const html = '<html><head><style>body { color: red; }</style></head><body></body></html>';
  const { styles, slides } = parseDeckHtml(html);
  assert.equal(styles.length, 1);
  assert.match(styles[0], /body \{ color: red; \}/);
  assert.equal(slides.length, 0);
});

test('parseDeckHtml: extracts multiple style blocks', () => {
  const html = `
    <style>.a { color: red; }</style>
    <style>.b { color: blue; }</style>
  `;
  const { styles } = parseDeckHtml(html);
  assert.equal(styles.length, 2);
  assert.match(styles[0], /\.a/);
  assert.match(styles[1], /\.b/);
});

test('parseDeckHtml: extracts only sections with class "slide"', () => {
  const html = `
    <section class="slide"><h1>A</h1></section>
    <section class="slide slide--cover" data-x="2"><p>B</p></section>
    <section class="other"><p>C</p></section>
    <section><p>D</p></section>
  `;
  const { slides } = parseDeckHtml(html);
  assert.equal(slides.length, 2);
  assert.match(slides[0].outerHtml, /<h1>A<\/h1>/);
  assert.match(slides[1].attrs, /data-x="2"/);
});

test('parseDeckHtml: parses the real catechism deck fixture', () => {
  const deckPath = path.join(FIXTURES, 'mini-deck.html');
  const html = fs.readFileSync(deckPath, 'utf8');
  const { styles, slides } = parseDeckHtml(html);
  assert.ok(styles.length >= 1, 'should extract at least one <style>');
  assert.ok(slides.length >= 3, 'fixture has 3 slides');
  for (const s of slides) {
    assert.match(s.attrs, /\bslide\b/, 'every slide has class "slide"');
    assert.ok(s.outerHtml.startsWith('<section'), 'outerHtml is the section tag');
  }
});

// ── parseSidecar ─────────────────────────────────────────────────────
test('parseSidecar: throws TypeError on non-string', () => {
  assert.throws(() => parseSidecar(null, 1), TypeError);
  assert.throws(() => parseSidecar(123, 1), TypeError);
});

test('parseSidecar: throws on invalid JSON', () => {
  assert.throws(() => parseSidecar('{not json', 3), SyntaxError);
});

test('parseSidecar: throws on wrong shape', () => {
  assert.throws(() => parseSidecar('{"foo":1}', 3), TypeError);
  assert.throws(() => parseSidecar('"a string"', 3), TypeError);
});

test('parseSidecar: bare array form', () => {
  const notes = parseSidecar('["one","two"]', 2);
  assert.deepEqual(notes, ['one', 'two']);
});

test('parseSidecar: object form with .slides', () => {
  const notes = parseSidecar('{"deck":"d","slides":["a","b","c"]}', 3);
  assert.deepEqual(notes, ['a', 'b', 'c']);
});

test('parseSidecar: pads short array with empty strings', () => {
  const notes = parseSidecar('["only-one"]', 4);
  assert.deepEqual(notes, ['only-one', '', '', '']);
});

test('parseSidecar: truncates longer array to total', () => {
  const notes = parseSidecar('["a","b","c","d"]', 2);
  assert.deepEqual(notes, ['a', 'b']);
});

test('parseSidecar: coerces non-string entries to strings', () => {
  const notes = parseSidecar('[1, true, null]', 3);
  assert.deepEqual(notes, ['1', 'true', '']);
});

test('parseSidecar: handles total = 0', () => {
  const notes = parseSidecar('["a","b"]', 0);
  assert.deepEqual(notes, []);
});

// ── emptySidecar ──────────────────────────────────────────────────────
test('emptySidecar: produces valid JSON with N empty slides', () => {
  const txt = emptySidecar(3, 'demo');
  const parsed = JSON.parse(txt);
  assert.equal(parsed.deck, 'demo');
  assert.equal(parsed.slides.length, 3);
  for (const s of parsed.slides) assert.equal(s, '');
});

test('emptySidecar: defaults deck name to empty string', () => {
  const parsed = JSON.parse(emptySidecar(2));
  assert.equal(parsed.deck, '');
});

// ── computeStageScale ────────────────────────────────────────────────
test('computeStageScale: 1280x720 viewport against 1920x1080 → 720/1080', () => {
  // 1280/1920 = 0.6667, 720/1080 = 0.6667 → equal → 0.6667.
  const s = computeStageScale(1280, 720);
  assert.ok(Math.abs(s - 720 / 1080) < 1e-9);
});

test('computeStageScale: tall narrow viewport → width bound', () => {
  // viewport 600x1080: 600/1920 = 0.3125, 1080/1080 = 1 → 0.3125.
  const s = computeStageScale(600, 1080);
  assert.ok(Math.abs(s - 600 / 1920) < 1e-9);
});

test('computeStageScale: short wide viewport → height bound', () => {
  // viewport 3840x400: 3840/1920 = 2, 400/1080 ≈ 0.37 → 0.37.
  const s = computeStageScale(3840, 400);
  assert.ok(Math.abs(s - 400 / 1080) < 1e-9);
});

test('computeStageScale: returns 1 for non-positive inputs', () => {
  assert.equal(computeStageScale(0, 720), 1);
  assert.equal(computeStageScale(1280, 0), 1);
  assert.equal(computeStageScale(-1, -1), 1);
});

test('computeStageScale: honors custom canvas dimensions', () => {
  const s = computeStageScale(800, 600, 1600, 1200);
  // 800/1600 = 0.5, 600/1200 = 0.5 → 0.5.
  assert.ok(Math.abs(s - 0.5) < 1e-9);
});

// ── createBus ────────────────────────────────────────────────────────
test('createBus: returns an object with send/onMessage/close', () => {
  const bus = createBus('test-channel-' + Date.now());
  assert.equal(typeof bus.send, 'function');
  assert.equal(typeof bus.onMessage, 'function');
  assert.equal(typeof bus.close, 'function');
  bus.close();
});

test('createBus: in Node fallback, send is a safe no-op', () => {
  const bus = createBus('test-fallback-' + Date.now());
  assert.doesNotThrow(() => bus.send({ hello: 'there' }));
  bus.close();
});

// ── v0.1.1 shape registry ──────────────────────────────────────────────
test('SHAPE_DIMENSIONS: contains the four canonical shapes', () => {
  assert.deepEqual(SHAPE_DIMENSIONS['landscape-16-9'], [1920, 1080]);
  assert.deepEqual(SHAPE_DIMENSIONS['portrait-3-4'],   [1440, 1920]);
  assert.deepEqual(SHAPE_DIMENSIONS['square-1-1'],     [1440, 1440]);
  assert.deepEqual(SHAPE_DIMENSIONS['ultrawide-21-9'], [2520, 1080]);
});

test('extractShape: reads `shape-X` class on <html>', () => {
  assert.equal(extractShape('<html lang="es" class="look-monastic shape-portrait-3-4">'), 'portrait-3-4');
  assert.equal(extractShape('<html lang="es" class="shape-square-1-1 look-monastic">'), 'square-1-1');
  assert.equal(extractShape('<html class="shape-ultrawide-21-9">'), 'ultrawide-21-9');
});

test('extractShape: defaults to landscape-16-9 when absent', () => {
  assert.equal(extractShape('<html lang="es">'), 'landscape-16-9');
  assert.equal(extractShape('<html class="look-monastic">'), 'landscape-16-9');
  assert.equal(extractShape(''), 'landscape-16-9');
  assert.equal(extractShape(undefined), 'landscape-16-9');
});

test('shapeDimensions: returns [width, height] for valid shape names', () => {
  assert.deepEqual(shapeDimensions('landscape-16-9'), [1920, 1080]);
  assert.deepEqual(shapeDimensions('portrait-3-4'),   [1440, 1920]);
  assert.deepEqual(shapeDimensions('square-1-1'),     [1440, 1440]);
  assert.deepEqual(shapeDimensions('ultrawide-21-9'), [2520, 1080]);
});

test('shapeDimensions: defaults to landscape-16-9 for unknown names', () => {
  assert.deepEqual(shapeDimensions('unknown-shape'), [1920, 1080]);
  assert.deepEqual(shapeDimensions(''),                [1920, 1080]);
});