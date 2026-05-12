import path from 'node:path';
import {mkdir, readFile, writeFile} from 'node:fs/promises';
import {defineConfig} from 'vite';
import react from '@vitejs/plugin-react';

const spaHtmlRoutes = [
  'about',
  'built-by',
  'offerings',
  'privacy',
  'products/ai-voice-agents',
  'products/gtm-ops',
  'products/gtm_ops',
  'products/websites',
  'terms',
];

const canonicalOrigin = 'https://wranngle.com';

const routeMeta: Record<
  string,
  {canonicalPath: string; title: string; description: string}
> = {
  about: {
    canonicalPath: '/about',
    title: 'Cody Arnold - About Wranngle',
    description:
      'Why Wranngle exists, the operating principles behind the practice, and the public repos that show how the work actually gets done.',
  },
  'built-by': {
    canonicalPath: '/about',
    title: 'Cody Arnold - About Wranngle',
    description:
      'Why Wranngle exists, the operating principles behind the practice, and the public repos that show how the work actually gets done.',
  },
  offerings: {
    canonicalPath: '/',
    title: 'AI Voice Agents for Trades - Wranngle Systems',
    description:
      '24/7 AI voice agents for HVAC, plumbing, electrical, and trades businesses. Capture missed calls, qualify leads, and route handoffs.',
  },
  privacy: {
    canonicalPath: '/privacy',
    title: 'Privacy Policy - Wranngle Systems',
    description:
      'How Wranngle Systems collects, uses, and safeguards your data. GDPR- and CCPA-aligned; recordings encrypted in transit and at rest.',
  },
  'products/ai-voice-agents': {
    canonicalPath: '/',
    title: 'AI Voice Agents for Trades - Wranngle Systems',
    description:
      '24/7 AI voice agents for HVAC, plumbing, electrical, and trades businesses. Capture missed calls, qualify leads, and route handoffs.',
  },
  'products/gtm-ops': {
    canonicalPath: '/products/gtm-ops',
    title: 'gtm_ops - Lead in, branded proposal out - Wranngle',
    description:
      'gtm_ops turns inbound leads into branded PDF proposals. Enrichment, run logs, live demo with synthetic data. No signup.',
  },
  'products/gtm_ops': {
    canonicalPath: '/products/gtm-ops',
    title: 'gtm_ops - Lead in, branded proposal out - Wranngle',
    description:
      'gtm_ops turns inbound leads into branded PDF proposals. Enrichment, run logs, live demo with synthetic data. No signup.',
  },
  'products/websites': {
    canonicalPath: '/products/websites',
    title: 'Websites that capture leads - Wranngle Systems',
    description:
      'Landing pages and business websites built with fast performance, lead capture, SEO foundations, and owned source code.',
  },
  terms: {
    canonicalPath: '/terms',
    title: 'Terms of Service - Wranngle Systems',
    description:
      'Terms of Service for the Wranngle Systems platform - voice agents, websites, and the gtm_ops SaaS.',
  },
};

function withRouteHead(html: string, route: string) {
  const meta = routeMeta[route];
  if (!meta) return html;

  const url = `${canonicalOrigin}${meta.canonicalPath}`;
  return html
    .replace(/<title>[\S\s]*?<\/title>/, `<title>${meta.title}</title>`)
    .replace(
      /<meta\s+name="description"\s+content="[^"]*"\s*\/>/,
      `<meta name="description" content="${meta.description}" />`,
    )
    .replace(
      /<link\s+rel="canonical"\s+href="[^"]*"\s*\/>/,
      `<link rel="canonical" href="${url}" />`,
    )
    .replace(
      /<meta\s+property="og:url"\s+content="[^"]*"\s*\/>/,
      `<meta property="og:url" content="${url}" />`,
    )
    .replace(
      /<meta\s+property="twitter:url"\s+content="[^"]*"\s*\/>/,
      `<meta property="twitter:url" content="${url}" />`,
    )
    .replace(
      /<meta\s+property="og:title"\s+content="[^"]*"\s*\/>/,
      `<meta property="og:title" content="${meta.title}" />`,
    )
    .replace(
      /<meta\s+property="twitter:title"\s+content="[^"]*"\s*\/>/,
      `<meta property="twitter:title" content="${meta.title}" />`,
    )
    .replace(
      /<meta\s+property="og:description"\s+content="[^"]*"\s*\/>/,
      `<meta property="og:description" content="${meta.description}" />`,
    )
    .replace(
      /<meta\s+property="twitter:description"\s+content="[^"]*"\s*\/>/,
      `<meta property="twitter:description" content="${meta.description}" />`,
    );
}

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
            await writeFile(target, withRouteHead(indexHtml, route));
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
