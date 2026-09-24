import { defineConfig } from 'vitest/config';

// Tests run against TypeScript sources: the `ionio-source` export condition points
// workspace packages at `src/` instead of their built `dist/`.
export default defineConfig({
  resolve: { conditions: ['ionio-source'] },
  ssr: { resolve: { conditions: ['ionio-source'] } },
  test: {
    include: ['packages/*/test/**/*.test.ts'],
    environment: 'node',
  },
});
