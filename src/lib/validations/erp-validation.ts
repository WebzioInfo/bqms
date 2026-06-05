import { z } from "zod";
import { EntityType } from "@prisma/client";

export const ErpSyncPayloadSchema = z.object({
  organizationId: z.string().optional(),
  erpReferenceId: z.string().min(1, "ERP Reference ID is required"),
  name: z.string().min(1, "Name is required"),
  type: z.nativeEnum(EntityType),
  timestamp: z.number().int().positive("Timestamp must be a valid positive integer"),
});

export type ErpSyncPayload = z.infer<typeof ErpSyncPayloadSchema>;
