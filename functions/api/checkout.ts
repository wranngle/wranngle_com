type Env = {
  STRIPE_SECRET_KEY?: string;
  ALLOWED_ORIGIN?: string;
  SITE_URL?: string;
};

type CheckoutPackage = {
  id: string;
  name: string;
  description: string;
  unitAmount: number;
  mode: 'payment' | 'subscription';
};

type StripeCheckoutCreateResult = {
  ok: boolean;
  status: number;
  body: unknown;
};

const CHECKOUT_PACKAGES: Record<string, CheckoutPackage> = {
  basic: {
    id: 'basic',
    name: 'Core Agent',
    description: 'Always-on voice receptionist for busy teams.',
    unitAmount: 25_000,
    mode: 'subscription',
  },
  premium: {
    id: 'premium',
    name: 'Elite Agent',
    description: 'Voice, web chat, and two-way SMS AI agent coverage.',
    unitAmount: 50_000,
    mode: 'subscription',
  },
  'landing-page': {
    id: 'landing-page',
    name: 'Landing Page',
    description: 'One custom lead-capture page.',
    unitAmount: 90_000,
    mode: 'payment',
  },
  'business-site': {
    id: 'business-site',
    name: 'Business Site',
    description: 'Custom multi-page website with lead capture automation.',
    unitAmount: 350_000,
    mode: 'payment',
  },
  'gtm-ops-plus': {
    id: 'gtm-ops-plus',
    name: 'gtm_ops Plus',
    description:
      'Proposal-generation runtime for solo operators and small teams.',
    unitAmount: 2000,
    mode: 'subscription',
  },
  'gtm-ops-pro': {
    id: 'gtm-ops-pro',
    name: 'gtm_ops Pro',
    description: 'Proposal-generation runtime for teams and ops orgs.',
    unitAmount: 9900,
    mode: 'subscription',
  },
};

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
    'Access-Control-Max-Age': '86400',
  };
}

function getSiteOrigin(request: Request, env: Env) {
  if (env.SITE_URL) return env.SITE_URL.replace(/\/$/, '');
  if (env.ALLOWED_ORIGIN && env.ALLOWED_ORIGIN !== '*') {
    return env.ALLOWED_ORIGIN.replace(/\/$/, '');
  }

  return new URL(request.url).origin;
}

function sanitizeMetadataValue(value: unknown, maxLength = 500) {
  return typeof value === 'string'
    ? value.replaceAll(/[<>]/g, '').trim().slice(0, maxLength)
    : '';
}

function getStripeError(body: unknown) {
  const stripeBody =
    body && typeof body === 'object' ? (body as Record<string, unknown>) : {};
  const error =
    stripeBody.error && typeof stripeBody.error === 'object'
      ? (stripeBody.error as Record<string, unknown>)
      : {};

  return {
    code: sanitizeMetadataValue(error.code, 120),
    message: sanitizeMetadataValue(error.message, 500),
    param: sanitizeMetadataValue(error.param, 160),
    type: sanitizeMetadataValue(error.type, 120),
  };
}

function isConsentConfigurationError(body: unknown, field: string) {
  const error = getStripeError(body);
  return (
    error.param.includes(field) ||
    error.message.toLowerCase().includes(field.replaceAll('_', ' '))
  );
}

function appendCheckoutParams(
  params: URLSearchParams,
  checkoutPackage: CheckoutPackage,
) {
  params.set('mode', checkoutPackage.mode);
  params.set('line_items[0][quantity]', '1');
  params.set('line_items[0][price_data][currency]', 'usd');
  params.set(
    'line_items[0][price_data][unit_amount]',
    String(checkoutPackage.unitAmount),
  );
  params.set(
    'line_items[0][price_data][product_data][name]',
    checkoutPackage.name,
  );
  params.set(
    'line_items[0][price_data][product_data][description]',
    checkoutPackage.description,
  );

  if (checkoutPackage.mode === 'subscription') {
    params.set('line_items[0][price_data][recurring][interval]', 'month');
  }
}

function appendCheckoutOptIns(params: URLSearchParams) {
  params.set('consent_collection[promotions]', 'auto');
  params.set('consent_collection[terms_of_service]', 'required');
  params.set('phone_number_collection[enabled]', 'true');
  params.set('name_collection[business][enabled]', 'true');
  params.set('name_collection[business][optional]', 'true');
  params.set('name_collection[individual][enabled]', 'true');
  params.set('name_collection[individual][optional]', 'true');
  params.set(
    'custom_text[submit][message]',
    'We use checkout details for onboarding, support, and order updates. Promotional email consent is optional when shown.',
  );
  params.set('metadata[consentRequested]', 'promotions_auto_terms_required');
}

function removeTermsConsent(params: URLSearchParams) {
  params.delete('consent_collection[terms_of_service]');
  params.set(
    'metadata[consentRequested]',
    params.has('consent_collection[promotions]') ? 'promotions_auto' : 'none',
  );
}

function removePromotionalConsent(params: URLSearchParams) {
  params.delete('consent_collection[promotions]');
  params.set(
    'metadata[consentRequested]',
    params.has('consent_collection[terms_of_service]')
      ? 'terms_required'
      : 'none',
  );
}

async function createStripeCheckoutSession(
  secretKey: string,
  params: URLSearchParams,
): Promise<StripeCheckoutCreateResult> {
  const response = await fetch('https://api.stripe.com/v1/checkout/sessions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${secretKey}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: params,
  });

  return {
    ok: response.ok,
    status: response.status,
    body: await response.json(),
  };
}

async function createCheckoutSessionWithOptInFallback(
  secretKey: string,
  params: URLSearchParams,
) {
  let result = await createStripeCheckoutSession(secretKey, params);

  if (
    !result.ok &&
    isConsentConfigurationError(result.body, 'terms_of_service')
  ) {
    console.error('Stripe terms consent unavailable; retrying without terms');
    removeTermsConsent(params);
    result = await createStripeCheckoutSession(secretKey, params);
  }

  if (!result.ok && isConsentConfigurationError(result.body, 'promotions')) {
    console.error(
      'Stripe promotional consent unavailable; retrying without promotions',
    );
    removePromotionalConsent(params);
    result = await createStripeCheckoutSession(secretKey, params);
  }

  return result;
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const origin = context.request.headers.get('Origin') ?? undefined;
  const corsHeaders = getCorsHeaders(origin, context.env.ALLOWED_ORIGIN);
  const responseHeaders = {
    'Content-Type': 'application/json',
    ...corsHeaders,
    ...securityHeaders,
  };

  if (!context.env.STRIPE_SECRET_KEY) {
    return new Response(
      JSON.stringify({error: 'Stripe checkout not configured'}),
      {
        status: 503,
        headers: responseHeaders,
      },
    );
  }

  try {
    const rawBody: unknown = await context.request.json();
    if (!rawBody || typeof rawBody !== 'object') {
      return new Response(JSON.stringify({error: 'Invalid checkout request'}), {
        status: 400,
        headers: responseHeaders,
      });
    }

    const body = rawBody as Record<string, unknown>;
    const packageId = sanitizeMetadataValue(body.package, 80);
    const checkoutPackage = CHECKOUT_PACKAGES[packageId];

    if (!checkoutPackage) {
      return new Response(
        JSON.stringify({error: 'Invalid package selection'}),
        {
          status: 400,
          headers: responseHeaders,
        },
      );
    }

    const email = sanitizeMetadataValue(body.email, 254);
    const businessName = sanitizeMetadataValue(body.businessName, 200);
    const siteOrigin = getSiteOrigin(context.request, context.env);
    const params = new URLSearchParams({
      success_url: `${siteOrigin}/?checkout=success&session_id={CHECKOUT_SESSION_ID}&package=${encodeURIComponent(
        checkoutPackage.id,
      )}#offerings-${checkoutPackage.id}`,
      cancel_url: `${siteOrigin}/?checkout=cancelled&package=${encodeURIComponent(
        checkoutPackage.id,
      )}#offerings-${checkoutPackage.id}`,
      'metadata[package]': checkoutPackage.id,
      'metadata[businessName]': businessName,
      'metadata[source]': 'wranngle_com',
      allow_promotion_codes: 'true',
      billing_address_collection: 'auto',
    });

    if (email) params.set('customer_email', email);
    appendCheckoutParams(params, checkoutPackage);
    appendCheckoutOptIns(params);

    const stripeResult = await createCheckoutSessionWithOptInFallback(
      context.env.STRIPE_SECRET_KEY,
      params,
    );

    const session =
      stripeResult.body && typeof stripeResult.body === 'object'
        ? (stripeResult.body as {url?: unknown})
        : {};
    if (!stripeResult.ok || typeof session.url !== 'string') {
      console.error('Stripe checkout session failed', stripeResult.status, {
        error: getStripeError(stripeResult.body),
      });
      return new Response(
        JSON.stringify({error: 'Failed to create Stripe checkout session'}),
        {status: 502, headers: responseHeaders},
      );
    }

    return new Response(JSON.stringify({url: session.url}), {
      status: 200,
      headers: responseHeaders,
    });
  } catch (error: unknown) {
    console.error('Stripe checkout error:', error);
    return new Response(JSON.stringify({error: 'Invalid checkout request'}), {
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
