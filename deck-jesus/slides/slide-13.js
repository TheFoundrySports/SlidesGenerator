// 13 Doctrina · ¿Por qué se hizo Dios hombre en Jesús?
const T = require('./theme');

function createSlide(pres, theme) {
  const slide = pres.addSlide();
  T.paintBackground(slide);

  slide.addText('EL POR QUÉ DE LA ENCARNACIÓN', {
    x: 0.50, y: 0.55, w: 9.0, h: 0.30,
    fontFace: T.theme.fontMono, fontSize: 9,
    color: T.theme.muted, align: 'center', valign: 'middle',
    charSpacing: 5, margin: 0,
  });

  slide.addText('¿Por qué se hizo Dios hombre en Jesús?', {
    x: 0.50, y: 0.90, w: 9.0, h: 0.65,
    fontFace: T.theme.fontDisplay, fontSize: 32,
    color: T.theme.fg, align: 'center', valign: 'middle',
    margin: 0,
  });

  T.rule(slide, 1.65, { w: 1.5 });

  // Nicene Creed center quote
  slide.addText('«Por nosotros, los hombres, y por nuestra salvación, bajó del cielo.»', {
    x: 0.80, y: 1.95, w: 8.4, h: 0.95,
    fontFace: T.theme.fontBody, italic: true,
    fontSize: 20, color: T.theme.fg, align: 'center', valign: 'middle',
    margin: 0,
  });

  slide.addText('Credo de Nicea-Constantinopla', {
    x: 0.50, y: 2.95, w: 9.0, h: 0.30,
    fontFace: T.theme.fontMono, fontSize: 10,
    color: T.theme.muted, align: 'center', valign: 'middle',
    charSpacing: 3, margin: 0,
  });

  // Three motives (vertical)
  const items = [
    { tag: 'I.',   text: '«Para rescatar a los que se hallaban bajo la Ley, y para que recibiéramos la filiación adoptiva» (Ga 4, 4-5).' },
    { tag: 'II.',  text: '«Para revelar el amor del Padre a los hombres» -- el Verbo se hace visible al ojo y al oído humanos.' },
    { tag: 'III.', text: '«Para ser nuestro modelo de santidad»: «sed perfectos como vuestro Padre celestial es perfecto» (Mt 5, 48).' },
  ];
  items.forEach((p, i) => {
    const y = 3.50 + i * 0.50;
    slide.addText(p.tag, {
      x: 0.65, y, w: 0.45, h: 0.45,
      fontFace: T.theme.fontMono, fontSize: 12,
      color: T.theme.gold, align: 'left', valign: 'middle',
      margin: 0,
    });
    slide.addText(p.text, {
      x: 1.15, y, w: 8.25, h: 0.45,
      fontFace: T.theme.fontBody, fontSize: 13,
      color: T.theme.fg, align: 'left', valign: 'middle',
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