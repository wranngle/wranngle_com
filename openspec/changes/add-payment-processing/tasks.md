## 1. Stripe Account Setup
- [ ] 1.1 Create Stripe account (or use existing)
- [ ] 1.2 Complete business verification
- [ ] 1.3 Configure company settings (name, branding, email templates)
- [ ] 1.4 Enable Stripe Tax for automatic tax calculation
- [ ] 1.5 Set up payment methods (card, ACH, Link)
- [ ] 1.6 Configure webhook endpoint URL
- [ ] 1.7 Copy API keys (publishable and secret) for test and live modes

## 2. Stripe Products and Pricing
- [ ] 2.1 Create "Core Agent" product in Stripe Dashboard
- [ ] 2.2 Add monthly price ($250/month, recurring)
- [ ] 2.3 Add annual price ($2,550/year, $212.50/month)
- [ ] 2.4 Create "Elite Agent" product in Stripe Dashboard
- [ ] 2.5 Add monthly price ($500/month, recurring)
- [ ] 2.6 Add annual price ($4,800/year, $400/month)
- [ ] 2.7 Set up metered billing for usage overages
- [ ] 2.8 Configure voice minute overage rate ($0.10/minute)
- [ ] 2.9 Configure SMS segment overage rate ($0.05/segment)
- [ ] 2.10 Copy price IDs to application configuration

## 3. Stripe SDK Integration
- [ ] 3.1 Install stripe package for backend
- [ ] 3.2 Install @stripe/stripe-js for frontend
- [ ] 3.3 Create Stripe client singleton in functions/api/lib/stripe.ts
- [ ] 3.4 Add Stripe environment variables (STRIPE_SECRET_KEY, STRIPE_PUBLISHABLE_KEY, STRIPE_WEBHOOK_SECRET)
- [ ] 3.5 Test Stripe connection with test API key

## 4. Checkout Session Creation
- [ ] 4.1 Create /api/checkout/create-session endpoint
- [ ] 4.2 Require authentication for checkout endpoint
- [ ] 4.3 Accept plan_id and billing_period parameters
- [ ] 4.4 Create Stripe Checkout Session with correct mode and prices
- [ ] 4.5 Set success_url and cancel_url
- [ ] 4.6 Prefill customer email from user account
- [ ] 4.7 Enable automatic tax collection
- [ ] 4.8 Return checkout session URL to client

## 5. Checkout Frontend
- [ ] 5.1 Create client/src/pages/checkout/index.tsx page
- [ ] 5.2 Display selected plan details
- [ ] 5.3 Add billing period toggle (monthly/annual)
- [ ] 5.4 Show annual discount savings
- [ ] 5.5 Display estimated first invoice breakdown
- [ ] 5.6 Add "Proceed to Payment" button
- [ ] 5.7 Redirect to Stripe Checkout on button click
- [ ] 5.8 Handle checkout cancellation (return from Stripe)
- [ ] 5.9 Handle checkout success (redirect to dashboard)

## 6. Update Landing Page
- [ ] 6.1 Modify IntakeForm to redirect to /checkout instead of showing mock invoice
- [ ] 6.2 Pass selected package to checkout page via URL params
- [ ] 6.3 Remove mock invoice receipt UI from App.tsx
- [ ] 6.4 Update pricing cards to link to checkout page
- [ ] 6.5 Add authentication requirement before checkout

## 7. Webhook Handler Setup
- [ ] 7.1 Create /api/stripe/webhooks endpoint
- [ ] 7.2 Implement webhook signature verification
- [ ] 7.3 Parse and route webhook events to handlers
- [ ] 7.4 Add idempotency to prevent duplicate processing
- [ ] 7.5 Log all webhook events for debugging
- [ ] 7.6 Return 200 status quickly, process asynchronously

## 8. Webhook Event Handlers
- [ ] 8.1 Handle checkout.session.completed
  - Create subscription record in database
  - Link to user account
  - Update user status to 'subscribed'
- [ ] 8.2 Handle customer.subscription.updated
  - Update subscription status in database
  - Update plan if changed
  - Handle cancellation scheduling
- [ ] 8.3 Handle customer.subscription.deleted
  - Mark subscription as canceled in database
  - Suspend user's agent
  - Send cancellation confirmation email
- [ ] 8.4 Handle invoice.paid
  - Create invoice record in database
  - Mark payment as successful
  - Update subscription status to active
- [ ] 8.5 Handle invoice.payment_failed
  - Update subscription status to past_due
  - Create failed payment alert
  - Trigger customer notification
- [ ] 8.6 Handle invoice.finalized
  - Store invoice details in database
  - Make invoice available in dashboard

## 9. Stripe Customer Portal
- [ ] 9.1 Create /api/stripe/create-portal-session endpoint
- [ ] 9.2 Require authentication
- [ ] 9.3 Create portal session for authenticated user
- [ ] 9.4 Set return_url to dashboard billing page
- [ ] 9.5 Return portal session URL

## 10. Billing Dashboard Page
- [ ] 10.1 Create client/src/pages/dashboard/billing/index.tsx
- [ ] 10.2 Display current subscription details (plan, status, renewal date)
- [ ] 10.3 Display payment method on file
- [ ] 10.4 Add "Manage Subscription" button (opens Stripe Portal)
- [ ] 10.5 Add "Upgrade" / "Downgrade" buttons with plan comparison
- [ ] 10.6 Add "Cancel Subscription" button
- [ ] 10.7 Display usage in current billing period
- [ ] 10.8 Show upcoming invoice preview

## 11. Invoice List Page
- [ ] 11.1 Create client/src/pages/dashboard/billing/invoices.tsx
- [ ] 11.2 Fetch invoices from database
- [ ] 11.3 Display invoice list (date, amount, status)
- [ ] 11.4 Add "Download PDF" links
- [ ] 11.5 Add "View Details" for invoice breakdown
- [ ] 11.6 Implement pagination for long invoice lists
- [ ] 11.7 Add filter by status (paid, open, etc.)

## 12. Usage-Based Billing
- [ ] 12.1 Create usage event reporting function
- [ ] 12.2 Report voice call usage to Stripe (duration in seconds)
- [ ] 12.3 Report SMS usage to Stripe (message count)
- [ ] 12.4 Set up Stripe metered billing aggregation
- [ ] 12.5 Test overage billing with test usage
- [ ] 12.6 Verify overage charges appear on next invoice

## 13. Failed Payment Handling
- [ ] 13.1 Display "Payment Failed" banner in dashboard
- [ ] 13.2 Provide "Update Payment Method" button
- [ ] 13.3 Restrict access after grace period expires
- [ ] 13.4 Send email notifications for payment failures
- [ ] 13.5 Implement account suspension logic
- [ ] 13.6 Provide reactivation flow after payment update

## 14. Testing with Test Mode
- [ ] 14.1 Configure test mode API keys
- [ ] 14.2 Test checkout flow with test card (4242 4242 4242 4242)
- [ ] 14.3 Test declined card (4000 0000 0000 0002)
- [ ] 14.4 Test webhooks using Stripe CLI
- [ ] 14.5 Verify subscription created in database
- [ ] 14.6 Test plan upgrade via Portal
- [ ] 14.7 Test plan downgrade via Portal
- [ ] 14.8 Test cancellation flow
- [ ] 14.9 Test failed payment scenarios
- [ ] 14.10 Test usage overage billing

## 15. Security Hardening
- [ ] 15.1 Verify webhook signatures on all webhook requests
- [ ] 15.2 Use HTTPS only for all Stripe-related endpoints
- [ ] 15.3 Never log sensitive payment information
- [ ] 15.4 Implement rate limiting on checkout endpoint
- [ ] 15.5 Add CSRF protection for API endpoints
- [ ] 15.6 Validate all price IDs against whitelist

## 16. Monitoring & Alerts
- [ ] 16.1 Set up Stripe Dashboard alerts for failed payments
- [ ] 16.2 Monitor webhook delivery success rate
- [ ] 16.3 Alert on subscription churn (cancellations)
- [ ] 16.4 Track failed payment recovery rate
- [ ] 16.5 Monitor checkout abandonment rate
- [ ] 16.6 Add Sentry error tracking for payment flows

## 17. Documentation
- [ ] 17.1 Document Stripe setup process
- [ ] 17.2 Document webhook testing with Stripe CLI
- [ ] 17.3 Document environment variables needed
- [ ] 17.4 Create runbook for handling failed payments
- [ ] 17.5 Document refund process for customer support
- [ ] 17.6 Create FAQ for billing questions

## 18. Production Deployment
- [ ] 18.1 Switch from test to live API keys
- [ ] 18.2 Update webhook endpoint to production URL
- [ ] 18.3 Verify webhook signature secret for live mode
- [ ] 18.4 Test live checkout with real card ($1 test)
- [ ] 18.5 Refund test transaction
- [ ] 18.6 Monitor first real transactions closely
- [ ] 18.7 Set up financial reporting and reconciliation
