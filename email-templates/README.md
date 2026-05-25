# Wranngle Email Template System

A production email template system with master template inheritance, deliverability checks, and live previews.

## 🎯 Features

- **Master Template Inheritance** - Single source of truth that cascades to all child templates
- **Cross-Client Compatible** - Works across Gmail, Outlook, Apple Mail, and 90+ email clients
- **Mobile Responsive** - Built for desktop and mobile devices
- **Deliverability Checks** - Authentication, size, and content checks before send
- **Brand Consistent** - Matches Wranngle's visual identity and design philosophy
- **Developer Friendly** - TypeScript-based builder with variable replacement
- **Live Preview** - Visual preview dashboard for rapid iteration

## 📁 Directory Structure

```
email-templates/
├── master/
│   └── master-template.html          # Base template with header/footer
├── templates/
│   ├── welcome.html                  # Onboarding email
│   ├── invoice-receipt.html          # Billing/payment confirmation
│   ├── notification.html             # Real-time alerts
│   └── password-reset.html           # Security emails
├── build/
│   └── template-builder.ts           # Template inheritance engine
├── preview/
│   ├── index.html                    # Preview dashboard
│   ├── welcome-preview.html          # Generated previews
│   └── ...
├── assets/
│   └── (images, logos, etc.)
├── DELIVERABILITY.md                 # Deliverability best practices
└── README.md                         # This file
```

## 🚀 Quick Start

### 1. Install Dependencies

```bash
cd email-templates
bun install juice  # For CSS inlining
```

### 2. Build a Template

```bash
# Generate preview with sample data
bun run build/template-builder.ts welcome

# Build with inlined CSS (production-ready)
bun run build/template-builder.ts welcome --inline

# Build with minification
bun run build/template-builder.ts welcome --inline --minify
```

### 3. Preview Templates

Open `preview/index.html` in your browser to see the interactive preview dashboard.

```bash
# Serve locally with live reload
bun run preview:emails
```

### 4. Use in Your Application

```typescript
import { EmailTemplateBuilder } from './email-templates/build/template-builder';

const builder = new EmailTemplateBuilder();

// Build welcome email
const html = await builder.build('welcome', {
  USER_NAME: 'Jane Doe',
  PACKAGE_NAME: 'Elite Agent',
  DASHBOARD_URL: 'https://wranngle.com/dashboard',
});

// Send via your ESP
await sendEmail({
  to: 'jane@example.com',
  subject: 'Welcome to Wranngle',
  html: html,
});
```

## 📧 Available Templates

### 1. Welcome Email (`welcome.html`)
**Purpose:** Sent when a new customer signs up
**Use Case:** Onboarding, first impressions
**Variables:**
- `USER_NAME` - Customer's name
- `PACKAGE_NAME` - Subscription tier (Core Agent / Elite Agent)
- `DASHBOARD_URL` - Link to customer dashboard

**Sample:**
```typescript
await builder.build('welcome', {
  USER_NAME: 'John Smith',
  PACKAGE_NAME: 'Elite Agent',
  DASHBOARD_URL: 'https://wranngle.com/dashboard',
});
```

---

### 2. Invoice/Receipt (`invoice-receipt.html`)
**Purpose:** Payment confirmation and billing records
**Use Case:** Monthly invoices, one-time purchases
**Variables:**
- `INVOICE_ID` - Unique invoice number
- `INVOICE_DATE` - Date of invoice
- `ITEM_NAME` - Product/service name
- `ITEM_DESCRIPTION` - Product description
- `TOTAL_AMOUNT` - Total charge
- `PAYMENT_METHOD` - Card ending in XXXX
- `INVOICE_PDF_URL` - Link to PDF invoice

**Sample:**
```typescript
await builder.build('invoice-receipt', {
  INVOICE_ID: 'INV-2026-001234',
  INVOICE_DATE: '2026-01-19',
  ITEM_NAME: 'Elite Agent - Monthly',
  TOTAL_AMOUNT: '542.50',
  PAYMENT_METHOD: 'Visa ending in 4242',
});
```

---

### 3. Notification (`notification.html`)
**Purpose:** Real-time alerts and system events
**Use Case:** Lead captured, agent activity, system updates
**Variables:**
- `NOTIFICATION_TITLE` - Alert headline
- `NOTIFICATION_MESSAGE` - Main message content
- `EVENT_TYPE` - Event classification
- `METRIC_1_VALUE` / `METRIC_2_VALUE` / `METRIC_3_VALUE` - Dashboard metrics
- `CTA_TEXT` - Call-to-action button text
- `CTA_URL` - Action button destination

**Sample:**
```typescript
await builder.build('notification', {
  NOTIFICATION_TITLE: 'New Lead Captured',
  NOTIFICATION_MESSAGE: 'Your AI agent successfully captured a qualified lead.',
  EVENT_TYPE: 'LEAD_CAPTURED',
  METRIC_1_VALUE: '14',
  METRIC_1_LABEL: 'Total Leads',
  CTA_TEXT: 'View Lead Details',
  CTA_URL: 'https://wranngle.com/leads/123',
});
```

---

### 4. Password Reset (`password-reset.html`)
**Purpose:** Secure password reset flow
**Use Case:** Account security, credential recovery
**Variables:**
- `USER_NAME` - Account holder name
- `USER_EMAIL` - Account email for verification
- `RESET_URL` - Time-limited reset link
- `EXPIRY_TIME` - Human-readable expiry (e.g., "1 hour")
- `REQUEST_IP` - IP address of reset request
- `REQUEST_TIME` - Timestamp of request
- `REQUEST_LOCATION` - Geographic location

**Sample:**
```typescript
await builder.build('password-reset', {
  USER_NAME: 'Jane Doe',
  RESET_URL: 'https://wranngle.com/reset?token=abc123',
  EXPIRY_TIME: '1 hour',
  REQUEST_IP: '192.168.1.1',
  REQUEST_LOCATION: 'San Francisco, CA',
});
```

## 🎨 Brand Guidelines

### Colors
```css
--wranngle-primary: #ff5f00;      /* Orange - Primary CTA */
--wranngle-secondary: #cf3c69;    /* Magenta - Accents */
--wranngle-dark: #12111a;         /* Near-black - Text */
--wranngle-light: #fcfaf5;        /* Warm beige - Backgrounds */
```

### Typography
- **Brand Font:** Inter (web-safe fallback)
- **Monospace:** Courier New (console aesthetic)
- **Body Size:** 16px (mobile-friendly)
- **Line Height:** 1.6 (readability)

### Design Elements
- **Left Border:** 4px solid orange (`#ff5f00`)
- **Border Radius:** 8px (modern, friendly)
- **Padding:** Generous whitespace for readability
- **Console Aesthetic:** Monospace text, technical language

## 🛠️ Customization

### Adding a New Template

1. Create the template file in `templates/`:

```html
<!-- templates/my-template.html -->
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
  <tr>
    <td>
      <h1 style="font-size: 24px;">{{TITLE}}</h1>
      <p style="font-size: 16px;">{{MESSAGE}}</p>
      <a href="{{CTA_URL}}" class="btn-primary">{{CTA_TEXT}}</a>
    </td>
  </tr>
</table>
```

2. Add sample data to `template-builder.ts`:

```typescript
private getSampleData(templateName: string): TemplateVariables {
  const samplesByTemplate: Record<string, TemplateVariables> = {
    // ... existing templates
    'my-template': {
      TITLE: 'My Custom Title',
      MESSAGE: 'My custom message',
      CTA_URL: 'https://wranngle.com/action',
      CTA_TEXT: 'Take Action',
    },
  };
  // ...
}
```

3. Build and preview:

```bash
bun run build/template-builder.ts my-template
```

### Modifying the Master Template

The master template (`master/master-template.html`) contains:
- Header with logo
- Footer with unsubscribe link
- Wranngle brand colors and styles
- Responsive media queries

**To update:** Edit `master/master-template.html` and rebuild all templates. Changes cascade automatically.

## 📊 Deliverability Checks

Templates are checked against the basics that affect inbox placement:

✅ **Technical:**
- SPF/DKIM/DMARC authentication ready
- Table-based layout (maximum compatibility)
- Inline CSS with `!important` declarations
- Under 100KB total size

✅ **Content:**
- Professional language (no spam triggers)
- Clear, honest subject lines
- Preheader text for inbox preview
- Unsubscribe link in footer

✅ **Mobile:**
- Responsive design (media queries)
- Touch-friendly buttons (44px+)
- Readable fonts (16px minimum)

See [DELIVERABILITY.md](./DELIVERABILITY.md) for setup and testing notes.

## 🧪 Testing

### Cross-Client Testing

Test on these platforms before production:
- **Gmail** (Desktop + Mobile)
- **Outlook** (2016, 2019, 365, Mobile)
- **Apple Mail** (macOS, iOS)
- **Yahoo Mail**
- **Thunderbird**

**Tools:**
- [Litmus](https://litmus.com) - 90+ client testing
- [Email on Acid](https://www.emailonacid.com) - Spam testing
- [Mail-Tester](https://www.mail-tester.com) - Free spam score

### Spam Testing

```bash
# Check spam score (target: < 3/10)
curl -X POST https://www.mail-tester.com/test.php \
  -d "email=$(cat welcome-preview.html)"
```

### A/B Testing

Track these metrics:
- **Open Rate:** Subject line effectiveness
- **Click Rate:** CTA placement and copy
- **Conversion Rate:** Overall email success

## 🚢 Production Deployment

### 1. Configure ESP (SendGrid, Mailgun, etc.)

```typescript
import { EmailTemplateBuilder } from './email-templates/build/template-builder';
import sgMail from '@sendgrid/mail';

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const builder = new EmailTemplateBuilder();

async function sendWelcomeEmail(user: User) {
  const html = await builder.build('welcome', {
    USER_NAME: user.name,
    PACKAGE_NAME: user.package,
    DASHBOARD_URL: 'https://wranngle.com/dashboard',
  }, {
    inlineCSS: true,
    minify: true,
  });

  await sgMail.send({
    to: user.email,
    from: 'hello@wranngle.com',
    subject: 'Welcome to Wranngle',
    html: html,
  });
}
```

### 2. Set Environment Variables

```bash
# ESP Configuration
SENDGRID_API_KEY=your_key_here
FROM_EMAIL=hello@wranngle.com
REPLY_TO_EMAIL=support@wranngle.com

# Tracking
TRACK_OPENS=true
TRACK_CLICKS=true
```

### 3. Monitor Deliverability

Track these metrics:
- **Delivery Rate:** > 98%
- **Bounce Rate:** < 2%
- **Complaint Rate:** < 0.1%
- **Open Rate:** 15-25% (B2B)

## 📚 Variable Reference

### Common Variables (All Templates)
```typescript
{
  // User Info
  USER_NAME: string;           // Customer's full name
  USER_EMAIL: string;          // Customer's email

  // Branding
  EMAIL_TITLE: string;         // Email <title> tag
  PREHEADER_TEXT: string;      // Inbox preview text

  // Navigation
  DASHBOARD_URL: string;       // Link to dashboard
  UNSUBSCRIBE_URL: string;     // Unsubscribe link (required by law)

  // Footer
  COMPANY_ADDRESS: string;     // Physical address (CAN-SPAM)
  TRACKING_PIXEL: string;      // Optional tracking pixel HTML
}
```

### Template-Specific Variables
See individual template sections above for complete variable lists.

## 🔧 Troubleshooting

### Images Not Loading
- Use absolute URLs (not relative paths)
- Host on CDN for reliability
- Always include `alt` text
- Test with images blocked

### Outlook Rendering Issues
- Avoid nested tables (max 2-3 levels)
- Use fixed widths, not percentages
- Test in Outlook 2016+ (different rendering engine)

### Gmail Clipping
- Keep total email size under 100KB
- Minimize CSS (use inlining)
- Remove unnecessary whitespace

### Mobile Display Issues
- Test on real devices
- Use minimum 16px font size
- Make buttons touch-friendly (44px+)

## 🤝 Contributing

To add new templates or improve existing ones:

1. Fork this repository
2. Create a feature branch
3. Add your template to `templates/`
4. Update sample data in `template-builder.ts`
5. Test across email clients
6. Submit a pull request

## 📄 License

MIT © Wranngle LLC — see the repository [LICENSE](../LICENSE).

---

## 🆘 Support

- **Email:** support@wranngle.com
- **Documentation:** https://docs.wranngle.com/emails
- **GitHub Issues:** https://github.com/wranngle/wranngle_com/issues

---

**Built with ❤️ by the Wranngle Team**
