/** Theme-specific snippets for deepen-all-topics.mjs — avoids generic createClient fallback. */
export function getExtendedThemeSnippets(theme, topic, language, senior, snippet) {
  const codeLang = language === 'typescript' ? 'typescript' : 'javascript';
  const title = topic.title;
  const handlers = {
    guards: guardsSnippets,
    oop: oopSnippets,
    workers: workersSnippets,
    performance: performanceSnippets,
    decorators: decoratorsSnippets,
    runtime: runtimeSnippets,
    functions: functionsSnippets,
    syntax: syntaxSnippets,
    errors: errorsSnippets,
    events: eventsSnippets,
  };
  const fn = handlers[theme];
  return fn ? fn({ snippet, codeLang, language, senior, title }) : null;
}

function guardsSnippets({ snippet, senior }) {
  if (senior === undefined) senior = true;
  const s = [
    snippet('typescript', 'User-defined type guard', `interface User { id: string; name: string; }\n\nfunction isUser(value: unknown): value is User {\n  return typeof value === 'object' && value !== null\n    && 'id' in value && typeof (value as User).id === 'string'\n    && 'name' in value && typeof (value as User).name === 'string';\n}\n\nfunction greet(raw: unknown) {\n  if (!isUser(raw)) throw new Error('invalid user');\n  return raw.name;\n}`, 'Predicate `value is T` narrows after check — essential at JSON boundaries.'),
    snippet('typescript', 'Assertion function', `function assertIsString(value: unknown): asserts value is string {\n  if (typeof value !== 'string') throw new TypeError('Expected string');\n}\n\nfunction upper(raw: unknown) {\n  assertIsString(raw);\n  return raw.toUpperCase();\n}`, 'asserts throws to narrow — prefer boolean guards for reusable validation.'),
    snippet('typescript', 'Discriminant narrowing', `type Shape = { kind: 'circle'; r: number } | { kind: 'rect'; w: number; h: number };\n\nfunction area(s: Shape) {\n  if (s.kind === 'circle') return Math.PI * s.r ** 2;\n  return s.w * s.h;\n}`, 'Tagged unions + switch exhaustiveness with never in default.'),
    snippet('csharp', 'C# patterns vs TS guards', `string Describe(object o) => o switch {\n    string s => s,\n    int n => n.ToString(),\n    _ => "unknown"\n};`, 'C# patterns runtime + compile; TS narrowing compile-only.'),
  ];
  return senior ? s : s.slice(0, 3);
}

function oopSnippets({ snippet, language }) {
  return [
    snippet(language === 'typescript' ? 'typescript' : 'javascript', 'Class inheritance', language === 'typescript'
      ? `abstract class Repository<T extends { id: string }> {\n  protected items: T[] = [];\n  abstract findById(id: string): T | undefined;\n}\nclass UserRepo extends Repository<User> {\n  findById(id: string) { return this.items.find((u) => u.id === id); }\n}`
      : `class Animal { constructor(name) { this.name = name; } speak() { return this.name; } }\nclass Dog extends Animal { speak() { return super.speak() + ' barks'; } }`, 'extends sets prototype chain — TS abstract enforces overrides at compile time.'),
    snippet(language === 'typescript' ? 'typescript' : 'javascript', 'Interface contract', language === 'typescript'
      ? `interface Logger { log(msg: string): void; }\nclass ConsoleLogger implements Logger { log(msg: string) { console.log(msg); } }\nemit({ log: (m) => process.stderr.write(m) }, 'warn'); // structural OK`
      : `function emit(logger, msg) {\n  if (typeof logger?.log !== 'function') throw new TypeError('Logger required');\n  logger.log(msg);\n}`, 'implements documents intent; structural typing accepts matching shapes without keyword.'),
    snippet('javascript', 'Prototype chain', `const base = { greet() { return 'hi'; } };\nconst child = Object.create(base);\nchild.name = 'Ada';\nconsole.log(child.greet());`, 'class desugars to constructor + prototype — explains this and super.'),
    snippet('csharp', 'C# nominal OOP', `public abstract class Repository<T> where T : IEntity {\n    public abstract T? FindById(string id);\n}\npublic interface ILogger { void Log(string msg); }`, 'CLR tracks interface implementations; TS accepts any matching shape.'),
  ];
}

function workersSnippets({ snippet }) {
  return [
    snippet('javascript', 'Dedicated worker', `const worker = new Worker(new URL('./worker.js', import.meta.url));\nworker.postMessage({ jobId: 1, data: [1, 2, 3] });\nworker.onmessage = (e) => console.log('result', e.data);`, 'Separate thread — no DOM; structured clone over postMessage.'),
    snippet('javascript', 'Transferable buffer', `const buf = new ArrayBuffer(1024);\nworker.postMessage({ buf }, [buf]);\n// buf.byteLength === 0 on main — ownership transferred`, 'Zero-copy transfer — main loses access after postMessage.'),
    snippet('javascript', 'SharedArrayBuffer + Atomics', `const sab = new SharedArrayBuffer(4);\nconst view = new Int32Array(sab);\nAtomics.store(view, 0, 42);`, 'Shared memory needs cross-origin isolation — prefer message passing.'),
    snippet('csharp', 'Workers vs Task.Run', `await Task.Run(() => HeavyCompute(data));\n// JS: worker pool for CPU off main thread — no shared heap by default`, 'C# threads share heap with locks; JS uses message passing.'),
  ];
}

function performanceSnippets({ snippet }) {
  return [
    snippet('javascript', 'Memoize', `function memoize(fn) {\n  const cache = new Map();\n  return (...args) => {\n    const key = JSON.stringify(args);\n    if (cache.has(key)) return cache.get(key);\n    const result = fn(...args);\n    cache.set(key, result);\n    return result;\n  };\n}`, 'Cache by key — watch memory growth and key equality semantics.'),
    snippet('javascript', 'Debounce', `function debounce(fn, ms) {\n  let timer;\n  return (...args) => {\n    clearTimeout(timer);\n    timer = setTimeout(() => fn(...args), ms);\n  };\n}`, 'Coalesce rapid events — search inputs and resize handlers.'),
    snippet('javascript', 'structuredClone', `const original = { date: new Date(), map: new Map([['a', 1]]) };\nconst cloned = structuredClone(original);`, 'Handles cycles and many built-ins — interview alternative to JSON hack.'),
    snippet('csharp', 'Span vs TypedArray', `Span<int> slice = stackalloc int[256];\n// JS: const buf = new Float64Array(256); — no stackalloc`, 'Reduce allocations with pools and TypedArrays in hot paths.'),
  ];
}

function runtimeSnippets({ snippet }) {
  return [
    snippet('javascript', 'globalThis', `const fetchFn = globalThis.fetch;\nconst isNode = typeof process !== 'undefined' && process.versions?.node;`, 'Cross-environment global — prefer over window or global alone.'),
    snippet('javascript', 'fetch stream', `const res = await fetch('/api/export.csv');\nconst reader = res.body.getReader();\nwhile (true) {\n  const { done, value } = await reader.read();\n  if (done) break;\n  processChunk(value);\n}`, 'Process incrementally — avoid loading multi-GB bodies into memory.'),
    snippet('javascript', 'Node fs/promises', `import { readFile } from 'node:fs/promises';\nconst raw = await readFile('data.bin');\nconst text = raw.toString('utf8');`, 'Buffer is Node-specific — not in browser without polyfill.'),
    snippet('javascript', 'Timer ordering in Node', `setTimeout(() => console.log('timeout'), 0);\nPromise.resolve().then(() => console.log('microtask'));\nprocess.nextTick(() => console.log('nextTick'));`, 'nextTick before microtasks in Node — differs from browser.'),
  ];
}

function functionsSnippets({ snippet }) {
  return [
    snippet('javascript', 'Currying', `const add = (a) => (b) => a + b;\nconst add5 = add(5);\nconsole.log(add5(3));`, 'Unary function chain enables partial application.'),
    snippet('javascript', 'Compose', `const compose = (...fns) => (x) => fns.reduceRight((v, f) => f(v), x);\nconst normalize = compose((s) => s.toUpperCase(), (s) => s.trim());`, 'Pipe data right-to-left through functions.'),
    snippet('javascript', 'map/filter/reduce', `const paidTotal = orders.filter((o) => o.status === 'paid').map((o) => o.total).reduce((s, n) => s + n, 0);`, 'Declarative chain — each step allocates new array except reduce.'),
    snippet('csharp', 'LINQ comparison', `var total = orders.Where(o => o.Status == Paid).Select(o => o.Total).Sum();`, 'LINQ deferred with IQueryable; JS always in-memory eager steps.'),
  ];
}

function syntaxSnippets({ snippet }) {
  return [
    snippet('javascript', 'Options object', `function createConnection({ host, port = 6379, tls = false }) {\n  return { host, port, tls };\n}\ncreateConnection({ host: 'redis.internal', tls: true });`, 'Named parameters via destructuring — self-documenting APIs.'),
    snippet('javascript', 'Spread and rest', `const config = { ...defaults, timeout: 10000 };\nfunction log(level, ...messages) { console.log(level, ...messages); }`, 'Shallow spread — nested objects still shared.'),
    snippet('javascript', 'Destructuring', `const [head, ...tail] = [1, 2, 3, 4];\nconst { id, name = 'anon' } = user;`, 'Defaults and rest patterns reduce boilerplate.'),
    snippet('csharp', 'Named arguments', `var conn = new ConnectionOptions(Host: "redis.internal", Port: 6379);`, 'C# named args compile-time; JS options objects are runtime convention.'),
  ];
}

function errorsSnippets({ snippet, codeLang, language }) {
  return [
    snippet(codeLang, 'try/catch with cause', language === 'typescript'
      ? `try { return await load(); } catch (err: unknown) {\n  throw new Error('load failed', { cause: err });\n}`
      : `try { return await load(); } catch (err) {\n  throw new Error('load failed', { cause: err });\n}`, 'Wrap with context and cause chain for observability.'),
    snippet(codeLang, 'Result type', language === 'typescript'
      ? `type Result<T> = { ok: true; value: T } | { ok: false; error: string };\nfunction parseId(raw: string): Result<number> {\n  const n = Number(raw);\n  return Number.isFinite(n) ? { ok: true, value: n } : { ok: false, error: 'invalid' };\n}`
      : `function parseId(raw) {\n  const n = Number(raw);\n  return Number.isFinite(n) ? { ok: true, value: n } : { ok: false, error: 'invalid' };\n}`, 'Discriminated Result for expected failures — avoid throw for control flow.'),
    snippet('csharp', 'Exception filters', `catch (HttpRequestException ex) when (ex.StatusCode == NotFound) { return null; }`, 'JS: check status before throw — no catch filters.'),
  ];
}

function eventsSnippets({ snippet }) {
  return [
    snippet('javascript', 'EventEmitter', `import { EventEmitter } from 'node:events';\nconst bus = new EventEmitter();\nbus.on('order:created', (o) => persist(o));\nbus.emit('order:created', { id: '42' });`, 'Remove listeners on teardown — leaks otherwise.'),
    snippet('javascript', 'AbortSignal', `const c = new AbortController();\nsetTimeout(() => c.abort(), 5000);\nawait fetch('/slow', { signal: c.signal });`, 'Cooperative cancellation like CancellationToken.'),
    snippet('javascript', 'Debounce impl', `function debounce(fn, ms) {\n  let id;\n  return (...args) => { clearTimeout(id); id = setTimeout(() => fn(...args), ms); };\n}`, 'Coalesce rapid events on main thread.'),
  ];
}

function decoratorsSnippets({ snippet }) {
  return [
    snippet('typescript', 'Stage 3 decorator', `function logged<T extends { new (...args: any[]): object }>(target: T, ctx: ClassDecoratorContext) {\n  return class extends target {\n    constructor(...args: any[]) { console.log('Creating', ctx.name); super(...args); }\n  };\n}\n@logged\nclass Service {}`, 'Stage 3 API differs from legacy experimental decorators.'),
    snippet('typescript', 'Method decorator', `function validate(min: number) {\n  return (_t: unknown, ctx: ClassMethodDecoratorContext) => function (this: unknown, v: number) {\n    if (v < min) throw new RangeError('too small');\n    return v;\n  };\n}`, 'Decorator factories configure behavior — Angular/NestJS patterns.'),
    snippet('typescript', 'reflect-metadata', `Reflect.defineMetadata('design:paramtypes', [String], Target, 'method');`, 'Legacy DI metadata — migrating to Stage 3 changes shape.'),
    snippet('csharp', 'Attributes', `[Authorize]\npublic class UsersController : ControllerBase { }`, 'C# attributes are CLR metadata; TS decorators are functions at class definition.'),
  ];
}
