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
import { evaluate, evaluateParameterResult } from "@/lib/quality/evaluation-service";

const REPORT_STATUSES = Object.values(WaterTestStatus);
const LIST_PAGE_SIZE = 100;

const INCUBATION_HOURS: Record<string, number> = {
  "E.coli": 24,
  "Coliform": 24,
  "Pseudomonas": 48,
  "Clostridia": 48,
  "Aerobic Microbial Count 37°C": 24,
  "Aerobic Microbial Count 22°C": 72,
  "Yeast & Mold": 120, // 5 days
};

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
      include: {
        results: {
          include: {
            parameter: true
          }
        },
        pendingTests: true,
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
        },
        pendingTests: true,
      }
    });
    if (!report) {
      console.log("getTestReportById: Report not found in DB for id:", id);
      return { success: false, error: "Not found" };
    }

    const org = await prisma.organization.findUnique({ where: { id: report.organizationId } });

    const mapped = {
      ...report,
      reportNumber: report.id.substring(0, 8).toUpperCase(),
      organization: org
    };

    return { success: true, data: mapped };
  } catch (error) {
    console.error("getTestReportById Error:", error);
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
        sampleTime: data.sampleTime ? new Date(data.sampleTime) : null,
        productionDate: data.productionDate ? new Date(data.productionDate) : null,
        testedBy: data.testedBy || null,
        collectedBy: data.collectedBy || null,
        verifiedBy: data.verifiedBy || null,
        remarks: data.remarks || null,
        attachments: data.attachments || null,
        batchNumber: data.batchNumber,
        reportType: data.reportType || "DAILY",
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
        sampleTime: data.sampleTime ? new Date(data.sampleTime) : null,
        productionDate: data.productionDate ? new Date(data.productionDate) : null,
        testedBy: data.testedBy || null,
        collectedBy: data.collectedBy || null,
        verifiedBy: data.verifiedBy || null,
        remarks: data.remarks || null,
        attachments: data.attachments || null,
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
  // Physical & Chemical
  { name: "pH", category: "PHYSICAL", unit: "—", minAcceptable: 6.0, maxAcceptable: 8.5 },
  { name: "TDS", category: "PHYSICAL", unit: "mg/L", minAcceptable: 0, maxAcceptable: 500 },
  { name: "Turbidity", category: "PHYSICAL", unit: "NTU", minAcceptable: 0, maxAcceptable: 1 },
  { name: "Sulphate", category: "CHEMICAL", unit: "mg/L", minAcceptable: 0, maxAcceptable: 200 },
  { name: "Colour", category: "PHYSICAL", unit: "Descriptor", minAcceptable: 0, maxAcceptable: 0 },
  { name: "Odour", category: "PHYSICAL", unit: "Descriptor", minAcceptable: 0, maxAcceptable: 0 },
  { name: "Taste", category: "PHYSICAL", unit: "Descriptor", minAcceptable: 0, maxAcceptable: 0 },
  { name: "Residual Free Chlorine", category: "CHEMICAL", unit: "mg/L", minAcceptable: 0.2, maxAcceptable: null },
  { name: "Alkalinity", category: "CHEMICAL", unit: "mg/L", minAcceptable: 0, maxAcceptable: 200 },
  { name: "Chloride", category: "CHEMICAL", unit: "mg/L", minAcceptable: 0, maxAcceptable: 250 },

  // Microbiology
  { name: "E.coli", category: "MICROBIOLOGY", unit: "CFU/100ml", minAcceptable: 0, maxAcceptable: 0 },
  { name: "Coliform", category: "MICROBIOLOGY", unit: "CFU/100ml", minAcceptable: 0, maxAcceptable: 0 },
  { name: "Pseudomonas", category: "MICROBIOLOGY", unit: "CFU/250ml", minAcceptable: 0, maxAcceptable: 0 },
  { name: "Clostridia", category: "MICROBIOLOGY", unit: "CFU/100ml", minAcceptable: 0, maxAcceptable: 0 },
  { name: "Aerobic Microbial Count 22°C", category: "MICROBIOLOGY", unit: "CFU/ml", minAcceptable: 0, maxAcceptable: 100 },
  { name: "Aerobic Microbial Count 37°C", category: "MICROBIOLOGY", unit: "CFU/ml", minAcceptable: 0, maxAcceptable: 20 },
  { name: "Yeast & Mold", category: "MICROBIOLOGY", unit: "CFU/100ml", minAcceptable: 0, maxAcceptable: 0 },
];

export async function getWaterTestParameters() {
  try {
    const user = await requireAnyRole([Role.PLATFORM_ADMIN, Role.COMPANY_ADMIN, Role.QC]);
    
    // Self-healing database seed/sync for parameters
    const existingParams = await prisma.waterTestParameter.findMany({
      select: { id: true, name: true, category: true, minAcceptable: true, maxAcceptable: true }
    });
    
    const missingParams = PARAMS_TO_SEED.filter(
      item => !existingParams.some(e => e.name === item.name && e.category === item.category)
    );

    if (missingParams.length > 0) {
      await prisma.waterTestParameter.createMany({
        data: missingParams.map(item => ({
          name: item.name,
          category: item.category,
          unit: item.unit,
          minAcceptable: item.minAcceptable,
          maxAcceptable: item.maxAcceptable,
          isActive: true
        }))
      });
    }

    // Update existing parameters if their limits differ from the seed
    for (const seed of PARAMS_TO_SEED) {
      const match = existingParams.find(e => e.name === seed.name && e.category === seed.category);
      if (match) {
        if (match.minAcceptable !== seed.minAcceptable || match.maxAcceptable !== seed.maxAcceptable) {
          await prisma.waterTestParameter.update({
            where: { id: match.id },
            data: {
              minAcceptable: seed.minAcceptable,
              maxAcceptable: seed.maxAcceptable
            }
          });
        }
      }
    }

    const list = await prisma.waterTestParameter.findMany({
      where: { isActive: true },
      orderBy: [{ category: 'asc' }, { name: 'asc' }]
    });

    return { success: true, data: list };
  } catch (error) {
    console.error("Failed to fetch water test parameters:", error);
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
        },
        pendingTests: true,
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
          sampleTime: data.sampleTime ? new Date(data.sampleTime) : null,
          productionDate: data.productionDate ? new Date(data.productionDate) : null,
          testedBy: data.testedBy || null,
          collectedBy: data.collectedBy || null,
          verifiedBy: data.verifiedBy || null,
          remarks: data.remarks || null,
          attachments: data.attachments || null,
          batchNumber: data.batchNumber,
          reportType: data.reportType || "DAILY",
          sampleNumber: data.sampleNumber || null,
          organizationId,
          createdBy: user.id || userId,
          isActive: true,
        }
      });

      // Fetch all parameters from DB to map name (parameterId) to CUIDs
      const dbParams = await tx.waterTestParameter.findMany();

      // Create test results concurrently
      await Promise.all(results.map(res => {
        const dbParam = dbParams.find(p => p.name === res.parameterId) || dbParams.find(p => p.id === res.parameterId);
        if (!dbParam) {
          throw new Error(`Parameter not found: ${res.parameterId}`);
        }
        const val = res.value !== null && res.value !== undefined && res.value !== "" ? parseFloat(res.value) : null;
        const strVal = res.stringValue || null;
        const qualityStatus = evaluateParameterResult(dbParam.name, val, strVal);

        return tx.waterTestResult.create({
          data: {
            reportId: newReport.id,
            parameterId: dbParam.id,
            value: val,
            stringValue: strVal,
            qualityStatus,
            isPass: qualityStatus === "PASS",
            createdBy: user.id || userId,
          }
        });
      }));

      // Create PendingLabTest entries
      const reportCreatedAt = newReport.createdAt || new Date();
      await Promise.all(Object.entries(INCUBATION_HOURS).map(async ([paramName, hours]) => {
        // Find if this parameter was submitted in results
        const res = results.find(r => r.parameterId === paramName);
        const hasResult = res && (
          res.stringValue !== "" && res.stringValue !== null && res.stringValue !== undefined && res.stringValue !== "Not Entered" ||
          res.value !== "" && res.value !== null && res.value !== undefined
        );

        const dueAt = new Date(reportCreatedAt.getTime() + hours * 60 * 60 * 1000);
        
        await tx.pendingLabTest.create({
          data: {
            reportId: newReport.id,
            parameterName: paramName,
            status: hasResult ? "COMPLETED" : "WAITING",
            dueAt,
            completedAt: hasResult ? reportCreatedAt : null,
            completedBy: hasResult ? (user.name || user.email || "QC Tech") : null,
            completionNotes: hasResult ? "Result entered during report creation." : null
          }
        });
      }));

      return newReport;
    }, {
      maxWait: 5000,
      timeout: 20000,
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
          sampleTime: data.sampleTime ? new Date(data.sampleTime) : null,
          productionDate: data.productionDate ? new Date(data.productionDate) : null,
          testedBy: data.testedBy || null,
          collectedBy: data.collectedBy || null,
          verifiedBy: data.verifiedBy || null,
          remarks: data.remarks || null,
          attachments: data.attachments || null,
          batchNumber: data.batchNumber,
          reportType: data.reportType,
          sampleNumber: data.sampleNumber,
          updatedBy: user.id || userId,
        }
      });

      // Fetch all parameters from DB to map name (parameterId) to CUIDs
      const dbParams = await tx.waterTestParameter.findMany();

      // Update or insert results concurrently
      await Promise.all(results.map(res => {
        const dbParam = dbParams.find(p => p.name === res.parameterId) || dbParams.find(p => p.id === res.parameterId);
        if (!dbParam) {
          throw new Error(`Parameter not found: ${res.parameterId}`);
        }
        const val = res.value !== null && res.value !== undefined && res.value !== "" ? parseFloat(res.value) : null;
        const strVal = res.stringValue || null;
        const qualityStatus = evaluateParameterResult(dbParam.name, val, strVal);

        return tx.waterTestResult.upsert({
          where: {
            reportId_parameterId: {
              reportId: id,
              parameterId: dbParam.id
            }
          },
          update: {
            value: val,
            stringValue: strVal,
            qualityStatus,
            isPass: qualityStatus === "PASS",
            updatedBy: user.id || userId,
          },
          create: {
            reportId: id,
            parameterId: dbParam.id,
            value: val,
            stringValue: strVal,
            qualityStatus,
            isPass: qualityStatus === "PASS",
            createdBy: user.id || userId,
          }
        });
      }));

      // Update PendingLabTest entries
      const reportCreatedAt = currentReport.createdAt || new Date();
      await Promise.all(Object.entries(INCUBATION_HOURS).map(async ([paramName, hours]) => {
        const res = results.find(r => r.parameterId === paramName);
        const hasResult = res && (
          res.stringValue !== "" && res.stringValue !== null && res.stringValue !== undefined && res.stringValue !== "Not Entered" ||
          res.value !== "" && res.value !== null && res.value !== undefined
        );

        const dueAt = new Date(reportCreatedAt.getTime() + hours * 60 * 60 * 1000);

        // Find existing pending test
        const existing = await tx.pendingLabTest.findUnique({
          where: {
            reportId_parameterName: {
              reportId: id,
              parameterName: paramName
            }
          }
        });

        if (existing) {
          // If status is not COMPLETED, and we now have a result -> complete it!
          if (existing.status !== "COMPLETED" && hasResult) {
            await tx.pendingLabTest.update({
              where: { id: existing.id },
              data: {
                status: "COMPLETED",
                completedAt: new Date(),
                completedBy: user.name || user.email || "QC Tech",
                completionNotes: "Result entered during report update."
              }
            });
            // Clear any active notification for this parameter on this report
            await tx.notification.deleteMany({
              where: {
                reportId: id,
                parameterName: paramName
              }
            });
          } else if (existing.status === "COMPLETED" && !hasResult) {
            // If they somehow cleared it, revert to WAITING/OVERDUE
            const now = new Date();
            const status = now >= dueAt ? "OVERDUE" : "WAITING";
            await tx.pendingLabTest.update({
              where: { id: existing.id },
              data: {
                status,
                completedAt: null,
                completedBy: null,
                completionNotes: null
              }
            });
          }
        } else {
          // Create it if missing (self-healing)
          await tx.pendingLabTest.create({
            data: {
              reportId: id,
              parameterName: paramName,
              status: hasResult ? "COMPLETED" : "WAITING",
              dueAt,
              completedAt: hasResult ? new Date() : null,
              completedBy: hasResult ? (user.name || user.email || "QC Tech") : null,
              completionNotes: hasResult ? "Result entered during report update." : null
            }
          });
        }
      }));

      return tx.waterTestReport.findUnique({
        where: { id },
        include: { 
          results: { include: { parameter: true } },
          pendingTests: true
        }
      });
    }, {
      maxWait: 5000,
      timeout: 20000,
    });

    revalidatePath("/test-reports");
    revalidatePath(`/test-reports/${id}`);
    return { success: true, data: report };
  } catch (error) {
    return { success: false, error: errorMessage(error) };
  }
}

export async function evaluateResultsAction(
  results: { parameterId: string; value: string; stringValue: string }[]
) {
  try {
    const resultStatuses: Record<string, "PASS" | "WARNING" | "FAIL" | "PENDING"> = {};
    for (const res of results) {
      const hasVal = res.value !== undefined && res.value !== null && res.value !== "";
      const hasStr = res.stringValue !== undefined && res.stringValue !== null && res.stringValue !== "";
      if (!hasVal && !hasStr) {
        resultStatuses[res.parameterId] = "PENDING";
        continue;
      }
      const status = evaluate(res.parameterId, res.stringValue || res.value);
      resultStatuses[res.parameterId] = status;
    }
    return { success: true, data: resultStatuses };
  } catch (error) {
    return { success: false, error: errorMessage(error) };
  }
}

