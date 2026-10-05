// 26 Doctrina · Ascendió a los cielos
const T = require('./theme');

function createSlide(pres, theme) {
  const slide = pres.addSlide();
  T.paintBackground(slide);

  slide.addText('LA ASCENSIÓN', {
    x: 0.50, y: 0.55, w: 9.0, h: 0.30,
    fontFace: T.theme.fontMono, fontSize: 9,
    color: T.theme.muted, align: 'center', valign: 'middle',
    charSpacing: 5, margin: 0,
  });

  slide.addText('Ascendió a los cielos', {
    x: 0.50, y: 0.90, w: 9.0, h: 0.65,
    fontFace: T.theme.fontDisplay, fontSize: 36,
    color: T.theme.fg, align: 'center', valign: 'middle',
    margin: 0,
  });

  T.rule(slide, 1.65, { w: 1.2 });

  slide.addText('«Con Jesús uno de nosotros ha llegado junto a Dios y está allí para siempre. En su Hijo, Dios está humanamente cercano a nosotros los hombres.»', {
    x: 0.80, y: 1.95, w: 8.4, h: 1.40,
    fontFace: T.theme.fontBody, italic: true,
    fontSize: 16, color: T.theme.fg, align: 'center', valign: 'middle',
    margin: 0,
  });

  slide.addText('YOUCAT 109', {
    x: 0.50, y: 3.40, w: 9.0, h: 0.25,
    fontFace: T.theme.fontMono, fontSize: 9,
    color: T.theme.muted, align: 'center', valign: 'middle',
    charSpacing: 3, margin: 0,
  });

  // Three vertical points
  const items = [
    { tag: 'I.',   text: '«Cuando yo sea elevado sobre la tierra, atraeré a todos hacia mí» (Jn 12, 32). La Ascensión marca el fin de la cercanía visible del Resucitado.' },
    { tag: 'II.',  text: 'Jesús entra con toda su humanidad en la gloria de Dios. «El hombre encuentra sitio en Dios» -- Benedicto XVI.' },
    { tag: 'III.', text: 'Su presencia ya no es terrena y localizada, pero sigue presente en la Palabra, los Sacramentos y donde dos o tres están reunidos en su nombre (Mt 18, 20).' },
  ];
  items.forEach((p, i) => {
    const y = 3.75 + i * 0.42;
    slide.addText(p.tag, {
      x: 0.65, y, w: 0.45, h: 0.38,
      fontFace: T.theme.fontMono, fontSize: 11,
      color: T.theme.gold, align: 'left', valign: 'middle',
      margin: 0,
    });
    slide.addText(p.text, {
      x: 1.15, y, w: 8.25, h: 0.38,
      fontFace: T.theme.fontBody, fontSize: 12,
      color: T.theme.fg, align: 'left', valign: 'middle',
      margin: 0,
    });
  });

  slide.addText('CEC 659-667 · YOUCAT 109', {
    x: 0.50, y: 5.10, w: 9.0, h: 0.25,
    fontFace: T.theme.fontMono, fontSize: 10,
    color: T.theme.muted, align: 'center', valign: 'middle',
    charSpacing: 4, margin: 0,
  });

  T.pageNumber(slide, 26, 30);
}

module.exports = { createSlide };