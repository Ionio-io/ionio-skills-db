/**
 * Server-sent events that tell the dashboard when skill files change on disk,
 * so it refetches instead of polling. A heartbeat keeps proxies from closing idle
 * streams.
 */
import type { SkillLibrary } from '@ionio-skills/core';
import type { Context } from 'hono';
import { streamSSE } from 'hono/streaming';

const HEARTBEAT_MS = 25_000;

export function streamLibraryEvents(c: Context, library: SkillLibrary): Response {
  return streamSSE(c, async (stream) => {
    await stream.writeSSE({ event: 'ready', data: JSON.stringify({ at: new Date().toISOString() }) });

    const unsubscribe = library.onChange((change) => {
      void stream.writeSSE({ event: 'library-changed', data: JSON.stringify(change) });
    });
    const heartbeat = setInterval(() => void stream.writeSSE({ event: 'ping', data: '' }), HEARTBEAT_MS);

    // Hold the stream open until the client goes away.
    await new Promise<void>((resolve) => stream.onAbort(resolve));
    clearInterval(heartbeat);
    unsubscribe();
  });
}
