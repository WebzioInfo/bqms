import ExcelJS from 'exceljs';
import { Parser } from 'json2csv';
import { Builder } from 'xml2js';
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
import { generateReportDefinition } from './pdf';

// Setup pdfMake fonts by mutating the existing objects in-place
if (pdfMake && pdfFonts) {
  const vfsObj = pdfFonts.pdfMake ? pdfFonts.pdfMake.vfs : pdfFonts;
  // @ts-ignore
  pdfMake.vfs = pdfMake.vfs || {};
  // @ts-ignore
  Object.assign(pdfMake.vfs, vfsObj);
  // @ts-ignore
  pdfMake.fonts = pdfMake.fonts || {};
  // @ts-ignore
  Object.assign(pdfMake.fonts, {
    Roboto: {
      normal: 'Roboto-Regular.ttf',
      bold: 'Roboto-Medium.ttf',
      italics: 'Roboto-Italic.ttf',
      bolditalics: 'Roboto-MediumItalic.ttf'
    }
  });
}

export type ExportFormat = 'pdf' | 'xlsx' | 'csv' | 'json' | 'xml';

export interface ReportData {
  title: string;
  headers: string[];
  rows: any[][];
  metadata?: Record<string, string>;
}

export class ReportGeneratorService {
  /**
   * Generates a report in the specified format and returns the raw Buffer or string.
   */
  static async generate(data: ReportData, format: ExportFormat): Promise<Buffer | string> {
    switch (format) {
      case 'xlsx':
        return this.generateExcel(data);
      case 'csv':
        return this.generateCSV(data);
      case 'json':
        return this.generateJSON(data);
      case 'xml':
        return this.generateXML(data);
      case 'pdf':
        return this.generatePDF(data);
      default:
        throw new Error(`Unsupported export format: ${format}`);
    }
  }

  private static async generateExcel(data: ReportData): Promise<Buffer> {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet(data.title.substring(0, 31));

    // Add metadata rows
    if (data.metadata) {
      Object.entries(data.metadata).forEach(([k, v]) => {
        worksheet.addRow([k, v]);
      });
      worksheet.addRow([]); // Blank row
    }

    // Add headers
    worksheet.addRow(data.headers);
    worksheet.getRow(worksheet.rowCount).font = { bold: true };

    // Add data
    data.rows.forEach(row => {
      worksheet.addRow(row);
    });

    // Output as buffer
    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
  }

  private static generateCSV(data: ReportData): string {
    const jsonArray = data.rows.map(row => {
      const obj: any = {};
      data.headers.forEach((h, i) => {
        obj[h] = row[i];
      });
      return obj;
    });

    const parser = new Parser({ fields: data.headers });
    return parser.parse(jsonArray);
  }

  private static generateJSON(data: ReportData): string {
    const jsonArray = data.rows.map(row => {
      const obj: any = {};
      data.headers.forEach((h, i) => {
        obj[h] = row[i];
      });
      return obj;
    });

    return JSON.stringify({
      title: data.title,
      metadata: data.metadata,
      data: jsonArray
    }, null, 2);
  }

  private static generateXML(data: ReportData): string {
    const jsonArray = data.rows.map(row => {
      const obj: any = {};
      data.headers.forEach((h, i) => {
        // XML tags cannot have spaces
        const safeHeader = h.replace(/\s+/g, '_');
        obj[safeHeader] = row[i];
      });
      return obj;
    });

    const builder = new Builder({ rootName: 'Report' });
    return builder.buildObject({
      Title: data.title,
      Metadata: data.metadata,
      Records: { Record: jsonArray }
    });
  }

  private static async generatePDF(data: ReportData): Promise<Buffer> {
    if (pdfMake && pdfFonts) {
      const vfsObj = pdfFonts.pdfMake ? pdfFonts.pdfMake.vfs : pdfFonts;
      pdfMake.vfs = pdfMake.vfs || {};
      Object.assign(pdfMake.vfs, vfsObj);
      
      pdfMake.fonts = pdfMake.fonts || {};
      Object.assign(pdfMake.fonts, {
        Roboto: {
          normal: 'Roboto-Regular.ttf',
          bold: 'Roboto-Medium.ttf',
          italics: 'Roboto-Italic.ttf',
          bolditalics: 'Roboto-MediumItalic.ttf'
        }
      });
      
      // Bind to global scope to support pdfMake internal resolution in server environment
      if (typeof global !== 'undefined') {
        // @ts-ignore
        global.pdfMake = pdfMake;
        // @ts-ignore
        global.pdfMake.vfs = pdfMake.vfs;
        // @ts-ignore
        global.pdfMake.fonts = pdfMake.fonts;
      }
    }
    const documentDefinition = generateReportDefinition(data);
    const pdfDocGenerator = pdfMake.createPdf(
      documentDefinition,
      undefined,
      pdfMake.fonts,
      pdfMake.vfs
    );
    const buffer = await pdfDocGenerator.getBuffer();
    return buffer;
  }
}
