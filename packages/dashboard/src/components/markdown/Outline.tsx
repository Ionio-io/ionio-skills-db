/**
 * "On this page": the document's headings, highlighting the section in view.
 * An IntersectionObserver tracks which heading is nearest the top of the viewport.
 */
import type { Heading } from '@ionio-skills/core/types';
import { motion } from 'motion/react';
import { useEffect, useId, useState } from 'react';

import { cn } from '@/lib/cn';

export function Outline({ headings }: { headings: Heading[] }) {
  const items = headings.filter((heading) => heading.depth === 2 || heading.depth === 3);
  const active = useActiveHeading(items.map((heading) => heading.slug));
  const markerId = useId();
  if (items.length < 2) return null;

  return (
    <nav aria-label="On this page" className="text-[12.5px]">
      <p className="mb-2 font-medium text-ink">On this page</p>
      <ul className="relative flex flex-col border-l border-line">
        {items.map((heading) => (
          <li key={heading.slug} className="relative">
            {active === heading.slug && (
              <motion.span
                layoutId={markerId}
                className="absolute top-0 -left-px h-full w-[2px] rounded-full bg-ink"
                transition={{ type: 'spring', stiffness: 500, damping: 40 }}
              />
            )}
            <a
              href={`#${heading.slug}`}
              className={cn(
                'block py-1 leading-snug text-ink-3 transition-colors hover:text-ink',
                heading.depth === 3 ? 'pl-6' : 'pl-3',
                active === heading.slug && 'text-ink',
              )}
            >
              {heading.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}

function useActiveHeading(slugs: string[]): string | null {
  const [active, setActive] = useState<string | null>(null);
  const key = slugs.join('|');

  useEffect(() => {
    const elements = key
      .split('|')
      .map((slug) => document.getElementById(slug))
      .filter((element): element is HTMLElement => element !== null);
    if (elements.length === 0) return;

    const visible = new Map<string, number>();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) visible.set(entry.target.id, entry.boundingClientRect.top);
          else visible.delete(entry.target.id);
        }
        // The topmost visible heading wins; above all of them, keep the last one passed.
        const top = [...visible.entries()].sort((a, b) => a[1] - b[1])[0];
        if (top) setActive(top[0]);
      },
      { rootMargin: '-72px 0px -60% 0px' },
    );
    elements.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, [key]);

  return active;
}
