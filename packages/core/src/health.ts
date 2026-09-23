/**
 * Consistency checks for the library.
 *
 * Each check is a small function over the built library that returns issues. The
 * rules come from how skills are loaded (Agent Skills frontmatter limits) and from
 * the repo's own conventions (every skill appears in its department ledger and the
 * root index, and every relative link resolves).
 */
import path from 'node:path';

import { extractLocalLinks } from './markdown.js';
import type { Department, HealthIssue, HealthReport, Skill } from './types.js';

/** Agent Skills limits for frontmatter fields. */
export const NAME_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
export const MAX_NAME_LENGTH = 64;
export const MAX_DESCRIPTION_LENGTH = 1024;

/** Everything a check may look at. */
export interface HealthInput {
  skills: readonly Skill[];
  departments: readonly Department[];
  rootReadme: string;
  /** Frontmatter problems found while parsing, keyed by skill name. */
  frontmatterErrors: ReadonlyMap<string, string>;
  /** Library-relative POSIX paths of every file that exists. */
  files: ReadonlySet<string>;
  /** Library-relative markdown documents whose links should resolve. */
  documents: ReadonlyArray<{ path: string; content: string }>;
}

type Check = (input: HealthInput) => HealthIssue[];

// ─── Frontmatter ────────────────────────────────────────────────────────────

const frontmatter: Check = ({ skills, frontmatterErrors }) =>
  skills.flatMap((skill): HealthIssue[] => {
    const file = `${skill.path}/SKILL.md`;
    const at = { skill: skill.name, department: skill.department, file };
    const parseError = frontmatterErrors.get(skill.name);
    if (parseError) return [{ severity: 'error', code: 'frontmatter-invalid', message: parseError, ...at }];

    const issues: HealthIssue[] = [];
    const declared = skill.frontmatter['name'];
    if (typeof declared !== 'string' || declared === '') {
      issues.push({ severity: 'error', code: 'name-missing', message: 'Frontmatter has no `name`.', ...at });
    } else if (declared !== skill.name) {
      issues.push({
        severity: 'warning',
        code: 'name-mismatch',
        message: `Frontmatter name \`${declared}\` differs from the folder name \`${skill.name}\`.`,
        ...at,
      });
    }
    if (!NAME_PATTERN.test(skill.name) || skill.name.length > MAX_NAME_LENGTH) {
      issues.push({
        severity: 'warning',
        code: 'name-format',
        message: `Skill names should be lowercase words joined by hyphens, at most ${MAX_NAME_LENGTH} characters.`,
        ...at,
      });
    }
    if (skill.description === '') {
      issues.push({
        severity: 'error',
        code: 'description-missing',
        message: 'Frontmatter has no `description`, so agents cannot tell when to use this skill.',
        ...at,
      });
    } else if (skill.description.length > MAX_DESCRIPTION_LENGTH) {
      issues.push({
        severity: 'warning',
        code: 'description-too-long',
        message: `Description is ${skill.description.length} characters; the Agent Skills limit is ${MAX_DESCRIPTION_LENGTH}.`,
        ...at,
      });
    }
    return issues;
  });

// ─── Uniqueness ─────────────────────────────────────────────────────────────

const duplicateNames: Check = ({ skills }) => {
  const seen = new Map<string, Skill>();
  const issues: HealthIssue[] = [];
  for (const skill of skills) {
    const first = seen.get(skill.name);
    if (first) {
      issues.push({
        severity: 'error',
        code: 'duplicate-name',
        message: `\`${skill.name}\` exists in both \`${first.department}\` and \`${skill.department}\`. Names must be unique across the library.`,
        skill: skill.name,
        department: skill.department,
      });
    } else seen.set(skill.name, skill);
  }
  return issues;
};

// ─── Ledgers ────────────────────────────────────────────────────────────────

const ledgers: Check = ({ skills, departments, rootReadme }) => {
  const issues: HealthIssue[] = [];

  for (const department of departments) {
    if (!department.hasReadme) {
      issues.push({
        severity: 'warning',
        code: 'ledger-missing',
        message: `Department \`${department.id}\` has no README.md ledger.`,
        department: department.id,
      });
    }
  }

  for (const skill of skills) {
    const department = departments.find((candidate) => candidate.id === skill.department);
    if (department?.hasReadme && !mentions(department.readme, skill.name)) {
      issues.push({
        severity: 'warning',
        code: 'ledger-unlisted',
        message: `\`${skill.name}\` is not listed in the ${department.id} ledger.`,
        skill: skill.name,
        department: skill.department,
        file: `${skill.department}/README.md`,
      });
    }
    if (rootReadme && !mentions(rootReadme, skill.name)) {
      issues.push({
        severity: 'warning',
        code: 'index-unlisted',
        message: `\`${skill.name}\` is not listed in the root README index.`,
        skill: skill.name,
        department: skill.department,
        file: 'README.md',
      });
    }
  }

  // The root README states a total; keep it honest.
  const stated = /Total:\s*(\d+)\s+skills?/i.exec(rootReadme)?.[1];
  if (stated !== undefined && Number(stated) !== skills.length) {
    issues.push({
      severity: 'warning',
      code: 'index-count',
      message: `The root README says ${stated} skills; the library has ${skills.length}.`,
      file: 'README.md',
    });
  }
  return issues;
};

function mentions(markdown: string, name: string): boolean {
  return new RegExp(`(?<![\\w-])${escapeRegExp(name)}(?![\\w-])`).test(markdown);
}

// ─── Links and references ───────────────────────────────────────────────────

const brokenLinks: Check = ({ documents, files }) =>
  documents.flatMap(({ path: file, content }) =>
    extractLocalLinks(content)
      .map((link) => ({
        link,
        resolved: path.posix.normalize(path.posix.join(path.posix.dirname(file), link.target)),
      }))
      .filter(({ resolved }) => !files.has(resolved) && !isDirectoryOf(resolved, files))
      .map(({ link }): HealthIssue => ({
        severity: 'error',
        code: 'broken-link',
        message: `Line ${link.line} links to \`${link.target}\`, which does not exist.`,
        file,
        ...ownerOf(file),
      })),
  );

const unmentionedReferences: Check = ({ skills }) =>
  skills.flatMap((skill) =>
    skill.references
      .filter((reference) => !reference.mentionedInSkill)
      .map((reference): HealthIssue => ({
        severity: 'info',
        code: 'reference-unmentioned',
        message: `\`${reference.path}\` is never mentioned in SKILL.md, so an agent has no cue to load it.`,
        skill: skill.name,
        department: skill.department,
        file: `${skill.path}/${reference.path}`,
      })),
  );

function isDirectoryOf(dir: string, files: ReadonlySet<string>): boolean {
  const prefix = dir.replace(/\/?$/, '/');
  for (const file of files) if (file.startsWith(prefix)) return true;
  return false;
}

/** Department and skill a file path belongs to, from its first two segments. */
function ownerOf(file: string): Pick<HealthIssue, 'department' | 'skill'> {
  const [department, skill] = file.split('/');
  if (!department || department === 'README.md') return {};
  return skill && skill !== 'README.md' ? { department, skill } : { department };
}

// ─── Report ─────────────────────────────────────────────────────────────────

const CHECKS: Check[] = [frontmatter, duplicateNames, ledgers, brokenLinks, unmentionedReferences];
const SEVERITY_RANK = { error: 0, warning: 1, info: 2 } as const;

export function checkHealth(input: HealthInput): HealthReport {
  const issues = CHECKS.flatMap((check) => check(input)).sort(
    (a, b) => SEVERITY_RANK[a.severity] - SEVERITY_RANK[b.severity],
  );
  const counts = { error: 0, warning: 0, info: 0 };
  for (const issue of issues) counts[issue.severity] += 1;
  return { issues, counts };
}

export function escapeRegExp(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
