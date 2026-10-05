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

// ---------------------------------------------------------------------------
// Concept glyphs — small line-only geometric illustrations.
// One glyph per slide (max 2 motifs total per design rule).
// All shapes draw at center (cx, cy) with bounding size s.
// ---------------------------------------------------------------------------

// Glyph factory: small contextual icon for each concept.
function glyph(slide, kind, cx, cy, size, color) {
  const c = color || theme.gold;
  const s = size || 0.7;
  const line = { color: c, width: 1.4 };

  switch (kind) {
    // Descending dove — Espíritu Santo / Buena Nueva
    case 'dove': {
      // Body
      slide.addShape('oval', {
        x: cx - s * 0.45, y: cy - s * 0.05, w: s * 0.9, h: s * 0.5,
        fill: { type: 'none' }, line,
      });
      // Wings
      slide.addShape('line', {
        x: cx - s * 0.55, y: cy + s * 0.10, w: s * 0.40, h: -s * 0.20,
        line,
      });
      slide.addShape('line', {
        x: cx + s * 0.15, y: cy + s * 0.10, w: s * 0.40, h: -s * 0.20,
        line,
      });
      // Head/beak
      slide.addShape('line', {
        x: cx + s * 0.45, y: cy, w: s * 0.15, h: s * 0.05,
        line,
      });
      break;
    }

    // Name tablet — for «Jesús» / inscription
    case 'tablet': {
      const w = s * 1.4, h = s * 0.7;
      slide.addShape('rect', {
        x: cx - w / 2, y: cy - h / 2, w, h,
        fill: { type: 'none' }, line,
      });
      // Inscription lines
      slide.addShape('line', {
        x: cx - w * 0.30, y: cy - h * 0.10, w: w * 0.60, h: 0,
        line: { color: c, width: 0.7 },
      });
      slide.addShape('line', {
        x: cx - w * 0.30, y: cy + h * 0.10, w: w * 0.60, h: 0,
        line: { color: c, width: 0.7 },
      });
      break;
    }

    // Chalice — for «Cristo» (anointed priest) / Eucharist
    case 'chalice': {
      // Cup
      slide.addShape('line', {
        x: cx - s * 0.40, y: cy - s * 0.30, w: s * 0.80, h: 0,
        line,
      });
      slide.addShape('line', {
        x: cx - s * 0.40, y: cy - s * 0.30, w: s * 0.10, h: s * 0.45,
        line,
      });
      slide.addShape('line', {
        x: cx + s * 0.30, y: cy - s * 0.30, w: s * 0.10, h: s * 0.45,
        line,
      });
      slide.addShape('line', {
        x: cx - s * 0.50, y: cy + s * 0.15, w: s * 1.00, h: 0,
        line,
      });
      // Stem
      slide.addShape('line', {
        x: cx, y: cy + s * 0.15, w: 0, h: s * 0.20,
        line,
      });
      // Base
      slide.addShape('line', {
        x: cx - s * 0.30, y: cy + s * 0.35, w: s * 0.60, h: 0,
        line,
      });
      break;
    }

    // Chi-Rho — for «Verdadero Dios y verdadero hombre» / Paschal
    case 'chiRho': {
      // Vertical of P
      slide.addShape('line', {
        x: cx - s * 0.30, y: cy - s * 0.40, w: 0, h: s * 0.80,
        line,
      });
      // Bowl of P (top half)
      slide.addShape('line', {
        x: cx - s * 0.30, y: cy - s * 0.40, w: s * 0.35, h: 0,
        line,
      });
      slide.addShape('line', {
        x: cx + s * 0.05, y: cy - s * 0.40, w: 0, h: s * 0.25,
        line,
      });
      slide.addShape('line', {
        x: cx - s * 0.30, y: cy - s * 0.15, w: s * 0.35, h: 0,
        line,
      });
      // Diagonal X-cross through the P
      slide.addShape('line', {
        x: cx - s * 0.40, y: cy - s * 0.15, w: s * 0.80, h: s * 0.55,
        line,
      });
      slide.addShape('line', {
        x: cx + s * 0.40, y: cy - s * 0.15, w: -s * 0.80, h: s * 0.55,
        line,
      });
      break;
    }

    // Crown — for «Señor» / Rey
    case 'crown': {
      const w = s * 1.2, h = s * 0.6;
      slide.addShape('line', {
        x: cx - w / 2, y: cy + h / 2, w, h: 0,
        line,
      });
      // Three peaks
      slide.addShape('line', {
        x: cx - w / 2, y: cy + h / 2, w: w / 4, h: -h / 2,
        line,
      });
      slide.addShape('line', {
        x: cx - w / 4, y: cy - h / 2, w: w / 4, h: h / 2,
        line,
      });
      slide.addShape('line', {
        x: cx, y: cy - h / 2, w: w / 4, h: h / 2,
        line,
      });
      slide.addShape('line', {
        x: cx + w / 4, y: cy, w: w / 4, h: -h / 2,
        line,
      });
      slide.addShape('line', {
        x: cx + w / 4, y: cy - h / 2, w: w / 4, h: h / 2,
        line,
      });
      // Jewels (small dots)
      slide.addShape('oval', {
        x: cx - w / 4 - 0.04, y: cy - 0.04, w: 0.08, h: 0.08,
        fill: { color: c, transparency: 0 }, line: { type: 'none' },
      });
      slide.addShape('oval', {
        x: cx - 0.04, y: cy - 0.04, w: 0.08, h: 0.08,
        fill: { color: c, transparency: 0 }, line: { type: 'none' },
      });
      slide.addShape('oval', {
        x: cx + w / 4 - 0.04, y: cy - 0.04, w: 0.08, h: 0.08,
        fill: { color: c, transparency: 0 }, line: { type: 'none' },
      });
      break;
    }

    // M monogram (Mary) — for the Virgin Mary slides
    case 'maryM': {
      // Center column
      slide.addShape('line', {
        x: cx, y: cy - s * 0.45, w: 0, h: s * 0.90,
        line,
      });
      // Left stroke up
      slide.addShape('line', {
        x: cx - s * 0.50, y: cy + s * 0.45, w: s * 0.50, h: -s * 0.90,
        line,
      });
      // Right stroke up
      slide.addShape('line', {
        x: cx, y: cy - s * 0.45, w: s * 0.50, h: s * 0.45,
        line,
      });
      // Right stroke down
      slide.addShape('line', {
        x: cx + s * 0.50, y: cy + s * 0.45, w: -s * 0.50, h: -s * 0.45,
        line,
      });
      // Cross atop (her title)
      slide.addShape('line', {
        x: cx - s * 0.10, y: cy - s * 0.55, w: s * 0.20, h: 0,
        line: { color: c, width: 1.0 },
      });
      slide.addShape('line', {
        x: cx, y: cy - s * 0.65, w: 0, h: s * 0.20,
        line: { color: c, width: 1.0 },
      });
      break;
    }

    // Empty tomb — circle (rolled stone) + rectangle (tomb) + sun rays
    case 'emptyTomb': {
      // Tomb rectangle
      slide.addShape('rect', {
        x: cx - s * 0.55, y: cy + s * 0.05, w: s * 1.10, h: s * 0.35,
        fill: { type: 'none' }, line,
      });
      // Opening arch
      slide.addShape('line', {
        x: cx - s * 0.35, y: cy + s * 0.05, w: 0, h: -s * 0.15,
        line,
      });
      slide.addShape('line', {
        x: cx + s * 0.35, y: cy + s * 0.05, w: 0, h: -s * 0.15,
        line,
      });
      // Sun rays above
      for (let i = -3; i <= 3; i++) {
        slide.addShape('line', {
          x: cx + i * s * 0.10, y: cy - s * 0.10,
          w: 0, h: -s * 0.20,
          line: { color: c, width: 0.8 },
        });
      }
      break;
    }

    // Upward rays / Ascension — triangle + vertical lines
    case 'raysUp': {
      // Triangle pointing up
      slide.addShape('triangle', {
        x: cx - s * 0.35, y: cy, w: s * 0.70, h: s * 0.50,
        fill: { type: 'none' }, line,
      });
      // Vertical rays rising
      for (let i = -2; i <= 2; i++) {
        slide.addShape('line', {
          x: cx + i * s * 0.15, y: cy - s * 0.20,
          w: 0, h: -s * 0.30,
          line: { color: c, width: 0.8 },
        });
      }
      break;
    }

    // Downward rays / Descended to inférios — pointing down
    case 'raysDown': {
      // Triangle pointing down
      slide.addShape('rtTriangle', {
        x: cx - s * 0.35, y: cy - s * 0.50, w: s * 0.70, h: s * 0.50,
        fill: { type: 'none' }, line,
      });
      // Vertical rays descending
      for (let i = -2; i <= 2; i++) {
        slide.addShape('line', {
          x: cx + i * s * 0.15, y: cy + s * 0.10,
          w: 0, h: s * 0.30,
          line: { color: c, width: 0.8 },
        });
      }
      break;
    }

    // Flame — for Pentecost / Espíritu Santo / juicio
    case 'flame': {
      // Outer flame outline (rough)
      slide.addShape('line', {
        x: cx, y: cy - s * 0.50, w: 0, h: s * 0.40,
        line,
      });
      slide.addShape('line', {
        x: cx - s * 0.20, y: cy - s * 0.10, w: s * 0.20, h: -s * 0.40,
        line,
      });
      slide.addShape('line', {
        x: cx, y: cy - s * 0.50, w: s * 0.20, h: s * 0.40,
        line,
      });
      slide.addShape('line', {
        x: cx, y: cy + s * 0.40, w: s * 0.30, h: 0,
        line,
      });
      slide.addShape('line', {
        x: cx - s * 0.15, y: cy + s * 0.40, w: 0, h: s * 0.10,
        line,
      });
      slide.addShape('line', {
        x: cx + s * 0.15, y: cy + s * 0.40, w: 0, h: s * 0.10,
        line,
      });
      break;
    }

    // Crown of thorns — for Padeció / Pasión
    case 'thorns': {
      // Horizontal wreath
      slide.addShape('oval', {
        x: cx - s * 0.55, y: cy - s * 0.25, w: s * 1.10, h: s * 0.50,
        fill: { type: 'none' }, line,
      });
      // Thorns (small lines)
      for (let i = -5; i <= 5; i++) {
        const x = cx + i * s * 0.10;
        slide.addShape('line', {
          x, y: cy - s * 0.30, w: 0, h: s * 0.10,
          line: { color: c, width: 0.7 },
        });
      }
      break;
    }

    // Heart-cross — for «Hijo único» / obediencia filial
    case 'heart': {
      // Simple heart via two circles and triangle
      slide.addShape('oval', {
        x: cx - s * 0.40, y: cy - s * 0.30, w: s * 0.40, h: s * 0.40,
        fill: { type: 'none' }, line,
      });
      slide.addShape('oval', {
        x: cx, y: cy - s * 0.30, w: s * 0.40, h: s * 0.40,
        fill: { type: 'none' }, line,
      });
      // Triangle bottom
      slide.addShape('triangle', {
        x: cx - s * 0.35, y: cy - s * 0.10, w: s * 0.70, h: s * 0.40,
        fill: { type: 'none' }, line,
      });
      // Small cross inside
      slide.addShape('line', {
        x: cx, y: cy - s * 0.20, w: 0, h: s * 0.30,
        line: { color: c, width: 0.9 },
      });
      slide.addShape('line', {
        x: cx - s * 0.10, y: cy - s * 0.05, w: s * 0.20, h: 0,
        line: { color: c, width: 0.9 },
      });
      break;
    }

    // Compass rose — for «Buena Nueva» / proclaim
    case 'compass': {
      // Outer circle
      slide.addShape('oval', {
        x: cx - s * 0.40, y: cy - s * 0.40, w: s * 0.80, h: s * 0.80,
        fill: { type: 'none' }, line: { color: c, width: 0.8 },
      });
      // 4-point star
      slide.addShape('line', {
        x: cx, y: cy - s * 0.40, w: 0, h: s * 0.80,
        line,
      });
      slide.addShape('line', {
        x: cx - s * 0.40, y: cy, w: s * 0.80, h: 0,
        line,
      });
      break;
    }

    // Rule-and-dot ornament — small divider mark
    case 'ruleDot': {
      slide.addShape('line', {
        x: cx - s * 0.80, y: cy, w: s * 0.55, h: 0,
        line,
      });
      slide.addShape('line', {
        x: cx + s * 0.25, y: cy, w: s * 0.55, h: 0,
        line,
      });
      slide.addShape('oval', {
        x: cx - 0.05, y: cy - 0.05, w: 0.10, h: 0.10,
        fill: { color: c, transparency: 0 }, line: { type: 'none' },
      });
      break;
    }

    default:
      // Fallback to monogram cross
      monogramCross(slide, cx, cy, size, color);
  }
}

module.exports = {
  theme,
  SAFE,
  paintBackground,
  pageNumber,
  rule,
  sectionTag,
  ornament,
  glyph,
};