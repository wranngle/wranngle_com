# Proposal: Add Outbound Sales Templates + RCS Mobile Siblings

**Change ID:** `add-outbound-sales-messaging`
**Status:** ⚠️ SUPERSEDED
**Created:** 2026-01-24
**Superseded By:** `implement-rcs-messaging-n8n` (2026-01-27)

---

## ⚠️ SUPERSESSION NOTICE

This proposal has been SUPERSEDED by [`implement-rcs-messaging-n8n`](../implement-rcs-messaging-n8n/proposal.md).

**Reason for Supersession:**
1. Initial implementation had escaping bugs (`\$500` instead of `$500`)
2. SMS-only approach (no RCS support)
3. Messages not routed through n8n workflow
4. Lacked visual verification

**What Was Kept:**
- ✅ 5 sales email templates (still valid, completed)
- ✅ Message template definitions (migrated to new implementation)
- ✅ Schema updates (smsConsent fields added)

**What Changed:**
- RCS messaging via Twilio RCS Sender (not SMS-only)
- n8n Universal Message Sender workflow (not direct API calls)
- Twilio Content API for templates (not shell scripts)
- 10 templates (expanded from original 5 sales + 5 existing)
- Comprehensive Vitest testing framework (44 tests)

See [`implement-rcs-messaging-n8n/tasks.md`](../implement-rcs-messaging-n8n/tasks.md) for current status.

---

## Original Problem Statement

Wranngle currently has 5 email templates focused on customer onboarding and internal notifications. There are no:
1. Proactive sales/outreach email templates
2. SMS/RCS text message alternatives for any templates

This limits multi-channel communication capabilities and prevents proactive sales outreach.

## Proposed Solution

### 1. Add 5 Sales Email Templates
- `sales-cold-outreach.html` - Initial prospecting
- `sales-demo-followup.html` - Post-demo follow-up
- `sales-proposal-sent.html` - Proposal delivered notification
- `sales-quote-followup.html` - Quote follow-up
- `sales-winback.html` - Re-engagement for lapsed leads

### 2. Create SMS/RCS Infrastructure
- New `email-templates/sms/` directory
- `MessageBuilder` class for text message generation
- Templates for all 10 emails (5 existing + 5 new sales)

### 3. Schema Updates
- Add `smsConsent`, `smsConsentTimestamp`, `preferredChannel` fields

## Benefits

- Multi-channel engagement (email + SMS)
- Proactive sales outreach capability
- Higher touchpoint conversion rates
- Brand-consistent messaging across channels

## Risks & Mitigations

| Risk | Mitigation |
|------|------------|
| SMS spam compliance | Require explicit consent tracking |
| Character limit constraints | Compress brand voice for SMS |
| Twilio costs | Per-message billing awareness |

## Acceptance Criteria

- [ ] 5 new sales email templates pass validation
- [ ] 10 SMS templates under 160 chars each
- [ ] Schema updated with consent fields
- [ ] E2E tests pass for new templates
- [ ] SMS preview dashboard functional
