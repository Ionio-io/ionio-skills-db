/**
 * An immutable, fully-parsed view of the library at one moment.
 *
 * Building a snapshot scans the disk, parses every document, reads git history,
 * works out cross-references, indexes search and runs the health checks, once.
 * Every query afterwards (MCP tools, REST routes, dashboard) is an in-memory read.
 * `SkillLibrary` decides when a snapshot is stale and builds a new one.
 */
import { NotFoundError } from './errors.js';
import { GitHistory } from './git.js';
import { checkHealth, escapeRegExp } from './health.js';
import {
  docStats,
  extractHeadings,
  firstH1,
  firstParagraph,
  parseFrontmatter,
  sumStats,
} from './markdown.js';
import { scanLibrary, type ScannedDepartment, type ScannedSkill } from './scan.js';
import { SkillSearchIndex, type SearchOptions } from './search.js';
import type {
  Catalog,
  Department,
  DepartmentSummary,
  GitCommit,
  GitStamp,
  HealthReport,
  ReferenceFile,
  SearchHit,
  Skill,
  SkillRef,
  SkillSummary,
} from './types.js';

/** How many commits of history each skill carries. */
const SKILL_HISTORY_LIMIT = 25;

/** Descriptions that mark a skill as opt-in only (e.g. "OPT-IN ONLY: use this skill only when…"). */
const OPT_IN_PATTERN = /\bopt-in only\b/i;

export class LibrarySnapshot {
  private readonly skillIndex: Map<string, Skill>;
  private readonly departmentIndex: Map<string, Department>;

  private constructor(
    readonly root: string,
    readonly rootReadme: string,
    private readonly skillList: readonly Skill[],
    private readonly departmentList: readonly Department[],
    private readonly git: GitHistory,
    private readonly searchIndex: SkillSearchIndex,
    private readonly healthReport: HealthReport,
    /** Library-relative path → text of every bundled text file. */
    private readonly contents: ReadonlyMap<string, string>,
    readonly builtAt: string,
  ) {
    this.skillIndex = new Map(skillList.map((skill) => [skill.name, skill]));
    this.departmentIndex = new Map(departmentList.map((department) => [department.id, department]));
  }

  // ─── Build ────────────────────────────────────────────────────────────────

  static async build(root: string): Promise<LibrarySnapshot> {
    const [scan, git] = await Promise.all([scanLibrary(root), GitHistory.read(root)]);

    // Parse every skill on its own first, then link them together.
    const frontmatterErrors = new Map<string, string>();
    const parsed = scan.departments.flatMap((department) =>
      department.skills.map((scanned) => parseSkill(scanned, git, frontmatterErrors)),
    );
    const skills = linkRelatedSkills(parsed, scan.departments);
    const departments = scan.departments.map((scanned) => buildDepartment(scanned, skills, git));
    const rootReadme = scan.readme?.content ?? '';

    // Everything that exists, and every markdown document whose links should resolve.
    const files = new Set<string>();
    const documents: Array<{ path: string; content: string }> = [];
    const contents = new Map<string, string>();
    if (scan.readme) {
      files.add('README.md');
      if (scan.readme.content) documents.push({ path: 'README.md', content: scan.readme.content });
    }
    for (const department of scan.departments) {
      if (department.readme) {
        files.add(department.readme.path);
        if (department.readme.content)
          documents.push({ path: department.readme.path, content: department.readme.content });
      }
      for (const skill of department.skills) {
        for (const file of [skill.skillFile, ...skill.files]) {
          files.add(file.path);
          if (file.content === null) continue;
          contents.set(file.path, file.content);
          if (file.path.endsWith('.md')) documents.push({ path: file.path, content: file.content });
        }
      }
    }

    return new LibrarySnapshot(
      root,
      rootReadme,
      skills,
      departments,
      git,
      new SkillSearchIndex(skills),
      checkHealth({ skills, departments, rootReadme, frontmatterErrors, files, documents }),
      contents,
      new Date().toISOString(),
    );
  }

  // ─── Queries ──────────────────────────────────────────────────────────────

  catalog(): Catalog {
    const summaries = this.skillList.map(toSummary);
    const referenceCount = this.skillList.reduce((total, skill) => total + skill.references.length, 0);
    const totals = sumStats(this.departmentList.map((department) => department.stats));
    return {
      readme: this.rootReadme,
      stats: {
        departments: this.departmentList.length,
        skills: this.skillList.length,
        references: referenceCount,
        words: totals.words,
        readingMinutes: totals.readingMinutes,
        lastUpdated: latest([
          ...this.departmentList.map((department) => department.updated),
          this.git.lastChange('README.md'),
        ]),
      },
      departments: this.departmentList.map(toDepartmentSummary),
      skills: summaries,
      repo: this.git.info,
      builtAt: this.builtAt,
    };
  }

  departments(): DepartmentSummary[] {
    return this.departmentList.map(toDepartmentSummary);
  }

  department(id: string): Department {
    const department = this.departmentIndex.get(id);
    if (!department) throw new NotFoundError('department', id, closest(id, [...this.departmentIndex.keys()]));
    return department;
  }

  skills(department?: string): SkillSummary[] {
    if (department !== undefined) this.department(department); // validates the id
    return this.skillList
      .filter((skill) => department === undefined || skill.department === department)
      .map(toSummary);
  }

  skill(name: string): Skill {
    const skill = this.skillIndex.get(name);
    if (!skill) {
      const fromSearch = this.search(name, { limit: 3 }).map((hit) => hit.name);
      const suggestions = [...new Set([...closest(name, [...this.skillIndex.keys()]), ...fromSearch])].slice(
        0,
        3,
      );
      throw new NotFoundError('skill', name, suggestions);
    }
    return skill;
  }

  /** A text file bundled with a skill, looked up by its exact manifest path. */
  file(skillName: string, filePath: string): { file: ReferenceFile; content: string } {
    const skill = this.skill(skillName);
    const normalised = filePath.replace(/^\.?\//, '');
    const file = skill.references.find((reference) => reference.path === normalised);
    const content = file ? this.contents.get(`${skill.path}/${file.path}`) : undefined;
    if (!file || content === undefined) {
      const available = skill.references
        .filter((reference) => reference.isText)
        .map((reference) => reference.path);
      throw new NotFoundError('file', `${skillName}/${normalised}`, available);
    }
    return { file, content };
  }

  search(query: string, options?: SearchOptions): SearchHit[] {
    return this.searchIndex.search(query, options);
  }

  health(): HealthReport {
    return this.healthReport;
  }

  /** Recent commits that touched library content, mapped onto skills and departments. */
  activity(limit = 50): GitCommit[] {
    const skillByDir = new Map(this.skillList.map((skill) => [`${skill.path}/`, skill]));
    const departmentIds = new Set(this.departmentList.map((department) => department.id));
    const commits: GitCommit[] = [];

    for (const record of this.git.commits) {
      const content = record.files.filter(
        (file) => file === 'README.md' || departmentIds.has(file.split('/')[0]!),
      );
      if (content.length === 0) continue;

      const skills = new Set<string>();
      const departments = new Set<string>();
      for (const file of content) {
        const department = file.split('/')[0]!;
        if (departmentIds.has(department)) departments.add(department);
        for (const [dir, skill] of skillByDir) if (file.startsWith(dir)) skills.add(skill.name);
      }
      commits.push({ ...record, files: content, skills: [...skills], departments: [...departments] });
      if (commits.length >= limit) break;
    }
    return commits;
  }
}

// ─── Parsing ────────────────────────────────────────────────────────────────

function parseSkill(scanned: ScannedSkill, git: GitHistory, errors: Map<string, string>): Skill {
  const raw = scanned.skillFile.content ?? '';
  const { data, body, present, error } = parseFrontmatter(raw);
  if (error) errors.set(scanned.name, `Frontmatter is not valid YAML: ${error}`);
  else if (!present)
    errors.set(scanned.name, 'SKILL.md has no frontmatter block (`---` with `name` and `description`).');

  const description = typeof data['description'] === 'string' ? data['description'].trim() : '';
  const references = scanned.files.map((file): ReferenceFile => {
    const relative = file.path.slice(scanned.dir.length + 1);
    const name = relative.split('/').at(-1)!;
    return {
      path: relative,
      name,
      isText: file.content !== null,
      stats: file.content !== null ? docStats(file.content) : { ...docStats(''), bytes: file.bytes },
      headings: file.content !== null && /\.mdx?$/.test(name) ? extractHeadings(file.content) : [],
      mentionedInSkill: raw.includes(relative) || raw.includes(name),
      updated: git.lastChange(file.path),
    };
  });

  const history = git.historyOf(`${scanned.dir}/`, SKILL_HISTORY_LIMIT);
  return {
    name: scanned.name,
    department: scanned.department,
    description,
    title: firstH1(body) ?? scanned.name,
    path: scanned.dir,
    optIn: OPT_IN_PATTERN.test(description),
    stats: docStats(body),
    referenceCount: references.length,
    updated: history[0] ?? null,
    frontmatter: data,
    body,
    raw,
    headings: extractHeadings(body),
    references,
    related: { outgoing: [], incoming: [] },
    history,
    absolutePath: scanned.skillFile.absolutePath.replace(/[\\/]SKILL\.md$/, ''),
  };
}

/**
 * Finds which skills mention which by name, across SKILL.md and bundled text.
 * Names are distinctive hyphenated slugs, so a whole-token match is reliable.
 */
function linkRelatedSkills(skills: Skill[], departments: ScannedDepartment[]): Skill[] {
  const textOf = new Map<string, string>();
  for (const department of departments) {
    for (const scanned of department.skills) {
      const bundled = scanned.files.map((file) => file.content ?? '').join('\n');
      textOf.set(scanned.name, `${scanned.skillFile.content ?? ''}\n${bundled}`);
    }
  }

  const ref = (skill: Skill): SkillRef => ({ name: skill.name, department: skill.department });
  const patterns = new Map(
    skills.map((skill) => [skill.name, new RegExp(`(?<![\\w-])${escapeRegExp(skill.name)}(?![\\w-])`)]),
  );

  for (const source of skills) {
    const text = textOf.get(source.name) ?? '';
    for (const target of skills) {
      if (target.name === source.name || !patterns.get(target.name)!.test(text)) continue;
      source.related.outgoing.push(ref(target));
      target.related.incoming.push(ref(source));
    }
  }
  return skills;
}

function buildDepartment(scanned: ScannedDepartment, skills: readonly Skill[], git: GitHistory): Department {
  const own = skills.filter((skill) => skill.department === scanned.id);
  const readme = scanned.readme?.content ?? '';
  const titleFromId = scanned.id.replace(/[-_]+/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());
  const skillFiles = scanned.skills.flatMap((skill) => [skill.skillFile, ...skill.files]);

  return {
    id: scanned.id,
    title: firstH1(readme) ?? titleFromId,
    summary: firstParagraph(readme),
    path: scanned.dir,
    skillNames: own.map((skill) => skill.name),
    stats: sumStats(
      skillFiles.filter((file) => file.content !== null).map((file) => docStats(file.content!)),
    ),
    hasReadme: scanned.readme !== null,
    updated: git.lastChange(`${scanned.id}/`),
    readme,
    readmeHeadings: extractHeadings(readme),
    skills: own.map(toSummary),
  };
}

// ─── Projections ────────────────────────────────────────────────────────────

export function toSummary(skill: Skill): SkillSummary {
  const { name, department, description, title, path, optIn, stats, referenceCount, updated } = skill;
  return { name, department, description, title, path, optIn, stats, referenceCount, updated };
}

function toDepartmentSummary(department: Department): DepartmentSummary {
  const { id, title, summary, path, skillNames, stats, hasReadme, updated } = department;
  return { id, title, summary, path, skillNames, stats, hasReadme, updated };
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function latest(stamps: Array<GitStamp | null>): GitStamp | null {
  return stamps.reduce<GitStamp | null>(
    (best, stamp) => (stamp && (!best || stamp.date > best.date) ? stamp : best),
    null,
  );
}

/** Candidates within a small edit distance of `input`, or containing it, best first. */
export function closest(input: string, candidates: readonly string[], max = 3): string[] {
  const needle = input.toLowerCase();
  return candidates
    .map((candidate) => ({ candidate, distance: editDistance(needle, candidate.toLowerCase()) }))
    .filter(
      ({ candidate, distance }) => distance <= Math.max(2, needle.length / 3) || candidate.includes(needle),
    )
    .sort((a, b) => a.distance - b.distance)
    .slice(0, max)
    .map(({ candidate }) => candidate);
}

function editDistance(a: string, b: string): number {
  let previous = Array.from({ length: b.length + 1 }, (_, index) => index);
  for (let i = 1; i <= a.length; i++) {
    const current = [i];
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      current[j] = Math.min(previous[j]! + 1, current[j - 1]! + 1, previous[j - 1]! + cost);
    }
    previous = current;
  }
  return previous[b.length]!;
}
