#!/usr/bin/env node
/**
 * Generates senior-depth topic JSON for TypeScript modules 08-12.
 * Output: scripts/content-batch/ts-08-12/*.json
 */
import { writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';

const outDir = join(process.cwd(), 'scripts/content-batch/ts-08-12');
mkdirSync(outDir, { recursive: true });

function snip(lang, label, code, explanation) {
  return { language: lang, label, code, explanation };
}

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

const specs = [
  {
    id: 'typescript-08-array-and-tuple-types', slug: 'array-and-tuple-types', moduleId: 'typescript-08-collections-and-typed-data', order: 1,
    title: 'Array types, tuple types, and readonly tuples',
    hook: 'T[] describes homogeneous lists; [string, number] fixes arity and per-index types. Readonly tuples protect config shapes — types erase, runtime is plain Array.',
    intro: 'An **array type** `T[]` means every element is `T`. A **tuple** fixes **length and position**: `[number, number]` rejects a third element. **Readonly tuples** block index assignment at compile time. At runtime both are JavaScript arrays.',
    why: 'React `useState` returns `[T, Dispatch]`. HTTP parsers use `[status, body]`. Using `(string|number)[]` allows wrong lengths; tuples enforce arity. C# `ValueTuple<T1,T2>` has named fields at runtime; TS tuples are structural and erase.',
    tipTitle: 'Tuple vs interface', tipBody: 'Stable field names → interface. Ordered pairs (coordinates, entries) → tuple.',
    glossary: [
      { term: 'array type', longForm: 'T[]', plainDefinition: 'Homogeneous collection — same element type at every index.', example: 'const ids: string[] = ["a"]' },
      { term: 'tuple', longForm: 'tuple type', plainDefinition: 'Fixed length with typed positions.', example: 'type RGB = [number, number, number]' },
      { term: 'readonly tuple', longForm: 'readonly tuple', plainDefinition: 'Compile-time immutability on indices.', example: 'readonly [string, number]' },
      { term: 'variadic tuple', longForm: 'variadic tuple', plainDefinition: 'Rest element in tuple type.', example: '[string, ...number[]]' },
    ],
    steps: [
      { title: 'Homogeneous list', body: 'Use T[] when length varies.' },
      { title: 'Fixed arity', body: 'Use [T1,T2] when index meaning differs.' },
      { title: 'Readonly config', body: 'readonly [...] on route tables.' },
      { title: 'Validate at boundary', body: 'Runtime arrays need length checks from JSON.' },
    ],
    diagramTitle: 'Array vs tuple', diagramSource: 'flowchart TD\n  A[T[] variable length] --> B["[T1,T2] fixed arity"]\n  B --> C[readonly blocks assign]',
    snippets: [
      snip('typescript', 'Tuple arity', 'type HttpResult = [status: number, body: string];\nfunction parse(raw: string): HttpResult {\n  return [Number(raw.slice(0,3)), raw.slice(4)];\n}\nconst [code, text] = parse("200 OK");', 'Labeled tuple elements document positions. Extra elements are compile errors.'),
      snip('typescript', 'readonly config', 'const ROUTES: readonly [string, string] = ["/", "/settings"];\n// ROUTES[0] = "/x"; // error', 'readonly blocks index write — shallow only.'),
      snip('typescript', 'Hook tuple', 'function usePair<T>(v: T): [T, (n: T) => void] {\n  let x = v; return [x, (n) => { x = n; }];\n}', 'Tuple return preserves destructuring types.'),
      snip('typescript', 'Failure: shared mutation', 'type Pair = [string, number];\nconst p: Pair = ["a", 1];\nconst arr: (string|number)[] = p;\narr.push(true); // runtime pollution', 'Tuple assignable to wider array — shared reference mutates.'),
    ],
    compareTitle: 'Collections typing', compareHeaders: ['Concept', 'TypeScript', 'JavaScript', 'C#'],
    compareRows: [['List', 'T[]', 'Array', 'List<T>'], ['Pair', '[T1,T2]', 'Array', 'ValueTuple'], ['Immutability', 'readonly compile', 'freeze optional', 'IReadOnlyList']],
    mistakes: [{ title: 'Tuple vs union array', body: '(string|number)[] allows any length — [string,number] requires exactly two.' }],
    seniorProse: 'Labeled tuples (TS 4.0+) improve errors. const type parameters preserve literals. Readonly is shallow — nest Readonly<T> for deep safety.',
    seniorTable: [['Tuple return', 'Hook patterns', 'Unclear past 3 fields'], ['readonly', 'No copy', 'Not deep freeze']],
    seniorWarning: 'Claiming tuples exist at runtime. Cannot explain readonly vs mutable assignability.',
    takeaways: ['T[] vs [T1,T2] — arity matters.', 'readonly shallow.', 'Tuples assign to wider arrays — mutation trap.', '60s: Arrays for lists, tuples for pairs, readonly for config. Types erase.', 'Follow-up: variadic tuples, const type params.'],
    pitfalls: ['Weak: tuple is just array syntax.', 'Using (string|number)[] for pairs.', 'Strong: Tuple fixes arity; readonly compile-only; validate JSON length.'],
    relatedTopicIds: ['typescript-08-readonly-collections', 'typescript-08-satisfies-operator', 'typescript-08-typed-array-methods'],
    correlations: [
      { language: 'javascript', concept: 'destructuring', note: 'JS destructuring is runtime; TS tuples add compile-time arity.', futureTopicSlug: 'javascript/collections/arrays' },
      { language: 'typescript', concept: 'ValueTuple', note: 'C# named fields at runtime; TS positional/labeled types erase.', futureTopicSlug: 'csharp/collections/value-tuple' },
    ],
    sources: [{ title: 'Tuple types', url: 'https://www.typescriptlang.org/docs/handbook/2/objects.html#tuple-types' }],
    animationHint: 'compare',
  },
  // Additional specs appended below via separate file imports or continuation
];

// Import extended specs
import { extendedSpecs } from './ts-08-12-specs.mjs';
const allSpecs = [...specs, ...extendedSpecs];

for (const spec of allSpecs) {
  const topic = buildTopic(spec);
  writeFileSync(join(outDir, `${spec.slug}.json`), `${JSON.stringify(topic, null, 2)}\n`);
}
console.log(`Generated ${allSpecs.length} topics in ${outDir}`);
