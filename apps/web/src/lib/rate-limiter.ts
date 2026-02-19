/**
 * Simple in-memory rate limiter for API routes
 * Helps prevent quota exhaustion on external APIs like Google Gemini
 */

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

// In-memory store for rate limiting
// In production, consider using Redis for distributed rate limiting
const rateLimitStore = new Map<string, RateLimitEntry>();

// Cleanup old entries every 5 minutes
const CLEANUP_INTERVAL = 5 * 60 * 1000;
let lastCleanup = Date.now();

function cleanup() {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL) return;

  lastCleanup = now;
  const entries = Array.from(rateLimitStore.entries());
  for (const [key, entry] of entries) {
    if (entry.resetTime < now) {
      rateLimitStore.delete(key);
    }
  }
}

export interface RateLimitConfig {
  /** Maximum requests allowed in the window */
  maxRequests: number;
  /** Time window in seconds */
  windowSeconds: number;
  /** Identifier prefix (e.g., 'ai-global') */
  prefix: string;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetIn: number; // seconds until reset
  retryAfter?: number; // seconds to wait if not allowed
}

/**
 * Check if a request should be rate limited
 * @param userId - The user's ID
 * @param config - Rate limit configuration
 * @returns Rate limit result
 */
export function checkRateLimit(userId: string, config: RateLimitConfig): RateLimitResult {
  cleanup();

  const key = `${config.prefix}:${userId}`;
  const now = Date.now();
  const windowMs = config.windowSeconds * 1000;

  const entry = rateLimitStore.get(key);

  // No existing entry or window expired
  if (!entry || entry.resetTime < now) {
    rateLimitStore.set(key, {
      count: 1,
      resetTime: now + windowMs,
    });

    return {
      allowed: true,
      remaining: config.maxRequests - 1,
      resetIn: config.windowSeconds,
    };
  }

  // Within window, check count
  if (entry.count >= config.maxRequests) {
    const resetIn = Math.ceil((entry.resetTime - now) / 1000);
    return {
      allowed: false,
      remaining: 0,
      resetIn,
      retryAfter: resetIn,
    };
  }

  // Increment count
  entry.count++;

  return {
    allowed: true,
    remaining: config.maxRequests - entry.count,
    resetIn: Math.ceil((entry.resetTime - now) / 1000),
  };
}

/**
 * Get current rate limit status without incrementing
 * @param userId - The user's ID
 * @param config - Rate limit configuration
 * @returns Current rate limit status
 */
export function getRateLimitStatus(userId: string, config: RateLimitConfig): RateLimitResult {
  const key = `${config.prefix}:${userId}`;
  const now = Date.now();

  const entry = rateLimitStore.get(key);

  if (!entry || entry.resetTime < now) {
    return {
      allowed: true,
      remaining: config.maxRequests,
      resetIn: config.windowSeconds,
    };
  }

  const remaining = Math.max(0, config.maxRequests - entry.count);
  const resetIn = Math.ceil((entry.resetTime - now) / 1000);

  return {
    allowed: remaining > 0,
    remaining,
    resetIn,
    retryAfter: remaining === 0 ? resetIn : undefined,
  };
}

// Predefined rate limit configs for AI features
export const AI_RATE_LIMITS = {
  // Global AI limit: 50 requests per hour per user (across all AI features)
  globalAI: {
    maxRequests: 50,
    windowSeconds: 3600,
    prefix: 'ai-global',
  } as RateLimitConfig,
};
