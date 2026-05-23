/**
 * Create (idempotently) the three per-vertical ElevenLabs agents that back the
 * hero-demo landing pages. Cloud is the source of truth for agents; this script
 * is the deterministic provisioner and writes a snapshot to
 * demo-stages/agents.json (snapshot only — never hand-edited as source).
 *
 * Run: bun run script/create-hero-agents.ts
 * Requires ELEVENLABS_API_KEY (sourced from ~/.agents/.env or the environment).
 */
import {writeFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {dirname, join} from 'node:path';

const API = 'https://api.elevenlabs.io/v1/convai/agents';
const VOICE_BELLA = 'EXAVITQu4vr4xnSDxMaL'; // Sarah-class warm female (Bella)
const VOICE_CALM = 'pFZP5JQG7iQjIQuC4Bku'; // Lily — calm, the prod Sarah voice
const VOICE_BRIGHT = 'XB0fDUnXU5powFXDhCwa'; // Charlotte — bright, upbeat

type AgentSpec = {
  id: string;
  brand: string;
  tagline: string;
  name: string;
  voiceId: string;
  firstMessage: string;
  prompt: string;
};

const SPECS: AgentSpec[] = [
  {
    id: 'trattoria',
    brand: 'Bella Vista Trattoria',
    tagline: 'Reservations · Private dining · Patio season',
    name: 'wranngle-demo - Bella Vista Trattoria host',
    voiceId: VOICE_BELLA,
    firstMessage:
      "Buonasera, thanks for calling Bella Vista Trattoria. I'm Gia — would you like to book a table?",
    prompt:
      'You are Gia, the front-of-house host for Bella Vista Trattoria, an upscale-casual Italian restaurant. Handle reservations, party size, patio vs. dining-room seating, and private-event inquiries. Be warm, concise, and decisive — confirm the booking in one or two short sentences and offer a confirmation text. Never invent menu prices. Keep replies under 30 words.',
  },
  {
    id: 'dental',
    brand: 'Tidewater Family Dental',
    tagline: 'Cleanings · Whitening · Emergency same-day',
    name: 'wranngle-demo - Tidewater Family Dental front desk',
    voiceId: VOICE_CALM,
    firstMessage:
      'Thank you for calling Tidewater Family Dental, this is Maya. Are you booking a visit or is this an emergency?',
    prompt:
      'You are Maya, the front-desk coordinator for Tidewater Family Dental. Triage emergencies (cracked filling, pain, swelling) to same-day slots, otherwise book cleanings, whitening, and checkups. Confirm whether insurance is on file. Be calm, reassuring, and efficient — propose a specific provider and time, then confirm. Keep replies under 30 words.',
  },
  {
    id: 'salon',
    brand: 'Atlas Hair Co.',
    tagline: 'Color · Cuts · Bridal · Walk-in friendly',
    name: 'wranngle-demo - Atlas Hair Co. booking',
    voiceId: VOICE_BRIGHT,
    firstMessage:
      "Hey, you've reached Atlas Hair Co., this is Robin! Looking to book, reschedule, or check on color?",
    prompt:
      'You are Robin, the booking voice for Atlas Hair Co., a modern hair studio. Handle new bookings, reschedules, and color-formula continuity ("same as last time"). Match stylists to services (balayage, cut, bridal). Be upbeat and quick — offer a specific stylist and time, confirm the change. Keep replies under 30 words.',
  },
];

function apiKey(): string {
  const key = process.env.ELEVENLABS_API_KEY;
  if (!key) throw new Error('ELEVENLABS_API_KEY not set');
  return key;
}

async function listExisting(key: string): Promise<Map<string, string>> {
  const res = await fetch(`${API}?page_size=100`, {
    headers: {'xi-api-key': key},
  });
  if (!res.ok) throw new Error(`list agents failed: ${res.status}`);
  const data = (await res.json()) as {
    agents: Array<{agent_id: string; name: string}>;
  };
  return new Map(data.agents.map((a) => [a.name, a.agent_id]));
}

async function createAgent(key: string, spec: AgentSpec): Promise<string> {
  const body = {
    name: spec.name,
    conversation_config: {
      agent: {
        first_message: spec.firstMessage,
        language: 'en',
        prompt: {prompt: spec.prompt, llm: 'gemini-2.5-flash'},
      },
      tts: {voice_id: spec.voiceId},
    },
    // Allow the widget to open in text-only chat mode for deterministic recording.
    platform_settings: {
      overrides: {
        conversation_config_override: {
          conversation: {text_only: true},
        },
      },
    },
    tags: ['wranngle-demo', 'hero-carousel'],
  };
  const res = await fetch(`${API}/create`, {
    method: 'POST',
    headers: {'xi-api-key': key, 'content-type': 'application/json'},
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    throw new Error(
      `create ${spec.id} failed: ${res.status} ${await res.text()}`,
    );
  }

  const data = (await res.json()) as {agent_id: string};
  return data.agent_id;
}

async function main() {
  const key = apiKey();
  const existing = await listExisting(key);
  const out: Array<{
    id: string;
    brand: string;
    tagline: string;
    agentId: string;
  }> = [];
  for (const spec of SPECS) {
    const found = existing.get(spec.name);
    const agentId = found ?? (await createAgent(key, spec));
    console.log(`${found ? 'reuse' : 'create'} ${spec.id} -> ${agentId}`);
    out.push({id: spec.id, brand: spec.brand, tagline: spec.tagline, agentId});
  }

  const here = dirname(fileURLToPath(import.meta.url));
  const snapshotPath = join(here, '..', 'demo-stages', 'agents.json');
  await writeFile(snapshotPath, `${JSON.stringify(out, null, 2)}\n`);
  console.log(`snapshot -> ${snapshotPath}`);
}

await main();
