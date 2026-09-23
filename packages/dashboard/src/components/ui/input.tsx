import type { ComponentProps, ReactNode } from 'react';

import { cn } from '@/lib/cn';

/** Text input with an optional leading icon and trailing slot. */
export function Input({
  className,
  icon,
  trailing,
  ...props
}: ComponentProps<'input'> & { icon?: ReactNode; trailing?: ReactNode }) {
  return (
    <label
      className={cn(
        'flex h-8 items-center gap-2 rounded-md border border-line bg-surface px-2.5 text-[13px] transition-colors',
        'focus-within:border-line-strong focus-within:ring-2 focus-within:ring-accent-soft',
        className,
      )}
    >
      {icon && <span className="text-ink-3">{icon}</span>}
      <input
        className="min-w-0 flex-1 bg-transparent text-ink outline-none placeholder:text-ink-3"
        {...props}
      />
      {trailing}
    </label>
  );
}
