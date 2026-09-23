/** "3 hours ago", with the exact time in a tooltip. Re-renders every minute. */
import { useEffect, useState } from 'react';

import { Tooltip } from '@/components/ui/tooltip';
import { formatDate, timeAgo } from '@/lib/format';

export function RelativeTime({ iso, className }: { iso: string; className?: string }) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 60_000);
    return () => clearInterval(timer);
  }, []);

  return (
    <Tooltip content={formatDate(iso)}>
      <time dateTime={iso} className={className}>
        {timeAgo(iso, now)}
      </time>
    </Tooltip>
  );
}
