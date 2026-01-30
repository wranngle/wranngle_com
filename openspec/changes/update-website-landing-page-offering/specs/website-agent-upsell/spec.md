## ADDED Requirements

### Requirement: Web Chat Agent Upsell on Website Intake
The intake form for website packages SHALL display a web chat agent upsell option.

#### Scenario: Upsell displayed on website intake
- **WHEN** a user opens the intake form for any website package (landing-page or business-site)
- **THEN** a web chat agent add-on checkbox is displayed with description and pricing ($250/mo)

#### Scenario: Upsell checkbox submits with form
- **WHEN** a user checks the web chat agent add-on and submits the form
- **THEN** the form data includes addWebChatAgent set to true

#### Scenario: Upsell not shown on agent packages
- **WHEN** a user opens the intake form for an AI agent package (basic or premium)
- **THEN** no web chat agent upsell is displayed
