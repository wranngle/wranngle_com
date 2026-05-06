type Env = {
  STRIPE_WEBHOOK_SECRET?: string;
  N8N_WEBHOOK_URL?: string;
  N8N_WEBHOOK_SECRET?: string;
};

type StripeCheckoutSession = {
  id?: unknown;
  mode?: unknown;
  payment_status?: unknown;
  status?: unknown;
  amount_total?: unknown;
  currency?: unknown;
  customer?: unknown;
  customer_email?: unknown;
  customer_details?: unknown;
  consent?: unknown;
  metadata?: unknown;
  payment_intent?: unknown;
  subscription?: unknown;
};

type StripeEvent = {
  id?: unknown;
  type?: unknown;
  created?: unknown;
  livemode?: unknown;
  data?: {
    object?: unknown;
  };
};

export type FulfillmentPayload = {
  source: 'stripe_checkout';
  eventType: string;
  fulfillmentStatus: 'paid';
  status: 'paid';
  businessName: string;
  industry: string;
  ownerName: string;
  phone: string;
  email: string;
  package: string;
  notes: string;
  stripe: {
    eventId: string;
    sessionId: string;
    livemode: boolean;
    mode: string;
    paymentStatus: string;
    checkoutStatus: string;
    amountTotal: number | undefined;
    currency: string;
    customerId: string;
    paymentIntentId: string;
    subscriptionId: string;
  };
  consent: {
    promotionalEmails: string;
    termsOfService: string;
  };
};

const FULFILLMENT_EVENT_TYPES = new Set([
  'checkout.session.completed',
  'checkout.session.async_payment_succeeded',
]);
const SIGNATURE_TOLERANCE_SECONDS = 300;
const FULFILLMENT_DEDUPE_WINDOW_MS = 24 * 60 * 60 * 1000;
const fulfillmentDedupeStore = new Map<string, number>();

const securityHeaders = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Content-Security-Policy': "default-src 'none'",
};

const jsonHeaders = {
  'Content-Type': 'application/json',
  ...securityHeaders,
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object';
}

function cleanString(value: unknown, fallback = '', maxLength = 500) {
  if (typeof value !== 'string') return fallback;
  // Iterate the tag-stripping regex until the string stops changing —
  // single-pass `replaceAll` leaves nested patterns like `<scr<script>ipt>`
  // partially decoded (CodeQL js/incomplete-multi-character-sanitization).
  // After the loop, strip any leftover angle brackets as a final guard.
  let stripped = value;
  let previous;
  do {
    previous = stripped;
    stripped = stripped.replaceAll(/<[^>]*>/g, '');
  } while (stripped !== previous);

  return stripped.replaceAll(/[<>]/g, '').trim().slice(0, maxLength);
}

function getObjectId(value: unknown) {
  if (typeof value === 'string') return value;
  if (isRecord(value) && typeof value.id === 'string') return value.id;
  return '';
}

function cleanupFulfillmentDedupeStore(now = Date.now()): void {
  for (const [key, expiresAt] of fulfillmentDedupeStore) {
    if (expiresAt <= now) fulfillmentDedupeStore.delete(key);
  }
}

function claimFulfillment(payload: FulfillmentPayload): boolean {
  const now = Date.now();
  cleanupFulfillmentDedupeStore(now);

  const key =
    payload.stripe.sessionId && payload.stripe.sessionId !== 'unknown_session'
      ? `session:${payload.stripe.sessionId}`
      : `event:${payload.stripe.eventId}`;

  if (fulfillmentDedupeStore.has(key)) return false;

  fulfillmentDedupeStore.set(key, now + FULFILLMENT_DEDUPE_WINDOW_MS);
  return true;
}

function getMetadataValue(
  metadata: Record<string, unknown>,
  key: string,
  fallback = '',
) {
  return cleanString(metadata[key], fallback);
}

function bytesToHex(bytes: ArrayBuffer) {
  return [...new Uint8Array(bytes)]
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
}

function constantTimeEqual(left: string, right: string) {
  const maxLength = Math.max(left.length, right.length);
  let differences = left.length === right.length ? 0 : 1;

  for (let index = 0; index < maxLength; index++) {
    if ((left.codePointAt(index) ?? 0) !== (right.codePointAt(index) ?? 0)) {
      differences += 1;
    }
  }

  return differences === 0;
}

function parseSignatureHeader(signatureHeader: string) {
  const signatures: string[] = [];
  let timestamp = 0;

  for (const part of signatureHeader.split(',')) {
    const [key, ...valueParts] = part.trim().split('=');
    const value = valueParts.join('=');
    if (key === 't') timestamp = Number.parseInt(value, 10);
    if (key === 'v1' && value) signatures.push(value.toLowerCase());
  }

  return {timestamp, signatures};
}

async function hmacSha256Hex(secret: string, value: string) {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    {name: 'HMAC', hash: 'SHA-256'},
    false,
    ['sign'],
  );
  const signature = await crypto.subtle.sign(
    'HMAC',
    key,
    encoder.encode(value),
  );
  return bytesToHex(signature);
}

export async function verifyStripeWebhookSignature(
  payload: string,
  signatureHeader: string | undefined,
  secret: string,
  nowSeconds = Math.floor(Date.now() / 1000),
) {
  if (!signatureHeader || !secret) return false;

  const {timestamp, signatures} = parseSignatureHeader(signatureHeader);
  if (!timestamp || signatures.length === 0) return false;
  if (Math.abs(nowSeconds - timestamp) > SIGNATURE_TOLERANCE_SECONDS) {
    return false;
  }

  const expectedSignature = await hmacSha256Hex(
    secret,
    `${timestamp}.${payload}`,
  );

  return signatures.some((signature) =>
    constantTimeEqual(signature, expectedSignature),
  );
}

function getCheckoutSession(
  event: StripeEvent,
): StripeCheckoutSession | undefined {
  const object = event.data?.object;
  return isRecord(object) ? object : undefined;
}

export function shouldFulfillCheckoutEvent(event: StripeEvent) {
  if (
    typeof event.type !== 'string' ||
    !FULFILLMENT_EVENT_TYPES.has(event.type)
  ) {
    return false;
  }

  const session = getCheckoutSession(event);
  if (!session) return false;

  const paymentStatus = cleanString(session.payment_status);
  return (
    event.type === 'checkout.session.async_payment_succeeded' ||
    paymentStatus === 'paid' ||
    paymentStatus === 'no_payment_required'
  );
}

export function buildFulfillmentPayload(
  event: StripeEvent,
): FulfillmentPayload {
  const session = getCheckoutSession(event);
  if (!session) throw new Error('Missing Checkout Session object');

  const metadata: Record<string, unknown> = isRecord(session.metadata)
    ? session.metadata
    : {};
  const customerDetails: Record<string, unknown> = isRecord(
    session.customer_details,
  )
    ? session.customer_details
    : {};
  const consent: Record<string, unknown> = isRecord(session.consent)
    ? session.consent
    : {};
  const sessionId = cleanString(session.id, 'unknown_session', 120);
  const packageId = getMetadataValue(metadata, 'package', 'unknown');
  const email = cleanString(
    customerDetails.email || session.customer_email,
    `${sessionId}@stripe-session.wranngle.invalid`,
    254,
  );
  const businessName = getMetadataValue(
    metadata,
    'businessName',
    cleanString(customerDetails.name, email, 200),
  );
  const ownerName = cleanString(customerDetails.name, businessName, 100);
  const phone = cleanString(customerDetails.phone, 'n/a', 30);
  const amountTotal =
    typeof session.amount_total === 'number' ? session.amount_total : undefined;
  const currency = cleanString(session.currency, 'usd', 10).toUpperCase();
  const mode = cleanString(session.mode, 'unknown', 40);
  const paymentStatus = cleanString(session.payment_status, 'paid', 40);
  const checkoutStatus = cleanString(session.status, 'complete', 40);

  return {
    source: 'stripe_checkout',
    eventType: cleanString(event.type, 'unknown', 120),
    fulfillmentStatus: 'paid',
    status: 'paid',
    businessName,
    industry: 'stripe-checkout',
    ownerName,
    phone,
    email,
    package: packageId,
    notes: `Paid Stripe Checkout session ${sessionId} for ${packageId}.`,
    stripe: {
      eventId: cleanString(event.id, 'unknown_event', 120),
      sessionId,
      livemode: event.livemode === true,
      mode,
      paymentStatus,
      checkoutStatus,
      amountTotal,
      currency,
      customerId: getObjectId(session.customer),
      paymentIntentId: getObjectId(session.payment_intent),
      subscriptionId: getObjectId(session.subscription),
    },
    consent: {
      promotionalEmails: cleanString(consent.promotions, 'unknown', 40),
      termsOfService: cleanString(consent.terms_of_service, 'unknown', 40),
    },
  };
}

async function forwardToLeadFlow(payload: FulfillmentPayload, env: Env) {
  if (!env.N8N_WEBHOOK_URL) {
    throw new Error('N8N_WEBHOOK_URL not configured');
  }

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (env.N8N_WEBHOOK_SECRET) {
    headers['X-Webhook-Secret'] = env.N8N_WEBHOOK_SECRET;
  }

  return fetch(env.N8N_WEBHOOK_URL, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload),
  });
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  if (!context.env.STRIPE_WEBHOOK_SECRET) {
    console.error('STRIPE_WEBHOOK_SECRET not configured');
    return new Response(
      JSON.stringify({error: 'Stripe webhook not configured'}),
      {status: 503, headers: jsonHeaders},
    );
  }

  const signatureHeader =
    context.request.headers.get('Stripe-Signature') ?? undefined;
  const rawBody = await context.request.text();
  const verified = await verifyStripeWebhookSignature(
    rawBody,
    signatureHeader,
    context.env.STRIPE_WEBHOOK_SECRET,
  );

  if (!verified) {
    return new Response(JSON.stringify({error: 'Invalid Stripe signature'}), {
      status: 400,
      headers: jsonHeaders,
    });
  }

  let event: StripeEvent;
  try {
    event = JSON.parse(rawBody) as StripeEvent;
  } catch {
    return new Response(JSON.stringify({error: 'Invalid Stripe event'}), {
      status: 400,
      headers: jsonHeaders,
    });
  }

  if (!shouldFulfillCheckoutEvent(event)) {
    return new Response(JSON.stringify({received: true, forwarded: false}), {
      status: 200,
      headers: jsonHeaders,
    });
  }

  try {
    const payload = buildFulfillmentPayload(event);
    if (!claimFulfillment(payload)) {
      console.error(
        'Duplicate Stripe fulfillment suppressed',
        payload.stripe.sessionId,
        payload.stripe.eventId,
      );
      return new Response(
        JSON.stringify({received: true, forwarded: false, duplicate: true}),
        {status: 200, headers: jsonHeaders},
      );
    }

    const webhookResponse = await forwardToLeadFlow(payload, context.env);
    if (!webhookResponse.ok) {
      console.error(
        'Stripe fulfillment webhook failed:',
        webhookResponse.status,
      );
      return new Response(
        JSON.stringify({error: 'Fulfillment flow unavailable'}),
        {status: 502, headers: jsonHeaders},
      );
    }
  } catch (error: unknown) {
    console.error('Stripe fulfillment error:', error);
    return new Response(
      JSON.stringify({error: 'Fulfillment flow unavailable'}),
      {status: 503, headers: jsonHeaders},
    );
  }

  return new Response(JSON.stringify({received: true, forwarded: true}), {
    status: 200,
    headers: jsonHeaders,
  });
};
