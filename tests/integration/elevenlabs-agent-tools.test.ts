import {describe, it, expect} from 'vitest';

const API_KEY = process.env.ELEVENLABS_API_KEY!;
const SARAH_ID = 'agent_8001kdgp7qbyf4wvhs540be78vew';
const TEST_AGENT_ID = 'agent_3801kdf7fkhcev8tkhpm92d65jws';
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

describe('ElevenLabs Agent Tools', () => {
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

	describe('Test Agent', () => {
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
