// 04 Doctrina · En el centro de la catequesis: Cristo
const T = require('./theme');

function createSlide(pres, theme) {
  const slide = pres.addSlide();
  T.paintBackground(slide);

  slide.addText('EL CENTRO DE LA CATEQUESIS', {
    x: 0.50, y: 0.55, w: 9.0, h: 0.30,
    fontFace: T.theme.fontMono, fontSize: 9,
    color: T.theme.muted, align: 'center', valign: 'middle',
    charSpacing: 5, margin: 0,
  });

  slide.addText('Cristo, el corazón de la fe', {
    x: 0.50, y: 0.90, w: 9.0, h: 0.65,
    fontFace: T.theme.fontDisplay, fontSize: 36,
    color: T.theme.fg, align: 'center', valign: 'middle',
    margin: 0,
  });

  
  // Glyph: chiRho -- centred at top
  T.glyph(slide, 'chiRho', 5.0, 0.2, 0.35, T.theme.gold);
  T.rule(slide, 1.65, { w: 1.5 });


  // Lead quote
  slide.addText('«En el centro de la catequesis encontramos esencialmente una persona, la de Jesús de Nazaret, Unigénito del Padre [...]; que ha sufrido y ha muerto por nosotros y que ahora, resucitado, vive para siempre con nosotros.»', {
    x: 0.80, y: 1.95, w: 8.4, h: 1.55,
    fontFace: T.theme.fontBody, italic: true,
    fontSize: 16, color: T.theme.fg, align: 'center', valign: 'middle',
    margin: 0,
  });

  slide.addText('Juan Pablo II · Catechesi Tradendae 5', {
    x: 0.50, y: 3.55, w: 9.0, h: 0.25,
    fontFace: T.theme.fontMono, fontSize: 9,
    color: T.theme.muted, align: 'center', valign: 'middle',
    charSpacing: 3, margin: 0,
  });

  // Three vertical doctrine points
  const points = [
    { tag: 'I.',   text: 'Anunciar a Jesucristo: «No podemos dejar de hablar de lo que hemos visto y oído» (Hch 4, 20).' },
    { tag: 'II.',  text: 'Enseñar a Cristo: «Lo que se enseña es a Cristo, el Verbo encarnado e Hijo de Dios, y todo lo demás en referencia a Él».' },
    { tag: 'III.', text: 'Conocerle a Él: «Aceptar perder todas las cosas para ganar a Cristo» (Flp 3, 8).' },
  ];
  points.forEach((p, i) => {
    const y = 4.00 + i * 0.40;
    slide.addText(p.tag, {
      x: 0.80, y, w: 0.45, h: 0.35,
      fontFace: T.theme.fontMono, fontSize: 11,
      color: T.theme.gold, align: 'left', valign: 'middle',
      margin: 0,
    });
    slide.addText(p.text, {
      x: 1.30, y, w: 8.10, h: 0.35,
      fontFace: T.theme.fontBody, fontSize: 12,
      color: T.theme.fg, align: 'left', valign: 'middle',
      margin: 0,
    });
  });

  slide.addText('CEC 425-429', {
    x: 0.50, y: 5.10, w: 9.0, h: 0.25,
    fontFace: T.theme.fontMono, fontSize: 10,
    color: T.theme.muted, align: 'center', valign: 'middle',
    charSpacing: 4, margin: 0,
  });

  T.pageNumber(slide, 4, 30);
}

module.exports = { createSlide };