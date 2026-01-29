/**
 * SMS/RCS Message Builder
 *
 * Unified message builder for SMS and RCS text messaging,
 * designed to work alongside email templates.
 *
 * Usage:
 *   const builder = new MessageBuilder();
 *   const message = await builder.build('welcome', {
 *     channel: 'sms',
 *     variables: { FIRST_NAME: 'John', PACKAGE: 'Elite Agent' }
 *   });
 */

import { readdir } from 'node:fs/promises';
import { join } from 'node:path';

/** RCS suggestion action types */
export interface RcsSuggestion {
  type: 'url' | 'phone' | 'text';
  label: string;
  value: string;
}

/** Message template definition */
export interface MessageTemplate {
  name: string;
  description: string;

  /** SMS variant (160 char limit for single segment) */
  sms: {
    body: string;
    fallback?: string; // For non-ASCII characters
  };

  /** RCS variant (rich messaging) */
  rcs?: {
    body: string;
    suggestions?: RcsSuggestion[];
    media?: {
      url: string;
      type: 'image' | 'video';
    };
  };

  /** Template metadata */
  variables: string[];
  emailSibling: string;
  category: 'transactional' | 'marketing' | 'sales' | 'internal';
}

/** Build options for message generation */
export interface MessageBuilderOptions {
  channel: 'sms' | 'rcs' | 'auto'; // auto = RCS with SMS fallback
  variables: Record<string, string>;
  urlShortener?: (url: string) => Promise<string>;
}

/** Result of message building */
export interface MessageBuildResult {
  body: string;
  channel: 'sms' | 'rcs';
  characterCount: number;
  segments: number;
  suggestions?: RcsSuggestion[];
  warnings: string[];
}

/** Validation result */
export interface ValidationResult {
  valid: boolean;
  length: number;
  segments: number;
  warnings: string[];
  errors: string[];
}

/** SMS character limits */
const SMS_LIMITS = {
  GSM_SINGLE: 160,
  GSM_CONCAT: 153,
  UNICODE_SINGLE: 70,
  UNICODE_CONCAT: 67,
};

/** GSM 7-bit character set (basic) */
const GSM_BASIC_CHARS =
  '@£$¥èéùìòÇ\nØø\rÅåΔ_ΦΓΛΩΠΨΣΘΞ !"#¤%&\'()*+,-./0123456789:;<=>?' +
  '¡ABCDEFGHIJKLMNOPQRSTUVWXYZÄÖÑÜ§¿abcdefghijklmnopqrstuvwxyzäöñüà';

export class MessageBuilder {
  private templates: Map<string, MessageTemplate> = new Map();

  constructor() {
    this.loadTemplates();
  }

  /**
   * Load all message templates
   */
  private loadTemplates(): void {
    // Templates are defined inline for simplicity
    // In production, these could be loaded from separate files
    const templates: MessageTemplate[] = [
      // Existing email siblings
      {
        name: 'welcome',
        description: 'New customer welcome message',
        sms: {
          body: "Hi {{FIRST_NAME}}! Your {{PACKAGE}} agent is LIVE. We'll call within 24h to configure it. Questions? support@wranngle.com",
        },
        rcs: {
          body: "Hi {{FIRST_NAME}}!\n\nYour {{PACKAGE}} AI agent is now LIVE. Our team will call within 24 hours to customize your knowledge base.",
          suggestions: [
            { type: 'url', label: 'Dashboard', value: '{{DASHBOARD_URL}}' },
            { type: 'phone', label: 'Call Support', value: '+18005551234' },
          ],
          media: {
            url: 'https://wranngle.com/assets/rcs/hero-welcome.png',
            type: 'image',
          },
        },
        variables: ['FIRST_NAME', 'PACKAGE', 'DASHBOARD_URL'],
        emailSibling: 'welcome',
        category: 'marketing',
      },
      {
        name: 'invoice-receipt',
        description: 'Payment confirmation',
        sms: {
          body: 'Wranngle: Payment of ${{AMOUNT}} received for {{INVOICE_ID}}. View receipt: {{SHORT_URL}}',
        },
        rcs: {
          body: 'Payment Confirmed\n\nAmount: ${{AMOUNT}}\nInvoice: {{INVOICE_ID}}\n\nThank you for your business!',
          suggestions: [
            { type: 'url', label: 'View Receipt', value: '{{INVOICE_URL}}' },
          ],
          media: {
            url: 'https://wranngle.com/assets/rcs/receipt-confirmed.png',
            type: 'image',
          },
        },
        variables: ['AMOUNT', 'INVOICE_ID', 'SHORT_URL', 'INVOICE_URL'],
        emailSibling: 'invoice-receipt',
        category: 'transactional',
      },
      {
        name: 'notification',
        description: 'System notification/alert',
        sms: {
          body: 'Wranngle Alert: {{EVENT_TYPE}} - {{EVENT_DATA}}. Details: {{SHORT_URL}}',
        },
        rcs: {
          body: '{{NOTIFICATION_TITLE}}\n\n{{NOTIFICATION_MESSAGE}}\n\nTimestamp: {{TIMESTAMP}}',
          suggestions: [
            { type: 'url', label: 'View Details', value: '{{CTA_URL}}' },
          ],
          media: {
            url: 'https://wranngle.com/assets/rcs/notification-alert.png',
            type: 'image',
          },
        },
        variables: ['EVENT_TYPE', 'EVENT_DATA', 'SHORT_URL', 'NOTIFICATION_TITLE', 'NOTIFICATION_MESSAGE', 'TIMESTAMP', 'CTA_URL'],
        emailSibling: 'notification',
        category: 'marketing',
      },
      {
        name: 'password-reset',
        description: 'Password reset link',
        sms: {
          body: "Wranngle: Reset your password here: {{SHORT_URL}} - Expires in {{EXPIRY_TIME}}. Didn't request this? Ignore.",
        },
        rcs: {
          body: "Password Reset Request\n\nClick below to reset your password. Link expires in {{EXPIRY_TIME}}.\n\nIf you didn't request this, ignore this message.",
          suggestions: [
            { type: 'url', label: 'Reset Password', value: '{{RESET_URL}}' },
          ],
          media: {
            url: 'https://wranngle.com/assets/rcs/security-shield.png',
            type: 'image',
          },
        },
        variables: ['SHORT_URL', 'RESET_URL', 'EXPIRY_TIME'],
        emailSibling: 'password-reset',
        category: 'transactional',
      },
      {
        name: 'lead-intake',
        description: 'Internal new lead notification',
        sms: {
          body: 'New Lead: {{BUSINESS_NAME}} ({{INDUSTRY}}) - {{OWNER_NAME}} {{PHONE}}. Status: {{STATUS}}',
        },
        rcs: {
          body: 'New Lead Captured\n\nBusiness: {{BUSINESS_NAME}}\nIndustry: {{INDUSTRY}}\nContact: {{OWNER_NAME}}\nPhone: {{PHONE}}\nPackage: {{PACKAGE}}',
          suggestions: [
            { type: 'phone', label: 'Call Lead', value: '{{PHONE}}' },
            { type: 'url', label: 'View in CRM', value: 'https://wranngle.com/leads' },
          ],
          media: {
            url: 'https://wranngle.com/assets/rcs/logo-card.png',
            type: 'image',
          },
        },
        variables: ['BUSINESS_NAME', 'INDUSTRY', 'OWNER_NAME', 'PHONE', 'STATUS', 'PACKAGE'],
        emailSibling: 'lead-intake',
        category: 'internal',
      },

      // Sales templates
      {
        name: 'sales-cold-outreach',
        description: 'Initial prospecting message',
        sms: {
          body: "Hi {{FIRST_NAME}}, {{COMPANY}} missing calls? Wranngle AI answers 24/7. Free demo: {{SHORT_URL}} -{{REP_NAME}}",
        },
        rcs: {
          body: "Hi {{FIRST_NAME}},\n\nIs {{COMPANY}} missing after-hours calls? Our AI agents answer 24/7, qualify leads, and book appointments.\n\nLet's chat about how we can help.",
          suggestions: [
            { type: 'url', label: 'Schedule Demo', value: '{{CALENDAR_URL}}' },
            { type: 'text', label: 'Not Interested', value: 'STOP' },
          ],
          media: {
            url: 'https://wranngle.com/assets/rcs/ai-agents.png',
            type: 'image',
          },
        },
        variables: ['FIRST_NAME', 'COMPANY', 'SHORT_URL', 'REP_NAME', 'CALENDAR_URL'],
        emailSibling: 'sales-cold-outreach',
        category: 'sales',
      },
      {
        name: 'sales-demo-followup',
        description: 'Post-demo follow-up',
        sms: {
          body: 'Hi {{FIRST_NAME}}, thanks for the demo! Recording: {{SHORT_URL}} Questions? Reply or email {{REP_EMAIL}}',
        },
        rcs: {
          body: "Thanks for the Demo!\n\nHi {{FIRST_NAME}}, it was great showing you Wranngle. Here's your recording and proposal.",
          suggestions: [
            { type: 'url', label: 'Watch Recording', value: '{{RECORDING_URL}}' },
            { type: 'url', label: 'View Proposal', value: '{{PROPOSAL_URL}}' },
          ],
          media: {
            url: 'https://wranngle.com/assets/rcs/followup.png',
            type: 'image',
          },
        },
        variables: ['FIRST_NAME', 'SHORT_URL', 'REP_EMAIL', 'RECORDING_URL', 'PROPOSAL_URL'],
        emailSibling: 'sales-demo-followup',
        category: 'sales',
      },
      {
        name: 'sales-proposal-sent',
        description: 'Proposal delivery notification',
        sms: {
          body: 'Hi {{FIRST_NAME}}, your Wranngle proposal is ready! {{PACKAGE}} @ {{PRICE}}/mo. View: {{SHORT_URL}}',
        },
        rcs: {
          body: 'Your Proposal is Ready\n\nPackage: {{PACKAGE}}\nPrice: {{PRICE}}/month\nValid until: {{VALID_UNTIL}}',
          suggestions: [
            { type: 'url', label: 'View Proposal', value: '{{PROPOSAL_URL}}' },
            { type: 'phone', label: 'Questions?', value: '{{REP_PHONE}}' },
          ],
          media: {
            url: 'https://wranngle.com/assets/rcs/proposal-ready.png',
            type: 'image',
          },
        },
        variables: ['FIRST_NAME', 'PACKAGE', 'PRICE', 'SHORT_URL', 'VALID_UNTIL', 'PROPOSAL_URL', 'REP_PHONE'],
        emailSibling: 'sales-proposal-sent',
        category: 'sales',
      },
      {
        name: 'sales-quote-followup',
        description: 'Quote follow-up message',
        sms: {
          body: 'Hi {{FIRST_NAME}}, checking in on your quote ({{QUOTE_ID}}). Ready to proceed? {{SHORT_URL}} -{{REP_NAME}}',
        },
        rcs: {
          body: 'Checking In\n\nHi {{FIRST_NAME}}, just following up on your quote. Any questions I can answer?',
          suggestions: [
            { type: 'url', label: 'View Quote', value: '{{QUOTE_URL}}' },
            { type: 'url', label: 'Have Questions', value: '{{REP_CALENDAR}}' },
          ],
          media: {
            url: 'https://wranngle.com/assets/rcs/followup.png',
            type: 'image',
          },
        },
        variables: ['FIRST_NAME', 'QUOTE_ID', 'SHORT_URL', 'REP_NAME', 'QUOTE_URL', 'REP_CALENDAR'],
        emailSibling: 'sales-quote-followup',
        category: 'sales',
      },
      {
        name: 'sales-winback',
        description: 'Re-engagement message',
        sms: {
          body: "Hi {{FIRST_NAME}}, we've added {{NEW_FEATURE_1}} + {{NEW_FEATURE_2}} since we last talked. Reconnect? {{SHORT_URL}}",
        },
        rcs: {
          body: "Let's Reconnect!\n\nHi {{FIRST_NAME}}, a lot has changed at Wranngle:\n\n✓ {{NEW_FEATURE_1}}\n✓ {{NEW_FEATURE_2}}\n\nSpecial offer: {{SPECIAL_OFFER}}",
          suggestions: [
            { type: 'url', label: 'Schedule Call', value: '{{CALENDAR_URL}}' },
            { type: 'text', label: 'Unsubscribe', value: 'STOP' },
          ],
          media: {
            url: 'https://wranngle.com/assets/rcs/winback-offer.png',
            type: 'image',
          },
        },
        variables: ['FIRST_NAME', 'NEW_FEATURE_1', 'NEW_FEATURE_2', 'SHORT_URL', 'SPECIAL_OFFER', 'CALENDAR_URL'],
        emailSibling: 'sales-winback',
        category: 'sales',
      },
    ];

    for (const template of templates) {
      this.templates.set(template.name, template);
    }
  }

  /**
   * Build a message from a template
   */
  async build(
    templateName: string,
    options: MessageBuilderOptions
  ): Promise<MessageBuildResult> {
    const template = this.templates.get(templateName);
    if (!template) {
      throw new Error(`Template not found: ${templateName}`);
    }

    const warnings: string[] = [];
    let channel: 'sms' | 'rcs' = options.channel === 'auto' ? 'rcs' : options.channel;
    let body: string;
    let suggestions: RcsSuggestion[] | undefined;

    // Use RCS if available, otherwise fall back to SMS
    if (channel === 'rcs' && template.rcs) {
      body = template.rcs.body;
      suggestions = template.rcs.suggestions;
    } else {
      channel = 'sms';
      body = template.sms.body;
    }

    // Replace variables
    body = this.replaceVariables(body, options.variables);

    // Replace variables in suggestions too
    if (suggestions) {
      suggestions = suggestions.map((s) => ({
        ...s,
        value: this.replaceVariables(s.value, options.variables),
      }));
    }

    // Shorten URLs if shortener provided
    if (options.urlShortener) {
      body = await this.shortenUrls(body, options.urlShortener);
    }

    // Validate length for SMS
    if (channel === 'sms') {
      const validation = this.validate(body);
      if (!validation.valid) {
        warnings.push(...validation.errors);
      }

      warnings.push(...validation.warnings);
    }

    const characterCount = body.length;
    const segments = this.calculateSegments(body);

    return {
      body,
      channel,
      characterCount,
      segments,
      suggestions,
      warnings,
    };
  }

  /**
   * Replace {{VARIABLE}} placeholders
   */
  private replaceVariables(text: string, variables: Record<string, string>): string {
    let result = text;
    for (const [key, value] of Object.entries(variables)) {
      const regex = new RegExp(`{{${key}}}`, 'g');
      result = result.replace(regex, value);
    }

    return result;
  }

  /**
   * Shorten URLs in text
   */
  private async shortenUrls(
    text: string,
    shortener: (url: string) => Promise<string>
  ): Promise<string> {
    const urlRegex = /https?:\/\/[^\s]+/g;
    const matches = text.match(urlRegex) || [];

    let result = text;
    for (const url of matches) {
      try {
        const shortUrl = await shortener(url);
        result = result.replace(url, shortUrl);
      } catch {
        // Keep original URL if shortening fails
      }
    }

    return result;
  }

  /**
   * Validate a message
   */
  validate(message: string): ValidationResult {
    const warnings: string[] = [];
    const errors: string[] = [];

    const isGsm = this.isGsmEncoding(message);
    const length = message.length;

    let limit: number;
    let segmentSize: number;

    if (isGsm) {
      limit = SMS_LIMITS.GSM_SINGLE;
      segmentSize = SMS_LIMITS.GSM_CONCAT;
    } else {
      limit = SMS_LIMITS.UNICODE_SINGLE;
      segmentSize = SMS_LIMITS.UNICODE_CONCAT;
      warnings.push('Message contains Unicode characters - reduced character limit applies');
    }

    const segments = this.calculateSegments(message);

    if (length > limit && segments === 1) {
      errors.push(`Message exceeds single SMS limit (${length}/${limit} chars)`);
    }

    if (segments > 1) {
      warnings.push(`Message will be sent as ${segments} segments (concatenated SMS)`);
    }

    if (segments > 3) {
      errors.push(`Message too long - ${segments} segments will incur high costs`);
    }

    // Check for remaining variables
    const unreplacedVars = message.match(/{{[A-Z_]+}}/g);
    if (unreplacedVars) {
      errors.push(`Unreplaced variables found: ${unreplacedVars.join(', ')}`);
    }

    return {
      valid: errors.length === 0,
      length,
      segments,
      warnings,
      errors,
    };
  }

  /**
   * Check if message can use GSM 7-bit encoding
   */
  private isGsmEncoding(message: string): boolean {
    for (const char of message) {
      if (!GSM_BASIC_CHARS.includes(char)) {
        return false;
      }
    }

    return true;
  }

  /**
   * Calculate number of SMS segments
   */
  private calculateSegments(message: string): number {
    const isGsm = this.isGsmEncoding(message);
    const length = message.length;

    if (isGsm) {
      if (length <= SMS_LIMITS.GSM_SINGLE) {
        return 1;
      }

      return Math.ceil(length / SMS_LIMITS.GSM_CONCAT);
    }

    if (length <= SMS_LIMITS.UNICODE_SINGLE) {
      return 1;
    }

    return Math.ceil(length / SMS_LIMITS.UNICODE_CONCAT);
  }

  /**
   * Get a template by name
   */
  getTemplate(name: string): MessageTemplate | undefined {
    return this.templates.get(name);
  }

  /**
   * List all available templates
   */
  listTemplates(): string[] {
    return [...this.templates.keys()];
  }

  /**
   * Get templates by category
   */
  getTemplatesByCategory(
    category: 'transactional' | 'marketing' | 'sales' | 'internal'
  ): MessageTemplate[] {
    return [...this.templates.values()].filter((t) => t.category === category);
  }

  /**
   * Preview a template with sample data
   */
  async preview(templateName: string): Promise<MessageBuildResult> {
    const sampleData = this.getSampleData(templateName);
    return this.build(templateName, {
      channel: 'auto',
      variables: sampleData,
    });
  }

  /**
   * Get sample data for previews
   */
  private getSampleData(templateName: string): Record<string, string> {
    const common: Record<string, string> = {
      FIRST_NAME: 'Jane',
      DASHBOARD_URL: 'https://wranngle.com/dashboard',
      SHORT_URL: 'https://wranngl.co/abc123',
    };

    const samples: Record<string, Record<string, string>> = {
      welcome: {
        ...common,
        PACKAGE: 'Elite Agent',
      },
      'invoice-receipt': {
        ...common,
        AMOUNT: '542.50',
        INVOICE_ID: 'INV-2026-001234',
        INVOICE_URL: 'https://wranngle.com/invoices/INV-2026-001234',
      },
      notification: {
        ...common,
        EVENT_TYPE: 'LEAD_CAPTURED',
        EVENT_DATA: 'John Smith (555) 123-4567',
        NOTIFICATION_TITLE: 'New Lead Captured',
        NOTIFICATION_MESSAGE: 'Your AI agent captured a new qualified lead.',
        TIMESTAMP: '2026-01-24 14:32 PST',
        CTA_URL: 'https://wranngle.com/leads/123',
      },
      'password-reset': {
        ...common,
        RESET_URL: 'https://wranngle.com/reset?token=abc123',
        EXPIRY_TIME: '1 hour',
      },
      'lead-intake': {
        ...common,
        BUSINESS_NAME: 'Acme Plumbing',
        INDUSTRY: 'HVAC',
        OWNER_NAME: 'John Smith',
        PHONE: '(555) 123-4567',
        STATUS: 'PENDING',
        PACKAGE: 'Premium',
      },
      'sales-cold-outreach': {
        ...common,
        COMPANY: 'Acme Corp',
        REP_NAME: 'Alex',
        CALENDAR_URL: 'https://cal.com/wranngle/intro',
      },
      'sales-demo-followup': {
        ...common,
        REP_EMAIL: 'alex@wranngle.com',
        RECORDING_URL: 'https://wranngle.com/demos/abc123',
        PROPOSAL_URL: 'https://wranngle.com/proposals/PROP-001',
      },
      'sales-proposal-sent': {
        ...common,
        PACKAGE: 'Elite Agent',
        PRICE: '$500',
        VALID_UNTIL: 'February 1, 2026',
        PROPOSAL_URL: 'https://wranngle.com/proposals/PROP-001',
        REP_PHONE: '+15551234567',
      },
      'sales-quote-followup': {
        ...common,
        QUOTE_ID: 'QT-2026-0089',
        REP_NAME: 'Alex',
        QUOTE_URL: 'https://wranngle.com/quotes/QT-2026-0089',
        REP_CALENDAR: 'https://cal.com/wranngle/questions',
      },
      'sales-winback': {
        ...common,
        NEW_FEATURE_1: 'SMS Agents',
        NEW_FEATURE_2: 'CRM Integrations',
        SPECIAL_OFFER: '20% off first month',
        CALENDAR_URL: 'https://cal.com/wranngle/reconnect',
      },
    };

    return samples[templateName] || common;
  }
}

// CLI Usage
if (import.meta.main) {
  const builder = new MessageBuilder();
  const [templateName, channel = 'auto'] = process.argv.slice(2);

  if (!templateName) {
    console.log('Usage: bun run message-builder.ts <template-name> [sms|rcs|auto]');
    console.log('\nAvailable templates:');
    for (const name of builder.listTemplates()) {
      const template = builder.getTemplate(name);
      console.log(`  - ${name} (${template?.category})`);
    }

    process.exit(1);
  }

  try {
    const result = await builder.preview(templateName);
    console.log('\n--- Message Preview ---');
    console.log(`Template: ${templateName}`);
    console.log(`Channel: ${result.channel.toUpperCase()}`);
    console.log(`Characters: ${result.characterCount}`);
    console.log(`Segments: ${result.segments}`);
    console.log('\nBody:');
    console.log(result.body);

    if (result.suggestions && result.suggestions.length > 0) {
      console.log('\nRCS Suggestions:');
      for (const suggestion of result.suggestions) {
        console.log(`  [${suggestion.label}] → ${suggestion.value}`);
      }
    }

    if (result.warnings.length > 0) {
      console.log('\n⚠️  Warnings:');
      for (const warning of result.warnings) {
        console.log(`   ${warning}`);
      }
    }
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}
