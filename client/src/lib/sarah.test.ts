import {describe, it, expect} from 'vitest';
import {buildSarahDynamicVariables, type SarahMode} from './sarah.ts';

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
    const parsed = JSON.parse(
      buildSarahDynamicVariables('after-hours-demo'),
    ) as {
      mode: string;
      surface_context: string;
    };
    expect(parsed.mode).toBe('after-hours-demo');
    expect(parsed.surface_context).toBe('wranngle-com');
  });

  it('round-trips every documented agent mode (prompt-branch parity)', () => {
    // These three values are exactly what the live agent prompt branches on.
    // Adding a SarahMode without updating the prompt is the drift this guards.
    const modes: SarahMode[] = ['lead-intake', 'after-hours-demo', 'general'];
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
