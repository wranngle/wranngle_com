import React, {useMemo, useState} from 'react';
import {
  TESTIMONIALS,
  filterTestimonials,
  type Testimonial,
} from '@/data/testimonials.ts';

export {TESTIMONIAL_STATES} from '@/data/testimonials.ts';

type Properties = {
  /** Inject a different list for stories/tests; defaults to the canonical registry. */
  testimonials?: readonly Testimonial[];
  /** Override CSS class for the outer section. */
  className?: string;
};

/**
 * Round-2 §6 item-4: searchable testimonial grid. Filter axes are state
 * (2-letter USPS code) and ZIP (5-digit prefix match). When a filter is
 * applied, non-matching cards drop out of the DOM entirely — the test
 * asserts CA-only filtering produces only CA cards.
 *
 * Sibling above-fold story surface to round-1's case-study video hero
 * (#77): the video carries the single hero anecdote; the grid carries
 * the regional proof that "businesses like yours, near you" are
 * already running this.
 */
export default function TestimonialGrid({
  testimonials = TESTIMONIALS,
  className = '',
}: Properties) {
  const [stateFilter, setStateFilter] = useState<string>('');
  const [zipFilter, setZipFilter] = useState<string>('');

  const visible = useMemo(
    () =>
      filterTestimonials(testimonials, {
        state: stateFilter,
        zip: zipFilter,
      }),
    [testimonials, stateFilter, zipFilter],
  );

  const states = useMemo(() => {
    const seen = new Set<string>();
    for (const t of testimonials) seen.add(t.state);
    return [...seen].sort();
  }, [testimonials]);

  const clearDisabled = stateFilter === '' && zipFilter === '';

  return (
    <section
      data-testid="testimonial-grid"
      data-result-count={visible.length}
      className={`w-full max-w-6xl mx-auto px-6 py-12 ${className}`}
      aria-label="Customer testimonials"
    >
      <header className="mb-8 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">
            What trades operators are saying
          </h2>
          <p className="text-sm opacity-70">
            Filter by state or ZIP to find a business near yours.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <label className="flex flex-col gap-1 text-xs uppercase tracking-wide opacity-70">
            State
            <select
              data-testid="testimonial-state-filter"
              aria-label="Filter testimonials by state"
              value={stateFilter}
              onChange={(event) => {
                setStateFilter(event.target.value);
              }}
              className="rounded-md border border-current/20 bg-transparent px-3 py-1.5 text-sm normal-case"
            >
              <option value="">All states</option>
              {states.map((code) => (
                <option key={code} value={code}>
                  {code}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1 text-xs uppercase tracking-wide opacity-70">
            ZIP
            <input
              data-testid="testimonial-zip-filter"
              aria-label="Filter testimonials by ZIP code"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={5}
              placeholder="e.g. 907"
              value={zipFilter}
              onChange={(event) => {
                setZipFilter(event.target.value.replaceAll(/\D/g, ''));
              }}
              className="rounded-md border border-current/20 bg-transparent px-3 py-1.5 text-sm normal-case"
            />
          </label>
          <button
            type="button"
            data-testid="testimonial-clear-filter"
            onClick={() => {
              setStateFilter('');
              setZipFilter('');
            }}
            disabled={clearDisabled}
            className="rounded-md border border-current/20 px-3 py-1.5 text-sm disabled:opacity-30"
          >
            Clear
          </button>
        </div>
      </header>

      {visible.length === 0 ? (
        <p
          data-testid="testimonial-empty-state"
          className="rounded-md border border-current/15 px-4 py-6 text-sm opacity-70"
        >
          No testimonials match that filter yet. Try a nearby state or a shorter
          ZIP prefix.
        </p>
      ) : (
        <ul
          data-testid="testimonial-list"
          className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
        >
          {visible.map((entry) => (
            <li
              key={entry.id}
              data-testid="testimonial-card"
              data-testimonial-id={entry.id}
              data-state={entry.state}
              data-zip={entry.zip}
              data-vertical={entry.vertical}
              className="flex flex-col gap-3 rounded-lg border border-current/15 p-5"
            >
              <blockquote className="text-sm leading-relaxed">
                {entry.quote}
              </blockquote>
              <footer className="text-xs opacity-80">
                <span className="font-semibold">{entry.name}</span>
                {' — '}
                <span>{entry.role}</span>
                {', '}
                <span>{entry.businessName}</span>
                <br />
                <span className="opacity-70">
                  {entry.state} · {entry.zip}
                </span>
              </footer>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
