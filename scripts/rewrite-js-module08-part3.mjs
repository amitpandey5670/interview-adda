#!/usr/bin/env node
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';

const root = join(process.cwd(), 'data/javascript/modules');
const m08 = '08-collections-and-iterators';

function writeTopic(relPath, topic) {
  writeFileSync(join(root, relPath), `${JSON.stringify(topic, null, 2)}\n`);
}
function writeJson(relPath, data) {
  writeFileSync(join(root, relPath), `${JSON.stringify(data, null, 2)}\n`);
}
function senior(prose, rows, warning) {
  return {
    heading: 'Senior interview depth',
    blocks: [
      { type: 'prose', text: prose },
      { type: 'comparisonTable', title: 'Senior tradeoffs', headers: ['Topic', 'Key insight', 'Interview angle'], rows },
      { type: 'callout', variant: 'warning', title: 'What gets you rejected in interviews', body: warning },
    ],
  };
}

writeTopic(`${m08}/topics/generators-and-yield.json`, {
  id: 'javascript-08-generators-and-yield',
  slug: 'generators-and-yield',
  title: 'Generators, yield, and lazy sequences',
  moduleId: 'javascript-08-collections-and-iterators',
  order: 4,
  hook: 'Generator functions (function*) pause with yield and resume on next() — building lazy sequences without materializing entire datasets. They implement both iterator and iterable in one object.',
  sections: [
    { heading: 'What is this?', blocks: [
      { type: 'prose', text: '**function*** defines a generator. Calling it returns a generator object (iterator) without running body until **next()**. **yield** pauses and sends value out; **yield*** delegates to another iterable. Generators are **iterable** — they implement Symbol.iterator returning self. **return()** and **throw()** on iterator interact with yield try/finally inside generator.' },
      { type: 'glossary', title: 'Key terms', entries: [
        { term: 'generator', longForm: 'generator function', plainDefinition: 'function* returning lazy iterator with yield pauses.', example: 'function* ids() { yield 1; yield 2; }' },
        { term: 'yield', longForm: 'yield expression', plainDefinition: 'Pauses generator; next() resumes after yield.', example: 'const x = yield compute();' },
        { term: 'yield*', longForm: 'yield delegate', plainDefinition: 'Delegates iteration to inner iterable/generator.', example: 'yield* [1, 2, 3];' },
        { term: 'lazy sequence', longForm: 'lazy evaluation', plainDefinition: 'Produce values on demand — O(1) memory for infinite streams.', example: 'function* naturals() { let n=1; while(true) yield n++; }' },
      ]},
    ]},
    { heading: 'Why does it matter?', blocks: [
      { type: 'prose', text: 'Paginated API fetch, infinite scroll, and pipeline transforms use generators to avoid loading all rows. Redux-saga and co use generators for async control flow before async/await dominance. C# yield return in IEnumerable is direct analog.' },
      { type: 'callout', variant: 'tip', title: 'Infinite with guard', body: 'Lazy does not mean free — always bound consumer with take(n) or break to avoid infinite loops.' },
    ]},
    { heading: 'How it works step by step', blocks: [
      { type: 'steps', title: 'Generator execution', items: [
        { title: 'Call generator fn', body: 'Returns generator object — body not executed yet.' },
        { title: 'First next()', body: 'Runs until first yield; returns { value, done: false }.' },
        { title: 'Subsequent next()', body: 'Resumes after yield until next yield or return.' },
        { title: 'Done', body: 'return or end — { done: true, value: undefined }.' },
      ]},
      { type: 'diagram', diagram: { type: 'mermaid', title: 'Generator pause/resume', source: 'stateDiagram-v2\n  [*] --> Suspended\n  Suspended --> Running: next()\n  Running --> Suspended: yield value\n  Running --> Done: return' }},
    ]},
    { heading: 'Code walkthrough', blocks: [
      { type: 'snippet', snippet: { language: 'javascript', label: 'Basic generator', code: 'function* range(from, to) {\n  for (let i = from; i <= to; i++) yield i;\n}\n\nconst gen = range(1, 3);\nconsole.log(gen.next()); // { value: 1, done: false }\nconsole.log([...range(1, 3)]); // [1, 2, 3]', explanation: 'Generator is iterable — spread calls next until done.' }},
      { type: 'snippet', snippet: { language: 'javascript', label: 'Lazy paginated fetch', code: 'async function* fetchPages(baseUrl) {\n  let page = 1;\n  while (true) {\n    const res = await fetch(`${baseUrl}?page=${page}`);\n    const data = await res.json();\n    if (data.items.length === 0) return;\n    yield* data.items;\n    page++;\n  }\n}\n\nfor await (const item of fetchPages("/api/items")) {\n  process(item);\n  if (done) break;\n}', explanation: 'Async generator yields items page by page — memory bounded. for await consumes async iterables.' }},
      { type: 'snippet', snippet: { language: 'javascript', label: 'yield* delegation', code: 'function* concat(a, b) {\n  yield* a;\n  yield* b;\n}\n\nconsole.log([...concat([1, 2], ["x"])]); // [1, 2, "x"]', explanation: 'yield* flattens inner iterable into outer generator sequence.' }},
      { type: 'snippet', snippet: { language: 'javascript', label: 'Failure mode — materializing lazy', code: 'function* readLines(path) {\n  // pretend stream\n  for (const line of hugeFile) yield line;\n}\n\n// BUG: loads all into memory\nconst all = [...readLines("10gb.log")];\n\n// Better: process incrementally\nfor (const line of readLines("10gb.log")) {\n  if (match(line)) { report(line); break; }\n}', explanation: 'Spread materializes entire generator — defeats laziness on large inputs.' }},
    ]},
    { heading: 'Compare with C# and TypeScript', blocks: [
      { type: 'comparisonTable', title: 'Lazy sequences', headers: ['Feature', 'JavaScript', 'C#'], rows: [
        ['Syntax', 'function* yield', 'yield return in IEnumerable'],
        ['Async', 'async function* + for await', 'IAsyncEnumerable + await foreach'],
        ['Consumer', 'for...of, spread', 'foreach, LINQ'],
        ['State', 'Generator object paused', 'Compiler state machine'],
        ['Infinite', 'Possible with consumer guard', 'Same with Take()'],
      ]},
    ]},
    { heading: 'Common mistakes', blocks: [
      { type: 'callout', variant: 'warning', title: 'Pitfalls to avoid', body: 'Spreading infinite generator. Forgetting generator not run until next(). Not handling throw() into generator. Using generators where simple array map suffices — complexity cost.' },
    ]},
    senior('Generators compile to **state machines** like async functions. **yield** receives value from next(arg). **Redux-saga** pattern: while(true) { const action = yield take(TYPE) }. Prefer **async/await** for I/O unless need multiple consumers or coroutine style. **Iterator helpers** may replace hand-rolled map filter on iterables.', [['Lazy vs eager', 'Memory bound pipelines', 'When spread kills laziness'], ['async generator', 'for await pagination', 'vs Promise.all pages'], ['yield*', 'Delegate composition', 'Flatten nested iterables']], 'Thinks generator runs on call like normal function. Cannot explain next() resume. Recommends [...infiniteGen()] without guard.'),
  ],
  interviewTakeaways: ['function* returns generator iterator; body runs lazily on next().', 'yield pauses; yield* delegates to iterable.', 'Generators are iterable — for...of and spread work.', 'Async generators: async function* + for await.', '60s: Lazy sequences. C# yield return parallel. Do not spread infinite. Pagination pattern. State machine pause.'],
  commonPitfalls: ['Weak: "function* runs immediately." Strong: "Returns iterator; next() drives execution to each yield."', 'Weak: "Generators always better than arrays." Strong: "Use for lazy/infinite; arrays simpler for small finite data."', 'Strong: "Show paginated fetchPages — yield* items, break early without loading all."'],
  relatedTopicIds: ['javascript-08-iterators-and-for-of', 'javascript-08-collection-performance', 'javascript-08-immutable-patterns'],
  jsTsCorrelations: [{ language: 'typescript', concept: 'Generator types', note: 'Generator<TYield, TReturn, TNext> types yield and return; async generators use AsyncGenerator.', futureTopicSlug: 'typescript/iterators/generators' }, { language: 'typescript', concept: 'yield return', note: 'C# iterator blocks compile to state machine — same conceptual model as JS generators.', futureTopicSlug: 'csharp/iterators/yield-return' }],
  officialSources: [{ title: 'MDN — function*', url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/function*' }, { title: 'javascript.info — Generators', url: 'https://javascript.info/generators' }],
  animationHint: 'timeline',
});

writeTopic(`${m08}/topics/collection-performance.json`, {
  id: 'javascript-08-collection-performance',
  slug: 'collection-performance',
  title: 'When to use Map versus Object and Set versus Array',
  moduleId: 'javascript-08-collections-and-iterators',
  order: 5,
  hook: 'Map beats plain Object for frequent add/delete with arbitrary keys; Set beats Array for membership tests at scale. Wrong choice shows up as O(n) scans in hot paths and memory churn in caches.',
  sections: [
    { heading: 'What is this?', blocks: [
      { type: 'prose', text: '**Object** optimized for small fixed-shape records with string/symbol keys — V8 hidden classes. **Map** handles arbitrary key types and frequent size changes without shape degradation. **Array.includes** is O(n); **Set.has** average O(1). **Array** preserves order with index access O(1); **Set** only membership. Choose by operation profile, not dogma.' },
      { type: 'glossary', title: 'Key terms', entries: [
        { term: 'amortized O(1)', longForm: 'amortized constant time', plainDefinition: 'Map.set/get and Set.add/has average constant time.', example: 'cache.set(key, val)' },
        { term: 'hidden class', longForm: 'hidden class shape', plainDefinition: 'V8 optimization for objects with stable property set.', example: 'Reuse same keys on many objects' },
        { term: 'membership test', longForm: 'membership check', plainDefinition: 'Whether value exists — Set.has vs Array.includes.', example: 'seen.has(id) vs seen.includes(id)' },
        { term: 'key coercion', longForm: 'property key coercion', plainDefinition: 'Object converts keys to string — affects cache key design.', example: 'obj[{}] collides' },
      ]},
    ]},
    { heading: 'Why does it matter?', blocks: [
      { type: 'prose', text: 'High-concurrency dedupe with Array.includes on 100k IDs is O(n) per check — Set fixes. LRU caches with string keys often use Map for insertion order + delete performance. JSON APIs use plain objects — Map must convert for wire format.' },
      { type: 'callout', variant: 'tip', title: 'Measure first', body: 'Micro-benchmark in V8 version X may differ — profile with DevTools before rewriting working code.' },
    ]},
    { heading: 'How it works step by step', blocks: [
      { type: 'steps', title: 'Decision checklist', items: [
        { title: 'Record with known fields', body: 'Plain object or class instance.' },
        { title: 'Dynamic key add/delete', body: 'Map over Object — especially non-string keys.' },
        { title: 'Unique membership at scale', body: 'Set over Array.includes.' },
        { title: 'Ordered list with index', body: 'Array — not Set.' },
      ]},
      { type: 'diagram', diagram: { type: 'mermaid', title: 'Collection choice', source: 'flowchart TD\n  Q{Operation?}\n  Q -->|index by number| ARR[Array]\n  Q -->|unique membership| SET[Set]\n  Q -->|key-value dynamic| MAP[Map]\n  Q -->|fixed JSON shape| OBJ[Object]' }},
    ]},
    { heading: 'Code walkthrough', blocks: [
      { type: 'snippet', snippet: { language: 'javascript', label: 'Set vs Array dedupe', code: 'function hasSeenArray(arr, id) {\n  return arr.includes(id); // O(n)\n}\n\nconst seen = new Set();\nfunction track(id) {\n  if (seen.has(id)) return false; // O(1) avg\n  seen.add(id);\n  return true;\n}', explanation: 'Set scales for visit tracking; Array.includes scans entire history each time.' }},
      { type: 'snippet', snippet: { language: 'javascript', label: 'Map as cache with object keys', code: 'const meta = new Map();\nfunction getMeta(component) {\n  if (!meta.has(component)) {\n    meta.set(component, computeExpensive(component));\n  }\n  return meta.get(component);\n}', explanation: 'Object identity as key — impossible cleanly with plain object without stringifying.' }},
      { type: 'snippet', snippet: { language: 'javascript', label: 'Object for fixed DTO', code: 'function toResponse(user) {\n  return {\n    id: user.id,\n    name: user.name,\n    email: user.email,\n  }; // JSON.stringify friendly shape\n}', explanation: 'Fixed field objects optimize well and serialize directly — Map needs Object.fromEntries.' }},
      { type: 'snippet', snippet: { language: 'javascript', label: 'Failure mode — Map in JSON API', code: 'const cache = new Map([["k", 1]]);\n// JSON.stringify(cache); // {}\n\nconst serializable = Object.fromEntries(cache);\nJSON.stringify(serializable); // {"k":1}', explanation: 'Map does not JSON.stringify — convert at API boundary if needed.' }},
    ]},
    { heading: 'Compare with C# and TypeScript', blocks: [
      { type: 'comparisonTable', title: 'Performance mental model', headers: ['Use case', 'JavaScript', 'C#'], rows: [
        ['Dynamic cache', 'Map', 'Dictionary + optional LRU lib'],
        ['Dedupe', 'Set', 'HashSet'],
        ['Ordered list', 'Array', 'List<T>'],
        ['JSON DTO', 'Object', 'record / POCO'],
        ['Weak metadata', 'WeakMap', 'ConditionalWeakTable'],
      ]},
    ]},
    { heading: 'Common mistakes', blocks: [
      { type: 'callout', variant: 'warning', title: 'Pitfalls to avoid', body: 'Array.includes in hot loop with growing array. Map for static JSON-shaped config. Object for object-key cache. Ignoring JSON serialization needs. Premature optimization without profiling.' },
    ]},
    senior('V8 **elements kind** and **dictionary mode** on objects with many deletes. **Map** stays fast for insert/delete. **Set** memory vs Array — Set has overhead per entry but wins on lookup. **WeakMap** not for size-limited LRU — no iteration to evict. For **LRU**, use Map + doubly linked list pattern or library.', [['Object shape', 'Hidden class deopt on delete', 'When Map wins'], ['Set vs Array', 'includes O(n) vs has O(1)', 'Event dedupe scale'], ['Serialization', 'Map to JSON empty', 'Boundary conversion']], 'Says Map always faster than object without context. Uses includes on 1M element array in hot path. Cannot name Big-O of Set.has.'),
  ],
  interviewTakeaways: ['Map: dynamic keys, any type, frequent add/delete.', 'Set: unique membership O(1) average vs Array.includes O(n).', 'Object: fixed-shape records and JSON.', 'Map does not JSON.stringify — convert at boundary.', '60s: Object record vs Map cache vs Set dedupe. Profile first. WeakMap not LRU.'],
  commonPitfalls: ['Weak: "Always use Map instead of object." Strong: "Object for fixed DTO; Map for dynamic keys and object-key cache."', 'Weak: "Array.includes is fine always." Strong: "Set when repeated membership on large collection."', 'Strong: "Explain JSON.stringify(Map) empty object — need fromEntries."'],
  relatedTopicIds: ['javascript-08-map-set-weak-collections', 'javascript-08-arrays-and-typed-arrays', 'javascript-08-immutable-patterns'],
  jsTsCorrelations: [{ language: 'typescript', concept: 'ReadonlyMap', note: 'TS ReadonlyMap types immutability at compile; run time still mutable Map unless frozen.', futureTopicSlug: 'typescript/builtins/map' }, { language: 'typescript', concept: 'HashSet', note: 'C# HashSet<T> parallels Set; Dictionary<TKey,TValue> parallels Map.', futureTopicSlug: 'csharp/collections/hashset' }],
  officialSources: [{ title: 'MDN — Map', url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map' }, { title: 'MDN — Set', url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set' }],
  animationHint: 'compare',
  scenarioTag: 'redis-cache',
});

writeTopic(`${m08}/topics/immutable-patterns.json`, {
  id: 'javascript-08-immutable-patterns',
  slug: 'immutable-patterns',
  title: 'Immutability patterns: spread, structuredClone, and tradeoffs',
  moduleId: 'javascript-08-collections-and-iterators',
  order: 6,
  hook: 'Immutability in JavaScript means copying and replacing — spread for shallow updates, structuredClone for deep copies, and awareness that const does not freeze nested objects. React state and Redux rely on reference change detection.',
  sections: [
    { heading: 'What is this?', blocks: [
      { type: 'prose', text: '**Shallow copy**: spread `{ ...obj }`, `[...arr]`, `Object.assign` — nested objects still aliased. **structuredClone** deep-copies most built-ins including Date, Map, circular refs (not functions/prototypes). **Object.freeze** shallow immutability. **Immutable update** returns new root with changed branch — React setState pattern.' },
      { type: 'glossary', title: 'Key terms', entries: [
        { term: 'shallow copy', longForm: 'shallow copy', plainDefinition: 'New container; nested references shared.', example: '{ ...user, name: "new" }' },
        { term: 'structuredClone', longForm: 'structuredClone', plainDefinition: 'Built-in deep clone for structured data.', example: 'structuredClone(nested)' },
        { term: 'Object.freeze', longForm: 'Object.freeze', plainDefinition: 'Prevents adding/removing/changing top-level properties.', example: 'Object.freeze(config)' },
        { term: 'structural sharing', longForm: 'structural sharing', plainDefinition: 'Reuse unchanged subtrees in new immutable tree.', example: 'Immer library pattern' },
      ]},
    ]},
    { heading: 'Why does it matter?', blocks: [
      { type: 'prose', text: 'React memo and useEffect deps compare by reference — mutating state in place skips updates. Time-travel debugging needs immutable history. C# records give value semantics; JS requires discipline or Immer.' },
      { type: 'callout', variant: 'remember', title: 'JSON clone limits', body: 'JSON.parse(JSON.stringify(x)) drops undefined, functions, Date becomes string, no circular refs — prefer structuredClone when available.' },
    ]},
    { heading: 'How it works step by step', blocks: [
      { type: 'steps', title: 'Update nested state immutably', items: [
        { title: 'Copy root', body: 'Spread object or array at top level.' },
        { title: 'Copy path to leaf', body: 'Spread each nested level along update path.' },
        { title: 'Set new value', body: 'Replace leaf; keep other branches shared.' },
        { title: 'Or use Immer', body: 'Draft mutation produces immutable result.' },
      ]},
      { type: 'diagram', diagram: { type: 'mermaid', title: 'Shallow vs deep', source: 'flowchart TD\n  ROOT[Root object copy] --> N1[Nested ref A — shared if shallow]\n  ROOT --> N2[Nested ref B — new if updated path]\n  DEEP[structuredClone] --> ALL[All levels copied]' }},
    ]},
    { heading: 'Code walkthrough', blocks: [
      { type: 'snippet', snippet: { language: 'javascript', label: 'Shallow spread update', code: 'const state = { user: { name: "Ada", prefs: { theme: "dark" } } };\n\nconst next = {\n  ...state,\n  user: {\n    ...state.user,\n    prefs: { ...state.user.prefs, theme: "light" },\n  },\n};\n\nconsole.log(state.user.prefs.theme); // dark\nconsole.log(next.user.prefs.theme);  // light', explanation: 'Each level along path copied; unrelated branches share references with original.' }},
      { type: 'snippet', snippet: { language: 'javascript', label: 'structuredClone deep', code: 'const original = { d: new Date(), m: new Map([[1, 2]]) };\noriginal.self = original;\n\nconst copy = structuredClone(original);\nconsole.log(copy.self === copy); // true — circular preserved\nconsole.log(copy.d instanceof Date); // true\nconsole.log(copy.m.get(1)); // 2', explanation: 'structuredClone handles Date, Map, circular refs — JSON clone cannot.' }},
      { type: 'snippet', snippet: { language: 'javascript', label: 'Array immutable ops', code: 'const items = [1, 2, 3];\nconst added = [...items, 4];\nconst removed = items.filter(x => x !== 2);\nconst updated = items.map(x => x === 2 ? 20 : x);\n\nconsole.log(items); // [1, 2, 3] unchanged', explanation: 'Spread, filter, map return new arrays — do not mutate source.' }},
      { type: 'snippet', snippet: { language: 'javascript', label: 'Failure mode — shallow trap', code: 'const a = { nested: { count: 0 } };\nconst b = { ...a };\nb.nested.count = 99;\nconsole.log(a.nested.count); // 99 — shared nested ref\n\n// Fix deep path copy or structuredClone', explanation: 'Spread only copies top level — nested mutation leaks between clones.' }},
    ]},
    { heading: 'Compare with C# and TypeScript', blocks: [
      { type: 'comparisonTable', title: 'Immutability approaches', headers: ['Approach', 'JavaScript', 'C#'], rows: [
        ['Shallow copy', 'spread, Object.assign', 'memberwise clone manual'],
        ['Deep clone', 'structuredClone', 'Manual or serializer'],
        ['Immutable type', 'Convention + libraries', 'record with init'],
        ['Freeze', 'Object.freeze shallow', 'readonly struct'],
        ['State libs', 'Immer, Redux', 'Immutable collections NuGet'],
      ]},
    ]},
    { heading: 'Common mistakes', blocks: [
      { type: 'callout', variant: 'warning', title: 'Pitfalls to avoid', body: 'Spread thinking it deep-clones. Mutating state in React. JSON clone for Date/Map/circular. Object.freeze on nested tree — inner still mutable. Sort/reverse in place on shared array reference.' },
    ]},
    senior('**Immer** uses Proxy drafts — ergonomic immutable updates in Redux Toolkit. **Persistent data structures** (Immutable.js) trade memory for sharing — less common now. **structuredClone** cannot clone functions or DOM nodes. Know **slice vs splice** — splice mutates. **Object.freeze** + **seal** + **preventExtensions** levels. Performance: shallow spread cheaper than deep clone every render — update only changed paths.', [['Shallow alias', 'Nested mutation bug', 'React stale UI if mutate'], ['structuredClone vs JSON', 'Date Map circular', 'When each fails'], ['Immer', 'Draft ergonomics', 'Redux Toolkit default']], 'Says spread deep clones. Mutates array with sort() on state prop. Unaware structuredClone vs JSON differences.'),
  ],
  interviewTakeaways: ['Spread/Object.assign shallow — nested still shared.', 'structuredClone for deep copy including Date, Map, cycles.', 'JSON clone loses types and functions.', 'Immutable update: copy path, replace root reference.', '60s: Shallow vs deep. React reference equality. structuredClone limits. Immer pattern.'],
  commonPitfalls: ['Weak: "const state means immutable." Strong: "const locks binding; nested objects still mutable — copy on update."', 'Weak: "JSON.stringify clone is enough." Strong: "Loses undefined, functions, Date; no cycles — use structuredClone."', 'Strong: "Show b.nested mutation affecting a after shallow spread."'],
  relatedTopicIds: ['javascript-08-arrays-and-typed-arrays', 'javascript-08-collection-performance', 'javascript-08-collections-vs-csharp'],
  jsTsCorrelations: [{ language: 'typescript', concept: 'Readonly', note: 'TS Readonly<T> and readonly modifiers are compile-time only — run time still mutable without freeze.', futureTopicSlug: 'typescript/object-types/readonly' }, { language: 'typescript', concept: 'record types', note: 'C# record with with expression for non-destructive update; JS uses spread or Immer.', futureTopicSlug: 'csharp/types/records' }],
  officialSources: [{ title: 'MDN — structuredClone', url: 'https://developer.mozilla.org/en-US/docs/Web/API/structuredClone' }, { title: 'javascript.info — Object copying', url: 'https://javascript.info/object-copy' }],
  animationHint: 'stack-heap',
});

writeTopic(`${m08}/topics/collections-vs-csharp.json`, {
  id: 'javascript-08-collections-vs-csharp',
  slug: 'collections-vs-csharp',
  title: 'JavaScript collections versus C# List and Dictionary',
  moduleId: 'javascript-08-collections-and-iterators',
  order: 7,
  hook: 'C# collections are generic, strongly typed, and live on the CLR heap with predictable semantics. JavaScript Array, Map, and Set are dynamic, duck-typed, and power the same patterns — but with holes, SameValueZero, and prototype methods instead of LINQ extension methods.',
  sections: [
    { heading: 'What is this?', blocks: [
      { type: 'prose', text: '**Array** ≈ **List<T>** (dynamic) but untyped and sparse-capable. **Map** ≈ **Dictionary<TKey,TValue>**. **Set** ≈ **HashSet<T>**. **WeakMap** ≈ **ConditionalWeakTable**. JS has no **List<T>** separate from Array. LINQ lives on **IEnumerable**; JS uses **Array.prototype** methods and iterables. Index access on JS Array is always number-coerced string key.' },
      { type: 'glossary', title: 'Key terms', entries: [
        { term: 'List<T>', longForm: 'C# List', plainDefinition: 'Dynamic array with typed elements and Capacity.', example: 'var list = new List<int> { 1, 2 };' },
        { term: 'Dictionary', longForm: 'C# Dictionary', plainDefinition: 'Hash map with typed keys — throws on duplicate Add.', example: 'dict["key"] = 1;' },
        { term: 'LINQ', longForm: 'Language Integrated Query', plainDefinition: 'C# deferred/eager query operators on IEnumerable.', example: 'items.Where(x => x > 0).Select(x => x * 2)' },
        { term: 'Array methods', longForm: 'Array prototype methods', plainDefinition: 'map, filter, reduce — eager on JS Array.', example: 'arr.filter(x => x > 0).map(x => x * 2)' },
      ]},
    ]},
    { heading: 'Why does it matter?', blocks: [
      { type: 'prose', text: 'Developers switching stacks reach for familiar patterns — knowing Map vs Dictionary and when JS Array holes matter prevents porting bugs. LINQ deferred execution differs from chained JS array methods which are eager.' },
      { type: 'callout', variant: 'tip', title: 'Translation cheat sheet', body: 'List → Array. Dictionary → Map. HashSet → Set. foreach → for...of. LINQ Where → filter. Select → map.' },
    ]},
    { heading: 'How it works step by step', blocks: [
      { type: 'steps', title: 'Porting mental map', items: [
        { title: 'Typed storage', body: 'C# compiler enforces T; JS validate at boundary.' },
        { title: 'Key types', body: 'Dictionary needs GetHashCode; Map uses SameValueZero.' },
        { title: 'Queries', body: 'LINQ deferred until GetEnumerator; JS filter/map build new array immediately.' },
        { title: 'Nullability', body: 'C# NRT on references; JS null/undefined both possible.' },
      ]},
      { type: 'diagram', diagram: { type: 'mermaid', title: 'JS to C# mapping', source: 'flowchart LR\n  A[JS Array] --> L[C# List]\n  M[JS Map] --> D[C# Dictionary]\n  S[JS Set] --> H[C# HashSet]\n  F[for...of] --> FE[foreach]\n  FM[filter map] --> LQ[LINQ Where Select]' }},
    ]},
    { heading: 'Code walkthrough', blocks: [
      { type: 'snippet', snippet: { language: 'javascript', label: 'JS filter/map chain', code: 'const orders = [\n  { id: 1, total: 50, status: "paid" },\n  { id: 2, total: 0, status: "pending" },\n];\n\nconst paidIds = orders\n  .filter(o => o.status === "paid" && o.total > 0)\n  .map(o => o.id);\n\nconsole.log(paidIds); // [1]', explanation: 'Eager — each method allocates new array. Equivalent to LINQ Where then Select.ToList().' }},
      { type: 'snippet', snippet: { language: 'csharp', label: 'C# LINQ equivalent', code: '// var paidIds = orders\n//   .Where(o => o.Status == "paid" && o.Total > 0)\n//   .Select(o => o.Id)\n//   .ToList();', explanation: 'LINQ can defer until enumeration unless ToList materializes — JS chain always materializes intermediate arrays unless using iterators/generators.' }},
      { type: 'snippet', snippet: { language: 'javascript', label: 'Map vs Dictionary keys', code: 'const map = new Map();\nmap.set(NaN, "not a number key works");\nconsole.log(map.get(NaN));\n\n// C# Dictionary<double,string> throws on NaN keys', explanation: 'JS Map accepts NaN; C# Dictionary rejects NaN as key — porting gotcha.' }},
      { type: 'snippet', snippet: { language: 'javascript', label: 'Grouping pattern', code: 'function groupBy(items, keyFn) {\n  return items.reduce((acc, item) => {\n    const key = keyFn(item);\n    (acc[key] ??= []).push(item);\n    return acc;\n  }, {});\n}\n\n// C#: items.GroupBy(x => x.Category)', explanation: 'reduce builds record of arrays — common JS pattern; C# GroupBy returns IGrouping sequence.' }},
    ]},
    { heading: 'Compare with C# and TypeScript', blocks: [
      { type: 'comparisonTable', title: 'Side-by-side reference', headers: ['Need', 'JavaScript', 'C#'], rows: [
        ['Dynamic list', 'Array', 'List<T>'],
        ['Hash map', 'Map', 'Dictionary<K,V>'],
        ['Unique set', 'Set', 'HashSet<T>'],
        ['Weak attach', 'WeakMap', 'ConditionalWeakTable'],
        ['Query pipeline', 'filter/map/reduce', 'LINQ'],
        ['Sort in place', 'arr.sort()', 'List.Sort()'],
        ['Immutable update', 'spread / Immer', 'record with'],
      ]},
    ]},
    { heading: 'Common mistakes', blocks: [
      { type: 'callout', variant: 'warning', title: 'Pitfalls to avoid', body: 'Assuming JS Array same as fixed C# array T[n]. Using object {} as Dictionary with object keys. Expecting LINQ deferred semantics from filter(). Ignoring NaN key difference. Not validating types after JSON.parse when porting C# DTO code.' },
    ]},
    senior('**IEnumerable deferral** vs **JS eager arrays** — use generators or iterator helpers for lazy LINQ-like chains. **Span<T>** and **Memory<T>** have no JS equivalent — typed arrays closest for binary. **Concurrent collections** in .NET vs single-threaded JS — use Workers for parallel. **Equality**: C# IEquatable vs JS SameValueZero. Know **Array.sort** mutates; LINQ OrderBy returns new sequence.', [['Eager vs lazy', 'filter maps new array', 'Generator for deferral'], ['Typing', 'JSON boundary validation', 'C# compile vs JS runtime'], ['Key equality', 'NaN in Map', 'Dictionary NaN throw']], 'Maps List to fixed array T[n]. Cannot translate GroupBy to reduce. Says LINQ and filter both lazy.'),
  ],
  interviewTakeaways: ['Array ≈ List — untyped, sparse possible, prototype methods.', 'Map ≈ Dictionary; Set ≈ HashSet; WeakMap ≈ ConditionalWeakTable.', 'filter/map eager; LINQ often deferred until enumerate.', 'for...of ≈ foreach; SameValueZero vs GetHashCode.', '60s: Translation table. NaN Map key. Validate JSON. Lazy JS via generators. sort mutates.'],
  commonPitfalls: ['Weak: "JavaScript Array is fixed size." Strong: "Dynamic length property; sparse holes unlike List<T> dense."', 'Weak: "filter is lazy like LINQ." Strong: "Array filter eager; use generator for lazy pipeline."', 'Strong: "NaN as Map key works; C# Dictionary throws — porting detail."'],
  relatedTopicIds: ['javascript-08-map-set-weak-collections', 'javascript-08-collection-performance', 'javascript-08-arrays-and-typed-arrays'],
  jsTsCorrelations: [{ language: 'typescript', concept: 'typed arrays', note: 'TypeScript Array<T> adds compile checks; run time still JS Array.', futureTopicSlug: 'typescript/builtins/array' }, { language: 'typescript', concept: 'LINQ', note: 'C# LINQ deferred execution — JavaScript filter/map create intermediate arrays eagerly unless using iterables.', futureTopicSlug: 'csharp/linq/deferred-execution' }],
  officialSources: [{ title: 'MDN — Indexed collections', url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects#indexed_collections' }, { title: 'javascript.info — Map and Set', url: 'https://javascript.info/map-set' }],
  animationHint: 'compare',
});

// Mindmaps and interviews
writeJson('07-null-undefined-optional/mindmap.json', {
  moduleId: 'javascript-07-null-undefined-optional',
  title: 'null, undefined, and optional access — concept map',
  intro: 'Two absence values, optional chaining, nullish coalescing, defensive guards at JSON boundaries, and how TypeScript strictNullChecks and C# NRT compare to run-time JavaScript.',
  overviewDiagram: {
    type: 'mermaid',
    title: 'Null safety learning path',
    source: 'flowchart LR\n  A[null vs undefined] --> B[Optional chaining ?.]\n  B --> C[Nullish coalescing ??]\n  C --> D[Defensive guards]\n  D --> E[TS strictNullChecks vs JS runtime]',
  },
  conceptCards: [
    { id: 'card-null-vs-undefined', title: 'null vs undefined', summary: 'undefined = unset default; null = intentional empty. typeof null is object. JSON omits undefined, keeps null.', example: 'value == null catches both', topicSlug: 'null-vs-undefined' },
    { id: 'card-optional-chaining', title: 'Optional chaining', summary: '?. short-circuits on nullish base — property, index, or call. Does not validate shape.', example: 'user?.profile?.email', topicSlug: 'optional-chaining' },
    { id: 'card-nullish-coalescing', title: '?? vs ||', summary: '?? only null/undefined; || any falsy. Preserves 0 and empty string.', example: 'port ?? 3000 keeps port 0', topicSlug: 'nullish-coalescing' },
    { id: 'card-defensive', title: 'Guard clauses', summary: 'Validate JSON.parse at boundary. ?. for optional nested only. Fail fast with typed errors.', example: 'if (order == null) return', topicSlug: 'defensive-coding-patterns' },
    { id: 'card-nrt', title: 'Compile vs runtime', summary: 'TS/C# catch null at compile; JS needs runtime guards. Types erase — JSON never saw compiler.', example: 'requireString(raw.id, "id")', topicSlug: 'null-safety-vs-typescript-nrt' },
  ],
  revisionDiagram: {
    type: 'mermaid',
    title: 'Null and optional access revision',
    source: 'mindmap\n  root((Null Safety))\n    null undefined\n      typeof null object\n      JSON null vs omit\n      default params undefined only\n    Optional access\n      dot chain ?.\n      bracket ?.\n      call ?.\n    Defaults\n      ?? nullish\n      || falsy trap\n      ??= assignment\n    Defense\n      guard clauses\n      JSON validation\n      fail fast TypeError\n    Static comparison\n      TS strictNullChecks\n      C# NRT warnings\n      runtime still JS',
  },
});

writeJson('07-null-undefined-optional/interview.json', {
  moduleId: 'javascript-07-null-undefined-optional',
  title: 'null, undefined, and optional access interview drills',
  items: [
    { question: 'What is the difference between null and undefined?', answer: 'undefined is the default for uninitialized variables, missing properties, and functions with no return. null is an explicit assignment meaning intentionally empty. typeof null is "object" (legacy). null == undefined is true; === is false. JSON.stringify omits undefined keys but keeps null.', followUps: ['When is x == null idiomatic?', 'How do default parameters treat null vs undefined?'], sixtySeconds: 'undefined unset; null intentional. typeof null object bug. == pairs them; === not. JSON drops undefined.' },
    { question: 'How does optional chaining differ from logical AND guards?', answer: '?. short-circuits when base is null or undefined, returning undefined without TypeError. It works for property, bracket, and call access. && stops on any falsy base including 0 and "". ?. does not validate data shape — typos still return undefined silently.', followUps: ['Does ?. work on 0?', 'When should you not use ?.?'], sixtySeconds: '?. nullish only. && any falsy. Short-circuit safe navigation. Not schema validation.' },
    { question: 'When do you use ?? instead of ||?', answer: '?? replaces only null or undefined. || replaces any falsy value including 0, empty string, false, and NaN. Use ?? for numeric and string defaults where 0 or "" are valid. Mixing ?? and || without parentheses is SyntaxError.', followUps: ['What does count || 10 do when count is 0?', 'What is ??=?'], sixtySeconds: '?? nullish only. || all falsy. port 0 example. Parens when mixing.' },
    { question: 'How do you defend against bad JSON at an API boundary?', answer: 'JSON.parse returns any shape — TypeScript types erase at run time. Validate required fields with typeof and explicit null checks; throw TypeError or domain ValidationError. Use guard clauses for early exit. Apply ?. and ?? only after shape is proven for optional nested fields.', followUps: ['Why is TS not enough alone?', 'What is fail fast?'], sixtySeconds: 'Parse then validate. Guards at edge. TS erased. ?. optional only after required proven.' },
    { question: 'Compare JavaScript null safety to TypeScript strictNullChecks and C# NRT.', answer: 'JavaScript enforces nothing at compile time — null and undefined exist at run time. TypeScript strictNullChecks adds compile warnings; emitted JS has no checks unless you write them. C# NRT warns on nullable references. All three need runtime validation on external JSON. Avoid TS non-null assertion ! without proof.', followUps: ['What does type erasure mean?', 'What is C# null-forgiving !?'], sixtySeconds: 'JS runtime only. TS/C# compile. JSON validate always. ! assertion dangerous. Three layers: compile ?. ?? guards.' },
  ],
});

writeJson(`${m08}/mindmap.json`, {
  moduleId: 'javascript-08-collections-and-iterators',
  title: 'Collections, iterators, and generators — concept map',
  intro: 'Arrays and typed arrays, Map/Set/Weak collections, iterator protocol, generators, performance tradeoffs, immutability patterns, and mapping to C# List/Dictionary/LINQ.',
  overviewDiagram: {
    type: 'mermaid',
    title: 'Collections learning path',
    source: 'flowchart LR\n  A[Array and typed arrays] --> B[Map Set WeakMap]\n  B --> C[Iterators for-of]\n  C --> D[Generators yield]\n  D --> E[Performance choices]\n  E --> F[Immutability]\n  F --> G[vs C# collections]',
  },
  conceptCards: [
    { id: 'card-arrays', title: 'Array and typed arrays', summary: 'Dynamic Array vs ArrayBuffer views. Sparse holes vs undefined. Array-like needs Array.from.', example: 'Int32Array over shared buffer', topicSlug: 'arrays-and-typed-arrays' },
    { id: 'card-map-set', title: 'Map and Set', summary: 'Any key type; SameValueZero; insertion order. WeakMap for GC-friendly metadata.', example: 'cache.set(objKey, meta)', topicSlug: 'map-set-weak-collections' },
    { id: 'card-iterators', title: 'Iterator protocol', summary: 'next() value/done. Symbol.iterator makes iterable. for...of not for...in on arrays.', example: 'for (const v of map)', topicSlug: 'iterators-and-for-of' },
    { id: 'card-generators', title: 'Generators', summary: 'function* pauses at yield. Lazy pagination. Do not spread infinite sequences.', example: 'async function* pages()', topicSlug: 'generators-and-yield' },
    { id: 'card-perf', title: 'Performance', summary: 'Set.has vs Array.includes. Map for dynamic keys. Object for JSON DTO.', example: 'seen.has(id)', topicSlug: 'collection-performance' },
    { id: 'card-immutable', title: 'Immutability', summary: 'Spread shallow. structuredClone deep. React needs new reference.', example: '{ ...state, patch }', topicSlug: 'immutable-patterns' },
    { id: 'card-csharp', title: 'vs C#', summary: 'List→Array, Dictionary→Map, foreach→for...of. filter/map eager vs LINQ defer.', example: 'Map NaN keys work', topicSlug: 'collections-vs-csharp' },
  ],
  revisionDiagram: {
    type: 'mermaid',
    title: 'Collections revision map',
    source: 'mindmap\n  root((Collections))\n    Array\n      sparse holes\n      typed ArrayBuffer\n      array-like\n    Map Set\n      SameValueZero\n      WeakMap GC\n      object key collision\n    Iteration\n      Symbol.iterator\n      for-of vs for-in\n      spread consumes\n    Generators\n      yield lazy\n      async for-await\n    Performance\n      Set dedupe\n      Map cache\n    Immutable\n      spread shallow\n      structuredClone\n    C# map\n      List Dictionary\n      LINQ eager JS',
  },
});

writeJson(`${m08}/interview.json`, {
  moduleId: 'javascript-08-collections-and-iterators',
  title: 'Collections, iterators, and generators interview drills',
  items: [
    { question: 'Explain sparse arrays and how holes differ from undefined elements.', answer: 'A hole is a missing index — 1 in sparse has no property at index 1. forEach skips holes. Spread converts holes to undefined. Setting length truncates. Different from explicit undefined element which is an own property.', followUps: ['What does 1 in sparse return?', 'How does map treat holes?'], sixtySeconds: 'Hole no property; undefined is value. forEach skips holes. Spread fills undefined. Array length truncate.' },
    { question: 'When would you choose Map over a plain object?', answer: 'When keys are dynamic, non-string (objects, functions), frequent add/delete, or you need NaN keys and reliable size. Objects optimize fixed-shape records and JSON serialization. Map preserves insertion order and avoids object-key string coercion collisions.', followUps: ['Why does obj[{}] collide?', 'Does Map JSON.stringify?'], sixtySeconds: 'Map dynamic any key. Object fixed DTO. Object keys stringify. Map NaN ok. JSON Map empty.' },
    { question: 'Describe the iterator protocol and how for...of uses it.', answer: 'Iterator has next() returning { value, done }. Iterable has Symbol.iterator returning iterator. for...of gets iterator and loops until done. Spread and Array.from use same protocol. Plain objects are not iterable unless Symbol.iterator added.', followUps: ['for...in vs for...of on arrays?', 'What is Symbol.iterator?'], sixtySeconds: 'next value done. Symbol.iterator on iterable. for-of not for-in. Spread needs iterable.' },
    { question: 'How do generators enable lazy sequences?', answer: 'function* returns generator paused at yield. next() resumes until next yield or return. Memory bounded for paginated or infinite streams if consumer breaks early. Spread materializes — avoid on large/infinite. C# yield return is analogous.', followUps: ['Does calling generator run body?', 'What is yield*?'], sixtySeconds: 'function* lazy. next drives. yield pause. no spread infinite. C# yield return parallel.' },
    { question: 'Compare shallow copy, JSON clone, and structuredClone.', answer: 'Spread copies one level — nested objects alias. JSON.parse(JSON.stringify) drops undefined/functions, mangles Date, fails on cycles. structuredClone deep copies structured data including Date, Map, circular refs — not functions or DOM nodes.', followUps: ['Why React needs new reference?', 'Does const freeze nested?'], sixtySeconds: 'Spread shallow alias. JSON limits. structuredClone deep cycles. const not deep freeze.' },
    { question: 'Map JavaScript collections to C# equivalents and one key difference.', answer: 'Array to List, Map to Dictionary, Set to HashSet, WeakMap to ConditionalWeakTable, for...of to foreach, filter/map to LINQ Where/Select but JS eager. Dictionary throws on NaN keys; Map accepts NaN via SameValueZero. JS Array can be sparse and untyped.', followUps: ['Is LINQ filter lazy?', 'Does Array.sort mutate?'], sixtySeconds: 'List Array. Dictionary Map. HashSet Set. LINQ deferred filter eager JS. NaN Map ok. sort mutates.' },
  ],
});

console.log('Wrote module 08 topics 4-7 + mindmaps/interviews');
