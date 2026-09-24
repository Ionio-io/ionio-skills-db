/**
 * A department's identity: its colour dot, alone or as a linked badge. Colours
 * come from the catalog order, so the same department looks the same everywhere.
 */
import { Link } from 'react-router';

import { cn } from '@/lib/cn';
import { departmentColor } from '@/lib/departments';
import { useCatalog } from '@/lib/queries';

export function useDepartmentColor(id: string): string {
  const { data } = useCatalog();
  return departmentColor(id, data?.departments ?? []);
}

export function DepartmentDot({ id, className }: { id: string; className?: string }) {
  const color = useDepartmentColor(id);
  return (
    <span
      aria-hidden
      className={cn('inline-block size-2 shrink-0 rounded-full', className)}
      style={{ background: color }}
    />
  );
}

export function DepartmentBadge({ id, link = true }: { id: string; link?: boolean }) {
  const { data } = useCatalog();
  const title = data?.departments.find((department) => department.id === id)?.title ?? id;
  const content = (
    <>
      <DepartmentDot id={id} />
      {title}
    </>
  );
  const className =
    'inline-flex h-[22px] items-center gap-1.5 rounded-full bg-surface-2 px-2 text-[11.5px] font-medium text-ink-2 ring-1 ring-line ring-inset';
  return link ? (
    <Link
      to={`/departments/${id}`}
      className={cn(className, 'transition-colors hover:text-ink hover:ring-line-strong')}
    >
      {content}
    </Link>
  ) : (
    <span className={className}>{content}</span>
  );
}
