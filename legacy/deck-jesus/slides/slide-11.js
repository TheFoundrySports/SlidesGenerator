// 11 Resumen · Los nombres de Cristo (CCC 452-455)
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

  slide.addText('Los nombres de Cristo', {
    x: 0.50, y: 0.90, w: 9.0, h: 0.65,
    fontFace: T.theme.fontDisplay, fontSize: 36,
    color: T.theme.fg, align: 'center', valign: 'middle',
    margin: 0,
  });

  T.rule(slide, 1.65, { w: 1.5 });

  // 4 names, each with definition
  const names = [
    { name: 'Jesús',   defn: '«Dios salva». El niño nacido de la Virgen María se llama Jesús «porque él salvará a su pueblo de sus pecados» (Mt 1, 21).' },
    { name: 'Cristo',  defn: '«Ungido», «Mesías». Jesús es el Cristo porque «Dios le ungió con el Espíritu Santo y con poder» (Hch 10, 38).' },
    { name: 'Hijo de Dios', defn: 'El Hijo único del Padre y Él mismo es Dios. Para ser cristiano es necesario creer que Jesucristo es el Hijo de Dios.' },
    { name: 'Señor',   defn: '«Señor» significa soberanía divina. Confesar o invocar a Jesús como Señor es creer en su divinidad.' },
  ];
  names.forEach((p, i) => {
    const y = 2.00 + i * 0.72;
    slide.addText(p.name, {
      x: 0.80, y, w: 2.20, h: 0.55,
      fontFace: T.theme.fontDisplay, fontSize: 18,
      color: T.theme.gold, align: 'left', valign: 'middle',
      margin: 0,
    });
    slide.addText(p.defn, {
      x: 3.10, y, w: 6.30, h: 0.65,
      fontFace: T.theme.fontBody, fontSize: 12,
      color: T.theme.fg, align: 'left', valign: 'middle',
      margin: 0,
    });
  });

  slide.addText('CEC 452-455', {
    x: 0.50, y: 5.10, w: 9.0, h: 0.25,
    fontFace: T.theme.fontMono, fontSize: 10,
    color: T.theme.muted, align: 'center', valign: 'middle',
    charSpacing: 4, margin: 0,
  });

  T.pageNumber(slide, 11, 30);
}

module.exports = { createSlide };