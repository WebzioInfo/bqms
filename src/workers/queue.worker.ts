import { Worker } from "bullmq";
import Redis from "ioredis";
import { SearchService } from "@/services/search.service";
import { PdfService } from "@/services/pdf.service";
import { logger } from "@/lib/logger/logger";

const connection = new Redis(process.env.REDIS_URL || "redis://localhost:6379", {
  maxRetriesPerRequest: null,
});

// Search Sync Worker
export const searchWorker = new Worker(
  "search-sync",
  async (job) => {
    logger.info({ jobId: job.id, organizationId: job.data.organizationId }, "Processing Search Sync");
    // Underneath, this now uses Meilisearch with true async durability
    await SearchService.syncOrganization(job.data.organizationId);
  },
  { connection: connection as any, concurrency: 10 } // Scale concurrency based on CPU
);

searchWorker.on("failed", (job, err) => {
  logger.error({ jobId: job?.id, error: err.message }, "Search Sync Failed");
});

// PDF Generation Worker
export const pdfWorker = new Worker(
  "pdf-generation",
  async (job) => {
    logger.info({ jobId: job.id, type: job.data.type, entityId: job.data.entityId }, "Generating PDF");
    if (job.data.type === "CERTIFICATE") {
      await PdfService.generateCertificatePdf(job.data.entityId);
    } else {
      await PdfService.generateInspectionReportPdf(job.data.entityId);
    }
  },
  { connection: connection as any, concurrency: 5 } // PDF generation is CPU heavy, lower concurrency
);

logger.info("BullMQ Workers Initialized.");
