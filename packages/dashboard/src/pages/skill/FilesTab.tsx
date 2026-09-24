/**
 * Bundled files: a list on the left, the selected file on the right. Markdown
 * renders by default with a raw toggle; other text shows as source; binary files
 * are listed with their size only. Selection lives in `?file=`.
 */
import { File, FileText, WarningCircle } from '@phosphor-icons/react';
import type { Skill } from '@ionio-skills/core/types';
import { useState } from 'react';
import { useSearchParams } from 'react-router';

import { CodeBlock } from '@/components/common/CodeBlock';
import { EmptyState } from '@/components/common/States';
import { Markdown } from '@/components/markdown/Markdown';
import { Card } from '@/components/ui/card';
import { Segmented } from '@/components/ui/segmented';
import { Skeleton } from '@/components/ui/skeleton';
import { Tooltip } from '@/components/ui/tooltip';
import { cn } from '@/lib/cn';
import { formatBytes, formatCompact } from '@/lib/format';
import { useSkillFile } from '@/lib/queries';

export function FilesTab({ skill }: { skill: Skill }) {
  const [params, setParams] = useSearchParams();
  const [view, setView] = useState<'rendered' | 'raw'>('rendered');
  const requested = params.get('file');
  const selected =
    skill.references.find((file) => file.path === requested) ?? skill.references.find((file) => file.isText);
  const { data, isLoading } = useSkillFile(skill.name, selected?.isText ? selected.path : null);

  if (skill.references.length === 0) {
    return (
      <EmptyState icon={<File size={22} />} title="No bundled files">
        This skill is a single SKILL.md. Supporting material goes in a{' '}
        <code className="font-mono">references/</code> folder next to it.
      </EmptyState>
    );
  }

  const isMarkdown = selected?.name.endsWith('.md');
  return (
    <div className="grid gap-5 lg:grid-cols-[220px_minmax(0,1fr)]">
      <ul className="flex flex-col gap-0.5">
        {skill.references.map((file) => (
          <li key={file.path}>
            <button
              disabled={!file.isText}
              onClick={() => setParams({ tab: 'files', file: file.path }, { replace: true })}
              className={cn(
                'flex w-full items-start gap-2 rounded-md px-2.5 py-2 text-left transition-colors disabled:cursor-not-allowed disabled:opacity-60',
                selected?.path === file.path ? 'bg-surface ring-1 ring-line' : 'hover:bg-surface-2',
              )}
            >
              <FileText size={15} className="mt-0.5 shrink-0 text-ink-3" />
              <span className="min-w-0">
                <span className="block truncate font-mono text-[12.5px] text-ink" title={file.path}>
                  {file.name}
                </span>
                <span className="tabular mt-0.5 flex items-center gap-1.5 text-[11.5px] text-ink-3">
                  {file.path.includes('/') && (
                    <span className="truncate font-mono">
                      {file.path.slice(0, file.path.lastIndexOf('/') + 1)}
                    </span>
                  )}
                  <span className="shrink-0">
                    {file.isText ? `${formatCompact(file.stats.words)} words` : formatBytes(file.stats.bytes)}
                  </span>
                  {!file.mentionedInSkill && (
                    <Tooltip content="SKILL.md never mentions this file, so agents have no cue to load it">
                      <WarningCircle size={12} className="text-warn" />
                    </Tooltip>
                  )}
                </span>
              </span>
            </button>
          </li>
        ))}
      </ul>

      <Card className="min-w-0 overflow-hidden">
        {selected && (
          <div className="flex h-11 items-center justify-between gap-3 border-b border-line px-4">
            <span className="truncate font-mono text-[12px] text-ink-3">
              {skill.path}/{selected.path}
            </span>
            {isMarkdown && (
              <Segmented
                label="View"
                value={view}
                onValueChange={(value) => setView(value as 'rendered' | 'raw')}
                options={[
                  { value: 'rendered', label: 'Rendered' },
                  { value: 'raw', label: 'Raw' },
                ]}
              />
            )}
          </div>
        )}
        <div className="p-6">
          {isLoading || !data ? (
            <div className="flex flex-col gap-3">
              <Skeleton className="h-6 w-1/3" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
            </div>
          ) : isMarkdown && view === 'rendered' ? (
            <Markdown sourcePath={`${skill.path}/${data.file.path}`} mono>
              {data.content}
            </Markdown>
          ) : (
            <CodeBlock code={data.content} label={data.file.name} className="-m-2" />
          )}
        </div>
      </Card>
    </div>
  );
}
