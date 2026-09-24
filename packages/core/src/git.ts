/**
 * Git history for the library, read in a single `git log` pass.
 *
 * One pass (rather than one `git log` per file) keeps snapshot builds fast as the
 * library grows. Every lookup afterwards is an in-memory filter. When the root is
 * not a git repository, or git is missing, all lookups return empty results.
 */
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

import type { GitStamp, RepoInfo } from './types.js';

const run = promisify(execFile);

/** How far back the history pass reads. Plenty for a skills library. */
const MAX_COMMITS = 1000;

// Control characters as separators: they cannot appear in commit subjects.
const RECORD = '\x1e';
const FIELD = '\x1f';

export interface CommitRecord extends GitStamp {
  /** Files the commit touched, POSIX paths relative to the repo root. */
  files: string[];
}

export class GitHistory {
  private constructor(
    readonly info: RepoInfo,
    /** Newest first. */
    readonly commits: readonly CommitRecord[],
  ) {}

  /** Reads the history of `root`. Never throws: a missing repo yields an empty history. */
  static async read(root: string): Promise<GitHistory> {
    const empty = new GitHistory({ root, branch: null, head: null }, []);
    const prefix = await git(root, ['rev-parse', '--show-prefix']);
    if (prefix === null) return empty;

    const [branch, log] = await Promise.all([
      git(root, ['rev-parse', '--abbrev-ref', 'HEAD']),
      git(root, [
        'log',
        `-n${MAX_COMMITS}`,
        '--no-renames',
        `--format=${RECORD}%H${FIELD}%cI${FIELD}%an${FIELD}%s`,
        '--name-only',
        '--',
        '.',
      ]),
    ]);

    // Paths from `git log` are relative to the repo root; the library root may be
    // a subfolder of the repo, so strip that prefix to make paths library-relative.
    const commits = parseLog(log ?? '', prefix.trim());
    const head = commits[0] ? stamp(commits[0]) : null;
    return new GitHistory({ root, branch: branch?.trim() || null, head }, commits);
  }

  /** Commits touching `path` (a file, or a folder when it ends in `/`), newest first. */
  historyOf(path: string, limit = Infinity): GitStamp[] {
    const matches = path.endsWith('/')
      ? (file: string) => file.startsWith(path)
      : (file: string) => file === path;

    const result: GitStamp[] = [];
    for (const commit of this.commits) {
      if (commit.files.some(matches)) result.push(stamp(commit));
      if (result.length >= limit) break;
    }
    return result;
  }

  /** The most recent commit touching `path`, or `null` if it was never committed. */
  lastChange(path: string): GitStamp | null {
    return this.historyOf(path, 1)[0] ?? null;
  }
}

// ─── Internals ──────────────────────────────────────────────────────────────

/** Runs git and returns stdout, or `null` when git fails for any reason. */
async function git(cwd: string, args: string[]): Promise<string | null> {
  try {
    const { stdout } = await run('git', args, { cwd, maxBuffer: 32 * 1024 * 1024 });
    return stdout;
  } catch {
    return null;
  }
}

function parseLog(log: string, prefix: string): CommitRecord[] {
  return log
    .split(RECORD)
    .filter((record) => record.trim() !== '')
    .map((record) => {
      const [header = '', ...fileLines] = record.split('\n');
      const [commit = '', date = '', author = '', subject = ''] = header.split(FIELD);
      const files = fileLines
        .map((line) => line.trim())
        .filter((line) => line !== '' && line.startsWith(prefix))
        .map((line) => line.slice(prefix.length));
      return { commit, date, author, subject, files };
    });
}

function stamp({ commit, date, author, subject }: CommitRecord): GitStamp {
  return { commit, date, author, subject };
}
