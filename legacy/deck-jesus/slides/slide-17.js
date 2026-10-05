// 17 Doctrina · María, Madre de Dios — full-bleed image on right + parchment panel
const T = require('./theme');

function createSlide(pres, theme) {
  const slide = pres.addSlide();
  T.paintBackground(slide);

  // Full-bleed image on right -- natural aspect ratio (square 2048x2048)
  slide.addImage({
    path: 'img/s17-theotokos.jpg',
    x: 5.55, y: 0.55, w: 4.10, h: 4.10,
  });

  // Parchment panel covering left ~55%
  slide.addShape('rect', {
    x: 0.00, y: 0.00, w: 5.50, h: 5.625,
    fill: { color: T.theme.bg },
    line: { type: 'none' },
  });

  slide.addText('MARÍA, MADRE DE DIOS', {
    x: 0.40, y: 0.55, w: 5.10, h: 0.30,
    fontFace: T.theme.fontMono, fontSize: 9,
    color: T.theme.muted, align: 'center', valign: 'middle',
    charSpacing: 5, margin: 0,
  });

  slide.addText('Nacido de Santa María Virgen', {
    x: 0.40, y: 0.90, w: 5.10, h: 0.65,
    fontFace: T.theme.fontDisplay, fontSize: 26,
    color: T.theme.fg, align: 'center', valign: 'middle',
    margin: 0,
  });

  T.rule(slide, 1.65, { w: 1.2, x: 2.20 });

  slide.addText('«Quien llama a María Madre de Dios confiesa con ello que su hijo Jesús es Dios.»', {
    x: 0.40, y: 1.95, w: 5.10, h: 0.85,
    fontFace: T.theme.fontBody, italic: true,
    fontSize: 14, color: T.theme.fg, align: 'center', valign: 'middle',
    margin: 0,
  });

  slide.addText('YOUCAT 82', {
    x: 0.40, y: 2.85, w: 5.10, h: 0.25,
    fontFace: T.theme.fontMono, fontSize: 9,
    color: T.theme.muted, align: 'center', valign: 'middle',
    charSpacing: 3, margin: 0,
  });

  // Two columns (left half only)
  slide.addText('María, la Madre', {
    x: 0.30, y: 3.25, w: 2.50, h: 0.40,
    fontFace: T.theme.fontDisplay, fontSize: 16,
    color: T.theme.gold, align: 'center', valign: 'middle',
    margin: 0,
  });
  slide.addText('«El Hijo del Altísimo será llamado santo, llamado Hijo de Dios» (Lc 1, 35). Por su maternidad divina, María es verdaderamente Madre de Dios.', {
    x: 0.20, y: 3.65, w: 2.70, h: 1.30,
    fontFace: T.theme.fontBody, fontSize: 11,
    color: T.theme.fg, align: 'center', valign: 'middle',
    margin: 0,
  });

  slide.addText('María, nuestra madre', {
    x: 2.85, y: 3.25, w: 2.50, h: 0.40,
    fontFace: T.theme.fontDisplay, fontSize: 16,
    color: T.theme.gold, align: 'center', valign: 'middle',
    margin: 0,
  });
  slide.addText('«Mujer, ahí tienes a tu hijo [...]. Ahí tienes a tu madre» (Jn 19, 26-27). Cristo nos la dio como madre.', {
    x: 2.75, y: 3.65, w: 2.70, h: 1.30,
    fontFace: T.theme.fontBody, fontSize: 11,
    color: T.theme.fg, align: 'center', valign: 'middle',
    margin: 0,
  });

  slide.addText('CEC 487-511 · YOUCAT 80-85', {
    x: 0.50, y: 5.10, w: 5.0, h: 0.25,
    fontFace: T.theme.fontMono, fontSize: 10,
    color: T.theme.muted, align: 'center', valign: 'middle',
    charSpacing: 4, margin: 0,
  });

  T.pageNumber(slide, 17, 30);
}

module.exports = { createSlide };