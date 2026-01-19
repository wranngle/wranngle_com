# n8n Workflow: Wranngle Lead Intake

This workflow handles lead submissions from the Wranngle.com contact form.

## Import Instructions

1. Open your n8n instance at `https://n8n.wranngle.com`
2. Click **Workflows** → **Import from File**
3. Select `wranngle-lead-intake.json`
4. The workflow will be created in DEV phase (inactive by default)

## Configuration Required

### 1. n8n Database Storage (Replace placeholder node)

The workflow currently has a placeholder for database storage. You need to:

**Option A: Use HTTP Request to n8n API**
1. Delete the "Store in n8n Database" node
2. Add **HTTP Request** node
3. Configure:
   - **Method:** POST
   - **URL:** `https://n8n.wranngle.com/api/v1/executions`
   - **Authentication:** Use your n8n API key
   - **Body:** JSON with lead data
4. This stores execution data accessible via n8n API

**Option B: Use Code Node with Database**
1. Delete the "Store in n8n Database" node
2. Add **Code** node
3. Use JavaScript to store data in n8n's execution data
4. Access via Executions menu

**Option C: Use External Database** (if you add one later)
1. Replace with PostgreSQL, MySQL, or MongoDB node
2. Use existing database credentials

**Recommended:** Start with Option A (HTTP Request) - it's simplest and uses n8n's built-in storage.

### 2. Email Notification (Use existing credentials)

The email node is pre-configured to send to `sales@wranngle.com`.

**Setup:**
1. Click the **Send Email Notification** node
2. Under **Credential to connect with:**
   - **If you already have email configured:** Select existing credential from dropdown
   - **If new setup needed:** Create credential for your email service (SMTP/SendGrid/etc)
3. Verify `fromEmail` is correct: `noreply@wranngle.com`
4. Email recipient already set to: `sales@wranngle.com`

**Email includes:**
- Styled HTML template with Wranngle branding
- All lead fields (business, contact, package, agent name)
- Clickable email and phone links
- Timestamp

## Workflow Flow

```
Webhook Trigger
    ↓
Format Lead Data (timestamps, extracts fields)
    ↓
    ├─→ Store in n8n Database (configure storage method)
    └─→ Send Email to sales@wranngle.com
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
  "agentName": "string | null",
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
    "businessName": "Test HVAC",
    "industry": "HVAC",
    "ownerName": "John Doe",
    "phone": "+1-555-0100",
    "email": "test@example.com",
    "package": "premium",
    "agentName": "Sarah",
    "status": "pending",
    "notes": "Testing the workflow"
  }'
```

3. Check:
   - Email received at sales@wranngle.com
   - n8n execution log shows success
   - Data stored (depending on storage method chosen)

## Production Deployment

Once tested in DEV:

1. Rename workflow to `[PROD] Wranngle Lead Intake Workflow`
2. Test with production form on wranngle.com
3. Monitor executions in n8n dashboard
4. Set up error notifications (optional)

## Troubleshooting

- **401 Unauthorized**: Check email credentials are valid
- **Webhook not triggered**: Verify `N8N_WEBHOOK_URL` in Cloudflare matches webhook path
- **Data missing**: Check field mappings in Format Lead Data node
- **Email not sent**: Verify email credential and recipient address
- **Database node error**: Replace with appropriate storage method (see Configuration above)

## Notes

- No Google Sheets integration (per requirements)
- Uses existing email infrastructure already configured in n8n
- All lead data available in n8n execution history
- Can add SMS notifications later by adding Twilio node (reuse existing credentials)
