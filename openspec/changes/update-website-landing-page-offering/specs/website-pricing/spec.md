## MODIFIED Requirements

### Requirement: Landing Page Offering
The Websites category SHALL contain a "Landing Page" offering at $900 one-time with $100/mo maintenance, replacing the former "Starter Site" offering.

#### Scenario: Landing Page pricing display
- **WHEN** the Websites category is rendered
- **THEN** the "Landing Page" card displays "$900 one-time" as the primary price
- **AND** displays "+ $100/mo maintenance" as a secondary line

#### Scenario: Landing Page features
- **WHEN** the "Landing Page" offering card is rendered
- **THEN** features include: Custom responsive design, Mobile-first build, SEO fundamentals, Contact form integration, Cloudflare hosting, Monthly maintenance & security updates

## ADDED Requirements

### Requirement: Hybrid Pricing Display
The offering card SHALL render a secondary monthly price line when the offering item includes a `monthlyAddon` field with `price` and `label`.

#### Scenario: Hybrid pricing rendered
- **WHEN** an offering item has a `monthlyAddon` field
- **THEN** the card displays the primary price as one-time
- **AND** renders a secondary line showing the monthly addon price and label

#### Scenario: Items without monthlyAddon unchanged
- **WHEN** an offering item does NOT have a `monthlyAddon` field
- **THEN** the existing price display behavior is unchanged
