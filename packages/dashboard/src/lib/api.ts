/**
 * Typed client for the server's REST API (see packages/server/src/http/api.ts).
 * The data shapes are the core library's own types, imported type-only.
 */
import type {
  Catalog,
  Department,
  GitCommit,
  HealthReport,
  ReferenceFile,
  SearchHit,
  Skill,
} from '@ionio-skills/core/types';

export interface ServerInfo {
  name: string;
  version: string;
  mcpUrl: string;
  stdio: { command: string; args: string[] };
  root: string;
}

/** A failed API call, carrying the server's message and any suggestions. */
export class ApiError extends Error {
  constructor(
    readonly status: number,
    message: string,
    readonly suggestions: string[] = [],
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

async function get<T>(path: string): Promise<T> {
  const response = await fetch(`/api${path}`, { headers: { accept: 'application/json' } });
  if (!response.ok) {
    const body = (await response.json().catch(() => ({}))) as { error?: string; suggestions?: string[] };
    throw new ApiError(
      response.status,
      body.error ?? `Request failed (${response.status})`,
      body.suggestions,
    );
  }
  return response.json() as Promise<T>;
}

const segment = encodeURIComponent;

export const api = {
  catalog: () => get<Catalog>('/catalog'),
  department: (id: string) => get<Department>(`/departments/${segment(id)}`),
  skill: (name: string) => get<Skill>(`/skills/${segment(name)}`),
  file: (name: string, path: string) =>
    get<{ file: ReferenceFile; content: string }>(
      `/skills/${segment(name)}/files/${path.split('/').map(segment).join('/')}`,
    ),
  search: (query: string, limit = 12) =>
    get<{ query: string; hits: SearchHit[] }>(`/search?q=${segment(query)}&limit=${limit}`),
  health: () => get<HealthReport>('/health'),
  activity: (limit = 30) => get<GitCommit[]>(`/activity?limit=${limit}`),
  server: () => get<ServerInfo>('/server'),
};
