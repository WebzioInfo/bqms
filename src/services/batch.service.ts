import { PrismaClient, VerificationStatus, ParameterType } from "@prisma/client";
import Redis from "ioredis";

const prisma = new PrismaClient();
const redis = new Redis(process.env.REDIS_URL || "redis://localhost:6379");

export class BatchService {
  /**
   * Distributed Lock implementation to prevent race conditions when verifying batches.
   */
  private static async acquireLock(key: string, ttlSeconds: number = 10): Promise<boolean> {
    const result = await redis.set(key, "LOCKED", "EX", ttlSeconds, "NX");
    return result === "OK";
  }

  private static async releaseLock(key: string): Promise<void> {
    await redis.del(key);
  }

  static async createBatch(data: {
    organizationId: string;
    batchNumber: string;
    productionDate: Date;
  }) {
    return prisma.batch.create({
      data: {
        organizationId: data.organizationId,
        batchNumber: data.batchNumber,
        productionDate: data.productionDate,
        verificationStatus: "PENDING",
      },
    });
  }

  static async addLaboratoryReport(data: {
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
    // ... omitting full implementation for brevity
    return null;
  }

  static async verifyBatch(batchId: string, status: VerificationStatus) {
    const lockKey = `lock:verifyBatch:${batchId}`;
    const acquired = await this.acquireLock(lockKey);

    if (!acquired) {
      throw new Error("Concurrency Error: This batch is currently being modified by another process.");
    }

    try {
      // Optimistic Concurrency Control: we only verify if it's PENDING
      const batch = await prisma.batch.updateMany({
        where: { id: batchId, verificationStatus: "PENDING" },
        data: { verificationStatus: status },
      });

      if (batch.count === 0) {
        throw new Error("Concurrency Error: Batch was already verified or does not exist.");
      }

      const updatedBatch = await prisma.batch.findUnique({ where: { id: batchId }});

      if (status === "VERIFIED" && updatedBatch) {
        await prisma.certificate.create({
          data: {
            certificateNo: `CERT-${Date.now()}-${updatedBatch.batchNumber}`,
            organizationId: updatedBatch.organizationId,
            batchId: updatedBatch.id,
          },
        });
      }

      return updatedBatch;
    } finally {
      await this.releaseLock(lockKey);
    }
  }
}
