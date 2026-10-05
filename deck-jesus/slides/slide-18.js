// 18 Reflexión · Los treinta años ocultos
const T = require('./theme');

function createSlide(pres, theme) {
  const slide = pres.addSlide();
  T.paintBackground(slide);

  // Single ornament
  T.ornament(slide, 5.0, 1.30, { kind: 'ichthys', size: 0.55 });

  // Tag
  slide.addText('REFLEXIÓN', {
    x: 0.50, y: 2.05, w: 9.0, h: 0.30,
    fontFace: T.theme.fontMono, fontSize: 10,
    color: T.theme.muted, align: 'center', valign: 'middle',
    charSpacing: 6, margin: 0,
  });

  // Title
  slide.addText('Los treinta años ocultos', {
    x: 0.50, y: 2.35, w: 9.0, h: 0.65,
    fontFace: T.theme.fontDisplay, fontSize: 32,
    color: T.theme.fg, align: 'center', valign: 'middle',
    margin: 0,
  });

  T.rule(slide, 3.10, { w: 1.2 });

  // The reflection (display-italic, centered)
  slide.addText('«Jesús quería compartir con nosotros su vida y santificar con ello nuestra vida cotidiana: el trabajo, la familia, el silencio de Nazaret, las comidas, las oraciones del sábado.»', {
    x: 1.00, y: 3.35, w: 8.0, h: 1.30,
    fontFace: T.theme.fontDisplay, italic: true,
    fontSize: 18, color: T.theme.fg, align: 'center', valign: 'middle',
    margin: 0,
  });

  // Attribution
  slide.addText('-- YOUCAT 86', {
    x: 0.50, y: 4.65, w: 9.0, h: 0.30,
    fontFace: T.theme.fontMono, fontSize: 10,
    color: T.theme.muted, align: 'center', valign: 'middle',
    charSpacing: 3, margin: 0,
  });

  T.pageNumber(slide, 18, 30);
}

module.exports = { createSlide };