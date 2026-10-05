// 20 Separador · 3. La Pascua
const T = require('./theme');

function createSlide(pres, theme) {
  const slide = pres.addSlide();
  T.paintBackground(slide);

  T.ornament(slide, 5.0, 1.80, { kind: 'cross', size: 1.20 });

  slide.addText('TERCERA PARTE', {
    x: 0.50, y: 3.05, w: 9.0, h: 0.35,
    fontFace: T.theme.fontMono, fontSize: 10,
    color: T.theme.muted, align: 'center', valign: 'middle',
    charSpacing: 6, margin: 0,
  });

  slide.addText('La Pascua del Señor', {
    x: 0.50, y: 3.45, w: 9.0, h: 0.55,
    fontFace: T.theme.fontDisplay, fontSize: 32,
    color: T.theme.fg, align: 'center', valign: 'middle',
    margin: 0,
  });

  T.rule(slide, 4.20, { w: 1.5 });

  slide.addText('Pasión · Cruz · Muerte · Sepultura · Resurrección · Ascensión', {
    x: 0.50, y: 4.40, w: 9.0, h: 0.30,
    fontFace: T.theme.fontDisplay, italic: true,
    fontSize: 14, color: T.theme.muted, align: 'center', valign: 'middle',
    margin: 0,
  });

  T.pageNumber(slide, 20, 30);
}

module.exports = { createSlide };