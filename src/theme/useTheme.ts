import { useCallback, useEffect, useState, useSyncExternalStore } from 'react';
import { applyTheme, readStoredTheme, type ThemeChoice } from './theme.ts';

const DARK_QUERY = '(prefers-color-scheme: dark)';

function subscribeToSystemTheme(onChange: () => void): () => void {
  if (typeof window.matchMedia !== 'function') return () => {};
  const media = window.matchMedia(DARK_QUERY);
  media.addEventListener('change', onChange);
  return () => media.removeEventListener('change', onChange);
}

function getSystemPrefersDark(): boolean {
  if (typeof window.matchMedia !== 'function') return false;
  return window.matchMedia(DARK_QUERY).matches;
}

/**
 * Current theme choice plus the light/dark it resolves to.
 *
 * `isDark` is *derived*, never stored. An earlier version held it as state and
 * refreshed it inside the same effect that applied the theme — which is a
 * cascading extra render, and the kind of duplicated-source-of-truth that
 * silently goes stale. The OS preference is genuinely external state, so it is
 * read through `useSyncExternalStore`: React subscribes to the media query and
 * re-renders on change, with no effect and no second copy of the answer.
 */
export function useTheme() {
  const [choice, setChoice] = useState<ThemeChoice>(readStoredTheme);

  const systemPrefersDark = useSyncExternalStore(
    subscribeToSystemTheme,
    getSystemPrefersDark,
    // Server snapshot: no window, so assume light.
    () => false,
  );

  // Writing to the DOM and to localStorage is exactly what an effect is for —
  // pushing React state out to an external system.
  useEffect(() => {
    applyTheme(choice);
  }, [choice]);

  const isDark =
    choice === 'dark' ? true : choice === 'light' ? false : systemPrefersDark;

  const cycle = useCallback(() => {
    setChoice((current) =>
      current === 'system' ? 'light' : current === 'light' ? 'dark' : 'system',
    );
  }, []);

  return { choice, isDark, setChoice, cycle };
}
