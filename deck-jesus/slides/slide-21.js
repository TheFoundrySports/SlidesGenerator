// 21 Doctrina · Padeció bajo Poncio Pilato -- Crucificado
const T = require('./theme');

function createSlide(pres, theme) {
  const slide = pres.addSlide();
  T.paintBackground(slide);

  slide.addText('LA PASIÓN -- ARTÍCULO 4', {
    x: 0.50, y: 0.55, w: 9.0, h: 0.30,
    fontFace: T.theme.fontMono, fontSize: 9,
    color: T.theme.muted, align: 'center', valign: 'middle',
    charSpacing: 5, margin: 0,
  });

  slide.addText('Padeció bajo Poncio Pilato', {
    x: 0.50, y: 0.90, w: 9.0, h: 0.65,
    fontFace: T.theme.fontDisplay, fontSize: 34,
    color: T.theme.fg, align: 'center', valign: 'middle',
    margin: 0,
  });

  slide.addText('fue crucificado, muerto y sepultado', {
    x: 0.50, y: 1.55, w: 9.0, h: 0.45,
    fontFace: T.theme.fontDisplay, italic: true,
    fontSize: 20, color: T.theme.accent, align: 'center', valign: 'middle',
    margin: 0,
  });

  T.rule(slide, 2.15, { w: 1.2 });

  slide.addText('«Jesús fue entregado conforme al plan que Dios tenía establecido y previsto» (Hch 2, 23). La pasión no acontece por desgraciadas circunstancias externas, sino por el designio eterno de salvación.', {
    x: 0.80, y: 2.45, w: 8.4, h: 1.20,
    fontFace: T.theme.fontBody, italic: true,
    fontSize: 15, color: T.theme.fg, align: 'center', valign: 'middle',
    margin: 0,
  });

  // Three vertical doctrine points
  const items = [
    { tag: 'Histórico',   text: 'Jesús fue condenado a muerte bajo el procurador romano Poncio Pilato, durante el reinado del emperador Tiberio.' },
    { tag: 'Libre',       text: 'Jesús aceptó libremente la pasión: «Nadie me quita la vida, sino que yo la doy de mí mismo» (Jn 10, 18).' },
    { tag: 'Redentor',    text: '«El Hijo del hombre no ha venido a ser servido, sino a servir y a dar su vida como rescate por muchos» (Mt 20, 28).' },
  ];
  items.forEach((p, i) => {
    const y = 3.75 + i * 0.42;
    slide.addText(p.tag, {
      x: 0.65, y, w: 2.10, h: 0.38,
      fontFace: T.theme.fontDisplay, fontSize: 14,
      color: T.theme.gold, align: 'left', valign: 'middle',
      margin: 0,
    });
    slide.addText(p.text, {
      x: 2.85, y, w: 6.55, h: 0.38,
      fontFace: T.theme.fontBody, fontSize: 12,
      color: T.theme.fg, align: 'left', valign: 'middle',
      margin: 0,
    });
  });

  slide.addText('CEC 595-623 · YOUCAT 96', {
    x: 0.50, y: 5.10, w: 9.0, h: 0.25,
    fontFace: T.theme.fontMono, fontSize: 10,
    color: T.theme.muted, align: 'center', valign: 'middle',
    charSpacing: 4, margin: 0,
  });

  T.pageNumber(slide, 21, 30);
}

module.exports = { createSlide };