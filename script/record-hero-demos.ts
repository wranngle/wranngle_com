/**
 * Record the three hero-demo landing-page flows through auto_demo
 * (ui-demo-runner), then publish web-optimized assets the carousel consumes.
 *
 * For each vertical it:
 *   1. runs the flow against a local static server serving demo-stages/
 *   2. transcodes the captured recording.webm into a smaller, loop-ready webm
 *   3. extracts a poster JPG from the final second
 *   4. writes client/public/assets/hero-demos/manifest.json
 *
 * Run: bun run script/record-hero-demos.ts
 * Requires: ELEVENLABS_API_KEY (the agents reply over the real API),
 *           Playwright chromium, ffmpeg, and the built ui-demo-runner CLI.
 */
import {spawn} from 'node:child_process';
import {createServer} from 'node:http';
import {readFile, mkdir, writeFile, copyFile, stat} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {dirname, join, extname, resolve as resolvePath, sep} from 'node:path';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, '..');
const STAGES = join(ROOT, 'demo-stages');
const WORK = join(ROOT, '.work', 'hero');
const PUBLIC = join(ROOT, 'client', 'public', 'assets', 'hero-demos');
const CLI = join(
  process.env.HOME ?? '',
  'projects',
  'auto_demo',
  'dist',
  'cli.js',
);
const PORT = 5188;

const MIME: Record<string, string> = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'text/javascript',
  '.json': 'application/json',
};

type Vertical = {id: string; brand: string; tagline: string; caption: string};

const VERTICALS: Vertical[] = [
  {
    id: 'trattoria',
    brand: 'Bella Vista Trattoria',
    tagline: 'Reservations · Patio season',
    caption: 'Restaurant — books the table',
  },
  {
    id: 'dental',
    brand: 'Tidewater Family Dental',
    tagline: 'Same-day emergency booking',
    caption: 'Dental — triages the emergency',
  },
  {
    id: 'salon',
    brand: 'Atlas Hair Co.',
    tagline: 'Color continuity · Reschedules',
    caption: 'Salon — reschedules with the same formula',
  },
];

async function serveStages() {
  const server = createServer(async (req, res) => {
    try {
      const rel = decodeURIComponent((req.url ?? '/').split('?')[0]);
      const relPath = rel.endsWith('/') ? `${rel}index.html` : rel;
      // Resolve under STAGES and reject any path that escapes it (the URL is
      // attacker-controllable in principle even on a localhost recording
      // server — CodeQL js/path-injection).
      const path = resolvePath(STAGES, `.${relPath}`);
      if (path !== STAGES && !path.startsWith(`${STAGES}${sep}`)) {
        res.writeHead(403);
        res.end('forbidden');
        return;
      }

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

async function run(cmd: string, args: string[], env?: Record<string, string>) {
  return new Promise<void>((resolve, reject) => {
    const child = spawn(cmd, args, {
      stdio: 'inherit',
      env: {...process.env, ...env},
    });
    child.on('exit', (code) => {
      code === 0 ? resolve() : reject(new Error(`${cmd} exited ${code}`));
    });
  });
}

async function recordFlow(v: Vertical) {
  const flow = join(STAGES, 'flows', `${v.id}.demo.json`);
  const out = join(WORK, v.id);
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

async function publish(v: Vertical, outDir: string) {
  await mkdir(PUBLIC, {recursive: true});
  const src = join(outDir, 'recording.webm');
  const webm = join(PUBLIC, `${v.id}.webm`);
  const poster = join(PUBLIC, `${v.id}.poster.jpg`);

  // Re-encode to a leaner VP9 loop and scale to a hero-friendly width.
  await run('ffmpeg', [
    '-y',
    '-i',
    src,
    '-an',
    '-vf',
    'scale=960:-2',
    '-c:v',
    'libvpx-vp9',
    '-b:v',
    '0',
    '-crf',
    '34',
    '-row-mt',
    '1',
    webm,
  ]);

  // Poster: a frame near the end where the full conversation is visible.
  await run('ffmpeg', [
    '-y',
    '-sseof',
    '-1.5',
    '-i',
    src,
    '-frames:v',
    '1',
    '-vf',
    'scale=960:-2',
    '-q:v',
    '4',
    poster,
  ]);

  const {size} = await stat(webm);
  return {webm, poster, bytes: size};
}

async function main() {
  await mkdir(WORK, {recursive: true});
  const server = await serveStages();
  const entries: Array<{
    id: string;
    brand: string;
    tagline: string;
    caption: string;
    video: string;
    poster: string;
    agentId: string;
  }> = [];
  const agents = JSON.parse(
    await readFile(join(STAGES, 'agents.json'), 'utf8'),
  ) as Array<{id: string; agentId: string}>;
  const agentById = new Map(agents.map((a) => [a.id, a.agentId]));
  try {
    for (const v of VERTICALS) {
      console.log(`\n=== recording ${v.id} ===`);
      const outDir = await recordFlow(v);
      const {bytes} = await publish(v, outDir);
      console.log(`published ${v.id}: ${(bytes / 1024).toFixed(0)} KB`);
      entries.push({
        id: v.id,
        brand: v.brand,
        tagline: v.tagline,
        caption: v.caption,
        video: `/assets/hero-demos/${v.id}.webm`,
        poster: `/assets/hero-demos/${v.id}.poster.jpg`,
        agentId: agentById.get(v.id) ?? '',
      });
    }
  } finally {
    server.close();
  }

  const manifestBody = `${JSON.stringify(entries, null, 2)}\n`;
  await writeFile(join(PUBLIC, 'manifest.json'), manifestBody);
  // Mirror into src so TypeScript's program graph (include: client/src/**)
  // sees the typed import the carousel component consumes.
  await writeFile(
    join(ROOT, 'client', 'src', 'components', 'hero-demos.manifest.json'),
    manifestBody,
  );
  console.log(`\nmanifest -> ${join(PUBLIC, 'manifest.json')}`);
}

await main();
