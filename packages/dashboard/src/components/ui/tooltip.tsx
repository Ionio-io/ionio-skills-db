import { Tooltip as Primitive } from 'radix-ui';
import type { ReactNode } from 'react';

/** Wrap the app once so tooltips share open/close timing. */
export const TooltipProvider = ({ children }: { children: ReactNode }) => (
  <Primitive.Provider delayDuration={350} skipDelayDuration={150}>
    {children}
  </Primitive.Provider>
);

export function Tooltip({
  content,
  children,
  side = 'top',
}: {
  content: ReactNode;
  children: ReactNode;
  side?: 'top' | 'bottom' | 'left' | 'right';
}) {
  return (
    <Primitive.Root>
      <Primitive.Trigger asChild>{children}</Primitive.Trigger>
      <Primitive.Portal>
        <Primitive.Content
          side={side}
          sideOffset={6}
          className="z-50 max-w-xs rounded-md bg-ink px-2 py-1 text-[12px] leading-snug text-canvas shadow-pop animate-pop-in"
        >
          {content}
        </Primitive.Content>
      </Primitive.Portal>
    </Primitive.Root>
  );
}
