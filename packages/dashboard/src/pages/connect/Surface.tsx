/**
 * The MCP surface exactly as the server reports it over the protocol: the
 * instructions agents receive on connect, then tools, resources and prompts.
 */
import { CaretDown, ChatText, FileText, Wrench } from '@phosphor-icons/react';
import { AnimatePresence, motion } from 'motion/react';
import { useState, type ReactNode } from 'react';

import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/cn';
import type { McpManifest } from '@/lib/mcp';

interface SchemaProperty {
  type?: string;
  description?: string;
}

export function Surface({ manifest }: { manifest: McpManifest }) {
  return (
    <section className="flex flex-col gap-6">
      <div>
        <h2 className="text-[15px] font-medium text-ink">What agents get</h2>
        <p className="mt-1 text-[13px] text-ink-3">
          Read live from the server over MCP, so this is always what an agent sees.
        </p>
      </div>

      <Instructions text={manifest.instructions} />

      <Group icon={<Wrench size={15} />} title="Tools" count={manifest.tools.length}>
        <ul className="divide-y divide-line">
          {manifest.tools.map((tool) => {
            const schema = tool.inputSchema as {
              properties?: Record<string, SchemaProperty>;
              required?: string[];
            };
            const properties = Object.entries(schema.properties ?? {});
            return (
              <li key={tool.name} className="px-5 py-4">
                <div className="flex flex-wrap items-center gap-2">
                  <code className="font-mono text-[13px] font-medium text-ink">{tool.name}</code>
                  {tool.annotations?.readOnlyHint && <Badge tone="good">read-only</Badge>}
                </div>
                <p className="mt-1.5 max-w-[90ch] text-[13px] leading-relaxed text-ink-2">
                  {tool.description}
                </p>
                {properties.length > 0 && (
                  <dl className="mt-3 grid gap-1.5">
                    {properties.map(([name, property]) => (
                      <div key={name} className="flex flex-wrap items-baseline gap-x-2 text-[12.5px]">
                        <dt className="font-mono text-ink">
                          {name}
                          {!schema.required?.includes(name) && <span className="text-ink-3">?</span>}
                        </dt>
                        <span className="font-mono text-[11.5px] text-ink-3">{property.type}</span>
                        {property.description && <dd className="text-ink-3">{property.description}</dd>}
                      </div>
                    ))}
                  </dl>
                )}
              </li>
            );
          })}
        </ul>
      </Group>

      <div className="grid gap-6 lg:grid-cols-2">
        <Group icon={<FileText size={15} />} title="Resources" count={manifest.resources.length}>
          <ul className="divide-y divide-line">
            {manifest.templates.map((template) => (
              <li key={template.uriTemplate} className="px-5 py-3">
                <code className="font-mono text-[12.5px] text-ink">{template.uriTemplate}</code>
                <p className="mt-1 text-[12.5px] text-ink-3">{template.description}</p>
              </li>
            ))}
            <li className="px-5 py-3 text-[12.5px] text-ink-3">
              Plus the static <code className="font-mono text-ink">skills://index</code>. Clients can
              @-mention any of the {manifest.resources.length} listed resources.
            </li>
          </ul>
        </Group>
        <Group icon={<ChatText size={15} />} title="Prompts" count={manifest.prompts.length}>
          <p className="px-5 pt-3 text-[12.5px] text-ink-3">
            One per skill. In Claude Code they appear as slash commands and accept an optional task.
          </p>
          <ul className="flex flex-wrap gap-1.5 px-5 pt-3 pb-4">
            {manifest.prompts.map((prompt) => (
              <li key={prompt.name}>
                <code className="rounded bg-surface-2 px-1.5 py-0.5 font-mono text-[11.5px] text-ink-2">
                  /mcp__{manifest.server.name}__{prompt.name}
                </code>
              </li>
            ))}
          </ul>
        </Group>
      </div>
    </section>
  );
}

function Group({
  icon,
  title,
  count,
  children,
}: {
  icon: ReactNode;
  title: string;
  count: number;
  children: ReactNode;
}) {
  return (
    <Card className="overflow-hidden">
      <div className="flex items-center gap-2 border-b border-line px-5 py-3 text-[13px] font-medium text-ink">
        <span className="text-ink-3">{icon}</span>
        {title}
        <span className="tabular ml-1 rounded-full bg-surface-2 px-1.5 text-[11px] leading-4 text-ink-3">
          {count}
        </span>
      </div>
      {children}
    </Card>
  );
}

/** The server instructions, collapsed to a few lines until expanded. */
function Instructions({ text }: { text: string }) {
  const [open, setOpen] = useState(false);
  return (
    <Card className="overflow-hidden">
      <button
        onClick={() => setOpen((value) => !value)}
        className="flex w-full items-center justify-between gap-4 px-5 py-3 text-left"
        aria-expanded={open}
      >
        <span>
          <span className="text-[13px] font-medium text-ink">Server instructions</span>
          <span className="ml-2 text-[12.5px] text-ink-3">sent to the model once when it connects</span>
        </span>
        <CaretDown
          size={14}
          className={cn('text-ink-3 transition-transform duration-200', open && 'rotate-180')}
        />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <pre className="max-h-96 overflow-auto border-t border-line bg-surface-2 px-5 py-4 font-mono text-[12px] leading-relaxed whitespace-pre-wrap text-ink-2">
              {text}
            </pre>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}
