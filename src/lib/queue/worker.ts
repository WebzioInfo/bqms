import prisma from "../prisma";

export function startReminderWorker() {
  // Prevent duplicate intervals in Next.js HMR/Dev mode
  const globalAny = global as any;
  if (globalAny.isWorkerStarted) {
    console.log("Reminder worker already running.");
    return;
  }
  globalAny.isWorkerStarted = true;

  console.log("Initializing Pending Lab Test Reminder Worker...");
  
  // Run checks immediately, and then every 60 seconds
  checkPendingLabTests().catch(err => console.error("Error in reminder worker initial run:", err));
  
  setInterval(async () => {
    try {
      await checkPendingLabTests();
    } catch (err) {
      console.error("Error in reminder worker loop:", err);
    }
  }, 60000);
}

export async function checkPendingLabTests() {
  const now = new Date();
  const nowTime = now.getTime();

  // Find all pending tests that are not COMPLETED
  const pendingTests = await prisma.pendingLabTest.findMany({
    where: { status: { not: "COMPLETED" } },
    include: { report: true }
  });

  for (const test of pendingTests) {
    // 1. Check if the result has actually been entered in the database since the last check
    const result = await prisma.waterTestResult.findFirst({
      where: {
        reportId: test.reportId,
        parameter: {
          name: test.parameterName
        }
      }
    });

    const isEntered = result && (
      result.stringValue !== null && result.stringValue !== "" && result.stringValue !== "Not Entered" ||
      result.value !== null
    );

    if (isEntered) {
      // Result has been entered! Mark completed.
      await prisma.pendingLabTest.update({
        where: { id: test.id },
        data: {
          status: "COMPLETED",
          completedAt: result.updatedAt || now,
          completedBy: result.updatedBy || "System Poller",
          completionNotes: "Result detected automatically by system monitor."
        }
      });

      // Clear related notifications
      await prisma.notification.deleteMany({
        where: {
          reportId: test.reportId,
          parameterName: test.parameterName
        }
      });
      continue;
    }

    // 2. Otherwise, update status based on current time
    const dueTime = new Date(test.dueAt).getTime();
    const diffMs = dueTime - nowTime;
    const diffHours = diffMs / (1000 * 60 * 60);

    let newStatus = "WAITING";
    if (diffMs <= 0) {
      newStatus = "OVERDUE";
    } else if (diffHours <= 2) {
      // Within 2 hours of due
      newStatus = "DUE_SOON";
    }

    // If status changed, update it
    if (newStatus !== test.status) {
      await prisma.pendingLabTest.update({
        where: { id: test.id },
        data: { status: newStatus }
      });
    }

    // 3. Reminder rules: Send notification if OVERDUE
    if (newStatus === "OVERDUE") {
      let shouldRemind = false;
      const lastReminder = test.lastReminderAt ? new Date(test.lastReminderAt).getTime() : 0;
      const overdueMs = nowTime - dueTime;
      const overdueHours = overdueMs / (1000 * 60 * 60);

      if (test.reminderCount === 0) {
        // Send first reminder immediately when due time is reached
        shouldRemind = true;
      } else if (test.reminderCount === 1 && overdueHours >= 6) {
        // Send second reminder after 6 hours
        shouldRemind = true;
      } else if (test.reminderCount >= 2 && (nowTime - lastReminder >= 24 * 60 * 60 * 1000)) {
        // Send subsequent reminders every 24 hours
        shouldRemind = true;
      }

      if (shouldRemind) {
        // Create active notification
        const hoursAgoStr = overdueHours < 1 
          ? "just now" 
          : `${Math.round(overdueHours)} hour${Math.round(overdueHours) > 1 ? "s" : ""} ago`;

        const reportNum = test.report.id.substring(0, 8).toUpperCase();
        const message = `Batch ${test.report.batchNumber || "N/A"}\nReport ID RPT-${reportNum}\n${test.parameterName} result should have been entered ${hoursAgoStr}.\nPlease update the report.`;

        await prisma.notification.create({
          data: {
            organizationId: test.report.organizationId,
            reportId: test.reportId,
            parameterName: test.parameterName,
            title: "Laboratory Test Result Pending",
            message: message,
            isRead: false
          }
        });

        // Update reminder count and timestamp
        await prisma.pendingLabTest.update({
          where: { id: test.id },
          data: {
            reminderCount: test.reminderCount + 1,
            lastReminderAt: now
          }
        });
      }
    }
  }
}
