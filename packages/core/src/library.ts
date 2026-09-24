/**
 * `SkillLibrary` owns the current snapshot and keeps it fresh.
 *
 * Snapshots are built lazily and cached. With `watch` on, a filesystem watcher
 * marks the cache stale when skill content (or git history) changes, and tells
 * subscribers, so the dashboard can refetch live. Without a watcher (tests, one-off
 * scripts) call `refresh()` to force a rebuild.
 */
import { watch, type FSWatcher } from 'node:fs';
import path from 'node:path';

import { isIgnoredDir } from './scan.js';
import { LibrarySnapshot } from './snapshot.js';

export interface SkillLibraryOptions {
  root: string;
  /** Watch the root for changes and invalidate the cached snapshot. Default: false. */
  watch?: boolean;
}

export interface LibraryChange {
  /** Library-relative paths that changed, deduplicated. */
  paths: string[];
  at: string;
}

type ChangeListener = (change: LibraryChange) => void;

/** Collects bursts of filesystem events (an editor save, a git commit) into one change. */
const DEBOUNCE_MS = 150;

export class SkillLibrary {
  readonly root: string;
  private current: Promise<LibrarySnapshot> | null = null;
  private watcher: FSWatcher | null = null;
  private readonly listeners = new Set<ChangeListener>();
  private pending = new Set<string>();
  private debounce: NodeJS.Timeout | null = null;

  constructor({ root, watch: shouldWatch = false }: SkillLibraryOptions) {
    this.root = path.resolve(root);
    if (shouldWatch) this.startWatching();
  }

  /** The current snapshot, building it first if the cache is empty or stale. */
  snapshot(): Promise<LibrarySnapshot> {
    if (!this.current) {
      const building = LibrarySnapshot.build(this.root);
      this.current = building;
      // A failed build must not stay cached, or every later call would fail too.
      building.catch(() => {
        if (this.current === building) this.current = null;
      });
    }
    return this.current;
  }

  /** Drops the cached snapshot and builds a new one. */
  refresh(): Promise<LibrarySnapshot> {
    this.current = null;
    return this.snapshot();
  }

  /** Subscribes to content changes. Returns the unsubscribe function. */
  onChange(listener: ChangeListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  close(): void {
    this.watcher?.close();
    this.watcher = null;
    if (this.debounce) clearTimeout(this.debounce);
    this.listeners.clear();
  }

  // ─── Watching ─────────────────────────────────────────────────────────────

  private startWatching(): void {
    this.watcher = watch(this.root, { recursive: true }, (_event, filename) => {
      if (!filename) return;
      const relative = filename.split(path.sep).join('/');
      if (isRelevant(relative)) this.queue(relative);
    });
    // Watching is a convenience: if the platform drops the watcher, keep serving.
    this.watcher.on('error', () => this.watcher?.close());
  }

  private queue(relative: string): void {
    this.current = null;
    this.pending.add(relative);
    if (this.debounce) clearTimeout(this.debounce);
    this.debounce = setTimeout(() => {
      const change = { paths: [...this.pending], at: new Date().toISOString() };
      this.pending = new Set();
      this.current = null; // events may have landed while a build was running
      for (const listener of this.listeners) listener(change);
    }, DEBOUNCE_MS);
  }
}

/**
 * Content lives outside reserved, hidden and private folders. The one exception
 * is git's own log of HEAD, which moves on every commit and checkout and so
 * changes every "last updated" stamp.
 */
function isRelevant(relative: string): boolean {
  if (relative === '.git/logs/HEAD') return true;
  const top = relative.split('/')[0]!;
  return !isIgnoredDir(top);
}
