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

    return results.slice(0, limit).flatMap((result) => {
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

/** Picks the highest-precedence field that matched, and returns its text. */
function bestField(skill: Skill, match: Record<string, string[]>): [SearchField, string] {
  const matched = new Set(Object.values(match).flat());
  const texts: Record<keyof typeof BOOST, string> = {
    name: skill.name,
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
  const flat = text.replace(/\s+/g, ' ').trim();
  const lower = flat.toLowerCase();
  const positions = terms.map((term) => lower.indexOf(term.toLowerCase())).filter((at) => at >= 0);
  const at = positions.length > 0 ? Math.min(...positions) : 0;

  let start = Math.max(0, at - SNIPPET_RADIUS);
  let end = Math.min(flat.length, at + SNIPPET_RADIUS * 1.5);
  if (start > 0) start = flat.indexOf(' ', start) + 1 || start;
  if (end < flat.length) end = flat.lastIndexOf(' ', end) || end;

  return `${start > 0 ? '…' : ''}${flat.slice(start, end).trim()}${end < flat.length ? '…' : ''}`;
}
