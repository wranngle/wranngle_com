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
import {fileURLToPath} from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(here, '../..');
const bizRoot = path.join(repoRoot, 'demo-stages/biz');

/* ------------------------------------------------------------------ */
/* 20 business identities — distinct palette + font + layout each      */
/* ------------------------------------------------------------------ */
// Layout variants: editorial | clinical | bold | warm | architectural
const BUSINESSES = [
  {
    slug: 'bakery', name: 'Aviary Bakehouse', tagline: 'Slow ferment. Stone hearth. Six-day sourdough.',
    vertical: 'Artisan bakery — Brooklyn, NY',
    layout: 'warm',
    fonts: {h: 'Fraunces', b: 'Inter'},
    palette: {bg: '#f7f1e6', ink: '#1b1610', accent: '#b85e2a', muted: '#8f7a5f', card: '#fffaf0'},
    nav: ['Loaves', 'Pastries', 'Subscriptions', 'Visit'],
    hero: {kicker: 'Est. 2019', cta: 'Order the weekly loaf'},
    sections: [
      {title: 'This week at the bench', items: [
        ['Country sourdough', 'Six-day cold ferment. Heritage hard winter wheat from Pennsylvania. $9'],
        ['Olive & herb fougasse', 'Castelvetrano + rosemary. Friday + Saturday only. $11'],
        ['Brown butter laminated brioche', 'Eight folds. Polish flour. Pull-apart loaf. $14'],
        ['Miso chocolate babka', 'White miso + 70% Valrhona. Sliced + boxed. $16'],
      ]},
      {title: 'Standing orders', items: [
        ['Weekly bread CSA', '$32/mo · pickup Saturdays · two loaves rotated by the bench team'],
        ['Café wholesale', 'A.M. drops by 5:30 — Park Slope, Cobble Hill, Crown Heights'],
      ]},
    ],
  },
  {
    slug: 'barbershop', name: 'Pinion & Crow Barber Co.', tagline: 'Old-house haircuts. Hot towel. Straight razor. No app.',
    vertical: 'Barbershop — Portland, OR',
    layout: 'editorial',
    fonts: {h: 'Playfair Display', b: 'Work Sans'},
    palette: {bg: '#1c1815', ink: '#f3ece0', accent: '#c8a26b', muted: '#8d7e6c', card: '#231e1a'},
    nav: ['Services', 'Crew', 'Walk-in board', 'Find us'],
    hero: {kicker: 'Since 2014', cta: 'Get on the board'},
    sections: [
      {title: 'The list', items: [
        ['The Pinion cut', 'Scissor over comb, taper, hot towel finish. 45 min · $48'],
        ['Straight-razor shave', 'Pre-shave hot wrap, lather, single-blade pass + cleanup. 35 min · $42'],
        ['Beard sculpt + steam', 'Trim, shape, tonic, oil. 25 min · $30'],
        ['Father + son seat', 'Two cuts in adjacent chairs. 90 min · $74'],
      ]},
      {title: 'Behind the chairs', items: [
        ['Marco Pinion', 'Owner. Twelve years at Hilly\'s in San Francisco before opening up here.'],
        ['Della Crowfoot', 'Razor specialist. Pittsburgh transplant. Books out three weeks.'],
      ]},
    ],
  },
  {
    slug: 'bbq-joint', name: 'Hickory Hall', tagline: 'Whole-hog Carolina BBQ. Wood smoke from 4 a.m.',
    vertical: 'Barbecue restaurant — Asheville, NC',
    layout: 'bold',
    fonts: {h: 'Bebas Neue', b: 'Source Sans 3'},
    palette: {bg: '#181210', ink: '#fff6e8', accent: '#e8521a', muted: '#a08573', card: '#241a16'},
    nav: ['The Pit', 'Sides', 'Catering', 'Hours'],
    hero: {kicker: 'Pit-smoked since 2017', cta: 'Order the platter'},
    sections: [
      {title: 'From the pit', items: [
        ['Whole-hog plate', '12-hour hickory smoke, vinegar pepper, slaw, hush puppies. $24'],
        ['Brisket sandwich', 'Texas-cut point, white bread, slaw, pickles. $18'],
        ['Smoked half chicken', 'Dry rub, finished over coals, white sauce on the side. $19'],
        ['Burnt ends, by the half-pound', 'Rendered, glazed, double-smoked. $14'],
      ]},
      {title: 'Sides + plates', items: [
        ['Collards', 'Slow braised with smoked hock and apple cider vinegar. $6'],
        ['Mac & cheese', 'Three-cheese, breadcrumb crust. $7'],
        ['Banana pudding', 'Vanilla wafer, fresh whipped, salted vanilla. $7'],
      ]},
    ],
  },
  {
    slug: 'climbing-gym', name: 'North Face Climbing Co-op', tagline: 'Volume, granite-textured holds, fifty new problems weekly.',
    vertical: 'Climbing gym — Boulder, CO',
    layout: 'architectural',
    fonts: {h: 'Archivo Black', b: 'Inter'},
    palette: {bg: '#0e1418', ink: '#e6edf3', accent: '#5dd5c4', muted: '#7a8a96', card: '#161e24'},
    nav: ['Membership', 'Classes', 'Setting calendar', 'Visit'],
    hero: {kicker: 'Member-owned co-op', cta: 'Reserve a trial pass'},
    sections: [
      {title: 'Walls + grades', items: [
        ['Bouldering cave', '4,800 sq ft. V0-V11. Reset weekly by a rotating crew of four setters.'],
        ['Lead arena', '45-ft routes, 1,500 lines per quarter, autobelays + top-rope stations.'],
        ['Training board', 'MoonBoard 2019 set + Tension Board 2 + system board.'],
      ]},
      {title: 'Classes this week', items: [
        ['Intro to lead', 'Tuesdays + Thursdays 7pm · $35 drop-in · $25 members'],
        ['Strength + finger health', 'Saturdays 9am · 90 min · $40 / free for members'],
        ['Kids climb club', 'Sundays 10am, ages 7-12 · 8-week sessions'],
      ]},
    ],
  },
  {
    slug: 'cocktail-bar', name: 'Lantern & Owl', tagline: 'House-made bitters. Rotating amaro. Quiet enough to talk.',
    vertical: 'Cocktail bar — New Orleans, LA',
    layout: 'editorial',
    fonts: {h: 'Cormorant Garamond', b: 'Karla'},
    palette: {bg: '#0f0e14', ink: '#ece6d7', accent: '#d9a566', muted: '#897e6c', card: '#181620'},
    nav: ['List', 'Reservations', 'Private rooms', 'About'],
    hero: {kicker: 'A room with thirty-eight seats', cta: 'Reserve a banquette'},
    sections: [
      {title: 'On the list tonight', items: [
        ['Smoke Signal', 'Mezcal, smoked pineapple, lime cordial, sea salt, applewood smoke. $17'],
        ['Hollow Bell', 'Rye, Cynar, walnut bitters, hand-carved orange peel. $15'],
        ['Cane & Citrus', 'White rum, lime, demerara, mint, sparkling lemon. $14'],
        ['Negroni Reserve', 'Bombay Sapphire East, Antica Formula, Campari macerated 30 days. $19'],
      ]},
      {title: 'House practice', items: [
        ['Bitters lab', 'We tincture our own across 14 botanicals — a 6-bottle list rotates monthly.'],
        ['Glassware', 'Hand-blown, sourced from a five-person studio in West Virginia.'],
      ]},
    ],
  },
  {
    slug: 'coffee-roaster', name: 'Stalk & Tin Coffee', tagline: 'Single-farm. Lightly developed. Sold the week it\'s roasted.',
    vertical: 'Specialty coffee roaster — Madison, WI',
    layout: 'clinical',
    fonts: {h: 'Manrope', b: 'Inter'},
    palette: {bg: '#fbfaf6', ink: '#1a1814', accent: '#3a6b4e', muted: '#75716a', card: '#ffffff'},
    nav: ['Beans', 'Subscriptions', 'Café', 'Wholesale'],
    hero: {kicker: 'Roasted Tuesdays + Fridays', cta: 'Browse this week\'s lots'},
    sections: [
      {title: 'On the rack', items: [
        ['Bolivia · La Pampa', 'Caturra. Honey processed. Apricot, brown sugar, soft cocoa. $22 / 250g'],
        ['Ethiopia · Banko Gotiti', 'Heirloom. Natural. Strawberry, jasmine, mead-like body. $24 / 250g'],
        ['Honduras · Las Capucas', 'Pacas. Washed. Almond, milk chocolate, cane sugar. $19 / 250g'],
      ]},
      {title: 'How we buy', items: [
        ['Direct trade', 'We pay 30-50% above C-market. Contracts are public on the bag.'],
        ['Cupping', 'Every lot scored 86+ by two cuppers before we contract it.'],
      ]},
    ],
  },
  {
    slug: 'crossfit-gym', name: 'Iron Bell Strength', tagline: 'Strength first. Conditioning second. Coached, not yelled at.',
    vertical: 'Strength + conditioning gym — Salt Lake City, UT',
    layout: 'bold',
    fonts: {h: 'Oswald', b: 'Inter'},
    palette: {bg: '#10141a', ink: '#f5f5f4', accent: '#f9c81a', muted: '#8a8d92', card: '#1a1f27'},
    nav: ['Programs', 'Coaches', 'Schedule', 'Drop in'],
    hero: {kicker: 'Coached small-group strength', cta: 'Book a free intro'},
    sections: [
      {title: 'Programs', items: [
        ['Strength Foundations', '12-week beginner block. Squat, hinge, press, pull, carry. 3x/week.'],
        ['Daily Strength', '60-min coached class. Periodized lifting + 12-minute conditioning piece.'],
        ['Hypertrophy Lab', 'Bodybuilding-style 4-day split. Member-run + coach-checked.'],
        ['Endurance Builder', '5K-to-marathon coaching. Saturday long runs from the gym door.'],
      ]},
      {title: 'Coaches', items: [
        ['Mara Ellison', 'USAW L1 + CSCS. Eight years coaching. Bench focus.'],
        ['Dev Kuretsky', 'Strongman background. Conditioning + carries.'],
      ]},
    ],
  },
  {
    slug: 'dermatology', name: 'Field Avenue Skin Clinic', tagline: 'Medical dermatology with the cosmetic suite next door.',
    vertical: 'Dermatology practice — Minneapolis, MN',
    layout: 'clinical',
    fonts: {h: 'DM Serif Display', b: 'DM Sans'},
    palette: {bg: '#f4f1ec', ink: '#1e2024', accent: '#b56e6c', muted: '#6e7177', card: '#ffffff'},
    nav: ['Services', 'Providers', 'New patients', 'Book'],
    hero: {kicker: 'Board-certified, in-network with 7 plans', cta: 'Request an appointment'},
    sections: [
      {title: 'Medical', items: [
        ['Skin cancer screening', '20-min full body, dermoscopy, biopsy in-clinic if needed.'],
        ['Acne management', 'Topicals, oral therapy, isotretinoin program, scar revision.'],
        ['Psoriasis + eczema', 'Biologic + light therapy. Three suites with narrowband UVB.'],
      ]},
      {title: 'Cosmetic', items: [
        ['Botox + filler', 'RN injectors trained at MN Aesthetic Institute.'],
        ['Microneedling + PRP', '60-min protocol, four-session course.'],
        ['Laser', 'Pico + IPL + erbium. Same-day topical numbing.'],
      ]},
    ],
  },
  {
    slug: 'electrician', name: 'Holloway Electric', tagline: 'Licensed, insured, picks up the phone.',
    vertical: 'Residential + light commercial electrician — Charleston, SC',
    layout: 'architectural',
    fonts: {h: 'Space Grotesk', b: 'Inter'},
    palette: {bg: '#13171d', ink: '#eaecef', accent: '#f0b81b', muted: '#7d828a', card: '#1c2129'},
    nav: ['Services', 'Service area', 'Reviews', 'Get a quote'],
    hero: {kicker: 'SC licensed master · Lic #4598-M', cta: 'Schedule a visit'},
    sections: [
      {title: 'What we do', items: [
        ['Panel upgrades', 'From 100A to 200A or 400A. Same-day inspection coordination.'],
        ['EV charger install', 'Level 2 chargers — Tesla, ChargePoint, Wallbox. Permit included.'],
        ['Whole-home rewires', 'Old knob-and-tube to NEC 2020. Drywall patch + paint subcontract.'],
        ['Generator install + service', 'Generac + Kohler. Concrete pad, gas line, transfer switch.'],
      ]},
      {title: 'Service window', items: [
        ['Same-day callbacks', 'Texts answered within 30 min during business hours.'],
        ['On-time guarantee', 'If we\'re late beyond the 2-hour window, the service call is free.'],
      ]},
    ],
  },
  {
    slug: 'family-law', name: 'Wren & Hadley LLP', tagline: 'Family law, mediation, and collaborative divorce. Plain language.',
    vertical: 'Family law firm — Raleigh, NC',
    layout: 'editorial',
    fonts: {h: 'Lora', b: 'Source Sans 3'},
    palette: {bg: '#f6f3ee', ink: '#1b1c20', accent: '#5b6e4f', muted: '#6f6c66', card: '#ffffff'},
    nav: ['Practice', 'Attorneys', 'Process', 'Consult'],
    hero: {kicker: 'Twenty years in Wake County', cta: 'Request a private consult'},
    sections: [
      {title: 'How we work', items: [
        ['Collaborative divorce', 'Both spouses agree to settle out of court. Lower cost, child-first.'],
        ['Mediation', 'Single neutral, two attorneys present. Half-day or full-day sessions.'],
        ['Custody + co-parenting', 'Parenting plans drafted in plain language; review every 12 months.'],
      ]},
      {title: 'Why families call us', items: [
        ['Flat-fee where possible', 'For uncontested matters, you get a fee letter at intake.'],
        ['One point of contact', 'You don\'t bounce between paralegals. One attorney + one assistant.'],
      ]},
    ],
  },
  {
    slug: 'florist', name: 'Bramble & Stem', tagline: 'Seasonal blooms, foraged stems, weekly market arrangements.',
    vertical: 'Florist + event design — Nashville, TN',
    layout: 'warm',
    fonts: {h: 'DM Serif Text', b: 'Karla'},
    palette: {bg: '#faf3ec', ink: '#23201d', accent: '#9b6b89', muted: '#888178', card: '#ffffff'},
    nav: ['Market days', 'Weddings', 'Subscriptions', 'Visit'],
    hero: {kicker: 'Tuesdays + Fridays at the storefront', cta: 'Reserve a market bouquet'},
    sections: [
      {title: 'What\'s in this week', items: [
        ['Garden roses + ranunculus', 'Local-grown from a half-acre cutting field in Bell Buckle.'],
        ['Foraged eucalyptus + ivy', 'Cut from our own backyard hedgerow + a partner farm.'],
        ['Tulips + anemones', 'Dutch import for the season — last call mid-May.'],
      ]},
      {title: 'For your wedding', items: [
        ['Full design', 'Bouquet, ceremony installation, reception centerpieces, send-off petals.'],
        ['A-la-carte', 'Just bouquets + boutonnières. Pickup the morning of.'],
      ]},
    ],
  },
  {
    slug: 'hvac', name: 'Northstar HVAC', tagline: 'Heat pumps, mini-splits, ducted systems. Same-day service.',
    vertical: 'HVAC installer + service — Saint Paul, MN',
    layout: 'architectural',
    fonts: {h: 'Space Grotesk', b: 'Inter'},
    palette: {bg: '#f4f6f9', ink: '#161a22', accent: '#1f7ed8', muted: '#5f6675', card: '#ffffff'},
    nav: ['Service', 'Install', 'Maintenance plans', 'Estimate'],
    hero: {kicker: 'NATE-certified · 24/7 service', cta: 'Book a free estimate'},
    sections: [
      {title: 'What we install', items: [
        ['Cold-climate heat pumps', 'Mitsubishi, Daikin, Bosch — rated to -15°F. Eligible for state rebates.'],
        ['Ducted central air', 'Two-stage and variable-speed. We size with Manual J + S.'],
        ['Ductless mini-splits', 'Per-room comfort. One outdoor unit, up to five heads.'],
      ]},
      {title: 'Service + maintenance', items: [
        ['Twice-a-year tune-ups', 'Spring AC, fall furnace. Free filter set for plan members.'],
        ['Emergency calls', 'Same-day service, 7-day calendar. Flat after-hours fee.'],
      ]},
    ],
  },
  {
    slug: 'nail-studio', name: 'Cosmos Nail Studio', tagline: 'Gel + builder + Russian manicure, by a five-tech team.',
    vertical: 'Nail studio — Austin, TX',
    layout: 'bold',
    fonts: {h: 'Syne', b: 'Inter'},
    palette: {bg: '#f3eef7', ink: '#231d2c', accent: '#7b3df5', muted: '#8a809a', card: '#ffffff'},
    nav: ['Menu', 'Techs', 'Gallery', 'Book'],
    hero: {kicker: 'Tuesday – Saturday · downtown', cta: 'Book a chair'},
    sections: [
      {title: 'Menu', items: [
        ['Russian manicure + gel', '90 min · cuticle work + gloss · $65'],
        ['Builder gel set', '110 min · sculpted shape + apex · $85'],
        ['Soft chrome / cat-eye', '15-min add-on · per nail · $5'],
        ['Nail art, custom', 'Quote at the chair. Hand-drawn, decals, foil, encapsulated.'],
      ]},
      {title: 'Your tech', items: [
        ['Anya Mirov', 'Russian-trained. Builder + structure specialist.'],
        ['Joelle Kim', 'Pearl + chrome + cat-eye. Featured in Allure 2025.'],
      ]},
    ],
  },
  {
    slug: 'physical-therapy', name: 'Cedar Bend PT', tagline: 'One-hour appointments. One PT, one room, one plan.',
    vertical: 'Physical therapy — Bend, OR',
    layout: 'clinical',
    fonts: {h: 'Manrope', b: 'Inter'},
    palette: {bg: '#f1f4f1', ink: '#1a201a', accent: '#5f8a4f', muted: '#6b7269', card: '#ffffff'},
    nav: ['Conditions', 'Therapists', 'Insurance', 'Book'],
    hero: {kicker: 'In-network with 12 plans · cash-pay options', cta: 'Request a 1-on-1 visit'},
    sections: [
      {title: 'What we treat', items: [
        ['Post-op recovery', 'Knee, hip, shoulder, ACL. Surgeon protocols + return-to-sport testing.'],
        ['Chronic back + neck', 'McKenzie + DNS + targeted strength. Tracked outcomes at 4, 8, 12 weeks.'],
        ['Runners + climbers', 'Gait analysis, finger and elbow load programs, return-to-trail planning.'],
      ]},
      {title: 'Our model', items: [
        ['One PT per visit', 'Not handed off to an aide. The same therapist for the whole plan.'],
        ['Outcomes published', 'We track and share recovery time vs. expected. Ask at intake.'],
      ]},
    ],
  },
  {
    slug: 'plumber', name: 'Crestline Plumbing', tagline: 'Family-owned since 1983. Honest quotes, written warranties.',
    vertical: 'Residential plumbing — Spokane, WA',
    layout: 'architectural',
    fonts: {h: 'Archivo', b: 'Inter'},
    palette: {bg: '#fbfbfa', ink: '#181a20', accent: '#2e5fab', muted: '#5a6068', card: '#f1f3f8'},
    nav: ['Services', 'About', 'Reviews', 'Schedule'],
    hero: {kicker: 'Master plumber · Lic. PB-4520', cta: 'Get a same-day visit'},
    sections: [
      {title: 'Common calls', items: [
        ['Water heater install + repair', 'Tankless, hybrid, traditional. Same-day if we have the model.'],
        ['Sewer + drain', 'Camera inspection, hydro-jetting, trenchless replacement.'],
        ['Repipe + slab leak', 'PEX + copper. Free estimate, written warranty, drywall patch coordinated.'],
        ['Bathroom + kitchen remodel', 'We work with your GC or solo. Permit included.'],
      ]},
      {title: 'How we price', items: [
        ['Flat-rate quotes', 'We give the number before we start. No surprise hourly add-ons.'],
        ['Written warranty', '2 years on parts + labor. Lifetime on PEX repipes.'],
      ]},
    ],
  },
  {
    slug: 'ramen-bar', name: 'Kōri Ramen', tagline: 'Tonkotsu, shio, miso. Tare made in-house. Twelve seats.',
    vertical: 'Ramen bar — Seattle, WA',
    layout: 'editorial',
    fonts: {h: 'Noto Serif JP', b: 'Inter'},
    palette: {bg: '#16110d', ink: '#f1e9db', accent: '#dc4c3e', muted: '#8b7e6e', card: '#1f1814'},
    nav: ['Bowls', 'Sides', 'About', 'Wait list'],
    hero: {kicker: 'Counter seating only · no app, no DMs', cta: 'Get on the wait list'},
    sections: [
      {title: 'Bowls', items: [
        ['Tonkotsu shio', '18-hour pork bone broth, sea-salt tare, ajitama, chashu, scallion. $17'],
        ['Miso', 'Red + white miso blend, ground pork, corn, butter, bean sprouts, scallion. $16'],
        ['Spicy ginger', 'Chicken broth, ginger tare, chili oil, ground pork, soft-boiled egg. $18'],
        ['Tsukemen (dipping)', 'Dense double-soup, chilled noodles, dipping cup. $19'],
      ]},
      {title: 'House rules', items: [
        ['No reservations', 'Wait list opens at 4:30pm at the door. We text when your seat\'s ready.'],
        ['Twelve seats', 'No groups over four. Cash, Visa, MC.'],
      ]},
    ],
  },
  {
    slug: 'tattoo-parlor', name: 'Iron Heron Tattoo', tagline: 'Custom, single-needle, fine-line. Booked six months out.',
    vertical: 'Tattoo studio — Philadelphia, PA',
    layout: 'bold',
    fonts: {h: 'Anton', b: 'Inter'},
    palette: {bg: '#0d0d0e', ink: '#f4f1ec', accent: '#cd2b3c', muted: '#777472', card: '#161618'},
    nav: ['Artists', 'Portfolio', 'Booking', 'Studio'],
    hero: {kicker: 'Six artists · by appointment', cta: 'Apply for a booking slot'},
    sections: [
      {title: 'Artists', items: [
        ['Eva Linder', 'Fine-line, single-needle botanicals. Three-year book; quarterly drop on the 1st.'],
        ['Dom Castile', 'Black & gray realism. Portraits + memorial work. Two-year book.'],
        ['River Okonkwo', 'American traditional. Walk-ins on Fridays + Saturdays.'],
        ['Pi Akhmatova', 'Geometric + dotwork. Sleeve specialist. Custom-only.'],
      ]},
      {title: 'Booking', items: [
        ['Application', 'Fill our form with reference, placement, size, and a budget range.'],
        ['Deposit', '$200 non-refundable, applied to your final session.'],
      ]},
    ],
  },
  {
    slug: 'vegan-cafe', name: 'Greenhouse 14', tagline: 'Plant-only café and pastry counter. Open seven days.',
    vertical: 'Vegan café — Burlington, VT',
    layout: 'warm',
    fonts: {h: 'Fraunces', b: 'Inter'},
    palette: {bg: '#f1f4ec', ink: '#1b1e16', accent: '#4f7a3a', muted: '#7b8071', card: '#ffffff'},
    nav: ['Menu', 'Pastry', 'Brunch', 'Find us'],
    hero: {kicker: 'Plant-based · 100% vegan', cta: 'See today\'s menu'},
    sections: [
      {title: 'The menu', items: [
        ['Cashew ricotta toast', 'Sourdough, lemon-cashew ricotta, hot honey, microgreens. $12'],
        ['Smoky tempeh BLT', 'Maple-smoked tempeh, butter lettuce, heirloom tomato, vegan aioli. $14'],
        ['Mushroom + leek galette', 'Spelt crust, herbed cashew cream, oyster mushrooms, leek confit. $13'],
        ['Cardamom oat latte', 'In-house oat milk, cardamom, La Colombe espresso. $5.50'],
      ]},
      {title: 'House practice', items: [
        ['Compost program', 'Everything off the plates and the prep line goes to a 14-farm composter.'],
        ['Local sourcing', 'Produce from 7 Vermont farms within 30 miles. Posted on the chalkboard.'],
      ]},
    ],
  },
  {
    slug: 'vet', name: 'Northside Veterinary', tagline: 'Fear-free certified. Same-day sick visits. House calls.',
    vertical: 'Veterinary clinic — Madison, WI',
    layout: 'clinical',
    fonts: {h: 'DM Serif Display', b: 'Inter'},
    palette: {bg: '#f4f1ec', ink: '#1d1f24', accent: '#6c8d8e', muted: '#727680', card: '#ffffff'},
    nav: ['Services', 'Care team', 'New patients', 'Book'],
    hero: {kicker: 'Fear-Free Certified Practice', cta: 'Book a visit'},
    sections: [
      {title: 'For your pet', items: [
        ['Wellness exams', 'Annual + senior. Bloodwork, dental scoring, vaccinations.'],
        ['Sick visits', 'Same-day for cough, GI, urinary, ear, eye, skin.'],
        ['Dental + surgery', 'In-house digital X-ray, full dental suite, soft tissue + ortho.'],
        ['House calls', 'In-home euthanasia + senior wellness within 25 miles.'],
      ]},
      {title: 'Why Fear-Free', items: [
        ['Treats + pheromones', 'Every room has a treat jar and species-specific calming spray.'],
        ['No exam-table wrestling', 'Cats stay in their carriers. Dogs get the floor.'],
      ]},
    ],
  },
  {
    slug: 'yoga-studio', name: 'Sage & Cedar Yoga', tagline: 'Vinyasa, Yin, prenatal. Seven instructors, four studios.',
    vertical: 'Yoga studio — Boise, ID',
    layout: 'warm',
    fonts: {h: 'Cormorant Garamond', b: 'Karla'},
    palette: {bg: '#f1ece2', ink: '#1f1c16', accent: '#a47a4a', muted: '#7e776a', card: '#ffffff'},
    nav: ['Classes', 'Teachers', 'Workshops', 'New here?'],
    hero: {kicker: 'Drop-in welcome · first class free', cta: 'See this week\'s schedule'},
    sections: [
      {title: 'Class types', items: [
        ['Vinyasa flow', '60-min flowing sequence. Levels 1, 2, and 2/3 mixed.'],
        ['Yin', '75 min, long-hold floor postures. Props provided. Great for runners.'],
        ['Prenatal + postnatal', 'Saturday mornings. Certified RPYT instructors.'],
        ['Restorative', 'Sunday evenings. Bolsters, blankets, candlelight. No vinyasa.'],
      ]},
      {title: 'How to start', items: [
        ['First class free', 'Drop in for any class on us — no card required.'],
        ['Intro month', '$59 unlimited for 30 days. Renews to standard membership only if you opt in.'],
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
  html, body { margin: 0; padding: 0; background: var(--bg); color: var(--ink); }
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
`;

function makeNav(b) {
  return `<nav class="nav">
    <div class="wordmark">${b.name}</div>
    <div class="nav-links">${b.nav.map(n => `<a>${n}</a>`).join('')}</div>
    <a class="btn">${b.hero.cta}</a>
  </nav>`;
}

/* Template 1: WARM — soft cream, two-col hero with image right, two image bands */
function warm(b) {
  return `<!doctype html><html><head><meta charset="utf-8"><title>${b.name}</title>
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=${b.fonts.h.replace(/ /g,'+')}:wght@400;500;700&family=${b.fonts.b.replace(/ /g,'+')}:wght@400;500;600&display=swap" rel="stylesheet">
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
      <h1>${b.tagline.replace(/\.$/,'')}<em>.</em></h1>
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
  const isDark = ['#1c1815', '#16110d', '#0f0e14', '#0d0d0e'].includes(b.palette.bg);
  return `<!doctype html><html><head><meta charset="utf-8"><title>${b.name}</title>
<link href="https://fonts.googleapis.com/css2?family=${b.fonts.h.replace(/ /g,'+')}:ital,wght@0,400;0,500;0,700;1,400&family=${b.fonts.b.replace(/ /g,'+')}:wght@400;500;600&display=swap" rel="stylesheet">
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
<link href="https://fonts.googleapis.com/css2?family=${b.fonts.h.replace(/ /g,'+')}:wght@400;500;700&family=${b.fonts.b.replace(/ /g,'+')}:wght@400;500;600;700&display=swap" rel="stylesheet">
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
      <div class="stat-card"><div class="n">${20 + Math.floor(Math.random()*15)} yrs</div><div class="l">in practice</div></div>
    </div>
  </div>
</section>
<section class="section wrap">
  <div class="section-head">
    <h2>${b.sections[0].title}</h2>
    <p class="muted">Our team handles a wide range of cases — start by telling us what's going on.</p>
  </div>
  <div class="cards">
    ${b.sections[0].items.map(([t, d], i) => `<div class="card"><div class="icon">${i+1}</div><h3>${t}</h3><p>${d}</p></div>`).join('')}
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
  const isDark = ['#181210', '#10141a', '#0d0d0e', '#0e1418'].includes(b.palette.bg);
  return `<!doctype html><html><head><meta charset="utf-8"><title>${b.name}</title>
<link href="https://fonts.googleapis.com/css2?family=${b.fonts.h.replace(/ /g,'+')}:wght@400;700&family=${b.fonts.b.replace(/ /g,'+')}:wght@400;500;700&display=swap" rel="stylesheet">
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
      <h1>${b.name.split(/\s+/).slice(0,2).join('<br>')}<br><em>${b.name.split(/\s+/).slice(2).join(' ') || ''}</em></h1>
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
<link href="https://fonts.googleapis.com/css2?family=${b.fonts.h.replace(/ /g,'+')}:wght@400;500;700&family=${b.fonts.b.replace(/ /g,'+')}:wght@400;500;600&display=swap" rel="stylesheet">
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
  <div class="spec"><div class="l">Region</div><div class="v">${(b.vertical.split('—')[1]||'').trim() || 'Local'}</div></div>
  <div class="spec"><div class="l">Founded</div><div class="v">${b.hero.kicker.match(/(19|20)\d{2}/)?.[0] || '2014'}</div></div>
  <div class="spec"><div class="l">Hours</div><div class="v">Mon – Sat</div></div>
</div></div>
<section class="section wrap">
  <div class="section-head">
    <h2>${b.sections[0].title}</h2>
    <div class="index">01 / Services</div>
  </div>
  <div class="grid-4">
    ${b.sections[0].items.map(([t, d], i) => `<div class="grid-cell"><div class="n">${String(i+1).padStart(2,'0')}</div><h3>${t}</h3><p>${d}</p></div>`).join('')}
  </div>
</section>
<div class="image-band"><img src="img/a.jpg"><img src="img/b.jpg"></div>
<section class="section wrap">
  <div class="section-head">
    <h2>${b.sections[1].title}</h2>
    <div class="index">02 / Practice</div>
  </div>
  <div class="grid-4">
    ${b.sections[1].items.map(([t, d], i) => `<div class="grid-cell"><div class="n">${String(i+1).padStart(2,'0')}</div><h3>${t}</h3><p>${d}</p></div>`).join('')}
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

/* ------------------------------------------------------------------ */
/* Run                                                                 */
/* ------------------------------------------------------------------ */
for (const b of BUSINESSES) {
  const tpl = LAYOUTS[b.layout];
  if (!tpl) throw new Error(`unknown layout ${b.layout} for ${b.slug}`);
  const html = tpl(b);
  const dir = path.join(bizRoot, b.slug);
  fs.writeFileSync(path.join(dir, 'index.html'), html);
  console.log(`✓ ${b.slug} (${b.layout}) — ${(html.length / 1024).toFixed(1)} KB`);
}
console.log(`\nGenerated ${BUSINESSES.length} landing pages.`);

// Export for capture pipeline
fs.writeFileSync(
  path.join(bizRoot, '_businesses.json'),
  JSON.stringify(BUSINESSES.map(({slug, name, vertical, layout, palette}) => ({slug, name, vertical, layout, palette})), null, 2)
);
