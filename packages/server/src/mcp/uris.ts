/**
 * The `skills://` URI scheme, in one place so resources, prompts and tool results
 * always point at the same addresses.
 *
 *   skills://index                                  root README (the library index)
 *   skills://department/{department}                a department ledger
 *   skills://skill/{name}                           a skill's SKILL.md
 *   skills://skill/{name}/{+path}                   a file bundled with a skill
 */

export const INDEX_URI = 'skills://index';

export const TEMPLATES = {
  department: 'skills://department/{department}',
  skill: 'skills://skill/{name}',
  file: 'skills://skill/{name}/{+path}',
} as const;

export const departmentUri = (id: string) => `skills://department/${encodeURIComponent(id)}`;
export const skillUri = (name: string) => `skills://skill/${encodeURIComponent(name)}`;
export const fileUri = (name: string, path: string) =>
  `${skillUri(name)}/${path.split('/').map(encodeURIComponent).join('/')}`;
