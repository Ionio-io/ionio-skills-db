/**
 * Shared test wiring: a fixture library on disk, and an MCP client connected to the
 * real server factory in-process, through the same HTTP handler that production uses.
 */
import type { SkillLibrary } from '@ionio-skills/core';
import { Client, StreamableHTTPClientTransport } from '@modelcontextprotocol/client';
import { createMcpHandler } from '@modelcontextprotocol/server';

import { createFixture } from '../../core/test/fixture.js';
import { createSkillsServer } from '../src/mcp/server.js';

export { createFixture };

export async function connectClient(library: SkillLibrary) {
  const handler = createMcpHandler(() => createSkillsServer(library));
  const transport = new StreamableHTTPClientTransport(new URL('http://test.local/mcp'), {
    fetch: (url, init) => handler.fetch(new Request(url, init)),
  });
  const client = new Client(
    { name: 'test-harness', version: '1.0.0' },
    { versionNegotiation: { mode: 'auto' } },
  );
  await client.connect(transport);

  return {
    client,
    close: async () => {
      await client.close();
      await handler.close();
    },
  };
}

/** The concatenated text blocks of a tool result. */
export function textOf(result: { content?: unknown }): string {
  return ((result.content as Array<{ type: string; text?: string }>) ?? [])
    .filter((block) => block.type === 'text')
    .map((block) => block.text)
    .join('\n');
}
