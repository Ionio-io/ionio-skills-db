/**
 * The dashboard as an MCP client of its own server.
 *
 * The Connect page does not describe the MCP surface from static docs: it connects
 * to `/mcp` exactly like an agent would, then lists and calls what is really there.
 * The SDK is loaded on demand, so it only costs bytes on that page.
 */
import type { Client } from '@modelcontextprotocol/client';

export interface McpManifest {
  server: { name: string; title?: string; version: string };
  protocolVersion: string | undefined;
  instructions: string;
  tools: Awaited<ReturnType<Client['listTools']>>['tools'];
  resources: Awaited<ReturnType<Client['listResources']>>['resources'];
  templates: Awaited<ReturnType<Client['listResourceTemplates']>>['resourceTemplates'];
  prompts: Awaited<ReturnType<Client['listPrompts']>>['prompts'];
  /** Round trip for connecting plus listing everything, in milliseconds. */
  latencyMs: number;
}

export interface ToolRun {
  text: string;
  isError: boolean;
  latencyMs: number;
}

let connection: Promise<Client> | null = null;

/** One shared connection; a failed attempt is forgotten so the next call retries. */
function connect(): Promise<Client> {
  connection ??= (async () => {
    const { Client, StreamableHTTPClientTransport } = await import('@modelcontextprotocol/client');
    const client = new Client(
      { name: 'ionio-skills-dashboard', version: '0.1.0' },
      { versionNegotiation: { mode: 'auto' } },
    );
    await client.connect(new StreamableHTTPClientTransport(new URL('/mcp', window.location.origin)));
    return client;
  })().catch((error: unknown) => {
    connection = null;
    throw error;
  });
  return connection;
}

export async function loadManifest(): Promise<McpManifest> {
  const started = performance.now();
  const client = await connect();
  const [tools, resources, templates, prompts] = await Promise.all([
    client.listTools(),
    client.listResources(),
    client.listResourceTemplates(),
    client.listPrompts(),
  ]);
  const server = client.getServerVersion();
  return {
    server: { name: server?.name ?? 'unknown', title: server?.title, version: server?.version ?? '' },
    protocolVersion: client.getNegotiatedProtocolVersion(),
    instructions: client.getInstructions() ?? '',
    tools: tools.tools,
    resources: resources.resources,
    templates: templates.resourceTemplates,
    prompts: prompts.prompts,
    latencyMs: Math.round(performance.now() - started),
  };
}

export async function runTool(name: string, args: Record<string, unknown>): Promise<ToolRun> {
  const client = await connect();
  const started = performance.now();
  const result = await client.callTool({ name, arguments: args });
  const text = (result.content as Array<{ type: string; text?: string }>)
    .map((block) => (block.type === 'text' ? block.text : `[${block.type} content]`))
    .join('\n\n');
  return { text, isError: result.isError === true, latencyMs: Math.round(performance.now() - started) };
}
