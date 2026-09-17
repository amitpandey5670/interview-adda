#!/usr/bin/env node
/**
 * Rewrites generic TypeScript topics in modules 01, 03, 04, 05, 07
 * to match quality bar (any-unknown-never.json).
 */
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';

const root = join(process.cwd(), 'data/typescript/modules');

function writeTopic(moduleFolder, filename, topic) {
  const path = join(root, moduleFolder, 'topics', filename);
  writeFileSync(path, `${JSON.stringify(topic, null, 2)}\n`);
  return path;
}

function writeMindmap(moduleFolder, mindmap) {
  const path = join(root, moduleFolder, 'mindmap.json');
  writeFileSync(path, `${JSON.stringify(mindmap, null, 2)}\n`);
  return path;
}

const topics = [
  // ── Module 01 ──────────────────────────────────────────────────────────
  {
    module: '01-what-is-typescript',
    file: 'compile-pipeline-and-tsc.json',
    data: {
      id: 'typescript-01-compile-pipeline-and-tsc',
      slug: 'compile-pipeline-and-tsc',
      title: 'The TypeScript compile pipeline (tsc, emit, source maps)',
      moduleId: 'typescript-01-what-is-typescript',
      order: 2,
      hook: 'TypeScript source passes through the compiler (tsc) for type checking, then emits plain JavaScript and optional source maps. Unlike C# which compiles to Intermediate Language (IL) with type metadata, almost all TypeScript types erase before the engine runs.',
      sections: [
        {
          heading: 'What is the compile pipeline?',
          blocks: [
            {
              type: 'prose',
              text: 'The **TypeScript compile pipeline** has two jobs: (1) **type checking** — report errors without changing behavior, and (2) **emit** — output JavaScript (and optionally `.d.ts` declaration files and **source maps**). The `tsc` CLI orchestrates both. **Bundlers** (esbuild, Vite, webpack) often skip emit and use `tsc --noEmit` for CI typecheck only. Types are **erasable** — interfaces and generics vanish; only values, functions, and classes (as constructors) survive at run time.',
            },
            {
              type: 'glossary',
              title: 'Key terms',
              entries: [
                { term: 'tsc', longForm: 'TypeScript compiler (tsc)', plainDefinition: 'CLI that type-checks and emits JavaScript from .ts/.tsx files.', example: 'npx tsc --noEmit' },
                { term: 'emit', longForm: 'emit (compiler output)', plainDefinition: 'Generated JavaScript files written to outDir. Types are stripped during emit.', example: '"outDir": "dist"' },
                { term: 'source map', longForm: 'source map (.map)', plainDefinition: 'Maps emitted JS lines back to original TypeScript for debugging in DevTools.', example: '"sourceMap": true' },
                { term: 'declaration file', longForm: 'declaration file (.d.ts)', plainDefinition: 'Type-only description of JS API surface for consumers.', example: '"declaration": true' },
              ],
            },
          ],
        },
        {
          heading: 'Why does it matter?',
          blocks: [
            {
              type: 'prose',
              text: 'Interviewers probe whether you know **tsc only checks, bundlers transform**. Misunderstanding leads to shipping unchecked code (Vite without `tsc` in CI), broken stack traces (no source maps), or expecting run-time type enforcement (impossible without a validator). C# Roslyn emits IL **with** type metadata the CLR reads — TypeScript never does.',
            },
            {
              type: 'callout',
              variant: 'tip',
              title: 'Production split',
              body: 'Dev: bundler for speed. CI: `tsc --noEmit` or `tsc -b` for project references. Never assume the bundler caught every type error.',
            },
          ],
        },
        {
          heading: 'Pipeline step by step',
          blocks: [
            {
              type: 'steps',
              title: 'From .ts to running code',
              items: [
                { title: 'Parse', body: 'TypeScript parser builds an AST from .ts/.tsx.' },
                { title: 'Bind & check', body: 'Symbol resolution, type inference, strict flags applied — errors reported here.' },
                { title: 'Transform', body: 'Downlevel syntax (optional chaining, decorators) per target lib.' },
                { title: 'Emit', body: 'Write .js, .d.ts, .map to outDir — types erased.' },
                { title: 'Run', body: 'Node or browser executes plain JavaScript — no type layer.' },
              ],
            },
            {
              type: 'diagram',
              diagram: {
                type: 'mermaid',
                title: 'TypeScript compile pipeline',
                source: 'flowchart LR\n  TS[".ts source"] --> PARSE[Parse AST]\n  PARSE --> CHECK[Type check]\n  CHECK -->|errors| FAIL[CI fails]\n  CHECK --> TRANS[Transform]\n  TRANS --> EMIT[".js + .map + .d.ts"]\n  EMIT --> RUN[V8 / browser]',
              },
            },
          ],
        },
        {
          heading: 'Code walkthrough',
          blocks: [
            {
              type: 'snippet',
              snippet: {
                language: 'typescript',
                label: 'What survives emit',
                code: 'interface User { id: string; name: string; }\n\nfunction greet(u: User): string {\n  return `Hello, ${u.name}`;\n}\n\nconst ada: User = { id: "1", name: "Ada" };\nconsole.log(greet(ada));',
                explanation: 'Lines 1–3: interface and type annotations exist only for the checker. Emitted JS is plain functions and objects — no User tag at run time.',
              },
            },
            {
              type: 'snippet',
              snippet: {
                language: 'bash',
                label: 'tsc commands in CI',
                code: '# Typecheck only (no emit) — common in Vite/React CI\nnpx tsc --noEmit\n\n# Build with declarations for a library\nnpx tsc --declaration --outDir dist\n\n# Project references (monorepo)\nnpx tsc -b packages/*',
                explanation: 'Line 2: catches type errors without writing files. Line 5: emits .d.ts for npm consumers. Line 8: incremental build across referenced tsconfigs.',
              },
            },
            {
              type: 'snippet',
              snippet: {
                language: 'json',
                label: 'tsconfig emit options',
                code: '{\n  "compilerOptions": {\n    "target": "ES2022",\n    "module": "NodeNext",\n    "outDir": "dist",\n    "sourceMap": true,\n    "declaration": true,\n    "declarationMap": true\n  }\n}',
                explanation: 'sourceMap: DevTools maps stack traces to .ts. declaration + declarationMap: jump-to-definition in consuming editors.',
              },
            },
            {
              type: 'snippet',
              snippet: {
                language: 'typescript',
                label: 'Failure mode — bundler without tsc',
                code: '// vite build succeeds even if this has type errors\n// unless you run tsc --noEmit in CI\nfunction broken(x: string): number {\n  return x.length; // if someone changes return type to number but passes wrong logic\n}',
                explanation: 'esbuild/swc strip types without full checking. Always run tsc in CI for production repos.',
              },
            },
          ],
        },
        {
          heading: 'Compare with JavaScript and C#',
          blocks: [
            {
              type: 'comparisonTable',
              title: 'Compile pipelines across stacks',
              headers: ['Stage', 'TypeScript', 'JavaScript', 'C#'],
              rows: [
                ['Source', '.ts / .tsx', '.js / .mjs', '.cs'],
                ['Checker', 'tsc (optional in dev)', 'None (or ESLint)', 'Roslyn'],
                ['Output', 'Erased JS + optional .d.ts', 'Same file', 'IL + metadata'],
                ['Run-time types', 'None', 'Dynamic', 'CLR enforced'],
                ['Debug maps', 'sourceMap', 'Rare', 'PDB'],
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
              title: 'Assuming emit validates at run time',
              body: 'Emitted JS has zero type info. JSON.parse still returns untyped data — add validators at boundaries.',
            },
          ],
        },
      ],
      interviewTakeaways: [
        'tsc type-checks then emits erased JavaScript — types do not exist at run time.',
        'CI should run tsc --noEmit even when Vite/webpack bundles.',
        'sourceMap links runtime errors back to .ts lines in DevTools.',
        '60s: Parse → check → transform → emit. Types erase. C# keeps IL metadata; TS does not. Bundlers are not a substitute for tsc in CI.',
        'Follow-up: when do you emit .d.ts vs use project references?',
      ],
      commonPitfalls: [
        'Weak: "tsc adds types to JavaScript at runtime" — types erase completely.',
        'Weak: relying on Vite alone for type safety — need tsc --noEmit in CI.',
        "Strong: 'Two-phase: checker catches bugs, emit strips types. Source maps for debug. C# IL retains metadata; TS is compile-time only.'",
      ],
      relatedTopicIds: [
        'typescript-01-tsconfig-and-project-setup',
        'typescript-01-erasable-types-and-runtime',
        'typescript-01-typescript-vs-javascript-csharp',
        'typescript-17-ci-typecheck-pipelines',
      ],
      jsTsCorrelations: [
        { language: 'javascript', concept: 'no compile step', note: 'Plain JS runs directly — TypeScript adds a compile phase that disappears before V8 executes.', futureTopicSlug: 'javascript/what-is-typescript/no-compile-step' },
        { language: 'typescript', concept: 'erasable types', note: 'Unlike C# IL metadata, emitted JS has no interface tags — same as JS at runtime.', futureTopicSlug: 'typescript/what-is-typescript/erasable-types-and-runtime' },
      ],
      officialSources: [
        { title: 'TypeScript — tsc CLI', url: 'https://www.typescriptlang.org/docs/handbook/compiler-options.html' },
        { title: 'TypeScript — Project References', url: 'https://www.typescriptlang.org/docs/handbook/project-references.html' },
      ],
      animationHint: 'flow',
    },
  },
  {
    module: '01-what-is-typescript',
    file: 'tsconfig-and-project-setup.json',
    data: {
      id: 'typescript-01-tsconfig-and-project-setup',
      slug: 'tsconfig-and-project-setup',
      title: 'tsconfig.json, project references, and strict mode',
      moduleId: 'typescript-01-what-is-typescript',
      order: 3,
      hook: 'tsconfig.json is the single source of truth for how TypeScript checks and emits your project. Enabling strict mode upfront prevents null and implicit-any bugs that are expensive to fix later — the same discipline C# teams apply with nullable reference types on new solutions.',
      sections: [
        {
          heading: 'What is tsconfig.json?',
          blocks: [
            {
              type: 'prose',
              text: '**tsconfig.json** configures the TypeScript compiler: which files to include, **target** ECMAScript version, **module** resolution strategy, **strict** family flags, and output paths. **`"strict": true`** enables strictNullChecks, noImplicitAny, strictFunctionTypes, and more. **Project references** split monorepos into composable packages with incremental builds via `tsc -b`. Extends lets shared bases (`@tsconfig/strictest`) propagate team standards.',
            },
            {
              type: 'glossary',
              title: 'Key terms',
              entries: [
                { term: 'strict', longForm: 'strict compiler flag', plainDefinition: 'Master switch enabling the recommended strict type-checking options.', example: '"strict": true' },
                { term: 'include', longForm: 'include / exclude', plainDefinition: 'Glob patterns defining which source files belong to the project.', example: '"include": ["src"]' },
                { term: 'project references', longForm: 'project references', plainDefinition: 'Links tsconfigs so packages build in dependency order with incremental .tsbuildinfo.', example: '"references": [{ "path": "../core" }]' },
                { term: 'composite', longForm: 'composite projects', plainDefinition: 'Required for referenced projects — enables incremental emit and .d.ts output.', example: '"composite": true' },
              ],
            },
          ],
        },
        {
          heading: 'Why does it matter?',
          blocks: [
            {
              type: 'prose',
              text: 'A loose tsconfig (`strict: false`, `skipLibCheck: true` everywhere) ships bugs that strict mode would catch on day one. Greenfield Angular/React templates ship with strict on. Legacy migration uses **incremental strict** — enable one flag per PR. Monorepos without project references re-typecheck the entire tree on every CI run.',
            },
            {
              type: 'callout',
              variant: 'remember',
              title: 'strict is not one flag',
              body: 'strict enables a bundle. exactOptionalPropertyTypes and noUncheckedIndexedAccess are separate — turn on explicitly for max safety.',
            },
          ],
        },
        {
          heading: 'Setup workflow',
          blocks: [
            {
              type: 'steps',
              title: 'Greenfield project setup',
              items: [
                { title: 'npx tsc --init', body: 'Generate a starter tsconfig with comments.' },
                { title: 'Enable strict', body: '"strict": true — fix errors as they appear.' },
                { title: 'Set module resolution', body: 'NodeNext for Node ESM; bundler for Vite.' },
                { title: 'Add paths if needed', body: 'Alias imports — remember bundler must mirror paths.' },
                { title: 'Wire CI', body: 'tsc --noEmit on every PR.' },
              ],
            },
            {
              type: 'diagram',
              diagram: {
                type: 'mermaid',
                title: 'Monorepo with project references',
                source: 'flowchart TD\n  ROOT[root tsconfig.json] --> APP[apps/web tsconfig]\n  ROOT --> PKG[packages/core tsconfig]\n  APP -->|references| PKG\n  PKG -->|composite emit| DTS[dist/index.d.ts]',
              },
            },
          ],
        },
        {
          heading: 'Code walkthrough',
          blocks: [
            {
              type: 'snippet',
              snippet: {
                language: 'json',
                label: 'Recommended app tsconfig',
                code: '{\n  "compilerOptions": {\n    "target": "ES2022",\n    "module": "ESNext",\n    "moduleResolution": "bundler",\n    "strict": true,\n    "noUncheckedIndexedAccess": true,\n    "skipLibCheck": true,\n    "isolatedModules": true,\n    "noEmit": true\n  },\n  "include": ["src"]\n}',
                explanation: 'strict: full safety bundle. noUncheckedIndexedAccess: arr[0] is T | undefined. noEmit: Vite handles emit; tsc only checks.',
              },
            },
            {
              type: 'snippet',
              snippet: {
                language: 'json',
                label: 'Library package with composite',
                code: '{\n  "compilerOptions": {\n    "composite": true,\n    "declaration": true,\n    "declarationMap": true,\n    "outDir": "dist",\n    "rootDir": "src",\n    "strict": true\n  },\n  "include": ["src"]\n}',
                explanation: 'composite + declaration: required for project references. Consumers import types from dist/.',
              },
            },
            {
              type: 'snippet',
              snippet: {
                language: 'json',
                label: 'App referencing library',
                code: '{\n  "compilerOptions": {\n    "strict": true,\n    "noEmit": true\n  },\n  "references": [\n    { "path": "../../packages/core" }\n  ],\n  "include": ["src"]\n}',
                explanation: 'references: tsc -b builds core first, then typechecks app against core .d.ts.',
              },
            },
            {
              type: 'snippet',
              snippet: {
                language: 'typescript',
                label: 'What strict catches immediately',
                code: 'function parseId(raw: string) {\n  return JSON.parse(raw); // Error under noImplicitAny if return untyped\n}\n\nlet name: string = null; // Error under strictNullChecks\n\nfunction log(msg) { console.log(msg); } // Error: implicit any parameter',
                explanation: 'Lines 4, 7, 9: three common bugs strict flags on first compile — not syntax trivia, real null and any leaks.',
              },
            },
          ],
        },
        {
          heading: 'Compare with JavaScript and C#',
          blocks: [
            {
              type: 'comparisonTable',
              title: 'Project configuration models',
              headers: ['Concern', 'TypeScript tsconfig', 'JavaScript', 'C# csproj'],
              rows: [
                ['Strictness toggle', 'strict + individual flags', 'N/A', 'Nullable + analyzers'],
                ['Multi-project', 'project references', 'package.json workspaces', 'Solution + ProjectReference'],
                ['Output types', '.d.ts declarations', 'N/A', '.dll + XML docs'],
                ['Incremental', '.tsbuildinfo', 'N/A', 'Incremental build'],
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
              title: 'Disabling strict to merge faster',
              body: 'Deferred strict migration costs compound — enable on new packages immediately, migrate legacy with project references per folder.',
            },
          ],
        },
      ],
      interviewTakeaways: [
        'tsconfig.json controls check + emit; strict enables null, any, and function strictness.',
        'noEmit + bundler is standard for apps; libraries need declaration + composite.',
        'Project references enable incremental monorepo builds with tsc -b.',
        '60s: strict on greenfield. moduleResolution matches runtime (NodeNext/bundler). CI runs tsc. Monorepos use composite references. C# csproj is the parallel config surface.',
        'Follow-up: which strict sub-flags do you enable beyond strict:true?',
      ],
      commonPitfalls: [
        'Weak: "tsconfig only affects IDE" — it drives CI typecheck and emit.',
        'Weak: skipLibCheck as excuse to ignore all lib issues — use surgically.',
        "Strong: 'strict bundle day one. noEmit for apps, composite for libs. Project references for monorepo incremental builds.'",
      ],
      relatedTopicIds: [
        'typescript-01-compile-pipeline-and-tsc',
        'typescript-01-erasable-types-and-runtime',
        'typescript-17-strict-compiler-flags',
        'typescript-17-project-references',
      ],
      jsTsCorrelations: [
        { language: 'javascript', concept: 'no tsconfig', note: 'JS projects use package.json type:module and bundler config — TypeScript adds a parallel compiler config layer.', futureTopicSlug: 'javascript/modules/esm-setup' },
        { language: 'typescript', concept: 'strict flags', note: 'Analogous to enabling C# nullable reference types and analyzer rules in Directory.Build.props.', futureTopicSlug: 'typescript/compiler-options/strict-compiler-flags' },
      ],
      officialSources: [
        { title: 'TSConfig Reference', url: 'https://www.typescriptlang.org/tsconfig' },
        { title: 'Project References', url: 'https://www.typescriptlang.org/docs/handbook/project-references.html' },
      ],
      animationHint: 'flow',
    },
  },
];

// Continue with remaining topics in part 2...
let written = 0;
for (const { module, file, data } of topics) {
  writeTopic(module, file, data);
  written++;
}

console.log(`Wrote ${written} topics (partial — run full script)`);
