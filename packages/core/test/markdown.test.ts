import { describe, expect, it } from 'vitest';

import {
  docStats,
  extractHeadings,
  extractLocalLinks,
  firstParagraph,
  parseFrontmatter,
  stripInline,
} from '../src/markdown.js';

describe('parseFrontmatter', () => {
  it('splits YAML frontmatter from the body', () => {
    const result = parseFrontmatter('---\nname: a\ndescription: b\n---\n\n# Title\n');
    expect(result).toMatchObject({ present: true, data: { name: 'a', description: 'b' }, body: '# Title\n' });
  });

  it('reports invalid YAML instead of throwing', () => {
    const result = parseFrontmatter('---\ndescription: x: y: z\n---\nbody');
    expect(result.present).toBe(true);
    expect(result.error).toBeTruthy();
    expect(result.body).toBe('body');
  });

  it('treats a document without a block as all body', () => {
    expect(parseFrontmatter('# Just markdown')).toMatchObject({
      present: false,
      data: {},
      body: '# Just markdown',
    });
  });
});

describe('extractHeadings', () => {
  it('ignores headings inside code fences and dedupes slugs like rehype-slug', () => {
    const headings = extractHeadings('# Top\n```\n# fake\n```\n## Same\n## Same\n### `code` and **bold**');
    expect(headings).toEqual([
      { depth: 1, text: 'Top', slug: 'top' },
      { depth: 2, text: 'Same', slug: 'same' },
      { depth: 2, text: 'Same', slug: 'same-1' },
      { depth: 3, text: 'code and bold', slug: 'code-and-bold' },
    ]);
  });
});

describe('firstParagraph', () => {
  it('returns the first prose paragraph as plain text', () => {
    expect(firstParagraph('# Title\n\n| a | b |\n\nSome **bold** [link](x.md)\ncontinues.\n\nNext.')).toBe(
      'Some bold link continues.',
    );
  });
});

describe('extractLocalLinks', () => {
  it('keeps relative links and drops external ones, anchors and code', () => {
    const links = extractLocalLinks(
      '[a](a.md) [b](https://x.com) [c](#top) [d](../d/SKILL.md#part)\n```\n[e](e.md)\n```',
    );
    expect(links.map((link) => link.target)).toEqual(['a.md', '../d/SKILL.md']);
  });
});

describe('stripInline and docStats', () => {
  it('reduces inline markdown to text', () => {
    expect(stripInline('**Bold** _it_ `code` [l](u) ![alt](i.png)')).toBe('Bold it code l alt');
  });

  it('counts words, lines and reading time', () => {
    expect(docStats('one two\nthree')).toEqual({ words: 3, lines: 2, bytes: 13, readingMinutes: 1 });
  });
});
