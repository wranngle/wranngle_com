# Wranngle Email Design System

A comprehensive guide to maintaining visual consistency across all Wranngle email templates.

---

## Design Tokens

### Colors

| Token | Hex | Usage |
|-------|-----|-------|
| **Primary** | `#ff5f00` | CTAs, left borders, console labels, links |
| **Secondary** | `#cf3c69` | Security/premium contexts ONLY |
| **Dark** | `#12111a` | Body text, dark backgrounds |
| **Light** | `#fcfaf5` | Light mode backgrounds |
| **Success** | `#10b981` | Completed states ONLY (payment confirmed, etc.) |
| **Warning** | `#f59e0b` | Warnings, action required boxes |
| **Danger** | `#ef4444` | Errors, security alerts |
| **Gray-600** | `#6b7280` | Secondary body text |
| **Gray-400** | `#9ca3af` | Footer text |
| **Border** | `#e5e7eb` | Light borders |
| **BG Subtle** | `#f9fafb` | Subtle backgrounds (info boxes) |
| **BG Page** | `#f3f4f6` | Email wrapper background |

### Spacing Scale (8px base)

| Token | Value | Usage |
|-------|-------|-------|
| `xs` | 4px | Minimal gaps |
| `sm` | 8px | Icon padding, tight spacing |
| `md` | 12px | Default element spacing |
| `base` | 16px | Standard margins, paragraph spacing |
| `lg` | 20px | Section padding (info boxes) |
| `xl` | 24px | Hero padding, section gaps |
| `2xl` | 32px | Major section breaks |
| `3xl` | 40px | Content area padding |

### Typography Scale

| Token | Value | Usage |
|-------|-------|-------|
| `xs` | 11px | Footer legal text |
| `sm` | 12px | Console labels, metadata |
| `base` | 14px | Buttons, small body, item descriptions |
| `lg` | 16px | Primary body text |
| `xl` | 20px | H2 section headings |
| `2xl` | 28px | H1 hero headings |

### Border Radius

| Token | Value | Usage |
|-------|-------|-------|
| `sm` | 4px | Info boxes, status badges |
| `md` | 8px | Heroes, cards, buttons |

---

## Component Library

### Primary Button

Use for main call-to-action.

```html
<a href="{{URL}}" class="btn-primary" style="background-color: #ff5f00; border: 2px solid #ff5f00; border-radius: 8px; color: #ffffff; display: inline-block; font-family: 'Inter', Arial, sans-serif; font-size: 14px; font-weight: 700; letter-spacing: 0.5px; line-height: 1.4; padding: 14px 32px; text-align: center; text-decoration: none; text-transform: uppercase;">
  Button Text
</a>
```

### Secondary Button

Use for secondary actions.

```html
<a href="{{URL}}" class="btn-secondary" style="background-color: transparent; border: 2px solid #12111a; border-radius: 8px; color: #12111a; display: inline-block; font-family: 'Inter', Arial, sans-serif; font-size: 14px; font-weight: 700; letter-spacing: 0.5px; line-height: 1.4; padding: 14px 32px; text-align: center; text-decoration: none; text-transform: uppercase;">
  Button Text
</a>
```

### Warning Button

Use for action-required contexts.

```html
<a href="{{URL}}" class="btn-warning" style="display: inline-block; padding: 14px 32px; background-color: #f59e0b; border: 2px solid #f59e0b; color: #ffffff; font-family: 'Inter', Arial, sans-serif; font-size: 14px; font-weight: 700; text-decoration: none; text-transform: uppercase; border-radius: 8px; letter-spacing: 0.5px; line-height: 1.4;">
  Take Action
</a>
```

### Danger Button

Use for security alerts and critical actions.

```html
<a href="{{URL}}" class="btn-danger" style="display: inline-block; padding: 14px 32px; background-color: #ef4444; border: 2px solid #ef4444; color: #ffffff; font-family: 'Inter', Arial, sans-serif; font-size: 14px; font-weight: 700; text-decoration: none; text-transform: uppercase; border-radius: 8px; letter-spacing: 0.5px; line-height: 1.4;">
  Report Issue
</a>
```

### Info Box (Standard)

```html
<td style="padding: 20px; background-color: #f9fafb; border: 1px solid #e5e7eb; border-left: 4px solid #ff5f00; border-radius: 4px;">
  <!-- Content -->
</td>
```

### Info Box (Security Context)

Use magenta border ONLY for security-related information.

```html
<td style="padding: 20px; background-color: #f9fafb; border-left: 4px solid #cf3c69; border-radius: 4px;">
  <!-- Security content -->
</td>
```

### Info Box (Success/Completed)

Use green ONLY for completed states.

```html
<td style="padding: 16px; background-color: #d1fae5; border: 1px solid #10b981; border-radius: 4px; text-align: center;">
  <p style="margin: 0; font-family: 'Courier New', Courier, monospace; font-size: 12px; font-weight: 700; color: #065f46;">
    ✓ PAYMENT CONFIRMED
  </p>
</td>
```

### Info Box (Warning/Action Required)

```html
<td style="padding: 16px; background-color: #fef3c7; border: 2px solid #f59e0b; border-radius: 8px;">
  <p style="margin: 0; font-family: 'Inter', Arial, sans-serif; font-size: 14px; font-weight: 700; color: #92400e;">
    Action Required
  </p>
  <!-- Content -->
</td>
```

### Console Box (Dark)

For technical/status information with Wranngle console aesthetic.

```html
<td style="padding: 20px; background-color: #1a1a1e; border-radius: 8px; border-left: 4px solid #ff5f00;">
  <p style="margin: 0; font-family: 'Courier New', Courier, monospace; font-size: 13px; color: #f0f0f0;">
    <span style="color: #ff5f00;">[INFO]</span> Label: <strong>Value</strong>
  </p>
</td>
```

### Console Label Syntax

Always use `[LABEL]` format in monospace for console aesthetic:

```html
<span style="color: #ff5f00; font-weight: 700;">[INFO]</span>
<span style="color: #10b981; font-weight: 700;">[READY]</span>
<span style="color: #f59e0b; font-weight: 700;">[WARN]</span>
<span style="color: #ef4444; font-weight: 700;">[ERROR]</span>
```

### Hero Section

```html
<td align="center" style="padding: 24px; background: linear-gradient(135deg, #12111a 0%, #2d0914 100%); border-radius: 8px;">
  <h1 style="margin: 0 0 12px 0; font-family: 'Inter', Arial, sans-serif; font-size: 28px; font-weight: 700; color: #ffffff; line-height: 1.2;">
    Hero Title
  </h1>
  <p style="margin: 0; font-family: 'Courier New', Courier, monospace; font-size: 14px; color: #ff5f00; letter-spacing: 1px;">
    [ SYSTEM STATUS ]
  </p>
</td>
```

### Step Indicator (Numbered Badge)

```html
<div style="width: 24px; height: 24px; background-color: #ff5f00; border-radius: 50%; display: flex; align-items: center; justify-content: center;">
  <span style="color: #ffffff; font-size: 14px; font-weight: 700; line-height: 24px; text-align: center;">1</span>
</div>
```

---

## Color Usage Rules

### Primary Orange (`#ff5f00`)

**DO use for:**
- CTA buttons (background)
- Left accent borders on info boxes
- Console labels (e.g., `[INFO]`, `[DATA]`)
- Links within body content
- Step indicator badges
- Brand highlights

**DON'T use for:**
- Body text (too low contrast)
- Large background areas (overwhelming)
- Error states (use danger red)

### Secondary Magenta (`#cf3c69`)

**DO use for:**
- Security context borders (password reset, 2FA)
- Premium/VIP indicators
- Sensitive information boxes

**DON'T use for:**
- General info boxes (use orange)
- CTA buttons (use orange)
- Regular links

### Success Green (`#10b981`)

**DO use for:**
- Payment confirmed states
- Completed actions
- `[READY]` or `[SUCCESS]` console labels
- Checkmarks for completed items

**DON'T use for:**
- Step badges that aren't complete
- General info boxes
- CTA buttons

### Warning Amber (`#f59e0b`)

**DO use for:**
- Action required boxes
- Warning messages
- Time-sensitive notices
- Warning buttons

**DON'T use for:**
- Success states
- General information

### Danger Red (`#ef4444`)

**DO use for:**
- Security alerts
- Error messages
- Report/escalation buttons
- Critical warnings

**DON'T use for:**
- General warnings (use amber)
- Normal action buttons

---

## Do's and Don'ts

### Typography

| DO | DON'T |
|----|-------|
| Use 16px for body text | Use smaller than 14px for body |
| Use Inter for headings/body | Mix more than 2 font families |
| Use Courier New for console text | Use decorative fonts |
| Maintain 1.6 line-height for body | Compress line-height below 1.4 |
| Use 14px UPPERCASE for buttons | Use lowercase for button text |

### Buttons

| DO | DON'T |
|----|-------|
| Use 14px 32px padding (standard) | Use padding smaller than 10px 20px |
| Use 8px border-radius | Use radius smaller than 6px |
| Include 2px solid border | Remove borders (email client issues) |
| Use inline styles for compatibility | Rely solely on CSS classes |
| Add class AND inline styles | Use classes without inline fallback |

### Colors

| DO | DON'T |
|----|-------|
| Use orange for general CTAs | Use sky blue (#0ea5e9) anywhere |
| Use magenta ONLY for security | Use magenta for regular info boxes |
| Use green ONLY for completed | Use green for pending steps |
| Maintain 4.5:1 contrast ratio | Use light text on light backgrounds |

### Layout

| DO | DON'T |
|----|-------|
| Use single-column layout | Use multi-column below 600px |
| Use 4px left border for info boxes | Use thick borders (>4px) |
| Use 8px radius for cards/heroes | Mix different radius values arbitrarily |
| Use 4px radius for small elements | Use rounded corners on tables |

### Accessibility

| DO | DON'T |
|----|-------|
| Include alt text on images | Leave alt attributes empty |
| Use semantic color meanings | Rely on color alone for meaning |
| Test at 320px mobile width | Assume desktop-only viewing |
| Provide button text + icons | Use icon-only buttons |

---

## Template Variables

All templates support these common variables:

| Variable | Description | Default |
|----------|-------------|---------|
| `{{EMAIL_TITLE}}` | HTML `<title>` tag | "Wranngle Systems" |
| `{{PREHEADER_TEXT}}` | Inbox preview text | "Updates from Wranngle Systems" |
| `{{COMPANY_ADDRESS}}` | Footer address | "Wranngle Systems LLC" |
| `{{UNSUBSCRIBE_URL}}` | Unsubscribe link | "#unsubscribe" |
| `{{TRACKING_PIXEL}}` | Optional tracking | "" (empty) |

---

## Email Type Classification

Emails are classified by type, which affects footer handling and CAN-SPAM compliance:

| Type | Examples | Unsubscribe Required | Footer Message |
|------|----------|---------------------|----------------|
| **Marketing** | welcome, notification | Yes | "Unsubscribe from these emails" |
| **Transactional** | password-reset, invoice-receipt | No (CAN-SPAM exempt) | "This is a transactional email regarding your account" |
| **Internal** | lead-intake | No | "Internal notification - Contact IT to adjust preferences" |
| **Sales** | sales-cold-outreach, sales-demo-followup, sales-proposal-sent, sales-quote-followup, sales-winback | Yes | "Unsubscribe | Wranngle Systems LLC" |

---

## Coherence Guidelines

**CRITICAL**: Ensure messaging is consistent with email behavior.

### Contact Information

| DO | DON'T |
|----|-------|
| Use specific emails: `support@wranngle.com`, `billing@wranngle.com` | Say "Reply to this email" when sender is `noreply@` |
| Provide clickable mailto: links | Say "contact support" without email/link |
| Match sender address to contact expectation | Leave contact methods vague |

### Email-Specific Contact Channels

| Email Type | Contact Email |
|------------|---------------|
| General support | `support@wranngle.com` |
| Billing questions | `billing@wranngle.com` |
| Security issues | `security@wranngle.com` |

### Footer Coherence

| DO | DON'T |
|----|-------|
| Use appropriate footer for email type | Put consumer unsubscribe on internal emails |
| Explain transactional emails are account-related | Promise reply capability on noreply sender |
| Provide preference management for internal recipients | Use marketing footer on password resets |

---

## Consistency Standards

These values are enforced across all templates:

| Property | Standard Value | Applies To |
|----------|---------------|------------|
| Button padding | `14px 32px` | All `.btn-*` elements |
| H1 hero font-size | `28px` | All `<h1>` in hero sections |
| H2 section font-size | `20px` | All `<h2>` section headings |
| Section spacing rhythm | `16px` / `24px` / `32px` | `margin-bottom` on `<table>` wrappers |

---

## Deprecated Colors (DO NOT USE)

These colors were removed from the design system:

| Color | Hex | Replacement |
|-------|-----|-------------|
| Sky Blue | `#0ea5e9` | Use `#ff5f00` (orange) |
| Light Blue BG | `#f0f9ff` | Use `#f9fafb` (neutral) |
| Blue Border | `#bae6fd` | Use `#e5e7eb` (neutral) |

---

## Validation Checklist

Before deploying a template, verify:

### Design System
- [ ] All buttons use 14px font-size
- [ ] All buttons use 8px border-radius
- [ ] All buttons use 14px 32px padding (minimum)
- [ ] No sky blue (#0ea5e9) colors present
- [ ] Orange (#ff5f00) used for standard left borders
- [ ] Magenta (#cf3c69) used ONLY for security contexts
- [ ] Green (#10b981) used ONLY for completed states
- [ ] `{{PREHEADER_TEXT}}` is defined in sample data
- [ ] All images have alt text
- [ ] Contrast ratio ≥ 4.5:1 for all text

### Coherence
- [ ] No "Reply to this email" when sender is noreply@
- [ ] All "contact support" mentions include specific email address
- [ ] Transactional emails don't have consumer unsubscribe link
- [ ] Internal emails have internal preference management
- [ ] Dashboard links only if dashboard exists
- [ ] Contact channels match email context (billing vs support vs security)

---

## File Structure

```
email-templates/
├── master/
│   └── master-template.html    # Base template with design tokens
├── templates/
│   ├── welcome.html            # New customer onboarding
│   ├── invoice-receipt.html    # Payment confirmations
│   ├── notification.html       # System alerts
│   ├── password-reset.html     # Security/auth emails
│   ├── lead-intake.html        # Internal sales notifications
│   ├── sales-cold-outreach.html    # Initial prospecting
│   ├── sales-demo-followup.html    # Post-demo follow-up
│   ├── sales-proposal-sent.html    # Proposal delivery
│   ├── sales-quote-followup.html   # Quote follow-up
│   └── sales-winback.html          # Re-engagement
├── sms/
│   ├── templates/              # SMS/RCS message templates
│   ├── build/
│   │   └── message-builder.ts  # SMS/RCS builder
│   └── preview/                # SMS preview dashboard
├── build/
│   └── template-builder.ts     # Email build system
├── preview/
│   └── *.html                  # Generated email previews
├── STYLE_GUIDE.md              # This document
└── README.md                   # Setup instructions
```

---

## SMS/RCS Guidelines

### Character Limits

| Channel | Single Message | Concatenated |
|---------|---------------|--------------|
| SMS (GSM) | 160 chars | 153 chars/segment |
| SMS (Unicode) | 70 chars | 67 chars/segment |
| RCS | 8000+ chars | N/A |

**Target:** Keep all SMS messages under 160 ASCII characters.

### Brand Voice Compression

When converting email content to SMS:

| Email | SMS |
|-------|-----|
| "Hi {{USER_NAME}}," | "Hi {{FIRST_NAME}}!" |
| Console aesthetic `[INFO]`, `[READY]` | Remove entirely |
| Full HTTPS URLs | Short links (wranngl.co/xxx) |
| Styled CTA buttons | Plain text instruction |
| Multiple paragraphs | Single sentence + action |

### SMS Template Structure

```
[Greeting] [Key info] [Action] [Contact/URL]
```

**Example:**
```
Hi Jane! Your Elite Agent is LIVE. We'll call within 24h. Questions? support@wranngle.com
```

### RCS Rich Features

RCS supports:
- **Suggested actions:** Up to 4 buttons (URL, phone, text)
- **Rich cards:** Image + title + description
- **Carousels:** Multiple cards in a row

**Button guidelines:**
- Primary action first
- Max 25 chars per label
- Include "Unsubscribe" or "STOP" for marketing

### SMS Consent Requirements (TCPA)

All marketing SMS requires:
- [ ] Explicit opt-in before sending
- [ ] STOP keyword honored within 24 hours
- [ ] Opt-out confirmation message sent
- [ ] Consent records with timestamp and method

**Schema fields:**
```typescript
smsConsent: boolean          // true = opted in
smsConsentTimestamp: string  // ISO 8601 timestamp
preferredChannel: 'email' | 'sms' | 'both'
```

### SMS vs Email Decision Matrix

| Scenario | Channel |
|----------|---------|
| Urgent alerts | SMS |
| Welcome/onboarding | Email + SMS |
| Password reset | Email (with SMS option) |
| Invoice/receipt | Email |
| Sales outreach | Email (SMS for follow-up only) |
| Quote follow-up | Email + SMS |
| Marketing campaigns | Email |

---

## RCS Messaging Guidelines

### What is RCS?

Rich Communication Services (RCS) is the next-generation messaging protocol that upgrades SMS with:
- **Branded Sender**: Company logo and name instead of phone number
- **Rich Media**: Images, carousels, and formatted text
- **Suggested Actions**: Interactive buttons (Call, Visit Website, Quick Replies)
- **Read Receipts**: Know when messages are delivered and read
- **Automatic SMS Fallback**: Seamlessly falls back to SMS when RCS unavailable

### RCS Sender Configuration

**Wranngle RCS Sender:**
- Sender ID: `XEf22b2df6414c9923fafecacc1e3c6cbb`
- Display Name: "Wranngle"
- Messaging Service: `MG18bfef5a022578102a9165c1c9a514db`
- SMS Fallback: `+15550100`

### Content API Templates

All RCS messages use Twilio Content API templates with pre-approved content:

| Template | ContentSid | RCS Type | Variables | Actions | Media |
|----------|------------|----------|-----------|---------|-------|
| welcome | HX... | card | FIRST_NAME, PACKAGE | Dashboard, Call Support, Get Started | hero-welcome.png |
| invoice-receipt | HX1b5b613cb2b06c27582ec3a8e5801e0d | card | AMOUNT, INVOICE_ID | View Receipt, Call Billing | receipt-confirmed.png |
| notification | HX0bc926ca95862f317bd8c88d5d3855cc | card | EVENT_TYPE, EVENT_DATA | View Details | notification-alert.png |
| password-reset | HX4e7e81ce36c38a5916080b56c376ca15 | card | RESET_URL, EXPIRY_TIME | Reset Password | security-shield.png |
| lead-intake | HX27f7b91af27cee722463cd80d2eacb5c | card | BUSINESS_NAME, INDUSTRY, OWNER_NAME, PHONE | Call Lead, View in CRM | logo-card.png |
| sales-cold-outreach | HXfffe48244baca47d9d597c74f34b763a | carousel | FIRST_NAME, COMPANY, REP_NAME | Schedule Demo, Interested (x3 cards) | ai-agents, analytics, integrations |
| sales-demo-followup | HX... | card | FIRST_NAME, REP_EMAIL | Get Started, Call Us, Ready to Buy | followup.png |
| sales-proposal-sent | HX... | card | FIRST_NAME, PACKAGE, PRICE | View Proposal, Accept, Questions? | proposal-ready.png |
| sales-quote-followup | HX68644320a6764633724c8945b4fc1a22 | card | FIRST_NAME, QUOTE_ID, REP_NAME | View Quote, Accept Quote | followup.png |
| sales-winback | HXb4f5a844ec6b99993ec1835d50df1ba6 | carousel | FIRST_NAME, NEW_FEATURE_1, NEW_FEATURE_2 | Reactivate, Tell Me More (x3 cards) | ai-agents, integrations, winback |

### RCS Content Types Used

| Content Type | Templates | Description |
|---|---|---|
| `twilio/text` | All 10 | SMS fallback body |
| `twilio/card` | welcome, invoice-receipt, notification, password-reset, lead-intake, sales-demo-followup, sales-proposal-sent, sales-quote-followup | Rich card with media, title, body, and action buttons |
| `twilio/carousel` | sales-cold-outreach, sales-winback | Multi-card swipeable carousel with per-card media and buttons |

#### Card Media

All `twilio/card` templates include a branded media image via the `media` array field. Images are hosted at `https://wranngle.com/assets/rcs/` and must be:
- Publicly accessible HTTPS URLs
- JPEG or PNG format
- Under 16 MB (under 5 MB recommended for MMS fallback)

#### Carousel Structure

Carousels contain 2-3 cards, each with:
- `title` (max 160 chars combined with body)
- `body` (required)
- `media` (required, single image URL)
- `actions` (1-2 buttons, same type order across all cards)

**Constraint:** Button type order (e.g., URL then QUICK_REPLY) must be identical across every card in the carousel.

#### RCS Media Assets

| Asset Key | File | Used By |
|---|---|---|
| hero | `hero-welcome.png` | welcome |
| receipt | `receipt-confirmed.png` | invoice-receipt |
| notification | `notification-alert.png` | notification |
| security | `security-shield.png` | password-reset |
| logo | `logo-card.png` | lead-intake |
| aiAgents | `ai-agents.png` | sales-cold-outreach (carousel) |
| analytics | `analytics-dashboard.png` | sales-cold-outreach (carousel) |
| integrations | `integrations.png` | sales-cold-outreach (carousel), sales-winback (carousel) |
| demo | `demo-preview.png` | — (reserved) |
| followup | `followup.png` | sales-demo-followup, sales-quote-followup |
| proposal | `proposal-ready.png` | sales-proposal-sent |
| winback | `winback-offer.png` | sales-winback (carousel) |

### Message Content Guidelines

#### SMS Body (Fallback)
- **Max Length**: 160 characters (GSM-7 encoding)
- **URL Handling**: Use short URLs (wranngle.com/shortcode)
- **Currency**: `$542.50` (no escaping needed)
- **Emojis**: Avoid (consumes 2-4 chars each)

#### RCS Body (Enhanced)
- **Max Length**: 3072 characters
- **Formatting**: Line breaks (`\n`), bold (**text**), italic (*text*)
- **Media**: Publicly accessible URLs (HTTPS only)
- **Emojis**: ✅ Supported and recommended for emphasis

### Suggested Actions (Buttons)

RCS supports up to **4 buttons per message**:

| Action Type | Usage | Example |
|-------------|-------|---------|
| **URL** | Open website/dashboard | "View Invoice", "Schedule Demo" |
| **PHONE** | Initiate phone call | "Call Support" (`+15550100`) |
| **QUICK_REPLY** | Send predefined response | "Yes, interested", "Not now" |

**Button Title Limits:**
- Max 20 characters per button
- Use action verbs ("View", "Call", "Schedule")
- Avoid generic labels like "Click Here"

### Variable Naming Conventions

All variables use **SCREAMING_SNAKE_CASE**:

```typescript
{
  FIRST_NAME: string      // User's first name
  LAST_NAME: string       // User's last name (avoid if possible)
  COMPANY: string         // Business name
  AMOUNT: string          // Currency amount (without $ symbol)
  INVOICE_ID: string      // Invoice/quote/order ID
  PACKAGE: string         // Product/service package name
  REP_NAME: string        // Sales rep name
  REP_EMAIL: string       // Sales rep email
  EVENT_TYPE: string      // Notification category
  EVENT_DATA: string      // Notification details
  RESET_URL: string       // Password reset link
  EXPIRY_TIME: string     // Time-sensitive expiration
}
```

### RCS vs SMS Decision Matrix

| Scenario | RCS | SMS | Reasoning |
|----------|-----|-----|-----------|
| Welcome new customer | ✅ Primary | Fallback | Rich branding, dashboard link |
| Invoice receipt | ✅ Primary | Fallback | "View Receipt" button, branded |
| Password reset | ✅ Primary | Fallback | Secure branded sender, action button |
| Sales outreach | ✅ Primary | Fallback | Professional branding, demo link |
| Emergency alerts | ❌ | ✅ Primary | SMS more reliable for urgent |
| Marketing campaigns | ✅ Primary | Fallback | Rich media, better engagement |
| Lead notifications (internal) | ❌ | ✅ Primary | Simple, fast delivery |

### Testing Workflow

1. **Development**: Test via n8n webhook with `channel: "auto"`
2. **RCS Test Device**: Add test phone to RCS Sender for pre-approval testing
3. **Verification**: Check Twilio Console > Messaging > Logs for "RCS" channel
4. **Fallback Test**: Send to non-RCS device, verify SMS fallback

### Carrier Approval Requirements

RCS Senders require carrier approval (AT&T, T-Mobile, Verizon):

- [ ] Brand logo (square, min 1024x1024px)
- [ ] Brand banner (optional, 1440x720px)
- [ ] Plain text description (no special chars)
- [ ] Privacy policy URL (HTTPS)
- [ ] Terms of service URL (HTTPS)
- [ ] Contact phone number (E.164 format)
- [ ] Submit via Twilio Console
- [ ] Wait 4-6 weeks for approval

**Post-Approval:**
- Test all templates with suggested actions
- Verify branded sender appears on devices
- Monitor delivery rates (RCS vs SMS fallback)

### n8n Workflow Integration

**Webhook Endpoint:**
```
POST https://n8n.wranngle.com/webhook/universal-message-v1
```

**Request Format:**
```json
{
  "phone_number": "+12602217355",
  "channel": "auto",  // "sms" | "rcs" | "auto"
  "template": "welcome",
  "variables": {
    "FIRST_NAME": "Cody",
    "PACKAGE": "Elite Agent"
  }
}
```

**Authentication:**
- Header: `X-Webhook-Secret: test-secret-placeholder`
- OR User-Agent contains "ElevenLabs"
- OR Host is localhost

### Character Encoding

**SMS (GSM-7):**
- Standard chars: 160 per message
- Extended chars (`[ ] { } | \`): 2 chars each
- Unicode/emoji: Triggers UCS-2 (70 chars per message)

**RCS (UTF-8):**
- Full Unicode support
- No character penalties
- Emojis count as 1 character

### Compliance & Best Practices

✅ **DO:**
- Use RCS for transactional messages (receipts, confirmations)
- Include clear value in button text ("View Invoice", "Track Order")
- Provide STOP instructions in marketing messages
- Test SMS fallback for every RCS template
- Monitor delivery reports in Twilio Console

❌ **DON'T:**
- Send marketing RCS without consent
- Use ALL CAPS in RCS body (looks spammy)
- Include multiple URLs in SMS fallback (use buttons in RCS instead)
- Rely solely on RCS (always have SMS fallback)
- Skip carrier approval process (required for production)

### Monitoring & Analytics

Track these metrics in Twilio Console:

- **Delivery Rate**: % of messages delivered successfully
- **Channel Split**: RCS vs SMS fallback ratio
- **Read Rate**: % of RCS messages opened (when available)
- **Button Click Rate**: Engagement with suggested actions
- **Failure Codes**: Track error 63036 (RCS unavailable)

### Troubleshooting

| Issue | Cause | Solution |
|-------|-------|----------|
| Error 63036 | Device doesn't support RCS | Normal - SMS fallback automatic |
| RCS not delivering | Sender not approved | Check Twilio Console approval status |
| Buttons not showing | Using SMS instead of RCS | Verify recipient has RCS-capable device |
| Variables not substituting | Wrong ContentSid | Verify template ContentSid matches |
| Dollar signs escaped | Old workflow issue | Fixed in Universal Message Sender v2 |

### Additional Resources

- [Twilio RCS Documentation](https://www.twilio.com/docs/rcs)
- [Content API Reference](https://www.twilio.com/docs/content)
- [RCS Guidelines (US)](https://www.twilio.com/en-us/guidelines/us/rcs)
- n8n Workflow: `CBoXlSNiDOHA5YmA` (Universal Message Sender)

---

**Last Updated:** 2026-01-28
**Version:** 2.1 (Added RCS media, carousels, enriched all 10 templates)
