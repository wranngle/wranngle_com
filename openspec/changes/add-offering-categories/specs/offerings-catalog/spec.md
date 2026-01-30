## ADDED Requirements

### Requirement: Offering Categories
The system SHALL organize offerings into named categories. Each category SHALL have an `id`, `name`, `description`, and an ordered list of offering items.

#### Scenario: Two initial categories exist
- **WHEN** the offerings data is loaded
- **THEN** at least two categories are present: "AI Agents" and "Websites"

### Requirement: Offering Items
Each offering item SHALL have an `id`, `name`, `description`, `price` (display string), and a list of `features`. Items MAY have a `badge` (e.g., "Popular") and a `cta` label.

#### Scenario: AI Agent offerings include Core and Elite
- **WHEN** the "AI Agents" category is rendered
- **THEN** it contains at minimum the "Core Agent" and "Elite Agent" offerings with their existing feature sets

#### Scenario: Website offerings display packages
- **WHEN** the "Websites" category is rendered
- **THEN** it contains at least one website offering item with price and features

### Requirement: Offerings Page
The application SHALL serve a dedicated page at `/offerings` that displays all offering categories and their items.

#### Scenario: User navigates to /offerings
- **WHEN** a user visits `/offerings`
- **THEN** they see all categories with their offering items rendered as cards
- **AND** each card displays name, price, features, and a CTA button

#### Scenario: Category navigation
- **WHEN** more than one category exists
- **THEN** the page provides navigation to jump between categories (tabs or anchor links)

### Requirement: Offering CTA
Each offering card SHALL include a call-to-action that opens the lead intake form, pre-selecting the relevant package.

#### Scenario: User clicks CTA on an offering
- **WHEN** a user clicks the CTA on an offering card
- **THEN** the intake form modal opens with the offering's package pre-selected
