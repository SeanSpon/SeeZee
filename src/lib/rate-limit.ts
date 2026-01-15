/**
 * Distributed rate limiting using Vercel KV or Upstash Redis
 * Production-ready rate limiter that works across serverless instances
 */
import { Ratelimit } from "@upstash/ratelimit";
import { kv } from "@vercel/kv";
import { NextResponse } from "next/server";

// Legacy types for backwards compatibility
export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetIn: number;
}

export const RateLimits = {
  SIGNUP: { max: process.env.NODE_ENV === "production" ? 3 : 20, window: 3600000 }, // 1 hour
  LOGIN: { max: process.env.NODE_ENV === "production" ? 5 : 20, window: 900000 }, // 15 min
  EMAIL: { max: 10, window: 3600000 }, // 1 hour
  PASSWORD_RESET: { max: 10, window: 3600000 }, // 1 hour
  API: { max: 100, window: 60000 }, // 1 minute
  UPLOAD: { max: 10, window: 3600000 }, // 1 hour
};

// Create rate limiters with different windows
export const authRateLimiter = new Ratelimit({
  redis: kv as any,
  limiter: Ratelimit.slidingWindow(
    process.env.NODE_ENV === "production" ? 5 : 20,
    "15 m"
  ),
  analytics: true,
  prefix: "@seezee/auth",
});

export const signupRateLimiter = new Ratelimit({
  redis: kv as any,
  limiter: Ratelimit.slidingWindow(
    process.env.NODE_ENV === "production" ? 3 : 20,
    "1 h"
  ),
  analytics: true,
  prefix: "@seezee/signup",
});

export const emailRateLimiter = new Ratelimit({
  redis: kv as any,
  limiter: Ratelimit.slidingWindow(10, "1 h"),
  analytics: true,
  prefix: "@seezee/email",
});

export const apiRateLimiter = new Ratelimit({
  redis: kv as any,
  limiter: Ratelimit.slidingWindow(100, "1 m"),
  analytics: true,
  prefix: "@seezee/api",
});

export const uploadRateLimiter = new Ratelimit({
  redis: kv as any,
  limiter: Ratelimit.slidingWindow(10, "1 h"),
  analytics: true,
  prefix: "@seezee/upload",
});

/**
 * Check rate limit and return result
 * @param identifier Unique identifier (IP, user ID, email, etc.)
 * @param limiter The rate limiter to use
 */
export async function checkRateLimit(
  identifier: string,
  limiter: Ratelimit = apiRateLimiter
) {
  try {
    const result = await limiter.limit(identifier);
    return {
      success: result.success,
      limit: result.limit,
      remaining: result.remaining,
      reset: result.reset,
    };
  } catch (error) {
    // If rate limiting fails (e.g., KV not configured), allow request in dev, block in prod
    if (process.env.NODE_ENV === "development") {
      console.warn("Rate limiting failed (dev mode - allowing):", error);
      return { success: true, limit: 0, remaining: 0, reset: Date.now() };
    }
    // In production, fail closed (deny request if rate limiter is down)
    console.error("Rate limiting failed:", error);
    return { success: false, limit: 0, remaining: 0, reset: Date.now() };
  }
}

// Legacy function for backwards compatibility (in-memory fallback for dev)
const inMemoryStore = new Map<string, { count: number; resetAt: number }>();

export function rateLimitByIP(
  ip: string,
  action: string,
  config: { max: number; window: number }
): RateLimitResult {
  if (process.env.NODE_ENV === "production") {
    // In production, use distributed limiter (async, so this is just a stub)
    console.warn("rateLimitByIP called in production - use checkRateLimit instead");
    return { allowed: true, remaining: config.max, resetIn: config.window };
  }

  const key = `${ip}:${action}`;
  const now = Date.now();
  const entry = inMemoryStore.get(key);

  if (!entry || now >= entry.resetAt) {
    inMemoryStore.set(key, { count: 1, resetAt: now + config.window });
    return { allowed: true, remaining: config.max - 1, resetIn: config.window };
  }

  if (entry.count >= config.max) {
    return { allowed: false, remaining: 0, resetIn: entry.resetAt - now };
  }

  entry.count++;
  return {
    allowed: true,
    remaining: config.max - entry.count,
    resetIn: entry.resetAt - now,
  };
}

export function rateLimitByEmail(
  email: string,
  action: string,
  config: { max: number; window: number }
): RateLimitResult {
  return rateLimitByIP(email, action, config);
}

export function rateLimitByUser(
  userId: string,
  action: string,
  config: { max: number; window: number }
): RateLimitResult {
  return rateLimitByIP(userId, action, config);
}

export function createRateLimitResponse(rateLimit: RateLimitResult): NextResponse | null {
  if (!rateLimit.allowed) {
    return NextResponse.json(
      {
        error: "Rate limit exceeded",
        resetIn: Math.ceil(rateLimit.resetIn / 1000),
      },
      {
        status: 429,
        headers: {
          "Retry-After": String(Math.ceil(rateLimit.resetIn / 1000)),
        },
      }
    );
  }
  return null;
}
