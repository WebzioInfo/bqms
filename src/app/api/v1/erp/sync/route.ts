import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import crypto from "crypto";
import { ErpSyncPayloadSchema } from "@/lib/validations/erp-validation";


const MAX_TIME_DIFFERENCE_MS = 5 * 60 * 1000; // 5 minutes replay protection

export async function POST(req: Request) {
  const startTime = Date.now();
  let syncStatus = "SUCCESS";
  let errorDetails = null;
  let recordsSynced = 0;

  try {
    const signature = req.headers.get("x-bqms-signature");
    if (!signature) {
      return NextResponse.json({ error: "Missing signature" }, { status: 401 });
    }

    const rawBody = await req.text();
    const secret = process.env.ERP_WEBHOOK_SECRET || "default_dev_secret"; // Fallback for dev

    // Verify HMAC-SHA256 signature
    const expectedSignature = crypto.createHmac("sha256", secret).update(rawBody).digest("hex");
    if (crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature)) === false) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const data = JSON.parse(rawBody);

    // Validate Zod Schema
    const validationResult = ErpSyncPayloadSchema.safeParse(data);
    if (!validationResult.success) {
      syncStatus = "FAILED";
      errorDetails = validationResult.error.message;
      return NextResponse.json({ error: "Invalid payload", details: validationResult.error.issues }, { status: 400 });
    }

    const validData = validationResult.data;

    // Verify Timestamp for Replay Attack Prevention
    const currentTime = Date.now();
    if (Math.abs(currentTime - validData.timestamp) > MAX_TIME_DIFFERENCE_MS) {
      syncStatus = "FAILED";
      errorDetails = "Timestamp out of bounds (Replay attack prevention)";
      return NextResponse.json({ error: "Request expired" }, { status: 401 });
    }

    // Upsert organization data from ERP
    const org = await prisma.organization.upsert({
      where: { erpReferenceId: validData.erpReferenceId },
      update: {
        name: validData.name,
        type: validData.type,
      },
      create: {
        name: validData.name,
        slug: validData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''),
        type: validData.type,
        erpReferenceId: validData.erpReferenceId,
      }
    });

    recordsSynced = 1;
    return NextResponse.json({ success: true, org });
  } catch (error: any) {
    syncStatus = "FAILED";
    errorDetails = error.message;
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  } finally {
    // Phase 3 requirement: Log the sync attempt
    await prisma.eRPSyncLog.create({
      data: {
        status: syncStatus,
        recordsSynced,
        errorDetails,
      }
    });
  }
}
