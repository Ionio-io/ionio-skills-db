/**
 * The REST API and MCP endpoint as one Vercel function. `api/index.js` re-exports
 * this, `vercel.json` routes `/api/*` and `/mcp` to it, and Vercel serves the built
 * dashboard as static files.
 *
 * A deployment is a fixed copy of the library: nothing to watch, and no stdio
 * command to offer, since agents can only reach it over HTTP.
 */
import { SkillLibrary } from '@ionio-skills/core';

import { loadConfig, SERVER_NAME, SERVER_VERSION } from '../config.js';
import { createApp } from '../http/app.js';

const config = loadConfig();
const library = new SkillLibrary({ root: config.root });

const { app } = createApp({
  library,
  // Vercel routes by Host before a request gets here, so the DNS-rebinding checks for
  // local binds don't apply; a non-loopback host turns them off. ALLOWED_HOSTS still
  // restricts Host and Origin when set.
  host: process.env['VERCEL_URL'] ?? 'vercel',
  allowedHosts: config.allowedHosts,
  info: { name: SERVER_NAME, version: SERVER_VERSION, stdio: null, live: false, root: config.root },
});

export default app;
