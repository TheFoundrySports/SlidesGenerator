// 06 Doctrina · «Jesús» -- Dios salva
const T = require('./theme');

function createSlide(pres, theme) {
  const slide = pres.addSlide();
  T.paintBackground(slide);

  // Eyebrow
  slide.addText('EL NOMBRE QUE LO ES TODO', {
    x: 0.50, y: 0.55, w: 9.0, h: 0.30,
    fontFace: T.theme.fontMono, fontSize: 9,
    color: T.theme.muted, align: 'center', valign: 'middle',
    charSpacing: 5, margin: 0,
  });

  // Big name centered
  slide.addText('Jesús', {
    x: 0.50, y: 0.95, w: 9.0, h: 0.95,
    fontFace: T.theme.fontDisplay, fontSize: 60,
    color: T.theme.fg, align: 'center', valign: 'middle',
    charSpacing: -0.5, margin: 0,
  });

  // Hebrew meaning
  slide.addText('«Dios salva»', {
    x: 0.50, y: 1.95, w: 9.0, h: 0.45,
    fontFace: T.theme.fontDisplay, italic: true,
    fontSize: 22, color: T.theme.accent, align: 'center', valign: 'middle',
    margin: 0,
  });

  T.rule(slide, 2.55, { w: 1.2 });

  // Body -- center block
  slide.addText('En hebreo: Yéhoshúa. En el momento de la Anunciación, el ángel Gabriel le dio como nombre propio el nombre de Jesús, que expresa a la vez su identidad y su misión.', {
    x: 0.90, y: 2.80, w: 8.2, h: 0.95,
    fontFace: T.theme.fontBody, fontSize: 14,
    color: T.theme.fg, align: 'center', valign: 'middle',
    margin: 0,
  });

  // Three-points grid
  const items = [
    { tag: 'I',   text: '«Porque él salvará a su pueblo de sus pecados» (Mt 1, 21).' },
    { tag: 'II',  text: '«No hay bajo el cielo otro nombre dado a los hombres por el que nosotros debamos salvarnos» (Hch 4, 12).' },
    { tag: 'III', text: 'El Nombre de Jesús está en el corazón de la plegaria cristiana: «Señor Jesucristo, Hijo de Dios, ten piedad de mí pecador».' },
  ];
  items.forEach((p, i) => {
    const y = 3.85 + i * 0.40;
    slide.addText(p.tag + '.', {
      x: 0.65, y, w: 0.40, h: 0.35,
      fontFace: T.theme.fontMono, fontSize: 11,
      color: T.theme.gold, align: 'left', valign: 'middle',
      margin: 0,
    });
    slide.addText(p.text, {
      x: 1.10, y, w: 8.30, h: 0.35,
      fontFace: T.theme.fontBody, fontSize: 12,
      color: T.theme.fg, align: 'left', valign: 'middle',
      margin: 0,
    });
  });

  slide.addText('CEC 430-435 · YOUCAT 72', {
    x: 0.50, y: 5.10, w: 9.0, h: 0.25,
    fontFace: T.theme.fontMono, fontSize: 10,
    color: T.theme.muted, align: 'center', valign: 'middle',
    charSpacing: 4, margin: 0,
  });

  T.pageNumber(slide, 6, 30);
}

module.exports = { createSlide };