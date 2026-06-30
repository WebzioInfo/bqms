"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { Role, WaterTestStatus } from "@prisma/client";
import {
  type AuthenticatedUser,
  AuthorizationError,
  errorMessage,
  requireAnyRole,
  resolveWritableOrganizationId,
  scopedOrganizationWhere,
} from "@/lib/auth/tenant-access";

const REPORT_STATUSES = Object.values(WaterTestStatus);
const LIST_PAGE_SIZE = 100;

function parseReportStatus(
  status: unknown,
  fallback: WaterTestStatus = WaterTestStatus.DRAFT,
): WaterTestStatus {
  if (!status) return fallback;
  if (REPORT_STATUSES.includes(status as WaterTestStatus)) {
    return status as WaterTestStatus;
  }
  throw new AuthorizationError("Invalid water test report status.");
}

function scopedReportWhere(user: AuthenticatedUser) {
  const tenantWhere = scopedOrganizationWhere(user);
  return user.role === Role.QC ? { ...tenantWhere, createdBy: user.id } : tenantWhere;
}

export async function getTestReports() {
  try {
    const user = await requireAnyRole([Role.PLATFORM_ADMIN, Role.COMPANY_ADMIN, Role.QC]);
    const reports = await prisma.waterTestReport.findMany({
      where: scopedReportWhere(user),
      select: {
        id: true,
        organizationId: true,
        batchNumber: true,
        sampleNumber: true,
        reportType: true,
        status: true,
        sampleTime: true,
        testedBy: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { sampleTime: 'desc' },
      take: LIST_PAGE_SIZE,
    });

    // Fetch organizations
    const orgs = await prisma.organization.findMany({ where: user.role === Role.PLATFORM_ADMIN ? {} : { id: user.organizationId as string } });
    const orgMap = Object.fromEntries(orgs.map(o => [o.id, o]));

    const mapped = reports.map(r => ({
      ...r,
      reportNumber: r.id.substring(0, 8).toUpperCase(),
      organization: orgMap[r.organizationId] || null
    }));

    return { success: true, data: mapped };
  } catch (error) {
    return { success: false, error: errorMessage(error) };
  }
}

export async function getTestReportById(id: string) {
  try {
    const user = await requireAnyRole([Role.PLATFORM_ADMIN, Role.COMPANY_ADMIN, Role.QC]);
    const report = await prisma.waterTestReport.findFirst({
      where: { id, ...scopedReportWhere(user) },
      include: { 
        results: {
          include: { parameter: true }
        }
      }
    });
    if (!report) return { success: false, error: "Not found" };

    const org = await prisma.organization.findUnique({ where: { id: report.organizationId } });

    const mapped = {
      ...report,
      reportNumber: report.id.substring(0, 8).toUpperCase(),
      organization: org
    };

    return { success: true, data: mapped };
  } catch (error) {
    return { success: false, error: errorMessage(error) };
  }
}

export async function createTestReport(data: any, userId: string) {
  try {
    const user = await requireAnyRole([Role.COMPANY_ADMIN, Role.QC]);
    const organizationId = resolveWritableOrganizationId(user, data.organizationId);
    const newReport = await prisma.waterTestReport.create({
      data: {
        status: user.role === Role.QC ? WaterTestStatus.DRAFT : parseReportStatus(data.status),
        sampleTime: new Date(data.sampleTime),
        testedBy: data.testedBy,
        remarks: data.remarks || null,
        batchNumber: data.batchNumber,
        reportType: data.reportType || "PACKAGED_DRINKING_WATER",
        sampleNumber: data.sampleNumber || null,
        organizationId,
        createdBy: user.id || userId,
        isActive: true,
      }
    });
    revalidatePath("/test-reports");
    return { success: true, data: { ...newReport, id: newReport.id } };
  } catch (error) {
    return { success: false, error: errorMessage(error) };
  }
}

export async function updateTestReport(id: string, data: any, userId: string) {
  try {
    const user = await requireAnyRole([Role.COMPANY_ADMIN, Role.QC]);
    const organizationId = resolveWritableOrganizationId(user, data.organizationId);
    const currentReport = await prisma.waterTestReport.findFirst({
      where: { id, organizationId, ...(user.role === Role.QC ? { createdBy: user.id } : {}) },
      select: { status: true },
    });

    if (!currentReport) return { success: false, error: "Not found" };
    if (user.role === Role.QC && currentReport.status !== WaterTestStatus.DRAFT) {
      throw new AuthorizationError("QC users can only edit draft reports.");
    }

    const nextStatus = parseReportStatus(data.status, currentReport.status);
    if (
      user.role === Role.QC &&
      nextStatus !== WaterTestStatus.DRAFT &&
      nextStatus !== WaterTestStatus.SUBMITTED
    ) {
      throw new AuthorizationError("QC users can only save drafts or submit reports.");
    }

    const updated = await prisma.waterTestReport.updateMany({
      where: { id, organizationId },
      data: {
        status: nextStatus,
        sampleTime: data.sampleTime ? new Date(data.sampleTime) : undefined,
        testedBy: data.testedBy,
        remarks: data.remarks || null,
        batchNumber: data.batchNumber,
        reportType: data.reportType,
        sampleNumber: data.sampleNumber,
        updatedBy: user.id || userId,
      }
    });
    if (updated.count === 0) return { success: false, error: "Not found" };
    const updatedReport = await prisma.waterTestReport.findFirst({ where: { id, organizationId } });
    revalidatePath("/test-reports");
    revalidatePath(`/test-reports/${id}`);
    return { success: true, data: updatedReport };
  } catch (error) {
    return { success: false, error: errorMessage(error) };
  }
}

export async function deleteTestReport(id: string) {
  try {
    const user = await requireAnyRole([Role.COMPANY_ADMIN, Role.QC]);
    const report = await prisma.waterTestReport.findFirst({
      where: { id, ...scopedReportWhere(user) },
      select: { status: true },
    });

    if (!report) return { success: false, error: "Not found" };
    if (user.role === Role.QC && report.status !== WaterTestStatus.DRAFT) {
      throw new AuthorizationError("QC users can only delete draft reports.");
    }

    const deleted = await prisma.waterTestReport.deleteMany({
      where: { id, ...scopedReportWhere(user) }
    });
    if (deleted.count === 0) return { success: false, error: "Not found" };
    revalidatePath("/test-reports");
    return { success: true };
  } catch (error) {
    return { success: false, error: errorMessage(error) };
  }
}

const PARAMS_TO_SEED = [
  { name: "pH", category: "PHYSICAL", unit: "pH", minAcceptable: 6.5, maxAcceptable: 8.5 },
  { name: "TDS", category: "PHYSICAL", unit: "mg/L", minAcceptable: 0, maxAcceptable: 500 },
  { name: "Turbidity", category: "PHYSICAL", unit: "NTU", minAcceptable: 0, maxAcceptable: 1 },
  { name: "Conductivity", category: "PHYSICAL", unit: "µS/cm", minAcceptable: 0, maxAcceptable: 800 },
  { name: "Temperature", category: "PHYSICAL", unit: "°C", minAcceptable: 0, maxAcceptable: 40 },
  { name: "Colour", category: "PHYSICAL", unit: "Hazen", minAcceptable: 0, maxAcceptable: 5 },
  { name: "Odour", category: "PHYSICAL", unit: "Descriptor", minAcceptable: 0, maxAcceptable: 0 },
  { name: "Appearance", category: "PHYSICAL", unit: "Descriptor", minAcceptable: 0, maxAcceptable: 0 },
  { name: "Taste", category: "PHYSICAL", unit: "Descriptor", minAcceptable: 0, maxAcceptable: 0 },

  { name: "Calcium", category: "CHEMICAL", unit: "mg/L", minAcceptable: 0, maxAcceptable: 75 },
  { name: "Magnesium", category: "CHEMICAL", unit: "mg/L", minAcceptable: 0, maxAcceptable: 30 },
  { name: "Sulphate", category: "CHEMICAL", unit: "mg/L", minAcceptable: 0, maxAcceptable: 200 },
  { name: "Chloride", category: "CHEMICAL", unit: "mg/L", minAcceptable: 0, maxAcceptable: 250 },
  { name: "Fluoride", category: "CHEMICAL", unit: "mg/L", minAcceptable: 0, maxAcceptable: 1.0 },
  { name: "Nitrate", category: "CHEMICAL", unit: "mg/L", minAcceptable: 0, maxAcceptable: 45 },
  { name: "Nitrite", category: "CHEMICAL", unit: "mg/L", minAcceptable: 0, maxAcceptable: 0.02 },
  { name: "Iron", category: "CHEMICAL", unit: "mg/L", minAcceptable: 0, maxAcceptable: 0.1 },
  { name: "Copper", category: "CHEMICAL", unit: "mg/L", minAcceptable: 0, maxAcceptable: 0.05 },
  { name: "Zinc", category: "CHEMICAL", unit: "mg/L", minAcceptable: 0, maxAcceptable: 5.0 },
  { name: "Manganese", category: "CHEMICAL", unit: "mg/L", minAcceptable: 0, maxAcceptable: 0.1 },
  { name: "Aluminium", category: "CHEMICAL", unit: "mg/L", minAcceptable: 0, maxAcceptable: 0.03 },
  { name: "Barium", category: "CHEMICAL", unit: "mg/L", minAcceptable: 0, maxAcceptable: 0.7 },
  { name: "Lead", category: "CHEMICAL", unit: "mg/L", minAcceptable: 0, maxAcceptable: 0.01 },
  { name: "Chromium", category: "CHEMICAL", unit: "mg/L", minAcceptable: 0, maxAcceptable: 0.05 },
  { name: "Cadmium", category: "CHEMICAL", unit: "mg/L", minAcceptable: 0, maxAcceptable: 0.003 },
  { name: "Mercury", category: "CHEMICAL", unit: "mg/L", minAcceptable: 0, maxAcceptable: 0.001 },
  { name: "Arsenic", category: "CHEMICAL", unit: "mg/L", minAcceptable: 0, maxAcceptable: 0.01 },
  { name: "Sodium", category: "CHEMICAL", unit: "mg/L", minAcceptable: 0, maxAcceptable: 200 },
  { name: "Potassium", category: "CHEMICAL", unit: "mg/L", minAcceptable: 0, maxAcceptable: 10 },
  { name: "Hardness", category: "CHEMICAL", unit: "mg/L", minAcceptable: 0, maxAcceptable: 200 },
  { name: "Alkalinity", category: "CHEMICAL", unit: "mg/L", minAcceptable: 0, maxAcceptable: 200 },
  { name: "Sulphide", category: "CHEMICAL", unit: "mg/L", minAcceptable: 0, maxAcceptable: 0.05 },
  { name: "Phenolic Compounds", category: "CHEMICAL", unit: "mg/L", minAcceptable: 0, maxAcceptable: 0.001 },
  { name: "Mineral Oil", category: "CHEMICAL", unit: "mg/L", minAcceptable: 0, maxAcceptable: 0.01 },
  { name: "Antimony", category: "CHEMICAL", unit: "mg/L", minAcceptable: 0, maxAcceptable: 0.005 },
  { name: "Borate", category: "CHEMICAL", unit: "mg/L", minAcceptable: 0, maxAcceptable: 5.0 },
  { name: "Anionic Surface Active Agent", category: "CHEMICAL", unit: "mg/L", minAcceptable: 0, maxAcceptable: 0.2 },

  { name: "E.coli", category: "MICROBIOLOGY", unit: "CFU/100ml", minAcceptable: 0, maxAcceptable: 0 },
  { name: "Coliform", category: "MICROBIOLOGY", unit: "CFU/100ml", minAcceptable: 0, maxAcceptable: 0 },
  { name: "Pseudomonas", category: "MICROBIOLOGY", unit: "CFU/100ml", minAcceptable: 0, maxAcceptable: 0 },
  { name: "Clostridia", category: "MICROBIOLOGY", unit: "CFU/100ml", minAcceptable: 0, maxAcceptable: 0 },
  { name: "Yeast", category: "MICROBIOLOGY", unit: "CFU/100ml", minAcceptable: 0, maxAcceptable: 0 },
  { name: "Mould", category: "MICROBIOLOGY", unit: "CFU/100ml", minAcceptable: 0, maxAcceptable: 0 },
  { name: "AMC 22°C", category: "MICROBIOLOGY", unit: "CFU/ml", minAcceptable: 0, maxAcceptable: 100 },
  { name: "AMC 37°C", category: "MICROBIOLOGY", unit: "CFU/ml", minAcceptable: 0, maxAcceptable: 20 },
  { name: "Staphylococcus", category: "MICROBIOLOGY", unit: "CFU/100ml", minAcceptable: 0, maxAcceptable: 0 },
  { name: "Salmonella", category: "MICROBIOLOGY", unit: "CFU/100ml", minAcceptable: 0, maxAcceptable: 0 },
  { name: "Shigella", category: "MICROBIOLOGY", unit: "CFU/100ml", minAcceptable: 0, maxAcceptable: 0 },
  { name: "Vibrio", category: "MICROBIOLOGY", unit: "CFU/100ml", minAcceptable: 0, maxAcceptable: 0 },
];

export async function getWaterTestParameters() {
  try {
    const user = await requireAnyRole([Role.PLATFORM_ADMIN, Role.COMPANY_ADMIN, Role.QC]);
    
    // Self-healing database seed for missing parameters
    for (const item of PARAMS_TO_SEED) {
      const existing = await prisma.waterTestParameter.findFirst({
        where: { name: item.name, category: item.category }
      });
      if (!existing) {
        await prisma.waterTestParameter.create({
          data: {
            name: item.name,
            category: item.category,
            unit: item.unit,
            minAcceptable: item.minAcceptable,
            maxAcceptable: item.maxAcceptable,
            isActive: true
          }
        });
      }
    }

    const list = await prisma.waterTestParameter.findMany({
      where: { isActive: true },
      orderBy: [{ category: 'asc' }, { name: 'asc' }]
    });

    return { success: true, data: list };
  } catch (error) {
    return { success: false, error: errorMessage(error) };
  }
}

export async function getRecentReportsWithResults(organizationId: string) {
  try {
    await requireAnyRole([Role.PLATFORM_ADMIN, Role.COMPANY_ADMIN, Role.QC]);
    const reports = await prisma.waterTestReport.findMany({
      where: { organizationId, isActive: true },
      include: {
        results: {
          include: {
            parameter: true
          }
        }
      },
      orderBy: { sampleTime: 'desc' },
      take: 10,
    });
    return { success: true, data: reports };
  } catch (error) {
    return { success: false, error: errorMessage(error) };
  }
}

export async function createTestReportWithResults(data: any, results: any[], userId: string) {
  try {
    const user = await requireAnyRole([Role.COMPANY_ADMIN, Role.QC]);
    const organizationId = resolveWritableOrganizationId(user, data.organizationId);

    const report = await prisma.$transaction(async (tx) => {
      const newReport = await tx.waterTestReport.create({
        data: {
          status: user.role === Role.QC ? WaterTestStatus.DRAFT : parseReportStatus(data.status),
          sampleTime: new Date(data.sampleTime),
          testedBy: data.testedBy,
          remarks: data.remarks || null,
          batchNumber: data.batchNumber,
          reportType: data.reportType || "PACKAGED_DRINKING_WATER",
          sampleNumber: data.sampleNumber || null,
          organizationId,
          createdBy: user.id || userId,
          isActive: true,
        }
      });

      // Create test results
      for (const res of results) {
        await tx.waterTestResult.create({
          data: {
            reportId: newReport.id,
            parameterId: res.parameterId,
            value: parseFloat(res.value),
            isPass: res.isPass,
            createdBy: user.id || userId,
          }
        });
      }

      return newReport;
    });

    revalidatePath("/test-reports");
    return { success: true, data: report };
  } catch (error) {
    return { success: false, error: errorMessage(error) };
  }
}

export async function updateTestReportWithResults(id: string, data: any, results: any[], userId: string) {
  try {
    const user = await requireAnyRole([Role.COMPANY_ADMIN, Role.QC]);
    const organizationId = resolveWritableOrganizationId(user, data.organizationId);

    const report = await prisma.$transaction(async (tx) => {
      const currentReport = await tx.waterTestReport.findFirst({
        where: { id, organizationId, ...(user.role === Role.QC ? { createdBy: user.id } : {}) },
      });

      if (!currentReport) throw new Error("Report not found or not editable.");
      if (user.role === Role.QC && currentReport.status !== WaterTestStatus.DRAFT) {
        throw new Error("QC users can only edit draft reports.");
      }

      const nextStatus = parseReportStatus(data.status, currentReport.status);
      if (
        user.role === Role.QC &&
        nextStatus !== WaterTestStatus.DRAFT &&
        nextStatus !== WaterTestStatus.SUBMITTED
      ) {
        throw new Error("QC users can only save drafts or submit reports.");
      }

      await tx.waterTestReport.update({
        where: { id },
        data: {
          status: nextStatus,
          sampleTime: data.sampleTime ? new Date(data.sampleTime) : undefined,
          testedBy: data.testedBy,
          remarks: data.remarks || null,
          batchNumber: data.batchNumber,
          reportType: data.reportType,
          sampleNumber: data.sampleNumber,
          updatedBy: user.id || userId,
        }
      });

      // Update or insert results
      for (const res of results) {
        await tx.waterTestResult.upsert({
          where: {
            reportId_parameterId: {
              reportId: id,
              parameterId: res.parameterId
            }
          },
          update: {
            value: parseFloat(res.value),
            isPass: res.isPass,
            updatedBy: user.id || userId,
          },
          create: {
            reportId: id,
            parameterId: res.parameterId,
            value: parseFloat(res.value),
            isPass: res.isPass,
            createdBy: user.id || userId,
          }
        });
      }

      return tx.waterTestReport.findUnique({
        where: { id },
        include: { results: { include: { parameter: true } } }
      });
    });

    revalidatePath("/test-reports");
    revalidatePath(`/test-reports/${id}`);
    return { success: true, data: report };
  } catch (error) {
    return { success: false, error: errorMessage(error) };
  }
}

