// 22 Doctrina · Muerto y sepultado -- La Cruz — full-bleed image + parchment panel
const T = require('./theme');

function createSlide(pres, theme) {
  const slide = pres.addSlide();
  T.paintBackground(slide);

  // Full-bleed image on right -- natural aspect ratio (1.79)
  slide.addImage({
    path: 'img/s22-crucifixion.jpg',
    x: 5.60, y: 1.60, w: 4.30, h: 2.40,
  });

  // Parchment panel covering left ~55%
  slide.addShape('rect', {
    x: 0.00, y: 0.00, w: 5.50, h: 5.625,
    fill: { color: T.theme.bg },
    line: { type: 'none' },
  });

  slide.addText('EL LUGAR DE LA MAXIMA HUMILLACION', {
    x: 0.40, y: 0.55, w: 5.10, h: 0.30,
    fontFace: T.theme.fontMono, fontSize: 9,
    color: T.theme.muted, align: 'center', valign: 'middle',
    charSpacing: 5, margin: 0,
  });

  slide.addText('La Cruz', {
    x: 0.40, y: 0.90, w: 5.10, h: 0.75,
    fontFace: T.theme.fontDisplay, fontSize: 40,
    color: T.theme.fg, align: 'center', valign: 'middle',
    margin: 0,
  });

  T.rule(slide, 1.75, { w: 1.2, x: 2.20 });

  slide.addText('«La Cruz, en la que Jesús inocente fue ajusticiado, es el lugar de la máxima humillación y abandono.»', {
    x: 0.30, y: 2.05, w: 5.20, h: 1.30,
    fontFace: T.theme.fontDisplay, italic: true,
    fontSize: 14, color: T.theme.fg, align: 'center', valign: 'middle',
    margin: 0,
  });

  slide.addText('YOUCAT 101', {
    x: 0.30, y: 3.40, w: 5.20, h: 0.25,
    fontFace: T.theme.fontMono, fontSize: 9,
    color: T.theme.muted, align: 'center', valign: 'middle',
    charSpacing: 3, margin: 0,
  });

  // Three pillars (aligned)
  const items = [
    { tag: 'Muerte real', ref: 'De su costado salió sangre y agua (Jn 19, 34).' },
    { tag: 'Sepultura',   ref: 'José de Arimatea lo puso en un sepulcro nuevo (Mt 27, 59-60).' },
    { tag: 'Memorial',    ref: 'En la Última Cena instituyó la Eucaristía, «memorial» (CEC 610-611).' },
  ];
  items.forEach((p, i) => {
    const y = 3.85 + i * 0.42;
    slide.addText(p.tag, {
      x: 0.40, y, w: 1.50, h: 0.38,
      fontFace: T.theme.fontDisplay, fontSize: 14,
      color: T.theme.gold, align: 'left', valign: 'middle',
      margin: 0,
    });
    slide.addText(p.ref, {
      x: 2.00, y, w: 3.40, h: 0.38,
      fontFace: T.theme.fontBody, fontSize: 11,
      color: T.theme.fg, align: 'left', valign: 'middle',
      margin: 0,
    });
  });

  slide.addText('CEC 619-623, 633 · YOUCAT 101-103', {
    x: 0.50, y: 5.10, w: 5.0, h: 0.25,
    fontFace: T.theme.fontMono, fontSize: 10,
    color: T.theme.muted, align: 'center', valign: 'middle',
    charSpacing: 4, margin: 0,
  });

  T.pageNumber(slide, 22, 30);
}

module.exports = { createSlide };