// @vitest-environment node

import {createHmac} from 'node:crypto';
import {afterEach, describe, expect, it, vi} from 'vitest';
import {
  buildFulfillmentPayload,
  onRequestPost,
  shouldFulfillCheckoutEvent,
  verifyStripeWebhookSignature,
} from '../../functions/api/stripe-webhook';

const secret = 'whsec_test_secret';
const referenceTimestamp = 1_763_000_000;

function signPayload(
  payload: string,
  signingTimestamp = Math.floor(Date.now() / 1000),
) {
  const signature = createHmac('sha256', secret)
    .update(`${signingTimestamp}.${payload}`)
    .digest('hex');

  return `t=${signingTimestamp},v1=${signature}`;
}

function checkoutEvent(overrides: Record<string, unknown> = {}) {
  return {
    id: 'evt_test_123',
    type: 'checkout.session.completed',
    livemode: true,
    data: {
      object: {
        id: 'cs_live_test_123',
        mode: 'subscription',
        payment_status: 'paid',
        status: 'complete',
        amount_total: 9900,
        currency: 'usd',
        customer: 'cus_test_123',
        customer_email: 'buyer@example.com',
        customer_details: {
          email: 'buyer@example.com',
          name: 'Buyer Name',
          phone: '+15551234567',
        },
        consent: {
          promotions: 'opt_in',
          terms_of_service: 'accepted',
        },
        metadata: {
          package: 'gtm-ops-pro',
          businessName: 'Example Co',
          source: 'wranngle_com',
        },
        subscription: 'sub_test_123',
        ...overrides,
      },
    },
  };
}

function signedRequest(event: unknown) {
  const body = JSON.stringify(event);
  return new Request('https://wranngle.com/api/stripe-webhook', {
    method: 'POST',
    headers: {'Stripe-Signature': signPayload(body)},
    body,
  });
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe('Stripe webhook helpers', () => {
  it('verifies a valid Stripe webhook signature', async () => {
    const payload = JSON.stringify({id: 'evt_test'});
    await expect(
      verifyStripeWebhookSignature(
        payload,
        signPayload(payload),
        secret,
        Math.floor(Date.now() / 1000),
      ),
    ).resolves.toBe(true);
  });

  it('rejects stale Stripe webhook signatures', async () => {
    const payload = JSON.stringify({id: 'evt_test'});
    await expect(
      verifyStripeWebhookSignature(
        payload,
        signPayload(payload, referenceTimestamp),
        secret,
        referenceTimestamp + 301,
      ),
    ).resolves.toBe(false);
  });

  it('does not fulfill unpaid completed sessions', () => {
    expect(
      shouldFulfillCheckoutEvent(checkoutEvent({payment_status: 'unpaid'})),
    ).toBe(false);
  });

  it('builds the normalized n8n fulfillment payload', () => {
    const payload = buildFulfillmentPayload(checkoutEvent());

    expect(payload).toMatchObject({
      source: 'stripe_checkout',
      eventType: 'checkout.session.completed',
      fulfillmentStatus: 'paid',
      status: 'paid',
      businessName: 'Example Co',
      ownerName: 'Buyer Name',
      email: 'buyer@example.com',
      package: 'gtm-ops-pro',
      stripe: {
        eventId: 'evt_test_123',
        sessionId: 'cs_live_test_123',
        amountTotal: 9900,
        currency: 'USD',
        subscriptionId: 'sub_test_123',
      },
      consent: {
        promotionalEmails: 'opt_in',
        termsOfService: 'accepted',
      },
    });
  });
});

describe('Stripe webhook endpoint', () => {
  it('forwards paid Checkout events to the lead flow', async () => {
    const fetchMock = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValue(new Response(JSON.stringify({success: true})));

    const response = await onRequestPost({
      request: signedRequest(checkoutEvent()),
      env: {
        STRIPE_WEBHOOK_SECRET: secret,
        N8N_WEBHOOK_URL:
          'https://n8n.example.test/webhook/wranngle-intake-form',
        N8N_WEBHOOK_SECRET: 'n8n-secret',
      },
    } as never);
    const payload = (await fetchMock.mock.calls[0][1]?.body) as string;

    expect(response.status).toBe(200);
    expect(fetchMock).toHaveBeenCalledWith(
      'https://n8n.example.test/webhook/wranngle-intake-form',
      expect.objectContaining({
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Webhook-Secret': 'n8n-secret',
        },
      }),
    );
    expect(JSON.parse(payload)).toMatchObject({
      fulfillmentStatus: 'paid',
      package: 'gtm-ops-pro',
    });
  });

  it('rejects invalid signatures without forwarding', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch');

    const response = await onRequestPost({
      request: new Request('https://wranngle.com/api/stripe-webhook', {
        method: 'POST',
        headers: {'Stripe-Signature': 't=123,v1=bad'},
        body: JSON.stringify(checkoutEvent()),
      }),
      env: {
        STRIPE_WEBHOOK_SECRET: secret,
        N8N_WEBHOOK_URL:
          'https://n8n.example.test/webhook/wranngle-intake-form',
      },
    } as never);

    expect(response.status).toBe(400);
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
