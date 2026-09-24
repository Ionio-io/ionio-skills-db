/**
 * Live updates: listens to the server's `/api/events` stream and refetches all
 * library data when skill files change on disk. Exposes connection state so the
 * shell can show whether the dashboard is live.
 */
import { useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

import { keys } from './queries';

export type LiveState = 'connecting' | 'live' | 'offline' | 'paused';

export function useLiveUpdates(): LiveState {
  const queryClient = useQueryClient();
  const [state, setState] = useState<LiveState>(() => (document.hidden ? 'paused' : 'connecting'));

  useEffect(() => {
    let source: EventSource | null = null;

    function open() {
      // EventSource reconnects on its own after drops; state just mirrors it.
      source = new EventSource('/api/events');
      source.addEventListener('ready', () => setState('live'));
      source.addEventListener('error', () =>
        setState(source?.readyState === EventSource.CLOSED ? 'offline' : 'connecting'),
      );
      source.addEventListener('library-changed', (event) => {
        const { paths } = JSON.parse((event as MessageEvent<string>).data) as { paths: string[] };
        void queryClient.invalidateQueries({ queryKey: keys.all });
        const content = paths.filter((path) => !path.startsWith('.git/'));
        if (content.length > 0) {
          toast('Library updated', {
            description: content.length === 1 ? content[0] : `${content.length} files changed`,
          });
        }
      });
    }

    function close() {
      source?.close();
      source = null;
    }

    // Hidden tabs let go of their stream: browsers allow only six connections per host,
    // and a handful of background dashboards would otherwise starve every other request.
    // Coming back reconnects and refetches whatever changed in the meantime.
    function onVisibilityChange() {
      if (document.hidden) {
        close();
        setState('paused');
      } else if (!source) {
        setState('connecting');
        open();
        void queryClient.invalidateQueries({ queryKey: keys.all });
      }
    }

    if (!document.hidden) open();
    document.addEventListener('visibilitychange', onVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', onVisibilityChange);
      close();
    };
  }, [queryClient]);

  return state;
}
