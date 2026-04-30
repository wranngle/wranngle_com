import {describe, it, expect, vi, beforeEach, afterEach} from 'vitest';
import {onRequestPost as enrichPost} from '../../functions/api/enrich';
import {onRequestPost as clayResultPost} from '../../functions/api/clay-result';

function makeContext(
  env: Record<string, string | undefined>,
  body: unknown,
): Parameters<typeof enrichPost>[0] {
  return {
    env,
    request: new Request('https://example.com/api', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(body),
    }),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } as any;
}

function makeBadJsonContext(
  env: Record<string, string | undefined>,
): Parameters<typeof enrichPost>[0] {
  return {
    env,
    request: new Request('https://example.com/api', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: 'not-json',
    }),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } as any;
}

const sampleLead = {
  businessName: 'Acme Corp',
  industry: 'SaaS',
  ownerName: 'Jane Doe',
  phone: '+15555550100',
  email: 'jane@acme.com',
  package: 'premium',
};

const sampleEnriched = {
  ...sampleLead,
  emailValid: true,
  companyDescription: 'B2B software company',
  qualificationScore: 'high',
};

describe('enrich.ts', () => {
  let fetchSpy: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    fetchSpy = vi.fn().mockResolvedValue(new Response('ok', {status: 200}));
    vi.stubGlobal('fetch', fetchSpy);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('returns {queued:false} and skips fetch when CLAY_WEBHOOK_URL is absent', async () => {
    const ctx = makeContext({}, sampleLead);
    const res = await enrichPost(ctx);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body).toEqual({queued: false});
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('fires fetch to CLAY_WEBHOOK_URL and returns {queued:true}', async () => {
    const clayUrl = 'https://clay.run/webhook/abc123';
    const ctx = makeContext({CLAY_WEBHOOK_URL: clayUrl}, sampleLead);
    const res = await enrichPost(ctx);

    // Allow microtask queue to flush the void fetch
    await new Promise((r) => setTimeout(r, 0));

    const body = await res.json();
    expect(res.status).toBe(200);
    expect(body).toEqual({queued: true});
    expect(fetchSpy).toHaveBeenCalledWith(
      clayUrl,
      expect.objectContaining({
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
      }),
    );
  });

  it('forwards the exact lead payload to Clay', async () => {
    const clayUrl = 'https://clay.run/webhook/abc123';
    const ctx = makeContext({CLAY_WEBHOOK_URL: clayUrl}, sampleLead);
    await enrichPost(ctx);

    await new Promise((r) => setTimeout(r, 0));

    const [, init] = fetchSpy.mock.calls[0] as [string, RequestInit];
    expect(JSON.parse(init.body as string)).toEqual(sampleLead);
  });

  it('returns 400 on invalid JSON body', async () => {
    const ctx = makeBadJsonContext({CLAY_WEBHOOK_URL: 'https://clay.run/x'});
    const res = await enrichPost(ctx);
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body).toEqual({error: 'Invalid JSON'});
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('still returns 200 when Clay fetch rejects', async () => {
    fetchSpy.mockRejectedValue(new Error('network error'));
    const ctx = makeContext(
      {CLAY_WEBHOOK_URL: 'https://clay.run/x'},
      sampleLead,
    );
    const res = await enrichPost(ctx);

    await new Promise((r) => setTimeout(r, 0));

    expect(res.status).toBe(200);
    expect((await res.json() as {queued: boolean}).queued).toBe(true);
  });
});

describe('clay-result.ts', () => {
  let fetchSpy: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    fetchSpy = vi.fn().mockResolvedValue(new Response('ok', {status: 200}));
    vi.stubGlobal('fetch', fetchSpy);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('returns {received:true} when N8N_WEBHOOK_URL is absent', async () => {
    const ctx = makeContext({}, sampleEnriched);
    const res = await clayResultPost(ctx);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body).toEqual({received: true});
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('forwards enriched payload to N8N_WEBHOOK_URL and returns {received:true}', async () => {
    const n8nUrl = 'https://n8n.wranngle.com/webhook/abc';
    const ctx = makeContext({N8N_WEBHOOK_URL: n8nUrl}, sampleEnriched);
    const res = await clayResultPost(ctx);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body).toEqual({received: true});
    expect(fetchSpy).toHaveBeenCalledWith(
      n8nUrl,
      expect.objectContaining({method: 'POST'}),
    );

    const [, init] = fetchSpy.mock.calls[0] as [string, RequestInit];
    expect(JSON.parse(init.body as string)).toEqual(sampleEnriched);
  });

  it('returns {received:true} even when n8n fetch throws', async () => {
    fetchSpy.mockRejectedValue(new Error('n8n down'));
    const n8nUrl = 'https://n8n.wranngle.com/webhook/abc';
    const ctx = makeContext({N8N_WEBHOOK_URL: n8nUrl}, sampleEnriched);
    const res = await clayResultPost(ctx);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body).toEqual({received: true});
  });

  it('returns {received:true} on invalid JSON body', async () => {
    const ctx = makeBadJsonContext({
      N8N_WEBHOOK_URL: 'https://n8n.wranngle.com/webhook/abc',
    });
    const res = await clayResultPost(ctx);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body).toEqual({received: true});
    expect(fetchSpy).not.toHaveBeenCalled();
  });
});
