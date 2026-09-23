/**
 * The server's `instructions`: what a client shows the model when it connects.
 *
 * Hosts such as Claude Code put these into the model's context once per session,
 * so they double as the first level of progressive disclosure: a compact catalog
 * the model can pick from without spending a tool call. It stays short: one
 * trimmed line per skill, and past a size cap it defers to `list_skills`.
 */
import type { LibrarySnapshot } from '@ionio-skills/core';

/** Above this many skills the catalog is left out and the model lists on demand. */
const MAX_CATALOG_SKILLS = 60;
const MAX_LINE_DESCRIPTION = 150;

export function buildInstructions(snapshot: LibrarySnapshot): string {
  const { stats } = snapshot.catalog();
  const lines = [
    `Ionio's skills library: ${stats.skills} skills across ${stats.departments} departments. ` +
      'Each skill is a SKILL.md of instructions for one kind of task.',
    '',
    'How to use it:',
    '1. Find the skill for your task in the catalog below, or with search_skills or list_skills.',
    '2. Call get_skill with its name before starting the task, then follow the instructions it returns.',
    '3. Call get_skill_file only for bundled files those instructions tell you to read.',
    'Skills marked (opt-in) apply only when the user explicitly asks for them.',
  ];

  if (stats.skills <= MAX_CATALOG_SKILLS) {
    lines.push('', 'Catalog:');
    for (const department of snapshot.departments()) {
      lines.push(`${department.title} (${department.id}):`);
      for (const skill of snapshot.skills(department.id)) {
        lines.push(`- ${skill.name}${skill.optIn ? ' (opt-in)' : ''}: ${firstSentence(skill.description)}`);
      }
    }
  } else {
    lines.push('', 'Call list_departments or list_skills to see the catalog.');
  }
  return lines.join('\n');
}

/** The description's first sentence, trimmed to a line. */
function firstSentence(description: string): string {
  const sentence = /^.+?[.!?](?=\s|$)/.exec(description)?.[0] ?? description;
  return sentence.length <= MAX_LINE_DESCRIPTION
    ? sentence
    : `${sentence.slice(0, MAX_LINE_DESCRIPTION - 1).trimEnd()}…`;
}
