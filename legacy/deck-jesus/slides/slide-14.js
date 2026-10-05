// 14 Doctrina · Verdadero Dios y verdadero hombre (Calcedonia)
const T = require('./theme');

function createSlide(pres, theme) {
  const slide = pres.addSlide();
  T.paintBackground(slide);

  slide.addText('LA UNIÓN HIPOSTÁTICA', {
    x: 0.50, y: 0.55, w: 9.0, h: 0.30,
    fontFace: T.theme.fontMono, fontSize: 9,
    color: T.theme.muted, align: 'center', valign: 'middle',
    charSpacing: 5, margin: 0,
  });

  slide.addText('Verdadero Dios y verdadero hombre', {
    x: 0.50, y: 0.90, w: 9.0, h: 0.65,
    fontFace: T.theme.fontDisplay, fontSize: 32,
    color: T.theme.fg, align: 'center', valign: 'middle',
    margin: 0,
  });

  
  // Glyph: chiRho -- centred at top
  T.glyph(slide, 'chiRho', 5.0, 0.2, 0.35, T.theme.gold);
  T.rule(slide, 1.65, { w: 1.5 });


  // Two columns: nature divina / nature humana
  slide.addText('Naturaleza divina', {
    x: 0.50, y: 1.95, w: 4.25, h: 0.40,
    fontFace: T.theme.fontDisplay, fontSize: 18,
    color: T.theme.gold, align: 'center', valign: 'middle',
    margin: 0,
  });
  slide.addText('Jesucristo es la Segunda Persona de la Trinidad. Igual al Padre en cuanto a la divinidad: «En el principio era el Verbo, y el Verbo estaba en Dios, y el Verbo era Dios» (Jn 1, 1).', {
    x: 0.40, y: 2.40, w: 4.45, h: 1.40,
    fontFace: T.theme.fontBody, fontSize: 13,
    color: T.theme.fg, align: 'center', valign: 'middle',
    margin: 0,
  });

  slide.addText('Naturaleza humana', {
    x: 5.25, y: 1.95, w: 4.25, h: 0.40,
    fontFace: T.theme.fontDisplay, fontSize: 18,
    color: T.theme.gold, align: 'center', valign: 'middle',
    margin: 0,
  });
  slide.addText('Jesús «trabajó con manos de hombre, pensó con inteligencia de hombre, obró con voluntad de hombre» (YOUCAT 79). Alma, espíritu y cuerpo como los nuestros.', {
    x: 5.15, y: 2.40, w: 4.45, h: 1.40,
    fontFace: T.theme.fontBody, fontSize: 13,
    color: T.theme.fg, align: 'center', valign: 'middle',
    margin: 0,
  });

  // Definition box (Calcedonia)
  slide.addText('«Dos naturalezas, divina y humana, no confundidas, sino unidas en la única Persona del Hijo de Dios» -- Concilio de Calcedonia, año 451.', {
    x: 0.50, y: 4.00, w: 9.0, h: 0.85,
    fontFace: T.theme.fontDisplay, italic: true,
    fontSize: 14, color: T.theme.fg, align: 'center', valign: 'middle',
    margin: 0,
  });

  slide.addText('CEC 461-469 · YOUCAT 77', {
    x: 0.50, y: 5.10, w: 9.0, h: 0.25,
    fontFace: T.theme.fontMono, fontSize: 10,
    color: T.theme.muted, align: 'center', valign: 'middle',
    charSpacing: 4, margin: 0,
  });

  T.pageNumber(slide, 14, 30);
}

module.exports = { createSlide };