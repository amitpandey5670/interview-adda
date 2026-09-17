#!/usr/bin/env node
/**
 * Upgrades shallow JavaScript and TypeScript topic JSON to C# documentation depth.
 * Scans for scaffold markers, rewrites topics, fixes mindmaps and interview pages.
 */
import { readFileSync, writeFileSync, readdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { javascriptModules, typescriptModules } from './js-ts-module-plan.mjs';
import { getP0Topic } from './deepen-p0-topics.mjs';
import { getExtendedThemeSnippets } from './deepen-theme-snippet-extensions.mjs';

const root = join(process.cwd(), 'data');
const SCENARIO_TAGS = ['sqs-consumer', 'redis-cache', 'rabbitmq', 'auth-token', 'csv-import', 'high-concurrency'];
const ANIMATION_HINTS = ['compare', 'flow', 'stack-heap', 'timeline'];

// ─── Utilities ───────────────────────────────────────────────────────────────

function snippet(language, label, code, explanation) {
  return { language, label, code, explanation };
}

function readJson(path) {
  return JSON.parse(readFileSync(path, 'utf8'));
}

function writeJson(path, data) {
  writeFileSync(path, `${JSON.stringify(data, null, 2)}\n`);
}

function isShallow(topic) {
  const hook = topic.hook ?? '';
  const pitfalls = topic.commonPitfalls ?? [];
  return (
    hook.includes('shows up in everyday') ||
    pitfalls.some((p) => typeof p === 'string' && p.includes('is just syntax'))
  );
}

function needsDeepening(topic) {
  const text = JSON.stringify(topic);
  return (
    isShallow(topic) ||
    /exhausted retries|createClient\(cfg|Central mechanism behind/.test(text)
  );
}

function isSeniorStage(stage) {
  return stage === 'intermediate' || stage === 'advanced';
}

function listModuleFolders(language) {
  const modulesDir = join(root, language, 'modules');
  return readdirSync(modulesDir, { withFileTypes: true })
    .filter((e) => e.isDirectory())
    .map((e) => join(modulesDir, e.name))
    .sort();
}

function buildModuleLookup(language) {
  const plan = language === 'javascript' ? javascriptModules : typescriptModules;
  const bySlug = new Map();
  for (const mod of plan) {
    bySlug.set(mod.slug, { ...mod, language });
  }
  return bySlug;
}

function pickRelatedIds(moduleDoc, topicSlug, count = 3) {
  const siblings = moduleDoc.topics.filter((t) => t.slug !== topicSlug);
  return siblings.slice(0, count).map((t) => t.id);
}

function hashSlug(slug) {
  let h = 0;
  for (let i = 0; i < slug.length; i++) h = (h * 31 + slug.charCodeAt(i)) | 0;
  return Math.abs(h);
}

function pickScenario(slug) {
  return SCENARIO_TAGS[hashSlug(slug) % SCENARIO_TAGS.length];
}

function pickAnimation(slug, senior) {
  if (/memory|heap|gc|garbage|closure|stack/i.test(slug)) return 'stack-heap';
  if (/vs-|compare|versus/i.test(slug)) return 'compare';
  if (/async|promise|event|loop|pipeline|flow/i.test(slug)) return senior ? 'timeline' : 'flow';
  return ANIMATION_HINTS[hashSlug(slug) % ANIMATION_HINTS.length];
}

// ─── Theme detection from slug keywords ──────────────────────────────────────

function detectTheme(slug, title) {
  const s = `${slug} ${title}`.toLowerCase();
  if (/guard|narrow|asserts|instanceof|control-flow|discriminat/.test(s)) return 'guards';
  if (/debounce|throttle/.test(s)) return 'events';
  if (/promise|async|await|microtask|abort|concurrency/.test(s)) return 'async';
  if (/garbage|gc|memory|heap|leak|weakref|closure-memory|allocation/.test(s)) return 'memory';
  if (/worker|atomics|sharedarraybuffer|postmessage/.test(s)) return 'workers';
  if (/module|import|export|bundler|commonjs|esm|resolution/.test(s)) return 'modules';
  if (/decorator|metadata|reflect/.test(s)) return 'decorators';
  if (/compiler|tsconfig|eslint|strict|isolated|verbatim|project-reference/.test(s)) return 'compiler';
  if (/infer|conditional|mapped|template-literal|distributive|utility|generic|variance|satisfies|returntype|parameters|partial|pick|omit|builder|recursive|ambient|declare-module|typing-javascript|ci-typecheck|complexity-budget|code-review-radar|type-level/.test(s)) return 'types';
  if (/null|undefined|optional|non-null|definite-assignment/.test(s)) return 'null';
  if (/class|prototype|inherit|oop|interface|abstract|implements/.test(s)) return 'oop';
  if (/array|map|set|iterator|generator|tuple|collection|readonly/.test(s)) return 'collections';
  if (/function|closure|arrow|callback|curry|recursion|hof/.test(s)) return 'functions';
  if (/error|exception|catch|throw|result|either/.test(s)) return 'errors';
  if (/event|emitter|dom|delegate|debounce/.test(s)) return 'events';
  if (/destructure|spread|rest|template-literal/.test(s)) return 'syntax';
  if (/type|typeof|coercion|equality|symbol|bigint|primitive/.test(s)) return 'coercion';
  if (/performance|clone|memo|version-map|review/.test(s)) return 'performance';
  if (/fetch|stream|buffer|timer|global|node|browser/.test(s)) return 'runtime';
  return 'general';
}

const THEME_HOOKS = {
  async: (t) =>
    `${t.title} coordinates non-blocking I/O on a single thread via the event loop. Promises and async/await desugar to microtask chains — ordering mistakes and unhandled rejections are production bugs, not syntax trivia.`,
  memory: (t) =>
    `${t.title} connects directly to V8 heap layout and GC pauses. Retained references — closures, timers, caches — keep objects in old generation until major GC, affecting tail latency.`,
  workers: (t) =>
    `${t.title} is how JavaScript shares work across threads without shared mutable state by default. postMessage, transferables, and Atomics differ sharply from C# Task.Run and lock patterns.`,
  modules: (t) =>
    `${t.title} governs how code is loaded, tree-shaken, and resolved at build time versus run time. ESM/CJS interop and package exports trip monorepos and Node bundler configs daily.`,
  decorators: (t) =>
    `${t.title} attaches metadata and behavior to classes at definition time. Stage 3 decorators differ from legacy experimental decorators — Angular and NestJS teams must know both.`,
  compiler: (t) =>
    `${t.title} shapes what TypeScript rejects before emit and how CI typecheck scales in monorepos. Strict flags catch null and implicit any at boundaries where runtime JSON still lies.`,
  types: (t) =>
    `${t.title} is compile-time type manipulation — erased at run time but essential for safe APIs. Conditional types, infer, and mapped types power built-in utilities like ReturnType and Partial.`,
  null: (t) =>
    `${t.title} enforces null safety at compile time in TypeScript and defensive patterns at run time in JavaScript. JSON and third-party APIs still deliver null — narrow before use.`,
  oop: (t) =>
    `${t.title} in JavaScript is prototype-based with class syntax sugar; TypeScript adds nominal-like modifiers but structural typing remains. Differs from C# sealed classes and virtual dispatch.`,
  collections: (t) =>
    `${t.title} covers built-in data structures and iteration protocols. Map versus Object, Set deduplication, and generator laziness affect performance and API design in hot paths.`,
  functions: (t) =>
    `${t.title} treats functions as first-class values with lexical scope and closures. this binding rules and arrow capture semantics differ from C# delegates and lambdas.`,
  errors: (t) =>
    `${t.title} covers failure propagation — throw/catch in JS, typed Result patterns in TS, and unhandled promise rejections that crash Node processes.`,
  events: (t) =>
    `${t.title} patterns decouple producers and consumers via callbacks, EventEmitter, or DOM events. Debounce and throttle control event storm rates on the main thread.`,
  syntax: (t) =>
    `${t.title} is modern ergonomic syntax — destructuring, spread, and rest — that compiles to older patterns. Readability wins when teams agree on conventions.`,
  coercion: (t) =>
    `${t.title} is where JavaScript dynamic typing surprises C# developers — implicit ToNumber, ToString, and truthiness rules that === and Object.is avoid.`,
  performance: (t) =>
    `${t.title} focuses on measurable idioms — memoization, batching, lazy init — and interview implementations senior engineers are expected to write from scratch.`,
  runtime: (t) =>
    `${t.title} differs between browser and Node.js hosts. globalThis, fetch, Buffer, and timer ordering are environment facts, not language spec trivia.`,
  guards: (t) =>
    `${t.title} lets TypeScript narrow unions after runtime checks — typeof, in, instanceof, user-defined predicates, and assert functions.`,
  general: (t) =>
    `${t.title} is a core ${t.language === 'typescript' ? 'TypeScript compile-time' : 'JavaScript run-time'} concept. Understanding mechanism — not memorizing syntax — separates senior engineers in interviews and on-call.`,
};

function themeGlossary(theme, topic, language) {
  const codeLang = language === 'typescript' ? 'TypeScript' : 'JavaScript';
  const base = [
    {
      term: topic.slug.split('-')[0],
      longForm: topic.title,
      plainDefinition: `Core ${codeLang} mechanism for ${topic.title.toLowerCase()}.`,
      example: 'Runnable examples in the code walkthrough below.',
    },
  ];
  const extras = {
    async: [
      { term: 'microtask', longForm: 'microtask queue', plainDefinition: 'High-priority queue drained after current stack — Promise reactions run here.', example: 'queueMicrotask(() => ...)' },
      { term: 'macrotask', longForm: 'macrotask', plainDefinition: 'setTimeout, setInterval, I/O callbacks — run after microtasks.', example: 'setTimeout(fn, 0) after Promise.then' },
    ],
    memory: [
      { term: 'heap', longForm: 'V8 heap', plainDefinition: 'Region where objects live; split into young and old generations.', example: 'process.memoryUsage().heapUsed' },
      { term: 'retention', longForm: 'memory retention', plainDefinition: 'Reachable reference prevents GC from reclaiming object.', example: 'Closure holding large array' },
    ],
    types: [
      { term: 'structural typing', longForm: 'structural typing', plainDefinition: 'Types compatible if shape matches — unlike C# nominal types.', example: '{ id: string } assignable to interface User' },
      { term: 'type erasure', longForm: 'type erasure', plainDefinition: 'TypeScript types removed at emit — run time is plain JS.', example: 'interface User erases completely' },
    ],
    null: [
      { term: 'strictNullChecks', longForm: 'strictNullChecks', plainDefinition: 'null and undefined are distinct types not assignable to T by default.', example: '"strictNullChecks": true' },
      { term: 'narrowing', longForm: 'type narrowing', plainDefinition: 'Control flow refines union after null check.', example: 'if (x !== null) x.length' },
    ],
    modules: [
      { term: 'ESM', longForm: 'ECMAScript modules', plainDefinition: 'import/export syntax; static analysis enables tree shaking.', example: "import { x } from './mod.js'" },
      { term: 'CJS', longForm: 'CommonJS', plainDefinition: 'require/module.exports — Node legacy; dynamic resolution.', example: "const fs = require('fs')" },
    ],
  };
  return [...base, ...(extras[theme] ?? extras.types ?? []).slice(0, 3)];
}

function themeSnippets(theme, topic, language, senior) {
  const codeLang = language === 'typescript' ? 'typescript' : 'javascript';
  const slug = topic.slug;
  const title = topic.title;

  const snippets = [];

  if (theme === 'async') {
    snippets.push(
      snippet(codeLang, 'async/await error path', language === 'typescript'
        ? `async function fetchUser(id: string): Promise<User> {\n  const res = await fetch(\`/api/users/\${id}\`);\n  if (!res.ok) throw new Error(\`HTTP \${res.status}\`);\n  return res.json() as Promise<User>;\n}\n\ntry {\n  const user = await fetchUser('42');\n} catch (err) {\n  console.error('fetch failed', err);\n}`
        : `async function fetchUser(id) {\n  const res = await fetch(\`/api/users/\${id}\`);\n  if (!res.ok) throw new Error(\`HTTP \${res.status}\`);\n  return res.json();\n}\n\ntry {\n  const user = await fetchUser('42');\n} catch (err) {\n  console.error('fetch failed', err);\n}`,
        'await unwraps Promise; errors become rejections caught by try/catch around async function.'),
      snippet(codeLang, 'Promise.all versus allSettled', `const ids = ['a', 'b', 'c'];\nconst results = await Promise.allSettled(\n  ids.map((id) => fetch(\`/api/\${id}\`).then((r) => r.json()))\n);\nconst ok = results.filter((r) => r.status === 'fulfilled');\nconst failed = results.filter((r) => r.status === 'rejected');`,
        'all fails fast on first rejection; allSettled waits for every input — use for partial success dashboards.'),
      snippet('csharp', 'C# Task comparison', `// C# equivalent\nasync Task<User> FetchUserAsync(string id) {\n  using var res = await http.GetAsync($"/api/users/{id}");\n  res.EnsureSuccessStatusCode();\n  return await res.Content.ReadFromJsonAsync<User>();\n}`,
        'C# Task runs continuations on thread pool; JS Promise uses same-thread microtasks.'),
    );
    if (senior) {
      snippets.push(
        snippet(codeLang, 'Microtask ordering trap', `console.log('1');\nPromise.resolve().then(() => console.log('2'));\nqueueMicrotask(() => console.log('3'));\nconsole.log('4');\n// 1, 4, 2, 3 — microtasks before next macrotask`,
          'Microtasks drain completely before setTimeout — critical for ${title} ordering bugs.'),
      );
    }
  } else if (theme === 'memory') {
    snippets.push(
      snippet('javascript', 'Heap usage snapshot', `const used = process.memoryUsage();\nconsole.log({\n  heapUsedMB: (used.heapUsed / 1024 / 1024).toFixed(1),\n  heapTotalMB: (used.heapTotal / 1024 / 1024).toFixed(1),\n  externalMB: (used.external / 1024 / 1024).toFixed(1),\n});`,
        'heapUsed grows with retained objects; external tracks C++ bindings (Buffers).'),
      snippet('javascript', 'Closure retention trap', `function createHandler() {\n  const large = new Array(1_000_000).fill('x');\n  return function onClick() {\n    console.log(large.length); // retains entire array\n  };\n}\nconst handler = createHandler(); // large stays in old gen`,
        'Inner function closes over outer bindings — GC cannot collect large until handler released.'),
      snippet('csharp', 'C# IDisposable versus JS GC', `// C# explicit disposal\nusing var conn = new SqlConnection(cs);\nawait conn.OpenAsync();\n// IDisposable frees unmanaged resources promptly\n\n// JS: no IDisposable — release references, remove listeners`,
        'JS relies on GC; use WeakRef/FinalizationRegistry only for optional caches, not critical cleanup.'),
    );
    if (senior) {
      snippets.push(
        snippet('javascript', 'WeakMap for private metadata', `const privateData = new WeakMap();\nclass Account {\n  constructor(id) { privateData.set(this, { id }); }\n  get id() { return privateData.get(this).id; }\n}`,
          'WeakMap keys are objects collected when key is unreachable — no memory leak from metadata map.'),
      );
    }
  } else if (theme === 'types' && language === 'typescript') {
    snippets.push(
      snippet('typescript', 'Conditional type with infer', `type Unwrap<T> = T extends Promise<infer U> ? U : T;\ntype A = Unwrap<Promise<string>>; // string\ntype B = Unwrap<number>; // number`,
        'infer captures type variable in conditional match — pattern behind Awaited and ReturnType.'),
      snippet('typescript', 'Mapped type for DTO', `type CreateUserDto = Pick<User, 'name' | 'email'>;\ntype UpdateUserDto = Partial<CreateUserDto> & { id: string };\ntype UserKeys = keyof User;`,
        'Utility types compose — Partial, Pick, keyof build API layers without duplication.'),
      snippet('typescript', 'satisfies preserves literal types', `const routes = {\n  home: '/',\n  profile: '/me',\n} satisfies Record<string, \`/\${string}\`>;\n// routes.home is '/' not string`,
        'satisfies checks shape without widening inferred literal types.'),
      snippet('csharp', 'C# generics versus TS structural', `// C# nominal — List<string> not assignable to List<object>\nList<string> names = new();\n\n// TS structural — extra properties allowed on assign\ninterface Named { name: string }\nconst x: Named = { name: 'a', id: 1 }; // excess check may error`,
        'C# generics are nominal; TS uses structural assignability with excess property checks on fresh objects.'),
    );
  } else if (theme === 'null') {
    snippets.push(
      snippet(codeLang, 'Null guard at API boundary', language === 'typescript'
        ? `function parseUser(raw: unknown): User {\n  if (typeof raw !== 'object' || raw === null) throw new Error('invalid');\n  if (!('id' in raw) || typeof (raw as User).id !== 'string') {\n    throw new Error('id required');\n  }\n  return raw as User;\n}`
        : `function parseUser(raw) {\n  if (typeof raw !== 'object' || raw === null) throw new Error('invalid');\n  if (typeof raw.id !== 'string') throw new Error('id required');\n  return raw;\n}`,
        'JSON.parse returns any shape — validate before trusting; TS strictNullChecks does not help at boundary.'),
      snippet(codeLang, 'Optional chaining and nullish coalescing', `const city = user?.address?.city ?? 'Unknown';\nconst count = config.retries ?? 3; // 0 is kept unlike ||\nif (user?.isActive) send(user.email ?? 'noreply@x.com');`,
        '?. short-circuits on null/undefined; ?? defaults only nullish values — not 0 or "".'),
      snippet('csharp', 'C# nullable reference types', `// C# NRT\nstring? FindName(int id) => cache.TryGetValue(id, out var n) ? n : null;\nstring GetName(int id) => FindName(id) ?? throw new InvalidOperationException();\n\n// TS: string | null + strictNullChecks similar intent`,
        'C# NRT is compile-time warnings; TS strictNullChecks is compile-time errors. Both need runtime validation at JSON edges.'),
    );
    if (senior) {
      snippets.push(
        snippet('typescript', 'assertNever exhaustiveness', `function assertNever(x: never): never {\n  throw new Error('Unexpected: ' + JSON.stringify(x));\n}\n\nfunction handle(r: Result) {\n  switch (r.status) {\n    case 'ok': return r.data;\n    case 'err': return r.message;\n    default: return assertNever(r);\n  }\n}`,
          'never in default proves switch handles every union member — catches new variants at compile time.'),
      );
    }
  } else if (theme === 'collections') {
    snippets.push(
      snippet('javascript', 'Map versus Object for keys', `const cache = new Map();\ncache.set({ id: 1 }, 'payload'); // object keys by reference\ncache.get({ id: 1 }); // undefined — different object\n\nconst byId = new Map();\nbyId.set('user-42', { name: 'Ada' });`,
        'Map allows any key type and preserves insertion order; Object keys are strings/symbols.'),
      snippet('javascript', 'Set deduplication', `const ids = ['a', 'b', 'a', 'c'];\nconst unique = [...new Set(ids)];\nconsole.log(unique); // ['a', 'b', 'c']`,
        'Set for O(1) uniqueness checks — faster than array.includes for large lists.'),
      snippet('javascript', 'Generator lazy sequence', `function* range(start, end) {\n  for (let i = start; i < end; i++) yield i;\n}\nfor (const n of range(0, 1_000_000)) {\n  if (n > 5) break; // no array allocated\n}`,
        'Generators compute on demand — memory friendly versus eager array allocation.'),
    );
    if (senior) {
      snippets.push(
        snippet('javascript', 'for-of versus for-in', `const arr = ['a', 'b'];\narr.extra = 'x';\nfor (const i in arr) console.log(i); // '0','1','extra'\nfor (const v of arr) console.log(v); // 'a','b'`,
          'for-in enumerates keys including enumerable properties; for-of iterates values via Symbol.iterator.'),
      );
    }
  } else if (theme === 'modules') {
    snippets.push(
      snippet('javascript', 'ESM static import', `import { readFile } from 'node:fs/promises';\nimport config from './config.js';\n\nexport async function load() {\n  return JSON.parse(await readFile(config.path, 'utf8'));\n}`,
        'import/export are statically analyzable — enables tree shaking when sideEffects: false.'),
      snippet('javascript', 'Dynamic import code splitting', `const locale = navigator.language;\nconst mod = await import(\`./locales/\${locale}.js\`);\nmod.applyTranslations();`,
        'import() returns Promise — bundlers emit separate chunks loaded on demand.'),
      snippet('javascript', 'package.json exports field', `// package.json\n{\n  "type": "module",\n  "exports": {\n    ".": "./dist/index.js",\n    "./utils": "./dist/utils.js"\n  }\n}`,
        'exports map controls public API surface — breaks deep imports into node_modules/pkg/src.'),
    );
    if (senior) {
      snippets.push(
        snippet('csharp', 'C# assemblies versus JS modules', `// C# namespace + assembly boundary\nnamespace MyApp.Services { public class UserService { } }\n\n// JS: file is module scope; no nominal namespace at runtime`,
          'C# assemblies are deployment units with strong names; JS modules are files resolved by bundler or Node.'),
      );
    }
  } else if (theme === 'compiler' && language === 'typescript') {
    snippets.push(
      snippet('json', 'strict family in tsconfig', `{\n  "compilerOptions": {\n    "strict": true,\n    "noImplicitAny": true,\n    "strictNullChecks": true,\n    "noUncheckedIndexedAccess": true\n  }\n}`,
        'strict enables the family; noUncheckedIndexedAccess adds undefined to index access — catches off-by-one.'),
      snippet('typescript', 'Project references', `// packages/shared/tsconfig.json\n{ "compilerOptions": { "composite": true }, "include": ["src"] }\n\n// tsconfig.json root\n{ "references": [{ "path": "./packages/shared" }] }`,
        'composite + references enable incremental builds — CI typechecks packages in dependency order.'),
      snippet('typescript', 'verbatimModuleSyntax', `// With verbatimModuleSyntax: true\nimport type { User } from './types.js';\nimport { loadUser } from './api.js';\n// type imports erased; value imports stay`,
        'Separates type-only imports — required for bundlers that strip types without transforming imports.'),
    );
    if (senior) {
      snippets.push(
        snippet('typescript', 'Type complexity guard', `// Avoid deep recursion in types — TS errors at depth limit\ntype Deep<T, D extends number = 5> = D extends 0\n  ? T\n  : T extends object ? { [K in keyof T]: Deep<T[K], Prev<D>> } : T;\ntype Prev<N extends number> = [-1,0,1,2,3,4][N];`,
          'Recursive types hit compiler limits — budget complexity for team maintainability.'),
      );
    }
  } else {
    const extended = getExtendedThemeSnippets(theme, topic, language, senior, snippet);
    if (extended) {
      snippets.push(...extended);
    } else {
    // general fallback — last resort
    snippets.push(
      snippet(codeLang, `Core ${title} example`, language === 'typescript'
        ? `interface Config {\n  readonly retries: number;\n  endpoint: string;\n}\n\nfunction createClient(cfg: Config) {\n  return {\n    async call(path: string) {\n      for (let i = 0; i < cfg.retries; i++) {\n        const res = await fetch(cfg.endpoint + path);\n        if (res.ok) return res.json();\n      }\n      throw new Error('exhausted retries');\n    },\n  };\n}`
        : `function createClient(cfg) {\n  return {\n    async call(path) {\n      for (let i = 0; i < cfg.retries; i++) {\n        const res = await fetch(cfg.endpoint + path);\n        if (res.ok) return res.json();\n      }\n      throw new Error('exhausted retries');\n    },\n  };\n}\n\nconst client = createClient({ retries: 3, endpoint: 'https://api.example.com' });`,
        `Demonstrates ${title} in a realistic API client — retries, fetch, and configuration.`),
      snippet(codeLang, 'Boundary validation', language === 'typescript'
        ? `function isRecord(v: unknown): v is Record<string, unknown> {\n  return typeof v === 'object' && v !== null;\n}\n\nfunction getString(obj: Record<string, unknown>, key: string): string | undefined {\n  const val = obj[key];\n  return typeof val === 'string' ? val : undefined;\n}`
        : `function isRecord(v) {\n  return typeof v === 'object' && v !== null;\n}\n\nfunction getString(obj, key) {\n  const val = obj[key];\n  return typeof val === 'string' ? val : undefined;\n}`,
        'Type guards narrow unknown before access — essential at JSON and message queue boundaries.'),
      snippet('csharp', 'C# transfer learning', `// C# pattern for ${title}\npublic sealed record Config(int Retries, string Endpoint);\n\npublic async Task<JsonDocument> CallAsync(Config cfg, string path) {\n    for (var i = 0; i < cfg.Retries; i++) {\n        var res = await _http.GetAsync(cfg.Endpoint + path);\n        if (res.IsSuccessStatusCode) return await JsonDocument.ParseAsync(await res.Content.ReadAsStreamAsync());\n    }\n    throw new InvalidOperationException("exhausted retries");\n}`,
        `Maps ${title} idioms to C# — note compile-time types versus JS run-time checks.`),
    );
    if (senior) {
      snippets.push(
        snippet(codeLang, 'Failure mode diagnostic', language === 'typescript'
          ? `function diagnose(error: unknown): string {\n  if (error instanceof Error) return error.message;\n  if (typeof error === 'string') return error;\n  return 'unknown failure';\n}`
          : `function diagnose(error) {\n  if (error instanceof Error) return error.message;\n  if (typeof error === 'string') return error;\n  return 'unknown failure';\n}`,
          `Explicit unknown/error handling for ${title} — senior code paths always name failure modes.`),
      );
    }
    }
  }

  while (snippets.length < (senior ? 4 : 3)) {
    snippets.push(
      snippet(codeLang, `Additional ${title} pattern`, `// ${title}: production edge case\nconst result = ${slug.includes('error') ? '(() => { throw new Error("fail"); })()' : '{ ok: true, value: 42 }'};\nconsole.log(result);`,
        `Secondary example reinforcing ${title} behavior under non-happy-path conditions.`),
    );
  }
  return snippets.slice(0, senior ? 4 : 3);
}

function themeDiagram(theme, topic) {
  const sources = {
    async: `sequenceDiagram\n  participant M as Main thread\n  participant Q as Microtask queue\n  participant T as Macrotask queue\n  M->>M: ${topic.title}\n  M->>Q: Promise.then\n  M->>T: setTimeout\n  Q->>M: drain microtasks\n  T->>M: next macrotask`,
    memory: `flowchart TD\n  A[Allocate object] --> B[Young generation]\n  B --> C{Survives Scavenge?}\n  C -->|No| D[Freed]\n  C -->|Yes| E[Old generation]\n  E --> F[Major GC when needed]`,
    types: `flowchart LR\n  A[Source type] --> B[Conditional / mapped]\n  B --> C[Inferred result type]\n  C --> D[Emit erases to JS]`,
    null: `flowchart TD\n  A[unknown / JSON] --> B{Validated?}\n  B -->|No| C[Runtime crash risk]\n  B -->|Yes| D[Narrowed type]\n  D --> E[Safe property access]`,
    modules: `flowchart LR\n  A[Source files] --> B[Bundler / Node resolver]\n  B --> C[Dependency graph]\n  C --> D[Tree-shaken bundle]`,
    general: `flowchart TD\n  A[${topic.title}] --> B[Read / parse]\n  B --> C[${topic.language === 'typescript' ? 'Type check' : 'Execute'}]\n  C --> D[Observable behavior]`,
  };
  return {
    type: 'mermaid',
    title: `${topic.title} flow`,
    source: sources[theme] ?? sources.general,
  };
}

function themeComparison(theme, topic, language) {
  const jsLabel = language === 'typescript' ? 'TypeScript' : 'JavaScript';
  const rows = {
    async: [
      ['Concurrency model', 'Single thread + event loop', 'Thread pool + Task', 'Promise<T> types'],
      ['Error propagation', 'throw / Promise reject', 'try/catch + Task.Exception', 'unknown in catch'],
      ['Cancellation', 'AbortSignal cooperative', 'CancellationToken', 'AbortSignal typed'],
    ],
    memory: [
      ['Reclamation', 'V8 generational GC', 'CLR generational GC', 'No runtime GC'],
      ['Explicit free', 'Remove references only', 'IDisposable + GC', 'N/A'],
      ['Diagnostics', 'Heap snapshot', 'dotMemory / PerfView', 'N/A'],
    ],
    types: [
      ['Type model', 'Structural', 'Nominal', 'Structural static'],
      ['Run time', 'Erased', 'CLR metadata', 'Erased to JS'],
      ['Generics', 'Erased', 'Reified', 'Erased'],
    ],
    null: [
      ['Null safety', 'Runtime checks only', 'NRT warnings', 'strictNullChecks errors'],
      ['Optional access', '?. and ??', '?. and ??', 'Same as JS emit'],
      ['JSON boundary', 'Always validate', 'Deserialize attributes', 'Parse as unknown'],
    ],
    modules: [
      ['Unit', 'File / package', 'Assembly', 'Module file'],
      ['Resolution', 'Node / bundler', 'Reference + NuGet', 'paths in tsconfig'],
      ['Tree shaking', 'ESM static imports', 'Trimming (AOT)', 'Type-only import erase'],
    ],
  };
  const defaultRows = [
    ['When checked', language === 'javascript' ? 'Run time' : 'Compile time', 'Compile + CLR', language === 'typescript' ? 'Compile only' : 'Run time'],
    ['Type model', language === 'javascript' ? 'Dynamic' : 'Structural static', 'Nominal', 'Structural'],
    ['Typical pitfall', 'Coercion / undefined', 'Null reference', language === 'typescript' ? 'any at boundary' : '== versus ==='],
  ];
  return {
    type: 'comparisonTable',
    title: `${topic.title} across languages`,
    headers: ['Aspect', jsLabel, 'C#', language === 'typescript' ? 'JavaScript emit' : 'TypeScript'],
    rows: rows[theme] ?? defaultRows,
  };
}

function themeOfficialSources(theme, language, _slug) {
  const mdn = [
    { title: 'MDN JavaScript reference', url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference' },
    { title: 'javascript.info', url: 'https://javascript.info/' },
  ];
  const ts = [
    { title: 'TypeScript handbook', url: 'https://www.typescriptlang.org/docs/handbook/intro.html' },
    { title: 'TypeScript release notes', url: 'https://www.typescriptlang.org/docs/handbook/release-notes/overview.html' },
  ];
  const extra = {
    async: [{ title: 'Event loop', url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Event_loop' }],
    memory: [{ title: 'Memory management', url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Memory_management' }],
    types: [{ title: 'Conditional types', url: 'https://www.typescriptlang.org/docs/handbook/2/conditional-types.html' }],
    null: [{ title: 'strictNullChecks', url: 'https://www.typescriptlang.org/tsconfig#strictNullChecks' }],
    modules: [{ title: 'ES modules', url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules' }],
    compiler: [{ title: 'TSConfig reference', url: 'https://www.typescriptlang.org/tsconfig' }],
  };
  const base = language === 'typescript' ? ts : mdn;
  const themeExtra = extra[theme] ?? [];
  return [...themeExtra, ...base].slice(0, 3);
}

function buildCorrelations(theme, topic, language, moduleSlug, senior) {
  const other = language === 'javascript' ? 'typescript' : 'javascript';
  const correlations = [
    {
      language: other,
      concept: topic.title,
      note: `${topic.title} in ${other} — same programmer mental model, ${other === 'typescript' ? 'compile-time' : 'run-time'} enforcement differs.`,
      futureTopicSlug: `${other}/${moduleSlug}/${topic.slug}`,
    },
  ];
  if (senior) {
    correlations.push({
      language: language,
      concept: `C# correlation for ${topic.title}`,
      note: `C# developers: map ${topic.title} to closest CLR concept (${theme === 'async' ? 'Task' : theme === 'memory' ? 'GC' : theme === 'types' ? 'generics' : 'idiomatic C#'}) and note differences.`,
      futureTopicSlug: `csharp/modules/${topic.slug}`,
    });
  }
  return correlations.slice(0, senior ? 2 : 1);
}

function buildDeepTopic(existing, moduleDoc, modulePlan, language) {
  const senior = isSeniorStage(modulePlan.stage);
  const topic = {
    slug: existing.slug,
    title: existing.title,
    language,
    id: existing.id,
  };
  const relatedTopicIds = pickRelatedIds(moduleDoc, existing.slug);
  const ctx = { topic, module: moduleDoc, modulePlan, language, relatedTopicIds, senior };

  const p0 = getP0Topic(existing.slug, language, ctx);
  if (p0) {
    return {
      id: existing.id,
      slug: existing.slug,
      title: existing.title,
      moduleId: existing.moduleId,
      order: existing.order,
      ...p0,
    };
  }

  const theme = detectTheme(existing.slug, existing.title);
  const hookFn = THEME_HOOKS[theme] ?? THEME_HOOKS.general;
  const hook = hookFn({ ...topic, language });
  const snippets = themeSnippets(theme, topic, language, senior);
  const compareLang = language === 'javascript' ? 'C# and TypeScript' : 'JavaScript and C#';

  const themeHookFirst = hook.split(/(?<=[.!?])\s+/)[0];
  const runtimeNote =
    language === 'typescript'
      ? 'TypeScript checks this at compile time; emitted JavaScript still runs with the same runtime rules as plain JS.'
      : 'The engine enforces this on every execution path — not optional syntax sugar.';

  const sections = [
    {
      heading: `What is ${existing.title}?`,
      blocks: [
        {
          type: 'prose',
          text: `**${existing.title}** — ${themeHookFirst}. ${runtimeNote} Read the glossary, study the snippets, then trace one example in DevTools or with \`tsc --emitDeclarationOnly\` / Node REPL.`,
        },
        {
          type: 'glossary',
          title: 'Key terms',
          entries: themeGlossary(theme, topic, language),
        },
      ],
    },
    {
      heading: `Why ${existing.title} matters in production`,
      blocks: [
        {
          type: 'prose',
          text: `Production bugs involving **${existing.title}** rarely look like syntax errors — they show up as wrong data, memory growth, flaky tests, or CI type failures. Senior engineers explain mechanism and tradeoffs, not definitions. Use the ${compareLang} comparison table to transfer intuition from languages you already know.`,
        },
        {
          type: 'callout',
          variant: 'tip',
          title: 'Interview trap',
          body: `Can you name one concrete failure mode for ${existing.slug} and how you would prove the fix (test, heap snapshot, or metric)? Hand-waving loses senior loops.`,
        },
      ],
    },
    {
      heading: `How ${existing.title} works step by step`,
      blocks: [
        {
          type: 'steps',
          title: 'Mental model',
          items: [
            { title: 'Locate in code', body: `Find where ${existing.title} appears — syntax, API call, or type annotation.` },
            {
              title: 'Trace behavior',
              body:
                language === 'typescript'
                  ? 'Hover types in the editor, emit JS, verify what survives at run time.'
                  : 'Step with debugger or console.log — watch call stack and event loop if async.',
            },
            { title: 'Test edge cases', body: 'Null input, empty collections, network failure, wrong types from JSON.' },
            { title: 'Connect neighbors', body: 'Follow related topics at the bottom for closures, types, or async context.' },
          ],
        },
        { type: 'diagram', diagram: themeDiagram(theme, topic) },
      ],
    },
    {
      heading: `Code walkthrough: ${existing.title}`,
      blocks: snippets.map((s) => ({ type: 'snippet', snippet: s })),
    },
    {
      heading: `Compare with ${compareLang}`,
      blocks: [themeComparison(theme, topic, language)],
    },
    {
      heading: 'Common mistakes to avoid',
      blocks: [
        {
          type: 'callout',
          variant: 'warning',
          title: `Pitfalls for ${existing.title}`,
          body: `Treating ${existing.title} as pure syntax without ${language === 'typescript' ? 'compile-time or run-time' : 'run-time'} behavior. Skipping validation at API/JSON boundaries. Ignoring ${language === 'javascript' ? 'browser versus Node' : 'strict compiler flags'} differences. Hand-waving in design review without a test or metric.`,
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
          text: `Prove mastery of **${existing.title}** with a failing test that captures the edge case, a DevTools or heap snapshot showing the bug, and a clear tradeoff statement in design review. Senior interviewers want mechanism — what the ${language === 'typescript' ? 'compiler and emitted JS' : 'engine'} actually do — plus when the simple explicit version beats the clever abstraction.`,
        },
        {
          type: 'comparisonTable',
          title: 'Senior tradeoffs',
          headers: ['Approach', 'When it wins', 'When it fails'],
          rows: [
            ['Explicit / verbose', 'On-call clarity, junior-friendly', 'More boilerplate'],
            ['Clever one-liner', 'Short examples', 'Hard to debug under load'],
            ['Library abstraction', 'Consistent policy', 'Bundle size, hidden behavior'],
          ],
        },
        {
          type: 'callout',
          variant: 'warning',
          title: 'What fails senior loops',
          body: `Cannot trace a production bug to ${existing.title}. Says "it just works" without naming run-time checks, error paths, or ${compareLang} differences.`,
        },
      ],
    });
  }

  const interviewTakeaways = [
    `${existing.title}: know definition plus one runnable example.`,
    `Production: validate external input before applying ${existing.title}; log failures with context.`,
    `Tradeoff: prefer explicit debuggable code over clever shortcuts for ${existing.slug}.`,
    `60s: ${existing.title} — explain mechanism, one pitfall, one ${language === 'javascript' ? 'C#/TS' : 'JS/C#'} comparison, and when not to use the advanced variant.`,
    `Follow-up: trace a bug or extend the example to async/error/null paths.`,
  ];

  const commonPitfalls = [
    `Weak: dismisses ${existing.title} as syntax-only — fails when interviewer asks for run-time or compile-time mechanism.`,
    `Weak: using ${language === 'typescript' ? 'any' : 'implicit coercion'} at boundaries without validation.`,
    `Weak: cannot name a concrete production failure involving ${existing.slug}.`,
    `Strong: define ${existing.title}, show a 5-line example, name one pitfall and one ${language === 'javascript' ? 'C#' : 'C#'} difference.`,
  ];

  return {
    id: existing.id,
    slug: existing.slug,
    title: existing.title,
    moduleId: existing.moduleId,
    order: existing.order,
    hook,
    sections,
    interviewTakeaways,
    commonPitfalls,
    relatedTopicIds,
    jsTsCorrelations: buildCorrelations(theme, topic, language, modulePlan.slug, senior),
    officialSources: themeOfficialSources(theme, language, existing.slug),
    animationHint: pickAnimation(existing.slug, senior),
    scenarioTag: pickScenario(existing.slug),
  };
}

// ─── Mindmap and interview fixes ─────────────────────────────────────────────

function summarizeHook(hook) {
  if (!hook) return '';
  const first = hook.split(/(?<=[.!?])\s+/)[0];
  return first.length > 180 ? `${first.slice(0, 177)}...` : first;
}

function fixMindmap(mindmap, moduleDir, _language) {
  let changed = false;
  if (!mindmap.conceptCards) return false;

  for (const card of mindmap.conceptCards) {
    if (!card.summary?.includes('Core ideas for')) continue;
    const slug = card.topicSlug;
    if (!slug) continue;
    const topicPath = join(moduleDir, 'topics', `${slug}.json`);
    if (!existsSync(topicPath)) continue;
    const topic = readJson(topicPath);
    const summary = summarizeHook(topic.hook) || card.summary.replace(/^Core ideas for [^—]+—\s*/, '');
    if (summary !== card.summary) {
      card.summary = summary;
      changed = true;
    }
    // Improve example from first snippet if generic slug
    if (card.example === slug) {
      for (const section of topic.sections ?? []) {
        for (const block of section.blocks ?? []) {
          if (block.type === 'snippet' && block.snippet?.code) {
            const line = block.snippet.code.split('\n').find((l) => l.trim() && !l.trim().startsWith('//'));
            if (line && line.length < 80) {
              card.example = line.trim();
              changed = true;
            }
            break;
          }
        }
        if (card.example !== slug) break;
      }
    }
  }
  return changed;
}

function buildInterviewQuestion(topic, language, _theme) {
  const templates = [
    `You see a production bug involving ${topic.title} — walk through how you would isolate root cause in DevTools or logs.`,
    `Compare ${topic.title} in ${language} versus C#: what mental model transfers and what does not?`,
    `Implement or sketch ${topic.title} from scratch and explain one edge case interviewers add.`,
    `When would you avoid the "clever" version of ${topic.title} in a code review?`,
    `How does ${topic.title} interact with async boundaries, null safety, or memory retention?`,
    `Design an API that uses ${topic.title} correctly — what validation do you add at the boundary?`,
  ];
  const idx = hashSlug(topic.slug) % templates.length;
  return templates[idx];
}

function buildInterviewAnswer(topic, language) {
  const hook = summarizeHook(topic.hook);
  return `Open with mechanism: ${hook} Show a 5–10 line example from the topic page. Name one pitfall (${language === 'typescript' ? 'any at JSON boundary, non-exhaustive switch' : 'coercion, leaked listener, unhandled rejection'}) and how you would prove the fix with a unit test or heap snapshot. Close with one ${language === 'javascript' ? 'C#' : 'JavaScript'} difference.`;
}

function buildSixtySeconds(topic) {
  const hook = summarizeHook(topic.hook);
  return `60s: ${hook}`;
}

function fixInterview(interview, moduleDir) {
  let changed = false;
  const topicFiles = readdirSync(join(moduleDir, 'topics')).filter((f) => f.endsWith('.json'));
  const topicsByTitle = new Map();
  for (const file of topicFiles) {
    const t = readJson(join(moduleDir, 'topics', file));
    topicsByTitle.set(t.title, t);
  }

  for (const item of interview.items ?? []) {
    const isGeneric =
      /explain .+ to a junior engineer/i.test(item.question) ||
      /mechanism \+ example \+ pitfall \+ comparison — avoid hand-waving/i.test(item.sixtySeconds);
    if (!isGeneric) continue;

    const match = item.question.match(/explain (.+?) to a junior/i);
    const title = match?.[1]?.trim();
    const topic = title ? topicsByTitle.get(title) : null;
    if (!topic) continue;

    const theme = detectTheme(topic.slug, topic.title);
    const lang = moduleDir.includes('/javascript/') ? 'javascript' : 'typescript';

    item.question = buildInterviewQuestion(topic, lang, theme);
    item.answer = buildInterviewAnswer(topic, lang);
    item.sixtySeconds = buildSixtySeconds(topic);
    item.followUps = [
      `What breaks if you skip validation at the ${topic.slug.includes('api') ? 'API' : 'JSON'} boundary?`,
      `How does this differ in ${lang === 'javascript' ? 'C#' : 'JavaScript'} at run time?`,
      `What metric or test would prove your fix for ${topic.slug}?`,
    ];
    changed = true;
  }
  return changed;
}

// ─── Main ────────────────────────────────────────────────────────────────────

let rewritten = 0;
let mindmapsFixed = 0;
let interviewsFixed = 0;
const topicHooks = new Map();

for (const language of ['javascript', 'typescript']) {
  const planLookup = buildModuleLookup(language);

  for (const moduleDir of listModuleFolders(language)) {
    const moduleDoc = readJson(join(moduleDir, 'module.json'));
    const modulePlan = planLookup.get(moduleDoc.slug);
    if (!modulePlan) {
      console.warn(`No plan for module ${moduleDoc.slug}`);
      continue;
    }

    const topicsDir = join(moduleDir, 'topics');
    for (const file of readdirSync(topicsDir).filter((f) => f.endsWith('.json'))) {
      const filePath = join(topicsDir, file);
      const existing = readJson(filePath);
      topicHooks.set(`${language}:${existing.slug}`, existing.hook);

      if (!needsDeepening(existing)) continue;

      const deep = buildDeepTopic(existing, moduleDoc, modulePlan, language);
      writeJson(filePath, deep);
      topicHooks.set(`${language}:${existing.slug}`, deep.hook);
      rewritten++;
    }

    const mindmapPath = join(moduleDir, 'mindmap.json');
    if (existsSync(mindmapPath)) {
      const mindmap = readJson(mindmapPath);
      if (fixMindmap(mindmap, moduleDir, language)) {
        writeJson(mindmapPath, mindmap);
        mindmapsFixed++;
      }
    }

    const interviewPath = join(moduleDir, 'interview.json');
    if (existsSync(interviewPath)) {
      const interview = readJson(interviewPath);
      if (fixInterview(interview, moduleDir)) {
        writeJson(interviewPath, interview);
        interviewsFixed++;
      }
    }
  }
}

// Count remaining generic markers
let remainingGeneric = 0;
for (const language of ['javascript', 'typescript']) {
  for (const moduleDir of listModuleFolders(language)) {
    const topicsDir = join(moduleDir, 'topics');
    for (const file of readdirSync(topicsDir).filter((f) => f.endsWith('.json'))) {
      const topic = readJson(join(topicsDir, file));
      if (needsDeepening(topic)) remainingGeneric++;
    }
    const mindmap = readJson(join(moduleDir, 'mindmap.json'));
    if (mindmap.conceptCards?.some((c) => c.summary?.includes('Core ideas for'))) remainingGeneric++;
    const interview = readJson(join(moduleDir, 'interview.json'));
    if (interview.items?.some((i) => /to a junior engineer/i.test(i.question))) remainingGeneric++;
  }
}

console.log(`Topics rewritten: ${rewritten}`);
console.log(`Mindmaps fixed: ${mindmapsFixed}`);
console.log(`Interviews fixed: ${interviewsFixed}`);
console.log(`Remaining generic markers: ${remainingGeneric}`);
