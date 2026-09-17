#!/usr/bin/env node
/**
 * Generates senior-depth topic JSON for TypeScript modules 08-12.
 * Output: scripts/content-batch/ts-08-12/*.json
 */
import { writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';

const outDir = join(process.cwd(), 'scripts/content-batch/ts-08-12');
mkdirSync(outDir, { recursive: true });

function buildTopic(spec) {
  const {
    id, slug, title, moduleId, order, hook, intro, glossary, steps, diagramTitle, diagramSource,
    snippets, compareTitle, compareHeaders, compareRows, mistakes, seniorProse, seniorTable,
    seniorWarning, takeaways, pitfalls, relatedTopicIds, correlations, sources, animationHint, scenarioTag,
  } = spec;

  const sections = [
    {
      heading: 'What is this?',
      blocks: [
        { type: 'prose', text: intro },
        { type: 'glossary', title: 'Key terms', entries: glossary },
      ],
    },
    {
      heading: 'Why does it matter?',
      blocks: [
        { type: 'prose', text: spec.why },
        { type: 'callout', variant: spec.tipVariant ?? 'tip', title: spec.tipTitle, body: spec.tipBody },
      ],
    },
    {
      heading: 'How it works step by step',
      blocks: [
        { type: 'steps', title: spec.stepsTitle ?? 'Mental model', items: steps },
        { type: 'diagram', diagram: { type: 'mermaid', title: diagramTitle, source: diagramSource } },
      ],
    },
    {
      heading: 'Code walkthrough',
      blocks: snippets.map((s) => ({ type: 'snippet', snippet: s })),
    },
    {
      heading: 'Compare with JavaScript and C#',
      blocks: [
        { type: 'comparisonTable', title: compareTitle, headers: compareHeaders, rows: compareRows },
      ],
    },
    {
      heading: 'Common mistakes',
      blocks: mistakes.map((m) => ({ type: 'callout', variant: 'warning', title: m.title, body: m.body })),
    },
    {
      heading: 'Senior interview depth',
      blocks: [
        { type: 'prose', text: seniorProse },
        { type: 'comparisonTable', title: 'Tradeoffs at senior level', headers: ['Pattern', 'Wins', 'Fails'], rows: seniorTable },
        { type: 'callout', variant: 'warning', title: 'What gets you rejected in interviews', body: seniorWarning },
      ],
    },
  ];

  const topic = {
    id, slug, title, moduleId, order, hook, sections,
    interviewTakeaways: takeaways,
    commonPitfalls: pitfalls,
    relatedTopicIds,
    jsTsCorrelations: correlations,
    officialSources: sources,
    animationHint: animationHint ?? 'flow',
  };
  if (scenarioTag) topic.scenarioTag = scenarioTag;
  return topic;
}

import { allSpecs } from './ts-08-12-specs.mjs';

for (const spec of allSpecs) {
  const topic = buildTopic(spec);
  writeFileSync(join(outDir, `${spec.slug}.json`), `${JSON.stringify(topic, null, 2)}\n`);
}
console.log(`Generated ${allSpecs.length} topics in ${outDir}`);
