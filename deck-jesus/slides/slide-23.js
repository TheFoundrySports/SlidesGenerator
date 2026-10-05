// 23 Cita bíblica · Lc 23, 46 -- Padre, en tus manos encomiendo mi espíritu
const T = require('./theme');

function createSlide(pres, theme) {
  const slide = pres.addSlide();
  T.paintBackground(slide);

  slide.addText('Lucas 23, 46', {
    x: 0.50, y: 0.85, w: 9.0, h: 0.40,
    fontFace: T.theme.fontMono, fontSize: 12,
    color: T.theme.muted, align: 'center', valign: 'middle',
    charSpacing: 4, margin: 0,
  });

  T.ornament(slide, 5.0, 1.55, { kind: 'cross', size: 0.40 });

  slide.addText('«Padre, en tus manos encomiendo mi espíritu.»', {
    x: 0.80, y: 2.10, w: 8.4, h: 1.30,
    fontFace: T.theme.fontDisplay, italic: true,
    fontSize: 36, color: T.theme.fg, align: 'center', valign: 'middle',
    margin: 0,
  });

  // Brief reflection
  slide.addText('Jesús muere orando. Su última palabra no es un grito de abandono, sino un acto de confianza filial: pone su vida en las manos del Padre.', {
    x: 1.20, y: 3.65, w: 7.6, h: 0.65,
    fontFace: T.theme.fontBody, italic: true,
    fontSize: 15, color: T.theme.muted, align: 'center', valign: 'middle',
    margin: 0,
  });

  slide.addText('Lc 23, 46 · CEC 624, 2605', {
    x: 0.50, y: 4.65, w: 9.0, h: 0.30,
    fontFace: T.theme.fontMono, fontSize: 10,
    color: T.theme.muted, align: 'center', valign: 'middle',
    charSpacing: 3, margin: 0,
  });

  T.pageNumber(slide, 23, 30);
}

module.exports = { createSlide };