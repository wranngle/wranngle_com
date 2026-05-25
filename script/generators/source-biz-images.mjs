#!/usr/bin/env node
/**
 * Pulls 5 themed JPGs per slug from Unsplash source.unsplash.com into
 *   demo-stages/biz/<slug>/img/{hero,a,b,c,d}.jpg
 *
 * Idempotent: skips any slug whose directory already has 5 JPGs.
 * Fallback: picsum.photos seeded by slug+letter if Unsplash 404s.
 */
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(here, '../..');
const bizRoot = path.join(repoRoot, 'demo-stages/biz');

// slug → keyword list (Unsplash search keywords, order of preference)
const KEYWORDS = {
  'accounting-firm': ['accounting', 'office,desk', 'finance', 'spreadsheet', 'calculator'],
  'pet-grooming': ['dog,grooming', 'cat,pet', 'puppy', 'dog,bath', 'pet,brush'],
  'music-school': ['piano,lesson', 'guitar,music', 'violin', 'drums', 'sheet,music'],
  'car-detail': ['car,detail', 'auto,wash', 'car,wax', 'wheel,clean', 'garage,car'],
  'juice-bar': ['juice,cold-pressed', 'smoothie,bowl', 'fresh,fruit', 'green,juice', 'cafe,juice'],
  'bookbinder': ['bookbinding', 'leather,book', 'craft,paper', 'workshop,book', 'old,book'],
  'pottery-studio': ['pottery,wheel', 'ceramic,clay', 'ceramic,bowl', 'pottery,kiln', 'pottery,studio'],
  'chiropractor': ['chiropractor', 'spine,adjust', 'wellness,clinic', 'massage,table', 'physical,exam'],
  'pilates-studio': ['pilates,reformer', 'pilates,class', 'yoga,mat', 'fitness,studio', 'stretching'],
  'sushi-bar': ['sushi,chef', 'nigiri', 'sashimi', 'sushi,bar', 'omakase'],
  'pizzeria': ['pizza,oven', 'pizza,napoletana', 'pizza,wood-fired', 'pizza,slice', 'mozzarella'],
  'wine-bar': ['wine,glass', 'wine,bar', 'vineyard,wine', 'wine,cellar', 'cheese,wine'],
  'bookstore': ['bookstore', 'bookshop,interior', 'reading,book', 'library,books', 'cafe,books'],
  'gelato-shop': ['gelato', 'ice,cream,cone', 'gelato,scoop', 'italian,dessert', 'sorbet'],
  'locksmith': ['key,lock', 'door,lock', 'locksmith,tools', 'security,key', 'old,key'],
  'roofer': ['roof,construction', 'roofing,shingles', 'house,roof', 'metal,roof', 'roof,worker'],
  'landscaper': ['garden,landscape', 'lawn,mower', 'backyard,garden', 'hedge,trim', 'flower,bed'],
  // ---- ring 4 fill ----
  'bike-shop': ['bicycle,shop', 'cycling,road', 'mountain,bike', 'bike,wheel', 'bike,workshop'],
  'vinyl-shop': ['vinyl,records', 'turntable', 'record,store', 'cassette,vinyl', 'music,store'],
  'candle-maker': ['candle,wax', 'candle,jar', 'candle,workshop', 'soy,candle', 'candle,studio'],
  'watch-repair': ['watch,repair', 'wristwatch,vintage', 'pocket,watch', 'watchmaker', 'watch,tools'],
  'knife-sharpening': ['knife,sharpening', 'chef,knife', 'whetstone', 'kitchen,knife', 'sharpening,stone'],
  'arborist': ['tree,climb', 'tree,care', 'arborist,worker', 'tree,prune', 'forest,canopy'],
  'garden-nursery': ['plant,nursery', 'greenhouse,plant', 'garden,seedling', 'potted,plant', 'plant,shop'],
  'frame-shop': ['picture,frame', 'art,framing', 'gallery,frame', 'wooden,frame', 'matted,art'],
  'letterpress': ['letterpress', 'printing,press', 'typography,print', 'wood,type', 'printing,workshop'],
  'ice-cream-truck': ['ice,cream,truck', 'ice,cream,cone', 'soft,serve', 'sundae', 'ice,cream,parlor'],
  'arcade-bar': ['arcade,games', 'pinball', 'neon,arcade', 'arcade,cabinet', 'retro,gaming'],
  'piano-tuner': ['piano,tuning', 'grand,piano', 'piano,keys', 'piano,interior', 'piano,wires'],
  'bike-courier': ['bike,courier', 'messenger,bag', 'urban,cycling', 'city,bike', 'bike,delivery'],
  'leather-goods': ['leather,workshop', 'leather,bag', 'leather,wallet', 'tanned,leather', 'leather,craft'],
  'sail-school': ['sailboat', 'sailing,school', 'yacht,sail', 'marina', 'sailing,sea'],
  'film-lab': ['film,camera', 'darkroom', 'film,processing', '35mm,film', 'photography,lab'],
};

const slugs = Object.keys(KEYWORDS);
const LETTERS = ['hero', 'a', 'b', 'c', 'd'];

async function downloadOne(slug, letter, keyword, retry = 0) {
  const dir = path.join(bizRoot, slug, 'img');
  fs.mkdirSync(dir, {recursive: true});
  const dest = path.join(dir, `${letter}.jpg`);
  if (fs.existsSync(dest) && fs.statSync(dest).size > 8000) return 'cached';

  // Unsplash source endpoint redirects to a CDN — fetch follows redirects.
  const sig = Math.floor(Math.random() * 1_000_000);
  const url = `https://source.unsplash.com/featured/1600x1064/?${encodeURIComponent(keyword)}&sig=${sig}`;
  try {
    const res = await fetch(url, {redirect: 'follow'});
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const buf = Buffer.from(await res.arrayBuffer());
    if (buf.length < 8000) throw new Error(`thin response ${buf.length} bytes`);
    fs.writeFileSync(dest, buf);
    return 'unsplash';
  } catch (e) {
    if (retry < 1) {
      await new Promise((r) => setTimeout(r, 800));
      return downloadOne(slug, letter, keyword, retry + 1);
    }
    // Fallback: picsum seeded by slug+letter
    const psig = `${slug}-${letter}`.replaceAll(/[^a-z0-9]/gi, '');
    const purl = `https://picsum.photos/seed/${psig}/1600/1064`;
    const pres = await fetch(purl, {redirect: 'follow'});
    if (!pres.ok) throw new Error(`picsum HTTP ${pres.status}`);
    const pbuf = Buffer.from(await pres.arrayBuffer());
    fs.writeFileSync(dest, pbuf);
    return 'picsum';
  }
}

const tally = {unsplash: 0, picsum: 0, cached: 0};
for (const slug of slugs) {
  const keywords = KEYWORDS[slug];
  // Parallel within a slug (5 at a time)
  const results = await Promise.all(
    LETTERS.map((letter, i) => downloadOne(slug, letter, keywords[i]).catch((e) => `error:${e.message}`)),
  );
  const summary = results.map((r) => r).join(', ');
  for (const r of results) if (tally[r] !== undefined) tally[r]++;
  console.log(`✓ ${slug.padEnd(18)} ${summary}`);
}
console.log(`\nDone. Unsplash: ${tally.unsplash}, picsum: ${tally.picsum}, cached: ${tally.cached}`);
