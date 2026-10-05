// 05 Cita bíblica · Jn 1, 14 -- La Palabra se hizo carne
const T = require('./theme');

function createSlide(pres, theme) {
  const slide = pres.addSlide();
  T.paintBackground(slide);

  slide.addText('Juan 1, 14', {
    x: 0.50, y: 0.85, w: 9.0, h: 0.40,
    fontFace: T.theme.fontMono, fontSize: 12,
    color: T.theme.muted, align: 'center', valign: 'middle',
    charSpacing: 4, margin: 0,
  });

  T.ornament(slide, 5.0, 1.55, { kind: 'cross', size: 0.40 });

  slide.addText('«Y la Palabra se hizo carne, y puso su morada entre nosotros, y hemos visto su gloria, gloria que recibe del Padre como Hijo único, lleno de gracia y de verdad.»', {
    x: 0.80, y: 2.05, w: 8.4, h: 1.80,
    fontFace: T.theme.fontDisplay, italic: true,
    fontSize: 28, color: T.theme.fg, align: 'center', valign: 'middle',
    margin: 0,
  });

  // Attribution
  slide.addText('Esta es la Buena Nueva de Jesucristo, Hijo de Dios (Mc 1, 1).', {
    x: 1.20, y: 4.00, w: 7.6, h: 0.40,
    fontFace: T.theme.fontBody, italic: true,
    fontSize: 14, color: T.theme.muted, align: 'center', valign: 'middle',
    margin: 0,
  });

  slide.addText('CEC 423, 463 · YOUCAT 74', {
    x: 0.50, y: 4.65, w: 9.0, h: 0.30,
    fontFace: T.theme.fontMono, fontSize: 10,
    color: T.theme.muted, align: 'center', valign: 'middle',
    charSpacing: 3, margin: 0,
  });

  T.pageNumber(slide, 5, 30);
}

module.exports = { createSlide };