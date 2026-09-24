/**
 * Playground: call any tool with real arguments and read exactly what an agent
 * would get back. The form is generated from each tool's input schema.
 */
import { Play } from '@phosphor-icons/react';
import { useMutation } from '@tanstack/react-query';
import { AnimatePresence, motion } from 'motion/react';
import { useState, type FormEvent } from 'react';

import { Markdown } from '@/components/markdown/Markdown';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Segmented } from '@/components/ui/segmented';
import { runTool, type McpManifest } from '@/lib/mcp';
import { useCatalog } from '@/lib/queries';

interface Property {
  type?: string;
  description?: string;
}

/** Sensible first arguments so every tool runs with one click. */
function exampleArgs(tool: string, firstSkill: string | undefined): Record<string, string> {
  switch (tool) {
    case 'get_skill':
      return { name: firstSkill ?? '' };
    case 'search_skills':
      return { query: 'cold email for a loom video' };
    case 'get_skill_file':
      return { name: 'youtube-title', path: 'references/title-bank.md' };
    default:
      return {};
  }
}

export function Playground({ tools }: { tools: McpManifest['tools'] }) {
  const { data: catalog } = useCatalog();
  const [toolName, setToolName] = useState('search_skills');
  const [values, setValues] = useState<Record<string, string>>(() => exampleArgs('search_skills', undefined));
  const [view, setView] = useState<'rendered' | 'raw'>('rendered');
  const run = useMutation({ mutationFn: (args: Record<string, unknown>) => runTool(toolName, args) });

  const tool = tools.find((candidate) => candidate.name === toolName) ?? tools[0];
  if (!tool) return null;
  const schema = tool.inputSchema as { properties?: Record<string, Property>; required?: string[] };
  const properties = Object.entries(schema.properties ?? {});

  function selectTool(name: string) {
    setToolName(name);
    setValues(exampleArgs(name, catalog?.skills[0]?.name));
    run.reset();
  }

  function submit(event: FormEvent) {
    event.preventDefault();
    // Drop empty optional fields and convert numbers, as the schema expects.
    const args = Object.fromEntries(
      properties
        .filter(([name]) => values[name]?.trim())
        .map(([name, property]) => [
          name,
          property.type === 'integer' || property.type === 'number' ? Number(values[name]) : values[name],
        ]),
    );
    run.mutate(args);
  }

  return (
    <section>
      <div className="mb-4">
        <h2 className="text-[15px] font-medium text-ink">Playground</h2>
        <p className="mt-1 text-[13px] text-ink-3">
          Call a tool the way an agent does and see the exact response.
        </p>
      </div>
      <Card className="overflow-hidden">
        <div className="border-b border-line p-4">
          <Segmented
            label="Tool"
            value={tool.name}
            onValueChange={selectTool}
            options={tools.map((candidate) => ({
              value: candidate.name,
              label: <span className="font-mono text-[12px]">{candidate.name}</span>,
            }))}
          />
        </div>

        <form
          onSubmit={submit}
          className="flex flex-col gap-3 border-b border-line p-4 sm:flex-row sm:flex-wrap sm:items-end"
        >
          {properties.length === 0 && <p className="text-[13px] text-ink-3">This tool takes no arguments.</p>}
          {properties.map(([name, property]) => (
            <label key={name} className="flex min-w-[200px] flex-1 flex-col gap-1.5">
              <span className="text-[12px] text-ink-2">
                <span className="font-mono">{name}</span>
                {!schema.required?.includes(name) && <span className="text-ink-3"> (optional)</span>}
              </span>
              <Input
                value={values[name] ?? ''}
                inputMode={property.type === 'integer' ? 'numeric' : undefined}
                placeholder={property.description?.replace(/\.$/, '')}
                onChange={(event) => setValues((current) => ({ ...current, [name]: event.target.value }))}
                className="font-mono"
              />
            </label>
          ))}
          <Button type="submit" variant="primary" disabled={run.isPending} className="sm:mb-0">
            <Play size={13} weight="fill" />
            {run.isPending ? 'Running…' : 'Run'}
          </Button>
        </form>

        <AnimatePresence mode="wait" initial={false}>
          {run.data || run.error ? (
            <motion.div
              key={run.submittedAt}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <div className="flex items-center justify-between gap-3 px-4 pt-3">
                <div className="flex items-center gap-2 text-[12px] text-ink-3">
                  {run.error || run.data?.isError ? (
                    <Badge tone="bad">Error</Badge>
                  ) : (
                    <Badge tone="good">OK</Badge>
                  )}
                  {run.data && <span className="tabular">{run.data.latencyMs} ms</span>}
                  {run.data && (
                    <span className="tabular">{run.data.text.length.toLocaleString()} characters</span>
                  )}
                </div>
                <Segmented
                  label="Output view"
                  value={view}
                  onValueChange={(value) => setView(value as 'rendered' | 'raw')}
                  options={[
                    { value: 'rendered', label: 'Rendered' },
                    { value: 'raw', label: 'Raw' },
                  ]}
                />
              </div>
              <div className="max-h-[560px] overflow-auto p-4">
                {run.error ? (
                  <p className="text-[13px] text-bad">{(run.error as Error).message}</p>
                ) : view === 'rendered' ? (
                  <Markdown sourcePath="README.md">{run.data!.text}</Markdown>
                ) : (
                  <pre className="font-mono text-[12px] leading-relaxed whitespace-pre-wrap text-ink-2">
                    {run.data!.text}
                  </pre>
                )}
              </div>
            </motion.div>
          ) : (
            <motion.p
              key="idle"
              className="px-4 py-8 text-center text-[13px] text-ink-3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              Run the tool to see its response.
            </motion.p>
          )}
        </AnimatePresence>
      </Card>
    </section>
  );
}
