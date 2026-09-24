/** Light/dark theme, stored per browser and applied as `data-theme` on <html>. */
import { useCallback, useSyncExternalStore } from 'react';

export type Theme = 'light' | 'dark';

const listeners = new Set<() => void>();

function current(): Theme {
  return document.documentElement.dataset['theme'] === 'dark' ? 'dark' : 'light';
}

export function setTheme(theme: Theme): void {
  document.documentElement.dataset['theme'] = theme;
  try {
    localStorage.setItem('theme', theme);
  } catch {
    // Private windows may block storage; the theme still applies for this visit.
  }
  listeners.forEach((listener) => listener());
}

export function useTheme(): [Theme, () => void] {
  const theme = useSyncExternalStore((listener) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
  }, current);
  const toggle = useCallback(() => setTheme(current() === 'dark' ? 'light' : 'dark'), []);
  return [theme, toggle];
}
