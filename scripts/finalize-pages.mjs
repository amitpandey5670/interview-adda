import { copyFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const browser = resolve(root, 'dist/interview-adda/browser');

copyFileSync(resolve(browser, 'index.html'), resolve(browser, '404.html'));
writeFileSync(resolve(browser, '.nojekyll'), '');
console.log('Wrote 404.html and .nojekyll for GitHub Pages');
