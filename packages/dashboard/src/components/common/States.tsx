/** Empty, error and loading states shared by every page. */
import { WarningCircle } from '@phosphor-icons/react';
import type { ReactNode } from 'react';
import { Link } from 'react-router';

import { Skeleton } from '@/components/ui/skeleton';
import { ApiError } from '@/lib/api';

export function EmptyState({
  icon,
  title,
  children,
}: {
  icon?: ReactNode;
  title: string;
  children?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-line-strong px-6 py-14 text-center">
      {icon && <div className="mb-1 text-ink-3">{icon}</div>}
      <p className="text-[14px] font-medium text-ink">{title}</p>
      {children && <div className="max-w-sm text-[13px] text-ink-3">{children}</div>}
    </div>
  );
}

/** Shows an API failure; for 404s it offers the server's "did you mean" suggestions. */
export function ErrorState({
  error,
  suggestionHref,
}: {
  error: unknown;
  suggestionHref?: (name: string) => string;
}) {
  const message =
    error instanceof Error ? error.message.replace(/ Did you mean.*$/, '') : 'Something went wrong.';
  const suggestions = error instanceof ApiError ? error.suggestions : [];
  return (
    <EmptyState icon={<WarningCircle size={22} />} title={message.replaceAll('`', '')}>
      {suggestions.length > 0 && suggestionHref ? (
        <span>
          Did you mean{' '}
          {suggestions.map((name, index) => (
            <span key={name}>
              {index > 0 && ', '}
              <Link to={suggestionHref(name)} className="font-medium text-accent-ink hover:underline">
                {name}
              </Link>
            </span>
          ))}
          ?
        </span>
      ) : (
        'Check that the server is running, then reload.'
      )}
    </EmptyState>
  );
}

export function PageSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <Skeleton className="h-7 w-56" />
      <Skeleton className="h-4 w-96 max-w-full" />
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }, (_, index) => (
          <Skeleton key={index} className="h-[108px] rounded-xl" />
        ))}
      </div>
      <Skeleton className="h-64 rounded-xl" />
    </div>
  );
}
