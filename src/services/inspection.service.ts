import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export class InspectionService {
  static async createInspection(data: {
    organizationId: string;
    inspectorId: string;
    inspectionDate: Date;
    complianceStatus: string;
    notes?: string;
    reportUrl?: string;
  }) {
    return prisma.inspection.create({
      data: {
        organizationId: data.organizationId,
        inspectorId: data.inspectorId,
        inspectionDate: data.inspectionDate,
        complianceStatus: data.complianceStatus,
        notes: data.notes,
        reportUrl: data.reportUrl,
      },
    });
  }

  static async getInspections(organizationId: string) {
    return prisma.inspection.findMany({
      where: { organizationId },
      orderBy: { inspectionDate: "desc" },
    });
  }
}
