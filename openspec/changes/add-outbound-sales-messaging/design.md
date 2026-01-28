# Design: Add Outbound Sales Templates + RCS Mobile Siblings

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    MESSAGE SYSTEM                           │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐  │
│  │    Email     │    │     SMS      │    │     RCS      │  │
│  │  Templates   │    │  Templates   │    │  Templates   │  │
│  │  (HTML)      │    │  (160 char)  │    │  (Rich)      │  │
│  └──────┬───────┘    └──────┬───────┘    └──────┬───────┘  │
│         │                   │                   │          │
│         └───────────────────┼───────────────────┘          │
│                             │                              │
│                    ┌────────▼────────┐                     │
│                    │ MessageBuilder  │                     │
│                    │   (Unified)     │                     │
│                    └────────┬────────┘                     │
│                             │                              │
│         ┌───────────────────┼───────────────────┐          │
│         │                   │                   │          │
│  ┌──────▼──────┐    ┌───────▼──────┐    ┌──────▼──────┐   │
│  │   SMTP2GO   │    │    Twilio    │    │   Twilio    │   │
│  │   (Email)   │    │    (SMS)     │    │   (RCS)     │   │
│  └─────────────┘    └──────────────┘    └─────────────┘   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## File Structure

```
email-templates/
├── templates/
│   ├── [existing 5 templates]
│   ├── sales-cold-outreach.html       # NEW
│   ├── sales-demo-followup.html       # NEW
│   ├── sales-proposal-sent.html       # NEW
│   ├── sales-quote-followup.html      # NEW
│   └── sales-winback.html             # NEW
│
├── sms/                               # NEW DIRECTORY
│   ├── templates/
│   │   ├── welcome.ts
│   │   ├── invoice-receipt.ts
│   │   ├── notification.ts
│   │   ├── password-reset.ts
│   │   ├── lead-intake.ts
│   │   ├── sales-cold-outreach.ts
│   │   ├── sales-demo-followup.ts
│   │   ├── sales-proposal-sent.ts
│   │   ├── sales-quote-followup.ts
│   │   └── sales-winback.ts
│   ├── build/
│   │   └── message-builder.ts
│   └── preview/
│       └── index.html
│
└── build/
    └── template-builder.ts            # MODIFIED
```

## SMS Message Interface

```typescript
interface RcsSuggestion {
  type: 'url' | 'phone' | 'text';
  label: string;
  value: string;
}

interface MessageTemplate {
  name: string;
  description: string;

  // SMS variant (160 char limit)
  sms: {
    body: string;
    fallback?: string;  // For non-ASCII chars
  };

  // RCS variant (rich messaging)
  rcs?: {
    body: string;
    suggestions?: RcsSuggestion[];
    media?: {
      url: string;
      type: 'image' | 'video';
    };
  };

  // Template metadata
  variables: string[];
  emailSibling: string;
  category: 'transactional' | 'marketing' | 'sales' | 'internal';
}
```

## Brand Voice Compression (Email → SMS)

| Aspect | Email | SMS |
|--------|-------|-----|
| Greeting | "Hi {{USER_NAME}}," | "Hi {{FIRST_NAME}}!" |
| Console aesthetic | `[INFO]`, `[READY]` | Removed |
| URLs | Full HTTPS URLs | Short links (wranngl.co/xxx) |
| CTA | Button with styling | Plain text instruction |
| Length | Unlimited | 160 characters max |

## Example Transformations

### Welcome Email → SMS

**Email Hero:**
```
Welcome to Wranngle
[ SYSTEM INITIALIZED ]

Your AI agent deployment is confirmed. We're excited to help you tame the wild frontier of automation.
```

**SMS (155 chars):**
```
Hi {{FIRST_NAME}}! Your {{PACKAGE_NAME}} agent is LIVE. We'll call within 24h to configure it. Questions? support@wranngle.com
```

**RCS:**
```
Hi {{FIRST_NAME}}!

Your {{PACKAGE_NAME}} AI agent is now LIVE and ready to answer calls.

Our team will contact you within 24 hours to configure your knowledge base.

[Access Dashboard] [Contact Support]
```

## Sales Email Design Patterns

### Cold Outreach Pattern
- **Hero:** Problem statement hook
- **Body:** 2-3 pain points with solutions
- **CTA:** Single "Schedule a Call" button
- **Tone:** Consultative, not pushy

### Follow-up Pattern
- **Hero:** Reference previous interaction
- **Body:** Summary + next steps
- **CTA:** Primary action + secondary option
- **Tone:** Helpful, momentum-building

### Winback Pattern
- **Hero:** "We miss you" / "Let's reconnect"
- **Body:** What's new since they left
- **CTA:** Low-commitment re-engagement
- **Tone:** Warm, non-pressuring

## Consent Tracking Schema

```typescript
// Added to shared/schema.ts
'smsConsent?': 'boolean',           // Explicit SMS opt-in
'smsConsentTimestamp?': 'string',   // ISO timestamp of consent
'preferredChannel?': '"email" | "sms" | "both"',  // Channel preference
```

## n8n Integration Pattern

```json
{
  "nodes": [
    {
      "name": "Check Consent",
      "type": "n8n-nodes-base.if",
      "parameters": {
        "conditions": {
          "boolean": [{ "value1": "={{$json.smsConsent}}", "value2": true }]
        }
      }
    },
    {
      "name": "Send SMS",
      "type": "n8n-nodes-base.twilio",
      "parameters": {
        "to": "={{$json.phone}}",
        "body": "={{$json.smsBody}}"
      }
    }
  ]
}
```
