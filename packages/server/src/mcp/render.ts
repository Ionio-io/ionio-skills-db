/**
 * Renders library data as compact markdown for tool results.
 *
 * Agents read tool output as text, so every renderer aims for the fewest tokens
 * that still let the agent take its next step: names it can pass straight back
 * into another tool, and a hint about which tool that is.
 */
import type { Department, DepartmentSummary, SearchHit, Skill, SkillSummary } from '@ionio-skills/core';

import { fileUri } from './uris.js';

export function renderSkillList(
  skills: readonly SkillSummary[],
  departments: readonly DepartmentSummary[],
): string {
  if (skills.length === 0) return 'No skills found.';

  const sections = departments
    .map((department) => ({
      department,
      skills: skills.filter((skill) => skill.department === department.id),
    }))
    .filter((group) => group.skills.length > 0)
    .map(({ department, skills: group }) =>
      [`## ${department.title} (\`${department.id}\`)`, ...group.map(renderSkillLine)].join('\n'),
    );

  return [
    `${skills.length} skill${skills.length === 1 ? '' : 's'}. Load one with \`get_skill\` before doing its task.`,
    ...sections,
  ].join('\n\n');
}

function renderSkillLine(skill: SkillSummary): string {
  const tags = [
    skill.optIn && 'opt-in only',
    skill.referenceCount > 0 &&
      `${skill.referenceCount} bundled file${skill.referenceCount === 1 ? '' : 's'}`,
  ]
    .filter(Boolean)
    .join(', ');
  return `- **${skill.name}**${tags ? ` _(${tags})_` : ''}: ${skill.description}`;
}

export function renderDepartments(departments: readonly DepartmentSummary[]): string {
  return departments
    .map((department) =>
      [
        `## ${department.title} (\`${department.id}\`)`,
        department.summary,
        `Skills: ${department.skillNames.map((name) => `\`${name}\``).join(', ') || 'none yet'}`,
      ]
        .filter(Boolean)
        .join('\n'),
    )
    .join('\n\n');
}

/** Everything around a skill's instructions: where it lives and what else it bundles. */
export function renderSkillManifest(skill: Skill): string {
  const lines = [`Skill \`${skill.name}\` · department \`${skill.department}\` · ${skill.stats.words} words`];
  if (skill.optIn) {
    lines.push('This skill is opt-in only: apply it only because the user explicitly asked for it.');
  }

  const files = skill.references.filter((reference) => reference.isText);
  if (files.length > 0) {
    lines.push(
      '',
      'Bundled files. Read one with `get_skill_file` only when the instructions point to it:',
      ...files.map(
        (file) => `- \`${file.path}\` (${file.stats.words} words) · ${fileUri(skill.name, file.path)}`,
      ),
    );
  }

  const related = skill.related.outgoing.map((ref) => `\`${ref.name}\``);
  if (related.length > 0) lines.push('', `Skills this one refers to: ${related.join(', ')}.`);
  return lines.join('\n');
}

export function renderSearch(query: string, hits: readonly SearchHit[]): string {
  if (hits.length === 0) {
    return `No skills match "${query}". Try fewer or broader words, or call \`list_skills\` to browse.`;
  }
  return [
    `${hits.length} result${hits.length === 1 ? '' : 's'} for "${query}", best first:`,
    ...hits.map(
      (hit, index) =>
        `${index + 1}. **${hit.name}** (\`${hit.department}\`, matched in ${hit.field}): ${hit.snippet}`,
    ),
    '',
    'Load the best match with `get_skill`.',
  ].join('\n');
}

export function renderLedger(department: Department): string {
  return department.readme || `The \`${department.id}\` department has no README ledger yet.`;
}
