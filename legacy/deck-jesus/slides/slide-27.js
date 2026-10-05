// 27 Doctrina · Sentado a la derecha del Padre — full-bleed image + parchment panel
const T = require('./theme');

function createSlide(pres, theme) {
  const slide = pres.addSlide();
  T.paintBackground(slide);

  // Full-bleed image on right -- natural aspect ratio (1.79)
  slide.addImage({
    path: 'img/s27-christ-majesty.jpg',
    x: 5.60, y: 1.60, w: 4.30, h: 2.40,
  });

  // Parchment panel covering left ~55%
  slide.addShape('rect', {
    x: 0.00, y: 0.00, w: 5.50, h: 5.625,
    fill: { color: T.theme.bg },
    line: { type: 'none' },
  });

  slide.addText('LA EXALTACIÓN', {
    x: 0.40, y: 0.55, w: 5.10, h: 0.30,
    fontFace: T.theme.fontMono, fontSize: 9,
    color: T.theme.muted, align: 'center', valign: 'middle',
    charSpacing: 5, margin: 0,
  });

  slide.addText('Sentado a la derecha', {
    x: 0.40, y: 0.90, w: 5.10, h: 0.55,
    fontFace: T.theme.fontDisplay, fontSize: 26,
    color: T.theme.fg, align: 'center', valign: 'middle',
    margin: 0,
  });

  slide.addText('y Juez del universo', {
    x: 0.40, y: 1.45, w: 5.10, h: 0.40,
    fontFace: T.theme.fontDisplay, italic: true,
    fontSize: 18, color: T.theme.accent, align: 'center', valign: 'middle',
    margin: 0,
  });

  slide.addText('«Siéntate a mi derecha, hasta que yo ponga a tus enemigos por escabel de tus pies» (Sal 109, 1).', {
    x: 0.30, y: 1.95, w: 5.20, h: 1.10,
    fontFace: T.theme.fontBody, italic: true,
    fontSize: 13, color: T.theme.fg, align: 'center', valign: 'middle',
    margin: 0,
  });

  // Two-column: Sentado / Juez (left half)
  slide.addText('Sentado a la derecha', {
    x: 0.30, y: 3.20, w: 2.50, h: 0.35,
    fontFace: T.theme.fontDisplay, fontSize: 14,
    color: T.theme.gold, align: 'center', valign: 'middle',
    margin: 0,
  });
  slide.addText('«Señorear» significa reinar. Inauguración del Reino: el poder soberano del Resucitado.', {
    x: 0.20, y: 3.55, w: 2.70, h: 1.20,
    fontFace: T.theme.fontBody, fontSize: 10,
    color: T.theme.fg, align: 'center', valign: 'middle',
    margin: 0,
  });

  slide.addText('Juez del universo', {
    x: 2.85, y: 3.20, w: 2.50, h: 0.35,
    fontFace: T.theme.fontDisplay, fontSize: 14,
    color: T.theme.gold, align: 'center', valign: 'middle',
    margin: 0,
  });
  slide.addText('«Cristo glorioso revelará la disposición secreta de los corazones y dará a cada uno según sus obras» (CEC 682).', {
    x: 2.75, y: 3.55, w: 2.70, h: 1.20,
    fontFace: T.theme.fontBody, fontSize: 10,
    color: T.theme.fg, align: 'center', valign: 'middle',
    margin: 0,
  });

  slide.addText('CEC 663-667, 668-682', {
    x: 0.50, y: 5.10, w: 5.0, h: 0.25,
    fontFace: T.theme.fontMono, fontSize: 10,
    color: T.theme.muted, align: 'center', valign: 'middle',
    charSpacing: 4, margin: 0,
  });

  T.pageNumber(slide, 27, 30);
}

module.exports = { createSlide };