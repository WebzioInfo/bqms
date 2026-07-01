const pdfMake = require('pdfmake/build/pdfmake');
const pdfFonts = require('pdfmake/build/vfs_fonts');

pdfMake.vfs = pdfFonts.pdfMake ? pdfFonts.pdfMake.vfs : pdfFonts;

async function run() {
  try {
    const doc = { content: 'hello' };
    console.log("Calling getBuffer()...");
    const buffer = await pdfMake.createPdf(doc).getBuffer();
    console.log("SUCCESS! Buffer size:", buffer.length);
  } catch(e) {
    console.error(e);
  }
}
run();
