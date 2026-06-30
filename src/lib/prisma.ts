import { PrismaClient } from "@prisma/client";

const globalForPrisma = global as unknown as { basePrisma: PrismaClient };

export const basePrisma =
  globalForPrisma.basePrisma ||
  new PrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.basePrisma = basePrisma;

const prisma = basePrisma.$extends({
  query: {
    $allModels: {
      async create({ model, operation, args, query }) {
        const result = await query(args);
        if (model === "AuditLog") return result;

        try {
          const dataAny = args.data as any;
          const resultAny = result as any;
          const userId = dataAny?.createdBy || dataAny?.updatedBy || null;
          const organizationId = dataAny?.organizationId || resultAny?.organizationId || null;

          await basePrisma.auditLog.create({
            data: {
              entityName: model,
              action: "CREATE",
              entityId: resultAny?.id || "unknown",
              userId,
              organizationId,
              afterValue: JSON.stringify(result)
            }
          });
        } catch (error) {
          console.error("Audit log failed for create:", error);
        }
        return result;
      },
      async update({ model, operation, args, query }) {
        const result = await query(args);
        if (model === "AuditLog") return result;

        try {
          const dataAny = args.data as any;
          const resultAny = result as any;
          const userId = dataAny?.updatedBy || null;
          const organizationId = dataAny?.organizationId || resultAny?.organizationId || null;

          await basePrisma.auditLog.create({
            data: {
              entityName: model,
              action: "UPDATE",
              entityId: resultAny?.id || "unknown",
              userId,
              organizationId,
              afterValue: JSON.stringify(result)
            }
          });
        } catch (error) {
          console.error("Audit log failed for update:", error);
        }
        return result;
      },
      async delete({ model, operation, args, query }) {
        const result = await query(args);
        if (model === "AuditLog") return result;

        try {
          const resultAny = result as any;
          const userId = null;
          const organizationId = resultAny?.organizationId || null;

          await basePrisma.auditLog.create({
            data: {
              entityName: model,
              action: "DELETE",
              entityId: resultAny?.id || "unknown",
              userId,
              organizationId,
              beforeValue: JSON.stringify(result)
            }
          });
        } catch (error) {
          console.error("Audit log failed for delete:", error);
        }
        return result;
      }
    }
  }
});

export default prisma;
