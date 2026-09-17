/** Deep content for JavaScript module 18 — ES recap & performance */
function snippet(language, label, code, explanation) {
  return { language, label, code, explanation };
}
function buildTopic(meta) {
  const { id, slug, title, moduleId, order, hook, whatIs, glossary, whyMatters, whyCallout, steps, diagramTitle, diagramSource, snippets, compareTitle, compareHeaders, compareRows, mistakes, seniorProse, seniorTable, seniorWarning, interviewTakeaways, commonPitfalls, relatedTopicIds, jsTsCorrelations, officialSources, animationHint, scenarioTag } = meta;
  const sections = [
    { heading: 'What is this?', blocks: [{ type: 'prose', text: whatIs }, { type: 'glossary', title: 'Key terms', entries: glossary }] },
    { heading: 'Why does it matter?', blocks: [{ type: 'prose', text: whyMatters }, ...(whyCallout ? [{ type: 'callout', variant: whyCallout.variant || 'tip', title: whyCallout.title, body: whyCallout.body }] : [])] },
    { heading: 'How it works step by step', blocks: [{ type: 'steps', title: steps.title, items: steps.items }, { type: 'diagram', diagram: { type: 'mermaid', title: diagramTitle, source: diagramSource } }] },
    { heading: 'Code walkthrough', blocks: snippets.map((s) => ({ type: 'snippet', snippet: snippet(s.language, s.label, s.code, s.explanation) })) },
    { heading: 'Compare with C# and TypeScript', blocks: [{ type: 'comparisonTable', title: compareTitle, headers: compareHeaders, rows: compareRows }] },
    { heading: 'Common mistakes', blocks: [{ type: 'callout', variant: 'warning', title: 'Pitfalls to avoid', body: mistakes }] },
    { heading: 'Senior interview depth', blocks: [{ type: 'prose', text: seniorProse }, { type: 'comparisonTable', title: seniorTable.title, headers: seniorTable.headers, rows: seniorTable.rows }, { type: 'callout', variant: 'warning', title: 'What gets you rejected in interviews', body: seniorWarning }] },
  ];
  const topic = { id, slug, title, moduleId, order, hook, sections, interviewTakeaways, commonPitfalls, relatedTopicIds, jsTsCorrelations, officialSources };
  if (animationHint) topic.animationHint = animationHint;
  if (scenarioTag) topic.scenarioTag = scenarioTag;
  return topic;
}

export const RECAP_TOPICS = {
  'es-version-map': buildTopic({
    id: 'javascript-18-es-version-map', slug: 'es-version-map',
    title: 'ES2015 through ES2024 feature map', moduleId: 'javascript-18-es-recap-performance', order: 1,
    hook: 'JavaScript ships yearly ECMAScript editions — let/const and classes in ES2015, async/await in ES2017, optional chaining in ES2020, and top-level await in ES2022. Knowing what your target browsers and Node version support avoids polyfill bloat and surprise syntax errors.',
    whatIs: '**ES2015 (ES6)**: modules, classes, let/const, arrow functions, Promise, destructuring. **ES2017**: async/await. **ES2020**: optional chaining `?.`, nullish `??`, BigInt, dynamic import. **ES2022**: class fields, top-level await, Error cause. **ES2023/24**: Array findLast, Promise.withResolvers, Object.groupBy. Engines implement proposals at different rates — check **compat tables** and **Babel** targets.',
    glossary: [
      { term: 'TC39', longForm: 'TC39', plainDefinition: 'Committee defining ECMAScript proposals stages.', example: 'Stage 4 → shipped in annual ES release' },
      { term: 'polyfill', longForm: 'polyfill', plainDefinition: 'Runtime shim for missing feature.', example: 'core-js for old browsers' },
      { term: 'baseline', longForm: 'Baseline widely available', plainDefinition: 'MDN/web.dev feature support threshold.', example: 'Optional chaining baseline 2023' },
    ],
    whyMatters: 'Angular build targets determine whether optional chaining is transpiled. Node 18+ supports most ES2022 natively — fewer transforms. Interview: "what ES6 means" still tests let, arrow, class, module fundamentals. Using ES2024 Object.groupBy without fallback breaks older Safari.',
    whyCallout: { title: 'Node vs browser', body: 'Node version matrix differs from caniuse — check node.green for server features.' },
    steps: { title: 'Feature adoption', items: [
      { title: 'Identify syntax', body: 'Map feature to ES year.' },
      { title: 'Check engine', body: 'V8 version in Node / Chrome.' },
      { title: 'Configure transpiler', body: 'browserslist + Babel preset-env.' },
      { title: 'Polyfill if needed', body: 'Only import polyfills for used APIs.' },
    ]},
    diagramTitle: 'ES timeline highlights',
    diagramSource: 'timeline\n  title ECMAScript milestones\n  ES2015 : let class Promise module\n  ES2017 : async await\n  ES2020 : ?. ?? BigInt\n  ES2022 : fields top-level await\n  ES2024 : groupBy Promise.withResolvers',
    snippets: [
      { language: 'javascript', label: 'ES2015 core — still interview daily', code: 'const users = await fetch("/api/users").then((r) => r.json());\nconst admins = users.filter((u) => u.role === "admin");\nexport { admins };', explanation: 'const, arrow, Promise, export — ES2015 baseline senior must know cold.' },
      { language: 'javascript', label: 'ES2020 optional chaining in API', code: 'const city = response?.user?.address?.city ?? "unknown";\nconst len = arr?.length ?? 0;', explanation: '?. short-circuits undefined/null; ?? only nullish default.' },
      { language: 'javascript', label: 'ES2022 top-level await (module)', code: '// config.mjs\nconst config = await fetch("/config.json").then((r) => r.json());\nexport default config;', explanation: 'Module graph waits for this fetch — blocks importers until settled.' },
      { language: 'javascript', label: 'Feature detect vs polyfill', code: 'const groupBy = Object.groupBy ?? ((items, fn) =>\n  items.reduce((acc, item) => {\n    const k = fn(item);\n    (acc[k] ??= []).push(item);\n    return acc;\n  }, {})\n);', explanation: 'Line 1: fallback when ES2024 Object.groupBy missing in older runtime.' },
    ],
    compareTitle: 'Edition highlights', compareHeaders: ['Year', 'Features', 'Interview weight'],
    compareRows: [
      ['ES2015', 'let, class, Promise', 'Critical'],
      ['ES2017', 'async/await', 'Critical'],
      ['ES2020', '?., ??', 'High'],
      ['ES2022', 'fields, TLA', 'Medium'],
      ['C# versions', 'Parallel yearly', 'Map by year'],
    ],
    mistakes: 'Saying ES6 only means syntax sugar. Using bleeding-edge API without target check. Confusing TypeScript version with ES target.',
    seniorProse: 'Proposals at TC39 stages — know stage 3 likely ships. Browserslist for GitHub Pages static site: not IE11. Record feature + engine version in PR when adopting ES2024 APIs.',
    seniorTable: { title: 'Tradeoffs', headers: ['Target', 'Wins', 'Fails'], rows: [
      ['ES2015 transpile', 'Wide support', 'Bundle size'],
      ['Native ES2022', 'Smaller output', 'Old browsers'],
      ['Polyfill all', 'Compatible', 'Bloat'],
      ['Feature detect', 'Surgical', 'Code branches'],
    ]},
    seniorWarning: 'Cannot name ES2015 features. Thinks async is ES2015. No transpile target awareness.',
    interviewTakeaways: [
      'ES2015: let, const, class, module, Promise, arrow.',
      'ES2017: async/await. ES2020: ?. and ??.',
      'Check engine/browserslist before new APIs.',
      '60s: Yearly ES releases. ES6=2015 foundations. async 2017. optional chaining 2020. Match Node/browser target. Polyfill or detect missing APIs.',
      'Follow-up: what breaks if you use top-level await in CJS?',
    ],
    commonPitfalls: [
      'Weak: ES6 = only const and let.',
      'Weak: Object.groupBy without fallback.',
      'Strong: year map + target engines + feature detect pattern.',
    ],
    relatedTopicIds: ['javascript-02-var-let-const-and-tdz', 'javascript-13-async-await-syntax', 'javascript-07-optional-chaining'],
    jsTsCorrelations: [
      { language: 'typescript', concept: 'target ES', note: 'tsconfig target ES2022 — tsc downlevels for older if needed.', futureTopicSlug: 'typescript/project-config/compiler-options' },
      { language: 'typescript', concept: 'C# versions', note: 'C# comparison: C# 12 features map to specific runtime — JS engine version matters.', futureTopicSlug: 'csharp/version-style-performance/csharp-versions' },
    ],
    officialSources: [
      { title: 'TC39 proposals', url: 'https://github.com/tc39/proposals' },
      { title: 'MDN — JavaScript releases', url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/JavaScript_technologies_overview' },
    ],
    animationHint: 'timeline',
  }),

  'performance-idioms': buildTopic({
    id: 'javascript-18-performance-idioms', slug: 'performance-idioms',
    title: 'Performance idioms: memoization, lazy init, and batching', moduleId: 'javascript-18-es-recap-performance', order: 2,
    hook: 'Memoization caches pure function results. Lazy init defers expensive setup until first use. Batching combines DOM updates or Redis pipeline commands — three idioms that fix real production slowness without premature micro-optimization.',
    whatIs: '**Memoization**: cache `fn(args)` results keyed by serialized arguments — trade memory for CPU. **Lazy init**: `let instance; function get() { return instance ??= create(); }`. **Batching**: queue operations, flush once — `requestAnimationFrame` for DOM, Redis **pipeline** for N commands in one round trip. **Measure first**: Performance API, Lighthouse, clinic.js.',
    glossary: [
      { term: 'memoization', longForm: 'memoization', plainDefinition: 'Cache function output by input key.', example: 'memoize((id) => expensiveParse(id))' },
      { term: 'lazy initialization', longForm: 'lazy initialization', plainDefinition: 'Create resource on first access.', example: 'Singleton DB connection' },
      { term: 'batching', longForm: 'operation batching', plainDefinition: 'Group many ops into one flush.', example: 'redis.pipeline().get().get().exec()' },
    ],
    whyMatters: 'Dashboard calling `formatCurrency` 10k times per render — memoize. Redis without pipeline: 100 sequential round trips vs 1 batched. Lazy init avoids opening DB connection at module import during tests.',
    whyCallout: { title: 'Pure functions only', body: 'Memoize only when same inputs always same output — not fetch results without TTL.' },
    steps: { title: 'Optimize workflow', items: [
      { title: 'Profile', body: 'Find hot path — DevTools Performance.' },
      { title: 'Choose idiom', body: 'Memo, lazy, or batch.' },
      { title: 'Bound cache', body: 'LRU or TTL — no unbounded memo.' },
      { title: 'Verify', body: 'Benchmark before/after.' },
    ]},
    diagramTitle: 'Batch vs sequential',
    diagramSource: 'sequenceDiagram\n  participant App\n  participant Redis\n  App->>Redis: pipeline 100 GETs\n  Redis-->>App: one round trip',
    snippets: [
      { language: 'javascript', label: 'Memoize with Map + limit', code: 'function memoize(fn, max = 500) {\n  const cache = new Map();\n  return (...args) => {\n    const key = JSON.stringify(args);\n    if (cache.has(key)) return cache.get(key);\n    if (cache.size >= max) cache.delete(cache.keys().next().value);\n    const result = fn(...args);\n    cache.set(key, result);\n    return result;\n  };\n}\nconst parseConfig = memoize((raw) => JSON.parse(raw));', explanation: 'Line 6: evict oldest — prevents memory leak from unbounded memo.' },
      { language: 'javascript', label: 'Lazy Redis connection', code: 'let redis;\nfunction getRedis() {\n  if (!redis) {\n    redis = createClient({ url: process.env.REDIS_URL });\n    redis.connect();\n  }\n  return redis;\n}', explanation: 'Connection created first getRedis() call — tests can import module without network.' },
      { language: 'javascript', label: 'Redis pipeline batch', code: 'const pipeline = redis.pipeline();\nfor (const id of userIds) {\n  pipeline.get(`profile:${id}`);\n}\nconst results = await pipeline.exec();', explanation: 'Line 1–4: one network round trip for N GETs — major latency win.' },
      { language: 'javascript', label: 'Failure — memo impure fn', code: 'const getTime = memoize(() => Date.now());\ngetTime(); getTime(); // same timestamp — wrong!', explanation: 'Impure functions cannot be memoized without TTL invalidation.' },
    ],
    compareTitle: 'Idioms', compareHeaders: ['Idiom', 'Saves', 'Risk'],
    compareRows: [
      ['Memoize', 'CPU recompute', 'Stale / memory'],
      ['Lazy init', 'Startup time', 'Race first call'],
      ['Redis pipeline', 'Network RTT', 'All fail if connection drops'],
      ['C# Lazy<T>', 'Deferred create', 'Thread-safe init'],
    ],
    mistakes: 'Memo without bound. Memoizing fetch. Lazy init without thread-safe pattern in Workers.',
    seniorProse: 'React useMemo/useCallback are framework memo. debounce vs throttle for event batching. SQS receive batch size vs processing batch. Measure LCP before optimizing JS — network often dominates.',
    seniorTable: { title: 'Tradeoffs', headers: ['Pattern', 'Wins', 'Fails'], rows: [
      ['Bounded memo', 'Fast repeat', 'Key serialize cost'],
      ['Unbounded memo', 'Simple', 'OOM'],
      ['Pipeline 1000 cmds', 'Fast', 'Redis memory spike'],
      ['rAF batch DOM', 'Fewer layouts', 'One frame delay'],
    ]},
    seniorWarning: 'Memoizes everything without profiling. Unbounded cache. Cannot explain Redis pipeline.',
    interviewTakeaways: [
      'Memoize pure functions with bounded cache.',
      'Lazy init defers expensive resources.',
      'Redis pipeline batches commands — one RTT.',
      '60s: Profile first. Memoize pure fn with Map+limit. Lazy singleton connection. Redis pipeline for N GETs. rAF batch DOM writes.',
      'Follow-up: memoize vs Redis cache for API responses?',
    ],
    commonPitfalls: [
      'Weak: unbounded memoize on user id.',
      'Weak: 100 sequential redis.get in loop.',
      'Strong: bounded memo + pipeline + lazy init rationale.',
    ],
    relatedTopicIds: ['javascript-18-interview-utility-implementations', 'javascript-14-allocation-hot-paths', 'javascript-10-debounce-throttle-implementations'],
    jsTsCorrelations: [
      { language: 'typescript', concept: 'Generic memoize', note: 'memoize<TArgs, TResult> — preserve types through wrapper.', futureTopicSlug: 'typescript/generics/generic-functions' },
      { language: 'typescript', concept: 'Lazy<T>', note: 'C# comparison: Lazy<T> thread-safe init — JS single-thread simpler.', futureTopicSlug: 'csharp/version-style-performance/lazy' },
    ],
    officialSources: [
      { title: 'web.dev — Performance', url: 'https://web.dev/explore/performance' },
      { title: 'ioredis — Pipeline', url: 'https://github.com/redis/ioredis#pipelining' },
    ],
    animationHint: 'flow', scenarioTag: 'redis-cache',
  }),

  'deep-clone-and-equality': buildTopic({
    id: 'javascript-18-deep-clone-and-equality', slug: 'deep-clone-and-equality',
    title: 'Deep clone, deep equality, and circular references', moduleId: 'javascript-18-es-recap-performance', order: 3,
    hook: 'JSON.parse(JSON.stringify(obj)) fails on circular refs, Date, Map, and undefined — senior interviews want structuredClone or a WeakMap-based recursive clone, plus deep equality that handles cycles without infinite recursion.',
    whatIs: '**Shallow copy**: spread or Object.assign — nested objects shared. **structuredClone** (modern): built-in deep clone for most types including Map, Date, circular refs. **Custom deep clone**: recursive walk with **WeakMap** cache for visited objects to handle cycles. **Deep equality**: compare structure; track visited pairs for cycles; **Object.is** for NaN.',
    glossary: [
      { term: 'structuredClone', longForm: 'structuredClone', plainDefinition: 'Platform deep clone API.', example: 'structuredClone(obj)' },
      { term: 'circular reference', longForm: 'circular reference', plainDefinition: 'Object points to itself directly or indirectly.', example: 'obj.self = obj' },
      { term: 'WeakMap cache', longForm: 'clone WeakMap cache', plainDefinition: 'Maps original to clone to break cycles.', example: 'seen.set(obj, copy)' },
    ],
    whyMatters: 'State management snapshots, undo stacks, and Redis-cached config copies need correct clone. JSON clone strips undefined and converts Date to string — subtle production bugs. lodash isEqual interview alternative to hand-rolled.',
    whyCallout: { title: 'Functions not cloneable', body: 'structuredClone throws on functions — clone data POJOs only.' },
    steps: { title: 'Clone with cycles', items: [
      { title: 'Check primitives', body: 'Return as-is.' },
      { title: 'Check WeakMap', body: 'If seen, return cached clone.' },
      { title: 'Allocate copy', body: 'Array or Object or Date etc.' },
      { title: 'Recurse properties', body: 'Store in WeakMap before recursing.' },
    ]},
    diagramTitle: 'Circular clone with WeakMap',
    diagramSource: 'flowchart TD\n  O[obj] -->|seen?| W[WeakMap]\n  W -->|no| C[create copy]\n  C --> R[recurse props]\n  R --> W',
    snippets: [
      { language: 'javascript', label: 'structuredClone baseline', code: 'const original = { d: new Date(), m: new Map([[1, 2]]) };\noriginal.self = original;\nconst copy = structuredClone(original);\ncopy.self === copy; // true — cycle preserved', explanation: 'Built-in handles Date, Map, cycles — preferred when available.' },
      { language: 'javascript', label: 'deepClone with WeakMap', code: 'function deepClone(value, seen = new WeakMap()) {\n  if (value === null || typeof value !== "object") return value;\n  if (seen.has(value)) return seen.get(value);\n  if (value instanceof Date) return new Date(value);\n  const copy = Array.isArray(value) ? [] : {};\n  seen.set(value, copy);\n  for (const key of Reflect.ownKeys(value)) {\n    copy[key] = deepClone(value[key], seen);\n  }\n  return copy;\n}', explanation: 'Line 4: return cached clone for cycle. Line 7: register before recursing children.' },
      { language: 'javascript', label: 'deepEqual with cycle guard', code: 'function deepEqual(a, b, seen = new WeakMap()) {\n  if (Object.is(a, b)) return true;\n  if (typeof a !== "object" || a === null || typeof b !== "object" || b === null) return false;\n  const pair = seen.get(a);\n  if (pair && pair === b) return true;\n  seen.set(a, b);\n  const keysA = Reflect.ownKeys(a);\n  const keysB = Reflect.ownKeys(b);\n  if (keysA.length !== keysB.length) return false;\n  return keysA.every((k) => deepEqual(a[k], b[k], seen));\n}', explanation: 'Line 6–7: if we already compared this pair, treat as equal for cycle.' },
      { language: 'javascript', label: 'Failure — JSON clone', code: 'const o = { u: undefined, d: new Date(), c: {} };\no.c = o;\nJSON.parse(JSON.stringify(o)); // drops u; d string; throws on cycle', explanation: 'JSON loses types and cannot serialize circular structure.' },
    ],
    compareTitle: 'Clone strategies', compareHeaders: ['Method', 'Cycles', 'Date/Map'],
    compareRows: [
      ['spread', 'N/A shallow', 'Shared nested'],
      ['JSON', 'Throws', 'Lost'],
      ['structuredClone', 'Yes', 'Yes'],
      ['Custom WeakMap', 'Yes', 'If coded'],
    ],
    mistakes: 'JSON clone for state snapshots. Infinite recursion on circular without WeakMap. Forgetting Symbol keys (Reflect.ownKeys).',
    seniorProse: 'Immutability libraries (Immer) use structural sharing not full clone. Interview implement clone+equality in 20 min. Redis stores JSON — round-trip is not structuredClone semantics.',
    seniorTable: { title: 'Tradeoffs', headers: ['Approach', 'Wins', 'Fails'], rows: [
      ['structuredClone', 'Correct built-in', 'No functions'],
      ['JSON', 'Simple wire format', 'Lossy'],
      ['lodash cloneDeep', 'Battle tested', 'Bundle size'],
      ['Hand roll', 'Interview', 'Edge cases'],
    ]},
    seniorWarning: 'Only knows JSON clone. Infinite loop on cycle. Cannot implement WeakMap cache.',
    interviewTakeaways: [
      'JSON clone lossy — no undefined, Date, Map, cycles.',
      'structuredClone handles most types + cycles.',
      'WeakMap tracks original→clone for custom deepClone.',
      '60s: Shallow spread. structuredClone for deep. Custom clone: WeakMap seen map before recurse. deepEqual: same cycle guard. JSON fails cycles.',
      'Follow-up: implement deepClone with Date and array.',
    ],
    commonPitfalls: [
      'Weak: JSON.stringify for undo stack.',
      'Weak: recurse without cycle detection — stack overflow.',
      'Strong: WeakMap + structuredClone mention + Reflect.ownKeys.',
    ],
    relatedTopicIds: ['javascript-03-json-and-serialization', 'javascript-08-immutable-patterns', 'javascript-18-interview-utility-implementations'],
    jsTsCorrelations: [
      { language: 'typescript', concept: 'Structured clone types', note: 'TS 5.0+ structuredClone typings for cloneable types.', futureTopicSlug: 'typescript/builtins/structured-clone' },
      { language: 'typescript', concept: 'IEquatable', note: 'C# comparison: deep equality often custom or serialization compare.', futureTopicSlug: 'csharp/collections/equality' },
    ],
    officialSources: [
      { title: 'MDN — structuredClone', url: 'https://developer.mozilla.org/en-US/docs/Web/API/structuredClone' },
      { title: 'MDN — Deep copy', url: 'https://developer.mozilla.org/en-US/docs/Glossary/Deep_copy' },
    ],
    animationHint: 'stack-heap',
  }),

  'code-review-radar': buildTopic({
    id: 'javascript-18-code-review-radar', slug: 'code-review-radar',
    title: 'JavaScript code review radar for senior interviews', moduleId: 'javascript-18-es-recap-performance', order: 4,
    hook: 'Senior code review in JavaScript is a checklist radar: async correctness, equality traps, memory leaks, type boundaries, error handling, and security — the categories interviewers embed in "find the bugs" exercises.',
    whatIs: '**Radar categories**: (1) **Async** — missing await, unbounded Promise.all, no AbortSignal. (2) **Equality** — `==`, reference vs value, NaN. (3) **Memory** — listeners, timers, caches. (4) **Boundaries** — JSON.parse without validate. (5) **Security** — XSS innerHTML, prototype pollution. (6) **Performance** — sync fs, layout thrashing. (7) **this** binding in callbacks.',
    glossary: [
      { term: 'code review radar', longForm: 'code review radar', plainDefinition: 'Systematic categories when reviewing JS.', example: 'async → equality → memory scan' },
      { term: 'prototype pollution', longForm: 'prototype pollution', plainDefinition: 'Merge untrusted keys onto Object.prototype.', example: '__proto__ in JSON payload' },
      { term: 'type boundary', longForm: 'API type boundary', plainDefinition: 'Where external data enters system.', example: 'fetch response → parse → validate' },
    ],
    whyMatters: 'PR review catches `redis.set` without await before deploy. Interview snippet with 5 bugs tests radar breadth. Production incidents: `== null` hiding undefined config, detached listeners on router, fetch without timeout.',
    whyCallout: { title: 'One bug per category', body: 'Interview problems often plant one issue per radar spoke — scan systematically.' },
    steps: { title: 'Review pass order', items: [
      { title: 'Async flow', body: 'await, catch, cancel, pool size.' },
      { title: 'Data correctness', body: '===, nullish, Number.isNaN.' },
      { title: 'Lifecycle', body: 'cleanup, cache bounds.' },
      { title: 'External input', body: 'validate, sanitize, auth.' },
    ]},
    diagramTitle: 'Review radar',
    diagramSource: 'mindmap\n  root((Review radar))\n    Async\n    Equality\n    Memory\n    Boundaries\n    Security\n    Performance\n    this binding',
    snippets: [
      { language: 'javascript', label: 'Buggy snippet — find issues', code: 'async function loadDashboard(userId) {\n  const [user, orders] = Promise.all([\n    fetch(`/users/${userId}`),\n    fetch(`/orders?user=${userId}`),\n  ]);\n  const data = JSON.parse(user.body);\n  document.getElementById("name").innerHTML = data.name;\n  setInterval(() => refresh(userId), 5000);\n}', explanation: 'Missing await on Promise.all; parse Response not body; XSS innerHTML; interval never cleared; no error handling.' },
      { language: 'javascript', label: 'Fixed review', code: 'async function loadDashboard(userId, { signal }) {\n  const [uRes, oRes] = await Promise.all([\n    fetch(`/users/${userId}`, { signal }),\n    fetch(`/orders?user=${userId}`, { signal }),\n  ]);\n  if (!uRes.ok) throw new Error(uRes.status);\n  const data = await uRes.json();\n  document.getElementById("name").textContent = data.name;\n  const id = setInterval(() => refresh(userId), 5000);\n  return () => clearInterval(id);\n}', explanation: 'await, json(), textContent, AbortSignal, cleanup disposer returned.' },
      { language: 'javascript', label: 'Redis boundary validation', code: 'function parseCached(raw) {\n  if (typeof raw !== "string") return null;\n  try {\n    const data = JSON.parse(raw);\n    if (typeof data?.userId !== "string") return null;\n    return data;\n  } catch { return null; }\n}', explanation: 'Validate after parse — radar boundary check.' },
      { language: 'javascript', label: 'Prototype pollution guard', code: 'function safeMerge(target, source) {\n  for (const key of Object.keys(source)) {\n    if (key === "__proto__" || key === "constructor" || key === "prototype") continue;\n    target[key] = source[key];\n  }\n  return target;\n}', explanation: 'Block dangerous keys when merging user JSON into config object.' },
    ],
    compareTitle: 'Review focus', compareHeaders: ['Category', 'JS risk', 'C# analog'],
    compareRows: [
      ['Async', 'missing await', 'unobserved Task'],
      ['Equality', '== coercion', 'value equality'],
      ['Memory', 'listener leak', 'event += leak'],
      ['Security', 'XSS DOM', 'HtmlEncode'],
    ],
    mistakes: 'Review only style not semantics. Missing async bugs. Approving innerHTML with user data.',
    seniorProse: 'Use PR template checklist. Link to radar in team wiki. FAANG interview: verbalize category as you find each bug. Pair with eslint rules: no-floating-promises, eqeqeq.',
    seniorTable: { title: 'Radar priority', headers: ['Severity', 'Category', 'Example'], rows: [
      ['P0', 'Security XSS', 'innerHTML user input'],
      ['P0', 'Async data loss', 'missing await redis.set'],
      ['P1', 'Memory leak', 'interval on route'],
      ['P2', 'Perf', 'readFileSync'],
    ]},
    seniorWarning: 'Reviews naming only. Misses missing await. No security scan on DOM APIs.',
    interviewTakeaways: [
      'Scan: async, equality, memory, boundaries, security, perf, this.',
      'Common: missing await Promise.all, no cleanup, XSS.',
      'Validate JSON at boundaries; block __proto__ merge.',
      '60s: Senior review radar — async correctness first, then === and NaN, listener/timer leaks, parse validate, XSS innerHTML, sync blocking, this in callbacks. Fix with await textContent clearInterval.',
      'Follow-up: list 5 bugs in loadDashboard snippet.',
    ],
    commonPitfalls: [
      'Weak: nitpick formatting miss await Promise.all.',
      'Weak: approve innerHTML with API data.',
      'Strong: category-by-category verbal review + fixes.',
    ],
    relatedTopicIds: ['javascript-18-deep-clone-and-equality', 'javascript-14-memory-leak-patterns', 'javascript-05-this-binding'],
    jsTsCorrelations: [
      { language: 'typescript', concept: 'strict checks', note: 'TS strict + eslint no-floating-promises catch radar async issues at compile.', futureTopicSlug: 'typescript/project-config/strict' },
      { language: 'typescript', concept: 'Code analysis', note: 'C# comparison: Roslyn analyzers CA rules — similar automated radar.', futureTopicSlug: 'csharp/version-style-performance/analyzers' },
    ],
    officialSources: [
      { title: 'OWASP — XSS', url: 'https://owasp.org/www-community/attacks/xss/' },
      { title: 'eslint — no-floating-promises', url: 'https://typescript-eslint.io/rules/no-floating-promises/' },
    ],
    animationHint: 'compare',
  }),

  'interview-utility-implementations': buildTopic({
    id: 'javascript-18-interview-utility-implementations', slug: 'interview-utility-implementations',
    title: 'Interview utilities: bind, once, memoize, and flatten', moduleId: 'javascript-18-es-recap-performance', order: 5,
    hook: 'FAANG JavaScript rounds still ask you to implement Function.prototype.bind, once, memoize, or flatten from scratch — each tests closures, this binding, argument forwarding, and edge cases like circular arrays.',
    whatIs: '**bind**: return wrapper fixing `this` and partial args. **once**: call fn at most one time, cache result. **memoize**: cache by args key. **flatten**: reduce nested arrays to depth N; handle sparse arrays and non-array elements. Know **[[Call]]** semantics: bound function has special `this` behavior.',
    glossary: [
      { term: 'bind', longForm: 'Function.prototype.bind', plainDefinition: 'Create function with fixed this and prepended args.', example: 'fn.bind(obj, 1)(2)' },
      { term: 'once', longForm: 'once wrapper', plainDefinition: 'Execute original only first call; return cached value.', example: 'init = once(setupDb)' },
      { term: 'flatten', longForm: 'array flatten', plainDefinition: 'Nested array to flat to depth.', example: 'flatten([1,[2,[3]]], 2) → [1,2,3]' },
    ],
    whyMatters: 'These utilities appear in lodash source reading and framework internals. bind explains arrow vs function this. flatten with depth mirrors Array.prototype.flat. Production: once for singleton init; memoize bounded for parse functions.',
    whyCallout: { title: 'polyfill vs production', body: 'Interview: implement bind without calling native bind — use apply + closure.' },
    steps: { title: 'bind implementation', items: [
      { title: 'Return function', body: 'Wrapper captures thisArg and partials.' },
      { title: 'Merge args', body: 'partials.concat(callArgs).' },
      { title: 'apply', body: 'fn.apply(thisArg, merged).' },
      { title: 'new binding', body: 'If called with new, bind this ignored — advanced edge.' },
    ]},
    diagramTitle: 'Utility patterns',
    diagramSource: 'flowchart TD\n  B[bind] --> F[fixed this + args]\n  O[once] --> C[cached result]\n  M[memoize] --> Map[key]\n  FL[flatten] --> recurse depth',
    snippets: [
      { language: 'javascript', label: 'bind polyfill', code: 'Function.prototype.myBind = function (thisArg, ...partials) {\n  const fn = this;\n  return function (...args) {\n    return fn.apply(thisArg, [...partials, ...args]);\n  };\n};\n\nconst obj = { x: 10, add(y) { return this.x + y; } };\nconst add5 = obj.add.myBind(obj, 5);\nadd5(3); // 18', explanation: 'Line 4: apply merges partial and call-time args with fixed thisArg.' },
      { language: 'javascript', label: 'once', code: 'function once(fn) {\n  let called = false;\n  let result;\n  return function (...args) {\n    if (!called) {\n      called = true;\n      result = fn.apply(this, args);\n    }\n    return result;\n  };\n}\nconst init = once(() => connectRedis());', explanation: 'Line 6: preserve this for method once. Subsequent calls skip fn.' },
      { language: 'javascript', label: 'flatten with depth', code: 'function flatten(arr, depth = 1) {\n  return depth > 0\n    ? arr.reduce((acc, val) => acc.concat(\n        Array.isArray(val) ? flatten(val, depth - 1) : val\n      ), [])\n    : arr.slice();\n}\nflatten([1, [2, [3]]], 2); // [1, 2, 3]', explanation: 'Line 3–4: recurse while depth > 0; depth 0 returns shallow copy.' },
      { language: 'javascript', label: 'Failure — bind arrow', code: 'const arrow = () => this;\nconst bound = arrow.bind({ x: 1 });\nbound(); // lexical this — bind cannot override arrow', explanation: 'Arrows ignore bound this — interview follow-up.' },
    ],
    compareTitle: 'Utilities', compareHeaders: ['Fn', 'Tests', 'Edge'],
    compareRows: [
      ['bind', 'this + partial args', 'new operator'],
      ['once', 'single init', 'throw first call'],
      ['memoize', 'cache key', 'unbounded memory'],
      ['flatten', 'depth', 'non-array items'],
    ],
    mistakes: 'bind without apply. once not caching throw. flatten infinite on circular array without guard.',
    seniorProse: 'Follow-ups: debounce, throttle, curry, promiseAll limit. lodash implementations for comparison. TypeScript generic typings for memoize. bind + new: FBound extends bound function prototype.',
    seniorTable: { title: 'Tradeoffs', headers: ['Util', 'Use', 'Pitfall'], rows: [
      ['bind', 'Event handler this', 'Arrow lexical this'],
      ['once', 'DB connect', 'Silent skip errors'],
      ['memoize', 'Pure parse', 'Memory'],
      ['flat native', 'ES2019', 'Interview wants hand roll'],
    ]},
    seniorWarning: 'Cannot implement bind. once calls fn every time. flatten only one level always.',
    interviewTakeaways: [
      'bind: closure + apply + partial args.',
      'once: called flag + cached result.',
      'memoize: Map key JSON.stringify(args).',
      'flatten: reduce + recurse depth - 1.',
      '60s: bind fixes this via apply wrapper. once caches first result. memoize Map bounded. flatten recursive depth. Arrow bind no-op on this.',
    ],
    commonPitfalls: [
      'Weak: bind using ...fn.bind (cheat).',
      'Weak: flatten without depth parameter.',
      'Strong: apply-based bind + once + flatten depth + arrow caveat.',
    ],
    relatedTopicIds: ['javascript-05-this-binding', 'javascript-18-performance-idioms', 'javascript-12-implementing-array-helpers'],
    jsTsCorrelations: [
      { language: 'typescript', concept: 'ThisParameterType', note: 'TS utility types for typing bind results.', futureTopicSlug: 'typescript/functions/this-types' },
      { language: 'typescript', concept: 'Func<T>', note: 'C# comparison: Func delegate vs JS first-class functions — bind like partial application.', futureTopicSlug: 'csharp/delegates-events-lambdas/func-action' },
    ],
    officialSources: [
      { title: 'MDN — bind', url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/bind' },
      { title: 'MDN — flat', url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/flat' },
    ],
    animationHint: 'flow',
  }),
};
