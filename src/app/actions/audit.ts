"use server";

import prisma from "@/lib/prisma";
import { Role } from "@prisma/client";
import {
  errorMessage,
  requireAnyRole,
  scopedOptionalOrganizationWhere,
} from "@/lib/auth/tenant-access";

export async function getAuditLogs() {
  try {
    const user = await requireAnyRole([Role.PLATFORM_ADMIN, Role.COMPANY_ADMIN]);
    const logs = await prisma.auditLog.findMany({
      where: scopedOptionalOrganizationWhere(user),
      select: {
        id: true,
        organizationId: true,
        userId: true,
        action: true,
        entityName: true,
        entityId: true,
        ipAddress: true,
        createdAt: true,
        user: {
          select: { id: true, name: true, email: true, role: true },
        },
        organization: {
          select: { id: true, name: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
    return { success: true, data: logs };
  } catch (error) {
    return { success: false, error: errorMessage(error) };
  }
}

export async function getAuditLogById(id: string) {
  try {
    const user = await requireAnyRole([Role.PLATFORM_ADMIN, Role.COMPANY_ADMIN]);
    const log = await prisma.auditLog.findFirst({
      where: { id, ...scopedOptionalOrganizationWhere(user) },
      include: { 
        user: true,
        organization: true,
      }
    });
    if (!log) return { success: false, error: "Not found" };
    return { success: true, data: log };
  } catch (error) {
    return { success: false, error: errorMessage(error) };
  }
}
