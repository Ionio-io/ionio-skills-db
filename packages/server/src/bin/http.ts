/**
 * Starts the HTTP server: dashboard, REST API and the MCP endpoint on one port.
 *
 *   npm start            (after `npm run build`)
 *   npm run dev          (with the Vite dev server for the dashboard)
 */
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { SkillLibrary } from '@ionio-skills/core';
import { serve } from '@hono/node-server';

import { loadConfig, SERVER_NAME, SERVER_VERSION } from '../config.js';
import { createApp } from '../http/app.js';

const config = loadConfig();
const library = new SkillLibrary({ root: config.root, watch: true });

// Warm the snapshot so the first request is fast and a broken library fails loudly at boot.
const snapshot = await library.snapshot();
const { stats } = snapshot.catalog();

const displayHost = config.host === '0.0.0.0' || config.host === '::' ? 'localhost' : config.host;
const origin = `http://${displayHost}:${config.port}`;
const stdioEntry = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../dist/bin/stdio.js');

const { app, mcp } = createApp({
  library,
  host: config.host,
  allowedHosts: config.allowedHosts,
  dashboardDir: config.dashboardDir,
  info: {
    name: SERVER_NAME,
    version: SERVER_VERSION,
    mcpUrl: `${origin}/mcp`,
    stdio: { command: 'node', args: [stdioEntry] },
    root: config.root,
  },
});

const server = serve({ fetch: app.fetch, hostname: config.host, port: config.port }, () => {
  console.log(
    `\n  Ionio Skills ${SERVER_VERSION}: ${stats.skills} skills in ${stats.departments} departments`,
  );
  console.log(`  Dashboard  ${origin}`);
  console.log(`  MCP        ${origin}/mcp`);
  console.log(`  Library    ${config.root}\n`);
});

// ─── Shutdown ───────────────────────────────────────────────────────────────
async function shutdown(): Promise<void> {
  library.close();
  await mcp.close();
  server.close(() => process.exit(0));
  // SSE streams keep sockets open; do not wait on them forever.
  setTimeout(() => process.exit(0), 1000).unref();
}
process.once('SIGINT', () => void shutdown());
process.once('SIGTERM', () => void shutdown());
