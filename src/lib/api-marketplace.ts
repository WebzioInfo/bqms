import prisma from "@/lib/prisma";
import { PrismaClient } from "@prisma/client";
import Redis from "ioredis";


const redis = new Redis(process.env.REDIS_URL || "redis://localhost:6379", {
  retryStrategy: (times) => {
    if (times > 3) return null; // Stop retrying after 3 attempts
    return Math.min(times * 50, 2000);
  }
});

redis.on("error", (err) => {
  // Suppress connection errors in console to avoid spam
});
import crypto from "crypto";

export async function createApiKey(name: string, organizationId: string, subscriptionId: string) {
  const rawKey = `bqms_${crypto.randomBytes(24).toString("hex")}`;
  const keyHash = crypto.createHash("sha256").update(rawKey).digest("hex");

  const apiKey = await prisma.apiKey.create({
    data: {
      organizationId,
      subscriptionId,
      name,
      keyHash,
    }
  });

  return { rawKey, apiKey };
}

export async function checkRateLimit(apiKeyHash: string) {
  const currentWindow = Math.floor(Date.now() / 60000); // 1 minute window
  const key = `rate_limit:${apiKeyHash}:${currentWindow}`;
  
  const currentCount = await redis.incr(key);
  
  if (currentCount === 1) {
    await redis.expire(key, 60);
  }

  // Fetch API key and its subscription's product rate limit
  const apiKey = await prisma.apiKey.findUnique({
    where: { keyHash: apiKeyHash },
    include: { subscription: { include: { product: true } } }
  });

  const limit = apiKey?.subscription?.product?.rateLimit || 1000;

  if (currentCount > limit) {
    return { allowed: false, limit, currentCount };
  }

  return { allowed: true, limit, currentCount };
}
