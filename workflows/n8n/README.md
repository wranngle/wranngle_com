# n8n Workflow: Wranngle Lead Intake

This workflow handles lead submissions from the Wranngle.com contact form.

## Import Instructions

1. Open your n8n instance at `https://n8n.wranngle.com`
2. Click **Workflows** → **Import from File**
3. Select `wranngle-lead-intake.json`
4. The workflow will be created in DEV phase (inactive by default)

## Required Configuration

### 1. Google Sheets Credential

1. Click the **Store in Google Sheets** node
2. Under **Credential to connect with**, click **Create New Credential**
3. Follow Google OAuth flow to authorize n8n
4. Select or create a Google Sheet for storing leads
5. Configure column mappings (already pre-configured)

### 2. Email Credential

1. Click the **Send Email Notification** node
2. Under **Credential to connect with**, choose one of:
   - **SMTP**: For custom email server
   - **Gmail**: For Gmail account
   - **SendGrid**: For SendGrid API (recommended for production)
3. Update recipient email from `leads@wranngle.com` to your actual email

### 3. Webhook URL

After saving the workflow:

1. Activate the workflow (toggle switch in top-right)
2. Click the **Webhook Trigger** node
3. Copy the **Production URL** (should be: `https://n8n.wranngle.com/webhook/wranngle-intake-form`)
4. Add this URL to your Cloudflare Pages environment variables as `N8N_WEBHOOK_URL`

## Workflow Flow

```
Webhook Trigger
    ↓
Format Lead Data (timestamps, extracts fields)
    ↓
    ├─→ Store in Google Sheets
    └─→ Send Email Notification
```

## Data Schema

The workflow expects this JSON payload from `/api/leads`:

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

## Testing

1. Activate the workflow in n8n
2. Send a test POST request:

```bash
curl -X POST https://n8n.wranngle.com/webhook/wranngle-intake-form \
  -H "Content-Type: application/json" \
  -d '{
    "businessName": "Test Business",
    "industry": "HVAC",
    "ownerName": "John Doe",
    "phone": "+1-555-0100",
    "email": "test@example.com",
    "package": "basic",
    "status": "pending",
    "notes": "This is a test"
  }'
```

3. Check:
   - Google Sheets has new row
   - Email notification received
   - n8n execution log shows success

## Production Deployment

Once tested in DEV:

1. Rename workflow to `[ALPHA] Wranngle Lead Intake Workflow`
2. Test with production form on wranngle.com
3. Promote to `[PROD]` after validation
4. Monitor executions in n8n dashboard

## Troubleshooting

- **401 Unauthorized**: Check Google Sheets / Email credentials are valid
- **Webhook not triggered**: Verify `N8N_WEBHOOK_URL` in Cloudflare matches webhook path
- **Data missing**: Check field mappings in Format Lead Data node
- **Email not sent**: Verify SMTP settings or SendGrid API key
