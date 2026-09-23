/** Breadcrumbs, title, supporting line and actions at the top of each page. */
import { CaretRight } from '@phosphor-icons/react';
import { Fragment, type ReactNode } from 'react';
import { Link } from 'react-router';

export interface Crumb {
  label: ReactNode;
  to?: string;
}

export function PageHeader({
  crumbs,
  title,
  description,
  actions,
  meta,
}: {
  crumbs?: Crumb[];
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  meta?: ReactNode;
}) {
  return (
    <header className="mb-8">
      {crumbs && crumbs.length > 0 && (
        <nav
          aria-label="Breadcrumb"
          className="mb-3 flex flex-wrap items-center gap-1 text-[12.5px] text-ink-3"
        >
          {crumbs.map((crumb, index) => (
            <Fragment key={index}>
              {index > 0 && <CaretRight size={11} className="text-ink-3/70" />}
              {crumb.to ? (
                <Link to={crumb.to} className="flex items-center gap-1.5 transition-colors hover:text-ink">
                  {crumb.label}
                </Link>
              ) : (
                <span className="flex items-center gap-1.5 text-ink-2">{crumb.label}</span>
              )}
            </Fragment>
          ))}
        </nav>
      )}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-[26px] leading-tight font-semibold tracking-[-0.02em] text-balance text-ink">
            {title}
          </h1>
          {description && (
            <div className="mt-2 max-w-[70ch] text-[14px] leading-relaxed text-ink-2">{description}</div>
          )}
          {meta && (
            <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-[12.5px] text-ink-3">
              {meta}
            </div>
          )}
        </div>
        {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
      </div>
    </header>
  );
}
