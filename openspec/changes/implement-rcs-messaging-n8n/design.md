# Design: RCS Messaging via n8n

**Change ID:** `implement-rcs-messaging-n8n`

---

## Architecture Overview

```
┌─────────────────┐     ┌──────────────────────────────────────────┐
│   Caller        │     │  n8n: Universal Message Sender           │
│  (ElevenLabs,   │────>│                                          │
│   Test Script,  │     │  ┌────────────┐   ┌──────────────────┐   │
│   Manual)       │     │  │ Webhook    │──>│ Template Lookup  │   │
└─────────────────┘     │  │ Trigger    │   │ (10 templates)   │   │
                        │  └────────────┘   └────────┬─────────┘   │
                        │                            │              │
                        │  ┌─────────────────────────▼───────────┐  │
                        │  │         Channel Router              │  │
                        │  │   auto / rcs / sms                  │  │
                        │  └────┬────────────┬───────────────────┘  │
                        │       │            │                      │
                        │  ┌────▼────┐  ┌────▼────┐                 │
                        │  │ RCS     │  │ SMS     │                 │
                        │  │ Path    │  │ Path    │                 │
                        │  └────┬────┘  └────┬────┘                 │
                        │       │            │                      │
                        │  ┌────▼────────────▼────┐                 │
                        │  │   Twilio API Call    │                 │
                        │  │   (Messaging Service) │                 │
                        │  └────────────┬─────────┘                 │
                        └───────────────│──────────────────────────┘
                                        │
                                        ▼
                        ┌───────────────────────────────────────────┐
                        │           Twilio Messaging Service        │
                        │                                           │
                        │  ┌─────────────┐   ┌─────────────────┐   │
                        │  │ RCS Sender  │   │ Phone Number    │   │
                        │  │ (Wranngle)  │   │ +18882662193    │   │
                        │  │             │   │ (SMS Fallback)  │   │
                        │  └─────────────┘   └─────────────────┘   │
                        └───────────────────────────────────────────┘
```

---

## API Contract

### Webhook Input

**Endpoint:** `https://n8n.wranngle.com/webhook/universal-message`

**Method:** POST

**Headers:**
```
Content-Type: application/json
X-Webhook-Secret: wranngle-msg-2026
```

**Body:**
```json
{
  "phone_number": "+12602217355",
  "channel": "auto",
  "template": "welcome",
  "variables": {
    "FIRST_NAME": "Cody",
    "PACKAGE": "Elite Agent"
  }
}
```

### Field Definitions

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `phone_number` | string | Yes | - | E.164 format (+1XXXXXXXXXX) |
| `channel` | enum | No | "auto" | "sms", "rcs", or "auto" |
| `template` | string | Yes | - | One of 10 template names |
| `variables` | object | Yes | - | Key-value pairs for template substitution |

### Webhook Output

**Success (200):**
```json
{
  "success": true,
  "status": "delivered",
  "channel": "rcs",
  "message_sid": "SMxxxxxxxxx",
  "recipient": "+12602217355",
  "template": "welcome",
  "request_id": "1737781234-abc123"
}
```

**Error (4xx/5xx):**
```json
{
  "success": false,
  "error": "INVALID_TEMPLATE",
  "message": "Template 'unknown' not found",
  "available_templates": ["welcome", "invoice-receipt", ...],
  "request_id": "1737781234-abc123"
}
```

---

## Template Library Design

### Template Data Structure

```typescript
interface MessageTemplate {
  id: string;
  name: string;
  category: 'transactional' | 'marketing' | 'sales' | 'internal';

  sms: {
    body: string;  // Max 160 chars, GSM encoding
  };

  rcs: {
    body: string;  // Can be longer, supports formatting
    suggestedActions?: SuggestedAction[];
  };

  variables: string[];  // Required variables
  contentSid?: string;  // Twilio Content API template ID (after approval)
}

interface SuggestedAction {
  type: 'url' | 'phone' | 'reply';
  title: string;
  value: string;
}
```

### Template Registry (n8n Code Node)

```javascript
const TEMPLATES = {
  'welcome': {
    id: 'welcome',
    category: 'marketing',
    sms: {
      body: "Hi {{FIRST_NAME}}! Your {{PACKAGE}} agent is LIVE. We'll call within 24h. Questions? support@wranngle.com"
    },
    rcs: {
      body: "Hi {{FIRST_NAME}}!\n\nYour {{PACKAGE}} AI agent is now LIVE.\n\nOur team will call within 24 hours to customize your knowledge base.",
      suggestedActions: [
        { type: 'url', title: 'Dashboard', value: '{{DASHBOARD_URL}}' },
        { type: 'phone', title: 'Call Support', value: '+18005551234' }
      ]
    },
    variables: ['FIRST_NAME', 'PACKAGE', 'DASHBOARD_URL']
  },

  'invoice-receipt': {
    id: 'invoice-receipt',
    category: 'transactional',
    sms: {
      body: "Wranngle: Payment of ${{AMOUNT}} received for {{INVOICE_ID}}. View: {{SHORT_URL}}"
    },
    rcs: {
      body: "Payment Confirmed\n\nAmount: ${{AMOUNT}}\nInvoice: {{INVOICE_ID}}\n\nThank you for your business!",
      suggestedActions: [
        { type: 'url', title: 'View Receipt', value: '{{INVOICE_URL}}' }
      ]
    },
    variables: ['AMOUNT', 'INVOICE_ID', 'SHORT_URL', 'INVOICE_URL']
  },

  // ... 8 more templates
};
```

---

## Twilio API Integration

### For SMS (Current Implementation)
```
POST /2010-04-01/Accounts/{AccountSid}/Messages.json

Body:
  To: +12602217355
  From: +18882662193
  Body: Hi Cody! Your Elite Agent...
```

### For RCS via Messaging Service
```
POST /2010-04-01/Accounts/{AccountSid}/Messages.json

Body:
  To: +12602217355
  MessagingServiceSid: MGxxxxxxxxx        // Messaging Service with RCS Sender
  ContentSid: HXxxxxxxxxx                  // Content API template ID
  ContentVariables: {"1":"Cody","2":"Elite Agent"}
```

### Automatic Fallback

Twilio Messaging Service handles fallback automatically:
1. Check if recipient supports RCS
2. If yes → Send via RCS Sender
3. If no → Send via SMS phone number

No code changes needed for fallback - just configure Messaging Service correctly.

---

## Channel Detection Logic

```javascript
// In n8n Code node
function determineChannel(requestedChannel, phoneNumber) {
  if (requestedChannel === 'sms') {
    return 'sms';
  }

  if (requestedChannel === 'rcs') {
    // Force RCS - will fail if not supported
    return 'rcs';
  }

  // auto: Let Twilio Messaging Service decide
  // Use MessagingServiceSid which auto-fallbacks
  return 'auto';
}
```

---

## Error Handling

### Template Errors
| Error | Code | Resolution |
|-------|------|------------|
| Unknown template | 400 | Return available templates list |
| Missing variable | 400 | Return required variables list |
| Variable format invalid | 400 | Return expected format |

### Twilio Errors
| Error Code | Description | Action |
|------------|-------------|--------|
| 30032 | Toll-free not A2P verified | Use Messaging Service instead |
| 21211 | Invalid phone format | Return E.164 hint |
| 21614 | Not SMS-capable | Mark as undeliverable |
| 30003 | Carrier unreachable | Retry with backoff |

### RCS-Specific Errors
| Error | Action |
|-------|--------|
| RCS not supported | Automatic SMS fallback via Messaging Service |
| RCS Sender not approved | Wait for carrier approval |
| Content template rejected | Modify template and resubmit |

---

## Security Considerations

1. **Webhook Authentication**
   - Require `X-Webhook-Secret` header
   - Allow ElevenLabs User-Agent
   - Allow localhost for development

2. **Phone Number Validation**
   - E.164 format required
   - Reject obvious test numbers in production
   - Rate limit per phone number

3. **Template Injection Prevention**
   - Sanitize variable values
   - Escape HTML/special characters
   - Limit variable length

---

## Monitoring & Observability

### Metrics to Track
- Messages sent per template
- RCS vs SMS ratio
- Delivery success rate
- Average delivery time
- Template-specific failure rates

### Logging
```json
{
  "timestamp": "2026-01-24T23:45:00Z",
  "event": "message_sent",
  "request_id": "1737781234-abc123",
  "template": "welcome",
  "channel": "rcs",
  "recipient": "+1260221****",
  "status": "delivered",
  "twilio_sid": "SMxxxxxxxxx"
}
```

---

## Migration Path

### Phase 1: Parallel Operation
- New workflow runs alongside existing Sarah SMS Tool
- Existing callers continue using old endpoint
- New callers use new endpoint

### Phase 2: Redirect
- Update ElevenLabs agent tools to use new endpoint
- Monitor for errors
- Keep old workflow active for rollback

### Phase 3: Deprecation
- Archive old workflow after 30 days of successful operation
- Document migration complete

---

## Twilio Console Visual Verification

After sending messages, verify in Twilio Console:

1. Navigate to: `Messaging > Logs > Messages`
2. Filter by: Last 1 hour
3. Check columns:
   - **To:** Target phone number
   - **Status:** "delivered" (green)
   - **Channel:** "RCS" (not "SMS")
   - **Body:** Correct template content
4. Click message SID for details:
   - Delivery timestamps
   - Carrier info
   - Any error codes
