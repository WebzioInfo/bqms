import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient().$extends({
  query: {
    $allModels: {
      async create({ model, operation, args, query }) {
        const result = await query(args);
        if (model === "AuditLog") return result;

        try {
          const dataAny = args.data as any;
          const resultAny = result as any;
          const userId = dataAny?.createdBy || dataAny?.updatedBy || "System";
          const organizationId = dataAny?.organizationId || resultAny?.organizationId || null;

          await new PrismaClient().auditLog.create({
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
          const userId = dataAny?.updatedBy || "System";
          const organizationId = dataAny?.organizationId || resultAny?.organizationId || null;

          await new PrismaClient().auditLog.create({
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
          const userId = "System";
          const organizationId = resultAny?.organizationId || null;

          await new PrismaClient().auditLog.create({
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
