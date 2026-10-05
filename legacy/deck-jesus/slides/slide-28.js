// 28 Doctrina · Desde allí ha de venir a juzgar
const T = require('./theme');

function createSlide(pres, theme) {
  const slide = pres.addSlide();
  T.paintBackground(slide);

  slide.addText('LA PARUSÍA -- ARTÍCULO 7', {
    x: 0.50, y: 0.55, w: 9.0, h: 0.30,
    fontFace: T.theme.fontMono, fontSize: 9,
    color: T.theme.muted, align: 'center', valign: 'middle',
    charSpacing: 5, margin: 0,
  });

  slide.addText('Desde allí ha de venir a juzgar', {
    x: 0.50, y: 0.90, w: 9.0, h: 0.65,
    fontFace: T.theme.fontDisplay, fontSize: 30,
    color: T.theme.fg, align: 'center', valign: 'middle',
    margin: 0,
  });

  slide.addText('a los vivos y a los muertos', {
    x: 0.50, y: 1.55, w: 9.0, h: 0.45,
    fontFace: T.theme.fontDisplay, italic: true,
    fontSize: 18, color: T.theme.accent, align: 'center', valign: 'middle',
    margin: 0,
  });

  
  // Glyph: flame -- centred at top
  T.glyph(slide, 'flame', 5.0, 0.2, 0.35, T.theme.gold);
  T.rule(slide, 2.15, { w: 1.2 });


  // Lead passage
  slide.addText('«Jesucristo es Señor del mundo y Señor de la historia porque todo fue creado para él. Todos los hombres han sido salvados por él y serán juzgados por él.»', {
    x: 0.80, y: 2.40, w: 8.4, h: 1.30,
    fontFace: T.theme.fontDisplay, italic: true,
    fontSize: 16, color: T.theme.fg, align: 'center', valign: 'middle',
    margin: 0,
  });

  slide.addText('YOUCAT 110', {
    x: 0.50, y: 3.75, w: 9.0, h: 0.25,
    fontFace: T.theme.fontMono, fontSize: 9,
    color: T.theme.muted, align: 'center', valign: 'middle',
    charSpacing: 3, margin: 0,
  });

  // Two-column
  slide.addText('¿Qué cambiará?', {
    x: 0.50, y: 4.10, w: 4.25, h: 0.40,
    fontFace: T.theme.fontDisplay, fontSize: 16,
    color: T.theme.gold, align: 'center', valign: 'middle',
    margin: 0,
  });
  slide.addText('«Habrá un cielo nuevo y una tierra nueva. Enjugará toda lágrima de sus ojos, y ya no habrá muerte, ni duelo, ni llanto, ni dolor» (Ap 21, 1.4).', {
    x: 0.40, y: 4.50, w: 4.45, h: 0.65,
    fontFace: T.theme.fontBody, fontSize: 12,
    color: T.theme.fg, align: 'center', valign: 'middle',
    margin: 0,
  });

  slide.addText('¿Qué juicio?', {
    x: 5.25, y: 4.10, w: 4.25, h: 0.40,
    fontFace: T.theme.fontDisplay, fontSize: 16,
    color: T.theme.gold, align: 'center', valign: 'middle',
    margin: 0,
  });
  slide.addText('«Quien no quiere saber nada del amor, no le puede ayudar Cristo; se juzga a sí mismo» (YOUCAT 112).', {
    x: 5.15, y: 4.50, w: 4.45, h: 0.65,
    fontFace: T.theme.fontBody, fontSize: 12,
    color: T.theme.fg, align: 'center', valign: 'middle',
    margin: 0,
  });

  slide.addText('CEC 668-682 · YOUCAT 110-112', {
    x: 0.50, y: 5.10, w: 9.0, h: 0.25,
    fontFace: T.theme.fontMono, fontSize: 10,
    color: T.theme.muted, align: 'center', valign: 'middle',
    charSpacing: 4, margin: 0,
  });

  T.pageNumber(slide, 28, 30);
}

module.exports = { createSlide };