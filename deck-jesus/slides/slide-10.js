// 10 Doctrina · «Señor» -- Kyrios
const T = require('./theme');

function createSlide(pres, theme) {
  const slide = pres.addSlide();
  T.paintBackground(slide);

  slide.addText('LA SOBERANÍA DIVINA', {
    x: 0.50, y: 0.55, w: 9.0, h: 0.30,
    fontFace: T.theme.fontMono, fontSize: 9,
    color: T.theme.muted, align: 'center', valign: 'middle',
    charSpacing: 5, margin: 0,
  });

  slide.addText('Señor', {
    x: 0.50, y: 0.90, w: 9.0, h: 0.95,
    fontFace: T.theme.fontDisplay, fontSize: 60,
    color: T.theme.fg, align: 'center', valign: 'middle',
    charSpacing: -0.5, margin: 0,
  });

  slide.addText('Kyrios', {
    x: 0.50, y: 1.90, w: 9.0, h: 0.45,
    fontFace: T.theme.fontDisplay, italic: true,
    fontSize: 22, color: T.theme.accent, align: 'center', valign: 'middle',
    margin: 0,
  });

  T.rule(slide, 2.50, { w: 1.2 });

  slide.addText('«Nadie puede decir: "¡Jesús es Señor!" sino por influjo del Espíritu Santo» (1 Co 12, 3).', {
    x: 0.80, y: 2.75, w: 8.4, h: 0.65,
    fontFace: T.theme.fontBody, italic: true,
    fontSize: 16, color: T.theme.fg, align: 'center', valign: 'middle',
    margin: 0,
  });

  // Three vertical doctrine points
  const items = [
    { tag: 'I.',   text: 'En la traducción griega del Antiguo Testamento, el nombre inefable YHWH se traduce por Kyrios, «Señor».' },
    { tag: 'II.',  text: 'El Nuevo Testamento aplica a Jesús este título divino: el mismo Jesús se atribuye explícitamente el título ante los Apóstoles (Jn 13, 13).' },
    { tag: 'III.', text: '«El hombre no debe someter su libertad, de modo absoluto, a ningún poder terrenal sino sólo a Dios Padre y al Señor Jesucristo» (CEC 450).' },
  ];
  items.forEach((p, i) => {
    const y = 3.65 + i * 0.45;
    slide.addText(p.tag, {
      x: 0.65, y, w: 0.45, h: 0.40,
      fontFace: T.theme.fontMono, fontSize: 11,
      color: T.theme.gold, align: 'left', valign: 'middle',
      margin: 0,
    });
    slide.addText(p.text, {
      x: 1.15, y, w: 8.25, h: 0.40,
      fontFace: T.theme.fontBody, fontSize: 12,
      color: T.theme.fg, align: 'left', valign: 'middle',
      margin: 0,
    });
  });

  slide.addText('CEC 446-451 · YOUCAT 75', {
    x: 0.50, y: 5.10, w: 9.0, h: 0.25,
    fontFace: T.theme.fontMono, fontSize: 10,
    color: T.theme.muted, align: 'center', valign: 'middle',
    charSpacing: 4, margin: 0,
  });

  T.pageNumber(slide, 10, 30);
}

module.exports = { createSlide };