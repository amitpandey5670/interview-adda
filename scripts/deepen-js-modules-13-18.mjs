#!/usr/bin/env node
/**
 * Deepens generic JavaScript topics in modules 13–18 and fixes generic mindmaps.
 * Run: node scripts/deepen-js-modules-13-18.mjs
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const root = join(process.cwd(), 'data/javascript/modules');

function snippet(language, label, code, explanation) {
  return { language, label, code, explanation };
}

function buildTopic(meta) {
  const {
    id, slug, title, moduleId, order, hook, whatIs, glossary, whyMatters, whyCallout,
    steps, diagramTitle, diagramSource, snippets, compareTitle, compareHeaders, compareRows,
    mistakes, seniorProse, seniorTable, seniorWarning, interviewTakeaways, commonPitfalls,
    relatedTopicIds, jsTsCorrelations, officialSources, animationHint, scenarioTag,
  } = meta;

  const sections = [
    {
      heading: 'What is this?',
      blocks: [
        { type: 'prose', text: whatIs },
        { type: 'glossary', title: 'Key terms', entries: glossary },
      ],
    },
    {
      heading: 'Why does it matter?',
      blocks: [
        { type: 'prose', text: whyMatters },
        ...(whyCallout ? [{ type: 'callout', variant: whyCallout.variant || 'tip', title: whyCallout.title, body: whyCallout.body }] : []),
      ],
    },
    {
      heading: 'How it works step by step',
      blocks: [
        { type: 'steps', title: steps.title, items: steps.items },
        { type: 'diagram', diagram: { type: 'mermaid', title: diagramTitle, source: diagramSource } },
      ],
    },
    {
      heading: 'Code walkthrough',
      blocks: snippets.map((s) => ({ type: 'snippet', snippet: snippet(s.language, s.label, s.code, s.explanation) })),
    },
    {
      heading: 'Compare with C# and TypeScript',
      blocks: [{ type: 'comparisonTable', title: compareTitle, headers: compareHeaders, rows: compareRows }],
    },
    {
      heading: 'Common mistakes',
      blocks: [{ type: 'callout', variant: 'warning', title: 'Pitfalls to avoid', body: mistakes }],
    },
    {
      heading: 'Senior interview depth',
      blocks: [
        { type: 'prose', text: seniorProse },
        { type: 'comparisonTable', title: seniorTable.title, headers: seniorTable.headers, rows: seniorTable.rows },
        { type: 'callout', variant: 'warning', title: 'What gets you rejected in interviews', body: seniorWarning },
      ],
    },
  ];

  const topic = {
    id, slug, title, moduleId, order, hook, sections,
    interviewTakeaways, commonPitfalls, relatedTopicIds, jsTsCorrelations, officialSources,
  };
  if (animationHint) topic.animationHint = animationHint;
  if (scenarioTag) topic.scenarioTag = scenarioTag;
  return topic;
}

// ─── Module 13 (skip already-deep: microtasks, combinators, concurrency-limits, promises-vs-csharp) ───

const TOPICS = {
  'why-async-javascript': buildTopic({
    id: 'javascript-13-why-async-javascript', slug: 'why-async-javascript',
    title: 'Why async JavaScript exists (I/O without blocking the thread)',
    moduleId: 'javascript-13-promises-async-event-loop', order: 1,
    hook: 'JavaScript runs user code on one thread per agent. Blocking that thread freezes the UI and stalls every concurrent request. Async I/O lets the engine register a callback and keep processing other work — the foundation for fetch, Redis clients, and SQS-style message polling.',
    whatIs: '**Synchronous** code runs to completion on the call stack before anything else executes. **Asynchronous** APIs (timers, `fetch`, file I/O in Node.js, database drivers) return immediately and invoke your callback or Promise when the host completes the operation. The **event loop** dequeues completed I/O and runs your continuations as microtasks or macrotasks. This is **cooperative concurrency**: one thread, many overlapping waits — not parallel CPU threads.',
    glossary: [
      { term: 'blocking I/O', longForm: 'blocking I/O', plainDefinition: 'A call that holds the thread until bytes arrive — forbidden on the browser main thread.', example: 'fs.readFileSync blocks Node until disk responds.' },
      { term: 'non-blocking I/O', longForm: 'non-blocking I/O', plainDefinition: 'Start operation, return handle, resume later via callback or Promise.', example: 'await fetch(url) — thread serves other requests while waiting.' },
      { term: 'event loop', longForm: 'event loop', plainDefinition: 'Scheduler that runs sync code, drains microtasks, then one macrotask per turn.', example: 'After await, continuation is a microtask.' },
    ],
    whyMatters: 'Every Node.js API server and React app depends on non-blocking I/O. Blocking the event loop with `JSON.parse` on a 50 MB payload or a tight `while(true)` loop drops throughput to zero — no other requests progress. C# uses `async/await` over thread-pool threads; JavaScript uses Promises on one thread. Confusing the two leads to "just add more threads" answers that do not apply in browsers.',
    whyCallout: { title: 'CPU vs I/O', body: 'Async helps **waiting**, not **computing**. Heavy JSON parsing or image resizing still blocks — offload to Workers or break into chunks.' },
    steps: { title: 'Async I/O lifecycle', items: [
      { title: 'Register interest', body: 'Call fetch or redis.get — host starts OS/network I/O.' },
      { title: 'Return immediately', body: 'Function returns a Promise; thread is free.' },
      { title: 'Other work runs', body: 'Event loop handles other callbacks, timers, renders.' },
      { title: 'Completion', body: 'I/O finishes; microtask runs your await continuation.' },
    ]},
    diagramTitle: 'Single thread, overlapping I/O',
    diagramSource: 'sequenceDiagram\n  participant Main as Main thread\n  participant Net as Network\n  Main->>Net: fetch A (register)\n  Main->>Net: fetch B (register)\n  Note over Main: other JS runs\n  Net-->>Main: A completes (microtask)\n  Net-->>Main: B completes (microtask)',
    snippets: [
      { language: 'javascript', label: 'Blocking vs non-blocking in Node', code: "// Blocking — stalls entire server\nconst data = fs.readFileSync('/big.json', 'utf8');\n\n// Non-blocking — other requests proceed\nconst data = await fs.promises.readFile('/big.json', 'utf8');", explanation: 'Line 2: sync read holds event loop. Line 5: await yields thread until file read completes.' },
      { language: 'javascript', label: 'SQS-style poll loop (Node)', code: 'async function pollQueue(sqs, url) {\n  while (true) {\n    const { Messages } = await sqs.receiveMessage({ QueueUrl: url, WaitTimeSeconds: 20 });\n    for (const msg of Messages ?? []) {\n      await handleMessage(msg);\n      await sqs.deleteMessage({ QueueUrl: url, ReceiptHandle: msg.ReceiptHandle });\n    }\n  }\n}', explanation: 'Line 3: long poll waits without blocking thread. Line 4–7: sequential per-message handling — add pool for throughput.' },
      { language: 'javascript', label: 'Browser — fetch without freezing UI', code: 'button.onclick = async () => {\n  button.disabled = true;\n  try {\n    const res = await fetch(\'/api/checkout\');\n    const order = await res.json();\n    renderReceipt(order);\n  } finally {\n    button.disabled = false;\n  }\n};', explanation: 'Line 4: await yields main thread — browser can paint and handle input between network waits.' },
      { language: 'csharp', label: 'C# async frees pool threads', code: 'while (!token.IsCancellationRequested) {\n  var msg = await sqs.ReceiveMessageAsync(url, token);\n  await HandleAsync(msg);\n}', explanation: 'C# releases thread-pool thread during await — different scheduler, same programmer model of overlapping I/O.' },
    ],
    compareTitle: 'Async models', compareHeaders: ['Aspect', 'JavaScript', 'C#'],
    compareRows: [
      ['Thread model', 'One agent thread (browser/Node default)', 'Thread pool per process'],
      ['Await scheduler', 'Microtasks on same thread', 'IAsyncStateMachine + pool'],
      ['Blocking sync API', 'Freezes UI / event loop', 'Blocks one pool thread'],
      ['CPU-bound work', 'Workers or chunking', 'Task.Run to pool'],
    ],
    mistakes: 'Using sync file APIs in Node request handlers. Assuming async makes CPU work parallel. Ignoring that 10k concurrent awaits still consume memory for closures and sockets.',
    seniorProse: 'Prove non-blocking in production: measure event loop lag with `perf_hooks.monitorEventLoopDelay()` in Node. If p99 lag spikes during CSV import, you blocked. In browsers, Long Tasks API flags main-thread blocks > 50 ms. Design: bounded pools for fan-out, streaming parsers for large payloads.',
    seniorTable: { title: 'Tradeoffs at senior level', headers: ['Pattern', 'Benefit', 'Risk'], rows: [
      ['Fire-and-forget Promise', 'Simple', 'Unhandled rejection'],
      ['await every I/O', 'Clear flow', 'Sequential latency if independent'],
      ['Promise.all fan-out', 'Parallel I/O', 'Unbounded sockets — use pool'],
      ['Worker for CPU', 'True parallelism', 'postMessage overhead'],
    ]},
    seniorWarning: 'Saying JavaScript is multithreaded by default. Cannot explain why readFileSync kills throughput. No distinction between I/O wait and CPU work.',
    interviewTakeaways: [
      'JS is single-threaded per agent; async overlaps I/O waits, not CPU.',
      'Blocking sync APIs freeze the event loop — use promises/fs.promises.',
      'await desugars to Promise microtasks — thread free during I/O.',
      '60s: One thread. Async registers I/O, returns Promise, runs other work, resumes on completion. Async helps waiting not computing. C# frees pool threads; JS stays on one thread.',
      'Follow-up: what happens if you JSON.parse 100MB on main thread?',
    ],
    commonPitfalls: [
      'Weak: "async is multithreaded" — rejected; one thread, overlapping waits.',
      'Weak: sync fs in Express handler — blocks all clients.',
      'Strong: distinguish I/O overlap from parallelism; cite event loop lag metrics.',
    ],
    relatedTopicIds: ['javascript-13-promise-states-and-chaining', 'javascript-13-microtasks-vs-macrotasks', 'javascript-01-event-loop-overview'],
    jsTsCorrelations: [
      { language: 'typescript', concept: 'Promise return types', note: 'async function return type is Promise<T> — compile-time only; runtime is still single-threaded JS.', futureTopicSlug: 'typescript/async/promise-and-async-return-types' },
      { language: 'typescript', concept: 'C# Task comparison', note: 'C# comparison: Task frees thread-pool threads; JS Promise continuations stay on agent thread.', futureTopicSlug: 'csharp/async-await/why-async' },
    ],
    officialSources: [
      { title: 'MDN — Event loop', url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Event_loop' },
      { title: 'Node.js — Event loop', url: 'https://nodejs.org/en/learn/asynchronous-work/event-loop-timers-and-nexttick' },
    ],
    animationHint: 'timeline', scenarioTag: 'sqs-consumer',
  }),

  'promise-states-and-chaining': buildTopic({
    id: 'javascript-13-promise-states-and-chaining', slug: 'promise-states-and-chaining',
    title: 'Promise states, then/catch/finally, and chaining',
    moduleId: 'javascript-13-promises-async-event-loop', order: 2,
    hook: 'A Promise is pending until it settles — fulfilled with a value or rejected with a reason. then/catch/finally build chains where each link returns a new Promise, enabling composable async pipelines from fetch to Redis cache writes.',
    whatIs: '**Pending**: initial state; neither value nor reason yet. **Fulfilled**: operation succeeded; `then` handlers receive the value. **Rejected**: failed; `catch` handlers receive the reason. **Settled** means fulfilled or rejected — no further state changes. **Chaining**: `p.then(fn)` returns a new Promise adopting `fn`\'s return or thrown error. `catch` is `then(null, onRejected)`. `finally` runs on either outcome and passes through the previous result unless it throws.',
    glossary: [
      { term: 'pending', longForm: 'Promise pending state', plainDefinition: 'Initial state before resolve or reject.', example: 'new Promise(() => {}) stays pending forever.' },
      { term: 'fulfilled', longForm: 'Promise fulfilled state', plainDefinition: 'Success with a value.', example: 'Promise.resolve(42)' },
      { term: 'rejected', longForm: 'Promise rejected state', plainDefinition: 'Failure with a reason (often Error).', example: 'Promise.reject(new Error("timeout"))' },
      { term: 'chaining', longForm: 'Promise chaining', plainDefinition: 'Each then returns new Promise; errors propagate down catch.', example: 'fetch(url).then(r => r.json()).catch(log)' },
    ],
    whyMatters: 'Unhandled rejections crash Node processes in strict mode. Returning a Promise inside `then` flattens nested async — forgetting to `return` breaks the chain. `finally` without rethrowing can swallow errors if you return a value. Production APIs chain: auth token refresh → fetch → validate → Redis cache set.',
    whyCallout: { title: 'Return or break the chain', body: 'Inside then, `return otherPromise` links async steps. Bare `otherPromise` without return does not wait — classic bug.' },
    steps: { title: 'Chain propagation', items: [
      { title: 'then on fulfilled', body: 'Handler runs as microtask; return value fulfills next link.' },
      { title: 'Handler throws', body: 'Next link rejects with thrown value.' },
      { title: 'Return Promise', body: 'Next link adopts that Promise\'s settlement.' },
      { title: 'catch recovers', body: 'catch handler can return value to re-fulfill downstream.' },
    ]},
    diagramTitle: 'Promise chain flow',
    diagramSource: 'flowchart LR\n  P[pending] -->|resolve| F[fulfilled]\n  P -->|reject| R[rejected]\n  F --> T[then handler]\n  T --> N[new Promise]\n  R --> C[catch handler]',
    snippets: [
      { language: 'javascript', label: 'Three states', code: 'const p = new Promise((resolve) => setTimeout(() => resolve("ok"), 100));\nconsole.log(p); // Promise { <pending> }\n\np.then((v) => console.log(v)); // "ok" after 100ms', explanation: 'Line 1: executor runs sync; resolve schedules microtask. Line 4: then callback runs when fulfilled.' },
      { language: 'javascript', label: 'Chained fetch + Redis cache', code: 'function getUser(id) {\n  return fetch(`/api/users/${id}`)\n    .then((res) => {\n      if (!res.ok) throw new Error(`HTTP ${res.status}`);\n      return res.json();\n    })\n    .then((user) => redis.set(`user:${id}`, JSON.stringify(user), "EX", 300).then(() => user));\n}', explanation: 'Line 4: throw converts to rejection. Line 6: inner then returns user after cache write — chain waits for Redis.' },
      { language: 'javascript', label: 'finally passes through', code: 'fetch(url)\n  .finally(() => { spinner.hide(); })\n  .then((r) => r.json())\n  .catch((err) => reportError(err));', explanation: 'Line 2: finally runs on success or failure. Line 3: then still receives Response if fetch succeeded.' },
      { language: 'javascript', label: 'Failure — missing return', code: 'fetch(url)\n  .then((r) => { r.json(); }) // forgot return!\n  .then((data) => console.log(data.id)); // TypeError: Cannot read id of undefined', explanation: 'Line 2: json() Promise discarded. Line 3: data is undefined — classic chain break.' },
    ],
    compareTitle: 'Promise vs Task chaining', compareHeaders: ['Feature', 'JavaScript', 'C#'],
    compareRows: [
      ['Error propagation', 'Reject + catch', 'Exception faults Task'],
      ['finally', 'Runs always, passes through', 'finally block'],
      ['Flattening', 'Return Promise in then', 'await nested Task'],
      ['Sync throw in then', 'Becomes rejection', 'Faults Task'],
    ],
    mistakes: 'Forgetting return in then. catch that returns undefined and masks errors. Not ending chains with catch in top-level handlers.',
    seniorProse: 'Promise/A+ requires thenables: if then returns object with .then, it must be assimilated. Native Promises use microtasks. In interviews, draw state diagram and trace throw inside then. Production: centralize error mapping in last catch; use cause for wrapped errors.',
    seniorTable: { title: 'Tradeoffs', headers: ['Pattern', 'Wins', 'Fails'], rows: [
      ['then chain', 'Composable', 'Callback pyramid if nested'],
      ['async/await', 'Readable', 'Sequential unless Promise.all'],
      ['.catch at end', 'Single error handler', 'Far from throw site'],
      ['throw in sync then', 'Natural', 'Must remember return for async'],
    ]},
    seniorWarning: 'Cannot name three states. Says catch catches sync errors before Promise created. Thinks then runs synchronously.',
    interviewTakeaways: [
      'States: pending → fulfilled or rejected (settled).',
      'then returns new Promise; return or throw controls next link.',
      'catch is then(null, onRejected); finally always runs.',
      '60s: Pending until resolve/reject. then/catch/finally chain microtasks. Return Promise to flatten. Missing return breaks chain.',
      'Follow-up: what if then throws synchronously?',
    ],
    commonPitfalls: [
      'Weak: forget return in then — next handler gets undefined.',
      'Weak: no terminal catch — unhandled rejection.',
      'Strong: trace state diagram; show return r.json() vs bare r.json().',
    ],
    relatedTopicIds: ['javascript-13-why-async-javascript', 'javascript-13-promise-combinators', 'javascript-13-implementing-promise-from-scratch'],
    jsTsCorrelations: [
      { language: 'typescript', concept: 'Promise<T> chaining', note: 'then return type inferred — returning Promise<U> flattens to Promise<U>.', futureTopicSlug: 'typescript/async/promise-and-async-return-types' },
      { language: 'typescript', concept: 'C# Task', note: 'C# comparison: await Task vs .then — same pipeline, different scheduler.', futureTopicSlug: 'csharp/async-await/task-async-await' },
    ],
    officialSources: [
      { title: 'MDN — Promise', url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise' },
      { title: 'Promises/A+ spec', url: 'https://promisesaplus.com/' },
    ],
    animationHint: 'flow', scenarioTag: 'redis-cache',
  }),

  'async-await-syntax': buildTopic({
    id: 'javascript-13-async-await-syntax', slug: 'async-await-syntax',
    title: 'async/await syntax and error handling',
    moduleId: 'javascript-13-promises-async-event-loop', order: 4,
    hook: 'async marks a function that always returns a Promise. await pauses that function until a Promise settles — the readable face of Promise chains. Errors become rejections caught by try/catch, but only inside the async function body.',
    whatIs: '**async function** wraps the return value in `Promise.resolve` (or `Promise.reject` on throw). **await** can only appear inside async functions (or modules at top level). It suspends the async function, schedules resumption as a microtask when the operand settles, and unwraps fulfillment or throws rejection. Sequential `await` is serial I/O; independent work needs `Promise.all`.',
    glossary: [
      { term: 'async', longForm: 'async function', plainDefinition: 'Function keyword making return value always a Promise.', example: 'async function f() { return 1; } // Promise<1>' },
      { term: 'await', longForm: 'await expression', plainDefinition: 'Pause async function until Promise settles.', example: 'const data = await fetch(url);' },
      { term: 'try/catch', longForm: 'async try/catch', plainDefinition: 'Catches rejections from awaited Promises like sync exceptions.', example: 'try { await p; } catch (e) { ... }' },
    ],
    whyMatters: 'Top-level await in ES modules blocks module graph evaluation — know bundle impact. `await` on non-Promise wraps with Promise.resolve. Forgotten await gives you a Promise object instead of data — silent bugs in Redis writes. Parallel fetches need `const [a,b] = await Promise.all([...])` not two sequential awaits.',
    whyCallout: { title: 'await is not blocking the thread', body: 'Other event loop work runs while your async function is suspended — only the function pauses.' },
    steps: { title: 'Desugaring mental model', items: [
      { title: 'Call async fn', body: 'Returns Promise immediately; body starts executing.' },
      { title: 'Hit await', body: 'Operand evaluated; if pending, function suspends.' },
      { title: 'Sync code continues', body: 'Caller and other tasks run.' },
      { title: 'Resume', body: 'Microtask continues after await with unwrapped value.' },
    ]},
    diagramTitle: 'async/await desugars to Promises',
    diagramSource: 'flowchart TD\n  A[async function] --> B[Promise wrapper]\n  B --> C{await?}\n  C -->|yes| D[suspend + microtask]\n  D --> C\n  C -->|return| E[resolve Promise]',
    snippets: [
      { language: 'javascript', label: 'Sequential vs parallel await', code: '// Sequential — 2x latency\nconst a = await fetch('/api/a');\nconst b = await fetch('/api/b');\n\n// Parallel — max latency\nconst [ra, rb] = await Promise.all([fetch('/api/a'), fetch('/api/b')]);', explanation: 'Lines 2–3: second fetch starts only after first completes. Lines 6: both register I/O before either await.' },
      { language: 'javascript', label: 'try/catch with fetch + Redis', code: 'async function loadSession(token) {\n  try {\n    const cached = await redis.get(`sess:${token}`);\n    if (cached) return JSON.parse(cached);\n    const res = await fetch(`/auth/session/${token}`);\n    if (!res.ok) throw new Error(`auth ${res.status}`);\n    const session = await res.json();\n    await redis.set(`sess:${token}`, JSON.stringify(session), "EX", 3600);\n    return session;\n  } catch (err) {\n    logger.error({ err, token }, "session load failed");\n    throw err;\n  }\n}', explanation: 'Line 8: await rejection caught by catch. Line 12: rethrow preserves rejection for caller.' },
      { language: 'javascript', label: 'Forgotten await bug', code: 'async function save(user) {\n  redis.set(`user:${user.id}`, JSON.stringify(user)); // missing await!\n  return { ok: true };\n}\n// Caller thinks save completed — Redis may still be in flight', explanation: 'Line 2: returns Promise ignored — race with shutdown or next read.' },
      { language: 'javascript', label: 'Failure — await in non-async', code: 'function broken() {\n  const data = await fetch(url); // SyntaxError\n}', explanation: 'await only legal in async functions or module top-level — compile-time error in modules.' },
    ],
    compareTitle: 'async/await across languages', compareHeaders: ['Feature', 'JavaScript', 'C#'],
    compareRows: [
      ['Return type', 'Always Promise', 'Task / ValueTask'],
      ['Error handling', 'try/catch on await', 'try/catch on await'],
      ['Thread', 'Same agent thread', 'May hop pool threads'],
      ['Parallelism', 'Promise.all', 'Task.WhenAll'],
    ],
    mistakes: 'Sequential await for independent I/O. Missing await on async calls. try/catch outside async function expecting to catch inner await.',
    seniorProse: 'Async functions compile to state machines (like C#). Each await is a suspend point. Debugging: async stack traces in Chrome show microtask continuations. Production: wrap route handlers; map errors to HTTP status; never let async IIFE float without catch.',
    seniorTable: { title: 'Tradeoffs', headers: ['Pattern', 'Wins', 'Fails'], rows: [
      ['async/await', 'Readable', 'Sequential trap'],
      ['Promise.then', 'Explicit chaining', 'Pyramid if nested'],
      ['void async IIFE', 'Top-level in script', 'Unhandled rejection'],
      ['top-level await', 'Module init', 'Blocks dependents'],
    ]},
    seniorWarning: 'Says await blocks the thread. Cannot convert then chain to async/await. Thinks try/catch catches errors in callbacks passed to setTimeout.',
    interviewTakeaways: [
      'async always returns Promise; await unwraps or throws rejection.',
      'Independent I/O: Promise.all, not sequential await.',
      'await suspends async function only — event loop continues.',
      '60s: async wraps return in Promise. await = pause function, resume on microtask. try/catch catches await rejections. Parallel = Promise.all.',
      'Follow-up: convert then chain to async/await preserving error path.',
    ],
    commonPitfalls: [
      'Weak: sequential await for parallel fetches — 3x latency.',
      'Weak: missing await on redis.set — fire-and-forget bug.',
      'Strong: show Promise.all pattern; explain microtask resume.',
    ],
    relatedTopicIds: ['javascript-13-promise-states-and-chaining', 'javascript-13-microtasks-vs-macrotasks', 'javascript-13-abort-controller-cancellation'],
    jsTsCorrelations: [
      { language: 'typescript', concept: 'async return type', note: 'async function foo(): Promise<string> — explicit return type must be Promise wrapper.', futureTopicSlug: 'typescript/async/promise-and-async-return-types' },
      { language: 'typescript', concept: 'C# async', note: 'C# comparison: both state machines; C# may resume on different pool thread.', futureTopicSlug: 'csharp/async-await/task-async-await' },
    ],
    officialSources: [
      { title: 'MDN — async function', url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/async_function' },
      { title: 'MDN — await', url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/await' },
    ],
    animationHint: 'flow', scenarioTag: 'redis-cache',
  }),

  'implementing-promise-from-scratch': buildTopic({
    id: 'javascript-13-implementing-promise-from-scratch', slug: 'implementing-promise-from-scratch',
    title: 'Implementing a Promise/A+ subset from scratch',
    moduleId: 'javascript-13-promises-async-event-loop', order: 6,
    hook: 'FAANG interviews ask you to implement Promise from scratch to prove you understand microtask scheduling, state immutability, and then-chain assimilation — not just syntax.',
    whatIs: 'A minimal Promise stores **state** (pending/fulfilled/rejected), **value/reason**, and **reaction queues**. The executor runs synchronously; `resolve`/`reject` transition state once. `then` registers callbacks — if already settled, schedule on microtask. Returning a thenable from `then` requires **assimilation** (recursive then). Promise/A+ mandates `then` must return a new Promise.',
    glossary: [
      { term: 'executor', longForm: 'Promise executor', plainDefinition: 'function(resolve, reject) called synchronously in constructor.', example: 'new Promise((res, rej) => res(1))' },
      { term: 'assimilation', longForm: 'thenable assimilation', plainDefinition: 'If then returns object with .then, adopt its settlement.', example: 'return fetch(url) from then handler' },
      { term: 'microtask', longForm: 'microtask scheduling', plainDefinition: 'then callbacks run as microtasks, not synchronously.', example: 'queueMicrotask(() => runHandler())' },
    ],
    whyMatters: 'Understanding scratch Promise explains native behavior: why `new Promise(r => r(1)).then(x => console.log(x))` logs after sync code, why thrown errors in executor reject, and why double-resolve is ignored. Polyfills and RxJS schedulers build on same model.',
    whyCallout: { title: 'Interview scope', body: 'Implement then + resolve/reject + basic assimilation. Full A+ includes multiple then on pending and circular thenable protection.' },
    steps: { title: 'Minimal then implementation', items: [
      { title: 'Constructor', body: 'Run executor; catch sync throw → reject.' },
      { title: 'resolve/reject', body: 'If pending, set state + value; flush queued reactions.' },
      { title: 'then', body: 'Return new Promise; queue reaction or schedule microtask if settled.' },
      { title: 'Reaction', body: 'Call handler; resolve/reject child with return/throw.' },
    ]},
    diagramTitle: 'Scratch Promise internals',
    diagramSource: 'flowchart TD\n  E[executor] --> S{state?}\n  S -->|pending| Q[reaction queue]\n  S -->|settled| M[microtask flush]\n  T[then] --> Q\n  Q --> M',
    snippets: [
      { language: 'javascript', label: 'Minimal MyPromise core', code: 'class MyPromise {\n  #state = "pending";\n  #value;\n  #reactions = [];\n\n  constructor(executor) {\n    const resolve = (value) => {\n      if (this.#state !== "pending") return;\n      this.#state = "fulfilled";\n      this.#value = value;\n      queueMicrotask(() => this.#reactions.splice(0).forEach((r) => r.onFulfilled?.(value)));\n    };\n    const reject = (reason) => {\n      if (this.#state !== "pending") return;\n      this.#state = "rejected";\n      this.#value = reason;\n      queueMicrotask(() => this.#reactions.splice(0).forEach((r) => r.onRejected?.(reason)));\n    };\n    try { executor(resolve, reject); } catch (e) { reject(e); }\n  }\n\n  then(onFulfilled, onRejected) {\n    return new MyPromise((resolve, reject) => {\n      const run = (fn, val) => {\n        queueMicrotask(() => {\n          try {\n            const result = fn ? fn(val) : val;\n            result?.then ? result.then(resolve, reject) : resolve(result);\n          } catch (e) { reject(e); }\n        });\n      };\n      if (this.#state === "fulfilled") run(onFulfilled, this.#value);\n      else if (this.#state === "rejected") run(onRejected, this.#value);\n      else this.#reactions.push({ onFulfilled: (v) => run(onFulfilled, v), onRejected: (r) => run(onRejected, r) });\n    });\n  }\n}', explanation: 'Lines 8–9: microtask flush — matches native ordering. Lines 27–28: assimilation via result.then.' },
      { language: 'javascript', label: 'Verify ordering', code: 'new MyPromise((r) => r(1)).then((v) => console.log("then", v));\nconsole.log("sync");\n// sync, then 1', explanation: 'Confirms microtask scheduling — sync before then.' },
      { language: 'javascript', label: 'Assimilation chain', code: 'MyPromise.resolve(1)\n  .then((v) => MyPromise.resolve(v + 1))\n  .then((v) => console.log(v)); // 2', explanation: 'Returning MyPromise from then flattens — child adopts settlement.' },
      { language: 'javascript', label: 'Failure — sync then in constructor', code: 'new MyPromise((resolve) => {\n  resolve(1);\n  throw new Error("late"); // ignored — already settled\n});', explanation: 'Line 3: second resolve/throw after settle is no-op per spec.' },
    ],
    compareTitle: 'Native vs scratch', compareHeaders: ['Feature', 'Native Promise', 'Interview subset'],
    compareRows: [
      ['Scheduler', 'Microtask queue', 'queueMicrotask'],
      ['Assimilation', 'Full A+', 'Basic thenable'],
      ['Subclassing', 'Species pattern', 'Often skipped'],
      ['Performance', 'Optimized C++', 'Educational JS'],
    ],
    mistakes: 'Calling then callbacks synchronously on pending registration. Forgetting to return new Promise from then. No double-settle guard.',
    seniorProse: 'Follow-ups: implement catch/finally, Promise.resolve, race. Discuss why microtasks not sync — consistency with native. Mention job queue in HTML spec vs node microtask. Production: rarely roll own — but reading source clarifies bug reports.',
    seniorTable: { title: 'Tradeoffs', headers: ['Approach', 'Wins', 'Fails'], rows: [
      ['Full A+', 'Spec complete', 'Interview time'],
      ['Minimal then', 'Shows understanding', 'Edge cases'],
      ['Native only', 'Production ready', 'Black box in interviews'],
      ['Async library', 'Operators', 'Scheduler complexity'],
    ]},
    seniorWarning: 'Runs handlers synchronously. No microtask. Cannot explain assimilation. Thinks resolve calls then immediately.',
    interviewTakeaways: [
      'State machine: pending → fulfilled/rejected once.',
      'then returns new Promise; queue reactions if pending.',
      'Schedule handlers on microtask — never sync for settled.',
      '60s: Executor sync. resolve flushes reactions via microtask. then returns new Promise. Return thenable → assimilate. Double settle ignored.',
      'Follow-up: implement catch as then(null, fn).',
    ],
    commonPitfalls: [
      'Weak: sync then callbacks — wrong ordering vs setTimeout.',
      'Weak: no return new Promise from then.',
      'Strong: microtask + assimilation + settle guard in 30 lines.',
    ],
    relatedTopicIds: ['javascript-13-promise-states-and-chaining', 'javascript-13-microtasks-vs-macrotasks', 'javascript-13-promise-combinators'],
    jsTsCorrelations: [
      { language: 'typescript', concept: 'PromiseLike<T>', note: 'TypeScript PromiseLike — thenable assimilation typing for interop.', futureTopicSlug: 'typescript/async/promise-and-async-return-types' },
      { language: 'typescript', concept: 'C# TaskCompletionSource', note: 'C# comparison: manual completion like resolve — TaskCompletionSource.TrySetResult.', futureTopicSlug: 'csharp/async-await/task-completion-source' },
    ],
    officialSources: [
      { title: 'Promises/A+', url: 'https://promisesaplus.com/' },
      { title: 'MDN — Promise', url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise' },
    ],
    animationHint: 'flow',
  }),

  'abort-controller-cancellation': buildTopic({
    id: 'javascript-13-abort-controller-cancellation', slug: 'abort-controller-cancellation',
    title: 'AbortController, signals, and cooperative cancellation',
    moduleId: 'javascript-13-promises-async-event-loop', order: 7,
    hook: 'AbortSignal is JavaScript\'s cooperative cancellation token — pass it to fetch, streams, and your own async loops so shutdown, timeouts, and user navigation abort in-flight work without killing the process.',
    whatIs: '**AbortController** owns an **AbortSignal**. Calling `controller.abort(reason)` sets `signal.aborted` true, fires `abort` event, and rejects linked operations with `AbortError`. **Cooperative**: fetch and async functions must poll `signal.aborted` or listen to `abort` — nothing is preempted. Node 18+ fetch and many libraries accept `{ signal }`.',
    glossary: [
      { term: 'AbortController', longForm: 'AbortController', plainDefinition: 'Creates and controls an AbortSignal.', example: 'const c = new AbortController();' },
      { term: 'AbortSignal', longForm: 'AbortSignal', plainDefinition: 'Read-only flag + event for cancellation.', example: 'fetch(url, { signal: c.signal })' },
      { term: 'cooperative', longForm: 'cooperative cancellation', plainDefinition: 'Worker code must check signal — no forced thread kill.', example: 'if (signal.aborted) return;' },
    ],
    whyMatters: 'Deploy restarts, React StrictMode double-mount, and user clicking "Cancel" need to stop fetch and Redis pipelines. Without abort, ghost requests waste bandwidth and race with new state. C# **CancellationToken** is the direct analog — pass through every async layer.',
    whyCallout: { title: 'Link signals', body: 'AbortSignal.any([userSignal, timeoutSignal]) combines multiple cancel sources (modern browsers).' },
    steps: { title: 'Cancellation flow', items: [
      { title: 'Create controller', body: 'One per operation or shared per request scope.' },
      { title: 'Pass signal', body: 'fetch, axios, custom async fn accept signal.' },
      { title: 'abort()', body: 'On timeout, navigation, or SIGTERM handler.' },
      { title: 'Cleanup', body: 'catch AbortError separately from real failures.' },
    ]},
    diagramTitle: 'AbortSignal propagation',
    diagramSource: 'flowchart LR\n  C[AbortController] --> S[AbortSignal]\n  S --> F[fetch]\n  S --> L[custom loop]\n  C -->|abort| X[AbortError]',
    snippets: [
      { language: 'javascript', label: 'fetch with timeout', code: 'function fetchWithTimeout(url, ms) {\n  const c = new AbortController();\n  const id = setTimeout(() => c.abort(new Error("timeout")), ms);\n  return fetch(url, { signal: c.signal })\n    .finally(() => clearTimeout(id));\n}', explanation: 'Line 3: abort rejects fetch. Line 5: clear timer on success.' },
      { language: 'javascript', label: 'Cooperative poll loop', code: 'async function drainQueue(handler, { signal }) {\n  while (!signal.aborted) {\n    const msg = await redis.lpop("jobs");\n    if (!msg) { await sleep(100, signal); continue; }\n    await handler(msg, signal);\n  }\n}\n\nprocess.on("SIGTERM", () => controller.abort());', explanation: 'Line 2: check aborted each iteration. Line 7: shutdown aborts loop gracefully.' },
      { language: 'javascript', label: 'React cleanup', code: 'useEffect(() => {\n  const c = new AbortController();\n  fetch(`/api/user/${id}`, { signal: c.signal })\n    .then((r) => r.json())\n    .then(setUser)\n    .catch((e) => { if (e.name !== "AbortError") throw e; });\n  return () => c.abort();\n}, [id]);', explanation: 'Line 7: abort on unmount prevents setState on stale response.' },
      { language: 'javascript', label: 'Failure — ignoring AbortError', code: 'try {\n  await fetch(url, { signal });\n} catch (e) {\n  logger.error("fetch failed", e); // logs cancel as error\n}', explanation: 'Treat AbortError as expected on shutdown — not a 500-worthy failure.' },
    ],
    compareTitle: 'Cancellation models', compareHeaders: ['Feature', 'AbortSignal', 'C# CancellationToken'],
    compareRows: [
      ['Propagation', 'Pass signal option', 'Pass token parameter'],
      ['Trigger', 'controller.abort()', 'cts.Cancel()'],
      ['fetch support', 'Native', 'HttpClient token'],
      ['Preemptive', 'No', 'No — cooperative'],
    ],
    mistakes: 'Not passing signal to child fetches. Treating AbortError as server failure. Creating new controller per retry without linking timeout.',
    seniorProse: 'Production: on SIGTERM, abort in-flight, stop accepting new Redis jobs, await drain with deadline. Node fetch abort cancels underlying libuv request. Test with fake slow server + abort. Compare AbortSignal.timeout(ms) built-in.',
    seniorTable: { title: 'Tradeoffs', headers: ['Pattern', 'Wins', 'Fails'], rows: [
      ['Per-request controller', 'Isolated cancel', 'Many objects'],
      ['Shared parent signal', 'Cascade cancel', 'Over-abort if reused'],
      ['AbortSignal.timeout', 'Simple deadline', 'Less custom reason'],
      ['No cancellation', 'Simple code', 'Zombie requests'],
    ]},
    seniorWarning: 'Thinks abort kills threads. No cooperative check in custom async. Cannot map to CancellationToken.',
    interviewTakeaways: [
      'AbortController.abort() sets signal.aborted; fetch rejects with AbortError.',
      'Cooperative — custom loops must check signal.',
      'Distinguish AbortError from network failures in logging.',
      '60s: Signal = cancellation token. Pass to fetch. abort() on timeout/unmount. Cooperative not preemptive. Maps to C# CancellationToken.',
      'Follow-up: implement cancellable sleep with signal.',
    ],
    commonPitfalls: [
      'Weak: no signal passed to nested fetches.',
      'Weak: log AbortError as ERROR — noise on deploy.',
      'Strong: SIGTERM handler + abort + drain pattern.',
    ],
    relatedTopicIds: ['javascript-13-async-await-syntax', 'javascript-17-fetch-streams-and-web-apis', 'javascript-13-async-concurrency-limits'],
    jsTsCorrelations: [
      { language: 'typescript', concept: 'AbortSignal typing', note: 'lib.dom AbortSignal — optional on fetch RequestInit.', futureTopicSlug: 'typescript/dom/fetch-types' },
      { language: 'typescript', concept: 'CancellationToken', note: 'C# comparison: CancellationToken.Register vs signal addEventListener("abort").', futureTopicSlug: 'csharp/async-await/cancellation-tokens' },
    ],
    officialSources: [
      { title: 'MDN — AbortController', url: 'https://developer.mozilla.org/en-US/docs/Web/API/AbortController' },
      { title: 'DOM spec — AbortSignal', url: 'https://dom.spec.whatwg.org/#abortsignal' },
    ],
    animationHint: 'flow', scenarioTag: 'auth-token',
  }),
};

// Module 14 — Memory (all 9 topics) — continued in part 2 via merge
import { MEMORY_TOPICS } from './deepen-js-module-14-content.mjs';
import { WORKERS_TOPICS } from './deepen-js-module-15-content.mjs';
import { MODULES_TOPICS } from './deepen-js-module-16-content.mjs';
import { RUNTIME_TOPICS } from './deepen-js-module-17-content.mjs';
import { RECAP_TOPICS } from './deepen-js-module-18-content.mjs';

Object.assign(TOPICS, MEMORY_TOPICS, WORKERS_TOPICS, MODULES_TOPICS, RUNTIME_TOPICS, RECAP_TOPICS);

const MINDMAPS = {
  'javascript-13-promises-async-event-loop': {
    intro: 'Non-blocking I/O on one thread: Promise states, combinators, async/await, microtask ordering, scratch implementation, AbortSignal cancellation, bounded pools, and C# Task comparison.',
    overviewDiagram: {
      type: 'mermaid',
      title: 'Async stack from I/O to await',
      source: 'flowchart TD\n  A[Why async] --> B[Promise states]\n  B --> C[Combinators]\n  C --> D[async/await]\n  D --> E[Microtasks]\n  E --> F[Implement Promise]\n  F --> G[AbortSignal]\n  G --> H[Pool pattern]\n  H --> I[vs C# Task]',
    },
    conceptSummaries: {
      'why-async-javascript': 'One thread — async overlaps I/O waits; blocking sync APIs freeze the loop.',
      'promise-states-and-chaining': 'pending/fulfilled/rejected; then returns new Promise; return to chain.',
      'promise-combinators': 'all fail-fast; allSettled partial success; race/any for timeout and fallback.',
      'async-await-syntax': 'async returns Promise; await = microtask suspend; parallel = Promise.all.',
      'microtasks-vs-macrotasks': 'Drain all microtasks before next macrotask; await is microtask.',
      'implementing-promise-from-scratch': 'State machine + microtask flush + thenable assimilation.',
      'abort-controller-cancellation': 'Cooperative cancel token for fetch and custom loops.',
      'async-concurrency-limits': 'mapPool caps in-flight async — not multithreaded.',
      'promises-vs-csharp-task': 'Same await model; JS microtasks vs C# thread pool.',
    },
    revisionSource: 'mindmap\n  root((Promises async))\n    Why\n      Single thread I/O\n      Event loop overlap\n    States\n      pending fulfilled rejected\n      then catch finally chain\n    Combinators\n      all allSettled race any\n    await\n      Promise wrapper\n      try catch rejections\n    Event loop\n      microtasks before macrotasks\n      nextTick Node priority\n    Scratch Promise\n      resolve reject once\n      assimilation\n    Cancel\n      AbortController signal\n      cooperative fetch\n    Pool\n      bounded concurrency\n      not Worker threads\n    C# Task\n      pool threads\n      CancellationToken',
  },
  'javascript-14-memory-and-garbage-collection': {
    intro: 'V8 stack/heap layout, generational GC, closure retention, WeakRef cleanup, leak patterns, detached DOM, DevTools profiling, CLR comparison, and allocation hot paths.',
    overviewDiagram: {
      type: 'mermaid',
      title: 'Memory lifecycle in V8',
      source: 'flowchart TD\n  S[Stack refs] --> H[Heap objects]\n  H --> Y[Young gen Scavenge]\n  Y --> O[Old gen Mark-Sweep]\n  O --> L[Leaks profile fix]',
    },
    conceptSummaries: {
      'stack-heap-and-references': 'Primitives on stack; objects on heap; references are pointers.',
      'v8-garbage-collection': 'Young Scavenge + old Mark-Sweep-Compact; generational hypothesis.',
      'closure-memory-retention': 'Closed-over vars live while function reference lives.',
      'weakref-and-finalization': 'WeakRef non-strong; FinalizationRegistry cleanup hook.',
      'memory-leak-patterns': 'Timers, listeners, unbounded caches — strong refs prevent GC.',
      'detached-dom-and-leaks': 'Removed DOM nodes held by JS refs leak in browser.',
      'profiling-with-devtools': 'Heap snapshots, allocation timeline, comparison diffs.',
      'v8-vs-clr-gc': 'V8 generational vs CLR generational; different heuristics.',
      'allocation-hot-paths': 'Pool buffers; avoid per-request object churn in Node.',
    },
    revisionSource: 'mindmap\n  root((Memory GC))\n    Stack heap\n      primitives vs objects\n      reference graph\n    V8 GC\n      young Scavenge\n      old mark sweep\n    Closures\n      retention scope\n    Weak\n      WeakRef FinalizationRegistry\n    Leaks\n      timers listeners cache\n    DOM\n      detached nodes\n    DevTools\n      heap snapshot diff\n    CLR compare\n      generations similar\n    Hot paths\n      pooling Buffer reuse',
  },
  'javascript-15-workers-and-concurrency': {
    intro: 'Dedicated Workers for CPU offload, postMessage structured clone, transferables, SharedArrayBuffer + Atomics, worker pools, and comparison to C# threading.',
    overviewDiagram: {
      type: 'mermaid',
      title: 'Main thread vs Workers',
      source: 'flowchart LR\n  M[Main thread UI] <-->|postMessage| W1[Worker 1]\n  M <-->|transfer ArrayBuffer| W2[Worker 2]\n  W1 --- SAB[SharedArrayBuffer Atomics]',
    },
    conceptSummaries: {
      'web-workers-basics': 'Separate event loop; no DOM; script URL or inline worker.',
      'postmessage-and-transferables': 'Structured clone copies; transfer moves ArrayBuffer zero-copy.',
      'sharedarraybuffer-and-atomics': 'Shared memory + Atomics.wait/notify; COOP/COEP headers.',
      'worker-pools-and-patterns': 'Fixed pool for CPU jobs; queue tasks from main.',
      'workers-vs-csharp-threading': 'Workers = processes-lite; not 1:1 with Thread.',
    },
    revisionSource: 'mindmap\n  root((Workers))\n    Dedicated Worker\n      no DOM separate loop\n    postMessage\n      structured clone\n      transferables\n    SAB\n      Atomics COOP COEP\n    Pools\n      CPU offload queue\n    vs C#\n      Task.Run threads shared memory',
  },
  'javascript-16-modules-bundling-tooling': {
    intro: 'ESM static import/export vs CJS require, dynamic import(), package exports resolution, bundler tree shaking, and comparison to C# assemblies.',
    overviewDiagram: {
      type: 'mermaid',
      title: 'Module pipeline',
      source: 'flowchart LR\n  SRC[ESM/CJS source] --> RES[Resolver exports]\n  RES --> BUN[Bundler esbuild/webpack]\n  BUN --> SHAKE[Tree shake sideEffects]\n  SHAKE --> OUT[dist bundle]',
    },
    conceptSummaries: {
      'esm-vs-commonjs': 'import static compile-time; require runtime sync; interop friction.',
      'dynamic-import-and-code-splitting': 'import() async chunk; route-level lazy loading.',
      'module-resolution': 'package.json exports conditions; import maps in browser.',
      'bundlers-and-tree-shaking': 'ESM static analysis drops dead exports; sideEffects flag.',
      'tooling-vs-csharp-assemblies': 'No IL metadata; bundler links graph at build time.',
    },
    revisionSource: 'mindmap\n  root((Modules))\n    ESM\n      import export static\n    CJS\n      require module.exports\n    Dynamic import\n      code splitting chunks\n    Resolution\n      exports import maps\n    Bundlers\n      tree shake sideEffects\n    vs C#\n      assemblies namespaces',
  },
  'javascript-17-browser-node-runtimes': {
    intro: 'globalThis/window/process globals, fetch and Web Streams, timer vs microtask vs nextTick ordering, Node fs promises and Buffer.',
    overviewDiagram: {
      type: 'mermaid',
      title: 'Browser vs Node hosts',
      source: 'flowchart TD\n  JS[ECMAScript core] --> B[Browser window fetch DOM]\n  JS --> N[Node process Buffer fs]',
    },
    conceptSummaries: {
      'global-objects-window-process': 'globalThis universal; window vs global vs process env.',
      'fetch-streams-and-web-apis': 'fetch + ReadableStream backpressure; pipeTo/transform.',
      'timers-and-nexttick': 'setTimeout macrotask; nextTick before Promise microtasks in Node.',
      'node-fs-and-buffers': 'fs.promises async; Buffer binary; path posix vs win32.',
    },
    revisionSource: 'mindmap\n  root((Runtimes))\n    Globals\n      globalThis window process\n    fetch streams\n      ReadableStream backpressure\n    Timers\n      macrotask nextTick priority\n    Node fs\n      Buffer promises API',
  },
  'javascript-18-es-recap-performance': {
    intro: 'ES version timeline, performance idioms (memoize, batch), deep clone with cycles, senior code review radar, and interview utilities (bind, memoize, flatten).',
    overviewDiagram: {
      type: 'mermaid',
      title: 'Senior JS recap',
      source: 'flowchart TD\n  ES[ES versions] --> PERF[Performance idioms]\n  PERF --> CLONE[Deep clone equality]\n  CLONE --> REVIEW[Code review radar]\n  REVIEW --> UTIL[Interview utilities]',
    },
    conceptSummaries: {
      'es-version-map': 'ES2015 modules/classes through ES2024 features — know ship dates.',
      'performance-idioms': 'Memoize, lazy init, batch DOM/Redis — measure first.',
      'deep-clone-and-equality': 'structuredClone, WeakMap cycle track, deepEqual recursion.',
      'code-review-radar': 'Async, equality, memory, types at boundaries — senior checklist.',
      'interview-utility-implementations': 'bind, once, memoize, flatten — implement from scratch.',
    },
    revisionSource: 'mindmap\n  root((ES recap))\n    Versions\n      ES2015 to ES2024\n    Performance\n      memoize batch lazy\n    Clone\n      circular refs structuredClone\n    Review radar\n      async equality memory\n    Utilities\n      bind memoize flatten',
  },
};

function buildMindmap(moduleId, moduleJson, mindmapSpec) {
  const mindmapPath = join(root, moduleJson.slug.replace(/^javascript-\d+-/, '').replace(/^\d+-/, '') ? '' : '');
  const folder = Object.keys(MINDMAPS).find((k) => k === moduleId);
  const spec = MINDMAPS[moduleId];
  if (!spec) return null;

  const moduleFolder = join(root, `${String(moduleJson.order).padStart(2, '0')}-${moduleJson.slug}`);
  const cards = moduleJson.topics.map((t) => ({
    id: `card-${t.slug}`,
    title: t.title,
    summary: spec.conceptSummaries[t.slug] || t.title,
    example: t.slug,
    topicSlug: t.slug,
  }));

  return {
    path: join(moduleFolder, 'mindmap.json'),
    data: {
      moduleId,
      title: `${moduleJson.title} — concept map`,
      intro: spec.intro,
      overviewDiagram: { type: 'mermaid', title: spec.overviewDiagram.title, source: spec.overviewDiagram.source },
      conceptCards: cards,
      revisionDiagram: { type: 'mermaid', title: `${moduleJson.title} revision map`, source: spec.revisionSource },
    },
  };
}

let written = 0;
const moduleFolders = [
  ['13-promises-async-event-loop', 13],
  ['14-memory-and-garbage-collection', 14],
  ['15-workers-and-concurrency', 15],
  ['16-modules-bundling-tooling', 16],
  ['17-browser-node-runtimes', 17],
  ['18-es-recap-performance', 18],
];

for (const [folder, order] of moduleFolders) {
  const modulePath = join(root, `${String(order).padStart(2, '0')}-${folder.split('-').slice(1).join('-')}`);
  const actualFolder = join(root, `${String(order).padStart(2, '0')}-${folder.replace(/^\d+-/, '')}`);
  const modDir = join(root, `${String(order).padStart(2, '0')}-${folder}`);
  const moduleJson = JSON.parse(readFileSync(join(modDir, 'module.json'), 'utf8'));

  for (const t of moduleJson.topics) {
    if (!TOPICS[t.slug]) continue;
    const isGeneric = (() => {
      try {
        const existing = JSON.parse(readFileSync(join(modDir, 'topics', `${t.slug}.json`), 'utf8'));
        return existing.commonPitfalls?.some((p) => p.includes('is just syntax'));
      } catch { return false; }
    })();
    if (!isGeneric && !['why-async-javascript', 'promise-states-and-chaining', 'async-await-syntax', 'implementing-promise-from-scratch', 'abort-controller-cancellation'].includes(t.slug)) {
      // Only skip non-generic unless in our explicit rewrite list for module 13
      const m13rewrite = ['why-async-javascript', 'promise-states-and-chaining', 'async-await-syntax', 'implementing-promise-from-scratch', 'abort-controller-cancellation'];
      if (!m13rewrite.includes(t.slug)) continue;
    }
    writeFileSync(join(modDir, 'topics', `${t.slug}.json`), `${JSON.stringify(TOPICS[t.slug], null, 2)}\n`);
    written++;
  }

  const spec = MINDMAPS[moduleJson.id];
  if (spec) {
    const cards = moduleJson.topics.map((t) => ({
      id: `card-${t.slug}`,
      title: t.title,
      summary: spec.conceptSummaries[t.slug] || t.title,
      example: t.slug,
      topicSlug: t.slug,
    }));
    const mindmap = {
      moduleId: moduleJson.id,
      title: `${moduleJson.title} — concept map`,
      intro: spec.intro,
      overviewDiagram: { type: 'mermaid', title: spec.overviewDiagram.title, source: spec.overviewDiagram.source },
      conceptCards: cards,
      revisionDiagram: { type: 'mermaid', title: `${moduleJson.title} revision map`, source: spec.revisionSource },
    };
    writeFileSync(join(modDir, 'mindmap.json'), `${JSON.stringify(mindmap, null, 2)}\n`);
  }
}

console.log(`Deepened ${written} topic files and updated ${moduleFolders.length} mindmaps`);
