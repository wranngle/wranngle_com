## ADDED Requirements

### Requirement: Stripe Checkout Session Creation
The system SHALL create Stripe Checkout sessions for subscription purchases.

#### Scenario: Monthly subscription checkout
- **WHEN** a user selects a monthly plan and proceeds to checkout
- **THEN** a Stripe Checkout session is created with mode 'subscription'
- **AND** the correct monthly price ID is used
- **AND** customer email is pre-filled from user account
- **AND** automatic tax collection is enabled
- **AND** the checkout session URL is returned

#### Scenario: Annual subscription checkout
- **WHEN** a user selects an annual plan with discount
- **THEN** a Stripe Checkout session is created with the annual price ID
- **AND** the discounted rate is displayed (15% for Core, 20% for Elite)
- **AND** the total annual cost is shown

#### Scenario: Unauthenticated checkout attempt
- **WHEN** an unauthenticated user tries to access checkout
- **THEN** they are redirected to the signup page
- **AND** the selected plan is preserved in the URL
- **AND** after signup, they are redirected to checkout

### Requirement: Checkout Page UI
The system SHALL provide a checkout page for plan review before payment.

#### Scenario: Checkout page display
- **WHEN** a user navigates to /checkout with a selected plan
- **THEN** the plan details are displayed (name, price, features)
- **AND** billing period toggle is shown (monthly/annual)
- **AND** annual discount savings are highlighted
- **AND** estimated first invoice breakdown is shown
- **AND** "Proceed to Payment" button redirects to Stripe Checkout

#### Scenario: Checkout cancellation
- **WHEN** a user cancels from Stripe Checkout
- **THEN** they are returned to the checkout page
- **AND** a message indicates the checkout was canceled
- **AND** they can modify selections or try again

#### Scenario: Checkout success
- **WHEN** payment is completed successfully in Stripe Checkout
- **THEN** the user is redirected to /dashboard?checkout=success
- **AND** a welcome message is displayed
- **AND** their subscription is immediately active

### Requirement: Webhook Processing
The system SHALL process Stripe webhooks to sync subscription state.

#### Scenario: Webhook signature verification
- **WHEN** a Stripe webhook is received
- **THEN** the request signature is verified using the webhook secret
- **AND** invalid signatures are rejected with 401 Unauthorized
- **AND** valid webhooks are processed

#### Scenario: Checkout completion webhook
- **WHEN** checkout.session.completed webhook is received
- **THEN** a subscription record is created in the database
- **AND** links to the user account via customer_id/email
- **AND** plan details are stored (tier, billing period, status)
- **AND** the user's account status is updated to 'subscribed'

#### Scenario: Subscription update webhook
- **WHEN** customer.subscription.updated webhook is received
- **THEN** the subscription record in the database is updated
- **AND** status changes are reflected (active, canceled, past_due)
- **AND** plan tier changes are synced
- **AND** billing dates are updated

#### Scenario: Subscription deletion webhook
- **WHEN** customer.subscription.deleted webhook is received
- **THEN** the subscription status is set to 'canceled' in database
- **AND** the user's agent is suspended
- **AND** access to features is revoked
- **AND** final invoice is processed

### Requirement: Invoice Webhook Handling
The system SHALL process invoice-related webhooks for payment tracking.

#### Scenario: Invoice paid webhook
- **WHEN** invoice.paid webhook is received
- **THEN** an invoice record is created or updated in the database
- **AND** payment status is set to 'paid'
- **AND** paid_at timestamp is recorded
- **AND** subscription status remains 'active'

#### Scenario: Invoice payment failed webhook
- **WHEN** invoice.payment_failed webhook is received
- **THEN** the subscription status is updated to 'past_due'
- **AND** the failed payment is logged
- **AND** customer notification is triggered
- **AND** retry attempts are tracked

#### Scenario: Invoice finalized webhook
- **WHEN** invoice.finalized webhook is received
- **THEN** the invoice details are stored in the database
- **AND** the invoice PDF URL is saved
- **AND** the invoice is made available in the customer dashboard

### Requirement: Stripe Customer Portal
The system SHALL provide access to Stripe's hosted customer portal for self-service.

#### Scenario: Portal session creation
- **WHEN** an authenticated user clicks "Manage Subscription"
- **THEN** a Stripe Customer Portal session is created
- **AND** the return URL is set to /dashboard/billing
- **AND** the portal session URL is returned
- **AND** the user is redirected to the portal

#### Scenario: Portal actions
- **WHEN** a user is in the Stripe Customer Portal
- **THEN** they can update their payment method
- **AND** they can upgrade or downgrade their plan
- **AND** they can cancel their subscription
- **AND** they can view and download invoices
- **AND** changes are synced via webhooks

### Requirement: Billing Dashboard Page
The system SHALL display subscription and billing information in the dashboard.

#### Scenario: Active subscription display
- **WHEN** a user with an active subscription views /dashboard/billing
- **THEN** their current plan is displayed (Core or Elite)
- **AND** billing period and renewal date are shown
- **AND** payment method on file is displayed (last 4 digits)
- **AND** next invoice amount and date are shown
- **AND** usage in current period is displayed

#### Scenario: Upgrade option
- **WHEN** a Core Agent subscriber views billing page
- **THEN** an "Upgrade to Elite Agent" button is displayed
- **AND** upgrade benefits are highlighted
- **AND** prorated charge is calculated and shown
- **AND** clicking the button opens Stripe Portal for upgrade

#### Scenario: Downgrade option
- **WHEN** an Elite Agent subscriber views billing page
- **THEN** a "Downgrade to Core Agent" option is available
- **AND** downgrade is scheduled for end of current period
- **AND** confirmation explains the feature changes

#### Scenario: Cancellation option
- **WHEN** a user clicks "Cancel Subscription"
- **THEN** a confirmation dialog is displayed
- **AND** explains access continues until period end
- **AND** confirms cancellation with "Cancel Subscription" button
- **AND** opens Stripe Portal for final confirmation

### Requirement: Invoice List Display
The system SHALL provide a list of all customer invoices.

#### Scenario: Invoice list page
- **WHEN** a user navigates to /dashboard/billing/invoices
- **THEN** all invoices are listed in reverse chronological order
- **AND** each invoice shows date, amount, and status
- **AND** "Download PDF" link is provided for each invoice
- **AND** "View Details" shows line item breakdown

#### Scenario: Invoice filtering
- **WHEN** a user filters invoices by status
- **THEN** only invoices matching the selected status are displayed
- **AND** status options include: all, paid, open, void

#### Scenario: Invoice pagination
- **WHEN** there are more than 20 invoices
- **THEN** invoices are paginated
- **AND** navigation controls allow moving between pages

### Requirement: Usage-Based Billing
The system SHALL report usage to Stripe for metered billing.

#### Scenario: Voice usage reporting
- **WHEN** a voice call is completed
- **THEN** the call duration is reported to Stripe
- **AND** linked to the user's subscription
- **AND** included in usage line item on next invoice
- **AND** overage charges apply if exceeding plan limits

#### Scenario: SMS usage reporting
- **WHEN** an SMS is sent or received
- **THEN** the SMS count is reported to Stripe
- **AND** linked to the user's subscription
- **AND** included in usage line item on next invoice
- **AND** overage charges apply if exceeding plan limits

#### Scenario: Usage limit alerts
- **WHEN** a user reaches 80% of their plan limits
- **THEN** an alert notification is sent
- **AND** dashboard displays usage warning
- **WHEN** a user reaches 95% of limits
- **THEN** a second alert is sent
- **AND** overage charges are explained

### Requirement: Failed Payment Handling
The system SHALL handle failed payments gracefully with customer communication.

#### Scenario: First payment failure
- **WHEN** a payment fails for the first time
- **THEN** Stripe automatically retries
- **AND** subscription status updates to 'past_due'
- **AND** customer receives email notification
- **AND** dashboard displays "Payment Failed" banner with action button

#### Scenario: Grace period
- **WHEN** a payment is past due
- **THEN** access continues for 7 days (grace period)
- **AND** customer can update payment method
- **AND** Stripe continues retry attempts

#### Scenario: Final payment failure
- **WHEN** all retry attempts fail (3 attempts over 2 weeks)
- **THEN** the subscription is canceled
- **AND** agent is suspended immediately
- **AND** customer receives final notification with reactivation instructions

#### Scenario: Payment method update
- **WHEN** a user updates their payment method during grace period
- **THEN** Stripe attempts to charge the new payment method
- **AND** if successful, subscription returns to 'active' status
- **AND** access is fully restored

### Requirement: Plan Change Proration
The system SHALL calculate prorated charges for mid-cycle plan changes.

#### Scenario: Upgrade proration
- **WHEN** a user upgrades from Core to Elite mid-cycle
- **THEN** unused time on Core plan is credited
- **AND** prorated charge for Elite plan is calculated
- **AND** the difference is charged immediately
- **AND** next renewal is at Elite price

#### Scenario: Downgrade proration
- **WHEN** a user downgrades from Elite to Core
- **THEN** the downgrade is scheduled for end of current period
- **AND** no immediate charge or refund occurs
- **AND** next renewal is at Core price
- **AND** usage limits adjust at renewal

### Requirement: Security and Compliance
The system SHALL handle payments securely and maintain PCI compliance.

#### Scenario: PCI compliance
- **WHEN** processing payments
- **THEN** no sensitive card data is stored in application database
- **AND** all payment details are handled by Stripe
- **AND** PCI compliance burden is on Stripe

#### Scenario: Webhook security
- **WHEN** webhooks are received
- **THEN** signatures are verified before processing
- **AND** rejected webhooks are logged
- **AND** accepted webhooks are processed idempotently

#### Scenario: Secure checkout
- **WHEN** a user is redirected to Stripe Checkout
- **THEN** the redirect URL uses HTTPS
- **AND** checkout session expires after 24 hours
- **AND** checkout session is tied to specific user

### Requirement: Fraud Prevention
The system SHALL use Stripe Radar for automatic fraud detection.

#### Scenario: Fraudulent payment attempt
- **WHEN** Stripe Radar flags a payment as potentially fraudulent
- **THEN** the payment is automatically blocked or reviewed
- **AND** the customer is notified if legitimate action required
- **AND** the event is logged for review

#### Scenario: High-risk customer
- **WHEN** a customer is flagged as high risk
- **THEN** additional verification may be required
- **AND** subscription activation may be delayed
- **AND** manual review is triggered

### Requirement: Subscription Lifecycle Management
The system SHALL handle all subscription lifecycle states.

#### Scenario: Active subscription
- **WHEN** a subscription is in 'active' status
- **THEN** the user has full access to features
- **AND** usage is tracked normally
- **AND** billing occurs automatically at renewal

#### Scenario: Canceled subscription
- **WHEN** a subscription is canceled
- **THEN** access continues until period end (cancel_at_period_end = true)
- **AND** no further charges occur
- **AND** at period end, subscription deletes and access revokes

#### Scenario: Past due subscription
- **WHEN** a subscription is 'past_due' due to failed payment
- **THEN** access continues during grace period
- **AND** payment retry attempts continue
- **AND** customer is prompted to update payment method
- **AND** after grace period, access is suspended

#### Scenario: Trialing subscription
- **WHEN** a trial period is active (if trials are enabled)
- **THEN** the user has full access without charges
- **AND** usage is still tracked
- **AND** at trial end, subscription converts to paid or cancels

### Requirement: Tax Calculation
The system SHALL automatically calculate and collect applicable sales tax.

#### Scenario: Automatic tax calculation
- **WHEN** a customer completes checkout
- **THEN** Stripe Tax calculates applicable tax based on location
- **AND** tax is added to the invoice
- **AND** tax rate and jurisdiction are displayed

#### Scenario: Tax-exempt customers
- **WHEN** a customer is marked as tax-exempt
- **THEN** no tax is charged on their invoices
- **AND** tax exemption status is verified

### Requirement: Refund Processing
The system SHALL support refunds through Stripe (admin-initiated).

#### Scenario: Full refund
- **WHEN** an admin issues a full refund
- **THEN** the entire invoice amount is refunded
- **AND** subscription status may be canceled
- **AND** customer is notified of refund

#### Scenario: Partial refund
- **WHEN** an admin issues a partial refund
- **THEN** the specified amount is refunded
- **AND** subscription remains active
- **AND** customer is notified of partial refund
