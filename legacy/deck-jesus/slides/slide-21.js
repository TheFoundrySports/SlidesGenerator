// 21 Doctrina · Padeció bajo Poncio Pilato — full-bleed image + parchment panel
const T = require('./theme');

function createSlide(pres, theme) {
  const slide = pres.addSlide();
  T.paintBackground(slide);

  // Full-bleed image as top background -- natural aspect ratio (1.79)
  slide.addImage({
    path: 'img/s21-crown-thorns.jpg',
    x: 2.20, y: 0.10, w: 5.60, h: 3.13,
  });

  // Parchment panel covering bottom 50%
  slide.addShape('rect', {
    x: 0.00, y: 2.80, w: 10.00, h: 2.825,
    fill: { color: T.theme.bg },
    line: { type: 'none' },
  });

  slide.addText('LA PASIÓN -- ARTÍCULO 4', {
    x: 0.50, y: 2.95, w: 9.0, h: 0.30,
    fontFace: T.theme.fontMono, fontSize: 9,
    color: T.theme.muted, align: 'center', valign: 'middle',
    charSpacing: 5, margin: 0,
  });

  slide.addText('Padeció bajo Poncio Pilato', {
    x: 0.50, y: 3.25, w: 9.0, h: 0.55,
    fontFace: T.theme.fontDisplay, fontSize: 28,
    color: T.theme.fg, align: 'center', valign: 'middle',
    margin: 0,
  });

  slide.addText('fue crucificado, muerto y sepultado', {
    x: 0.50, y: 3.78, w: 9.0, h: 0.35,
    fontFace: T.theme.fontDisplay, italic: true,
    fontSize: 14, color: T.theme.accent, align: 'center', valign: 'middle',
    margin: 0,
  });

  // Three vertical doctrine points (aligned)
  const items = [
    { tag: 'Histórico', text: 'Condenado a muerte bajo el procurador Poncio Pilato, durante el emperador Tiberio.' },
    { tag: 'Libre',     text: '«Nadie me quita la vida, sino que yo la doy de mí mismo» (Jn 10, 18).' },
    { tag: 'Redentor',  text: '«Dar su vida como rescate por muchos» (Mt 20, 28).' },
  ];
  items.forEach((p, i) => {
    const y = 4.30 + i * 0.22;
    slide.addText(p.tag, {
      x: 0.50, y, w: 1.50, h: 0.22,
      fontFace: T.theme.fontDisplay, fontSize: 12,
      color: T.theme.gold, align: 'left', valign: 'middle',
      margin: 0,
    });
    slide.addText(p.text, {
      x: 2.10, y, w: 7.40, h: 0.22,
      fontFace: T.theme.fontBody, fontSize: 10,
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