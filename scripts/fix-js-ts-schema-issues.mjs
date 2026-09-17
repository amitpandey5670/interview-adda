#!/usr/bin/env node
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const root = join(process.cwd(), 'data');
const validScenarioTags = new Set([
  'sqs-consumer',
  'redis-cache',
  'rabbitmq',
  'skiasharp-dispose',
  'auth-token',
  'csv-import',
  'high-concurrency',
]);
const validAnimationHints = new Set(['compare', 'flow', 'stack-heap', 'timeline']);

function normalizeAnimationHint(value) {
  if (validAnimationHints.has(value)) return value;
  if (/stack|heap|closure|context/i.test(value)) return 'stack-heap';
  if (/compare|versus|vs/i.test(value)) return 'compare';
  if (/time|loop|async|pipeline|flow|branch|iterate|compose|binding|syntax|transform/i.test(value)) return 'flow';
  return undefined;
}

function walkJsonFiles(dir, files = []) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) walkJsonFiles(path, files);
    else if (entry.name.endsWith('.json')) files.push(path);
  }
  return files;
}

function fixTopic(filePath) {
  const topic = JSON.parse(readFileSync(filePath, 'utf8'));
  let changed = false;

  if (Array.isArray(topic.jsTsCorrelations)) {
    topic.jsTsCorrelations = topic.jsTsCorrelations.map((item) => {
      if (item.language === 'csharp') {
        changed = true;
        return {
          ...item,
          language: 'typescript',
          note: item.note.startsWith('C#') ? item.note : `C# comparison: ${item.note}`,
        };
      }
      return item;
    });
  }

  if (topic.scenarioTag && !validScenarioTags.has(topic.scenarioTag)) {
    delete topic.scenarioTag;
    changed = true;
  }

  if (topic.animationHint !== undefined) {
    const normalized = normalizeAnimationHint(topic.animationHint);
    if (normalized !== topic.animationHint) {
      if (normalized) topic.animationHint = normalized;
      else delete topic.animationHint;
      changed = true;
    } else if (!validAnimationHints.has(topic.animationHint)) {
      delete topic.animationHint;
      changed = true;
    }
  }

  if (changed) writeFileSync(filePath, `${JSON.stringify(topic, null, 2)}\n`);
  return changed;
}

let fixed = 0;
for (const language of ['javascript', 'typescript']) {
  const langDir = join(root, language);
  for (const file of walkJsonFiles(langDir)) {
    if (file.includes('/topics/') && fixTopic(file)) fixed++;
  }
}
console.log(`Fixed ${fixed} topic files`);
