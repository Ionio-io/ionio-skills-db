/**
 * The HTTP application: one origin for everything.
 *
 *   /mcp     MCP over Streamable HTTP, for remote or HTTP-capable agents
 *   /api/*   REST API for the dashboard
 *   /*       the built dashboard (single-page app), when it has been built
 *
 * `createMcpHonoApp` validates Host and Origin headers on local binds, which blocks
 * DNS-rebinding attacks against the MCP endpoint and the API alike.
 */
import { existsSync } from 'node:fs';
import path from 'node:path';

import type { SkillLibrary } from '@ionio-skills/core';
import { serveStatic } from '@hono/node-server/serve-static';
import { createMcpHonoApp } from '@modelcontextprotocol/hono';
import { createMcpHandler, type McpHttpHandler } from '@modelcontextprotocol/server';
import type { Context, Hono } from 'hono';

import { createSkillsServer } from '../mcp/server.js';
import { createApi, type ServerInfo } from './api.js';

export interface AppOptions {
  library: SkillLibrary;
  info: ServerInfo;
  host: string;
  allowedHosts?: string[];
  /** Folder of the built dashboard. Skipped when missing (e.g. in dev, where Vite serves it). */
  dashboardDir?: string;
}

export interface SkillsApp {
  app: Hono;
  mcp: McpHttpHandler;
}

export function createApp({ library, info, host, allowedHosts, dashboardDir }: AppOptions): SkillsApp {
  // Hosts allowed in `Host` are also allowed in `Origin`, so a browser on a tunnel or
  // proxy hostname can load the dashboard (module scripts send Origin) and call /mcp.
  const app = createMcpHonoApp({ host, allowedHosts, allowedOrigins: allowedHosts });

  // ─── MCP ──────────────────────────────────────────────────────────────────
  // A fresh server per request: stateless, so it always reflects the current library.
  // Plain JSON responses: no tool streams progress, and an open SSE response would hold
  // one of a browser's six connections per host while the dashboard is also connected.
  const mcp = createMcpHandler(() => createSkillsServer(library), { responseMode: 'json' });
  app.all('/mcp', (c: Context) => mcp.fetch(c.req.raw, { parsedBody: c.get('parsedBody') }));

  // ─── REST API ─────────────────────────────────────────────────────────────
  app.route('/api', createApi(library, info));

  // ─── Dashboard ────────────────────────────────────────────────────────────
  if (dashboardDir && existsSync(path.join(dashboardDir, 'index.html'))) {
    // Hashed build assets never change, so browsers may cache them for good.
    app.use(
      '/assets/*',
      serveStatic({
        root: dashboardDir,
        onFound: (_path, c) => c.header('Cache-Control', 'public, max-age=31536000, immutable'),
      }),
    );
    app.use('*', serveStatic({ root: dashboardDir }));
    // Client-side routes (/skills/x, /connect, …) all load the app shell.
    app.get('*', serveStatic({ path: path.join(dashboardDir, 'index.html') }));
  }

  return { app, mcp };
}
