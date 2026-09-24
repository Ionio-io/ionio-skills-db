#!/usr/bin/env node
/**
 * Starts the MCP server over stdio, for agents that launch it as a local process:
 *
 *   claude mcp add ionio-skills -- node /path/to/ionio-skills-db/packages/server/dist/bin/stdio.js
 *
 * stdout carries the protocol, so every log line goes to stderr.
 */
import { SkillLibrary } from '@ionio-skills/core';
import { serveStdio } from '@modelcontextprotocol/server/stdio';

import { loadConfig, SERVER_VERSION } from '../config.js';
import { createSkillsServer } from '../mcp/server.js';

const { root } = loadConfig();

// Watching keeps tools current when skills are edited during a long session.
const library = new SkillLibrary({ root, watch: true });
const { stats } = (await library.snapshot()).catalog();

const handle = serveStdio(() => createSkillsServer(library));
console.error(`ionio-skills ${SERVER_VERSION} on stdio: ${stats.skills} skills from ${root}`);

// The watcher would keep the process alive after the client disconnects.
async function shutdown(): Promise<void> {
  library.close();
  await handle.close();
  process.exit(0);
}
process.stdin.once('end', () => void shutdown());
process.once('SIGINT', () => void shutdown());
process.once('SIGTERM', () => void shutdown());
