# Landing Page

## Purpose
React-based single-page application showcasing Wranngle Systems' AI voice agent services for trades businesses. Features console-themed UI, pricing tiers, and integrated ElevenLabs AI agent demo.

## Requirements

### Requirement: Hero Section
The landing page SHALL display a hero section with value proposition and call-to-action.

#### Scenario: Hero content display
- **WHEN** the page loads
- **THEN** the hero section displays the headline "Tame the Wild Frontier of AI"
- **AND** includes a subheadline describing the 24/7 AI Voice Agent for trades businesses
- **AND** shows two CTA buttons: "DEPLOY AGENT" and "LIVE DEMO"

#### Scenario: Deploy Agent CTA
- **WHEN** the user clicks "DEPLOY AGENT" button
- **THEN** the intake form dialog opens
- **AND** the Premium package is pre-selected

#### Scenario: Live Demo CTA
- **WHEN** the user clicks "LIVE DEMO" button
- **THEN** the page scrolls to the ElevenLabs AI agent widget
- **AND** the widget automatically opens after 1 second

### Requirement: Console Visual
The landing page SHALL display an animated console terminal showing AI agent capabilities.

#### Scenario: Console animation
- **WHEN** the page loads
- **THEN** the console displays lines of text sequentially with 800ms delay between lines
- **AND** includes system initialization, lead detection, knowledge base loading, and revenue estimation
- **AND** displays a blinking cursor animation

#### Scenario: Console styling
- **WHEN** the console is rendered
- **THEN** it uses monospace font (JetBrains Mono)
- **AND** includes a rounded border with custom radius (24px_4px_24px_4px)
- **AND** displays an animated border tracer using the accent color
- **AND** shows a "LIVE" indicator with a pulsing green dot

### Requirement: Pricing Section
The landing page SHALL display two pricing tiers with features and pricing.

#### Scenario: Pricing card display
- **WHEN** the pricing section is visible
- **THEN** two pricing cards are displayed: Core Agent ($250/mo) and Elite Agent ($500/mo)
- **AND** the Elite Agent card is marked as "Most Popular"
- **AND** each card displays a list of included features
- **AND** each card has an "AI Agent Facts" button

#### Scenario: AI Agent Facts dialog
- **WHEN** the user clicks "AI Agent Facts" button
- **THEN** a nutrition-label-styled dialog opens
- **AND** displays pricing details (monthly and annual with discount)
- **AND** shows usage limits (voice minutes, SMS segments)
- **AND** lists included features
- **AND** displays technical specifications and marketing ingredients

#### Scenario: Package selection
- **WHEN** the user clicks "Select Core Agent" or "Select Elite Agent" button
- **THEN** the intake form dialog opens
- **AND** the selected package is pre-populated in the form

### Requirement: Intake Form
The landing page SHALL provide a multi-step intake form for agent deployment orders.

#### Scenario: Form field display
- **WHEN** the intake form dialog opens
- **THEN** the form displays fields for:
  - Business Name (required)
  - Industry / Trade (required)
  - Contact Person (required)
  - Email Address (required)
  - Phone Number (required)
  - Agent Name (optional)
  - Additional Notes (optional)
- **AND** the selected package is displayed and can be changed

#### Scenario: Upgrade recommendation
- **WHEN** the form opens with Core Agent selected
- **THEN** an upgrade recommendation banner is displayed
- **AND** the banner explains benefits of combining Voice + Web Chat
- **AND** includes an "Upgrade to Elite Agent" button

#### Scenario: Elite Agent confirmation
- **WHEN** the form opens with Elite Agent selected
- **THEN** a confirmation banner is displayed
- **AND** indicates "Elite Agent Secured" with included benefits

#### Scenario: Form submission
- **WHEN** the user submits the form with valid data
- **THEN** a POST request is made to `/api/leads`
- **AND** a loading state is shown on the submit button
- **AND** the button text changes to "Initializing..."

#### Scenario: Submission success
- **WHEN** the lead submission succeeds
- **THEN** the form is replaced with a receipt-style confirmation
- **AND** displays an order reference number
- **AND** shows the selected package and price
- **AND** indicates payment is pending with invoice sent to the provided email
- **AND** a toast notification confirms "Order Received"

#### Scenario: Submission error
- **WHEN** the lead submission fails
- **THEN** a toast notification displays the error message
- **AND** the form remains open for correction

### Requirement: Features Section
The landing page SHALL display three key feature cards with visual demonstrations.

#### Scenario: Feature card display
- **WHEN** the features section is visible
- **THEN** three terminal-style feature cards are displayed:
  - Temporal Sentinel: 24/7 coverage radar visualization
  - Spectral Gate: Signal validation spectral analyzer
  - Synapse Uplink: Zero-latency data transmission visualization

#### Scenario: Temporal Sentinel visualization
- **WHEN** the Temporal Sentinel card is rendered
- **THEN** it displays an animated radar with rotating scanning line
- **AND** shows concentric circles and detected blips
- **AND** displays target acquisition coordinates

#### Scenario: Spectral Gate visualization
- **WHEN** the Spectral Gate card is rendered
- **THEN** it displays an animated frequency spectrum analyzer
- **AND** bars animate at different heights representing frequency analysis
- **AND** displays analysis results (voice match, sentiment, routing)

#### Scenario: Synapse Uplink visualization
- **WHEN** the Synapse Uplink card is rendered
- **THEN** it displays two nodes (source and destination) connected by a line
- **AND** shows animated data packets traveling from source to destination
- **AND** displays a notification popup indicating "+1 LEAD"

### Requirement: Theme Toggle
The landing page SHALL support light and dark theme modes.

#### Scenario: Default theme
- **WHEN** the page loads
- **THEN** the dark theme is active by default
- **AND** the page background uses dark gradient colors
- **AND** text is light-colored

#### Scenario: Theme toggle action
- **WHEN** the user clicks the theme toggle button
- **THEN** the theme switches between light and dark modes
- **AND** the page transitions smoothly with 500ms duration
- **AND** all UI elements update to match the new theme

#### Scenario: Theme persistence
- **WHEN** the theme is toggled
- **THEN** the new theme is applied to all sections
- **AND** dialog backgrounds match the theme
- **AND** card backgrounds match the theme

### Requirement: Navigation
The landing page SHALL provide navigation to key sections.

#### Scenario: Header display
- **WHEN** the page loads
- **THEN** a sticky header is displayed with Wranngle logo
- **AND** navigation links for Pricing and Features
- **AND** a theme toggle button
- **AND** a "DEPLOY AGENT" CTA button

#### Scenario: Mobile menu
- **WHEN** viewed on mobile device
- **THEN** desktop navigation is hidden
- **AND** a hamburger menu icon is displayed
- **WHEN** the hamburger icon is clicked
- **THEN** a fullscreen mobile menu opens
- **AND** displays navigation links and theme toggle
- **AND** displays the "DEPLOY AGENT" button

#### Scenario: Navigation links
- **WHEN** a navigation link is clicked
- **THEN** the page smoothly scrolls to the corresponding section
- **AND** the mobile menu closes (if open)

### Requirement: ElevenLabs AI Agent Integration
The landing page SHALL embed an ElevenLabs Conversational AI agent.

#### Scenario: Widget loading
- **WHEN** the page loads
- **THEN** the ElevenLabs widget script is loaded from CDN
- **AND** the widget element is rendered with agent ID "agent_xxxx_demo"

#### Scenario: Widget outside click
- **WHEN** the ElevenLabs widget is expanded
- **AND** the user clicks outside the widget
- **THEN** the widget is automatically minimized
- **AND** the click does not trigger minimization if a dialog is open

### Requirement: Responsive Design
The landing page SHALL be responsive and accessible on all device sizes.

#### Scenario: Desktop layout
- **WHEN** viewed on desktop (>768px width)
- **THEN** the hero section displays in two columns (text + console)
- **AND** pricing cards display side by side
- **AND** feature cards display in a three-column grid

#### Scenario: Mobile layout
- **WHEN** viewed on mobile (<768px width)
- **THEN** all sections stack vertically
- **AND** the desktop navigation is replaced with hamburger menu
- **AND** text sizes adjust for readability
- **AND** touch targets are appropriately sized

### Requirement: Performance Optimization
The landing page SHALL optimize for fast load times and smooth animations.

#### Scenario: Font loading
- **WHEN** the page loads
- **THEN** Google Fonts are loaded for Bricolage Grotesque and JetBrains Mono
- **AND** fonts are displayed with appropriate swap strategy

#### Scenario: Animation performance
- **WHEN** animations are rendered
- **THEN** Framer Motion is used for performant animations
- **AND** animations use GPU-accelerated properties (transform, opacity)
- **AND** animations do not cause layout thrashing

#### Scenario: Image optimization
- **WHEN** the logo image is loaded
- **THEN** it is served from a CDN (ibb.co)
- **AND** has appropriate caching headers

### Requirement: Accessibility
The landing page SHALL follow accessibility best practices.

#### Scenario: Semantic HTML
- **WHEN** the page is rendered
- **THEN** semantic HTML elements are used (header, main, section, footer)
- **AND** headings follow proper hierarchy
- **AND** buttons and links have descriptive text or aria-labels

#### Scenario: Keyboard navigation
- **WHEN** a user navigates via keyboard
- **THEN** all interactive elements are focusable
- **AND** focus indicators are visible
- **AND** dialogs can be closed with Escape key

#### Scenario: Color contrast
- **WHEN** either theme is active
- **THEN** text has sufficient contrast ratio against backgrounds
- **AND** interactive elements have clear visual states

### Requirement: Footer
The landing page SHALL display a footer with copyright information.

#### Scenario: Footer display
- **WHEN** the page is rendered
- **THEN** a footer is displayed with copyright "© 2026 Wranngle Systems LLC"
- **AND** uses monospace font
- **AND** has reduced opacity for subtle appearance
