"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { Role } from "@prisma/client";
import {
  errorMessage,
  requireAnyRole,
  resolveWritableOrganizationId,
  scopedOrganizationWhere,
} from "@/lib/auth/tenant-access";

const LIST_PAGE_SIZE = 100;

export async function getComplianceRecords() {
  try {
    const user = await requireAnyRole([Role.PLATFORM_ADMIN, Role.COMPANY_ADMIN, Role.QC]);
    const records = await prisma.nonConformanceRecord.findMany({
      where: scopedOrganizationWhere(user),
      select: {
        id: true,
        organizationId: true,
        batchNumber: true,
        title: true,
        description: true,
        severity: true,
        status: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        organization: {
          select: { id: true, name: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: LIST_PAGE_SIZE,
    });
    
    const mapped = records.map(r => ({
      ...r,
      type: r.severity === "CRITICAL" ? "NCR" : r.severity === "HIGH" ? "AUDIT_FINDING" : r.severity === "MEDIUM" ? "CAPA" : "CUSTOMER_COMPLAINT",
      dueDate: new Date(r.createdAt.getTime() + 7 * 24 * 60 * 60 * 1000), // 7 days later
      resolutionInfo: null,
      resolvedAt: r.status === "CLOSED" ? r.updatedAt : null,
    }));
    
    return { success: true, data: mapped };
  } catch (error) {
    return { success: false, error: errorMessage(error) };
  }
}

export async function getComplianceRecordById(id: string) {
  try {
    const user = await requireAnyRole([Role.PLATFORM_ADMIN, Role.COMPANY_ADMIN, Role.QC]);
    const record = await prisma.nonConformanceRecord.findFirst({
      where: { id, ...scopedOrganizationWhere(user) },
      include: { 
        organization: true,
      }
    });
    if (!record) return { success: false, error: "Not found" };
    
    const mapped = {
      ...record,
      type: record.severity === "CRITICAL" ? "NCR" : record.severity === "HIGH" ? "AUDIT_FINDING" : record.severity === "MEDIUM" ? "CAPA" : "CUSTOMER_COMPLAINT",
      dueDate: new Date(record.createdAt.getTime() + 7 * 24 * 60 * 60 * 1000),
      resolutionInfo: null,
      resolvedAt: record.status === "CLOSED" ? record.updatedAt : null,
    };
    
    return { success: true, data: mapped };
  } catch (error) {
    return { success: false, error: errorMessage(error) };
  }
}

export async function createComplianceRecord(data: any, userId: string) {
  try {
    const user = await requireAnyRole([Role.PLATFORM_ADMIN, Role.COMPANY_ADMIN, Role.QC]);
    const organizationId = resolveWritableOrganizationId(user, data.organizationId);
    const severityMap: Record<string, string> = { "NCR": "CRITICAL", "AUDIT_FINDING": "HIGH", "CAPA": "MEDIUM", "CUSTOMER_COMPLAINT": "LOW" };
    const newRecord = await prisma.nonConformanceRecord.create({
      data: {
        severity: severityMap[data.type || "AUDIT_FINDING"] || "MEDIUM",
        title: data.title,
        description: data.description,
        status: data.status || "OPEN",
        organizationId,
        createdBy: user.id || userId,
        isActive: true,
      }
    });
    revalidatePath("/compliance");
    return { success: true, data: { ...newRecord, id: newRecord.id } };
  } catch (error) {
    return { success: false, error: errorMessage(error) };
  }
}

export async function updateComplianceRecord(id: string, data: any, userId: string) {
  try {
    const user = await requireAnyRole([Role.PLATFORM_ADMIN, Role.COMPANY_ADMIN, Role.QC]);
    const organizationId = resolveWritableOrganizationId(user, data.organizationId);
    const severityMap: Record<string, string> = { "NCR": "CRITICAL", "AUDIT_FINDING": "HIGH", "CAPA": "MEDIUM", "CUSTOMER_COMPLAINT": "LOW" };
    const updated = await prisma.nonConformanceRecord.updateMany({
      where: { id, organizationId },
      data: {
        severity: severityMap[data.type || "AUDIT_FINDING"] || "MEDIUM",
        title: data.title,
        description: data.description,
        status: data.status,
        updatedBy: user.id || userId,
      }
    });
    if (updated.count === 0) return { success: false, error: "Not found" };
    const updatedRecord = await prisma.nonConformanceRecord.findFirst({ where: { id, organizationId } });
    revalidatePath("/compliance");
    revalidatePath(`/compliance/${id}`);
    return { success: true, data: updatedRecord };
  } catch (error) {
    return { success: false, error: errorMessage(error) };
  }
}

export async function deleteComplianceRecord(id: string) {
  try {
    const user = await requireAnyRole([Role.PLATFORM_ADMIN, Role.COMPANY_ADMIN, Role.QC]);
    const deleted = await prisma.nonConformanceRecord.deleteMany({
      where: { id, ...scopedOrganizationWhere(user) }
    });
    if (deleted.count === 0) return { success: false, error: "Not found" };
    revalidatePath("/compliance");
    return { success: true };
  } catch (error) {
    return { success: false, error: errorMessage(error) };
  }
}
