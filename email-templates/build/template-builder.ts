/**
 * Email Template Builder
 *
 * This module provides template inheritance functionality, allowing child templates
 * to extend the master template by replacing content blocks.
 *
 * Usage:
 *   const builder = new EmailTemplateBuilder();
 *   const html = await builder.build('welcome', {
 *     USER_NAME: 'John Doe',
 *     PACKAGE_NAME: 'Internal AI'
 *   });
 */

import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

interface TemplateVariables {
  [key: string]: string;
}

interface BuildOptions {
  inlineCSS?: boolean;
  minify?: boolean;
  validate?: boolean;
}

interface ValidationResult {
  valid: boolean;
  warnings: string[];
  errors: string[];
}

/** Deprecated colors that should not be used */
const DEPRECATED_COLORS = [
  { hex: '#0ea5e9', name: 'Sky Blue', replacement: '#ff5f00 (orange)' },
  { hex: '#f0f9ff', name: 'Light Blue BG', replacement: '#f9fafb (neutral)' },
  { hex: '#bae6fd', name: 'Blue Border', replacement: '#e5e7eb (neutral)' },
];

/** Required design system standards */
const DESIGN_STANDARDS = {
  buttonFontSize: '14px',
  buttonBorderRadius: '8px',
  infoBoxBorderRadius: '4px',
  minButtonPaddingVertical: 10,
  minButtonPaddingHorizontal: 20,
};

/** Email type classification for footer handling */
const EMAIL_TYPES: Record<string, 'transactional' | 'marketing' | 'internal' | 'sales'> = {
  'password-reset': 'transactional',
  'invoice-receipt': 'transactional',
  'welcome': 'marketing',
  'notification': 'marketing',
  'lead-intake': 'internal',
  // Sales templates (all marketing type for CAN-SPAM compliance)
  'sales-cold-outreach': 'sales',
  'sales-demo-followup': 'sales',
  'sales-proposal-sent': 'sales',
  'sales-quote-followup': 'sales',
  'sales-winback': 'sales',
};

export class EmailTemplateBuilder {
  private readonly masterTemplatePath: string;
  private readonly templatesDir: string;

  constructor() {
    this.masterTemplatePath = join(__dirname, '../master/master-template.html');
    this.templatesDir = join(__dirname, '../templates');
  }

  /**
   * Build an email by merging a child template with the master template
   */
  async build(
    templateName: string,
    variables: TemplateVariables = {},
    options: BuildOptions = {}
  ): Promise<string> {
    // Load master template
    const masterTemplate = await readFile(this.masterTemplatePath, 'utf-8');

    // Load child template
    const childTemplatePath = join(this.templatesDir, `${templateName}.html`);
    const childTemplate = await readFile(childTemplatePath, 'utf-8');

    // Replace {{CONTENT_BLOCK}} with child template content
    let emailHtml = masterTemplate.replace('{{CONTENT_BLOCK}}', childTemplate);

    // Replace all variables
    emailHtml = this.replaceVariables(emailHtml, variables);

    // Set default values for common variables if not provided
    emailHtml = this.setDefaults(emailHtml, templateName);

    // Optionally inline CSS
    if (options.inlineCSS) {
      emailHtml = await this.inlineCSS(emailHtml);
    }

    // Optionally minify HTML
    if (options.minify) {
      emailHtml = this.minifyHTML(emailHtml);
    }

    return emailHtml;
  }

  /**
   * Replace all {{VARIABLE}} placeholders with actual values
   */
  private replaceVariables(html: string, variables: TemplateVariables): string {
    let result = html;

    for (const [key, value] of Object.entries(variables)) {
      const regex = new RegExp(`{{${key}}}`, 'g');
      result = result.replace(regex, this.escapeHtml(value));
    }

    return result;
  }

  /**
   * Set default values for common variables
   */
  private setDefaults(html: string, templateName?: string): string {
    // Determine email type for footer customization
    const emailType = templateName ? EMAIL_TYPES[templateName] || 'marketing' : 'marketing';

    // Footer messages based on email type
    const footerMessages: Record<string, string> = {
      marketing: `<p style="margin: 0; font-size: 11px; line-height: 1.5; color: #9ca3af;">
        <a href="{{UNSUBSCRIBE_URL}}" style="color: #6b7280; text-decoration: underline;">Unsubscribe</a> from these emails
      </p>`,
      transactional: `<p style="margin: 0; font-size: 11px; line-height: 1.5; color: #9ca3af;">
        This is a transactional email regarding your Wranngle account.
      </p>`,
      internal: `<p style="margin: 0; font-size: 11px; line-height: 1.5; color: #9ca3af;">
        Internal notification - <a href="mailto:support@wranngle.com" style="color: #6b7280; text-decoration: underline;">Contact IT</a> to adjust preferences
      </p>`,
      sales: `<p style="margin: 0; font-size: 11px; line-height: 1.5; color: #9ca3af;">
        <a href="{{UNSUBSCRIBE_URL}}" style="color: #6b7280; text-decoration: underline;">Unsubscribe</a> | Wranngle Systems LLC
      </p>`,
    };

    const defaults: TemplateVariables = {
      EMAIL_TITLE: 'Wranngle Systems',
      PREHEADER_TEXT: 'Updates from Wranngle Systems',
      COMPANY_ADDRESS: 'Wranngle Systems LLC',
      UNSUBSCRIBE_URL: '#unsubscribe',
      TRACKING_PIXEL: '',
      FOOTER_MESSAGE: footerMessages[emailType],
    };

    // Two passes: first replace FOOTER_MESSAGE (which may inject other vars),
    // then replace remaining defaults like UNSUBSCRIBE_URL
    for (const [key, value] of Object.entries(defaults)) {
      const regex = new RegExp(`{{${key}}}`, 'g');
      if (html.includes(`{{${key}}}`)) {
        html = html.replace(regex, value);
      }
    }

    // Second pass to catch vars injected by FOOTER_MESSAGE
    for (const [key, value] of Object.entries(defaults)) {
      const regex = new RegExp(`{{${key}}}`, 'g');
      if (html.includes(`{{${key}}}`)) {
        html = html.replace(regex, value);
      }
    }

    return html;
  }

  /**
   * Escape HTML special characters to prevent XSS
   */
  private escapeHtml(text: string): string {
    const map: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#x27;',
      '/': '&#x2F;',
    };
    return text.replace(/[&<>"'/]/g, (char) => map[char] || char);
  }

  /**
   * Inline CSS styles for maximum email client compatibility
   * (Uses juice library - install with: bun add juice)
   */
  private async inlineCSS(html: string): Promise<string> {
    try {
      const juice = await import('juice');
      return juice.default(html, {
        preserveMediaQueries: true,
        preserveFontFaces: true,
        removeStyleTags: false,
      });
    } catch (error) {
      console.warn('Juice library not installed. Skipping CSS inlining.');
      console.warn('Install with: bun add juice');
      return html;
    }
  }

  /**
   * Minify HTML to reduce email size
   */
  private minifyHTML(html: string): string {
    // Simple minification: remove extra whitespace
    return html
      .replace(/\n\s+/g, '\n') // Remove indentation
      .replace(/\n{2,}/g, '\n') // Remove multiple newlines
      .replace(/>\s+</g, '><') // Remove whitespace between tags
      .trim();
  }

  /**
   * Preview an email template with sample data
   */
  async preview(templateName: string): Promise<string> {
    const sampleData = this.getSampleData(templateName);
    return this.build(templateName, sampleData, { inlineCSS: false });
  }

  /**
   * Get sample data for preview purposes
   */
  private getSampleData(templateName: string): TemplateVariables {
    const common = {
      USER_NAME: 'Jane Doe',
      USER_EMAIL: 'jane.doe@example.com',
      DASHBOARD_URL: 'https://wranngle.com/dashboard',
      UNSUBSCRIBE_URL: 'https://wranngle.com/unsubscribe',
      COMPANY_ADDRESS: 'San Francisco, CA',
    };

    const samplesByTemplate: Record<string, TemplateVariables> = {
      welcome: {
        ...common,
        EMAIL_TITLE: 'Welcome to Wranngle',
        PREHEADER_TEXT: 'Deployment confirmed — kickoff scheduling underway',
        PACKAGE_NAME: 'Internal AI',
      },
      'invoice-receipt': {
        ...common,
        EMAIL_TITLE: 'Invoice from Wranngle',
        PREHEADER_TEXT: 'Your payment has been received',
        INVOICE_ID: 'INV-2026-001234',
        INVOICE_DATE: '2026-01-19',
        ITEM_NAME: 'Internal AI - Monthly',
        ITEM_DESCRIPTION: 'Unified AI front end for sales and customer service',
        ITEM_AMOUNT: '500.00',
        SUBTOTAL: '500.00',
        TAX_RATE: '8.5',
        TAX_AMOUNT: '42.50',
        TOTAL_AMOUNT: '542.50',
        PAYMENT_METHOD: 'Visa ending in 4242',
        BILLING_FREQUENCY: 'Monthly',
        INVOICE_PDF_URL: 'https://wranngle.com/invoices/INV-2026-001234.pdf',
      },
      notification: {
        ...common,
        EMAIL_TITLE: 'New Lead Captured',
        PREHEADER_TEXT: 'Your AI agent captured a new qualified lead',
        NOTIFICATION_TITLE: 'New Lead Captured',
        NOTIFICATION_TIMESTAMP: '2026-01-19 14:32 PST',
        NOTIFICATION_MESSAGE:
          'Your AI agent successfully captured and qualified a new lead from an inbound conversation.',
        EVENT_TYPE: 'LEAD_CAPTURED',
        EVENT_DATA: 'Contact: John Smith | Phone: (555) 123-4567',
        EVENT_STATUS: 'QUALIFIED',
        METRIC_1_VALUE: '14',
        METRIC_1_LABEL: 'Total Leads',
        METRIC_2_VALUE: '89%',
        METRIC_2_LABEL: 'Qualification Rate',
        METRIC_3_VALUE: '3.2min',
        METRIC_3_LABEL: 'Avg Call Time',
        ACTION_MESSAGE: 'Review this lead and schedule a follow-up call.',
        ACTION_URL: 'https://wranngle.com/leads/123',
        CTA_TEXT: 'View Lead Details',
        CTA_URL: 'https://wranngle.com/leads/123',
        SETTINGS_URL: 'https://wranngle.com/settings/notifications',
      },
      'password-reset': {
        ...common,
        EMAIL_TITLE: 'Reset Your Password',
        PREHEADER_TEXT: 'You requested a password reset',
        RESET_URL: 'https://wranngle.com/reset-password?token=abc123',
        EXPIRY_TIME: '1 hour',
        EXPIRY_TIMESTAMP: '2026-01-19 15:32 PST',
        REQUEST_IP: '192.168.1.1',
        REQUEST_TIME: '2026-01-19 14:32 PST',
        REQUEST_LOCATION: 'San Francisco, CA, USA',
      },
      'lead-intake': {
        EMAIL_TITLE: 'New Lead: Acme Services Co',
        PREHEADER_TEXT: 'New lead submission from website intake form',
        BUSINESS_NAME: 'Acme Services Co',
        INDUSTRY: 'Customer Operations',
        OWNER_NAME: 'John Smith',
        EMAIL: 'john@acmeservices.com',
        PHONE: '(555) 123-4567',
        PACKAGE: 'Omni Intake',
        AGENT_NAME: 'Samantha',
        STATUS: 'PENDING',
        NOTES: 'Interested in one front door for sales and support. Currently triaging requests manually across chat, phone, and DMs. Has a distributed team and recurring seasonal volume spikes.',
        TIMESTAMP: '2026-01-19 14:32:15 PST',
        UNSUBSCRIBE_URL: '#',
        COMPANY_ADDRESS: 'Wranngle Systems LLC',
      },
      // Sales templates
      'sales-cold-outreach': {
        ...common,
        EMAIL_TITLE: 'Every Conversation Answered',
        PREHEADER_TEXT: 'One AI front end for sales and support',
        RECIPIENT_NAME: 'John',
        COMPANY_NAME: 'Acme Services',
        INDUSTRY: 'Customer Operations',
        PAIN_POINT: 'leads going unanswered across chat, phone, and DMs',
        CALENDAR_URL: 'https://cal.com/wranngle/intro',
        REP_NAME: 'Alex',
        REP_EMAIL: 'alex@wranngle.com',
      },
      'sales-demo-followup': {
        ...common,
        EMAIL_TITLE: 'Thanks for the Demo!',
        PREHEADER_TEXT: 'Your demo recording and proposal are ready',
        RECIPIENT_NAME: 'Sarah',
        DEMO_DATE: 'January 20, 2026',
        RECORDING_URL: 'https://wranngle.com/demos/abc123',
        PROPOSAL_URL: 'https://wranngle.com/proposals/PROP-2026-001',
        REP_NAME: 'Alex',
        REP_EMAIL: 'alex@wranngle.com',
      },
      'sales-proposal-sent': {
        ...common,
        EMAIL_TITLE: 'Your Proposal is Ready',
        PREHEADER_TEXT: 'Custom proposal for your AI agent deployment',
        RECIPIENT_NAME: 'Mike',
        PROPOSAL_ID: 'PROP-2026-0042',
        PACKAGE_NAME: 'Internal AI',
        MONTHLY_PRICE: '$500',
        PROPOSAL_URL: 'https://wranngle.com/proposals/PROP-2026-0042',
        VALID_UNTIL: 'February 1, 2026',
        REP_NAME: 'Alex',
        REP_EMAIL: 'alex@wranngle.com',
        REP_CALENDAR: 'https://cal.com/wranngle/questions',
      },
      'sales-quote-followup': {
        ...common,
        EMAIL_TITLE: 'Checking In on Your Quote',
        PREHEADER_TEXT: 'Following up on your Wranngle quote',
        RECIPIENT_NAME: 'Lisa',
        QUOTE_ID: 'QT-2026-0089',
        DAYS_SINCE_SENT: '5',
        QUOTE_AMOUNT: '$542.50',
        QUOTE_URL: 'https://wranngle.com/quotes/QT-2026-0089',
        REP_NAME: 'Alex',
        REP_EMAIL: 'alex@wranngle.com',
        REP_CALENDAR: 'https://cal.com/wranngle/questions',
      },
      'sales-winback': {
        ...common,
        EMAIL_TITLE: "Let's Reconnect",
        PREHEADER_TEXT: 'A lot has changed at Wranngle',
        RECIPIENT_NAME: 'David',
        LAST_CONTACT_DATE: '6 months ago',
        NEW_FEATURE_1: 'Internal AI — resolves requests using your company knowledge',
        NEW_FEATURE_2: 'gtm_ops Platform — lead enrichment and branded proposals',
        NEW_FEATURE_3: 'Web chat, voice, Slack, Teams, and Discord at every tier',
        SPECIAL_OFFER: '20% off first month',
        OFFER_EXPIRY: 'September 30, 2026',
        CALENDAR_URL: 'https://cal.com/wranngle/reconnect',
        REP_NAME: 'Alex',
        REP_EMAIL: 'alex@wranngle.com',
      },
    };

    return samplesByTemplate[templateName] || common;
  }

  /**
   * List all available templates
   */
  async listTemplates(): Promise<string[]> {
    const { readdir } = await import('node:fs/promises');
    const files = await readdir(this.templatesDir);
    return files
      .filter((file) => file.endsWith('.html'))
      .map((file) => file.replace('.html', ''));
  }

  /**
   * Validate an email template against design system standards
   */
  validateTemplate(html: string, templateName: string): ValidationResult {
    const warnings: string[] = [];
    const errors: string[] = [];

    // Check for deprecated colors
    for (const color of DEPRECATED_COLORS) {
      const regex = new RegExp(color.hex, 'gi');
      const matches = html.match(regex);
      if (matches) {
        errors.push(
          `Deprecated color found: ${color.name} (${color.hex}) - Use ${color.replacement} instead. Found ${matches.length} occurrence(s).`
        );
      }
    }

    // Check button font sizes (should be 14px)
    const buttonFontRegex = /class="btn-[^"]*"[^>]*font-size:\s*(\d+)px/gi;
    let match;
    while ((match = buttonFontRegex.exec(html)) !== null) {
      const fontSize = parseInt(match[1], 10);
      if (fontSize < 14) {
        warnings.push(
          `Button font-size ${fontSize}px is below minimum (14px). Consider standardizing.`
        );
      }
    }

    // Check button border radius (should be 8px)
    const buttonRadiusRegex = /class="btn-[^"]*"[^>]*border-radius:\s*(\d+)px/gi;
    while ((match = buttonRadiusRegex.exec(html)) !== null) {
      const radius = parseInt(match[1], 10);
      if (radius < 8) {
        warnings.push(
          `Button border-radius ${radius}px is below standard (8px). Consider standardizing.`
        );
      }
    }

    // Check for missing PREHEADER_TEXT placeholder
    if (!html.includes('{{PREHEADER_TEXT}}') && !html.includes('PREHEADER_TEXT')) {
      warnings.push(
        `Template "${templateName}" may be missing PREHEADER_TEXT variable.`
      );
    }

    // Check for proper left border usage (should be orange, not magenta unless security)
    const magentaBorderRegex = /border-left:\s*\d+px\s+solid\s+#cf3c69/gi;
    const magentaMatches = html.match(magentaBorderRegex);
    if (magentaMatches && !['password-reset'].includes(templateName)) {
      warnings.push(
        `Found ${magentaMatches.length} magenta (#cf3c69) left border(s). Magenta should only be used for security contexts.`
      );
    }

    // Check for green used outside of completed states
    const greenBgRegex = /background-color:\s*#10b981/gi;
    const greenMatches = html.match(greenBgRegex);
    if (greenMatches && greenMatches.length > 2) {
      warnings.push(
        `Found ${greenMatches.length} green (#10b981) backgrounds. Green should only be used for completed states.`
      );
    }

    // COHERENCE CHECKS - Detect contradictory messaging

    // Check for "Reply to this email" with noreply sender
    const replyToThisEmail = /reply to this email/gi;
    if (html.match(replyToThisEmail)) {
      warnings.push(
        `Contains "Reply to this email" messaging - ensure sender is NOT noreply@wranngle.com or provide explicit contact email.`
      );
    }

    // Check for vague "contact support" without email/link
    const vagueSupport = /contact\s+(our\s+)?support(?!\s*@)(?![^<]*<\/a>)/gi;
    if (html.match(vagueSupport)) {
      warnings.push(
        `Contains vague "contact support" without email/link. Provide explicit contact: support@wranngle.com`
      );
    }

    // Check for dashboard links (warn if dashboard may not exist)
    if (html.includes('{{DASHBOARD_URL}}') || html.includes('/dashboard')) {
      warnings.push(
        `References dashboard URL - ensure dashboard exists and is accessible.`
      );
    }

    // Check email type vs footer coherence
    const emailType = EMAIL_TYPES[templateName] || 'marketing';
    if (emailType === 'transactional' && html.includes('Unsubscribe')) {
      warnings.push(
        `Transactional email (${templateName}) has unsubscribe link - transactional emails are CAN-SPAM exempt.`
      );
    }

    if (emailType === 'internal' && html.includes('Unsubscribe from these emails')) {
      warnings.push(
        `Internal email (${templateName}) has consumer unsubscribe - use internal preference management instead.`
      );
    }

    return {
      valid: errors.length === 0,
      warnings,
      errors,
    };
  }

  /**
   * Build and validate a template
   */
  async buildWithValidation(
    templateName: string,
    variables: TemplateVariables = {},
    options: BuildOptions = {}
  ): Promise<{ html: string; validation: ValidationResult }> {
    const html = await this.build(templateName, variables, options);
    const validation = this.validateTemplate(html, templateName);
    return { html, validation };
  }
}

// CLI Usage
if (import.meta.main) {
  const builder = new EmailTemplateBuilder();
  const [templateName, ...args] = process.argv.slice(2);

  if (!templateName) {
    console.log('Usage: bun run template-builder.ts <template-name> [--inline] [--minify] [--validate]');
    console.log('\nAvailable templates:');
    const templates = await builder.listTemplates();
    templates.forEach((t) => console.log(`  - ${t}`));
    process.exit(1);
  }

  const options: BuildOptions = {
    inlineCSS: args.includes('--inline'),
    minify: args.includes('--minify'),
    validate: args.includes('--validate'),
  };

  try {
    const html = await builder.preview(templateName);
    const outputPath = join(__dirname, `../preview/${templateName}-preview.html`);

    const { writeFile, mkdir } = await import('node:fs/promises');
    await mkdir(join(__dirname, '../preview'), { recursive: true });
    await writeFile(outputPath, html);

    console.log(`✓ Preview generated: ${outputPath}`);

    // Run validation
    if (options.validate || args.includes('--validate')) {
      const validation = builder.validateTemplate(html, templateName);
      console.log('\n--- Validation Results ---');
      if (validation.errors.length > 0) {
        console.log('\n❌ Errors:');
        validation.errors.forEach((e) => console.log(`   ${e}`));
      }
      if (validation.warnings.length > 0) {
        console.log('\n⚠️  Warnings:');
        validation.warnings.forEach((w) => console.log(`   ${w}`));
      }
      if (validation.valid && validation.warnings.length === 0) {
        console.log('✓ All design system checks passed!');
      }
      console.log(`\nValidation: ${validation.valid ? 'PASSED' : 'FAILED'}`);
    }

    if (options.inlineCSS) {
      const inlinedHtml = await builder.build(templateName, builder['getSampleData'](templateName), options);
      const inlinedPath = join(__dirname, `../preview/${templateName}-inlined.html`);
      await writeFile(inlinedPath, inlinedHtml);
      console.log(`✓ Inlined version: ${inlinedPath}`);
    }
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}
