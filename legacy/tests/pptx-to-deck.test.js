// tests/pptx-to-deck.test.js
// Run with: `node --test tests/pptx-to-deck.test.js`
// Pure-helper tests for scripts/pptx-to-deck.js.

'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');

const {
  emuToPx,
  parseShape,
  parseSlideXml,
  parseRelsXml,
  parseSlideSize,
  heuristicArchetype,
  summarizeSlide,
  parseMapArg
} = require('../scripts/pptx-to-deck');

// ── emuToPx ───────────────────────────────────────────────────────────
test('emuToPx: 914400 EMU (1 inch) at 96 DPI = 96 px', () => {
  assert.equal(emuToPx(914400), 96);
});
test('emuToPx: 0 = 0', () => {
  assert.equal(emuToPx(0), 0);
});
test('emuToPx: rounds half-pixel', () => {
  // 9525 / 2 = 4762.5 → 4763
  assert.equal(emuToPx(9525), 1);
  assert.equal(emuToPx(4762), 0);
  assert.equal(emuToPx(4763), 1);
});

// ── parseShape: text shape ─────────────────────────────────────────────
test('parseShape: text shape with position + text', () => {
  const xml = `
    <p:sp>
      <p:spPr>
        <a:xfrm>
          <a:off x="0" y="0"/>
          <a:ext cx="914400" cy="914400"/>
        </a:xfrm>
      </p:spPr>
      <p:txBody>
        <a:p>
          <a:r>
            <a:rPr sz="4400" b="1"/>
            <a:t>Title</a:t>
          </a:r>
        </a:p>
      </p:txBody>
    </p:sp>`;
  const s = parseShape(xml);
  assert.ok(s);
  assert.equal(s.kind, 'text');
  assert.equal(s.x, 0);
  assert.equal(s.y, 0);
  assert.equal(s.w, 96);
  assert.equal(s.h, 96);
  assert.equal(s.text, 'Title');
  assert.equal(s.maxSize, 44);
  assert.equal(s.anyBold, true);
  assert.equal(s.anyItalic, false);
});

test('parseShape: text shape with multiple runs', () => {
  const xml = `
    <p:sp>
      <p:spPr>
        <a:xfrm>
          <a:off x="914400" y="914400"/>
          <a:ext cx="1828800" cy="914400"/>
        </a:xfrm>
      </p:spPr>
      <p:txBody>
        <a:p>
          <a:r><a:rPr sz="2200"/><a:t>Hello </a:t></a:r>
          <a:r><a:rPr sz="2200" i="1"/><a:t>world</a:t></a:r>
        </a:p>
      </p:txBody>
    </p:sp>`;
  const s = parseShape(xml);
  assert.equal(s.text, 'Hello world');
  assert.equal(s.runs.length, 2);
  assert.equal(s.runs[0].text, 'Hello ');
  assert.equal(s.runs[1].text, 'world');
  assert.equal(s.runs[1].italic, true);
});

test('parseShape: decodes XML entities in text', () => {
  const xml = `<p:sp><p:spPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="100" cy="100"/></a:xfrm></p:spPr><p:txBody><a:p><a:r><a:t>A &amp; B &lt;C&gt;</a:t></a:r></a:p></p:txBody></p:sp>`;
  const s = parseShape(xml);
  assert.equal(s.text, 'A & B <C>');
});

test('parseShape: image shape with rId', () => {
  const xml = `
    <p:pic>
      <p:spPr>
        <a:xfrm>
          <a:off x="0" y="0"/>
          <a:ext cx="914400" cy="685800"/>
        </a:xfrm>
      </p:spPr>
      <p:blipFill>
        <a:blip r:embed="rId1"/>
      </p:blipFill>
    </p:pic>`;
  const s = parseShape(xml);
  assert.ok(s);
  assert.equal(s.kind, 'image');
  assert.equal(s.rId, 'rId1');
});

test('parseShape: returns null when no xfrm', () => {
  const xml = '<p:sp><p:txBody></p:txBody></p:sp>';
  assert.equal(parseShape(xml), null);
});

// ── parseSlideXml ──────────────────────────────────────────────────────
test('parseSlideXml: extracts multiple shapes in order', () => {
  const xml = `
    <p:sld>
      <p:cSld><p:spTree>
        <p:sp>
          <p:spPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="100" cy="100"/></a:xfrm></p:spPr>
          <p:txBody><a:p><a:r><a:t>Title</a:t></a:r></a:p></p:txBody>
        </p:sp>
        <p:pic>
          <p:spPr><a:xfrm><a:off x="200" y="200"/><a:ext cx="100" cy="100"/></a:xfrm></p:spPr>
          <p:blipFill><a:blip r:embed="rId2"/></p:blipFill>
        </p:pic>
        <p:sp>
          <p:spPr><a:xfrm><a:off x="0" y="200"/><a:ext cx="100" cy="100"/></a:xfrm></p:spPr>
          <p:txBody><a:p><a:r><a:t>Body</a:t></a:r></a:p></p:txBody>
        </p:sp>
      </p:spTree></p:cSld>
    </p:sld>`;
  const shapes = parseSlideXml(xml);
  assert.equal(shapes.length, 3);
  assert.equal(shapes[0].kind, 'text');
  assert.equal(shapes[1].kind, 'image');
  assert.equal(shapes[2].kind, 'text');
  assert.equal(shapes[1].rId, 'rId2');
});

// ── parseRelsXml ───────────────────────────────────────────────────────
test('parseRelsXml: extracts rId → target map', () => {
  const xml = `
    <Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
      <Relationship Id="rId1" Type="...image" Target="../media/image1.png"/>
      <Relationship Id="rId2" Type="...image" Target="../media/image2.jpg"/>
      <Relationship Id="rId3" Type="...slideLayout" Target="../slideLayouts/slideLayout1.xml"/>
    </Relationships>`;
  const rels = parseRelsXml(xml);
  assert.equal(rels.rId1, '../media/image1.png');
  assert.equal(rels.rId2, '../media/image2.jpg');
  assert.equal(rels.rId3, '../slideLayouts/slideLayout1.xml');
});

// ── parseSlideSize ─────────────────────────────────────────────────────
test('parseSlideSize: extracts cx, cy in EMU', () => {
  const xml = '<p:presentation><p:sldSz cx="9144000" cy="6858000" type="screen4x3"/></p:presentation>';
  const size = parseSlideSize(xml);
  assert.equal(size.w, 9144000);
  assert.equal(size.h, 6858000);
});
test('parseSlideSize: defaults to 10x7.5 inches when missing', () => {
  const size = parseSlideSize('<p:presentation></p:presentation>');
  assert.equal(size.w, 9144000);
  assert.equal(size.h, 6858000);
});

// ── heuristicArchetype ────────────────────────────────────────────────
test('heuristicArchetype: first slide is cover', () => {
  assert.equal(heuristicArchetype({ index: 1, total: 5, shapes: [] }), 'cover');
});
test('heuristicArchetype: last slide is closing', () => {
  assert.equal(heuristicArchetype({ index: 5, total: 5, shapes: [] }), 'closing');
});
test('heuristicArchetype: mostly image + little text is cover', () => {
  const slide = {
    index: 2, total: 5,
    shapes: [
      { kind: 'image', text: '' },
      { kind: 'text', text: 'caption', maxSize: 14 }
    ]
  };
  assert.equal(heuristicArchetype(slide), 'cover');
});
test('heuristicArchetype: single short text is reflection', () => {
  const slide = {
    index: 2, total: 5,
    shapes: [
      { kind: 'text', text: 'Before light was light, You already were.', maxSize: 36 }
    ]
  };
  assert.equal(heuristicArchetype(slide), 'reflection');
});
test('heuristicArchetype: 3+ text shapes is doctrine', () => {
  const slide = {
    index: 2, total: 5,
    shapes: [
      { kind: 'text', text: 'Point one', maxSize: 28 },
      { kind: 'text', text: 'Point two', maxSize: 28 },
      { kind: 'text', text: 'Point three', maxSize: 28 }
    ]
  };
  assert.equal(heuristicArchetype(slide), 'doctrine');
});
test('heuristicArchetype: long text is prayer', () => {
  const longText = 'a'.repeat(250) + '. Amén.';
  const slide = {
    index: 2, total: 5,
    shapes: [{ kind: 'text', text: longText, maxSize: 28 }]
  };
  assert.equal(heuristicArchetype(slide), 'prayer');
});
test('heuristicArchetype: default is prayer when no condition matches', () => {
  // 2 text shapes, each short, no image, not first/last, not 1 shape,
  // not >= 3 shapes, not > 200 chars → falls through to default 'prayer'.
  const slide = {
    index: 2, total: 5,
    shapes: [
      { kind: 'text', text: 'First block', maxSize: 28 },
      { kind: 'text', text: 'Second block', maxSize: 28 }
    ]
  };
  assert.equal(heuristicArchetype(slide), 'prayer');
});

// ── summarizeSlide ────────────────────────────────────────────────────
test('summarizeSlide: counts and top texts', () => {
  const slide = {
    index: 3, total: 10,
    shapes: [
      { kind: 'text', text: 'Title', maxSize: 44 },
      { kind: 'text', text: 'Body text here.', maxSize: 22 },
      { kind: 'image', text: '' }
    ]
  };
  const s = summarizeSlide(slide);
  assert.equal(s.index, 3);
  assert.equal(s.total, 10);
  assert.equal(s.textShapeCount, 2);
  assert.equal(s.imageCount, 1);
  assert.equal(s.totalChars, 20);
  assert.equal(s.topTexts[0], 'Title');
});

// ── parseMapArg ────────────────────────────────────────────────────────
test('parseMapArg: parses "1:cover,2:scripture" into {1,cover}, {2,scripture}', () => {
  const m = parseMapArg('1:cover,2:scripture,3:doctrine');
  assert.deepEqual(m, { 1: 'cover', 2: 'scripture', 3: 'doctrine' });
});
test('parseMapArg: ignores invalid entries', () => {
  const m = parseMapArg('1:cover,99:invalid,x:doctrine');
  assert.deepEqual(m, { 1: 'cover' });
});
test('parseMapArg: empty string returns empty map', () => {
  assert.deepEqual(parseMapArg(''), {});
  assert.deepEqual(parseMapArg(undefined), {});
});