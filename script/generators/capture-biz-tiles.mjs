#!/usr/bin/env node
/**
 * Captures the 20 generated landing pages to widescreen JPGs for the hero
 * tiles. Serves demo-stages/biz/ via a tiny static server so the relative
 * img/ paths resolve, then takes one screenshot per slug at 1600x1000
 * (16:10 — matches the ElevenLabs demo recordings + the polygon hero's
 * heroExtraWidth aspect strategy). Writes:
 *
 *   client/public/assets/hero-tiles/<slug>.jpg       — 1600x1000 (high-res)
 *   client/public/assets/hero-tiles/<slug>.thumb.jpg — 640×400 downsample (ring view)
 *   client/public/assets/hero-tiles/manifest.json    — slug → name + vertical + layout
 *
 * The manifest is consumed by PolygonTileHero so it can show the page
 * cropped to a square when the tile sits in the ring and unfurl to the
 * full widescreen when the tile is hero-zoomed.
 */
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import sharp from 'sharp';
import {chromium} from '../../../../../../auto_demo/node_modules/playwright/index.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(here, '../..');
const bizRoot = path.join(repoRoot, 'demo-stages/biz');
const outDir = path.join(repoRoot, 'client/public/assets/hero-tiles');
fs.mkdirSync(outDir, {recursive: true});

const businesses = JSON.parse(
  fs.readFileSync(path.join(bizRoot, '_businesses.json'), 'utf8'),
);

// Tiny static server over demo-stages/biz/<slug>/
function serve(root, port) {
  return new Promise((resolve) => {
    const server = http.createServer((req, res) => {
      try {
        const url = new URL(req.url, `http://localhost:${port}`);
        let filePath = path.join(root, decodeURIComponent(url.pathname));
        // SECURITY: reject any path that escapes root
        const norm = path.normalize(filePath);
        if (!norm.startsWith(root)) {
          res.statusCode = 403;
          res.end('forbidden');
          return;
        }

        filePath =
          norm.endsWith('/') || !path.extname(norm)
            ? path.join(norm, 'index.html')
            : norm;
        if (!fs.existsSync(filePath)) {
          res.statusCode = 404;
          res.end('not found');
          return;
        }

        const ext = path.extname(filePath).toLowerCase();
        const mime =
          {
            '.html': 'text/html',
            '.jpg': 'image/jpeg',
            '.png': 'image/png',
            '.webp': 'image/webp',
            '.css': 'text/css',
            '.js': 'text/javascript',
          }[ext] || 'application/octet-stream';
        res.setHeader('Content-Type', mime);
        fs.createReadStream(filePath).pipe(res);
      } catch (error) {
        res.statusCode = 500;
        res.end(String(error));
      }
    });
    server.listen(port, '127.0.0.1', () => resolve(server));
  });
}

const PORT = 8901;
const server = await serve(bizRoot, PORT);

const browser = await chromium.launch({headless: true});
const ctx = await browser.newContext({
  viewport: {width: 1600, height: 1000},
  deviceScaleFactor: 1,
});

const manifest = [];
for (const b of businesses) {
  const page = await ctx.newPage();
  const url = `http://localhost:${PORT}/${b.slug}/`;
  console.log(`→ ${b.slug}  (${b.layout})  ${url}`);
  await page.goto(url, {waitUntil: 'networkidle', timeout: 25_000});
  // Give the page a moment to settle webfonts + images
  await page.waitForTimeout(900);
  const full = path.join(outDir, `${b.slug}.jpg`);
  const thumb = path.join(outDir, `${b.slug}.thumb.jpg`);
  const fullBuf = await page.screenshot({
    clip: {x: 0, y: 0, width: 1600, height: 1000},
    type: 'jpeg',
    quality: 82,
  });
  await fs.promises.writeFile(full, fullBuf);
  // Thumb: full-page downsample to 640×400 (16:10). The previous right-side
  // 720×720 clip lost the wordmark on layouts where the hero image column
  // doesn't land at x≈720 (clinical, architectural variants). Downsampling
  // keeps wordmark + headline + hero image legible across every template;
  // the consumer's object-fit:cover finishes the polygon shape-mask.
  await sharp(fullBuf)
    .resize(640, 400, {fit: 'cover', position: 'top'})
    .jpeg({quality: 78})
    .toFile(thumb);
  await page.close();
  manifest.push({
    slug: b.slug,
    name: b.name,
    vertical: b.vertical,
    layout: b.layout,
    full: `/assets/hero-tiles/${b.slug}.jpg`,
    thumb: `/assets/hero-tiles/${b.slug}.thumb.jpg`,
  });
}

await browser.close();
server.close();

fs.writeFileSync(
  path.join(outDir, 'manifest.json'),
  JSON.stringify(manifest, null, 2),
);
console.log(`\n✓ Captured ${manifest.length} tiles → ${outDir}`);
