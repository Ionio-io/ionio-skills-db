/**
 * Where the library's words live, by department: one stacked horizontal bar.
 *
 * Built to the dataviz mark spec: department colours in fixed catalog order,
 * a 2px surface gap between segments, rounded ends only on the outer segments,
 * a direct label under every segment (identity is never colour alone), ink-coloured
 * text, and a hover tooltip on every segment.
 */
import type { DepartmentSummary } from '@ionio-skills/core/types';
import { motion } from 'motion/react';
import { useState } from 'react';
import { Link } from 'react-router';

import { cn } from '@/lib/cn';
import { departmentColor } from '@/lib/departments';
import { formatCompact, formatNumber } from '@/lib/format';

export function CompositionBar({ departments }: { departments: DepartmentSummary[] }) {
  const [active, setActive] = useState<string | null>(null);
  const total = departments.reduce((sum, department) => sum + department.stats.words, 0);
  if (total === 0) return null;

  const segments = departments
    .filter((department) => department.stats.words > 0)
    .map((department) => ({
      department,
      share: department.stats.words / total,
      color: departmentColor(department.id, departments),
    }));
  const focused = segments.find((segment) => segment.department.id === active);

  return (
    <div onPointerLeave={() => setActive(null)}>
      {/*
        Bar and labels share one flex row definition (same flex-grow per department),
        so every label sits exactly under its own segment.
      */}
      <div className="relative">
        <div className="flex h-3 w-full gap-[2px]" role="img" aria-label="Words per department">
          {segments.map(({ department, share, color }, index) => (
            <motion.div
              key={department.id}
              initial={{ scaleX: 0, opacity: 0 }}
              animate={{ scaleX: 1, opacity: active && active !== department.id ? 0.35 : 1 }}
              transition={{ duration: 0.6, delay: index * 0.05, ease: [0.16, 1, 0.3, 1] }}
              style={{ flexGrow: share, flexBasis: 0, background: color, transformOrigin: 'left' }}
              className="h-full min-w-[3px] first:rounded-l-[4px] last:rounded-r-[4px]"
              onPointerEnter={() => setActive(department.id)}
            />
          ))}
        </div>
        {/* Tooltip: the hovered department's exact figures. */}
        {focused && (
          <div className="pointer-events-none absolute -top-2 left-1/2 z-10 -translate-x-1/2 -translate-y-full animate-pop-in rounded-md bg-ink px-2.5 py-1.5 text-[12px] whitespace-nowrap text-canvas shadow-pop">
            <span className="font-medium">{focused.department.title}</span>
            <span className="opacity-70">
              {' '}
              · {formatNumber(focused.department.stats.words)} words · {Math.round(focused.share * 100)}%
            </span>
          </div>
        )}
      </div>

      <ul className="mt-3 flex w-full gap-[2px]">
        {segments.map(({ department, share, color }) => (
          <li key={department.id} style={{ flexGrow: share, flexBasis: 0 }} className="min-w-0">
            <Link
              to={`/departments/${department.id}`}
              onPointerEnter={() => setActive(department.id)}
              className={cn(
                'group block rounded-md py-1 pr-2 transition-opacity',
                active && active !== department.id && 'opacity-45',
              )}
            >
              <span className="flex items-center gap-1.5 text-[12.5px]">
                <span className="size-2 shrink-0 rounded-full" style={{ background: color }} />
                <span className="truncate text-ink-2 transition-colors group-hover:text-ink">
                  {department.title}
                </span>
              </span>
              <span className="tabular mt-0.5 block truncate pl-3.5 text-[12px] text-ink-3">
                {formatCompact(department.stats.words)} · {Math.round(share * 100)}%
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
