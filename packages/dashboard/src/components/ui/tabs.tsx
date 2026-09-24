/**
 * Tabs with a sliding underline. Radix handles keyboard navigation and ARIA; the
 * indicator is a shared-layout `motion` element, so it glides between triggers.
 */
import { motion } from 'motion/react';
import { Tabs as Primitive } from 'radix-ui';
import { useId, type ReactNode } from 'react';

import { cn } from '@/lib/cn';

export interface TabItem {
  value: string;
  label: ReactNode;
  count?: number;
}

export function Tabs({
  value,
  onValueChange,
  items,
  children,
  className,
}: {
  value: string;
  onValueChange: (value: string) => void;
  items: TabItem[];
  children: ReactNode;
  className?: string;
}) {
  const indicatorId = useId();
  return (
    <Primitive.Root value={value} onValueChange={onValueChange} className={className}>
      <Primitive.List className="relative flex gap-5 border-b border-line">
        {items.map((item) => (
          <Primitive.Trigger
            key={item.value}
            value={item.value}
            className={cn(
              'relative -mb-px flex h-9 items-center gap-1.5 text-[13px] font-medium text-ink-3 transition-colors',
              'hover:text-ink data-[state=active]:text-ink',
            )}
          >
            {item.label}
            {item.count !== undefined && (
              <span className="tabular rounded-full bg-surface-2 px-1.5 text-[11px] leading-4 text-ink-3">
                {item.count}
              </span>
            )}
            {value === item.value && (
              <motion.span
                layoutId={indicatorId}
                className="absolute inset-x-0 -bottom-px h-[2px] rounded-full bg-ink"
                transition={{ type: 'spring', stiffness: 520, damping: 42 }}
              />
            )}
          </Primitive.Trigger>
        ))}
      </Primitive.List>
      {children}
    </Primitive.Root>
  );
}

export const TabPanel = ({
  value,
  children,
  className,
}: {
  value: string;
  children: ReactNode;
  className?: string;
}) => (
  <Primitive.Content value={value} className={cn('outline-none', className)}>
    {children}
  </Primitive.Content>
);
