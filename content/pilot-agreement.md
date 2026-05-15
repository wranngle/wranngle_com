# Wranngle Systems Pilot Agreement

**Effective on click-through.** Last updated: May 14, 2026.

This pilot agreement governs the 30-day Wranngle Systems pilot ("Pilot")
between the operator named in the intake form ("Pilot Customer") and
Wranngle LLC, d/b/a Wranngle Systems ("Wranngle"). Clicking **I agree**
binds the Pilot Customer to the terms below.

## 1. Pilot Scope

Wranngle will provision one (1) AI voice agent provisioned against a single
business phone number, plus the gtm_ops intake/enrichment pipeline against
that agent. The Pilot runs for thirty (30) calendar days from the day the
agent is live on the Pilot Customer's published phone number.

The Pilot includes:

- 24/7 AI voice agent answering inbound calls
- Lead qualification with structured-extraction transcripts
- One n8n workflow connecting the agent to the Pilot Customer's CRM or
  spreadsheet of record
- Daily run log with call transcripts, latency, and handoff outcomes
- Two (2) prompt-revision cycles, each scoped to ≤30 minutes of work

## 2. Pricing and Conversion

The Pilot is offered at a flat **$1,000 USD** for the 30-day window. There
is no commitment beyond the Pilot. At day 30 the Pilot Customer may:

- Convert to a Core Agent plan at $250/month (month-to-month), or
- Convert to an Elite plan at the rate quoted in writing during the Pilot, or
- Walk away with no further obligation.

If the Pilot Customer chooses to convert, the first month of the production
plan is **credited the unused portion of the Pilot fee** prorated to the
remaining days in the calendar month.

## 3. Acceptance Criteria

The Pilot is considered successful when, at day 30, the agent has:

- Answered ≥95% of inbound calls within four (4) rings (production data)
- Maintained P95 voice-path latency ≤500 ms across the Pilot window
- Produced structured intake records for ≥80% of qualifying calls
- Recorded zero (0) silent failures (dropped calls without a transcript)

Wranngle ships the agent against these thresholds; failure to meet them at
day 30 entitles the Pilot Customer to a **full refund of the Pilot fee**.

## 4. Data Handling

All call recordings and transcripts are encrypted in transit and at rest.
Retention defaults to 90 days; the Pilot Customer may request immediate
deletion of any specific recording. Aggregated, de-identified metrics
(latency, call-volume buckets, vertical) may be retained indefinitely
for product analytics.

The Pilot Customer is responsible for posting a recording disclosure that
satisfies the call recording law of every U.S. state in which their
inbound callers may originate.

## 5. Telemetry

When the Pilot Customer clicks **I agree** on this page, the wranngle.com
front end fires a single anonymized telemetry event:

```json
{
  "event": "pilot.intent",
  "ts": "<ISO-8601 UTC timestamp>",
  "vertical": "<self-selected vertical or 'unspecified'>",
  "value_bucket": "pilot",
  "region": "<broad US region or 'unspecified'>",
  "agreement_version": "2026-05-14"
}
```

This event is the only payload the click sends. It contains no name, no
email, no phone, no IP, and no company identifier. The event is consumed
by the gtm_ops `/api/ticker` endpoint and used solely to populate the live
booking ticker on the wranngle.com home page. Pilot Customers who do not
want this event recorded should contact pilot@wranngle.com and execute the
agreement via a counter-signed PDF instead.

## 6. Termination

Either party may terminate the Pilot at any time during the 30-day window.
On Pilot Customer termination, Wranngle will:

- Deactivate the agent within one (1) business day
- Deliver a full export of call transcripts, recordings, and structured
  intake records via secure download within seven (7) business days
- Refund a prorated portion of the Pilot fee for any unused full days

## 7. Limitation of Liability

In no event shall Wranngle's aggregate liability arising out of or related
to the Pilot exceed the total fees paid by the Pilot Customer under this
agreement (i.e., $1,000 USD). This cap applies to all claims under any
theory of liability.

## 8. Counter-Signed Variant Available

A counter-signed PDF version of this agreement is available on request at
pilot@wranngle.com. Pilot Customers in regulated industries (medical,
legal, financial services) are encouraged to use the counter-signed
variant. The terms are identical to those above.

---

By clicking **I agree** below, the Pilot Customer confirms they have
read, understood, and accepted the terms of this Pilot Agreement.
