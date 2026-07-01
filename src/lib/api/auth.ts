import prisma from "@/lib/prisma";
import crypto from "crypto";
import { NextResponse } from "next/server";

export interface ApiAuthResult {
  isAuthenticated: boolean;
  organizationId?: string;
  apiKeyId?: string;
  errorResponse?: NextResponse;
}

/**
 * Authenticates the incoming request using Bearer tokens or X-API-Key headers.
 * Resolves the organization, checks rate limits, and updates metadata.
 */
export async function authenticateApiRequest(req: Request): Promise<ApiAuthResult> {
  try {
    const authHeader = req.headers.get("authorization");
    const xApiKey = req.headers.get("x-api-key");
    
    let token = "";
    if (authHeader && authHeader.toLowerCase().startsWith("bearer ")) {
      token = authHeader.substring(7).trim();
    } else if (xApiKey) {
      token = xApiKey.trim();
    }

    if (!token) {
      return {
        isAuthenticated: false,
        errorResponse: NextResponse.json(
          { error: "Unauthorized. Missing API key." },
          { status: 401 }
        )
      };
    }

    // Look up API Key record
    const hashed = crypto.createHash("sha256").update(token).digest("hex");
    const apiKeyRecord = await prisma.apiKey.findFirst({
      where: {
        OR: [
          { apiKey: token },
          { keyHash: hashed }
        ],
        isActive: true,
        subscription: {
          status: "ACTIVE"
        }
      },
      include: {
        subscription: {
          include: {
            product: true
          }
        }
      }
    });

    if (!apiKeyRecord) {
      return {
        isAuthenticated: false,
        errorResponse: NextResponse.json(
          { error: "Forbidden. Invalid or inactive API key." },
          { status: 403 }
        )
      };
    }

    const orgId = apiKeyRecord.organizationId;
    
    // Rate Limiting Check (hourly limit)
    const rateLimit = apiKeyRecord.subscription.product.rateLimit;
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    
    const requestCount = await prisma.apiRequestLog.count({
      where: {
        organizationId: orgId,
        createdAt: { gte: oneHourAgo }
      }
    });

    if (requestCount >= rateLimit) {
      // Log limit violation
      await logRequest(orgId, apiKeyRecord.id, req, 429);
      return {
        isAuthenticated: false,
        errorResponse: NextResponse.json(
          { error: "Too Many Requests. Hourly rate limit exceeded." },
          { status: 429 }
        )
      };
    }

    // Update last used at timestamp asynchronously
    prisma.apiKey.update({
      where: { id: apiKeyRecord.id },
      data: { lastUsedAt: new Date() }
    }).catch(err => console.error("Error updating key usage timestamp:", err));

    return {
      isAuthenticated: true,
      organizationId: orgId,
      apiKeyId: apiKeyRecord.id
    };
  } catch (error) {
    console.error("API Auth Middleware Error:", error);
    return {
      isAuthenticated: false,
      errorResponse: NextResponse.json(
        { error: "Internal Server Error during authentication." },
        { status: 500 }
      )
    };
  }
}

/**
 * Helper to log REST requests to the ApiRequestLog model.
 */
export async function logRequest(
  orgId: string,
  apiKeyId: string | null,
  req: Request,
  statusCode: number
) {
  try {
    const ip = req.headers.get("x-forwarded-for") || "127.0.0.1";
    const userAgent = req.headers.get("user-agent") || "";
    const method = req.method;
    const path = new URL(req.url).pathname;

    await prisma.apiRequestLog.create({
      data: {
        organizationId: orgId,
        apiKeyId,
        ipAddress: ip.split(",")[0].trim(),
        userAgent,
        method,
        path,
        statusCode
      }
    });
  } catch (error) {
    console.error("Error writing API request log:", error);
  }
}
