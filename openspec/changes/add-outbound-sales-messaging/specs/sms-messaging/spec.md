# Spec: SMS/RCS Messaging System

## Overview

SMS and RCS text message siblings for all 10 email templates, enabling multi-channel communication.

## Constraints

### SMS Limits
| Carrier | Single SMS | Concatenated |
|---------|-----------|--------------|
| GSM | 160 chars | 153 chars/segment |
| Unicode | 70 chars | 67 chars/segment |

**Target:** All messages under 160 ASCII characters to avoid segmentation charges.

### RCS Capabilities
- Up to 8000 characters
- Rich cards with images
- Suggested actions (buttons)
- Carousels
- Typing indicators

## Message Templates

### 1. welcome.ts
```typescript
{
  name: 'welcome',
  sms: {
    body: 'Hi {{FIRST_NAME}}! Your {{PACKAGE}} agent is LIVE. We\'ll call within 24h to configure it. Questions? support@wranngle.com',
    // 125 chars
  },
  rcs: {
    body: 'Hi {{FIRST_NAME}}!\n\nYour {{PACKAGE}} AI agent is now LIVE. Our team will call within 24 hours to customize your knowledge base.',
    suggestions: [
      { type: 'url', label: 'Dashboard', value: '{{DASHBOARD_URL}}' },
      { type: 'phone', label: 'Call Support', value: '+18005551234' }
    ]
  }
}
```

### 2. invoice-receipt.ts
```typescript
{
  name: 'invoice-receipt',
  sms: {
    body: 'Wranngle: Payment of ${{AMOUNT}} received for {{INVOICE_ID}}. View receipt: {{SHORT_URL}}',
    // 85 chars + vars
  },
  rcs: {
    body: 'Payment Confirmed\n\nAmount: ${{AMOUNT}}\nInvoice: {{INVOICE_ID}}\n\nThank you for your business!',
    suggestions: [
      { type: 'url', label: 'View Receipt', value: '{{INVOICE_URL}}' }
    ]
  }
}
```

### 3. notification.ts
```typescript
{
  name: 'notification',
  sms: {
    body: 'Wranngle Alert: {{EVENT_TYPE}} - {{EVENT_DATA}}. Details: {{SHORT_URL}}',
    // 70 chars + vars
  },
  rcs: {
    body: '{{NOTIFICATION_TITLE}}\n\n{{NOTIFICATION_MESSAGE}}\n\nTimestamp: {{TIMESTAMP}}',
    suggestions: [
      { type: 'url', label: 'View Details', value: '{{CTA_URL}}' }
    ]
  }
}
```

### 4. password-reset.ts
```typescript
{
  name: 'password-reset',
  sms: {
    body: 'Wranngle: Reset your password here: {{SHORT_URL}} - Expires in {{EXPIRY_TIME}}. Didn\'t request this? Ignore.',
    // 105 chars
  },
  rcs: {
    body: 'Password Reset Request\n\nClick below to reset your password. Link expires in {{EXPIRY_TIME}}.\n\nIf you didn\'t request this, ignore this message.',
    suggestions: [
      { type: 'url', label: 'Reset Password', value: '{{RESET_URL}}' }
    ]
  }
}
```

### 5. lead-intake.ts
```typescript
{
  name: 'lead-intake',
  sms: {
    body: 'New Lead: {{BUSINESS_NAME}} ({{INDUSTRY}}) - {{OWNER_NAME}} {{PHONE}}. Status: {{STATUS}}',
    // 90 chars + vars
  },
  rcs: {
    body: 'New Lead Captured\n\nBusiness: {{BUSINESS_NAME}}\nIndustry: {{INDUSTRY}}\nContact: {{OWNER_NAME}}\nPhone: {{PHONE}}\nPackage: {{PACKAGE}}',
    suggestions: [
      { type: 'phone', label: 'Call Lead', value: '{{PHONE}}' }
    ]
  }
}
```

### 6. sales-cold-outreach.ts
```typescript
{
  name: 'sales-cold-outreach',
  sms: {
    body: 'Hi {{FIRST_NAME}}, {{COMPANY}} missing calls? Wranngle AI answers 24/7. Free demo: {{SHORT_URL}} -Alex, Wranngle',
    // 110 chars
  },
  rcs: {
    body: 'Hi {{FIRST_NAME}},\n\nIs {{COMPANY}} missing after-hours calls? Our AI agents answer 24/7, qualify leads, and book appointments.\n\nLet\'s chat about how we can help.',
    suggestions: [
      { type: 'url', label: 'Schedule Demo', value: '{{CALENDAR_URL}}' },
      { type: 'text', label: 'Not Interested', value: 'STOP' }
    ]
  }
}
```

### 7. sales-demo-followup.ts
```typescript
{
  name: 'sales-demo-followup',
  sms: {
    body: 'Hi {{FIRST_NAME}}, thanks for the demo! Recording: {{SHORT_URL}} Questions? Reply or email {{REP_EMAIL}}',
    // 105 chars
  },
  rcs: {
    body: 'Thanks for the Demo!\n\nHi {{FIRST_NAME}}, it was great showing you Wranngle. Here\'s your recording and proposal.',
    suggestions: [
      { type: 'url', label: 'Watch Recording', value: '{{RECORDING_URL}}' },
      { type: 'url', label: 'View Proposal', value: '{{PROPOSAL_URL}}' }
    ]
  }
}
```

### 8. sales-proposal-sent.ts
```typescript
{
  name: 'sales-proposal-sent',
  sms: {
    body: 'Hi {{FIRST_NAME}}, your Wranngle proposal is ready! {{PACKAGE}} @ {{PRICE}}/mo. View: {{SHORT_URL}}',
    // 95 chars
  },
  rcs: {
    body: 'Your Proposal is Ready\n\nPackage: {{PACKAGE}}\nPrice: {{PRICE}}/month\nValid until: {{VALID_UNTIL}}',
    suggestions: [
      { type: 'url', label: 'View Proposal', value: '{{PROPOSAL_URL}}' },
      { type: 'phone', label: 'Questions?', value: '{{REP_PHONE}}' }
    ]
  }
}
```

### 9. sales-quote-followup.ts
```typescript
{
  name: 'sales-quote-followup',
  sms: {
    body: 'Hi {{FIRST_NAME}}, checking in on your quote ({{QUOTE_ID}}). Ready to proceed? {{SHORT_URL}} -{{REP_NAME}}',
    // 105 chars
  },
  rcs: {
    body: 'Checking In\n\nHi {{FIRST_NAME}}, just following up on your quote. Any questions I can answer?',
    suggestions: [
      { type: 'url', label: 'View Quote', value: '{{QUOTE_URL}}' },
      { type: 'url', label: 'Have Questions', value: '{{REP_CALENDAR}}' }
    ]
  }
}
```

### 10. sales-winback.ts
```typescript
{
  name: 'sales-winback',
  sms: {
    body: 'Hi {{FIRST_NAME}}, we\'ve added SMS agents + CRM integrations since we last talked. Reconnect? {{SHORT_URL}}',
    // 110 chars
  },
  rcs: {
    body: 'Let\'s Reconnect!\n\nHi {{FIRST_NAME}}, a lot has changed at Wranngle:\n\n✓ {{NEW_FEATURE_1}}\n✓ {{NEW_FEATURE_2}}\n\nSpecial offer: {{SPECIAL_OFFER}}',
    suggestions: [
      { type: 'url', label: 'Schedule Call', value: '{{CALENDAR_URL}}' },
      { type: 'text', label: 'Unsubscribe', value: 'STOP' }
    ]
  }
}
```

## MessageBuilder Interface

```typescript
interface MessageBuilderOptions {
  channel: 'sms' | 'rcs' | 'auto';  // auto = RCS with SMS fallback
  variables: Record<string, string>;
  urlShortener?: (url: string) => Promise<string>;
}

class MessageBuilder {
  async build(templateName: string, options: MessageBuilderOptions): Promise<{
    body: string;
    channel: 'sms' | 'rcs';
    characterCount: number;
    segments: number;
    suggestions?: RcsSuggestion[];
  }>;

  validate(message: string): {
    valid: boolean;
    length: number;
    segments: number;
    warnings: string[];
  };
}
```

## Consent Requirements

### TCPA Compliance
- Explicit opt-in required before sending marketing SMS
- STOP keyword must be honored within 24 hours
- Opt-out confirmation message required
- Consent records must include timestamp and method

### Schema Fields
```typescript
'smsConsent?': 'boolean',              // true = opted in
'smsConsentTimestamp?': 'string',      // ISO 8601 timestamp
'smsConsentMethod?': 'string',         // 'web_form' | 'verbal' | 'text'
'preferredChannel?': '"email" | "sms" | "both"',
```

## Twilio Integration

### Credentials Required
| Variable | Description |
|----------|-------------|
| `TWILIO_ACCOUNT_SID` | Account identifier |
| `TWILIO_AUTH_TOKEN` | API authentication |
| `TWILIO_PHONE_NUMBER` | Sending number |
| `TWILIO_MESSAGING_SERVICE_SID` | For high-volume |

### n8n Node Configuration
```json
{
  "type": "n8n-nodes-base.twilio",
  "parameters": {
    "operation": "sendSms",
    "from": "={{$env.TWILIO_PHONE_NUMBER}}",
    "to": "={{$json.phone}}",
    "body": "={{$json.smsBody}}"
  }
}
```
