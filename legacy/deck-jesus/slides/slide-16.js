// 16 Doctrina · Concebido por obra del Espíritu Santo
const T = require('./theme');

function createSlide(pres, theme) {
  const slide = pres.addSlide();
  T.paintBackground(slide);

  slide.addText('LA CONCEPCIÓN VIRGINAL', {
    x: 0.50, y: 0.55, w: 9.0, h: 0.30,
    fontFace: T.theme.fontMono, fontSize: 9,
    color: T.theme.muted, align: 'center', valign: 'middle',
    charSpacing: 5, margin: 0,
  });

  slide.addText('Concebido por obra del Espíritu Santo', {
    x: 0.50, y: 0.90, w: 9.0, h: 0.65,
    fontFace: T.theme.fontDisplay, fontSize: 30,
    color: T.theme.fg, align: 'center', valign: 'middle',
    margin: 0,
  });

  
  // Glyph: dove -- centred at top
  T.glyph(slide, 'dove', 5.0, 0.2, 0.35, T.theme.gold);
  T.rule(slide, 1.65, { w: 1.5 });


  // Lead passage
  slide.addText('«El Espíritu Santo descenderá sobre ti, y el poder del Altísimo te cubrirá con su sombra; por eso el que ha de nacer será santo y será llamado Hijo de Dios» (Lc 1, 35).', {
    x: 0.80, y: 1.95, w: 8.4, h: 1.30,
    fontFace: T.theme.fontBody, italic: true,
    fontSize: 16, color: T.theme.fg, align: 'center', valign: 'middle',
    margin: 0,
  });

  slide.addText('Lc 1, 35', {
    x: 0.50, y: 3.30, w: 9.0, h: 0.25,
    fontFace: T.theme.fontMono, fontSize: 9,
    color: T.theme.muted, align: 'center', valign: 'middle',
    charSpacing: 3, margin: 0,
  });

  // Three vertical points
  const items = [
    { tag: 'I.',   text: 'El Espíritu Santo es quien llamó a la vida humana a Jesús en el seno de la Virgen María.' },
    { tag: 'II.',  text: 'No hay padre humano: «Dios quiso que Jesucristo tuviera una verdadera madre humana, pero sólo a Dios como Padre» (YOUCAT 80).' },
    { tag: 'III.', text: 'La concepción virginal manifiesta que es obra trinitaria: el Padre envía, el Verbo se encarna, el Espíritu Santo consagra.' },
  ];
  items.forEach((p, i) => {
    const y = 3.70 + i * 0.45;
    slide.addText(p.tag, {
      x: 0.65, y, w: 0.45, h: 0.40,
      fontFace: T.theme.fontMono, fontSize: 12,
      color: T.theme.gold, align: 'left', valign: 'middle',
      margin: 0,
    });
    slide.addText(p.text, {
      x: 1.15, y, w: 8.25, h: 0.40,
      fontFace: T.theme.fontBody, fontSize: 12,
      color: T.theme.fg, align: 'left', valign: 'middle',
      margin: 0,
    });
  });

  slide.addText('CEC 484-486 · YOUCAT 80', {
    x: 0.50, y: 5.10, w: 9.0, h: 0.25,
    fontFace: T.theme.fontMono, fontSize: 10,
    color: T.theme.muted, align: 'center', valign: 'middle',
    charSpacing: 4, margin: 0,
  });

  T.pageNumber(slide, 16, 30);
}

module.exports = { createSlide };