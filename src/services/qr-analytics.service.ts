import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export class QrAnalyticsService {
  /**
   * Generates a monthly scan report for an organization's QR codes.
   */
  static async getMonthlyScanReport(organizationId: string, year: number, month: number) {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59, 999);

    const qrCodes = await prisma.qRCode.findMany({
      where: { organizationId },
      include: {
        scans: {
          where: {
            scannedAt: {
              gte: startDate,
              lte: endDate,
            }
          }
        }
      }
    });

    const totalScans = qrCodes.reduce((acc, qr) => acc + qr.scans.length, 0);
    const uniqueIps = new Set();
    
    for (const qr of qrCodes) {
      for (const scan of qr.scans) {
        if (scan.ipAddress) {
          uniqueIps.add(scan.ipAddress);
        }
      }
    }

    return {
      organizationId,
      period: { year, month },
      metrics: {
        totalScans,
        uniqueVisitors: uniqueIps.size,
        activeQrCodes: qrCodes.filter(qr => qr.scans.length > 0).length,
      }
    };
  }
}
