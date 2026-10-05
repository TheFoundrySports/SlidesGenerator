// 02 Cita bíblica · Mt 16, 16 — full-bleed image with parchment panel
const T = require('./theme');

function createSlide(pres, theme) {
  const slide = pres.addSlide();
  T.paintBackground(slide);

  // Full-bleed image as background (right side anchor) -- natural aspect ratio
  // image is 2752x1536, ratio 1.79
  slide.addImage({
    path: 'img/s02-peter-confession.jpg',
    x: 5.50, y: 1.60, w: 4.30, h: 2.40,
  });

  // Parchment panel covering left ~45% (text legible on solid bg)
  slide.addShape('rect', {
    x: 0.00, y: 0.00, w: 4.30, h: 5.625,
    fill: { color: T.theme.bg },
    line: { type: 'none' },
  });

  // Top reference
  slide.addText('Mateo 16, 16', {
    x: 0.40, y: 0.85, w: 3.70, h: 0.40,
    fontFace: T.theme.fontMono, fontSize: 12,
    color: T.theme.muted, align: 'center', valign: 'middle',
    charSpacing: 4, margin: 0,
  });

  T.ornament(slide, 2.25, 1.55, { kind: 'cross', size: 0.40 });

  // The passage (italic, centered, large)
  slide.addText('«Tú eres el Cristo, el Hijo de Dios vivo.»', {
    x: 0.30, y: 2.05, w: 3.85, h: 1.55,
    fontFace: T.theme.fontDisplay, italic: true,
    fontSize: 26, color: T.theme.fg, align: 'center', valign: 'middle',
    charSpacing: -0.5, margin: 0,
  });

  // Italic attribution / commentary
  slide.addText('Sobre la roca de esta fe, confesada por Pedro, Cristo ha construido su Iglesia.', {
    x: 0.30, y: 3.75, w: 3.85, h: 0.85,
    fontFace: T.theme.fontBody, italic: true,
    fontSize: 12, color: T.theme.muted, align: 'center', valign: 'middle',
    margin: 0,
  });

  // Citation footer
  slide.addText('Mt 16, 16 · CEC 424', {
    x: 0.40, y: 4.80, w: 3.70, h: 0.30,
    fontFace: T.theme.fontMono, fontSize: 10,
    color: T.theme.muted, align: 'center', valign: 'middle',
    charSpacing: 3, margin: 0,
  });

  T.pageNumber(slide, 2, 30);
}

module.exports = { createSlide };