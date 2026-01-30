## MODIFIED Requirements

### Requirement: Pricing Display
The landing page SHALL display a condensed preview of featured offerings (1-2 items) rather than the full pricing table. The preview SHALL link to the `/offerings` page for the complete catalog.

#### Scenario: Homepage shows featured offerings
- **WHEN** a user views the landing page pricing section
- **THEN** they see a compact preview of up to two featured offerings with price and key features

#### Scenario: View all link
- **WHEN** a user clicks the "View All Offerings" link in the pricing section
- **THEN** they are navigated to `/offerings`
