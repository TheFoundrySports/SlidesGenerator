// 15 Cita bíblica · Lc 1, 38 -- He aquí la esclava del Señor
const T = require('./theme');

function createSlide(pres, theme) {
  const slide = pres.addSlide();
  T.paintBackground(slide);

  slide.addText('Lucas 1, 38', {
    x: 0.50, y: 0.85, w: 9.0, h: 0.40,
    fontFace: T.theme.fontMono, fontSize: 12,
    color: T.theme.muted, align: 'center', valign: 'middle',
    charSpacing: 4, margin: 0,
  });

  T.ornament(slide, 5.0, 1.55, { kind: 'cross', size: 0.40 });

  slide.addText('«He aquí la esclava del Señor; hágase en mí según tu palabra.»', {
    x: 0.80, y: 2.05, w: 8.4, h: 1.50,
    fontFace: T.theme.fontDisplay, italic: true,
    fontSize: 32, color: T.theme.fg, align: 'center', valign: 'middle',
    margin: 0,
  });

  slide.addText('El «sí» de María hace posible la Encarnación: por su asentimiento activo se realizó la obra de la salvación.', {
    x: 1.20, y: 3.75, w: 7.6, h: 0.55,
    fontFace: T.theme.fontBody, italic: true,
    fontSize: 14, color: T.theme.muted, align: 'center', valign: 'middle',
    margin: 0,
  });

  slide.addText('Lc 1, 38 · CEC 494 · YOUCAT 84', {
    x: 0.50, y: 4.65, w: 9.0, h: 0.30,
    fontFace: T.theme.fontMono, fontSize: 10,
    color: T.theme.muted, align: 'center', valign: 'middle',
    charSpacing: 3, margin: 0,
  });

  T.pageNumber(slide, 15, 30);
}

module.exports = { createSlide };