#!/usr/bin/env bun

/**
 * E2E Test: Universal Message Sender (Phase 4.1)
 * Tests all 10 message templates via n8n workflow
 * Usage: bun run scripts/test-rcs-via-n8n.ts [phone-number]
 */

const TEST_PHONE = process.argv[2] || process.env.TEST_PHONE_NUMBER;
const WEBHOOK_URL =
  process.env.N8N_WEBHOOK_URL ||
  'https://n8n.wranngle.com/webhook/universal-message-v1';
const WEBHOOK_SECRET = process.env.N8N_WEBHOOK_SECRET;
const {TWILIO_ACCOUNT_SID} = process.env;
const {TWILIO_AUTH_TOKEN} = process.env;

if (!TEST_PHONE) {
  console.error(
    '❌ Missing test phone: pass as argv[2] or set TEST_PHONE_NUMBER',
  );
  process.exit(1);
}

if (!WEBHOOK_SECRET) {
  console.error('❌ Missing required environment variable: N8N_WEBHOOK_SECRET');
  process.exit(1);
}

interface TestCase {
  template: string;
  variables: Record<string, string>;
  channel: 'auto' | 'sms' | 'rcs';
  expectedContent: string[];
}

const TEST_CASES: TestCase[] = [
  {
    template: 'welcome',
    channel: 'auto',
    variables: {
      FIRST_NAME: 'Cody',
      PACKAGE: 'Elite Agent',
    },
    expectedContent: ['Cody', 'Elite Agent', 'LIVE'],
  },
  {
    template: 'invoice-receipt',
    channel: 'auto',
    variables: {
      FIRST_NAME: 'Cody',
      AMOUNT: '542.50',
      INVOICE_ID: 'INV-2026-001',
    },
    expectedContent: ['542.50', 'INV-2026-001', 'Payment'],
  },
  {
    template: 'notification',
    channel: 'auto',
    variables: {
      EVENT_TYPE: 'Agent Status',
      EVENT_DATA: 'Your agent is now online and taking calls',
    },
    expectedContent: ['Agent Status', 'online'],
  },
  {
    template: 'password-reset',
    channel: 'auto',
    variables: {
      RESET_URL: 'https://wranngle.com/reset/abc123',
      EXPIRY_TIME: '30 minutes',
    },
    expectedContent: ['Reset', 'password', '30 minutes'],
  },
  {
    template: 'lead-intake',
    channel: 'auto',
    variables: {
      BUSINESS_NAME: 'ABC Plumbing',
      INDUSTRY: 'Plumbing',
      OWNER_NAME: 'John Smith',
      PHONE: '+15551234567',
    },
    expectedContent: ['ABC Plumbing', 'John Smith', 'Plumbing'],
  },
  {
    template: 'sales-cold-outreach',
    channel: 'auto',
    variables: {
      FIRST_NAME: 'Sarah',
      COMPANY: 'Smith HVAC',
      REP_NAME: 'Tom from Wranngle',
    },
    expectedContent: ['Sarah', 'Smith HVAC', 'Demo'],
  },
  {
    template: 'sales-demo-followup',
    channel: 'auto',
    variables: {
      FIRST_NAME: 'Mike',
      REP_EMAIL: 'sales@wranngle.com',
    },
    expectedContent: ['Mike', 'demo', 'sales@wranngle.com'],
  },
  {
    template: 'sales-proposal-sent',
    channel: 'auto',
    variables: {
      FIRST_NAME: 'Lisa',
      PACKAGE: 'Professional Package',
      PRICE: '299',
    },
    expectedContent: ['Lisa', 'Professional Package', '$299'],
  },
  {
    template: 'sales-quote-followup',
    channel: 'auto',
    variables: {
      FIRST_NAME: 'David',
      QUOTE_ID: 'Q-2026-042',
      REP_NAME: 'Emily',
    },
    expectedContent: ['David', 'Q-2026-042', 'Emily'],
  },
  {
    template: 'sales-winback',
    channel: 'auto',
    variables: {
      FIRST_NAME: 'Jennifer',
      NEW_FEATURE_1: 'RCS messaging',
      NEW_FEATURE_2: 'branded agents',
    },
    expectedContent: ['Jennifer', 'RCS messaging', 'branded agents'],
  },
];

interface TestResult {
  template: string;
  success: boolean;
  messageSid?: string;
  error?: string;
  deliveryStatus?: string;
  channel?: string;
  duration: number;
}

async function sendMessage(
  testCase: TestCase,
): Promise<{messageSid?: string; error?: string}> {
  const response = await fetch(WEBHOOK_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Webhook-Secret': WEBHOOK_SECRET,
    },
    body: JSON.stringify({
      phone_number: TEST_PHONE,
      channel: testCase.channel,
      template: testCase.template,
      variables: testCase.variables,
    }),
  });

  const data = await response.json();

  if (!response.ok || !data.success) {
    return {error: data.message || data.error || 'Unknown error'};
  }

  return {messageSid: data.message_sid};
}

async function verifyDelivery(
  messageSid: string,
): Promise<{status: string; channel: string}> {
  // Wait 2 seconds for Twilio to process
  await new Promise((resolve) => {
    setTimeout(resolve, 2000);
  });

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
    channel: data.num_segments > 0 ? 'SMS' : 'RCS', // Simplified detection
  };
}

async function runTest(testCase: TestCase): Promise<TestResult> {
  const startTime = Date.now();

  try {
    console.log(`\n📤 Testing: ${testCase.template}`);
    console.log(`   Variables: ${JSON.stringify(testCase.variables)}`);

    const result = await sendMessage(testCase);

    if (result.error) {
      return {
        template: testCase.template,
        success: false,
        error: result.error,
        duration: Date.now() - startTime,
      };
    }

    console.log(`   ✅ Sent! SID: ${result.messageSid}`);

    // Verify delivery
    const delivery = await verifyDelivery(result.messageSid!);
    console.log(`   📊 Status: ${delivery.status} via ${delivery.channel}`);

    return {
      template: testCase.template,
      success:
        delivery.status === 'delivered' ||
        delivery.status === 'sent' ||
        delivery.status === 'accepted' ||
        delivery.status === 'queued',
      messageSid: result.messageSid,
      deliveryStatus: delivery.status,
      channel: delivery.channel,
      duration: Date.now() - startTime,
    };
  } catch (error) {
    return {
      template: testCase.template,
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      duration: Date.now() - startTime,
    };
  }
}

async function runAllTests(): Promise<void> {
  console.log('🚀 Starting E2E Test: Universal Message Sender');
  console.log(`📱 Target phone: ${TEST_PHONE}`);
  console.log(`🌐 Webhook: ${WEBHOOK_URL}`);
  console.log('='.repeat(60));

  if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN) {
    console.error('❌ Missing Twilio credentials in environment');
    process.exit(1);
  }

  const results: TestResult[] = [];

  for (const testCase of TEST_CASES) {
    const result = await runTest(testCase);
    results.push(result);

    // Wait 1 second between tests to avoid rate limits
    await new Promise((resolve) => {
      setTimeout(resolve, 1000);
    });
  }

  // Print summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 TEST SUMMARY');
  console.log('='.repeat(60));

  const successful = results.filter((r) => r.success);
  const failed = results.filter((r) => !r.success);

  console.log(`\n✅ Successful: ${successful.length}/${results.length}`);
  console.log(`❌ Failed: ${failed.length}/${results.length}`);

  if (successful.length > 0) {
    console.log('\n✅ PASSED:');
    for (const result of successful) {
      console.log(
        `   • ${result.template.padEnd(25)} ${result.deliveryStatus?.padEnd(12)} ${result.channel} (${result.duration}ms)`,
      );
    }
  }

  if (failed.length > 0) {
    console.log('\n❌ FAILED:');
    for (const result of failed) {
      console.log(`   • ${result.template.padEnd(25)} ${result.error}`);
    }
  }

  // Print next steps
  console.log('\n' + '='.repeat(60));
  console.log('📋 NEXT STEPS (Phase 4.2):');
  console.log('='.repeat(60));
  console.log('1. Log into Twilio Console: https://console.twilio.com/');
  console.log('2. Navigate to: Messaging > Logs > Messages');
  console.log('3. Filter: Last 1 hour');
  console.log('4. Verify all messages show:');
  console.log('   • Status: "delivered" (green)');
  console.log('   • Channel: "RCS" (not "SMS")');
  console.log('   • Body: Correct template content');
  console.log('5. Screenshot for evidence');
  console.log(
    '\nNote: RCS may fall back to SMS if recipient device does not support RCS.',
  );

  process.exit(failed.length > 0 ? 1 : 0);
}

runAllTests().catch((error) => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});
