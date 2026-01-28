# Design: Fix n8n Lead Intake Flow Deployment

## Overview
This change addresses the deployment gap between the designed n8n workflow and its production operation. The workflow exists but has never been properly configured or tested end-to-end.

## Architecture

### Current State (Non-Functional)
```
User Form Submission
    ↓
Cloudflare Pages Function (/api/leads)
    ↓
[N8N_WEBHOOK_URL not set or incorrect]
    ↓
n8n Webhook (not imported/activated)
    ↓
❌ No email sent
❌ No data stored
```

### Target State (Functional)
```
User Form Submission
    ↓
Cloudflare Pages Function (/api/leads)
    ↓ [validates, sanitizes]
    ↓
n8n Webhook (active, configured)
    ↓
Format Lead Data
    ↓
    ├─→ Send Email (branded template) → sales@wranngle.com
    └─→ Store in n8n (HTTP API or execution data)
```

## Technical Decisions

### 1. Email Template System Integration

**Decision**: Create dedicated `lead-intake.html` template using existing email template system

**Rationale**:
- Existing email template system is production-ready (cross-client tested, deliverability optimized)
- Master template inheritance ensures brand consistency
- Inline CSS generation handled automatically
- Better maintainability than inline HTML in n8n workflow

**Implementation**:
- Template location: `email-templates/templates/lead-intake.html`
- Uses master template for header/footer
- Variables: `{{BUSINESS_NAME}}`, `{{INDUSTRY}}`, `{{OWNER_NAME}}`, etc.
- Build command: `bun run email:build lead-intake`
- Output: Inlined HTML ready for n8n

**Trade-offs**:
- ✅ Better separation of concerns (email design separate from workflow logic)
- ✅ Reusable template for other channels (if needed)
- ❌ Requires build step (but automated in package.json)
- ❌ n8n workflow needs template HTML copy/pasted (acceptable for stability)

### 2. Data Storage Method

**Decision**: Use n8n execution history for lead storage (no external database)

**Rationale**:
- n8n stores all execution data automatically
- Accessible via n8n API and UI
- No additional database infrastructure required
- Sufficient for initial launch (< 100 leads/month expected)

**Implementation**:
- Remove problematic `executeWorkflowTrigger` node (wrong type)
- Lead data automatically stored in execution history
- Accessible via: n8n UI → Executions → Filter by workflow
- API access: `GET https://n8n.wranngle.com/api/v1/executions`

**Future Consideration**:
- If lead volume grows (> 1000/month), migrate to PostgreSQL via Drizzle ORM
- Current execution history is sufficient for validation and debugging

**Trade-offs**:
- ✅ Zero setup required
- ✅ Built-in to n8n
- ✅ Accessible via UI and API
- ❌ Not queryable like a traditional database
- ❌ Manual export required for analysis (acceptable for now)

### 3. Email Credential Configuration

**Decision**: Reuse existing n8n email credentials (likely SendGrid or SMTP)

**Rationale**:
- n8n instance at `n8n.wranngle.com` likely already has email configured
- Avoid duplicate credential management
- Email is already working for other n8n workflows (if any)

**Implementation**:
- Email node in workflow references credential by name
- During import, user selects existing credential from dropdown
- If no credential exists, user creates one following n8n's credential flow

**Verification**:
- Use n8n's "Test Credential" feature before activating workflow
- Send test email to verify `noreply@wranngle.com` is authorized sender

### 4. Environment Variable Management

**Decision**: Set `N8N_WEBHOOK_URL` in Cloudflare Dashboard (not in code)

**Rationale**:
- Secrets should never be committed to code
- Cloudflare Pages supports environment variables per environment (preview vs production)
- Different webhooks for DEV and PROD workflows

**Implementation**:
```
Production: https://n8n.wranngle.com/webhook/wranngle-intake-form
Preview: (optional) https://n8n.wranngle.com/webhook/wranngle-intake-form-dev
```

**Format Validation**:
- Must be HTTPS
- Must be accessible from Cloudflare Workers runtime
- Should respond with 200 OK to POST requests

### 5. Error Handling Strategy

**Decision**: Fail gracefully but log all errors

**Current State** (in `functions/api/leads.ts`):
- ✅ Returns 503 if `N8N_WEBHOOK_URL` not configured
- ✅ Returns 500 if webhook fails
- ✅ Logs errors to console (Cloudflare captures these)

**Enhancements Needed**:
- Add retry logic for transient failures (optional, future enhancement)
- Consider dead letter queue for failed leads (future enhancement)

**Philosophy**:
- User should always get a response (good UX)
- Failed leads should be recoverable from logs
- Monitoring should alert on high failure rates

## Deployment Sequence

### Phase 1: Email Template (Offline)
1. Create template in `email-templates/`
2. Build with inline CSS
3. Preview in browser
4. Validate deliverability

### Phase 2: n8n Workflow (n8n Instance)
1. Update workflow JSON file
2. Import to n8n instance
3. Configure email credentials
4. Activate workflow
5. Get production webhook URL

### Phase 3: Cloudflare Configuration (Cloudflare Dashboard)
1. Set `N8N_WEBHOOK_URL` environment variable
2. Redeploy site (to pick up new env var)
3. Verify deployment successful

### Phase 4: Testing (Production)
1. Submit test lead from production form
2. Verify email delivery
3. Check n8n execution logs
4. Validate error scenarios

## Monitoring & Observability

### Metrics to Track
- **Lead submission rate**: Forms submitted per day
- **Webhook success rate**: Successful forwards to n8n
- **Email delivery rate**: Emails successfully sent
- **Execution failure rate**: n8n workflow failures

### Access Points
- **Cloudflare Logs**: `wrangler tail` or Cloudflare Dashboard → Functions logs
- **n8n Execution Logs**: n8n UI → Executions → Filter by workflow
- **Email Deliverability**: SendGrid dashboard (if using SendGrid)

### Alerting (Future Enhancement)
- Configure n8n error workflow to send alerts on failure
- Set up Cloudflare Pages webhook to Slack for function errors

## Security Considerations

### Current Security (Already Implemented)
- ✅ Input validation and sanitization in `functions/api/leads.ts`
- ✅ CORS headers with configurable allowed origin
- ✅ Security headers (X-Content-Type-Options, X-Frame-Options, etc.)
- ✅ Request size limits (100KB max)
- ✅ HTML tag stripping to prevent XSS

### Additional Considerations
- n8n webhook is publicly accessible (by design)
- Webhook URL is secret (not exposed in frontend)
- Rate limiting handled by Cloudflare (built-in DDoS protection)

## Testing Strategy

### Unit Testing
- Email template validates with `bun run email:test`
- Template renders with sample data correctly

### Integration Testing
1. **Happy Path**: Submit valid lead → Email received → Data stored
2. **Optional Fields**: Submit with/without agent name and notes
3. **Error Scenarios**:
   - Workflow deactivated (webhook returns error)
   - Email credential invalid (email node fails)
   - Malformed data (validation catches)

### Smoke Test Checklist
- [ ] Form submission returns 201 Created
- [ ] Email delivered within 30 seconds
- [ ] Email matches brand design
- [ ] All form fields present in email
- [ ] Clickable links work (email, phone)
- [ ] n8n execution log shows success
- [ ] Lead data accessible in n8n UI

## Rollback Plan

### If Deployment Fails
1. Remove `N8N_WEBHOOK_URL` environment variable in Cloudflare
2. Redeploy site
3. Effect: Form submissions succeed but don't trigger workflow (acceptable degradation)

### If Email Fails
1. Check email credentials in n8n
2. Test credential with n8n's test feature
3. Verify `noreply@wranngle.com` is authorized sender
4. Check SendGrid/SMTP logs for bounces

### If Workflow Fails
1. Check n8n execution logs for error details
2. Verify workflow is activated (not in DEV mode)
3. Test workflow manually with n8n's "Execute Workflow" feature

## Future Enhancements

### Short-term (Next 3 months)
- [ ] Add SMS notification via Twilio (already have credentials)
- [ ] Create customer welcome email (separate workflow)
- [ ] Add Slack notification for high-value leads (premium package)

### Long-term (Next 6 months)
- [ ] Migrate to PostgreSQL for lead storage (if volume increases)
- [ ] Build internal dashboard for lead management
- [ ] Add CRM integration (HubSpot, Salesforce)
- [ ] Implement automated follow-up email sequence

## References

### Related Files
- `functions/api/leads.ts` - API endpoint
- `workflows/n8n/wranngle-lead-intake.json` - n8n workflow
- `email-templates/` - Email template system
- `openspec/changes/n8n-lead-workflow/` - Original design proposal

### External Documentation
- [n8n Webhook Documentation](https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.webhook/)
- [Cloudflare Pages Functions Environment Variables](https://developers.cloudflare.com/pages/platform/functions/bindings/#environment-variables)
- [Email Template Best Practices](./email-templates/DELIVERABILITY.md)
