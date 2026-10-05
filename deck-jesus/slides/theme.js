// Catechism Liturgical Theme (single-ink Ordinary Time palette)
// Token mapping per DESIGN.md, expressed in 6-char hex (no '#')
// for PptxGenJS compatibility.

const theme = {
  // Catechism liturgical palette (Ordinary Time)
  bg:        'F5EBD9',   // parchment
  surface:    'EFE3CC',   // callout well
  fg:        '5C1A1B',   // oxblood ink (every text element)
  muted:     '8A7560',   // captions, counter, refs
  border:    'B5A285',   // hairline rules
  accent:    '73201D',   // reserved single-accent
  gold:      'A8915C',   // ornament strokes only

  // Type stacks (every slide picks from these)
  fontDisplay: 'Cormorant Garamond',
  fontBody:    'EB Garamond',
  fontMono:    'JetBrains Mono',
};

// Canvas: LAYOUT_16x9 = 10" x 5.625" (PowerPoint inches)
// DESIGN.md safe-area: 5% inset = 96px / 192 = 0.5"  on every edge.
const SAFE = 0.50;

// Background field: parchment with subtle vignette approximation.
// PptxGenJS does not support gradients natively, so we layer
// a warm-cream rect plus a subtle inner border for the parchment feel.
function paintBackground(slide) {
  slide.background = { color: theme.bg };
  // Inner thin frame at 0.4" inset, 0.5 pt hairline
  slide.addShape('rect', {
    x: 0.18, y: 0.18, w: 9.64, h: 5.265,
    fill: { type: 'none' },
    line: { color: theme.border, width: 0.5, transparency: 30 },
  });
}

// Page counter, bottom-right (mandatory on every non-cover slide).
function pageNumber(slide, idx, total) {
  const txt = String(idx).padStart(2, '0') + ' / ' + String(total).padStart(2, '0');
  slide.addText(txt, {
    x: 8.40, y: 5.10, w: 1.40, h: 0.30,
    fontFace: theme.fontMono,
    fontSize: 9,
    color: theme.muted,
    align: 'right',
    valign: 'middle',
    charSpacing: 1,
    margin: 0,
  });
}

// Hairline horizontal separator (doctrine / summary slides).
function rule(slide, y, opts = {}) {
  const w = opts.w || 2.50;
  const x = opts.x || (5.0 - w / 2);
  slide.addShape('line', {
    x, y, w, h: 0,
    line: { color: theme.border, width: 0.75 },
  });
}

// Section marker (mono small caps, used on separators and headers).
function sectionTag(slide, text, y) {
  slide.addText(text, {
    x: 0.50, y: y || 4.85, w: 9.0, h: 0.30,
    fontFace: theme.fontMono,
    fontSize: 9,
    color: theme.muted,
    align: 'center',
    valign: 'middle',
    charSpacing: 4,
    margin: 0,
  });
}

// Tiny ornament helper: monogram cross / ichthys / alpha-omega as PptxGenJS shapes.
// 1x1" art around a center point (cx, cy).
function monogramCross(slide, cx, cy, size, color) {
  const s = size || 0.7;
  const c = color || theme.gold;
  // Vertical arm
  slide.addShape('line', {
    x: cx - 0.005, y: cy - s / 2,
    w: 0.01, h: s,
    line: { color: c, width: 1.2 },
  });
  // Horizontal arm
  slide.addShape('line', {
    x: cx - s / 2.6, y: cy - 0.005,
    w: s / 1.3, h: 0.01,
    line: { color: c, width: 1.2 },
  });
}

function alphaOmega(slide, cx, cy, size, color) {
  const c = color || theme.gold;
  slide.addText('A', {
    x: cx - size, y: cy - size / 2, w: size, h: size,
    fontFace: theme.fontDisplay, italic: true,
    fontSize: size * 24, color: c, align: 'center', valign: 'middle', margin: 0,
  });
  slide.addText('Ω', {
    x: cx, y: cy - size / 2, w: size, h: size,
    fontFace: theme.fontDisplay, italic: true,
    fontSize: size * 24, color: c, align: 'center', valign: 'middle', margin: 0,
  });
}

function ichthys(slide, cx, cy, size, color) {
  const c = color || theme.gold;
  const s = size || 0.9;
  // Body (oval)
  slide.addShape('oval', {
    x: cx - s / 2, y: cy - s / 4,
    w: s, h: s / 2,
    fill: { type: 'none' },
    line: { color: c, width: 1.1 },
  });
  // Tail triangle
  slide.addShape('rtTriangle', {
    x: cx + s / 2 - 0.05, y: cy - s / 4,
    w: 0.18, h: s / 2,
    fill: { type: 'none' },
    line: { color: c, width: 1.1 },
  });
}

function trinityKnot(slide, cx, cy, size, color) {
  const c = color || theme.gold;
  const s = size || 0.9;
  const r = s / 4;
  // Three interlocking circles (geometry)
  const offsets = [
    { x: cx - r * 0.9, y: cy - r * 0.6 },
    { x: cx + r * 0.9, y: cy - r * 0.6 },
    { x: cx,            y: cy + r * 0.7 },
  ];
  offsets.forEach(o => {
    slide.addShape('oval', {
      x: o.x - r, y: o.y - r, w: r * 2, h: r * 2,
      fill: { type: 'none' },
      line: { color: c, width: 1.1 },
    });
  });
}

// Ornament container on cover, separators, closing, reflection.
// Use a single SVG path expressed as a small geometric mark.
function ornament(slide, cx, cy, opts = {}) {
  const kind = opts.kind || 'cross';
  const size = opts.size || 0.9;
  const color = opts.color || theme.gold;
  if (kind === 'cross')        monogramCross(slide, cx, cy, size, color);
  else if (kind === 'ichthys') ichthys(slide, cx, cy, size, color);
  else if (kind === 'alpha')   alphaOmega(slide, cx, cy, size, color);
  else if (kind === 'trinity') trinityKnot(slide, cx, cy, size, color);
}

module.exports = {
  theme,
  SAFE,
  paintBackground,
  pageNumber,
  rule,
  sectionTag,
  ornament,
};