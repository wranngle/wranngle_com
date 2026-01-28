#!/usr/bin/env bun
/**
 * SMS Test Script - Send all 10 message templates
 *
 * This script uses the MessageBuilder to generate messages
 * and sends them via Twilio API without shell escaping issues.
 */

import { MessageBuilder } from '../email-templates/sms/build/message-builder';

const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID || 'ACb9a3b7df2dfe607099bd0ce0e6ae47e1';
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN || 'a5d7bfaa399fae6df2ef2f572e7f06fb';
const TWILIO_FROM_NUMBER = process.env.TWILIO_FROM_NUMBER || '+18882662193';
const TEST_PHONE = process.env.TEST_PHONE_CODY || '+12602217355';

interface SendResult {
  template: string;
  success: boolean;
  sid?: string;
  error?: string;
  body: string;
  characterCount: number;
}

async function sendSms(to: string, body: string): Promise<{ success: boolean; sid?: string; error?: string }> {
  const url = `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`;

  const credentials = Buffer.from(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`).toString('base64');

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${credentials}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      To: to,
      From: TWILIO_FROM_NUMBER,
      Body: body,
    }),
  });

  const data = await response.json();

  if (response.ok) {
    return { success: true, sid: data.sid };
  }

  return { success: false, error: data.message || 'Unknown error' };
}

async function main() {
  console.log('=== SMS Test: All 10 Templates ===\n');
  console.log(`Target Phone: ${TEST_PHONE}`);
  console.log(`From Number: ${TWILIO_FROM_NUMBER}\n`);

  const builder = new MessageBuilder();
  const templates = builder.listTemplates();
  const results: SendResult[] = [];

  // Custom sample data with Cody's name
  const sampleData: Record<string, Record<string, string>> = {
    welcome: {
      FIRST_NAME: 'Cody',
      PACKAGE: 'Elite Agent',
      DASHBOARD_URL: 'https://wranngle.com/dashboard',
      SHORT_URL: 'wranngl.co/dash',
    },
    'invoice-receipt': {
      FIRST_NAME: 'Cody',
      AMOUNT: '542.50',
      INVOICE_ID: 'INV-2026-001234',
      INVOICE_URL: 'https://wranngle.com/invoices/INV-2026-001234',
      SHORT_URL: 'wranngl.co/inv123',
    },
    notification: {
      FIRST_NAME: 'Cody',
      EVENT_TYPE: 'LEAD_CAPTURED',
      EVENT_DATA: 'John Smith (555) 123-4567',
      NOTIFICATION_TITLE: 'New Lead Captured',
      NOTIFICATION_MESSAGE: 'Your AI agent captured a new qualified lead.',
      TIMESTAMP: '2026-01-24 14:32 PST',
      CTA_URL: 'https://wranngle.com/leads/123',
      SHORT_URL: 'wranngl.co/lead123',
    },
    'password-reset': {
      FIRST_NAME: 'Cody',
      RESET_URL: 'https://wranngle.com/reset?token=abc123',
      EXPIRY_TIME: '1 hour',
      SHORT_URL: 'wranngl.co/reset123',
    },
    'lead-intake': {
      FIRST_NAME: 'Cody',
      BUSINESS_NAME: 'Acme Plumbing',
      INDUSTRY: 'HVAC',
      OWNER_NAME: 'John Smith',
      PHONE: '(555) 123-4567',
      STATUS: 'PENDING',
      PACKAGE: 'Premium',
      SHORT_URL: 'wranngl.co/lead456',
    },
    'sales-cold-outreach': {
      FIRST_NAME: 'Cody',
      COMPANY: 'Acme Corp',
      REP_NAME: 'Alex',
      CALENDAR_URL: 'https://cal.com/wranngle/intro',
      SHORT_URL: 'wranngl.co/demo',
    },
    'sales-demo-followup': {
      FIRST_NAME: 'Cody',
      REP_EMAIL: 'alex@wranngle.com',
      RECORDING_URL: 'https://wranngle.com/demos/abc123',
      PROPOSAL_URL: 'https://wranngle.com/proposals/PROP-001',
      SHORT_URL: 'wranngl.co/rec123',
    },
    'sales-proposal-sent': {
      FIRST_NAME: 'Cody',
      PACKAGE: 'Elite Agent',
      PRICE: '$500',
      VALID_UNTIL: 'February 1, 2026',
      PROPOSAL_URL: 'https://wranngle.com/proposals/PROP-001',
      REP_PHONE: '+15551234567',
      SHORT_URL: 'wranngl.co/prop001',
    },
    'sales-quote-followup': {
      FIRST_NAME: 'Cody',
      QUOTE_ID: 'QT-2026-0089',
      REP_NAME: 'Alex',
      QUOTE_URL: 'https://wranngle.com/quotes/QT-2026-0089',
      REP_CALENDAR: 'https://cal.com/wranngle/questions',
      SHORT_URL: 'wranngl.co/quote089',
    },
    'sales-winback': {
      FIRST_NAME: 'Cody',
      NEW_FEATURE_1: 'SMS Agents',
      NEW_FEATURE_2: 'CRM Integrations',
      SPECIAL_OFFER: '20% off first month',
      CALENDAR_URL: 'https://cal.com/wranngle/reconnect',
      SHORT_URL: 'wranngl.co/wb2026',
    },
  };

  for (const templateName of templates) {
    const variables = sampleData[templateName] || { FIRST_NAME: 'Cody' };

    try {
      const message = await builder.build(templateName, {
        channel: 'sms',
        variables,
      });

      console.log(`\n[${templateName}]`);
      console.log(`  Body: "${message.body}"`);
      console.log(`  Chars: ${message.characterCount}`);

      const sendResult = await sendSms(TEST_PHONE, message.body);

      if (sendResult.success) {
        console.log(`  ✓ Sent (SID: ${sendResult.sid})`);
        results.push({
          template: templateName,
          success: true,
          sid: sendResult.sid,
          body: message.body,
          characterCount: message.characterCount,
        });
      } else {
        console.log(`  ✗ Failed: ${sendResult.error}`);
        results.push({
          template: templateName,
          success: false,
          error: sendResult.error,
          body: message.body,
          characterCount: message.characterCount,
        });
      }

      // Small delay between messages
      await new Promise((resolve) => setTimeout(resolve, 500));
    } catch (error) {
      console.log(`  ✗ Error: ${error}`);
      results.push({
        template: templateName,
        success: false,
        error: String(error),
        body: '',
        characterCount: 0,
      });
    }
  }

  // Summary
  console.log('\n=== Summary ===');
  const successful = results.filter((r) => r.success);
  const failed = results.filter((r) => !r.success);

  console.log(`Sent: ${successful.length}/${templates.length}`);

  if (failed.length > 0) {
    console.log('\nFailed:');
    for (const f of failed) {
      console.log(`  - ${f.template}: ${f.error}`);
    }
  }

  console.log('\nMessage SIDs:');
  for (const s of successful) {
    console.log(`  ${s.template}: ${s.sid}`);
  }
}

main().catch(console.error);
