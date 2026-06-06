"use server";
import prisma from "@/lib/prisma";

import { PrismaClient } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth/require-role";



export async function generateQRCode(data: {
  targetUrl: string;
  organizationId?: string;
  batchId?: string;
}) {
  try {
    await requireRole(["SUPER_ADMIN", "BIOFIX_ADMIN", "QC_USER"], data.organizationId);

    const qr = await prisma.qRCode.create({
      data: {
        code: `QR-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        targetUrl: data.targetUrl,
        status: "ACTIVE",
        organizationId: data.organizationId || null,
        batchId: data.batchId || null,
      },
    });
    revalidatePath("/dashboard/qrcodes");
    return { success: true, qrCode: qr };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function revokeQRCode(id: string) {
  try {
    const existingQr = await prisma.qRCode.findUnique({ where: { id } });
    if (!existingQr) throw new Error("QR Code not found");
    
    // Check ownership if it belongs to an organization, else require SUPER_ADMIN
    if (existingQr.organizationId) {
      await requireRole(["SUPER_ADMIN", "BIOFIX_ADMIN"], existingQr.organizationId);
    } else {
      await requireRole(["SUPER_ADMIN", "BIOFIX_ADMIN"]);
    }

    const qr = await prisma.qRCode.update({
      where: { id },
      data: { status: "REVOKED" }
    });
    revalidatePath("/dashboard/qrcodes");
    return { success: true, qrCode: qr };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function generateQRCodes(organizationId: string, batchId: string | null, count: number) {
  try {
    await requireRole(["SUPER_ADMIN", "BIOFIX_ADMIN"]);
    
    const qrData = [];
    for (let i = 0; i < count; i++) {
      qrData.push({
        code: `QR-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
        targetUrl: `https://bqms.app/verify`,
        status: "ACTIVE",
        organizationId: organizationId || null,
        batchId: batchId || null,
      });
    }

    // @ts-ignore Prisma bulk insert
    await prisma.qRCode.createMany({
      data: qrData,
    });

    revalidatePath("/qr-codes");
    return { success: true, count };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
