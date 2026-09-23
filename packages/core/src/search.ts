/**
 * Full-text search over skills, shared by the MCP `search_skills` tool and the
 * dashboard's command palette.
 *
 * Ranking favours where a term appears: a hit in the name beats one in the
 * description, which beats a heading, which beats body text. Prefix and light
 * fuzzy matching make partial words and small typos still find the skill.
 */
import MiniSearch from 'minisearch';

import type { SearchField, SearchHit, Skill } from './types.js';

interface IndexedSkill {
  id: string;
  name: string;
  department: string;
  description: string;
  headings: string;
  body: string;
}

/** Field boosts. The name is short and precise, so it counts most. */
const BOOST = { name: 6, description: 3, headings: 2, body: 1 };

/** Field precedence when choosing which match to show as the snippet. */
const FIELD_ORDER: Array<[keyof typeof BOOST, SearchField]> = [
  ['name', 'name'],
  ['description', 'description'],
  ['headings', 'heading'],
  ['body', 'body'],
];

const SNIPPET_RADIUS = 90;

/** Hits scoring under this share of the best hit are noise (a stray word deep in a body). */
const MIN_RELATIVE_SCORE = 0.02;

/**
 * Words too common to rank on. Without this, "cold email for a loom video" matches
 * every skill through "for" and "a", and the useful hits drown in the tail.
 */
const STOP_WORDS = new Set(
  (
    'a an and are as at be but by can do for from has have how i if in into is it its me my no not of on or ' +
    'our so than that the their them then there these this to up us use was we what when which who will with ' +
    'you your'
  ).split(' '),
);

/** Lowercases a token and drops stop words (MiniSearch skips terms mapped to null). */
function processTerm(term: string): string | null {
  const lower = term.toLowerCase();
  return STOP_WORDS.has(lower) ? null : lower;
}

export interface SearchOptions {
  department?: string;
  limit?: number;
}

export class SkillSearchIndex {
  private readonly index: MiniSearch<IndexedSkill>;
  private readonly skills: Map<string, Skill>;

  constructor(skills: readonly Skill[]) {
    this.skills = new Map(skills.map((skill) => [skill.name, skill]));
    this.index = new MiniSearch<IndexedSkill>({
      fields: ['name', 'description', 'headings', 'body'],
      // Treat hyphens as word breaks so `youtube-title` matches "title".
      tokenize: (text) => text.split(/[\s\-_/.,;:!?()[\]{}"'`*#|>]+/u).filter(Boolean),
      processTerm,
    });
    this.index.addAll(
      skills.map((skill) => ({
        id: skill.name,
        name: skill.name,
        department: skill.department,
        description: skill.description,
        headings: skill.headings.map((heading) => heading.text).join('\n'),
        body: skill.body,
      })),
    );
  }

  search(query: string, { department, limit = 20 }: SearchOptions = {}): SearchHit[] {
    if (query.trim() === '') return [];

    const results = this.index.search(query, {
      boost: BOOST,
      prefix: (term) => term.length >= 3,
      fuzzy: (term) => (term.length >= 5 ? 0.2 : false),
      combineWith: 'OR',
      filter: department ? (result) => this.skills.get(result.id)?.department === department : undefined,
    });

    const floor = (results[0]?.score ?? 0) * MIN_RELATIVE_SCORE;
    return results
      .filter((result) => result.score >= floor)
      .slice(0, limit)
      .flatMap((result) => {
        const skill = this.skills.get(result.id as string);
        if (!skill) return [];

        const [field, text] = bestField(skill, result.match);
        return [
          {
            name: skill.name,
            department: skill.department,
            title: skill.title,
            description: skill.description,
            score: Math.round(result.score * 100) / 100,
            field,
            snippet: snippet(text, result.terms),
            terms: result.terms,
          },
        ];
      });
  }
}

// ─── Snippets ───────────────────────────────────────────────────────────────

/**
 * Picks the highest-precedence field that matched, and the text to excerpt. A name
 * match excerpts the description instead: the name is already shown with every hit.
 */
function bestField(skill: Skill, match: Record<string, string[]>): [SearchField, string] {
  const matched = new Set(Object.values(match).flat());
  const texts: Record<keyof typeof BOOST, string> = {
    name: skill.description,
    description: skill.description,
    headings: skill.headings.map((heading) => heading.text).join(' · '),
    body: skill.body,
  };
  for (const [key, field] of FIELD_ORDER) {
    if (matched.has(key)) return [field, texts[key]];
  }
  return ['description', skill.description];
}

/** A window of text centred on the first matched term, cut at word boundaries. */
export function snippet(text: string, terms: readonly string[]): string {
  const flat = plainText(text);
  const lower = flat.toLowerCase();
  const positions = terms.map((term) => lower.indexOf(term.toLowerCase())).filter((at) => at >= 0);
  const at = positions.length > 0 ? Math.min(...positions) : 0;

  let start = Math.max(0, at - SNIPPET_RADIUS);
  let end = Math.min(flat.length, at + SNIPPET_RADIUS * 1.5);
  if (start > 0) start = flat.indexOf(' ', start) + 1 || start;
  if (end < flat.length) end = flat.lastIndexOf(' ', end) || end;

  return `${start > 0 ? '…' : ''}${flat.slice(start, end).trim()}${end < flat.length ? '…' : ''}`;
}

/** Markdown reduced to readable prose, so excerpts show words rather than syntax. */
function plainText(markdown: string): string {
  return markdown
    .replace(/^\s{0,3}(#{1,6}|>|[-*+]|\d+\.)\s+/gm, '') // headings, quotes, list markers
    .replace(/^\s*(\|?\s*:?-{3,}:?\s*)+\|?\s*$/gm, '') // table separators and rules
    .replace(/!?\[([^\]]*)\]\([^)]*\)/g, '$1') // links and images → text
    .replace(/(\*\*|__|`)/g, '') // bold and code markers
    .replace(/\s*\|\s*/g, ' · ') // table cells
    .replace(/\s+/g, ' ')
    .trim();
}
