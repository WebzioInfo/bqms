"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { Role } from "@prisma/client";
import { requireAnyRole, errorMessage } from "@/lib/auth/tenant-access";
import { evaluateParameterResult } from "@/lib/quality/evaluation-service";

function getDueSince(dueAt: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - dueAt.getTime();
  const diffHours = Math.abs(diffMs) / (1000 * 60 * 60);

  if (diffMs > 0) {
    // Overdue
    if (diffHours < 1) return "Just now";
    if (diffHours < 24) {
      const h = Math.round(diffHours);
      return `Due ${h} Hour${h > 1 ? "s" : ""} Ago`;
    }
    const d = Math.round(diffHours / 24);
    if (d === 1) return "Due Yesterday";
    return `Due ${d} Days Ago`;
  } else {
    // Scheduled
    if (diffHours < 1) return "Due in minutes";
    if (diffHours < 24) {
      const h = Math.round(diffHours);
      return `Due in ${h} Hour${h > 1 ? "s" : ""}`;
    }
    const d = Math.round(diffHours / 24);
    return `Due in ${d} Day${d > 1 ? "s" : ""}`;
  }
}

function getPriority(dueAt: Date): "Critical" | "High" | "Medium" {
  const now = new Date();
  const diffMs = now.getTime() - dueAt.getTime();
  if (diffMs <= 0) return "Medium";
  const diffHours = diffMs / (1000 * 60 * 60);
  if (diffHours >= 24) return "Critical";
  return "High";
}

export async function getPendingLabTestsForDashboard() {
  try {
    const user = await requireAnyRole([Role.PLATFORM_ADMIN, Role.COMPANY_ADMIN, Role.QC]);
    const organizationId = user.organizationId;
    if (!organizationId) return { success: true, data: [] };

    // Find all pending tests that are not COMPLETED for user's organization
    const list = await prisma.pendingLabTest.findMany({
      where: {
        status: { not: "COMPLETED" },
        report: {
          organizationId: organizationId,
          isActive: true
        }
      },
      include: {
        report: true
      },
      orderBy: {
        dueAt: 'asc'
      }
    });

    const mapped = list.map(test => ({
      id: test.id,
      reportId: test.reportId,
      reportNumber: test.report.id.substring(0, 8).toUpperCase(),
      batchNumber: test.report.batchNumber,
      parameterName: test.parameterName,
      dueAt: test.dueAt,
      dueSince: getDueSince(test.dueAt),
      priority: getPriority(test.dueAt)
    }));

    return { success: true, data: mapped };
  } catch (error) {
    return { success: false, error: errorMessage(error) };
  }
}

export async function enterPendingTestResult(
  pendingTestId: string, 
  data: { value?: string; stringValue?: string; completionNotes?: string }
) {
  try {
    const user = await requireAnyRole([Role.COMPANY_ADMIN, Role.QC]);
    
    // Find the pending test and report
    const pendingTest = await prisma.pendingLabTest.findUnique({
      where: { id: pendingTestId },
      include: { report: true }
    });

    if (!pendingTest) {
      return { success: false, error: "Pending test not found." };
    }

    if (pendingTest.report.organizationId !== user.organizationId) {
      return { success: false, error: "Unauthorized access." };
    }

    const { value, stringValue, completionNotes } = data;

    // Find the parameter in database by name
    const dbParam = await prisma.waterTestParameter.findFirst({
      where: { name: pendingTest.parameterName }
    });

    if (!dbParam) {
      return { success: false, error: `Parameter ${pendingTest.parameterName} not found in database.` };
    }

    const val = value !== "" && value !== undefined && value !== null ? parseFloat(value) : null;
    const strVal = stringValue || null;
    const qualityStatus = evaluateParameterResult(dbParam.name, val, strVal);

    await prisma.$transaction(async (tx) => {
      // Create or update result
      await tx.waterTestResult.upsert({
        where: {
          reportId_parameterId: {
            reportId: pendingTest.reportId,
            parameterId: dbParam.id
          }
        },
        update: {
          value: val,
          stringValue: strVal,
          qualityStatus,
          isPass: qualityStatus === "PASS",
          updatedBy: user.name || user.email || user.id
        },
        create: {
          reportId: pendingTest.reportId,
          parameterId: dbParam.id,
          value: val,
          stringValue: strVal,
          qualityStatus,
          isPass: qualityStatus === "PASS",
          createdBy: user.name || user.email || user.id
        }
      });

      // Update PendingLabTest
      await tx.pendingLabTest.update({
        where: { id: pendingTestId },
        data: {
          status: "COMPLETED",
          completedAt: new Date(),
          completedBy: user.name || user.email || user.id,
          completionNotes: completionNotes || "Completed via Quick Entry."
        }
      });

      // Clear notifications
      await tx.notification.deleteMany({
        where: {
          reportId: pendingTest.reportId,
          parameterName: pendingTest.parameterName
        }
      });
    });

    // Revalidate paths
    revalidatePath("/test-reports");
    revalidatePath(`/test-reports/${pendingTest.reportId}`);
    revalidatePath("/");

    return { success: true };
  } catch (error) {
    return { success: false, error: errorMessage(error) };
  }
}

export async function getNotifications() {
  try {
    const user = await requireAnyRole([Role.PLATFORM_ADMIN, Role.COMPANY_ADMIN, Role.QC]);
    const organizationId = user.organizationId;
    if (!organizationId) return { success: true, data: [] };

    const list = await prisma.notification.findMany({
      where: { organizationId },
      orderBy: { createdAt: 'desc' },
      take: 50
    });

    return { success: true, data: list };
  } catch (error) {
    return { success: false, error: errorMessage(error) };
  }
}

export async function markNotificationAsRead(id: string) {
  try {
    const user = await requireAnyRole([Role.PLATFORM_ADMIN, Role.COMPANY_ADMIN, Role.QC]);
    
    const notification = await prisma.notification.findUnique({ where: { id } });
    if (!notification) return { success: false, error: "Notification not found." };
    
    if (notification.organizationId !== user.organizationId) {
      return { success: false, error: "Unauthorized access." };
    }

    await prisma.notification.update({
      where: { id },
      data: { isRead: true }
    });

    revalidatePath("/");
    return { success: true };
  } catch (error) {
    return { success: false, error: errorMessage(error) };
  }
}

export async function markAllNotificationsAsRead() {
  try {
    const user = await requireAnyRole([Role.PLATFORM_ADMIN, Role.COMPANY_ADMIN, Role.QC]);
    const organizationId = user.organizationId;
    if (!organizationId) return { success: true };

    await prisma.notification.updateMany({
      where: { organizationId, isRead: false },
      data: { isRead: true }
    });

    revalidatePath("/");
    return { success: true };
  } catch (error) {
    return { success: false, error: errorMessage(error) };
  }
}
