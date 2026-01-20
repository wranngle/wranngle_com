# Change: Add Payment Processing

## Why
The application currently displays mock pricing and fake invoices but cannot accept actual payments. To convert from a lead generation site to a SaaS platform, we need real payment processing, subscription management, and automated billing. This is critical for revenue generation and customer self-service.

## What Changes
- **Stripe Integration**: Integrate Stripe for payment processing and subscription management
- **Checkout Flow**: Build self-service checkout pages for plan selection and payment
- **Subscription Management**: Enable customers to upgrade, downgrade, and cancel subscriptions
- **Webhook Handling**: Process Stripe webhooks for subscription lifecycle events
- **Invoice Management**: Display and manage customer invoices
- **Payment Method Management**: Allow customers to update payment methods

## Impact
- **Affected specs**: `landing-page` (update intake form), new `payments` capability
- **Affected code**:
  - `client/src/App.tsx` - Update intake form to redirect to Stripe Checkout
  - `client/src/pages/checkout/` - New checkout flow pages
  - `client/src/pages/dashboard/billing/` - Billing management pages
  - `functions/api/stripe/` - Stripe webhook handlers and API
  - `functions/api/checkout.ts` - Create checkout session endpoint
  - `shared/schema.ts` - Add payment/subscription schemas
- **Database**: Requires subscriptions and invoices tables (from database change)
- **External Dependencies**: Stripe (2.9% + $0.30 per transaction)

## Breaking Changes
- **BREAKING**: Intake form now redirects to Stripe Checkout instead of showing mock invoice
- Current mock "Order Received" flow will be replaced with real payment flow

## Technical Approach

### Payment Provider: Stripe
**Why Stripe over alternatives:**
- **Industry standard**: Most trusted payment processor
- **Comprehensive**: Handles payments, subscriptions, invoicing, tax calculation
- **Developer-friendly**: Excellent API, webhooks, SDKs, documentation
- **Global**: Supports 135+ currencies and local payment methods
- **Billing Portal**: Hosted page for subscription management (saves development time)
- **Transparent pricing**: 2.9% + $0.30 per transaction, no monthly fees
- **Strong security**: PCI DSS Level 1 certified, handles all compliance

**Alternatives considered:**
- Paddle: Good for SaaS but higher fees (5% + processing), limited customization
- LemonSqueezy: Emerging, good pricing, but less mature ecosystem
- PayPal: Higher fees, poor developer experience, customer trust issues
- **Verdict**: Stripe is the clear choice for SaaS payment processing

## Stripe Products & Pricing Setup

### Products
1. **Core Agent**
   - Price ID: `price_core_monthly` - $250/month
   - Price ID: `price_core_annual` - $212.50/month ($2,550/year - 15% discount)
   - Includes: 1,000 voice minutes, 500 SMS segments

2. **Elite Agent**
   - Price ID: `price_elite_monthly` - $500/month
   - Price ID: `price_elite_annual` - $400/month ($4,800/year - 20% discount)
   - Includes: 2,500 voice minutes, 1,500 SMS segments

3. **Usage-Based Overage**
   - Metered billing for usage beyond plan limits
   - Voice minutes: $0.10 per minute
   - SMS segments: $0.05 per segment

### Billing Configuration
- **Billing Cycle**: Monthly or annual (customer choice)
- **Payment Collection**: Automatic (charge immediately)
- **Failed Payment Retry**: 3 attempts over 2 weeks
- **Grace Period**: 7 days before suspension
- **Proration**: Enabled for plan changes
- **Tax Calculation**: Stripe Tax (automatic sales tax/VAT)

## Checkout Flow

### User Journey
1. User clicks "Select Core Agent" or "Select Elite Agent" on landing page
2. If unauthenticated: Redirect to /signup → then checkout
3. If authenticated: Redirect to checkout page
4. Checkout page displays:
   - Selected plan details
   - Annual discount option
   - Estimated first invoice
5. "Proceed to Payment" button opens Stripe Checkout
6. User enters payment details on Stripe-hosted page
7. Upon success, redirect to /dashboard with welcome message
8. Webhook creates subscription record in database

### Stripe Checkout Session
- **Mode**: `subscription`
- **Success URL**: `https://wranngle.com/dashboard?checkout=success`
- **Cancel URL**: `https://wranngle.com/checkout?canceled=true`
- **Customer Email**: Pre-filled from user account
- **Payment Methods**: Card, ACH, link (Stripe's 1-click checkout)
- **Billing Address Collection**: Auto (required for tax calculation)
- **Allow Promotion Codes**: Yes
- **Tax Calculation**: Automatic via Stripe Tax

## Subscription Management

### Upgrade Flow
1. User navigates to /dashboard/billing
2. Clicks "Upgrade to Elite Agent"
3. Prorated charge calculated (remaining time on current plan)
4. Stripe Billing Portal opens for confirmation
5. Upgrade processed immediately
6. Usage limits updated

### Downgrade Flow
1. User navigates to /dashboard/billing
2. Clicks "Downgrade to Core Agent"
3. Downgrade scheduled for end of current billing period
4. User retains current features until period ends
5. Invoice reflects new amount on next cycle

### Cancellation Flow
1. User navigates to /dashboard/billing
2. Clicks "Cancel Subscription"
3. Confirmation dialog with retention offer (optional)
4. Cancellation scheduled for end of period
5. Access continues until period ends
6. Agent suspended after final billing date

## Webhook Events to Handle

### Critical Webhooks
- `checkout.session.completed` - New subscription created
- `customer.subscription.updated` - Plan change, status change
- `customer.subscription.deleted` - Subscription canceled
- `invoice.paid` - Payment successful
- `invoice.payment_failed` - Payment failed
- `invoice.finalized` - Invoice ready for payment
- `customer.subscription.trial_will_end` - Trial ending soon (if trials enabled)

### Webhook Processing
- All webhooks verified using Stripe signature
- Processed asynchronously (immediate response, background processing)
- Idempotent (can safely process duplicate events)
- Failed webhooks logged and alerted
- Webhook endpoint: `/api/stripe/webhooks`

## Invoice Management

### Invoice Display
- List all invoices in /dashboard/billing/invoices
- Show status: paid, open, void, uncollectible
- Provide download link for PDF
- Display payment method used
- Show breakdown (subscription + overage charges)

### Failed Payment Handling
1. Stripe attempts automatic retry (3 attempts over 2 weeks)
2. Customer receives email notification after each failed attempt
3. Dashboard displays "Payment Required" banner
4. After final failed attempt, subscription moves to `past_due`
5. Grace period of 7 days before suspension
6. Agent suspended if payment not received
7. Account fully suspended after 30 days

## Security Considerations
- **PCI Compliance**: Stripe handles all sensitive card data (no PCI burden)
- **Webhook Signatures**: All webhooks verified with Stripe signature
- **Customer Portal**: Use Stripe's hosted portal (reduces attack surface)
- **Checkout Sessions**: Expire after 24 hours
- **API Keys**: Stored as environment variables, never in code
- **Test Mode**: Separate test keys for development
- **Fraud Prevention**: Stripe Radar enabled (automatic fraud detection)

## Testing Requirements
- [ ] User can complete checkout with test card (4242 4242 4242 4242)
- [ ] Subscription record created in database after successful checkout
- [ ] User can access dashboard after subscribing
- [ ] Webhooks processed successfully (test with Stripe CLI)
- [ ] Failed payment webhook updates subscription status
- [ ] User can upgrade plan through Billing Portal
- [ ] User can downgrade plan (effective at period end)
- [ ] User can cancel subscription (effective at period end)
- [ ] Proration calculated correctly for plan changes
- [ ] Invoices displayed correctly in dashboard
- [ ] PDF invoices downloadable
- [ ] Usage overage billing works correctly

## Cost Analysis
- **Transaction Fee**: 2.9% + $0.30 per successful charge
- **Monthly Subscription Examples**:
  - Core Agent ($250): $7.55 fee = $242.45 net revenue
  - Elite Agent ($500): $14.80 fee = $485.20 net revenue
- **At 100 Customers** ($40k MRR):
  - Stripe fees: ~$1,200/month (~3% of revenue)
  - Acceptable for industry-standard payment processing
- **Stripe Tax**: Free tier covers most use cases (paid plans available for high volume)

## Migration Plan
1. **Phase 1**: Create Stripe products and prices
2. **Phase 2**: Implement checkout flow for new customers
3. **Phase 3**: Add webhook handlers and database sync
4. **Phase 4**: Build billing portal and subscription management
5. **Phase 5**: Add usage-based billing for overages
6. **Phase 6**: Test with $1 test subscriptions
7. **Phase 7**: Deploy to production with monitoring

## Open Questions
1. Should we offer a free trial period? **Recommendation**: No trial in MVP, add later if needed for conversion
2. Should we support PayPal as an additional payment method? **Recommendation**: No, Stripe is sufficient for MVP
3. Should we require CVV for saved cards? **Recommendation**: Yes, for security best practice
4. Should we send custom invoice emails or use Stripe's defaults? **Recommendation**: Use Stripe defaults initially, customize later
