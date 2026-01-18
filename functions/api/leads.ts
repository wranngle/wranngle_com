interface Env {
  N8N_WEBHOOK_URL: string;
  ALLOWED_ORIGIN?: string;
}

interface LeadInput {
  businessName: string;
  industry: string;
  ownerName: string;
  phone: string;
  email: string;
  package: string;
  status?: string;
  notes?: string;
}

// Input sanitization - strip HTML and limit length
function sanitizeString(input: string, maxLength: number): string {
  return input
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/[<>]/g, '') // Remove angle brackets
    .trim()
    .slice(0, maxLength);
}

function validateLead(body: unknown): { valid: true; data: LeadInput } | { valid: false; error: string } {
  if (!body || typeof body !== "object") {
    return { valid: false, error: "Invalid request body" };
  }

  const b = body as Record<string, unknown>;
  const required = ["businessName", "industry", "ownerName", "phone", "email", "package"];

  for (const field of required) {
    if (typeof b[field] !== "string" || !b[field]) {
      return { valid: false, error: `Missing required field: ${field}` };
    }
  }

  // Validate email format
  if (!b.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(b.email as string)) {
    return { valid: false, error: "Invalid email format" };
  }

  // Validate phone format (basic)
  const phoneStr = b.phone as string;
  if (!/^[\d\s\-+()]+$/.test(phoneStr)) {
    return { valid: false, error: "Invalid phone format" };
  }

  // Validate package value
  const validPackages = ["basic", "premium"];
  if (!validPackages.includes(b.package as string)) {
    return { valid: false, error: "Invalid package selection" };
  }

  // Sanitize all string inputs
  return {
    valid: true,
    data: {
      businessName: sanitizeString(b.businessName as string, 200),
      industry: sanitizeString(b.industry as string, 100),
      ownerName: sanitizeString(b.ownerName as string, 100),
      phone: sanitizeString(b.phone as string, 30),
      email: sanitizeString(b.email as string, 254), // RFC 5321 max email length
      package: b.package as string,
      status: (b.status as string) || "pending",
      notes: b.notes ? sanitizeString(b.notes as string, 1000) : undefined,
    },
  };
}

// Security headers
const securityHeaders = {
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "X-XSS-Protection": "1; mode=block",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Content-Security-Policy": "default-src 'none'",
};

function getCorsHeaders(origin: string | null, allowedOrigin?: string): Record<string, string> {
  const isAllowed = !allowedOrigin || origin === allowedOrigin || allowedOrigin === "*";

  return {
    "Access-Control-Allow-Origin": isAllowed ? (origin || "*") : "null",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "86400", // 24 hours
  };
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const origin = context.request.headers.get("Origin");
  const corsHeaders = getCorsHeaders(origin, context.env.ALLOWED_ORIGIN);
  const responseHeaders = {
    "Content-Type": "application/json",
    ...corsHeaders,
    ...securityHeaders,
  };

  try {
    // Request size limit check (Cloudflare has built-in limits, but we can add our own)
    const contentLength = context.request.headers.get("Content-Length");
    if (contentLength && parseInt(contentLength) > 100000) { // 100KB max
      return new Response(JSON.stringify({ error: "Request body too large" }), {
        status: 413,
        headers: responseHeaders,
      });
    }

    const body = await context.request.json();
    const result = validateLead(body);

    if (!result.valid) {
      return new Response(JSON.stringify({ error: result.error }), {
        status: 400,
        headers: responseHeaders,
      });
    }

    const lead = result.data;

    // Forward to n8n webhook for processing
    const webhookUrl = context.env.N8N_WEBHOOK_URL;
    if (!webhookUrl) {
      // Don't leak internal error to client
      console.error("N8N_WEBHOOK_URL not configured");
      return new Response(JSON.stringify({ error: "Service temporarily unavailable" }), {
        status: 503,
        headers: responseHeaders,
      });
    }

    const webhookResponse = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(lead),
    });

    if (!webhookResponse.ok) {
      console.error("Webhook failed:", webhookResponse.status);
      return new Response(JSON.stringify({ error: "Failed to process request" }), {
        status: 500,
        headers: responseHeaders,
      });
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 201,
      headers: responseHeaders,
    });
  } catch (error: unknown) {
    // Don't leak internal errors to client
    console.error("Lead submission error:", error);
    const message = error instanceof SyntaxError
      ? "Invalid JSON in request body"
      : "Failed to process request";

    return new Response(JSON.stringify({ error: message }), {
      status: 400,
      headers: responseHeaders,
    });
  }
};

export const onRequestOptions: PagesFunction<Env> = async (context) => {
  const origin = context.request.headers.get("Origin");
  const corsHeaders = getCorsHeaders(origin, context.env.ALLOWED_ORIGIN);

  return new Response(null, {
    status: 204,
    headers: {
      ...corsHeaders,
      ...securityHeaders,
    },
  });
};
