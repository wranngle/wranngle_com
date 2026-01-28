# Email Notifications

## ADDED Requirements

### Requirement: Lead Intake Email Template
The system SHALL provide a branded email template for lead intake notifications.

#### Scenario: Template structure
- **WHEN** a lead intake email is generated
- **THEN** the template uses the master template inheritance system
- **AND** includes Wranngle branding (logo, colors, fonts)
- **AND** follows email deliverability best practices

#### Scenario: Template variables
- **WHEN** the template is populated with lead data
- **THEN** the following variables are replaced:
  - `{{BUSINESS_NAME}}` - Customer's business name
  - `{{INDUSTRY}}` - Industry or trade type
  - `{{OWNER_NAME}}` - Contact person name
  - `{{EMAIL}}` - Contact email address
  - `{{PHONE}}` - Contact phone number
  - `{{PACKAGE}}` - Selected package (basic/premium)
  - `{{AGENT_NAME}}` - Optional AI agent name
  - `{{NOTES}}` - Optional additional notes
  - `{{TIMESTAMP}}` - Submission timestamp

#### Scenario: Template rendering
- **WHEN** the template is built for production
- **THEN** CSS is inlined for maximum email client compatibility
- **AND** the output is minified to reduce size
- **AND** the template validates against email testing tools

### Requirement: Email Delivery
The system SHALL deliver lead notification emails to the sales team.

#### Scenario: Email recipient
- **WHEN** a new lead is captured
- **THEN** an email notification is sent to `sales@wranngle.com`
- **AND** the sender is `noreply@wranngle.com`

#### Scenario: Email subject
- **WHEN** a notification email is sent
- **THEN** the subject line is `🔔 New Lead: [Business Name]`
- **AND** includes the business name from the lead data

#### Scenario: Email content structure
- **WHEN** a notification email is generated
- **THEN** it includes the following sections:
  - Header with Wranngle branding
  - Business information section
  - Contact details with clickable links
  - Package and agent details
  - Additional notes (if provided)
  - Timestamp and footer

#### Scenario: Clickable contact links
- **WHEN** the email includes contact information
- **THEN** the email address is a `mailto:` link
- **AND** the phone number is a `tel:` link
- **AND** links are mobile-friendly and functional

### Requirement: Email Deliverability
The system SHALL optimize emails for maximum inbox placement.

#### Scenario: Email size
- **WHEN** an email is generated
- **THEN** the total size is under 100KB
- **AND** Gmail does not clip the message

#### Scenario: Mobile responsiveness
- **WHEN** the email is viewed on mobile devices
- **THEN** the layout adapts to small screens
- **AND** buttons are touch-friendly (minimum 44px)
- **AND** fonts are readable (minimum 16px)

#### Scenario: Cross-client compatibility
- **WHEN** the email is viewed in different email clients
- **THEN** the layout renders correctly in:
  - Gmail (desktop and mobile)
  - Outlook (2016, 2019, 365)
  - Apple Mail (macOS and iOS)
  - Yahoo Mail
- **AND** the design uses table-based layout for compatibility
