/**
 * Connect: how to plug an agent into the library, and proof that it works.
 * Setup snippets per client, the live MCP surface (tools, resources, prompts)
 * as the server reports it, and a playground that calls tools for real.
 */
import { CheckCircle, CircleNotch, WarningCircle } from '@phosphor-icons/react';
import { useQuery, type UseQueryResult } from '@tanstack/react-query';

import { ErrorState, PageSkeleton } from '@/components/common/States';
import { PageHeader } from '@/components/layout/PageHeader';
import { Badge } from '@/components/ui/badge';
import { loadManifest, type McpManifest } from '@/lib/mcp';
import { useServerInfo } from '@/lib/queries';

import { ClientSetup } from './ClientSetup';
import { Playground } from './Playground';
import { Surface } from './Surface';

export function ConnectPage() {
  const { data: server, error } = useServerInfo();
  const manifest = useQuery({ queryKey: ['mcp-manifest'], queryFn: loadManifest, retry: 1 });

  if (error) return <ErrorState error={error} />;
  if (!server) return <PageSkeleton />;

  return (
    <>
      <PageHeader
        crumbs={[{ label: 'Library', to: '/' }, { label: 'Connect' }]}
        title="Connect an agent"
        description="The library is an MCP server. Agents discover skills from a short catalog, load one only when a task needs it, and pull bundled files on demand."
        meta={<ConnectionStatus state={manifest} />}
      />

      <div className="flex flex-col gap-12">
        <ClientSetup server={server} />
        {manifest.data && <Surface manifest={manifest.data} />}
        {manifest.data && <Playground tools={manifest.data.tools} />}
      </div>
    </>
  );
}

function ConnectionStatus({ state }: { state: UseQueryResult<McpManifest> }) {
  if (state.isPending) {
    return (
      <Badge>
        <CircleNotch size={12} className="animate-spin" /> Connecting to /mcp
      </Badge>
    );
  }
  if (state.error || !state.data) {
    return (
      <Badge tone="bad">
        <WarningCircle size={12} weight="bold" /> MCP endpoint unreachable
      </Badge>
    );
  }
  const { server, protocolVersion, tools, prompts, latencyMs } = state.data;
  return (
    <>
      <Badge tone="good">
        <CheckCircle size={12} weight="bold" /> Online
      </Badge>
      <span>
        {server.name} {server.version}
      </span>
      {protocolVersion && <span>Protocol {protocolVersion}</span>}
      <span>
        {tools.length} tools · {prompts.length} prompts
      </span>
      <span className="tabular">{latencyMs} ms to connect and list</span>
    </>
  );
}
