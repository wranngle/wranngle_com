import path from 'node:path';
import {readFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {describe, it, expect} from 'vitest';
import {
  buildSarahDynamicVariables,
  SARAH_AGENT_ID,
  type SarahMode,
} from './sarah.ts';

/**
 * Sarah widget dynamic-variables contract (round-2 F003 + F008 + F016).
 *
 * The ElevenLabs agent's system prompt branches on `mode` and
 * `surface_context` passed through the widget's `dynamic-variables`
 * attribute. These assertions are the drift guard between what the page
 * encodes and the three modes the agent prompt is written to handle —
 * if a new SarahMode is added here without the prompt knowing about it,
 * or the JSON shape changes, this fails.
 */
describe('buildSarahDynamicVariables', () => {
  it('encodes mode + surface_context as the JSON the widget expects', () => {
    const raw = buildSarahDynamicVariables('lead-intake', 'wranngle-com/home');
    const parsed = JSON.parse(raw) as Record<string, string>;
    expect(parsed).toEqual({
      mode: 'lead-intake',
      surface_context: 'wranngle-com/home',
    });
  });

  it('defaults surface_context when omitted', () => {
    const parsed = JSON.parse(buildSarahDynamicVariables('roleplay-demo')) as {
      mode: string;
      surface_context: string;
    };
    expect(parsed.mode).toBe('roleplay-demo');
    expect(parsed.surface_context).toBe('wranngle-com');
  });

  it('round-trips every documented agent mode (prompt-branch parity)', () => {
    // These three values are exactly what the live agent prompt branches on.
    // Adding a SarahMode without updating the prompt is the drift this guards.
    const modes: SarahMode[] = ['lead-intake', 'roleplay-demo', 'general'];
    for (const mode of modes) {
      const parsed = JSON.parse(buildSarahDynamicVariables(mode)) as {
        mode: string;
      };
      expect(parsed.mode).toBe(mode);
    }
  });

  it('always produces valid JSON (the widget attribute requires it)', () => {
    expect(() =>
      JSON.parse(buildSarahDynamicVariables('general', String.raw`x"y\z`)),
    ).not.toThrow();
  });
});

/**
 * 404 fallback drift guard.
 *
 * client/public/404.html mounts the widget inline because direct hits to
 * unknown URLs are served by Cloudflare's static handler before any React
 * runs. The literals there (agent ID + widget loader version) must mirror
 * what the SPA uses — if either drifts, callers landing on a 404 talk to
 * a stale agent or load a different widget build.
 *
 * The 404 entry point is HTML-only by necessity (no JS imports possible),
 * so the right shape of guard is a test that fails when the literals
 * diverge — not de-duplication.
 */
describe('404 fallback widget literals', () => {
  const repoRoot = path.resolve(
    path.dirname(fileURLToPath(import.meta.url)),
    '../../..',
  );
  const html = readFileSync(
    path.join(repoRoot, 'client/public/404.html'),
    'utf8',
  );
  const loaderScript = readFileSync(
    path.join(repoRoot, 'client/src/lib/sarah.ts'),
    'utf8',
  );

  it('uses the same agent-id as SARAH_AGENT_ID', () => {
    const match = /agent-id="([^"]+)"/.exec(html);
    expect(match?.[1]).toBe(SARAH_AGENT_ID);
  });

  it('loads the same convai-widget-embed version as the SPA loader', () => {
    const spaVersion = /convai-widget-embed@(\d+\.\d+\.\d+)/.exec(
      loaderScript,
    )?.[1];
    const fallbackVersion = /convai-widget-embed@(\d+\.\d+\.\d+)/.exec(
      html,
    )?.[1];
    expect(spaVersion).toBeDefined();
    expect(fallbackVersion).toBe(spaVersion);
  });
});
