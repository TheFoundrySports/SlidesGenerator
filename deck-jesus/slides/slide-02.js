// 02 Cita bíblica · Scripture «Mt 16, 16»
const T = require('./theme');

function createSlide(pres, theme) {
  const slide = pres.addSlide();
  T.paintBackground(slide);

  // Top reference
  slide.addText('Mateo 16, 16', {
    x: 0.50, y: 0.85, w: 9.0, h: 0.40,
    fontFace: T.theme.fontMono, fontSize: 12,
    color: T.theme.muted, align: 'center', valign: 'middle',
    charSpacing: 4, margin: 0,
  });

  // Tiny ornament
  T.ornament(slide, 5.0, 1.55, { kind: 'cross', size: 0.40 });

  // The passage (italic, centered, large)
  slide.addText('«Tú eres el Cristo, el Hijo de Dios vivo.»', {
    x: 0.80, y: 2.10, w: 8.4, h: 1.40,
    fontFace: T.theme.fontDisplay, italic: true,
    fontSize: 40, color: T.theme.fg, align: 'center', valign: 'middle',
    charSpacing: -0.5, margin: 0,
  });

  // Italic attribution / commentary
  slide.addText('Sobre la roca de esta fe, confesada por Pedro, Cristo ha construido su Iglesia.', {
    x: 1.20, y: 3.65, w: 7.6, h: 0.65,
    fontFace: T.theme.fontBody, italic: true,
    fontSize: 16, color: T.theme.muted, align: 'center', valign: 'middle',
    margin: 0,
  });

  // Citation footer (mono small caps)
  slide.addText('Mt 16, 16 · CEC 424', {
    x: 0.50, y: 4.55, w: 9.0, h: 0.30,
    fontFace: T.theme.fontMono, fontSize: 10,
    color: T.theme.muted, align: 'center', valign: 'middle',
    charSpacing: 3, margin: 0,
  });

  T.pageNumber(slide, 2, 30);
}

module.exports = { createSlide };