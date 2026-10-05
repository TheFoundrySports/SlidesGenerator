// 15 Cita bíblica · Lc 1, 38 — full-bleed image on left + parchment panel
const T = require('./theme');

function createSlide(pres, theme) {
  const slide = pres.addSlide();
  T.paintBackground(slide);

  // Full-bleed image on left -- natural aspect ratio (square 2048x2048)
  slide.addImage({
    path: 'img/s15-mary-yes.jpg',
    x: 0.40, y: 0.55, w: 4.10, h: 4.10,
  });

  // Parchment panel covering right ~55%
  slide.addShape('rect', {
    x: 4.50, y: 0.00, w: 5.50, h: 5.625,
    fill: { color: T.theme.bg },
    line: { type: 'none' },
  });

  slide.addText('Lucas 1, 38', {
    x: 4.80, y: 0.85, w: 5.00, h: 0.40,
    fontFace: T.theme.fontMono, fontSize: 12,
    color: T.theme.muted, align: 'center', valign: 'middle',
    charSpacing: 4, margin: 0,
  });

  T.ornament(slide, 7.25, 1.55, { kind: 'cross', size: 0.40 });

  slide.addText('«He aquí la esclava del Señor; hágase en mí según tu palabra.»', {
    x: 4.70, y: 2.05, w: 5.20, h: 1.50,
    fontFace: T.theme.fontDisplay, italic: true,
    fontSize: 26, color: T.theme.fg, align: 'center', valign: 'middle',
    margin: 0,
  });

  slide.addText('El «sí» de María hace posible la Encarnación: por su asentimiento activo se realizó la obra de la salvación.', {
    x: 4.70, y: 3.75, w: 5.20, h: 0.85,
    fontFace: T.theme.fontBody, italic: true,
    fontSize: 13, color: T.theme.muted, align: 'center', valign: 'middle',
    margin: 0,
  });

  slide.addText('Lc 1, 38 · CEC 494 · YOUCAT 84', {
    x: 4.80, y: 4.85, w: 5.00, h: 0.30,
    fontFace: T.theme.fontMono, fontSize: 10,
    color: T.theme.muted, align: 'center', valign: 'middle',
    charSpacing: 3, margin: 0,
  });

  T.pageNumber(slide, 15, 30);
}

module.exports = { createSlide };