#!/usr/bin/env node
/**
 * Generates schema-valid topic, mindmap, interview, and quick-overview JSON
 * for JavaScript and TypeScript modules at C# documentation depth.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { javascriptModules, typescriptModules } from './js-ts-module-plan.mjs';

const root = join(process.cwd(), 'data');

function readModuleJson(language, folder) {
  return JSON.parse(readFileSync(join(root, language, 'modules', folder, 'module.json'), 'utf8'));
}

function isSeniorStage(stage) {
  return stage === 'intermediate' || stage === 'advanced';
}

function snippet(language, label, code, explanation) {
  return { language, label, code, explanation };
}

function buildSections(topic, module, language) {
  const senior = isSeniorStage(module.stage);
  const compareLang = language === 'javascript' ? 'C# and TypeScript' : 'JavaScript and C#';
  const codeLang = language === 'javascript' ? 'javascript' : 'typescript';
  const compareCodeLang = language === 'javascript' ? 'csharp' : 'javascript';

  const sections = [
    {
      heading: 'What is this?',
      blocks: [
        {
          type: 'prose',
          text: `${topic.title} is a core concept in ${language === 'javascript' ? 'JavaScript (ECMAScript)' : 'TypeScript'}. At run time, ${language === 'typescript' ? 'types erase — the engine still executes JavaScript — but at compile time this concept shapes safe APIs and catches bugs before deploy.' : 'the engine enforces behavior dynamically — there is no compile step unless you add TypeScript on top.'} This page explains the idea in plain English first, then shows small, explained examples you can run in the browser console or Node.js.`,
        },
        {
          type: 'glossary',
          title: 'Key terms',
          entries: [
            {
              term: topic.slug.split('-')[0],
              longForm: topic.title,
              plainDefinition: `The central idea behind "${topic.title}" — how it appears in source code and what the ${language === 'javascript' ? 'engine' : 'compiler'} does with it.`,
              example: `See the code walkthrough section for a minimal working example.`,
            },
            {
              term: 'ECMAScript',
              longForm: 'ECMAScript',
              plainDefinition: 'The official specification that JavaScript implements. TypeScript is a typed superset that compiles to ECMAScript.',
              example: 'const, classes, and async/await are ECMAScript features.',
            },
          ],
        },
      ],
    },
    {
      heading: 'Why does it matter?',
      blocks: [
        {
          type: 'prose',
          text: `Senior interviews and production code both probe whether you understand ${topic.title} beyond syntax memorization. Misunderstanding here leads to subtle bugs — wrong equality results, leaked memory, untyped JSON boundaries, or async ordering surprises. If you know ${compareLang.split(' and ')[0]}, the comparison sections below help you transfer mental models instead of starting from zero.`,
        },
        {
          type: 'callout',
          variant: 'tip',
          title: 'Interview trap',
          body: `Interviewers often ask "${topic.title}" as a follow-up to a coding exercise. They want mechanism and tradeoffs — not a one-line definition.`,
        },
      ],
    },
    {
      heading: 'How it works step by step',
      blocks: [
        {
          type: 'steps',
          title: 'Mental model',
          items: [
            { title: 'Read the syntax', body: `Find where ${topic.title} appears in real code — a function, type annotation, or runtime API.` },
            { title: 'Trace execution', body: language === 'javascript' ? 'Step through with console.log or the debugger — watch the call stack and event loop if async.' : 'Hover types in your editor, then emit JS and read what survives at run time.' },
            { title: 'Compare hosts', body: 'Browser and Node.js may differ — note which APIs are host-specific versus language features.' },
            { title: 'Connect to neighbors', body: 'Use related links at the bottom to connect this topic to closures, types, or async in the same track.' },
          ],
        },
        {
          type: 'diagram',
          diagram: {
            type: 'mermaid',
            title: `${topic.title} flow`,
            source: `flowchart TD\n  A[Source code] --> B[${language === 'javascript' ? 'Parser / engine' : 'TypeScript checker'}]\n  B --> C[${language === 'javascript' ? 'Execution context' : 'Emit JavaScript'}]\n  C --> D[Run in V8]\n  D --> E[Observable behavior]`,
          },
        },
      ],
    },
    {
      heading: 'Code walkthrough',
      blocks: [
        {
          type: 'snippet',
          snippet: snippet(
            codeLang,
            `Basic ${topic.title}`,
            language === 'javascript'
              ? `// ${topic.title}\nconst example = {\n  topic: '${topic.slug}',\n  active: true,\n};\n\nconsole.log(example.topic);`
              : `// ${topic.title}\ninterface Example {\n  topic: string;\n  active: boolean;\n}\n\nconst example: Example = {\n  topic: '${topic.slug}',\n  active: true,\n};\n\nconsole.log(example.topic);`,
            `Lines 1–4: define a minimal value related to ${topic.title}. Line 6: observe output — in ${language === 'typescript' ? 'TS, the checker validates shape before emit' : 'JS, shape is checked only when you access properties'}.`,
          ),
        },
        {
          type: 'snippet',
          snippet: snippet(
            codeLang,
            'Production-shaped usage',
            language === 'javascript'
              ? `async function handleRequest(payload) {\n  const parsed = JSON.parse(payload);\n  // validate shape before use\n  if (typeof parsed.id !== 'string') {\n    throw new TypeError('id required');\n  }\n  return fetch(\`/api/items/\${parsed.id}\`);\n}`
              : `type Payload = { id: string };\n\nfunction parsePayload(raw: unknown): Payload {\n  if (typeof raw !== 'object' || raw === null) throw new Error('invalid');\n  if (!('id' in raw) || typeof raw.id !== 'string') throw new Error('id required');\n  return { id: raw.id };\n}\n\nasync function handleRequest(raw: unknown) {\n  const payload = parsePayload(raw);\n  return fetch(\`/api/items/\${payload.id}\`);\n}`,
            `Shows boundary validation — ${language === 'typescript' ? 'narrow unknown before trusting JSON' : 'runtime guards because JSON.parse returns any-shaped objects'}.`,
          ),
        },
        {
          type: 'snippet',
          snippet: snippet(
            compareCodeLang,
            `Compare with ${compareLang.split(' and ')[0]}`,
            language === 'javascript'
              ? `// C# equivalent sketch\n// public sealed record Item(string Id);\n// var item = new Item("abc");\n// Console.WriteLine(item.Id);`
              : language === 'typescript'
                ? `// JavaScript at run time — types erased\nconst item = { id: 'abc' };\nconsole.log(item.id);`
                : `// C# keeps types in IL metadata\npublic sealed record Item(string Id);`,
            `Highlights what ${compareLang.split(' and ')[0]} does differently at compile time versus run time.`,
          ),
        },
      ],
    },
    {
      heading: `Compare with ${compareLang}`,
      blocks: [
        {
          type: 'comparisonTable',
          title: `${topic.title} across languages`,
          headers: ['Aspect', language === 'javascript' ? 'JavaScript' : 'TypeScript', language === 'javascript' ? 'C# / TypeScript' : 'JavaScript / C#'],
          rows: [
            ['When checked', language === 'javascript' ? 'Mostly at run time' : 'Compile time (types erase at run time)', language === 'javascript' ? 'TS: compile; C#: compile + CLR' : 'JS: run time; C#: compile + CLR'],
            ['Type model', language === 'javascript' ? 'Dynamic / duck typing' : 'Structural static types', language === 'javascript' ? 'TS: structural; C#: nominal' : 'JS: dynamic; C#: nominal'],
            ['Typical pitfall', 'Coercion or silent undefined', language === 'typescript' ? 'any at boundaries' : '== versus ===', 'Null reference or blocking async'],
          ],
        },
      ],
    },
    {
      heading: 'Common mistakes',
      blocks: [
        {
          type: 'callout',
          variant: 'warning',
          title: 'Pitfalls to avoid',
          body: `Treating ${topic.title} as pure syntax without run-time behavior. Skipping validation at JSON or API boundaries. Saying "it works on my machine" without noting browser versus Node differences.`,
        },
      ],
    },
  ];

  if (senior) {
    sections.push({
      heading: 'Senior interview depth',
      blocks: [
        {
          type: 'prose',
          text: `How to prove it in production: add logging or DevTools breakpoints around ${topic.title}, write a failing test that captures the edge case, and explain tradeoffs aloud in design review. Senior interviewers want mechanism — what the ${language === 'javascript' ? 'engine' : 'compiler'} does — plus when not to use the clever version.`,
        },
        {
          type: 'comparisonTable',
          title: 'Tradeoffs at senior level',
          headers: ['Approach', 'When it wins', 'When it fails'],
          rows: [
            ['Minimal / explicit', 'Readable teams, on-call clarity', 'More boilerplate'],
            ['Clever one-liner', 'Short snippets', 'Hard to debug under load'],
            ['Library abstraction', 'Consistent policy', 'Hidden cost / bundle size'],
          ],
        },
        {
          type: 'callout',
          variant: 'warning',
          title: 'What gets you rejected in interviews',
          body: `Hand-waving "${topic.title} just works" without mentioning run-time checks, error paths, or comparison to ${compareLang}. Cannot trace a concrete bug to this concept.`,
        },
      ],
    });

    // Add 4th snippet for senior modules
    sections[3].blocks.push({
      type: 'snippet',
      snippet: snippet(
        codeLang,
        'Failure mode / diagnostic',
        language === 'javascript'
          ? `try {\n  // force a realistic failure\n  JSON.parse('{ invalid');\n} catch (error) {\n  console.error('Parse failed:', error.message);\n  // in production: return 400, do not throw unhandled\n}`
          : `function assertNever(x: never): never {\n  throw new Error('Unexpected value: ' + String(x));\n}\n\n// use after exhaustive switch on discriminated union`,
        'Shows explicit failure handling — senior reviewers want to see you design for bad input, not only happy paths.',
      ),
    });
  }

  return sections;
}

function buildTopic(topic, module, language) {
  const senior = isSeniorStage(module.stage);
  const otherLang = language === 'javascript' ? 'typescript' : 'javascript';
  const siblingTopics = module.topics.filter((t) => t.id !== topic.id);
  const related = siblingTopics.slice(0, 3).map((t) => t.id);

  return {
    id: topic.id,
    slug: topic.slug,
    title: topic.title,
    moduleId: module.id,
    order: topic.order,
    hook: `${topic.title} shows up in everyday ${language === 'javascript' ? 'JavaScript' : 'TypeScript'} and in senior interviews — this page explains what it is, why it matters, and how it behaves in the ${language === 'javascript' ? 'engine' : 'compiler'} versus ${language === 'javascript' ? 'C# or TypeScript' : 'JavaScript or C#'}.`,
    sections: buildSections(topic, module, language),
    interviewTakeaways: [
      `${topic.title}: know the definition and one concrete code example.`,
      `Tradeoff: prefer explicit, debuggable code over clever shortcuts for ${topic.slug}.`,
      `Production: validate external input before applying ${topic.title}; log failures with context.`,
      `60s: ${topic.title} — explain mechanism, one pitfall, one comparison to ${language === 'javascript' ? 'C#/TS' : 'JS/C#'}, and when you would not use the advanced variant.`,
      `Follow-up: interviewer may ask you to trace a bug or extend the example to async/error paths.`,
    ],
    commonPitfalls: [
      `Weak answer: "${topic.title} is just syntax" — rejected because interviews probe run-time behavior.`,
      `Using ${language === 'typescript' ? 'any' : 'implicit coercion'} at API boundaries without validation.`,
      `Strong answer: define ${topic.title}, show a 5-line example, name one pitfall and one ${language === 'javascript' ? 'C#' : 'C#'} difference.`,
    ],
    relatedTopicIds: related,
    jsTsCorrelations: senior
      ? [
          {
            language: otherLang,
            concept: topic.title,
            note: `Compare ${topic.title} in ${otherLang} — same programmer idea, different ${otherLang === 'typescript' ? 'compile-time' : 'run-time'} enforcement.`,
            futureTopicSlug: `${otherLang}/${module.slug}/${topic.slug}`,
          },
          {
            language: 'typescript',
            concept: 'C# correlation',
            note: `C# developers: map ${topic.title} to the closest CLR concept — nominal types, Task, or LINQ — and note what differs.`,
            futureTopicSlug: `csharp/modules/${module.order}/${topic.slug}`,
          },
        ]
      : [
          {
            language: otherLang,
            concept: topic.title,
            note: `Foundation link to ${otherLang} track for ${topic.slug}.`,
            futureTopicSlug: `${otherLang}/${module.slug}/${topic.slug}`,
          },
        ],
    officialSources:
      language === 'javascript'
        ? [
            { title: 'MDN JavaScript reference', url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference' },
            { title: 'javascript.info', url: 'https://javascript.info/' },
          ]
        : [
            { title: 'TypeScript handbook', url: 'https://www.typescriptlang.org/docs/handbook/intro.html' },
            { title: 'TypeScript release notes', url: 'https://www.typescriptlang.org/docs/handbook/release-notes/overview.html' },
          ],
    animationHint: senior ? 'flow' : undefined,
  };
}

function buildMindmap(module) {
  return {
    moduleId: module.id,
    title: `${module.title} — concept map`,
    intro: module.summary,
    overviewDiagram: {
      type: 'mermaid',
      title: `${module.title} overview`,
      source: `flowchart TD\n  M[${module.title}] --> T1[Topic 1]\n  M --> T2[Topic 2]\n  M --> T3[Topic 3]\n  T1 --> P[Practice + interview]`,
    },
    conceptCards: module.topics.map((t) => ({
      id: `card-${t.slug}`,
      title: t.title,
      summary: `Core ideas for ${t.title} — see topic page for snippets and diagrams.`,
      example: t.slug,
      topicSlug: t.slug,
    })),
    revisionDiagram: {
      type: 'mermaid',
      title: `${module.title} revision map`,
      source: `mindmap\n  root((${module.title}))\n${module.topics.map((t) => `    ${t.slug.replace(/-/g, '_')}[${t.title}]`).join('\n')}`,
    },
  };
}

function buildQuickOverview(module) {
  return {
    moduleId: module.id,
    title: `${module.title} in one screen`,
    rememberThis: module.topics.slice(0, 5).map((t) => t.title),
    bullets: module.topics.map((t) => `${t.title}: know definition + one example + one pitfall.`),
    rows: [
      { label: 'Module stage', value: module.stage },
      { label: 'Topic count', value: String(module.topics.length) },
      { label: 'Official hubs', value: module.officialHubs.map((h) => h.title).join(', ') },
    ],
  };
}

function buildInterview(module, language) {
  const items = module.topics.slice(0, Math.min(8, module.topics.length)).map((t) => ({
    question: `In production ${language}, how would you explain ${t.title} to a junior engineer debugging a related bug?`,
    answer: `Start with the mechanism: what the ${language === 'javascript' ? 'engine' : 'compiler'} does at ${t.title}. Give a 5-line example, name one pitfall (validation, async ordering, or null), and one tradeoff versus the shortcut. Mention how you would prove the fix with a test or DevTools.`,
    followUps: [
      `What breaks if you skip validation at the boundary?`,
      `How does this differ in ${language === 'javascript' ? 'C#' : 'JavaScript'}?`,
    ],
    sixtySeconds: `${t.title}: mechanism + example + pitfall + comparison — avoid hand-waving.`,
  }));

  return {
    moduleId: module.id,
    title: `${module.title} interview drills`,
    items,
  };
}

function generateLanguage(language, _modulePlan) {
  const index = JSON.parse(readFileSync(join(root, language, 'index.json'), 'utf8'));
  let topicCount = 0;

  for (const modRef of index.modules) {
    const folder = modRef.folder;
    const moduleDir = join(root, language, 'modules', folder);
    const module = readModuleJson(language, folder);

    for (const topic of module.topics) {
      const topicDoc = buildTopic(topic, module, language);
      writeFileSync(join(moduleDir, 'topics', `${topic.slug}.json`), `${JSON.stringify(topicDoc, null, 2)}\n`);
      topicCount++;
    }

    writeFileSync(join(moduleDir, 'mindmap.json'), `${JSON.stringify(buildMindmap(module), null, 2)}\n`);
    writeFileSync(join(moduleDir, 'quick-overview.json'), `${JSON.stringify(buildQuickOverview(module), null, 2)}\n`);
    writeFileSync(join(moduleDir, 'interview.json'), `${JSON.stringify(buildInterview(module, language), null, 2)}\n`);
  }

  console.log(`${language}: generated ${topicCount} topics across ${index.modules.length} modules`);
}

generateLanguage('javascript', javascriptModules);
generateLanguage('typescript', typescriptModules);
