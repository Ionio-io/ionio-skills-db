/** A headline number with its label and a quiet supporting line. */
import type { ReactNode } from 'react';

import { Card } from '@/components/ui/card';
import { cn } from '@/lib/cn';

export function StatTile({
  label,
  value,
  detail,
  icon,
  className,
}: {
  label: string;
  value: ReactNode;
  detail?: ReactNode;
  icon?: ReactNode;
  className?: string;
}) {
  return (
    <Card className={cn('flex flex-col gap-3 p-4', className)}>
      <div className="flex items-center gap-1.5 text-[12.5px] text-ink-3">
        {icon}
        {label}
      </div>
      <div className="text-[26px] leading-none font-semibold tracking-tight text-ink">{value}</div>
      {detail && <div className="text-[12.5px] leading-snug text-ink-3">{detail}</div>}
    </Card>
  );
}
