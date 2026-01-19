/**
 * Rate limiting middleware for API endpoints
 * Uses Cloudflare's built-in rate limiting capabilities
 */

interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Max requests per window
}

const RATE_LIMIT_CONFIG: RateLimitConfig = {
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 10, // 10 requests per minute per IP
};

// In-memory store for rate limiting (resets on worker restart)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

function getRateLimitKey(request: Request): string {
  // Use CF-Connecting-IP header (set by Cloudflare) for real IP
  const ip = request.headers.get("CF-Connecting-IP") || request.headers.get("X-Forwarded-For") || "unknown";
  return `ratelimit:${ip}`;
}

function checkRateLimit(key: string): { allowed: boolean; remaining: number; resetTime: number } {
  const now = Date.now();
  const record = rateLimitStore.get(key);

  if (!record || now >= record.resetTime) {
    // Create new window
    const resetTime = now + RATE_LIMIT_CONFIG.windowMs;
    rateLimitStore.set(key, { count: 1, resetTime });
    return {
      allowed: true,
      remaining: RATE_LIMIT_CONFIG.maxRequests - 1,
      resetTime,
    };
  }

  // Update existing window
  record.count += 1;

  if (record.count > RATE_LIMIT_CONFIG.maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      resetTime: record.resetTime,
    };
  }

  return {
    allowed: true,
    remaining: RATE_LIMIT_CONFIG.maxRequests - record.count,
    resetTime: record.resetTime,
  };
}

function lazyCleanup(): void {
  // Perform lazy cleanup of expired entries (limited to avoid performance impact)
  const now = Date.now();
  const entries = Array.from(rateLimitStore.entries());
  let cleaned = 0;
  const maxCleanup = 10; // Clean max 10 entries per request to avoid performance impact

  for (const [key, record] of entries) {
    if (cleaned >= maxCleanup) break;
    if (now >= record.resetTime) {
      rateLimitStore.delete(key);
      cleaned++;
    }
  }
}

export const onRequest: PagesFunction = async (context) => {
  // Lazy cleanup of expired rate limit entries
  lazyCleanup();
  // Skip rate limiting for OPTIONS requests
  if (context.request.method === "OPTIONS") {
    return context.next();
  }

  const key = getRateLimitKey(context.request);
  const { allowed, remaining, resetTime } = checkRateLimit(key);

  // Add rate limit headers to response
  const rateLimitHeaders = {
    "X-RateLimit-Limit": String(RATE_LIMIT_CONFIG.maxRequests),
    "X-RateLimit-Remaining": String(remaining),
    "X-RateLimit-Reset": String(Math.floor(resetTime / 1000)),
  };

  if (!allowed) {
    const retryAfter = Math.ceil((resetTime - Date.now()) / 1000);
    return new Response(
      JSON.stringify({
        error: "Too many requests. Please try again later.",
      }),
      {
        status: 429,
        headers: {
          "Content-Type": "application/json",
          "Retry-After": String(retryAfter),
          ...rateLimitHeaders,
        },
      }
    );
  }

  // Continue to the actual endpoint and add rate limit headers
  const response = await context.next();
  const newResponse = new Response(response.body, response);

  for (const [key, value] of Object.entries(rateLimitHeaders)) {
    newResponse.headers.set(key, value);
  }

  return newResponse;
};
