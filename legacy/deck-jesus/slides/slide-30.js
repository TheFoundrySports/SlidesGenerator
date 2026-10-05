// 30 Cierre · Closing blessing
const T = require('./theme');

function createSlide(pres, theme) {
  const slide = pres.addSlide();
  T.paintBackground(slide);

  // Ornament above
  T.ornament(slide, 5.0, 1.30, { kind: 'cross', size: 0.7 });

  // Tag
  slide.addText('COMUNIÓN EN CRISTO', {
    x: 0.50, y: 2.05, w: 9.0, h: 0.30,
    fontFace: T.theme.fontMono, fontSize: 10,
    color: T.theme.muted, align: 'center', valign: 'middle',
    charSpacing: 6, margin: 0,
  });

  // Lead quote -- display italic
  slide.addText('«Lo que hemos visto y oído, os lo anunciamos, para que también vosotros estéis en comunión con nosotros. Y nosotros estamos en comunión con el Padre y con su Hijo, Jesucristo.»', {
    x: 0.80, y: 2.45, w: 8.4, h: 1.95,
    fontFace: T.theme.fontDisplay, italic: true,
    fontSize: 22, color: T.theme.fg, align: 'center', valign: 'middle',
    margin: 0,
  });

  slide.addText('1 Juan 1, 3', {
    x: 0.50, y: 4.40, w: 9.0, h: 0.30,
    fontFace: T.theme.fontMono, fontSize: 10,
    color: T.theme.muted, align: 'center', valign: 'middle',
    charSpacing: 3, margin: 0,
  });

  // Amén
  slide.addText('Amén.', {
    x: 0.50, y: 4.95, w: 9.0, h: 0.45,
    fontFace: T.theme.fontDisplay, italic: true,
    fontSize: 22, color: T.theme.fg, align: 'center', valign: 'middle',
    margin: 0,
  });

  T.pageNumber(slide, 30, 30);
}

module.exports = { createSlide };