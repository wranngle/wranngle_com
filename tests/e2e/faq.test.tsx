/**
 * FAQ accordion behavior (round-2 F007).
 *
 * The central regression: opening one FAQ must NOT collapse another. The
 * old single-`openIndex` implementation auto-collapsed; this asserts the
 * Set-backed multi-open behavior so a refactor can't silently bring the
 * accordion-collapse back.
 */
import React, {act} from 'react';
import {createRoot, type Root} from 'react-dom/client';
import {describe, it, expect, beforeEach, afterEach} from 'vitest';
import FAQ from '@/components/FAQ.tsx';

(globalThis as Record<string, unknown>).IS_REACT_ACT_ENVIRONMENT = true;

describe('FAQ accordion — multiple panels open at once', () => {
  let container: HTMLDivElement | undefined;
  let root: Root | undefined;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.append(container);
  });

  afterEach(() => {
    act(() => {
      root?.unmount();
    });
    container?.remove();
    container = undefined;
    root = undefined;
  });

  const questionButtons = () =>
    [
      ...document.querySelectorAll('button[aria-expanded]'),
    ] as HTMLButtonElement[];

  it('opens a second FAQ without collapsing the first', () => {
    if (!container) throw new Error('container missing');
    act(() => {
      root = createRoot(container!);
      root.render(<FAQ isDark={false} />);
    });

    const buttons = questionButtons();
    expect(buttons.length).toBeGreaterThan(2);

    // Item 0 is seeded open.
    const firstOpen = buttons.find(
      (b) => b.getAttribute('aria-expanded') === 'true',
    );
    expect(firstOpen).toBeDefined();

    // Open a different, currently-closed question.
    const closed = buttons.find(
      (b) => b.getAttribute('aria-expanded') === 'false',
    );
    expect(closed).toBeDefined();
    act(() => {
      closed!.click();
    });

    const expandedCount = questionButtons().filter(
      (b) => b.getAttribute('aria-expanded') === 'true',
    ).length;
    // Both the seeded-open and the just-clicked one are open — no auto-collapse.
    expect(expandedCount).toBeGreaterThanOrEqual(2);
  });

  it('toggling an open FAQ closes only that one', () => {
    if (!container) throw new Error('container missing');
    act(() => {
      root = createRoot(container!);
      root.render(<FAQ isDark={false} />);
    });

    const buttons = questionButtons();
    const closed = buttons.find(
      (b) => b.getAttribute('aria-expanded') === 'false',
    );
    act(() => {
      closed!.click();
    });
    const openCountAfterAdd = questionButtons().filter(
      (b) => b.getAttribute('aria-expanded') === 'true',
    ).length;

    // Re-click the one we just opened — it closes, the other stays open.
    const reClosable = questionButtons().find(
      (b) =>
        b.getAttribute('aria-expanded') === 'true' &&
        b.textContent === closed!.textContent,
    );
    act(() => {
      reClosable!.click();
    });
    const openCountAfterToggle = questionButtons().filter(
      (b) => b.getAttribute('aria-expanded') === 'true',
    ).length;

    expect(openCountAfterToggle).toBe(openCountAfterAdd - 1);
    expect(openCountAfterToggle).toBeGreaterThanOrEqual(1);
  });
});
