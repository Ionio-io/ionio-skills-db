/** App-wide providers: data cache, tooltips, motion preferences and toasts. */
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MotionConfig } from 'motion/react';
import type { ReactNode } from 'react';
import { Toaster } from 'sonner';

import { TooltipProvider } from '@/components/ui/tooltip';
import { ApiError } from '@/lib/api';
import { useTheme } from '@/lib/theme';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Live updates invalidate on change, so cached data stays correct for long.
      staleTime: 60_000,
      refetchOnWindowFocus: false,
      // A 404 will not fix itself by retrying.
      retry: (count, error) => !(error instanceof ApiError && error.status === 404) && count < 2,
    },
  },
});

export function Providers({ children }: { children: ReactNode }) {
  const [theme] = useTheme();
  return (
    <QueryClientProvider client={queryClient}>
      {/* Honour the OS "reduce motion" setting across every animation. */}
      <MotionConfig reducedMotion="user">
        <TooltipProvider>
          {children}
          <Toaster
            theme={theme}
            position="bottom-right"
            toastOptions={{
              className: '!bg-surface !text-ink !border-line !shadow-pop !rounded-lg !text-[13px] !font-sans',
            }}
          />
        </TooltipProvider>
      </MotionConfig>
    </QueryClientProvider>
  );
}
