/**
 * Filesystem discovery: finds departments, skills and their files under the root.
 *
 * The layout is structural, so there is no registry to keep in sync:
 *   <root>/<department>/README.md               the department ledger
 *   <root>/<department>/<skill>/SKILL.md        a skill
 *   <root>/<department>/<skill>/**              files bundled with the skill
 *
 * This module only reads. Interpreting what it found happens in `snapshot.ts`.
 */
import { readdir, readFile, stat } from 'node:fs/promises';
import path from 'node:path';

// ─── Rules ──────────────────────────────────────────────────────────────────

/** Top-level folders that are never departments (code, tooling, build output). */
export const RESERVED_DIRS = new Set(['node_modules', 'packages', 'dist', 'coverage']);

/** A folder is skipped when it is reserved or hidden (`.git`) or private (`_imports`). */
export function isIgnoredDir(name: string): boolean {
  return RESERVED_DIRS.has(name) || name.startsWith('.') || name.startsWith('_');
}

const TEXT_EXTENSIONS = new Set([
  '.md',
  '.mdx',
  '.txt',
  '.json',
  '.yaml',
  '.yml',
  '.csv',
  '.tsv',
  '.xml',
  '.html',
  '.css',
  '.js',
  '.mjs',
  '.cjs',
  '.ts',
  '.tsx',
  '.jsx',
  '.py',
  '.sh',
  '.rb',
  '.sql',
  '.toml',
  '.svg',
]);

/** Largest bundled file the library will hold in memory and serve as text. */
const MAX_TEXT_BYTES = 2 * 1024 * 1024;

// ─── Shapes ─────────────────────────────────────────────────────────────────

export interface ScannedFile {
  /** POSIX path relative to the library root. */
  path: string;
  absolutePath: string;
  bytes: number;
  /** File contents, or `null` for binary or oversized files. */
  content: string | null;
}

export interface ScannedSkill {
  name: string;
  department: string;
  /** POSIX path of the skill folder relative to the root. */
  dir: string;
  skillFile: ScannedFile;
  /** Every other file in the skill folder, recursively. */
  files: ScannedFile[];
}

export interface ScannedDepartment {
  id: string;
  dir: string;
  readme: ScannedFile | null;
  skills: ScannedSkill[];
}

export interface ScanResult {
  root: string;
  readme: ScannedFile | null;
  departments: ScannedDepartment[];
}

// ─── Discovery ──────────────────────────────────────────────────────────────

export async function scanLibrary(root: string): Promise<ScanResult> {
  const departments: ScannedDepartment[] = [];

  for (const dirName of await listDirs(root)) {
    if (isIgnoredDir(dirName)) continue;
    const department = await scanDepartment(root, dirName);
    // A folder counts as a department once it has a ledger or at least one skill.
    if (department.readme || department.skills.length > 0) departments.push(department);
  }

  return { root, readme: await readOptional(root, 'README.md'), departments };
}

async function scanDepartment(root: string, id: string): Promise<ScannedDepartment> {
  const skills: ScannedSkill[] = [];

  for (const name of await listDirs(path.join(root, id))) {
    if (isIgnoredDir(name)) continue;
    const dir = `${id}/${name}`;
    const skillFile = await readOptional(root, `${dir}/SKILL.md`);
    if (!skillFile) continue;

    const files = (await listFilesRecursive(path.join(root, dir)))
      .filter((relative) => relative !== 'SKILL.md')
      .map((relative) => `${dir}/${relative}`);
    skills.push({
      name,
      department: id,
      dir,
      skillFile,
      files: await Promise.all(files.map((file) => readScannedFile(root, file))),
    });
  }

  return { id, dir: id, readme: await readOptional(root, `${id}/README.md`), skills };
}

// ─── Filesystem primitives ──────────────────────────────────────────────────

async function listDirs(dir: string): Promise<string[]> {
  const entries = await readdir(dir, { withFileTypes: true });
  return entries
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort((a, b) => a.localeCompare(b));
}

/** Every file below `dir` as POSIX paths relative to it, skipping hidden entries. */
async function listFilesRecursive(dir: string, prefix = ''): Promise<string[]> {
  const entries = await readdir(dir, { withFileTypes: true });
  const files: string[] = [];

  for (const entry of entries.sort((a, b) => a.name.localeCompare(b.name))) {
    if (entry.name.startsWith('.')) continue;
    const relative = prefix ? `${prefix}/${entry.name}` : entry.name;
    if (entry.isDirectory()) files.push(...(await listFilesRecursive(path.join(dir, entry.name), relative)));
    else if (entry.isFile()) files.push(relative);
  }
  return files;
}

async function readOptional(root: string, relative: string): Promise<ScannedFile | null> {
  try {
    return await readScannedFile(root, relative);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return null;
    throw error;
  }
}

async function readScannedFile(root: string, relative: string): Promise<ScannedFile> {
  const absolutePath = path.join(root, ...relative.split('/'));
  const { size } = await stat(absolutePath);
  const isText = TEXT_EXTENSIONS.has(path.extname(relative).toLowerCase()) && size <= MAX_TEXT_BYTES;
  return {
    path: relative,
    absolutePath,
    bytes: size,
    content: isText ? await readFile(absolutePath, 'utf8') : null,
  };
}
