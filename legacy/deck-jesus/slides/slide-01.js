// 01 Portada · Cover (no image, pure typography + ornament)
const T = require('./theme');

function createSlide(pres, theme) {
  const slide = pres.addSlide();
  T.paintBackground(slide);

  // Soft ornament above title
  T.ornament(slide, 5.0, 1.95, { kind: 'cross', size: 0.7 });

  // Small label
  slide.addText('CURSO DE CATEQUESIS', {
    x: 0.50, y: 0.65, w: 9.0, h: 0.35,
    fontFace: T.theme.fontMono, fontSize: 11,
    color: T.theme.muted, align: 'center', valign: 'middle',
    charSpacing: 6, margin: 0,
  });

  slide.addText('Confirmación de Adultos', {
    x: 0.50, y: 0.95, w: 9.0, h: 0.40,
    fontFace: T.theme.fontDisplay, italic: true,
    fontSize: 16, color: T.theme.muted, align: 'center', valign: 'middle',
    margin: 0,
  });

  // Hero title
  slide.addText('Creo en Jesucristo', {
    x: 0.50, y: 2.55, w: 9.0, h: 0.95,
    fontFace: T.theme.fontDisplay, fontSize: 64,
    color: T.theme.fg, align: 'center', valign: 'middle',
    charSpacing: -1, margin: 0,
  });

  slide.addText('Hijo único de Dios', {
    x: 0.50, y: 3.50, w: 9.0, h: 0.75,
    fontFace: T.theme.fontDisplay, italic: true,
    fontSize: 36, color: T.theme.accent, align: 'center', valign: 'middle',
    margin: 0,
  });

  // Hairline
  T.rule(slide, 4.45, { w: 2.0 });

  // Caption
  slide.addText('Capítulo II de La Profesión de la Fe Cristiana · CCC §§ 422-682', {
    x: 0.50, y: 4.65, w: 9.0, h: 0.35,
    fontFace: T.theme.fontMono, fontSize: 10,
    color: T.theme.muted, align: 'center', valign: 'middle',
    charSpacing: 3, margin: 0,
  });

  // Closing pre-blessing line
  slide.addText('En el nombre del Padre, y del Hijo, y del Espíritu Santo. Amén.', {
    x: 0.50, y: 5.10, w: 9.0, h: 0.40,
    fontFace: T.theme.fontDisplay, italic: true,
    fontSize: 13, color: T.theme.fg, align: 'center', valign: 'middle',
    margin: 0,
  });

  // No page number on cover (per design system)
}

module.exports = { createSlide };