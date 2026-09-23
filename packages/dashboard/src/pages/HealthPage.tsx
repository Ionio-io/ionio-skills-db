/**
 * Health: every consistency problem the core library found, worst first, each
 * linked to the skill or department it belongs to, plus what is checked.
 */
import { CheckCircle, Info, SealCheck, Warning, WarningOctagon, type Icon } from '@phosphor-icons/react';
import type { HealthIssue, IssueSeverity } from '@ionio-skills/core/types';
import { AnimatePresence, motion } from 'motion/react';
import { useState, type ReactNode } from 'react';
import { Link } from 'react-router';

import { EmptyState, ErrorState, PageSkeleton } from '@/components/common/States';
import { PageHeader } from '@/components/layout/PageHeader';
import { DepartmentDot } from '@/components/skill/DepartmentMark';
import { Card } from '@/components/ui/card';
import { Segmented } from '@/components/ui/segmented';
import { cn } from '@/lib/cn';
import { plural } from '@/lib/format';
import { useHealth } from '@/lib/queries';

const SEVERITY: Record<IssueSeverity, { label: string; icon: Icon; tone: string; soft: string }> = {
  error: { label: 'Errors', icon: WarningOctagon, tone: 'text-bad', soft: 'bg-bad-soft' },
  warning: { label: 'Warnings', icon: Warning, tone: 'text-warn', soft: 'bg-warn-soft' },
  info: { label: 'Notes', icon: Info, tone: 'text-accent-ink', soft: 'bg-accent-soft' },
};

/** What the checks cover, in plain words (mirrors packages/core/src/health.ts). */
const CHECKS: Array<[string, string]> = [
  ['Frontmatter', 'Every SKILL.md opens with valid YAML holding a name and a description.'],
  ['Names', 'Names match their folder, use lowercase words joined by hyphens, and are unique.'],
  ['Descriptions', 'Each description fits the 1,024-character Agent Skills limit.'],
  ['Ledgers', 'Every department has a README, and every skill is listed in it and in the root index.'],
  ['Links', 'Every relative link in skills, references and ledgers points at a file that exists.'],
  ['References', 'Bundled files are mentioned in SKILL.md, so agents know when to load them.'],
];

export function HealthPage() {
  const { data: health, error } = useHealth();
  const [filter, setFilter] = useState<'all' | IssueSeverity>('all');

  if (error) return <ErrorState error={error} />;
  if (!health) return <PageSkeleton />;

  const visible = health.issues.filter((issue) => filter === 'all' || issue.severity === filter);
  const problems = health.counts.error + health.counts.warning;

  return (
    <>
      <PageHeader
        crumbs={[{ label: 'Library', to: '/' }, { label: 'Health' }]}
        title="Health"
        description="Consistency checks over every skill, ledger and link, re-run whenever a file changes."
      />

      <div className="mb-8 grid gap-3 sm:grid-cols-3">
        {(Object.keys(SEVERITY) as IssueSeverity[]).map((severity) => {
          const { label, icon: SeverityIcon, tone } = SEVERITY[severity];
          return (
            <Card key={severity} className="flex items-center gap-4 p-4">
              <SeverityIcon
                size={20}
                weight="duotone"
                className={health.counts[severity] ? tone : 'text-ink-3'}
              />
              <div>
                <div className="text-[22px] leading-none font-semibold text-ink">
                  {health.counts[severity]}
                </div>
                <div className="mt-1 text-[12.5px] text-ink-3">{label}</div>
              </div>
            </Card>
          );
        })}
      </div>

      {health.issues.length === 0 ? (
        <EmptyState
          icon={<SealCheck size={26} weight="duotone" className="text-good" />}
          title="All checks pass"
        >
          Every skill is well formed, listed in its ledger, and every link resolves.
        </EmptyState>
      ) : (
        <>
          <div className="mb-3 flex items-center justify-between gap-4">
            <p className="text-[13px] text-ink-2">
              {problems > 0 ? `${plural(problems, 'problem')} to fix.` : 'No problems, only notes.'}
            </p>
            <Segmented
              label="Severity"
              value={filter}
              onValueChange={(value) => setFilter(value as typeof filter)}
              options={[
                { value: 'all', label: 'All' },
                ...(Object.keys(SEVERITY) as IssueSeverity[])
                  .filter((severity) => health.counts[severity] > 0)
                  .map((severity) => ({ value: severity, label: SEVERITY[severity].label })),
              ]}
            />
          </div>
          <Card className="overflow-hidden">
            <ul className="divide-y divide-line">
              <AnimatePresence initial={false}>
                {visible.map((issue, index) => (
                  <motion.li
                    key={`${issue.code}-${issue.file ?? ''}-${issue.skill ?? ''}-${index}`}
                    layout="position"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <IssueRow issue={issue} />
                  </motion.li>
                ))}
              </AnimatePresence>
            </ul>
          </Card>
        </>
      )}

      <section className="mt-12">
        <h2 className="mb-3 text-[13px] font-medium text-ink">What is checked</h2>
        <dl className="grid gap-x-8 gap-y-4 sm:grid-cols-2">
          {CHECKS.map(([name, detail]) => (
            <div key={name} className="flex gap-3">
              <CheckCircle size={16} className="mt-0.5 shrink-0 text-ink-3" />
              <div>
                <dt className="text-[13px] font-medium text-ink">{name}</dt>
                <dd className="mt-0.5 text-[12.5px] leading-relaxed text-ink-3">{detail}</dd>
              </div>
            </div>
          ))}
        </dl>
      </section>
    </>
  );
}

function IssueRow({ issue }: { issue: HealthIssue }) {
  const { icon: SeverityIcon, tone, soft } = SEVERITY[issue.severity];
  return (
    <div className="flex items-start gap-3.5 px-5 py-4">
      <span className={cn('mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-md', soft)}>
        <SeverityIcon size={14} weight="bold" className={tone} />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-[13.5px] leading-relaxed text-ink">{withCode(issue.message)}</p>
        <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[12px] text-ink-3">
          {issue.skill && (
            <Link
              to={`/skills/${issue.skill}`}
              className="flex items-center gap-1.5 font-mono hover:text-ink"
            >
              {issue.department && <DepartmentDot id={issue.department} />}
              {issue.skill}
            </Link>
          )}
          {!issue.skill && issue.department && (
            <Link
              to={`/departments/${issue.department}`}
              className="flex items-center gap-1.5 hover:text-ink"
            >
              <DepartmentDot id={issue.department} />
              {issue.department}
            </Link>
          )}
          {issue.file && <code className="font-mono">{issue.file}</code>}
          <span className="rounded bg-surface-2 px-1.5 py-px font-mono text-[11px]">{issue.code}</span>
        </div>
      </div>
    </div>
  );
}

/** Renders `backticked` spans in issue messages as inline code. */
function withCode(message: string): ReactNode[] {
  return message.split(/(`[^`]+`)/g).map((part, index) =>
    part.startsWith('`') && part.endsWith('`') ? (
      <code key={index} className="rounded bg-surface-2 px-1 py-px font-mono text-[12.5px]">
        {part.slice(1, -1)}
      </code>
    ) : (
      part
    ),
  );
}
