#!/usr/bin/env node
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';

const root = join(process.cwd(), 'data/javascript/modules');

function writeTopic(relPath, topic) {
  writeFileSync(join(root, relPath), `${JSON.stringify(topic, null, 2)}\n`);
}

function writeJson(relPath, data) {
  writeFileSync(join(root, relPath), `${JSON.stringify(data, null, 2)}\n`);
}

// Module 02
writeTopic('02-syntax-operators-control-flow/topics/var-let-const-and-tdz.json', {
  id: 'javascript-02-var-let-const-and-tdz',
  slug: 'var-let-const-and-tdz',
  title: 'var, let, const, and the temporal dead zone (TDZ)',
  moduleId: 'javascript-02-syntax-operators-control-flow',
  order: 2,
  hook: 'Three ways to declare variables — var, let, and const — differ in scope, hoisting, and whether reassignment is allowed. Misunderstanding the temporal dead zone (TDZ) causes ReferenceError in loops and is a classic closure-in-for-loop interview trap.',
  sections: [
    {
      heading: 'What is this?',
      blocks: [
        {
          type: 'prose',
          text: '**const** declares a block-scoped binding that cannot be reassigned — the binding is constant, but object contents can still mutate. **let** is block-scoped and reassignable. **var** is function-scoped (or global), hoisted to the top of its scope and initialized to **undefined** before the line runs. **Temporal dead zone (TDZ)** is the span from block entry until the `let`/`const` line executes: accessing the name throws **ReferenceError**, even though the binding exists in the lexical environment.',
        },
        {
          type: 'glossary',
          title: 'Key terms',
          entries: [
            { term: 'const', longForm: 'constant binding', plainDefinition: 'Block-scoped name that cannot be reassigned. Does not freeze object contents.', example: 'const user = {}; user.name = "Ada"; // ok' },
            { term: 'let', longForm: 'block-scoped let', plainDefinition: 'Block-scoped, reassignable binding. Preferred over var for loops and locals.', example: 'for (let i = 0; i < 3; i++) { setTimeout(() => console.log(i)); }' },
            { term: 'var', longForm: 'function-scoped var', plainDefinition: 'Hoisted to function top, initialized undefined. Leaks out of if/for blocks.', example: 'if (true) { var x = 1; } console.log(x); // 1' },
            { term: 'TDZ', longForm: 'temporal dead zone', plainDefinition: 'Region before let/const initialization where the identifier exists but access throws ReferenceError.', example: 'console.log(a); let a = 1; // ReferenceError' },
          ],
        },
      ],
    },
    {
      heading: 'Why does it matter?',
      blocks: [
        {
          type: 'prose',
          text: 'Using **var** in loops with closures captures one shared variable — every callback sees the final value. **let** creates a fresh binding per iteration in for/for-of headers. **const** prevents accidental rebinding of configuration objects. TDZ explains why `typeof undeclared` is safe but `typeof letName` before its line throws. C# has no TDZ: local variables are not usable before declaration, but there is no hoisted undefined like var.',
        },
        { type: 'callout', variant: 'tip', title: 'Default to const', body: 'Use const until you need reassignment, then let. Reserve var for legacy code only — ESLint no-var enforces this.' },
      ],
    },
    {
      heading: 'How it works step by step',
      blocks: [
        {
          type: 'steps',
          title: 'Creation phase vs execution',
          items: [
            { title: 'Parse and hoist', body: 'var names get hoisted and initialized to undefined. let/const names are hoisted but stay in TDZ (uninitialized).' },
            { title: 'Enter block', body: 'New lexical environment for let/const. TDZ active until declaration line runs.' },
            { title: 'Hit declaration', body: 'let/const initialized; TDZ ends. const rejects reassignment at runtime.' },
            { title: 'Exit scope', body: 'Bindings discarded when block ends — unlike var which remains in outer function scope.' },
          ],
        },
        {
          type: 'diagram',
          diagram: {
            type: 'mermaid',
            title: 'Binding lifetime in a block',
            source: 'flowchart TD\n  A[Enter block] --> B{Declaration kind?}\n  B -->|var| C[Hoisted as undefined]\n  B -->|let/const| D[In TDZ — ReferenceError if read]\n  D --> E[Declaration line runs]\n  E --> F[Binding initialized]\n  F --> G{const?}\n  G -->|yes| H[Reassign forbidden]\n  G -->|no let| I[Reassign allowed]\n  C --> J[Function scope continues]\n  H --> K[Exit block — discard]\n  I --> K',
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
            language: 'javascript',
            label: 'var hoisting vs let TDZ',
            code: 'console.log(hoistedVar); // undefined — hoisted\nvar hoistedVar = 10;\n\n// console.log(hoistedLet); // ReferenceError — TDZ\nlet hoistedLet = 20;\n\nif (true) {\n  var leaks = "var escapes block";\n  let stays = "let stays in block";\n}\nconsole.log(leaks); // ok\n// console.log(stays); // ReferenceError',
            explanation: 'Lines 1–2: var is hoisted and initialized undefined. Lines 4–5: let before declaration is TDZ ReferenceError. Lines 7–12: var leaks to outer function; let is block-scoped.',
          },
        },
        {
          type: 'snippet',
          snippet: {
            language: 'javascript',
            label: 'Classic closure loop trap',
            code: 'for (var i = 0; i < 3; i++) {\n  setTimeout(() => console.log("var", i), 0);\n}\n// prints: var 3, var 3, var 3\n\nfor (let j = 0; j < 3; j++) {\n  setTimeout(() => console.log("let", j), 0);\n}\n// prints: let 0, let 1, let 2',
            explanation: 'var i is one binding shared by all callbacks. let j creates a new binding per iteration — each timeout closes over its own j.',
          },
        },
        {
          type: 'snippet',
          snippet: {
            language: 'javascript',
            label: 'const does not freeze objects',
            code: 'const config = Object.freeze({ retries: 3 });\n// config.retries = 5; // throws in strict mode if frozen\n\nconst state = { count: 0 };\nstate.count++; // ok — rebinding state forbidden, mutating property ok\n// state = {}; // TypeError: Assignment to constant variable',
            explanation: 'const prevents rebinding the identifier, not deep immutability. Use Object.freeze for shallow freeze; structuredClone or libraries for deep immutability.',
          },
        },
      ],
    },
    {
      heading: 'Compare with C# and TypeScript',
      blocks: [
        {
          type: 'comparisonTable',
          title: 'Variable declarations across languages',
          headers: ['Aspect', 'JavaScript', 'C#', 'TypeScript'],
          rows: [
            ['Default choice', 'const, then let', 'var for locals', 'const, then let (same as JS)'],
            ['Block scope', 'let/const only', 'Always block for locals', 'Same as JS at compile'],
            ['Hoist to undefined', 'var only', 'No — definite assignment', 'Erased to JS behavior'],
            ['Loop closure', 'let per iteration', 'foreach captures copy', 'Same as JS at run time'],
            ['Immutable binding', 'const (not deep)', 'readonly ref for fields', 'readonly on properties'],
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
          title: 'Pitfalls to avoid',
          body: 'Using var in new code. Assuming const makes objects immutable. Accessing let/const before declaration (TDZ). Using var in for-loops with async callbacks. Redeclaring let in same block — SyntaxError.',
        },
      ],
    },
  ],
  interviewTakeaways: [
    'var is function-scoped and hoisted to undefined; let/const are block-scoped.',
    'TDZ: let/const exist but throw ReferenceError until their declaration line runs.',
    'for (let i) creates a new binding per iteration — fixes closure-in-loop bugs.',
    'const forbids rebinding the identifier, not mutating object properties.',
    '60s: Default const. let when reassigning. Never var. TDZ explains pre-declaration ReferenceError. let in loops for closures.',
  ],
  commonPitfalls: [
    'Weak: "const means immutable object." Strong: "const locks the binding; use freeze or copy patterns for immutability."',
    'Weak: "var and let are the same in functions." Strong: "var hoists to undefined and ignores block boundaries; let respects blocks and TDZ."',
    'Strong: "Show var loop printing 3 three times vs let printing 0,1,2 — per-iteration lexical binding."',
  ],
  relatedTopicIds: ['javascript-02-identifiers-keywords-literals', 'javascript-02-loops-and-iteration', 'javascript-02-operators-and-precedence'],
  jsTsCorrelations: [
    { language: 'typescript', concept: 'const assertions', note: 'TypeScript `as const` narrows types at compile time; JavaScript const only prevents reassignment at run time.', futureTopicSlug: 'typescript/literals/const-assertions' },
    { language: 'typescript', concept: 'definite assignment', note: 'C# requires locals be assigned before read. JavaScript var is assigned undefined by hoisting; let/const use TDZ instead.', futureTopicSlug: 'csharp/variables/definite-assignment' },
  ],
  officialSources: [
    { title: 'MDN — let', url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/let' },
    { title: 'MDN — const', url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/const' },
    { title: 'javascript.info — Variable scope', url: 'https://javascript.info/closure' },
  ],
  animationHint: 'stack-heap',
});

writeTopic('02-syntax-operators-control-flow/topics/identifiers-keywords-literals.json', {
  id: 'javascript-02-identifiers-keywords-literals',
  slug: 'identifiers-keywords-literals',
  title: 'Identifiers, keywords, and literals',
  moduleId: 'javascript-02-syntax-operators-control-flow',
  order: 1,
  hook: 'Every JavaScript program is built from names you choose (identifiers), words reserved by the language (keywords), and values written directly (literals). Automatic Semicolon Insertion (ASI) and Unicode identifier rules trip up even senior developers during code review.',
  sections: [
    {
      heading: 'What is this?',
      blocks: [
        {
          type: 'prose',
          text: 'An **identifier** names a variable, function, class, or label. Rules: start with letter, `_`, `$`, or Unicode ID_Start; continue with ID_Continue. **Keywords** (`if`, `class`, `await`) are reserved — you cannot use them as identifiers in strict contexts. **Literals** are fixed values: numbers (`42`, `0xFF`, `1n`), strings (double-quoted, single-quoted, or template), booleans, `null`, `undefined`, regex (`/\\d+/`), and object/array literals. **Automatic Semicolon Insertion (ASI)** inserts semicolons when line breaks would otherwise create invalid grammar — affecting return and continue on new lines.',
        },
        {
          type: 'glossary',
          title: 'Key terms',
          entries: [
            { term: 'identifier', longForm: 'identifier name', plainDefinition: 'User-chosen name for bindings. Case-sensitive. camelCase conventional for variables.', example: 'const maxRetries = 3; function parseCsv() {}' },
            { term: 'keyword', longForm: 'reserved keyword', plainDefinition: 'Token reserved by ECMAScript. Cannot be used as identifier in module/strict code.', example: 'class, const, await, yield' },
            { term: 'literal', longForm: 'literal value', plainDefinition: 'Source notation for a value the engine parses directly.', example: '199, "ok", true, null, { id: 1 }' },
            { term: 'ASI', longForm: 'Automatic Semicolon Insertion', plainDefinition: 'Parser inserts ; at line breaks when grammar requires statement termination.', example: 'return\\nvalue; // ASI makes return; then value;' },
          ],
        },
      ],
    },
    {
      heading: 'Why does it matter?',
      blocks: [
        {
          type: 'prose',
          text: 'Invalid identifiers fail at parse time. Using **await** as a variable name breaks in modules. ASI bugs silently change control flow — a lone `return` on its own line returns **undefined**. Numeric literals above `Number.MAX_SAFE_INTEGER` lose precision unless you use **bigint** (`123n`). C# identifiers allow `@` prefix to escape keywords (`@class`); JavaScript has no escape — pick another name.',
        },
        { type: 'callout', variant: 'remember', title: 'Strict mode and sloppy mode', body: 'Strict mode (`"use strict"`) forbids octal literals (`012`), duplicate parameter names, and assigns to undeclared globals. Modules are strict by default.' },
      ],
    },
    {
      heading: 'How it works step by step',
      blocks: [
        {
          type: 'steps',
          title: 'From source text to tokens',
          items: [
            { title: 'Lexical analysis', body: 'Engine scans source into tokens: identifiers, keywords, literals, operators, punctuation.' },
            { title: 'Keyword vs identifier', body: 'Same character rules; keyword table decides if token is reserved.' },
            { title: 'Literal parsing', body: 'Numbers parsed per radix rules; strings handle escapes and Unicode; template literals allow interpolation.' },
            { title: 'ASI pass', body: 'If two tokens cannot appear adjacent, parser inserts semicolon at line break.' },
          ],
        },
        {
          type: 'diagram',
          diagram: {
            type: 'mermaid',
            title: 'Token categories',
            source: 'flowchart LR\n  SRC[Source file] --> LEX[Lexer]\n  LEX --> ID[Identifiers]\n  LEX --> KW[Keywords]\n  LEX --> LIT[Literals]\n  LEX --> OP[Operators]\n  LIT --> N[Number bigint]\n  LIT --> S[String template]\n  LIT --> R[Regex object literal]',
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
            language: 'javascript',
            label: 'Valid identifiers and Unicode',
            code: 'const camelCase = 1;\nconst _private = 2;\nconst $jquery = 3;\nconst café = 4; // Unicode ID_Start allowed\n\n// const 2fast = 5; // SyntaxError\n// const class = 6; // SyntaxError — keyword',
            explanation: 'Identifiers may use Unicode letters. Digits cannot lead. Keywords like class are reserved.',
          },
        },
        {
          type: 'snippet',
          snippet: {
            language: 'javascript',
            label: 'Number and bigint literals',
            code: 'console.log(0xff); // 255\nconsole.log(1_000_000); // numeric separators ES2021\nconsole.log(9007199254740993); // rounds — unsafe integer\nconsole.log(9007199254740993n); // exact BigInt\n\nconsole.log(0.1 + 0.2); // 0.30000000000000004 — IEEE 754',
            explanation: 'Underscores in numeric literals improve readability. BigInt suffix n avoids silent rounding. Binary floats explain decimal imprecision.',
          },
        },
        {
          type: 'snippet',
          snippet: {
            language: 'javascript',
            label: 'ASI return trap',
            code: 'function broken() {\n  return\n    { ok: true };\n}\nconsole.log(broken()); // undefined — ASI after return\n\nfunction fixed() {\n  return { ok: true };\n}\nconsole.log(fixed()); // { ok: true }',
            explanation: 'Line break after return triggers ASI — function returns undefined before object literal is reached. Keep return value on same line or wrap in parens.',
          },
        },
      ],
    },
    {
      heading: 'Compare with C# and TypeScript',
      blocks: [
        {
          type: 'comparisonTable',
          title: 'Names and literals across languages',
          headers: ['Feature', 'JavaScript', 'C#', 'TypeScript'],
          rows: [
            ['Escape keyword as name', 'Not allowed', '@class', 'Not allowed — use different name'],
            ['Numeric separators', '1_000_000', '1_000_000', 'Same as JS'],
            ['Big integer literal', '123n', 'No literal — BigInteger.Parse', 'Same as JS'],
            ['String multiline', 'Template literals', '@"" verbatim', 'Template literals'],
            ['ASI / semicolons', 'Optional with ASI traps', 'Required terminators', 'Same ASI as JS output'],
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
          title: 'Pitfalls to avoid',
          body: 'Return/throw/continue/break on next line — ASI changes meaning. Using leading-zero octal in sloppy scripts. Trusting Number for IDs above 2^53. Naming variables await in modules. Forgetting identifiers are case-sensitive (myVar ≠ MyVar).',
        },
      ],
    },
  ],
  interviewTakeaways: [
    'Identifiers: letter/_/$ or Unicode start; case-sensitive; camelCase convention.',
    'Keywords are reserved — modules are strict; no @ escape like C#.',
    'Literals include number, string, template, regex, boolean, null, undefined, object/array.',
    'ASI inserts semicolons — return on new line returns undefined.',
    '60s: Names vs keywords vs literals. ASI return trap. bigint n for big integers. Unicode identifiers ok. Strict modules.',
  ],
  commonPitfalls: [
    'Weak: "Semicolons are optional so it never matters." Strong: "ASI can break return/continue across lines — use semicolons or same-line style."',
    'Weak: "All numbers are exact." Strong: "Number is IEEE 754 double; use bigint or decimal strategy for large IDs and money."',
    'Strong: "Demonstrate return\\n{} returning undefined — classic production footgun in minified code too."',
  ],
  relatedTopicIds: ['javascript-02-var-let-const-and-tdz', 'javascript-02-template-literals-and-tags', 'javascript-02-operators-and-precedence'],
  jsTsCorrelations: [
    { language: 'javascript', concept: 'Unicode property escapes', note: 'Identifiers follow Unicode ID_Start/ID_Continue — same in JS and TS source.', futureTopicSlug: 'javascript/syntax/unicode-identifiers' },
    { language: 'typescript', concept: 'verbatimModuleSyntax', note: 'TypeScript adds type-only imports/exports; identifiers must not collide with type keywords in isolatedModules mode.', futureTopicSlug: 'typescript/modules/isolated-modules' },
  ],
  officialSources: [
    { title: 'MDN — Lexical grammar', url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Lexical_grammar' },
    { title: 'MDN — Numbers and dates', url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number' },
    { title: 'javascript.info — Code structure', url: 'https://javascript.info/structure' },
  ],
  animationHint: 'flow',
});

// Module 06
writeTopic('06-errors-and-debugging/topics/error-types-and-throwing.json', {
  id: 'javascript-06-error-types-and-throwing',
  slug: 'error-types-and-throwing',
  title: 'Error, TypeError, and custom errors',
  moduleId: 'javascript-06-errors-and-debugging',
  order: 1,
  hook: 'JavaScript signals failure by throwing values — almost always Error objects with message and stack. Built-in subclasses classify bugs (TypeError, ReferenceError), and custom errors carry domain context for APIs and logs.',
  sections: [
    { heading: 'What is this?', blocks: [
      { type: 'prose', text: '**throw** stops normal execution and unwinds the call stack until a matching **catch** or the runtime reports an uncaught exception. The idiomatic thrown value is an **Error** instance: `.message` for humans, `.stack` for frames, `.name` for the constructor (e.g. TypeError). **Error.cause** (ES2022) chains a root failure like C# InnerException. You can throw any value (`throw "oops"`), but only Error gives reliable stacks in production.' },
      { type: 'glossary', title: 'Key terms', entries: [
        { term: 'Error', longForm: 'Error constructor', plainDefinition: 'Base built-in error type with message and stack.', example: 'throw new Error("config missing");' },
        { term: 'TypeError', longForm: 'TypeError', plainDefinition: 'Operation on wrong type — undefined is not a function, etc.', example: 'null.foo // TypeError' },
        { term: 'ReferenceError', longForm: 'ReferenceError', plainDefinition: 'Invalid identifier reference — undeclared variable or TDZ.', example: 'console.log(notDefined);' },
        { term: 'Error.cause', longForm: 'error cause chain', plainDefinition: 'Optional chained error passed as { cause } in constructor options.', example: 'new Error("wrap", { cause: err });' },
      ]},
    ]},
    { heading: 'Why does it matter?', blocks: [
      { type: 'prose', text: 'API layers map HTTP status to typed errors (NotFoundError, ValidationError). Logging pipelines rely on `.stack` and structured `.name`. Throwing strings loses stack frames. C# requires Exception-derived types for idiomatic catch filters; JavaScript uses **instanceof** branches inside a single catch.' },
      { type: 'callout', variant: 'tip', title: 'Always throw Error', body: 'throw new Error(msg) — not throw msg. For domain errors, subclass Error and set this.name in constructor.' },
    ]},
    { heading: 'How it works step by step', blocks: [
      { type: 'steps', title: 'From throw to handler', items: [
        { title: 'Evaluate throw expression', body: 'Any value can be thrown; Error recommended.' },
        { title: 'Unwind stack', body: 'Each frame pops until catch found or top-level uncaught.' },
        { title: 'catch receives value', body: 'Branch with err instanceof TypeError, custom classes, or err.code.' },
        { title: 'Log and rethrow', body: 'Add context then throw new Error("...", { cause: err }) for observability.' },
      ]},
      { type: 'diagram', diagram: { type: 'mermaid', title: 'Error propagation', source: 'flowchart TD\n  T[throw new HttpError] --> U[Unwind stack]\n  U --> C{catch?}\n  C -->|yes| I[instanceof check]\n  C -->|no| X[uncaughtException / console]\n  I --> H[handle or rethrow with cause]\n  H --> L[log err.stack]' }},
    ]},
    { heading: 'Code walkthrough', blocks: [
      { type: 'snippet', snippet: { language: 'javascript', label: 'Built-in error types', code: 'function divide(a, b) {\n  if (typeof a !== "number") throw new TypeError("a must be number");\n  if (b === 0) throw new RangeError("division by zero");\n  return a / b;\n}\n\ntry {\n  divide("1", 2);\n} catch (err) {\n  console.log(err.name, err.message); // TypeError ...\n  console.log(err.stack);\n}', explanation: 'TypeError for wrong type; RangeError for numeric domain violation. stack helps locate call site.' }},
      { type: 'snippet', snippet: { language: 'javascript', label: 'Custom error subclass', code: 'class HttpError extends Error {\n  constructor(status, message, options) {\n    super(message, options);\n    this.name = "HttpError";\n    this.status = status;\n  }\n}\n\nasync function fetchUser(id) {\n  const res = await fetch(`/api/users/${id}`);\n  if (res.status === 404) throw new HttpError(404, `user ${id} not found`);\n  if (!res.ok) throw new HttpError(res.status, await res.text());\n  return res.json();\n}', explanation: 'Subclass sets name for logs and monitoring. status property enables catch routing without string parsing.' }},
      { type: 'snippet', snippet: { language: 'javascript', label: 'Error.cause chains', code: 'async function loadConfig(path) {\n  try {\n    return JSON.parse(await readFile(path));\n  } catch (err) {\n    throw new Error(`Failed to load ${path}`, { cause: err });\n  }\n}\n\ntry {\n  await loadConfig("/etc/app.json");\n} catch (err) {\n  console.log(err.message);\n  console.log(err.cause); // original SyntaxError or ENOENT\n}', explanation: 'Outer error adds context; cause preserves root failure for debugging — mirrors InnerException.' }},
    ]},
    { heading: 'Compare with C# and TypeScript', blocks: [
      { type: 'comparisonTable', title: 'Errors across languages', headers: ['Aspect', 'JavaScript', 'C#', 'TypeScript'], rows: [
        ['Throw type', 'Any value; Error idiomatic', 'Exception hierarchy', 'Same as JS at run time'],
        ['Typed catch', 'instanceof in one catch', 'catch (IOException ex)', 'No typed catch — erased'],
        ['Chaining', 'Error.cause', 'InnerException', 'Same as JS'],
        ['Stack', 'err.stack string', 'Exception.StackTrace', 'Same as JS'],
        ['Custom type', 'class extends Error', 'class : Exception', 'class extends Error + types'],
      ]},
    ]},
    { heading: 'Common mistakes', blocks: [
      { type: 'callout', variant: 'warning', title: 'Pitfalls to avoid', body: 'throw "string" without stack. Forgetting to set name on custom errors. Catching and swallowing without log. Using generic Error when status/code enables recovery. Not preserving cause when rethrowing.' },
    ]},
  ],
  interviewTakeaways: [
    'Throw Error objects — message, name, stack; avoid bare strings.',
    'TypeError, ReferenceError, RangeError classify common failure modes.',
    'Subclass Error for domain types; use instanceof in catch.',
    'Error.cause chains root failures like InnerException.',
    '60s: throw Error not string. Built-in subclasses. Custom class with name. cause for wrap. instanceof not typed catch.',
  ],
  commonPitfalls: [
    'Weak: "throw works like return with a string." Strong: "throw unwinds stack; Error gives stack trace; strings lose frames."',
    'Weak: "catch (TypeError e) in JS." Strong: "Single catch; if (err instanceof TypeError) { ... } — TS has no typed catch."',
    'Strong: "Show HttpError with status + cause chain for API layer — production pattern."',
  ],
  relatedTopicIds: ['javascript-06-try-catch-finally', 'javascript-06-errors-vs-csharp-exceptions', 'javascript-06-stack-traces-and-debugging'],
  jsTsCorrelations: [
    { language: 'typescript', concept: 'Error subclasses', note: 'TypeScript types custom errors with class extends Error; use type guards (instanceof) after catch (err: unknown).', futureTopicSlug: 'typescript/narrowing/unknown-catch' },
    { language: 'typescript', concept: 'Exception hierarchy', note: 'C# catch filters use when on typed exceptions; JavaScript emulates with instanceof and err.code properties.', futureTopicSlug: 'csharp/exceptions/filters' },
  ],
  officialSources: [
    { title: 'MDN — Error', url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error' },
    { title: 'MDN — throw', url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/throw' },
    { title: 'javascript.info — Error handling', url: 'https://javascript.info/error-handling' },
  ],
  animationHint: 'flow',
});

writeTopic('06-errors-and-debugging/topics/try-catch-finally.json', {
  id: 'javascript-06-try-catch-finally',
  slug: 'try-catch-finally',
  title: 'try, catch, finally, and error propagation',
  moduleId: 'javascript-06-errors-and-debugging',
  order: 2,
  hook: 'try/catch/finally looks like C#, but JavaScript allows only one catch clause and no typed catch — you branch inside with instanceof. finally always runs, even when return or throw happens, and can override the return value.',
  sections: [
    { heading: 'What is this?', blocks: [
      { type: 'prose', text: '**try** wraps statements that may throw. **catch (err)** runs when an exception propagates to this block — err is the thrown value. **finally** runs on all exit paths: normal completion, catch, or uncaught throw from catch. Async code needs **await inside try** to catch rejected promises; a bare async call without await escapes try/catch. There is no catch (TypeError e) syntax — emulate C# when filters with if inside catch.' },
      { type: 'glossary', title: 'Key terms', entries: [
        { term: 'try', longForm: 'try statement', plainDefinition: 'Block whose exceptions can be handled by following catch.', example: 'try { risky(); } catch (e) { ... }' },
        { term: 'catch', longForm: 'catch clause', plainDefinition: 'Receives thrown value. Optional binding omitted in ES2019+ catch { }.', example: 'catch (err) { if (err instanceof HttpError) ... }' },
        { term: 'finally', longForm: 'finally block', plainDefinition: 'Always executes before try/catch completes; used for cleanup.', example: 'finally { releaseLock(); }' },
        { term: 'rethrow', longForm: 'rethrow', plainDefinition: 'throw err after logging — continues propagation.', example: 'catch (err) { log(err); throw err; }' },
      ]},
    ]},
    { heading: 'Why does it matter?', blocks: [
      { type: 'prose', text: 'Resource cleanup (closing files, releasing locks) belongs in finally — or use patterns that mirror C# using. Misplaced await loses errors to unhandledRejection. finally return can silently discard try return — interview favorite. Production services log in catch, wrap with cause, and rethrow or map to HTTP 500.' },
      { type: 'callout', variant: 'remember', title: 'await in try for async', body: 'try { await fetch(url); } catch (err) { ... } — not try { fetch(url); } without await.' },
    ]},
    { heading: 'How it works step by step', blocks: [
      { type: 'steps', title: 'Completion paths', items: [
        { title: 'Enter try', body: 'Execute statements sequentially.' },
        { title: 'Throw occurs', body: 'Skip remaining try; jump to catch if present.' },
        { title: 'catch handles', body: 'Run catch block; may return, throw new, or rethrow.' },
        { title: 'finally runs', body: 'Always before handing result to caller — even after return in try/catch.' },
        { title: 'Return delivery', body: 'If finally returns, it wins over try/catch return — dangerous.' },
      ]},
      { type: 'diagram', diagram: { type: 'mermaid', title: 'try/catch/finally flow', source: 'flowchart TD\n  A[try block] --> B{Throw?}\n  B -->|no| F[finally]\n  B -->|yes| C[catch block]\n  C --> F\n  F --> G{finally return?}\n  G -->|yes| H[finally return wins]\n  G -->|no| I[try/catch result]' }},
    ]},
    { heading: 'Code walkthrough', blocks: [
      { type: 'snippet', snippet: { language: 'javascript', label: 'instanceof when filter', code: 'try {\n  await processPayment(order);\n} catch (err) {\n  if (err instanceof NetworkError) {\n    await retryQueue.push(order);\n    return;\n  }\n  if (err instanceof ValidationError) {\n    respond(400, err.message);\n    return;\n  }\n  throw err; // unknown — propagate\n}', explanation: 'Single catch with branches emulates C# multiple catch and when filters.' }},
      { type: 'snippet', snippet: { language: 'javascript', label: 'finally cleanup', code: 'let lock;\ntry {\n  lock = await acquireLock("job-42");\n  await runJob();\n} finally {\n  if (lock) await lock.release();\n}\n// Same idea as C# using — release even if runJob throws', explanation: 'finally guarantees release on success or failure. Check lock defined — acquire may throw before assignment.' }},
      { type: 'snippet', snippet: { language: 'javascript', label: 'finally return trap', code: 'function trap() {\n  try {\n    return 1;\n  } finally {\n    return 2;\n  }\n}\nconsole.log(trap()); // 2 — finally overrides\n\nfunction safe() {\n  try {\n    return 1;\n  } finally {\n    cleanup(); // ok — no return in finally\n  }\n}', explanation: 'return in finally replaces try return — avoid except deliberate tests. Interview asks this explicitly.' }},
    ]},
    { heading: 'Compare with C# and TypeScript', blocks: [
      { type: 'comparisonTable', title: 'Exception handling compared', headers: ['Feature', 'JavaScript', 'C#'], rows: [
        ['Multiple catch types', 'One catch; instanceof inside', 'Ordered catch clauses'],
        ['when filter', 'if in catch body', 'catch when (condition)'],
        ['finally', 'Same — always runs', 'Same'],
        ['using', 'Manual finally or disposable pattern', 'using / await using'],
        ['Async catch', 'await in try required', 'await in try same'],
      ]},
    ]},
    { heading: 'Common mistakes', blocks: [
      { type: 'callout', variant: 'warning', title: 'Pitfalls to avoid', body: 'Missing await in try for promises. Empty catch that hides bugs. return in finally overriding business logic. Swallowing without logging. Assuming catch (e) types e — in TS use unknown and narrow.' },
    ]},
  ],
  interviewTakeaways: [
    'One catch clause — branch with instanceof for types.',
    'finally always runs before completion; can override return.',
    'await inside try to catch async rejections.',
    'Rethrow after log when error is unexpected.',
    '60s: try/catch/finally like C# but single catch. await in try. finally return trap. instanceof when filter.',
  ],
  commonPitfalls: [
    'Weak: "try { asyncFn(); } catch handles it." Strong: "Must await asyncFn() inside try or use .catch on the promise."',
    'Weak: "finally is optional sugar." Strong: "finally runs on every path — cleanup and the return override trap."',
    'Strong: "Explain finally return 2 beating try return 1 — then say never return from finally in production."',
  ],
  relatedTopicIds: ['javascript-06-error-types-and-throwing', 'javascript-06-unhandled-rejections', 'javascript-06-errors-vs-csharp-exceptions'],
  jsTsCorrelations: [
    { language: 'typescript', concept: 'catch clause typing', note: 'TypeScript 4.4+ defaults catch to unknown — narrow with instanceof before accessing properties.', futureTopicSlug: 'typescript/narrowing/catch-unknown' },
    { language: 'typescript', concept: 'using statement', note: 'C# using disposes in finally automatically; JavaScript uses explicit finally or AbortController patterns.', futureTopicSlug: 'csharp/resources/using' },
  ],
  officialSources: [
    { title: 'MDN — try...catch', url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/try...catch' },
    { title: 'MDN — finally', url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/finally' },
    { title: 'javascript.info — Try...catch', url: 'https://javascript.info/try-catch' },
  ],
  animationHint: 'flow',
});

console.log('Wrote module 06 topics (4/16)');

// Module 07 topics
const module07Topics = [
  {
    file: '07-null-undefined-optional/topics/null-vs-undefined.json',
    topic: {
      id: 'javascript-07-null-vs-undefined',
      slug: 'null-vs-undefined',
      title: 'null versus undefined and when each appears',
      moduleId: 'javascript-07-null-undefined-optional',
      order: 1,
      hook: 'undefined means "no value assigned yet"; null means "intentionally empty." JSON drops undefined keys but keeps null — API boundaries and equality (`null == undefined`) confuse teams daily.',
      sections: [
        { heading: 'What is this?', blocks: [
          { type: 'prose', text: '**undefined** is the default for uninitialized variables, missing object properties, functions with no return, and missing function parameters. **null** is an explicit assignment meaning "no object" — you set it deliberately. Both are falsy. **`typeof undefined`** is `"undefined"`; **`typeof null`** is `"object"` (legacy bug). **`null == undefined`** is true; **`null === undefined`** is false.' },
          { type: 'glossary', title: 'Key terms', entries: [
            { term: 'undefined', longForm: 'undefined value', plainDefinition: 'Absence of assignment — default for unset bindings and missing keys.', example: 'let x; console.log(x); // undefined' },
            { term: 'null', longForm: 'null value', plainDefinition: 'Explicit empty reference the programmer assigned.', example: 'user.avatar = null; // cleared on purpose' },
            { term: 'void 0', longForm: 'void operator', plainDefinition: 'Historical idiom for undefined — rarely needed today.', example: 'void 0 === undefined // true' },
            { term: 'nullish', longForm: 'nullish values', plainDefinition: 'Only null and undefined — targets of ?? and ?.', example: '0 ?? 10 // 0; null ?? 10 // 10' },
          ]},
        ]},
        { heading: 'Why does it matter?', blocks: [
          { type: 'prose', text: 'APIs use null for absent optional fields in JSON; undefined keys disappear on JSON.stringify. Database NULL maps to null in JS. Mixing them breaks strict checks and Map keys. C# nullable reference types distinguish null at compile time; JavaScript has no compile guard — validate at boundaries.' },
          { type: 'callout', variant: 'remember', title: 'Check both at boundaries', body: 'if (value == null) catches null and undefined in one expression — the idiomatic loose equality use.' },
        ]},
        { heading: 'How it works step by step', blocks: [
          { type: 'steps', title: 'Where each appears', items: [
            { title: 'Declaration without init', body: 'let a; → undefined until assigned.' },
            { title: 'Missing property', body: 'obj.missing → undefined (not an error).' },
            { title: 'Explicit clear', body: 'ref = null when intentionally empty.' },
            { title: 'JSON round-trip', body: 'JSON.parse drops undefined; null survives. stringify omits undefined properties.' },
          ]},
          { type: 'diagram', diagram: { type: 'mermaid', title: 'null vs undefined decision', source: 'flowchart TD\n  Q{Intentional empty?}\n  Q -->|yes assign null| N[null in JSON and APIs]\n  Q -->|no value yet| U[undefined default]\n  U --> J[JSON.stringify omits key]\n  N --> P[JSON keeps null key]' }},
        ]},
        { heading: 'Code walkthrough', blocks: [
          { type: 'snippet', snippet: { language: 'javascript', label: 'Equality and typeof', code: 'console.log(null == undefined);  // true\nconsole.log(null === undefined); // false\nconsole.log(typeof null);          // "object" — bug\nconsole.log(typeof undefined);     // "undefined"\n\nfunction safeObject(value) {\n  return value !== null && typeof value === "object";\n}', explanation: 'Loose equality treats null and undefined as equal pair. Strict separates them. Guard objects with null check before typeof.' }},
          { type: 'snippet', snippet: { language: 'javascript', label: 'JSON boundary behavior', code: 'const payload = { a: 1, b: undefined, c: null };\nconsole.log(JSON.stringify(payload)); // {"a":1,"c":null}\n\nconst parsed = JSON.parse(\'{"a":1,"c":null}\');\nconsole.log(parsed.b); // undefined — key absent\nconsole.log(parsed.c); // null', explanation: 'undefined properties vanish on wire; null is explicit sentinel clients can rely on.' }},
          { type: 'snippet', snippet: { language: 'javascript', label: 'Default parameters vs undefined', code: 'function greet(name = "guest") {\n  return `Hello ${name}`;\n}\n\ngreet(undefined); // "Hello guest" — default applies\ngreet(null);        // "Hello null" — null is a value\n\ngreet();            // "Hello guest"', explanation: 'Default parameters trigger only for undefined (or missing arg), not null — common API bug.' }},
        ]},
        { heading: 'Compare with C# and TypeScript', blocks: [
          { type: 'comparisonTable', title: 'Absence of value', headers: ['Case', 'JavaScript', 'C#', 'TypeScript'], rows: [
            ['Unassigned local', 'undefined at run time', 'Compile error', 'Compile error with strict'],
            ['Nullable reference', 'null only', 'null with NRT warnings', 'null | undefined types'],
            ['JSON null', 'null', 'JsonNull', 'null'],
            ['Missing JSON field', 'undefined', 'default or optional', 'undefined or optional ?'],
            ['typeof null', '"object"', 'N/A', 'Same at run time'],
          ]},
        ]},
        { heading: 'Common mistakes', blocks: [
          { type: 'callout', variant: 'warning', title: 'Pitfalls to avoid', body: 'Using undefined in JSON payloads expecting key to exist. Treating null and undefined identically with ===. Forgetting default params ignore null. typeof null === "object" without extra null check.' },
        ]},
      ],
      interviewTakeaways: ['undefined = unset default; null = intentional empty.', 'null == undefined true; === false.', 'JSON.stringify drops undefined keys; keeps null.', 'Default parameters only replace undefined, not null.', '60s: Two absences. typeof null object bug. == null idiom. JSON null vs omitted key.'],
      commonPitfalls: ['Weak: "null and undefined are the same." Strong: "=== differs; == pairs them; JSON and defaults treat them differently."', 'Weak: "typeof checks for null object." Strong: "value !== null && typeof value === object".', 'Strong: "Show greet(null) vs greet(undefined) with default param — null passes through."'],
      relatedTopicIds: ['javascript-07-optional-chaining', 'javascript-07-nullish-coalescing', 'javascript-07-defensive-coding-patterns'],
      jsTsCorrelations: [
        { language: 'typescript', concept: 'strictNullChecks', note: 'TypeScript separates null and undefined in types; JavaScript conflates at run time unless you validate.', futureTopicSlug: 'typescript/null-safety/strict-null-checks' },
        { language: 'typescript', concept: 'Nullable reference types', note: 'C# NRT warns at compile time; JS has no compile step — use guards and ?? at boundaries.', futureTopicSlug: 'csharp/nullable/nrt' },
      ],
      officialSources: [
        { title: 'MDN — null', url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/null' },
        { title: 'MDN — undefined', url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/undefined' },
        { title: 'javascript.info — Nullish coalescing', url: 'https://javascript.info/nullish-coalescing-operator' },
      ],
      animationHint: 'compare',
    },
  },
  {
    file: '07-null-undefined-optional/topics/optional-chaining.json',
    topic: {
      id: 'javascript-07-optional-chaining',
      slug: 'optional-chaining',
      title: 'Optional chaining (?.) and safe navigation',
      moduleId: 'javascript-07-null-undefined-optional',
      order: 2,
      hook: 'Optional chaining (?.) stops property access when the base is null or undefined — returning undefined instead of throwing TypeError. It replaces nested && guards but does not validate business rules.',
      sections: [
        { heading: 'What is this?', blocks: [
          { type: 'prose', text: '**obj?.prop** reads prop only if obj is not nullish; otherwise short-circuits to **undefined**. **obj?.[expr]** and **func?.()** work for computed keys and optional calls. Combined with **??** for defaults. C# **?.** and **?[]** are the direct analog; TypeScript compiles ?. to the same run-time checks.' },
          { type: 'glossary', title: 'Key terms', entries: [
            { term: '?.', longForm: 'optional chaining', plainDefinition: 'Short-circuit property/index/call access on nullish base.', example: 'user?.profile?.email' },
            { term: '?.()', longForm: 'optional call', plainDefinition: 'Invoke function only if reference is not nullish.', example: 'callback?.()' },
            { term: 'short-circuit', longForm: 'short-circuit evaluation', plainDefinition: 'Stops evaluation at first nullish — rest of chain skipped.', example: 'a?.b.c // if a nullish, b.c not evaluated' },
            { term: 'nullish', longForm: 'null or undefined', plainDefinition: 'Only null and undefined trigger ?. — not 0 or "".', example: '0?.toFixed // 0.toFixed — 0 is not nullish' },
          ]},
        ]},
        { heading: 'Why does it matter?', blocks: [
          { type: 'prose', text: 'Deep API responses and DOM trees use ?. to avoid TypeError on missing nodes. Over-chaining hides data shape bugs — log missing paths in dev. Optional chaining does not replace schema validation on JSON.parse results.' },
          { type: 'callout', variant: 'tip', title: 'Combine with ??', body: 'const city = user?.address?.city ?? "unknown"; — default only when chain is nullish, not when city is "".' },
        ]},
        { heading: 'How it works step by step', blocks: [
          { type: 'steps', title: '?. evaluation', items: [
            { title: 'Evaluate base', body: 'If null or undefined, entire chain returns undefined.' },
            { title: 'Property access', body: 'Otherwise continue to next segment.' },
            { title: 'Optional call', body: 'func?.() skips call if func nullish.' },
            { title: 'No coercion', body: '0, false, "" are valid bases — only null/undefined short-circuit.' },
          ]},
          { type: 'diagram', diagram: { type: 'mermaid', title: 'Optional chain short-circuit', source: 'flowchart LR\n  A[user] --> B{nullish?}\n  B -->|yes| U[undefined]\n  B -->|no| C[.profile]\n  C --> D{nullish?}\n  D -->|yes| U\n  D -->|no| E[.email]' }},
        ]},
        { heading: 'Code walkthrough', blocks: [
          { type: 'snippet', snippet: { language: 'javascript', label: 'Nested API shape', code: 'const response = { user: { profile: null } };\n\n// Old guard:\nconst email1 = response.user && response.user.profile && response.user.profile.email;\n\n// Optional chaining:\nconst email2 = response.user?.profile?.email; // undefined\n\nconst len = response.user?.profile?.email?.length; // undefined — no throw', explanation: 'Without ?., null.profile throws TypeError. Chain stops safely at null profile.' }},
          { type: 'snippet', snippet: { language: 'javascript', label: 'Optional call and bracket', code: 'const handlers = { onSave: () => "saved" };\nhandlers.onSave?.();     // "saved"\nhandlers.onDelete?.();  // undefined — no throw\n\nconst key = "title";\nconst doc = { meta: { title: "Hi" } };\nconsole.log(doc.meta?.[key]); // "Hi"', explanation: '?.() for optional callbacks. ?.[key] for dynamic property when parent may be nullish.' }},
          { type: 'snippet', snippet: { language: 'javascript', label: 'Failure mode — hiding bugs', code: 'function getDiscount(user) {\n  // BUG: always undefined if tier misspelled — silent\n  return user?.loyalty?.teir?.percent ?? 0;\n}\n\n// Better in dev: validate shape\nfunction getDiscountSafe(user) {\n  if (!user?.loyalty) return 0;\n  if (!("tier" in user.loyalty)) throw new Error("loyalty.tier missing");\n  return user.loyalty.tier?.percent ?? 0;\n}', explanation: 'Optional chaining prevents crashes but typos return undefined silently — validate critical paths.' }},
        ]},
        { heading: 'Compare with C# and TypeScript', blocks: [
          { type: 'comparisonTable', title: 'Safe navigation', headers: ['Syntax', 'JavaScript', 'C#'], rows: [
            ['Property', 'obj?.prop', 'obj?.Prop'],
            ['Index', 'arr?.[i]', 'arr?[i]'],
            ['Call', 'fn?.()', 'Not for methods — null check first'],
            ['Nullish only', 'null, undefined', 'null only — no undefined value'],
            ['With default', '?? after chain', '?? operator same since C# 6+'],
          ]},
        ]},
        { heading: 'Common mistakes', blocks: [
          { type: 'callout', variant: 'warning', title: 'Pitfalls to avoid', body: 'Replacing all validation with ?. — typos slip through. Using ?. when 0 or "" are valid and need different handling. Optional chaining left of assignment (obj?.x = 1) is SyntaxError. Assuming ?. deep-clones — it only reads.' },
        ]},
      ],
      interviewTakeaways: ['?. short-circuits on null or undefined only — not other falsy.', 'Works for .prop, [key], and () calls.', 'Combine with ?? for defaults without clobbering 0.', 'Does not replace schema validation on API data.', '60s: ?. safe navigation like C#. nullish only. ?? for defaults. Silent undefined on typos — validate shape.'],
      commonPitfalls: ['Weak: "?. treats falsy like null." Strong: "Only null and undefined short-circuit; 0?.x works."', 'Weak: "?. validates API responses." Strong: "? prevents TypeError; use Zod/guards for shape."', 'Strong: "Compare && chain vs ?. — same behavior, ?. clearer for deep paths."'],
      relatedTopicIds: ['javascript-07-null-vs-undefined', 'javascript-07-nullish-coalescing', 'javascript-07-defensive-coding-patterns'],
      jsTsCorrelations: [
        { language: 'typescript', concept: 'optional chaining', note: 'TypeScript optional chaining types narrow only when combined with control flow; erased to same JS at run time.', futureTopicSlug: 'typescript/operators/optional-chaining' },
        { language: 'typescript', concept: 'null-conditional', note: 'C# ?. on null reference types; undefined does not exist in C# — JS has both nullish values.', futureTopicSlug: 'csharp/operators/null-conditional' },
      ],
      officialSources: [
        { title: 'MDN — Optional chaining', url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Optional_chaining' },
        { title: 'javascript.info — Optional chaining', url: 'https://javascript.info/optional-chaining' },
      ],
      animationHint: 'flow',
    },
  },
];

for (const { file, topic } of module07Topics) writeTopic(file, topic);
console.log('Wrote module 07 topics part 1 (6/16)');

const module07Topics2 = [
  {
    file: '07-null-undefined-optional/topics/nullish-coalescing.json',
    topic: {
      id: 'javascript-07-nullish-coalescing',
      slug: 'nullish-coalescing',
      title: 'Nullish coalescing (??) versus ||',
      moduleId: 'javascript-07-null-undefined-optional',
      order: 3,
      hook: '?? returns the right-hand side only when the left is null or undefined — unlike ||, which triggers on any falsy value including 0, "", and false. Picking the wrong operator breaks config defaults and form handling.',
      sections: [
        { heading: 'What is this?', blocks: [
          { type: 'prose', text: '**a ?? b** evaluates to **b** only when **a** is **null** or **undefined** (nullish). Otherwise it returns **a**. **a || b** returns **b** when **a** is any falsy value (false, 0, -0, 0n, "", null, undefined, NaN). **??** cannot mix with **||** or **&&** without parentheses — SyntaxError due to precedence ambiguity.' },
          { type: 'glossary', title: 'Key terms', entries: [
            { term: '??', longForm: 'nullish coalescing', plainDefinition: 'Default operator for null/undefined only.', example: 'port ?? 3000' },
            { term: '||', longForm: 'logical OR', plainDefinition: 'Returns first truthy operand; falsy triggers right side.', example: 'name || "anonymous"' },
            { term: 'nullish', longForm: 'nullish value', plainDefinition: 'null or undefined exclusively.', example: '0 ?? 1 // 0' },
            { term: '??=', longForm: 'nullish coalescing assignment', plainDefinition: 'Assign right side only if left is nullish.', example: 'opts.timeout ??= 5000' },
          ]},
        ]},
        { heading: 'Why does it matter?', blocks: [
          { type: 'prose', text: 'User settings with legitimate 0, empty string, or false break when || supplies defaults. API query params like ?count=0 need ??. React useState(0) with || default wrongly resets. C# **??** matches JavaScript nullish semantics for null only; JS adds undefined.' },
          { type: 'callout', variant: 'remember', title: '?? vs || rule of thumb', body: 'Use ?? for "missing" defaults. Use || when any falsy should fall back (rare in config — usually explicit checks).' },
        ]},
        { heading: 'How it works step by step', blocks: [
          { type: 'steps', title: 'Evaluation order', items: [
            { title: 'Evaluate left', body: 'Compute left operand first.' },
            { title: 'Nullish test for ??', body: 'If left is null or undefined, evaluate and return right.' },
            { title: 'Truthy test for ||', body: 'If left is falsy, return right; else return left.' },
            { title: 'Parentheses required', body: 'Mixing ?? with || without parens is SyntaxError.' },
          ]},
          { type: 'diagram', diagram: { type: 'mermaid', title: '?? vs || decision', source: 'flowchart TD\n  L[Left operand] --> Q{Operator?}\n  Q -->|??| N{null or undefined?}\n  N -->|yes| R[Return right]\n  N -->|no| L2[Return left]\n  Q -->|&#124;&#124;| F{falsy?}\n  F -->|yes| R\n  F -->|no| L2' }},
        ]},
        { heading: 'Code walkthrough', blocks: [
          { type: 'snippet', snippet: { language: 'javascript', label: '0 and empty string', code: 'const count = 0;\nconsole.log(count || 10);  // 10 — wrong for numeric 0\nconsole.log(count ?? 10);  // 0 — correct\n\nconst label = "";\nconsole.log(label || "default"); // "default"\nconsole.log(label ?? "default"); // "" — empty string kept\n\nconst enabled = false;\nconsole.log(enabled || true);  // true — false is falsy\nconsole.log(enabled ?? true);  // false', explanation: '|| treats 0, "", false as missing. ?? only null/undefined trigger default.' }},
          { type: 'snippet', snippet: { language: 'javascript', label: 'Config merge pattern', code: 'function createServer(options = {}) {\n  return {\n    host: options.host ?? "0.0.0.0",\n    port: options.port ?? 3000,\n    maxBody: options.maxBody ?? 1_048_576,\n  };\n}\n\ncreateServer({ port: 0 }); // port 0 valid — ?? keeps 0\n// createServer({ port: null }); // 3000', explanation: '?? preserves explicit 0 port. null/undefined pick defaults.' }},
          { type: 'snippet', snippet: { language: 'javascript', label: 'Precedence trap', code: '// const x = 1 || 2 ?? 3; // SyntaxError\nconst x = (1 || 2) ?? 3; // 1\nconst y = 1 || (2 ?? 3); // 1\n\nconst ttl = config.cacheTtl ?? config.defaultTtl ?? 60;', explanation: 'Parenthesize when mixing ?? and ||. Chain ?? for fallback chains.' }},
        ]},
        { heading: 'Compare with C# and TypeScript', blocks: [
          { type: 'comparisonTable', title: 'Default operators', headers: ['Value', 'JS ??', 'JS ||', 'C# ??'], rows: [
            ['0', '0', 'right side', '0'],
            ['""', '""', 'right side', 'N/A for string null only'],
            ['false', 'false', 'right side', 'N/A'],
            ['null', 'right side', 'right side', 'right side'],
            ['undefined', 'right side', 'right side', 'N/A in C#'],
          ]},
        ]},
        { heading: 'Common mistakes', blocks: [
          { type: 'callout', variant: 'warning', title: 'Pitfalls to avoid', body: 'Using || for numeric/string defaults when 0 or "" valid. Mixing ?? and || without parentheses. Replacing all || with ?? without reading falsy intent. ??= on property that should reset to 0.' },
        ]},
      ],
      interviewTakeaways: ['?? triggers only on null or undefined.', '|| triggers on all eight falsy values.', 'Use ?? for config defaults preserving 0 and "".', 'Cannot mix ?? and || without parentheses.', '60s: ?? nullish only. || any falsy. port 0 example. Chain ??. Parens when mixing.'],
      commonPitfalls: ['Weak: "?? and || are the same." Strong: "|| replaces 0 and ""; ?? only null/undefined."', 'Weak: "count || 10 is fine always." Strong: "Show count=0 breaking || — use ?? for numbers."', 'Strong: "Explain SyntaxError mixing without parens — language forbids ambiguity."'],
      relatedTopicIds: ['javascript-07-null-vs-undefined', 'javascript-07-optional-chaining', 'javascript-07-defensive-coding-patterns'],
      jsTsCorrelations: [
        { language: 'typescript', concept: 'nullish coalescing', note: 'TypeScript types ?? narrowing: result excludes null/undefined from left when right taken.', futureTopicSlug: 'typescript/operators/nullish-coalescing' },
        { language: 'typescript', concept: 'coalescing assignment', note: 'C# ??= same idea; JS ??= only for nullish — undefined included in JS.', futureTopicSlug: 'csharp/operators/null-coalescing' },
      ],
      officialSources: [
        { title: 'MDN — Nullish coalescing', url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Nullish_coalescing' },
        { title: 'javascript.info — Nullish coalescing', url: 'https://javascript.info/nullish-coalescing-operator' },
      ],
      animationHint: 'compare',
    },
  },
  {
    file: '07-null-undefined-optional/topics/defensive-coding-patterns.json',
    topic: {
      id: 'javascript-07-defensive-coding-patterns',
      slug: 'defensive-coding-patterns',
      title: 'Defensive checks, defaults, and guard clauses',
      moduleId: 'javascript-07-null-undefined-optional',
      order: 4,
      hook: 'Optional chaining stops crashes but does not prove data shape. Guard clauses, explicit validation at API boundaries, and nullish defaults form the production pattern senior interviews expect after JSON.parse.',
      sections: [
        { heading: 'What is this?', blocks: [
          { type: 'prose', text: '**Guard clauses** return early when preconditions fail — keeping happy path unindented. **Boundary validation** checks JSON.parse and fetch results before use. **Nullish defaults** with ?? preserve 0 and "". **Fail fast** throws typed errors when invariants break instead of propagating undefined. Layer: syntax (?., ??) for ergonomics; guards for correctness.' },
          { type: 'glossary', title: 'Key terms', entries: [
            { term: 'guard clause', longForm: 'guard clause', plainDefinition: 'Early return/throw when input invalid.', example: 'if (!user) return null;' },
            { term: 'boundary validation', longForm: 'boundary validation', plainDefinition: 'Validate external data at entry to system.', example: 'if (typeof body.id !== "string") throw ...' },
            { term: 'invariant', longForm: 'invariant', plainDefinition: 'Condition that must always hold for correct operation.', example: 'items.length > 0 before reduce' },
            { term: 'fail fast', longForm: 'fail fast', plainDefinition: 'Reject bad input immediately with clear error.', example: 'throw new ValidationError(fields)' },
          ]},
        ]},
        { heading: 'Why does it matter?', blocks: [
          { type: 'prose', text: 'TypeScript types erase at run time — JSON.parse returns any shape. Silent undefined from ?. causes wrong business logic (discount 0%). C# validates more at compile time; JS services need runtime guards at controllers and message consumers.' },
          { type: 'callout', variant: 'tip', title: 'Validate once at the edge', body: 'Parse and validate at HTTP handler or queue consumer — inner functions assume typed shape.' },
        ]},
        { heading: 'How it works step by step', blocks: [
          { type: 'steps', title: 'Defense in depth', items: [
            { title: 'Receive external data', body: 'fetch, JSON.parse, message queue payload.' },
            { title: 'Schema or guards', body: 'Check required fields and types — throw ValidationError.' },
            { title: 'Use ?. and ?? inside', body: 'Optional paths for truly optional nested fields only.' },
            { title: 'Guard clauses in domain', body: 'Early return for business rule violations.' },
          ]},
          { type: 'diagram', diagram: { type: 'mermaid', title: 'Boundary to domain', source: 'flowchart LR\n  API[HTTP / queue] --> V[Validate shape]\n  V -->|fail| E[400 + error]\n  V -->|ok| D[Domain logic]\n  D --> G[Guard clauses]\n  G --> H[Happy path with ?? defaults]' }},
        ]},
        { heading: 'Code walkthrough', blocks: [
          { type: 'snippet', snippet: { language: 'javascript', label: 'Guard clauses', code: 'function processOrder(order) {\n  if (order == null) return { ok: false, reason: "missing order" };\n  if (!Array.isArray(order.items) || order.items.length === 0) {\n    return { ok: false, reason: "empty items" };\n  }\n  if (typeof order.customerId !== "string") {\n    return { ok: false, reason: "invalid customerId" };\n  }\n  // happy path — no deep nesting\n  return { ok: true, total: order.items.reduce((s, i) => s + i.price, 0) };\n}', explanation: 'Early returns flatten logic. Each guard names failure reason for API response.' }},
          { type: 'snippet', snippet: { language: 'javascript', label: 'JSON boundary validation', code: 'function parseUserPayload(raw) {\n  const data = JSON.parse(raw);\n  if (typeof data !== "object" || data === null) {\n    throw new TypeError("payload must be object");\n  }\n  if (typeof data.id !== "string" || data.id.length === 0) {\n    throw new TypeError("id required string");\n  }\n  return {\n    id: data.id,\n    name: data.name ?? "Anonymous",\n    tier: data.tier ?? "free",\n  };\n}', explanation: 'Required fields validated explicitly. Optional fields use ?? not || for name default.' }},
          { type: 'snippet', snippet: { language: 'javascript', label: 'Failure mode — silent ?.', code: 'function charge(user) {\n  const rate = user?.billing?.rate ?? 0;\n  return rate * user.hours; // user.hours throws if user null\n}\n\nfunction chargeSafe(user) {\n  if (user == null) throw new TypeError("user required");\n  const rate = user.billing?.rate ?? 0;\n  if (typeof user.hours !== "number") throw new TypeError("hours required");\n  return rate * user.hours;\n}', explanation: '?. on inner fields does not guard required top-level user — guard clause first.' }},
        ]},
        { heading: 'Compare with C# and TypeScript', blocks: [
          { type: 'comparisonTable', title: 'Null safety patterns', headers: ['Pattern', 'JavaScript', 'C# / TypeScript'], rows: [
            ['Compile null check', 'None', 'NRT / strictNullChecks'],
            ['API validation', 'Manual or Zod', 'FluentValidation / Zod in TS'],
            ['Early return', 'Guard clauses', 'Same'],
            ['Optional nested', '?. and ??', '?. and ?? in C#; TS same'],
            ['JSON.parse', 'any shape — validate', 'System.Text.Json + types'],
          ]},
        ]},
        { heading: 'Common mistakes', blocks: [
          { type: 'callout', variant: 'warning', title: 'Pitfalls to avoid', body: 'Relying on ?. for required fields. Skipping validation because TypeScript compiled. Deep nesting instead of guards. Using || defaults when 0 is valid. Swallowing validation errors without structured response.' },
        ]},
      ],
      interviewTakeaways: ['Validate external data at boundary — TS does not run at runtime.', 'Guard clauses flatten happy path with early return/throw.', 'Use ?? for defaults; ?. for optional nested paths only.', 'Fail fast with typed errors — not silent undefined.', '60s: JSON.parse any shape. Guard at edge. ?. ergonomics not proof. ?? preserves 0. TS erased.'],
      commonPitfalls: ['Weak: "Optional chaining validates APIs." Strong: "?. prevents throw; guards prove shape at boundary."', 'Weak: "TypeScript makes runtime checks unnecessary." Strong: "Types erase — validate JSON.parse always."', 'Strong: "Show charge vs chargeSafe — required user needs guard not only ?."'],
      relatedTopicIds: ['javascript-07-null-vs-undefined', 'javascript-07-optional-chaining', 'javascript-07-null-safety-vs-typescript-nrt'],
      jsTsCorrelations: [
        { language: 'typescript', concept: 'runtime validation', note: 'Use zod/io-ts at boundaries; TypeScript interfaces do not exist at run time.', futureTopicSlug: 'typescript/validation/schema' },
        { language: 'typescript', concept: 'ArgumentNullException', note: 'C# throws ArgumentNullException on null params; JS convention: throw TypeError early in public APIs.', futureTopicSlug: 'csharp/exceptions/argument-null' },
      ],
      officialSources: [
        { title: 'MDN — JSON.parse', url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/parse' },
        { title: 'javascript.info — Error handling', url: 'https://javascript.info/error-handling' },
      ],
      animationHint: 'flow',
    },
  },
  {
    file: '07-null-undefined-optional/topics/null-safety-vs-typescript-nrt.json',
    topic: {
      id: 'javascript-07-null-safety-vs-typescript-nrt',
      slug: 'null-safety-vs-typescript-nrt',
      title: 'JavaScript null safety versus TypeScript and C# NRT',
      moduleId: 'javascript-07-null-undefined-optional',
      order: 5,
      hook: 'JavaScript has null and undefined at run time with zero compile-time enforcement. TypeScript strictNullChecks and C# nullable reference types (NRT) catch missing null checks before ship — but only if you validate again at JSON boundaries.',
      sections: [
        { heading: 'What is this?', blocks: [
          { type: 'prose', text: '**JavaScript** allows any variable to hold null or undefined anytime. **TypeScript strictNullChecks** adds `string | null` and forbids calling methods on possibly-null values without narrowing. **C# NRT** annotates `string?` vs `string` with compiler warnings. All compile-time aids **erase or strip** — run time is still plain JS unless you add runtime checks.' },
          { type: 'glossary', title: 'Key terms', entries: [
            { term: 'strictNullChecks', longForm: 'TypeScript strictNullChecks', plainDefinition: 'Compiler flag treating null/undefined as distinct types requiring narrowing.', example: 'if (user) { user.name } // narrowed' },
            { term: 'NRT', longForm: 'nullable reference types', plainDefinition: 'C# 8+ warnings when nullable reference used without check.', example: 'string? maybe; string definite;' },
            { term: 'type erasure', longForm: 'type erasure', plainDefinition: 'TypeScript types removed when compiling to JavaScript.', example: 'interface User {} // gone at run time' },
            { term: 'non-null assertion', longForm: 'non-null assertion', plainDefinition: 'TS postfix ! tells compiler value is non-null — no run-time check.', example: 'user!.name // trust compiler' },
          ]},
        ]},
        { heading: 'Why does it matter?', blocks: [
          { type: 'prose', text: 'Teams migrating C# to JS/TS expect compiler to catch null refs — it will not at JS run time. Overusing TS `!` recreates NullReferenceException. strictNullChecks + boundary validation is the production stack.' },
          { type: 'callout', variant: 'remember', title: 'Three layers', body: 'Compile: TS/C# warnings. Syntax: ?. and ??. Runtime: guards on JSON and user input.' },
        ]},
        { heading: 'How it works step by step', blocks: [
          { type: 'steps', title: 'Where safety lives', items: [
            { title: 'Author in TS/C#', body: 'Annotate nullable vs required.' },
            { title: 'Compile checks', body: 'Compiler errors on unsafe dereference.' },
            { title: 'Emit JavaScript', body: 'Types erased — no null checks injected.' },
            { title: 'Run time boundary', body: 'Validate external data — compiler never saw it.' },
          ]},
          { type: 'diagram', diagram: { type: 'mermaid', title: 'Compile vs run time', source: 'flowchart TB\n  subgraph compile [Compile time]\n    TS[TS strictNullChecks]\n    CS[C# NRT warnings]\n  end\n  subgraph runtime [Run time JS]\n    JSON[JSON.parse any]\n    GUARD[Manual guards]\n    OC[?. and ??]\n  end\n  TS --> EMIT[Emit JS]\n  CS --> ASM[IL with null checks on value types]\n  EMIT --> JSON\n  JSON --> GUARD' }},
        ]},
        { heading: 'Code walkthrough', blocks: [
          { type: 'snippet', snippet: { language: 'typescript', label: 'TypeScript narrowing', code: 'type User = { name: string; email?: string };\n\nfunction greet(u: User | null) {\n  // u.name; // error under strictNullChecks\n  if (!u) return "no user";\n  return u.name + (u.email ? ` <${u.email}>` : "");\n}\n\n// Non-null assertion — no runtime check:\nfunction risky(u: User | null) {\n  return u!.name; // compiles — can throw at run time\n}', explanation: 'if (!u) narrows type. ! asserts without check — dangerous at runtime.' }},
          { type: 'snippet', snippet: { language: 'javascript', label: 'Same code at run time', code: 'function greet(u) {\n  if (!u) return "no user";\n  return u.name + (u.email ? ` <${u.email}>` : "");\n}\n\ngreet(JSON.parse(\'{"name":"Ada"}\')); // works\ngreet(null); // "no user"\ngreet(JSON.parse("{}")); // undefined name concat — no TS to warn', explanation: 'Compiled JS has no type info. Missing name on parsed JSON slips through without schema validation.' }},
          { type: 'snippet', snippet: { language: 'javascript', label: 'Emulating NRT at boundary', code: 'function requireString(value, field) {\n  if (value == null) throw new TypeError(`${field} is nullish`);\n  if (typeof value !== "string") throw new TypeError(`${field} must be string`);\n  return value;\n}\n\nfunction mapDto(raw) {\n  return {\n    id: requireString(raw.id, "id"),\n    name: requireString(raw.name, "name"),\n  };\n}', explanation: 'Runtime require* helpers enforce non-null strings like C# non-nullable reference expectations.' }},
        ]},
        { heading: 'Compare with C# and TypeScript', blocks: [
          { type: 'comparisonTable', title: 'Null safety models', headers: ['Aspect', 'JavaScript', 'TypeScript', 'C# NRT'], rows: [
            ['Enforcement', 'Run time only', 'Compile time', 'Compile warnings'],
            ['undefined', 'First-class value', 'Typed explicitly', 'No undefined'],
            ['JSON boundary', 'Always validate', 'Validate — types lie', 'Deserialize + nullable annotations'],
            ['Safe navigation', '?. ??', 'Same syntax', '?. ??'],
            ['Dangerous escape', 'No compile', 'user! assertion', 'null-forgiving !'],
          ]},
        ]},
        { heading: 'Common mistakes', blocks: [
          { type: 'callout', variant: 'warning', title: 'Pitfalls to avoid', body: 'Trusting TS after JSON.parse without validation. Overusing ! non-null assertion. Assuming strictNullChecks adds runtime checks. Ignoring undefined in TS types when interfacing with JS libraries. Disabling strictNullChecks to silence errors.' },
        ]},
      ],
      interviewTakeaways: ['JS: null and undefined at runtime — no compiler.', 'TS strictNullChecks: compile-only; erases to JS.', 'C# NRT: warnings; value types still runtime-checked.', 'Always validate JSON.parse — all three languages.', '60s: Three layers compile ?. ?? guards. TS ! dangerous. JSON boundary mandatory.'],
      commonPitfalls: ['Weak: "TypeScript prevents null at runtime." Strong: "Types erase — only guards and ?. at run time."', 'Weak: "strictNullChecks is enough for APIs." Strong: "External JSON never saw compiler — schema validate."', 'Strong: "Compare risky u!.name vs if (!u) guard — assertion vs proof."'],
      relatedTopicIds: ['javascript-07-null-vs-undefined', 'javascript-07-defensive-coding-patterns', 'javascript-07-nullish-coalescing'],
      jsTsCorrelations: [
        { language: 'typescript', concept: 'strictNullChecks', note: 'Enabling strictNullChecks is baseline for null-safe TS; pairs with unknown on catch and API boundaries.', futureTopicSlug: 'typescript/null-safety/strict-null-checks' },
        { language: 'typescript', concept: 'nullable reference types', note: 'C# NRT uses ? on reference types; undefined has no C# equivalent — TS unions include undefined.', futureTopicSlug: 'csharp/nullable/nrt' },
      ],
      officialSources: [
        { title: 'MDN — undefined', url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/undefined' },
        { title: 'TypeScript — strictNullChecks', url: 'https://www.typescriptlang.org/tsconfig#strictNullChecks' },
      ],
      animationHint: 'compare',
    },
  },
];

for (const { file, topic } of module07Topics2) writeTopic(file, topic);
console.log('Wrote module 07 topics (9/16)');
