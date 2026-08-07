/**
 * Theme persistence.
 *
 * Three states, not two: 'light' and 'dark' are explicit user choices stamped
 * as `data-theme` on <html>; 'system' removes the attribute entirely and lets
 * the `prefers-color-scheme` media query in index.css take over. Collapsing
 * this to a boolean would lose the ability to follow the OS.
 */

export type ThemeChoice = 'light' | 'dark' | 'system';

const STORAGE_KEY = 'vsd:theme';

export function isThemeChoice(value: unknown): value is ThemeChoice {
  return value === 'light' || value === 'dark' || value === 'system';
}

export function readStoredTheme(): ThemeChoice {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return isThemeChoice(raw) ? raw : 'system';
  } catch {
    // Private-browsing modes can throw on localStorage access rather than
    // returning null. Falling back to 'system' is always safe.
    return 'system';
  }
}

export function applyTheme(choice: ThemeChoice): void {
  const root = document.documentElement;
  if (choice === 'system') {
    root.removeAttribute('data-theme');
  } else {
    root.setAttribute('data-theme', choice);
  }
  try {
    localStorage.setItem(STORAGE_KEY, choice);
  } catch {
    // Persisting is a nicety; the applied theme above still holds for this
    // session even when storage is unavailable.
  }
}

export function applyStoredTheme(): void {
  const choice = readStoredTheme();
  if (choice === 'system') {
    document.documentElement.removeAttribute('data-theme');
  } else {
    document.documentElement.setAttribute('data-theme', choice);
  }
}

// Resolving "is it actually dark right now" lives in useTheme, where the OS
// preference is read through useSyncExternalStore rather than sampled ad hoc.
