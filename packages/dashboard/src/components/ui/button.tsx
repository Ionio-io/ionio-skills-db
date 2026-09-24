import { cva, type VariantProps } from 'class-variance-authority';
import { Slot } from 'radix-ui';
import type { ComponentProps } from 'react';

import { cn } from '@/lib/cn';

const buttonVariants = cva(
  'inline-flex shrink-0 items-center justify-center gap-1.5 whitespace-nowrap rounded-md text-[13px] font-medium ' +
    'transition-[background-color,color,border-color,transform] duration-150 active:scale-[0.98] ' +
    'disabled:pointer-events-none disabled:opacity-50 [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        primary: 'bg-ink text-canvas hover:bg-ink/85',
        secondary: 'border border-line bg-surface text-ink hover:border-line-strong hover:bg-surface-2',
        ghost: 'text-ink-2 hover:bg-surface-2 hover:text-ink',
      },
      size: {
        sm: 'h-7 px-2.5 text-[12.5px]',
        md: 'h-8 px-3',
        icon: 'size-8',
        'icon-sm': 'size-7',
      },
    },
    defaultVariants: { variant: 'secondary', size: 'md' },
  },
);

export interface ButtonProps extends ComponentProps<'button'>, VariantProps<typeof buttonVariants> {
  /** Render the child element (e.g. a link) with button styles instead of a <button>. */
  asChild?: boolean;
}

export function Button({ className, variant, size, asChild, ...props }: ButtonProps) {
  const Component = asChild ? Slot.Root : 'button';
  return <Component className={cn(buttonVariants({ variant, size }), className)} {...props} />;
}
