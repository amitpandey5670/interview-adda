import { snippet } from './build-topic.mjs';

export const m13Topics = {
  'promise-and-async-return-types': {
    hook:
      'An `async` function always returns `Promise<T>` — even when you write `return 42`. TypeScript unwraps the inner type for you, but callers still await. Senior interviews probe PromiseLike vs Promise, void returns, and why `async function` return type annotations matter in public APIs.',
    whatIs:
      '**Promise<T>** is the typed wrapper for a value available later. **`async function`** syntax always returns a Promise: `async function f(): Promise<number>` is equivalent to returning `Promise.resolve(value)`. TypeScript infers `Promise<T>` from the awaited expression inside `async` bodies. **`PromiseLike<T>`** is the minimal `{ then }` interface — `await` accepts both. Return type annotations on async functions are part of your public contract: changing `Promise<User>` to `Promise<User | null>` is a breaking API change.',
    glossary: [
      {
        term: 'Promise',
        longForm: 'Promise<T>',
        plainDefinition: 'Represents a value T available asynchronously — pending, fulfilled, or rejected.',
        example: 'const p: Promise<string> = fetch(url).then(r => r.text());',
      },
      {
        term: 'async function',
        longForm: 'async function return type',
        plainDefinition: 'Always returns Promise; await unwraps inside the function body only.',
        example: 'async function load(): Promise<User> { return await fetchUser(); }',
      },
      {
        term: 'PromiseLike',
        longForm: 'PromiseLike<T>',
        plainDefinition: 'Minimal thenable interface — await works on PromiseLike, not only native Promise.',
        example: 'await { then: (res) => res(1) };',
      },
      {
        term: 'type erasure',
        longForm: 'compile-time only',
        plainDefinition: 'Promise<T> exists only for the checker — emitted JS has untyped Promise.',
        example: 'tsc emits async/await, not generic metadata.',
      },
    ],
    whyMatters:
      'Mis-typing async return types ships silent bugs: `async function get(): User` without Promise confuses callers who forget to await. Libraries expose `Promise<T>` in `.d.ts` files — wrong T breaks consumer inference. C# `async Task<T>` is similar but Task carries more runtime state. In TS, `void` async functions return `Promise<void>` — callers must still await for ordering, not for a value.',
    tipTitle: 'Interview trap: inferred vs explicit return',
    tipBody:
      'async function f() { return 1; } infers Promise<number>. Adding explicit Promise<string> when body returns number is a compile error — the annotation must match what you actually return (after Promise wrapping).',
    steps: [
      { title: 'Declare async function', body: 'TypeScript wraps the return type in Promise automatically.' },
      { title: 'Annotate public APIs', body: 'Explicit Promise<T> on exported functions documents the contract.' },
      { title: 'Await inside, Promise outside', body: 'Callers receive Promise<T>; only inside async body is T unwrapped.' },
      { title: 'Handle PromiseLike', body: 'Third-party thenables may not be instanceof Promise — await still works.' },
    ],
    diagramTitle: 'async return type flow',
    diagram:
      'flowchart LR\n  SRC["async function body returns T"] --> WRAP["Compiler types as Promise<T>"]\n  WRAP --> CALLER["Caller awaits → T"]\n  WRAP --> EMIT["Emit: async/await JS"]',
    snippets: [
      snippet(
        'typescript',
        'Inferred Promise return from async',
        'async function fetchCount(): Promise<number> {\n  const res = await fetch("/api/count");\n  const data: unknown = await res.json();\n  if (typeof data !== "object" || data === null || typeof (data as { n?: unknown }).n !== "number") {\n    throw new Error("invalid count");\n  }\n  return (data as { n: number }).n;\n}\n\n// Caller must await:\nconst n = await fetchCount(); // n: number',
        'Line 1: explicit Promise<number> documents API. Lines 3–6: narrow unknown JSON before return. Line 10: await unwraps Promise to number.',
      ),
      snippet(
        'typescript',
        'Promise<T> without async — manual construction',
        'function delay<T>(ms: number, value: T): Promise<T> {\n  return new Promise((resolve) => setTimeout(() => resolve(value), ms));\n}\n\nfunction loadUser(id: string): Promise<User> {\n  return fetch(`/users/${id}`)\n    .then((r) => r.json())\n    .then((raw: unknown) => parseUser(raw));\n}',
        'Line 1: generic Promise factory. Lines 6–8: then-chain returns Promise<User> — no async keyword needed. Prefer async/await for readability.',
      ),
      snippet(
        'typescript',
        'Promise<void> and fire-and-forget ordering',
        'async function logAudit(event: string): Promise<void> {\n  await fetch("/audit", { method: "POST", body: event });\n}\n\nasync function handleOrder() {\n  await saveOrder();\n  await logAudit("order-saved"); // await for ordering, ignore void result\n}',
        'Line 1: Promise<void> — no useful return value but still async I/O. Line 7: await ensures audit runs after save, not in parallel by accident.',
      ),
      snippet(
        'typescript',
        'Failure mode — forgetting Promise in public type',
        'interface Api {\n  getUser(id: string): User; // WRONG: async impl returns Promise\n}\n\nclass Client implements Api {\n  async getUser(id: string) {\n    return await fetchUser(id); // implements Promise<User>, not User\n  }\n}',
        'Line 2: interface says User but async returns Promise<User>. Fix: getUser(id: string): Promise<User>. Common in hand-written .d.ts files.',
      ),
    ],
    compareRows: [
      ['Return type of async', 'Promise<T> (inferred or explicit)', 'Untyped Promise', 'Task<T>'],
      ['Runtime type info', 'Erased — no T at run time', 'N/A', 'Task<T> retains T via generics'],
      ['void async', 'Promise<void>', 'undefined resolved', 'Task (no result)'],
      ['Thenable interop', 'PromiseLike<T> accepted by await', 'Any thenable', 'Task / ValueTask'],
    ],
    mistakesBody:
      'Typing async return as T instead of Promise<T> in interfaces. Returning non-Promise from async (always wrapped). Using .then without return type on callbacks — inference breaks on complex chains.',
    seniorProse:
      'Senior answers mention structural typing: Promise<A> is not assignable to Promise<B> unless A extends B. Contra-variance on Promise parameters is a common follow-up. For libraries, export `Promise<T>` explicitly and use `Awaited<ReturnType<typeof fn>>` for wrapper utilities. Compare to C#: Task<T>.Result blocks; TS has no sync unwrap. Use `satisfies` on config objects that hold async factories.',
    seniorRows: [
      ['Explicit Promise<T> on exports', 'Stable public API, clear .d.ts', 'Verbose on trivial helpers'],
      ['Inferred async return', 'Less boilerplate', 'Refactors can widen unexpectedly'],
      ['PromiseLike in generics', 'Interop with legacy libs', 'Harder to reason about errors'],
    ],
    seniorWarning:
      'Saying async returns T directly. Not knowing Promise<void> still must be awaited for ordering. Cannot explain difference between Promise and Task at runtime.',
    interviewTakeaways: [
      'async functions always return Promise<T> — annotation must say Promise, not bare T.',
      'PromiseLike<T> works with await — not only native Promise.',
      'Promise<void> means no value, not "skip await".',
      '60s: async wraps return in Promise. Explicit Promise<T> on public APIs. Await unwraps inside body only. C# Task<T> similar but has runtime metadata; TS types erase.',
      'Follow-up: contravariance on Promise callback parameters.',
    ],
    commonPitfalls: [
      'Weak: interface method returns User but implementation is async — should be Promise<User>.',
      'Weak: fire-and-forget async without void handling — unhandled rejection.',
      'Strong: "async always returns Promise. Annotate exports explicitly. Await for ordering even on Promise<void>. Compare Task<T> — no .Result in TS."',
    ],
    relatedTopicIds: [
      'typescript-13-awaited-and-async-utility',
      'typescript-13-async-error-typing',
      'typescript-12-conditional-types-basics',
    ],
    jsTsCorrelations: [
      {
        language: 'javascript',
        concept: 'Promise at runtime',
        note: 'JavaScript Promises have no generic T — TypeScript adds compile-time tracking only.',
        futureTopicSlug: 'javascript/13-promises-async-event-loop/promise-states-and-chaining',
      },
      {
        language: 'typescript',
        concept: 'C# Task<T>',
        note: 'C# Task<T> has runtime type; TS Promise<T> erases. Both require await at call site.',
        futureTopicSlug: 'csharp/async/task-and-async-await',
      },
    ],
    officialSources: [
      { title: 'TypeScript handbook — async', url: 'https://www.typescriptlang.org/docs/handbook/2/functions.html#async-functions' },
      { title: 'MDN — Promise', url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise' },
    ],
    animationHint: 'flow',
  },

  'awaited-and-async-utility': {
    hook:
      '`Awaited<T>` recursively unwraps Promise layers — `Awaited<Promise<Promise<string>>>` is `string`. Added in TS 4.5, it powers utility types for async wrappers and fixes nested-promise inference bugs in generic helpers.',
    whatIs:
      '**Awaited<T>** is a built-in conditional type that mirrors `await`: if T is `PromiseLike<U>`, result is `Awaited<U>`; otherwise T. It handles nested promises, unions, and non-thenables. Use it in generic utilities like `type Result = Awaited<ReturnType<typeof fetchData>>` instead of manual conditional types. It is the type-level counterpart of runtime `await` — essential for typing `Promise.all`, async middleware, and ORM query builders.',
    glossary: [
      {
        term: 'Awaited',
        longForm: 'Awaited<T>',
        plainDefinition: 'Built-in utility that unwraps PromiseLike layers recursively.',
        example: 'type T = Awaited<Promise<Promise<number>>>; // number',
      },
      {
        term: 'conditional type',
        longForm: 'T extends PromiseLike<infer U>',
        plainDefinition: 'Awaited is implemented with infer — extracts inner type from thenable.',
        example: 'See TS lib.es5.d.ts Awaited definition.',
      },
      {
        term: 'ReturnType',
        longForm: 'ReturnType with async',
        plainDefinition: 'ReturnType of async fn is Promise<T> — combine with Awaited for unwrapped T.',
        example: 'type V = Awaited<ReturnType<typeof load>>;',
      },
      {
        term: 'PromiseLike',
        longForm: 'minimal thenable',
        plainDefinition: 'Awaited unwraps any PromiseLike, not only native Promise.',
        example: 'Awaited<{ then: (cb: (v: number) => void) => void }>',
      },
    ],
    whyMatters:
      'Before Awaited, libraries hand-rolled `T extends Promise<infer U> ? U : T` — error-prone with nested promises. Generic `async function wrap<T>(fn: () => T)` needs Awaited to type the resolved value. Interviewers ask how Awaited differs from `T extends Promise<infer U> ? U : T` (depth and PromiseLike handling). C# has no direct equivalent — `Task<Task<T>>` is unusual; TS nested promises happen with careless async returns.',
    tipTitle: 'Interview trap: double-await typing',
    tipBody:
      'async function f() { return g(); } where g returns Promise<number> yields Promise<number>, not Promise<Promise<number>> — but generic wrappers can still nest promises; Awaited fixes the utility type.',
    steps: [
      { title: 'Start with wrapped type', body: 'Promise<T>, ReturnType<async fn>, or generic T that may be thenable.' },
      { title: 'Apply Awaited', body: 'Recursively peels PromiseLike until non-thenable.' },
      { title: 'Combine with ReturnType', body: 'Awaited<ReturnType<typeof fn>> gives resolved value type.' },
      { title: 'Use in generic constraints', body: 'async middleware: <T>(handler: () => T) => Awaited<T>' },
    ],
    diagramTitle: 'Awaited unwrapping',
    diagram:
      'flowchart TD\n  T["Awaited<T>"] --> Q{T extends PromiseLike?}\n  Q -->|yes infer U| R["Awaited<U>"]\n  Q -->|no| S["T"]\n  R --> Q',
    snippets: [
      snippet(
        'typescript',
        'Basic Awaited unwrapping',
        'type A = Awaited<Promise<string>>;           // string\ntype B = Awaited<Promise<Promise<number>>>; // number\ntype C = Awaited<string | Promise<boolean>>; // string | boolean\n\ntype Nested = Promise<Promise<{ id: string }>>;\ntype Flat = Awaited<Nested>; // { id: string }',
        'Lines 1–3: single and nested unwrap. Line 5: union — Awaited distributes only on promise branch.',
      ),
      snippet(
        'typescript',
        'Awaited with ReturnType for async functions',
        'async function loadConfig() {\n  return { timeout: 5000 };\n}\n\ntype ConfigPromise = ReturnType<typeof loadConfig>; // Promise<{ timeout: number }>\ntype Config = Awaited<ReturnType<typeof loadConfig>>; // { timeout: number }\n\nasync function withTimeout<T>(fn: () => T): Promise<Awaited<T>> {\n  return await fn();\n}',
        'Line 6: Awaited strips Promise from ReturnType. Line 8: generic helper returns flattened resolved type.',
      ),
      snippet(
        'typescript',
        'Typing Promise.all results with Awaited',
        'async function fetchUser() { return { id: "1" }; }\nasync function fetchPosts() { return [{ title: "a" }]; }\n\ntype Results = [\n  Awaited<ReturnType<typeof fetchUser>>,\n  Awaited<ReturnType<typeof fetchPosts>>,\n];\n\nconst [user, posts]: Results = await Promise.all([fetchUser(), fetchPosts()]);',
        'Lines 5–8: tuple of unwrapped types matches Promise.all destructuring.',
      ),
      snippet(
        'typescript',
        'Failure mode — manual unwrap misses nesting',
        'type Bad<T> = T extends Promise<infer U> ? U : T;\ntype StillNested = Bad<Promise<Promise<string>>>; // Promise<string>, not string\n\ntype Good<T> = Awaited<T>;\ntype Fixed = Good<Promise<Promise<string>>>; // string',
        'Lines 1–2: single-level infer leaves nested Promise. Lines 4–5: Awaited recurses correctly.',
      ),
    ],
    compareRows: [
      ['Nested unwrap', 'Awaited recurses', 'Manual await at runtime', 'Unwrap via await only'],
      ['Type-level', 'Compile time', 'N/A', 'No built-in equivalent'],
      ['PromiseLike', 'Handled', 'await handles', 'Task-specific'],
      ['Union with non-Promise', 'Preserves non-promise arm', 'Runtime branch', 'N/A'],
    ],
    mistakesBody:
      'Using T extends Promise<infer U> ? U : T instead of Awaited — fails on nested promises. Forgetting Awaited when typing generic async wrappers. Assuming ReturnType of async fn is T instead of Promise<T>.',
    seniorProse:
      'Read lib.d.ts: Awaited uses distributive conditional over PromiseLike. Pair with Parameters and ReturnType for full async function typing. In monorepos, Awaited appears in typed RPC clients (tRPC, TanStack Query inferred types). C# IAsyncEnumerable is unrelated — do not confuse with Awaited.',
    seniorRows: [
      ['Awaited<T>', 'Correct nested unwrap', 'Slightly opaque to juniors'],
      ['Manual infer', 'Educational', 'Breaks on depth > 1'],
      ['Explicit overloads', 'Maximum clarity', 'Does not scale with arity'],
    ],
    seniorWarning:
      'Cannot explain recursive unwrapping. Saying Awaited runs at runtime. Confusing with ReturnType alone on async functions.',
    interviewTakeaways: [
      'Awaited<T> recursively unwraps PromiseLike — use instead of hand-rolled infer.',
      'ReturnType<async fn> is Promise<T>; Awaited<ReturnType<...>> is T.',
      'Single-level `T extends Promise<infer U> ? U : T` fails on nested promises.',
      '60s: Awaited mirrors await at type level. TS 4.5+. Combine with ReturnType for async utilities. C# has no direct type-level unwrap.',
      'Follow-up: how is Awaited implemented with conditional types?',
    ],
    commonPitfalls: [
      'Weak: ReturnType<typeof asyncFn> used as resolved type without Awaited.',
      'Weak: single-level conditional type for nested Promise<Promise<T>>.',
      'Strong: "Awaited recurses PromiseLike. Use with ReturnType for async helpers. Replaces error-prone manual infer."',
    ],
    relatedTopicIds: [
      'typescript-13-promise-and-async-return-types',
      'typescript-12-conditional-types-basics',
      'typescript-10-parameters-returntype',
    ],
    jsTsCorrelations: [
      {
        language: 'javascript',
        concept: 'await runtime behavior',
        note: 'await unwraps thenables at runtime; Awaited models the same at compile time.',
        futureTopicSlug: 'javascript/13-promises-async-event-loop/async-await-syntax',
      },
      {
        language: 'typescript',
        concept: 'infer keyword',
        note: 'Awaited is built on conditional types with infer — same pattern as ReturnType.',
        futureTopicSlug: 'typescript/12-conditional-mapped-types/infer-keyword',
      },
    ],
    officialSources: [
      { title: 'TS 4.5 — Awaited types', url: 'https://www.typescriptlang.org/docs/handbook/release-notes/typescript-4-5.html#awaited-types-and-promise-unwrapping-utilities' },
    ],
    animationHint: 'flow',
  },

  'async-iterable-types': {
    hook:
      '**AsyncIterable<T>** and **AsyncGenerator<T>** power streaming data — paginated APIs, WebSocket batches, and Node.js readable streams. `for await...of` requires AsyncIterable; typing generators with `async function*` keeps yield types checked.',
    whatIs:
      '**AsyncIterable<T>** has `[Symbol.asyncIterator]()` returning AsyncIterator<T>. **AsyncGenerator<T, TReturn, TNext>** extends AsyncIterable and is produced by `async function*`. Use `for await (const chunk of stream)` to consume. TypeScript checks yield types in generators and lets you annotate `AsyncIterableIterator<T>`. Compare to sync Iterable — mixing them causes compile errors unless you wrap.',
    glossary: [
      {
        term: 'AsyncIterable',
        longForm: 'AsyncIterable<T>',
        plainDefinition: 'Object with async iterator — consumed with for await...of.',
        example: 'async function* gen(): AsyncGenerator<number> { yield 1; }',
      },
      {
        term: 'AsyncGenerator',
        longForm: 'async function*',
        plainDefinition: 'Async generator function — yields promises implicitly.',
        example: 'async function* pages() { yield await fetchPage(1); }',
      },
      {
        term: 'for await...of',
        longForm: 'async iteration',
        plainDefinition: 'Loops over AsyncIterable, awaiting each iteration result.',
        example: 'for await (const x of asyncGen()) { ... }',
      },
      {
        term: 'IAsyncEnumerable',
        longForm: 'C# async streams',
        plainDefinition: 'C# counterpart for async sequence consumption with await foreach.',
        example: 'await foreach (var item in stream)',
      },
    ],
    whyMatters:
      'Streaming reduces memory vs loading full arrays. ORMs and GraphQL subscriptions expose AsyncIterable. Node.js `Readable` can implement AsyncIterable. Mis-typing as Iterable<T> breaks for-await-of. C# IAsyncEnumerable<T> is the closest analog — both need async consumption.',
    tipTitle: 'Interview trap: Iterable vs AsyncIterable',
    tipBody:
      'for...of works on Iterable; for await...of requires AsyncIterable. Passing Iterable to for await is a compile error — wrap with async generator.',
    steps: [
      { title: 'Define async generator', body: 'async function* yields AsyncIterable values.' },
      { title: 'Annotate return type', body: 'AsyncGenerator<T> or AsyncIterable<T> on exported APIs.' },
      { title: 'Consume with for await', body: 'Each iteration awaits the next promise.' },
      { title: 'Clean up with break/return', body: 'Generator.return() closes iterators — important for resource cleanup.' },
    ],
    diagramTitle: 'Async iteration flow',
    diagram:
      'flowchart LR\n  GEN["async function*"] --> IT["AsyncIterator"]\n  IT --> LOOP["for await...of"]\n  LOOP --> BODY["await each T"]',
    snippets: [
      snippet(
        'typescript',
        'AsyncGenerator with typed yields',
        'async function* readLines(path: string): AsyncGenerator<string, void, void> {\n  const file = await open(path);\n  try {\n    for await (const line of file.readable) {\n      yield line.trim();\n    }\n  } finally {\n    await file.close();\n  }\n}\n\nfor await (const line of readLines("log.txt")) {\n  console.log(line);\n}',
        'Line 1: AsyncGenerator<string, void, void> — yield type, return type, next arg. Lines 4–6: nested async iteration. Line 11: consumer.',
      ),
      snippet(
        'typescript',
        'Paginated API as AsyncIterable',
        'interface Page<T> { items: T[]; nextCursor?: string; }\n\nasync function* fetchAll<T>(load: (cursor?: string) => Promise<Page<T>>): AsyncGenerator<T> {\n  let cursor: string | undefined;\n  do {\n    const page = await load(cursor);\n    for (const item of page.items) yield item;\n    cursor = page.nextCursor;\n  } while (cursor);\n}',
        'Lines 3–10: generic async generator flattens paginated API into stream of T.',
      ),
      snippet(
        'typescript',
        'Custom AsyncIterable implementation',
        'class TickStream implements AsyncIterable<number> {\n  constructor(private max: number) {}\n  async *[Symbol.asyncIterator](): AsyncIterator<number> {\n    for (let i = 0; i < this.max; i++) {\n      await delay(100);\n      yield i;\n    }\n  }\n}',
        'Line 1: class implements AsyncIterable. Line 3: Symbol.asyncIterator method required by protocol.',
      ),
      snippet(
        'typescript',
        'Failure mode — using Iterable where AsyncIterable required',
        'function* syncGen(): Iterable<number> { yield 1; }\n\nasync function consume() {\n  // for await (const x of syncGen()) { } // compile error\n  for (const x of syncGen()) { } // OK — sync loop\n}',
        'Line 4: for await requires AsyncIterable — sync generator fails type check.',
      ),
    ],
    compareRows: [
      ['Protocol', 'AsyncIterable<T>', 'Iterable<T>', 'IAsyncEnumerable<T>'],
      ['Loop syntax', 'for await...of', 'for...of', 'await foreach'],
      ['Producer', 'async function*', 'function*', 'async IAsyncEnumerable method'],
      ['Backpressure', 'Manual / streams API', 'N/A', 'Channels / IAsyncEnumerable'],
    ],
    mistakesBody:
      'Typing stream as Iterable<T>. Forgetting finally cleanup in async generators. Not handling generator.return() on early break.',
    seniorProse:
      'Node Readable.from and Web Streams ReadableStream are AsyncIterable in modern runtimes. RxJS Observables are not AsyncIterable without conversion. For frameworks, expose AsyncIterable<T> in public API for tree-shakeable streaming. Compare IAsyncEnumerable — C# compiler generates state machine; TS emits async generator functions.',
    seniorRows: [
      ['async function*', 'Native syntax, typed yields', 'Node version requirements'],
      ['Observable (RxJS)', 'Rich operators', 'Not built-in, bundle cost'],
      ['Manual AsyncIterable', 'Full control', 'Verbose protocol implementation'],
    ],
    seniorWarning:
      'Confusing Iterable with AsyncIterable. Cannot write typed async generator. Unaware of C# IAsyncEnumerable parallel.',
    interviewTakeaways: [
      'AsyncIterable consumed with for await...of — Iterable uses for...of.',
      'async function* returns AsyncGenerator<T> — yield types are checked.',
      'Paginated APIs map cleanly to async generators.',
      '60s: AsyncIterable has Symbol.asyncIterator. async function* for producers. C# IAsyncEnumerable + await foreach. Types erase — protocol is runtime.',
      'Follow-up: cleanup and break behavior in async generators.',
    ],
    commonPitfalls: [
      'Weak: Iterable return type on streaming API.',
      'Weak: loading full dataset into array instead of AsyncIterable.',
      'Strong: "AsyncGenerator for typed streams. for await consumes. IAsyncEnumerable is C# analog. Cleanup in finally."',
    ],
    relatedTopicIds: [
      'typescript-13-promise-and-async-return-types',
      'typescript-13-async-types-vs-csharp-task',
      'typescript-13-abort-signal-typing',
    ],
    jsTsCorrelations: [
      {
        language: 'javascript',
        concept: 'async iteration protocol',
        note: 'ES2018 async iteration — same runtime protocol TypeScript types.',
        futureTopicSlug: 'javascript/08-collections-and-iterators/generators-and-yield',
      },
      {
        language: 'typescript',
        concept: 'IAsyncEnumerable',
        note: 'C# await foreach over IAsyncEnumerable<T> mirrors for await over AsyncIterable.',
        futureTopicSlug: 'csharp/async/iasync-enumerable',
      },
    ],
    officialSources: [
      { title: 'TypeScript handbook — async iterators', url: 'https://www.typescriptlang.org/docs/handbook/release-notes/typescript-2-3.html#async-iteration' },
      { title: 'MDN — for await...of', url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/for-await...of' },
    ],
    animationHint: 'flow',
  },

  'abort-signal-typing': {
    hook:
      '**AbortSignal** and **AbortController** cancel fetch, axios, and custom async work. TypeScript types `signal?: AbortSignal` on RequestInit — senior interviews ask about typed cancellation, AbortSignal.any(), and propagating signals through async call chains.',
    whatIs:
      '**AbortController** owns an **AbortSignal**. Call `controller.abort(reason)` to fire cancellation. Pass `signal` to `fetch`, timers, or your own APIs. Type `options: { signal?: AbortSignal }` on async helpers. **`AbortSignal.timeout(ms)`** and **`AbortSignal.any(signals)`** (modern APIs) compose deadlines. Reason is `any` by default — narrow or brand for typed error handling.',
    glossary: [
      {
        term: 'AbortController',
        longForm: 'cancellation owner',
        plainDefinition: 'Creates and controls an AbortSignal — call abort() to cancel.',
        example: 'const c = new AbortController(); c.abort("timeout");',
      },
      {
        term: 'AbortSignal',
        longForm: 'cancellation token',
        plainDefinition: 'Read-only signal — aborted flag and abort event.',
        example: 'fetch(url, { signal: controller.signal });',
      },
      {
        term: 'CancellationToken',
        longForm: 'C# cancellation',
        plainDefinition: 'C# struct passed through async call chains — similar propagation model.',
        example: 'CancellationTokenSource.Cancel()',
      },
      {
        term: 'addEventListener abort',
        longForm: 'abort event',
        plainDefinition: 'Listen for abort to clean up resources in long-running tasks.',
        example: 'signal.addEventListener("abort", () => cleanup());',
      },
    ],
    whyMatters:
      'Without cancellation, navigated-away fetch requests waste bandwidth. Node tests need abort to avoid hanging. Typed signal parameters document cancellable APIs. Compare C# CancellationToken — both propagate through call stacks; TS relies on convention (passing signal in options).',
    tipTitle: 'Interview trap: abort vs promise rejection',
    tipBody:
      'abort() causes fetch to reject with AbortError — catch and check error.name === "AbortError" to distinguish from network failures.',
    steps: [
      { title: 'Create AbortController', body: 'One controller per cancellable operation scope.' },
      { title: 'Pass signal downstream', body: 'Thread signal through options to fetch and child calls.' },
      { title: 'Listen for abort', body: 'Register cleanup on signal abort event.' },
      { title: 'Handle AbortError', body: 'Catch and branch — cancellation is not always failure.' },
    ],
    diagramTitle: 'AbortSignal propagation',
    diagram:
      'flowchart TD\n  UI["User navigates away"] --> AC["AbortController.abort()"]\n  AC --> SIG["AbortSignal"]\n  SIG --> F["fetch"]\n  SIG --> T["timers / custom tasks"]\n  F --> R["AbortError rejection"]',
    snippets: [
      snippet(
        'typescript',
        'Typed fetch with AbortSignal',
        'interface FetchOptions {\n  signal?: AbortSignal;\n  timeoutMs?: number;\n}\n\nasync function getJson<T>(url: string, opts: FetchOptions = {}): Promise<T> {\n  const controller = new AbortController();\n  const timeout = opts.timeoutMs\n    ? setTimeout(() => controller.abort(new Error("timeout")), opts.timeoutMs)\n    : undefined;\n  const signal = opts.signal\n    ? AbortSignal.any([opts.signal, controller.signal])\n    : controller.signal;\n  try {\n    const res = await fetch(url, { signal });\n    return (await res.json()) as T;\n  } finally {\n    if (timeout) clearTimeout(timeout);\n  }\n}',
        'Lines 1–4: options type documents signal. Lines 11–12: AbortSignal.any composes parent + timeout. Line 14: fetch receives typed signal.',
      ),
      snippet(
        'typescript',
        'Cancellable async worker',
        'async function processBatch(\n  items: string[],\n  signal: AbortSignal,\n): Promise<void> {\n  for (const item of items) {\n    if (signal.aborted) throw signal.reason ?? new DOMException("Aborted", "AbortError");\n    await handleItem(item, { signal });\n  }\n}\n\nsignal.addEventListener("abort", () => console.log("cleanup queued"));',
        'Lines 5–6: cooperative cancellation check between items. Line 10: abort listener for cleanup.',
      ),
      snippet(
        'typescript',
        'React useEffect cleanup pattern',
        'useEffect(() => {\n  const controller = new AbortController();\n  void loadData({ signal: controller.signal });\n  return () => controller.abort();\n}, []);',
        'Lines 2–4: abort on unmount — standard pattern for cancellable effects.',
      ),
      snippet(
        'typescript',
        'Failure mode — ignoring AbortError',
        'try {\n  await fetch(url, { signal });\n} catch (e) {\n  console.error("Request failed", e); // logs AbortError as failure\n}\n\n// Fix:\nif (e instanceof DOMException && e.name === "AbortError") return;',
        'Lines 3–4: treat cancellation as success path when user navigated away.',
      ),
    ],
    compareRows: [
      ['API', 'AbortSignal / AbortController', 'Same (web standard)', 'CancellationToken'],
      ['Propagation', 'Manual via options', 'Manual', 'Parameter threading'],
      ['Typed reason', 'any — narrow yourself', 'any', 'Optional exception object'],
      ['Composition', 'AbortSignal.any / timeout', 'Same', 'CreateLinkedTokenSource'],
    ],
    mistakesBody:
      'Not passing signal to child fetches. Treating AbortError as server error in metrics. Creating one global AbortController for entire app.',
    seniorProse:
      'Libraries (axios, got) accept signal in config. For Node, AbortController is global since v15+. Senior design: every public async method accepts optional `{ signal }`. Link to C# CancellationToken.Register for cleanup callbacks.',
    seniorRows: [
      ['AbortSignal in options', 'Standard web pattern', 'Must thread manually'],
      ['RxJS takeUntil', 'Composable streams', 'Heavy dependency'],
      ['Boolean cancelled flag', 'Simple', 'Race-prone without events'],
    ],
    seniorWarning:
      'Never heard of AbortSignal. Cannot distinguish AbortError from network error. Compares poorly to CancellationToken propagation.',
    interviewTakeaways: [
      'AbortController.abort() fires signal — fetch rejects with AbortError.',
      'Type optional signal on cancellable async APIs.',
      'AbortSignal.any and timeout compose deadlines.',
      '60s: Web standard cancellation. Pass signal in options. Distinguish AbortError. C# CancellationToken similar threading model.',
      'Follow-up: cleanup on abort event vs cooperative polling.',
    ],
    commonPitfalls: [
      'Weak: no signal parameter on long-running async helper.',
      'Weak: logging AbortError as 500 in metrics.',
      'Strong: "AbortSignal on all public async APIs. AbortSignal.any for timeout. AbortError is expected on cancel."',
    ],
    relatedTopicIds: [
      'typescript-13-promise-and-async-return-types',
      'typescript-13-async-error-typing',
      'typescript-13-async-iterable-types',
    ],
    jsTsCorrelations: [
      {
        language: 'javascript',
        concept: 'AbortController',
        note: 'Runtime web API — TypeScript types RequestInit.signal and custom options.',
        futureTopicSlug: 'javascript/13-promises-async-event-loop/abort-controller-cancellation',
      },
      {
        language: 'typescript',
        concept: 'CancellationToken',
        note: 'C# passes CancellationToken through async methods — same manual propagation discipline.',
        futureTopicSlug: 'csharp/async/cancellation-token',
      },
    ],
    officialSources: [
      { title: 'MDN — AbortSignal', url: 'https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal' },
      { title: 'DOM spec — AbortController', url: 'https://dom.spec.whatwg.org/#interface-abortcontroller' },
    ],
    animationHint: 'flow',
    scenarioTag: 'high-concurrency',
  },

  'async-error-typing': {
    hook:
      'Promise rejections are untyped — `catch (e)` gives `unknown` in strict mode (or `any` legacy). Senior TypeScript engineers type Result patterns, narrow errors with `instanceof`, and avoid `catch (e: Error)` which is invalid.',
    whatIs:
      'Async functions throw/reject with any value — not only Error. TypeScript 4.4+ types `catch` clause variable as **unknown** with `useUnknownInCatchVariables`. Use **`instanceof Error`**, custom type guards, or **Result<T, E>** wrappers for typed errors. `Promise.reject("string")` is valid JS — handle with narrowing, not assumptions.',
    glossary: [
      {
        term: 'unknown in catch',
        longForm: 'useUnknownInCatchVariables',
        plainDefinition: 'catch (e) gives unknown — must narrow before accessing .message.',
        example: 'if (e instanceof Error) console.log(e.message);',
      },
      {
        term: 'Result type',
        longForm: 'Result<T, E>',
        plainDefinition: 'Discriminated union { ok: true, value } | { ok: false, error } — no throw.',
        example: 'type Result<T,E> = { ok: true; value: T } | { ok: false; error: E };',
      },
      {
        term: 'Promise rejection',
        longForm: 'rejection reason',
        plainDefinition: 'Any value passed to reject() — not guaranteed to be Error.',
        example: 'Promise.reject(404);',
      },
      {
        term: 'AggregateError',
        longForm: 'Promise.any failure',
        plainDefinition: 'Promise.any rejects with AggregateError containing all errors.',
        example: 'catch (e) { if (e instanceof AggregateError) ... }',
      },
    ],
    whyMatters:
      'Logging `e.message` without narrow crashes when e is string. APIs throwing plain objects break instanceof Error checks. C# catch (Exception ex) is typed but filters by type — TS needs manual guards. Result pattern makes errors explicit in return type.',
    tipTitle: 'Interview trap: catch (e: Error)',
    tipBody:
      'catch (e: Error) is a syntax error in TypeScript — catch variable type is always unknown or any, never a specific type annotation.',
    steps: [
      { title: 'Enable useUnknownInCatchVariables', body: 'Part of strict — catch e is unknown.' },
      { title: 'Narrow with instanceof', body: 'Error and custom error subclasses.' },
      { title: 'Use Result for expected errors', body: 'Return typed error union instead of throw for business cases.' },
      { title: 'Centralize error mapping', body: 'mapUnknownToAppError(e: unknown): AppError' },
    ],
    diagramTitle: 'Async error narrowing',
    diagram:
      'flowchart TD\n  REJ["Promise rejection"] --> C["catch (e: unknown)"]\n  C --> N{instanceof Error?}\n  N -->|yes| ERR["Typed Error handling"]\n  N -->|no| MAP["mapUnknownToAppError"]',
    snippets: [
      snippet(
        'typescript',
        'unknown catch with narrowing',
        'async function load(): Promise<string> {\n  try {\n    return await fetchText("/api");\n  } catch (e: unknown) {\n    if (e instanceof Error) {\n      throw new AppError("LOAD_FAILED", e.message, { cause: e });\n    }\n    throw new AppError("LOAD_FAILED", String(e));\n  }\n}',
        'Line 5: e is unknown. Lines 6–8: narrow Error for .message. Line 9: handle non-Error rejections.',
      ),
      snippet(
        'typescript',
        'Result type instead of throw',
        'type AppResult<T> =\n  | { ok: true; value: T }\n  | { ok: false; code: "NOT_FOUND" | "TIMEOUT"; message: string };\n\nasync function findUser(id: string): Promise<AppResult<User>> {\n  try {\n    const user = await repo.get(id);\n    if (!user) return { ok: false, code: "NOT_FOUND", message: id };\n    return { ok: true, value: user };\n  } catch {\n    return { ok: false, code: "TIMEOUT", message: "db timeout" };\n  }\n}',
        'Lines 1–3: discriminated union for errors. Caller must check ok — compiler enforces.',
      ),
      snippet(
        'typescript',
        'Custom error class guard',
        'class HttpError extends Error {\n  constructor(readonly status: number, message: string) {\n    super(message);\n  }\n}\n\nfunction isHttpError(e: unknown): e is HttpError {\n  return e instanceof HttpError;\n}',
        'Lines 6–8: type guard for domain-specific errors in catch blocks.',
      ),
      snippet(
        'typescript',
        'Failure mode — assuming Error in catch',
        'try {\n  await api();\n} catch (e: unknown) {\n  logger.error(e.message); // compile error: e is unknown\n  // Runtime if any: undefined if e is number\n}',
        'Line 4: must narrow before .message — classic strict mode fix.',
      ),
    ],
    compareRows: [
      ['catch variable', 'unknown (strict)', 'any value', 'Exception typed'],
      ['Typed business errors', 'Result union', 'Manual checks', 'Exception hierarchy'],
      ['rejection reason', 'any type', 'any', 'object'],
      ['Aggregate failures', 'AggregateError', 'AggregateError', 'AggregateException'],
    ],
    mistakesBody:
      'catch (e: Error) annotation. Accessing .message without narrow. Throwing strings — loses stack traces.',
    seniorProse:
      'neverthrow and fp-ts Either popular in FP teams. For HTTP clients, map status codes to typed errors at boundary. Sentry captureException accepts unknown — normalize first. Compare C#: filtered catch blocks are compile-time — TS uses type guards.',
    seniorRows: [
      ['Result<T,E> return', 'Errors in type signature', 'Callers must branch'],
      ['throw Error subclasses', 'Familiar, stack traces', 'Untyped until catch'],
      ['Error codes (string union)', 'Serializable APIs', 'Less context than Error'],
    ],
    seniorWarning:
      'Using catch (e: Error). Saying all rejections are Error. Cannot design Result type for API.',
    interviewTakeaways: [
      'catch (e) is unknown under useUnknownInCatchVariables — narrow before use.',
      'catch (e: Error) is invalid TypeScript syntax.',
      'Result discriminated unions type expected failures.',
      '60s: Rejections are any value. Narrow with instanceof. Result for business errors. C# catch is typed by exception type.',
      'Follow-up: AggregateError from Promise.any.',
    ],
    commonPitfalls: [
      'Weak: e.message in catch without narrow.',
      'Weak: Promise.reject("string") unhandled assumptions.',
      'Strong: "unknown in catch. instanceof + guards. Result for expected errors. mapUnknown at boundary."',
    ],
    relatedTopicIds: [
      'typescript-06-try-catch-and-unknown',
      'typescript-13-promise-and-async-return-types',
      'typescript-11-user-defined-type-guards',
    ],
    jsTsCorrelations: [
      {
        language: 'javascript',
        concept: 'throw any value',
        note: 'JS allows throw 42 — TypeScript unknown catch reflects this reality.',
        futureTopicSlug: 'javascript/06-errors-and-debugging/error-types-and-throwing',
      },
      {
        language: 'typescript',
        concept: 'Exception hierarchy',
        note: 'C# catch (IOException ex) filters by type — TS uses instanceof guards in catch body.',
        futureTopicSlug: 'csharp/errors/exception-handling',
      },
    ],
    officialSources: [
      { title: 'TS 4.4 — unknown in catch', url: 'https://www.typescriptlang.org/docs/handbook/release-notes/typescript-4-4.html#use-unknown-catch-variables' },
      { title: 'MDN — Promise rejection', url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/reject' },
    ],
    animationHint: 'flow',
  },

  'async-types-vs-csharp-task': {
    hook:
      'TypeScript Promise<T> and C# Task<T> look alike but differ sharply: TS types erase at runtime, Task has ConfigureAwait and cancellation built into BCL, and IAsyncEnumerable mirrors AsyncIterable. Senior interviews love this comparison.',
    whatIs:
      '**Promise<T>** is a language-integrated thenable with no sync blocking API. **Task<T>** is a CLR type with `.Result` (blocking — avoid), `await`, and `ConfigureAwait`. **AsyncIterable<T>** ↔ **IAsyncEnumerable<T>**. TS has no built-in cancellation token — use AbortSignal. C# `ValueTask<T>` optimizes allocations; TS has no equivalent type. Both compile async to state machines, but TS emits JS generators/callbacks.',
    glossary: [
      {
        term: 'Task',
        longForm: 'C# Task<T>',
        plainDefinition: 'CLR representation of async work — runtime type with continuation machinery.',
        example: 'async Task<User> LoadAsync()',
      },
      {
        term: 'ConfigureAwait',
        longForm: 'ConfigureAwait(false)',
        plainDefinition: 'C# library code avoids capturing UI sync context — no TS equivalent.',
        example: 'await repo.SaveAsync().ConfigureAwait(false);',
      },
      {
        term: 'type erasure',
        longForm: 'Promise<T> at runtime',
        plainDefinition: 'Promise generic T does not exist in emitted JavaScript.',
        example: 'typeof Promise<string> === "function" // no string metadata',
      },
      {
        term: 'IAsyncEnumerable',
        longForm: 'C# async streams',
        plainDefinition: 'Async sequence with await foreach — pairs with AsyncIterable.',
        example: 'await foreach (var x in Stream())',
      },
    ],
    whyMatters:
      'C# developers over-use patterns that do not translate (blocking .Result). TS developers underestimate Task runtime diagnostics. Cross-stack teams need shared vocabulary for cancellation, streaming, and error propagation.',
    tipTitle: 'Interview trap: blocking on Promise',
    tipBody:
      'There is no Promise.Result — blocking requires top-level await (modules) or deasync hacks. Never block the event loop waiting for Promise.',
    steps: [
      { title: 'Map Promise ↔ Task', body: 'Both represent future T; both use await at call site.' },
      { title: 'Cancellation', body: 'AbortSignal (TS) vs CancellationToken (C#).' },
      { title: 'Streaming', body: 'AsyncIterable vs IAsyncEnumerable.' },
      { title: 'Runtime types', body: 'Task<T> exists in CLR; Promise<T> erases in JS.' },
    ],
    diagramTitle: 'TS async vs C# Task',
    diagram:
      'flowchart LR\n  subgraph TS\n    P["Promise<T>"] --> AW1["await"]\n  end\n  subgraph CSharp\n    T["Task<T>"] --> AW2["await"]\n    T --> CA["ConfigureAwait"]\n  end',
    snippets: [
      snippet(
        'typescript',
        'Promise — no blocking unwrap',
        'async function loadUser(): Promise<User> {\n  return await db.find("1");\n}\n\n// Anti-pattern in Node — blocks event loop if sync wrapper used:\n// const deasync = require("deasync");\n// const user = deasync(loadUser)(); // avoid',
        'Line 1: only async await — no .Result. Line 6: comment warns against sync blocking.',
      ),
      snippet(
        'csharp',
        'C# Task with ConfigureAwait',
        'public async Task<User> LoadUserAsync(CancellationToken ct)\n{\n    return await _db.FindAsync("1", ct).ConfigureAwait(false);\n}',
        'Line 1: CancellationToken parameter. Line 3: ConfigureAwait(false) for library code.',
      ),
      snippet(
        'typescript',
        'AbortSignal as cancellation token',
        'async function loadUser(signal?: AbortSignal): Promise<User> {\n  if (signal?.aborted) throw new DOMException("Aborted", "AbortError");\n  return await fetchUser({ signal });\n}',
        'Line 1: optional AbortSignal mirrors CancellationToken parameter threading.',
      ),
      snippet(
        'typescript',
        'AsyncIterable vs IAsyncEnumerable sketch',
        '// TypeScript\nasync function* stream(): AsyncGenerator<number> {\n  yield 1;\n}\n\n// C# equivalent concept:\n// async IAsyncEnumerable<int> Stream() { yield return 1; }',
        'Side-by-side comment shows streaming API mapping across languages.',
      ),
    ],
    compareRows: [
      ['Future type', 'Promise<T> (erased)', 'Promise (untyped)', 'Task<T> (runtime generic)'],
      ['Cancellation', 'AbortSignal', 'AbortSignal', 'CancellationToken'],
      ['Async streams', 'AsyncIterable<T>', 'Same protocol', 'IAsyncEnumerable<T>'],
      ['Blocking get', 'No .Result — anti-pattern', 'N/A', '.Result / .Wait() dangerous'],
      ['Context', 'Single-threaded event loop', 'Same', 'SynchronizationContext'],
    ],
    mistakesBody:
      'C# devs trying Promise.Result. Ignoring ConfigureAwait equivalent concerns in UI libs (rare in TS). Assuming Task and Promise are identical at runtime.',
    seniorProse:
      'Node microservices: Promise.all for parallel I/O. ASP.NET: Task.WhenAll. ValueTask reduces allocations — in TS, reuse promises carefully or accept GC. Source generators in C# replace some TS conditional-type metaprogramming. For interviews, articulate type erasure vs CLR metadata.',
    seniorRows: [
      ['Promise + AbortSignal', 'Web standard, simple', 'Manual propagation'],
      ['Task + CancellationToken', 'Mature BCL integration', 'Heavier, blocking pitfalls'],
      ['Observable (either stack)', 'Rich composition', 'Different paradigm'],
    ],
    seniorWarning:
      'Says Promise and Task are identical. Proposes blocking on Promise. Cannot name AbortSignal vs CancellationToken.',
    interviewTakeaways: [
      'Promise<T> types erase; Task<T> has CLR runtime representation.',
      'No Promise.Result — always async await.',
      'AbortSignal ↔ CancellationToken; AsyncIterable ↔ IAsyncEnumerable.',
      '60s: Syntax similar, runtime different. TS single-threaded event loop. C# ConfigureAwait for UI. Both need explicit cancellation threading.',
      'Follow-up: ValueTask vs Promise allocation patterns.',
    ],
    commonPitfalls: [
      'Weak: "Task and Promise are the same thing."',
      'Weak: blocking event loop waiting for Promise.',
      'Strong: "Promise erases T. Task has runtime type. AbortSignal/CancellationToken. IAsyncEnumerable = AsyncIterable. No .Result in TS."',
    ],
    relatedTopicIds: [
      'typescript-13-promise-and-async-return-types',
      'typescript-13-async-iterable-types',
      'typescript-13-abort-signal-typing',
    ],
    jsTsCorrelations: [
      {
        language: 'javascript',
        concept: 'event loop async',
        note: 'JS Promise scheduling via microtasks — different from CLR thread pool.',
        futureTopicSlug: 'javascript/13-promises-async-event-loop/event-loop-microtasks',
      },
      {
        language: 'typescript',
        concept: 'Task and async/await',
        note: 'C# invented async/await pattern TypeScript adopted — implementation differs.',
        futureTopicSlug: 'csharp/async/task-async-await',
      },
    ],
    officialSources: [
      { title: 'Microsoft — Task-based async', url: 'https://learn.microsoft.com/en-us/dotnet/standard/asynchronous-programming-patterns/' },
      { title: 'TypeScript handbook — async', url: 'https://www.typescriptlang.org/docs/handbook/2/functions.html#async-functions' },
    ],
    animationHint: 'compare',
  },
};
