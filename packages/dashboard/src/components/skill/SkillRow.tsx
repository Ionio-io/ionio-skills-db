/** One skill in a list: name, what it's for, where it lives and how big it is. */
import { Files, LockSimple } from '@phosphor-icons/react';
import type { SkillSummary } from '@ionio-skills/core/types';
import { Link } from 'react-router';

import { RelativeTime } from '@/components/common/RelativeTime';
import { Badge } from '@/components/ui/badge';
import { Tooltip } from '@/components/ui/tooltip';
import { formatCompact } from '@/lib/format';

import { DepartmentBadge } from './DepartmentMark';

export function OptInBadge() {
  return (
    <Tooltip content="Applies only when the user explicitly asks for it">
      <Badge tone="warn">
        <LockSimple size={11} weight="bold" />
        Opt-in
      </Badge>
    </Tooltip>
  );
}

export function SkillRow({
  skill,
  showDepartment = true,
}: {
  skill: SkillSummary;
  showDepartment?: boolean;
}) {
  return (
    <div className="group relative grid gap-x-6 gap-y-2 px-5 py-4 transition-colors hover:bg-surface-2/60 md:grid-cols-[minmax(0,1fr)_auto]">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <Link
            to={`/skills/${skill.name}`}
            className="font-mono text-[13.5px] font-medium text-ink after:absolute after:inset-0 after:content-['']"
          >
            {skill.name}
          </Link>
          {skill.optIn && (
            <span className="relative z-10">
              <OptInBadge />
            </span>
          )}
        </div>
        <p className="mt-1 line-clamp-2 text-[13px] leading-relaxed text-ink-2">{skill.description}</p>
      </div>
      <div className="relative z-10 flex flex-wrap items-center gap-x-4 gap-y-1 text-[12px] text-ink-3 md:flex-col md:items-end md:justify-center">
        {showDepartment && <DepartmentBadge id={skill.department} />}
        <div className="tabular flex items-center gap-3">
          <span>{formatCompact(skill.stats.words)} words</span>
          {skill.referenceCount > 0 && (
            <span className="flex items-center gap-1">
              <Files size={12} />
              {skill.referenceCount}
            </span>
          )}
          {skill.updated ? <RelativeTime iso={skill.updated.date} /> : <span>Uncommitted</span>}
        </div>
      </div>
    </div>
  );
}
