// 29 Resumen · Lo que confesamos en el Credo
const T = require('./theme');

function createSlide(pres, theme) {
  const slide = pres.addSlide();
  T.paintBackground(slide);

  slide.addText('EN RESUMEN', {
    x: 0.50, y: 0.55, w: 9.0, h: 0.30,
    fontFace: T.theme.fontMono, fontSize: 9,
    color: T.theme.muted, align: 'center', valign: 'middle',
    charSpacing: 5, margin: 0,
  });

  slide.addText('Lo que confesamos en el Credo', {
    x: 0.50, y: 0.90, w: 9.0, h: 0.65,
    fontFace: T.theme.fontDisplay, fontSize: 32,
    color: T.theme.fg, align: 'center', valign: 'middle',
    margin: 0,
  });

  T.rule(slide, 1.65, { w: 1.5 });

  // Six compact numbered takeaways
  const points = [
    { n: '1.', t: 'Creo en Jesucristo, su único Hijo, Nuestro Señor: Dios verdadero y hombre verdadero.' },
    { n: '2.', t: 'Concebido por obra y gracia del Espíritu Santo, nació de Santa María Virgen.' },
    { n: '3.', t: 'Padeció bajo Poncio Pilato, fue crucificado, muerto y sepultado.' },
    { n: '4.', t: 'Descendió a los infiernos; al tercer día resucitó de entre los muertos.' },
    { n: '5.', t: 'Subió a los cielos y está sentado a la derecha de Dios, Padre Todopoderoso.' },
    { n: '6.', t: 'Desde allí ha de venir a juzgar a los vivos y a los muertos.' },
  ];
  points.forEach((p, i) => {
    const y = 1.95 + i * 0.45;
    slide.addText(p.n, {
      x: 0.80, y, w: 0.55, h: 0.40,
      fontFace: T.theme.fontDisplay, fontSize: 18,
      color: T.theme.gold, align: 'left', valign: 'middle',
      margin: 0,
    });
    slide.addText(p.t, {
      x: 1.45, y, w: 7.95, h: 0.40,
      fontFace: T.theme.fontBody, fontSize: 13,
      color: T.theme.fg, align: 'left', valign: 'middle',
      margin: 0,
    });
  });

  slide.addText('CEC 422-682 · YOUCAT 71-112', {
    x: 0.50, y: 5.10, w: 9.0, h: 0.25,
    fontFace: T.theme.fontMono, fontSize: 10,
    color: T.theme.muted, align: 'center', valign: 'middle',
    charSpacing: 4, margin: 0,
  });

  T.pageNumber(slide, 29, 30);
}

module.exports = { createSlide };