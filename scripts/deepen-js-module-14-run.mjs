#!/usr/bin/env node
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { MEMORY_TOPICS } from './deepen-js-module-14-content.mjs';

const moduleDir = join(process.cwd(), 'data/javascript/modules/14-memory-and-garbage-collection');
const moduleDoc = JSON.parse(readFileSync(join(moduleDir, 'module.json'), 'utf8'));

let count = 0;
for (const topicRef of moduleDoc.topics) {
  const doc = MEMORY_TOPICS[topicRef.slug];
  if (!doc) continue;
  writeFileSync(join(moduleDir, 'topics', `${topicRef.slug}.json`), `${JSON.stringify(doc, null, 2)}\n`);
  count++;
}
console.log(`Deepened ${count} JavaScript module 14 topics`);
