/**
 * MCP tools: the model-facing way into the library.
 *
 * The set follows progressive disclosure, so an agent only pays context for what
 * its task needs:
 *   1. discover   list_skills · list_departments · search_skills   (one line per skill)
 *   2. load       get_skill                                        (full SKILL.md + file manifest)
 *   3. drill in   get_skill_file · get_ledger                      (one file at a time)
 *
 * Every tool is read-only. Handlers throw `NotFoundError` for unknown names; the
 * SDK turns that into an `isError` result whose text carries "Did you mean…"
 * suggestions, so the agent can correct itself without another listing call.
 */
import type { McpServer, ToolAnnotations } from '@modelcontextprotocol/server';
import * as z from 'zod/v4';

import {
  renderDepartments,
  renderLedger,
  renderSearch,
  renderSkillList,
  renderSkillManifest,
} from './render.js';
import type { SnapshotSource } from './server.js';

/** All tools only read from the library, and the library is a closed world. */
const READ_ONLY: ToolAnnotations = { readOnlyHint: true, idempotentHint: true, openWorldHint: false };

const text = (value: string) => ({ type: 'text' as const, text: value });

// ─── Shared argument schemas ────────────────────────────────────────────────

const skillName = z
  .string()
  .min(1)
  .describe('Exact skill name, e.g. `youtube-title`. Names come from list_skills or search_skills.');

const departmentId = z
  .string()
  .min(1)
  .describe('Department folder id, e.g. `sales`. Ids come from list_departments.');

// ─── Registration ───────────────────────────────────────────────────────────

export function registerTools(server: McpServer, snapshot: SnapshotSource): void {
  server.registerTool(
    'list_skills',
    {
      title: 'List skills',
      description:
        'List the skills in the library, grouped by department, with the description that says when to use each one. ' +
        'Call this when you need a skill but do not know its exact name. Pass `department` to narrow the list.',
      inputSchema: z.object({ department: departmentId.optional() }),
      annotations: READ_ONLY,
    },
    async ({ department }) => {
      const current = await snapshot();
      return { content: [text(renderSkillList(current.skills(department), current.departments()))] };
    },
  );

  server.registerTool(
    'list_departments',
    {
      title: 'List departments',
      description:
        'List the departments (business areas such as sales or youtube) with a one-line summary and the skills in each. ' +
        'A cheap overview of what the library covers.',
      annotations: READ_ONLY,
    },
    async () => ({ content: [text(renderDepartments((await snapshot()).departments()))] }),
  );

  server.registerTool(
    'search_skills',
    {
      title: 'Search skills',
      description:
        'Full-text search across skill names, descriptions, headings and instructions. Returns ranked matches with a snippet ' +
        'showing where each matched. Use it to find the right skill for a task described in your own words.',
      inputSchema: z.object({
        query: z.string().min(1).describe('Words describing the task, e.g. "cold email for a loom video".'),
        department: departmentId.optional(),
        limit: z.number().int().min(1).max(25).optional().describe('Maximum results. Default 8.'),
      }),
      annotations: READ_ONLY,
    },
    async ({ query, department, limit }) => {
      const current = await snapshot();
      if (department) current.department(department); // unknown ids fail with suggestions
      return {
        content: [text(renderSearch(query, current.search(query, { department, limit: limit ?? 8 })))],
      };
    },
  );

  server.registerTool(
    'get_skill',
    {
      title: 'Get skill',
      description:
        "Load a skill's full instructions (its SKILL.md) before doing the task it covers, then follow them. " +
        'The result ends with a manifest of bundled files; fetch those with get_skill_file only when the instructions point to them.',
      inputSchema: z.object({ name: skillName }),
      annotations: READ_ONLY,
    },
    async ({ name }) => {
      const skill = (await snapshot()).skill(name);
      return { content: [text(skill.raw), text(renderSkillManifest(skill))] };
    },
  );

  server.registerTool(
    'get_skill_file',
    {
      title: 'Get skill file',
      description:
        "Read one file bundled with a skill, such as `references/title-bank.md`. Paths come from get_skill's manifest. " +
        'Load these only when the skill instructions ask for them.',
      inputSchema: z.object({
        name: skillName,
        path: z.string().min(1).describe('Path inside the skill folder, exactly as listed in the manifest.'),
      }),
      annotations: READ_ONLY,
    },
    async ({ name, path }) => ({ content: [text((await snapshot()).file(name, path).content)] }),
  );

  server.registerTool(
    'get_ledger',
    {
      title: 'Get ledger',
      description:
        "Read a department's README ledger: its table of skills, how they fit together, dependencies and conventions. " +
        'Omit `department` to read the root index of the whole library, including how to add a skill.',
      inputSchema: z.object({ department: departmentId.optional() }),
      annotations: READ_ONLY,
    },
    async ({ department }) => {
      const current = await snapshot();
      const ledger = department ? renderLedger(current.department(department)) : current.rootReadme;
      return { content: [text(ledger || 'The library has no root README.')] };
    },
  );
}
