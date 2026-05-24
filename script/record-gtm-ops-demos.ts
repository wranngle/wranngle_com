/**
 * Record three prospect-POV walkthroughs of the gtm_ops ops-console through
 * auto_demo (ui-demo-runner), then publish web-optimized assets the
 * /products/gtm-ops ProductScreenshot hero consumes. No ElevenLabs here — the
 * console is a static SPA, so there is no text-LLM quota to worry about.
 *
 * For each route it:
 *   1. runs the flow against a local static server serving the ops-console dir
 *   2. transcodes the captured recording.webm into a smaller, loop-ready webm
 *   3. extracts a poster JPG from the final second
 *   4. writes client/public/assets/gtm-ops-demos/manifest.json (+ src mirror)
 *
 * Run: bun run script/record-gtm-ops-demos.ts
 * Requires: Playwright chromium, ffmpeg, the built ui-demo-runner CLI, and the
 * gtm_ops repo checked out at ~/projects/gtm_ops.
 */
import {spawn} from 'node:child_process';
import {createServer} from 'node:http';
import {readFile, mkdir, writeFile, stat} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {dirname, join, extname, normalize} from 'node:path';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, '..');
const FLOWS = join(ROOT, 'demo-stages', 'gtm-ops-flows');
const WORK = join(ROOT, '.work', 'gtm-ops');
const PUBLIC = join(ROOT, 'client', 'public', 'assets', 'gtm-ops-demos');
const CONSOLE_ROOT = join(
  process.env.HOME ?? '',
  'projects',
  'gtm_ops',
  'apps',
  'ops-console',
);
const CLI = join(
  process.env.HOME ?? '',
  'projects',
  'auto_demo',
  'dist',
  'cli.js',
);
const PORT = 5191;
const DEMO_URL = 'https://app.wranngle.com';

const MIME: Record<string, string> = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'text/javascript',
  '.tsx': 'text/babel',
  '.ts': 'text/babel',
  '.json': 'application/json',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.pdf': 'application/pdf',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
};

type Route = {
  id: string;
  label: string;
  sub: string;
  route: string;
  query: string;
};

const ROUTES: Route[] = [
  {
    id: 'generate',
    label: 'Generate',
    sub: 'buyer brief · live trace',
    route: 'generate',
    query: 'route=generate&artifact=pdf',
  },
  {
    id: 'evals',
    label: 'Evals',
    sub: 'harness runs · ElevenLabs lab',
    route: 'evals',
    query: 'route=evals',
  },
  {
    id: 'settings',
    label: 'Settings',
    sub: 'alert consent · parity',
    route: 'settings',
    query: 'route=settings',
  },
];

async function serveConsole() {
  const server = createServer(async (req, res) => {
    try {
      const rel = decodeURIComponent((req.url ?? '/').split('?')[0]);
      // Normalize then reject traversal before touching the FS — the `..`
      // rejection on the normalized path is the sanitizer barrier CodeQL
      // recognizes (js/path-injection), even on this localhost-only server.
      const relPath = normalize(rel.endsWith('/') ? `${rel}index.html` : rel);
      if (relPath.includes('..')) {
        res.writeHead(403);
        res.end('forbidden');
        return;
      }

      const path = join(CONSOLE_ROOT, relPath);
      const body = await readFile(path);
      res.writeHead(200, {
        'content-type': MIME[extname(path)] ?? 'application/octet-stream',
      });
      res.end(body);
    } catch {
      res.writeHead(404);
      res.end('not found');
    }
  });
  return new Promise<ReturnType<typeof createServer>>((resolve) => {
    server.listen(PORT, '127.0.0.1', () => {
      resolve(server);
    });
  });
}

async function run(cmd: string, args: string[]) {
  return new Promise<void>((resolve, reject) => {
    const child = spawn(cmd, args, {stdio: 'inherit', env: process.env});
    child.on('exit', (code) => {
      if (code === 0) resolve();
      else reject(new Error(`${cmd} exited ${code}`));
    });
  });
}

async function recordFlow(route: Route) {
  const flow = join(FLOWS, `${route.id}.demo.json`);
  const out = join(WORK, route.id);
  await run('node', [
    CLI,
    'run',
    flow,
    '--output',
    out,
    '--base-url',
    `http://127.0.0.1:${PORT}/`,
  ]);
  return out;
}

async function publish(route: Route, outDir: string) {
  await mkdir(PUBLIC, {recursive: true});
  const src = join(outDir, 'recording.webm');
  const webm = join(PUBLIC, `${route.id}.webm`);
  const poster = join(PUBLIC, `${route.id}.poster.jpg`);
  await run('ffmpeg', [
    '-y',
    '-i',
    src,
    '-an',
    '-vf',
    'scale=1280:-2',
    '-c:v',
    'libvpx-vp9',
    '-b:v',
    '0',
    '-crf',
    '36',
    '-row-mt',
    '1',
    webm,
  ]);
  await run('ffmpeg', [
    '-y',
    '-sseof',
    '-1.5',
    '-i',
    src,
    '-frames:v',
    '1',
    '-vf',
    'scale=1280:-2',
    '-q:v',
    '4',
    poster,
  ]);
  const {size} = await stat(webm);
  return size;
}

async function main() {
  await mkdir(WORK, {recursive: true});
  const server = await serveConsole();
  const entries: Array<{
    id: string;
    label: string;
    sub: string;
    video: string;
    poster: string;
    href: string;
  }> = [];
  try {
    for (const route of ROUTES) {
      console.log(`\n=== recording ${route.id} ===`);
      const outDir = await recordFlow(route);
      const bytes = await publish(route, outDir);
      console.log(`published ${route.id}: ${(bytes / 1024).toFixed(0)} KB`);
      entries.push({
        id: route.id,
        label: route.label,
        sub: route.sub,
        video: `/assets/gtm-ops-demos/${route.id}.webm`,
        poster: `/assets/gtm-ops-demos/${route.id}.poster.jpg`,
        href: `${DEMO_URL}/console/?${route.query}`,
      });
    }
  } finally {
    server.close();
  }

  const body = `${JSON.stringify(entries, null, 2)}\n`;
  await writeFile(join(PUBLIC, 'manifest.json'), body);
  await writeFile(
    join(ROOT, 'client', 'src', 'pages', 'gtm-ops-demos.manifest.json'),
    body,
  );
  console.log(`\nmanifest -> ${join(PUBLIC, 'manifest.json')}`);
}

await main();
