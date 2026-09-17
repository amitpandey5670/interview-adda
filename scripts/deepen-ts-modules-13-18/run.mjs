#!/usr/bin/env node
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { buildTopic } from './build-topic.mjs';
import { m13Topics } from './content-m13.mjs';
import { m14Topics } from './content-m14.mjs';
import { m15Topics } from './content-m15.mjs';
import { m16Topics } from './content-m16.mjs';
import { m17Topics } from './content-m17.mjs';
import { m18Topics } from './content-m18.mjs';
import { mindmaps } from './mindmaps.mjs';

const root = join(process.cwd(), 'data/typescript/modules');
const modules = [
  { folder: '13-async-types', topics: m13Topics },
  { folder: '14-modules-and-declarations', topics: m14Topics },
  { folder: '15-advanced-type-patterns', topics: m15Topics },
  { folder: '16-decorators-and-metadata', topics: m16Topics },
  { folder: '17-compiler-options-tooling', topics: m17Topics },
  { folder: '18-ts-recap-performance', topics: m18Topics },
];

let topicCount = 0;
for (const { folder, topics } of modules) {
  const moduleDir = join(root, folder);
  const module = JSON.parse(readFileSync(join(moduleDir, 'module.json'), 'utf8'));
  for (const topicRef of module.topics) {
    const def = topics[topicRef.slug];
    if (!def) throw new Error(`Missing ${folder}/${topicRef.slug}`);
    writeFileSync(join(moduleDir, 'topics', `${topicRef.slug}.json`), `${JSON.stringify(buildTopic(def, module, topicRef), null, 2)}\n`);
    topicCount++;
  }
  writeFileSync(join(moduleDir, 'mindmap.json'), `${JSON.stringify(mindmaps[module.slug], null, 2)}\n`);
}
console.log(`Deepened ${topicCount} topics and ${modules.length} mindmaps`);
