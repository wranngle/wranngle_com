/**
 * Doctrine-drift guard between functions/ env reads and .env.example.
 *
 * Every `env.VAR` referenced in functions/ is something an operator
 * needs to set in the Cloudflare dashboard (production) or in .env
 * (local wrangler). If a new env var is read in a Pages Function but
 * not added to .env.example, the next person who clones the repo
 * silently gets a 500 at runtime because the function reads
 * `undefined` from `context.env`.
 *
 * .env.example also documents test/script-only vars (Twilio, SMTP2GO,
 * etc.) — those are allowed to be in .env.example without a function
 * read site. The asymmetric assertion is: every functions-read var
 * MUST be in .env.example; the reverse is informational only.
 */

import path from 'node:path';
import {readFileSync, readdirSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {describe, it, expect} from 'vitest';

const REPO_ROOT = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '../..',
);

function* walkFiles(dir: string): Generator<string> {
  for (const entry of readdirSync(dir, {withFileTypes: true})) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) yield* walkFiles(p);
    else if (entry.isFile() && /\.(ts|tsx|mjs)$/.test(entry.name)) yield p;
  }
}

function functionsEnvReads(): Set<string> {
  const out = new Set<string>();
  const functionsDir = path.join(REPO_ROOT, 'functions');
  for (const file of walkFiles(functionsDir)) {
    const src = readFileSync(file, 'utf8');
    for (const m of src.matchAll(/\benv\.([A-Z][A-Z\d_]+)\b/g)) {
      out.add(m[1]);
    }
  }

  return out;
}

function envExampleKeys(): Set<string> {
  const src = readFileSync(path.join(REPO_ROOT, '.env.example'), 'utf8');
  return new Set([...src.matchAll(/^([A-Z][A-Z\d_]+)\s*=/gm)].map((m) => m[1]));
}

describe('.env.example drift', () => {
  it('documents every env var read by functions/', () => {
    const read = functionsEnvReads();
    const documented = envExampleKeys();
    const undocumented = [...read].filter((v) => !documented.has(v)).sort();
    expect(undocumented).toEqual([]);
  });

  it('finds a non-trivial number of read sites', () => {
    // Guards against the regex silently matching nothing after a refactor.
    expect(functionsEnvReads().size).toBeGreaterThanOrEqual(5);
  });
});
