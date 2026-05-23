/**
 * ROI calculator for the wranngle.com homepage.
 *
 * Deterministic, no ML. Public-facing copy must read defensibly, so the
 * assumptions below are conservative enough that a skeptical trades-business
 * owner reading the source will not roll their eyes.
 *
 * Assumptions (single source of truth — keep in sync with the on-page
 * "How we calculated this" disclosure):
 *
 *   MISSED_CALL_RATE         0.35  Industry baseline for SMB phone capture in
 *                                  restaurant reservations, salons, dental
 *                                  intake, and similar high-volume callback
 *                                  desks. After-hours and overflow blend lands
 *                                  ~30-40% of dialed attempts going to
 *                                  voicemail (OpenTable + Square 2024
 *                                  benchmarks).
 *   AGENT_ANSWER_RATE        0.95  Fraction of formerly-missed calls the AI
 *                                  agent actually answers (handles cold-start,
 *                                  telephony fallback, hard-failure cases).
 *   AGENT_CAPTURE_RATE       0.40  Fraction of answered after-hours calls
 *                                  that convert to a booked job. Lower than
 *                                  daytime live-agent rate (~55%) because
 *                                  unattended captures still need follow-up.
 *   AGENT_COST_PER_MONTH     299   Wranngle "Pro" tier monthly price floor.
 *                                  Used for payback period only.
 *
 * Formula:
 *   missed_calls_monthly      = inbound_calls_monthly * MISSED_CALL_RATE
 *   recovered_calls_monthly   = missed_calls_monthly * AGENT_ANSWER_RATE
 *   additional_jobs_booked    = recovered_calls_monthly * AGENT_CAPTURE_RATE
 *   savings_monthly           = additional_jobs_booked * avg_ticket
 *   payback_months            = AGENT_COST_PER_MONTH / max(savings_monthly, 1)
 *
 * Edge cases: zero or negative inputs return all-zeros (no NaN, no Infinity).
 */

export const ROI_ASSUMPTIONS = Object.freeze({
  MISSED_CALL_RATE: 0.35,
  AGENT_ANSWER_RATE: 0.95,
  AGENT_CAPTURE_RATE: 0.4,
  AGENT_COST_PER_MONTH: 299,
});

export type RoiInputs = {
  company: string;
  calls: number;
  ticket: number;
};

export type RoiResult = {
  company: string;
  calls: number;
  ticket: number;
  missedCallsMonthly: number;
  recoveredCallsMonthly: number;
  additionalJobsBooked: number;
  savingsMonthly: number;
  paybackMonths: number;
};

function sanitize(n: number): number {
  if (!Number.isFinite(n) || n < 0) return 0;
  return n;
}

export function computeRoi(inputs: RoiInputs): RoiResult {
  const calls = sanitize(inputs.calls);
  const ticket = sanitize(inputs.ticket);
  const company = (inputs.company || '').trim();

  const missed = calls * ROI_ASSUMPTIONS.MISSED_CALL_RATE;
  const recovered = missed * ROI_ASSUMPTIONS.AGENT_ANSWER_RATE;
  const jobs = recovered * ROI_ASSUMPTIONS.AGENT_CAPTURE_RATE;
  const savings = jobs * ticket;
  const payback =
    savings > 0 ? ROI_ASSUMPTIONS.AGENT_COST_PER_MONTH / savings : 0;

  return {
    company,
    calls,
    ticket,
    missedCallsMonthly: Math.round(missed * 10) / 10,
    recoveredCallsMonthly: Math.round(recovered * 10) / 10,
    additionalJobsBooked: Math.round(jobs * 10) / 10,
    savingsMonthly: Math.round(savings),
    paybackMonths: Math.round(payback * 10) / 10,
  };
}

export function formatCurrency(amount: number): string {
  return amount.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  });
}
