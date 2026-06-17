import { Worker, Job } from "bullmq";
import Redis from "ioredis";
import { PrismaClient } from "@prisma/client";

const connection = new Redis(process.env.REDIS_URL || "redis://localhost:6379", { maxRetriesPerRequest: null });
const prisma = new PrismaClient();

// Water Test Reminders Worker
const reminderWorker = new Worker(
  "water-test-reminders",
  async (job: Job) => {
    const { reportId, reminderType } = job.data;
    console.log(`[Worker] Processing reminder ${reminderType} for report ${reportId}`);

    const report = await prisma.waterTestReport.findUnique({
      where: { id: reportId },
      include: { creator: true, company: true }
    });

    if (!report || report.status === "COMPLETED" || report.status === "FAILED") {
      console.log(`[Worker] Report ${reportId} already completed or deleted. Skipping reminder.`);
      return;
    }

    // Insert an in-app notification or audit log for the reminder
    await prisma.auditLog.create({
      data: {
        action: "REMINDER_SENT",
        entity: "WaterTestReport",
        entityId: report.id,
        details: `Reminder type: ${reminderType}. Status: ${report.status}`,
      }
    });

    // In a full implementation, you'd send an email via Nodemailer here
    console.log(`[Worker] Sent ${reminderType} reminder for ${report.reportNumber}`);
  },
  { connection: connection as any }
);

// Overdue Escalations Cron Worker
const overdueWorker = new Worker(
  "overdue-escalations",
  async () => {
    console.log("[Worker] Running overdue escalations cron...");
    const now = new Date();
    
    // Find all overdue reports that are not completed
    const overdueReports = await prisma.waterTestReport.findMany({
      where: {
        status: { notIn: ["COMPLETED", "FAILED"] },
        dueDate: { lt: now }
      }
    });

    for (const report of overdueReports) {
      if (!report.dueDate) continue;

      const hoursOverdue = (now.getTime() - report.dueDate.getTime()) / 3600000;
      
      let escalationLevel = "None";
      if (hoursOverdue >= 72) escalationLevel = "CRITICAL (72h+)";
      else if (hoursOverdue >= 48) escalationLevel = "HIGH (48h+)";
      else if (hoursOverdue >= 24) escalationLevel = "MEDIUM (24h+)";
      
      if (escalationLevel !== "None") {
        console.log(`[Worker] ESCALATION ${escalationLevel} for Report ${report.reportNumber}`);
        
        await prisma.auditLog.create({
          data: {
            action: "ESCALATION_TRIGGERED",
            entity: "WaterTestReport",
            entityId: report.id,
            details: `Escalation: ${escalationLevel}. ${Math.floor(hoursOverdue)} hours overdue.`,
          }
        });
      }
    }
  },
  { connection: connection as any }
);

reminderWorker.on("completed", (job) => console.log(`[Worker] Job ${job.id} completed.`));
reminderWorker.on("failed", (job, err) => console.error(`[Worker] Job ${job?.id} failed:`, err));

overdueWorker.on("completed", (job) => console.log(`[Worker] Cron job ${job.id} completed.`));
overdueWorker.on("failed", (job, err) => console.error(`[Worker] Cron job ${job?.id} failed:`, err));

console.log("Water Test Worker is running...");
