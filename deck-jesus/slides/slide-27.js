// 27 Doctrina · Sentado a la derecha del Padre -- Juez del universo
const T = require('./theme');

function createSlide(pres, theme) {
  const slide = pres.addSlide();
  T.paintBackground(slide);

  slide.addText('LA EXALTACIÓN', {
    x: 0.50, y: 0.55, w: 9.0, h: 0.30,
    fontFace: T.theme.fontMono, fontSize: 9,
    color: T.theme.muted, align: 'center', valign: 'middle',
    charSpacing: 5, margin: 0,
  });

  slide.addText('Sentado a la derecha del Padre', {
    x: 0.50, y: 0.90, w: 9.0, h: 0.65,
    fontFace: T.theme.fontDisplay, fontSize: 32,
    color: T.theme.fg, align: 'center', valign: 'middle',
    margin: 0,
  });

  slide.addText('y Juez del universo', {
    x: 0.50, y: 1.55, w: 9.0, h: 0.45,
    fontFace: T.theme.fontDisplay, italic: true,
    fontSize: 20, color: T.theme.accent, align: 'center', valign: 'middle',
    margin: 0,
  });

  T.rule(slide, 2.15, { w: 1.2 });

  slide.addText('«El Señor me dijo: Siéntate a mi derecha, hasta que yo ponga a tus enemigos por escabel de tus pies» (Sal 109, 1).', {
    x: 0.80, y: 2.45, w: 8.4, h: 1.20,
    fontFace: T.theme.fontBody, italic: true,
    fontSize: 16, color: T.theme.fg, align: 'center', valign: 'middle',
    margin: 0,
  });

  // Two-column: Sentado / Juez
  slide.addText('Sentado a la derecha', {
    x: 0.50, y: 3.75, w: 4.25, h: 0.40,
    fontFace: T.theme.fontDisplay, fontSize: 16,
    color: T.theme.gold, align: 'center', valign: 'middle',
    margin: 0,
  });
  slide.addText('«Señorear» significa reinar. La sesión a la derecha del Padre significa la inauguración del Reino: el poder soberano del Resucitado.', {
    x: 0.40, y: 4.15, w: 4.45, h: 0.85,
    fontFace: T.theme.fontBody, fontSize: 12,
    color: T.theme.fg, align: 'center', valign: 'middle',
    margin: 0,
  });

  slide.addText('Juez del universo', {
    x: 5.25, y: 3.75, w: 4.25, h: 0.40,
    fontFace: T.theme.fontDisplay, fontSize: 16,
    color: T.theme.gold, align: 'center', valign: 'middle',
    margin: 0,
  });
  slide.addText('«Cristo glorioso ha de revelar la disposición secreta de los corazones y dará a cada uno según sus obras» (CEC 682).', {
    x: 5.15, y: 4.15, w: 4.45, h: 0.85,
    fontFace: T.theme.fontBody, fontSize: 12,
    color: T.theme.fg, align: 'center', valign: 'middle',
    margin: 0,
  });

  slide.addText('CEC 663-667, 668-682', {
    x: 0.50, y: 5.10, w: 9.0, h: 0.25,
    fontFace: T.theme.fontMono, fontSize: 10,
    color: T.theme.muted, align: 'center', valign: 'middle',
    charSpacing: 4, margin: 0,
  });

  T.pageNumber(slide, 27, 30);
}

module.exports = { createSlide };