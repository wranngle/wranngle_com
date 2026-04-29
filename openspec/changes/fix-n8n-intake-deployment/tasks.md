# Implementation Tasks: Fix n8n Lead Intake Flow

## Phase 1: Diagnosis & Validation
- [ ] 1.1 Check if `N8N_WEBHOOK_URL` environment variable is set in Cloudflare Pages
- [ ] 1.2 Verify n8n instance is accessible at `n8n.wranngle.com`
- [ ] 1.3 Check if workflow is imported in n8n (search for "Wranngle Lead Intake")
- [ ] 1.4 Verify workflow activation status (DEV vs PROD)
- [ ] 1.5 Test webhook endpoint directly with curl
- [ ] 1.6 Review n8n execution logs for any previous failures

## Phase 2: Email Template Creation
- [ ] 2.1 Create `email-templates/templates/lead-intake.html` with master template inheritance
- [ ] 2.2 Include all lead fields (business name, industry, contact, package, agent name, notes)
- [ ] 2.3 Add visual hierarchy matching Wranngle brand (orange accents, console aesthetic)
- [ ] 2.4 Make email actionable (clickable email/phone links)
- [ ] 2.5 Add sample data to `template-builder.ts` for preview generation
- [ ] 2.6 Build template with inline CSS: `bun run email:build lead-intake`
- [ ] 2.7 Test template in email preview dashboard
- [ ] 2.8 Validate template with `bun run email:test`

## Phase 3: n8n Workflow Fixes
- [ ] 3.1 Update `workflows/n8n/wranngle-lead-intake.json`:
  - [ ] 3.1a Replace `executeWorkflowTrigger` node with proper storage (HTTP Request or Code node)
  - [ ] 3.1b Update email node to use new template HTML
  - [ ] 3.1c Rename workflow from "[DEV]" to "[PROD]"
  - [ ] 3.1d Add error handling nodes for email and storage failures
- [ ] 3.2 Validate workflow JSON structure
- [ ] 3.3 Update `workflows/n8n/README.md` with corrected instructions

## Phase 4: n8n Configuration
- [ ] 4.1 Import updated workflow to n8n instance
- [ ] 4.2 Configure email credentials in n8n:
  - [ ] 4.2a Select or create SMTP/SendGrid credential
  - [ ] 4.2b Test email credential with n8n test function
  - [ ] 4.2c Verify `fromEmail: noreply@wranngle.com` is valid
- [ ] 4.3 Configure storage method (recommend HTTP Request to n8n API)
- [ ] 4.4 Activate workflow (set to active, not DEV mode)
- [ ] 4.5 Copy production webhook URL from n8n

## Phase 5: Cloudflare Configuration
- [ ] 5.1 Log in to Cloudflare Dashboard
- [ ] 5.2 Navigate to Pages → wranngle_com → Settings → Environment variables
- [ ] 5.3 Add/update `N8N_WEBHOOK_URL` with production webhook URL
- [ ] 5.4 Format: `https://n8n.wranngle.com/webhook/wranngle-intake-form`
- [ ] 5.5 Apply to Production environment
- [ ] 5.6 Redeploy site to pick up new environment variable

## Phase 6: End-to-End Testing
- [ ] 6.1 Test 1: Submit test lead from production form
  - [ ] 6.1a Fill out form with test data
  - [ ] 6.1b Submit and verify success response
  - [ ] 6.1c Check n8n execution log shows success
  - [ ] 6.1d Verify email received at `sales@wranngle.com`
  - [ ] 6.1e Confirm email uses new branded template
  - [ ] 6.1f Verify all lead fields are populated correctly
- [ ] 6.2 Test 2: Submit lead with optional fields (agent name, notes)
- [ ] 6.3 Test 3: Submit lead without optional fields
- [ ] 6.4 Test 4: Verify error handling
  - [ ] 6.4a Temporarily disable workflow in n8n
  - [ ] 6.4b Submit form and verify graceful error handling
  - [ ] 6.4c Re-enable workflow

## Phase 7: Documentation
- [ ] 7.1 Update `workflows/n8n/README.md` with correct configuration steps
- [ ] 7.2 Add troubleshooting section for common issues
- [ ] 7.3 Document environment variable setup in `DEPLOYMENT.md`
- [ ] 7.4 Add testing instructions for future changes
- [ ] 7.5 Update `CLAUDE.md` if email template commands changed

## Phase 8: Monitoring Setup
- [ ] 8.1 Configure n8n workflow error notifications (optional)
- [ ] 8.2 Set up monitoring for email delivery rate
- [ ] 8.3 Test notification delivery for failed workflows
- [ ] 8.4 Document monitoring dashboard location

## Success Validation
- [ ] ✅ Form submission results in email within 30 seconds
- [ ] ✅ Email uses branded template with Wranngle colors/logo
- [ ] ✅ All lead fields present and formatted correctly
- [ ] ✅ Clickable links work (email, phone)
- [ ] ✅ Lead data stored in n8n and accessible
- [ ] ✅ Error handling graceful (no user-facing errors)

## Rollback Steps (if needed)
1. Remove `N8N_WEBHOOK_URL` from Cloudflare environment variables
2. Redeploy site
3. Form submissions will return success but not trigger workflow
4. Investigate issues in n8n execution logs
