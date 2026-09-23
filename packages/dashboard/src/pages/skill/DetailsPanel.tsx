/**
 * The skill's side panel: size and freshness, how an agent loads it, and which
 * skills it is connected to.
 */
import type { Skill, SkillRef } from '@ionio-skills/core/types';
import type { ReactNode } from 'react';
import { Link } from 'react-router';

import { CopyButton } from '@/components/common/CopyButton';
import { RelativeTime } from '@/components/common/RelativeTime';
import { DepartmentDot } from '@/components/skill/DepartmentMark';
import { Tooltip } from '@/components/ui/tooltip';
import { estimateTokens, formatBytes, formatNumber, plural } from '@/lib/format';
import { useServerInfo } from '@/lib/queries';

export function DetailsPanel({ skill }: { skill: Skill }) {
  const { data: server } = useServerInfo();
  const serverName = server?.name ?? 'ionio-skills';

  return (
    <div className="flex flex-col gap-7 text-[13px]">
      <Section title="Details">
        <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2">
          <Row label="Words">{formatNumber(skill.stats.words)}</Row>
          <Row label="Tokens">
            <Tooltip content="Estimated context cost of loading SKILL.md (about 1.35 tokens per word)">
              <span className="cursor-help">≈ {formatNumber(estimateTokens(skill.stats.words))}</span>
            </Tooltip>
          </Row>
          <Row label="Size">
            {plural(skill.stats.lines, 'line')} · {formatBytes(skill.stats.bytes)}
          </Row>
          <Row label="Sections">{skill.headings.filter((heading) => heading.depth === 2).length}</Row>
          <Row label="Updated">
            {skill.updated ? (
              <RelativeTime iso={skill.updated.date} />
            ) : (
              <span className="text-warn">Uncommitted</span>
            )}
          </Row>
          <Row label="Path">
            <code className="font-mono text-[12px] break-all">{skill.path}/</code>
          </Row>
        </dl>
      </Section>

      <Section title="Load it from an agent">
        <div className="flex flex-col gap-2">
          <Snippet label="Tool call" value={`get_skill({ "name": "${skill.name}" })`} />
          <Snippet label="Resource" value={`skills://skill/${skill.name}`} />
          <Snippet label="Claude Code prompt" value={`/mcp__${serverName}__${skill.name}`} />
        </div>
      </Section>

      {(skill.related.outgoing.length > 0 || skill.related.incoming.length > 0) && (
        <Section title="Connected skills">
          <RelatedList label="Mentions" refs={skill.related.outgoing} />
          <RelatedList label="Mentioned by" refs={skill.related.incoming} />
        </Section>
      )}
    </div>
  );
}

// ─── Pieces ─────────────────────────────────────────────────────────────────

const Section = ({ title, children }: { title: string; children: ReactNode }) => (
  <section>
    <h2 className="mb-3 text-[12px] font-medium text-ink-3">{title}</h2>
    {children}
  </section>
);

const Row = ({ label, children }: { label: string; children: ReactNode }) => (
  <>
    <dt className="text-ink-3">{label}</dt>
    <dd className="tabular min-w-0 text-ink">{children}</dd>
  </>
);

function Snippet({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-line bg-surface">
      <div className="flex items-center justify-between py-0.5 pr-0.5 pl-3">
        <span className="text-[11.5px] text-ink-3">{label}</span>
        <CopyButton value={value} label={`Copy ${label.toLowerCase()}`} />
      </div>
      <code
        className="block truncate border-t border-line px-3 py-2 font-mono text-[12px] text-ink"
        title={value}
      >
        {value}
      </code>
    </div>
  );
}

function RelatedList({ label, refs }: { label: string; refs: SkillRef[] }) {
  if (refs.length === 0) return null;
  return (
    <div className="mb-3">
      <p className="mb-1.5 text-[12px] text-ink-3">{label}</p>
      <ul className="flex flex-col gap-0.5">
        {refs.map((ref) => (
          <li key={ref.name}>
            <Link
              to={`/skills/${ref.name}`}
              className="-mx-2 flex items-center gap-2 rounded-md px-2 py-1.5 font-mono text-[12.5px] text-ink-2 transition-colors hover:bg-surface-2 hover:text-ink"
            >
              <DepartmentDot id={ref.department} />
              {ref.name}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
