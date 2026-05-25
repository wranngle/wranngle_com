#!/usr/bin/env node
/**
 * Pulls 5 placeholder JPGs per slug into
 *   demo-stages/biz/<slug>/img/{hero,a,b,c,d}.jpg
 *
 * Currently sources from picsum.photos with a deterministic
 * `${slug}-${letter}` seed — Unsplash's free `source.unsplash.com`
 * endpoint was shut down (returns 503 globally as of 2026-05). The
 * KEYWORDS map below stays as documentation of intent for each slug;
 * a future themed source (Unsplash API + key, Pexels, etc.) can read
 * it without changing the call sites.
 *
 * Idempotent: skips any slug whose directory already has 5 JPGs of
 * non-trivial size (>8 KB).
 */
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(here, '../..');
const bizRoot = path.join(repoRoot, 'demo-stages/biz');

// slug → keyword list. Documents the visual intent for each tile (and
// is what a future themed source would query). Picsum doesn't use these
// — it just needs a stable seed — but every slug listed in
// demo-stages/biz/_businesses.json must still have an entry so the
// inventory stays complete. The hero-tiles-drift test enforces 1:1.
const KEYWORDS = {
  // ---- original 20 (rings 1–2) ----
  'bakery': ['sourdough,bread', 'bakery,loaves', 'artisan,bread', 'baker,oven', 'flour,dusted'],
  'barbershop': ['barber,scissors', 'barbershop,chair', 'straight,razor', 'barber,cape', 'barbershop,interior'],
  'bbq-joint': ['bbq,smoker', 'brisket,plate', 'pulled,pork', 'barbecue,ribs', 'smokehouse'],
  'climbing-gym': ['climbing,gym', 'bouldering,wall', 'rock,climber', 'climbing,holds', 'belay,lead'],
  'cocktail-bar': ['cocktail,bar', 'bartender,shaker', 'mezcal,smoke', 'amaro,glass', 'speakeasy'],
  'coffee-roaster': ['coffee,roaster', 'coffee,beans', 'pour,over', 'espresso,shot', 'latte,art'],
  'crossfit-gym': ['crossfit,gym', 'barbell,deadlift', 'kettlebell', 'strength,training', 'gym,equipment'],
  'dermatology': ['dermatology', 'skin,clinic', 'doctor,exam', 'medical,office', 'wellness,clinic'],
  'electrician': ['electrician', 'electrical,panel', 'wiring,install', 'circuit,breaker', 'tools,belt'],
  'family-law': ['law,office', 'attorney,desk', 'legal,documents', 'gavel,books', 'consultation'],
  'florist': ['florist,bouquet', 'flower,shop', 'wedding,flowers', 'fresh,blooms', 'roses,arrangement'],
  'hvac': ['hvac,install', 'heat,pump', 'air,conditioner', 'mini,split', 'ductwork'],
  'nail-studio': ['nail,salon', 'manicure', 'gel,nails', 'nail,art', 'nail,polish'],
  'physical-therapy': ['physical,therapy', 'rehab,clinic', 'exercise,ball', 'recovery,table', 'therapist,patient'],
  'plumber': ['plumber', 'pipe,wrench', 'water,heater', 'plumbing,install', 'kitchen,sink'],
  'ramen-bar': ['ramen,bowl', 'tonkotsu', 'noodle,broth', 'ramen,shop', 'chashu,pork'],
  'tattoo-parlor': ['tattoo,artist', 'tattoo,studio', 'fine,line,tattoo', 'tattoo,machine', 'tattoo,sleeve'],
  'vegan-cafe': ['vegan,cafe', 'plant,based,bowl', 'avocado,toast', 'smoothie,bowl,vegan', 'salad,greens'],
  'vet': ['veterinarian', 'dog,checkup', 'cat,exam', 'vet,clinic', 'puppy,visit'],
  'yoga-studio': ['yoga,studio', 'yoga,pose', 'meditation,mat', 'vinyasa,flow', 'savasana'],
  // ---- ring 3 fill ----
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
  // ---- ring 4 fill (16 more) ----
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

async function downloadOne(slug, letter) {
  const dir = path.join(bizRoot, slug, 'img');
  fs.mkdirSync(dir, {recursive: true});
  const dest = path.join(dir, `${letter}.jpg`);
  if (fs.existsSync(dest) && fs.statSync(dest).size > 8000) return 'cached';

  // picsum.photos seeded by slug+letter so repeated runs converge on
  // the same image per slot. Lazy.medium.com / Pexels / Unsplash-with-key
  // could slot in here later by keying off the KEYWORDS map above.
  const seed = `${slug}-${letter}`.replaceAll(/[^a-z\d]/gi, '');
  const url = `https://picsum.photos/seed/${seed}/1600/1064`;
  const res = await fetch(url, {redirect: 'follow'});
  if (!res.ok) throw new Error(`picsum HTTP ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());
  fs.writeFileSync(dest, buf);
  return 'picsum';
}

const tally = {picsum: 0, cached: 0};
for (const slug of slugs) {
  // Parallel within a slug (5 letters at a time).
  const results = await Promise.all(
    LETTERS.map((letter) =>
      downloadOne(slug, letter).catch((e) => `error:${e.message}`),
    ),
  );
  for (const r of results) if (tally[r] !== undefined) tally[r]++;
  console.log(`✓ ${slug.padEnd(18)} ${results.join(', ')}`);
}

console.log(`\nDone. picsum: ${tally.picsum}, cached: ${tally.cached}`);
