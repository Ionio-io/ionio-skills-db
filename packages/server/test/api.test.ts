import { SkillLibrary } from '@ionio-skills/core';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { createApp } from '../src/http/app.js';
import { createFixture } from './helpers.js';

let app: ReturnType<typeof createApp>['app'];
let cleanup: () => Promise<void>;

beforeAll(async () => {
  const fixture = await createFixture();
  cleanup = fixture.cleanup;
  const library = new SkillLibrary({ root: fixture.root });
  app = createApp({
    library,
    host: '127.0.0.1',
    info: {
      name: 'test',
      version: '0.0.0',
      mcpUrl: 'http://127.0.0.1/mcp',
      stdio: { command: 'node', args: [] },
      root: fixture.root,
    },
  }).app;
});
afterAll(() => cleanup());

const get = (path: string, headers: Record<string, string> = {}) =>
  app.request(`http://127.0.0.1${path}`, { headers: { host: '127.0.0.1', ...headers } });

describe('REST API', () => {
  it('serves the catalog', async () => {
    const response = await get('/api/catalog');
    expect(response.status).toBe(200);
    const catalog = (await response.json()) as { stats: { skills: number } };
    expect(catalog.stats.skills).toBe(4);
  });

  it('serves skills, bundled files and departments', async () => {
    expect(((await (await get('/api/skills/alpha-writer')).json()) as { title: string }).title).toBe(
      'Alpha Writer',
    );
    const file = (await (await get('/api/skills/alpha-writer/files/references/guide.md')).json()) as {
      content: string;
    };
    expect(file.content).toContain('# Guide');
    expect(((await (await get('/api/departments/writing')).json()) as { title: string }).title).toBe(
      'Writing',
    );
  });

  it('answers misses with 404 and suggestions', async () => {
    const response = await get('/api/skills/alpha-writr');
    expect(response.status).toBe(404);
    expect(await response.json()).toMatchObject({ kind: 'skill', suggestions: ['alpha-writer'] });
    expect((await get('/api/skills/alpha-writer/files/..%2F..%2FREADME.md')).status).toBe(404);
  });

  it('searches, reports health and activity', async () => {
    const search = (await (await get('/api/search?q=grid')).json()) as { hits: Array<{ name: string }> };
    expect(search.hits[0]!.name).toBe('gamma-grid');
    const health = (await (await get('/api/health')).json()) as { counts: { error: number } };
    expect(health.counts.error).toBeGreaterThan(0);
    expect(await (await get('/api/activity')).json()).toEqual([]);
  });

  it('rejects requests from foreign hosts (DNS rebinding protection)', async () => {
    const response = await app.request('http://evil.example/api/catalog', {
      headers: { host: 'evil.example' },
    });
    expect(response.status).toBe(403);
  });
});
