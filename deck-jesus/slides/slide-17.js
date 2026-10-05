// 17 Doctrina · Nacido de la Virgen María -- Madre de Dios
const T = require('./theme');

function createSlide(pres, theme) {
  const slide = pres.addSlide();
  T.paintBackground(slide);

  slide.addText('MARÍA, MADRE DE DIOS', {
    x: 0.50, y: 0.55, w: 9.0, h: 0.30,
    fontFace: T.theme.fontMono, fontSize: 9,
    color: T.theme.muted, align: 'center', valign: 'middle',
    charSpacing: 5, margin: 0,
  });

  slide.addText('Nacido de Santa María Virgen', {
    x: 0.50, y: 0.90, w: 9.0, h: 0.65,
    fontFace: T.theme.fontDisplay, fontSize: 32,
    color: T.theme.fg, align: 'center', valign: 'middle',
    margin: 0,
  });

  T.rule(slide, 1.65, { w: 1.5 });

  slide.addText('«Quien llama a María Madre de Dios confiesa con ello que su hijo Jesús es Dios.»', {
    x: 0.80, y: 1.95, w: 8.4, h: 0.85,
    fontFace: T.theme.fontBody, italic: true,
    fontSize: 18, color: T.theme.fg, align: 'center', valign: 'middle',
    margin: 0,
  });

  slide.addText('YOUCAT 82', {
    x: 0.50, y: 2.85, w: 9.0, h: 0.25,
    fontFace: T.theme.fontMono, fontSize: 9,
    color: T.theme.muted, align: 'center', valign: 'middle',
    charSpacing: 3, margin: 0,
  });

  // Two columns
  slide.addText('María, la Madre', {
    x: 0.50, y: 3.25, w: 4.25, h: 0.40,
    fontFace: T.theme.fontDisplay, fontSize: 18,
    color: T.theme.gold, align: 'center', valign: 'middle',
    margin: 0,
  });
  slide.addText('«El Hijo del Altísimo será llamado santo, llamado Hijo de Dios» (Lc 1, 35). Por su maternidad divina, María es verdaderamente Madre de Dios (Theotokos).', {
    x: 0.40, y: 3.65, w: 4.45, h: 1.30,
    fontFace: T.theme.fontBody, fontSize: 13,
    color: T.theme.fg, align: 'center', valign: 'middle',
    margin: 0,
  });

  slide.addText('María, nuestra madre', {
    x: 5.25, y: 3.25, w: 4.25, h: 0.40,
    fontFace: T.theme.fontDisplay, fontSize: 18,
    color: T.theme.gold, align: 'center', valign: 'middle',
    margin: 0,
  });
  slide.addText('«Mujer, ahí tienes a tu hijo [...]. Ahí tienes a tu madre» (Jn 19, 26-27). Cristo nos la dio como madre en la persona del discípulo amado.', {
    x: 5.15, y: 3.65, w: 4.45, h: 1.30,
    fontFace: T.theme.fontBody, fontSize: 13,
    color: T.theme.fg, align: 'center', valign: 'middle',
    margin: 0,
  });

  slide.addText('CEC 487-511 · YOUCAT 80-85', {
    x: 0.50, y: 5.10, w: 9.0, h: 0.25,
    fontFace: T.theme.fontMono, fontSize: 10,
    color: T.theme.muted, align: 'center', valign: 'middle',
    charSpacing: 4, margin: 0,
  });

  T.pageNumber(slide, 17, 30);
}

module.exports = { createSlide };