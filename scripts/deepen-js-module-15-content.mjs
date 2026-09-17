/** Deep content for JavaScript module 15 — Workers */
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

export const WORKERS_TOPICS = {
  'web-workers-basics': buildTopic({
    id: 'javascript-15-web-workers-basics', slug: 'web-workers-basics',
    title: 'Web Workers and dedicated worker threads', moduleId: 'javascript-15-workers-and-concurrency', order: 1,
    hook: 'A Web Worker runs JavaScript on a separate thread with its own event loop — no DOM access, but perfect for parsing large CSV files, crypto, or image processing without freezing the UI.',
    whatIs: '**Dedicated Worker**: `new Worker(url)` spawns an isolated global scope (`self`). Communication via **postMessage**. No `window`, `document`, or parent objects. **SharedWorker** (rare) and **Service Worker** (network cache) are different APIs. Node has **worker_threads** module with similar message passing.',
    glossary: [
      { term: 'Dedicated Worker', longForm: 'Dedicated Web Worker', plainDefinition: 'One-to-one worker owned by creating script.', example: 'new Worker("worker.js")' },
      { term: 'self', longForm: 'Worker global self', plainDefinition: 'Global object inside worker — like window in main.', example: 'self.onmessage = handler' },
      { term: 'worker_threads', longForm: 'Node worker_threads', plainDefinition: 'Node.js API for parallel JS threads.', example: 'new Worker("./task.js")' },
    ],
    whyMatters: 'JSON.parse on 20MB API response blocks main thread 500ms — users see jank. Offload to Worker; main thread stays responsive for fetch and Redis cache UI updates. Wrong tool: Workers for I/O — async fetch already non-blocking.',
    whyCallout: { title: 'CPU not I/O', body: 'Workers help CPU-bound work. Network waits use async fetch on main thread.' },
    steps: { title: 'Worker lifecycle', items: [
      { title: 'Create', body: 'new Worker(scriptURL) — separate thread starts.' },
      { title: 'Listen', body: 'worker.onmessage on main; self.onmessage in worker.' },
      { title: 'Send work', body: 'postMessage task payload.' },
      { title: 'Terminate', body: 'worker.terminate() or close when done.' },
    ]},
    diagramTitle: 'Main vs Worker threads',
    diagramSource: 'flowchart LR\n  M[Main thread DOM fetch] <-->|postMessage| W[Worker CPU task]\n  M --> UI[Paint UI]',
    snippets: [
      { language: 'javascript', label: 'Basic Worker', code: '// main.js\nconst worker = new Worker("parse-worker.js");\nworker.postMessage({ csv: largeCsvString });\nworker.onmessage = (e) => renderTable(e.data.rows);\nworker.onerror = (e) => console.error(e.message);\n\n// parse-worker.js\nself.onmessage = (e) => {\n  const rows = parseCsv(e.data.csv);\n  self.postMessage({ rows });\n};', explanation: 'Line 3: structured clone copies csv to worker thread. Line 10: result posted back — main renders.' },
      { language: 'javascript', label: 'Inline Worker via Blob URL', code: 'const code = `self.onmessage = (e) => self.postMessage(e.data * 2);`;\nconst blob = new Blob([code], { type: "application/javascript" });\nconst worker = new Worker(URL.createObjectURL(blob));\nworker.postMessage(21);\nworker.onmessage = (e) => console.log(e.data); // 42', explanation: 'Bundle-friendly pattern when separate file awkward — revoke object URL after create.' },
      { language: 'javascript', label: 'Node worker_threads', code: 'import { Worker } from "node:worker_threads";\nconst worker = new Worker(new URL("./hash.js", import.meta.url));\nworker.postMessage({ buffer: largeBuffer });\nconst result = await new Promise((r) => worker.on("message", r));', explanation: 'Node Workers share some APIs; pass SharedArrayBuffer or transfer ArrayBuffer.' },
      { language: 'javascript', label: 'Failure — DOM in Worker', code: '// inside worker.js\n// document.getElementById("x"); // ReferenceError: document is not defined', explanation: 'Workers cannot touch DOM — only postMessage results to main for rendering.' },
    ],
    compareTitle: 'Concurrency options', compareHeaders: ['Tool', 'Use case', 'DOM'],
    compareRows: [
      ['async/await', 'I/O overlap', 'Yes'],
      ['Web Worker', 'CPU parallel', 'No'],
      ['Worker pool', 'Many CPU jobs', 'No'],
      ['C# Task.Run', 'CPU on pool', 'N/A'],
    ],
    mistakes: 'Workers for every fetch. Not terminating idle workers. Loading huge scripts into every worker.',
    seniorProse: 'Module Workers (type: module) support ESM import in workers. COOP/COEP required for SharedArrayBuffer. Measure postMessage copy cost — may need transferables. Production: pool size = CPU cores - 1.',
    seniorTable: { title: 'Tradeoffs', headers: ['Approach', 'Wins', 'Fails'], rows: [
      ['Single Worker', 'Simple', 'One job at a time'],
      ['Worker pool', 'Throughput', 'Complexity'],
      ['Main thread parse', 'No copy overhead', 'UI jank'],
      ['WASM in Worker', 'Near-native CPU', 'Build pipeline'],
    ]},
    seniorWarning: 'Uses Worker for fetch. Tries DOM in worker. Says Workers share memory by default.',
    interviewTakeaways: [
      'Worker = separate thread, own event loop, no DOM.',
      'postMessage for communication; structured clone copies.',
      'CPU-bound yes; I/O-bound use async.',
      '60s: new Worker spawns thread. postMessage in/out. No window/document. CPU parse/crypto offload. Node worker_threads similar. Not for fetch waiting.',
      'Follow-up: when NOT to use a Worker?',
    ],
    commonPitfalls: [
      'Weak: Worker for parallel HTTP — use Promise.all.',
      'Weak: access document in worker.',
      'Strong: CPU offload + postMessage + terminate when idle.',
    ],
    relatedTopicIds: ['javascript-15-postmessage-and-transferables', 'javascript-15-worker-pools-and-patterns', 'javascript-13-why-async-javascript'],
    jsTsCorrelations: [
      { language: 'typescript', concept: 'Worker types', note: 'lib.webworker types for self and postMessage payloads.', futureTopicSlug: 'typescript/dom/web-workers' },
      { language: 'typescript', concept: 'Task.Run', note: 'C# comparison: Task.Run CPU work on pool — shared memory unlike Workers.', futureTopicSlug: 'csharp/concurrency-and-threading/task-run' },
    ],
    officialSources: [
      { title: 'MDN — Web Workers API', url: 'https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API' },
      { title: 'Node.js — worker_threads', url: 'https://nodejs.org/api/worker_threads.html' },
    ],
    animationHint: 'compare', scenarioTag: 'csv-import',
  }),

  'postmessage-and-transferables': buildTopic({
    id: 'javascript-15-postmessage-and-transferables', slug: 'postmessage-and-transferables',
    title: 'postMessage, structured clone, and transferables', moduleId: 'javascript-15-workers-and-concurrency', order: 2,
    hook: 'postMessage copies most data via the structured clone algorithm — expensive for large ArrayBuffers. Transferables move ownership zero-copy: after transfer, the sender\'s buffer is detached and unusable.',
    whatIs: '**Structured clone**: recursive copy of supported types (objects, arrays, Map, Date, ArrayBuffer copy). **Transfer list**: second argument `[buffer]` **moves** ArrayBuffer, MessagePort, ImageBitmap — sender loses access. **Clone vs transfer**: clone duplicates memory; transfer reassigns ownership without copy.',
    glossary: [
      { term: 'structured clone', longForm: 'structured clone algorithm', plainDefinition: 'Deep copy for postMessage and indexedDB.', example: 'postMessage({ nested: [1,2] })' },
      { term: 'transferable', longForm: 'transferable object', plainDefinition: 'Object that can move between contexts without copy.', example: 'postMessage(buf, [buf])' },
      { term: 'detached ArrayBuffer', longForm: 'detached ArrayBuffer', plainDefinition: 'Buffer neutered after transfer — byteLength 0.', example: 'buf.byteLength === 0 after transfer' },
    ],
    whyMatters: 'Sending 50MB image bitmap to Worker via clone doubles memory briefly — transfer avoids copy. Forgetting transfer list on large TypedArray-backed buffers causes GC pressure and jank. MessageChannel ports transfer for bidirectional pipes.',
    whyCallout: { title: 'Functions not cloneable', body: 'postMessage cannot send functions or DOM nodes — only structured-cloneable types.' },
    steps: { title: 'Transfer flow', items: [
      { title: 'Create buffer', body: 'ArrayBuffer or TypedArray view.' },
      { title: 'postMessage data, [buffer]', body: 'List buffer in transfer array.' },
      { title: 'Sender detached', body: 'Original buffer unusable — intentional.' },
      { title: 'Receiver owns', body: 'Worker processes without copy cost.' },
    ]},
    diagramTitle: 'Clone vs transfer',
    diagramSource: 'flowchart TD\n  C[Clone postMessage] -->|copy bytes| W1[Worker copy]\n  T[Transfer postMessage] -->|move ownership| W2[Worker same memory]',
    snippets: [
      { language: 'javascript', label: 'Structured clone (copy)', code: 'const data = { items: new Uint8Array(1e6) };\nworker.postMessage(data);\n// data.items still usable on main — duplicate memory in worker', explanation: 'Clone copies 1MB — 2MB total briefly.' },
      { language: 'javascript', label: 'Transfer ArrayBuffer', code: 'const buf = new ArrayBuffer(1e6);\nworker.postMessage({ type: "process", buffer: buf }, [buf]);\nconsole.log(buf.byteLength); // 0 — detached', explanation: 'Line 2: transfer list moves buf — zero copy. Line 3: sender must not use buf after.' },
      { language: 'javascript', label: 'MessageChannel bidirectional', code: 'const channel = new MessageChannel();\nworker.postMessage({ port: channel.port1 }, [channel.port1]);\nchannel.port2.onmessage = (e) => console.log("from worker", e.data);\nchannel.port2.postMessage("hello");', explanation: 'Line 2: transfer port1 to worker; main keeps port2 for two-way comms.' },
      { language: 'javascript', label: 'Failure — use buffer after transfer', code: 'const view = new Uint8Array(buf);\nworker.postMessage({ buf }, [buf]);\nview[0] = 1; // TypeError or silent wrong — detached', explanation: 'Always stop using transferred buffers on sending side.' },
    ],
    compareTitle: 'Messaging costs', compareHeaders: ['Method', 'Memory', 'Sender after'],
    compareRows: [
      ['Clone', 'Duplicate', 'Keeps copy'],
      ['Transfer', 'Zero-copy move', 'Detached'],
      ['SharedArrayBuffer', 'Shared', 'Both access — Atomics'],
      ['C# Pipe', 'Copy or unsafe', 'Stream semantics'],
    ],
    mistakes: 'Cloning multi-MB buffers. Using buffer after transfer. Sending non-cloneable functions.',
    seniorProse: 'Serialization cost dominates small messages — batch work per postMessage. Comlink library abstracts RPC over postMessage. In Node worker_threads, transfer list same semantics. Benchmark clone vs transfer for image processing pipeline.',
    seniorTable: { title: 'Tradeoffs', headers: ['Choice', 'Wins', 'Fails'], rows: [
      ['Clone small objects', 'Simple', 'Large binary'],
      ['Transfer buffers', 'Fast', 'Sender loses access'],
      ['SAB + Atomics', 'Shared state', 'COOP/COEP headers'],
      ['Many tiny messages', 'Low latency each', 'Overhead'],
    ]},
    seniorWarning: 'Clones 100MB and wonders why slow. Uses buffer after transfer. Thinks postMessage shares object reference.',
    interviewTakeaways: [
      'structured clone deep-copies supported types.',
      'Transfer list moves ArrayBuffer — sender detached.',
      'Functions/DOM not cloneable.',
      '60s: postMessage clones by default. Transfer [buffer] for zero-copy — byteLength 0 on sender. MessagePort transferable. SharedArrayBuffer different — shared memory.',
      'Follow-up: clone vs transfer for 10MB image?',
    ],
    commonPitfalls: [
      'Weak: clone large ArrayBuffer every frame.',
      'Weak: read buffer after transfer.',
      'Strong: transfer list + detached check + batch messages.',
    ],
    relatedTopicIds: ['javascript-15-web-workers-basics', 'javascript-15-sharedarraybuffer-and-atomics', 'javascript-03-json-and-serialization'],
    jsTsCorrelations: [
      { language: 'typescript', concept: 'Transferable', note: 'TypeScript Transferable type for transfer list elements.', futureTopicSlug: 'typescript/dom/transferable' },
      { language: 'typescript', concept: 'MemoryMarshal', note: 'C# comparison: unsafe shared memory different model — Workers use explicit transfer.', futureTopicSlug: 'csharp/span-unsafe-interop/memory-marshal' },
    ],
    officialSources: [
      { title: 'MDN — structuredClone', url: 'https://developer.mozilla.org/en-US/docs/Web/API/structuredClone' },
      { title: 'HTML spec — Transferable objects', url: 'https://html.spec.whatwg.org/multipage/structured-data.html#transferable-objects' },
    ],
    animationHint: 'compare',
  }),

  'sharedarraybuffer-and-atomics': buildTopic({
    id: 'javascript-15-sharedarraybuffer-and-atomics', slug: 'sharedarraybuffer-and-atomics',
    title: 'SharedArrayBuffer and Atomics', moduleId: 'javascript-15-workers-and-concurrency', order: 3,
    hook: 'SharedArrayBuffer lets Workers and the main thread read the same memory — but without Atomics, you get data races. Atomics.add and Atomics.wait coordinate lock-free counters and semaphores across threads.',
    whatIs: '**SharedArrayBuffer (SAB)**: fixed-length raw binary buffer shared across agents. **Atomics**: atomic read-modify-write (`add`, `compareExchange`) and **wait/notify** for futex-style blocking. Requires **cross-origin isolation** headers: `Cross-Origin-Opener-Policy: same-origin` and `Cross-Origin-Embedder-Policy: require-corp`.',
    glossary: [
      { term: 'SharedArrayBuffer', longForm: 'SharedArrayBuffer', plainDefinition: 'Growable-fixed buffer shared between threads.', example: 'new SharedArrayBuffer(1024)' },
      { term: 'Atomics', longForm: 'Atomics API', plainDefinition: 'Atomic operations on Int32Array views of SAB.', example: 'Atomics.add(ia32, 0, 1)' },
      { term: 'COOP/COEP', longForm: 'cross-origin isolation', plainDefinition: 'HTTP headers required for SAB after Spectre mitigations.', example: 'COEP require-corp' },
    ],
    whyMatters: 'High-frequency counters (frames rendered, bytes processed) without postMessage per increment. WASM pthreads use SAB. Without Atomics, torn reads corrupt shared state. Most web apps never need SAB — postMessage suffices.',
    whyCallout: { title: 'Security gate', body: 'SAB disabled unless page is cross-origin isolated — check self.crossOriginIsolated.' },
    steps: { title: 'Shared counter pattern', items: [
      { title: 'Allocate SAB', body: 'new SharedArrayBuffer(4) — share with Worker.' },
      { title: 'Int32Array view', body: 'Both threads use same view on index 0.' },
      { title: 'Atomics.add', body: 'Thread-safe increment.' },
      { title: 'Atomics.wait/notify', body: 'Worker waits; main notifies on work available.' },
    ]},
    diagramTitle: 'Shared memory coordination',
    diagramSource: 'flowchart LR\n  M[Main Int32Array view] --- SAB[SharedArrayBuffer]\n  W[Worker view] --- SAB\n  M -->|Atomics.notify| W',
    snippets: [
      { language: 'javascript', label: 'Atomic counter', code: 'const sab = new SharedArrayBuffer(4);\nconst counter = new Int32Array(sab);\nconst worker = new Worker("inc-worker.js");\nworker.postMessage(sab);\n\n// inc-worker.js: self.onmessage = (e) => {\n//   const c = new Int32Array(e.data);\n//   setInterval(() => Atomics.add(c, 0, 1), 1);\n// };\nconsole.log(Atomics.load(counter, 0));', explanation: 'Line 1: shared buffer. Atomics.add safe concurrent increment from worker.' },
      { language: 'javascript', label: 'Atomics.wait / notify', code: 'const sab = new SharedArrayBuffer(8);\nconst state = new Int32Array(sab);\n// Worker: while (Atomics.wait(state, 0, 0) === "ok") { processJob(); Atomics.store(state, 0, 0); }\n// Main: Atomics.store(state, 0, 1); Atomics.notify(state, 0);', explanation: 'Worker blocks on wait until main notifies new work — futex pattern.' },
      { language: 'javascript', label: 'Check cross-origin isolated', code: 'if (!crossOriginIsolated) {\n  console.warn("SAB unavailable — use postMessage instead");\n} else {\n  const sab = new SharedArrayBuffer(1024);\n}', explanation: 'Feature detect before allocating SAB in production.' },
      { language: 'javascript', label: 'Failure — race without Atomics', code: 'const sab = new SharedArrayBuffer(4);\nconst arr = new Int32Array(sab);\n// Two threads: arr[0]++ without Atomics — lost updates', explanation: 'Plain read-modify-write races — use Atomics.add or postMessage.' },
    ],
    compareTitle: 'Shared vs message', compareHeaders: ['Pattern', 'Latency', 'Complexity'],
    compareRows: [
      ['postMessage', 'Copy/transfer cost', 'Low'],
      ['SAB + Atomics', 'Shared reads', 'High — races'],
      ['Mutex in WASM', 'Fine-grained', 'Very high'],
      ['C# lock', 'Shared memory threads', 'Medium'],
    ],
    mistakes: 'SAB without COOP/COEP headers. Non-atomic updates to shared Int32. Using SAB when postMessage enough.',
    seniorProse: 'Spectre led to SAB gating. Ring buffers in SAB for audio worklets. compareExchange implements lock-free queue head. Most teams: avoid SAB unless WASM pthreads or extreme perf need.',
    seniorTable: { title: 'Tradeoffs', headers: ['Approach', 'Wins', 'Fails'], rows: [
      ['SAB counter', 'No message per inc', 'Header requirements'],
      ['postMessage batch', 'Simple', 'Copy cost'],
      ['Atomics.wait', 'Efficient block', 'Main thread caution'],
      ['Mutex simulation', 'Correctness', 'Complex deadlocks'],
    ]},
    seniorWarning: 'Non-atomic shared writes. No COOP/COEP awareness. Says SAB works everywhere post-2020 without headers.',
    interviewTakeaways: [
      'SAB shared memory across Workers; requires cross-origin isolation.',
      'Atomics for thread-safe ops; wait/notify for coordination.',
      'Data races without Atomics.',
      '60s: SharedArrayBuffer same memory multiple threads. Atomics.add/compareExchange. COOP COEP required. Prefer postMessage unless need shared state. C# lock on shared vars analog.',
      'Follow-up: why SAB disabled by default?',
    ],
    commonPitfalls: [
      'Weak: arr[0]++ from two threads.',
      'Weak: SAB without crossOriginIsolated check.',
      'Strong: Atomics + headers + when postMessage enough.',
    ],
    relatedTopicIds: ['javascript-15-postmessage-and-transferables', 'javascript-15-worker-pools-and-patterns', 'javascript-15-workers-vs-csharp-threading'],
    jsTsCorrelations: [
      { language: 'typescript', concept: 'SharedArrayBuffer types', note: 'SharedArrayBuffer in lib — same as ArrayBuffer for typing views.', futureTopicSlug: 'typescript/collections/typed-arrays' },
      { language: 'typescript', concept: 'Interlocked', note: 'C# comparison: Interlocked.Increment like Atomics.add.', futureTopicSlug: 'csharp/concurrency-and-threading/interlocked' },
    ],
    officialSources: [
      { title: 'MDN — SharedArrayBuffer', url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/SharedArrayBuffer' },
      { title: 'MDN — Atomics', url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Atomics' },
    ],
    animationHint: 'compare', scenarioTag: 'high-concurrency',
  }),

  'worker-pools-and-patterns': buildTopic({
    id: 'javascript-15-worker-pools-and-patterns', slug: 'worker-pools-and-patterns',
    title: 'Worker pools and offloading CPU work', moduleId: 'javascript-15-workers-and-concurrency', order: 4,
    hook: 'One Worker processes one CPU job at a time. A pool of N Workers matches available cores — queue tasks from the main thread and collect results like a mini thread pool for parsing, hashing, or image thumbnails.',
    whatIs: '**Worker pool**: fixed array of Worker instances, **task queue**, dispatch idle worker on new job, resolve Promise when worker posts result. **Patterns**: round-robin, least-busy, **comlink** RPC wrapper. Different from **async pool** (module 13) — Workers use real OS threads for CPU.',
    glossary: [
      { term: 'worker pool', longForm: 'worker pool', plainDefinition: 'Reuse N Workers for many tasks.', example: 'pool.run(parseCsv, data)' },
      { term: 'task queue', longForm: 'worker task queue', plainDefinition: 'Pending jobs when all workers busy.', example: 'FIFO queue of { resolve, payload }' },
      { term: 'comlink', longForm: 'Comlink library', plainDefinition: 'RPC proxy over postMessage.', example: 'Comlink.wrap(worker).parse(data)' },
    ],
    whyMatters: 'Spawning Worker per CSV upload exhausts memory — 50 Workers × 10MB script heap. Pool of 4 matches quad-core laptop. SQS-style batch: main receives messages, pool workers hash/validate in parallel, aggregate on main.',
    whyCallout: { title: 'Pool size', body: 'Often navigator.hardwareConcurrency or cores - 1 — profile on target devices.' },
    steps: { title: 'Pool dispatch', items: [
      { title: 'Enqueue task', body: 'Push job + Promise resolver to queue.' },
      { title: 'Find idle worker', body: 'Or wait until one finishes current job.' },
      { title: 'postMessage job', body: 'Worker processes; posts result with job id.' },
      { title: 'Resolve + next', body: 'Resolve Promise; dispatch next queued task.' },
    ]},
    diagramTitle: 'Worker pool queue',
    diagramSource: 'flowchart TD\n  Q[Task queue] --> W1[Worker 1]\n  Q --> W2[Worker 2]\n  Q --> W3[Worker 3]\n  W1 --> R[Results]',
    snippets: [
      { language: 'javascript', label: 'Minimal Worker pool', code: 'function createPool(size, scriptUrl) {\n  const workers = Array.from({ length: size }, () => new Worker(scriptUrl));\n  const queue = [];\n  const busy = new Set();\n\n  function dispatch(worker) {\n    const job = queue.shift();\n    if (!job) { busy.delete(worker); return; }\n    busy.add(worker);\n    worker.onmessage = (e) => {\n      job.resolve(e.data);\n      dispatch(worker);\n    };\n    worker.postMessage(job.payload);\n  }\n\n  return {\n    run(payload) {\n      return new Promise((resolve) => {\n        queue.push({ payload, resolve });\n        const idle = workers.find((w) => !busy.has(w));\n        if (idle) dispatch(idle);\n      });\n    },\n  };\n}', explanation: 'Line 8: on job complete, dispatch next from queue. Line 19: assign idle worker on enqueue.' },
      { language: 'javascript', label: 'Batch CSV rows through pool', code: 'const pool = createPool(4, "row-validator.js");\nconst rows = await fetch("/import.csv").then((r) => r.text()).then(parseLines);\nconst results = await Promise.all(rows.map((row) => pool.run({ row })));\nconst invalid = results.filter((r) => !r.valid);', explanation: 'Line 3: 10k rows queued — pool keeps 4 Workers busy without 10k Worker spawns.' },
      { language: 'javascript', label: 'Terminate pool on unload', code: 'window.addEventListener("beforeunload", () => {\n  workers.forEach((w) => w.terminate());\n});', explanation: 'Terminate frees thread and memory — important for SPAs.' },
      { language: 'javascript', label: 'Failure — unbounded Workers', code: 'rows.forEach((row) => {\n  const w = new Worker("validate.js");\n  w.postMessage(row); // 10000 Workers!\n});', explanation: 'Spawn per row — browser tab crash. Use pool.' },
    ],
    compareTitle: 'Pool types', compareHeaders: ['Pool', 'Threads', 'Use'],
    compareRows: [
      ['async mapPool', '1 JS thread', 'I/O cap'],
      ['Worker pool', 'N OS threads', 'CPU cap'],
      ['C# Parallel.For', 'Thread pool', 'CPU + I/O'],
      ['Cluster module', 'Node processes', 'Multi-core servers'],
    ],
    mistakes: 'New Worker per task. No queue when saturated. Forgetting terminate on page leave.',
    seniorProse: 'comlink simplifies API surface. For Node CPU work at scale use worker_threads pool or child_process cluster. Measure queue depth metric — growing queue means increase pool or optimize worker script.',
    seniorTable: { title: 'Tradeoffs', headers: ['Size', 'Effect', 'Risk'], rows: [
      ['1 Worker', 'Low memory', 'Serial CPU'],
      ['hardwareConcurrency', 'Balanced', 'Mobile thermal throttle'],
      ['Oversubscribe', 'Queue latency', 'Context switch cost'],
      ['Main thread', 'No copy', 'Jank'],
    ]},
    seniorWarning: 'Confuses Worker pool with Promise.all pool. Spawns unlimited Workers. No task queue.',
    interviewTakeaways: [
      'Pool = fixed Workers + task queue + dispatch idle.',
      'CPU-bound — not for overlapping fetch.',
      'Size ≈ hardwareConcurrency.',
      '60s: Reuse N Workers. Queue jobs. postMessage when idle. Different from async semaphore — real threads. Terminate on unload. SQS batch validate pattern.',
      'Follow-up: design pool API returning Promise per job.',
    ],
    commonPitfalls: [
      'Weak: new Worker per row.',
      'Weak: use Worker pool for HTTP.',
      'Strong: queue + idle dispatch + terminate + core count sizing.',
    ],
    relatedTopicIds: ['javascript-15-web-workers-basics', 'javascript-13-async-concurrency-limits', 'javascript-15-postmessage-and-transferables'],
    jsTsCorrelations: [
      { language: 'typescript', concept: 'Generic pool API', note: 'pool.run<T, R>(payload: T): Promise<R> — type job and result.', futureTopicSlug: 'typescript/generics/generic-functions' },
      { language: 'typescript', concept: 'Parallel.For', note: 'C# comparison: Parallel.ForEach for CPU — shared memory unlike Worker message passing.', futureTopicSlug: 'csharp/concurrency-and-threading/parallel-for' },
    ],
    officialSources: [
      { title: 'MDN — Worker', url: 'https://developer.mozilla.org/en-US/docs/Web/API/Worker' },
      { title: 'Comlink', url: 'https://github.com/GoogleChromeLabs/comlink' },
    ],
    animationHint: 'flow', scenarioTag: 'sqs-consumer',
  }),

  'workers-vs-csharp-threading': buildTopic({
    id: 'javascript-15-workers-vs-csharp-threading', slug: 'workers-vs-csharp-threading',
    title: 'Workers versus C# threads and Task.Run', moduleId: 'javascript-15-workers-and-concurrency', order: 5,
    hook: 'C# threads share heap memory with locks; JavaScript Workers are isolated agents communicating only via postMessage — closer to processes than threads, despite the name "Worker thread".',
    whatIs: '**C# Thread / Task.Run**: shared address space, `lock`, `ConcurrentDictionary`, **race conditions** if unsynchronized. **JS Worker**: separate V8 isolate (usually), no shared JS objects — **structured clone** or **SAB+Atomics** exception. **Main thread**: single JS execution agent. **Node cluster**: multiple processes, not Workers.',
    glossary: [
      { term: 'isolate', longForm: 'V8 isolate', plainDefinition: 'Separate JS heap and execution in Worker.', example: 'No shared global object' },
      { term: 'Task.Run', longForm: 'C# Task.Run', plainDefinition: 'Queue work to thread pool.', example: 'Task.Run(() => Compute())' },
      { term: 'shared memory', longForm: 'shared memory threading', plainDefinition: 'C# default; JS only via SAB.', example: 'lock (_gate) { ... }' },
    ],
    whyMatters: 'C# devs porting algorithms expect `static int counter` visible to all threads — in Workers each has own counter unless SAB. Task.Run for CPU parallels Worker; async I/O parallels Promise — different axes.',
    whyCallout: { title: 'Two axes', body: 'Parallelism (Workers/Task.Run) vs async I/O overlap (Promise/async) — orthogonal in both ecosystems.' },
    steps: { title: 'Choose the tool', items: [
      { title: 'I/O bound', body: 'JS: async/await. C#: async Task.' },
      { title: 'CPU bound JS', body: 'Worker pool or WASM.' },
      { title: 'CPU bound C#', body: 'Task.Run or Parallel.For.' },
      { title: 'Shared state', body: 'C#: locks. JS: postMessage or SAB Atomics.' },
    ]},
    diagramTitle: 'Memory models',
    diagramSource: 'flowchart TD\n  subgraph CSharp\n    T1[Thread 1] --> H[Shared heap]\n    T2[Thread 2] --> H\n  end\n  subgraph JS\n    M[Main] <-->|messages| W[Worker isolate]\n  end',
    snippets: [
      { language: 'javascript', label: 'JS — no shared counter', code: '// main.js\nlet count = 0;\nworker.postMessage("inc");\n// worker cannot increment main count — must postMessage back', explanation: 'Isolated globals — unlike C# static field.' },
      { language: 'csharp', label: 'C# shared counter with lock', code: 'static int count;\nstatic readonly object gate = new();\n\nTask.Run(() => { lock (gate) { count++; } });\nTask.Run(() => { lock (gate) { count++; } });', explanation: 'Threads share count — synchronize with lock.' },
      { language: 'javascript', label: 'JS aggregate results via messages', code: 'let total = 0;\nworker.onmessage = (e) => { total += e.data.partial; };\nworkers.forEach((w) => w.postMessage(chunk));', explanation: 'Main aggregates partial CPU results — message passing not shared mutation.' },
      { language: 'csharp', label: 'C# Parallel aggregate', code: 'var sum = 0;\nParallel.ForEach(chunks, () => new int(), (c, state, local) => local + Sum(c), local => Interlocked.Add(ref sum, local));', explanation: 'Thread-local aggregation then Interlocked — shared sum safely.' },
    ],
    compareTitle: 'Workers vs threads', compareHeaders: ['Aspect', 'JS Worker', 'C# Thread'],
    compareRows: [
      ['Memory', 'Isolated (SAB exception)', 'Shared heap'],
      ['Communication', 'postMessage', 'Shared vars + locks'],
      ['DOM / UI', 'Main only', 'UI thread rules'],
      ['Spawn cost', 'Higher isolate', 'Pool cheaper'],
      ['Race bugs', 'Rare without SAB', 'Common without lock'],
    ],
    mistakes: 'Expect shared globals across Workers. Using C# lock mental model in JS. Task.Run equivalent for fetch.',
    seniorProse: 'Node worker_threads closer to C# than browser Workers but still message-first. WASM pthreads + SAB bridge ecosystems. Interview: draw two models; cite Spectre isolation for SAB.',
    seniorTable: { title: 'Mapping', headers: ['C#', 'JavaScript', 'Notes'], rows: [
      ['Task.Run CPU', 'Worker pool', 'Parallel compute'],
      ['async I/O', 'Promise/async', 'Overlap waits'],
      ['lock', 'Atomics / postMessage', 'Coordination'],
      ['ConcurrentBag', 'Main aggregates messages', 'Result collection'],
    ]},
    seniorWarning: 'Says Workers share JS heap. Maps Task.Run to fetch. No isolation concept.',
    interviewTakeaways: [
      'Workers = isolated agents; C# threads share heap.',
      'postMessage vs locks for coordination.',
      'Task.Run ≈ Worker for CPU; async ≈ Promise for I/O.',
      '60s: C# threads share memory need locks. JS Workers isolated postMessage. SAB+Atomics exception. CPU: Worker vs Task.Run. I/O: async both. No DOM in Worker.',
      'Follow-up: implement shared counter in both models.',
    ],
    commonPitfalls: [
      'Weak: static variable shared across Workers.',
      'Weak: Worker for I/O latency.',
      'Strong: isolation + message aggregate + axis CPU vs I/O.',
    ],
    relatedTopicIds: ['javascript-15-web-workers-basics', 'javascript-13-promises-vs-csharp-task', 'javascript-15-sharedarraybuffer-and-atomics'],
    jsTsCorrelations: [
      { language: 'typescript', concept: 'No thread types', note: 'TS does not model Worker isolation — structural typing on message payloads only.', futureTopicSlug: 'typescript/dom/worker-messages' },
      { language: 'typescript', concept: 'Threading', note: 'C# comparison: lock, Monitor, SemaphoreSlim — no direct JS equivalent except Atomics.', futureTopicSlug: 'csharp/concurrency-and-threading/locks' },
    ],
    officialSources: [
      { title: 'MDN — Web Workers', url: 'https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API' },
      { title: 'Microsoft — Parallel programming', url: 'https://learn.microsoft.com/en-us/dotnet/standard/parallel-programming/' },
    ],
    animationHint: 'compare',
  }),
};
