import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { LibrarySnapshot, NotFoundError } from '../src/index.js';
import { createFixture } from './fixture.js';

let snapshot: LibrarySnapshot;
let cleanup: () => Promise<void>;

beforeAll(async () => {
  const fixture = await createFixture();
  cleanup = fixture.cleanup;
  snapshot = await LibrarySnapshot.build(fixture.root);
});
afterAll(() => cleanup());

describe('discovery', () => {
  it('finds departments and skills, skipping reserved, hidden and private folders', () => {
    const catalog = snapshot.catalog();
    expect(catalog.departments.map((department) => department.id)).toEqual(['design', 'writing']);
    expect(catalog.skills.map((skill) => skill.name).sort()).toEqual([
      'alpha-writer',
      'beta-editor',
      'delta-broken',
      'gamma-grid',
    ]);
    expect(catalog.stats).toMatchObject({ departments: 2, skills: 4, references: 3, lastUpdated: null });
    expect(catalog.repo.branch).toBeNull();
  });

  it('reads department titles and summaries from the ledger', () => {
    const writing = snapshot.department('writing');
    expect(writing).toMatchObject({
      title: 'Writing',
      summary: 'Skills for words that ship. Second sentence here.',
      hasReadme: true,
    });
    expect(snapshot.department('design')).toMatchObject({ title: 'Design', hasReadme: false, summary: '' });
  });
});

describe('skills', () => {
  it('parses frontmatter, title, headings and references', () => {
    const alpha = snapshot.skill('alpha-writer');
    expect(alpha.title).toBe('Alpha Writer');
    expect(alpha.description).toMatch(/^Drafts persuasive/);
    expect(alpha.headings.map((heading) => heading.slug)).toEqual(['alpha-writer', 'step-one', 'step-one-1']);
    expect(alpha.references.map((reference) => [reference.path, reference.mentionedInSkill])).toEqual([
      ['references/guide.md', true],
      ['references/unused.md', false],
    ]);
  });

  it('flags opt-in skills from their description', () => {
    expect(snapshot.skill('beta-editor').optIn).toBe(true);
    expect(snapshot.skill('alpha-writer').optIn).toBe(false);
  });

  it('links skills that mention each other', () => {
    expect(snapshot.skill('alpha-writer').related.outgoing).toEqual([
      { name: 'beta-editor', department: 'writing' },
    ]);
    expect(snapshot.skill('beta-editor').related.incoming).toEqual([
      { name: 'alpha-writer', department: 'writing' },
    ]);
  });

  it('marks binary files as non-text', () => {
    expect(snapshot.skill('delta-broken').references).toMatchObject([{ path: 'logo.png', isText: false }]);
  });
});

describe('lookups', () => {
  it('suggests close names when a skill is missing', () => {
    expect(() => snapshot.skill('alpha-writr')).toThrow(NotFoundError);
    try {
      snapshot.skill('alpha-writr');
    } catch (error) {
      expect((error as NotFoundError).suggestions[0]).toBe('alpha-writer');
    }
  });

  it('serves bundled files by manifest path only', () => {
    expect(snapshot.file('alpha-writer', 'references/guide.md').content).toContain('Headline patterns');
    expect(snapshot.file('alpha-writer', './references/guide.md').file.name).toBe('guide.md');
    expect(() => snapshot.file('alpha-writer', '../beta-editor/SKILL.md')).toThrow(NotFoundError);
    expect(() => snapshot.file('alpha-writer', '../../../../etc/passwd')).toThrow(NotFoundError);
    expect(() => snapshot.file('delta-broken', 'logo.png')).toThrow(NotFoundError);
  });

  it('validates department filters', () => {
    expect(snapshot.skills('writing').map((skill) => skill.name)).toEqual(['alpha-writer', 'beta-editor']);
    expect(() => snapshot.skills('wrting')).toThrow(/Did you mean `writing`/);
  });
});

describe('search', () => {
  it('ranks name and description matches first and returns snippets', () => {
    const hits = snapshot.search('headlines');
    expect(hits[0]).toMatchObject({ name: 'alpha-writer', field: 'description' });
    expect(hits[0]!.snippet).toContain('headlines');
  });

  it('matches word prefixes and filters by department', () => {
    expect(snapshot.search('carous').map((hit) => hit.name)).toEqual(['gamma-grid']);
    expect(snapshot.search('carousels', { department: 'writing' })).toEqual([]);
  });
});

describe('health', () => {
  const codes = () =>
    snapshot.health().issues.map((issue) => `${issue.code}:${issue.skill ?? issue.department ?? issue.file}`);

  it('reports every class of problem in the fixture', () => {
    expect(codes()).toEqual(
      expect.arrayContaining([
        'frontmatter-invalid:delta-broken',
        'name-mismatch:gamma-grid',
        'ledger-missing:design',
        'index-unlisted:gamma-grid',
        'index-count:README.md',
        'broken-link:beta-editor',
        'reference-unmentioned:alpha-writer',
      ]),
    );
  });

  it('does not flag links inside code fences or listed skills', () => {
    expect(codes()).not.toContain('broken-link:alpha-writer');
    expect(codes()).not.toContain('ledger-unlisted:alpha-writer');
    expect(codes()).not.toContain('index-unlisted:beta-editor');
  });

  it('sorts errors first and counts by severity', () => {
    const { issues, counts } = snapshot.health();
    expect(issues[0]!.severity).toBe('error');
    expect(counts.error + counts.warning + counts.info).toBe(issues.length);
  });
});
