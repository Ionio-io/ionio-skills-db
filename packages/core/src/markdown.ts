/**
 * Markdown helpers: frontmatter, headings, links, summaries and size stats.
 *
 * These are deliberately line-based rather than a full markdown AST. Skill files
 * are plain prose with ATX headings, so a small parser that understands code
 * fences is accurate here and keeps the core free of heavy dependencies.
 */
import GithubSlugger from 'github-slugger';
import { parse as parseYaml } from 'yaml';

import type { DocStats, Heading } from './types.js';

// ─── Frontmatter ────────────────────────────────────────────────────────────

export interface Frontmatter {
  data: Record<string, unknown>;
  /** Markdown after the closing `---`. The whole input when there is no block. */
  body: string;
  /** Whether the document opened with a frontmatter block at all. */
  present: boolean;
  /** YAML parse error message, if the block exists but is invalid. */
  error?: string;
}

const FRONTMATTER = /^---\r?\n([\s\S]*?)\r?\n---[ \t]*(?:\r?\n|$)/;

/** Splits a document into its YAML frontmatter and markdown body. */
export function parseFrontmatter(raw: string): Frontmatter {
  const match = FRONTMATTER.exec(raw);
  if (!match) return { data: {}, body: raw, present: false };

  const body = raw.slice(match[0].length).replace(/^\s*\n/, '');
  try {
    const parsed: unknown = parseYaml(match[1] ?? '');
    const data = isRecord(parsed) ? parsed : {};
    return { data, body, present: true };
  } catch (error) {
    return { data: {}, body, present: true, error: (error as Error).message };
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

// ─── Line scanning ──────────────────────────────────────────────────────────

/**
 * Yields each line that is outside a fenced code block, with its index.
 * Headings and links inside code samples are not part of the document outline.
 */
function* proseLines(markdown: string): Generator<[line: string, index: number]> {
  const lines = markdown.split(/\r?\n/);
  let fence: string | null = null;

  for (const [index, line] of lines.entries()) {
    const marker = /^\s*(`{3,}|~{3,})/.exec(line)?.[1];
    if (marker) {
      if (fence === null) fence = marker[0]!;
      else if (marker[0] === fence) fence = null;
      continue;
    }
    if (fence === null) yield [line, index];
  }
}

// ─── Inline text ────────────────────────────────────────────────────────────

/** Reduces inline markdown to the plain text a reader would see. */
export function stripInline(text: string): string {
  return text
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, '$1') // images → alt text
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1') // links → label
    .replace(/`([^`]*)`/g, '$1') // inline code
    .replace(/(\*\*|__)(.*?)\1/g, '$2') // bold
    .replace(/(^|[^\w*])[*_]([^*_\n]+)[*_](?=[^\w*]|$)/g, '$1$2') // italics
    .replace(/<[^>]+>/g, '') // inline html
    .replace(/\s+/g, ' ')
    .trim();
}

// ─── Headings ───────────────────────────────────────────────────────────────

const ATX_HEADING = /^(#{1,6})[ \t]+(.+?)[ \t]*#*[ \t]*$/;

/**
 * Extracts ATX headings with slugs that match what the dashboard renders.
 * One slugger per document mirrors `rehype-slug`, including `-1` suffixes on repeats.
 */
export function extractHeadings(markdown: string): Heading[] {
  const slugger = new GithubSlugger();
  const headings: Heading[] = [];

  for (const [line] of proseLines(markdown)) {
    const match = ATX_HEADING.exec(line);
    if (!match) continue;
    const text = stripInline(match[2]!);
    headings.push({ depth: match[1]!.length, text, slug: slugger.slug(text) });
  }
  return headings;
}

/** The text of the first H1, if the document has one. */
export function firstH1(markdown: string): string | undefined {
  return extractHeadings(markdown).find((heading) => heading.depth === 1)?.text;
}

// ─── Summaries ──────────────────────────────────────────────────────────────

/**
 * The first prose paragraph of a document: skips headings, tables, lists,
 * quotes, rules and code, and returns the paragraph as plain text.
 */
export function firstParagraph(markdown: string): string {
  const paragraph: string[] = [];

  for (const [line] of proseLines(markdown)) {
    const trimmed = line.trim();
    const isProse = trimmed !== '' && !/^(#|\||[-*+] |\d+\. |>|---|\*\*\*|<)/.test(trimmed);

    if (isProse) paragraph.push(trimmed);
    else if (paragraph.length > 0) break;
  }
  return stripInline(paragraph.join(' '));
}

// ─── Links ──────────────────────────────────────────────────────────────────

export interface MarkdownLink {
  label: string;
  /** Link target without any `#anchor`. */
  target: string;
  line: number;
}

const INLINE_LINK = /!?\[([^\]]*)\]\(\s*<?([^)\s>]+)>?(?:\s+"[^"]*")?\s*\)/g;

/** Local (relative) link targets in a document: the ones that can break. */
export function extractLocalLinks(markdown: string): MarkdownLink[] {
  const links: MarkdownLink[] = [];

  for (const [line, index] of proseLines(markdown)) {
    for (const match of line.matchAll(INLINE_LINK)) {
      const href = match[2]!;
      if (/^([a-z][a-z0-9+.-]*:|#|\/\/)/i.test(href)) continue; // external, anchors
      const target = decodeURI(href.split('#')[0]!);
      if (target) links.push({ label: stripInline(match[1]!), target, line: index + 1 });
    }
  }
  return links;
}

// ─── Stats ──────────────────────────────────────────────────────────────────

const WORDS_PER_MINUTE = 230;

export function docStats(text: string): DocStats {
  const words = text.match(/\S+/g)?.length ?? 0;
  return {
    words,
    lines: text === '' ? 0 : text.split(/\r?\n/).length,
    bytes: Buffer.byteLength(text, 'utf8'),
    readingMinutes: Math.max(1, Math.ceil(words / WORDS_PER_MINUTE)),
  };
}

/** Adds several stats together, recomputing reading time from the word total. */
export function sumStats(all: DocStats[]): DocStats {
  const words = all.reduce((total, stats) => total + stats.words, 0);
  return {
    words,
    lines: all.reduce((total, stats) => total + stats.lines, 0),
    bytes: all.reduce((total, stats) => total + stats.bytes, 0),
    readingMinutes: words === 0 ? 0 : Math.max(1, Math.ceil(words / WORDS_PER_MINUTE)),
  };
}
