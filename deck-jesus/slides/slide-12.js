// 12 Separador · 2. La Encarnación
const T = require('./theme');

function createSlide(pres, theme) {
  const slide = pres.addSlide();
  T.paintBackground(slide);

  T.ornament(slide, 5.0, 2.50, { kind: 'alpha', size: 1.20 });

  slide.addText('SEGUNDA PARTE', {
    x: 0.50, y: 3.55, w: 9.0, h: 0.35,
    fontFace: T.theme.fontMono, fontSize: 10,
    color: T.theme.muted, align: 'center', valign: 'middle',
    charSpacing: 6, margin: 0,
  });

  slide.addText('La Encarnación', {
    x: 0.50, y: 3.90, w: 9.0, h: 0.55,
    fontFace: T.theme.fontDisplay, fontSize: 32,
    color: T.theme.fg, align: 'center', valign: 'middle',
    margin: 0,
  });

  T.rule(slide, 4.65, { w: 1.5 });

  slide.addText('«Y la Palabra se hizo carne» (Jn 1, 14)', {
    x: 0.50, y: 4.80, w: 9.0, h: 0.30,
    fontFace: T.theme.fontDisplay, italic: true,
    fontSize: 14, color: T.theme.muted, align: 'center', valign: 'middle',
    margin: 0,
  });

  T.pageNumber(slide, 12, 30);
}

module.exports = { createSlide };