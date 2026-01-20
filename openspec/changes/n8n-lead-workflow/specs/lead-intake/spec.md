## ADDED Requirements

### Requirement: n8n Webhook Integration
The system SHALL forward lead submissions to an n8n webhook for automated processing and storage.

#### Scenario: Successful webhook delivery
- **WHEN** a valid lead is submitted via `/api/leads`
- **THEN** the lead data is POSTed to the configured n8n webhook URL
- **AND** the webhook response is validated

#### Scenario: Webhook configuration
- **WHEN** the application starts
- **THEN** the N8N_WEBHOOK_URL environment variable is validated
- **AND** missing configuration results in a 503 Service Unavailable response

### Requirement: Lead Data Formatting
The system SHALL format lead data with timestamps and standardized fields before forwarding to n8n.

#### Scenario: Lead data enrichment
- **WHEN** a lead is received from the intake form
- **THEN** the data includes all required fields (businessName, industry, ownerName, phone, email, package)
- **AND** optional fields (agentName, notes) are included when provided
- **AND** status defaults to "pending"

### Requirement: Email Notification
The n8n workflow SHALL send an email notification to sales@wranngle.com when a new lead is received.

#### Scenario: Sales notification
- **WHEN** n8n receives a lead webhook
- **THEN** an HTML-formatted email is sent to sales@wranngle.com
- **AND** the email includes all lead details (business info, contact info, package selection, agent name if provided)
- **AND** the email includes clickable links for phone and email

### Requirement: Lead Storage
The n8n workflow SHALL store lead data for future reference and CRM integration.

#### Scenario: Data persistence
- **WHEN** a lead is processed by n8n
- **THEN** the lead data is stored in the configured storage backend
- **AND** the data includes a timestamp
- **AND** the data is accessible via n8n execution history
