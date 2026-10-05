#!/usr/bin/env node
// scripts/build-demo-pptx.js
// Generates a sample PPTX with catechetical content for the importer demo.
// Run: node scripts/build-demo-pptx.js
// Output: demo.pptx in the project root (gitignored, intermediate artifact).
//
// After running this, the importer does the rest:
//   node scripts/pptx-to-deck.js demo.pptx demo-deck \
//     --map "1:cover,2:scripture,3:doctrine,4:reflection,5:prayer,6:summary,7:closing"

'use strict';

const path = require('node:path');
const pptxgen = require('pptxgenjs');

const pres = new pptxgen();
pres.layout = 'LAYOUT_16x9'; // 10 × 5.625 inches (the default 16:9)
pres.title = 'Dios Padre Creador · Demo';
pres.subject = 'Catechetical slide importer demo';
pres.author = 'SlidesChurch';

function addCover() {
  const s = pres.addSlide();
  s.addText('Dios Padre Creador', {
    x: 1, y: 2.6, w: 8, h: 1.2, fontSize: 54, bold: true
  });
  s.addText('Curso de Catequesis · Lección Demo', {
    x: 1, y: 4.0, w: 8, h: 0.6, fontSize: 22
  });
}

function addScripture() {
  const s = pres.addSlide();
  s.addText('Génesis 1, 1', {
    x: 1, y: 1.2, w: 8, h: 0.5, fontSize: 22
  });
  s.addText('«En el principio creó Dios el cielo y la tierra.»', {
    x: 1, y: 2.6, w: 8, h: 1.8, fontSize: 30, italic: true
  });
  s.addText('Biblia de Jerusalén', {
    x: 1, y: 5.8, w: 8, h: 0.4, fontSize: 18
  });
}

function addDoctrine() {
  const s = pres.addSlide();
  s.addText('Dios Padre, Creador', {
    x: 1, y: 0.4, w: 8, h: 1, fontSize: 36, bold: true
  });
  s.addText('Crea por amor, no por necesidad.', {
    x: 1, y: 1.7, w: 8, h: 0.6, fontSize: 22
  });
  s.addText('La obra creadora es obra de la Trinidad.', {
    x: 1, y: 2.5, w: 8, h: 0.6, fontSize: 22
  });
  s.addText('Crea desde la nada (ex nihilo).', {
    x: 1, y: 3.3, w: 8, h: 0.6, fontSize: 22
  });
  s.addText('El hombre es la cima de la creación.', {
    x: 1, y: 4.1, w: 8, h: 0.6, fontSize: 22
  });
  s.addText('CEC 279 · LG 2 · SC 38', {
    x: 1, y: 6.0, w: 8, h: 0.4, fontSize: 14
  });
}

function addReflection() {
  const s = pres.addSlide();
  s.addText('«Antes de que la luz fuera luz, ya eras Tú.»', {
    x: 1, y: 2.6, w: 8, h: 1.8, fontSize: 30, italic: true
  });
}

function addPrayer() {
  const s = pres.addSlide();
  s.addText('Creo en Dios, Padre Todopoderoso, Creador del cielo y de la tierra.', {
    x: 1, y: 2.4, w: 8, h: 2.8, fontSize: 26
  });
}

function addSummary() {
  const s = pres.addSlide();
  s.addText('En resumen', {
    x: 1, y: 0.4, w: 8, h: 1, fontSize: 36, bold: true
  });
  s.addText('Dios es principio sin principio.', {
    x: 1, y: 1.9, w: 8, h: 0.6, fontSize: 24
  });
  s.addText('Crea por amor y la sostiene por providencia.', {
    x: 1, y: 2.9, w: 8, h: 0.6, fontSize: 24
  });
  s.addText('Toda la creación lo alaba.', {
    x: 1, y: 3.9, w: 8, h: 0.6, fontSize: 24
  });
}

function addClosing() {
  const s = pres.addSlide();
  s.addText('«El Señor os bendiga y os guarde; haga resplandecer su rostro sobre vosotros y os conceda su paz.»', {
    x: 1, y: 2.6, w: 8, h: 2.2, fontSize: 24, italic: true
  });
}

addCover();
addScripture();
addDoctrine();
addReflection();
addPrayer();
addSummary();
addClosing();

const outPath = path.join(__dirname, '..', 'demo.pptx');
pres.writeFile({ fileName: outPath }).then(() => {
  console.log(`Wrote ${outPath}`);
});
