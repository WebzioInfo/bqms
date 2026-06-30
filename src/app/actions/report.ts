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
