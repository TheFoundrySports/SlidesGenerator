// 13 Doctrina · ¿Por qué se hizo Dios hombre? — full-bleed image + parchment panel
const T = require('./theme');

function createSlide(pres, theme) {
  const slide = pres.addSlide();
  T.paintBackground(slide);

  // Full-bleed image on right -- natural aspect ratio (2752x1536, 1.79)
  slide.addImage({
    path: 'img/s13-annunciation.jpg',
    x: 5.60, y: 1.60, w: 4.30, h: 2.40,
  });

  // Parchment panel covering left ~58%
  slide.addShape('rect', {
    x: 0.00, y: 0.00, w: 5.65, h: 5.625,
    fill: { color: T.theme.bg },
    line: { type: 'none' },
  });

  slide.addText('EL POR QUÉ DE LA ENCARNACIÓN', {
    x: 0.40, y: 0.55, w: 5.10, h: 0.30,
    fontFace: T.theme.fontMono, fontSize: 9,
    color: T.theme.muted, align: 'center', valign: 'middle',
    charSpacing: 5, margin: 0,
  });

  slide.addText('¿Por qué se hizo Dios hombre en Jesús?', {
    x: 0.30, y: 0.90, w: 5.30, h: 0.85,
    fontFace: T.theme.fontDisplay, fontSize: 26,
    color: T.theme.fg, align: 'center', valign: 'middle',
    margin: 0,
  });

  T.rule(slide, 1.85, { w: 1.2, x: 2.20 });

  // Nicene Creed center quote (left half only)
  slide.addText('«Por nosotros, los hombres, y por nuestra salvación, bajó del cielo.»', {
    x: 0.30, y: 2.10, w: 5.30, h: 0.85,
    fontFace: T.theme.fontBody, italic: true,
    fontSize: 14, color: T.theme.fg, align: 'center', valign: 'middle',
    margin: 0,
  });

  slide.addText('Credo de Nicea-Constantinopla', {
    x: 0.30, y: 2.95, w: 5.30, h: 0.30,
    fontFace: T.theme.fontMono, fontSize: 9,
    color: T.theme.muted, align: 'center', valign: 'middle',
    charSpacing: 3, margin: 0,
  });

  // Three motives (left half) — aligned tag + text
  const items = [
    { tag: 'I.',   text: '«Para rescatar a los que se hallaban bajo la Ley, y para que recibiéramos la filiación adoptiva» (Ga 4, 4-5).' },
    { tag: 'II.',  text: '«Para revelar el amor del Padre a los hombres» -- el Verbo se hace visible al ojo y al oído humanos.' },
    { tag: 'III.', text: '«Para ser nuestro modelo de santidad»: «sed perfectos como vuestro Padre celestial es perfecto» (Mt 5, 48).' },
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
      x: 1.00, y, w: 4.55, h: 0.50,
      fontFace: T.theme.fontBody, fontSize: 11,
      color: T.theme.fg, align: 'left', valign: 'top',
      margin: 0,
    });
  });

  slide.addText('CEC 456-460 · YOUCAT 76', {
    x: 0.50, y: 5.10, w: 9.0, h: 0.25,
    fontFace: T.theme.fontMono, fontSize: 10,
    color: T.theme.muted, align: 'center', valign: 'middle',
    charSpacing: 4, margin: 0,
  });

  T.pageNumber(slide, 13, 30);
}

module.exports = { createSlide };