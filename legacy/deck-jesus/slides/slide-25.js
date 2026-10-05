// 25 Doctrina · Al tercer día resucitó — full-bleed image + parchment panel
const T = require('./theme');

function createSlide(pres, theme) {
  const slide = pres.addSlide();
  T.paintBackground(slide);

  // Full-bleed image on right -- natural aspect ratio (1.79)
  slide.addImage({
    path: 'img/s25-resurrection.jpg',
    x: 5.60, y: 1.60, w: 4.30, h: 2.40,
  });

  // Parchment panel covering left ~55%
  slide.addShape('rect', {
    x: 0.00, y: 0.00, w: 5.50, h: 5.625,
    fill: { color: T.theme.bg },
    line: { type: 'none' },
  });

  slide.addText('LA RESURRECCIÓN', {
    x: 0.40, y: 0.55, w: 5.10, h: 0.30,
    fontFace: T.theme.fontMono, fontSize: 9,
    color: T.theme.muted, align: 'center', valign: 'middle',
    charSpacing: 5, margin: 0,
  });

  slide.addText('Al tercer día, resucitó', {
    x: 0.40, y: 0.90, w: 5.10, h: 0.85,
    fontFace: T.theme.fontDisplay, fontSize: 28,
    color: T.theme.fg, align: 'center', valign: 'middle',
    margin: 0,
  });

  T.rule(slide, 1.85, { w: 1.2, x: 2.20 });

  slide.addText('«Si Cristo no ha resucitado, vana es nuestra predicación y vana también vuestra fe» (1 Co 15, 14).', {
    x: 0.30, y: 2.10, w: 5.20, h: 1.00,
    fontFace: T.theme.fontBody, italic: true,
    fontSize: 13, color: T.theme.fg, align: 'center', valign: 'middle',
    margin: 0,
  });

  slide.addText('1 Co 15, 14', {
    x: 0.30, y: 3.15, w: 5.20, h: 0.25,
    fontFace: T.theme.fontMono, fontSize: 9,
    color: T.theme.muted, align: 'center', valign: 'middle',
    charSpacing: 3, margin: 0,
  });

  // Three vertical points (left half) — aligned
  const items = [
    { tag: 'I.',   text: '«Se dejó tocar, comió con ellos y les enseñó las heridas» (YOUCAT 107).' },
    { tag: 'II.',  text: 'Tránsito al estado definitivo de gloria: «un cuerpo espiritual» (1 Co 15, 44).' },
    { tag: 'III.', text: '«La verdad culminante de toda la fe cristiana»: confirma la divinidad de Cristo.' },
  ];
  items.forEach((p, i) => {
    const y = 3.55 + i * 0.50;
    slide.addText(p.tag, {
      x: 0.40, y, w: 0.55, h: 0.45,
      fontFace: T.theme.fontMono, fontSize: 12,
      color: T.theme.gold, align: 'left', valign: 'top',
      margin: 0,
    });
    slide.addText(p.text, {
      x: 1.00, y, w: 4.40, h: 0.50,
      fontFace: T.theme.fontBody, fontSize: 11,
      color: T.theme.fg, align: 'left', valign: 'top',
      margin: 0,
    });
  });

  slide.addText('CEC 638-655 · YOUCAT 104-108', {
    x: 0.50, y: 5.10, w: 5.0, h: 0.25,
    fontFace: T.theme.fontMono, fontSize: 10,
    color: T.theme.muted, align: 'center', valign: 'middle',
    charSpacing: 4, margin: 0,
  });

  T.pageNumber(slide, 25, 30);
}

module.exports = { createSlide };