# Proposal: Add RCS/SMS Notification to Lead Intake Flow

**Change ID:** `add-lead-intake-rcs-notification`
**Status:** Draft
**Author:** Claude
**Date:** 2026-01-29
**GitHub Issue:** #27

---

## Problem Statement

When a lead submits the intake form on wranngle.com, the data flows to an n8n webhook for processing but **no real-time notification** reaches the sales team. There is no SMS/RCS alert, meaning leads may sit unnoticed until someone manually checks.

The Universal Message Sender workflow (`CBoXlSNiDOHA5YmA`) already exists with a validated `lead-intake` template (`HXb4b86ecf9b132b6fa87879d8cfc37d10`) that includes rich RCS cards with buttons. Nothing currently calls it from the lead intake path.

---

## Proposed Solution

Wire the existing n8n lead processing workflow to call the Universal Message Sender webhook after a lead is captured, sending a `lead-intake` RCS/SMS notification to the sales team phone number.

### What exists already (no changes needed):
- Universal Message Sender webhook: `https://n8n.wranngle.com/webhook/universal-message-v1`
- `lead-intake` Content API template with RCS card (image, "View in CRM" + "View Details" buttons)
- Input validation (required: BUSINESS_NAME, INDUSTRY, OWNER_NAME, PHONE)
- SMS fallback via MessagingService `MG18bfef5a022578102a9165c1c9a514db`

### What needs to happen:
1. **Identify the lead processing n8n workflow** that receives the `/api/leads` POST
2. **Add an HTTP Request node** after lead processing to call Universal Message Sender with:
   - `phone_number`: Sales team notification number (E.164)
   - `template`: `"lead-intake"`
   - `variables`: `{ BUSINESS_NAME, INDUSTRY, OWNER_NAME, PHONE }` mapped from the lead data
3. **Fire-and-forget**: The notification call should not block the lead processing response. If notification fails, lead capture still succeeds.
4. **Configure sales team phone number** as an environment variable or n8n credential

---

## Scope

| In Scope | Out of Scope |
|----------|-------------|
| Wire lead intake n8n workflow to UMS | New templates or Content API changes |
| Map lead form fields to template variables | Changes to `/api/leads` endpoint |
| Sales team phone number configuration | Multi-recipient notification (future) |
| Fire-and-forget notification (non-blocking) | Notification delivery guarantees |

---

## Architecture Decision

**Why call Universal Message Sender instead of Twilio directly?**
- UMS already has validated templates, ContentSid routing, retry logic, and delivery verification
- Single point of change for template updates
- Consistent auth/routing through MessagingService (RCS with SMS fallback)

**Why fire-and-forget?**
- Lead capture must not fail due to notification issues
- UMS has its own retry logic (3 attempts with exponential backoff)
- Lead data is already persisted by the lead processing workflow

---

## Success Criteria

1. New lead submission triggers RCS/SMS notification to sales team within 10 seconds
2. Notification contains business name, industry, owner name, and phone number
3. Lead capture API response is unaffected by notification success/failure
4. On RCS-capable devices: renders as branded card with action buttons
5. On non-RCS devices: falls back to plain SMS with same content
