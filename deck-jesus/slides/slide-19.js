// 19 Doctrina · Bautismo, tentaciones y transfiguración
const T = require('./theme');

function createSlide(pres, theme) {
  const slide = pres.addSlide();
  T.paintBackground(slide);

  slide.addText('LA VIDA PÚBLICA -- EL COMIENZO', {
    x: 0.50, y: 0.55, w: 9.0, h: 0.30,
    fontFace: T.theme.fontMono, fontSize: 9,
    color: T.theme.muted, align: 'center', valign: 'middle',
    charSpacing: 5, margin: 0,
  });

  slide.addText('Bautismo, tentaciones, transfiguración', {
    x: 0.50, y: 0.90, w: 9.0, h: 0.65,
    fontFace: T.theme.fontDisplay, fontSize: 28,
    color: T.theme.fg, align: 'center', valign: 'middle',
    margin: 0,
  });

  T.rule(slide, 1.65, { w: 1.5 });

  // Three-row layout: icon-free, simple text blocks
  const items = [
    { tag: 'Bautismo',     ref: '«Tú eres mi Hijo amado, en ti tengo mi complacencia» (Mc 1, 11). Jesús se sumerge en la historia de pecado de la humanidad para redimirla.' },
    { tag: 'Tentaciones',  ref: '«A la verdadera humanidad de Jesús pertenece la posibilidad de ser tentado» (YOUCAT 88). Permanece libre frente al mal.' },
    { tag: 'Transfiguración', ref: '«El Padre quería manifestar ya en la vida terrena de Jesús la gloria divina de su Hijo» (YOUCAT 93). La nube y la luz anticipan la Pascua.' },
  ];
  items.forEach((p, i) => {
    const y = 1.95 + i * 1.00;
    slide.addText(p.tag, {
      x: 0.50, y, w: 2.40, h: 0.95,
      fontFace: T.theme.fontDisplay, fontSize: 18,
      color: T.theme.gold, align: 'left', valign: 'top',
      margin: 0,
    });
    slide.addText(p.ref, {
      x: 3.00, y, w: 6.40, h: 0.95,
      fontFace: T.theme.fontBody, fontSize: 13,
      color: T.theme.fg, align: 'left', valign: 'top',
      margin: 0,
    });
  });

  slide.addText('CEC 535-556 · YOUCAT 87, 88, 93', {
    x: 0.50, y: 5.10, w: 9.0, h: 0.25,
    fontFace: T.theme.fontMono, fontSize: 10,
    color: T.theme.muted, align: 'center', valign: 'middle',
    charSpacing: 4, margin: 0,
  });

  T.pageNumber(slide, 19, 30);
}

module.exports = { createSlide };