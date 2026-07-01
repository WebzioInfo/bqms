"use server";

import prisma from "@/lib/prisma";
import crypto from "crypto";
import { Role } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { requireAnyRole, resolveWritableOrganizationId, errorMessage } from "@/lib/auth/tenant-access";

export async function subscribeToPlan(productId: string) {
  try {
    const user = await requireAnyRole([Role.COMPANY_ADMIN, Role.PLATFORM_ADMIN]);
    const targetOrgId = user.organizationId;
    
    // Fetch organization if possible
    const organization = targetOrgId 
      ? await prisma.organization.findUnique({ where: { id: targetOrgId } })
      : null;

    // Runtime Debugging logs as requested:
    console.log("=== [TRACE FLOW: SUBSCRIBE] ===");
    console.log("Authenticated User:", user.email || user.id);
    console.log("User.role:", user.role);
    console.log("User.organizationId:", targetOrgId);
    console.log("Resolved Organization:", organization ? organization.name : "None");
    console.log("Organization Exists:", !!organization);
    console.log("Current Tenant:", organization ? organization.name : "Platform Administration");
    console.log("Subscription Organization:", targetOrgId || "None");
    console.log("===============================");

    if (!targetOrgId) {
      return { success: false, error: "You must belong to a company organization to subscribe to an API plan." };
    }

    if (!organization) {
      return { success: false, error: "The associated organization does not exist." };
    }
    if (!organization.isActive) {
      return { success: false, error: "The associated organization is not active." };
    }

    // 1. Check if the organization already has an active subscription
    const existingSubscription = await prisma.apiSubscription.findFirst({
      where: {
        organizationId: targetOrgId,
        status: "ACTIVE"
      },
      include: {
        keys: true,
        product: true
      }
    });

    if (existingSubscription) {
      return { success: true, data: existingSubscription };
    }

    // 2. Otherwise, create a new ApiSubscription
    const product = await prisma.apiProduct.findUnique({
      where: { id: productId }
    });
    if (!product) throw new Error("Plan not found");

    const start = new Date();
    const end = new Date();
    end.setFullYear(end.getFullYear() + 10); // Permanent developer account (10 years validity)

    const subscription = await prisma.$transaction(async (tx) => {
      const sub = await tx.apiSubscription.create({
        data: {
          organizationId: targetOrgId,
          productId: product.id,
          status: "ACTIVE",
          currentPeriodStart: start,
          currentPeriodEnd: end,
          createdBy: user.id,
        }
      });

      // Generate API credentials
      const apiKeyVal = `bk_key_${crypto.randomBytes(16).toString("hex")}`;
      const apiSecretVal = `bk_secret_${crypto.randomBytes(24).toString("hex")}`;
      const keyHash = crypto.createHash("sha256").update(apiSecretVal).digest("hex");

      await tx.apiKey.create({
        data: {
          organizationId: targetOrgId,
          subscriptionId: sub.id,
          name: "Default Integration Key",
          keyHash,
          apiKey: apiKeyVal,
          apiSecret: apiSecretVal,
          createdBy: user.id,
        }
      });

      return tx.apiSubscription.findUnique({
        where: { id: sub.id },
        include: {
          keys: true,
          product: true
        }
      });
    });

    revalidatePath("/api-marketplace");
    return { success: true, data: subscription };
  } catch (error) {
    return { success: false, error: errorMessage(error) };
  }
}

export async function getSubscriptionDetails(organizationId: string) {
  try {
    const user = await requireAnyRole([Role.COMPANY_ADMIN, Role.PLATFORM_ADMIN]);
    const orgId = resolveWritableOrganizationId(user, organizationId);

    const subscription = await prisma.apiSubscription.findFirst({
      where: {
        organizationId: orgId,
        status: "ACTIVE"
      },
      include: {
        keys: true,
        product: true
      }
    });

    if (!subscription) {
      return { success: true, data: null };
    }

    // Get usage statistics
    const totalCalls = await prisma.apiRequestLog.count({
      where: { organizationId: orgId }
    });

    const lastCall = await prisma.apiRequestLog.findFirst({
      where: { organizationId: orgId },
      orderBy: { createdAt: "desc" }
    });

    // Get logs (last 50 requests)
    const logs = await prisma.apiRequestLog.findMany({
      where: { organizationId: orgId },
      orderBy: { createdAt: "desc" },
      take: 50
    });

    return {
      success: true,
      data: {
        subscription,
        metrics: {
          totalCalls,
          lastRequest: lastCall ? lastCall.createdAt : null,
          logs
        }
      }
    };
  } catch (error) {
    return { success: false, error: errorMessage(error) };
  }
}

export async function regenerateApiSecret(keyId: string) {
  try {
    const user = await requireAnyRole([Role.COMPANY_ADMIN, Role.PLATFORM_ADMIN]);
    const targetOrgId = user.organizationId;
    
    if (!targetOrgId) {
      return { success: false, error: "You must belong to a company organization to regenerate keys." };
    }

    const apiKey = await prisma.apiKey.findFirst({
      where: { id: keyId, organizationId: targetOrgId }
    });
    if (!apiKey) throw new Error("API Key not found");

    const newSecretVal = `bk_secret_${crypto.randomBytes(24).toString("hex")}`;
    const newHash = crypto.createHash("sha256").update(newSecretVal).digest("hex");

    await prisma.apiKey.update({
      where: { id: keyId },
      data: {
        keyHash: newHash,
        apiSecret: newSecretVal,
        updatedBy: user.id
      }
    });

    revalidatePath("/api-marketplace");
    return { success: true, newSecret: newSecretVal };
  } catch (error) {
    return { success: false, error: errorMessage(error) };
  }
}

export async function getAdminSubscriptions() {
  try {
    const user = await requireAnyRole([Role.PLATFORM_ADMIN]);

    const subscriptions = await prisma.apiSubscription.findMany({
      include: {
        organization: true,
        product: true,
        keys: true
      },
      orderBy: { createdAt: "desc" }
    });

    // Gather logs & usage for each subscription
    const mapped = await Promise.all(subscriptions.map(async (sub) => {
      const totalCalls = await prisma.apiRequestLog.count({
        where: { organizationId: sub.organizationId }
      });
      const lastCall = await prisma.apiRequestLog.findFirst({
        where: { organizationId: sub.organizationId },
        orderBy: { createdAt: "desc" }
      });
      return {
        ...sub,
        totalCalls,
        lastUsedAt: lastCall ? lastCall.createdAt : null
      };
    }));

    // Gather request logs (global last 100 requests)
    const logs = await prisma.apiRequestLog.findMany({
      include: {
        organization: true
      },
      orderBy: { createdAt: "desc" },
      take: 100
    });

    return { success: true, data: { subscriptions: mapped, logs } };
  } catch (error) {
    return { success: false, error: errorMessage(error) };
  }
}

export async function toggleSubscriptionStatus(subscriptionId: string, status: string) {
  try {
    const user = await requireAnyRole([Role.PLATFORM_ADMIN]);

    const sub = await prisma.apiSubscription.update({
      where: { id: subscriptionId },
      data: { status }
    });

    revalidatePath("/api-marketplace");
    return { success: true, data: sub };
  } catch (error) {
    return { success: false, error: errorMessage(error) };
  }
}
