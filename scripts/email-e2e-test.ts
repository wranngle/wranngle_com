/**
 * E2E Email Template Sausage Factory
 *
 * Sends ALL email template types through SMTP2GO and validates:
 * 1. Delivery to inbox
 * 2. No deprecated colors
 * 3. Design system compliance
 * 4. Correct structure
 *
 * Run: bun run test:email:e2e
 */

import {EmailTemplateBuilder} from '../email-templates/build/template-builder';

const {SMTP2GO_API_KEY} = process.env;
if (!SMTP2GO_API_KEY) {
  console.error('❌ Missing required environment variable: SMTP2GO_API_KEY');
  process.exit(1);
}

const TEST_RECIPIENT =
  process.env.TEST_RECIPIENT_EMAIL || 'noreply@wranngle.com';
const FROM_EMAIL = process.env.FROM_EMAIL || 'noreply@wranngle.com';

// Design system validation
const DEPRECATED_COLORS = ['#0ea5e9', '#f0f9ff', '#bae6fd'];
const REQUIRED_COLORS = ['#ff5f00', '#12111a'];

interface TemplateTestConfig {
  name: string;
  subject: string;
  variables: Record<string, string>;
}

// Test configurations for each template type
const TEMPLATE_CONFIGS: TemplateTestConfig[] = [
  {
    name: 'welcome',
    subject: '[E2E TEST] Welcome Email',
    variables: {
      USER_NAME: 'E2E Test User',
      PACKAGE_NAME: 'Elite Agent',
      DASHBOARD_URL: 'https://wranngle.com/dashboard',
      EMAIL_TITLE: '[E2E TEST] Welcome to Wranngle',
      PREHEADER_TEXT: 'E2E Test - Your AI agent is ready',
    },
  },
  {
    name: 'invoice-receipt',
    subject: '[E2E TEST] Invoice Receipt',
    variables: {
      USER_NAME: 'E2E Test User',
      USER_EMAIL: TEST_RECIPIENT,
      INVOICE_ID: 'E2E-TEST-001',
      INVOICE_DATE: new Date().toISOString().split('T')[0],
      ITEM_NAME: 'Elite Agent - Monthly',
      ITEM_DESCRIPTION: 'E2E Test Item',
      ITEM_AMOUNT: '500.00',
      SUBTOTAL: '500.00',
      TAX_RATE: '0',
      TAX_AMOUNT: '0.00',
      TOTAL_AMOUNT: '500.00',
      PAYMENT_METHOD: 'Test Card ****4242',
      BILLING_FREQUENCY: 'Monthly',
      INVOICE_PDF_URL: 'https://wranngle.com/test.pdf',
      DASHBOARD_URL: 'https://wranngle.com/dashboard',
      EMAIL_TITLE: '[E2E TEST] Invoice from Wranngle',
      PREHEADER_TEXT: 'E2E Test - Payment confirmed',
    },
  },
  {
    name: 'notification',
    subject: '[E2E TEST] System Notification',
    variables: {
      USER_NAME: 'E2E Test User',
      NOTIFICATION_TITLE: 'E2E Test Notification',
      NOTIFICATION_TIMESTAMP: new Date().toISOString(),
      NOTIFICATION_MESSAGE: 'This is an automated E2E test notification.',
      EVENT_TYPE: 'E2E_TEST',
      EVENT_DATA: 'Test data payload',
      EVENT_STATUS: 'TESTING',
      METRIC_1_VALUE: '42',
      METRIC_1_LABEL: 'Tests Run',
      METRIC_2_VALUE: '100%',
      METRIC_2_LABEL: 'Pass Rate',
      METRIC_3_VALUE: '0',
      METRIC_3_LABEL: 'Failures',
      ACTION_MESSAGE: 'This is a test action message.',
      ACTION_URL: 'https://wranngle.com/test',
      CTA_TEXT: 'View Test Results',
      CTA_URL: 'https://wranngle.com/test',
      SETTINGS_URL: 'https://wranngle.com/settings',
      DASHBOARD_URL: 'https://wranngle.com/dashboard',
      EMAIL_TITLE: '[E2E TEST] Notification',
      PREHEADER_TEXT: 'E2E Test - System notification',
    },
  },
  {
    name: 'password-reset',
    subject: '[E2E TEST] Password Reset',
    variables: {
      USER_NAME: 'E2E Test User',
      USER_EMAIL: TEST_RECIPIENT,
      RESET_URL: 'https://wranngle.com/reset?token=e2e-test',
      EXPIRY_TIME: '1 hour',
      EXPIRY_TIMESTAMP: new Date(Date.now() + 3_600_000).toISOString(),
      REQUEST_IP: '127.0.0.1',
      REQUEST_TIME: new Date().toISOString(),
      REQUEST_LOCATION: 'E2E Test Server',
      EMAIL_TITLE: '[E2E TEST] Reset Your Password',
      PREHEADER_TEXT: 'E2E Test - Password reset requested',
    },
  },
  {
    name: 'lead-intake',
    subject: '[E2E TEST] New Lead Intake',
    variables: {
      BUSINESS_NAME: 'E2E Test Company',
      INDUSTRY: 'Software Testing',
      OWNER_NAME: 'E2E Test Owner',
      EMAIL: 'e2e-test@example.com',
      PHONE: '+1-555-TEST',
      PACKAGE: 'E2E Test Package',
      AGENT_NAME: 'TestBot',
      NOTES: 'This is an automated E2E test lead.',
      STATUS: 'E2E_TEST',
      TIMESTAMP: new Date().toISOString(),
      EMAIL_TITLE: '[E2E TEST] New Lead',
      PREHEADER_TEXT: 'E2E Test - Lead intake',
    },
  },
];

interface SendResult {
  template: string;
  success: boolean;
  messageId?: string;
  error?: string;
  htmlSize: number;
  validationErrors: string[];
  validationWarnings: string[];
}

async function sendEmail(
  to: string,
  subject: string,
  html: string,
): Promise<{success: boolean; messageId?: string; error?: string}> {
  const response = await fetch('https://api.smtp2go.com/v3/email/send', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({
      api_key: SMTP2GO_API_KEY,
      sender: FROM_EMAIL,
      to: [to],
      subject,
      html_body: html,
    }),
  });

  const data = (await response.json()) as {
    data?: {succeeded?: number; email_id?: string};
    request_id?: string;
  };

  if (data.data?.succeeded === 1) {
    return {success: true, messageId: data.data.email_id || data.request_id};
  }

  return {success: false, error: JSON.stringify(data)};
}

function validateHtml(
  html: string,
  templateName: string,
): {errors: string[]; warnings: string[]} {
  const errors: string[] = [];
  const warnings: string[] = [];
  const htmlLower = html.toLowerCase();

  // Check for deprecated colors
  for (const color of DEPRECATED_COLORS) {
    if (htmlLower.includes(color.toLowerCase())) {
      errors.push(`Deprecated color ${color} found in ${templateName}`);
    }
  }

  // Check for required colors
  for (const color of REQUIRED_COLORS) {
    if (!htmlLower.includes(color.toLowerCase())) {
      warnings.push(`Required color ${color} not found in ${templateName}`);
    }
  }

  // Check button standards
  if (html.includes('btn-primary') || html.includes('btn-secondary')) {
    if (!html.includes('border-radius: 8px')) {
      warnings.push(`Button border-radius may not be 8px in ${templateName}`);
    }

    if (!html.includes('font-size: 14px')) {
      warnings.push(`Button font-size may not be 14px in ${templateName}`);
    }
  }

  // Check for unsubscribe link
  if (!htmlLower.includes('unsubscribe')) {
    errors.push(`Missing unsubscribe link in ${templateName}`);
  }

  // Check HTML structure
  const openTables = (html.match(/<table/gi) || []).length;
  const closeTables = (html.match(/<\/table>/gi) || []).length;
  if (openTables !== closeTables) {
    errors.push(
      `Unbalanced table tags in ${templateName}: ${openTables} open, ${closeTables} close`,
    );
  }

  return {errors, warnings};
}

async function runE2ETests(): Promise<void> {
  console.log(
    '═══════════════════════════════════════════════════════════════',
  );
  console.log('  EMAIL TEMPLATE E2E SAUSAGE FACTORY');
  console.log(
    '═══════════════════════════════════════════════════════════════',
  );
  console.log(`  Recipient: ${TEST_RECIPIENT}`);
  console.log(`  Templates: ${TEMPLATE_CONFIGS.length}`);
  console.log(`  Timestamp: ${new Date().toISOString()}`);
  console.log(
    '═══════════════════════════════════════════════════════════════\n',
  );

  const builder = new EmailTemplateBuilder();
  const results: SendResult[] = [];
  const testRunId = Date.now();

  for (const config of TEMPLATE_CONFIGS) {
    console.log(`📧 Testing: ${config.name}`);

    try {
      // Build template
      const html = await builder.build(config.name, config.variables, {
        inlineCSS: true,
      });

      // Validate HTML
      const validation = validateHtml(html, config.name);

      // Add test run ID to subject for tracking
      const subject = `${config.subject} [${testRunId}]`;

      // Send email
      console.log(`   📤 Sending...`);
      const sendResult = await sendEmail(TEST_RECIPIENT, subject, html);

      const result: SendResult = {
        template: config.name,
        success: sendResult.success && validation.errors.length === 0,
        messageId: sendResult.messageId,
        error: sendResult.error,
        htmlSize: html.length,
        validationErrors: validation.errors,
        validationWarnings: validation.warnings,
      };

      results.push(result);

      if (result.success) {
        console.log(
          `   ✅ Sent (${result.htmlSize} bytes, ID: ${result.messageId})`,
        );
      } else {
        console.log(
          `   ❌ Failed: ${result.error || result.validationErrors.join(', ')}`,
        );
      }

      if (validation.warnings.length > 0) {
        console.log(`   ⚠️  Warnings: ${validation.warnings.join(', ')}`);
      }
    } catch (error) {
      results.push({
        template: config.name,
        success: false,
        error: String(error),
        htmlSize: 0,
        validationErrors: [String(error)],
        validationWarnings: [],
      });
      console.log(`   ❌ Error: ${error}`);
    }

    console.log('');
  }

  // Wait for delivery
  console.log('⏳ Waiting 5 seconds for email delivery...\n');
  await new Promise((resolve) => {
    setTimeout(resolve, 5000);
  });

  // Summary
  console.log(
    '═══════════════════════════════════════════════════════════════',
  );
  console.log('  RESULTS');
  console.log(
    '═══════════════════════════════════════════════════════════════\n',
  );

  const passed = results.filter((r) => r.success);
  const failed = results.filter((r) => !r.success);

  console.log('┌─────────────────┬────────┬───────────┬─────────────────────┐');
  console.log('│ Template        │ Status │ Size      │ Message ID          │');
  console.log('├─────────────────┼────────┼───────────┼─────────────────────┤');

  for (const r of results) {
    const status = r.success ? '✅' : '❌';
    const size = `${Math.round(r.htmlSize / 1024)}KB`.padEnd(9);
    const msgId = (r.messageId || r.error || 'N/A').slice(0, 19).padEnd(19);
    const name = r.template.padEnd(15);
    console.log(`│ ${name} │ ${status}     │ ${size} │ ${msgId} │`);
  }

  console.log(
    '└─────────────────┴────────┴───────────┴─────────────────────┘\n',
  );

  // Validation summary
  const allErrors = results.flatMap((r) => r.validationErrors);
  const allWarnings = results.flatMap((r) => r.validationWarnings);

  if (allErrors.length > 0) {
    console.log('❌ VALIDATION ERRORS:');
    for (const e of allErrors) console.log(`   - ${e}`);
    console.log('');
  }

  if (allWarnings.length > 0) {
    console.log('⚠️  VALIDATION WARNINGS:');
    for (const w of allWarnings) console.log(`   - ${w}`);
    console.log('');
  }

  // Final verdict
  console.log(
    '═══════════════════════════════════════════════════════════════',
  );
  if (failed.length === 0) {
    console.log(`✅ ALL ${results.length} TEMPLATES PASSED`);
    console.log(`   Test Run ID: ${testRunId}`);
    console.log(
      `   Check inbox for emails with subject containing [${testRunId}]`,
    );
  } else {
    console.log(`❌ ${failed.length}/${results.length} TEMPLATES FAILED`);
    console.log(`   Failed: ${failed.map((r) => r.template).join(', ')}`);
  }

  console.log(
    '═══════════════════════════════════════════════════════════════',
  );

  // Output test run ID for inbox validation
  console.log(`\n📬 To validate in inbox, search for: [${testRunId}]`);

  process.exit(failed.length > 0 ? 1 : 0);
}

runE2ETests().catch((error) => {
  console.error('❌ E2E test failed:', error);
  process.exit(1);
});
