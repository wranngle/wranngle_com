import path from 'node:path';
import {mkdir, readFile, writeFile} from 'node:fs/promises';
import {defineConfig} from 'vite';
import react from '@vitejs/plugin-react';

const spaHtmlRoutes = [
  'about',
  'api-docs',
  'blog',
  'built-by',
  'case-studies',
  'docs',
  'offerings',
  'privacy',
  'products/ai-voice-agents',
  'products/gtm-ops',
  'products/gtm_ops',
  'products/websites',
  'terms',
];

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'wranngle-spa-html-route-aliases',
      apply: 'build',
      async closeBundle() {
        const outputDir = path.resolve(import.meta.dirname, 'dist');
        const indexHtml = await readFile(
          path.join(outputDir, 'index.html'),
          'utf8',
        );

        await Promise.all(
          spaHtmlRoutes.map(async (route) => {
            const target = path.join(outputDir, `${route}.html`);
            await mkdir(path.dirname(target), {recursive: true});
            await writeFile(target, indexHtml);
          }),
        );
      },
    },
  ],
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, 'client', 'src'),
      '@shared': path.resolve(import.meta.dirname, 'shared'),
    },
  },
  root: path.resolve(import.meta.dirname, 'client'),
  build: {
    outDir: path.resolve(import.meta.dirname, 'dist'),
    emptyOutDir: true,
    cssCodeSplit: true,
    rollupOptions: {
      output: {
        // React + ReactDOM ship inside the entry bundle (no
        // vendor-react chunk). Splitting them out introduced a
        // 2-hop loading waterfall: entry parsed → vendor-motion
        // parsed → vendor-react requested. The browser also
        // failed to modulepreload vendor-react because Vite only
        // emits modulepreload for chunks the entry directly
        // imports — so the most critical dependency was the
        // last to start downloading. Inlining costs ~46 kB gzip
        // off cache hits but cuts time-to-interactive on first
        // visit (which is most visits to a marketing site).
        manualChunks: {
          'vendor-motion': ['framer-motion'],
          'vendor-radix': [
            '@radix-ui/react-dialog',
            '@radix-ui/react-toast',
            '@radix-ui/react-label',
            '@radix-ui/react-accordion',
          ],
        },
      },
    },
  },
  server: {
    fs: {
      strict: true,
      deny: ['**/.*'],
    },
  },
});
