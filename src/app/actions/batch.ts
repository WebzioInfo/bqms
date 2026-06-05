"use server";

import { PrismaClient, VerificationStatus, ParameterType } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth/require-role";
import { BatchService } from "@/services/batch.service";

const prisma = new PrismaClient();

export async function createBatch(data: {
  organizationId: string;
  batchNumber: string;
  productionDate: Date;
}) {
  try {
    await requireRole(["BIOFIX_ADMIN", "QC_USER", "LAB_STAFF"], data.organizationId);

    const batch = await BatchService.createBatch({
      organizationId: data.organizationId,
      batchNumber: data.batchNumber,
      productionDate: data.productionDate,
    });
    revalidatePath("/dashboard/batches");
    return { success: true, batch };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function addLaboratoryReport(data: {
  batchId: string;
  testDate: Date;
  reportedBy: string;
  parameters: Array<{
    name: string;
    type: ParameterType;
    value: number;
    unit: string;
    standardMin?: number;
    standardMax?: number;
  }>;
}) {
  try {
    // Need to verify the user belongs to the batch's organization.
    const existingBatch = await prisma.batch.findUnique({ where: { id: data.batchId } });
    if (!existingBatch) throw new Error("Batch not found");
    
    await requireRole(["LAB_STAFF", "BIOFIX_ADMIN"], existingBatch.organizationId);

    const report = await BatchService.addLaboratoryReport({
      batchId: data.batchId,
      testDate: data.testDate,
      reportedBy: data.reportedBy,
      parameters: data.parameters,
    });

    revalidatePath("/dashboard/batches");
    return { success: true, report };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function verifyBatch(batchId: string, status: VerificationStatus) {
  try {
    const existingBatch = await prisma.batch.findUnique({ where: { id: batchId } });
    if (!existingBatch) throw new Error("Batch not found");
    
    // Only BIOFIX_ADMIN or INSPECTOR can verify batches
    await requireRole(["BIOFIX_ADMIN", "INSPECTOR"]);

    const batch = await BatchService.verifyBatch(batchId, status);

    revalidatePath("/dashboard/batches");
    return { success: true, batch };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
