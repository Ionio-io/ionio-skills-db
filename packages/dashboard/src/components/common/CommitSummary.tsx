/** One commit: subject, when and who, and the skills it touched (linked). */
import type { GitCommit } from '@ionio-skills/core/types';
import { Link } from 'react-router';

import { plural } from '@/lib/format';

import { RelativeTime } from './RelativeTime';

export function CommitSummary({ commit }: { commit: GitCommit }) {
  return (
    <div>
      <p className="text-[13px] leading-snug text-ink">{commit.subject}</p>
      <p className="mt-1 text-[12px] text-ink-3">
        <RelativeTime iso={commit.date} /> · {commit.author} ·{' '}
        {commit.skills.length > 0
          ? plural(commit.skills.length, 'skill')
          : plural(commit.files.length, 'file')}
      </p>
      {commit.skills.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {commit.skills.slice(0, 6).map((name) => (
            <Link
              key={name}
              to={`/skills/${name}`}
              className="rounded bg-surface-2 px-1.5 py-0.5 font-mono text-[11px] text-ink-3 transition-colors hover:text-ink"
            >
              {name}
            </Link>
          ))}
          {commit.skills.length > 6 && (
            <span className="px-1 text-[11px] text-ink-3">+{commit.skills.length - 6}</span>
          )}
        </div>
      )}
    </div>
  );
}
