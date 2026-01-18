# Proposal: AI Voice Agent Sales Flow

## Objective
Streamline the sales and onboarding process for the "After Hours AI Voice Agent" product targeting small trades businesses.

## Target Audience
- Small trades businesses (HVAC, Plumbing, Electrical, etc.)
- Pain Point: Missed after-hours calls leading to lost revenue.

## Product Packages
1.  **Basic:** $250/month (or one-time setup? - *Assume Setup + Monthly or Fixed Price based on user context "Fixed price option of $250 or $500"*).
2.  **Premium:** $500/month (or higher tier fixed price).

## User Flow

### 1. Awareness (Cold Outreach)
- **Source:** Cold calls, emails, texts.
- **Action:** Lead is directed to `wranngle.com` or a specific demo phone number.

### 2. Engagement (The Hook)
- **Landing Page:**
    - "Console" aesthetic highlighting lost revenue from missed calls.
    - **Live Demo:** Embedded ElevenLabs agent or phone number to call.
    - **Value Prop:** "Stop missing leads. 24/7 After-hours coverage."

### 3. Conversion (The CTA)
- **Primary CTA:** "Deploy Agent" (formerly just generic).
- **Secondary CTA:** "Live Demo" (if not already engaged).
- **Process:**
    1.  User clicks "Deploy Agent".
    2.  **Intake Form:**
        - Business Name
        - Trade/Industry
        - Owner Name
        - Phone Number (for agent forwarding setup)
        - Email
        - Package Selection ($250 vs $500)
    3.  **Payment (Manual/Async):**
        - User submits form.
        - **Confirmation Screen:** "System Initializing... Check your email for activation instructions."
        - **Backend Action:**
            - Sends automated email to User with:
                - Welcome message.
                - Invoice / Payment Details (Relay Bank info).
                - "Agent will be deployed upon receipt of transfer."
            - Notifies Wranngle team of new lead.

### 4. Fulfillment & Onboarding
- **Payment Received:** Wranngle team manually verifies payment.
- **Setup:** Agent configured for the client.
- **Handoff:** Client receives "Login" credentials or simple confirmation that their agent is live on their provided number.

## UI Changes Required
- **Header:**
    - Replace "Services" / "Philosophy" with focused anchors or a "Pricing" section.
    - Add/Refine "Login" button -> "Client Portal" (Secondary) or "Get Started" (Primary).
- **Hero Section:**
    - "Deploy Agent" button should scroll to the Intake Form or open a Modal.
- **New Section:** "Pricing & Intake"
    - Simple pricing cards ($250 / $500).
    - Embedded form (Lead capture).

## Technical Requirements
- **Frontend:**
    - Create `IntakeForm` component.
    - Create `PricingSection` component.
- **Backend:**
    - API endpoint to handle form submission (`POST /api/leads`).
    - Email service integration (or use the AI Agent to send the follow-up email if capable, otherwise standard Node mailer).
