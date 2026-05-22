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
const VALID_PACKAGES = new Set([
  'basic',
  'premium',
  'landing-page',
  'business-site',
  'gtm-ops-trial',
  'gtm-ops-plus',
  'gtm-ops-pro',
]);
const FULL_INTAKE_REQUIRED_FIELDS = [
  'businessName',
  'industry',
  'ownerName',
  'phone',
  'email',
  'package',
];
const SAAS_REQUIRED_FIELDS = ['businessName', 'email', 'package'];
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

function getMissingRequiredLeadField(
  body: Record<string, unknown>,
  isSaas: boolean,
): string | undefined {
  const requiredFields = isSaas
    ? SAAS_REQUIRED_FIELDS
    : FULL_INTAKE_REQUIRED_FIELDS;

  return requiredFields.find(
    (field) => typeof body[field] !== 'string' || !body[field],
  );
}

function hasValidLeadEmail(body: Record<string, unknown>): boolean {
  return (
    typeof body.email === 'string' &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email)
  );
}

function hasValidLeadPhone(
  body: Record<string, unknown>,
  isSaas: boolean,
): boolean {
  return (
    isSaas ||
    (typeof body.phone === 'string' && /^[\d\s\-+()]+$/.test(body.phone))
  );
}

function getAgentNameError(body: Record<string, unknown>): string | undefined {
  if (!body.agentName || typeof body.agentName !== 'string') return undefined;
  if (body.agentName.length > 50) {
    return 'Agent name must be 50 characters or less';
  }

  if (!/^[a-zA-Z\d\s\-']+$/.test(body.agentName)) {
    return 'Agent name can only contain letters, numbers, spaces, hyphens, and apostrophes';
  }
}

function sanitizeOptionalString(
  value: unknown,
  maxLength: number,
): string | undefined {
  return value ? sanitizeString(value as string, maxLength) : undefined;
}

function sanitizeLeadInput(
  body: Record<string, unknown>,
  isSaas: boolean,
): LeadInput {
  return {
    businessName: sanitizeString(body.businessName as string, 200),
    industry: isSaas
      ? 'saas-buyer'
      : sanitizeString(body.industry as string, 100),
    ownerName: isSaas
      ? sanitizeString((body.ownerName as string) || 'n/a', 100)
      : sanitizeString(body.ownerName as string, 100),
    phone: isSaas
      ? sanitizeString((body.phone as string) || 'n/a', 30)
      : sanitizeString(body.phone as string, 30),
    email: sanitizeString(body.email as string, 254), // RFC 5321 max email length
    package: body.package as string,
    agentName: sanitizeOptionalString(body.agentName, 50),
    addWebChatAgent: body.addWebChatAgent === true ? true : undefined,
    status: (body.status as string) || 'pending',
    notes: sanitizeOptionalString(body.notes, 1000),
    estimatedProposalsPerMonth: sanitizeOptionalString(
      body.estimatedProposalsPerMonth,
      50,
    ),
  };
}

function validateLead(
  body: unknown,
): {valid: true; data: LeadInput} | {valid: false; error: string} {
  if (!body || typeof body !== 'object') {
    return {valid: false, error: 'Invalid request body'};
  }

  const b = body as Record<string, unknown>;
  const isSaas = SAAS_PACKAGES.has(b.package as string);
  const missingField = getMissingRequiredLeadField(b, isSaas);

  if (missingField) {
    return {valid: false, error: `Missing required field: ${missingField}`};
  }

  if (!hasValidLeadEmail(b)) {
    return {valid: false, error: 'Invalid email format'};
  }

  if (!hasValidLeadPhone(b, isSaas)) {
    return {valid: false, error: 'Invalid phone format'};
  }

  if (!VALID_PACKAGES.has(b.package as string)) {
    return {valid: false, error: 'Invalid package selection'};
  }

  const agentNameError = getAgentNameError(b);
  if (agentNameError) {
    return {valid: false, error: agentNameError};
  }

  return {valid: true, data: sanitizeLeadInput(b, isSaas)};
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
