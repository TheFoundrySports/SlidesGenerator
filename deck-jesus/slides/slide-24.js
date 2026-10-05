// 24 Doctrina · Descendió a los infiernos
const T = require('./theme');

function createSlide(pres, theme) {
  const slide = pres.addSlide();
  T.paintBackground(slide);

  slide.addText('EL DESCENSO A LOS INFIERNOS', {
    x: 0.50, y: 0.55, w: 9.0, h: 0.30,
    fontFace: T.theme.fontMono, fontSize: 9,
    color: T.theme.muted, align: 'center', valign: 'middle',
    charSpacing: 5, margin: 0,
  });

  slide.addText('Descendió a los infiernos', {
    x: 0.50, y: 0.90, w: 9.0, h: 0.65,
    fontFace: T.theme.fontDisplay, fontSize: 34,
    color: T.theme.fg, align: 'center', valign: 'middle',
    margin: 0,
  });

  T.rule(slide, 1.65, { w: 1.2 });

  // Lead passage
  slide.addText('«El evangelio es predicado también a los muertos [...], para que sean juzgados según los hombres en la carne, pero vivan según Dios en el espíritu» (1 P 4, 6).', {
    x: 0.80, y: 1.95, w: 8.4, h: 1.10,
    fontFace: T.theme.fontBody, italic: true,
    fontSize: 16, color: T.theme.fg, align: 'center', valign: 'middle',
    margin: 0,
  });

  slide.addText('1 P 4, 6', {
    x: 0.50, y: 3.10, w: 9.0, h: 0.25,
    fontFace: T.theme.fontMono, fontSize: 9,
    color: T.theme.muted, align: 'center', valign: 'middle',
    charSpacing: 3, margin: 0,
  });

  // Two-column: «Infiernos» / Sentido
  slide.addText('«Infiernos» -- Hades', {
    x: 0.50, y: 3.55, w: 4.25, h: 0.40,
    fontFace: T.theme.fontDisplay, fontSize: 16,
    color: T.theme.gold, align: 'center', valign: 'middle',
    margin: 0,
  });
  slide.addText('No es el infierno de la condenación, sino el «sheol»/hades: el lugar donde aguardan los justos muertos antes de la redención consumada.', {
    x: 0.40, y: 3.95, w: 4.45, h: 1.00,
    fontFace: T.theme.fontBody, fontSize: 12,
    color: T.theme.fg, align: 'center', valign: 'middle',
    margin: 0,
  });

  slide.addText('Sentido del descenso', {
    x: 5.25, y: 3.55, w: 4.25, h: 0.40,
    fontFace: T.theme.fontDisplay, fontSize: 16,
    color: T.theme.gold, align: 'center', valign: 'middle',
    margin: 0,
  });
  slide.addText('Cristo muerto visita a los muertos como Dios victorioso: «Levantándose de los infiernos, el Señor sacó a los cautivos» (CEC 637).', {
    x: 5.15, y: 3.95, w: 4.45, h: 1.00,
    fontFace: T.theme.fontBody, fontSize: 12,
    color: T.theme.fg, align: 'center', valign: 'middle',
    margin: 0,
  });

  slide.addText('CEC 631-637', {
    x: 0.50, y: 5.10, w: 9.0, h: 0.25,
    fontFace: T.theme.fontMono, fontSize: 10,
    color: T.theme.muted, align: 'center', valign: 'middle',
    charSpacing: 4, margin: 0,
  });

  T.pageNumber(slide, 24, 30);
}

module.exports = { createSlide };