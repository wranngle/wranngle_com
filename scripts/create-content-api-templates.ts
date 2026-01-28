#!/usr/bin/env bun

/**
 * Create Twilio Content API Templates for RCS Messaging
 * Creates all 10 templates with suggested actions (buttons)
 *
 * Usage: bun run scripts/create-content-api-templates.ts
 */

const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID!;
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN!;
const TWILIO_CONTENT_API = 'https://content.twilio.com/v1/Content';

interface ContentTemplate {
	friendly_name: string;
	language: string;
	variables: Record<string, string>;
	types: {
		'twilio/text': {
			body: string;
		};
		'twilio/card'?: {
			title?: string;
			subtitle?: string;
			body: string;
			actions?: Array<{
				title: string;
				type: 'URL' | 'PHONE' | 'QUICK_REPLY';
				url?: string;
				phone?: string;
				id?: string;
			}>;
		};
	};
}

const templates: ContentTemplate[] = [
	{
		friendly_name: 'wranngle_welcome',
		language: 'en',
		variables: {
			'1': 'FIRST_NAME',
			'2': 'PACKAGE',
		},
		types: {
			'twilio/text': {
				body: 'Hi {{1}}! Your {{2}} is now LIVE. Questions? wranngle.com',
			},
			'twilio/card': {
				title: 'Welcome to Wranngle',
				body: 'Hi {{1}}! Your {{2}} AI agent is now LIVE.\\n\\nOur team will call within 24 hours.',
				actions: [
					{title: 'Dashboard', type: 'URL', url: 'https://wranngle.com/dashboard'},
					{title: 'Call Support', type: 'PHONE', phone: '+15550100'},
				],
			},
		},
	},
	{
		friendly_name: 'wranngle_invoice_receipt',
		language: 'en',
		variables: {
			'1': 'AMOUNT',
			'2': 'INVOICE_ID',
		},
		types: {
			'twilio/text': {
				body: 'Wranngle: Payment of ${{1}} received for {{2}}. Thank you!',
			},
			'twilio/card': {
				title: 'Payment Confirmed',
				body: 'Amount: ${{1}}\\nInvoice: {{2}}\\n\\nThank you for your business!',
				actions: [
					{title: 'View Receipt', type: 'URL', url: 'https://wranngle.com/invoices/{{2}}'},
				],
			},
		},
	},
	{
		friendly_name: 'wranngle_notification',
		language: 'en',
		variables: {
			'1': 'EVENT_TYPE',
			'2': 'EVENT_DATA',
		},
		types: {
			'twilio/text': {
				body: '{{1}}: {{2}}',
			},
		},
	},
	{
		friendly_name: 'wranngle_password_reset',
		language: 'en',
		variables: {
			'1': 'RESET_URL',
			'2': 'EXPIRY_TIME',
		},
		types: {
			'twilio/text': {
				body: 'Reset your password: {{1}}. Expires in {{2}}.',
			},
			'twilio/card': {
				title: 'Password Reset Request',
				body: 'Click below to reset your password.\\n\\nExpires in {{2}}.',
				actions: [
					{title: 'Reset Password', type: 'URL', url: '{{1}}'},
				],
			},
		},
	},
	{
		friendly_name: 'wranngle_lead_intake',
		language: 'en',
		variables: {
			'1': 'BUSINESS_NAME',
			'2': 'INDUSTRY',
			'3': 'OWNER_NAME',
			'4': 'PHONE',
		},
		types: {
			'twilio/text': {
				body: 'New lead: {{1}} ({{2}}) - {{3}}, {{4}}',
			},
		},
	},
	{
		friendly_name: 'wranngle_sales_cold_outreach',
		language: 'en',
		variables: {
			'1': 'FIRST_NAME',
			'2': 'COMPANY',
			'3': 'REP_NAME',
		},
		types: {
			'twilio/text': {
				body: 'Hi {{1}}! {{3}} noticed {{2}} could benefit from Wranngle. Demo? wranngle.com',
			},
			'twilio/card': {
				title: 'Grow Your Business',
				body: 'Hi {{1}}!\\n\\n{{3}} noticed {{2}} could benefit from 24/7 AI agents.\\n\\nInterested in a demo?',
				actions: [
					{title: 'Schedule Demo', type: 'URL', url: 'https://wranngle.com/demo'},
					{title: 'Learn More', type: 'URL', url: 'https://wranngle.com'},
				],
			},
		},
	},
	{
		friendly_name: 'wranngle_sales_demo_followup',
		language: 'en',
		variables: {
			'1': 'FIRST_NAME',
			'2': 'REP_EMAIL',
		},
		types: {
			'twilio/text': {
				body: 'Hi {{1}}! Thanks for the demo. Questions? {{2}}',
			},
			'twilio/card': {
				title: 'Thanks for the Demo!',
				body: 'Hi {{1}}!\\n\\nQuestions? Reply or email {{2}}',
				actions: [
					{title: 'Get Started', type: 'URL', url: 'https://wranngle.com/signup'},
					{title: 'Call Us', type: 'PHONE', phone: '+15550100'},
				],
			},
		},
	},
	{
		friendly_name: 'wranngle_sales_proposal_sent',
		language: 'en',
		variables: {
			'1': 'FIRST_NAME',
			'2': 'PACKAGE',
			'3': 'PRICE',
		},
		types: {
			'twilio/text': {
				body: 'Hi {{1}}! Your {{2}} proposal (${{3}}) is ready. Review at wranngle.com',
			},
			'twilio/card': {
				title: 'Proposal Ready',
				body: 'Hi {{1}}!\\n\\nYour {{2}} proposal (${{3}}) is ready for review.',
				actions: [
					{title: 'View Proposal', type: 'URL', url: 'https://wranngle.com/proposals'},
					{title: 'Questions?', type: 'PHONE', phone: '+15550100'},
				],
			},
		},
	},
	{
		friendly_name: 'wranngle_sales_quote_followup',
		language: 'en',
		variables: {
			'1': 'FIRST_NAME',
			'2': 'QUOTE_ID',
			'3': 'REP_NAME',
		},
		types: {
			'twilio/text': {
				body: 'Hi {{1}}! Following up on quote {{2}}. Questions? {{3}} is here to help.',
			},
			'twilio/card': {
				title: 'Quote Follow-Up',
				body: 'Hi {{1}}!\\n\\nFollowing up on quote {{2}}.\\n\\n{{3}} is here to help!',
				actions: [
					{title: 'View Quote', type: 'URL', url: 'https://wranngle.com/quotes/{{2}}'},
					{title: 'Accept Quote', type: 'URL', url: 'https://wranngle.com/quotes/{{2}}/accept'},
				],
			},
		},
	},
	{
		friendly_name: 'wranngle_sales_winback',
		language: 'en',
		variables: {
			'1': 'FIRST_NAME',
			'2': 'NEW_FEATURE_1',
			'3': 'NEW_FEATURE_2',
		},
		types: {
			'twilio/text': {
				body: "Hi {{1}}! We've added {{2}} and {{3}}. Come back? wranngle.com",
			},
			'twilio/card': {
				title: 'We Miss You!',
				body: "Hi {{1}}!\\n\\nNew features:\\n• {{2}}\\n• {{3}}\\n\\nCome back and see what's new!",
				actions: [
					{title: 'Reactivate', type: 'URL', url: 'https://wranngle.com/reactivate'},
					{title: 'Learn More', type: 'URL', url: 'https://wranngle.com/features'},
				],
			},
		},
	},
];

async function createContentTemplate(
	template: ContentTemplate,
): Promise<{contentSid?: string; error?: string}> {
	try {
		const response = await fetch(TWILIO_CONTENT_API, {
			method: 'POST',
			headers: {
				Authorization:
					'Basic ' +
					Buffer.from(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`).toString(
						'base64',
					),
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(template),
		});

		if (!response.ok) {
			const error = await response.json();
			return {error: error.message || response.statusText};
		}

		const data = await response.json();
		return {contentSid: data.sid};
	} catch (error) {
		return {error: error instanceof Error ? error.message : 'Unknown error'};
	}
}

async function main() {
	console.log('🎨 Creating Twilio Content API Templates...');
	console.log('');

	const results: Array<{
		name: string;
		contentSid?: string;
		error?: string;
	}> = [];

	for (const template of templates) {
		console.log(`📝 Creating: ${template.friendly_name}...`);
		const result = await createContentTemplate(template);

		if (result.contentSid) {
			console.log(`   ✅ Created: ${result.contentSid}`);
			results.push({name: template.friendly_name, contentSid: result.contentSid});
		} else {
			console.log(`   ❌ Failed: ${result.error}`);
			results.push({name: template.friendly_name, error: result.error});
		}

		// Rate limit: wait 500ms between requests
		await new Promise((resolve) => setTimeout(resolve, 500));
	}

	console.log('');
	console.log('='.repeat(60));
	console.log('📊 SUMMARY');
	console.log('='.repeat(60));

	const successful = results.filter((r) => r.contentSid);
	const failed = results.filter((r) => r.error);

	console.log(`✅ Created: ${successful.length}/${results.length}`);
	console.log(`❌ Failed: ${failed.length}/${results.length}`);

	if (successful.length > 0) {
		console.log('');
		console.log('✅ CREATED TEMPLATES:');
		for (const result of successful) {
			console.log(`   • ${result.name.padEnd(40)} ${result.contentSid}`);
		}
	}

	if (failed.length > 0) {
		console.log('');
		console.log('❌ FAILED TEMPLATES:');
		for (const result of failed) {
			console.log(`   • ${result.name.padEnd(40)} ${result.error}`);
		}
	}

	console.log('');
	console.log('📋 NEXT STEPS:');
	console.log('1. Wait for Twilio to review templates (may require approval)');
	console.log('2. Update n8n workflow to use ContentSid parameter');
	console.log('3. Test RCS messages with suggested actions');

	process.exit(failed.length > 0 ? 1 : 0);
}

main().catch((error) => {
	console.error('❌ Fatal error:', error);
	process.exit(1);
});
