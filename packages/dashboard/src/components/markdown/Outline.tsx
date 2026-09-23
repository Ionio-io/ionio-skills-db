/**
 * "On this page": the document's headings, highlighting the section being read.
 * The outline keeps that entry in view as it changes, and a click glides the
 * document to the section instead of jumping.
 */
import type { Heading } from '@ionio-skills/core/types';
import { motion } from 'motion/react';
import { useCallback, useEffect, useId, useRef, useState, type RefObject } from 'react';

import { cn } from '@/lib/cn';

export function Outline({ headings }: { headings: Heading[] }) {
  const items = headings.filter((heading) => heading.depth === 2 || heading.depth === 3);
  const [active, select] = useActiveHeading(items.map((heading) => heading.slug));
  const navRef = useRef<HTMLElement>(null);
  useKeepActiveInView(navRef, active);
  const markerId = useId();
  if (items.length < 2) return null;

  return (
    <nav ref={navRef} aria-label="On this page" className="text-[12.5px]">
      {/* Stays in view when the outline scrolls inside its container. */}
      <p className="sticky top-0 z-10 bg-canvas pb-2 font-medium text-ink">On this page</p>
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
            {/* One line per heading; long ones end in an ellipsis, with the full text in the tooltip. */}
            <a
              href={`#${heading.slug}`}
              title={heading.text}
              onClick={(event) => {
                // Modified clicks keep their browser meaning (new tab, copy link).
                if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey)
                  return;
                event.preventDefault();
                select(heading.slug);
              }}
              className={cn(
                'block truncate py-1 leading-snug text-ink-3 transition-colors hover:text-ink',
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

/** How far below the top of the reading area a heading must pass to become current. */
const READING_LINE = 120;
/** Quiet time after a click-scroll before scrolling takes over the highlight again. */
const SETTLE_MS = 150;

/**
 * The heading of the section being read, and a way to go to one. On a click the
 * highlight moves straight to the target and holds there while the scroll glides past
 * the sections in between.
 */
function useActiveHeading(slugs: string[]): [string | null, (slug: string) => void] {
  const [active, setActive] = useState<string | null>(null);
  const lock = useRef<{ timer: number } | null>(null);
  const key = slugs.join('|');

  useEffect(() => {
    const elements = key
      .split('|')
      .map((slug) => document.getElementById(slug))
      .filter((element): element is HTMLElement => element !== null);
    const [first] = elements;
    if (!first) return;

    let frame = 0;
    const update = () => {
      frame = 0;
      setActive(currentHeading(first, elements));
    };
    const onScroll = () => {
      // During a click-scroll, each scroll pushes the release back until it settles.
      if (lock.current) {
        window.clearTimeout(lock.current.timer);
        lock.current.timer = window.setTimeout(() => (lock.current = null), SETTLE_MS);
        return;
      }
      if (!frame) frame = requestAnimationFrame(update);
    };

    frame = requestAnimationFrame(update);
    // Capture sees scrolls of every container (the document card), not only the page.
    window.addEventListener('scroll', onScroll, { capture: true, passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', onScroll, { capture: true });
      window.removeEventListener('resize', onScroll);
    };
  }, [key]);

  const select = useCallback((slug: string) => {
    const target = document.getElementById(slug);
    if (!target) return;
    setActive(slug);
    if (lock.current) window.clearTimeout(lock.current.timer);
    lock.current = { timer: window.setTimeout(() => (lock.current = null), SETTLE_MS) };
    // Scrolls the card and, until the reading pane is pinned, the page with it.
    target.scrollIntoView({ behavior: scrollBehavior(), block: 'start' });
    window.history.replaceState(window.history.state, '', `#${slug}`);
  }, []);

  return [active, select];
}

/** The last heading above the reading line; at the very end, the last one on screen. */
function currentHeading(first: HTMLElement, elements: HTMLElement[]): string {
  const scroller = scrollParent(first);
  const box = scroller ? scroller.getBoundingClientRect() : { top: 0, bottom: window.innerHeight };
  const top = Math.max(box.top, 0);
  const bottom = Math.min(box.bottom, window.innerHeight);

  // Sections at the end can never reach the line, so reaching the end selects the
  // last heading in view.
  const { scrollTop, scrollHeight, clientHeight } = scroller ?? document.documentElement;
  if (scrollTop > 0 && scrollTop + clientHeight >= scrollHeight - 2) {
    const last = elements.findLast((element) => element.getBoundingClientRect().top < bottom);
    if (last) return last.id;
  }

  let current = first;
  for (const element of elements) {
    if (element.getBoundingClientRect().top > top + READING_LINE) break;
    current = element;
  }
  return current.id;
}

/** Scrolls the outline's own container so the highlighted entry stays visible. */
function useKeepActiveInView(navRef: RefObject<HTMLElement | null>, active: string | null) {
  useEffect(() => {
    const nav = navRef.current;
    if (!nav || !active) return;
    const link = nav.querySelector(`a[href="#${CSS.escape(active)}"]`);
    // Only an outline with a scroller of its own; never move the page for this.
    const scroller = scrollParent(nav);
    if (!link || !scroller) return;

    const box = scroller.getBoundingClientRect();
    const item = link.getBoundingClientRect();
    // Room for the sticky title above, and for a neighbour or two on either side.
    const title = nav.querySelector('p')?.offsetHeight ?? 0;
    const margin = 48;
    const above = item.top - (box.top + title + margin);
    const below = item.bottom - (box.bottom - margin);
    const delta = above < 0 ? above : below > 0 ? below : 0;
    if (delta !== 0) scroller.scrollBy({ top: delta, behavior: scrollBehavior() });
  }, [navRef, active]);
}

/** The nearest ancestor that scrolls its content, or null when that is the page. */
function scrollParent(element: HTMLElement): HTMLElement | null {
  for (let node = element.parentElement; node && node !== document.body; node = node.parentElement) {
    // `hidden` counts: the reading pane locks its scrollers until it is pinned.
    if (
      /auto|scroll|hidden/.test(getComputedStyle(node).overflowY) &&
      node.scrollHeight > node.clientHeight
    ) {
      return node;
    }
  }
  return null;
}

const scrollBehavior = (): ScrollBehavior =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth';
