import { Queue } from "bullmq";
import Redis from "ioredis";

// Centralized Redis Connection
const connection = new Redis(process.env.REDIS_URL || "redis://localhost:6379", {
  maxRetriesPerRequest: null,
});

// Define distributed queues
export const SearchSyncQueue = new Queue("search-sync", { connection: connection as any });
export const ErpSyncQueue = new Queue("erp-sync", { connection: connection as any });
export const PdfGenerationQueue = new Queue("pdf-generation", { connection: connection as any });
export const TrustScoreQueue = new Queue("trust-score", { connection: connection as any });
export const WaterTestRemindersQueue = new Queue("water-test-reminders", { connection: connection as any });
export const OutboundWebhooksQueue = new Queue("outbound-webhooks", { connection: connection as any });
export const ScheduledReportsQueue = new Queue("scheduled-reports", { connection: connection as any });

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

export async function dispatchWaterTestReminder(reportId: string, reminderType: string, delayMs: number) {
  return WaterTestRemindersQueue.add(
    "send-reminder",
    { reportId, reminderType },
    {
      delay: delayMs > 0 ? delayMs : 0,
      jobId: `reminder-${reportId}-${reminderType}`,
      removeOnComplete: true,
    }
  );
}

export async function cancelWaterTestReminders(reportId: string) {
  // A simplistic approach: we can't easily fetch by partial ID in standard BullMQ without iterating,
  // but if we know the exact jobIds, we can remove them.
  const types = ['24h', '12h', '6h', '2h', 'due'];
  for (const type of types) {
    const job = await WaterTestRemindersQueue.getJob(`reminder-${reportId}-${type}`);
    if (job) await job.remove();
  }
}

export async function dispatchWebhookEvent(eventName: string, organizationId: string, payload: any) {
  return OutboundWebhooksQueue.add(
    "dispatch-webhook",
    { eventName, organizationId, payload },
    {
      attempts: 5,
      backoff: { type: "exponential", delay: 5000 },
      removeOnComplete: true,
      removeOnFail: false // We keep failed webhooks for DLQ inspection
    }
  );
}

