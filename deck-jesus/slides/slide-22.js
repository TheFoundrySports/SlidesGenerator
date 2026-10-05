// 22 Doctrina · Muerto y sepultado -- La Cruz
const T = require('./theme');

function createSlide(pres, theme) {
  const slide = pres.addSlide();
  T.paintBackground(slide);

  slide.addText('EL LUGAR DE LA MAXIMA HUMILLACION', {
    x: 0.50, y: 0.55, w: 9.0, h: 0.30,
    fontFace: T.theme.fontMono, fontSize: 9,
    color: T.theme.muted, align: 'center', valign: 'middle',
    charSpacing: 5, margin: 0,
  });

  slide.addText('La Cruz', {
    x: 0.50, y: 0.90, w: 9.0, h: 0.75,
    fontFace: T.theme.fontDisplay, fontSize: 44,
    color: T.theme.fg, align: 'center', valign: 'middle',
    margin: 0,
  });

  T.rule(slide, 1.75, { w: 1.2 });

  // Lead quote
  slide.addText('«La Cruz, en la que Jesús inocente fue ajusticiado cruelmente, es el lugar de la máxima humillación y abandono. Cristo, nuestro Redentor, eligió la Cruz para cargar con la culpa del mundo.»', {
    x: 0.80, y: 2.05, w: 8.4, h: 1.30,
    fontFace: T.theme.fontDisplay, italic: true,
    fontSize: 17, color: T.theme.fg, align: 'center', valign: 'middle',
    margin: 0,
  });

  slide.addText('YOUCAT 101', {
    x: 0.50, y: 3.40, w: 9.0, h: 0.25,
    fontFace: T.theme.fontMono, fontSize: 9,
    color: T.theme.muted, align: 'center', valign: 'middle',
    charSpacing: 3, margin: 0,
  });

  // Three pillars: Death / Burial / Sacramental memorial
  const items = [
    { tag: 'Muerte real',  ref: 'Jesús murió realmente en la Cruz; su cuerpo fue atravesado y de su costado salió sangre y agua (Jn 19, 34).'},
    { tag: 'Sepultura',    ref: 'José de Arimatea lo envolvió en una sábana y lo puso en un sepulcro nuevo, tallado en la roca (Mt 27, 59-60).'},
    { tag: 'Memorial',     ref: 'En la Última Cena instituyó la Eucaristía, «memorial» de su sacrificio (CEC 610-611).'},
  ];
  items.forEach((p, i) => {
    const y = 3.80 + i * 0.42;
    slide.addText(p.tag, {
      x: 0.65, y, w: 2.20, h: 0.38,
      fontFace: T.theme.fontDisplay, fontSize: 14,
      color: T.theme.gold, align: 'left', valign: 'middle',
      margin: 0,
    });
    slide.addText(p.ref, {
      x: 2.95, y, w: 6.45, h: 0.38,
      fontFace: T.theme.fontBody, fontSize: 12,
      color: T.theme.fg, align: 'left', valign: 'middle',
      margin: 0,
    });
  });

  slide.addText('CEC 619-623, 633 · YOUCAT 101-103', {
    x: 0.50, y: 5.10, w: 9.0, h: 0.25,
    fontFace: T.theme.fontMono, fontSize: 10,
    color: T.theme.muted, align: 'center', valign: 'middle',
    charSpacing: 4, margin: 0,
  });

  T.pageNumber(slide, 22, 30);
}

module.exports = { createSlide };