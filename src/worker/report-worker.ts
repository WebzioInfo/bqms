import { Worker, Job } from "bullmq";
import Redis from "ioredis";
import { PrismaClient } from "@prisma/client";
import { ReportGeneratorService, ExportFormat } from "../lib/reports";

const connection = new Redis(process.env.REDIS_URL || "redis://localhost:6379", { maxRetriesPerRequest: null });
const prisma = new PrismaClient();

const reportWorker = new Worker(
  "scheduled-reports",
  async (job: Job) => {
    // This job is usually dispatched by a separate CRON trigger
    const { scheduleId } = job.data;
    console.log(`[ReportWorker] Generating scheduled report ${scheduleId}`);

    const schedule = await prisma.scheduledReport.findUnique({
      where: { id: scheduleId }
    });

    if (!schedule || !schedule.isActive) {
      console.log(`[ReportWorker] Schedule inactive or not found`);
      return;
    }

    // Determine data based on reportType
    let reportData;
    if (schedule.reportType === "MONTHLY_QC") {
      const reports = await prisma.waterTestReport.findMany({
        where: { companyId: schedule.organizationId },
        include: { batch: true, company: true }
      });
      reportData = {
        title: "Monthly QC Summary",
        headers: ["Report No", "Status", "Batch"],
        rows: reports.map(r => [r.reportNumber, r.status, r.batch.batchNumber]),
        metadata: { GeneratedAt: new Date().toISOString() }
      };
    } else {
      console.log(`[ReportWorker] Unsupported report type: ${schedule.reportType}`);
      return;
    }

    // Generate
    const buffer = await ReportGeneratorService.generate(reportData, schedule.format.toLowerCase() as ExportFormat);

    // Deliver
    if (schedule.deliveryMethod === "EMAIL") {
      console.log(`[ReportWorker] Mock Emailing report to ${schedule.recipients.join(", ")}`);
      // Here you would use Nodemailer
    } else if (schedule.deliveryMethod === "WEBHOOK") {
      console.log(`[ReportWorker] Mock Webhooking report to ${schedule.recipients.join(", ")}`);
    }

  },
  { connection: connection as any }
);

reportWorker.on("completed", (job) => console.log(`[ReportWorker] Job ${job.id} completed.`));
reportWorker.on("failed", (job, err) => console.error(`[ReportWorker] Job ${job?.id} failed:`, err));

console.log("Scheduled Report Worker is running...");
