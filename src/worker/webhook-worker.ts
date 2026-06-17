import { Worker, Job } from "bullmq";
import Redis from "ioredis";
import { PrismaClient } from "@prisma/client";
import crypto from "crypto";

const connection = new Redis(process.env.REDIS_URL || "redis://localhost:6379", { maxRetriesPerRequest: null });
const prisma = new PrismaClient();

const webhookWorker = new Worker(
  "outbound-webhooks",
  async (job: Job) => {
    const { eventName, organizationId, payload } = job.data;
    console.log(`[WebhookWorker] Processing event ${eventName} for org ${organizationId}`);

    const subscriptions = await prisma.webhookSubscription.findMany({
      where: {
        organizationId,
        isActive: true,
        events: { has: eventName }
      }
    });

    if (subscriptions.length === 0) {
      console.log(`[WebhookWorker] No active subscriptions for ${eventName}`);
      return;
    }

    const payloadString = JSON.stringify({
      event: eventName,
      timestamp: new Date().toISOString(),
      data: payload
    });

    for (const sub of subscriptions) {
      try {
        const headers: Record<string, string> = {
          'Content-Type': 'application/json',
          'User-Agent': 'BQMS-Webhook-Engine/1.0'
        };

        if (sub.secret) {
          const signature = crypto.createHmac('sha256', sub.secret).update(payloadString).digest('hex');
          headers['X-BQMS-Signature'] = signature;
        }

        const response = await fetch(sub.url, {
          method: 'POST',
          headers,
          body: payloadString
        });

        if (!response.ok) {
          throw new Error(`Endpoint returned status ${response.status}`);
        }
        
        console.log(`[WebhookWorker] Successfully delivered to ${sub.url}`);
      } catch (err: any) {
        console.error(`[WebhookWorker] Failed delivery to ${sub.url}:`, err.message);
        throw err; // Throws to BullMQ to trigger retry/backoff
      }
    }
  },
  { connection: connection as any }
);

webhookWorker.on("completed", (job) => console.log(`[WebhookWorker] Job ${job.id} completed.`));
webhookWorker.on("failed", (job, err) => console.error(`[WebhookWorker] Job ${job?.id} failed (will retry):`, err));

console.log("Outbound Webhook Worker is running...");
