import { fileURLToPath } from 'node:url';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { seoFiles } from './seo.plugin.js';

// The monorepo keeps a single .env at the root so the API and web app cannot drift apart.
const envDir = fileURLToPath(new URL('../..', import.meta.url));

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, envDir, '');
  const siteUrl = (env.VITE_SITE_URL || 'http://localhost:5173').replace(/\/$/, '');
  const apiTarget = env.VITE_DEV_API_PROXY || 'http://127.0.0.1:4000';

  return {
    envDir,
    plugins: [react(), tailwindcss(), seoFiles(siteUrl)],
    server: {
      port: 5173,
      watch: env.VITE_USE_POLLING === 'true' ? { usePolling: true, interval: 300 } : undefined,
      // Same-origin in development, matching production, so the session cookie behaves the same.
      proxy: {
        '/api': apiTarget,
        '/uploads': apiTarget,
        '/feeds': apiTarget,
      },
    },
    build: {
      rollupOptions: {
        output: {
          // Long-lived chunks: visitors re-download only what changes between releases.
          manualChunks(id) {
            if (id.includes('chart.js') || id.includes('react-chartjs-2')) return 'charts';
            if (/node_modules[\\/](react|react-dom|react-router|react-router-dom|scheduler)[\\/]/.test(id)) return 'react';
            return undefined;
          },
        },
      },
    },
  };
});
