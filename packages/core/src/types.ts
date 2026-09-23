/**
 * Public data model of the skills library.
 *
 * Everything here is plain, JSON-serialisable data: the same shapes travel from the
 * core library to the MCP server, over the REST API, and into the dashboard. This
 * module has no runtime code, so the browser bundle can import it for types alone.
 */

// ─── Documents ──────────────────────────────────────────────────────────────

/** A markdown heading, used for outlines, anchors and search. */
export interface Heading {
  depth: number;
  text: string;
  /** GitHub-style anchor slug, identical to what `rehype-slug` renders. */
  slug: string;
}

/** Size measurements of one text document. */
export interface DocStats {
  words: number;
  lines: number;
  bytes: number;
  /** Estimated at 230 words per minute, rounded up, never below 1. */
  readingMinutes: number;
}

// ─── Git ────────────────────────────────────────────────────────────────────

/** One commit as it relates to a file or folder. */
export interface GitStamp {
  commit: string;
  date: string;
  author: string;
  subject: string;
}

/** One commit in the activity feed, mapped onto the skills it touched. */
export interface GitCommit extends GitStamp {
  files: string[];
  skills: string[];
  departments: string[];
}

export interface RepoInfo {
  root: string;
  branch: string | null;
  head: GitStamp | null;
}

// ─── Skills ─────────────────────────────────────────────────────────────────

/** A file bundled with a skill besides `SKILL.md` (usually under `references/`). */
export interface ReferenceFile {
  /** POSIX path relative to the skill folder, e.g. `references/title-bank.md`. */
  path: string;
  name: string;
  /** Text files can be served; binary files are listed with their size only. */
  isText: boolean;
  stats: DocStats;
  headings: Heading[];
  /** Whether `SKILL.md` mentions this file, so an agent will know to load it. */
  mentionedInSkill: boolean;
  updated: GitStamp | null;
}

/** The lightweight view of a skill: enough to decide whether to load it. */
export interface SkillSummary {
  /** Folder name, which is also the skill's unique id. */
  name: string;
  department: string;
  description: string;
  /** First H1 of the body, falling back to the name. */
  title: string;
  /** POSIX path of the skill folder relative to the library root. */
  path: string;
  /** Skills whose description says they must only run on explicit request. */
  optIn: boolean;
  stats: DocStats;
  referenceCount: number;
  updated: GitStamp | null;
}

/** A pointer from one skill to another. */
export interface SkillRef {
  name: string;
  department: string;
}

/** The full view of a skill, including its document and everything around it. */
export interface Skill extends SkillSummary {
  frontmatter: Record<string, unknown>;
  /** Markdown after the frontmatter block. */
  body: string;
  /** The complete `SKILL.md`, frontmatter included. */
  raw: string;
  headings: Heading[];
  references: ReferenceFile[];
  related: {
    /** Skills this one mentions by name. */
    outgoing: SkillRef[];
    /** Skills that mention this one by name. */
    incoming: SkillRef[];
  };
  /** Commits touching the skill folder, newest first. */
  history: GitStamp[];
  absolutePath: string;
}

// ─── Departments ────────────────────────────────────────────────────────────

export interface DepartmentSummary {
  /** Folder name, e.g. `youtube`. */
  id: string;
  title: string;
  /** First paragraph of the department README. */
  summary: string;
  path: string;
  skillNames: string[];
  /** Word totals across the department's skills and their references. */
  stats: DocStats;
  hasReadme: boolean;
  updated: GitStamp | null;
}

export interface Department extends DepartmentSummary {
  /** The department README (its ledger) as markdown. Empty when missing. */
  readme: string;
  readmeHeadings: Heading[];
  skills: SkillSummary[];
}

// ─── Library ────────────────────────────────────────────────────────────────

export interface LibraryStats {
  departments: number;
  skills: number;
  references: number;
  words: number;
  readingMinutes: number;
  lastUpdated: GitStamp | null;
}

/** The index of the whole library, as served to agents and the dashboard. */
export interface Catalog {
  /** The root README: the human-written index of the library. */
  readme: string;
  stats: LibraryStats;
  departments: DepartmentSummary[];
  skills: SkillSummary[];
  repo: RepoInfo;
  /** ISO time the snapshot was built. */
  builtAt: string;
}

// ─── Search ─────────────────────────────────────────────────────────────────

export type SearchField = 'name' | 'description' | 'heading' | 'body';

export interface SearchHit {
  name: string;
  department: string;
  title: string;
  description: string;
  score: number;
  /** The most relevant place the query matched. */
  field: SearchField;
  /** A short excerpt around the match. */
  snippet: string;
  /** Query terms as they appear in the matched text, for highlighting. */
  terms: string[];
}

// ─── Health ─────────────────────────────────────────────────────────────────

export type IssueSeverity = 'error' | 'warning' | 'info';

/** One problem found by the library's consistency checks. */
export interface HealthIssue {
  severity: IssueSeverity;
  /** Stable machine-readable id of the check, e.g. `name-mismatch`. */
  code: string;
  message: string;
  /** Skill name or department id the issue belongs to, when it has one. */
  skill?: string;
  department?: string;
  /** Repo-relative file the issue was found in. */
  file?: string;
}

export interface HealthReport {
  issues: HealthIssue[];
  counts: Record<IssueSeverity, number>;
}
