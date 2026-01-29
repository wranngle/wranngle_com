/**
 * E2E tests for message delivery
 * Tests actual message sending and Twilio delivery verification
 */

import {describe, it, expect} from 'vitest';

const WEBHOOK_URL =
	process.env.N8N_WEBHOOK_URL ||
	'https://n8n.wranngle.com/webhook/universal-message-v1';
const WEBHOOK_SECRET = 'test-secret-placeholder';
const TEST_PHONE = process.env.TEST_PHONE_NUMBER || '+12602217355';
const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID ?? '';
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN ?? '';
const hasCredentials = Boolean(TWILIO_ACCOUNT_SID && TWILIO_AUTH_TOKEN);

interface TestCase {
	template: string;
	variables: Record<string, string>;
	expectedInBody: string[];
}

const TEST_CASES: TestCase[] = [
	{
		template: 'welcome',
		variables: {FIRST_NAME: 'Test', PACKAGE: 'Vitest'},
		expectedInBody: ['Test', 'Vitest', 'LIVE'],
	},
	{
		template: 'invoice-receipt',
		variables: {AMOUNT: '99.99', INVOICE_ID: 'TEST-001'},
		expectedInBody: ['$99.99', 'TEST-001'],
	},
	{
		template: 'notification',
		variables: {EVENT_TYPE: 'Test Event', EVENT_DATA: 'Test Data'},
		expectedInBody: ['Test Event', 'Test Data'],
	},
	{
		template: 'password-reset',
		variables: {
			RESET_URL: 'https://wranngle.com/reset/test',
			EXPIRY_TIME: '5 minutes',
		},
		expectedInBody: ['reset/test', '5 minutes'],
	},
	{
		template: 'lead-intake',
		variables: {
			BUSINESS_NAME: 'Test Co',
			INDUSTRY: 'Testing',
			OWNER_NAME: 'Tester',
			PHONE: '+15551234567',
		},
		expectedInBody: ['Test Co', 'Testing', 'Tester'],
	},
	{
		template: 'sales-cold-outreach',
		variables: {
			FIRST_NAME: 'Prospect',
			COMPANY: 'ProCo',
			REP_NAME: 'Sales Rep',
		},
		expectedInBody: ['Prospect', 'ProCo', 'Sales Rep'],
	},
	{
		template: 'sales-demo-followup',
		variables: {FIRST_NAME: 'Demo', REP_EMAIL: 'test@wranngle.com'},
		expectedInBody: ['Demo', 'test@wranngle.com'],
	},
	{
		template: 'sales-proposal-sent',
		variables: {FIRST_NAME: 'Client', PACKAGE: 'Pro', PRICE: '299'},
		expectedInBody: ['Client', 'Pro', '$299'],
	},
	{
		template: 'sales-quote-followup',
		variables: {FIRST_NAME: 'Quote', QUOTE_ID: 'Q-TEST', REP_NAME: 'Rep'},
		expectedInBody: ['Quote', 'Q-TEST', 'Rep'],
	},
	{
		template: 'sales-winback',
		variables: {
			FIRST_NAME: 'Former',
			NEW_FEATURE_1: 'Feature A',
			NEW_FEATURE_2: 'Feature B',
		},
		expectedInBody: ['Former', 'Feature A', 'Feature B'],
	},
];

async function sendMessage(
	template: string,
	variables: Record<string, string>,
): Promise<{messageSid?: string; error?: string}> {
	const response = await fetch(WEBHOOK_URL, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			'X-Webhook-Secret': WEBHOOK_SECRET,
		},
		body: JSON.stringify({
			phone_number: TEST_PHONE,
			channel: 'auto',
			template,
			variables,
		}),
	});

	if (!response.ok) {
		const data = await response.json();
		return {error: data.message || data.error || 'Unknown error'};
	}

	const data = await response.json();
	return {messageSid: data.message_sid};
}

async function verifyDelivery(
	messageSid: string,
): Promise<{
	status: string;
	body: string;
	from: string;
}> {
	// Wait 2 seconds for Twilio to process
	await new Promise((resolve) => setTimeout(resolve, 2000));

	const auth = Buffer.from(
		`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`,
	).toString('base64');
	const response = await fetch(
		`https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages/${messageSid}.json`,
		{
			headers: {
				Authorization: `Basic ${auth}`,
			},
		},
	);

	if (!response.ok) {
		throw new Error(`Failed to fetch message status: ${response.statusText}`);
	}

	const data = await response.json();
	return {
		status: data.status,
		body: data.body,
		from: data.from,
	};
}

describe.skipIf(!hasCredentials)('E2E Message Delivery', () => {
	describe('Template Delivery', () => {
		it.skip('should send and deliver all 10 templates', async () => {
			// Skip in CI to avoid spamming test phone
			const results = [];

			for (const testCase of TEST_CASES) {
				console.log(`\n📤 Testing: ${testCase.template}`);

				const result = await sendMessage(testCase.template, testCase.variables);

				if (result.error) {
					console.log(`   ❌ Send failed: ${result.error}`);
					results.push({template: testCase.template, success: false});
					continue;
				}

				console.log(`   ✅ Sent: ${result.messageSid}`);

				const delivery = await verifyDelivery(result.messageSid!);
				console.log(`   📊 Status: ${delivery.status}`);

				// Verify content
				for (const expected of testCase.expectedInBody) {
					expect(delivery.body).toContain(expected);
				}

				expect(['delivered', 'sent', 'accepted']).toContain(delivery.status);

				results.push({template: testCase.template, success: true});

				// Rate limit
				await new Promise((resolve) => setTimeout(resolve, 1000));
			}

			const successful = results.filter((r) => r.success).length;
			expect(successful).toBe(TEST_CASES.length);
		}, 120_000); // 2 minute timeout
	});

	describe('Dollar Sign Escaping', () => {
		it('should not escape dollar signs in message body', async () => {
			const result = await sendMessage('invoice-receipt', {
				AMOUNT: '542.50',
				INVOICE_ID: 'TEST-ESCAPE',
			});

			expect(result.messageSid).toBeDefined();

			if (result.messageSid) {
				const delivery = await verifyDelivery(result.messageSid);

				// Should contain $542.50, NOT \$542.50
				expect(delivery.body).toContain('$542.50');
				expect(delivery.body).not.toContain('\\$');
			}
		});
	});

	describe('SMS Fallback', () => {
		it('should fallback to SMS when RCS unavailable', async () => {
			const result = await sendMessage('welcome', {
				FIRST_NAME: 'Fallback',
				PACKAGE: 'Test',
			});

			expect(result.messageSid).toBeDefined();

			if (result.messageSid) {
				const delivery = await verifyDelivery(result.messageSid);

				// Should be delivered via SMS (phone number, not RCS sender)
				expect(delivery.from).toMatch(/^\+\d+$/);
				expect(delivery.status).toMatch(/delivered|sent|accepted/);
			}
		});
	});

	describe('Delivery Status', () => {
		it('should confirm message delivered successfully', async () => {
			const result = await sendMessage('notification', {
				EVENT_TYPE: 'E2E Test',
				EVENT_DATA: 'Delivery verification',
			});

			expect(result.messageSid).toBeDefined();

			if (result.messageSid) {
				const delivery = await verifyDelivery(result.messageSid);

				expect(['delivered', 'sent', 'accepted']).toContain(delivery.status);
				expect(delivery.body).toContain('E2E Test');
			}
		});
	});

	describe('Variable Substitution', () => {
		it('should substitute all variables correctly', async () => {
			const result = await sendMessage('sales-proposal-sent', {
				FIRST_NAME: 'VariableTest',
				PACKAGE: 'TestPackage',
				PRICE: '123.45',
			});

			expect(result.messageSid).toBeDefined();

			if (result.messageSid) {
				const delivery = await verifyDelivery(result.messageSid);

				expect(delivery.body).toContain('VariableTest');
				expect(delivery.body).toContain('TestPackage');
				expect(delivery.body).toContain('$123.45');
			}
		});
	});
});
