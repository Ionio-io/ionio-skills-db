/**
 * Sidebar preferences, remembered per browser: whether the sidebar is collapsed to
 * an icon rail, and whether the departments group under "All skills" is open.
 */
import { useCallback, useSyncExternalStore } from 'react';

type Preference = 'sidebar-collapsed' | 'sidebar-departments-open';

const DEFAULTS: Record<Preference, boolean> = {
  'sidebar-collapsed': false,
  'sidebar-departments-open': true,
};

const listeners = new Set<() => void>();

function read(key: Preference): boolean {
  try {
    const stored = localStorage.getItem(key);
    return stored === null ? DEFAULTS[key] : stored === 'true';
  } catch {
    return DEFAULTS[key];
  }
}

function write(key: Preference, value: boolean): void {
  try {
    localStorage.setItem(key, String(value));
  } catch {
    // Storage can be blocked (private windows); the change still applies until reload.
    memory.set(key, value);
  }
  listeners.forEach((listener) => listener());
}

/** Fallback when storage is unavailable. */
const memory = new Map<Preference, boolean>();

function usePreference(key: Preference): [boolean, (value: boolean) => void] {
  const value = useSyncExternalStore(
    (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    () => memory.get(key) ?? read(key),
  );
  const set = useCallback((next: boolean) => write(key, next), [key]);
  return [value, set];
}

export const useSidebarCollapsed = () => usePreference('sidebar-collapsed');
export const useDepartmentsOpen = () => usePreference('sidebar-departments-open');

/** Rail and full widths, shared by the sidebar and the main column's offset. */
export const SIDEBAR_WIDTH = { expanded: 238, collapsed: 66 } as const;
