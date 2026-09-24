/**
 * Copy-paste setup for common MCP clients. Two ways in:
 *   HTTP   point the client at this server's /mcp URL (the server must be running)
 *   stdio  let the client launch the server itself (needs `npm run build` once)
 * A hosted server (Vercel) has no stdio command, so only the HTTP setups are shown.
 */
import { useState } from 'react';

import { CopyButton } from '@/components/common/CopyButton';
import { Card } from '@/components/ui/card';
import { Segmented } from '@/components/ui/segmented';
import type { ServerInfo } from '@/lib/api';

interface Snippet {
  title: string;
  note?: string;
  code: string;
}

function snippetsFor(server: ServerInfo): Record<string, { label: string; snippets: Snippet[] }> {
  const { stdio } = server;
  const http: Snippet = {
    title: 'Over HTTP',
    note: stdio
      ? 'Uses the running server. Add --scope user to make it available in every project.'
      : 'Add --scope user to make it available in every project.',
    code: `claude mcp add --transport http ${server.name} ${server.mcpUrl}`,
  };
  return {
    'claude-code': {
      label: 'Claude Code',
      snippets: stdio
        ? [
            http,
            {
              title: 'Over stdio',
              note: 'Claude Code starts the server itself, so nothing needs to be running.',
              code: `claude mcp add ${server.name} -- ${[stdio.command, ...stdio.args].join(' ')}`,
            },
          ]
        : [http],
    },
    'claude-desktop': {
      label: 'Claude Desktop',
      snippets: [
        stdio
          ? {
              title: 'claude_desktop_config.json',
              note: 'Settings → Developer → Edit Config, then restart Claude Desktop.',
              code: `{\n  "mcpServers": {\n    "${server.name}": {\n      "command": "${stdio.command}",\n      "args": [${stdio.args.map((arg) => JSON.stringify(arg)).join(', ')}]\n    }\n  }\n}`,
            }
          : {
              title: 'Custom connector',
              note: 'Settings → Connectors → Add custom connector, then paste this URL.',
              code: server.mcpUrl,
            },
      ],
    },
    cursor: {
      label: 'Cursor and others',
      snippets: [
        {
          title: '.cursor/mcp.json (or your client’s mcpServers config)',
          code: `{\n  "mcpServers": {\n    "${server.name}": { "url": "${server.mcpUrl}" }\n  }\n}`,
        },
      ],
    },
    http: {
      label: 'Raw HTTP',
      snippets: [
        {
          title: 'Streamable HTTP endpoint',
          note: stdio
            ? 'Any MCP client library can connect here. Local only by default; set HOST and ALLOWED_HOSTS to expose it.'
            : 'Any MCP client library can connect here. It is public: anyone with the URL can read the library.',
          code: server.mcpUrl,
        },
        {
          title: 'Smoke test with curl',
          code: `curl -s -X POST ${server.mcpUrl} \\\n  -H 'Content-Type: application/json' \\\n  -H 'Accept: application/json, text/event-stream' \\\n  -d '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2025-06-18","capabilities":{},"clientInfo":{"name":"curl","version":"1"}}}'`,
        },
      ],
    },
  };
}

export function ClientSetup({ server }: { server: ServerInfo }) {
  const clients = snippetsFor(server);
  const [client, setClient] = useState('claude-code');
  const active = clients[client] ?? clients['claude-code']!;

  return (
    <section>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-[15px] font-medium text-ink">Set up your client</h2>
        <Segmented
          label="Client"
          value={client}
          onValueChange={setClient}
          options={Object.entries(clients).map(([value, { label }]) => ({ value, label }))}
        />
      </div>
      <div className="grid gap-3">
        {active.snippets.map((snippet) => (
          <Card key={snippet.title} className="overflow-hidden">
            <div className="flex items-start justify-between gap-4 px-4 pt-3 pb-2">
              <div>
                <p className="text-[13px] font-medium text-ink">{snippet.title}</p>
                {snippet.note && <p className="mt-0.5 text-[12.5px] text-ink-3">{snippet.note}</p>}
              </div>
              <CopyButton value={snippet.code} label="Copy" toastMessage="Copied to clipboard" />
            </div>
            <pre className="overflow-x-auto border-t border-line bg-surface-2 px-4 py-3 font-mono text-[12.5px] leading-relaxed text-ink">
              {snippet.code}
            </pre>
          </Card>
        ))}
      </div>
    </section>
  );
}
