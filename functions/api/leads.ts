type Env = {
  N8N_WEBHOOK_URL: string;
  /**
   * Shared secret sent as `X-Webhook-Secret` to n8n. The Wranngle
   * Lead Intake workflow's webhook node uses headerAuth with this
   * exact header name; without it n8n returns 401 and the function
   * surfaces a 500 to callers.
   */
  N8N_WEBHOOK_SECRET?: string;
  ALLOWED_ORIGIN?: string;
};

type LeadInput = {
  businessName: string;
  industry: string;
  ownerName: string;
  phone: string;
  email: string;
  package: string;
  agentName?: string;
  addWebChatAgent?: boolean;
  status?: string;
  notes?: string;
  estimatedProposalsPerMonth?: string;
};

const SAAS_PACKAGES = new Set(['gtm-ops-trial', 'gtm-ops-plus', 'gtm-ops-pro']);
const LEAD_DEDUPE_WINDOW_MS = 15 * 60 * 1000;
const leadDedupeStore = new Map<string, number>();

// Input sanitization - strip HTML and limit length
function sanitizeString(input: string, maxLength: number): string {
  return input
    .replaceAll(/<[^>]*>/g, '') // Remove HTML tags
    .replaceAll(/[<>]/g, '') // Remove angle brackets
    .trim()
    .slice(0, maxLength);
}

function validateLead(
  body: unknown,
): {valid: true; data: LeadInput} | {valid: false; error: string} {
  if (!body || typeof body !== 'object') {
    return {valid: false, error: 'Invalid request body'};
  }

  const b = body as Record<string, unknown>;
  const isSaas = SAAS_PACKAGES.has(b.package as string);

  // SaaS leads have a tighter form (no business type/owner/phone). Full intake leads keep
  // the original required-set so the n8n flow that fans out to voice setup
  // still gets everything it expects.
  const required = isSaas
    ? ['businessName', 'email', 'package']
    : ['businessName', 'industry', 'ownerName', 'phone', 'email', 'package'];

  for (const field of required) {
    if (typeof b[field] !== 'string' || !b[field]) {
      return {valid: false, error: `Missing required field: ${field}`};
    }
  }

  // Validate email format
  if (!b.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(b.email as string)) {
    return {valid: false, error: 'Invalid email format'};
  }

  // Validate phone format (full intake only — SaaS form does not collect phone)
  if (!isSaas) {
    const phoneString = b.phone as string;
    if (!/^[\d\s\-+()]+$/.test(phoneString)) {
      return {valid: false, error: 'Invalid phone format'};
    }
  }

  // Validate package value
  const validPackages = [
    'basic',
    'premium',
    'landing-page',
    'business-site',
    'gtm-ops-trial',
    'gtm-ops-plus',
    'gtm-ops-pro',
  ];
  if (!validPackages.includes(b.package as string)) {
    return {valid: false, error: 'Invalid package selection'};
  }

  // Validate agentName (optional) - alphanumeric, spaces, hyphens, apostrophes only
  if (b.agentName && typeof b.agentName === 'string') {
    const agentNameString = b.agentName;
    if (agentNameString.length > 50) {
      return {valid: false, error: 'Agent name must be 50 characters or less'};
    }

    if (!/^[a-zA-Z\d\s\-']+$/.test(agentNameString)) {
      return {
        valid: false,
        error:
          'Agent name can only contain letters, numbers, spaces, hyphens, and apostrophes',
      };
    }
  }

  // Sanitize all string inputs. SaaS leads omit full-intake fields; fill them
  // with stable placeholders so downstream consumers (n8n) can still treat the
  // payload uniformly without needing per-package conditionals.
  return {
    valid: true,
    data: {
      businessName: sanitizeString(b.businessName as string, 200),
      industry: isSaas
        ? 'saas-buyer'
        : sanitizeString(b.industry as string, 100),
      ownerName: isSaas
        ? sanitizeString((b.ownerName as string) || 'n/a', 100)
        : sanitizeString(b.ownerName as string, 100),
      phone: isSaas
        ? sanitizeString((b.phone as string) || 'n/a', 30)
        : sanitizeString(b.phone as string, 30),
      email: sanitizeString(b.email as string, 254), // RFC 5321 max email length
      package: b.package as string,
      agentName: b.agentName
        ? sanitizeString(b.agentName as string, 50)
        : undefined,
      addWebChatAgent: b.addWebChatAgent === true ? true : undefined,
      status: (b.status as string) || 'pending',
      notes: b.notes ? sanitizeString(b.notes as string, 1000) : undefined,
      estimatedProposalsPerMonth: b.estimatedProposalsPerMonth
        ? sanitizeString(b.estimatedProposalsPerMonth as string, 50)
        : undefined,
    },
  };
}

function normalizeDedupeValue(value: string | undefined): string {
  return (value ?? '').trim().toLowerCase().replaceAll(/\s+/g, ' ');
}

function stableHash(input: string): string {
  let hash = 0;

  for (const character of input) {
    hash =
      (hash * 31 + (character.codePointAt(0) ?? 0)) % Number.MAX_SAFE_INTEGER;
  }

  return hash.toString(36);
}

function cleanupLeadDedupeStore(): void {
  const now = Date.now();
  let cleaned = 0;

  for (const [key, expiresAt] of leadDedupeStore) {
    if (cleaned >= 25) break;
    if (expiresAt <= now) {
      leadDedupeStore.delete(key);
      cleaned++;
    }
  }
}

function claimLeadSubmission(lead: LeadInput): boolean {
  cleanupLeadDedupeStore();

  const key = stableHash(
    [
      normalizeDedupeValue(lead.package),
      normalizeDedupeValue(lead.email),
      normalizeDedupeValue(lead.businessName),
      normalizeDedupeValue(lead.phone),
      normalizeDedupeValue(lead.notes),
    ].join('|'),
  );

  if (leadDedupeStore.has(key)) return false;

  leadDedupeStore.set(key, Date.now() + LEAD_DEDUPE_WINDOW_MS);
  return true;
}

// Security headers
const securityHeaders = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Content-Security-Policy': "default-src 'none'",
};

function getCorsHeaders(
  origin: string | undefined,
  allowedOrigin?: string,
): Record<string, string> {
  const isAllowed =
    !allowedOrigin || origin === allowedOrigin || allowedOrigin === '*';

  return {
    'Access-Control-Allow-Origin': isAllowed ? origin || '*' : 'null',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400', // 24 hours
  };
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const origin = context.request.headers.get('Origin') ?? undefined;
  const corsHeaders = getCorsHeaders(origin, context.env.ALLOWED_ORIGIN);
  const responseHeaders = {
    'Content-Type': 'application/json',
    ...corsHeaders,
    ...securityHeaders,
  };

  try {
    // Request size limit check (Cloudflare has built-in limits, but we can add our own)
    const contentLength = context.request.headers.get('Content-Length');
    if (contentLength && Number.parseInt(contentLength) > 100_000) {
      // 100KB max
      return new Response(JSON.stringify({error: 'Request body too large'}), {
        status: 413,
        headers: responseHeaders,
      });
    }

    const body = await context.request.json();
    const result = validateLead(body);

    if (!result.valid) {
      return new Response(JSON.stringify({error: result.error}), {
        status: 400,
        headers: responseHeaders,
      });
    }

    const lead = result.data;
    const isSaasLead = SAAS_PACKAGES.has(lead.package);

    if (!claimLeadSubmission(lead)) {
      return new Response(JSON.stringify({success: true, duplicate: true}), {
        status: 202,
        headers: responseHeaders,
      });
    }

    // Forward to n8n webhook for processing. SaaS leads are best-effort:
    // the n8n flow is shaped around full intakes, so we swallow webhook
    // rejection for SaaS submissions rather than surfacing a confusing
    // 500 to a user who just typed their email. The lead still lands in
    // Cloudflare logs; a human follows up per the in-form copy.
    const webhookUrl = context.env.N8N_WEBHOOK_URL;
    if (!webhookUrl) {
      // Don't leak internal error to client
      console.error('N8N_WEBHOOK_URL not configured');
      if (isSaasLead) {
        // Log only the package + email-domain so CF logs don't retain
        // full PII when the webhook isn't wired (dev / misconfig path).
        console.error(
          'SaaS lead dropped (no webhook configured)',
          lead.package,
          lead.email.split('@')[1] ?? 'unknown',
        );
        return new Response(JSON.stringify({success: true}), {
          status: 201,
          headers: responseHeaders,
        });
      }

      return new Response(
        JSON.stringify({error: 'Service temporarily unavailable'}),
        {
          status: 503,
          headers: responseHeaders,
        },
      );
    }

    const webhookHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (context.env.N8N_WEBHOOK_SECRET) {
      webhookHeaders['X-Webhook-Secret'] = context.env.N8N_WEBHOOK_SECRET;
    }

    const webhookResponse = await fetch(webhookUrl, {
      method: 'POST',
      headers: webhookHeaders,
      body: JSON.stringify(lead),
    });

    if (!webhookResponse.ok) {
      console.error('Webhook failed:', webhookResponse.status);
      if (isSaasLead) {
        // Same PII-minimal logging as the no-webhook branch above.
        console.error(
          'SaaS lead webhook non-OK (swallowed)',
          lead.package,
          lead.email.split('@')[1] ?? 'unknown',
          webhookResponse.status,
        );
        return new Response(JSON.stringify({success: true}), {
          status: 201,
          headers: responseHeaders,
        });
      }

      return new Response(
        JSON.stringify({error: 'Failed to process request'}),
        {
          status: 500,
          headers: responseHeaders,
        },
      );
    }

    return new Response(JSON.stringify({success: true}), {
      status: 201,
      headers: responseHeaders,
    });
  } catch (error: unknown) {
    // Don't leak internal errors to client
    console.error('Lead submission error:', error);
    const message =
      error instanceof SyntaxError
        ? 'Invalid JSON in request body'
        : 'Failed to process request';

    return new Response(JSON.stringify({error: message}), {
      status: 400,
      headers: responseHeaders,
    });
  }
};

export const onRequestOptions: PagesFunction<Env> = async (context) => {
  const origin = context.request.headers.get('Origin') ?? undefined;
  const corsHeaders = getCorsHeaders(origin, context.env.ALLOWED_ORIGIN);

  return new Response(null, {
    status: 204,
    headers: {
      ...corsHeaders,
      ...securityHeaders,
    },
  });
};
