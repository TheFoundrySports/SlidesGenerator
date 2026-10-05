// 26 Doctrina · Ascendió a los cielos — full-bleed image + parchment panel
const T = require('./theme');

function createSlide(pres, theme) {
  const slide = pres.addSlide();
  T.paintBackground(slide);

  // Full-bleed image on right -- natural aspect ratio (1.79)
  slide.addImage({
    path: 'img/s26-ascension.jpg',
    x: 5.60, y: 1.60, w: 4.30, h: 2.40,
  });

  // Parchment panel covering left ~55%
  slide.addShape('rect', {
    x: 0.00, y: 0.00, w: 5.50, h: 5.625,
    fill: { color: T.theme.bg },
    line: { type: 'none' },
  });

  slide.addText('LA ASCENSIÓN', {
    x: 0.40, y: 0.55, w: 5.10, h: 0.30,
    fontFace: T.theme.fontMono, fontSize: 9,
    color: T.theme.muted, align: 'center', valign: 'middle',
    charSpacing: 5, margin: 0,
  });

  slide.addText('Ascendió a los cielos', {
    x: 0.40, y: 0.90, w: 5.10, h: 0.65,
    fontFace: T.theme.fontDisplay, fontSize: 26,
    color: T.theme.fg, align: 'center', valign: 'middle',
    margin: 0,
  });

  T.rule(slide, 1.65, { w: 1.2, x: 2.20 });

  slide.addText('«Con Jesús uno de nosotros ha llegado junto a Dios y está allí para siempre.»', {
    x: 0.30, y: 1.95, w: 5.20, h: 1.10,
    fontFace: T.theme.fontBody, italic: true,
    fontSize: 13, color: T.theme.fg, align: 'center', valign: 'middle',
    margin: 0,
  });

  slide.addText('YOUCAT 109', {
    x: 0.30, y: 3.10, w: 5.20, h: 0.25,
    fontFace: T.theme.fontMono, fontSize: 9,
    color: T.theme.muted, align: 'center', valign: 'middle',
    charSpacing: 3, margin: 0,
  });

  // Three vertical points (left half) — aligned
  const items = [
    { tag: 'I.',   text: '«Cuando yo sea elevado sobre la tierra, atraeré a todos hacia mí» (Jn 12, 32).' },
    { tag: 'II.',  text: 'Jesús entra con toda su humanidad en la gloria de Dios. «El hombre encuentra sitio en Dios» -- Benedicto XVI.' },
    { tag: 'III.', text: 'Sigue presente en la Palabra, los Sacramentos y donde dos o tres están reunidos (Mt 18, 20).' },
  ];
  items.forEach((p, i) => {
    const y = 3.55 + i * 0.50;
    slide.addText(p.tag, {
      x: 0.40, y, w: 0.55, h: 0.45,
      fontFace: T.theme.fontMono, fontSize: 12,
      color: T.theme.gold, align: 'left', valign: 'top',
      margin: 0,
    });
    slide.addText(p.text, {
      x: 1.00, y, w: 4.40, h: 0.50,
      fontFace: T.theme.fontBody, fontSize: 11,
      color: T.theme.fg, align: 'left', valign: 'top',
      margin: 0,
    });
  });

  slide.addText('CEC 659-667 · YOUCAT 109', {
    x: 0.50, y: 5.10, w: 5.0, h: 0.25,
    fontFace: T.theme.fontMono, fontSize: 10,
    color: T.theme.muted, align: 'center', valign: 'middle',
    charSpacing: 4, margin: 0,
  });

  T.pageNumber(slide, 26, 30);
}

module.exports = { createSlide };