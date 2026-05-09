import {rm} from 'node:fs/promises';
import {build as viteBuild} from 'vite';

async function buildAll() {
  if (process.env.CF_PAGES_BRANCH?.startsWith('wip/')) {
    console.log('Skipping Cloudflare build for wip branch.');
    process.exit(0);
  }

  await rm('dist', {recursive: true, force: true});

  console.log('building client for Cloudflare Pages...');
  await viteBuild();

  console.log('build complete - output in dist/');
}

buildAll().catch((error) => {
  console.error(error);
  process.exit(1);
});
