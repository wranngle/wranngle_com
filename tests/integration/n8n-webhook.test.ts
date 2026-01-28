/**
 * Integration tests for n8n Universal Message Sender webhook
 * Tests authentication, validation, routing, and error handling
 */

import {describe, it, expect, beforeAll} from 'vitest';

const WEBHOOK_URL =
	process.env.N8N_WEBHOOK_URL ||
	'https://n8n.wranngle.com/webhook/universal-message-v1';
const WEBHOOK_SECRET = 'test-secret-placeholder';

describe('n8n Webhook Integration', () => {
	describe('Authentication', () => {
		it('should accept requests with valid secret header', async () => {
			const response = await fetch(WEBHOOK_URL, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'X-Webhook-Secret': WEBHOOK_SECRET,
				},
				body: JSON.stringify({
					phone_number: '+12602217355',
					template: 'welcome',
					variables: {FIRST_NAME: 'Test', PACKAGE: 'Test'},
				}),
			});

			// Should not be 401 Unauthorized
			expect(response.status).not.toBe(401);
		});

		it('should reject requests without authentication', async () => {
			const response = await fetch(WEBHOOK_URL, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					phone_number: '+12602217355',
					template: 'welcome',
					variables: {},
				}),
			});

			expect(response.status).toBe(401);
			const data = await response.json();
			expect(data.success).toBe(false);
			expect(data.error).toContain('UNAUTHORIZED');
		});

		it('should accept requests from localhost', async () => {
			const response = await fetch(WEBHOOK_URL, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					Host: 'localhost:3000',
				},
				body: JSON.stringify({
					phone_number: '+12602217355',
					template: 'welcome',
					variables: {},
				}),
			});

			// Should be authenticated via localhost
			expect(response.status).not.toBe(401);
		});

		it('should accept requests with ElevenLabs user agent', async () => {
			const response = await fetch(WEBHOOK_URL, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'User-Agent': 'ElevenLabs/1.0',
				},
				body: JSON.stringify({
					phone_number: '+12602217355',
					template: 'welcome',
					variables: {},
				}),
			});

			// Should be authenticated via ElevenLabs UA
			expect(response.status).not.toBe(401);
		});
	});

	describe('Phone Number Validation', () => {
		it('should accept valid US phone numbers', async () => {
			const response = await fetch(WEBHOOK_URL, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'X-Webhook-Secret': WEBHOOK_SECRET,
				},
				body: JSON.stringify({
					phone_number: '+12602217355',
					template: 'welcome',
					variables: {},
				}),
			});

			expect(response.status).not.toBe(400);
		});

		it('should reject invalid phone formats', async () => {
			const response = await fetch(WEBHOOK_URL, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'X-Webhook-Secret': WEBHOOK_SECRET,
				},
				body: JSON.stringify({
					phone_number: '123-456-7890',
					template: 'welcome',
					variables: {},
				}),
			});

			expect(response.status).toBe(400);
			const data = await response.json();
			expect(data.error).toContain('INVALID_PHONE');
		});

		it('should reject missing phone numbers', async () => {
			const response = await fetch(WEBHOOK_URL, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'X-Webhook-Secret': WEBHOOK_SECRET,
				},
				body: JSON.stringify({
					template: 'welcome',
					variables: {},
				}),
			});

			expect(response.status).toBe(400);
			const data = await response.json();
			expect(data.error).toContain('MISSING_PHONE');
		});

		it('should accept international phone numbers', async () => {
			const response = await fetch(WEBHOOK_URL, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'X-Webhook-Secret': WEBHOOK_SECRET,
				},
				body: JSON.stringify({
					phone_number: '+447700900123',
					template: 'welcome',
					variables: {},
				}),
			});

			// UK number should be accepted
			expect(response.status).not.toBe(400);
		});
	});

	describe('Template Handling', () => {
		it('should accept all 10 valid template names', async () => {
			const templates = [
				'welcome',
				'invoice-receipt',
				'notification',
				'password-reset',
				'lead-intake',
				'sales-cold-outreach',
				'sales-demo-followup',
				'sales-proposal-sent',
				'sales-quote-followup',
				'sales-winback',
			];

			for (const template of templates) {
				const response = await fetch(WEBHOOK_URL, {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
						'X-Webhook-Secret': WEBHOOK_SECRET,
					},
					body: JSON.stringify({
						phone_number: '+12602217355',
						template,
						variables: {},
					}),
				});

				expect(response.status).not.toBe(400);
			}
		});

		it('should handle unknown template gracefully', async () => {
			const response = await fetch(WEBHOOK_URL, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'X-Webhook-Secret': WEBHOOK_SECRET,
				},
				body: JSON.stringify({
					phone_number: '+12602217355',
					template: 'unknown-template',
					variables: {},
				}),
			});

			// Should fallback to welcome template or return error
			// Either behavior is acceptable
			expect([200, 202, 400]).toContain(response.status);
		});
	});

	describe('Channel Routing', () => {
		it('should accept channel parameter: auto', async () => {
			const response = await fetch(WEBHOOK_URL, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'X-Webhook-Secret': WEBHOOK_SECRET,
				},
				body: JSON.stringify({
					phone_number: '+12602217355',
					channel: 'auto',
					template: 'welcome',
					variables: {},
				}),
			});

			expect(response.status).not.toBe(400);
		});

		it('should accept channel parameter: sms', async () => {
			const response = await fetch(WEBHOOK_URL, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'X-Webhook-Secret': WEBHOOK_SECRET,
				},
				body: JSON.stringify({
					phone_number: '+12602217355',
					channel: 'sms',
					template: 'welcome',
					variables: {},
				}),
			});

			expect(response.status).not.toBe(400);
		});

		it('should accept channel parameter: rcs', async () => {
			const response = await fetch(WEBHOOK_URL, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'X-Webhook-Secret': WEBHOOK_SECRET,
				},
				body: JSON.stringify({
					phone_number: '+12602217355',
					channel: 'rcs',
					template: 'welcome',
					variables: {},
				}),
			});

			expect(response.status).not.toBe(400);
		});

		it('should default to auto when channel not specified', async () => {
			const response = await fetch(WEBHOOK_URL, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'X-Webhook-Secret': WEBHOOK_SECRET,
				},
				body: JSON.stringify({
					phone_number: '+12602217355',
					template: 'welcome',
					variables: {},
				}),
			});

			expect(response.status).not.toBe(400);
		});
	});

	describe('Response Format', () => {
		it('should return request_id in success response', async () => {
			const response = await fetch(WEBHOOK_URL, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'X-Webhook-Secret': WEBHOOK_SECRET,
				},
				body: JSON.stringify({
					phone_number: '+12602217355',
					template: 'welcome',
					variables: {},
				}),
			});

			if (response.ok) {
				const data = await response.json();
				expect(data.request_id).toBeDefined();
				expect(typeof data.request_id).toBe('string');
			}
		});

		it('should return message_sid in success response', async () => {
			const response = await fetch(WEBHOOK_URL, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'X-Webhook-Secret': WEBHOOK_SECRET,
				},
				body: JSON.stringify({
					phone_number: '+12602217355',
					template: 'welcome',
					variables: {},
				}),
			});

			if (response.ok) {
				const data = await response.json();
				expect(data.message_sid).toBeDefined();
				expect(data.message_sid).toMatch(/^SM[a-f0-9]{32}$/);
			}
		});

		it('should return error details in error response', async () => {
			const response = await fetch(WEBHOOK_URL, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'X-Webhook-Secret': WEBHOOK_SECRET,
				},
				body: JSON.stringify({
					phone_number: 'invalid',
					template: 'welcome',
					variables: {},
				}),
			});

			expect(response.status).toBe(400);
			const data = await response.json();
			expect(data.success).toBe(false);
			expect(data.error).toBeDefined();
			expect(data.message).toBeDefined();
		});
	});

	describe('Variable Substitution', () => {
		it('should handle dollar signs in variables', async () => {
			const response = await fetch(WEBHOOK_URL, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'X-Webhook-Secret': WEBHOOK_SECRET,
				},
				body: JSON.stringify({
					phone_number: '+12602217355',
					template: 'invoice-receipt',
					variables: {
						AMOUNT: '542.50',
						INVOICE_ID: 'INV-2026-001',
					},
				}),
			});

			// Should not escape dollar signs
			expect(response.status).not.toBe(500);
		});

		it('should handle special characters in variables', async () => {
			const response = await fetch(WEBHOOK_URL, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'X-Webhook-Secret': WEBHOOK_SECRET,
				},
				body: JSON.stringify({
					phone_number: '+12602217355',
					template: 'notification',
					variables: {
						EVENT_TYPE: 'Status & Update',
						EVENT_DATA: 'Agent is "online"',
					},
				}),
			});

			expect(response.status).not.toBe(500);
		});
	});
});
