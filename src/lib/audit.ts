import prisma from "@/lib/prisma";

export async function logAudit(data: {
  userId?: string;
  action: string;
  entity: string;
  entityId: string;
  details?: any;
}) {
  try {
    await prisma.auditLog.create({
      data: {
        userId: data.userId,
        action: data.action,
        entity: data.entity,
        entityId: data.entityId,
        details: data.details ? JSON.stringify(data.details) : null,
      }
    });
    return true;
  } catch (error) {
    console.error("Audit Logging Failed", error);
    return false;
  }
}
