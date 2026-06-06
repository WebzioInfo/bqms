import prisma from "@/lib/prisma";
export class PdfService {
  /**
   * Generates a PDF buffer for an Inspection Report.
   */
  static async generateInspectionReportPdf(inspectionId: string): Promise<Buffer> {
    const inspection = await prisma.inspection.findUnique({
      where: { id: inspectionId },
      include: { organization: true }
    });

    if (!inspection) throw new Error("Inspection not found");

    const pdfContent = `PDF_HEADER: BQMS Inspection Report\nINSPECTION_ID: ${inspectionId}\nORGANIZATION: ${inspection.organization.name}\nSTATUS: ${inspection.complianceStatus}\nDATE: ${inspection.inspectionDate}\nBRANDING: Biofix Quality Management System\nVERIFICATION_URL: https://bqms.biofix.com/verify/inspection/${inspectionId}`;
    return Buffer.from(pdfContent);
  }
  /**
   * Generates a PDF buffer for a Water Quality Batch Certificate.
   */
  static async generateCertificatePdf(certificateNo: string): Promise<Buffer> {
    const cert = await prisma.certificate.findUnique({
      where: { certificateNo },
      include: { organization: true, batch: true }
    });

    if (!cert) throw new Error("Certificate not found");

    const pdfContent = `PDF_HEADER: Official Certificate of Compliance\nCERT_NO: ${certificateNo}\nORGANIZATION: ${cert.organization.name}\nBATCH: ${cert.batch?.batchNumber || "N/A"}\nSTATUS: ${cert.status}\nBRANDING: Biofix Water Lab\nVERIFICATION_URL: https://bqms.biofix.com/verify/certificate/${certificateNo}`;
    return Buffer.from(pdfContent);
  }
}
