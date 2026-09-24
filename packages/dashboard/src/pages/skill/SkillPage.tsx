/**
 * One skill, everything about it:
 *   Instructions  the rendered SKILL.md with a live outline
 *   Files         bundled reference files, each viewable rendered or raw
 *   Source        the exact SKILL.md an agent receives
 *   History       every commit that touched the skill
 * The side panel carries its stats, relations and how to load it from an agent.
 * The active tab (and file) live in the URL, so every view is linkable.
 */
import { ArrowSquareOut, Lightning } from '@phosphor-icons/react';
import { useSyncExternalStore } from 'react';
import { useParams, useSearchParams } from 'react-router';

import { CodeBlock } from '@/components/common/CodeBlock';
import { CopyButton } from '@/components/common/CopyButton';
import { ErrorState, PageSkeleton } from '@/components/common/States';
import { PageHeader } from '@/components/layout/PageHeader';
import { Outline } from '@/components/markdown/Outline';
import { DepartmentBadge, DepartmentDot } from '@/components/skill/DepartmentMark';
import { OptInBadge } from '@/components/skill/SkillRow';
import { Button } from '@/components/ui/button';
import { TabPanel, Tabs } from '@/components/ui/tabs';
import { Tooltip } from '@/components/ui/tooltip';
import { cn } from '@/lib/cn';
import { useCatalog, useSkill } from '@/lib/queries';

import { DetailsPanel } from './DetailsPanel';
import { FilesTab } from './FilesTab';
import { HistoryTab } from './HistoryTab';
import { InstructionsTab } from './InstructionsTab';
import { PANE_SCROLLER } from './pane';

const TABS = ['instructions', 'files', 'source', 'history'] as const;

/** A tab panel that fills the rest of the reading pane on desktop. */
const PANE = 'pt-6 xl:flex xl:min-h-0 xl:flex-1 xl:flex-col';
type Tab = (typeof TABS)[number];

export function SkillPage() {
  const { name = '' } = useParams();
  const { data: skill, error } = useSkill(name);
  const { data: catalog } = useCatalog();
  const [params, setParams] = useSearchParams();
  const requested = params.get('tab') as Tab | null;
  const tab: Tab = requested && TABS.includes(requested) ? requested : 'instructions';
  const pinned = usePageScrolledToEnd();

  if (error) return <ErrorState error={error} suggestionHref={(suggestion) => `/skills/${suggestion}`} />;
  if (!skill) return <PageSkeleton />;

  const department = catalog?.departments.find((candidate) => candidate.id === skill.department);
  const setTab = (next: string) => setParams(next === 'instructions' ? {} : { tab: next }, { replace: true });

  return (
    <>
      <PageHeader
        crumbs={[
          {
            label: (
              <>
                <DepartmentDot id={skill.department} />
                {department?.title ?? skill.department}
              </>
            ),
            to: `/departments/${skill.department}`,
          },
          { label: <span className="font-mono">{skill.name}</span> },
        ]}
        title={skill.title}
        meta={
          <>
            <code className="font-mono text-[12.5px] text-ink-2">{skill.name}</code>
            <DepartmentBadge id={skill.department} />
            {skill.optIn && <OptInBadge />}
          </>
        }
        actions={
          <>
            <CopyButton
              value={skill.raw}
              label="Copy SKILL.md"
              showLabel
              variant="secondary"
              toastMessage="SKILL.md copied"
            />
            <Tooltip content="Open the folder in VS Code">
              <Button asChild variant="secondary" size="icon" aria-label="Open in editor">
                <a href={`vscode://file/${skill.absolutePath}/SKILL.md`}>
                  <ArrowSquareOut size={14} />
                </a>
              </Button>
            </Tooltip>
          </>
        }
      />

      {/* The description is the trigger: it is all an agent sees before loading the skill. */}
      <div className="mb-8 rounded-xl border border-line bg-surface p-5">
        <p className="mb-2 flex items-center gap-1.5 text-[12px] font-medium text-ink-3">
          <Lightning size={13} weight="fill" className="text-accent" />
          When agents use it
        </p>
        <p className="text-[14px] leading-relaxed text-ink">{skill.description || 'No description.'}</p>
      </div>

      {/*
        Reading pane (desktop). Tabs, document and side rail form one block exactly one
        viewport tall, so the page scrolls until the tabs reach the top and stops there;
        from then on only the document scrolls, inside its card, while the rail stays put.
        The negative bottom margin cancels the shell's page padding so the pane can rest
        flush at the top. Below xl the rail stacks underneath and everything flows normally.
      */}
      <div
        data-pinned={pinned || undefined}
        className="group grid gap-10 xl:-mb-24 xl:h-[calc(100dvh-24px)] xl:grid-cols-[minmax(0,1fr)_288px] xl:pb-6"
      >
        <div className="flex min-w-0 flex-col xl:min-h-0">
          <Tabs
            value={tab}
            onValueChange={setTab}
            className="flex flex-col xl:min-h-0 xl:flex-1"
            items={[
              { value: 'instructions', label: 'Instructions' },
              { value: 'files', label: 'Files', count: skill.references.length },
              { value: 'source', label: 'Source' },
              { value: 'history', label: 'History', count: skill.history.length },
            ]}
          >
            <TabPanel value="instructions" className={PANE}>
              <InstructionsTab skill={skill} />
            </TabPanel>
            <TabPanel value="files" className={cn(PANE, PANE_SCROLLER)}>
              <FilesTab skill={skill} />
            </TabPanel>
            <TabPanel value="source" className={cn(PANE, PANE_SCROLLER)}>
              <CodeBlock code={skill.raw} label={`${skill.path}/SKILL.md`} />
            </TabPanel>
            <TabPanel value="history" className={cn(PANE, PANE_SCROLLER)}>
              <HistoryTab skill={skill} />
            </TabPanel>
          </Tabs>
        </div>

        {/* The rail itself never scrolls: the details sit still and only the outline,
            which takes the space left below them, scrolls. */}
        <aside className="flex flex-col gap-8 xl:min-h-0 xl:pb-2">
          <DetailsPanel skill={skill} />
          {tab === 'instructions' && (
            <div className={cn('hidden xl:block xl:min-h-0 xl:flex-1', PANE_SCROLLER)}>
              <Outline headings={skill.headings} />
            </div>
          )}
        </aside>
      </div>
    </>
  );
}

/**
 * Whether the page is scrolled all the way down. The reading pane ends the page, so
 * this is exactly when it is pinned with the tabs at the top.
 */
function usePageScrolledToEnd(): boolean {
  return useSyncExternalStore(
    (onChange) => {
      window.addEventListener('scroll', onChange, { passive: true });
      window.addEventListener('resize', onChange);
      return () => {
        window.removeEventListener('scroll', onChange);
        window.removeEventListener('resize', onChange);
      };
    },
    // A couple of pixels of slack for the fractional heights dvh produces.
    () => window.scrollY >= document.documentElement.scrollHeight - window.innerHeight - 2,
  );
}
