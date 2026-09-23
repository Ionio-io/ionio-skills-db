import { cva, type VariantProps } from 'class-variance-authority';
import type { ComponentProps } from 'react';

import { cn } from '@/lib/cn';

const badgeVariants = cva(
  'inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2 py-0.5 text-[11.5px] font-medium leading-4',
  {
    variants: {
      tone: {
        neutral: 'bg-surface-2 text-ink-2 ring-1 ring-line ring-inset',
        accent: 'bg-accent-soft text-accent-ink',
        good: 'bg-good-soft text-good',
        warn: 'bg-warn-soft text-warn',
        bad: 'bg-bad-soft text-bad',
        outline: 'text-ink-2 ring-1 ring-line-strong ring-inset',
      },
    },
    defaultVariants: { tone: 'neutral' },
  },
);

export function Badge({
  className,
  tone,
  ...props
}: ComponentProps<'span'> & VariantProps<typeof badgeVariants>) {
  return <span className={cn(badgeVariants({ tone }), className)} {...props} />;
}
