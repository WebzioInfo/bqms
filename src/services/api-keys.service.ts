import crypto from "crypto";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export class ApiKeyService {
  /**
   * Generates a new API key and stores its SHA-256 hash.
   * Never stores the raw API key.
   */
  static async generateApiKey(name: string, rateLimit: number = 1000) {
    const rawKey = crypto.randomBytes(32).toString("hex");
    const apiKeyHash = crypto.createHash("sha256").update(rawKey).digest("hex");

    const apiClient = await prisma.apiClient.create({
      data: {
        name,
        apiKeyHash,
        rateLimit,
        isActive: true,
      },
    });

    return {
      apiClient,
      rawKey, // This is the ONLY time the raw key is returned. It MUST be shown to the user immediately and never stored.
    };
  }

  /**
   * Validates an incoming raw API key.
   */
  static async validateApiKey(rawKey: string) {
    const hash = crypto.createHash("sha256").update(rawKey).digest("hex");

    const apiClient = await prisma.apiClient.findUnique({
      where: { apiKeyHash: hash },
    });

    if (!apiClient || !apiClient.isActive) {
      return null;
    }

    return apiClient;
  }

  /**
   * Revokes an existing API key.
   */
  static async revokeApiKey(clientId: string) {
    return prisma.apiClient.update({
      where: { id: clientId },
      data: { isActive: false },
    });
  }

  /**
   * Rotates an API key for a given client ID.
   */
  static async rotateApiKey(clientId: string) {
    const rawKey = crypto.randomBytes(32).toString("hex");
    const apiKeyHash = crypto.createHash("sha256").update(rawKey).digest("hex");

    const apiClient = await prisma.apiClient.update({
      where: { id: clientId },
      data: { apiKeyHash },
    });

    return {
      apiClient,
      rawKey,
    };
  }

  /**
   * Tracks API usage and enforces rate limiting.
   * Throws an error if the rate limit is exceeded.
   */
  static async trackUsage(clientId: string, currentUsageCount: number) {
    const client = await prisma.apiClient.findUnique({ where: { id: clientId } });
    if (!client) throw new Error("API Client not found");

    if (!client.isActive) {
      throw new Error("API Key has been revoked");
    }

    if (currentUsageCount >= client.rateLimit) {
      throw new Error(`Rate limit exceeded. Maximum allowed: ${client.rateLimit} requests per window.`);
    }

    // In a real production system, tracking would be offloaded to Redis for high-throughput atomic increments.
    // e.g., await redis.incr(`api_usage:${clientId}`);
    
    return true;
  }
}
