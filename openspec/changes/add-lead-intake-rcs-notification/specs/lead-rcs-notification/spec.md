# Spec: Lead RCS/SMS Notification

**Capability:** `lead-rcs-notification`
**Change ID:** `add-lead-intake-rcs-notification`
**Related specs:** `lead-capture-api` (Webhook Integration requirement)

---

## ADDED Requirements

### Requirement: Lead Intake Notification Trigger

The system SHALL send an RCS/SMS notification to the sales team when a new lead is successfully captured by the lead processing workflow.

#### Scenario: Successful lead triggers notification
- **Given** a valid lead is received by the n8n lead processing workflow
- **When** lead data has been processed and stored
- **Then** the workflow calls the Universal Message Sender webhook with template `lead-intake`
- **And** the notification includes BUSINESS_NAME, INDUSTRY, OWNER_NAME, and PHONE from the lead data

#### Scenario: Notification failure does not block lead processing
- **Given** a valid lead is received by the n8n lead processing workflow
- **When** the Universal Message Sender webhook returns an error or is unreachable
- **Then** the lead processing workflow continues without error
- **And** the lead data is preserved regardless of notification outcome

### Requirement: Notification Variable Mapping

The system MUST map lead form fields to the `lead-intake` template variables.

#### Scenario: Field mapping from lead data to template variables
- **Given** a lead with `businessName`, `industry`, `ownerName`, and `phone` fields
- **When** the notification is composed
- **Then** `BUSINESS_NAME` = lead's `businessName`
- **And** `INDUSTRY` = lead's `industry`
- **And** `OWNER_NAME` = lead's `ownerName`
- **And** `PHONE` = lead's `phone`

### Requirement: Notification Recipient Configuration

The sales team notification phone number MUST be configurable without code changes.

#### Scenario: Sales team phone number stored in n8n
- **Given** the lead processing workflow is configured
- **When** a notification is sent
- **Then** the recipient phone number is read from an n8n workflow variable or credential
- **And** the number is in E.164 format (e.g., `+12602217355`)

### Requirement: Notification Authentication

The call to Universal Message Sender MUST use the existing webhook secret.

#### Scenario: Authenticated webhook call
- **Given** the lead processing workflow calls the Universal Message Sender
- **When** the HTTP request is made
- **Then** the header `X-Webhook-Secret` is set to the correct secret value
