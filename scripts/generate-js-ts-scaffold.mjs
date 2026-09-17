#!/usr/bin/env node
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { javascriptModules, typescriptModules } from './js-ts-module-plan.mjs';

const root = join(process.cwd(), 'data');

function pad(n) {
  return String(n).padStart(2, '0');
}

function buildModule(language, mod) {
  const folder = `${pad(mod.order)}-${mod.slug}`;
  const idPrefix = `${language}-${pad(mod.order)}`;
  const moduleId = `${language}-${pad(mod.order)}-${mod.slug}`;

  const topics = mod.topics.map((topic, index) => ({
    id: `${idPrefix}-${topic.slug}`,
    slug: topic.slug,
    title: topic.title,
    order: index + 1,
  }));

  return { folder, moduleId, idPrefix, topics, mod };
}

function writeModuleJson(language, built) {
  const { folder, moduleId, topics, mod } = built;
  const dir = join(root, language, 'modules', folder);
  mkdirSync(join(dir, 'topics'), { recursive: true });

  const moduleJson = {
    id: moduleId,
    slug: mod.slug,
    title: mod.title,
    order: mod.order,
    stage: mod.stage,
    summary: mod.summary,
    officialHubs: language === 'javascript'
      ? [
          { title: 'MDN JavaScript guide', url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide' },
          { title: 'javascript.info', url: 'https://javascript.info/' },
        ]
      : [
          { title: 'TypeScript handbook', url: 'https://www.typescriptlang.org/docs/handbook/intro.html' },
          { title: 'TypeScript release notes', url: 'https://www.typescriptlang.org/docs/handbook/release-notes/overview.html' },
        ],
    topics,
  };

  writeFileSync(join(dir, 'module.json'), `${JSON.stringify(moduleJson, null, 2)}\n`);
  return { folder, moduleId, topicCount: topics.length, mod, topics };
}

function writeIndex(language, modules) {
  const stages = [
    {
      id: 'foundation',
      title: 'Foundations',
      summary:
        language === 'javascript'
          ? 'Read and write correct JavaScript: runtime, syntax, types, functions, objects, errors, and null safety.'
          : 'Read and write correct TypeScript: basics, types, functions, classes, errors, and null safety.',
      moduleIds: modules.filter((m) => m.mod.stage === 'foundation').map((m) => m.moduleId),
    },
    {
      id: 'intermediate',
      title: 'Intermediate',
      summary:
        language === 'javascript'
          ? 'Daily production JavaScript: collections, callbacks, modern syntax, functional methods, and async.'
          : 'Daily production TypeScript: collections, generics, utilities, narrowing, conditional types, and async.',
      moduleIds: modules.filter((m) => m.mod.stage === 'intermediate').map((m) => m.moduleId),
    },
    {
      id: 'advanced',
      title: 'Advanced',
      summary:
        language === 'javascript'
          ? 'Interview and systems depth: memory/GC, Workers, modules, runtimes, and ES recap.'
          : 'Interview and systems depth: modules, advanced patterns, decorators, compiler tooling, and TS recap.',
      moduleIds: modules.filter((m) => m.mod.stage === 'advanced').map((m) => m.moduleId),
    },
  ];

  const index = {
    language,
    title: language === 'javascript' ? 'JavaScript language' : 'TypeScript language',
    stages,
    modules: modules.map((m) => ({
      id: m.moduleId,
      slug: m.mod.slug,
      title: m.mod.title,
      order: m.mod.order,
      stage: m.mod.stage,
      folder: m.folder,
      topicCount: m.topicCount,
    })),
  };

  writeFileSync(join(root, language, 'index.json'), `${JSON.stringify(index, null, 2)}\n`);
}

function writeOverview(language, modules) {
  const totalTopics = modules.reduce((sum, m) => sum + m.topicCount, 0);
  const isJs = language === 'javascript';

  const overview = {
    id: `${language}-overview`,
    language,
    title: isJs ? 'Learn JavaScript from the ground up' : 'Learn TypeScript from the ground up',
    hook: isJs
      ? 'JavaScript is the language of the web and Node.js. This track starts with plain English and small examples, then grows into the event loop, closures, async, memory, and the depth you need for senior interviews.'
      : 'TypeScript adds static types to JavaScript without changing how code runs. This track starts with plain English, then grows into generics, narrowing, conditional types, and the depth you need for senior interviews and production APIs.',
    sections: [
      {
        heading: isJs ? 'What is JavaScript?' : 'What is TypeScript?',
        blocks: [
          {
            type: 'prose',
            text: isJs
              ? 'JavaScript is a dynamically typed language standardized as ECMAScript. You write .js or .mjs files. An engine like V8 parses source, compiles hot functions with Just-In-Time (JIT) optimization, and runs your code on a single thread coordinated by the event loop. The host (browser or Node.js) supplies APIs for DOM, fetch, fs, and timers — they are not the language itself.'
              : 'TypeScript is a typed superset of JavaScript. You write .ts files. The TypeScript compiler (tsc) checks types, then emits plain JavaScript. Types are erased at run time — the engine still runs JavaScript. TypeScript adds interfaces, generics, narrowing, and utility types that C# developers will recognize, but assignability is structural, not nominal.',
          },
          {
            type: 'glossary',
            title: 'Key terms',
            entries: isJs
              ? [
                  {
                    term: 'ECMAScript',
                    longForm: 'ECMAScript',
                    plainDefinition: 'The official specification JavaScript implements. ES2015 (ES6) and later versions add classes, modules, async/await, and more.',
                    example: 'const and arrow functions come from ES2015.',
                  },
                  {
                    term: 'V8',
                    longForm: 'V8 JavaScript engine',
                    plainDefinition: 'Google\'s JavaScript engine used in Chrome and Node.js. Parses, compiles, and runs JS with JIT optimization.',
                    example: 'Node.js runs your server code inside V8.',
                  },
                  {
                    term: 'Event loop',
                    longForm: 'Event loop',
                    plainDefinition: 'The scheduler that runs JavaScript on one thread, draining the call stack then microtasks then macrotasks.',
                    example: 'Promise.then callbacks are microtasks; setTimeout is a macrotask.',
                  },
                ]
              : [
                  {
                    term: 'tsc',
                    longForm: 'TypeScript compiler',
                    plainDefinition: 'The tool that type-checks .ts files and emits JavaScript. Types disappear after compile.',
                    example: 'npm run build runs tsc before bundling.',
                  },
                  {
                    term: 'Structural typing',
                    longForm: 'Structural typing',
                    plainDefinition: 'TypeScript checks shape compatibility, not declaration names. If it looks like a duck, it is a duck.',
                    example: 'An interface is satisfied by any object with matching properties.',
                  },
                  {
                    term: 'strictNullChecks',
                    longForm: 'strictNullChecks',
                    plainDefinition: 'Compiler flag that treats null and undefined as distinct types requiring explicit handling.',
                    example: 'string is not assignable from null without a union or guard.',
                  },
                ],
          },
          {
            type: 'diagram',
            diagram: {
              type: 'mermaid',
              title: isJs ? 'How JavaScript runs' : 'How TypeScript becomes JavaScript',
              source: isJs
                ? 'flowchart LR\n  A[JS source .js] --> B[Parser]\n  B --> C[Bytecode / JIT]\n  C --> D[V8 engine]\n  D --> E[Event loop]\n  E --> F[Your program runs]'
                : 'flowchart LR\n  A[TS source .ts] --> B[TypeScript compiler]\n  B --> C[Type errors or clean emit]\n  C --> D[JavaScript .js]\n  D --> E[V8 / browser engine]\n  E --> F[Your program runs]',
            },
          },
        ],
      },
      {
        heading: 'How it differs from C# and ' + (isJs ? 'TypeScript' : 'JavaScript'),
        blocks: [
          {
            type: 'prose',
            text: isJs
              ? 'If you know C# or TypeScript, JavaScript feels familiar in syntax but different at run time. Types are checked at run time through coercion, not at compile time. Privacy is convention (# private fields help). async/await sits on Promises and the event loop, not CLR Tasks on thread-pool threads.'
              : 'If you know C# or JavaScript, TypeScript borrows syntax from both. Like C#, you get interfaces and generics — but types erase at run time like JS, not IL metadata. Like JS, assignability is structural. strictNullChecks feels like C# nullable reference types, but enforcement is compile-time only.',
          },
          {
            type: 'comparisonTable',
            title: isJs ? 'JavaScript vs C# and TypeScript' : 'TypeScript vs JavaScript and C#',
            headers: ['Aspect', isJs ? 'JavaScript' : 'TypeScript', isJs ? 'C# / TypeScript' : 'JavaScript / C#'],
            rows: isJs
              ? [
                  ['Type checking', 'Run time (dynamic)', 'Compile time (TS) or compile + run time (C#)'],
                  ['Thread model', 'Single thread + event loop', 'C#: thread pool; TS: same as JS'],
                  ['OOP model', 'Prototypes + class sugar', 'C#: nominal classes; TS: structural interfaces'],
                  ['Async', 'Promises + microtasks', 'C#: Task on thread pool'],
                  ['Privacy', '# fields, closures, conventions', 'C#: access modifiers enforced by CLR'],
                ]
              : [
                  ['Types at run time', 'Erased — plain JS objects', 'C#: metadata in IL; JS: none'],
                  ['Assignability', 'Structural (shape-based)', 'C#: nominal; JS: duck typing'],
                  ['Generics', 'Compile-time only', 'C#: reified at run time'],
                  ['Null safety', 'strictNullChecks (compile only)', 'C# NRT: compile + some run-time checks'],
                  ['Modules', 'ESM/CJS emit', 'C#: assemblies and namespaces'],
                ],
          },
        ],
      },
      {
        heading: 'How to study this track',
        blocks: [
          {
            type: 'prose',
            text: `Modules are numbered in learning order. Work through them in sequence unless a time map below fits your schedule. Each module ends with a mind map, a one-screen quick overview, and an interview page. This track has ${modules.length} modules and ${totalTopics} topics.`,
          },
          {
            type: 'steps',
            title: 'Recommended learning path',
            items: [
              {
                title: 'Foundations (modules 01–07)',
                body: isJs
                  ? 'Runtime, syntax, types/coercion, functions/closures, objects/prototypes, errors, and null safety. Finish before async or memory modules.'
                  : 'What TS is, basic types, type system, functions, classes, errors, and null safety. Finish before generics or conditional types.',
              },
              {
                title: 'Intermediate (modules 08–13)',
                body: isJs
                  ? 'Collections, structural patterns, callbacks/events, modern syntax, functional methods, and Promises/async/event loop.'
                  : 'Collections, generics, utility types, narrowing, conditional/mapped types, and async typing.',
              },
              {
                title: 'Advanced (modules 14–18)',
                body: isJs
                  ? 'Memory/GC, Workers, modules/tooling, browser vs Node, and ES recap with interview radar.'
                  : 'Module resolution, advanced patterns, decorators, compiler tooling, and TS recap with interview radar.',
              },
              {
                title: 'Revise with mind maps and interview pages',
                body: 'Use mind maps and interview sections to reinforce what you learned — not as a shortcut around the topic pages.',
              },
              {
                title: 'Senior / FAANG depth layer (5+ years)',
                body: isJs
                  ? 'On intermediate and advanced topics (08–18), read the Senior interview depth section after the beginner steps. Priority: microtasks-vs-macrotasks, closures-and-capture, implementing-promise-from-scratch, v8-garbage-collection, debounce-throttle-implementations.'
                  : 'On intermediate and advanced topics (08–18), read Senior interview depth sections. Priority: infer-keyword, discriminated-unions-narrowing, conditional-types-basics, branded-and-opaque-types, strict-null-checks.',
              },
            ],
          },
          {
            type: 'callout',
            variant: 'tip',
            title: `${totalTopics} topics — beginner clarity plus senior depth`,
            body: 'Every topic keeps plain-English hooks and glossaries. Intermediate and advanced modules add runtime internals, tradeoffs, and FAANG-style interview scripts without removing the beginner layer.',
          },
        ],
      },
    ],
    stages: stagesFromModules(modules),
    timeMaps: buildTimeMaps(language, modules),
    officialSources: isJs
      ? [
          { title: 'MDN JavaScript', url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript' },
          { title: 'javascript.info', url: 'https://javascript.info/' },
          { title: 'ECMAScript specification', url: 'https://tc39.es/ecma262/' },
        ]
      : [
          { title: 'TypeScript handbook', url: 'https://www.typescriptlang.org/docs/handbook/intro.html' },
          { title: 'TypeScript playground', url: 'https://www.typescriptlang.org/play' },
          { title: 'TypeScript deep dive', url: 'https://basarat.gitbook.io/typescript/' },
        ],
  };

  writeFileSync(join(root, language, 'overview.json'), `${JSON.stringify(overview, null, 2)}\n`);
}

function stagesFromModules(modules) {
  return ['foundation', 'intermediate', 'advanced'].map((stage) => {
    const stageModules = modules.filter((m) => m.mod.stage === stage);
    return {
      id: stage,
      title:
        stage === 'foundation'
          ? 'Foundations (01–07)'
          : stage === 'intermediate'
            ? 'Intermediate (08–13)'
            : 'Advanced (14–18)',
      summary: stageModules[0]?.mod.summary ?? '',
      moduleIds: stageModules.map((m) => m.moduleId),
    };
  });
}

function buildTimeMaps(language, modules) {
  const allIds = modules.map((m) => m.moduleId);
  const foundation = modules.filter((m) => m.mod.stage === 'foundation').map((m) => m.moduleId);
  const through13 = modules.filter((m) => m.mod.order <= 13).map((m) => m.moduleId);
  const intermediateAdvanced = modules.filter((m) => m.mod.order >= 8).map((m) => m.moduleId);

  return [
    {
      duration: '2 hours',
      focus: 'Skim foundations. Focus on runtime/types and the topic that maps to your weakest interview area.',
      moduleIds: foundation.slice(0, 4),
    },
    {
      duration: '2 days',
      focus: 'Complete modules 01–13 with interview pages. Leave 14–18 for a third sitting.',
      moduleIds: through13,
    },
    {
      duration: 'Full pass',
      focus: 'All 18 modules in order. Use mind maps and interview pages as revision.',
      moduleIds: allIds,
    },
    {
      duration: 'FAANG depth pass',
      focus:
        language === 'javascript'
          ? 'Deep-read Senior interview depth on modules 08–18. Priority: event loop, closures, Promises, memory/GC, debounce/throttle implementations.'
          : 'Deep-read Senior interview depth on modules 08–18. Priority: narrowing, generics, conditional/mapped types, module resolution, branded types.',
      moduleIds: intermediateAdvanced,
    },
  ];
}

function writeAuthoringGuide(language) {
  const isJs = language === 'javascript';
  const content = `# ${isJs ? 'JavaScript' : 'TypeScript'} Content Authoring Guide

Use this guide when writing or deepening any module under \`data/${language}/modules/\`.

## Dual audience model

Every topic serves **two layers**. Beginners read Layer 1 first; senior / FAANG interview prep lives in Layer 2.

| Layer | Audience | Goal |
| --- | --- | --- |
| **Layer 1 — Beginner** | First-time readers | Understand terms, flow, and working examples |
| **Layer 2 — Senior (5yr / FAANG)** | Experienced engineers | Internals, tradeoffs, production proof, 60-second answers |

**Layer 2 is required** on all topics in **intermediate** (modules 08–13) and **advanced** (modules 14–18) modules.
**Layer 2 is recommended** on foundation modules 01–03; required on 04–07 when the topic is interview-critical.

---

## Layer 1 rules (beginner — keep always)

1. **Expand abbreviations on first use**
2. **Hook:** Max 2 sentences, plain English, no unexplained acronyms
3. **Sections:** 4–6 using \`blocks[]\`
4. **Code:** Minimum **3 snippets** per topic with line-by-line \`explanation\`
5. **Glossary:** At least one \`glossary\` block per topic
6. **Diagram:** At least one \`diagram\` block (Mermaid) when the concept is flow/structure/memory
7. **Cross-language:** Keep \`jsTsCorrelations\`; compare ${isJs ? 'C# and TypeScript' : 'JavaScript and C#'} runtime behavior
8. **Cross-links:** Preserve valid \`relatedTopicIds\`

---

## Layer 2 rules (senior / FAANG — intermediate + advanced)

Add a **7th section**:

| Section heading | Required blocks |
| --- | --- |
| **Senior interview depth** | \`prose\` (internals), \`comparisonTable\` (tradeoffs), \`callout\` variant \`warning\` (“what gets you rejected”) |

### \`interviewTakeaways\` — exactly **5 bullets** (include \`60s:\` script)

### \`commonPitfalls\` — at least **3 items** (weak vs strong answer)

### Snippets: **4+** on intermediate/advanced; **1 diagnostics/failure-mode** snippet on P0 topics

---

## Senior topics from community research (Reddit / LeetCode discussions)

${isJs ? `- Event loop output tracing (sync, microtasks, macrotasks, async/await)
- Closures in loops (var vs let), scope chain vs call stack
- Implement Promise, debounce, throttle, deep clone with circular refs
- this binding matrix (default, implicit, explicit, arrow, class)
- Prototype chain vs class sugar
- Memory leaks: closures, listeners, detached DOM
- Concurrency-limited Promise.all patterns` : `- unknown at API boundaries + narrowing guards
- Discriminated unions and exhaustiveness checking
- Conditional types with infer (Awaited, ReturnType patterns)
- Mapped types with key remapping (as clause)
- Distributive conditional pitfalls
- strictNullChecks vs C# NRT (compile-time only)
- Branded/opaque types for domain safety
- Module resolution (nodenext, bundler) and .d.ts authoring`}

---

## Research sources

${isJs ? `- [MDN JavaScript](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
- [javascript.info](https://javascript.info/)
- [ECMAScript spec](https://tc39.es/ecma262/)` : `- [TypeScript handbook](https://www.typescriptlang.org/docs/handbook/intro.html)
- [TypeScript release notes](https://www.typescriptlang.org/docs/handbook/release-notes/overview.html)
- [Basarat TypeScript deep dive](https://basarat.gitbook.io/typescript/)`}

New topic IDs: \`${language}-{module-order}-{slug-with-dashes}\`.
`;

  writeFileSync(join(root, language, 'CONTENT_AUTHORING.md'), content);
}

function generate(language, modulePlan) {
  mkdirSync(join(root, language), { recursive: true });
  const built = modulePlan.map((mod) => buildModule(language, mod));
  const modules = built.map((b) => writeModuleJson(language, b));
  writeIndex(language, modules);
  writeOverview(language, modules);
  writeAuthoringGuide(language);
  const topicCount = modules.reduce((sum, m) => sum + m.topicCount, 0);
  console.log(`${language}: ${modules.length} modules, ${topicCount} topics scaffolded`);
  return { modules, topicCount };
}

generate('javascript', javascriptModules);
generate('typescript', typescriptModules);
