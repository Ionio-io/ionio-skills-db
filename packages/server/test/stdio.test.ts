/**
 * End to end over a real stdio pipe: spawns the stdio entry point the way an agent
 * host does, pointed at the fixture library through SKILLS_ROOT.
 */
import { fileURLToPath } from 'node:url';

import { Client } from '@modelcontextprotocol/client';
import { StdioClientTransport } from '@modelcontextprotocol/client/stdio';
import { afterAll, beforeAll, expect, it } from 'vitest';

import { createFixture, textOf } from './helpers.js';

const entry = fileURLToPath(new URL('../src/bin/stdio.ts', import.meta.url));
let client: Client;
let cleanup: () => Promise<void>;

beforeAll(async () => {
  const fixture = await createFixture();
  cleanup = fixture.cleanup;
  const transport = new StdioClientTransport({
    command: process.execPath,
    args: ['--conditions=ionio-source', '--import', 'tsx', entry],
    env: { ...process.env, SKILLS_ROOT: fixture.root } as Record<string, string>,
    stderr: 'pipe',
  });
  client = new Client({ name: 'stdio-test', version: '1.0.0' });
  await client.connect(transport);
}, 20_000);

afterAll(async () => {
  await client.close();
  await cleanup();
});

it('serves the library over stdio', async () => {
  const result = await client.callTool({ name: 'get_skill', arguments: { name: 'gamma-grid' } });
  expect(textOf(result)).toContain('# Gamma Grid');
  expect(client.getInstructions()).toContain('4 skills across 2 departments');
});
