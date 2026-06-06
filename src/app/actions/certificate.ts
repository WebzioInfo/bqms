"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth/require-role";

export async function createCertificate(data: any) {
  try {
    await requireRole(["SUPER_ADMIN", "BIOFIX_ADMIN"]);
    
    const certificate = await prisma.certificate.create({
      data: {
        organizationId: data.organizationId,
        certificateNo: data.certificateNo,
        issueDate: new Date(data.issueDate),
        expiryDate: new Date(data.expiryDate)
      }
    });
    
    revalidatePath("/certificates");
    return { success: true, certificate };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updateCertificate(id: string, data: any) {
  try {
    await requireRole(["SUPER_ADMIN", "BIOFIX_ADMIN"]);
    
    const certificate = await prisma.certificate.update({
      where: { id },
      data: {
        issueDate: data.issueDate ? new Date(data.issueDate) : undefined,
        expiryDate: data.expiryDate ? new Date(data.expiryDate) : undefined
      }
    });
    
    revalidatePath("/certificates");
    return { success: true, certificate };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteCertificate(id: string) {
  try {
    await requireRole(["SUPER_ADMIN", "BIOFIX_ADMIN"]);
    await prisma.certificate.delete({ where: { id } });
    revalidatePath("/certificates");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
