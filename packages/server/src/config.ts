/**
 * Runtime configuration, read once from the environment.
 *
 *   SKILLS_ROOT   folder holding the departments   (default: this repository's root)
 *   HOST          interface the HTTP server binds  (default: 127.0.0.1, local only)
 *   PORT          HTTP port                        (default: 4321)
 *   ALLOWED_HOSTS comma-separated hostnames to accept when HOST is not local
 */
import { readFileSync } from 'node:fs';
import path from 'node:path';

import { resolveLibraryRoot } from '@ionio-skills/core';

// The same relative path works from `src/` (dev) and `dist/` (built).
const manifest = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8')) as {
  version: string;
};

export const SERVER_NAME = 'ionio-skills';
export const SERVER_VERSION = manifest.version;

export interface ServerConfig {
  root: string;
  host: string;
  port: number;
  allowedHosts: string[] | undefined;
  /** Built dashboard to serve at `/`, if it exists. */
  dashboardDir: string;
}

export function loadConfig(env: NodeJS.ProcessEnv = process.env): ServerConfig {
  const root = resolveLibraryRoot(import.meta.url, env);
  const port = Number(env['PORT'] ?? 4321);
  if (!Number.isInteger(port) || port <= 0 || port > 65535)
    throw new Error(`PORT must be a valid port, got "${env['PORT']}".`);

  return {
    root,
    host: env['HOST'] ?? '127.0.0.1',
    port,
    allowedHosts: env['ALLOWED_HOSTS']
      ?.split(',')
      .map((host) => host.trim())
      .filter(Boolean),
    dashboardDir: path.join(root, 'packages', 'dashboard', 'dist'),
  };
}
