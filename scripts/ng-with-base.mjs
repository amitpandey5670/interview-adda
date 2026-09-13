import { readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const config = JSON.parse(readFileSync(resolve(root, 'config/site.config.json'), 'utf8'));

const target = process.argv[2];
const command = process.argv[3];
const passthrough = process.argv.slice(4).flatMap((arg) => (arg === '--' ? [] : [arg]));

if (target !== 'local' && target !== 'githubPages') {
  console.error('Usage: node scripts/ng-with-base.mjs <local|githubPages> <serve|build> [-- extra ng args]');
  process.exit(1);
}

if (command !== 'serve' && command !== 'build') {
  console.error('Second argument must be serve or build');
  process.exit(1);
}

const baseHref = config[target].baseHref;
const args =
  command === 'serve'
    ? ['ng', 'serve', ...passthrough]
    : ['ng', 'build', `--base-href=${baseHref}`, ...passthrough];

if (command === 'serve' && target !== 'local') {
  console.error('ng serve always uses the <base href> in src/index.html (local). Use npm run build:pages for GitHub Pages.');
  process.exit(1);
}

const result = spawnSync('npx', args, { stdio: 'inherit', cwd: root, shell: false });
process.exit(result.status ?? 1);
