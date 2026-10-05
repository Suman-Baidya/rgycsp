/**
 * Security & Anti-Bot Protection Utilities
 *
 * Provides:
 * 1. IP-based sliding window rate limiting for authentication
 * 2. Demo account rate limiting to prevent bot flooding & exhaustion
 * 3. Honeypot check for automated spambots
 */

interface RateLimitRecord {
  count: number;
  resetAt: number;
}

const authRateLimitMap = new Map<string, RateLimitRecord>();
const demoRateLimitMap = new Map<string, RateLimitRecord>();

// Periodic cleanup of stale rate-limit records every 5 minutes
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    for (const [key, record] of authRateLimitMap.entries()) {
      if (now > record.resetAt) authRateLimitMap.delete(key);
    }
    for (const [key, record] of demoRateLimitMap.entries()) {
      if (now > record.resetAt) demoRateLimitMap.delete(key);
    }
  }, 5 * 60 * 1000).unref?.();
}

/**
 * General Login Rate Limiter (Max 12 attempts per minute per IP)
 */
export function checkAuthRateLimit(
  ip: string,
  maxAttempts: number = 12,
  windowMs: number = 60000
): { allowed: boolean; retryAfterSeconds: number } {
  const cleanIp = ip || "unknown";
  const now = Date.now();
  const record = authRateLimitMap.get(cleanIp);

  if (!record || now > record.resetAt) {
    authRateLimitMap.set(cleanIp, { count: 1, resetAt: now + windowMs });
    return { allowed: true, retryAfterSeconds: 0 };
  }

  if (record.count >= maxAttempts) {
    const retryAfterSeconds = Math.max(1, Math.ceil((record.resetAt - now) / 1000));
    return { allowed: false, retryAfterSeconds };
  }

  record.count += 1;
  return { allowed: true, retryAfterSeconds: 0 };
}

/**
 * Dedicated Rate Limiter for Showcase Demo Account (Max 5 logins per 2 minutes per IP)
 * Prevents multiple bots from concurrently exhausting system resources on the demo account.
 */
export function checkDemoAccountRateLimit(
  ip: string,
  maxAttempts: number = 6,
  windowMs: number = 120000
): { allowed: boolean; retryAfterSeconds: number } {
  const cleanIp = ip || "unknown";
  const now = Date.now();
  const record = demoRateLimitMap.get(cleanIp);

  if (!record || now > record.resetAt) {
    demoRateLimitMap.set(cleanIp, { count: 1, resetAt: now + windowMs });
    return { allowed: true, retryAfterSeconds: 0 };
  }

  if (record.count >= maxAttempts) {
    const retryAfterSeconds = Math.max(1, Math.ceil((record.resetAt - now) / 1000));
    return { allowed: false, retryAfterSeconds };
  }

  record.count += 1;
  return { allowed: true, retryAfterSeconds: 0 };
}

/**
 * Honeypot check: If a bot fills a hidden field that human users cannot see,
 * this function detects and flags it.
 */
export function isBotHoneypotFilled(honeypotValue?: string | null): boolean {
  if (!honeypotValue) return false;
  return honeypotValue.trim().length > 0;
}
