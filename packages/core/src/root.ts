/**
 * Locates the library root: the folder that holds the department folders.
 *
 * `SKILLS_ROOT` wins when set, so the server can serve any skills folder. Otherwise
 * the root is the nearest ancestor with a `package.json` declaring `workspaces`,
 * which is this repository's root however deep the running file sits.
 */
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export function resolveLibraryRoot(from: string | URL, env: NodeJS.ProcessEnv = process.env): string {
  if (env['SKILLS_ROOT']) return path.resolve(env['SKILLS_ROOT']);

  let dir = path.resolve(typeof from === 'string' ? from : fileURLToPath(from));
  for (;;) {
    if (isWorkspaceRoot(dir)) return dir;
    const parent = path.dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  throw new Error(
    'Could not find the skills library root. Set SKILLS_ROOT to the folder that holds the departments.',
  );
}

function isWorkspaceRoot(dir: string): boolean {
  const manifest = path.join(dir, 'package.json');
  if (!existsSync(manifest)) return false;
  try {
    return Array.isArray((JSON.parse(readFileSync(manifest, 'utf8')) as { workspaces?: unknown }).workspaces);
  } catch {
    return false;
  }
}
