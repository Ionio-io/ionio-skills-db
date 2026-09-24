/**
 * Overview: the state of the whole library at a glance. Headline numbers, where
 * the knowledge sits, every department, what changed recently, and how to connect.
 */
import {
  ArrowRight,
  Books,
  CheckCircle,
  GitCommit as GitCommitIcon,
  Plugs,
  Stack,
  TextAlignLeft,
  Warning,
} from '@phosphor-icons/react';
import type { Catalog, DepartmentSummary } from '@ionio-skills/core/types';
import { motion } from 'motion/react';
import { Link } from 'react-router';

import { CommitSummary } from '@/components/common/CommitSummary';
import { CompositionBar } from '@/components/common/CompositionBar';
import { CopyButton } from '@/components/common/CopyButton';
import { RelativeTime } from '@/components/common/RelativeTime';
import { StatTile } from '@/components/common/StatTile';
import { EmptyState, ErrorState, PageSkeleton } from '@/components/common/States';
import { PageHeader } from '@/components/layout/PageHeader';
import { DepartmentDot } from '@/components/skill/DepartmentMark';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { estimateTokens, formatCompact, plural } from '@/lib/format';
import { useActivity, useCatalog, useHealth, useServerInfo } from '@/lib/queries';

const stagger = (index: number) => ({
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.35, delay: Math.min(index, 10) * 0.04, ease: [0.16, 1, 0.3, 1] as const },
});

export function OverviewPage() {
  const { data: catalog, error } = useCatalog();
  if (error) return <ErrorState error={error} />;
  if (!catalog) return <PageSkeleton />;

  const { stats } = catalog;
  return (
    <>
      <PageHeader
        title="Skills library"
        description={`${plural(stats.skills, 'skill')} across ${plural(stats.departments, 'department')}, each one a set of instructions an agent loads before doing that kind of work.`}
        meta={
          stats.lastUpdated && (
            <span className="flex items-center gap-1.5">
              <GitCommitIcon size={13} />
              Updated <RelativeTime iso={stats.lastUpdated.date} /> · {stats.lastUpdated.subject}
            </span>
          )
        }
      />

      <StatRow catalog={catalog} />

      <Card className="mt-4 p-5">
        <div className="mb-4 flex items-baseline justify-between gap-4">
          <h2 className="text-[13px] font-medium text-ink">Where the knowledge lives</h2>
          <span className="tabular text-[12px] text-ink-3">{formatCompact(stats.words)} words</span>
        </div>
        <CompositionBar departments={catalog.departments} />
      </Card>

      <div className="mt-10 grid gap-10 xl:grid-cols-[minmax(0,1fr)_340px]">
        <section>
          <SectionTitle title="Departments" to="/skills" linkLabel="All skills" />
          <div className="flex flex-col gap-3">
            {catalog.departments.map((department, index) => (
              <motion.div key={department.id} {...stagger(index)}>
                <DepartmentCard department={department} catalog={catalog} />
              </motion.div>
            ))}
          </div>
        </section>

        <aside className="flex flex-col gap-10">
          <ConnectCard />
          <section>
            <SectionTitle title="Recent changes" />
            <ActivityFeed />
          </section>
        </aside>
      </div>
    </>
  );
}

// ─── Stats ──────────────────────────────────────────────────────────────────

function StatRow({ catalog }: { catalog: Catalog }) {
  const { data: health } = useHealth();
  const { stats } = catalog;
  const optIn = catalog.skills.filter((skill) => skill.optIn).length;
  const largest = [...catalog.departments].sort((a, b) => b.skillNames.length - a.skillNames.length)[0];
  const problems = health ? health.counts.error + health.counts.warning : 0;

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <StatTile
        label="Skills"
        icon={<Books size={14} />}
        value={stats.skills}
        detail={`${plural(stats.references, 'bundled file')}${optIn ? ` · ${optIn} opt-in` : ''}`}
      />
      <StatTile
        label="Departments"
        icon={<Stack size={14} />}
        value={stats.departments}
        detail={largest && `Largest: ${largest.title} (${largest.skillNames.length})`}
      />
      <StatTile
        label="Words"
        icon={<TextAlignLeft size={14} />}
        value={formatCompact(stats.words)}
        detail={`≈ ${formatCompact(estimateTokens(stats.words))} tokens to load it all`}
      />
      <Link to="/health" className="group rounded-xl focus-visible:outline-offset-4">
        <StatTile
          label="Health"
          icon={
            problems > 0 ? (
              <Warning size={14} className="text-warn" />
            ) : (
              <CheckCircle size={14} className="text-good" />
            )
          }
          value={health ? (problems > 0 ? plural(problems, 'issue') : 'Healthy') : '·'}
          detail={
            health
              ? problems > 0
                ? `${health.counts.error} errors, ${health.counts.warning} warnings`
                : `All checks pass${health.counts.info ? `, ${plural(health.counts.info, 'note')}` : ''}`
              : 'Checking…'
          }
          className="h-full transition-colors group-hover:border-line-strong"
        />
      </Link>
    </div>
  );
}

// ─── Departments ────────────────────────────────────────────────────────────

function DepartmentCard({ department, catalog }: { department: DepartmentSummary; catalog: Catalog }) {
  const skills = catalog.skills.filter((skill) => skill.department === department.id);
  return (
    <Card className="group relative p-5 transition-colors hover:border-line-strong">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <Link
            to={`/departments/${department.id}`}
            className="flex items-center gap-2 text-[15px] font-medium text-ink after:absolute after:inset-0 after:content-['']"
          >
            <DepartmentDot id={department.id} />
            {department.title}
          </Link>
          {department.summary && (
            <p className="mt-1.5 line-clamp-2 text-[13px] leading-relaxed text-ink-2">{department.summary}</p>
          )}
        </div>
        <ArrowRight
          size={15}
          className="mt-1 shrink-0 text-ink-3 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:text-ink"
        />
      </div>
      <div className="relative z-10 mt-4 flex flex-wrap gap-1.5">
        {skills.map((skill) => (
          <Link
            key={skill.name}
            to={`/skills/${skill.name}`}
            className="rounded-md bg-surface-2 px-2 py-1 font-mono text-[11.5px] text-ink-2 ring-1 ring-line ring-inset transition-colors hover:text-ink hover:ring-line-strong"
          >
            {skill.name}
          </Link>
        ))}
      </div>
      <div className="tabular mt-4 flex flex-wrap gap-x-4 gap-y-1 text-[12px] text-ink-3">
        <span>{plural(skills.length, 'skill')}</span>
        <span>{formatCompact(department.stats.words)} words</span>
        {department.updated && (
          <span>
            Updated <RelativeTime iso={department.updated.date} />
          </span>
        )}
        {!department.hasReadme && <span className="text-warn">No ledger README</span>}
      </div>
    </Card>
  );
}

// ─── Sidebar cards ──────────────────────────────────────────────────────────

function ConnectCard() {
  const { data: server } = useServerInfo();
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Plugs size={14} className="text-ink-3" />
          Connect an agent
        </CardTitle>
        <Link to="/connect" className="text-[12px] text-ink-3 transition-colors hover:text-ink">
          Setup guide
        </Link>
      </CardHeader>
      <div className="px-5 pb-5">
        <p className="text-[12.5px] leading-relaxed text-ink-2">
          Any MCP client can list, search and load these skills from this endpoint.
        </p>
        <div className="mt-3 flex items-center gap-1 rounded-md border border-line bg-surface-2 py-1 pr-1 pl-2.5">
          <code className="flex-1 truncate font-mono text-[12px] text-ink">{server?.mcpUrl ?? '…'}</code>
          {server && <CopyButton value={server.mcpUrl} label="Copy URL" toastMessage="MCP URL copied" />}
        </div>
      </div>
    </Card>
  );
}

function ActivityFeed() {
  const { data: activity } = useActivity();
  if (!activity) return <div className="skeleton h-40 rounded-xl" />;
  if (activity.length === 0) {
    return <EmptyState title="No history yet">Commit skill changes to see them here.</EmptyState>;
  }
  return (
    <ol className="relative flex flex-col gap-5 border-l border-line pl-5">
      {activity.slice(0, 8).map((commit, index) => (
        <motion.li key={commit.commit} className="relative" {...stagger(index)}>
          <span className="absolute top-1.5 -left-[24.5px] size-2 rounded-full bg-surface ring-2 ring-line-strong" />
          <CommitSummary commit={commit} />
        </motion.li>
      ))}
    </ol>
  );
}

function SectionTitle({ title, to, linkLabel }: { title: string; to?: string; linkLabel?: string }) {
  return (
    <div className="mb-3 flex items-baseline justify-between">
      <h2 className="text-[13px] font-medium text-ink">{title}</h2>
      {to && (
        <Link to={to} className="text-[12px] text-ink-3 transition-colors hover:text-ink">
          {linkLabel}
        </Link>
      )}
    </div>
  );
}
