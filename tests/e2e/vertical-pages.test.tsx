/**
 * Per-vertical landing page contract tests.
 *
 * Asserts the round-2 §6 item-3 promise: /plumbers, /hvac, and
 * /electricians render distinct headlines AND ship distinct og:image
 * URLs so social-card scrapers do not unfurl the same hero across all
 * three routes.
 *
 * Also enforces drift between content/verticals.yaml (the human-edited
 * manifest) and client/src/data/verticals.ts (the runtime registry).
 * Both files MUST agree on slug, displayName, headline, ogImage, etc.;
 * if they diverge, this test fails before the next refactor can ship.
 */
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createRoot} from 'react-dom/client';
import React, {act} from 'react';
import {describe, it, expect, beforeEach, afterEach} from 'vitest';
import VerticalLanding from '../../client/src/pages/vertical-landing.tsx';
import {VERTICALS, type Vertical} from '../../client/src/data/verticals.ts';

const REPO_ROOT = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '../..',
);
const YAML_PATH = path.join(REPO_ROOT, 'content/verticals.yaml');

async function renderVerticalIntoBody(vertical: Vertical): Promise<{
  container: HTMLElement;
  cleanup: () => void;
}> {
  const container = document.createElement('div');
  container.id = `vertical-test-${vertical.slug}`;
  document.body.append(container);
  const root = createRoot(container);
  await act(async () => {
    root.render(<VerticalLanding vertical={vertical} />);
  });
  return {
    container,
    cleanup() {
      act(() => {
        root.unmount();
      });
      container.remove();
    },
  };
}

function metaContent(property: string): string | undefined {
  return document.head.querySelector<HTMLMetaElement>(
    `meta[property="${property}"]`,
  )?.content;
}

describe('per-vertical landing pages', () => {
  beforeEach(() => {
    document.head.innerHTML = '';
    document.body.innerHTML = '';
    document.title = '';
  });

  afterEach(() => {
    document.head.innerHTML = '';
    document.body.innerHTML = '';
  });

  it('ships exactly the three expected vertical slugs', () => {
    const slugs = VERTICALS.map((v) => v.slug).sort();
    expect(slugs).toEqual(['electricians', 'hvac', 'plumbers']);
  });

  it('renders distinct headlines per vertical', async () => {
    const headlines = new Set<string>();
    for (const vertical of VERTICALS) {
      const {container, cleanup} = await renderVerticalIntoBody(vertical);
      const headlineEl = container.querySelector<HTMLElement>(
        '[data-testid="vertical-headline"]',
      );
      expect(headlineEl, `headline for /${vertical.slug}`).not.toBeNull();
      expect(headlineEl?.textContent).toBe(vertical.headline);
      headlines.add(headlineEl?.textContent ?? '');
      cleanup();
    }

    expect(
      headlines.size,
      'all three routes must ship distinct headline copy',
    ).toBe(3);
  });

  it('emits a distinct og:image URL per vertical', async () => {
    const images = new Set<string>();
    for (const vertical of VERTICALS) {
      const {cleanup} = await renderVerticalIntoBody(vertical);
      const ogImage = metaContent('og:image');
      const twitterImage = metaContent('twitter:image');
      expect(ogImage, `og:image for /${vertical.slug}`).toBe(vertical.ogImage);
      expect(twitterImage, `twitter:image for /${vertical.slug}`).toBe(
        vertical.ogImage,
      );
      images.add(ogImage ?? '');
      cleanup();
    }

    expect(
      images.size,
      'each vertical needs its own OG card, not a shared hero',
    ).toBe(3);
  });

  it('renders all proof points listed in the manifest', async () => {
    for (const vertical of VERTICALS) {
      const {container, cleanup} = await renderVerticalIntoBody(vertical);
      const items = container.querySelectorAll(
        '[data-testid="vertical-proof-points"] li',
      );
      expect(items.length, `proof-point count for /${vertical.slug}`).toBe(
        vertical.proofPoints.length,
      );
      cleanup();
    }
  });

  it('keeps content/verticals.yaml in sync with the runtime registry', () => {
    const yamlText = fs.readFileSync(YAML_PATH, 'utf8');
    const yamlVerticals = parseVerticalsYaml(yamlText);

    expect(yamlVerticals.map((v) => v.slug)).toEqual(
      VERTICALS.map((v) => v.slug),
    );

    for (const [index, runtime] of VERTICALS.entries()) {
      const manifest = yamlVerticals[index];
      expect(manifest, `yaml entry #${index}`).toBeDefined();
      expect(manifest.slug).toBe(runtime.slug);
      expect(manifest.displayName).toBe(runtime.displayName);
      expect(manifest.headline).toBe(runtime.headline);
      expect(manifest.subhead).toBe(runtime.subhead);
      expect(manifest.ctaLabel).toBe(runtime.ctaLabel);
      expect(manifest.ogImage).toBe(runtime.ogImage);
      expect(manifest.proofPoints).toEqual(runtime.proofPoints);
    }
  });
});

/**
 * Tiny purpose-built reader for content/verticals.yaml. The file has a
 * known flat shape (verticals: list of records with scalar fields plus
 * one list-of-strings field), so we do not pull in a YAML dependency
 * just to enforce the drift contract.
 */
type YamlVertical = {
  slug: string;
  displayName: string;
  headline: string;
  subhead: string;
  ctaLabel: string;
  ogImage: string;
  proofPoints: string[];
};

function parseVerticalsYaml(text: string): YamlVertical[] {
  const lines = text
    .split('\n')
    .map((line) => line.replace(/\r$/, ''))
    .filter((line) => !/^\s*#/.test(line));

  const records: YamlVertical[] = [];
  let inVerticals = false;
  let current: Partial<YamlVertical> | undefined;
  let proofPointsMode = false;

  for (const rawLine of lines) {
    if (rawLine.trim() === '') continue;

    if (!inVerticals) {
      if (/^verticals:\s*$/.test(rawLine)) inVerticals = true;
      continue;
    }

    const itemMatch = /^\s{2}-\s+slug:\s*(.+)$/.exec(rawLine);
    if (itemMatch) {
      if (current) records.push(finalizeRecord(current));
      current = {slug: stripQuotes(itemMatch[1]), proofPoints: []};
      proofPointsMode = false;
      continue;
    }

    if (!current) continue;

    const proofItem = /^\s{6}-\s+(.+)$/.exec(rawLine);
    if (proofPointsMode && proofItem) {
      current.proofPoints!.push(stripQuotes(proofItem[1]));
      continue;
    }

    const kv = /^\s{4}(\w+):\s*(.*)$/.exec(rawLine);
    if (!kv) continue;
    const key = kv[1];
    const value = kv[2];
    if (key === 'proofPoints') {
      proofPointsMode = true;
      continue;
    }

    proofPointsMode = false;
    (current as Record<string, unknown>)[key] = stripQuotes(value);
  }

  if (current) records.push(finalizeRecord(current));
  return records;
}

function finalizeRecord(record: Partial<YamlVertical>): YamlVertical {
  const required = [
    'slug',
    'displayName',
    'headline',
    'subhead',
    'ctaLabel',
    'ogImage',
  ] as const;
  for (const key of required) {
    if (typeof record[key] !== 'string') {
      throw new TypeError(`verticals.yaml entry missing field: ${key}`);
    }
  }

  return record as YamlVertical;
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
