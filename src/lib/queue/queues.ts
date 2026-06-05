import { Queue } from "bullmq";
import Redis from "ioredis";

// Centralized Redis Connection
const connection = new Redis(process.env.REDIS_URL || "redis://localhost:6379", {
  maxRetriesPerRequest: null,
});

// Define distributed queues
export const SearchSyncQueue = new Queue("search-sync", { connection });
export const ErpSyncQueue = new Queue("erp-sync", { connection });
export const PdfGenerationQueue = new Queue("pdf-generation", { connection });
export const TrustScoreQueue = new Queue("trust-score", { connection });

/**
 * Dispatcher helper for adding jobs with robust retry policies
 */
export async function dispatchSearchSync(organizationId: string) {
  return SearchSyncQueue.add(
    "sync-org",
    { organizationId },
    {
      attempts: 5,
      backoff: { type: "exponential", delay: 2000 },
      removeOnComplete: true,
      removeOnFail: 1000, // Keep last 1000 failures for debugging
    }
  );
}

export async function dispatchPdfGeneration(type: "CERTIFICATE" | "REPORT", entityId: string) {
  return PdfGenerationQueue.add(
    "generate-pdf",
    { type, entityId },
    {
      attempts: 3,
      backoff: { type: "fixed", delay: 5000 },
      removeOnComplete: true,
    }
  );
}
