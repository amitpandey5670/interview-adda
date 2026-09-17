#!/usr/bin/env node
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { RECAP_TOPICS } from './deepen-js-module-18-content.mjs';

const moduleDir = join(process.cwd(), 'data/javascript/modules/18-es-recap-performance');
const moduleDoc = JSON.parse(readFileSync(join(moduleDir, 'module.json'), 'utf8'));

let count = 0;
for (const topicRef of moduleDoc.topics) {
  const doc = RECAP_TOPICS[topicRef.slug];
  if (!doc) continue;
  writeFileSync(join(moduleDir, 'topics', `${topicRef.slug}.json`), `${JSON.stringify(doc, null, 2)}\n`);
  count++;
}
console.log(`Deepened ${count} JavaScript module 18 topics`);
