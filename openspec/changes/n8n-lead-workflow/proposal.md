# Proposal: n8n Lead Intake Workflow

## Status
🟡 **Draft** - Awaiting formal specification

## Why
The Cloudflare Pages function at `/api/leads` forwards form submissions to an n8n webhook. We need to define what happens after that - storage, notifications, and any follow-up automation.

## What Changes
- **n8n Workflow**: Create webhook workflow at `https://n8n.wranngle.com/webhook/wranngle-intake-form`
- **Data Storage**: TBD (Google Sheets, Airtable, Notion, or database)
- **Notifications**: TBD (Email, SMS, Slack)
- **Follow-up Automation**: TBD (drip emails, CRM integration)

## Open Questions
1. Where should leads be stored? (Google Sheets is simplest, Airtable has better structure)
2. Who should receive notifications? (email addresses, phone numbers)
3. What notification channels? (Email only? SMS? Slack?)
4. Any automated follow-up needed? (welcome email, drip campaign)

## Payload Structure
```json
{
  "businessName": "string",
  "industry": "string",
  "ownerName": "string",
  "phone": "string",
  "email": "string",
  "package": "basic | premium",
  "status": "pending",
  "notes": "string | null"
}
```

## Related
- GitHub Issue: #2
- Cloudflare function: `functions/api/leads.ts`
- Environment variable: `N8N_WEBHOOK_URL`
