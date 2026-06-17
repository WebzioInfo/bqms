import crypto from 'crypto';

/**
 * Generates a random API Key prefix and secret.
 * The public key starts with `pk_` followed by an environment specifier (e.g., `live_` or `test_`).
 */
export function generateApiCredentials(env: 'live' | 'test' = 'live') {
  const apiKey = `pk_${env}_${crypto.randomBytes(16).toString('hex')}`;
  const apiSecret = `sk_${env}_${crypto.randomBytes(32).toString('hex')}`;
  
  return { apiKey, apiSecret };
}

/**
 * Hashes the API Secret for secure storage in the database.
 * We use SHA-256 for fast verification during API requests, as bcrypt would be too slow 
 * for high-throughput API endpoints.
 */
export function hashApiSecret(apiSecret: string): string {
  return crypto.createHash('sha256').update(apiSecret).digest('hex');
}

/**
 * Verifies if the provided secret matches the stored hash.
 */
export function verifyApiSecret(apiSecret: string, storedHash: string): boolean {
  const hash = hashApiSecret(apiSecret);
  return crypto.timingSafeEqual(Buffer.from(hash), Buffer.from(storedHash));
}
