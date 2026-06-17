"use server";

import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { WaterTestStatus } from "@prisma/client";
import { dispatchWaterTestReminder, cancelWaterTestReminders, dispatchWebhookEvent } from "@/lib/queue/queues";

function generateReportNumber(companyId: string) {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const randomStr = Math.floor(1000 + Math.random() * 9000);
  return `WTR-${dateStr}-${randomStr}`;
}

export async function createWaterTestReport(data: {
  batchId: string;
  companyId: string;
  productionDate: Date;
  sampleCollectedDate?: Date;
  sampleCollectedBy?: string;
  laboratoryName?: string;
  expectedTurnaroundHours: number;
}) {
  const session = await getServerSession(authOptions);
  if (!session) throw new Error("Unauthorized");
  // @ts-ignore
  const userId = session.user.id;

  const dueDate = data.sampleCollectedDate 
    ? new Date(new Date(data.sampleCollectedDate).getTime() + data.expectedTurnaroundHours * 60 * 60 * 1000)
    : undefined;

  const report = await prisma.waterTestReport.create({
    data: {
      reportNumber: generateReportNumber(data.companyId),
      batchId: data.batchId,
      companyId: data.companyId,
      productionDate: data.productionDate,
      sampleCollectedDate: data.sampleCollectedDate,
      sampleCollectedBy: data.sampleCollectedBy,
      laboratoryName: data.laboratoryName,
      status: "PENDING",
      dueDate,
      createdBy: userId,
    }
  });

  await prisma.auditLog.create({
    data: {
      userId,
      action: "CREATED_WATER_TEST_REPORT",
      entity: "WaterTestReport",
      entityId: report.id,
      details: `Created report ${report.reportNumber} for batch ${data.batchId}`
    }
  });

  // Schedule BullMQ jobs for reminders
  if (dueDate) {
    const dueTime = dueDate.getTime();
    const now = Date.now();
    
    // 24h before
    if (dueTime - 24 * 3600000 > now) dispatchWaterTestReminder(report.id, "24h", dueTime - 24 * 3600000 - now);
    // 12h before
    if (dueTime - 12 * 3600000 > now) dispatchWaterTestReminder(report.id, "12h", dueTime - 12 * 3600000 - now);
    // 6h before
    if (dueTime - 6 * 3600000 > now) dispatchWaterTestReminder(report.id, "6h", dueTime - 6 * 3600000 - now);
    // 2h before
    if (dueTime - 2 * 3600000 > now) dispatchWaterTestReminder(report.id, "2h", dueTime - 2 * 3600000 - now);
    // at due time
    if (dueTime > now) dispatchWaterTestReminder(report.id, "due", dueTime - now);
  }

  // Dispatch Webhook
  await dispatchWebhookEvent("water_test.created", data.companyId, {
    reportId: report.id,
    reportNumber: report.reportNumber,
    batchId: report.batchId
  });

  return report;
}

export async function updateWaterTestReportStatus(reportId: string, newStatus: WaterTestStatus) {
  const session = await getServerSession(authOptions);
  if (!session) throw new Error("Unauthorized");
  // @ts-ignore
  const userId = session.user.id;

  const report = await prisma.waterTestReport.findUnique({ where: { id: reportId }});
  if (!report) throw new Error("Not found");

  const updated = await prisma.waterTestReport.update({
    where: { id: reportId },
    data: { status: newStatus }
  });

  await prisma.auditLog.create({
    data: {
      userId,
      action: "STATUS_CHANGE_WATER_TEST",
      entity: "WaterTestReport",
      entityId: reportId,
      details: `Status changed from ${report.status} to ${newStatus}`
    }
  });

  return updated;
}

export async function saveWaterTestResults(reportId: string, results: Array<{ parameterId: string; testResult: number; remarks?: string }>) {
  const session = await getServerSession(authOptions);
  if (!session) throw new Error("Unauthorized");
  // @ts-ignore
  const userId = session.user.id;

  const report = await prisma.waterTestReport.findUnique({
    where: { id: reportId },
    include: { company: { include: { waterTestParams: true } } }
  });

  if (!report) throw new Error("Report not found");

  const paramsMap = new Map(report.company.waterTestParams.map(p => [p.id, p]));

  let overallPass = true;

  const resultPromises = results.map(async (r) => {
    const param = paramsMap.get(r.parameterId);
    if (!param) return;

    let isPass = true;
    if (param.acceptableMin !== null && r.testResult < param.acceptableMin) isPass = false;
    if (param.acceptableMax !== null && r.testResult > param.acceptableMax) isPass = false;

    if (!isPass) overallPass = false;

    return prisma.waterTestResult.upsert({
      where: { reportId_parameterId: { reportId, parameterId: r.parameterId } },
      create: {
        reportId,
        parameterId: r.parameterId,
        testResult: r.testResult,
        isPass,
        remarks: r.remarks
      },
      update: {
        testResult: r.testResult,
        isPass,
        remarks: r.remarks
      }
    });
  });

  await Promise.all(resultPromises);

  const finalStatus = overallPass ? "COMPLETED" : "FAILED";

  await prisma.waterTestReport.update({
    where: { id: reportId },
    data: { 
      status: finalStatus,
      resultEnteredDate: new Date()
    }
  });

  await prisma.auditLog.create({
    data: {
      userId,
      action: "ENTERED_WATER_TEST_RESULTS",
      entity: "WaterTestReport",
      entityId: reportId,
      details: `Results entered. Overall status: ${finalStatus}`
    }
  });

  // Cleanup BullMQ reminders
  await cancelWaterTestReminders(reportId);

  // Dispatch Webhook based on compliance
  const eventName = finalStatus === "COMPLETED" ? "water_test.passed" : "water_test.failed";
  await dispatchWebhookEvent(eventName, report.companyId, {
    reportId: report.id,
    reportNumber: report.reportNumber,
    batchId: report.batchId,
    status: finalStatus
  });

  return finalStatus;
}
