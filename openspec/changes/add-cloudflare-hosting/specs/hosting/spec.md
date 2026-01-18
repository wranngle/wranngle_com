## ADDED Requirements
### Requirement: Cloudflare Pages Hosting
The system SHALL be hosted on Cloudflare Pages to ensure high availability and global delivery at zero cost.

#### Scenario: Production Deployment
- **WHEN** code is pushed to the main branch
- **THEN** Cloudflare Pages automatically builds and deploys the site

### Requirement: Serverless Lead Capture
The lead capture API SHALL be implemented as a Cloudflare Function to handle submissions without a persistent server.

#### Scenario: Lead Submission
- **WHEN** a user submits the intake form
- **THEN** the Cloudflare Function validates the data and forwards it to n8n
- **AND** returns a 201 Success status to the client
