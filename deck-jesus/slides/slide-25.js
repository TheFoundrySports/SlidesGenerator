// 25 Doctrina · Al tercer día resucitó de entre los muertos
const T = require('./theme');

function createSlide(pres, theme) {
  const slide = pres.addSlide();
  T.paintBackground(slide);

  slide.addText('LA RESURRECCIÓN', {
    x: 0.50, y: 0.55, w: 9.0, h: 0.30,
    fontFace: T.theme.fontMono, fontSize: 9,
    color: T.theme.muted, align: 'center', valign: 'middle',
    charSpacing: 5, margin: 0,
  });

  slide.addText('Al tercer día, resucitó', {
    x: 0.50, y: 0.90, w: 9.0, h: 0.85,
    fontFace: T.theme.fontDisplay, fontSize: 38,
    color: T.theme.fg, align: 'center', valign: 'middle',
    margin: 0,
  });

  T.rule(slide, 1.85, { w: 1.2 });

  // Lead passage
  slide.addText('«Si Cristo no ha resucitado, vana es nuestra predicación y vana también vuestra fe» (1 Co 15, 14).', {
    x: 0.80, y: 2.10, w: 8.4, h: 0.80,
    fontFace: T.theme.fontBody, italic: true,
    fontSize: 18, color: T.theme.fg, align: 'center', valign: 'middle',
    margin: 0,
  });

  slide.addText('1 Co 15, 14', {
    x: 0.50, y: 2.95, w: 9.0, h: 0.25,
    fontFace: T.theme.fontMono, fontSize: 9,
    color: T.theme.muted, align: 'center', valign: 'middle',
    charSpacing: 3, margin: 0,
  });

  // Three vertical points
  const items = [
    { tag: 'I.',   text: '«El Señor resucitado se dejó tocar por sus discípulos, comió con ellos y les enseñó las heridas de la Pasión» (YOUCAT 107).' },
    { tag: 'II.',  text: 'No es un regreso a la vida terrena, sino un tránsito al estado definitivo de gloria: «un cuerpo espiritual» (1 Co 15, 44).' },
    { tag: 'III.', text: 'La Resurrección es «la verdad culminante de toda la fe cristiana»: confirma la divinidad de Cristo y nuestra propia resurrección futura.' },
  ];
  items.forEach((p, i) => {
    const y = 3.40 + i * 0.55;
    slide.addText(p.tag, {
      x: 0.65, y, w: 0.45, h: 0.50,
      fontFace: T.theme.fontMono, fontSize: 12,
      color: T.theme.gold, align: 'left', valign: 'top',
      margin: 0,
    });
    slide.addText(p.text, {
      x: 1.15, y, w: 8.25, h: 0.50,
      fontFace: T.theme.fontBody, fontSize: 12,
      color: T.theme.fg, align: 'left', valign: 'top',
      margin: 0,
    });
  });

  slide.addText('CEC 638-655 · YOUCAT 104-108', {
    x: 0.50, y: 5.10, w: 9.0, h: 0.25,
    fontFace: T.theme.fontMono, fontSize: 10,
    color: T.theme.muted, align: 'center', valign: 'middle',
    charSpacing: 4, margin: 0,
  });

  T.pageNumber(slide, 25, 30);
}

module.exports = { createSlide };