/** Every commit that touched the skill's folder, newest first. */
import { GitCommit } from '@phosphor-icons/react';
import type { Skill } from '@ionio-skills/core/types';

import { RelativeTime } from '@/components/common/RelativeTime';
import { EmptyState } from '@/components/common/States';
import { Card } from '@/components/ui/card';
import { shortSha } from '@/lib/format';

export function HistoryTab({ skill }: { skill: Skill }) {
  if (skill.history.length === 0) {
    return (
      <EmptyState icon={<GitCommit size={22} />} title="Not committed yet">
        Commit this skill to start its history.
      </EmptyState>
    );
  }
  return (
    <Card className="overflow-hidden">
      <ol className="divide-y divide-line">
        {skill.history.map((commit) => (
          <li key={commit.commit} className="flex items-start gap-4 px-5 py-4">
            <GitCommit size={16} className="mt-0.5 shrink-0 text-ink-3" />
            <div className="min-w-0 flex-1">
              <p className="text-[13.5px] text-ink">{commit.subject}</p>
              <p className="mt-1 text-[12px] text-ink-3">
                {commit.author} · <RelativeTime iso={commit.date} />
              </p>
            </div>
            <code className="shrink-0 rounded bg-surface-2 px-1.5 py-0.5 font-mono text-[11.5px] text-ink-3">
              {shortSha(commit.commit)}
            </code>
          </li>
        ))}
      </ol>
    </Card>
  );
}
