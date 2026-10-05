// Compile the 30-slide catechism deck on Chapter II "Jesucristo".
const pptxgen = require('pptxgenjs');
const { theme } = require('./theme');

const pres = new pptxgen();
pres.layout = 'LAYOUT_16x9';
pres.author = 'Curso de Catequesis · Confirmación de Adultos';
pres.title = 'Creo en Jesucristo, Hijo único de Dios · CCC §§ 422–682';

for (let i = 1; i <= 30; i++) {
  const num = String(i).padStart(2, '0');
  const mod = require(`./slide-${num}.js`);
  mod.createSlide(pres, theme);
}

pres.writeFile({ fileName: './output/jesuscristo-capitulo-2.pptx' })
  .then(name => console.log('Wrote:', name));