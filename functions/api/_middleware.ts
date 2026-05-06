/**
 * Rate limiting middleware for API endpoints
 * Uses Cloudflare's built-in rate limiting capabilities
 */

type RateLimitConfig = {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Max requests per window
};

const DEFAULT_RATE_LIMIT_CONFIG: RateLimitConfig = {
  windowMs: 60 * 1000,
  maxRequests: 30,
};

const ENDPOINT_RATE_LIMITS: Record<string, RateLimitConfig> = {
  '/api/leads': {
    windowMs: 15 * 60 * 1000,
    maxRequests: 5,
  },
  '/api/checkout': {
    windowMs: 60 * 1000,
    maxRequests: 5,
  },
  '/api/send-welcome-email': {
    windowMs: 60 * 1000,
    maxRequests: 3,
  },
  '/api/stripe-webhook': {
    windowMs: 60 * 1000,
    maxRequests: 30,
  },
  '/api/health': {
    windowMs: 60 * 1000,
    maxRequests: 60,
  },
};

// In-memory store for rate limiting (resets on worker restart)
const rateLimitStore = new Map<string, {count: number; resetTime: number}>();

function getRateLimitConfig(pathname: string): RateLimitConfig {
  return ENDPOINT_RATE_LIMITS[pathname] ?? DEFAULT_RATE_LIMIT_CONFIG;
}

function getRateLimitKey(request: Request, pathname: string): string {
  // Use CF-Connecting-IP header (set by Cloudflare) for real IP
  const ip =
    request.headers.get('CF-Connecting-IP') ||
    request.headers.get('X-Forwarded-For') ||
    'unknown';
  return `ratelimit:${pathname}:${ip}`;
}

function checkRateLimit(
  key: string,
  config: RateLimitConfig,
): {
  allowed: boolean;
  remaining: number;
  resetTime: number;
} {
  const now = Date.now();
  const record = rateLimitStore.get(key);

  if (!record || now >= record.resetTime) {
    // Create new window
    const resetTime = now + config.windowMs;
    rateLimitStore.set(key, {count: 1, resetTime});
    return {
      allowed: true,
      remaining: config.maxRequests - 1,
      resetTime,
    };
  }

  // Update existing window
  record.count += 1;

  if (record.count > config.maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      resetTime: record.resetTime,
    };
  }

  return {
    allowed: true,
    remaining: config.maxRequests - record.count,
    resetTime: record.resetTime,
  };
}

function lazyCleanup(): void {
  // Perform lazy cleanup of expired entries (limited to avoid performance impact)
  const now = Date.now();
  const entries = [...rateLimitStore.entries()];
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
  if (context.request.method === 'OPTIONS') {
    return context.next();
  }

  const {pathname} = new URL(context.request.url);
  const config = getRateLimitConfig(pathname);
  const key = getRateLimitKey(context.request, pathname);
  const {allowed, remaining, resetTime} = checkRateLimit(key, config);

  // Add rate limit headers to response
  const rateLimitHeaders = {
    'X-RateLimit-Limit': String(config.maxRequests),
    'X-RateLimit-Remaining': String(remaining),
    'X-RateLimit-Reset': String(Math.floor(resetTime / 1000)),
  };

  if (!allowed) {
    const retryAfter = Math.ceil((resetTime - Date.now()) / 1000);
    return new Response(
      JSON.stringify({
        error: 'Too many requests. Please try again later.',
      }),
      {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          'Retry-After': String(retryAfter),
          ...rateLimitHeaders,
        },
      },
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
