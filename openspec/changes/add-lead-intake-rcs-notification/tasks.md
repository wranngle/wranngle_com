# Tasks: Add RCS/SMS Notification to Lead Intake Flow

**Change ID:** `add-lead-intake-rcs-notification`

---

## Task List

### 1. Identify lead processing n8n workflow
- Find the n8n workflow that receives the POST from `/api/leads` (the `N8N_WEBHOOK_URL` target)
- Document its current nodes and where to insert the notification call
- **Verification:** Workflow ID and insertion point documented

### 2. Configure sales team notification number
- Determine the E.164 phone number for sales team notifications
- Add as n8n workflow variable or credential
- **Verification:** Number set and accessible in n8n

### 3. Add HTTP Request node to call Universal Message Sender
- Add node after lead data processing in the lead workflow
- POST to `https://n8n.wranngle.com/webhook/universal-message-v1`
- Headers: `X-Webhook-Secret: wranngle-msg-2026`
- Body: `{ phone_number, template: "lead-intake", variables: { BUSINESS_NAME, INDUSTRY, OWNER_NAME, PHONE } }`
- Set `onError: continueRegularOutput` (fire-and-forget)
- **Verification:** Node added and connected, workflow validates
- **Depends on:** Task 1, Task 2

### 4. Map lead form fields to template variables
- Map `businessName` -> `BUSINESS_NAME`
- Map `industry` -> `INDUSTRY`
- Map `ownerName` -> `OWNER_NAME`
- Map `phone` -> `PHONE`
- Use n8n expression syntax to reference upstream node data
- **Verification:** All 4 variables correctly populated from lead data
- **Depends on:** Task 3

### 5. End-to-end test
- Submit a lead via the website form (or direct API call to `/api/leads`)
- Verify notification SMS/RCS arrives at sales team number
- Verify lead capture response is HTTP 201 regardless of notification outcome
- Test with deliberately wrong notification phone to confirm fire-and-forget
- **Verification:** All 4 checks pass
- **Depends on:** Task 4

### 6. Close GitHub issue #27
- Comment with implementation summary
- Close issue
- **Depends on:** Task 5
