# Email Template Integration Examples

This document provides practical examples for integrating the email template system into your Wranngle application.

## Table of Contents

1. [Basic Integration](#basic-integration)
2. [Cloudflare Pages Functions](#cloudflare-pages-functions)
3. [n8n Workflow Integration](#n8n-workflow-integration)
4. [SendGrid Integration](#sendgrid-integration)
5. [Error Handling](#error-handling)
6. [Testing](#testing)

---

## Basic Integration

### Send Welcome Email

```typescript
import { EmailTemplateBuilder } from './email-templates/build/template-builder';

async function sendWelcomeEmail(user: User) {
  const builder = new EmailTemplateBuilder();

  const html = await builder.build('welcome', {
    USER_NAME: user.name,
    PACKAGE_NAME: user.subscription.tier,
    DASHBOARD_URL: 'https://wranngle.com/dashboard',
  }, {
    inlineCSS: true,
    minify: true,
  });

  await sendEmail({
    to: user.email,
    from: 'hello@wranngle.com',
    subject: 'Welcome to Wranngle',
    html: html,
  });
}
```

---

## Cloudflare Pages Functions

### Example: Lead Notification

Create `functions/api/notify-lead.ts`:

```typescript
import { EmailTemplateBuilder } from '../../email-templates/build/template-builder';

interface Env {
  SENDGRID_API_KEY: string;
  N8N_WEBHOOK_URL: string;
}

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  const lead = await request.json();

  // Build notification email
  const builder = new EmailTemplateBuilder();
  const html = await builder.build('notification', {
    USER_NAME: lead.businessOwner,
    NOTIFICATION_TITLE: 'New Lead Captured',
    NOTIFICATION_MESSAGE: `Your AI agent captured a lead from ${lead.name}`,
    EVENT_TYPE: 'LEAD_CAPTURED',
    EVENT_DATA: `${lead.name} | ${lead.phone}`,
    CTA_TEXT: 'View Lead',
    CTA_URL: `https://wranngle.com/leads/${lead.id}`,
  }, { inlineCSS: true });

  // Send via SendGrid
  await fetch('https://api.sendgrid.com/v3/mail/send', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${env.SENDGRID_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      personalizations: [{ to: [{ email: lead.businessEmail }] }],
      from: { email: 'alerts@wranngle.com', name: 'Wranngle Alerts' },
      subject: '🔔 New Lead Captured',
      content: [{ type: 'text/html', value: html }],
    }),
  });

  return new Response('Notification sent', { status: 200 });
};
```

---

## n8n Workflow Integration

### Trigger Email from n8n

In your n8n workflow, add an HTTP Request node:

**Node Configuration:**
- **Method:** POST
- **URL:** `https://wranngle.com/api/send-welcome-email`
- **Body:**
  ```json
  {
    "email": "{{ $json.email }}",
    "name": "{{ $json.name }}",
    "packageName": "{{ $json.packageName }}"
  }
  ```

**Authentication:**
- Add API key header if required

**Workflow Example:**
```
Webhook (Lead Capture)
  → Process Lead Data
  → HTTP Request (Send Welcome Email)
  → Update CRM
```

---

## SendGrid Integration

### Full Implementation with SendGrid

```typescript
import sgMail from '@sendgrid/mail';
import { EmailTemplateBuilder } from './email-templates/build/template-builder';

sgMail.setApiKey(process.env.SENDGRID_API_KEY!);

interface EmailOptions {
  to: string;
  subject: string;
  templateName: string;
  variables: Record<string, string>;
}

async function sendTransactionalEmail(options: EmailOptions) {
  const builder = new EmailTemplateBuilder();

  // Build email HTML
  const html = await builder.build(options.templateName, options.variables, {
    inlineCSS: true,
    minify: true,
  });

  // Send via SendGrid
  await sgMail.send({
    to: options.to,
    from: {
      email: 'hello@wranngle.com',
      name: 'Wranngle Systems',
    },
    subject: options.subject,
    html: html,
    trackingSettings: {
      clickTracking: { enable: true },
      openTracking: { enable: true },
    },
    customArgs: {
      template: options.templateName,
      sent_at: new Date().toISOString(),
    },
  });
}

// Usage
await sendTransactionalEmail({
  to: 'customer@example.com',
  subject: 'Welcome to Wranngle',
  templateName: 'welcome',
  variables: {
    USER_NAME: 'Jane Doe',
    PACKAGE_NAME: 'Elite Agent',
    DASHBOARD_URL: 'https://wranngle.com/dashboard',
  },
});
```

---

## Error Handling

### Retry And Error Handling

```typescript
async function sendEmailWithRetry(
  templateName: string,
  variables: Record<string, string>,
  recipient: string,
  maxRetries = 3
) {
  const builder = new EmailTemplateBuilder();

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      // Build email
      const html = await builder.build(templateName, variables, {
        inlineCSS: true,
        minify: true,
      });

      // Send email
      await sendEmail({ to: recipient, html });

      console.log(`Email sent successfully to ${recipient}`);
      return { success: true };

    } catch (error) {
      console.error(`Attempt ${attempt} failed:`, error);

      if (attempt === maxRetries) {
        // Log to error tracking service
        await logError({
          type: 'EMAIL_SEND_FAILED',
          template: templateName,
          recipient: recipient,
          error: error.message,
        });

        return { success: false, error: error.message };
      }

      // Wait before retry (exponential backoff)
      await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, attempt)));
    }
  }
}
```

---

## Testing

### Integration Test

```typescript
import { EmailTemplateBuilder } from './email-templates/build/template-builder';
import { expect, test } from 'bun:test';

test('welcome email builds successfully', async () => {
  const builder = new EmailTemplateBuilder();

  const html = await builder.build('welcome', {
    USER_NAME: 'Test User',
    PACKAGE_NAME: 'Core Agent',
    DASHBOARD_URL: 'https://wranngle.com/dashboard',
  });

  // Verify HTML structure
  expect(html).toContain('Welcome to Wranngle');
  expect(html).toContain('Test User');
  expect(html).toContain('Core Agent');

  // Verify no unreplaced variables
  expect(html).not.toContain('{{USER_NAME}}');
  expect(html).not.toContain('{{PACKAGE_NAME}}');

  // Verify size
  expect(Buffer.byteLength(html, 'utf8')).toBeLessThan(102000); // Gmail limit
});

test('send test email to inbox', async () => {
  const builder = new EmailTemplateBuilder();

  const html = await builder.build('notification', {
    USER_NAME: 'Test User',
    NOTIFICATION_TITLE: 'Test Notification',
    NOTIFICATION_MESSAGE: 'This is a test email',
    CTA_TEXT: 'View Dashboard',
    CTA_URL: 'https://wranngle.com/dashboard',
  });

  // Send to test email (only in test environment)
  if (process.env.TEST_EMAIL) {
    await sendEmail({
      to: process.env.TEST_EMAIL,
      subject: '[TEST] Notification Email',
      html: html,
    });
  }
});
```

### Send Test Email Script

Create `email-templates/scripts/send-test.ts`:

```typescript
import { EmailTemplateBuilder } from '../build/template-builder';
import sgMail from '@sendgrid/mail';

sgMail.setApiKey(process.env.SENDGRID_API_KEY!);

const builder = new EmailTemplateBuilder();

// Send test emails to yourself
const testEmail = process.env.TEST_EMAIL || 'your-email@example.com';

async function sendTestEmails() {
  const templates = ['welcome', 'invoice-receipt', 'notification', 'password-reset'];

  for (const template of templates) {
    console.log(`Sending test email: ${template}`);

    const html = await builder.preview(template); // Uses sample data

    await sgMail.send({
      to: testEmail,
      from: 'test@wranngle.com',
      subject: `[TEST] ${template} Email`,
      html: html,
    });

    console.log(`✓ Sent ${template}`);

    // Wait 1 second between sends
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  console.log('All test emails sent!');
}

sendTestEmails();
```

Run with:
```bash
TEST_EMAIL=your-email@example.com bun run email-templates/scripts/send-test.ts
```

---

## Environment Variables

Required environment variables:

```bash
# SendGrid (recommended)
SENDGRID_API_KEY=SG.xxx

# Mailgun (alternative)
MAILGUN_API_KEY=key-xxx
MAILGUN_DOMAIN=mg.wranngle.com

# Application
APP_URL=https://wranngle.com
FROM_EMAIL=hello@wranngle.com
FROM_NAME="Wranngle Systems"

# Testing
TEST_EMAIL=your-email@example.com
```

---

## Production Checklist

Before deploying to production:

- [ ] Configure ESP (SendGrid/Mailgun)
- [ ] Set up domain authentication (SPF/DKIM/DMARC)
- [ ] Add environment variables to Cloudflare
- [ ] Test all email templates in multiple clients
- [ ] Set up bounce/complaint webhooks
- [ ] Configure analytics tracking
- [ ] Test unsubscribe functionality
- [ ] Verify mobile rendering
- [ ] Check spam scores
- [ ] Warm up sending domain (if new)

---

## Additional Resources

- **Complete Documentation:** `email-templates/README.md`
- **Deliverability Guide:** `email-templates/DELIVERABILITY.md`
- **Implementation Guide:** `email-templates/IMPLEMENTATION-GUIDE.md`
- **SendGrid Docs:** https://docs.sendgrid.com
- **Mailgun Docs:** https://documentation.mailgun.com

---

**Need Help?**

- Email: support@wranngle.com
- Documentation: https://docs.wranngle.com/emails
