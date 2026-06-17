import prisma from "@/lib/prisma";
import { PrismaClient } from "@prisma/client";
import Redis from "ioredis";


const redis = new Redis(process.env.REDIS_URL || "redis://localhost:6379");

import crypto from "crypto";

export async function createApiKey(name: string, organizationId: string) {
  const rawKey = `bqms_${crypto.randomBytes(24).toString("hex")}`;
  const apiSecretHash = crypto.createHash("sha256").update(rawKey).digest("hex");

  const client = await prisma.apiCredential.create({
    data: {
      organizationId,
      name,
      apiKey: rawKey,
      apiSecretHash,
      rateLimit: 1000 // default
    }
  });

  return { rawKey, client };
}

export async function checkRateLimit(apiKeyHash: string) {
  const currentWindow = Math.floor(Date.now() / 60000); // 1 minute window
  const key = `rate_limit:${apiKeyHash}:${currentWindow}`;
  
  const currentCount = await redis.incr(key);
  
  if (currentCount === 1) {
    await redis.expire(key, 60);
  }

  // Fetch client limit (ideally cached)
  const client = await prisma.apiCredential.findFirst({
    where: { apiSecretHash: apiKeyHash }
  });

  const limit = client?.rateLimit || 1000;

  if (currentCount > limit) {
    return { allowed: false, limit, currentCount };
  }

  return { allowed: true, limit, currentCount };
}
