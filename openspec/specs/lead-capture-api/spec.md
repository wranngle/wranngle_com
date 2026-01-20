# Lead Capture API

## Purpose
Serverless API endpoint for capturing lead submissions from the Wranngle.com intake form. Validates input, sanitizes data, and forwards to n8n webhook for processing.

## Requirements

### Requirement: Lead Submission Endpoint
The system SHALL provide a POST endpoint at `/api/leads` that accepts lead data from the intake form.

#### Scenario: Valid lead submission
- **WHEN** a POST request is made to `/api/leads` with valid lead data
- **THEN** the system responds with 201 Created
- **AND** returns JSON `{"success": true}`

#### Scenario: Invalid lead data
- **WHEN** a POST request is made with missing required fields
- **THEN** the system responds with 400 Bad Request
- **AND** returns JSON with an error message describing the validation failure

#### Scenario: Request body too large
- **WHEN** a POST request exceeds 100KB
- **THEN** the system responds with 413 Request Entity Too Large
- **AND** returns JSON `{"error": "Request body too large"}`

### Requirement: Input Validation
The system SHALL validate all lead fields according to defined rules before processing.

#### Scenario: Required field validation
- **WHEN** a lead is submitted
- **THEN** all required fields are validated: businessName, industry, ownerName, phone, email, package
- **AND** missing fields result in a 400 error with field name

#### Scenario: Email format validation
- **WHEN** an email field is submitted
- **THEN** the email matches the pattern `^[^\s@]+@[^\s@]+\.[^\s@]+$`
- **AND** invalid emails result in a 400 error

#### Scenario: Phone format validation
- **WHEN** a phone field is submitted
- **THEN** the phone contains only digits, spaces, hyphens, plus signs, and parentheses
- **AND** invalid formats result in a 400 error

#### Scenario: Package value validation
- **WHEN** a package field is submitted
- **THEN** the value is either "basic" or "premium"
- **AND** other values result in a 400 error

#### Scenario: Agent name validation
- **WHEN** an optional agentName field is submitted
- **THEN** it contains only letters, numbers, spaces, hyphens, and apostrophes
- **AND** it is 50 characters or less
- **AND** invalid names result in a 400 error

### Requirement: Input Sanitization
The system SHALL sanitize all string inputs to prevent XSS and injection attacks.

#### Scenario: HTML tag removal
- **WHEN** a field contains HTML tags like `<script>` or `<div>`
- **THEN** all HTML tags are removed from the input
- **AND** the sanitized value is stored

#### Scenario: Angle bracket removal
- **WHEN** a field contains `<` or `>` characters
- **THEN** these characters are removed
- **AND** the sanitized value is stored

#### Scenario: Length limiting
- **WHEN** a field exceeds its maximum length
- **THEN** the value is truncated to the maximum length
- **AND** the limits are: businessName (200), industry (100), ownerName (100), phone (30), email (254), agentName (50), notes (1000)

### Requirement: Webhook Integration
The system SHALL forward validated leads to the configured n8n webhook.

#### Scenario: Successful webhook delivery
- **WHEN** a lead is validated successfully
- **THEN** the lead data is POSTed to N8N_WEBHOOK_URL as JSON
- **AND** the webhook response status is checked

#### Scenario: Webhook configuration missing
- **WHEN** N8N_WEBHOOK_URL environment variable is not set
- **THEN** the system responds with 503 Service Unavailable
- **AND** logs an error internally without exposing configuration details

#### Scenario: Webhook failure
- **WHEN** the webhook request fails or returns non-2xx status
- **THEN** the system responds with 500 Internal Server Error
- **AND** returns JSON `{"error": "Failed to process request"}`
- **AND** logs the webhook error internally

### Requirement: CORS Support
The system SHALL handle cross-origin requests with appropriate CORS headers.

#### Scenario: Preflight OPTIONS request
- **WHEN** an OPTIONS request is made to `/api/leads`
- **THEN** the system responds with 204 No Content
- **AND** includes CORS headers: Access-Control-Allow-Origin, Access-Control-Allow-Methods (POST, OPTIONS), Access-Control-Allow-Headers (Content-Type)

#### Scenario: CORS origin validation
- **WHEN** an ALLOWED_ORIGIN environment variable is configured
- **THEN** only requests from that origin receive permissive CORS headers
- **AND** other origins receive 'null' as Access-Control-Allow-Origin

#### Scenario: CORS headers on response
- **WHEN** a POST request is processed
- **THEN** the response includes CORS headers
- **AND** Access-Control-Max-Age is set to 86400 (24 hours)

### Requirement: Security Headers
The system SHALL include security headers in all responses.

#### Scenario: Security header inclusion
- **WHEN** any request is processed
- **THEN** the response includes security headers:
  - X-Content-Type-Options: nosniff
  - X-Frame-Options: DENY
  - X-XSS-Protection: 1; mode=block
  - Referrer-Policy: strict-origin-when-cross-origin
  - Content-Security-Policy: default-src 'none'

### Requirement: Error Handling
The system SHALL handle errors gracefully without exposing internal details.

#### Scenario: JSON parsing error
- **WHEN** the request body is not valid JSON
- **THEN** the system responds with 400 Bad Request
- **AND** returns JSON `{"error": "Invalid JSON in request body"}`

#### Scenario: Unexpected error
- **WHEN** an unexpected error occurs during processing
- **THEN** the system responds with 400 or 500 as appropriate
- **AND** returns a generic error message
- **AND** logs the full error details internally

### Requirement: Lead Data Structure
The system SHALL accept and forward lead data with the following schema.

#### Scenario: Required fields
- **WHEN** a lead is submitted
- **THEN** the following fields are required:
  - businessName (string): Name of the business
  - industry (string): Industry or trade type
  - ownerName (string): Contact person name
  - phone (string): Phone number
  - email (string): Email address
  - package (string): Selected package ("basic" or "premium")

#### Scenario: Optional fields
- **WHEN** a lead is submitted
- **THEN** the following fields are optional:
  - agentName (string): Desired name for the AI agent
  - notes (string): Additional notes or requirements
  - status (string): Lead status (defaults to "pending" if not provided)
