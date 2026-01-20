# Wranngle Email Template Implementation Guide

Complete guide for integrating the email template system into your applications.

## Quick Start (5 minutes)

### 1. Install Dependencies

```bash
cd email-templates
bun install juice
```

### 2. Preview Templates

```bash
# Generate all previews
bun run email:preview:all

# Open preview dashboard
open preview/index.html
```

### 3. Send Your First Email

```typescript
import { EmailTemplateBuilder } from './email-templates/build/template-builder';

const builder = new EmailTemplateBuilder();

// Build the email
const html = await builder.build('welcome', {
  USER_NAME: 'Jane Doe',
  PACKAGE_NAME: 'Elite Agent',
  DASHBOARD_URL: 'https://wranngle.com/dashboard',
}, {
  inlineCSS: true,
  minify: true,
});

// Send via your ESP
await sendEmail({
  to: 'jane@example.com',
  from: 'hello@wranngle.com',
  subject: 'Welcome to Wranngle',
  html: html,
});
```

---

## Integration Patterns

### Pattern 1: Transactional Emails with SendGrid

```typescript
import sgMail from '@sendgrid/mail';
import { EmailTemplateBuilder } from './email-templates/build/template-builder';

sgMail.setApiKey(process.env.SENDGRID_API_KEY!);
const builder = new EmailTemplateBuilder();

export async function sendWelcomeEmail(user: User) {
  const html = await builder.build('welcome', {
    USER_NAME: user.name,
    PACKAGE_NAME: user.subscription.tier,
    DASHBOARD_URL: `${process.env.APP_URL}/dashboard`,
  }, {
    inlineCSS: true,
    minify: true,
  });

  await sgMail.send({
    to: user.email,
    from: {
      email: 'hello@wranngle.com',
      name: 'Wranngle Systems',
    },
    subject: 'Welcome to Wranngle',
    html: html,
    trackingSettings: {
      clickTracking: { enable: true },
      openTracking: { enable: true },
    },
  });
}
```

### Pattern 2: Scheduled Invoices with Cloudflare Queues

```typescript
// functions/api/send-invoice.ts
import { EmailTemplateBuilder } from '../../email-templates/build/template-builder';

interface Env {
  EMAIL_QUEUE: Queue;
  SENDGRID_API_KEY: string;
}

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  const { userId, invoiceId } = await request.json();

  // Fetch invoice data
  const invoice = await fetchInvoice(invoiceId);
  const user = await fetchUser(userId);

  // Build email
  const builder = new EmailTemplateBuilder();
  const html = await builder.build('invoice-receipt', {
    USER_NAME: user.name,
    INVOICE_ID: invoice.id,
    INVOICE_DATE: invoice.date,
    TOTAL_AMOUNT: invoice.total.toFixed(2),
    PAYMENT_METHOD: user.paymentMethod,
  }, { inlineCSS: true, minify: true });

  // Queue for sending
  await env.EMAIL_QUEUE.send({
    to: user.email,
    subject: `Invoice ${invoice.id}`,
    html: html,
  });

  return new Response('Invoice queued', { status: 200 });
};
```

### Pattern 3: Real-time Notifications with n8n Webhook

```typescript
// Trigger from n8n workflow when lead is captured
export async function sendLeadNotification(lead: Lead) {
  const builder = new EmailTemplateBuilder();

  const html = await builder.build('notification', {
    USER_NAME: lead.businessOwner,
    NOTIFICATION_TITLE: 'New Lead Captured',
    NOTIFICATION_MESSAGE: `Your AI agent captured a qualified lead from ${lead.source}.`,
    EVENT_TYPE: 'LEAD_CAPTURED',
    EVENT_DATA: `${lead.name} | ${lead.phone}`,
    METRIC_1_VALUE: lead.totalLeads.toString(),
    METRIC_1_LABEL: 'Total Leads',
    CTA_TEXT: 'View Lead',
    CTA_URL: `https://wranngle.com/leads/${lead.id}`,
  }, { inlineCSS: true });

  await sendEmail({
    to: lead.businessEmail,
    subject: '🔔 New Lead Captured',
    html: html,
  });
}
```

### Pattern 4: Password Reset with Security Logging

```typescript
export async function sendPasswordReset(user: User, token: string, request: Request) {
  const builder = new EmailTemplateBuilder();

  // Extract security context
  const ip = request.headers.get('CF-Connecting-IP') || 'Unknown';
  const location = request.cf?.city
    ? `${request.cf.city}, ${request.cf.region}, ${request.cf.country}`
    : 'Unknown';

  const expiryDate = new Date(Date.now() + 3600000); // 1 hour

  const html = await builder.build('password-reset', {
    USER_NAME: user.name,
    USER_EMAIL: user.email,
    RESET_URL: `https://wranngle.com/reset-password?token=${token}`,
    EXPIRY_TIME: '1 hour',
    EXPIRY_TIMESTAMP: expiryDate.toLocaleString(),
    REQUEST_IP: ip,
    REQUEST_TIME: new Date().toLocaleString(),
    REQUEST_LOCATION: location,
  }, { inlineCSS: true, minify: true });

  // Log security event
  await logSecurityEvent({
    type: 'PASSWORD_RESET_REQUESTED',
    userId: user.id,
    ip: ip,
    location: location,
  });

  await sendEmail({
    to: user.email,
    subject: 'Reset Your Password - Wranngle',
    html: html,
  });
}
```

---

## Environment Configuration

### Required Environment Variables

```bash
# Email Service Provider
SENDGRID_API_KEY=SG.xxx
# or
MAILGUN_API_KEY=key-xxx
MAILGUN_DOMAIN=mg.wranngle.com

# Application URLs
APP_URL=https://wranngle.com
UNSUBSCRIBE_URL=https://wranngle.com/unsubscribe

# Sender Identity
FROM_EMAIL=hello@wranngle.com
FROM_NAME="Wranngle Systems"
REPLY_TO_EMAIL=support@wranngle.com

# Company Info
COMPANY_NAME="Wranngle Systems LLC"
COMPANY_ADDRESS="San Francisco, CA"

# Tracking
TRACK_OPENS=true
TRACK_CLICKS=true
```

### Cloudflare Pages Functions Configuration

```toml
# wrangler.toml
[env.production]
vars = { APP_URL = "https://wranngle.com" }

[[env.production.kv_namespaces]]
binding = "EMAIL_TEMPLATES"
id = "xxx"

[[env.production.queues.producers]]
binding = "EMAIL_QUEUE"
queue = "email-outbound"
```

---

## Email Service Provider Setup

### SendGrid Setup

1. **Create API Key:**
   - Go to Settings > API Keys
   - Create key with "Mail Send" permissions
   - Save to `SENDGRID_API_KEY`

2. **Domain Authentication:**
   ```bash
   # Add DNS records provided by SendGrid:
   # - CNAME: em1234.wranngle.com → sendgrid.net
   # - CNAME: s1._domainkey.wranngle.com → s1.domainkey.sendgrid.net
   # - CNAME: s2._domainkey.wranngle.com → s2.domainkey.sendgrid.net
   ```

3. **Link Branding:**
   - Setup: mail.wranngle.com → sendgrid.net
   - Improves deliverability and trust

### Mailgun Setup

1. **Create Sending Domain:**
   ```bash
   # Add DNS records:
   TXT @ "v=spf1 include:mailgun.org ~all"
   TXT mx._domainkey.wranngle.com "k=rsa; p=MIGfMA0G..."
   CNAME email.wranngle.com mxa.mailgun.org
   CNAME email.wranngle.com mxb.mailgun.org
   ```

2. **Get API Credentials:**
   - Dashboard > Sending > Domain Settings
   - Copy API key and domain

### Amazon SES Setup

1. **Verify Domain:**
   - SES Console > Verified Identities
   - Add TXT records for DKIM

2. **Move Out of Sandbox:**
   - Request production access
   - Start with 200 emails/day limit

3. **Setup SMTP Credentials:**
   ```typescript
   import nodemailer from 'nodemailer';

   const transporter = nodemailer.createTransport({
     host: 'email-smtp.us-west-2.amazonaws.com',
     port: 587,
     auth: {
       user: process.env.SES_SMTP_USERNAME,
       pass: process.env.SES_SMTP_PASSWORD,
     },
   });
   ```

---

## Advanced Usage

### Custom Variable Replacement

```typescript
const builder = new EmailTemplateBuilder();

// Add custom variables not in sample data
const html = await builder.build('notification', {
  ...builder['getSampleData']('notification'),
  CUSTOM_FIELD: 'Custom Value',
  ANOTHER_VAR: 'Another Value',
});
```

### Template Caching

```typescript
// Cache compiled templates in production
const templateCache = new Map<string, string>();

export async function getCachedTemplate(
  name: string,
  variables: TemplateVariables
): Promise<string> {
  const cacheKey = `${name}-${JSON.stringify(variables)}`;

  if (templateCache.has(cacheKey)) {
    return templateCache.get(cacheKey)!;
  }

  const builder = new EmailTemplateBuilder();
  const html = await builder.build(name, variables, {
    inlineCSS: true,
    minify: true,
  });

  templateCache.set(cacheKey, html);
  return html;
}
```

### A/B Testing Subject Lines

```typescript
const subjectVariants = [
  'Welcome to Wranngle',
  'Your AI Agent is Ready',
  'Get Started with Wranngle',
];

const variant = Math.floor(Math.random() * subjectVariants.length);

await sendEmail({
  to: user.email,
  subject: subjectVariants[variant],
  html: html,
  customArgs: {
    ab_test: `subject_line_v${variant}`,
  },
});
```

### Batch Sending with Rate Limiting

```typescript
import pLimit from 'p-limit';

const limit = pLimit(10); // Max 10 concurrent sends

async function sendBulkEmails(users: User[]) {
  const builder = new EmailTemplateBuilder();

  const promises = users.map((user) =>
    limit(async () => {
      const html = await builder.build('notification', {
        USER_NAME: user.name,
        // ... other variables
      });

      await sendEmail({
        to: user.email,
        subject: 'Update from Wranngle',
        html: html,
      });
    })
  );

  await Promise.all(promises);
}
```

---

## Monitoring & Analytics

### Track Email Performance

```typescript
interface EmailMetrics {
  sent: number;
  delivered: number;
  opened: number;
  clicked: number;
  bounced: number;
  complained: number;
}

export async function trackEmailMetrics(templateName: string): Promise<EmailMetrics> {
  // Query your ESP's API for metrics
  const metrics = await sendgrid.stats.get({
    start_date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
    categories: [templateName],
  });

  return {
    sent: metrics.sent,
    delivered: metrics.delivered,
    opened: metrics.opened,
    clicked: metrics.clicked,
    bounced: metrics.bounced,
    complained: metrics.complained,
  };
}
```

### Set Up Webhooks

```typescript
// functions/api/webhooks/sendgrid.ts
export const onRequestPost: PagesFunction = async ({ request }) => {
  const events = await request.json();

  for (const event of events) {
    if (event.event === 'open') {
      await trackEmailOpen(event.email, event.sg_message_id);
    }

    if (event.event === 'click') {
      await trackEmailClick(event.email, event.url);
    }

    if (event.event === 'bounce') {
      await handleBounce(event.email, event.reason);
    }
  }

  return new Response('OK', { status: 200 });
};
```

---

## Testing & QA

### Pre-Deployment Checklist

- [ ] All templates build without errors
- [ ] All templates pass validation (`bun run email:test`)
- [ ] Templates tested in Gmail, Outlook, Apple Mail
- [ ] Mobile rendering verified on iOS and Android
- [ ] All links work and use HTTPS
- [ ] Unsubscribe link functions correctly
- [ ] SPF/DKIM/DMARC configured
- [ ] Sender domain warmed up (if new)
- [ ] Bounce/complaint webhooks configured
- [ ] Analytics tracking enabled

### Test Email Function

```typescript
export async function sendTestEmail(templateName: string, recipient: string) {
  const builder = new EmailTemplateBuilder();
  const html = await builder.preview(templateName); // Uses sample data

  await sendEmail({
    to: recipient,
    from: 'test@wranngle.com',
    subject: `[TEST] ${templateName} - ${new Date().toISOString()}`,
    html: html,
  });

  console.log(`Test email sent to ${recipient}`);
}
```

---

## Troubleshooting

### Issue: Emails Going to Spam

**Solutions:**
1. Verify SPF/DKIM/DMARC authentication
2. Warm up sending domain gradually
3. Check spam score with Mail-Tester
4. Remove spam trigger words
5. Ensure engaged recipient list

### Issue: Images Not Loading

**Solutions:**
1. Use absolute URLs (not relative)
2. Host images on CDN
3. Add alt text to all images
4. Test with images blocked

### Issue: Outlook Rendering Broken

**Solutions:**
1. Avoid nested tables (max 2-3 levels)
2. Use fixed widths instead of percentages
3. Test in Outlook 2016/2019/365
4. Use inline styles with `!important`

### Issue: Gmail Clipping Email

**Solutions:**
1. Reduce email size under 102KB
2. Inline CSS to reduce size
3. Minify HTML
4. Optimize images

---

## Support & Resources

- **Email Template Docs:** `email-templates/README.md`
- **Deliverability Guide:** `email-templates/DELIVERABILITY.md`
- **Support:** support@wranngle.com
- **GitHub Issues:** https://github.com/wranngle/email-templates/issues

---

**Happy Sending! 📧**
