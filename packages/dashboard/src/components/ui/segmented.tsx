/** A compact single-choice control (filters), with a pill that slides to the selection. */
import { motion } from 'motion/react';
import { ToggleGroup } from 'radix-ui';
import { useId, type ReactNode } from 'react';

import { cn } from '@/lib/cn';

export interface SegmentedOption {
  value: string;
  label: ReactNode;
}

export function Segmented({
  value,
  onValueChange,
  options,
  className,
  label,
}: {
  value: string;
  onValueChange: (value: string) => void;
  options: SegmentedOption[];
  className?: string;
  label: string;
}) {
  const pillId = useId();
  return (
    <ToggleGroup.Root
      type="single"
      value={value}
      // Radix emits "" when the active item is clicked again; keep a selection.
      onValueChange={(next) => next && onValueChange(next)}
      aria-label={label}
      className={cn(
        'flex flex-wrap gap-0.5 rounded-lg bg-surface-2 p-0.5 ring-1 ring-line ring-inset',
        className,
      )}
    >
      {options.map((option) => (
        <ToggleGroup.Item
          key={option.value}
          value={option.value}
          className="relative flex h-7 items-center gap-1.5 rounded-md px-2.5 text-[12.5px] font-medium text-ink-3 transition-colors hover:text-ink data-[state=on]:text-ink"
        >
          {value === option.value && (
            <motion.span
              layoutId={pillId}
              className="absolute inset-0 rounded-md bg-surface shadow-[0_1px_2px_rgb(0_0_0/0.08)] ring-1 ring-line"
              transition={{ type: 'spring', stiffness: 520, damping: 40 }}
            />
          )}
          <span className="relative flex items-center gap-1.5">{option.label}</span>
        </ToggleGroup.Item>
      ))}
    </ToggleGroup.Root>
  );
}
