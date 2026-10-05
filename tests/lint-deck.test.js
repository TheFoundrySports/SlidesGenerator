// tests/lint-deck.test.js
// Run with: node --test tests/lint-deck.test.js
// Tests scripts/lint-deck.js against green-path and red-flag fixtures.

'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const { lintHtml } = require('../scripts/lint-deck');

const FX = path.join(__dirname, 'fixtures');

// ── Green fixture ────────────────────────────────────────────────────
test('clean deck: produces zero issues', () => {
  const html = fs.readFileSync(path.join(FX, 'deck-clean.html'), 'utf8');
  const result = lintHtml('clean.html', html);
  assert.equal(result.slideCount, 1);
  assert.deepEqual(result.issues, [], 'clean deck should have zero issues');
});

// ── Red fixture — every P0/P1 should fire ────────────────────────────
test('bad deck: flags every P0 violation', () => {
  const html = fs.readFileSync(path.join(FX, 'deck-bad.html'), 'utf8');
  const result = lintHtml('bad.html', html);
  const byRule = Object.fromEntries(result.issues.map((i) => [i.rule, i]));

  // P0 issues that must be flagged
  assert.ok(byRule['shape-dimensions'],     'shape-dimensions P0 should fire (1280x720 vs landscape-16-9 default)');
  assert.equal(byRule['shape-dimensions'].severity, 'P0');

  assert.ok(byRule['sans-serif-display'],    'sans-serif display P0 should fire (Inter)');
  assert.equal(byRule['sans-serif-display'].severity, 'P0');

  assert.ok(byRule['motif-budget'],         'motif-budget P0 should fire (3 SVG)');
  assert.equal(byRule['motif-budget'].severity, 'P0');

  assert.ok(byRule['emoji'],                'emoji P0 should fire (🚀)');
  assert.equal(byRule['emoji'].severity, 'P0');

  assert.ok(byRule['palette-tokens'],       'palette-tokens P0 should fire (#ff00ff)');
  assert.equal(byRule['palette-tokens'].severity, 'P0');

  // P1 issues
  assert.ok(byRule['counter'],              'counter P1 should fire (no .counter)');
  assert.ok(byRule['screen-label'],         'screen-label P1 should fire (1 of 2 missing)');
  assert.ok(byRule['script-tags'],          'script-tags P1 should fire (2 scripts)');
  assert.ok(byRule['image-lazy'],           'image-lazy P1 should fire');
  assert.ok(byRule['image-decode'],         'image-decode P1 should fire');

  // P2 issue
  assert.ok(byRule['animation-duration'],   'animation-duration P2 should fire (800ms)');
  assert.equal(byRule['animation-duration'].severity, 'P2');
});

// ── Canonical rules ─────────────────────────────────────────────────
test('shape-dimensions: stage matches declared shape; mismatch fires P0', () => {
  const ok1920 = `<style>.stage{width:1920px;height:1080px}</style><html class="look-monastic shape-landscape-16-9"><div class="stage"><section class="slide" data-screen-label="x"></section></div></html><div class="counter"></div>`;
  const okPortrait = `<style>.stage{width:1440px;height:1920px}</style><html class="look-monastic shape-portrait-3-4"><div class="stage"><section class="slide" data-screen-label="x"></section></div></html><div class="counter"></div>`;
  const bad = `<style>.stage{width:1024px;height:768px}</style><html class="look-monastic shape-landscape-16-9"><div class="stage"><section class="slide" data-screen-label="x"></section></div></html><div class="counter"></div>`;
  assert.equal(lintHtml('ok.html', ok1920).issues.filter((i) => i.rule === 'shape-dimensions').length, 0);
  assert.equal(lintHtml('ok.html', okPortrait).issues.filter((i) => i.rule === 'shape-dimensions').length, 0);
  const badResult = lintHtml('bad.html', bad);
  assert.ok(badResult.issues.some((i) => i.rule === 'shape-dimensions'));
});

test('counter: presence is checked', () => {
  const noCounter = `<style>.stage { width: 1920px; height: 1080px; }</style><div class="stage"><section class="slide" data-screen-label="x"></section></div>`;
  const result = lintHtml('noc.html', noCounter);
  assert.ok(result.issues.some((i) => i.rule === 'counter'));
});

test('palette-tokens: only the seven hexes are permitted', () => {
  const tpl = (hex) => `<style>:root{--bg:#F5EBD9;--surface:#EFE3CC;--fg:#5C1A1B;--muted:#8A7560;--border:#B5A285;--accent:#73201D;--gold:#A8915C;color:${hex};}.stage{width:1920px;height:1080px}</style><div class="stage"><section class="slide" data-screen-label="x"></section></div><div class="counter"></div>`;
  assert.equal(lintHtml('ok.html', tpl('var(--fg)')).issues.filter((i) => i.rule === 'palette-tokens').length, 0);
  assert.equal(lintHtml('bad.html', tpl('#abcdef')).issues.filter((i) => i.rule === 'palette-tokens').length, 1);
});

test('motif-budget: ≤2 SVG per slide', () => {
  const ok = `<style>.stage{width:1920px;height:1080px}</style><div class="stage"><section class="slide" data-screen-label="x"><svg/><svg/></section></div><div class="counter"></div>`;
  const bad = `<style>.stage{width:1920px;height:1080px}</style><div class="stage"><section class="slide" data-screen-label="x"><svg/><svg/><svg/></section></div><div class="counter"></div>`;
  assert.equal(lintHtml('ok.html', ok).issues.filter((i) => i.rule === 'motif-budget').length, 0);
  assert.equal(lintHtml('bad.html', bad).issues.filter((i) => i.rule === 'motif-budget').length, 1);
});

test('emoji: only ✝ is allowed', () => {
  const withCross = `<style>.stage{width:1920px;height:1080px}</style><div class="stage"><section class="slide" data-screen-label="x">✝</section></div><div class="counter"></div>`;
  const withRocket = `<style>.stage{width:1920px;height:1080px}</style><div class="stage"><section class="slide" data-screen-label="x">🚀</section></div><div class="counter"></div>`;
  assert.equal(lintHtml('ok.html', withCross).issues.filter((i) => i.rule === 'emoji').length, 0);
  assert.equal(lintHtml('bad.html', withRocket).issues.filter((i) => i.rule === 'emoji').length, 1);
});

test('sans-serif-display: only as a fallback is OK; as primary is not', () => {
  const fallbackOk = `<style>.slide h1{font-family:var(--font-display),Inter,sans-serif;}.stage{width:1920px;height:1080px}</style><div class="stage"><section class="slide" data-screen-label="x"><h1>x</h1></section></div><div class="counter"></div>`;
  const primaryBad = `<style>.slide h1{font-family:Inter,sans-serif;}.stage{width:1920px;height:1080px}</style><div class="stage"><section class="slide" data-screen-label="x"><h1>x</h1></section></div><div class="counter"></div>`;
  assert.equal(lintHtml('ok.html', fallbackOk).issues.filter((i) => i.rule === 'sans-serif-display').length, 0);
  assert.equal(lintHtml('bad.html', primaryBad).issues.filter((i) => i.rule === 'sans-serif-display').length, 1);
});

test('animation-duration: 350ms is canonical; anything else is P2', () => {
  const canonical = `<style>.slide{transition:opacity 350ms cubic-bezier(.2,.7,.3,1)}.stage{width:1920px;height:1080px}</style><div class="stage"><section class="slide" data-screen-label="x"></section></div><div class="counter"></div>`;
  const other = `<style>.slide{transition:opacity 800ms ease}.stage{width:1920px;height:1080px}</style><div class="stage"><section class="slide" data-screen-label="x"></section></div><div class="counter"></div>`;
  assert.equal(lintHtml('ok.html', canonical).issues.filter((i) => i.rule === 'animation-duration').length, 0);
  const badResult = lintHtml('bad.html', other);
  const anim = badResult.issues.find((i) => i.rule === 'animation-duration');
  assert.ok(anim);
  assert.equal(anim.severity, 'P2');
});

test('screen-label: missing on any slide fires once per missing', () => {
  const html = `<style>.stage{width:1920px;height:1080px}</style><div class="stage"><section class="slide" data-screen-label="a"></section><section class="slide"></section><section class="slide"></section></div><div class="counter"></div>`;
  const result = lintHtml('x.html', html);
  const issues = result.issues.filter((i) => i.rule === 'screen-label');
  assert.equal(issues.length, 2);
});

test('script-tags: more than one script fires', () => {
  const html = `<style>.stage{width:1920px;height:1080px}</style><div class="stage"><section class="slide" data-screen-label="x"></section></div><div class="counter"></div><script>1</script><script>2</script>`;
  const result = lintHtml('x.html', html);
  assert.ok(result.issues.some((i) => i.rule === 'script-tags'));
});

test('script-shape: one script without is-active toggle fires', () => {
  const html = `<style>.stage{width:1920px;height:1080px}</style><div class="stage"><section class="slide" data-screen-label="x"></section></div><div class="counter"></div><script>console.log('hi')</script>`;
  const result = lintHtml('x.html', html);
  assert.ok(result.issues.some((i) => i.rule === 'script-shape'));
});

test('image: lazy + decode required', () => {
  const ok = `<style>.stage{width:1920px;height:1080px}</style><div class="stage"><section class="slide" data-screen-label="x"><img src="x.png" alt="x" loading="lazy" decoding="async"></section></div><div class="counter"></div>`;
  const bad = `<style>.stage{width:1920px;height:1080px}</style><div class="stage"><section class="slide" data-screen-label="x"><img src="x.png" alt="x"></section></div><div class="counter"></div>`;
  assert.equal(lintHtml('ok.html', ok).issues.filter((i) => i.rule.startsWith('image-')).length, 0);
  const r = lintHtml('bad.html', bad);
  assert.ok(r.issues.some((i) => i.rule === 'image-lazy'));
  assert.ok(r.issues.some((i) => i.rule === 'image-decode'));
});

// ── v0.1.1 rules: look + shape axes ─────────────────────────────────
test('look-valid: invalid look name fires P1', () => {
  const bad = `<style>.stage{width:1920px;height:1080px}</style><html class="look-neon shape-landscape-16-9"><div class="stage"><section class="slide" data-screen-label="x"></section></div></html><div class="counter"></div>`;
  const result = lintHtml('bad.html', bad);
  const issue = result.issues.find((i) => i.rule === 'look-valid');
  assert.ok(issue);
  assert.equal(issue.severity, 'P1');
});

test('shape-valid: invalid shape name fires P1', () => {
  const bad = `<style>.stage{width:1920px;height:1080px}</style><html class="look-monastic shape-widescreen"><div class="stage"><section class="slide" data-screen-label="x"></section></div></html><div class="counter"></div>`;
  const result = lintHtml('bad.html', bad);
  const issue = result.issues.find((i) => i.rule === 'shape-valid');
  assert.ok(issue);
  assert.equal(issue.severity, 'P1');
});

test('look + shape: missing defaults to monastic + landscape-16-9', () => {
  const html = `<style>.stage{width:1920px;height:1080px}</style><div class="stage"><section class="slide" data-screen-label="x"></section></div><div class="counter"></div>`;
  const result = lintHtml('x.html', html);
  assert.equal(result.issues.filter((i) => i.rule === 'look-valid' || i.rule === 'shape-valid' || i.rule === 'shape-dimensions').length, 0);
});

test('combination: invalid (archetype × look) fires P1', () => {
  // Summary + festive is not in the matrix.
  const bad = `<style>.stage{width:1920px;height:1080px}</style><html class="look-festive shape-landscape-16-9"><div class="stage"><section class="slide slide--summary" data-screen-label="x"></section></div></html><div class="counter"></div>`;
  const result = lintHtml('bad.html', bad);
  const issue = result.issues.find((i) => i.rule === 'combination');
  assert.ok(issue);
  assert.equal(issue.severity, 'P1');
  assert.match(issue.message, /summary.*festive/);
});

test('combination: valid pair passes', () => {
  const ok = `<style>.stage{width:1920px;height:1080px}</style><html class="look-festive shape-landscape-16-9"><div class="stage"><section class="slide slide--cover" data-screen-label="x"></section></div></html><div class="counter"></div>`;
  const result = lintHtml('ok.html', ok);
  assert.equal(result.issues.filter((i) => i.rule === 'combination').length, 0);
});

test('look-budget: festive max 2 per deck', () => {
  const ok = `<style>.stage{width:1920px;height:1080px}</style><html class="look-monastic shape-landscape-16-9"><div class="stage"><section class="slide slide--cover" data-screen-label="a"></section><section class="slide slide--prayer" data-screen-label="b"></section></div></html><div class="counter"></div>`;
  // 2 festive slides, budget = 2: OK (per-slide override).
  const ok2 = `<style>.stage{width:1920px;height:1080px}</style><html class="look-monastic shape-landscape-16-9"><div class="stage"><section class="slide slide--cover look-festive" data-screen-label="a"></section><section class="slide slide--prayer look-festive" data-screen-label="b"></section></div></html><div class="counter"></div>`;
  const bad = `<style>.stage{width:1920px;height:1080px}</style><html class="look-monastic shape-landscape-16-9"><div class="stage"><section class="slide slide--cover look-festive" data-screen-label="a"></section><section class="slide slide--prayer look-festive" data-screen-label="b"></section><section class="slide slide--closing look-festive" data-screen-label="c"></section></div></html><div class="counter"></div>`;
  assert.equal(lintHtml('ok.html', ok).issues.filter((i) => i.rule === 'look-budget').length, 0);
  assert.equal(lintHtml('ok.html', ok2).issues.filter((i) => i.rule === 'look-budget').length, 0);
  const r = lintHtml('bad.html', bad);
  assert.ok(r.issues.some((i) => i.rule === 'look-budget'));
});

test('look-budget: typographic max 1 per deck', () => {
  const bad = `<style>.stage{width:1920px;height:1080px}</style><html class="look-monastic shape-landscape-16-9"><div class="stage"><section class="slide slide--scripture look-typographic" data-screen-label="a"></section><section class="slide slide--reflection look-typographic" data-screen-label="b"></section></div></html><div class="counter"></div>`;
  const r = lintHtml('bad.html', bad);
  assert.ok(r.issues.some((i) => i.rule === 'look-budget'));
});

test('per-slide look override: deck default applies when slide has no class', () => {
  // Deck default monastic, all slides count as monastic. Festive slides override.
  const html = `<style>.stage{width:1920px;height:1080px}</style><html class="look-monastic shape-landscape-16-9"><div class="stage"><section class="slide slide--cover" data-screen-label="a"></section><section class="slide slide--prayer" data-screen-label="b"></section><section class="slide slide--closing look-festive" data-screen-label="c"></section></div></html><div class="counter"></div>`;
  const result = lintHtml('x.html', html);
  // No budget issue (1 festive ≤ 2). No combination issue.
  assert.equal(result.issues.filter((i) => i.rule === 'look-budget' || i.rule === 'combination').length, 0);
});