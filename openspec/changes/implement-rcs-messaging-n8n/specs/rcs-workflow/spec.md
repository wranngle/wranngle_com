# Spec: RCS Workflow Capability

**Capability:** `rcs-workflow`
**Parent Change:** `implement-rcs-messaging-n8n`

---

## ADDED Requirements

### REQ-RCS-001: Universal Message Sender Workflow

The system SHALL provide an n8n workflow that sends messages via SMS or RCS channels.

#### Scenario: Send RCS message with template
**Given** a valid phone number and template name
**When** the webhook receives a POST with `channel: "rcs"`
**Then** the message is sent via Twilio RCS Sender
**And** the response includes `channel: "rcs"` confirmation

#### Scenario: Send SMS message with template
**Given** a valid phone number and template name
**When** the webhook receives a POST with `channel: "sms"`
**Then** the message is sent via Twilio SMS
**And** no RCS features are included

#### Scenario: Automatic channel selection
**Given** a valid phone number and template name
**When** the webhook receives a POST with `channel: "auto"`
**Then** the system uses Twilio Messaging Service for automatic channel selection
**And** RCS is attempted first with SMS fallback

---

### REQ-RCS-002: Template Registry

The system SHALL support 10 predefined message templates.

#### Scenario: All templates available
**Given** the template registry is loaded
**When** listing available templates
**Then** exactly 10 templates are returned:
  - welcome
  - invoice-receipt
  - notification
  - password-reset
  - lead-intake
  - sales-cold-outreach
  - sales-demo-followup
  - sales-proposal-sent
  - sales-quote-followup
  - sales-winback

#### Scenario: Template variable substitution
**Given** template "welcome" with variables `FIRST_NAME` and `PACKAGE`
**When** sending with variables `{"FIRST_NAME": "Cody", "PACKAGE": "Elite Agent"}`
**Then** the message body contains "Cody" and "Elite Agent" in appropriate positions

#### Scenario: Unknown template rejection
**Given** template name "nonexistent"
**When** sending a message
**Then** response is HTTP 400
**And** error message includes list of available templates

---

### REQ-RCS-003: RCS Suggested Actions

The system SHALL support RCS suggested actions (buttons) when channel is RCS.

#### Scenario: URL action button
**Given** template with `suggestedActions: [{type: "url", title: "View", value: "https://..."}]`
**When** sending via RCS channel
**Then** the message includes a clickable "View" button
**And** clicking opens the specified URL

#### Scenario: Phone action button
**Given** template with `suggestedActions: [{type: "phone", title: "Call", value: "+1..."}]`
**When** sending via RCS channel
**Then** the message includes a "Call" button
**And** clicking initiates a phone call

#### Scenario: Reply action button
**Given** template with `suggestedActions: [{type: "reply", title: "STOP", value: "STOP"}]`
**When** sending via RCS channel
**Then** the message includes a "STOP" button
**And** clicking sends "STOP" as a reply

---

### REQ-RCS-004: SMS Fallback

The system SHALL automatically fallback to SMS when RCS is unavailable.

#### Scenario: Device without RCS support
**Given** recipient device does not support RCS
**When** sending with `channel: "auto"`
**Then** message is delivered via SMS
**And** suggested actions are not included
**And** response indicates `channel: "sms"`

#### Scenario: Carrier without RCS support
**Given** recipient carrier does not support RCS
**When** sending with `channel: "auto"`
**Then** message is delivered via SMS
**And** response indicates `channel: "sms"`

---

### REQ-RCS-005: No Escaping Bugs

The system SHALL correctly render special characters in messages.

#### Scenario: Dollar sign in amount
**Given** template "invoice-receipt" with variable `AMOUNT: "542.50"`
**When** message is delivered
**Then** recipient sees "$542.50" (not "\$542.50" or "$42.50")

#### Scenario: Exclamation marks
**Given** template with "Your agent is LIVE!"
**When** message is delivered
**Then** recipient sees "LIVE!" (not "LIVE\!" or "LIVE")

#### Scenario: URLs with query parameters
**Given** variable `SHORT_URL: "https://wranngl.co/abc?ref=sms"`
**When** message is delivered
**Then** URL is clickable and complete

---

### REQ-RCS-006: Visual Verification Capability

The system SHALL support visual verification of sent messages.

#### Scenario: Twilio Console verification
**Given** messages have been sent via the workflow
**When** operator opens Twilio Console > Messaging > Logs
**Then** all sent messages are visible with:
  - Correct recipient phone number
  - Delivery status (delivered/sent/failed)
  - Channel indicator (RCS/SMS)
  - Message body preview

#### Scenario: Message detail view
**Given** a message SID from the workflow response
**When** looking up the message in Twilio Console
**Then** full details are available:
  - Delivery timestamps
  - Carrier information
  - Any error codes

---

## MODIFIED Requirements

### REQ-SMS-001: Existing SMS Tool Compatibility (MODIFIED)

The existing "Sarah SMS Tool - BULLETPROOF v3.0" workflow SHALL continue to operate unchanged.

**Modification:** New "Universal Message Sender" workflow is additive, not a replacement.

#### Scenario: Backward compatibility
**Given** existing callers using `/webhook/sarah-send-sms-v3`
**When** sending SMS via old endpoint
**Then** behavior is identical to before this change
**And** no migration required for existing integrations

---

## Test Matrix

| Template | SMS | RCS | Auto | Variables |
|----------|-----|-----|------|-----------|
| welcome | MUST | MUST | MUST | FIRST_NAME, PACKAGE |
| invoice-receipt | MUST | MUST | MUST | AMOUNT, INVOICE_ID |
| notification | MUST | MUST | MUST | EVENT_TYPE, EVENT_DATA |
| password-reset | MUST | MUST | MUST | RESET_URL, EXPIRY_TIME |
| lead-intake | MUST | MUST | MUST | BUSINESS_NAME, INDUSTRY, OWNER_NAME |
| sales-cold-outreach | MUST | MUST | MUST | FIRST_NAME, COMPANY, REP_NAME |
| sales-demo-followup | MUST | MUST | MUST | FIRST_NAME, REP_EMAIL |
| sales-proposal-sent | MUST | MUST | MUST | FIRST_NAME, PACKAGE, PRICE |
| sales-quote-followup | MUST | MUST | MUST | FIRST_NAME, QUOTE_ID, REP_NAME |
| sales-winback | MUST | MUST | MUST | FIRST_NAME, NEW_FEATURE_1, NEW_FEATURE_2 |

---

## Acceptance Criteria Summary

1. All 10 templates send successfully via SMS channel
2. All 10 templates send successfully via RCS channel (after Twilio approval)
3. Auto channel correctly selects RCS when available, SMS when not
4. Suggested actions appear on RCS messages
5. No escaping bugs in any template ($, !, URLs render correctly)
6. Messages visible in Twilio Console for verification
7. Existing SMS workflow continues to work unchanged
