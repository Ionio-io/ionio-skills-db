/**
 * Builds the skills MCP server.
 *
 * `createSkillsServer` is the one factory behind both transports: `serveStdio`
 * calls it for a local connection and `createMcpHandler` calls it per HTTP request.
 * It reads everything through a `SnapshotSource` so tools and resources always see
 * the library as it is now, even on a long-lived stdio connection.
 */
import type { LibrarySnapshot, SkillLibrary } from '@ionio-skills/core';
import { McpServer } from '@modelcontextprotocol/server';

import { SERVER_NAME, SERVER_VERSION } from '../config.js';
import { buildInstructions } from './instructions.js';
import { registerPrompts } from './prompts.js';
import { registerResources } from './resources.js';
import { registerTools } from './tools.js';

/** Returns the current library snapshot. Usually `() => library.snapshot()`. */
export type SnapshotSource = () => Promise<LibrarySnapshot>;

export async function createSkillsServer(library: Pick<SkillLibrary, 'snapshot'>): Promise<McpServer> {
  const source: SnapshotSource = () => library.snapshot();
  const snapshot = await source();

  const server = new McpServer(
    { name: SERVER_NAME, title: 'Ionio Skills', version: SERVER_VERSION },
    { instructions: buildInstructions(snapshot) },
  );
  registerTools(server, source);
  registerResources(server, source);
  registerPrompts(server, snapshot);
  return server;
}
