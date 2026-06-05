import { PrismaClient } from "@prisma/client";
import Redis from "ioredis";

const prisma = new PrismaClient();
const redis = new Redis(process.env.REDIS_URL || "redis://localhost:6379");

export async function createApiKey(name: string) {
  // In production, use crypto.randomBytes to generate key and only store the hash
  const rawKey = `bqms_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
  // Mock hashing for demonstration
  const apiKeyHash = Buffer.from(rawKey).toString('base64'); 

  const client = await prisma.apiClient.create({
    data: {
      name,
      apiKeyHash,
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
  const client = await prisma.apiClient.findUnique({
    where: { apiKeyHash }
  });

  const limit = client?.rateLimit || 1000;

  if (currentCount > limit) {
    return { allowed: false, limit, currentCount };
  }

  return { allowed: true, limit, currentCount };
}
