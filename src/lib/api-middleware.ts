import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyApiSecret } from './api-keys';

/**
 * Middleware function to protect API routes with API Key & Secret authentication,
 * IP Whitelisting, and basic Rate Limiting structure.
 */
export async function withApiAuth(req: Request, handler: (req: Request, context: any, credential: any) => Promise<Response>) {
  const apiKey = req.headers.get('x-api-key');
  const apiSecret = req.headers.get('x-api-secret');

  if (!apiKey || !apiSecret) {
    return NextResponse.json({ error: 'Missing API credentials (x-api-key, x-api-secret)' }, { status: 401 });
  }

  // 1. Fetch credential
  const credential = await prisma.apiCredential.findUnique({
    where: { apiKey }
  });

  if (!credential || !credential.isActive) {
    return NextResponse.json({ error: 'Invalid or inactive API Key' }, { status: 401 });
  }

  // 2. Verify Secret
  const isValid = verifyApiSecret(apiSecret, credential.apiSecretHash);
  if (!isValid) {
    return NextResponse.json({ error: 'Invalid API Secret' }, { status: 401 });
  }

  // 3. IP Whitelisting
  const clientIp = req.headers.get('x-forwarded-for') || 'unknown';
  if (credential.ipWhitelist && credential.ipWhitelist.length > 0) {
    if (!credential.ipWhitelist.includes(clientIp) && clientIp !== 'unknown') {
      return NextResponse.json({ error: 'IP Address not whitelisted' }, { status: 403 });
    }
  }

  // 4. Rate Limiting (Naïve approach for demonstration, production should use Redis INCR)
  // We skip strict rate limiting here to keep the demo simple, but we would normally:
  // const currentCount = await redis.incr(`rate-limit:${credential.id}`);
  // if (currentCount > credential.rateLimit) return 429 Too Many Requests;

  const start = Date.now();
  
  try {
    // 5. Execute handler
    const response = await handler(req, {}, credential);
    
    // 6. Log Usage (Async, non-blocking)
    const responseTime = Date.now() - start;
    logApiUsage(credential.id, req.url, req.method, response.status, responseTime, clientIp).catch(console.error);

    return response;
  } catch (error: any) {
    const responseTime = Date.now() - start;
    logApiUsage(credential.id, req.url, req.method, 500, responseTime, clientIp).catch(console.error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

async function logApiUsage(credentialId: string, url: string, method: string, statusCode: number, responseTimeMs: number, ipAddress: string) {
  // Extract path from URL to avoid logging full domain strings if desired
  let endpoint = url;
  try {
    endpoint = new URL(url).pathname;
  } catch (e) {}

  await prisma.apiUsageLog.create({
    data: {
      credentialId,
      endpoint,
      method,
      statusCode,
      responseTimeMs,
      ipAddress
    }
  });

  // Update lastUsedAt
  await prisma.apiCredential.update({
    where: { id: credentialId },
    data: { lastUsedAt: new Date() }
  });
}
