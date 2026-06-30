const pdfMake = require('pdfmake/build/pdfmake');
const pdfFonts = require('pdfmake/build/vfs_fonts');

pdfMake.vfs = pdfFonts.pdfMake.vfs;
console.log("pdfMake loaded?", !!pdfMake);
try {
  const doc = { content: 'test' };
  const pdfDocGenerator = pdfMake.createPdf(doc);
  pdfDocGenerator.getBuffer((buffer) => {
    console.log("Success, size:", buffer.length);
  });
} catch(e) {
  console.error("Error creating PDF:", e);
}
