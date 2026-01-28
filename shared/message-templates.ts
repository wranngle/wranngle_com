/**
 * Message template definitions for Universal Message Sender
 * Matches n8n workflow templates
 */

export type TemplateId =
	| 'welcome'
	| 'invoice-receipt'
	| 'notification'
	| 'password-reset'
	| 'lead-intake'
	| 'sales-cold-outreach'
	| 'sales-demo-followup'
	| 'sales-proposal-sent'
	| 'sales-quote-followup'
	| 'sales-winback';

export type TemplateVariables = Record<string, string | number>;

export interface MessageTemplate {
	id: TemplateId;
	name: string;
	category: 'transactional' | 'marketing' | 'sales' | 'internal';
	requiredVariables: string[];
	smsBody: string;
	rcsBody?: string;
}

/**
 * Build message body from template and variables
 */
/**
 * Helper to get variable value with fallback (handles empty strings)
 */
function getVar(variables: TemplateVariables, key: string, fallback: string): string {
	const value = variables[key];
	return value !== undefined && value !== null && value !== '' ? String(value) : fallback;
}

export function buildMessageBody(
	templateId: TemplateId,
	variables: TemplateVariables = {},
): string {
	const templates: Record<TemplateId, string> = {
		welcome: `Hi ${getVar(variables, 'FIRST_NAME', 'there')}! Your ${getVar(variables, 'PACKAGE', 'AI agent')} is now LIVE. Questions? wranngle.com`,

		'invoice-receipt': `Wranngle: Payment of $${getVar(variables, 'AMOUNT', '0.00')} received for ${getVar(variables, 'INVOICE_ID', 'invoice')}. Thank you!`,

		notification: `${getVar(variables, 'EVENT_TYPE', 'Update')}: ${getVar(variables, 'EVENT_DATA', 'Status changed')}`,

		'password-reset': `Reset your password: ${getVar(variables, 'RESET_URL', 'link')}. Expires in ${getVar(variables, 'EXPIRY_TIME', '1 hour')}.`,

		'lead-intake': `New lead: ${getVar(variables, 'BUSINESS_NAME', 'Business')} (${getVar(variables, 'INDUSTRY', 'industry')}) - ${getVar(variables, 'OWNER_NAME', 'Owner')}, ${getVar(variables, 'PHONE', 'phone')}`,

		'sales-cold-outreach': `Hi ${getVar(variables, 'FIRST_NAME', 'there')}! ${getVar(variables, 'REP_NAME', 'We')} noticed ${getVar(variables, 'COMPANY', 'your company')} could benefit from Wranngle. Demo? wranngle.com`,

		'sales-demo-followup': `Hi ${getVar(variables, 'FIRST_NAME', 'there')}! Thanks for the demo. Questions? ${getVar(variables, 'REP_EMAIL', 'team@wranngle.com')}`,

		'sales-proposal-sent': `Hi ${getVar(variables, 'FIRST_NAME', 'there')}! Your ${getVar(variables, 'PACKAGE', 'package')} proposal ($${getVar(variables, 'PRICE', '0')}) is ready. Review at wranngle.com`,

		'sales-quote-followup': `Hi ${getVar(variables, 'FIRST_NAME', 'there')}! Following up on quote ${getVar(variables, 'QUOTE_ID', '')}. Questions? ${getVar(variables, 'REP_NAME', 'Our team')} is here to help.`,

		'sales-winback': `Hi ${getVar(variables, 'FIRST_NAME', 'there')}! We've added ${getVar(variables, 'NEW_FEATURE_1', 'new features')} and ${getVar(variables, 'NEW_FEATURE_2', 'improvements')}. Come back? wranngle.com`,
	};

	return templates[templateId] || templates.welcome;
}

/**
 * Validate template variables
 */
export function validateTemplateVariables(
	templateId: TemplateId,
	variables: TemplateVariables,
): {valid: boolean; missing: string[]} {
	const requiredVars: Record<TemplateId, string[]> = {
		welcome: ['FIRST_NAME', 'PACKAGE'],
		'invoice-receipt': ['AMOUNT', 'INVOICE_ID'],
		notification: ['EVENT_TYPE', 'EVENT_DATA'],
		'password-reset': ['RESET_URL', 'EXPIRY_TIME'],
		'lead-intake': ['BUSINESS_NAME', 'INDUSTRY', 'OWNER_NAME', 'PHONE'],
		'sales-cold-outreach': ['FIRST_NAME', 'COMPANY', 'REP_NAME'],
		'sales-demo-followup': ['FIRST_NAME', 'REP_EMAIL'],
		'sales-proposal-sent': ['FIRST_NAME', 'PACKAGE', 'PRICE'],
		'sales-quote-followup': ['FIRST_NAME', 'QUOTE_ID', 'REP_NAME'],
		'sales-winback': ['FIRST_NAME', 'NEW_FEATURE_1', 'NEW_FEATURE_2'],
	};

	const required = requiredVars[templateId] || [];
	const missing = required.filter((key) => !(key in variables));

	return {
		valid: missing.length === 0,
		missing,
	};
}

/**
 * Get all available template IDs
 */
export function getTemplateIds(): TemplateId[] {
	return [
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
}
