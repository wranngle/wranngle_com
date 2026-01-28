# Tasks: Add Outbound Sales Templates + RCS Mobile Siblings

## Phase 1: OpenSpec Setup
- [x] Create proposal.md
- [x] Create tasks.md
- [x] Create design.md
- [x] Create spec files

## Phase 2: Sales Email Templates
- [ ] Create sales-cold-outreach.html
- [ ] Create sales-demo-followup.html
- [ ] Create sales-proposal-sent.html
- [ ] Create sales-quote-followup.html
- [ ] Create sales-winback.html
- [ ] Add sales type to EMAIL_TYPES
- [ ] Add sample data for previews

## Phase 3: SMS Infrastructure
- [ ] Create email-templates/sms/ directory
- [ ] Create message-builder.ts
- [ ] Define MessageTemplate interface

## Phase 4: SMS Templates (10 total)
- [ ] welcome.ts
- [ ] invoice-receipt.ts
- [ ] notification.ts
- [ ] password-reset.ts
- [ ] lead-intake.ts
- [ ] sales-cold-outreach.ts
- [ ] sales-demo-followup.ts
- [ ] sales-proposal-sent.ts
- [ ] sales-quote-followup.ts
- [ ] sales-winback.ts

## Phase 5: Schema & Consent
- [ ] Add smsConsent field
- [ ] Add smsConsentTimestamp field
- [ ] Add preferredChannel field

## Phase 6: Build System Updates
- [ ] Update template-builder.ts with sales type
- [ ] Add SMS guidelines to STYLE_GUIDE.md
- [ ] Generate previews

## Phase 7: Testing
- [ ] Run email:test validation
- [ ] Create SMS length tests
- [ ] E2E verification
