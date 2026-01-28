# n8n Workflow Integration

## ADDED Requirements

### Requirement: Webhook Endpoint
The system SHALL provide an n8n webhook endpoint to receive lead submissions.

#### Scenario: Webhook URL format
- **WHEN** the n8n workflow is deployed
- **THEN** the webhook is accessible at `https://n8n.wranngle.com/webhook/wranngle-intake-form`
- **AND** accepts POST requests with JSON payload
- **AND** returns 200 OK on successful processing

#### Scenario: Webhook payload structure
- **WHEN** the webhook receives a POST request
- **THEN** it expects a JSON body with lead data matching the lead-capture-api schema
- **AND** includes fields: businessName, industry, ownerName, phone, email, package, agentName (optional), notes (optional), status

#### Scenario: Webhook response
- **WHEN** the webhook processes a request successfully
- **THEN** it returns JSON `{"success": true, "message": "Lead received"}`
- **AND** responds immediately (does not wait for email or storage completion)

### Requirement: Lead Data Formatting
The system SHALL format lead data with timestamps and extracted fields.

#### Scenario: Timestamp addition
- **WHEN** a lead is received via webhook
- **THEN** a timestamp in ISO 8601 format is added
- **AND** the timestamp reflects the exact time of submission

#### Scenario: Field extraction
- **WHEN** lead data is formatted
- **THEN** all fields from the webhook payload are extracted
- **AND** default values are applied:
  - status defaults to "pending" if not provided
  - agentName defaults to empty string if not provided
  - notes defaults to empty string if not provided

### Requirement: Email Notification Delivery
The system SHALL send email notifications for every lead submission.

#### Scenario: Email trigger
- **WHEN** a lead is formatted successfully
- **THEN** an email notification is triggered
- **AND** uses the lead-intake email template
- **AND** populates template variables with lead data

#### Scenario: Email credential configuration
- **WHEN** the n8n workflow is configured
- **THEN** email credentials are selected from existing n8n credentials
- **AND** credentials are tested before workflow activation
- **AND** sender address `noreply@wranngle.com` is authorized

#### Scenario: Email failure handling
- **WHEN** email delivery fails
- **THEN** the failure is logged in n8n execution history
- **AND** the workflow continues (does not block data storage)
- **AND** an error notification is sent to workflow administrators (future enhancement)

### Requirement: Lead Data Storage
The system SHALL store lead data for future access and analysis.

#### Scenario: Execution history storage
- **WHEN** a lead is processed
- **THEN** all lead data is stored in n8n's execution history
- **AND** the data is accessible via n8n UI under Executions
- **AND** the execution is tagged with the workflow name

#### Scenario: Data retention
- **WHEN** leads are stored in execution history
- **THEN** data is retained according to n8n's retention policy
- **AND** executions are searchable by date, status, and workflow

#### Scenario: Data access
- **WHEN** stored lead data needs to be accessed
- **THEN** it is available via:
  - n8n UI: Executions → Filter by workflow
  - n8n API: `GET /api/v1/executions`
- **AND** includes full lead details and processing timestamps

### Requirement: Workflow Activation
The system SHALL maintain an active, production-ready n8n workflow.

#### Scenario: Workflow state
- **WHEN** the workflow is deployed
- **THEN** it is set to "Active" status (not DEV mode)
- **AND** the workflow name is "[PROD] Wranngle Lead Intake Workflow"
- **AND** it is tagged with "prod" and "leads" tags

#### Scenario: Workflow monitoring
- **WHEN** the workflow is active
- **THEN** execution history shows all runs
- **AND** success/failure rates are visible in n8n dashboard
- **AND** failed executions are easily identifiable

#### Scenario: Workflow configuration
- **WHEN** the workflow is imported
- **THEN** all nodes are properly connected
- **AND** email credentials are configured
- **AND** the webhook path matches the environment variable
- **AND** the workflow is tested with sample data before activation

### Requirement: Error Handling
The system SHALL handle errors gracefully and provide debugging information.

#### Scenario: Webhook processing error
- **WHEN** an error occurs during lead processing
- **THEN** the error is logged in n8n execution history
- **AND** error details include:
  - Error message
  - Node where error occurred
  - Input data that caused the error
  - Timestamp

#### Scenario: Email delivery error
- **WHEN** email sending fails
- **THEN** the error is logged with details
- **AND** the lead data is still stored in execution history
- **AND** the workflow does not crash (continues to storage step)

#### Scenario: Invalid payload
- **WHEN** the webhook receives invalid or malformed data
- **THEN** the error is logged with payload details
- **AND** returns appropriate error response to caller
- **AND** does not send email or store data

### Requirement: Environment Configuration
The system SHALL require proper environment configuration before operation.

#### Scenario: Cloudflare environment variable
- **WHEN** the lead capture API is deployed
- **THEN** `N8N_WEBHOOK_URL` environment variable is set in Cloudflare Pages
- **AND** the value matches the n8n webhook URL exactly
- **AND** the variable is set for the Production environment

#### Scenario: Configuration validation
- **WHEN** the workflow is activated
- **THEN** all required configurations are verified:
  - Webhook URL is accessible
  - Email credentials are valid
  - Workflow nodes are properly connected
- **AND** a test execution is run before marking workflow as production-ready

## MODIFIED Requirements

None - this is a new capability.

## REMOVED Requirements

None - this is a new capability.
