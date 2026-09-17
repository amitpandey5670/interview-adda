#!/usr/bin/env node
/** Run TS modules 14-18 deepen content (skips missing m13). */
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { buildTopic } from './build-topic.mjs';
import { m14Topics } from './content-m14.mjs';
import { m15Topics } from './content-m15.mjs';
import { m16Topics } from './content-m16.mjs';
import { m17Topics } from './content-m17.mjs';
import { mindmaps } from './mindmaps.mjs';

const root = join(process.cwd(), 'data/typescript/modules');
const modules = [
  { folder: '14-modules-and-declarations', topics: m14Topics, mindmapKey: 'modules-and-declarations' },
  { folder: '15-advanced-type-patterns', topics: m15Topics, mindmapKey: 'advanced-type-patterns' },
  { folder: '16-decorators-and-metadata', topics: m16Topics, mindmapKey: 'decorators-and-metadata' },
  { folder: '17-compiler-options-tooling', topics: m17Topics, mindmapKey: 'compiler-options-tooling' },
];

function fixEmptyStepBodies(def) {
  for (const step of def.steps ?? []) {
    if (!step.body || step.body.length < 1) {
      step.body = 'See code walkthrough and official documentation for this step.';
    }
  }
  return def;
}

let topicCount = 0;
for (const { folder, topics, mindmapKey } of modules) {
  const moduleDir = join(root, folder);
  const moduleDoc = JSON.parse(readFileSync(join(moduleDir, 'module.json'), 'utf8'));

  for (const topicRef of moduleDoc.topics) {
    const def = topics[topicRef.slug];
    if (!def) {
      console.warn(`Skip missing def: ${folder}/${topicRef.slug}`);
      continue;
    }
    const doc = buildTopic(fixEmptyStepBodies(def), moduleDoc, topicRef);
    writeFileSync(join(moduleDir, 'topics', `${topicRef.slug}.json`), `${JSON.stringify(doc, null, 2)}\n`);
    topicCount++;
  }

  const mindmap = mindmaps[mindmapKey];
  if (mindmap) {
    writeFileSync(join(moduleDir, 'mindmap.json'), `${JSON.stringify(mindmap, null, 2)}\n`);
  }
}

console.log(`Deepened ${topicCount} TypeScript topics in modules 14-17`);
