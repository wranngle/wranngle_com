/**
 * Testimonial grid contract tests.
 *
 * Asserts the round-2 §6 item-4 promise: a state/ZIP-filterable
 * testimonial grid that renders 5 placeholder testimonials, and when
 * the state filter is set to "CA", only CA testimonials remain in the
 * DOM (the other states drop out completely, not merely hide).
 *
 * Also enforces drift between content/testimonials.yaml (the human-
 * edited manifest) and client/src/data/testimonials.ts (the runtime
 * registry). Both files MUST agree on every field; if they diverge,
 * this test fails before the next refactor can ship.
 *
 * Sibling above-fold story surface to the round-1 case-study video
 * hero (#77) — the grid carries the regional proof signal that the
 * video alone cannot.
 */
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createRoot, type Root} from 'react-dom/client';
import React, {act} from 'react';
import {describe, it, expect, beforeEach, afterEach} from 'vitest';
import TestimonialGrid from '../../client/src/components/TestimonialGrid.tsx';
import {
  TESTIMONIALS,
  filterTestimonials,
  type Testimonial,
} from '../../client/src/data/testimonials.ts';

const REPO_ROOT = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '../..',
);
const YAML_PATH = path.join(REPO_ROOT, 'content/testimonials.yaml');

type Rendered = {
  container: HTMLElement;
  root: Root;
  cleanup: () => void;
};

async function renderGrid(): Promise<Rendered> {
  const container = document.createElement('div');
  container.id = 'testimonial-grid-test-root';
  document.body.append(container);
  const root = createRoot(container);
  await act(async () => {
    root.render(<TestimonialGrid />);
  });
  return {
    container,
    root,
    cleanup() {
      act(() => {
        root.unmount();
      });
      container.remove();
    },
  };
}

function changeInput(
  container: HTMLElement,
  testId: string,
  value: string,
): void {
  const element = container.querySelector<HTMLInputElement | HTMLSelectElement>(
    `[data-testid="${testId}"]`,
  );
  expect(element, `control ${testId}`).not.toBeNull();
  const nativeSetter = Object.getOwnPropertyDescriptor(
    element instanceof HTMLSelectElement
      ? HTMLSelectElement.prototype
      : HTMLInputElement.prototype,
    'value',
  )?.set;
  nativeSetter?.call(element, value);
  act(() => {
    element!.dispatchEvent(new Event('input', {bubbles: true}));
    element!.dispatchEvent(new Event('change', {bubbles: true}));
  });
}

function cardStates(container: HTMLElement): string[] {
  const cards = container.querySelectorAll<HTMLElement>(
    '[data-testid="testimonial-card"]',
  );
  return [...cards].map((c) => c.dataset.state ?? '');
}

describe('TestimonialGrid', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('ships exactly 5 placeholder testimonials', () => {
    expect(TESTIMONIALS).toHaveLength(5);
  });

  it('renders all 5 testimonials when no filter is applied', async () => {
    const {container, cleanup} = await renderGrid();
    const cards = container.querySelectorAll(
      '[data-testid="testimonial-card"]',
    );
    expect(cards.length).toBe(TESTIMONIALS.length);
    expect(cards.length).toBe(5);
    cleanup();
  });

  it('filters to CA and renders only CA testimonials', async () => {
    const {container, cleanup} = await renderGrid();

    expect(cardStates(container).sort()).toEqual(
      TESTIMONIALS.map((t) => t.state).sort(),
    );

    changeInput(container, 'testimonial-state-filter', 'CA');

    const states = cardStates(container);
    expect(states.length).toBeGreaterThan(0);
    expect(states.every((s) => s === 'CA')).toBe(true);

    const expectedCount = TESTIMONIALS.filter((t) => t.state === 'CA').length;
    expect(states.length).toBe(expectedCount);

    const nonCa = container.querySelectorAll(
      '[data-testid="testimonial-card"]:not([data-state="CA"])',
    );
    expect(nonCa.length).toBe(0);

    cleanup();
  });

  it('supports ZIP prefix filtering', async () => {
    const {container, cleanup} = await renderGrid();
    changeInput(container, 'testimonial-zip-filter', '907');
    const cards = container.querySelectorAll<HTMLElement>(
      '[data-testid="testimonial-card"]',
    );
    for (const card of cards) {
      expect(card.dataset.zip?.startsWith('907')).toBe(true);
    }

    cleanup();
  });

  it('renders an empty state when the filter matches nothing', async () => {
    const {container, cleanup} = await renderGrid();
    changeInput(container, 'testimonial-state-filter', 'CA');
    changeInput(container, 'testimonial-zip-filter', '99999');
    const cards = container.querySelectorAll(
      '[data-testid="testimonial-card"]',
    );
    expect(cards.length).toBe(0);
    const empty = container.querySelector(
      '[data-testid="testimonial-empty-state"]',
    );
    expect(empty).not.toBeNull();
    cleanup();
  });

  it('clear button restores the full grid', async () => {
    const {container, cleanup} = await renderGrid();
    changeInput(container, 'testimonial-state-filter', 'CA');
    const beforeClear = container.querySelectorAll(
      '[data-testid="testimonial-card"]',
    );
    expect(beforeClear.length).toBeLessThan(TESTIMONIALS.length);

    const clearButton = container.querySelector<HTMLButtonElement>(
      '[data-testid="testimonial-clear-filter"]',
    );
    expect(clearButton).not.toBeNull();
    act(() => {
      clearButton!.click();
    });

    const afterClear = container.querySelectorAll(
      '[data-testid="testimonial-card"]',
    );
    expect(afterClear.length).toBe(TESTIMONIALS.length);
    cleanup();
  });

  it('filterTestimonials pure helper agrees with the rendered grid', () => {
    const onlyCa = filterTestimonials(TESTIMONIALS, {state: 'ca'});
    expect(onlyCa.every((t) => t.state === 'CA')).toBe(true);
    expect(onlyCa.length).toBe(
      TESTIMONIALS.filter((t) => t.state === 'CA').length,
    );

    const empty = filterTestimonials(TESTIMONIALS, {});
    expect(empty.length).toBe(TESTIMONIALS.length);
  });

  it('keeps content/testimonials.yaml in sync with the runtime registry', () => {
    const yamlText = fs.readFileSync(YAML_PATH, 'utf8');
    const yamlTestimonials = parseTestimonialsYaml(yamlText);

    expect(yamlTestimonials.map((t) => t.id)).toEqual(
      TESTIMONIALS.map((t) => t.id),
    );

    for (const [index, runtime] of TESTIMONIALS.entries()) {
      const manifest = yamlTestimonials[index];
      expect(manifest, `yaml entry #${index}`).toBeDefined();
      expect(manifest.id).toBe(runtime.id);
      expect(manifest.name).toBe(runtime.name);
      expect(manifest.role).toBe(runtime.role);
      expect(manifest.businessName).toBe(runtime.businessName);
      expect(manifest.state).toBe(runtime.state);
      expect(manifest.zip).toBe(runtime.zip);
      expect(manifest.vertical).toBe(runtime.vertical);
      expect(manifest.quote).toBe(runtime.quote);
    }
  });
});

/**
 * Tiny purpose-built reader for content/testimonials.yaml. The file has
 * a known flat shape (testimonials: list of records with scalar fields
 * only), so we do not pull in a YAML dependency just to enforce the
 * drift contract. Mirrors the approach used in vertical-pages.test.tsx.
 */
type YamlTestimonial = Testimonial;

function parseTestimonialsYaml(text: string): YamlTestimonial[] {
  const lines = text
    .split('\n')
    .map((line) => line.replace(/\r$/, ''))
    .filter((line) => !/^\s*#/.test(line));

  const records: Array<Partial<YamlTestimonial>> = [];
  let inList = false;
  let current: Partial<YamlTestimonial> | undefined;

  for (const rawLine of lines) {
    if (rawLine.trim() === '') continue;

    if (!inList) {
      if (/^testimonials:\s*$/.test(rawLine)) inList = true;
      continue;
    }

    const itemMatch = /^\s{2}-\s+id:\s*(.+)$/.exec(rawLine);
    if (itemMatch) {
      if (current) records.push(current);
      current = {id: stripQuotes(itemMatch[1])};
      continue;
    }

    if (!current) continue;

    const kv = /^\s{4}(\w+):\s*(.*)$/.exec(rawLine);
    if (!kv) continue;
    const key = kv[1] as keyof YamlTestimonial;
    const value = stripQuotes(kv[2]);
    (current as Record<string, unknown>)[key] = value;
  }

  if (current) records.push(current);

  return records.map((record) => finalizeRecord(record));
}

function finalizeRecord(record: Partial<YamlTestimonial>): YamlTestimonial {
  const required: ReadonlyArray<keyof YamlTestimonial> = [
    'id',
    'name',
    'role',
    'businessName',
    'state',
    'zip',
    'vertical',
    'quote',
  ];
  for (const key of required) {
    if (typeof record[key] !== 'string') {
      throw new TypeError(`testimonials.yaml entry missing field: ${key}`);
    }
  }

  return record as YamlTestimonial;
}

function stripQuotes(value: string): string {
  const trimmed = value.trim();
  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return trimmed.slice(1, -1);
  }

  return trimmed;
}
