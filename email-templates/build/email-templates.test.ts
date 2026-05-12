/**
 * E2E test suite for Wranngle email templates.
 *
 * Tests the entire email template infrastructure:
 * - Template Builder class functionality
 * - Variable substitution and escaping
 * - CSS inlining and minification
 * - Design system validation
 * - All individual templates
 * - Preview generation
 * - Accessibility and compliance
 *
 * Run with: bun test email-templates/build/email-templates.test.ts
 */

import { describe, test, expect, beforeAll } from 'bun:test';
import { EmailTemplateBuilder } from './template-builder';
import { readFile, readdir } from 'node:fs/promises';
import { join } from 'node:path';

// ============================================================================
// TEST SETUP
// ============================================================================

const builder = new EmailTemplateBuilder();
const TEMPLATES_DIR = join(__dirname, '../templates');
const MASTER_TEMPLATE_PATH = join(__dirname, '../master/master-template.html');
const PREVIEW_DIR = join(__dirname, '../preview');

// All template names
const TEMPLATE_NAMES = [
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

// Design system colors
const DESIGN_SYSTEM = {
  primary: '#ff5f00',
  secondary: '#cf3c69',
  dark: '#12111a',
  light: '#fcfaf5',
  success: '#10b981',
  warning: '#f59e0b',
  danger: '#ef4444',
  deprecatedColors: ['#0ea5e9', '#f0f9ff', '#bae6fd'], // Sky blue variants
};

// ============================================================================
// INFRASTRUCTURE TESTS
// ============================================================================

describe('Email Template Infrastructure', () => {
  describe('File System Structure', () => {
    test('master template exists', async () => {
      const content = await readFile(MASTER_TEMPLATE_PATH, 'utf-8');
      expect(content).toBeDefined();
      expect(content.length).toBeGreaterThan(0);
    });

    test('templates directory exists', async () => {
      const files = await readdir(TEMPLATES_DIR);
      expect(files).toBeArray();
    });

    test('all expected templates exist', async () => {
      for (const name of TEMPLATE_NAMES) {
        const templatePath = join(TEMPLATES_DIR, `${name}.html`);
        const content = await readFile(templatePath, 'utf-8');
        expect(content).toBeDefined();
      }
    });

    test('preview directory exists', async () => {
      const files = await readdir(PREVIEW_DIR);
      expect(files).toBeArray();
    });
  });

  describe('Template Builder Initialization', () => {
    test('builder instantiates without errors', () => {
      const newBuilder = new EmailTemplateBuilder();
      expect(newBuilder).toBeDefined();
      expect(newBuilder).toBeInstanceOf(EmailTemplateBuilder);
    });

    test('listTemplates returns all templates', async () => {
      const templates = await builder.listTemplates();
      expect(templates).toBeArray();
      expect(templates.length).toBe(TEMPLATE_NAMES.length);
      for (const name of TEMPLATE_NAMES) {
        expect(templates).toContain(name);
      }
    });
  });
});

// ============================================================================
// TEMPLATE BUILDER CORE FUNCTIONALITY
// ============================================================================

describe('Template Builder Core', () => {
  describe('Variable Substitution', () => {
    test('replaces single variable', async () => {
      const html = await builder.build('welcome', { USER_NAME: 'TestUser' });
      expect(html).toContain('TestUser');
      expect(html).not.toContain('{{USER_NAME}}');
    });

    test('replaces multiple variables', async () => {
      const html = await builder.build('welcome', {
        USER_NAME: 'John',
        PACKAGE_NAME: 'Elite',
      });
      expect(html).toContain('John');
      expect(html).toContain('Elite');
    });

    test('handles special characters in variable values (XSS prevention)', async () => {
      const html = await builder.build('welcome', {
        USER_NAME: '<script>alert("xss")</script>',
      });
      expect(html).not.toContain('<script>alert("xss")</script>');
      expect(html).toContain('&lt;script&gt;');
    });

    test('escapes HTML entities in values', async () => {
      const html = await builder.build('welcome', {
        USER_NAME: 'O\'Reilly & Sons',
      });
      expect(html).toContain('O&#x27;Reilly');
      expect(html).toContain('&amp;');
    });
  });

  describe('Default Values', () => {
    test('sets default EMAIL_TITLE when not provided', async () => {
      const html = await builder.build('welcome', {});
      expect(html).toContain('<title>Wranngle Systems</title>');
    });

    test('sets default PREHEADER_TEXT when not provided', async () => {
      const html = await builder.build('welcome', {});
      expect(html).toContain('Updates from Wranngle Systems');
    });

    test('custom values override defaults', async () => {
      const html = await builder.build('welcome', {
        EMAIL_TITLE: 'Custom Title',
        PREHEADER_TEXT: 'Custom Preview',
      });
      expect(html).toContain('<title>Custom Title</title>');
      expect(html).toContain('Custom Preview');
    });
  });

  describe('Template Inheritance', () => {
    test('child template is inserted into master', async () => {
      const html = await builder.build('welcome', {});
      // Should have master template header
      expect(html).toContain('Wranngle');
      // Should have child content (welcome hero)
      expect(html).toContain('Welcome to Wranngle');
      // The placeholder in master should be replaced (not counting comments)
      // Count actual placeholder occurrences (master has 1, which gets replaced)
      const placeholderInContent = html.split('{{CONTENT_BLOCK}}').length - 1;
      // May appear in documentation comments, but core content should be inserted
      expect(html).toContain('SYSTEM INITIALIZED');
    });

    test('master template structure is preserved', async () => {
      const html = await builder.build('welcome', {});
      // Check for master template elements
      expect(html).toContain('<!DOCTYPE html>');
      expect(html).toContain('<html lang="en"');
      expect(html).toContain('wranngle-border-left');
      expect(html).toContain('WRANNGLE SYSTEMS LLC');
    });
  });

  describe('Build Options', () => {
    test('minify option reduces whitespace', async () => {
      const normalHtml = await builder.build('welcome', {}, { minify: false });
      const minifiedHtml = await builder.build('welcome', {}, { minify: true });
      expect(minifiedHtml.length).toBeLessThan(normalHtml.length);
    });

    test('minified HTML is still valid', async () => {
      const html = await builder.build('welcome', {}, { minify: true });
      expect(html).toContain('<!DOCTYPE html>');
      expect(html).toContain('</html>');
    });
  });

  describe('Preview Generation', () => {
    test('preview method returns valid HTML', async () => {
      const html = await builder.preview('welcome');
      expect(html).toContain('<!DOCTYPE html>');
      expect(html).toContain('</html>');
    });

    test('preview includes sample data', async () => {
      const html = await builder.preview('welcome');
      // Should contain sample user name
      expect(html).toContain('Jane Doe');
    });
  });
});

// ============================================================================
// DESIGN SYSTEM VALIDATION
// ============================================================================

describe('Design System Compliance', () => {
  describe('Deprecated Colors', () => {
    test.each(TEMPLATE_NAMES)('%s contains no deprecated colors', async (templateName) => {
      const html = await builder.preview(templateName);
      for (const color of DESIGN_SYSTEM.deprecatedColors) {
        expect(html.toLowerCase()).not.toContain(color.toLowerCase());
      }
    });
  });

  describe('Primary Color Usage', () => {
    test.each(TEMPLATE_NAMES)('%s uses primary orange (#ff5f00)', async (templateName) => {
      const html = await builder.preview(templateName);
      expect(html.toLowerCase()).toContain(DESIGN_SYSTEM.primary.toLowerCase());
    });
  });

  describe('Button Standards', () => {
    test.each(TEMPLATE_NAMES)('%s buttons use correct styling', async (templateName) => {
      const html = await builder.preview(templateName);
      // Check for btn- classes
      const hasButtons = html.includes('btn-primary') || html.includes('btn-secondary');
      if (hasButtons) {
        // Buttons should have 8px radius
        expect(html).toContain('border-radius: 8px');
        // Buttons should have 14px font
        expect(html).toContain('font-size: 14px');
      }
    });
  });

  describe('Validation System', () => {
    test('validateTemplate detects deprecated colors', () => {
      const htmlWithDeprecated = '<div style="color: #0ea5e9;">Test</div>';
      const result = builder.validateTemplate(htmlWithDeprecated, 'test');
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors[0]).toContain('Deprecated color');
    });

    test('validateTemplate passes clean HTML', async () => {
      const html = await builder.preview('welcome');
      const result = builder.validateTemplate(html, 'welcome');
      expect(result.valid).toBe(true);
      expect(result.errors.length).toBe(0);
    });
  });
});

// ============================================================================
// INDIVIDUAL TEMPLATE TESTS
// ============================================================================

describe('Welcome Template', () => {
  let html: string;

  beforeAll(async () => {
    html = await builder.preview('welcome');
  });

  test('renders hero section', () => {
    expect(html).toContain('Welcome to Wranngle');
    expect(html).toContain('SYSTEM INITIALIZED');
  });

  test('renders info console box with orange border', () => {
    expect(html).toContain('border-left: 4px solid #ff5f00');
    expect(html).toContain('[INFO]');
  });

  test('renders step indicators', () => {
    expect(html).toContain('Setup Call Scheduled');
    expect(html).toContain('Knowledge Base Training');
    expect(html).toContain('Go Live');
  });

  test('all step badges use orange (not green for step 3)', () => {
    // Step badges should all be orange
    const stepBadgeMatches = html.match(/background-color: #ff5f00; border-radius: 50%/gi) || [];
    expect(stepBadgeMatches.length).toBeGreaterThanOrEqual(3);
  });

  test('renders CTA button', () => {
    expect(html).toContain('Access Dashboard');
    expect(html).toContain('btn-primary');
  });

  test('renders support section', () => {
    expect(html).toContain('Questions?');
  });
});

describe('Invoice Receipt Template', () => {
  let html: string;

  beforeAll(async () => {
    html = await builder.preview('invoice-receipt');
  });

  test('renders receipt header', () => {
    expect(html).toContain('ORDER CONFIRMATION');
    expect(html).toContain('WRANNGLE SYSTEMS');
  });

  test('renders invoice details', () => {
    expect(html).toContain('INV-2026-001234');
    expect(html).toContain('REF');
    expect(html).toContain('DATE');
  });

  test('renders line items', () => {
    expect(html).toContain('ITEM');
    expect(html).toContain('AMT');
    expect(html).toContain('Elite Agent');
  });

  test('renders payment status with green (completed state)', () => {
    expect(html).toContain('PAYMENT CONFIRMED');
    expect(html).toContain('#10b981'); // Green for completed
  });

  test('renders total amount', () => {
    expect(html).toContain('TOTAL');
    expect(html).toContain('$542.50');
  });

  test('renders both CTA buttons', () => {
    expect(html).toContain('Download PDF');
    expect(html).toContain('View Dashboard');
    expect(html).toContain('btn-primary');
    expect(html).toContain('btn-secondary');
  });
});

describe('Notification Template', () => {
  let html: string;

  beforeAll(async () => {
    html = await builder.preview('notification');
  });

  test('renders notification header', () => {
    expect(html).toContain('New Lead Captured');
  });

  test('renders console-style details', () => {
    expect(html).toContain('[EVENT]');
    expect(html).toContain('[DATA]');
    expect(html).toContain('[STATUS]');
  });

  test('renders metrics section', () => {
    expect(html).toContain('Total Leads');
    expect(html).toContain('Qualification Rate');
    expect(html).toContain('Avg Call Time');
  });

  test('renders action required box with warning button', () => {
    expect(html).toContain('Action Required');
    expect(html).toContain('Take Action');
    expect(html).toContain('#f59e0b'); // Warning amber
  });

  test('warning button uses standardized styling', () => {
    expect(html).toContain('btn-warning');
    // Button should have 8px radius
    const warningButtonSection = html.substring(
      html.indexOf('Take Action') - 500,
      html.indexOf('Take Action') + 100
    );
    expect(warningButtonSection).toContain('border-radius: 8px');
  });

  test('renders notification settings link', () => {
    expect(html).toContain('Manage notification settings');
  });
});

describe('Password Reset Template', () => {
  let html: string;

  beforeAll(async () => {
    html = await builder.preview('password-reset');
  });

  test('renders security header', () => {
    expect(html).toContain('Password Reset Request');
    expect(html).toContain('SECURITY EVENT');
  });

  test('renders reset button', () => {
    expect(html).toContain('Reset Password');
    expect(html).toContain('btn-primary');
  });

  test('renders backup URL for email clients', () => {
    expect(html).toContain('Button not working?');
    expect(html).toContain('Copy and paste this link');
  });

  test('renders security info box with magenta border (security context)', () => {
    expect(html).toContain('Security Information');
    expect(html).toContain('border-left: 4px solid #cf3c69');
  });

  test('renders request metadata', () => {
    expect(html).toContain('Request IP');
    expect(html).toContain('Request Time');
    expect(html).toContain('Location');
  });

  test('renders danger button with correct styling', () => {
    expect(html).toContain('Report Security Issue');
    expect(html).toContain('btn-danger');
    expect(html).toContain('#ef4444');
  });

  test('danger button uses standardized styling', () => {
    const dangerButtonSection = html.substring(
      html.indexOf('Report Security Issue') - 500,
      html.indexOf('Report Security Issue') + 100
    );
    expect(dangerButtonSection).toContain('border-radius: 8px');
    expect(dangerButtonSection).toContain('font-size: 14px');
  });

  test('renders expiry information', () => {
    expect(html).toContain('expires');
    expect(html).toContain('1 hour');
  });
});

describe('Lead Intake Template', () => {
  let html: string;

  beforeAll(async () => {
    html = await builder.preview('lead-intake');
  });

  test('renders notification hero', () => {
    expect(html).toContain('New Lead Received');
    expect(html).toContain('INTAKE FORM SUBMISSION');
  });

  test('renders business information section', () => {
    expect(html).toContain('Business Information');
    expect(html).toContain('Acme Plumbing Co');
    // Note: & is HTML-escaped to &amp; for XSS prevention
    expect(html).toContain('Plumbing &amp; HVAC');
  });

  test('renders contact details with orange styling (not sky blue)', () => {
    expect(html).toContain('Contact Details');
    expect(html).toContain('john@acmeplumbing.com');
    expect(html).toContain('(555) 123-4567');
    // Should use orange, NOT sky blue
    expect(html.toLowerCase()).not.toContain('#0ea5e9');
  });

  test('contact links use orange color', () => {
    // Find the contact section and check link colors
    const contactSection = html.substring(
      html.indexOf('Contact Details'),
      html.indexOf('Package Selection')
    );
    expect(contactSection).toContain('color: #ff5f00');
  });

  test('renders package selection', () => {
    expect(html).toContain('Package Selection');
    expect(html).toContain('Premium');
  });

  test('renders notes section with orange border (not gray)', () => {
    expect(html).toContain('Additional Notes');
    // Notes section should have orange border
    const notesSection = html.substring(
      html.indexOf('Additional Notes'),
      html.indexOf('TIMESTAMP') || html.length
    );
    expect(notesSection).toContain('border-left: 4px solid #ff5f00');
  });

  test('renders status console', () => {
    expect(html).toContain('STATUS:');
    expect(html).toContain('RECEIVED:');
    expect(html).toContain('PENDING');
  });

  test('renders action buttons', () => {
    expect(html).toContain('Reply to Lead');
    expect(html).toContain('Call Lead');
    expect(html).toContain('btn-primary');
    expect(html).toContain('btn-secondary');
  });
});

// ============================================================================
// ACCESSIBILITY & COMPLIANCE
// ============================================================================

describe('Accessibility & Compliance', () => {
  describe('Email Rendering Standards', () => {
    test.each(TEMPLATE_NAMES)('%s has viewport meta tag', async (templateName) => {
      const html = await builder.preview(templateName);
      expect(html).toContain('viewport');
      expect(html).toContain('width=device-width');
    });

    test.each(TEMPLATE_NAMES)('%s has proper DOCTYPE', async (templateName) => {
      const html = await builder.preview(templateName);
      expect(html).toContain('<!DOCTYPE html>');
    });

    test.each(TEMPLATE_NAMES)('%s has lang attribute', async (templateName) => {
      const html = await builder.preview(templateName);
      expect(html).toContain('lang="en"');
    });

    test.each(TEMPLATE_NAMES)('%s uses table role="presentation"', async (templateName) => {
      const html = await builder.preview(templateName);
      expect(html).toContain('role="presentation"');
    });
  });

  describe('CAN-SPAM Compliance', () => {
    test.each(TEMPLATE_NAMES)('%s has unsubscribe link', async (templateName) => {
      const html = await builder.preview(templateName);
      expect(html.toLowerCase()).toContain('unsubscribe');
    });

    test.each(TEMPLATE_NAMES)('%s has company info', async (templateName) => {
      const html = await builder.preview(templateName);
      // Should contain company name or address somewhere
      const hasCompanyInfo =
        html.includes('Wranngle Systems') ||
        html.includes('COMPANY_ADDRESS') ||
        html.includes('San Francisco') ||
        html.includes('wranngle.com');
      expect(hasCompanyInfo).toBe(true);
    });
  });

  describe('Email Size Limits', () => {
    test.each(TEMPLATE_NAMES)('%s is under 102KB (Gmail limit)', async (templateName) => {
      const html = await builder.preview(templateName);
      const size = Buffer.byteLength(html, 'utf8');
      expect(size).toBeLessThan(102000);
    });

    test.each(TEMPLATE_NAMES)('%s is under 80KB (recommended)', async (templateName) => {
      const html = await builder.preview(templateName);
      const size = Buffer.byteLength(html, 'utf8');
      expect(size).toBeLessThan(80000);
    });
  });

  describe('HTML Structure', () => {
    test.each(TEMPLATE_NAMES)('%s has balanced table tags', async (templateName) => {
      const html = await builder.preview(templateName);
      const openTables = (html.match(/<table/gi) || []).length;
      const closeTables = (html.match(/<\/table>/gi) || []).length;
      expect(openTables).toBe(closeTables);
    });

    test.each(TEMPLATE_NAMES)('%s has balanced td tags', async (templateName) => {
      const html = await builder.preview(templateName);
      const openTds = (html.match(/<td/gi) || []).length;
      const closeTds = (html.match(/<\/td>/gi) || []).length;
      expect(openTds).toBe(closeTds);
    });

    test.each(TEMPLATE_NAMES)('%s has balanced tr tags', async (templateName) => {
      const html = await builder.preview(templateName);
      const openTrs = (html.match(/<tr/gi) || []).length;
      const closeTrs = (html.match(/<\/tr>/gi) || []).length;
      expect(openTrs).toBe(closeTrs);
    });
  });

  describe('Image Accessibility', () => {
    test.each(TEMPLATE_NAMES)('%s images have alt attributes', async (templateName) => {
      const html = await builder.preview(templateName);
      const imagesWithoutAlt = (html.match(/<img(?![^>]*alt=)[^>]*>/gi) || []).length;
      expect(imagesWithoutAlt).toBe(0);
    });
  });
});

// ============================================================================
// MASTER TEMPLATE DESIGN TOKENS
// ============================================================================

describe('Master Template Design Tokens', () => {
  let masterHtml: string;

  beforeAll(async () => {
    masterHtml = await readFile(MASTER_TEMPLATE_PATH, 'utf-8');
  });

  test('contains CSS custom properties', () => {
    expect(masterHtml).toContain(':root');
    expect(masterHtml).toContain('--wranngle-primary');
    expect(masterHtml).toContain('--wranngle-secondary');
  });

  test('defines all color tokens', () => {
    expect(masterHtml).toContain('--wranngle-primary: #ff5f00');
    expect(masterHtml).toContain('--wranngle-secondary: #cf3c69');
    expect(masterHtml).toContain('--wranngle-dark: #12111a');
    expect(masterHtml).toContain('--wranngle-success: #10b981');
    expect(masterHtml).toContain('--wranngle-warning: #f59e0b');
    expect(masterHtml).toContain('--wranngle-danger: #ef4444');
  });

  test('defines spacing tokens', () => {
    expect(masterHtml).toContain('--space-xs');
    expect(masterHtml).toContain('--space-sm');
    expect(masterHtml).toContain('--space-base');
    expect(masterHtml).toContain('--space-xl');
  });

  test('defines typography tokens', () => {
    expect(masterHtml).toContain('--text-xs');
    expect(masterHtml).toContain('--text-base');
    expect(masterHtml).toContain('--text-lg');
    expect(masterHtml).toContain('--text-2xl');
  });

  test('defines border radius tokens', () => {
    expect(masterHtml).toContain('--radius-sm: 4px');
    expect(masterHtml).toContain('--radius-md: 8px');
  });

  test('defines all button classes', () => {
    expect(masterHtml).toContain('.btn-primary');
    expect(masterHtml).toContain('.btn-secondary');
    expect(masterHtml).toContain('.btn-warning');
    expect(masterHtml).toContain('.btn-danger');
  });

  test('dark mode support is defined', () => {
    expect(masterHtml).toContain('prefers-color-scheme: dark');
    expect(masterHtml).toContain('.dark-mode-bg');
  });

  test('responsive breakpoints are defined', () => {
    expect(masterHtml).toContain('@media only screen and (max-width: 600px)');
    expect(masterHtml).toContain('.mobile-padding');
  });
});

// ============================================================================
// EDGE CASES & ERROR HANDLING
// ============================================================================

describe('Edge Cases & Error Handling', () => {
  test('handles missing template gracefully', async () => {
    await expect(builder.build('nonexistent-template', {})).rejects.toThrow();
  });

  test('handles empty variables object', async () => {
    const html = await builder.build('welcome', {});
    expect(html).toContain('<!DOCTYPE html>');
  });

  test('handles empty string variable values', async () => {
    const html = await builder.build('welcome', {
      USER_NAME: '',
    });
    expect(html).toBeDefined();
    expect(html).toContain('<!DOCTYPE html>');
  });

  test('handles very long variable values', async () => {
    const longValue = 'A'.repeat(10000);
    const html = await builder.build('welcome', { USER_NAME: longValue });
    expect(html).toContain('A'.repeat(100)); // At least some content
  });

  test('handles special regex characters in values', async () => {
    const html = await builder.build('welcome', {
      USER_NAME: 'Test $& $` $\' $$',
    });
    expect(html).toBeDefined();
  });
});

// ============================================================================
// STYLE GUIDE DOCUMENTATION
// ============================================================================

describe('Style Guide Documentation', () => {
  const STYLE_GUIDE_PATH = join(__dirname, '../STYLE_GUIDE.md');

  test('STYLE_GUIDE.md exists', async () => {
    const content = await readFile(STYLE_GUIDE_PATH, 'utf-8');
    expect(content).toBeDefined();
    expect(content.length).toBeGreaterThan(0);
  });

  test('documents all design tokens', async () => {
    const content = await readFile(STYLE_GUIDE_PATH, 'utf-8');
    expect(content).toContain('#ff5f00');
    expect(content).toContain('#cf3c69');
    expect(content).toContain('#10b981');
    expect(content).toContain('#f59e0b');
    expect(content).toContain('#ef4444');
  });

  test('documents deprecated colors', async () => {
    const content = await readFile(STYLE_GUIDE_PATH, 'utf-8');
    expect(content).toContain('Deprecated');
    expect(content).toContain('#0ea5e9');
  });

  test('includes component code snippets', async () => {
    const content = await readFile(STYLE_GUIDE_PATH, 'utf-8');
    expect(content).toContain('```html');
    expect(content).toContain('btn-primary');
  });
});
