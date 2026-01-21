# n8n Workflow: Wranngle Lead Intake

This workflow handles lead submissions from the Wranngle.com intake form and sends branded email notifications to the sales team.

## Quick Start

### Step 1: Import Workflow to n8n

1. Open your n8n instance at `https://n8n.wranngle.com`
2. Click **Workflows** → **Import from File**
3. Select `wranngle-lead-intake.json`
4. The workflow will be imported (inactive by default)

### Step 2: Configure Email Credentials

1. Click the **Send Email Notification** node
2. Under **Credential to connect with**, either:
   - Select an existing email credential from the dropdown, OR
   - Click **Create New** and set up SMTP/SendGrid credentials
3. Click **Test Credential** to verify it works
4. Save the node

**Important:** The `fromEmail` must be `noreply@wranngle.com` (or another verified sender domain).

### Step 3: Activate the Workflow

1. Toggle the workflow to **Active** (top-right switch)
2. Note the webhook URL displayed: `https://n8n.wranngle.com/webhook/wranngle-intake-form`

### Step 4: Configure Cloudflare Environment Variable

1. Log in to [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Navigate to: **Pages** → **wranngle-com** → **Settings** → **Environment variables**
3. Add new variable:
   - **Name:** `N8N_WEBHOOK_URL`
   - **Value:** `https://n8n.wranngle.com/webhook/wranngle-intake-form`
   - **Environment:** Production (and optionally Preview)
4. Click **Save**
5. Trigger a new deployment (or push a commit) to apply the change

### Step 5: Test End-to-End

1. Go to your production site (wranngle.com)
2. Submit the intake form with test data
3. Verify:
   - Form shows success message
   - Email received at `sales@wranngle.com` within 30 seconds
   - n8n execution log shows successful run

---

## Workflow Architecture

```
Website Intake Form
    ↓ POST /api/leads
Cloudflare Pages Function (validates, sanitizes)
    ↓ forwards to N8N_WEBHOOK_URL
n8n Webhook Trigger
    ↓
Format Lead Data (adds timestamp, defaults)
    ↓
Send Email Notification → sales@wranngle.com
```

**Data Storage:** Lead data is automatically stored in n8n's execution history. Access via: **n8n UI** → **Executions** → filter by workflow.

---

## Data Schema

The workflow receives this JSON payload from the Cloudflare function:

```json
{
  "businessName": "Acme Plumbing Co",
  "industry": "Plumbing & HVAC",
  "ownerName": "John Smith",
  "phone": "(555) 123-4567",
  "email": "john@acmeplumbing.com",
  "package": "premium",
  "agentName": "Samantha",
  "status": "pending",
  "notes": "Interested in after-hours call handling."
}
```

**Required fields:** businessName, industry, ownerName, phone, email, package
**Optional fields:** agentName, status, notes

---

## Testing

### Direct Webhook Test

Test the n8n workflow directly (bypassing Cloudflare):

```bash
curl -X POST https://n8n.wranngle.com/webhook/wranngle-intake-form \
  -H "Content-Type: application/json" \
  -d '{
    "businessName": "Test Plumbing LLC",
    "industry": "Plumbing",
    "ownerName": "Jane Doe",
    "phone": "+1-555-0100",
    "email": "test@example.com",
    "package": "basic",
    "agentName": "Alex",
    "status": "pending",
    "notes": "Testing the workflow"
  }'
```

**Expected response:** `{ "success": true, "message": "Lead received" }`

### Full Integration Test

1. Submit the intake form on `https://wranngle.com`
2. Check n8n Executions tab for the workflow run
3. Verify email delivery at `sales@wranngle.com`

---

## Troubleshooting

### Form submission returns error

| Error | Cause | Fix |
|-------|-------|-----|
| 503 Service Unavailable | `N8N_WEBHOOK_URL` not set | Add env var in Cloudflare Pages settings |
| 500 Internal Server Error | Webhook URL incorrect or n8n down | Verify URL, check n8n is running |
| 400 Bad Request | Invalid form data | Check form validation in browser console |

### Email not received

1. **Check n8n Executions:** Is there a failed execution?
2. **Check email credentials:** Test credential in n8n node settings
3. **Check spam folder:** First emails may land in spam
4. **Verify sender domain:** `noreply@wranngle.com` must be verified

### Webhook not triggered

1. **Check workflow is Active** (toggle in n8n UI)
2. **Verify webhook path matches:** `/webhook/wranngle-intake-form`
3. **Check Cloudflare logs:** `wrangler pages functions tail`

### n8n execution fails

1. Open failed execution in n8n
2. Check error message on failed node
3. Common fixes:
   - Email credential expired → re-authenticate
   - Expression error → check data mapping
   - Rate limited → wait and retry

---

## Email Template

The workflow sends a branded HTML email with:

- Wranngle logo and brand colors (orange #ff5f00)
- Business information section
- Contact details with clickable mailto: and tel: links
- Package selection badge
- Agent name (if provided)
- Additional notes
- Timestamp and status
- Action buttons: "Reply to Lead" and "Call Lead"

The template is mobile-responsive and tested across major email clients.

---

## Maintenance

### Updating the email template

1. Edit `email-templates/templates/lead-intake.html`
2. Run `bun run email:build lead-intake` to generate preview
3. Copy the minified HTML into the n8n workflow JSON
4. Re-import the workflow to n8n

### Monitoring

- **n8n Dashboard:** View execution success/failure rates
- **Cloudflare Analytics:** Monitor `/api/leads` endpoint traffic
- **Email deliverability:** Check SendGrid/SMTP dashboard for bounces

### Adding SMS notifications (future)

To add Twilio SMS alongside email:
1. Add Twilio node after "Format Lead Data"
2. Connect to existing Twilio credentials
3. Configure recipient and message template

---

## Files

| File | Purpose |
|------|---------|
| `wranngle-lead-intake.json` | n8n workflow definition (import this) |
| `../../email-templates/templates/lead-intake.html` | Source email template |
| `../../functions/api/leads.ts` | Cloudflare function that forwards to n8n |
