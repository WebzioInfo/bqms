"use server";

import { PrismaClient } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth/require-role";
import { InspectionService } from "@/services/inspection.service";

const prisma = new PrismaClient();

export async function createInspection(data: {
  organizationId: string;
  inspectorId: string;
  inspectionDate: Date;
  complianceStatus: string;
  notes?: string;
  reportUrl?: string;
}) {
  try {
    await requireRole(["BIOFIX_ADMIN", "INSPECTOR"], data.organizationId);

    const inspection = await InspectionService.createInspection({
      organizationId: data.organizationId,
      inspectorId: data.inspectorId,
      inspectionDate: data.inspectionDate,
      complianceStatus: data.complianceStatus,
      notes: data.notes,
      reportUrl: data.reportUrl,
    });

    // Optionally update the organization's Trust Score dynamically here

    revalidatePath(`/dashboard/organizations/${data.organizationId}`);
    return { success: true, inspection };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getInspections(organizationId: string) {
  try {
    await requireRole(["SUPER_ADMIN", "BIOFIX_ADMIN", "QC_USER", "INSPECTOR", "LAB_STAFF"], organizationId);
    const inspections = await InspectionService.getInspections(organizationId);
    return { success: true, inspections };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
