import {describe, it, expect} from 'vitest';

const API_KEY = process.env.ELEVENLABS_API_KEY!;
const RUN_LIVE_INTEGRATION = ['1', 'true'].includes(
  process.env.RUN_LIVE_INTEGRATION ?? '',
);
// Skip unless explicitly requested: these tests hit the live ElevenLabs
// Convai API and depend on account-owned agent configuration.
const describeIfLive =
  RUN_LIVE_INTEGRATION && API_KEY ? describe : describe.skip;
const SARAH_ID =
  process.env.ELEVENLABS_SARAH_AGENT_ID || 'agent_7801kqqqhjmcfdsa1m2a8t9w6t5c';
const TEST_AGENT_ID = process.env.ELEVENLABS_TEST_AGENT_ID || '';
const describeIfTestAgent = TEST_AGENT_ID ? describe : describe.skip;
const WEBHOOK_URL = 'https://n8n.wranngle.com/webhook/universal-message-v1';

async function getAgentTools(agentId: string): Promise<any[]> {
  const res = await fetch(
    `https://api.elevenlabs.io/v1/convai/agents/${agentId}`,
    {headers: {'xi-api-key': API_KEY}},
  );
  if (!res.ok) {
    throw new Error(`Failed to fetch agent ${agentId}: ${res.status}`);
  }

  const agent = await res.json();
  return agent.conversation_config?.agent?.prompt?.tools || [];
}

describeIfLive('ElevenLabs Agent Tools', () => {
  describe('Sarah - Lead Specialist', () => {
    it('should have send_message tool configured', async () => {
      const tools = await getAgentTools(SARAH_ID);
      const sendMessage = tools.find((t: any) => t.name === 'send_message');
      expect(sendMessage).toBeDefined();
      expect(sendMessage.type).toBe('webhook');
    });

    it('should point send_message to universal webhook', async () => {
      const tools = await getAgentTools(SARAH_ID);
      const sendMessage = tools.find((t: any) => t.name === 'send_message');
      expect(sendMessage.api_schema.url).toBe(WEBHOOK_URL);
      expect(sendMessage.api_schema.method).toBe('POST');
    });

    it('should require phone_number and template parameters', async () => {
      const tools = await getAgentTools(SARAH_ID);
      const sendMessage = tools.find((t: any) => t.name === 'send_message');
      const schema = sendMessage.api_schema.request_body_schema;
      expect(schema.required).toContain('phone_number');
      expect(schema.required).toContain('template');
      expect(schema.properties.phone_number).toBeDefined();
      expect(schema.properties.template).toBeDefined();
      expect(schema.properties.variables).toBeDefined();
    });

    it('should have webhook auth header configured', async () => {
      const tools = await getAgentTools(SARAH_ID);
      const sendMessage = tools.find((t: any) => t.name === 'send_message');
      const headers = sendMessage.api_schema.request_headers;
      expect(headers['X-Webhook-Secret']).toBe(process.env.N8N_WEBHOOK_SECRET);
    });

    it('should have send_message instructions in system prompt', async () => {
      const res = await fetch(
        `https://api.elevenlabs.io/v1/convai/agents/${SARAH_ID}`,
        {headers: {'xi-api-key': API_KEY}},
      );
      const agent = await res.json();
      const prompt = agent.conversation_config?.agent?.prompt?.prompt || '';
      expect(prompt).toContain('send_message');
    });
  });

  describeIfTestAgent('Test Agent', () => {
    it('should have send_message tool configured', async () => {
      const tools = await getAgentTools(TEST_AGENT_ID);
      const sendMessage = tools.find((t: any) => t.name === 'send_message');
      expect(sendMessage).toBeDefined();
      expect(sendMessage.type).toBe('webhook');
    });

    it('should point send_message to universal webhook', async () => {
      const tools = await getAgentTools(TEST_AGENT_ID);
      const sendMessage = tools.find((t: any) => t.name === 'send_message');
      expect(sendMessage.api_schema.url).toBe(WEBHOOK_URL);
    });
  });
});
