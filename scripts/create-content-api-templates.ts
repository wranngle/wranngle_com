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

interface CardAction {
	title: string;
	type: 'URL' | 'PHONE_NUMBER' | 'QUICK_REPLY';
	url?: string;
	phone?: string;
	id?: string;
}

interface CarouselCard {
	title: string;
	body: string;
	media: string;
	actions: CardAction[];
}

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
			media?: string[];
			orientation?: 'VERTICAL' | 'HORIZONTAL';
			actions?: CardAction[];
		};
		'twilio/carousel'?: {
			body: string;
			cards: CarouselCard[];
		};
	};
}

// Publicly hosted brand assets for RCS media
const MEDIA = {
	hero: 'https://wranngle.com/assets/rcs/hero-welcome.png',
	logo: 'https://wranngle.com/assets/rcs/logo-card.png',
	notification: 'https://wranngle.com/assets/rcs/notification-alert.png',
	receipt: 'https://wranngle.com/assets/rcs/receipt-confirmed.png',
	security: 'https://wranngle.com/assets/rcs/security-shield.png',
	demo: 'https://wranngle.com/assets/rcs/demo-preview.png',
	aiAgents: 'https://wranngle.com/assets/rcs/ai-agents.png',
	analytics: 'https://wranngle.com/assets/rcs/analytics-dashboard.png',
	integrations: 'https://wranngle.com/assets/rcs/integrations.png',
	proposal: 'https://wranngle.com/assets/rcs/proposal-ready.png',
	followup: 'https://wranngle.com/assets/rcs/followup.png',
	winback: 'https://wranngle.com/assets/rcs/winback-offer.png',
};

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
				body: 'Hi {{1}}! Your {{2}} AI agent is now LIVE.\n\nOur team will call within 24 hours to customize your knowledge base.',
				media: [MEDIA.hero],
				orientation: 'VERTICAL',
				actions: [
					{title: 'Dashboard', type: 'URL', url: 'https://wranngle.com/dashboard'},
					{title: 'Call Support', type: 'PHONE_NUMBER', phone: '+15550100'},
					{title: 'Get Started', type: 'QUICK_REPLY', id: 'welcome_get_started'},
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
				body: 'Amount: ${{1}}\nInvoice: {{2}}\n\nThank you for your business!',
				media: [MEDIA.receipt],
				orientation: 'HORIZONTAL',
				actions: [
					{title: 'View Receipt', type: 'URL', url: 'https://wranngle.com/invoices/{{2}}'},
					{title: 'Call Billing', type: 'PHONE_NUMBER', phone: '+15550100'},
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
			'twilio/card': {
				title: '{{1}}',
				body: '{{2}}',
				media: [MEDIA.notification],
				orientation: 'HORIZONTAL',
				actions: [
					{title: 'View Details', type: 'URL', url: 'https://wranngle.com/dashboard'},
				],
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
				body: 'Click below to reset your password.\n\nExpires in {{2}}.',
				media: [MEDIA.security],
				orientation: 'HORIZONTAL',
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
			'twilio/card': {
				title: 'New Lead Captured',
				body: 'Business: {{1}}\nIndustry: {{2}}\nContact: {{3}}\nPhone: {{4}}',
				media: [MEDIA.logo],
				orientation: 'HORIZONTAL',
				actions: [
					{title: 'View in CRM', type: 'URL', url: 'https://wranngle.com/leads'},
					{title: 'View Details', type: 'URL', url: 'https://wranngle.com/leads'},
				],
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
			'twilio/carousel': {
				body: 'Hi {{1}}, see how Wranngle helps businesses like {{2}}:',
				cards: [
					{
						title: '24/7 AI Agents',
						body: 'Never miss a call. Our AI answers, qualifies leads, and books appointments around the clock.',
						media: MEDIA.aiAgents,
						actions: [
							{title: 'Schedule Demo', type: 'URL', url: 'https://wranngle.com/demo'},
							{title: 'Interested', type: 'QUICK_REPLY', id: 'cold_interested'},
						],
					},
					{
						title: 'Analytics Dashboard',
						body: 'See every call, lead, and conversion in real time. Know exactly what your AI agent is doing.',
						media: MEDIA.analytics,
						actions: [
							{title: 'Schedule Demo', type: 'URL', url: 'https://wranngle.com/demo'},
							{title: 'Interested', type: 'QUICK_REPLY', id: 'cold_analytics'},
						],
					},
					{
						title: 'Easy Integrations',
						body: 'Connect to your CRM, calendar, and phone system in minutes. No coding required.',
						media: MEDIA.integrations,
						actions: [
							{title: 'Schedule Demo', type: 'URL', url: 'https://wranngle.com/demo'},
							{title: 'Interested', type: 'QUICK_REPLY', id: 'cold_integrations'},
						],
					},
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
				body: 'Hi {{1}}!\n\nIt was great showing you Wranngle. Questions? Reply or email {{2}}',
				media: [MEDIA.followup],
				orientation: 'VERTICAL',
				actions: [
					{title: 'Get Started', type: 'URL', url: 'https://wranngle.com/signup'},
					{title: 'Call Us', type: 'PHONE_NUMBER', phone: '+15550100'},
					{title: 'Ready to Buy', type: 'QUICK_REPLY', id: 'demo_ready'},
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
				body: 'Hi {{1}}!\n\nPackage: {{2}}\nPrice: ${{3}}/month\n\nReview and accept your proposal below.',
				media: [MEDIA.proposal],
				orientation: 'VERTICAL',
				actions: [
					{title: 'View Proposal', type: 'URL', url: 'https://wranngle.com/proposals'},
					{title: 'Accept', type: 'QUICK_REPLY', id: 'proposal_accept'},
					{title: 'Questions?', type: 'PHONE_NUMBER', phone: '+15550100'},
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
				body: 'Hi {{1}}!\n\nFollowing up on quote {{2}}.\n\n{{3}} is here to help!',
				media: [MEDIA.followup],
				orientation: 'HORIZONTAL',
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
			'twilio/carousel': {
				body: "Hi {{1}}, a lot has changed at Wranngle!",
				cards: [
					{
						title: '{{2}}',
						body: 'Our newest capability, built based on feedback from businesses like yours.',
						media: MEDIA.aiAgents,
						actions: [
							{title: 'Reactivate', type: 'URL', url: 'https://wranngle.com/reactivate'},
							{title: 'Tell Me More', type: 'QUICK_REPLY', id: 'winback_feature1'},
						],
					},
					{
						title: '{{3}}',
						body: 'Another major upgrade to help you grow faster and serve customers better.',
						media: MEDIA.integrations,
						actions: [
							{title: 'Reactivate', type: 'URL', url: 'https://wranngle.com/reactivate'},
							{title: 'Tell Me More', type: 'QUICK_REPLY', id: 'winback_feature2'},
						],
					},
					{
						title: 'Special Offer',
						body: 'Come back and get a special deal. Limited time only.',
						media: MEDIA.winback,
						actions: [
							{title: 'Reactivate', type: 'URL', url: 'https://wranngle.com/reactivate'},
							{title: 'Tell Me More', type: 'QUICK_REPLY', id: 'winback_offer'},
						],
					},
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
