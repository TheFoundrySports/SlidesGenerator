// 03 Doctrina · La Buena Nueva: Dios ha enviado a su Hijo
const T = require('./theme');

function createSlide(pres, theme) {
  const slide = pres.addSlide();
  T.paintBackground(slide);

  // Section eyebrow
  slide.addText('LA BUENA NUEVA', {
    x: 0.50, y: 0.55, w: 9.0, h: 0.30,
    fontFace: T.theme.fontMono, fontSize: 9,
    color: T.theme.muted, align: 'center', valign: 'middle',
    charSpacing: 5, margin: 0,
  });

  // Title
  slide.addText('Dios ha enviado a su Hijo', {
    x: 0.50, y: 0.90, w: 9.0, h: 0.65,
    fontFace: T.theme.fontDisplay, fontSize: 36,
    color: T.theme.fg, align: 'center', valign: 'middle',
    margin: 0,
  });

  // Hairline
  T.rule(slide, 1.65, { w: 1.5 });

  // Lead paragraph (centered)
  slide.addText('«Pero, al llegar la plenitud de los tiempos, envió Dios a su Hijo, nacido de mujer, nacido bajo la Ley, para rescatar a los que se hallaban bajo la Ley, y para que recibiéramos la filiación adoptiva.»', {
    x: 0.80, y: 1.95, w: 8.4, h: 1.20,
    fontFace: T.theme.fontBody, italic: true,
    fontSize: 16, color: T.theme.fg, align: 'center', valign: 'middle',
    margin: 0,
  });

  slide.addText('Ga 4, 4-5', {
    x: 0.50, y: 3.20, w: 9.0, h: 0.25,
    fontFace: T.theme.fontMono, fontSize: 9,
    color: T.theme.muted, align: 'center', valign: 'middle',
    charSpacing: 3, margin: 0,
  });

  // Two-column body
  // Left: Los Hechos
  slide.addText('Lo que confesamos', {
    x: 0.80, y: 3.65, w: 4.0, h: 0.35,
    fontFace: T.theme.fontDisplay, fontSize: 16,
    color: T.theme.gold, align: 'center', valign: 'middle',
    margin: 0,
  });
  slide.addText('Jesús de Nazaret, judío, nacido en el tiempo del emperador Augusto, muerto crucificado en Jerusalén bajo Poncio Pilato, es el Hijo eterno de Dios hecho hombre.', {
    x: 0.70, y: 4.00, w: 4.2, h: 1.00,
    fontFace: T.theme.fontBody, fontSize: 12,
    color: T.theme.fg, align: 'center', valign: 'middle',
    margin: 0,
  });

  // Right: Lo que ha hecho
  slide.addText('Lo que ha hecho', {
    x: 5.20, y: 3.65, w: 4.0, h: 0.35,
    fontFace: T.theme.fontDisplay, fontSize: 16,
    color: T.theme.gold, align: 'center', valign: 'middle',
    margin: 0,
  });
  slide.addText('«Ha bajado del cielo», «ha venido en carne», la Palabra se hizo carne. La Buena Nueva de un Dios que sale a nuestro encuentro en su Hijo.', {
    x: 5.10, y: 4.00, w: 4.2, h: 1.00,
    fontFace: T.theme.fontBody, fontSize: 12,
    color: T.theme.fg, align: 'center', valign: 'middle',
    margin: 0,
  });

  // CCC reference (bottom-center)
  slide.addText('CEC 422-424', {
    x: 0.50, y: 5.10, w: 9.0, h: 0.25,
    fontFace: T.theme.fontMono, fontSize: 10,
    color: T.theme.muted, align: 'center', valign: 'middle',
    charSpacing: 4, margin: 0,
  });

  T.pageNumber(slide, 3, 30);
}

module.exports = { createSlide };