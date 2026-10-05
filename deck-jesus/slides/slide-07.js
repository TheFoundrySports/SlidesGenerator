// 07 Doctrina · «Cristo» -- Ungido, Mesías
const T = require('./theme');

function createSlide(pres, theme) {
  const slide = pres.addSlide();
  T.paintBackground(slide);

  slide.addText('EL NOMBRE DE LA UNCIÓN', {
    x: 0.50, y: 0.55, w: 9.0, h: 0.30,
    fontFace: T.theme.fontMono, fontSize: 9,
    color: T.theme.muted, align: 'center', valign: 'middle',
    charSpacing: 5, margin: 0,
  });

  slide.addText('Cristo', {
    x: 0.50, y: 0.95, w: 9.0, h: 0.95,
    fontFace: T.theme.fontDisplay, fontSize: 60,
    color: T.theme.fg, align: 'center', valign: 'middle',
    charSpacing: -0.5, margin: 0,
  });

  slide.addText('«Ungido» · «Mesías»', {
    x: 0.50, y: 1.95, w: 9.0, h: 0.45,
    fontFace: T.theme.fontDisplay, italic: true,
    fontSize: 22, color: T.theme.accent, align: 'center', valign: 'middle',
    margin: 0,
  });

  T.rule(slide, 2.55, { w: 1.2 });

  slide.addText('Cristo viene de la traducción griega del término hebreo Mashîaj, «ungido». Es nombre propio de Jesús porque Él cumple perfectamente la misión divina que esa palabra significa.', {
    x: 0.90, y: 2.80, w: 8.2, h: 0.95,
    fontFace: T.theme.fontBody, fontSize: 14,
    color: T.theme.fg, align: 'center', valign: 'middle',
    margin: 0,
  });

  // Three offices -- three vertical points
  const offices = [
    { tag: 'Sacerdote', ref: 'ungido para ofrecer el sacrificio de la Alianza (Hb 4, 14).' },
    { tag: 'Profeta',   ref: 'ungido para anunciar la Palabra del Señor (Mt 13, 57).' },
    { tag: 'Rey',       ref: 'ungido para servir y dar su vida en rescate por muchos (Mc 10, 45).' },
  ];
  offices.forEach((p, i) => {
    const y = 3.85 + i * 0.40;
    slide.addText(p.tag, {
      x: 0.65, y, w: 2.40, h: 0.35,
      fontFace: T.theme.fontDisplay, fontSize: 14,
      color: T.theme.gold, align: 'left', valign: 'middle',
      margin: 0,
    });
    slide.addText(p.ref, {
      x: 3.10, y, w: 6.30, h: 0.35,
      fontFace: T.theme.fontBody, fontSize: 12,
      color: T.theme.fg, align: 'left', valign: 'middle',
      margin: 0,
    });
  });

  slide.addText('CEC 436-440 · YOUCAT 73', {
    x: 0.50, y: 5.10, w: 9.0, h: 0.25,
    fontFace: T.theme.fontMono, fontSize: 10,
    color: T.theme.muted, align: 'center', valign: 'middle',
    charSpacing: 4, margin: 0,
  });

  T.pageNumber(slide, 7, 30);
}

module.exports = { createSlide };