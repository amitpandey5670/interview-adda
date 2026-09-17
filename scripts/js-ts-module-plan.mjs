/**
 * Module and topic plan for JavaScript and TypeScript documentation tracks.
 * Mirrors C# track depth: 18 modules, foundation → intermediate → advanced.
 */

export const javascriptModules = [
  {
    order: 1,
    slug: 'runtime-and-execution',
    title: 'How JavaScript runs (engines, parsing, and the event loop)',
    stage: 'foundation',
    summary:
      'Learn what happens from source text to running code in V8 and other engines. Covers parsing, execution contexts, the call stack, hoisting, strict mode, and how JavaScript differs from C# on the CLR.',
    topics: [
      { slug: 'javascript-vs-csharp-ts', title: 'What JavaScript is (compared to C# and TypeScript)' },
      { slug: 'engines-and-v8', title: 'JavaScript engines and how V8 compiles code' },
      { slug: 'execution-context-and-call-stack', title: 'Execution contexts, call stack, and hoisting' },
      { slug: 'strict-mode-and-sloppy', title: 'Strict mode versus sloppy mode' },
      { slug: 'event-loop-overview', title: 'The event loop, tasks, and why JavaScript is single-threaded' },
      { slug: 'modules-and-scripts', title: 'Scripts, modules, and how code is loaded' },
    ],
  },
  {
    order: 2,
    slug: 'syntax-operators-control-flow',
    title: 'Syntax basics: names, operators, control flow, and directives',
    stage: 'foundation',
    summary:
      'Identifiers, keywords, literals, operators, if/switch/loops, jump statements, and template literals. Plain comparisons to C# syntax where it helps transfer learning.',
    topics: [
      { slug: 'identifiers-keywords-literals', title: 'Identifiers, keywords, and literals' },
      { slug: 'var-let-const-and-tdz', title: 'var, let, const, and the temporal dead zone (TDZ)' },
      { slug: 'operators-and-precedence', title: 'Operators, precedence, and short-circuit evaluation' },
      { slug: 'statements-if-switch', title: 'if, else, switch, and truthiness' },
      { slug: 'loops-and-iteration', title: 'for, while, do-while, for-of, and for-in' },
      { slug: 'jump-statements', title: 'break, continue, return, and labels' },
      { slug: 'template-literals-and-tags', title: 'Template literals and tagged templates' },
    ],
  },
  {
    order: 3,
    slug: 'types-coercion-equality',
    title: 'Dynamic types, coercion, and equality',
    stage: 'foundation',
    summary:
      'typeof, primitives versus objects, implicit and explicit coercion, == versus ===, Symbol, BigInt, and how JavaScript type behavior differs from C# static types and TypeScript annotations.',
    topics: [
      { slug: 'primitives-and-objects', title: 'Primitives versus objects (and why typeof lies)' },
      { slug: 'typeof-and-type-checks', title: 'typeof, instanceof, and safe type checks' },
      { slug: 'coercion-rules', title: 'Implicit and explicit coercion (+, ToNumber, ToString)' },
      { slug: 'equality-and-comparison', title: '== versus ===, Object.is, and SameValueZero' },
      { slug: 'symbol-and-bigint', title: 'Symbol and BigInt in modern JavaScript' },
      { slug: 'truthiness-and-falsy', title: 'Truthiness, falsy values, and guard patterns' },
      { slug: 'dynamic-vs-static-types', title: 'Dynamic typing versus C# and TypeScript static types' },
      { slug: 'json-and-serialization', title: 'JSON.stringify, parse, and structured clone' },
    ],
  },
  {
    order: 4,
    slug: 'functions-scope-closures',
    title: 'Functions, scope, and closures',
    stage: 'foundation',
    summary:
      'Function declarations, expressions, arrow functions, parameters, rest/spread, scope chain, closures, IIFEs, and the classic loop-with-var interview trap.',
    topics: [
      { slug: 'function-forms', title: 'Function declarations, expressions, and arrow functions' },
      { slug: 'parameters-rest-defaults', title: 'Parameters, default values, and rest parameters' },
      { slug: 'lexical-scope-and-scope-chain', title: 'Lexical scope and the scope chain' },
      { slug: 'closures-and-capture', title: 'Closures, capture, and the loop-with-var trap' },
      { slug: 'iife-and-module-pattern', title: 'IIFEs and the module pattern before ESM' },
      { slug: 'higher-order-functions', title: 'Higher-order functions and callbacks as values' },
      { slug: 'recursion-and-call-stack-limits', title: 'Recursion, stack overflow, and tail calls' },
    ],
  },
  {
    order: 5,
    slug: 'objects-prototypes-oop',
    title: 'Objects, prototypes, and object-oriented patterns',
    stage: 'foundation',
    summary:
      'Object literals, property descriptors, prototype chain, classes as syntactic sugar, inheritance, composition, private fields, and how JS OOP differs from C# classes and TS interfaces.',
    topics: [
      { slug: 'object-literals-and-properties', title: 'Object literals, property keys, and descriptors' },
      { slug: 'prototype-chain', title: 'The prototype chain and __proto__ versus Object.getPrototypeOf' },
      { slug: 'classes-and-constructors', title: 'class, constructor, extends, and super' },
      { slug: 'inheritance-vs-composition', title: 'Inheritance versus composition in JavaScript' },
      { slug: 'private-fields-and-encapsulation', title: 'Private fields (#), getters, setters, and symbols' },
      { slug: 'this-binding', title: 'this binding: default, implicit, explicit, and arrow functions' },
      { slug: 'js-oop-vs-csharp-ts', title: 'JavaScript OOP versus C# and TypeScript' },
    ],
  },
  {
    order: 6,
    slug: 'errors-and-debugging',
    title: 'Errors, exceptions, and debugging',
    stage: 'foundation',
    summary:
      'Error types, try/catch/finally, throwing, stack traces, unhandled rejections, and debugging in browser DevTools and Node.js.',
    topics: [
      { slug: 'error-types-and-throwing', title: 'Error, TypeError, and custom errors' },
      { slug: 'try-catch-finally', title: 'try, catch, finally, and error propagation' },
      { slug: 'unhandled-rejections', title: 'Unhandled promise rejections and process.on' },
      { slug: 'stack-traces-and-debugging', title: 'Stack traces, breakpoints, and source maps' },
      { slug: 'errors-vs-csharp-exceptions', title: 'JavaScript errors versus C# exceptions' },
    ],
  },
  {
    order: 7,
    slug: 'null-undefined-optional',
    title: 'null, undefined, and optional access',
    stage: 'foundation',
    summary:
      'null versus undefined, optional chaining, nullish coalescing, defensive coding, and comparisons to C# nullable reference types and TypeScript strictNullChecks.',
    topics: [
      { slug: 'null-vs-undefined', title: 'null versus undefined and when each appears' },
      { slug: 'optional-chaining', title: 'Optional chaining (?.) and safe navigation' },
      { slug: 'nullish-coalescing', title: 'Nullish coalescing (??) versus ||' },
      { slug: 'defensive-coding-patterns', title: 'Defensive checks, defaults, and guard clauses' },
      { slug: 'null-safety-vs-typescript-nrt', title: 'JavaScript null safety versus TypeScript and C# NRT' },
    ],
  },
  {
    order: 8,
    slug: 'collections-and-iterators',
    title: 'Collections, iterators, and generators',
    stage: 'intermediate',
    summary:
      'Array, Map, Set, WeakMap, WeakSet, typed arrays, iterators, generators, yield, and performance tradeoffs for cache keys and large datasets.',
    topics: [
      { slug: 'arrays-and-typed-arrays', title: 'Array, typed arrays, and array-like objects' },
      { slug: 'map-set-weak-collections', title: 'Map, Set, WeakMap, and WeakSet' },
      { slug: 'iterators-and-for-of', title: 'Iterators, Symbol.iterator, and for-of' },
      { slug: 'generators-and-yield', title: 'Generators, yield, and lazy sequences' },
      { slug: 'collection-performance', title: 'When to use Map versus Object and Set versus Array' },
      { slug: 'immutable-patterns', title: 'Immutability patterns: spread, structuredClone, and tradeoffs' },
      { slug: 'collections-vs-csharp', title: 'JavaScript collections versus C# List and Dictionary' },
    ],
  },
  {
    order: 9,
    slug: 'structural-typing-patterns',
    title: 'Structural typing and duck typing patterns',
    stage: 'intermediate',
    summary:
      'Duck typing, shape checks, branding patterns, nominal versus structural typing, and how JavaScript patterns foreshadow TypeScript interfaces.',
    topics: [
      { slug: 'duck-typing', title: 'Duck typing and shape-based APIs' },
      { slug: 'runtime-shape-validation', title: 'Runtime validation: typeof guards and schema libraries' },
      { slug: 'branding-and-symbols', title: 'Branding with Symbol and opaque types in JS' },
      { slug: 'nominal-vs-structural', title: 'Nominal (C#) versus structural (JS/TS) typing' },
      { slug: 'factory-and-builder-patterns', title: 'Factory, builder, and object composition patterns' },
    ],
  },
  {
    order: 10,
    slug: 'callbacks-events-hof',
    title: 'Callbacks, events, and the observer pattern',
    stage: 'intermediate',
    summary:
      'Callback hell, EventEmitter, DOM events, delegation, pub/sub, and building small observer APIs from scratch.',
    topics: [
      { slug: 'callback-patterns', title: 'Callback patterns and error-first conventions' },
      { slug: 'event-emitter', title: 'EventEmitter and custom pub/sub APIs' },
      { slug: 'dom-events-and-delegation', title: 'DOM events, bubbling, capturing, and delegation' },
      { slug: 'callback-hell-and-composition', title: 'Callback hell and composing async before Promises' },
      { slug: 'debounce-throttle-implementations', title: 'Implementing debounce and throttle from scratch' },
      { slug: 'events-vs-csharp-delegates', title: 'JavaScript events versus C# delegates and events' },
    ],
  },
  {
    order: 11,
    slug: 'destructuring-spread-modern-syntax',
    title: 'Destructuring, spread, rest, and modern syntax',
    stage: 'intermediate',
    summary:
      'Object and array destructuring, rest/spread in calls and literals, optional chaining combos, and readable API design.',
    topics: [
      { slug: 'object-destructuring', title: 'Object destructuring, defaults, and renaming' },
      { slug: 'array-destructuring', title: 'Array destructuring and swap patterns' },
      { slug: 'spread-rest-operators', title: 'Spread and rest in arrays, objects, and function calls' },
      { slug: 'shorthand-and-computed-keys', title: 'Shorthand properties and computed property names' },
      { slug: 'modern-syntax-patterns', title: 'Readable patterns: options objects and named parameters' },
    ],
  },
  {
    order: 12,
    slug: 'functional-array-methods',
    title: 'Functional programming and array methods',
    stage: 'intermediate',
    summary:
      'map, filter, reduce, flat, groupBy polyfills, immutability, currying, composition, and comparisons to C# LINQ.',
    topics: [
      { slug: 'map-filter-reduce', title: 'map, filter, reduce, and chaining' },
      { slug: 'flat-flatmap-groupby', title: 'flat, flatMap, and groupBy patterns' },
      { slug: 'currying-and-composition', title: 'Currying, partial application, and compose' },
      { slug: 'implementing-array-helpers', title: 'Implementing map, filter, and flatten from scratch' },
      { slug: 'functional-vs-linq', title: 'JavaScript array methods versus C# LINQ' },
    ],
  },
  {
    order: 13,
    slug: 'promises-async-event-loop',
    title: 'Promises, async/await, and the event loop',
    stage: 'intermediate',
    summary:
      'Promise states, chaining, Promise.all/race/any, async/await, microtasks versus macrotasks, AbortController, and comparisons to C# Task.',
    topics: [
      { slug: 'why-async-javascript', title: 'Why async JavaScript exists (I/O without blocking the thread)' },
      { slug: 'promise-states-and-chaining', title: 'Promise states, then/catch/finally, and chaining' },
      { slug: 'promise-combinators', title: 'Promise.all, race, any, and allSettled' },
      { slug: 'async-await-syntax', title: 'async/await syntax and error handling' },
      { slug: 'microtasks-vs-macrotasks', title: 'Microtasks versus macrotasks (event loop ordering)' },
      { slug: 'implementing-promise-from-scratch', title: 'Implementing a Promise/A+ subset from scratch' },
      { slug: 'abort-controller-cancellation', title: 'AbortController, signals, and cooperative cancellation' },
      { slug: 'async-concurrency-limits', title: 'Concurrency-limited async mapping (pool pattern)' },
      { slug: 'promises-vs-csharp-task', title: 'Promises versus C# Task and ValueTask' },
    ],
  },
  {
    order: 14,
    slug: 'memory-and-garbage-collection',
    title: 'Memory management and garbage collection',
    stage: 'advanced',
    summary:
      'Stack versus heap, object headers, GC generations, closure retention, memory leaks, WeakRef, FinalizationRegistry, and V8 versus CLR GC.',
    topics: [
      { slug: 'stack-heap-and-references', title: 'Stack, heap, and object references in V8' },
      { slug: 'v8-garbage-collection', title: 'V8 garbage collection: generations, mark-sweep, and compaction' },
      { slug: 'closure-memory-retention', title: 'Closure retention and accidental memory leaks' },
      { slug: 'weakref-and-finalization', title: 'WeakRef, FinalizationRegistry, and WeakMap cleanup' },
      { slug: 'memory-leak-patterns', title: 'Common leak patterns: timers, listeners, and caches' },
      { slug: 'detached-dom-and-leaks', title: 'Detached DOM nodes and browser memory leaks' },
      { slug: 'profiling-with-devtools', title: 'Profiling memory with Chrome DevTools and heap snapshots' },
      { slug: 'v8-vs-clr-gc', title: 'V8 GC versus CLR garbage collection' },
      { slug: 'allocation-hot-paths', title: 'Allocation hot paths and object pooling in Node.js' },
    ],
  },
  {
    order: 15,
    slug: 'workers-and-concurrency',
    title: 'Web Workers, SharedArrayBuffer, and concurrency',
    stage: 'advanced',
    summary:
      'Worker threads, postMessage, transferable objects, Atomics, SharedArrayBuffer, and when to use Workers versus async I/O.',
    topics: [
      { slug: 'web-workers-basics', title: 'Web Workers and dedicated worker threads' },
      { slug: 'postmessage-and-transferables', title: 'postMessage, structured clone, and transferables' },
      { slug: 'sharedarraybuffer-and-atomics', title: 'SharedArrayBuffer and Atomics' },
      { slug: 'worker-pools-and-patterns', title: 'Worker pools and offloading CPU work' },
      { slug: 'workers-vs-csharp-threading', title: 'Workers versus C# threads and Task.Run' },
    ],
  },
  {
    order: 16,
    slug: 'modules-bundling-tooling',
    title: 'Modules, bundling, and the JavaScript toolchain',
    stage: 'advanced',
    summary:
      'ES modules, CommonJS, dynamic import, import maps, bundlers, tree shaking, and package.json module fields.',
    topics: [
      { slug: 'esm-vs-commonjs', title: 'ES modules versus CommonJS (import versus require)' },
      { slug: 'dynamic-import-and-code-splitting', title: 'Dynamic import() and code splitting' },
      { slug: 'module-resolution', title: 'Module resolution, package exports, and import maps' },
      { slug: 'bundlers-and-tree-shaking', title: 'Bundlers, tree shaking, and sideEffects' },
      { slug: 'tooling-vs-csharp-assemblies', title: 'JS modules versus C# assemblies and namespaces' },
    ],
  },
  {
    order: 17,
    slug: 'browser-node-runtimes',
    title: 'Browser versus Node.js runtimes',
    stage: 'advanced',
    summary:
      'Global objects, fetch, streams, timers, process, Buffer, fs promises, and environment-specific APIs.',
    topics: [
      { slug: 'global-objects-window-process', title: 'window, globalThis, process, and environment globals' },
      { slug: 'fetch-streams-and-web-apis', title: 'fetch, ReadableStream, and Web Streams API' },
      { slug: 'timers-and-nexttick', title: 'setTimeout, setImmediate, queueMicrotask, and process.nextTick' },
      { slug: 'node-fs-and-buffers', title: 'Node.js fs/promises, Buffer, and path differences' },
    ],
  },
  {
    order: 18,
    slug: 'es-recap-performance',
    title: 'ES version recap, performance, and interview radar',
    stage: 'advanced',
    summary:
      'ES2015 through ES2024 feature map, performance idioms, code review checklist, and FAANG-style JavaScript interview radar.',
    topics: [
      { slug: 'es-version-map', title: 'ES2015 through ES2024 feature map' },
      { slug: 'performance-idioms', title: 'Performance idioms: memoization, lazy init, and batching' },
      { slug: 'deep-clone-and-equality', title: 'Deep clone, deep equality, and circular references' },
      { slug: 'code-review-radar', title: 'JavaScript code review radar for senior interviews' },
      { slug: 'interview-utility-implementations', title: 'Interview utilities: bind, once, memoize, and flatten' },
    ],
  },
];

export const typescriptModules = [
  {
    order: 1,
    slug: 'what-is-typescript',
    title: 'What TypeScript is (compared to JavaScript and C#)',
    stage: 'foundation',
    summary:
      'Static typing on top of JavaScript, compile pipeline, tsconfig, erasable types, and how TypeScript differs from C# on the CLR.',
    topics: [
      { slug: 'typescript-vs-javascript-csharp', title: 'TypeScript versus JavaScript and C#' },
      { slug: 'compile-pipeline-and-tsc', title: 'The TypeScript compile pipeline (tsc, emit, source maps)' },
      { slug: 'tsconfig-and-project-setup', title: 'tsconfig.json, project references, and strict mode' },
      { slug: 'erasable-types-and-runtime', title: 'Erasable types and what survives at run time' },
      { slug: 'type-annotations-basics', title: 'Type annotations, inference, and explicit typing' },
      { slug: 'javascript-interop', title: 'JavaScript interop and gradual adoption' },
    ],
  },
  {
    order: 2,
    slug: 'basic-types',
    title: 'Basic types and literals',
    stage: 'foundation',
    summary:
      'string, number, boolean, null, undefined, void, never, any, unknown, literal types, and const assertions.',
    topics: [
      { slug: 'primitive-types', title: 'Primitive types: string, number, boolean' },
      { slug: 'null-undefined-void-never', title: 'null, undefined, void, and never' },
      { slug: 'any-unknown-never', title: 'any, unknown, and never — the safety ladder' },
      { slug: 'literal-types', title: 'Literal types and const assertions (as const)' },
      { slug: 'type-aliases-vs-interfaces', title: 'type aliases versus interfaces — when to use each' },
      { slug: 'enums-and-const-enums', title: 'Enums, const enums, and union alternatives' },
      { slug: 'basic-types-vs-csharp', title: 'TypeScript basic types versus C# built-in types' },
    ],
  },
  {
    order: 3,
    slug: 'type-system-unions-intersections',
    title: 'The type system: unions, intersections, and widening',
    stage: 'foundation',
    summary:
      'Union and intersection types, discriminated unions preview, type widening and narrowing basics, and assignability rules.',
    topics: [
      { slug: 'union-types', title: 'Union types (A | B) and exhaustiveness' },
      { slug: 'intersection-types', title: 'Intersection types (A & B) and mixing shapes' },
      { slug: 'widening-and-narrowing-basics', title: 'Type widening, narrowing, and control flow' },
      { slug: 'assignability-and-subtyping', title: 'Assignability, subtyping, and excess property checks' },
      { slug: 'discriminated-unions-intro', title: 'Discriminated unions and tagged unions' },
      { slug: 'readonly-and-immutability', title: 'readonly, Readonly<T>, and immutability flags' },
      { slug: 'index-signatures', title: 'Index signatures and Record<K, V>' },
      { slug: 'type-system-vs-csharp', title: 'TypeScript structural types versus C# nominal types' },
    ],
  },
  {
    order: 4,
    slug: 'functions-overloads',
    title: 'Functions, overloads, and parameters',
    stage: 'foundation',
    summary:
      'Function types, optional and default parameters, rest parameters, overload signatures, generics preview, and this typing.',
    topics: [
      { slug: 'function-type-signatures', title: 'Function type signatures and call signatures' },
      { slug: 'optional-default-rest-params', title: 'Optional, default, and rest parameters' },
      { slug: 'function-overloads', title: 'Function overloads and implementation signatures' },
      { slug: 'this-parameter-types', title: 'this parameter types and bind typing' },
      { slug: 'higher-order-function-types', title: 'Higher-order function types and callbacks' },
      { slug: 'arrow-vs-function-types', title: 'Arrow functions versus function declarations in types' },
      { slug: 'functions-vs-csharp', title: 'TypeScript functions versus C# methods and delegates' },
    ],
  },
  {
    order: 5,
    slug: 'classes-interfaces-oop',
    title: 'Classes, interfaces, and OOP in TypeScript',
    stage: 'foundation',
    summary:
      'Classes, access modifiers, abstract classes, implements, interfaces, declaration merging, and TS OOP versus C# and JS prototypes.',
    topics: [
      { slug: 'classes-and-access-modifiers', title: 'Classes, public, private, protected, and readonly' },
      { slug: 'abstract-classes-and-methods', title: 'Abstract classes and abstract methods' },
      { slug: 'interfaces-and-implements', title: 'Interfaces, implements, and structural contracts' },
      { slug: 'declaration-merging', title: 'Declaration merging for interfaces and namespaces' },
      { slug: 'implements-vs-extends', title: 'implements versus extends — interface versus inheritance' },
      { slug: 'ts-oop-vs-js-csharp', title: 'TypeScript OOP versus JavaScript prototypes and C# classes' },
    ],
  },
  {
    order: 6,
    slug: 'errors-and-result-types',
    title: 'Errors, exceptions, and typed result patterns',
    stage: 'foundation',
    summary:
      'try/catch typing, Result/Either patterns, typed errors, never returns, and safe API design at boundaries.',
    topics: [
      { slug: 'try-catch-and-unknown', title: 'try/catch with unknown and type-safe error handling' },
      { slug: 'result-either-patterns', title: 'Result and Either patterns for typed errors' },
      { slug: 'custom-error-classes', title: 'Custom error classes and discriminated error unions' },
      { slug: 'assertion-functions-errors', title: 'Assertion functions and exhaustive error handling' },
      { slug: 'errors-vs-csharp-exceptions', title: 'TypeScript error patterns versus C# exceptions' },
    ],
  },
  {
    order: 7,
    slug: 'null-safety-strict',
    title: 'Null safety and strictNullChecks',
    stage: 'foundation',
    summary:
      'strictNullChecks, optional properties, non-null assertion, definite assignment, and comparisons to C# NRT.',
    topics: [
      { slug: 'strict-null-checks', title: 'strictNullChecks and the null safety model' },
      { slug: 'optional-properties', title: 'Optional properties (?), undefined, and exactOptionalPropertyTypes' },
      { slug: 'non-null-assertion', title: 'Non-null assertion (!) and when it is dangerous' },
      { slug: 'definite-assignment', title: 'Definite assignment and strictPropertyInitialization' },
      { slug: 'null-safety-vs-csharp-nrt', title: 'TypeScript null safety versus C# nullable reference types' },
    ],
  },
  {
    order: 8,
    slug: 'collections-and-typed-data',
    title: 'Collections and typed data structures',
    stage: 'intermediate',
    summary:
      'Typed arrays, Map/Set generics, tuple types, readonly tuples, satisfies operator, and collection typing patterns.',
    topics: [
      { slug: 'array-and-tuple-types', title: 'Array types, tuple types, and readonly tuples' },
      { slug: 'map-set-typed', title: 'Typing Map, Set, and Weak collections' },
      { slug: 'satisfies-operator', title: 'The satisfies operator and type-preserving literals' },
      { slug: 'readonly-collections', title: 'ReadonlyArray, ReadonlySet, and immutable views' },
      { slug: 'typed-array-methods', title: 'Typing map/filter/reduce callbacks precisely' },
      { slug: 'collections-vs-csharp', title: 'TypeScript collections versus C# generics collections' },
    ],
  },
  {
    order: 9,
    slug: 'generics',
    title: 'Generics and constraints',
    stage: 'intermediate',
    summary:
      'Generic functions, classes, interfaces, constraints, default type parameters, keyof, and variance basics.',
    topics: [
      { slug: 'generic-functions-and-classes', title: 'Generic functions, classes, and interfaces' },
      { slug: 'generic-constraints', title: 'Generic constraints (extends) and keyof' },
      { slug: 'default-type-parameters', title: 'Default type parameters and inference' },
      { slug: 'generic-utility-wrappers', title: 'Generic Result, Option, and API wrapper patterns' },
      { slug: 'variance-basics', title: 'Variance basics: in, out, and assignability' },
    ],
  },
  {
    order: 10,
    slug: 'utility-types',
    title: 'Built-in utility types and type transformations',
    stage: 'intermediate',
    summary:
      'Partial, Required, Pick, Omit, Record, Exclude, Extract, NonNullable, Parameters, ReturnType, and composing utilities.',
    topics: [
      { slug: 'partial-required-pick-omit', title: 'Partial, Required, Pick, and Omit' },
      { slug: 'record-exclude-extract', title: 'Record, Exclude, Extract, and NonNullable' },
      { slug: 'parameters-returntype', title: 'Parameters, ReturnType, ConstructorParameters' },
      { slug: 'composing-utility-types', title: 'Composing utility types for DTOs and API layers' },
      { slug: 'utility-types-vs-csharp', title: 'Utility types versus C# generics constraints' },
    ],
  },
  {
    order: 11,
    slug: 'type-narrowing-guards',
    title: 'Type narrowing, guards, and discriminated unions',
    stage: 'intermediate',
    summary:
      'typeof, in, instanceof guards, user-defined type predicates, switch exhaustiveness, and assert functions.',
    topics: [
      { slug: 'typeof-in-instanceof-guards', title: 'typeof, in, and instanceof narrowing' },
      { slug: 'discriminated-unions-narrowing', title: 'Discriminated unions and switch exhaustiveness' },
      { slug: 'user-defined-type-guards', title: 'User-defined type predicates (x is T)' },
      { slug: 'assertion-functions', title: 'Assertion functions (asserts x is T)' },
      { slug: 'control-flow-analysis', title: 'Control flow analysis and unreachable code (never)' },
      { slug: 'narrowing-at-api-boundaries', title: 'Narrowing unknown at API and JSON boundaries' },
    ],
  },
  {
    order: 12,
    slug: 'conditional-mapped-types',
    title: 'Conditional types, mapped types, and template literals',
    stage: 'intermediate',
    summary:
      'T extends U ? X : Y, infer, mapped types, key remapping, template literal types, and distributive conditional types.',
    topics: [
      { slug: 'conditional-types-basics', title: 'Conditional types (T extends U ? X : Y)' },
      { slug: 'infer-keyword', title: 'The infer keyword and type extraction' },
      { slug: 'mapped-types', title: 'Mapped types and key remapping (as clause)' },
      { slug: 'template-literal-types', title: 'Template literal types and string manipulation' },
      { slug: 'distributive-conditionals', title: 'Distributive conditional types and pitfalls' },
    ],
  },
  {
    order: 13,
    slug: 'async-types',
    title: 'Async types: Promise, AsyncIterable, and AbortSignal',
    stage: 'intermediate',
    summary:
      'Promise<T>, async function return types, Awaited, AsyncIterable, AsyncGenerator, AbortSignal typing, and comparisons to C# Task.',
    topics: [
      { slug: 'promise-and-async-return-types', title: 'Promise<T> and async function return types' },
      { slug: 'awaited-and-async-utility', title: 'Awaited<T> and unwrapping nested promises' },
      { slug: 'async-iterable-types', title: 'AsyncIterable, AsyncGenerator, and for-await-of typing' },
      { slug: 'abort-signal-typing', title: 'AbortSignal, AbortController, and typed cancellation' },
      { slug: 'async-error-typing', title: 'Typing async errors and Promise rejection reasons' },
      { slug: 'async-types-vs-csharp-task', title: 'TypeScript async types versus C# Task and IAsyncEnumerable' },
    ],
  },
  {
    order: 14,
    slug: 'modules-and-declarations',
    title: 'Module resolution and declaration files',
    stage: 'advanced',
    summary:
      'moduleResolution, paths, ambient declarations, .d.ts files, declare module, triple-slash directives, and typing JS libraries.',
    topics: [
      { slug: 'module-resolution-modes', title: 'Module resolution: node, bundler, and nodenext' },
      { slug: 'path-mapping', title: 'paths, baseUrl, and import aliases' },
      { slug: 'ambient-declarations', title: 'Ambient declarations and declare global' },
      { slug: 'typing-javascript-libraries', title: 'Typing JavaScript libraries (@types and hand-written .d.ts)' },
      { slug: 'declare-module-augmentation', title: 'declare module and module augmentation' },
    ],
  },
  {
    order: 15,
    slug: 'advanced-type-patterns',
    title: 'Advanced type-level patterns',
    stage: 'advanced',
    summary:
      'Recursive types, branded types, opaque types, builder pattern typing, satisfies with generics, and type-level programming limits.',
    topics: [
      { slug: 'branded-and-opaque-types', title: 'Branded and opaque types for domain safety' },
      { slug: 'recursive-types', title: 'Recursive types and depth limits' },
      { slug: 'builder-pattern-typing', title: 'Builder pattern with progressive type safety' },
      { slug: 'type-level-programming-limits', title: 'When to stop: readability versus clever types' },
      { slug: 'advanced-patterns-vs-csharp', title: 'Advanced TS patterns versus C# source generators' },
    ],
  },
  {
    order: 16,
    slug: 'decorators-and-metadata',
    title: 'Decorators and experimental metadata',
    stage: 'advanced',
    summary:
      'Stage 3 decorators, legacy decorators, reflect-metadata, parameter decorators, and framework integration patterns.',
    topics: [
      { slug: 'stage-3-decorators', title: 'Stage 3 decorators and decorator factories' },
      { slug: 'legacy-decorators', title: 'Legacy (experimental) decorators and migration' },
      { slug: 'reflect-metadata', title: 'reflect-metadata and design-time type information' },
      { slug: 'decorators-in-frameworks', title: 'Decorators in Angular, NestJS, and class-validator' },
    ],
  },
  {
    order: 17,
    slug: 'compiler-options-tooling',
    title: 'Compiler options, tooling, and project architecture',
    stage: 'advanced',
    summary:
      'strict family flags, isolatedModules, verbatimModuleSyntax, project references, ESLint type-aware rules, and CI typecheck pipelines.',
    topics: [
      { slug: 'strict-compiler-flags', title: 'The strict flag family and what each option does' },
      { slug: 'isolated-modules-verbatim', title: 'isolatedModules, verbatimModuleSyntax, and bundler emit' },
      { slug: 'project-references', title: 'Project references and monorepo typecheck strategy' },
      { slug: 'eslint-type-aware', title: 'ESLint type-aware rules and @typescript-eslint' },
      { slug: 'ci-typecheck-pipelines', title: 'CI typecheck pipelines and incremental builds' },
    ],
  },
  {
    order: 18,
    slug: 'ts-recap-performance',
    title: 'TypeScript version recap, performance, and interview radar',
    stage: 'advanced',
    summary:
      'TS 4.x–5.x feature map, compiler performance, type complexity budgets, code review radar, and senior interview scenarios.',
    topics: [
      { slug: 'typescript-version-map', title: 'TypeScript 4.x through 5.x feature map' },
      { slug: 'compiler-performance', title: 'Compiler performance, skipLibCheck, and type complexity' },
      { slug: 'type-complexity-budget', title: 'Type complexity budgets and team conventions' },
      { slug: 'code-review-radar', title: 'TypeScript code review radar for senior interviews' },
      { slug: 'senior-type-challenges', title: 'Senior type challenges: DeepPartial, EventMap, and API typing' },
    ],
  },
];
