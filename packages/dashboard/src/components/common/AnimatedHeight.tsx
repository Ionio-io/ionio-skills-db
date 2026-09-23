/**
 * Animates its own height to fit its content. Lists that filter wrap their rows in
 * this, so rows can leave instantly (no ghost gap while they fade) while the card
 * around them still resizes smoothly instead of snapping.
 */
import { motion } from 'motion/react';
import { useLayoutEffect, useRef, useState, type ReactNode } from 'react';

export function AnimatedHeight({ children, className }: { children: ReactNode; className?: string }) {
  const inner = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState<number | 'auto'>('auto');

  useLayoutEffect(() => {
    const element = inner.current;
    if (!element) return;
    const observer = new ResizeObserver(([entry]) => {
      if (entry) setHeight(entry.contentRect.height);
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return (
    <motion.div
      className={className}
      style={{ overflow: 'hidden' }}
      initial={false}
      animate={{ height }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
    >
      <div ref={inner}>{children}</div>
    </motion.div>
  );
}
