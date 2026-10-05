// 09 Doctrina · «Hijo único de Dios»
const T = require('./theme');

function createSlide(pres, theme) {
  const slide = pres.addSlide();
  T.paintBackground(slide);

  slide.addText('LA RELACIÓN ÚNICA Y ETERNA', {
    x: 0.50, y: 0.55, w: 9.0, h: 0.30,
    fontFace: T.theme.fontMono, fontSize: 9,
    color: T.theme.muted, align: 'center', valign: 'middle',
    charSpacing: 5, margin: 0,
  });

  slide.addText('Hijo único de Dios', {
    x: 0.50, y: 0.90, w: 9.0, h: 0.85,
    fontFace: T.theme.fontDisplay, fontSize: 38,
    color: T.theme.fg, align: 'center', valign: 'middle',
    margin: 0,
  });

  T.rule(slide, 1.85, { w: 1.5 });

  // Lead passage (italic)
  slide.addText('«Los evangelios narran en dos momentos solemnes, el Bautismo y la Transfiguración de Cristo, que la voz del Padre lo designa como su "Hijo amado" (Mt 3, 17; 17, 5).»', {
    x: 0.90, y: 2.15, w: 8.2, h: 1.20,
    fontFace: T.theme.fontBody, italic: true,
    fontSize: 16, color: T.theme.fg, align: 'center', valign: 'middle',
    margin: 0,
  });

  slide.addText('CEC 444', {
    x: 0.50, y: 3.40, w: 9.0, h: 0.25,
    fontFace: T.theme.fontMono, fontSize: 9,
    color: T.theme.muted, align: 'center', valign: 'middle',
    charSpacing: 3, margin: 0,
  });

  // Two-column: Lo que implica
  slide.addText('Lo que confiesa la Iglesia', {
    x: 0.80, y: 3.85, w: 4.0, h: 0.35,
    fontFace: T.theme.fontDisplay, fontSize: 16,
    color: T.theme.gold, align: 'center', valign: 'middle',
    margin: 0,
  });
  slide.addText('Jesucristo es el Hijo único del Padre (Jn 1, 14. 18; 3, 16. 18) y Él mismo es Dios (Jn 1, 1). Para ser cristiano es necesario creer que Jesucristo es el Hijo de Dios.', {
    x: 0.70, y: 4.20, w: 4.2, h: 0.85,
    fontFace: T.theme.fontBody, fontSize: 12,
    color: T.theme.fg, align: 'center', valign: 'middle',
    margin: 0,
  });

  slide.addText('Lo que implica para nosotros', {
    x: 5.20, y: 3.85, w: 4.0, h: 0.35,
    fontFace: T.theme.fontDisplay, fontSize: 16,
    color: T.theme.gold, align: 'center', valign: 'middle',
    margin: 0,
  });
  slide.addText('«Constituido Hijo de Dios con poder, según el Espíritu de santidad, por su Resurrección de entre los muertos» (Rm 1, 4). Su filiación divina se manifiesta en el poder de su humanidad glorificada.', {
    x: 5.10, y: 4.20, w: 4.2, h: 0.85,
    fontFace: T.theme.fontBody, fontSize: 12,
    color: T.theme.fg, align: 'center', valign: 'middle',
    margin: 0,
  });

  slide.addText('CEC 441-445 · YOUCAT 74', {
    x: 0.50, y: 5.10, w: 9.0, h: 0.25,
    fontFace: T.theme.fontMono, fontSize: 10,
    color: T.theme.muted, align: 'center', valign: 'middle',
    charSpacing: 4, margin: 0,
  });

  T.pageNumber(slide, 9, 30);
}

module.exports = { createSlide };