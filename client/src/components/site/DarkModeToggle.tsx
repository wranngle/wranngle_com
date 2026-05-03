// @ts-nocheck
import React, {useState, useEffect, useCallback} from 'react';
import {Moon, Sun} from 'lucide-react';

const STORAGE_KEY = 'wranngle:theme';

/**
 * Read the persisted theme, falling back to system preference.
 * Returns true for "dark", false for "light".
 */
function readInitialDark(): boolean {
  if (typeof globalThis === 'undefined' || typeof document === 'undefined') {
    return true;
  }

  try {
    const stored = globalThis.localStorage?.getItem(STORAGE_KEY);
    if (stored === 'dark') return true;
    if (stored === 'light') return false;
  } catch {
    /* localStorage may be unavailable (SSR / private mode); ignore. */
  }

  if (
    typeof globalThis.matchMedia === 'function' &&
    globalThis.matchMedia('(prefers-color-scheme: dark)').matches
  ) {
    return true;
  }

  return true; // Brand default is dark.
}

/**
 * useDarkMode — single source of truth for the site-wide theme.
 *
 * - Persists to localStorage under `wranngle:theme`.
 * - Mirrors the boolean to the `dark` class on <html> so any descendant
 *   tailwind `dark:` utility resolves correctly even when rendered in a portal
 *   (Radix Dialog / DropdownMenu mount outside the page tree).
 */
export function useDarkMode(): {
  isDark: boolean;
  toggle: () => void;
  setIsDark: (next: boolean) => void;
} {
  const [isDark, setIsDark] = useState<boolean>(() => readInitialDark());

  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }

    try {
      globalThis.localStorage?.setItem(STORAGE_KEY, isDark ? 'dark' : 'light');
    } catch {
      /* ignore */
    }
  }, [isDark]);

  const toggle = useCallback(() => {
    setIsDark((previous) => !previous);
  }, []);

  return {isDark, toggle, setIsDark};
}

type DarkModeToggleProps = {
  isDark: boolean;
  toggle: () => void;
  className?: string;
};

export default function DarkModeToggle({
  isDark,
  toggle,
  className,
}: DarkModeToggleProps) {
  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      className={`p-2 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-full transition-colors ${
        isDark ? 'hover:bg-white/10' : 'hover:bg-black/10'
      } ${className ?? ''}`}
    >
      {isDark ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  );
}
