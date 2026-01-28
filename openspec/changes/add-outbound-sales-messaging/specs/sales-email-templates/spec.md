# Spec: Sales Email Templates

## Overview

5 new HTML email templates for proactive sales communication, following the existing master template inheritance pattern.

## Templates

### 1. sales-cold-outreach.html

**Purpose:** Initial prospecting email to potential customers who haven't engaged yet.

**Variables:**
| Variable | Description | Example |
|----------|-------------|---------|
| `RECIPIENT_NAME` | Prospect's name | "John" |
| `COMPANY_NAME` | Prospect's company | "Acme Corp" |
| `INDUSTRY` | Their industry | "HVAC" |
| `PAIN_POINT` | Identified challenge | "after-hours calls" |
| `CALENDAR_URL` | Meeting scheduler link | "https://cal.com/wranngle/intro" |

**Structure:**
1. Hero: Hook question about their challenge
2. Problem section: 2-3 bullet pain points
3. Solution section: How Wranngle helps
4. Social proof: Quick stat or testimonial
5. CTA: Schedule a Call button

### 2. sales-demo-followup.html

**Purpose:** Follow up after a product demo.

**Variables:**
| Variable | Description | Example |
|----------|-------------|---------|
| `RECIPIENT_NAME` | Contact name | "Sarah" |
| `DEMO_DATE` | When demo occurred | "January 20, 2026" |
| `RECORDING_URL` | Demo recording link | "https://..." |
| `PROPOSAL_URL` | Custom proposal | "https://..." |
| `REP_NAME` | Sales rep name | "Alex" |
| `REP_EMAIL` | Rep's email | "alex@wranngle.com" |

**Structure:**
1. Hero: "Thanks for Your Time"
2. Summary: Key points from demo
3. Resources: Recording + proposal links
4. Next steps: Clear action items
5. CTA: View Proposal button

### 3. sales-proposal-sent.html

**Purpose:** Notification that proposal has been delivered.

**Variables:**
| Variable | Description | Example |
|----------|-------------|---------|
| `RECIPIENT_NAME` | Contact name | "Mike" |
| `PROPOSAL_ID` | Unique identifier | "PROP-2026-0042" |
| `PACKAGE_NAME` | Selected package | "Elite Agent" |
| `MONTHLY_PRICE` | Monthly cost | "$500" |
| `PROPOSAL_URL` | Full proposal link | "https://..." |
| `VALID_UNTIL` | Expiration date | "February 1, 2026" |

**Structure:**
1. Hero: "Your Proposal is Ready"
2. Summary table: Package, pricing, validity
3. What's included: 3-4 key features
4. Timeline: Implementation milestones
5. CTA: View Proposal button

### 4. sales-quote-followup.html

**Purpose:** Follow up on sent quote that hasn't been actioned.

**Variables:**
| Variable | Description | Example |
|----------|-------------|---------|
| `RECIPIENT_NAME` | Contact name | "Lisa" |
| `QUOTE_ID` | Quote identifier | "QT-2026-0089" |
| `DAYS_SINCE_SENT` | Days elapsed | "5" |
| `QUOTE_AMOUNT` | Total quoted | "$542.50" |
| `QUOTE_URL` | Quote link | "https://..." |
| `REP_NAME` | Rep name | "Alex" |
| `REP_CALENDAR` | Rep's calendar | "https://..." |

**Structure:**
1. Hero: "Checking In on Your Quote"
2. Quote summary: ID, amount, date
3. Questions section: Common concerns addressed
4. Dual CTA: Accept Quote + Have Questions

### 5. sales-winback.html

**Purpose:** Re-engage lapsed leads or churned customers.

**Variables:**
| Variable | Description | Example |
|----------|-------------|---------|
| `RECIPIENT_NAME` | Contact name | "David" |
| `LAST_CONTACT_DATE` | Last interaction | "6 months ago" |
| `NEW_FEATURE_1` | Recent addition | "SMS Agents" |
| `NEW_FEATURE_2` | Recent addition | "CRM Integrations" |
| `SPECIAL_OFFER` | Re-engagement offer | "20% off first month" |
| `CALENDAR_URL` | Reconnection call | "https://..." |

**Structure:**
1. Hero: "Let's Reconnect"
2. What's new: Recent features/improvements
3. Special offer: Winback incentive
4. CTA: Let's Talk button

## Email Type Classification

All sales templates are classified as `marketing` type:
- Require unsubscribe link
- Subject to CAN-SPAM
- Consent tracking recommended

## Design System Compliance

All templates must:
- Use `#ff5f00` orange for CTAs and borders
- Use `#12111a` dark gradient heroes
- Use 14px uppercase button text
- Use 8px button border-radius
- Include `{{PREHEADER_TEXT}}` variable
- Pass `template-builder.ts` validation
