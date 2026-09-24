/** Copies text to the clipboard and confirms with an icon swap and a toast. */
import { Check, Copy } from '@phosphor-icons/react';
import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

import { Button, type ButtonProps } from '@/components/ui/button';
import { Tooltip } from '@/components/ui/tooltip';

export function CopyButton({
  value,
  label = 'Copy',
  toastMessage,
  showLabel = false,
  ...props
}: { value: string; label?: string; toastMessage?: string; showLabel?: boolean } & Omit<
  ButtonProps,
  'value'
>) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const timer = setTimeout(() => setCopied(false), 1400);
    return () => clearTimeout(timer);
  }, [copied]);

  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      if (toastMessage) toast.success(toastMessage);
    } catch {
      toast.error('Could not copy. Your browser blocked clipboard access.');
    }
  }

  const icon = (
    <AnimatePresence mode="popLayout" initial={false}>
      <motion.span
        key={copied ? 'done' : 'copy'}
        initial={{ opacity: 0, scale: 0.6 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.6 }}
        transition={{ duration: 0.14 }}
        className="flex"
      >
        {copied ? <Check size={14} weight="bold" className="text-good" /> : <Copy size={14} />}
      </motion.span>
    </AnimatePresence>
  );

  const button = (
    <Button variant="ghost" size={showLabel ? 'sm' : 'icon-sm'} onClick={copy} aria-label={label} {...props}>
      {icon}
      {showLabel && <span>{copied ? 'Copied' : label}</span>}
    </Button>
  );
  return showLabel ? button : <Tooltip content={copied ? 'Copied' : label}>{button}</Tooltip>;
}
