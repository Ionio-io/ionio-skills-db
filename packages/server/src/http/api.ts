/**
 * REST API for the dashboard. Read-only JSON over the current library snapshot.
 *
 *   GET /api/catalog                     stats, departments, skill summaries, repo info
 *   GET /api/departments/:id             one department with its ledger
 *   GET /api/skills/:name                one skill with document, references, relations, history
 *   GET /api/skills/:name/files/*        one bundled text file
 *   GET /api/search?q=&department=&limit=
 *   GET /api/health                      consistency issues
 *   GET /api/activity?limit=             recent commits that touched skills
 *   GET /api/server                      how to connect agents to this server
 *   GET /api/events                      server-sent "library-changed" events (204 when not live)
 */
import { NotFoundError, type SkillLibrary } from '@ionio-skills/core';
import { Hono, type Context } from 'hono';

import { streamLibraryEvents } from './events.js';

export interface ServerInfo {
  name: string;
  version: string;
  /** Command that starts the stdio MCP server, for local agent configs. Null when hosted. */
  stdio: { command: string; args: string[] } | null;
  /** Whether the library is watched, so `/api/events` reports changes. */
  live: boolean;
  root: string;
}

export function createApi(library: SkillLibrary, info: ServerInfo): Hono {
  const api = new Hono();
  const snapshot = () => library.snapshot();

  api.get('/catalog', async (c) => c.json((await snapshot()).catalog()));

  api.get('/departments/:id', async (c) => c.json((await snapshot()).department(c.req.param('id'))));

  api.get('/skills/:name', async (c) => c.json((await snapshot()).skill(c.req.param('name'))));

  api.get('/skills/:name/files/:path{.+}', async (c) =>
    c.json((await snapshot()).file(c.req.param('name'), c.req.param('path'))),
  );

  api.get('/search', async (c) => {
    const query = c.req.query('q') ?? '';
    const department = c.req.query('department') || undefined;
    const limit = clamp(Number(c.req.query('limit') ?? 20), 1, 50);
    return c.json({ query, hits: (await snapshot()).search(query, { department, limit }) });
  });

  api.get('/health', async (c) => c.json((await snapshot()).health()));

  api.get('/activity', async (c) =>
    c.json((await snapshot()).activity(clamp(Number(c.req.query('limit') ?? 30), 1, 200))),
  );

  // The MCP URL is whatever origin the client reached us on, so it is right on
  // localhost, behind a tunnel, and on a Vercel or custom domain alike.
  api.get('/server', (c) => c.json({ ...info, mcpUrl: new URL('/mcp', publicOrigin(c)).href }));

  // 204 tells EventSource not to reconnect: a deployed copy of the library never changes.
  api.get('/events', (c) => (info.live ? streamLibraryEvents(c, library) : c.body(null, 204)));

  // Lookups that miss answer 404 with suggestions; anything else is a real failure.
  api.onError((error, c) => {
    if (error instanceof NotFoundError) {
      return c.json(
        { error: error.message, kind: error.kind, id: error.id, suggestions: error.suggestions },
        404,
      );
    }
    console.error(error);
    return c.json({ error: 'Internal server error' }, 500);
  });
  api.notFound((c) => c.json({ error: `No API route for ${c.req.method} ${c.req.path}` }, 404));

  return api;
}

/** The origin as the client sees it, honouring the forwarding headers a proxy adds. */
function publicOrigin(c: Context): string {
  const url = new URL(c.req.url);
  const first = (name: string) => c.req.header(name)?.split(',')[0]?.trim() || undefined;
  const host = first('x-forwarded-host') ?? first('host') ?? url.host;
  const protocol = first('x-forwarded-proto') ?? url.protocol.slice(0, -1);
  return `${protocol}://${host}`;
}

function clamp(value: number, min: number, max: number): number {
  return Number.isFinite(value) ? Math.min(max, Math.max(min, Math.trunc(value))) : min;
}
