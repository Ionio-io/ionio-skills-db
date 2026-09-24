/**
 * MCP resources: the application-facing view of the library.
 *
 * Where tools let the model fetch skills itself, resources let a client (or the
 * person using it) browse and attach them as context, for example with `@` mentions
 * in Claude Code. The same documents are addressable by the `skills://` URIs in
 * `uris.ts`, and every template lists its instances and completes its variables.
 */
import { NotFoundError, type LibrarySnapshot } from '@ionio-skills/core';
import {
  ResourceNotFoundError,
  ResourceTemplate,
  type McpServer,
  type Variables,
} from '@modelcontextprotocol/server';

import type { SnapshotSource } from './server.js';
import { departmentUri, fileUri, INDEX_URI, skillUri, TEMPLATES } from './uris.js';

const MARKDOWN = 'text/markdown';

export function registerResources(server: McpServer, snapshot: SnapshotSource): void {
  // ─── Library index ────────────────────────────────────────────────────────
  server.registerResource(
    'index',
    INDEX_URI,
    {
      title: 'Library index',
      description: 'The root README: every department and skill, and the rules for adding skills.',
      mimeType: MARKDOWN,
    },
    async (uri) => ({
      contents: [{ uri: uri.href, mimeType: MARKDOWN, text: (await snapshot()).rootReadme }],
    }),
  );

  // ─── Department ledgers ───────────────────────────────────────────────────
  server.registerResource(
    'department-ledger',
    new ResourceTemplate(TEMPLATES.department, {
      list: async () => ({
        resources: (await snapshot()).departments().map((department) => ({
          uri: departmentUri(department.id),
          name: `${department.id} ledger`,
          title: `${department.title} ledger`,
          description: department.summary || undefined,
          mimeType: MARKDOWN,
        })),
      }),
      complete: {
        department: async (value) =>
          startingWith(
            value,
            (await snapshot()).departments().map((d) => d.id),
          ),
      },
    }),
    {
      title: 'Department ledger',
      description: "A department's README: its skills and how they fit together.",
      mimeType: MARKDOWN,
    },
    async (uri, variables) =>
      read(uri, async (current) => ({
        mimeType: MARKDOWN,
        text: current.department(single(variables, 'department')).readme,
      })),
  );

  // ─── Skills ───────────────────────────────────────────────────────────────
  server.registerResource(
    'skill',
    new ResourceTemplate(TEMPLATES.skill, {
      list: async () => ({
        resources: (await snapshot()).skills().map((skill) => ({
          uri: skillUri(skill.name),
          name: skill.name,
          title: skill.title,
          description: skill.description,
          mimeType: MARKDOWN,
          size: skill.stats.bytes,
        })),
      }),
      complete: {
        name: async (value) =>
          startingWith(
            value,
            (await snapshot()).skills().map((s) => s.name),
          ),
      },
    }),
    {
      title: 'Skill',
      description: "A skill's SKILL.md: frontmatter and full instructions.",
      mimeType: MARKDOWN,
    },
    async (uri, variables) =>
      read(uri, async (current) => ({
        mimeType: MARKDOWN,
        text: current.skill(single(variables, 'name')).raw,
      })),
  );

  // ─── Bundled files ────────────────────────────────────────────────────────
  server.registerResource(
    'skill-file',
    new ResourceTemplate(TEMPLATES.file, {
      list: async () => {
        const current = await snapshot();
        const resources = current.skills().flatMap((summary) =>
          textFilesOf(current, summary.name).map((file) => ({
            uri: fileUri(summary.name, file.path),
            name: `${summary.name}/${file.path}`,
            description: `Bundled with the ${summary.name} skill.`,
            mimeType: mimeTypeOf(file.path),
            size: file.stats.bytes,
          })),
        );
        return { resources };
      },
      complete: {
        name: async (value) =>
          startingWith(
            value,
            (await snapshot()).skills().map((s) => s.name),
          ),
        // Completing the path uses the skill name the client has already filled in.
        path: async (value, context) => {
          const name = context?.arguments?.['name'];
          if (!name) return [];
          return startingWith(
            value,
            textFilesOf(await snapshot(), name).map((file) => file.path),
          );
        },
      },
    }),
    { title: 'Skill file', description: 'A file bundled with a skill, usually under references/.' },
    async (uri, variables) =>
      read(uri, async (current) => {
        const path = single(variables, 'path');
        return { mimeType: mimeTypeOf(path), text: current.file(single(variables, 'name'), path).content };
      }),
  );

  /** Resolves a read against the current snapshot, mapping lookup failures to "resource not found". */
  async function read(
    uri: URL,
    load: (current: LibrarySnapshot) => Promise<{ mimeType: string; text: string }>,
  ) {
    try {
      const { mimeType, text } = await load(await snapshot());
      return { contents: [{ uri: uri.href, mimeType, text }] };
    } catch (error) {
      if (error instanceof NotFoundError) throw new ResourceNotFoundError(uri.href, error.message);
      throw error;
    }
  }
}

// ─── Helpers ────────────────────────────────────────────────────────────────

/** The servable (text) files bundled with a skill; none when the skill is unknown. */
function textFilesOf(current: LibrarySnapshot, name: string) {
  try {
    return current.skill(name).references.filter((file) => file.isText);
  } catch {
    return [];
  }
}

/** URI template variables can arrive as arrays; every variable here is a single value. */
function single(variables: Variables, key: string): string {
  const value = variables[key];
  return decodeURIComponent(Array.isArray(value) ? (value[0] ?? '') : (value ?? ''));
}

function startingWith(value: string, candidates: string[]): string[] {
  return candidates.filter((candidate) => candidate.startsWith(value));
}

function mimeTypeOf(path: string): string {
  if (/\.mdx?$/.test(path)) return MARKDOWN;
  if (path.endsWith('.json')) return 'application/json';
  if (/\.ya?ml$/.test(path)) return 'application/yaml';
  if (path.endsWith('.csv')) return 'text/csv';
  return 'text/plain';
}
