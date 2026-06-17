import ExcelJS from 'exceljs';
import { Parser } from 'json2csv';
import { Builder } from 'xml2js';
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';

// Setup pdfMake fonts
// @ts-ignore
if (pdfMake && pdfFonts && pdfFonts.pdfMake) {
  // @ts-ignore
  pdfMake.vfs = pdfFonts.pdfMake.vfs;
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

  private static generatePDF(data: ReportData): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const documentDefinition: any = {
        content: [
          { text: data.title, style: 'header' },
          { text: '\n' }
        ],
        styles: {
          header: { fontSize: 18, bold: true, alignment: 'center' },
          tableHeader: { bold: true, fillColor: '#f2f2f2' }
        }
      };

      if (data.metadata) {
        Object.entries(data.metadata).forEach(([k, v]) => {
          documentDefinition.content.push({ text: `${k}: ${v}`, margin: [0, 0, 0, 5] });
        });
        documentDefinition.content.push({ text: '\n' });
      }

      // Add table
      const tableBody = [
        data.headers.map(h => ({ text: h, style: 'tableHeader' })),
        ...data.rows.map(row => row.map((cell: any) => String(cell || '')))
      ];

      documentDefinition.content.push({
        table: {
          headerRows: 1,
          widths: Array(data.headers.length).fill('*'),
          body: tableBody
        }
      });

      try {
        const pdfDocGenerator = pdfMake.createPdf(documentDefinition);
        // @ts-ignore
        pdfDocGenerator.getBuffer((buffer) => {
          resolve(buffer);
        });
      } catch (err) {
        reject(err);
      }
    });
  }
}
