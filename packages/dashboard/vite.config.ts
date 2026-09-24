import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';

// In dev, Vite serves the dashboard and forwards API and MCP calls to the
// server started by `npm run dev` (packages/server, port 4711).
const SERVER = process.env['SKILLS_SERVER'] ?? 'http://127.0.0.1:4711';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': { target: SERVER, changeOrigin: true },
      '/mcp': { target: SERVER, changeOrigin: true },
    },
  },
  build: {
    target: 'es2022',
    chunkSizeWarningLimit: 900,
  },
});
