#!/usr/bin/env node
/**
 * Generates 20 distinct mock business landing pages under
 *   demo-stages/biz/<slug>/index.html
 *
 * Each business has its own palette, font pair, and one of 5 layout templates.
 * Pages consume the Unsplash-sourced JPGs already staged at
 *   demo-stages/biz/<slug>/img/{hero,a,b,c,d}.jpg
 *
 * The output is captured by capture-biz-tiles.mjs into
 *   client/public/assets/hero-tiles/<slug>.jpg + manifest.json
 * which is consumed by PolygonTileHero as the stock tile imagery.
 */
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath, pathToFileURL} from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(here, '../..');
const bizRoot = path.join(repoRoot, 'demo-stages/biz');

/* ------------------------------------------------------------------ */
/* 37 business identities — distinct palette + font + layout each      */
/* ------------------------------------------------------------------ */
// Layout variants: editorial | clinical | bold | warm | architectural
// `featured: true` means the tile enters the hero spotlight rotation in
// PolygonTileHero. Default is false — those tiles stay in the ring as
// static landing-page fill.
const BUSINESSES = [
  {
    slug: 'bakery',
    name: 'Aviary Bakehouse',
    tagline: 'Slow ferment. Stone hearth. Six-day sourdough.',
    vertical: 'Artisan bakery — Brooklyn, NY',
    layout: 'warm',
    fonts: {h: 'Fraunces', b: 'Inter'},
    palette: {
      bg: '#f7f1e6',
      ink: '#1b1610',
      accent: '#b85e2a',
      muted: '#8f7a5f',
      card: '#fffaf0',
    },
    nav: ['Loaves', 'Pastries', 'Subscriptions', 'Visit'],
    hero: {kicker: 'Est. 2019', cta: 'Order the weekly loaf'},
    sections: [
      {
        title: 'This week at the bench',
        items: [
          [
            'Country sourdough',
            'Six-day cold ferment. Heritage hard winter wheat from Pennsylvania. $9',
          ],
          [
            'Olive & herb fougasse',
            'Castelvetrano + rosemary. Friday + Saturday only. $11',
          ],
          [
            'Brown butter laminated brioche',
            'Eight folds. Polish flour. Pull-apart loaf. $14',
          ],
          [
            'Miso chocolate babka',
            'White miso + 70% Valrhona. Sliced + boxed. $16',
          ],
        ],
      },
      {
        title: 'Standing orders',
        items: [
          [
            'Weekly bread CSA',
            '$32/mo · pickup Saturdays · two loaves rotated by the bench team',
          ],
          [
            'Café wholesale',
            'A.M. drops by 5:30 — Park Slope, Cobble Hill, Crown Heights',
          ],
        ],
      },
    ],
  },
  {
    slug: 'barbershop',
    name: 'Pinion & Crow Barber Co.',
    tagline: 'Old-house haircuts. Hot towel. Straight razor. No app.',
    vertical: 'Barbershop — Portland, OR',
    layout: 'editorial',
    fonts: {h: 'Playfair Display', b: 'Work Sans'},
    palette: {
      bg: '#1c1815',
      ink: '#f3ece0',
      accent: '#c8a26b',
      muted: '#8d7e6c',
      card: '#231e1a',
    },
    nav: ['Services', 'Crew', 'Walk-in board', 'Find us'],
    hero: {kicker: 'Since 2014', cta: 'Get on the board'},
    sections: [
      {
        title: 'The list',
        items: [
          [
            'The Pinion cut',
            'Scissor over comb, taper, hot towel finish. 45 min · $48',
          ],
          [
            'Straight-razor shave',
            'Pre-shave hot wrap, lather, single-blade pass + cleanup. 35 min · $42',
          ],
          ['Beard sculpt + steam', 'Trim, shape, tonic, oil. 25 min · $30'],
          ['Father + son seat', 'Two cuts in adjacent chairs. 90 min · $74'],
        ],
      },
      {
        title: 'Behind the chairs',
        items: [
          [
            'Marco Pinion',
            "Owner. Twelve years at Hilly's in San Francisco before opening up here.",
          ],
          [
            'Della Crowfoot',
            'Razor specialist. Pittsburgh transplant. Books out three weeks.',
          ],
        ],
      },
    ],
  },
  {
    slug: 'bbq-joint',
    name: 'Hickory Hall',
    tagline: 'Whole-hog Carolina BBQ. Wood smoke from 4 a.m.',
    vertical: 'Barbecue restaurant — Asheville, NC',
    layout: 'bold',
    fonts: {h: 'Bebas Neue', b: 'Source Sans 3'},
    palette: {
      bg: '#181210',
      ink: '#fff6e8',
      accent: '#e8521a',
      muted: '#a08573',
      card: '#241a16',
    },
    nav: ['The Pit', 'Sides', 'Catering', 'Hours'],
    hero: {kicker: 'Pit-smoked since 2017', cta: 'Order the platter'},
    sections: [
      {
        title: 'From the pit',
        items: [
          [
            'Whole-hog plate',
            '12-hour hickory smoke, vinegar pepper, slaw, hush puppies. $24',
          ],
          [
            'Brisket sandwich',
            'Texas-cut point, white bread, slaw, pickles. $18',
          ],
          [
            'Smoked half chicken',
            'Dry rub, finished over coals, white sauce on the side. $19',
          ],
          [
            'Burnt ends, by the half-pound',
            'Rendered, glazed, double-smoked. $14',
          ],
        ],
      },
      {
        title: 'Sides + plates',
        items: [
          [
            'Collards',
            'Slow braised with smoked hock and apple cider vinegar. $6',
          ],
          ['Mac & cheese', 'Three-cheese, breadcrumb crust. $7'],
          [
            'Banana pudding',
            'Vanilla wafer, fresh whipped, salted vanilla. $7',
          ],
        ],
      },
    ],
  },
  {
    slug: 'climbing-gym',
    name: 'North Face Climbing Co-op',
    tagline: 'Volume, granite-textured holds, fifty new problems weekly.',
    vertical: 'Climbing gym — Boulder, CO',
    layout: 'architectural',
    fonts: {h: 'Archivo Black', b: 'Inter'},
    palette: {
      bg: '#0e1418',
      ink: '#e6edf3',
      accent: '#5dd5c4',
      muted: '#7a8a96',
      card: '#161e24',
    },
    nav: ['Membership', 'Classes', 'Setting calendar', 'Visit'],
    hero: {kicker: 'Member-owned co-op', cta: 'Reserve a trial pass'},
    sections: [
      {
        title: 'Walls + grades',
        items: [
          [
            'Bouldering cave',
            '4,800 sq ft. V0-V11. Reset weekly by a rotating crew of four setters.',
          ],
          [
            'Lead arena',
            '45-ft routes, 1,500 lines per quarter, autobelays + top-rope stations.',
          ],
          [
            'Training board',
            'MoonBoard 2019 set + Tension Board 2 + system board.',
          ],
        ],
      },
      {
        title: 'Classes this week',
        items: [
          [
            'Intro to lead',
            'Tuesdays + Thursdays 7pm · $35 drop-in · $25 members',
          ],
          [
            'Strength + finger health',
            'Saturdays 9am · 90 min · $40 / free for members',
          ],
          ['Kids climb club', 'Sundays 10am, ages 7-12 · 8-week sessions'],
        ],
      },
    ],
  },
  {
    slug: 'cocktail-bar',
    name: 'Lantern & Owl',
    tagline: 'House-made bitters. Rotating amaro. Quiet enough to talk.',
    vertical: 'Cocktail bar — New Orleans, LA',
    layout: 'editorial',
    fonts: {h: 'Cormorant Garamond', b: 'Karla'},
    palette: {
      bg: '#0f0e14',
      ink: '#ece6d7',
      accent: '#d9a566',
      muted: '#897e6c',
      card: '#181620',
    },
    nav: ['List', 'Reservations', 'Private rooms', 'About'],
    hero: {
      kicker: 'A room with thirty-eight seats',
      cta: 'Reserve a banquette',
    },
    sections: [
      {
        title: 'On the list tonight',
        items: [
          [
            'Smoke Signal',
            'Mezcal, smoked pineapple, lime cordial, sea salt, applewood smoke. $17',
          ],
          [
            'Hollow Bell',
            'Rye, Cynar, walnut bitters, hand-carved orange peel. $15',
          ],
          [
            'Cane & Citrus',
            'White rum, lime, demerara, mint, sparkling lemon. $14',
          ],
          [
            'Negroni Reserve',
            'Bombay Sapphire East, Antica Formula, Campari macerated 30 days. $19',
          ],
        ],
      },
      {
        title: 'House practice',
        items: [
          [
            'Bitters lab',
            'We tincture our own across 14 botanicals — a 6-bottle list rotates monthly.',
          ],
          [
            'Glassware',
            'Hand-blown, sourced from a five-person studio in West Virginia.',
          ],
        ],
      },
    ],
  },
  {
    slug: 'coffee-roaster',
    name: 'Stalk & Tin Coffee',
    tagline: "Single-farm. Lightly developed. Sold the week it's roasted.",
    vertical: 'Specialty coffee roaster — Madison, WI',
    layout: 'clinical',
    fonts: {h: 'Manrope', b: 'Inter'},
    palette: {
      bg: '#fbfaf6',
      ink: '#1a1814',
      accent: '#3a6b4e',
      muted: '#75716a',
      card: '#ffffff',
    },
    nav: ['Beans', 'Subscriptions', 'Café', 'Wholesale'],
    hero: {
      kicker: 'Roasted Tuesdays + Fridays',
      cta: "Browse this week's lots",
    },
    sections: [
      {
        title: 'On the rack',
        items: [
          [
            'Bolivia · La Pampa',
            'Caturra. Honey processed. Apricot, brown sugar, soft cocoa. $22 / 250g',
          ],
          [
            'Ethiopia · Banko Gotiti',
            'Heirloom. Natural. Strawberry, jasmine, mead-like body. $24 / 250g',
          ],
          [
            'Honduras · Las Capucas',
            'Pacas. Washed. Almond, milk chocolate, cane sugar. $19 / 250g',
          ],
        ],
      },
      {
        title: 'How we buy',
        items: [
          [
            'Direct trade',
            'We pay 30-50% above C-market. Contracts are public on the bag.',
          ],
          [
            'Cupping',
            'Every lot scored 86+ by two cuppers before we contract it.',
          ],
        ],
      },
    ],
  },
  {
    slug: 'crossfit-gym',
    name: 'Iron Bell Strength',
    tagline: 'Strength first. Conditioning second. Coached, not yelled at.',
    vertical: 'Strength + conditioning gym — Salt Lake City, UT',
    layout: 'bold',
    fonts: {h: 'Oswald', b: 'Inter'},
    palette: {
      bg: '#10141a',
      ink: '#f5f5f4',
      accent: '#f9c81a',
      muted: '#8a8d92',
      card: '#1a1f27',
    },
    nav: ['Programs', 'Coaches', 'Schedule', 'Drop in'],
    hero: {kicker: 'Coached small-group strength', cta: 'Book a free intro'},
    sections: [
      {
        title: 'Programs',
        items: [
          [
            'Strength Foundations',
            '12-week beginner block. Squat, hinge, press, pull, carry. 3x/week.',
          ],
          [
            'Daily Strength',
            '60-min coached class. Periodized lifting + 12-minute conditioning piece.',
          ],
          [
            'Hypertrophy Lab',
            'Bodybuilding-style 4-day split. Member-run + coach-checked.',
          ],
          [
            'Endurance Builder',
            '5K-to-marathon coaching. Saturday long runs from the gym door.',
          ],
        ],
      },
      {
        title: 'Coaches',
        items: [
          [
            'Mara Ellison',
            'USAW L1 + CSCS. Eight years coaching. Bench focus.',
          ],
          ['Dev Kuretsky', 'Strongman background. Conditioning + carries.'],
        ],
      },
    ],
  },
  {
    slug: 'dermatology',
    name: 'Field Avenue Skin Clinic',
    tagline: 'Medical dermatology with the cosmetic suite next door.',
    vertical: 'Dermatology practice — Minneapolis, MN',
    layout: 'clinical',
    fonts: {h: 'DM Serif Display', b: 'DM Sans'},
    palette: {
      bg: '#f4f1ec',
      ink: '#1e2024',
      accent: '#b56e6c',
      muted: '#6e7177',
      card: '#ffffff',
    },
    nav: ['Services', 'Providers', 'New patients', 'Book'],
    hero: {
      kicker: 'Board-certified, in-network with 7 plans',
      cta: 'Request an appointment',
    },
    sections: [
      {
        title: 'Medical',
        items: [
          [
            'Skin cancer screening',
            '20-min full body, dermoscopy, biopsy in-clinic if needed.',
          ],
          [
            'Acne management',
            'Topicals, oral therapy, isotretinoin program, scar revision.',
          ],
          [
            'Psoriasis + eczema',
            'Biologic + light therapy. Three suites with narrowband UVB.',
          ],
        ],
      },
      {
        title: 'Cosmetic',
        items: [
          ['Botox + filler', 'RN injectors trained at MN Aesthetic Institute.'],
          ['Microneedling + PRP', '60-min protocol, four-session course.'],
          ['Laser', 'Pico + IPL + erbium. Same-day topical numbing.'],
        ],
      },
    ],
  },
  {
    slug: 'electrician',
    name: 'Holloway Electric',
    tagline: 'Licensed, insured, picks up the phone.',
    vertical: 'Residential + light commercial electrician — Charleston, SC',
    layout: 'architectural',
    fonts: {h: 'Space Grotesk', b: 'Inter'},
    palette: {
      bg: '#13171d',
      ink: '#eaecef',
      accent: '#f0b81b',
      muted: '#7d828a',
      card: '#1c2129',
    },
    nav: ['Services', 'Service area', 'Reviews', 'Get a quote'],
    hero: {kicker: 'SC licensed master · Lic #4598-M', cta: 'Schedule a visit'},
    sections: [
      {
        title: 'What we do',
        items: [
          [
            'Panel upgrades',
            'From 100A to 200A or 400A. Same-day inspection coordination.',
          ],
          [
            'EV charger install',
            'Level 2 chargers — Tesla, ChargePoint, Wallbox. Permit included.',
          ],
          [
            'Whole-home rewires',
            'Old knob-and-tube to NEC 2020. Drywall patch + paint subcontract.',
          ],
          [
            'Generator install + service',
            'Generac + Kohler. Concrete pad, gas line, transfer switch.',
          ],
        ],
      },
      {
        title: 'Service window',
        items: [
          [
            'Same-day callbacks',
            'Texts answered within 30 min during business hours.',
          ],
          [
            'On-time guarantee',
            "If we're late beyond the 2-hour window, the service call is free.",
          ],
        ],
      },
    ],
  },
  {
    slug: 'family-law',
    name: 'Wren & Hadley LLP',
    tagline:
      'Family law, mediation, and collaborative divorce. Plain language.',
    vertical: 'Family law firm — Raleigh, NC',
    layout: 'editorial',
    fonts: {h: 'Lora', b: 'Source Sans 3'},
    palette: {
      bg: '#f6f3ee',
      ink: '#1b1c20',
      accent: '#5b6e4f',
      muted: '#6f6c66',
      card: '#ffffff',
    },
    nav: ['Practice', 'Attorneys', 'Process', 'Consult'],
    hero: {
      kicker: 'Twenty years in Wake County',
      cta: 'Request a private consult',
    },
    sections: [
      {
        title: 'How we work',
        items: [
          [
            'Collaborative divorce',
            'Both spouses agree to settle out of court. Lower cost, child-first.',
          ],
          [
            'Mediation',
            'Single neutral, two attorneys present. Half-day or full-day sessions.',
          ],
          [
            'Custody + co-parenting',
            'Parenting plans drafted in plain language; review every 12 months.',
          ],
        ],
      },
      {
        title: 'Why families call us',
        items: [
          [
            'Flat-fee where possible',
            'For uncontested matters, you get a fee letter at intake.',
          ],
          [
            'One point of contact',
            "You don't bounce between paralegals. One attorney + one assistant.",
          ],
        ],
      },
    ],
  },
  {
    slug: 'florist',
    name: 'Bramble & Stem',
    tagline: 'Seasonal blooms, foraged stems, weekly market arrangements.',
    vertical: 'Florist + event design — Nashville, TN',
    layout: 'warm',
    fonts: {h: 'DM Serif Text', b: 'Karla'},
    palette: {
      bg: '#faf3ec',
      ink: '#23201d',
      accent: '#9b6b89',
      muted: '#888178',
      card: '#ffffff',
    },
    nav: ['Market days', 'Weddings', 'Subscriptions', 'Visit'],
    hero: {
      kicker: 'Tuesdays + Fridays at the storefront',
      cta: 'Reserve a market bouquet',
    },
    sections: [
      {
        title: "What's in this week",
        items: [
          [
            'Garden roses + ranunculus',
            'Local-grown from a half-acre cutting field in Bell Buckle.',
          ],
          [
            'Foraged eucalyptus + ivy',
            'Cut from our own backyard hedgerow + a partner farm.',
          ],
          [
            'Tulips + anemones',
            'Dutch import for the season — last call mid-May.',
          ],
        ],
      },
      {
        title: 'For your wedding',
        items: [
          [
            'Full design',
            'Bouquet, ceremony installation, reception centerpieces, send-off petals.',
          ],
          [
            'A-la-carte',
            'Just bouquets + boutonnières. Pickup the morning of.',
          ],
        ],
      },
    ],
  },
  {
    slug: 'hvac',
    name: 'Northstar HVAC',
    tagline: 'Heat pumps, mini-splits, ducted systems. Same-day service.',
    vertical: 'HVAC installer + service — Saint Paul, MN',
    layout: 'architectural',
    fonts: {h: 'Space Grotesk', b: 'Inter'},
    palette: {
      bg: '#f4f6f9',
      ink: '#161a22',
      accent: '#1f7ed8',
      muted: '#5f6675',
      card: '#ffffff',
    },
    nav: ['Service', 'Install', 'Maintenance plans', 'Estimate'],
    hero: {
      kicker: 'NATE-certified · 24/7 service',
      cta: 'Book a free estimate',
    },
    sections: [
      {
        title: 'What we install',
        items: [
          [
            'Cold-climate heat pumps',
            'Mitsubishi, Daikin, Bosch — rated to -15°F. Eligible for state rebates.',
          ],
          [
            'Ducted central air',
            'Two-stage and variable-speed. We size with Manual J + S.',
          ],
          [
            'Ductless mini-splits',
            'Per-room comfort. One outdoor unit, up to five heads.',
          ],
        ],
      },
      {
        title: 'Service + maintenance',
        items: [
          [
            'Twice-a-year tune-ups',
            'Spring AC, fall furnace. Free filter set for plan members.',
          ],
          [
            'Emergency calls',
            'Same-day service, 7-day calendar. Flat after-hours fee.',
          ],
        ],
      },
    ],
  },
  {
    slug: 'nail-studio',
    name: 'Cosmos Nail Studio',
    tagline: 'Gel + builder + Russian manicure, by a five-tech team.',
    vertical: 'Nail studio — Austin, TX',
    layout: 'bold',
    fonts: {h: 'Syne', b: 'Inter'},
    palette: {
      bg: '#f3eef7',
      ink: '#231d2c',
      accent: '#7b3df5',
      muted: '#8a809a',
      card: '#ffffff',
    },
    nav: ['Menu', 'Techs', 'Gallery', 'Book'],
    hero: {kicker: 'Tuesday – Saturday · downtown', cta: 'Book a chair'},
    sections: [
      {
        title: 'Menu',
        items: [
          ['Russian manicure + gel', '90 min · cuticle work + gloss · $65'],
          ['Builder gel set', '110 min · sculpted shape + apex · $85'],
          ['Soft chrome / cat-eye', '15-min add-on · per nail · $5'],
          [
            'Nail art, custom',
            'Quote at the chair. Hand-drawn, decals, foil, encapsulated.',
          ],
        ],
      },
      {
        title: 'Your tech',
        items: [
          ['Anya Mirov', 'Russian-trained. Builder + structure specialist.'],
          ['Joelle Kim', 'Pearl + chrome + cat-eye. Featured in Allure 2025.'],
        ],
      },
    ],
  },
  {
    slug: 'physical-therapy',
    name: 'Cedar Bend PT',
    tagline: 'One-hour appointments. One PT, one room, one plan.',
    vertical: 'Physical therapy — Bend, OR',
    layout: 'clinical',
    fonts: {h: 'Manrope', b: 'Inter'},
    palette: {
      bg: '#f1f4f1',
      ink: '#1a201a',
      accent: '#5f8a4f',
      muted: '#6b7269',
      card: '#ffffff',
    },
    nav: ['Conditions', 'Therapists', 'Insurance', 'Book'],
    hero: {
      kicker: 'In-network with 12 plans · cash-pay options',
      cta: 'Request a 1-on-1 visit',
    },
    sections: [
      {
        title: 'What we treat',
        items: [
          [
            'Post-op recovery',
            'Knee, hip, shoulder, ACL. Surgeon protocols + return-to-sport testing.',
          ],
          [
            'Chronic back + neck',
            'McKenzie + DNS + targeted strength. Tracked outcomes at 4, 8, 12 weeks.',
          ],
          [
            'Runners + climbers',
            'Gait analysis, finger and elbow load programs, return-to-trail planning.',
          ],
        ],
      },
      {
        title: 'Our model',
        items: [
          [
            'One PT per visit',
            'Not handed off to an aide. The same therapist for the whole plan.',
          ],
          [
            'Outcomes published',
            'We track and share recovery time vs. expected. Ask at intake.',
          ],
        ],
      },
    ],
  },
  {
    slug: 'plumber',
    name: 'Crestline Plumbing',
    tagline: 'Family-owned since 1983. Honest quotes, written warranties.',
    vertical: 'Residential plumbing — Spokane, WA',
    layout: 'architectural',
    fonts: {h: 'Archivo', b: 'Inter'},
    palette: {
      bg: '#fbfbfa',
      ink: '#181a20',
      accent: '#2e5fab',
      muted: '#5a6068',
      card: '#f1f3f8',
    },
    nav: ['Services', 'About', 'Reviews', 'Schedule'],
    hero: {
      kicker: 'Master plumber · Lic. PB-4520',
      cta: 'Get a same-day visit',
    },
    sections: [
      {
        title: 'Common calls',
        items: [
          [
            'Water heater install + repair',
            'Tankless, hybrid, traditional. Same-day if we have the model.',
          ],
          [
            'Sewer + drain',
            'Camera inspection, hydro-jetting, trenchless replacement.',
          ],
          [
            'Repipe + slab leak',
            'PEX + copper. Free estimate, written warranty, drywall patch coordinated.',
          ],
          [
            'Bathroom + kitchen remodel',
            'We work with your GC or solo. Permit included.',
          ],
        ],
      },
      {
        title: 'How we price',
        items: [
          [
            'Flat-rate quotes',
            'We give the number before we start. No surprise hourly add-ons.',
          ],
          [
            'Written warranty',
            '2 years on parts + labor. Lifetime on PEX repipes.',
          ],
        ],
      },
    ],
  },
  {
    slug: 'ramen-bar',
    name: 'Kōri Ramen',
    tagline: 'Tonkotsu, shio, miso. Tare made in-house. Twelve seats.',
    vertical: 'Ramen bar — Seattle, WA',
    layout: 'editorial',
    fonts: {h: 'Noto Serif JP', b: 'Inter'},
    palette: {
      bg: '#16110d',
      ink: '#f1e9db',
      accent: '#dc4c3e',
      muted: '#8b7e6e',
      card: '#1f1814',
    },
    nav: ['Bowls', 'Sides', 'About', 'Wait list'],
    hero: {
      kicker: 'Counter seating only · no app, no DMs',
      cta: 'Get on the wait list',
    },
    sections: [
      {
        title: 'Bowls',
        items: [
          [
            'Tonkotsu shio',
            '18-hour pork bone broth, sea-salt tare, ajitama, chashu, scallion. $17',
          ],
          [
            'Miso',
            'Red + white miso blend, ground pork, corn, butter, bean sprouts, scallion. $16',
          ],
          [
            'Spicy ginger',
            'Chicken broth, ginger tare, chili oil, ground pork, soft-boiled egg. $18',
          ],
          [
            'Tsukemen (dipping)',
            'Dense double-soup, chilled noodles, dipping cup. $19',
          ],
        ],
      },
      {
        title: 'House rules',
        items: [
          [
            'No reservations',
            "Wait list opens at 4:30pm at the door. We text when your seat's ready.",
          ],
          ['Twelve seats', 'No groups over four. Cash, Visa, MC.'],
        ],
      },
    ],
  },
  {
    slug: 'tattoo-parlor',
    name: 'Iron Heron Tattoo',
    tagline: 'Custom, single-needle, fine-line. Booked six months out.',
    vertical: 'Tattoo studio — Philadelphia, PA',
    layout: 'bold',
    fonts: {h: 'Anton', b: 'Inter'},
    palette: {
      bg: '#0d0d0e',
      ink: '#f4f1ec',
      accent: '#cd2b3c',
      muted: '#777472',
      card: '#161618',
    },
    nav: ['Artists', 'Portfolio', 'Booking', 'Studio'],
    hero: {
      kicker: 'Six artists · by appointment',
      cta: 'Apply for a booking slot',
    },
    sections: [
      {
        title: 'Artists',
        items: [
          [
            'Eva Linder',
            'Fine-line, single-needle botanicals. Three-year book; quarterly drop on the 1st.',
          ],
          [
            'Dom Castile',
            'Black & gray realism. Portraits + memorial work. Two-year book.',
          ],
          [
            'River Okonkwo',
            'American traditional. Walk-ins on Fridays + Saturdays.',
          ],
          [
            'Pi Akhmatova',
            'Geometric + dotwork. Sleeve specialist. Custom-only.',
          ],
        ],
      },
      {
        title: 'Booking',
        items: [
          [
            'Application',
            'Fill our form with reference, placement, size, and a budget range.',
          ],
          ['Deposit', '$200 non-refundable, applied to your final session.'],
        ],
      },
    ],
  },
  {
    slug: 'vegan-cafe',
    name: 'Greenhouse 14',
    tagline: 'Plant-only café and pastry counter. Open seven days.',
    vertical: 'Vegan café — Burlington, VT',
    layout: 'warm',
    fonts: {h: 'Fraunces', b: 'Inter'},
    palette: {
      bg: '#f1f4ec',
      ink: '#1b1e16',
      accent: '#4f7a3a',
      muted: '#7b8071',
      card: '#ffffff',
    },
    nav: ['Menu', 'Pastry', 'Brunch', 'Find us'],
    hero: {kicker: 'Plant-based · 100% vegan', cta: "See today's menu"},
    sections: [
      {
        title: 'The menu',
        items: [
          [
            'Cashew ricotta toast',
            'Sourdough, lemon-cashew ricotta, hot honey, microgreens. $12',
          ],
          [
            'Smoky tempeh BLT',
            'Maple-smoked tempeh, butter lettuce, heirloom tomato, vegan aioli. $14',
          ],
          [
            'Mushroom + leek galette',
            'Spelt crust, herbed cashew cream, oyster mushrooms, leek confit. $13',
          ],
          [
            'Cardamom oat latte',
            'In-house oat milk, cardamom, La Colombe espresso. $5.50',
          ],
        ],
      },
      {
        title: 'House practice',
        items: [
          [
            'Compost program',
            'Everything off the plates and the prep line goes to a 14-farm composter.',
          ],
          [
            'Local sourcing',
            'Produce from 7 Vermont farms within 30 miles. Posted on the chalkboard.',
          ],
        ],
      },
    ],
  },
  {
    slug: 'vet',
    name: 'Northside Veterinary',
    tagline: 'Fear-free certified. Same-day sick visits. House calls.',
    vertical: 'Veterinary clinic — Madison, WI',
    layout: 'clinical',
    fonts: {h: 'DM Serif Display', b: 'Inter'},
    palette: {
      bg: '#f4f1ec',
      ink: '#1d1f24',
      accent: '#6c8d8e',
      muted: '#727680',
      card: '#ffffff',
    },
    nav: ['Services', 'Care team', 'New patients', 'Book'],
    hero: {kicker: 'Fear-Free Certified Practice', cta: 'Book a visit'},
    sections: [
      {
        title: 'For your pet',
        items: [
          [
            'Wellness exams',
            'Annual + senior. Bloodwork, dental scoring, vaccinations.',
          ],
          ['Sick visits', 'Same-day for cough, GI, urinary, ear, eye, skin.'],
          [
            'Dental + surgery',
            'In-house digital X-ray, full dental suite, soft tissue + ortho.',
          ],
          [
            'House calls',
            'In-home euthanasia + senior wellness within 25 miles.',
          ],
        ],
      },
      {
        title: 'Why Fear-Free',
        items: [
          [
            'Treats + pheromones',
            'Every room has a treat jar and species-specific calming spray.',
          ],
          [
            'No exam-table wrestling',
            'Cats stay in their carriers. Dogs get the floor.',
          ],
        ],
      },
    ],
  },
  {
    slug: 'yoga-studio',
    name: 'Sage & Cedar Yoga',
    tagline: 'Vinyasa, Yin, prenatal. Seven instructors, four studios.',
    vertical: 'Yoga studio — Boise, ID',
    layout: 'warm',
    fonts: {h: 'Cormorant Garamond', b: 'Karla'},
    palette: {
      bg: '#f1ece2',
      ink: '#1f1c16',
      accent: '#a47a4a',
      muted: '#7e776a',
      card: '#ffffff',
    },
    nav: ['Classes', 'Teachers', 'Workshops', 'New here?'],
    hero: {
      kicker: 'Drop-in welcome · first class free',
      cta: "See this week's schedule",
    },
    sections: [
      {
        title: 'Class types',
        items: [
          [
            'Vinyasa flow',
            '60-min flowing sequence. Levels 1, 2, and 2/3 mixed.',
          ],
          [
            'Yin',
            '75 min, long-hold floor postures. Props provided. Great for runners.',
          ],
          [
            'Prenatal + postnatal',
            'Saturday mornings. Certified RPYT instructors.',
          ],
          [
            'Restorative',
            'Sunday evenings. Bolsters, blankets, candlelight. No vinyasa.',
          ],
        ],
      },
      {
        title: 'How to start',
        items: [
          [
            'First class free',
            'Drop in for any class on us — no card required.',
          ],
          [
            'Intro month',
            '$59 unlimited for 30 days. Renews to standard membership only if you opt in.',
          ],
        ],
      },
    ],
  },

  // ------- Ring 3 fill (17 more businesses, none featured) -------------

  {
    slug: 'accounting-firm', name: 'Lattimer & Holt CPA',
    tagline: 'Tax, audit, and outsourced controller. Fixed monthly fee.',
    vertical: 'Accounting firm — Charlotte, NC', layout: 'editorial',
    fonts: {h: 'Cormorant Garamond', b: 'Inter'},
    palette: {bg: '#f6f4ef', ink: '#171924', accent: '#1d4f7a', muted: '#6e7280', card: '#ffffff'},
    nav: ['Services', 'Industries', 'Insights', 'Engage'],
    hero: {kicker: 'CPA-led since 2008', cta: 'Schedule a fee proposal'},
    sections: [
      {title: 'Practice', items: [
        ['Tax compliance', '1040, 1065, 1120-S, 1120-C. State multistate when relevant.'],
        ['Outsourced controller', 'Monthly close, KPI pack, board-ready financials.'],
        ['Audit & assurance', 'Reviews, compilations, single-audits for nonprofit clients.'],
        ['M&A diligence', 'Quality-of-earnings, working capital, post-close support.'],
      ]},
      {title: 'How we work', items: [
        ['Fixed fee', 'Engagement letters in flat-fee tiers. No surprise hourly bills.'],
        ['One partner', "You don't get reshuffled between staff. One partner, one manager."],
      ]},
    ],
  },
  {
    slug: 'pet-grooming', name: 'Bramble & Boop',
    tagline: 'Fear-free grooming. Two-tech rooms. Walk-out same hour.',
    vertical: 'Dog & cat grooming — Denver, CO', layout: 'warm',
    fonts: {h: 'DM Serif Display', b: 'Karla'},
    palette: {bg: '#fbf3ef', ink: '#241915', accent: '#d77b58', muted: '#8b7b73', card: '#ffffff'},
    nav: ['Services', 'Pricing', 'Our team', 'Book'],
    hero: {kicker: 'Open Tue – Sat', cta: 'Book your pup'},
    sections: [
      {title: 'Menu', items: [
        ['Bath & blow-out', '60 min · oatmeal shampoo, brush, nail trim, ear clean. From $48'],
        ['Full groom', '90 min · breed cut, sanitary trim, paw pads, finish spray. From $78'],
        ['Cat tidy', '45 min · sanitary, mat removal, nail trim, light bath. From $58'],
        ['Puppy intro', '30 min · gentle desensitization + light tidy. $35'],
      ]},
      {title: 'Why families come back', items: [
        ['Two-tech rooms', 'No crating between steps. One groomer + one assistant per dog.'],
        ['Calming protocol', 'Pheromone diffusers + non-slip mats + treat reinforcement.'],
      ]},
    ],
  },
  {
    slug: 'music-school', name: 'Stoneharbor Music Conservatory',
    tagline: 'Private lessons, ensembles, and recitals. Ages 5 to 95.',
    vertical: 'Music school — Pittsburgh, PA', layout: 'editorial',
    fonts: {h: 'Playfair Display', b: 'Source Sans 3'},
    palette: {bg: '#1a1925', ink: '#ede8da', accent: '#c89b4a', muted: '#8e8a99', card: '#222132'},
    nav: ['Lessons', 'Faculty', 'Concerts', 'Enroll'],
    hero: {kicker: 'Conservatory model · since 1994', cta: 'Schedule a trial lesson'},
    sections: [
      {title: 'Instruments', items: [
        ['Piano', 'Classical, jazz, pop. Yamaha grands in every studio.'],
        ['Strings', 'Violin, viola, cello, bass. Suzuki + traditional methodologies.'],
        ['Voice', 'Classical, musical theater, contemporary. RCM-trained faculty.'],
        ['Guitar', 'Classical, electric, bass. Performance + theory tracks.'],
      ]},
      {title: 'Calendar', items: [
        ['Recitals', 'Three per year, on stage at the Carnegie Music Hall.'],
        ['Summer intensives', 'Two-week chamber music + jazz camps for ages 12+.'],
      ]},
    ],
  },
  {
    slug: 'car-detail', name: 'Mirror Finish Auto Spa',
    tagline: 'Ceramic coatings, paint correction, leather restoration.',
    vertical: 'Auto detailing — Scottsdale, AZ', layout: 'bold',
    fonts: {h: 'Oswald', b: 'Inter'},
    palette: {bg: '#0c1116', ink: '#f4f6f9', accent: '#26d3a5', muted: '#7e8895', card: '#161d24'},
    nav: ['Detail menu', 'Ceramic', 'Gallery', 'Book'],
    hero: {kicker: 'Indoor bay · climate-controlled', cta: 'Reserve your bay'},
    sections: [
      {title: 'Packages', items: [
        ['Express detail', '2 hr · wash, decon, interior vacuum, dressings. $189'],
        ['Showroom detail', '5 hr · clay, single-stage polish, full interior shampoo. $385'],
        ['Ceramic coating', '9H ceramic. 1-day, 3-yr, 5-yr, or lifetime tiers. From $1,200'],
        ['Paint correction', 'Multi-stage cut + polish. Swirl + scratch removal. From $850'],
      ]},
      {title: 'Materials', items: [
        ['Gyeon, CarPro, Jescar', 'Coating partners. All chemistry pH-balanced + paint-safe.'],
        ['IGL ceramics certified', 'Installer training updated annually. Warranty registered.'],
      ]},
    ],
  },
  {
    slug: 'juice-bar', name: 'Sun & Stone Juicery',
    tagline: 'Cold-pressed, never bottled. Daily cleanse kits.',
    vertical: 'Juice bar — Santa Cruz, CA', layout: 'warm',
    fonts: {h: 'Fraunces', b: 'Karla'},
    palette: {bg: '#fdf7ec', ink: '#1d2218', accent: '#fb8a3c', muted: '#82826e', card: '#ffffff'},
    nav: ['Juices', 'Cleanse', 'Bowls', 'Pickup'],
    hero: {kicker: 'Pressed daily at 5 a.m.', cta: 'Build your cleanse'},
    sections: [
      {title: "Today's press", items: [
        ['Green Goddess', 'Kale, spinach, cucumber, celery, apple, ginger, lemon. $11'],
        ['Beet Reset', 'Beet, carrot, apple, lemon, turmeric. $10'],
        ['Citrus Sun', 'Orange, grapefruit, ginger, cayenne, lemon. $9'],
        ['Brazil Nut Mylk', 'Brazil nut, dates, vanilla, sea salt, cardamom. $8'],
      ]},
      {title: 'Cleanses', items: [
        ['1-day reset', '6 bottles · 32oz spring water · pickup or delivery. $89'],
        ['3-day deep cleanse', '18 bottles · electrolyte support · coaching call. $245'],
      ]},
    ],
  },
  {
    slug: 'bookbinder', name: 'Argent Bookworks',
    tagline: 'Hand-bound journals, leather repair, restoration.',
    vertical: 'Bookbindery — Providence, RI', layout: 'editorial',
    fonts: {h: 'Lora', b: 'Inter'},
    palette: {bg: '#f3eee5', ink: '#1f1c14', accent: '#7a4c2a', muted: '#6f6a5e', card: '#fffaf0'},
    nav: ['Bespoke', 'Repair', 'Workshops', 'Studio'],
    hero: {kicker: 'In a 1903 carriage house', cta: 'Commission a journal'},
    sections: [
      {title: 'Services', items: [
        ['Custom journals', 'Coptic, longstitch, or case-bound. Choose paper + spine. From $85'],
        ['Repair & restoration', 'Spine repair, hinge tightening, recasing. Estimates by appointment.'],
        ['Heirloom rebinding', 'Bible, family album, or first-edition leather rebind.'],
      ]},
      {title: 'Workshops', items: [
        ['Intro to bookbinding', '4 weeks · Sunday afternoons. $325 incl. materials.'],
        ['Leather covering', '2-day intensive. Held quarterly.'],
      ]},
    ],
  },
  {
    slug: 'pottery-studio', name: 'Riverstone Clay Co-op',
    tagline: 'Member-run wheel + hand-build studio. Two electric kilns.',
    vertical: 'Pottery studio — Portland, ME', layout: 'warm',
    fonts: {h: 'DM Serif Display', b: 'Karla'},
    palette: {bg: '#efeae0', ink: '#1f1c17', accent: '#b25d3e', muted: '#766f63', card: '#ffffff'},
    nav: ['Membership', 'Classes', 'Open studio', 'Shop'],
    hero: {kicker: '20 wheels · two kilns · open 7 days', cta: 'Reserve a class'},
    sections: [
      {title: 'Classes', items: [
        ['Beginner wheel', '6 weeks · Mondays 6:30. Includes 25 lbs clay + firing. $325'],
        ['Hand-building', '4 weeks · Wednesdays 6:30. $245'],
        ['Glaze intensive', 'Weekend workshop. Lab session + glaze formulation.'],
      ]},
      {title: 'Studio access', items: [
        ['Open membership', '$110/mo · 24/7 keycard · 25 lbs clay/mo · two kiln firings.'],
        ['Day pass', '$30 · all materials included for guests of members.'],
      ]},
    ],
  },
  {
    slug: 'chiropractor', name: 'Hilltown Spine + Wellness',
    tagline: 'Gentle adjustment, soft-tissue work, exercise prescription.',
    vertical: 'Chiropractic clinic — Burlington, VT', layout: 'clinical',
    fonts: {h: 'DM Serif Display', b: 'DM Sans'},
    palette: {bg: '#f3f1ec', ink: '#1c1f1d', accent: '#578f7a', muted: '#6f7674', card: '#ffffff'},
    nav: ['Conditions', 'Care team', 'Insurance', 'Book'],
    hero: {kicker: 'In-network with 9 plans', cta: 'Request a 1-on-1 visit'},
    sections: [
      {title: 'What we treat', items: [
        ['Low back + sciatica', 'Adjustment + soft tissue + targeted rehab. 4-12 visit plans.'],
        ['Neck + headaches', 'Cervical-thoracic mobility, posture, ergonomic coaching.'],
        ['Sports + recovery', 'In-season + off-season programming for endurance + power athletes.'],
      ]},
      {title: 'How we work', items: [
        ['Outcomes published', 'We track recovery vs. expected. Numbers reviewed at every visit.'],
        ['Same-doc continuity', 'Your initial DC stays your DC. No mid-plan rotation.'],
      ]},
    ],
  },
  {
    slug: 'pilates-studio', name: 'Halcyon Pilates',
    tagline: 'Reformer, mat, tower. Class caps of six. Always.',
    vertical: 'Pilates studio — Cambridge, MA', layout: 'editorial',
    fonts: {h: 'Cormorant Garamond', b: 'Inter'},
    palette: {bg: '#f7f4ee', ink: '#1d1d23', accent: '#9b6b89', muted: '#827d77', card: '#ffffff'},
    nav: ['Classes', 'Instructors', 'Schedule', 'Visit'],
    hero: {kicker: 'Capped at 6 students. Every class.', cta: "See this week's roster"},
    sections: [
      {title: 'Class formats', items: [
        ['Reformer 50', '50 min · classical sequence on the reformer. All levels.'],
        ['Tower + mat', '60 min · combo of tower spring work and mat conditioning.'],
        ['Pre/postnatal', '50 min · pelvic floor + diastasis-aware programming.'],
      ]},
      {title: 'New here?', items: [
        ['Intro privates', 'Two-session intro with the lead instructor. $185 total.'],
        ['First class free', 'Drop into any group class on us. Bring grip socks (or borrow ours).'],
      ]},
    ],
  },
  {
    slug: 'sushi-bar', name: 'Ohba Sushi',
    tagline: 'Twelve-seat omakase. Edomae style. One seating, two services.',
    vertical: 'Sushi bar — Chicago, IL', layout: 'editorial',
    fonts: {h: 'Noto Serif JP', b: 'Inter'},
    palette: {bg: '#15110c', ink: '#f2ead8', accent: '#c47140', muted: '#8e7e69', card: '#1d1812'},
    nav: ['Menu', 'Reservations', 'Chef', 'About'],
    hero: {kicker: 'Twelve seats. Two seatings.', cta: 'Reserve a seat'},
    sections: [
      {title: 'The omakase', items: [
        ['Omakase, 12-course', '$185pp · zensai, sashimi, 8 nigiri, soup, dessert.'],
        ['Omakase, 18-course', '$245pp · extended nigiri course + chef-selected wagyu add-on.'],
        ['Sake pairing', '5-pour pairing curated to the night\'s fish. +$95pp.'],
      ]},
      {title: 'Sourcing', items: [
        ['Toyosu direct', 'Tuna, uni, hirame flown twice weekly via our broker in Tokyo.'],
        ['Hudson Valley + Maine', 'Trout, scallop, oyster from East Coast partners we visit yearly.'],
      ]},
    ],
  },
  {
    slug: 'pizzeria', name: 'Anchor & Coal Pizza',
    tagline: 'Neapolitan dough, 90-second bake, wood-fired in a 900° oven.',
    vertical: 'Pizzeria — Oakland, CA', layout: 'bold',
    fonts: {h: 'Bebas Neue', b: 'Inter'},
    palette: {bg: '#1a1411', ink: '#fbf5e7', accent: '#e2462a', muted: '#a6927e', card: '#231b16'},
    nav: ['Menu', 'Hours', 'Catering', 'Visit'],
    hero: {kicker: 'Wood-fired since 2018', cta: 'Order pickup'},
    sections: [
      {title: 'Pizzas', items: [
        ['Margherita DOP', 'San Marzano, fior di latte, basil, EVOO. $19'],
        ['Diavola', "Spicy soppressata, calabrian chili, fior di latte. $22"],
        ['Funghi', 'Wild mushroom, taleggio, truffle oil, thyme. $24'],
        ['Bianca', 'Pecorino, ricotta, garlic confit, lemon zest, arugula. $21'],
      ]},
      {title: 'About the dough', items: [
        ['72-hour cold ferment', 'Caputo flour, 65% hydration, room rise + 3-day cold rest.'],
        ['Imported oven', 'Acunto from Naples. 900°F floor, 90-second bake.'],
      ]},
    ],
  },
  {
    slug: 'wine-bar', name: 'Vesper & Vine',
    tagline: 'Natural wine, small-producer cellar, snacks worth driving for.',
    vertical: 'Wine bar — Hudson, NY', layout: 'editorial',
    fonts: {h: 'Cormorant Garamond', b: 'Karla'},
    palette: {bg: '#161220', ink: '#f0e6d2', accent: '#a67a4f', muted: '#897e6e', card: '#1c1828'},
    nav: ['By the glass', 'Bottle list', 'Snacks', 'Reserve'],
    hero: {kicker: 'Open 5pm – late · closed Mondays', cta: 'Reserve a high-top'},
    sections: [
      {title: 'On tonight', items: [
        ['Rosé · Loire pet-nat', 'Cabernet franc, méthode ancestrale. By the glass. $14'],
        ['Orange · Slovenia', 'Ribolla gialla, 8 days skin contact, unfiltered. $16'],
        ['Red · Etna Rosso', 'Nerello mascalese, volcanic-soil terroir. $18'],
        ['White · Jura savagnin', 'Oxidative, walnut + brine, perfect with our gougères. $19'],
      ]},
      {title: 'The cellar', items: [
        ['Direct-import program', 'Two-thirds of the bottle list comes from importers we visit annually.'],
        ['BYOB Sundays', '$25 corkage, capped at one bottle. Any vintage welcome.'],
      ]},
    ],
  },
  {
    slug: 'bookstore', name: 'Halcyon & Press',
    tagline: 'Independent bookstore + café. Weekly events, slow coffee.',
    vertical: 'Independent bookstore — Asheville, NC', layout: 'warm',
    fonts: {h: 'Lora', b: 'Inter'},
    palette: {bg: '#f6f0e3', ink: '#241e18', accent: '#76583a', muted: '#7b7468', card: '#ffffff'},
    nav: ['New arrivals', 'Events', 'Café', 'About'],
    hero: {kicker: 'Open seven days · café until 6', cta: "Browse this week's picks"},
    sections: [
      {title: 'Stock', items: [
        ['Literary fiction', 'Curated by Mara, our buyer of nine years.'],
        ['Poetry + chapbooks', 'Strong on small-press and Appalachian voices.'],
        ['Children\'s', 'Our biggest section. Storytime every Saturday at 10:30.'],
        ['Used + rare', 'Three sections. Cash buying Thursdays + Saturdays.'],
      ]},
      {title: 'Programming', items: [
        ['Author readings', 'Most Tuesdays + Thursdays. RSVP required for the back room.'],
        ['Two book clubs', 'Literary fiction (1st Wed) + nonfiction (last Sunday).'],
      ]},
    ],
  },
  {
    slug: 'gelato-shop', name: 'Lago Gelato',
    tagline: 'Italian-style gelato. Twenty flavors. Made every morning.',
    vertical: 'Gelato shop — Princeton, NJ', layout: 'warm',
    fonts: {h: 'Fraunces', b: 'Karla'},
    palette: {bg: '#fbf3e9', ink: '#2a1f18', accent: '#d44a4a', muted: '#8f7e6e', card: '#ffffff'},
    nav: ['Flavors', 'Pints', 'Catering', 'Find us'],
    hero: {kicker: 'Made daily before 10 a.m.', cta: "See today's case"},
    sections: [
      {title: 'On the case today', items: [
        ['Pistachio (Bronte DOP)', 'Sicilian pistachios. No coloring. The one most people remember.'],
        ['Salted caramel + olive oil', 'Maldon flake on top. House-made caramel.'],
        ['Stracciatella', 'Fior di latte base + house-shaved Valrhona shards.'],
        ['Burnt honey + walnut', 'Local raw honey + candied walnut. Limited.'],
      ]},
      {title: 'For your event', items: [
        ['Catering carts', 'Cart + scooper + 50 cups, 3 flavors. From $385.'],
        ['Wedding cakes', 'Three-flavor gelato cake, ribbon-built. Two weeks notice.'],
      ]},
    ],
  },
  {
    slug: 'locksmith', name: 'Cardinal Lock + Key',
    tagline: 'Residential + automotive locksmith. 30-minute response.',
    vertical: 'Locksmith — Indianapolis, IN', layout: 'architectural',
    fonts: {h: 'Space Grotesk', b: 'Inter'},
    palette: {bg: '#101418', ink: '#e8eaee', accent: '#f0b81b', muted: '#7b8089', card: '#181c22'},
    nav: ['Services', 'Service area', 'Reviews', 'Call'],
    hero: {kicker: '24/7 dispatch · 30-min response inside I-465', cta: 'Call now'},
    sections: [
      {title: 'What we do', items: [
        ['Lockouts', 'Home, business, automotive. Most cars done in 5 min.'],
        ['Rekey + replace', 'Cylinder rekey, smart lock install, full lockset replacement.'],
        ['Automotive keys', 'Cut + program for most makes, 2005-present. Onsite, no tow.'],
        ['Safe service', 'Combination changes, lockouts, vault repair.'],
      ]},
      {title: 'On-time guarantee', items: [
        ['30-min in town', "If we don't arrive in 30 min inside I-465, the service call is free."],
        ['Flat-rate pricing', 'Quoted before we work. No hourly creep.'],
      ]},
    ],
  },
  {
    slug: 'roofer', name: 'Foundry Roofing',
    tagline: 'Standing-seam metal, architectural shingle, leak diagnosis.',
    vertical: 'Roofing contractor — Kansas City, MO', layout: 'architectural',
    fonts: {h: 'Archivo', b: 'Inter'},
    palette: {bg: '#fbfbf9', ink: '#171a20', accent: '#2e6cb5', muted: '#5d646e', card: '#f1f3f8'},
    nav: ['Services', 'Materials', 'Process', 'Estimate'],
    hero: {kicker: 'Licensed · MO + KS · Lic. R-2098', cta: 'Get a free estimate'},
    sections: [
      {title: 'Materials', items: [
        ['Standing-seam metal', '24-gauge Galvalume. 30+ year warranty. Concealed fastener.'],
        ['Architectural shingle', 'Owens Corning Duration. Class 4 impact-resistant options.'],
        ['Synthetic slate + cedar', 'DaVinci composite + cedar shake alternatives.'],
        ['EPDM + TPO', 'Flat-roof commercial systems. 15- and 20-year warranties.'],
      ]},
      {title: 'How we work', items: [
        ['Drone inspection', 'Full roof report with photos in 48 hours.'],
        ['Insurance liaison', 'We work directly with your adjuster on storm claims.'],
      ]},
    ],
  },
  {
    slug: 'landscaper', name: 'Quartermile Landscape Design',
    tagline: 'Native plantings, hardscape, irrigation. Full design-build.',
    vertical: 'Landscape design + build — Austin, TX', layout: 'warm',
    fonts: {h: 'DM Serif Display', b: 'Karla'},
    palette: {bg: '#f3f1e6', ink: '#1d2017', accent: '#6f8246', muted: '#7d7d6c', card: '#ffffff'},
    nav: ['Design', 'Build', 'Maintenance', 'Portfolio'],
    hero: {kicker: 'Native-first since 2011', cta: 'Schedule a consult'},
    sections: [
      {title: 'Practice', items: [
        ['Design + plan', 'Master plan, planting palette, irrigation, lighting. Phased budget.'],
        ['Build + install', "We're the contractor too. No handoff. Crews are in-house, W-2."],
        ['Native plantings', 'Hill Country natives + adapted Mediterraneans. Lower water year-round.'],
        ['Stone + steel hardscape', 'Walls, patios, ramadas, fire features. Local quarried stone.'],
      ]},
      {title: 'Aftercare', items: [
        ['90-day establishment', 'Watering + adjustment included on every install.'],
        ['Annual maintenance', 'Optional. Spring + fall visits, irrigation tune-up included.'],
      ]},
    ],
  },

  // ------- Ring 4 fill (16 more businesses, none featured) -------------

  {
    slug: 'bike-shop', name: 'Allwheel Cycle Works',
    tagline: 'Road, gravel, MTB. Full service, custom builds.',
    vertical: 'Bike shop — Bozeman, MT', layout: 'bold',
    fonts: {h: 'Oswald', b: 'Inter'},
    palette: {bg: '#101115', ink: '#f3f5f8', accent: '#ff5a36', muted: '#7c828a', card: '#181a20'},
    nav: ['Bikes', 'Service', 'Custom builds', 'Visit'],
    hero: {kicker: 'Family-owned since 1996', cta: 'Book a fit'},
    sections: [
      {title: 'Brands we carry', items: [
        ['Specialized', 'Road, gravel, MTB, e-bikes. Full Roubaix + Tarmac + Stumpjumper line.'],
        ['Trek + Cervélo', 'Performance road + tri. Project One customs welcome.'],
        ['Surly + Salsa', 'Touring, bikepacking, gravel. Built-in-store with custom wheels.'],
      ]},
      {title: 'Service shop', items: [
        ['Pro fit studio', '90-min Retül fit with our certified fitter. $185.'],
        ['Overhauls', 'Complete teardown + rebuild. 7-day turnaround in season.'],
      ]},
    ],
  },
  {
    slug: 'vinyl-shop', name: 'Bandstand Records',
    tagline: 'New + used vinyl, weekly listening parties, full-stocked jazz wall.',
    vertical: 'Record store — Detroit, MI', layout: 'editorial',
    fonts: {h: 'Playfair Display', b: 'Work Sans'},
    palette: {bg: '#181423', ink: '#ede5cd', accent: '#e1a64c', muted: '#8e8472', card: '#231d2f'},
    nav: ['New arrivals', 'Used + rare', 'Events', 'Sell to us'],
    hero: {kicker: 'Open seven days · cash buying daily', cta: "Browse this week's arrivals"},
    sections: [
      {title: 'On the floor', items: [
        ['Jazz + soul', 'Full ECM library, Blue Note reissues, Strata-East deep cuts.'],
        ['New + reissue', 'Most major releases day-of. Subscriptions available.'],
        ['$1 bin', 'Refreshed Tuesdays. Two crates, twelve genres, infinite digging.'],
      ]},
      {title: 'In-store', items: [
        ['Listening bar', 'Eight stations · Stanton + Audio-Technica. Bring records, stay an hour.'],
        ['Friday DJ sets', 'Local guests, 5–8pm, cash bar opens at 4.'],
      ]},
    ],
  },
  {
    slug: 'candle-maker', name: 'Wax & Wick Studio',
    tagline: 'Hand-poured soy candles. Custom scents. Wholesale + retail.',
    vertical: 'Candle studio — Asheville, NC', layout: 'warm',
    fonts: {h: 'Fraunces', b: 'Karla'},
    palette: {bg: '#f9f3e7', ink: '#231d15', accent: '#a05a3a', muted: '#83786a', card: '#ffffff'},
    nav: ['Shop', 'Workshops', 'Wholesale', 'Visit'],
    hero: {kicker: 'Hand-poured at the studio', cta: 'Shop the line'},
    sections: [
      {title: 'Standard line', items: [
        ['Fig + Black Tea', '8 oz · 50-hr burn · soy + coconut blend. $28'],
        ['Smoked Cedar', '12 oz · double-wick · 70-hr burn. $34'],
        ['Bergamot & Rosemary', '8 oz · spring/summer favorite. $28'],
      ]},
      {title: 'Workshops', items: [
        ['Pour-your-own', 'Saturdays 2pm · 90 min · take home two 8-oz candles. $55'],
        ['Custom scent lab', 'By appointment · two-hour blend session with our perfumer. $145'],
      ]},
    ],
  },
  {
    slug: 'watch-repair', name: 'Trenton Watchworks',
    tagline: 'Mechanical watch service. Vintage restoration. Forty years on the bench.',
    vertical: 'Watch repair — Trenton, NJ', layout: 'editorial',
    fonts: {h: 'Lora', b: 'Inter'},
    palette: {bg: '#181923', ink: '#e6dfc8', accent: '#b58d4f', muted: '#86826f', card: '#1f2030'},
    nav: ['Services', 'Vintage', 'Brands', 'Schedule'],
    hero: {kicker: 'Forty years on the bench', cta: 'Mail-in a watch'},
    sections: [
      {title: 'Service', items: [
        ['Full overhaul', 'Disassembly, cleaning, lubrication, timing regulation. 4–6 weeks.'],
        ['Crystal + crown', 'Replacement with OEM or generic per request. 1–2 weeks.'],
        ['Vintage restoration', 'Case refinishing, hand re-luming, dial restoration as needed.'],
      ]},
      {title: 'Brands we service', items: [
        ['Swiss mechanical', 'Rolex, Omega, IWC, Cartier, Tudor, JLC, Tag Heuer.'],
        ['Japanese + American', 'Seiko, Citizen, Grand Seiko, Hamilton, Bulova, Elgin.'],
      ]},
    ],
  },
  {
    slug: 'knife-sharpening', name: 'Whetstone & Co.',
    tagline: 'Japanese stone sharpening. Pickup + drop-off at four markets weekly.',
    vertical: 'Knife sharpening — Brooklyn, NY', layout: 'architectural',
    fonts: {h: 'Space Grotesk', b: 'Inter'},
    palette: {bg: '#13161d', ink: '#e8ebf0', accent: '#6cbfdc', muted: '#7d8390', card: '#1c1f28'},
    nav: ['Schedule', 'Pricing', 'Stones', 'About'],
    hero: {kicker: 'Trained at Sakai Takayuki', cta: 'Schedule a pickup'},
    sections: [
      {title: 'What we sharpen', items: [
        ['Chef + paring', '8" chef $14 · paring $9 · santoku $14 · gyuto $16'],
        ['Bread + serrated', '$18 each. Most can be re-toothed once before retirement.'],
        ['Scissors + shears', '$12–$22 depending on size. Pinking shears welcome.'],
      ]},
      {title: 'Where to find us', items: [
        ['Markets weekly', 'Park Slope Sat AM · Brooklyn Bridge Park Sun · Union Sq Wed/Fri.'],
        ['Mail-in', 'Flat $8 return shipping. Quote within 24 hours of receipt.'],
      ]},
    ],
  },
  {
    slug: 'arborist', name: 'Greatwood Tree Care',
    tagline: 'ISA-certified arborists. Pruning, removal, plant health care.',
    vertical: 'Tree care — Atlanta, GA', layout: 'architectural',
    fonts: {h: 'Archivo', b: 'Inter'},
    palette: {bg: '#f7f6f1', ink: '#1a1e17', accent: '#3f6b3f', muted: '#6c706a', card: '#ffffff'},
    nav: ['Services', 'Plant health', 'About', 'Estimate'],
    hero: {kicker: 'ISA-certified · TCIA accredited', cta: 'Request a free estimate'},
    sections: [
      {title: 'Services', items: [
        ['Pruning', 'Structural, crown thinning, deadwooding. Done by climber + ground crew.'],
        ['Removal', 'From precision technical removals to straight-fall. Stump grinding incl.'],
        ['Plant health care', 'Soil injection, deep-root fertilization, pest/disease treatment.'],
      ]},
      {title: 'Why we get called back', items: [
        ['Insurance + permits', 'Fully insured, bonded, all permits pulled before work starts.'],
        ['Clean property', "Logs hauled, brush chipped, lawn raked. We leave it cleaner than we found."],
      ]},
    ],
  },
  {
    slug: 'garden-nursery', name: 'Greenstone Nursery',
    tagline: 'Native + adapted plants. Twelve greenhouses. Designer consultations.',
    vertical: 'Plant nursery — Eugene, OR', layout: 'warm',
    fonts: {h: 'DM Serif Display', b: 'Karla'},
    palette: {bg: '#f0eee4', ink: '#1d201a', accent: '#5f7a3c', muted: '#7a7d70', card: '#ffffff'},
    nav: ['What\'s in stock', 'Design', 'Workshops', 'Visit'],
    hero: {kicker: 'Open year-round · seven days', cta: 'See this week\'s stock'},
    sections: [
      {title: 'Sections', items: [
        ['Natives', 'Willamette Valley + Cascade-adapted. Pollinator-friendly throughout.'],
        ['Edibles', 'Heirloom tomato + pepper starts, berries, dwarf fruit trees.'],
        ['Houseplants', 'Twelve greenhouses, ferns through aroids. Bring photos for ID help.'],
      ]},
      {title: 'Beyond plants', items: [
        ['Design consults', '90 min on-site · planting plan + sketch. $185.'],
        ['Soil + amendment', 'Bagged and bulk. Delivery within 15 miles.'],
      ]},
    ],
  },
  {
    slug: 'frame-shop', name: 'Cornerstone Custom Framing',
    tagline: 'Conservation framing. Mat cutting. Restoration. Twenty-year hardware warranty.',
    vertical: 'Picture framing — Newport, RI', layout: 'editorial',
    fonts: {h: 'Cormorant Garamond', b: 'Karla'},
    palette: {bg: '#f6f3eb', ink: '#1d1c18', accent: '#7e5731', muted: '#7c7669', card: '#ffffff'},
    nav: ['Services', 'Mouldings', 'Portfolio', 'Quote'],
    hero: {kicker: 'PPFA-certified framer · since 1998', cta: 'Schedule a consult'},
    sections: [
      {title: 'How we frame', items: [
        ['Conservation', 'UV-protective glazing, acid-free mat + backing, hinge-mounting.'],
        ['Floating + box', 'Floating mat, deep shadow box, fabric-wrapped fillets.'],
        ['Restoration', 'Old frame regilding, repair of damaged corners, new acid-free liners.'],
      ]},
      {title: 'The basics', items: [
        ['Two-week turnaround', 'Most jobs ready in 10–14 days. Rush options available.'],
        ['Twenty-year warranty', 'All hardware + glass. We re-fit free, lifetime.'],
      ]},
    ],
  },
  {
    slug: 'letterpress', name: 'Hollow Press Print Co.',
    tagline: 'Letterpress wedding invites, business cards, posters. Cotton stock only.',
    vertical: 'Letterpress studio — Richmond, VA', layout: 'editorial',
    fonts: {h: 'Lora', b: 'Inter'},
    palette: {bg: '#f5efe0', ink: '#1c1810', accent: '#a85b2a', muted: '#7c7666', card: '#ffffff'},
    nav: ['Custom', 'Wedding', 'Cards', 'Shop'],
    hero: {kicker: 'Vandercook + Heidelberg on the floor', cta: 'Get a project quote'},
    sections: [
      {title: 'What we print', items: [
        ['Wedding suites', 'Save-the-dates, invitations, RSVPs, day-of pieces. Custom + bespoke.'],
        ['Business stationery', 'Cards, letterhead, envelopes. Two-color register guaranteed.'],
        ['Show posters + art prints', 'Limited-edition wood-type. Available in the shop.'],
      ]},
      {title: 'How we work', items: [
        ['Cotton stock only', 'Crane Lettra in three weights. Deep impression on every print.'],
        ['Two-pull register', 'Multi-color jobs run twice through the press for tight fit.'],
      ]},
    ],
  },
  {
    slug: 'ice-cream-truck', name: 'Big Dipper Mobile Creamery',
    tagline: 'Old-school ice cream truck. Bookings + neighborhood routes.',
    vertical: 'Ice cream truck — Atlanta, GA', layout: 'warm',
    fonts: {h: 'Fraunces', b: 'Karla'},
    palette: {bg: '#fdf2e9', ink: '#26180e', accent: '#e8504a', muted: '#8e7e6d', card: '#ffffff'},
    nav: ['Find the truck', 'Book us', 'Flavors', 'About'],
    hero: {kicker: 'Six neighborhoods on rotation', cta: 'Book for an event'},
    sections: [
      {title: 'Our truck', items: [
        ['Soft-serve + dipped', 'Vanilla, chocolate, twist. Sprinkles + dips on the side.'],
        ['Hand-scooped', 'Eight rotating flavors. From local cream + cane sugar.'],
        ['Frozen treats', 'Fudge bars, push pops, fruit pops. All from a small Atlanta maker.'],
      ]},
      {title: 'For events', items: [
        ['Birthday parties', '2-hr min · 50 servings · $345 + travel. Weekday discount.'],
        ['Schools + offices', 'Subsidized for end-of-year + summer kickoffs. Quote in 24 hr.'],
      ]},
    ],
  },
  {
    slug: 'arcade-bar', name: 'Neon & Quarters',
    tagline: 'Sixty arcade cabinets, twelve pinball, full bar, kitchen until 1am.',
    vertical: 'Arcade bar — Brooklyn, NY', layout: 'bold',
    fonts: {h: 'Bebas Neue', b: 'Inter'},
    palette: {bg: '#0e0a1d', ink: '#ecdcff', accent: '#ff3aa2', muted: '#8e83a1', card: '#1c1430'},
    nav: ['Machines', 'Drinks', 'Events', 'Visit'],
    hero: {kicker: '21+ · open 5pm – 2am', cta: 'See machine list'},
    sections: [
      {title: 'On the floor', items: [
        ['Classic cabinets', 'Galaga, Pac-Man, Defender, Donkey Kong, Tron, Joust, Punch-Out.'],
        ['Fighters', 'Street Fighter II Champ, Marvel vs Capcom, KOF, Tekken 3.'],
        ['Pinball', 'Twelve machines on rotation. Stern, Bally, Williams, Data East.'],
      ]},
      {title: 'Bar + kitchen', items: [
        ['Beer + cocktail', 'Twenty taps, weekly cocktail board. Cheap shot specials before 7.'],
        ['Smashed burgers + fries', 'Kitchen till 1am every night. Vegan smash on the menu too.'],
      ]},
    ],
  },
  {
    slug: 'piano-tuner', name: 'Sterling Piano Service',
    tagline: 'In-home tuning, voicing, action regulation. Concert prep available.',
    vertical: 'Piano tuner + technician — Boston, MA', layout: 'editorial',
    fonts: {h: 'Cormorant Garamond', b: 'Inter'},
    palette: {bg: '#f6f1e6', ink: '#1d1c18', accent: '#7e5731', muted: '#7c7669', card: '#ffffff'},
    nav: ['Services', 'About', 'Rates', 'Schedule'],
    hero: {kicker: 'PTG Registered Piano Technician', cta: 'Schedule a tuning'},
    sections: [
      {title: 'Services', items: [
        ['Standard tuning', '~90 min in-home · $185 in 128. Pitch-raise add-on if neglected.'],
        ['Voicing + regulation', 'Tone shaping + action adjustment. Half-day or full-day jobs.'],
        ['Concert prep', 'For schools, venues, recording studios. On-call same-week.'],
      ]},
      {title: 'For your piano', items: [
        ['Twice-yearly schedule', 'Most home pianos benefit from spring + fall visits.'],
        ['Humidity control', 'Dampp-Chaser sales + install. Stable RH = stable tuning.'],
      ]},
    ],
  },
  {
    slug: 'bike-courier', name: 'Cardinal Courier Co-op',
    tagline: 'Bike messenger service. Same-hour delivery inside the loop.',
    vertical: 'Courier service — Chicago, IL', layout: 'bold',
    fonts: {h: 'Oswald', b: 'Inter'},
    palette: {bg: '#161114', ink: '#f1e9e4', accent: '#cc2929', muted: '#807068', card: '#1f1819'},
    nav: ['Service', 'Pricing', 'Riders', 'Account'],
    hero: {kicker: 'Worker-owned co-op · since 2011', cta: 'Book a delivery'},
    sections: [
      {title: 'Service tiers', items: [
        ['Standard', 'Same-day · 3-hour window · $18 base + $2/mi after 2.'],
        ['Rush', 'Pickup in 15 min · delivery in 60 · $35 base + $3/mi after 2.'],
        ['Scheduled', 'Daily route between two points · monthly rate.'],
      ]},
      {title: 'Why us', items: [
        ['No vehicles', 'Bikes only. We beat car traffic from 7am to 7pm any day.'],
        ['Live tracking', 'Every job is tracked from pickup to drop. You see the path.'],
      ]},
    ],
  },
  {
    slug: 'leather-goods', name: 'Foundling Leatherworks',
    tagline: 'Hand-stitched bags, wallets, belts. Vegetable-tanned leather only.',
    vertical: 'Leather goods studio — Lexington, KY', layout: 'warm',
    fonts: {h: 'DM Serif Text', b: 'Inter'},
    palette: {bg: '#f4ece0', ink: '#241910', accent: '#7a4a26', muted: '#806f5e', card: '#fff9ed'},
    nav: ['Shop', 'Bespoke', 'Repair', 'About'],
    hero: {kicker: 'Made one at a time, in our studio', cta: 'See current pieces'},
    sections: [
      {title: 'Standard pieces', items: [
        ['Tote bag', '14" x 12" · saddle-stitch · brass hardware. $345 — choose four colors.'],
        ['Bifold wallet', "Six cards, two slip pockets, full-grain Horween. $145."],
        ['Belt', '1.25" or 1.5" · solid brass buckle · 18-month break-in warranty. $115.'],
      ]},
      {title: 'Beyond product', items: [
        ['Bespoke work', 'From your sketch + spec. 6–10 week turnaround.'],
        ['Repair + restoration', 'Stitch repair, hardware replacement, leather conditioning.'],
      ]},
    ],
  },
  {
    slug: 'sail-school', name: 'Newport Harbor Sailing',
    tagline: 'ASA-certified lessons, charters, summer programs.',
    vertical: 'Sailing school — Newport, RI', layout: 'clinical',
    fonts: {h: 'Manrope', b: 'Inter'},
    palette: {bg: '#eef3f7', ink: '#0f1f2a', accent: '#2a78c8', muted: '#5f6c79', card: '#ffffff'},
    nav: ['Courses', 'Charters', 'Summer camp', 'About'],
    hero: {kicker: 'ASA-accredited · Newport waterfront', cta: 'Book a course'},
    sections: [
      {title: 'Courses', items: [
        ['ASA 101 Basic Keelboat', '3 days · 24 hrs on-water · J/22s. $695 incl. materials.'],
        ['ASA 103 Coastal Cruising', '4 days · 32 hrs on-water · Beneteau 36s. $1,195.'],
        ['ASA 104 Bareboat Charter', 'Prepares for international charters. $1,395.'],
      ]},
      {title: 'Programs', items: [
        ['Summer camp', 'Ages 8–14 · weeklong sessions June–August. Limit 16 per session.'],
        ['Charters', 'Half-day, full-day, sunset. Boat + captain. From $385.'],
      ]},
    ],
  },
  {
    slug: 'film-lab', name: 'Argentic Film Lab',
    tagline: 'C-41, E-6, B&W. Scan + return service. Two-day turnaround.',
    vertical: 'Film photography lab — Brooklyn, NY', layout: 'architectural',
    fonts: {h: 'Space Grotesk', b: 'Inter'},
    palette: {bg: '#0f1116', ink: '#e6e8ee', accent: '#e08e3b', muted: '#7d828c', card: '#181b22'},
    nav: ['Develop + scan', 'Drop-off', 'Pricing', 'Mail-in'],
    hero: {kicker: 'Open seven days · scans in 48 hr', cta: 'Mail in your roll'},
    sections: [
      {title: 'Services', items: [
        ['Develop + scan', 'C-41 35mm $14 · 120 $16 · scans at lab + high-res included.'],
        ['E-6 slide', '35mm + 120 · returned mounted or unmounted. $18/$22.'],
        ['Black & white', 'Hand-processed in our darkroom. Tri-X, HP5, T-Max, Delta. $16/$18.'],
      ]},
      {title: 'Other', items: [
        ['Scanning only', 'Send in already-developed negatives. Flat $0.75/frame for hi-res.'],
        ['Push + pull', '+1/+2 stops standard. Special requests gladly accepted.'],
      ]},
    ],
  },
];

/* ------------------------------------------------------------------ */
/* Layout templates — visual variety so 20 pages don't look the same   */
/* ------------------------------------------------------------------ */
// All templates share the same data shape; they just arrange it
// differently and theme it via CSS variables.

const sharedCss = (b) => `
  :root {
    --bg: ${b.palette.bg};
    --ink: ${b.palette.ink};
    --accent: ${b.palette.accent};
    --muted: ${b.palette.muted};
    --card: ${b.palette.card};
  }
  * { box-sizing: border-box; }
  /* overflow-x:hidden — the editorial layout's rotated hero image spills
     ~8px past the viewport, which otherwise shows a stray horizontal
     scrollbar. Clipping it preserves the rotation aesthetic. */
  html, body { margin: 0; padding: 0; overflow-x: hidden; background: var(--bg); color: var(--ink); }
  body {
    font-family: '${b.fonts.b}', -apple-system, BlinkMacSystemFont, sans-serif;
    line-height: 1.6;
    -webkit-font-smoothing: antialiased;
  }
  h1, h2, h3, .display { font-family: '${b.fonts.h}', Georgia, serif; }
  img { max-width: 100%; display: block; }
  a { color: inherit; text-decoration: none; }
  .wrap { max-width: 1280px; margin: 0 auto; padding: 0 32px; }
  .nav {
    display: flex; align-items: center; justify-content: space-between;
    padding: 22px 32px; max-width: 1280px; margin: 0 auto;
  }
  .wordmark { font-family: '${b.fonts.h}'; font-size: 22px; font-weight: 600; letter-spacing: -0.01em; }
  .nav-links { display: flex; gap: 26px; font-size: 13px; text-transform: uppercase; letter-spacing: 0.08em; opacity: 0.7; }
  .btn {
    display: inline-block; padding: 14px 22px; border-radius: 999px;
    background: var(--accent); color: white; font-size: 14px;
    text-transform: uppercase; letter-spacing: 0.08em; font-weight: 600;
  }
  .kicker { font-size: 12px; text-transform: uppercase; letter-spacing: 0.16em; opacity: 0.6; margin-bottom: 14px; }
  .muted { color: var(--muted); }
  .pill { display: inline-block; padding: 4px 12px; border-radius: 999px; background: var(--accent); color: white; font-size: 11px; text-transform: uppercase; letter-spacing: 0.1em; }

  /* ---- mobile (≤768px) ----------------------------------------------
     The 5 layouts share these class names, so one breakpoint here makes
     every page responsive. Without it the multi-column grids never
     collapse: the 2-col hero squeezes its image into a ~60px sliver and
     the nav wordmark overlaps the (decorative, hrefless) nav links. */
  @media (max-width: 768px) {
    .wrap { padding: 0 20px; }
    .nav { padding: 16px 20px; gap: 14px; }
    .nav-links { display: none; }
    .hero-grid, .story, .split, .section-head, .hero-meta {
      grid-template-columns: 1fr !important; gap: 28px !important;
    }
    .menu-grid, .menu-list, .list, .cards {
      grid-template-columns: 1fr !important;
    }
    .spec-row, .grid-4, .image-band {
      grid-template-columns: 1fr 1fr !important; height: auto !important;
    }
    .hero-img { transform: none !important; }
  }
`;

function makeNav(b) {
  return `<nav class="nav">
    <div class="wordmark">${b.name}</div>
    <div class="nav-links">${b.nav.map((n) => `<a>${n}</a>`).join('')}</div>
    <a class="btn">${b.hero.cta}</a>
  </nav>`;
}

/**
 * Deterministic "years in practice" for the clinical stat-card, seeded
 * from the slug so regeneration is idempotent. (Previously Math.random()
 * here drifted the committed HTML on every run.) Returns 20–34.
 */
function statYears(slug) {
  let h = 0;
  for (const ch of slug) h = (h * 31 + ch.codePointAt(0)) % 997;
  return 20 + (h % 15);
}

/* Template 1: WARM — soft cream, two-col hero with image right, two image bands */
function warm(b) {
  return `<!doctype html><html><head><meta charset="utf-8"><title>${b.name}</title>
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=${b.fonts.h.replaceAll(' ', '+')}:wght@400;500;700&family=${b.fonts.b.replaceAll(' ', '+')}:wght@400;500;600&display=swap" rel="stylesheet">
<style>${sharedCss(b)}
.hero { padding: 24px 0 80px; }
.hero-grid { display: grid; grid-template-columns: 1.1fr 0.9fr; gap: 56px; align-items: center; }
.hero h1 { font-size: clamp(40px, 5.5vw, 76px); line-height: 1.04; letter-spacing: -0.02em; margin: 0 0 20px; font-weight: 400; }
.hero h1 em { color: var(--accent); font-style: italic; }
.hero p.lead { font-size: 19px; line-height: 1.55; max-width: 520px; color: var(--ink); opacity: 0.78; margin: 0 0 32px; }
.hero-img { aspect-ratio: 4/5; border-radius: 14px; overflow: hidden; box-shadow: 0 30px 80px rgba(0,0,0,0.15); }
.hero-img img { width: 100%; height: 100%; object-fit: cover; }
.section { padding: 80px 0; }
.section h2 { font-size: clamp(28px, 3.5vw, 44px); margin: 0 0 48px; max-width: 700px; line-height: 1.1; font-weight: 400; }
.menu-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 32px 56px; }
.menu-item { padding-bottom: 22px; border-bottom: 1px solid rgba(0,0,0,0.08); }
.menu-item h3 { font-size: 22px; margin: 0 0 6px; font-weight: 500; }
.menu-item p { margin: 0; color: var(--muted); font-size: 15px; }
.image-band { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 4px; height: 320px; }
.image-band img { width: 100%; height: 100%; object-fit: cover; }
.story { display: grid; grid-template-columns: 0.9fr 1.1fr; gap: 56px; align-items: center; }
.story-img { aspect-ratio: 4/3; border-radius: 14px; overflow: hidden; }
.story p { font-size: 17px; line-height: 1.7; color: var(--ink); opacity: 0.78; }
.footer { padding: 60px 0; border-top: 1px solid rgba(0,0,0,0.08); text-align: center; font-size: 14px; color: var(--muted); }
</style></head><body>
${makeNav(b)}
<section class="hero wrap">
  <div class="hero-grid">
    <div>
      <div class="kicker">${b.hero.kicker}</div>
      <h1>${b.tagline.replace(/\.$/, '')}<em>.</em></h1>
      <p class="lead">${b.vertical}.</p>
      <a class="btn">${b.hero.cta}</a>
    </div>
    <div class="hero-img"><img src="img/hero.jpg" alt=""></div>
  </div>
</section>
<section class="section wrap">
  <h2>${b.sections[0].title}</h2>
  <div class="menu-grid">
    ${b.sections[0].items.map(([t, d]) => `<div class="menu-item"><h3>${t}</h3><p>${d}</p></div>`).join('')}
  </div>
</section>
<div class="image-band"><img src="img/a.jpg"><img src="img/b.jpg"><img src="img/c.jpg"></div>
<section class="section wrap">
  <div class="story">
    <div class="story-img"><img src="img/d.jpg"></div>
    <div>
      <div class="kicker">${b.sections[1].title}</div>
      <h2 style="margin-bottom:24px">Made by hand.<br>Sold by hand.</h2>
      ${b.sections[1].items.map(([t, d]) => `<p><strong>${t}.</strong> ${d}</p>`).join('')}
    </div>
  </div>
</section>
<footer class="footer">${b.name} · ${b.vertical}</footer>
</body></html>`;
}

/* Template 2: EDITORIAL — large serif, asymmetric, dark or light */
function editorial(b) {
  const isDark = ['#1c1815', '#16110d', '#0f0e14', '#0d0d0e'].includes(
    b.palette.bg,
  );
  return `<!doctype html><html><head><meta charset="utf-8"><title>${b.name}</title>
<link href="https://fonts.googleapis.com/css2?family=${b.fonts.h.replaceAll(' ', '+')}:ital,wght@0,400;0,500;0,700;1,400&family=${b.fonts.b.replaceAll(' ', '+')}:wght@400;500;600&display=swap" rel="stylesheet">
<style>${sharedCss(b)}
.hero { padding: 24px 0 70px; position: relative; }
.hero-grid { display: grid; grid-template-columns: 1.15fr 0.85fr; gap: 64px; align-items: center; }
.hero-headline { font-size: clamp(40px, 5.5vw, 78px); line-height: 0.98; letter-spacing: -0.025em; margin: 0 0 28px; font-weight: 400; }
.hero-headline em { font-style: italic; color: var(--accent); }
.hero .lead { font-size: 17px; line-height: 1.7; color: ${isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)'}; max-width: 480px; margin: 0 0 30px; }
.hero-img { aspect-ratio: 4/5; overflow: hidden; transform: rotate(-1.5deg); box-shadow: 0 24px 60px rgba(0,0,0,0.3); }
.section { padding: 80px 0; }
.section h2 { font-size: clamp(36px, 4.5vw, 60px); margin: 0 0 56px; font-weight: 400; max-width: 900px; line-height: 1.04; letter-spacing: -0.02em; }
.list { display: grid; grid-template-columns: 1fr 1fr; gap: 64px; }
.list-item { border-top: 1px solid ${isDark ? 'rgba(255,255,255,0.16)' : 'rgba(0,0,0,0.16)'}; padding-top: 24px; }
.list-item h3 { font-size: 28px; font-weight: 500; margin: 0 0 10px; letter-spacing: -0.01em; }
.list-item h3 em { color: var(--accent); font-style: italic; }
.list-item p { margin: 0; color: ${isDark ? 'rgba(255,255,255,0.65)' : 'rgba(0,0,0,0.65)'}; font-size: 15px; line-height: 1.6; }
.image-band { display: grid; grid-template-columns: 1.2fr 0.8fr; gap: 16px; height: 460px; }
.image-band img { width: 100%; height: 100%; object-fit: cover; }
.story { display: grid; grid-template-columns: 0.5fr 1fr; gap: 96px; align-items: start; }
.story .label { font-size: 12px; letter-spacing: 0.18em; text-transform: uppercase; opacity: 0.5; }
.story h2 { margin-top: 18px; }
.story p { font-size: 18px; line-height: 1.7; max-width: 620px; color: ${isDark ? 'rgba(255,255,255,0.78)' : 'rgba(0,0,0,0.78)'}; }
.footer { padding: 60px 0; border-top: 1px solid ${isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.12)'}; text-align: center; font-size: 13px; opacity: 0.5; }
</style></head><body>
${makeNav(b)}
<section class="hero wrap">
  <div class="hero-grid">
    <div>
      <div class="kicker">${b.hero.kicker}</div>
      <h1 class="hero-headline">${b.tagline.replace(/\.\s/, '<em>.</em> ').replace(/\.$/, '<em>.</em>')}</h1>
      <p class="lead">${b.vertical}.</p>
      <a class="btn">${b.hero.cta}</a>
    </div>
    <div class="hero-img"><img src="img/hero.jpg" alt="" style="width:100%;height:100%;object-fit:cover;"></div>
  </div>
</section>
<section class="section wrap">
  <h2>${b.sections[0].title}<em>.</em></h2>
  <div class="list">
    ${b.sections[0].items.map(([t, d]) => `<div class="list-item"><h3>${t}<em>.</em></h3><p>${d}</p></div>`).join('')}
  </div>
</section>
<div class="image-band"><img src="img/a.jpg"><img src="img/b.jpg"></div>
<section class="section wrap">
  <div class="story">
    <div>
      <div class="label">${b.sections[1].title}</div>
    </div>
    <div>
      <h2 style="margin-top:0">A room with a point of view<em>.</em></h2>
      ${b.sections[1].items.map(([t, d]) => `<p><strong>${t}.</strong> ${d}</p>`).join('')}
    </div>
  </div>
</section>
<footer class="footer">© ${b.name} · ${b.vertical}</footer>
</body></html>`;
}

/* Template 3: CLINICAL — sans, clean grid, healthcare/professional */
function clinical(b) {
  return `<!doctype html><html><head><meta charset="utf-8"><title>${b.name}</title>
<link href="https://fonts.googleapis.com/css2?family=${b.fonts.h.replaceAll(' ', '+')}:wght@400;500;700&family=${b.fonts.b.replaceAll(' ', '+')}:wght@400;500;600;700&display=swap" rel="stylesheet">
<style>${sharedCss(b)}
.top-banner { background: var(--accent); color: white; padding: 10px 0; text-align: center; font-size: 13px; letter-spacing: 0.04em; }
.top-banner strong { font-weight: 600; }
.hero { padding: 50px 0 80px; }
.hero-grid { display: grid; grid-template-columns: 1.05fr 1fr; gap: 56px; align-items: center; }
.hero h1 { font-size: clamp(40px, 5vw, 66px); line-height: 1.06; letter-spacing: -0.02em; margin: 0 0 22px; font-weight: 500; }
.hero p.lead { font-size: 18px; line-height: 1.65; color: var(--muted); max-width: 520px; margin: 0 0 32px; }
.cta-row { display: flex; gap: 14px; align-items: center; }
.btn.outline { background: transparent; color: var(--ink); border: 1.5px solid var(--ink); }
.hero-img { aspect-ratio: 4/3; border-radius: 14px; overflow: hidden; position: relative; box-shadow: 0 30px 70px rgba(0,0,0,0.12); }
.stat-card { position: absolute; bottom: 18px; left: 18px; background: var(--card); padding: 18px 22px; border-radius: 12px; box-shadow: 0 12px 28px rgba(0,0,0,0.1); }
.stat-card .n { font-size: 32px; font-weight: 700; color: var(--accent); line-height: 1; }
.stat-card .l { font-size: 12px; color: var(--muted); margin-top: 4px; text-transform: uppercase; letter-spacing: 0.06em; }
.section { padding: 80px 0; }
.section-head { display: grid; grid-template-columns: 1fr 1fr; gap: 56px; margin-bottom: 56px; align-items: end; }
.section h2 { font-size: clamp(28px, 3.4vw, 42px); margin: 0; font-weight: 500; line-height: 1.1; }
.cards { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; }
.card { background: var(--card); padding: 28px; border-radius: 14px; box-shadow: 0 1px 0 rgba(0,0,0,0.04); }
.card .icon { width: 40px; height: 40px; border-radius: 10px; background: var(--accent); display: flex; align-items: center; justify-content: center; color: white; margin-bottom: 18px; font-size: 18px; font-weight: 700; }
.card h3 { font-size: 18px; margin: 0 0 10px; font-weight: 600; }
.card p { margin: 0; color: var(--muted); font-size: 14px; line-height: 1.6; }
.split { display: grid; grid-template-columns: 1fr 1fr; gap: 56px; align-items: center; padding: 60px 0; }
.split-img { aspect-ratio: 4/3; border-radius: 14px; overflow: hidden; }
.footer { padding: 50px 0; background: var(--card); margin-top: 60px; text-align: center; font-size: 14px; color: var(--muted); }
</style></head><body>
<div class="top-banner">Now booking · ${b.hero.kicker}</div>
${makeNav(b)}
<section class="hero wrap">
  <div class="hero-grid">
    <div>
      <div class="kicker">${b.vertical}</div>
      <h1>${b.tagline}</h1>
      <p class="lead">${b.sections[1].items[0][1]}</p>
      <div class="cta-row">
        <a class="btn">${b.hero.cta}</a>
        <a class="btn outline">Call us</a>
      </div>
    </div>
    <div class="hero-img">
      <img src="img/hero.jpg" alt="">
      <div class="stat-card"><div class="n">${statYears(b.slug)} yrs</div><div class="l">in practice</div></div>
    </div>
  </div>
</section>
<section class="section wrap">
  <div class="section-head">
    <h2>${b.sections[0].title}</h2>
    <p class="muted">Our team handles a wide range of cases — start by telling us what's going on.</p>
  </div>
  <div class="cards">
    ${b.sections[0].items.map(([t, d], i) => `<div class="card"><div class="icon">${i + 1}</div><h3>${t}</h3><p>${d}</p></div>`).join('')}
  </div>
</section>
<section class="wrap">
  <div class="split">
    <div class="split-img"><img src="img/a.jpg"></div>
    <div>
      <div class="kicker">${b.sections[1].title}</div>
      <h2 style="margin-bottom:22px">Care that doesn't feel rushed.</h2>
      ${b.sections[1].items.map(([t, d]) => `<p><strong>${t}.</strong> <span class="muted">${d}</span></p>`).join('')}
      <a class="btn" style="margin-top:18px">${b.hero.cta}</a>
    </div>
  </div>
</section>
<footer class="footer">${b.name} · ${b.vertical} · Mon-Fri · accepting new patients</footer>
</body></html>`;
}

/* Template 4: BOLD — high-contrast, big type, dark or saturated */
function bold(b) {
  const isDark = ['#181210', '#10141a', '#0d0d0e', '#0e1418'].includes(
    b.palette.bg,
  );
  return `<!doctype html><html><head><meta charset="utf-8"><title>${b.name}</title>
<link href="https://fonts.googleapis.com/css2?family=${b.fonts.h.replaceAll(' ', '+')}:wght@400;700&family=${b.fonts.b.replaceAll(' ', '+')}:wght@400;500;700&display=swap" rel="stylesheet">
<style>${sharedCss(b)}
.hero { padding: 30px 0 0; position: relative; overflow: hidden; }
.hero-grid { display: grid; grid-template-columns: 1.05fr 1fr; gap: 0; align-items: stretch; min-height: 70vh; }
.hero-text { padding: 40px 0; display: flex; flex-direction: column; justify-content: center; }
.hero h1 { font-size: clamp(56px, 9vw, 130px); line-height: 0.95; letter-spacing: -0.02em; margin: 0 0 28px; font-weight: 700; text-transform: uppercase; }
.hero h1 em { font-style: italic; color: var(--accent); }
.hero p.lead { font-size: 19px; line-height: 1.55; max-width: 460px; margin: 0 0 32px; opacity: 0.78; }
.hero-img { background: url('img/hero.jpg') center / cover; min-height: 60vh; margin-left: 40px; }
.marquee { background: var(--accent); color: white; padding: 16px 0; font-family: '${b.fonts.h}'; font-size: 24px; text-transform: uppercase; letter-spacing: 0.08em; overflow: hidden; }
.marquee-inner { display: flex; gap: 80px; white-space: nowrap; }
.marquee span { font-weight: 700; }
.section { padding: 100px 0; }
.section h2 { font-size: clamp(40px, 6vw, 80px); margin: 0 0 60px; text-transform: uppercase; letter-spacing: -0.01em; font-weight: 700; line-height: 0.95; }
.menu-list { display: grid; grid-template-columns: 1fr 1fr; gap: 32px 80px; }
.menu-row { padding: 24px 0; border-top: 1px solid ${isDark ? 'rgba(255,255,255,0.16)' : 'rgba(0,0,0,0.18)'}; }
.menu-row h3 { font-family: '${b.fonts.h}'; font-size: 26px; margin: 0 0 6px; text-transform: uppercase; letter-spacing: 0.01em; }
.menu-row p { margin: 0; opacity: 0.65; font-size: 14px; line-height: 1.6; }
.image-band { display: grid; grid-template-columns: 1fr 1fr 1fr 1fr; gap: 4px; height: 280px; }
.image-band img { width: 100%; height: 100%; object-fit: cover; filter: contrast(1.08); }
.footer { padding: 70px 0 80px; text-align: center; border-top: 1px solid ${isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.18)'}; }
.footer h3 { font-family: '${b.fonts.h}'; font-size: 36px; margin: 0 0 14px; text-transform: uppercase; }
</style></head><body>
${makeNav(b)}
<section class="hero">
  <div class="wrap hero-grid">
    <div class="hero-text">
      <div class="kicker">${b.hero.kicker}</div>
      <h1>${b.name.split(/\s+/).slice(0, 2).join('<br>')}<br><em>${b.name.split(/\s+/).slice(2).join(' ') || ''}</em></h1>
      <p class="lead">${b.tagline}</p>
      <a class="btn">${b.hero.cta}</a>
    </div>
    <div class="hero-img"></div>
  </div>
</section>
<div class="marquee"><div class="marquee-inner">
  ${Array.from({length: 5}, () => `<span>★ ${b.name} ★</span>`).join('')}
</div></div>
<section class="section wrap">
  <h2>${b.sections[0].title}</h2>
  <div class="menu-list">
    ${b.sections[0].items.map(([t, d]) => `<div class="menu-row"><h3>${t}</h3><p>${d}</p></div>`).join('')}
  </div>
</section>
<div class="image-band"><img src="img/a.jpg"><img src="img/b.jpg"><img src="img/c.jpg"><img src="img/d.jpg"></div>
<section class="section wrap">
  <h2 style="font-size:clamp(28px,4vw,52px)">${b.sections[1].title}.</h2>
  <div class="menu-list">
    ${b.sections[1].items.map(([t, d]) => `<div class="menu-row"><h3>${t}</h3><p>${d}</p></div>`).join('')}
  </div>
</section>
<footer class="footer wrap">
  <h3>${b.hero.cta}</h3>
  <p class="muted">${b.name} · ${b.vertical}</p>
</footer>
</body></html>`;
}

/* Template 5: ARCHITECTURAL — geometric, grid-led, sans-serif, technical */
function architectural(b) {
  const isDark = ['#13171d', '#0e1418'].includes(b.palette.bg);
  return `<!doctype html><html><head><meta charset="utf-8"><title>${b.name}</title>
<link href="https://fonts.googleapis.com/css2?family=${b.fonts.h.replaceAll(' ', '+')}:wght@400;500;700&family=${b.fonts.b.replaceAll(' ', '+')}:wght@400;500;600&display=swap" rel="stylesheet">
<style>${sharedCss(b)}
.hero { padding: 30px 0 70px; }
.hero-grid { display: grid; grid-template-columns: 1.2fr 1fr; gap: 56px; align-items: end; }
.hero h1 { font-size: clamp(40px, 5.5vw, 76px); line-height: 1.02; letter-spacing: -0.025em; margin: 0 0 22px; font-weight: 500; }
.hero h1 em { color: var(--accent); font-style: normal; }
.hero p.lead { font-size: 18px; line-height: 1.55; max-width: 480px; margin: 0 0 28px; opacity: 0.72; }
.hero-img { aspect-ratio: 5/6; overflow: hidden; border: 1px solid ${isDark ? 'rgba(255,255,255,0.16)' : 'rgba(0,0,0,0.12)'}; }
.spec-row { display: grid; grid-template-columns: repeat(4, 1fr); border-top: 1px solid ${isDark ? 'rgba(255,255,255,0.16)' : 'rgba(0,0,0,0.12)'}; border-bottom: 1px solid ${isDark ? 'rgba(255,255,255,0.16)' : 'rgba(0,0,0,0.12)'}; }
.spec { padding: 26px 24px; border-right: 1px solid ${isDark ? 'rgba(255,255,255,0.16)' : 'rgba(0,0,0,0.12)'}; }
.spec:last-child { border-right: 0; }
.spec .l { font-size: 11px; text-transform: uppercase; letter-spacing: 0.14em; opacity: 0.55; margin-bottom: 8px; }
.spec .v { font-family: '${b.fonts.h}'; font-size: 22px; font-weight: 500; letter-spacing: -0.01em; }
.section { padding: 90px 0; }
.section-head { display: flex; align-items: end; justify-content: space-between; margin-bottom: 60px; gap: 60px; }
.section h2 { font-size: clamp(32px, 4vw, 52px); margin: 0; font-weight: 500; line-height: 1.04; max-width: 560px; letter-spacing: -0.015em; }
.section .index { font-family: '${b.fonts.h}'; font-size: 13px; opacity: 0.5; letter-spacing: 0.16em; text-transform: uppercase; }
.grid-4 { display: grid; grid-template-columns: repeat(4, 1fr); gap: 0; border-top: 1px solid ${isDark ? 'rgba(255,255,255,0.16)' : 'rgba(0,0,0,0.12)'}; }
.grid-cell { padding: 28px 22px 32px; border-right: 1px solid ${isDark ? 'rgba(255,255,255,0.16)' : 'rgba(0,0,0,0.12)'}; border-bottom: 1px solid ${isDark ? 'rgba(255,255,255,0.16)' : 'rgba(0,0,0,0.12)'}; min-height: 220px; display: flex; flex-direction: column; }
.grid-cell:nth-child(4n) { border-right: 0; }
.grid-cell .n { font-family: '${b.fonts.h}'; font-size: 11px; letter-spacing: 0.18em; opacity: 0.5; margin-bottom: 14px; }
.grid-cell h3 { font-size: 22px; margin: 0 0 12px; font-weight: 500; letter-spacing: -0.01em; }
.grid-cell p { margin: 0; opacity: 0.65; font-size: 14px; line-height: 1.55; }
.image-band { display: grid; grid-template-columns: 1.2fr 0.8fr; gap: 4px; height: 480px; margin: 60px 0; }
.image-band img { width: 100%; height: 100%; object-fit: cover; }
.cta-band { padding: 100px 0; background: var(--accent); color: white; text-align: center; margin-top: 60px; }
.cta-band h2 { color: white; margin: 0 0 30px; }
.cta-band .btn { background: white; color: var(--accent); }
.footer { padding: 50px 0; text-align: center; font-size: 13px; opacity: 0.55; }
</style></head><body>
${makeNav(b)}
<section class="hero wrap">
  <div class="hero-grid">
    <div>
      <div class="kicker">${b.hero.kicker}</div>
      <h1>${b.tagline.replace(/(\.\s)/, '<em>.</em> ')}</h1>
      <p class="lead">${b.vertical}.</p>
      <a class="btn">${b.hero.cta}</a>
    </div>
    <div class="hero-img"><img src="img/hero.jpg" alt="" style="width:100%;height:100%;object-fit:cover;"></div>
  </div>
</section>
<div class="wrap"><div class="spec-row">
  <div class="spec"><div class="l">Discipline</div><div class="v">${b.vertical.split('—')[0].trim()}</div></div>
  <div class="spec"><div class="l">Region</div><div class="v">${(b.vertical.split('—')[1] || '').trim() || 'Local'}</div></div>
  <div class="spec"><div class="l">Founded</div><div class="v">${b.hero.kicker.match(/(19|20)\d{2}/)?.[0] || '2014'}</div></div>
  <div class="spec"><div class="l">Hours</div><div class="v">Mon – Sat</div></div>
</div></div>
<section class="section wrap">
  <div class="section-head">
    <h2>${b.sections[0].title}</h2>
    <div class="index">01 / Services</div>
  </div>
  <div class="grid-4">
    ${b.sections[0].items.map(([t, d], i) => `<div class="grid-cell"><div class="n">${String(i + 1).padStart(2, '0')}</div><h3>${t}</h3><p>${d}</p></div>`).join('')}
  </div>
</section>
<div class="image-band"><img src="img/a.jpg"><img src="img/b.jpg"></div>
<section class="section wrap">
  <div class="section-head">
    <h2>${b.sections[1].title}</h2>
    <div class="index">02 / Practice</div>
  </div>
  <div class="grid-4">
    ${b.sections[1].items.map(([t, d], i) => `<div class="grid-cell"><div class="n">${String(i + 1).padStart(2, '0')}</div><h3>${t}</h3><p>${d}</p></div>`).join('')}
  </div>
</section>
<div class="cta-band">
  <h2 class="display" style="font-size:clamp(28px,4vw,48px)">${b.hero.cta}.</h2>
  <a class="btn">Get in touch</a>
</div>
<footer class="footer">${b.name} · ${b.vertical}</footer>
</body></html>`;
}

const LAYOUTS = {warm, editorial, clinical, bold, architectural};

// Exported so the determinism test can call the pure template functions
// + statYears directly without triggering file writes. The generate()
// side-effect only runs when the script is invoked as a CLI (main guard).
export {BUSINESSES, LAYOUTS, statYears, makeNav};

/** Render one business to HTML (pure — no I/O). */
export function renderBusiness(b) {
  const tpl = LAYOUTS[b.layout];
  if (!tpl) throw new Error(`unknown layout ${b.layout} for ${b.slug}`);
  return tpl(b);
}

/* ------------------------------------------------------------------ */
/* Run (CLI side effect)                                               */
/* ------------------------------------------------------------------ */
function generate() {
  for (const b of BUSINESSES) {
    const html = renderBusiness(b);
    const dir = path.join(bizRoot, b.slug);
    fs.writeFileSync(path.join(dir, 'index.html'), html);
    console.log(
      `✓ ${b.slug} (${b.layout}) — ${(html.length / 1024).toFixed(1)} KB`,
    );
  }

  console.log(`\nGenerated ${BUSINESSES.length} landing pages.`);

  // Export for capture pipeline
  fs.writeFileSync(
    path.join(bizRoot, '_businesses.json'),
    JSON.stringify(
      BUSINESSES.map(({slug, name, vertical, layout, palette}) => ({
        slug,
        name,
        vertical,
        layout,
        palette,
      })),
      null,
      2,
    ),
  );
}

// Run only when invoked directly (node script/generators/biz-landing-pages.mjs),
// not when imported by a test.
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  generate();
}
