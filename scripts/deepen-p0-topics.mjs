/**
 * Hand-written P0 topic content — imported by deepen-all-topics.mjs
 */

export function getP0Topic(slug, language, ctx) {
  const builders = {
    'var-let-const-and-tdz': buildVarLetConstTdz,
    'debounce-throttle-implementations': buildDebounceThrottle,
    'implementing-promise-from-scratch': buildPromiseFromScratch,
    'v8-garbage-collection': buildV8Gc,
    'strict-null-checks': buildStrictNullChecks,
    'infer-keyword': buildInferKeyword,
    'discriminated-unions-narrowing': buildDiscriminatedUnions,
    'branded-and-opaque-types': buildBrandedOpaque,
  };
  const fn = builders[slug];
  return fn ? fn(language, ctx) : null;
}

function snippet(language, label, code, explanation) {
  return { language, label, code, explanation };
}

function buildVarLetConstTdz(language, ctx) {
  if (language !== 'javascript') return null;
  const { topic, module, relatedTopicIds } = ctx;
  return {
    hook:
      'let and const are block-scoped with a temporal dead zone — accessing them before the declaration throws ReferenceError. var is function-scoped, hoisted to undefined, and creates global properties on window — the classic for-loop closure bug.',
    sections: [
      {
        heading: 'What are var, let, const, and the TDZ?',
        blocks: [
          {
            type: 'prose',
            text:
              '**Bindings** declare names for values. **const** creates a block-scoped binding that cannot be reassigned (object contents can still mutate). **let** is block-scoped and reassignable. **var** is function-scoped, hoisted to `undefined`, and ignores block boundaries — legacy only. The **temporal dead zone (TDZ)** is the span from block entry until `let`/`const` initialization where the binding exists but is uninitialized — reading it throws **ReferenceError**, not `undefined`.',
          },
          {
            type: 'glossary',
            title: 'Key terms',
            entries: [
              {
                term: 'TDZ',
                shortForm: 'TDZ',
                longForm: 'temporal dead zone',
                plainDefinition:
                  'Period between entering a block and executing let/const where the binding is inaccessible.',
                example: 'console.log(x); let x = 1; // ReferenceError',
              },
              {
                term: 'hoisting',
                longForm: 'variable hoisting',
                plainDefinition:
                  'var declarations are registered at function top and initialized to undefined before statements run.',
                example: 'console.log(a); var a = 2; // undefined, not error',
              },
              {
                term: 'block scope',
                longForm: 'block scope',
                plainDefinition: 'let/const visible only inside { } — like C# locals.',
                example: 'if (ok) { let x = 1; } // x not visible outside',
              },
              {
                term: 'const',
                longForm: 'const binding',
                plainDefinition:
                  'Cannot reassign the binding; shallow freeze for objects — properties still mutable.',
                example: 'const cfg = {}; cfg.retries = 3; // OK',
              },
            ],
          },
        ],
      },
      {
        heading: 'Why binding choice matters in production',
        blocks: [
          {
            type: 'prose',
            text:
              'Default to **const**; use **let** when reassignment is required. Never use **var** in new code — it leaks across blocks and the loop closure trap still appears in legacy codebases. **TDZ** catches use-before-declare bugs that **var** masks with `undefined`. In strict mode, assigning to an undeclared name throws; **var** at top level creates a **window** property in browsers.',
          },
          {
            type: 'callout',
            variant: 'remember',
            title: 'C# comparison',
            body:
              'C# locals are block-scoped like let. C# const is compile-time constant — JS const is a runtime binding that cannot be reassigned. C# has no hoisted var equivalent. TDZ is like definite assignment analysis but enforced at run time.',
          },
        ],
      },
      {
        heading: 'How hoisting and TDZ work step by step',
        blocks: [
          {
            type: 'steps',
            title: 'Engine binding creation',
            items: [
              {
                title: 'Enter scope',
                body: 'Function or block starts — environment record created.',
              },
              {
                title: 'Register var',
                body: 'var names hoisted and initialized to undefined immediately.',
              },
              {
                title: 'Register let/const',
                body: 'Names registered but uninitialized — TDZ active.',
              },
              {
                title: 'Execute line by line',
                body: 'let/const initializer runs — TDZ ends for that binding.',
              },
            ],
          },
          {
            type: 'diagram',
            diagram: {
              type: 'mermaid',
              title: 'TDZ versus var hoisting',
              source:
                'flowchart TD\n  A[Enter block] --> B{Declaration kind?}\n  B -->|var| C[Hoist to undefined]\n  B -->|let/const| D[TDZ — unreadable]\n  D --> E[Initializer runs]\n  E --> F[Binding usable]\n  C --> G[Readable as undefined]',
            },
          },
        ],
      },
      {
        heading: 'Code walkthrough: const, let, var, and loop traps',
        blocks: [
          {
            type: 'snippet',
            snippet: snippet(
              'javascript',
              'const default, let when needed',
              `const API_BASE = 'https://api.example.com';\nlet retryCount = 0;\n\nfunction bump() {\n  retryCount += 1;\n  return retryCount;\n}\n\n// const cannot reassign\n// API_BASE = 'other'; // TypeError`,
              'const for values that will not be rebound; let for counters and loop indices that change.',
            ),
          },
          {
            type: 'snippet',
            snippet: snippet(
              'javascript',
              'TDZ ReferenceError',
              `function demo() {\n  // console.log(value); // ReferenceError — TDZ\n  let value = 42;\n  console.log(value); // 42\n}\n\ndemo();`,
              'let/const are in TDZ from block start until their declaration line executes — unlike var which reads undefined.',
            ),
          },
          {
            type: 'snippet',
            snippet: snippet(
              'javascript',
              'for-loop closure: var vs let',
              `const funcsVar = [];\nfor (var i = 0; i < 3; i++) {\n  funcsVar.push(() => i);\n}\nconsole.log(funcsVar.map(f => f())); // [3, 3, 3]\n\nconst funcsLet = [];\nfor (let j = 0; j < 3; j++) {\n  funcsLet.push(() => j);\n}\nconsole.log(funcsLet.map(f => f())); // [0, 1, 2]`,
              'var shares one binding across iterations; let creates a new binding per iteration — the classic interview trap.',
            ),
          },
          {
            type: 'snippet',
            snippet: snippet(
              'javascript',
              'var hoisting and global leakage',
              `function legacy() {\n  if (false) {\n    var hidden = 1; // still hoisted\n  }\n  console.log(hidden); // undefined\n}\n\n// top-level var in browser attaches to window\nvar globalFlag = true;\n// window.globalFlag === true`,
              'var ignores block boundaries for hoisting. Prefer let/const so dead branches do not pollute outer scope.',
            ),
          },
        ],
      },
      {
        heading: 'Compare with C# and TypeScript',
        blocks: [
          {
            type: 'comparisonTable',
            title: 'Binding model matrix',
            headers: ['Feature', 'JavaScript', 'C#', 'TypeScript'],
            rows: [
              ['Default choice', 'const, then let', 'type inferred var', 'const, then let — same as JS'],
              ['Block scope', 'let, const', 'all locals', 'same as JS at emit'],
              ['Hoisting', 'var only', 'none', 'none for let/const'],
              ['TDZ', 'let, const at runtime', 'definite assignment (compile)', 'no TDZ — compile errors'],
              ['Loop closure', 'let per iteration', 'new variable per foreach', 'same as JS'],
            ],
          },
        ],
      },
      {
        heading: 'Common mistakes to avoid',
        blocks: [
          {
            type: 'callout',
            variant: 'warning',
            title: 'Binding pitfalls',
            body:
              'Using var in new code. Assuming const deep-freezes objects. Accessing let before declaration (TDZ). Using var in for-loops with async callbacks. Reassigning const bindings. Declaring const without initializer.',
          },
        ],
      },
    ],
    interviewTakeaways: [
      'const is the default; let when reassignment is needed; never var in new code.',
      'TDZ: let/const throw ReferenceError before initialization — var returns undefined.',
      'for (let i) creates per-iteration binding; for (var i) shares one binding.',
      '60s: Block-scoped let/const with TDZ versus hoisted var. Loop closure trap. C# locals are like let. const does not deep-freeze objects.',
      'Follow-up: what happens with let in switch cases without blocks?',
    ],
    commonPitfalls: [
      "Weak: 'var, let, const are interchangeable' — var hoists and ignores blocks.",
      "Weak: 'const makes objects immutable' — only the binding is fixed; properties mutate.",
      "Weak: 'TDZ is the same as undefined' — TDZ throws ReferenceError.",
      "Strong: 'Default const; let for reassignment; explain TDZ and per-iteration let in loops; compare to C# definite assignment.'",
    ],
    relatedTopicIds,
    jsTsCorrelations: [
      {
        language: 'typescript',
        concept: 'let/const and block scope',
        note: 'TypeScript emits let/const unchanged. noImplicitAny and strict mode align with avoiding var.',
        futureTopicSlug: 'typescript/syntax/bindings',
      },
    ],
    officialSources: [
      {
        title: 'let',
        url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/let',
      },
      {
        title: 'const',
        url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/const',
      },
      {
        title: 'Temporal dead zone',
        url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/let#temporal_dead_zone_tdz',
      },
    ],
    animationHint: 'stack-heap',
    scenarioTag: 'auth-token',
  };
}

function buildDebounceThrottle(language, ctx) {
  if (language !== 'javascript') return null;
  const { relatedTopicIds } = ctx;
  return {
    hook:
      'Debounce waits for a pause in events before firing — ideal for search-as-you-type. Throttle caps execution rate — ideal for scroll and resize handlers. Both are closure patterns that control how often expensive work runs.',
    sections: [
      {
        heading: 'What are debounce and throttle?',
        blocks: [
          {
            type: 'prose',
            text:
              '**Debounce** delays invocation until the caller stops triggering for `wait` milliseconds — only the last call in a burst runs. **Throttle** allows at most one call per `wait` window — first or last in the window depending on options. Both return a wrapped function preserving `this` and arguments via closures. They solve **rate limiting** without blocking the main thread — unlike C# timers on a thread pool, JS timers schedule macrotasks on the event loop.',
          },
          {
            type: 'glossary',
            title: 'Key terms',
            entries: [
              {
                term: 'debounce',
                longForm: 'debounce',
                plainDefinition: 'Coalesce rapid calls; execute after quiet period.',
                example: 'Search input — wait 300ms after last keystroke',
              },
              {
                term: 'throttle',
                longForm: 'throttle',
                plainDefinition: 'Limit execution frequency to once per interval.',
                example: 'Scroll handler — at most every 100ms',
              },
              {
                term: 'leading edge',
                longForm: 'leading edge invocation',
                plainDefinition: 'Throttle/debounce fires immediately on first call in window.',
                example: 'Button click throttle with { leading: true }',
              },
              {
                term: 'trailing edge',
                longForm: 'trailing edge invocation',
                plainDefinition: 'Fires after window ends — default debounce behavior.',
                example: 'Resize debounce fires when user stops dragging',
              },
            ],
          },
        ],
      },
      {
        heading: 'Why debounce and throttle matter in production',
        blocks: [
          {
            type: 'prose',
            text:
              'Unbounded event handlers cause jank and API storms. **Debounce** protects backends from one request per keystroke. **Throttle** keeps scroll animations at 60fps budget. Always **cancel** pending timers on unmount (React useEffect cleanup, AbortController for fetch inside). Pass stable function references or accept recreation on deps change.',
          },
          {
            type: 'callout',
            variant: 'tip',
            title: 'C# comparison',
            body:
              'C# uses DispatcherTimer or Task.Delay with CancellationToken for similar patterns. JS setTimeout/setInterval are not precise — drift under load. C# Reactive Extensions Throttle/ThrottleFirst map closely to debounce/throttle.',
          },
        ],
      },
      {
        heading: 'How implementations work step by step',
        blocks: [
          {
            type: 'steps',
            title: 'Debounce algorithm',
            items: [
              { title: 'Call wrapper', body: 'Clear any pending timeout id.' },
              { title: 'Schedule', body: 'setTimeout for wait ms with latest args and this.' },
              { title: 'Burst ends', body: 'Timer fires — invoke original fn once.' },
              { title: 'Cancel', body: 'Expose cancel() for cleanup on unmount.' },
            ],
          },
          {
            type: 'diagram',
            diagram: {
              type: 'mermaid',
              title: 'Debounce versus throttle timing',
              source:
                'sequenceDiagram\n  participant U as User events\n  participant D as Debounced fn\n  participant T as Throttled fn\n  U->>D: key key key (pause)\n  D->>D: execute once\n  U->>T: scroll scroll scroll\n  T->>T: execute at interval cap',
            },
          },
        ],
      },
      {
        heading: 'Code walkthrough: debounce and throttle from scratch',
        blocks: [
          {
            type: 'snippet',
            snippet: snippet(
              'javascript',
              'debounce with cancel',
              `function debounce(fn, wait) {\n  let timeoutId = null;\n  function debounced(...args) {\n    clearTimeout(timeoutId);\n    timeoutId = setTimeout(() => fn.apply(this, args), wait);\n  }\n  debounced.cancel = () => {\n    clearTimeout(timeoutId);\n    timeoutId = null;\n  };\n  return debounced;\n}\n\nconst onSearch = debounce((q) => fetch('/api?q=' + q), 300);`,
              'Each call resets the timer — only the last query fires after 300ms quiet.',
            ),
          },
          {
            type: 'snippet',
            snippet: snippet(
              'javascript',
              'throttle (trailing)',
              `function throttle(fn, wait) {\n  let last = 0;\n  let timeoutId = null;\n  return function throttled(...args) {\n    const now = Date.now();\n    const remaining = wait - (now - last);\n    if (remaining <= 0) {\n      last = now;\n      fn.apply(this, args);\n    } else if (!timeoutId) {\n      timeoutId = setTimeout(() => {\n        last = Date.now();\n        timeoutId = null;\n        fn.apply(this, args);\n      }, remaining);\n    }\n  };\n}`,
              'Ensures at most one call per wait window; schedules trailing call if invoked during cooldown.',
            ),
          },
          {
            type: 'snippet',
            snippet: snippet(
              'javascript',
              'React cleanup pattern',
              `useEffect(() => {\n  const onResize = debounce(() => setWidth(window.innerWidth), 150);\n  window.addEventListener('resize', onResize);\n  return () => {\n    onResize.cancel?.();\n    window.removeEventListener('resize', onResize);\n  };\n}, []);`,
              'Cancel pending debounced calls on unmount — prevents setState on unmounted component.',
            ),
          },
          {
            type: 'snippet',
            snippet: snippet(
              'javascript',
              'Leading debounce for button spam',
              `function debounceLeading(fn, wait) {\n  let timeoutId = null;\n  return function (...args) {\n    if (!timeoutId) fn.apply(this, args);\n    clearTimeout(timeoutId);\n    timeoutId = setTimeout(() => { timeoutId = null; }, wait);\n  };\n}`,
              'First click fires immediately; subsequent clicks ignored until wait elapses — UX for submit buttons.',
            ),
          },
        ],
      },
      {
        heading: 'Compare with C# and TypeScript',
        blocks: [
          {
            type: 'comparisonTable',
            title: 'Rate limiting patterns',
            headers: ['Pattern', 'JavaScript', 'C#', 'TypeScript'],
            rows: [
              ['Debounce', 'setTimeout + closure', 'Rx Throttle / custom timer', 'Typed wrappers around JS impl'],
              ['Throttle', 'timestamp + setTimeout', 'DispatcherTimer interval', 'Same runtime as JS'],
              ['Cleanup', 'cancel() + removeListener', 'CancellationToken', 'Return type includes cancel'],
              ['Precision', 'Event loop drift', 'Thread pool timers', 'No change at emit'],
            ],
          },
        ],
      },
      {
        heading: 'Common mistakes to avoid',
        blocks: [
          {
            type: 'callout',
            variant: 'warning',
            title: 'Event handler pitfalls',
            body:
              'Forgetting to remove listeners and cancel timers. Debouncing scroll when throttle is correct. Creating new debounced fn every render without useMemo. Not preserving this binding. Using debounce for button double-submit without leading edge.',
          },
        ],
      },
      {
        heading: 'Senior interview depth',
        blocks: [
          {
            type: 'prose',
            text:
              'Interviewers ask you to implement both from scratch, explain leading vs trailing, and discuss requestAnimationFrame for scroll versus setTimeout throttle. Mention lodash debounce options: maxWait, leading, trailing. For Node, debounce file watchers; for browsers, passive event listeners with throttle.',
          },
          {
            type: 'snippet',
            snippet: snippet(
              'javascript',
              'requestAnimationFrame throttle for scroll',
              `function rafThrottle(fn) {\n  let ticking = false;\n  return function (...args) {\n    if (!ticking) {\n      requestAnimationFrame(() => {\n        fn.apply(this, args);\n        ticking = false;\n      });\n      ticking = true;\n    }\n  };\n}`,
              'Syncs with paint cycle — preferred for visual scroll updates over arbitrary ms throttle.',
            ),
          },
        ],
      },
    ],
    interviewTakeaways: [
      'Debounce: execute after quiet period; throttle: cap rate per interval.',
      'Always expose cancel() and call it on component unmount.',
      'Scroll/resize: throttle or rAF; search input: debounce.',
      '60s: Debounce coalesces bursts; throttle limits frequency. Closure + setTimeout. C# Rx Throttle analog. Cleanup prevents memory leaks and stale setState.',
      'Follow-up: implement debounce with maxWait option.',
    ],
    commonPitfalls: [
      "Weak: 'debounce and throttle are the same' — debounce waits for pause; throttle caps rate.",
      "Weak: 'no cleanup needed' — pending timers fire after unmount.",
      "Weak: 'use debounce for scroll' — throttle or rAF fits scroll better.",
      "Strong: 'Implement both with cancel; pick by event semantics; cleanup listeners; compare to Rx Throttle.'",
    ],
    relatedTopicIds,
    jsTsCorrelations: [
      {
        language: 'typescript',
        concept: 'Typing debounce/throttle',
        note: 'Generic (...args: Parameters<F>) => void preserves callback signature. Return Debounced<F> with cancel method.',
        futureTopicSlug: 'typescript/functions/higher-order-function-types',
      },
      {
        language: 'typescript',
        concept: 'React hook typing',
        note: 'useMemo for stable debounced reference; useEffect cleanup typed with void return.',
        futureTopicSlug: 'typescript/react-hooks',
      },
    ],
    officialSources: [
      { title: 'setTimeout', url: 'https://developer.mozilla.org/en-US/docs/Web/API/setTimeout' },
      { title: 'Event loop', url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Event_loop' },
    ],
    animationHint: 'timeline',
    scenarioTag: 'high-concurrency',
  };
}

function buildPromiseFromScratch(language, ctx) {
  if (language !== 'javascript') return null;
  const { relatedTopicIds } = ctx;
  return {
    hook:
      'A Promise is a state machine: pending → fulfilled or rejected, with a thenable reaction queue drained as microtasks. Implementing a subset teaches why async/await desugars to then chains and why ordering matters.',
    sections: [
      {
        heading: 'What is a Promise implementation?',
        blocks: [
          {
            type: 'prose',
            text:
              '**Promise/A+** defines thenable behavior: `then(onFulfilled, onRejected)` returns a new Promise chaining results. States are **pending**, **fulfilled**, **rejected** — transitions are one-way. The executor runs synchronously; reactions run as **microtasks**. Your implementation needs: state, value/reason, handler queue, resolve/reject that drain queue, and `then` that wraps callbacks in try/catch.',
          },
          {
            type: 'glossary',
            title: 'Key terms',
            entries: [
              {
                term: 'executor',
                longForm: 'Promise executor',
                plainDefinition: 'Function (resolve, reject) => void called synchronously when Promise is created.',
                example: 'new Promise((resolve, reject) => { ... })',
              },
              {
                term: 'microtask',
                longForm: 'microtask queue',
                plainDefinition: 'High-priority job queue drained after current stack — Promise reactions run here.',
                example: 'queueMicrotask(() => ...)',
              },
              {
                term: 'thenable',
                longForm: 'thenable object',
                plainDefinition: 'Object with then method — Promise.resolve assimilates thenables.',
                example: '{ then(onFulfilled) { ... } }',
              },
              {
                term: 'assimilation',
                longForm: 'promise assimilation',
                plainDefinition: 'Flattening returned thenable into chained promise.',
                example: 'return fetch(url) inside then',
              },
            ],
          },
        ],
      },
      {
        heading: 'Why implement Promises from scratch?',
        blocks: [
          {
            type: 'prose',
            text:
              'Understanding the state machine explains **unhandled rejection** timing, why `new Promise(r => r(Promise.resolve(1)))` flattens, and microtask ordering with `await`. Interviews ask for a minimal Promise/A+ compliant `then`. Production code uses native Promise — but debugging async bugs requires this model.',
          },
          {
            type: 'callout',
            variant: 'remember',
            title: 'C# Task comparison',
            body:
              'C# Task uses thread pool continuations; JS Promise uses microtasks on the same thread. Task.Result blocks; Promise has no sync wait. async/await in both desugar to continuations.',
          },
        ],
      },
      {
        heading: 'How Promise state transitions work',
        blocks: [
          {
            type: 'steps',
            title: 'Resolve flow',
            items: [
              { title: 'Create', body: 'State pending; handlers queue empty.' },
              { title: 'Executor runs', body: 'resolve/reject called — lock state.' },
              { title: 'Drain handlers', body: 'Schedule each onFulfilled/onRejected as microtask.' },
              { title: 'then', body: 'If pending, push handler; else schedule with stored value.' },
            ],
          },
          {
            type: 'diagram',
            diagram: {
              type: 'mermaid',
              title: 'Promise state machine',
              source:
                'stateDiagram-v2\n  [*] --> Pending\n  Pending --> Fulfilled: resolve(value)\n  Pending --> Rejected: reject(reason)\n  Fulfilled --> [*]\n  Rejected --> [*]',
            },
          },
        ],
      },
      {
        heading: 'Code walkthrough: minimal Promise/A+ subset',
        blocks: [
          {
            type: 'snippet',
            snippet: snippet(
              'javascript',
              'Core MyPromise skeleton',
              `class MyPromise {\n  #state = 'pending';\n  #value = undefined;\n  #handlers = [];\n\n  constructor(executor) {\n    const resolve = (value) => {\n      if (this.#state !== 'pending') return;\n      this.#state = 'fulfilled';\n      this.#value = value;\n      this.#handlers.forEach(h => queueMicrotask(() => this.#run(h)));\n      this.#handlers = [];\n    };\n    const reject = (reason) => {\n      if (this.#state !== 'pending') return;\n      this.#state = 'rejected';\n      this.#value = reason;\n      this.#handlers.forEach(h => queueMicrotask(() => this.#run(h)));\n      this.#handlers = [];\n    };\n    try { executor(resolve, reject); } catch (e) { reject(e); }\n  }\n}`,
              'Private fields hold state. resolve/reject are idempotent — ignore after first settlement.',
            ),
          },
          {
            type: 'snippet',
            snippet: snippet(
              'javascript',
              'then and reaction runner',
              `  then(onFulfilled, onRejected) {\n    return new MyPromise((resolve, reject) => {\n      const handler = {\n        onFulfilled: typeof onFulfilled === 'function' ? onFulfilled : v => v,\n        onRejected: typeof onRejected === 'function' ? onRejected : e => { throw e; },\n        resolve, reject,\n      };\n      if (this.#state === 'pending') this.#handlers.push(handler);\n      else queueMicrotask(() => this.#run(handler));\n    });\n  }\n\n  #run({ onFulfilled, onRejected, resolve, reject }) {\n    const fn = this.#state === 'fulfilled' ? onFulfilled : onRejected;\n    try {\n      const result = fn(this.#value);\n      resolve(result);\n    } catch (e) {\n      reject(e);\n    }\n  }`,
              'then returns new Promise. Non-function handlers pass value or rethrow. Errors in callbacks reject chain.',
            ),
          },
          {
            type: 'snippet',
            snippet: snippet(
              'javascript',
              'Usage and microtask ordering',
              `const p = new MyPromise((resolve) => {\n  console.log('executor sync');\n  resolve(1);\n});\np.then(v => console.log('then', v));\nconsole.log('sync end');\n// executor sync → sync end → then 1`,
              'Reactions never run synchronously inside resolve — microtask ordering preserves async semantics.',
            ),
          },
          {
            type: 'snippet',
            snippet: snippet(
              'javascript',
              'Promise.resolve assimilation sketch',
              `function promiseResolve(value) {\n  if (value instanceof MyPromise) return value;\n  if (value && typeof value.then === 'function') {\n    return new MyPromise((res, rej) => value.then(res, rej));\n  }\n  return new MyPromise((res) => res(value));\n}`,
              'Assimilation prevents nested Promise<Promise<T>> — required for full Promise/A+ compliance.',
            ),
          },
        ],
      },
      {
        heading: 'Compare with C# Task and TypeScript',
        blocks: [
          {
            type: 'comparisonTable',
            title: 'Async primitive comparison',
            headers: ['Aspect', 'JS Promise', 'C# Task', 'TypeScript'],
            rows: [
              ['Thread', 'Same thread microtasks', 'Thread pool continuations', 'Promise<T> typing'],
              ['Sync wait', 'Forbidden (deadlock risk)', 'Task.Result blocks', 'No sync wait at type level'],
              ['Cancellation', 'AbortSignal (cooperative)', 'CancellationToken', 'AbortSignal typed'],
              ['Flattening', 'Automatic thenable assimilation', 'await unwraps Task', 'Awaited<T> utility'],
            ],
          },
        ],
      },
      {
        heading: 'Common mistakes to avoid',
        blocks: [
          {
            type: 'callout',
            variant: 'warning',
            title: 'Promise implementation traps',
            body:
              'Calling onFulfilled synchronously in resolve — breaks ordering. Allowing double resolve. Forgetting try/catch around executor. Not returning new Promise from then. Missing assimilation for thenables.',
          },
        ],
      },
      {
        heading: 'Senior interview depth',
        blocks: [
          {
            type: 'prose',
            text:
              'Extend with Promise.all as combinator, document why Zalgo (sync async) is forbidden, and explain how V8 optimizes native Promise. Discuss Promise/A+ spec vs ES6 differences. Trace async function desugaring: async function f() { return 1 } wraps return in Promise.resolve.',
          },
          {
            type: 'callout',
            variant: 'tip',
            title: 'Follow-up extensions',
            body: 'Implement catch as then(null, onRejected). Add finally that preserves return value. Handle circular thenable assimilation with a visited set.',
          },
        ],
      },
    ],
    interviewTakeaways: [
      'Promise states: pending → fulfilled | rejected — one-way only.',
      'Reactions run as microtasks, never synchronously inside resolve.',
      'then returns a new Promise; errors in callbacks reject the chain.',
      '60s: State machine + handler queue + microtask drain. Compare to C# Task continuations. Assimilation flattens thenables. async/await desugars to then.',
      'Follow-up: implement Promise.all or explain unhandled rejection timing.',
    ],
    commonPitfalls: [
      "Weak: 'resolve calls callback immediately' — must be async via microtask.",
      "Weak: 'can resolve twice' — must ignore subsequent settle.",
      "Weak: 'Promise is just callback' — state machine with assimilation rules.",
      "Strong: 'Pending/fulfilled/rejected, queueMicrotask drain, then returns new Promise, try/catch executor, assimilate thenables.'",
    ],
    relatedTopicIds,
    jsTsCorrelations: [
      {
        language: 'typescript',
        concept: 'Promise<T> typing',
        note: 'Generic Promise<T> types resolve value. async functions return Promise<T> even when returning T.',
        futureTopicSlug: 'typescript/async-types/promise-and-async-return-types',
      },
      {
        language: 'typescript',
        concept: 'Awaited and return types',
        note: 'Awaited<T> unwraps nested promises — mirrors runtime assimilation.',
        futureTopicSlug: 'typescript/async-types/awaited-and-async-utility',
      },
    ],
    officialSources: [
      { title: 'Promise', url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise' },
      { title: 'Promise/A+ spec', url: 'https://promisesaplus.com/' },
    ],
    animationHint: 'flow',
    scenarioTag: 'sqs-consumer',
  };
}

function buildV8Gc(language, ctx) {
  if (language !== 'javascript') return null;
  const { relatedTopicIds } = ctx;
  return {
    hook:
      'V8 divides the heap into young (nursery) and old generations. Minor GC scavenges short-lived objects in milliseconds; major GC mark-sweep-compact reclaims the old generation and can pause the main thread — the key to understanding Node.js latency spikes.',
    sections: [
      {
        heading: 'What is V8 garbage collection?',
        blocks: [
          {
            type: 'prose',
            text:
              '**V8** manages memory automatically: allocate on the heap, reclaim unreachable objects via **garbage collection**. The **young generation** (nursery) holds new objects; a copying **Scavenge** (minor GC) is fast and frequent. Surviving objects are **promoted** to the **old generation** where **mark-sweep-compact** (major GC) runs less often but can pause longer. **Incremental marking** and **concurrent marking** reduce pause times. The **GC roots** are globals, stack references, and registered handles.',
          },
          {
            type: 'glossary',
            title: 'Key terms',
            entries: [
              {
                term: 'Scavenge',
                longForm: 'minor GC / Scavenge',
                plainDefinition: 'Copy live young-generation objects to survivor space; discard dead.',
                example: 'Runs when nursery fills — typically < 5ms',
              },
              {
                term: 'mark-sweep',
                longForm: 'mark-sweep-compact',
                plainDefinition: 'Mark reachable old-gen objects, sweep unreachable, compact fragmentation.',
                example: 'Major GC — can pause 10–100ms+ on large heaps',
              },
              {
                term: 'promotion',
                longForm: 'object promotion',
                plainDefinition: 'Young object that survives Scavenge moves to old generation.',
                example: 'Long-lived caches promote quickly',
              },
              {
                term: 'write barrier',
                longForm: 'write barrier',
                plainDefinition: 'Tracks old→young references so minor GC does not miss live objects.',
                example: 'Internal V8 mechanism during incremental marking',
              },
            ],
          },
        ],
      },
      {
        heading: 'Why V8 GC matters in production',
        blocks: [
          {
            type: 'prose',
            text:
              'GC pauses cause **tail latency** in APIs and jank in browsers. Allocating many short-lived objects fills the nursery and triggers frequent Scavenge. Retaining objects accidentally — closures, timers, caches — grows old space and triggers expensive major GC. **--expose-gc** and **performance.measureUserAgentSpecificMemory** help diagnose. Unlike C# CLR, V8 runs on the main thread for most work.',
          },
          {
            type: 'callout',
            variant: 'remember',
            title: 'C# CLR comparison',
            body:
              'CLR has generational GC with LOH (large object heap). V8 old space is similar to Gen2. CLR background GC reduces pauses; V8 uses incremental/concurrent marking. Both promote survivors. JS has no IDisposable — only GC and WeakRef.',
          },
        ],
      },
      {
        heading: 'How generational GC works step by step',
        blocks: [
          {
            type: 'steps',
            title: 'Object lifetime',
            items: [
              { title: 'Allocate', body: 'New object in nursery (young generation).' },
              { title: 'Minor GC', body: 'Scavenge copies survivors; dead objects discarded.' },
              { title: 'Promote', body: 'Objects surviving enough cycles move to old generation.' },
              { title: 'Major GC', body: 'Mark-sweep-compact on old space when threshold hit.' },
            ],
          },
          {
            type: 'diagram',
            diagram: {
              type: 'mermaid',
              title: 'V8 generational heap',
              source:
                'flowchart LR\n  N[New space nursery] -->|Scavenge survivors| S[Survivor space]\n  S -->|Promotion| O[Old space]\n  O -->|Major GC| O\n  R[GC roots: stack globals] --> N\n  R --> O',
            },
          },
        ],
      },
      {
        heading: 'Code walkthrough: allocation, retention, and GC signals',
        blocks: [
          {
            type: 'snippet',
            snippet: snippet(
              'javascript',
              'Short-lived versus promoted objects',
              `function processBatch(rows) {\n  return rows.map((row) => ({\n    id: row.id,\n    label: row.name.toUpperCase(),\n  }));\n}\n\n// Many ephemeral objects per call — nursery Scavenge reclaims them\nprocessBatch(largeCsv);`,
              'Transient map results die after return — ideal for minor GC. Avoid retaining every batch in a global array.',
            ),
          },
          {
            type: 'snippet',
            snippet: snippet(
              'javascript',
              'Accidental old-gen retention',
              `const cache = new Map();\nfunction loadUser(id) {\n  const data = fetchProfile(id); // Promise retained by cache key forever\n  cache.set(id, data);\n  return data;\n}\n// Fix: LRU eviction, WeakRef, or TTL cleanup`,
              'Unbounded Map holds promises in old generation — major GC cannot reclaim until entries removed.',
            ),
          },
          {
            type: 'snippet',
            snippet: snippet(
              'javascript',
              'Observing GC in Node (--expose-gc)',
              `// node --expose-gc app.mjs\nimport v8 from 'node:v8';\n\nconst before = process.memoryUsage().heapUsed;\nglobal.gc(); // manual major GC when flag set\nconst after = process.memoryUsage().heapUsed;\nconsole.log('Freed MB:', (before - after) / 1024 / 1024);\nconsole.log(v8.getHeapStatistics());`,
              'heapUsed drops after gc() if unreachable objects existed. Use in benchmarks, not production.',
            ),
          },
          {
            type: 'snippet',
            snippet: snippet(
              'javascript',
              'WeakRef for optional cache',
              `const registry = new FinalizationRegistry((id) => {\n  console.log('Object gone:', id);\n});\n\nlet ref = new WeakRef({ data: [1, 2, 3] });\nregistry.register(ref.deref(), 'cache-entry');\n// When object collected, finalizer runs (do not rely on timing)`,
              'WeakRef does not prevent GC — use for caches that should not block collection. FinalizationRegistry for cleanup side effects.',
            ),
          },
        ],
      },
      {
        heading: 'Compare with C# CLR and TypeScript',
        blocks: [
          {
            type: 'comparisonTable',
            title: 'GC model matrix',
            headers: ['Aspect', 'V8 (JS)', 'CLR (C#)', 'TypeScript'],
            rows: [
              ['Generations', 'Young + old', 'Gen0/1/2 + LOH', 'No runtime GC — emits JS'],
              ['Pause impact', 'Main thread STW phases', 'Background GC options', 'N/A'],
              ['Disposal', 'GC only (+ WeakRef)', 'IDisposable + GC', 'N/A'],
              ['Diagnostics', 'DevTools heap snapshot', 'dotMemory, PerfView', 'N/A'],
            ],
          },
        ],
      },
      {
        heading: 'Common mistakes to avoid',
        blocks: [
          {
            type: 'callout',
            variant: 'warning',
            title: 'GC misconceptions',
            body:
              'Thinking GC frees memory immediately. Assuming null assignment collects instantly — only unreachable graphs are collected. Unbounded caches in old gen. Creating massive temporary strings/arrays per request. Relying on FinalizationRegistry for critical cleanup timing.',
          },
        ],
      },
      {
        heading: 'Senior interview depth',
        blocks: [
          {
            type: 'prose',
            text:
              'Explain tri-color marking, incremental marking reducing pause, and Orinoco (concurrent) GC in modern V8. Contrast with CLR background GC. When to pool objects in Node hot paths. How detached DOM nodes keep whole trees alive in browsers. Read heap snapshot dominators tree to find retention path.',
          },
          {
            type: 'callout',
            variant: 'tip',
            title: 'Production tuning',
            body: '--max-old-space-size for Node heap cap. Monitor GC pause with clinic.js or Chrome Performance panel. Reduce allocation rate before tuning flags.',
          },
        ],
      },
    ],
    interviewTakeaways: [
      'Young gen Scavenge is fast; old gen mark-sweep-compact can pause.',
      'Promotion: survivors move to old space — long-lived caches matter.',
      'GC roots: stack, globals, closures retaining references prevent collection.',
      '60s: Generational GC — nursery Scavenge vs old mark-sweep-compact. Main-thread pauses. Compare CLR Gen2. Unbounded caches cause major GC pressure.',
      'Follow-up: how do closures cause memory leaks in old generation?',
    ],
    commonPitfalls: [
      "Weak: 'GC runs when I set null' — only unreachable object graphs are collected.",
      "Weak: 'minor GC and major GC are the same' — different algorithms and cost profiles.",
      "Weak: 'WeakRef prevents collection' — opposite; it does not keep object alive.",
      "Strong: 'Young Scavenge vs old mark-sweep-compact, promotion, roots, pause impact, retention paths via heap snapshot.'",
    ],
    relatedTopicIds,
    jsTsCorrelations: [
      {
        language: 'typescript',
        concept: 'No compile-time GC',
        note: 'TypeScript types erase — memory behavior is pure V8. WeakRef and FinalizationRegistry typed in lib.d.ts.',
        futureTopicSlug: 'typescript/runtime/memory',
      },
      {
        language: 'javascript',
        concept: 'Closure retention',
        note: 'Closures keep outer bindings alive — connects GC to scope. See closure-memory-retention topic.',
        futureTopicSlug: 'javascript/memory-and-garbage-collection/closure-memory-retention',
      },
    ],
    officialSources: [
      { title: 'V8 garbage collection', url: 'https://v8.dev/blog/trash-talk' },
      { title: 'Memory management', url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Memory_management' },
    ],
    animationHint: 'stack-heap',
    scenarioTag: 'redis-cache',
  };
}

// P0 topics already deepened — return null so template skips if not shallow
function buildStrictNullChecks() { return null; }
function buildInferKeyword() { return null; }
function buildDiscriminatedUnions() { return null; }
function buildBrandedOpaque() { return null; }
