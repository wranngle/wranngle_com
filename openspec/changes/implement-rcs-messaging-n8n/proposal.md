# Proposal: Implement RCS Messaging via n8n

**Change ID:** `implement-rcs-messaging-n8n`
**Status:** Draft
**Author:** Claude
**Date:** 2026-01-24

---

## Problem Statement

Current SMS sending has three issues:

1. **Escaping bugs** - Shell-based curl commands cause `\$500` instead of `$500`
2. **SMS only** - No RCS (Rich Communication Services) with rich media, buttons, branded sender
3. **Hardcoded templates** - Existing n8n workflow only has 3 templates (`demo`, `recap`, `followup`)

User explicitly requested:
- RCS messaging (not just SMS)
- Route through n8n (not direct Twilio API calls)
- Extensible for any message type
- Visual verification capability

---

## Proposed Solution

### 1. Twilio RCS Onboarding (Prerequisite)

Per [Twilio RCS documentation](https://www.twilio.com/docs/rcs/onboarding):
- Create RCS Sender in Twilio Console
- Complete brand verification (4-6 week process)
- RCS Senders don't use phone numbers - they use branded agent profiles
- Automatic SMS fallback when RCS unavailable

### 2. Extend n8n Workflow: Universal Message Sender

Transform "Sarah SMS Tool - BULLETPROOF v3.0" (`uFFwYcr7XgdRCvdW`) into a universal messaging workflow:

**New Input Schema:**
```json
{
  "phone_number": "+1XXXXXXXXXX",
  "channel": "auto",           // "sms" | "rcs" | "auto" (RCS with SMS fallback)
  "template": "welcome",       // 10 template types
  "variables": {
    "FIRST_NAME": "Cody",
    "PACKAGE": "Elite Agent",
    "AMOUNT": "542.50"
  }
}
```

**Supported Templates (10):**
| Template | Category | Description |
|----------|----------|-------------|
| `welcome` | marketing | New customer onboarding |
| `invoice-receipt` | transactional | Payment confirmation |
| `notification` | marketing | System alerts |
| `password-reset` | transactional | Security reset link |
| `lead-intake` | internal | New lead notification |
| `sales-cold-outreach` | sales | Initial prospecting |
| `sales-demo-followup` | sales | Post-demo follow-up |
| `sales-proposal-sent` | sales | Proposal delivery |
| `sales-quote-followup` | sales | Quote follow-up |
| `sales-winback` | sales | Re-engagement |

### 3. RCS Rich Features

When `channel: "rcs"` or `channel: "auto"`:
- **Branded sender** - "Wranngle" logo + name instead of phone number
- **Suggested actions** - Quick reply buttons (e.g., "Schedule Demo", "View Proposal")
- **Rich cards** - Image + text + buttons in single message
- **Read receipts** - Delivery confirmation

### 4. Twilio Content API for Templates

Use [Twilio Content API](https://www.twilio.com/docs/content) to manage templates:
- Pre-approved message templates
- No escaping issues (JSON body, not shell)
- Variables replaced server-side
- Same template works for SMS and RCS

---

## Implementation Approach

### Phase 1: RCS Onboarding (Blocking)
1. Create RCS Sender in Twilio Console
2. Submit brand verification documents
3. Wait for carrier approval (4-6 weeks)
4. Configure SMS fallback in Messaging Service

### Phase 2: n8n Workflow Modification
1. Add `channel` and `template` input parameters
2. Create template lookup node (10 templates with SMS/RCS variants)
3. Add channel routing (RCS vs SMS vs Auto)
4. Add Twilio Content API integration for template rendering
5. Add visual verification node (capture screenshot of Twilio console)

### Phase 3: Template Library
1. Port 10 templates from `message-builder.ts` to Twilio Content API
2. Create RCS-specific variants with suggested actions
3. Test each template with real delivery

### Phase 4: E2E Testing via n8n
1. Create test workflow that sends all 10 templates
2. Capture delivery status for each
3. Generate test report

---

## Architecture Decision

**Why n8n instead of direct TypeScript?**
1. **Visual debugging** - See message flow in n8n UI
2. **Retry logic** - Built-in error handling already in workflow
3. **Credential management** - Twilio auth centralized
4. **Audit trail** - Execution history for compliance
5. **No escaping issues** - JSON bodies, not shell commands

**Why Twilio Content API?**
1. **Template pre-approval** - Required for RCS
2. **Variable substitution** - Server-side, no escaping
3. **Cross-channel** - Same template ID for SMS and RCS
4. **Compliance** - Templates reviewed for carrier requirements

---

## Blockers & Dependencies

| Blocker | Status | Resolution |
|---------|--------|------------|
| RCS Sender not created | BLOCKING | Create in Twilio Console |
| Brand verification pending | BLOCKING | 4-6 week wait |
| Carrier approval | BLOCKING | Submit for AT&T, T-Mobile, Verizon |
| Content API templates | PENDING | Create after RCS Sender approved |

---

## Success Criteria

1. Send RCS message with branded sender (not phone number)
2. Receive RCS with suggested action buttons
3. All 10 templates working via n8n webhook
4. Automatic SMS fallback when RCS unavailable
5. No escaping bugs (`$500.00` displays correctly)
6. Visual verification in Twilio console

---

## Files to Modify/Create

| File | Action |
|------|--------|
| `workflows/n8n/universal-message-sender.json` | CREATE - New workflow |
| `email-templates/sms/build/message-builder.ts` | KEEP - Reference for templates |
| `scripts/test-rcs-templates.ts` | CREATE - E2E test script |

---

## References

- [Twilio RCS Onboarding](https://www.twilio.com/docs/rcs/onboarding)
- [Twilio Content API](https://www.twilio.com/docs/content)
- [Send RCS Messages](https://www.twilio.com/docs/rcs/send-an-rcs-message)
- [US RCS Guidelines](https://www.twilio.com/en-us/guidelines/us/rcs)
- Existing workflow: `Sarah SMS Tool - BULLETPROOF v3.0` (id: `uFFwYcr7XgdRCvdW`)
