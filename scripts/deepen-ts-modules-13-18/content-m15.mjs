import { snippet } from './build-topic.mjs';

export const m15Topics = {
  'branded-and-opaque-types': {
    hook:
      '**Branded types** add a compile-time tag so `UserId` and `OrderId` are both `string` at runtime but not interchangeable in TypeScript. Opaque types hide structure — senior interviews use them for domain safety without runtime cost.',
    whatIs:
      'A **brand** is a phantom property: `type UserId = string & { readonly __brand: unique symbol }`. Constructors validate and cast: `function UserId(s: string): UserId`. **Opaque type** (`declare const __opaque: unique symbol`) hides internals — consumers cannot construct without factory. Zero runtime overhead — brands erase on emit. C# uses nominal types natively; TS uses brands for the same safety at API boundaries.',
    glossary: [
      { term: 'brand', longForm: 'branded type', plainDefinition: 'Phantom type tag preventing structural assignability between same primitives.', example: 'type Email = string & { __brand: "Email" }' },
      { term: 'opaque', longForm: 'opaque type', plainDefinition: 'Hidden structure — only creation function knows shape.', example: 'type Token = Opaque<string, "Token">' },
      { term: 'nominal typing', longForm: 'nominal vs structural', plainDefinition: 'TS is structural — brands simulate nominal for primitives.', example: 'UserId not assignable to OrderId' },
      { term: 'phantom type', longForm: 'compile-time only', plainDefinition: 'Brand property never exists at runtime.', example: 'Erased on emit' },
    ],
    whyMatters:
      'Passing order ID where user ID expected causes data leaks — brands catch at compile time. Currency amounts as branded cents vs dollars. SQL injection less relevant but UUID vs plain string matters. Libraries: zod-brand, newtype patterns.',
    tipTitle: 'Interview trap: brand at runtime',
    tipBody: 'Brands exist only in type system — runtime still sees plain string. Validation must happen in constructor function.',
    steps: [
      { title: 'Define branded alias', body: 'string & { readonly __brand: unique symbol }' },
      { title: 'Factory validates', body: 'Parse/regex then cast as UserId' },
      { title: 'Use in domain APIs', body: 'function loadUser(id: UserId)' },
      { title: 'Never export cast', body: 'as UserId only inside factory' },
    ],
    diagramTitle: 'Branded type safety',
    diagram:
      'flowchart LR\n  RAW["plain string"] --> FACT["UserId() factory"]\n  FACT --> UID["UserId branded"]\n  UID --> API["loadUser(id: UserId)"]\n  RAW -.->|blocked| API',
    snippets: [
      snippet('typescript', 'Branded UserId and OrderId', 'declare const __userId: unique symbol;\ndeclare const __orderId: unique symbol;\n\ntype UserId = string & { readonly [__userId]: never };\ntype OrderId = string & { readonly [__orderId]: never };\n\nfunction UserId(value: string): UserId {\n  if (!/^usr_[a-z0-9]+$/.test(value)) throw new Error("invalid user id");\n  return value as UserId;\n}\n\nfunction loadUser(id: UserId) { /* ... */ }\n\nconst oid = "ord_123" as OrderId;\nloadUser(oid); // compile error', 'Lines 4–5: distinct brands. Line 11: OrderId not assignable to UserId.'),
      snippet('typescript', 'Branded cents for money', 'type Cents = number & { readonly __cents: unique symbol };\n\nfunction Cents(n: number): Cents {\n  if (!Number.isInteger(n)) throw new Error("cents must be integer");\n  return n as Cents;\n}\n\nfunction add(a: Cents, b: Cents): Cents {\n  return Cents(a + b);\n}\n\nadd(Cents(100), 50); // error: number not Cents', 'Prevents adding dollars to cents without explicit conversion.'),
      snippet('typescript', 'Opaque type helper', 'declare const Tag: unique symbol;\ntype Opaque<T, TagName extends string> = T & { readonly [Tag]: TagName };\n\ntype SessionToken = Opaque<string, "SessionToken">;\n\nfunction createToken(raw: string): SessionToken {\n  if (raw.length < 32) throw new Error("weak token");\n  return raw as SessionToken;\n}', 'Opaque pattern reusable with tag name parameter.'),
      snippet('typescript', 'Failure mode — casting around factory', 'type UserId = string & { __brand: "UserId" };\nconst id = "hack" as UserId; // bypasses validation\nloadUser(id); // compiles — brand without factory is unsafe', 'Line 2: as UserId defeats purpose — lint ban double assertion at boundaries.'),
    ],
    compareRows: [
      ['Approach', 'Branded primitive', 'Wrapper class', 'C# nominal'],
      ['Runtime cost', 'Zero', 'Object allocation', 'Zero'],
      ['Validation', 'Factory required', 'Constructor', 'Type system'],
      ['Structural TS', 'Simulates nominal', 'Nominal-like', 'True nominal'],
    ],
    mistakesBody: 'Exporting as Brand casts. Brands on objects without factory discipline. Over-branding every string.',
    seniorProse: 'Zod .brand<T>(). io-ts opaque. Use for IDs, currencies, units. Do not brand DTOs with dozens of fields — use interfaces. Compare C# record struct wrappers — runtime exists; brands do not.',
    seniorRows: [
      ['Branded primitives', 'Zero cost domain safety', 'Discipline on factories'],
      ['Wrapper classes', 'Runtime instanceof', 'Allocation + serialization'],
      ['Plain string + validation', 'Simple', 'No compile-time mix-up protection'],
    ],
    seniorWarning: 'Says brands exist at runtime. Casts around factory. Cannot explain structural vs nominal.',
    interviewTakeaways: [
      'Brands add compile-time tag — zero runtime cost.',
      'Validate in factory — never export raw as Brand.',
      'UserId vs OrderId both string — brands prevent swap.',
      '60s: string & { __brand }. Factory validates. Erases at emit. C# nominal types native. Opaque hides structure.',
      'Follow-up: zod .brand() pattern.',
    ],
    commonPitfalls: [
      'Weak: as UserId without validation.',
      'Weak: branding every string — noise.',
      'Strong: "Brand = phantom tag. Factory only entry. Zero runtime. C# nominal without wrapper."',
    ],
    relatedTopicIds: ['typescript-15-recursive-types', 'typescript-15-builder-pattern-typing', 'typescript-02-any-unknown-never'],
    jsTsCorrelations: [
      { language: 'javascript', concept: 'runtime strings', note: 'JS sees plain strings — brand is TS-only discipline.', futureTopicSlug: 'javascript/09-structural-typing-patterns/branding-and-symbols' },
      { language: 'typescript', concept: 'nominal types', note: 'C# string cannot stand in for custom Id struct without conversion.', futureTopicSlug: 'csharp/types/nominal-typing' },
    ],
    officialSources: [
      { title: 'Basarat — nominal typing', url: 'https://basarat.gitbook.io/typescript/main-1/nominaltyping' },
    ],
    animationHint: 'compare',
  },

  'recursive-types': {
    hook:
      '**Recursive types** describe JSON trees, nested menus, and linked lists: `type Json = string | number | Json[] | { [k: string]: Json }`. TypeScript limits recursion depth — hit "type instantiation excessively deep" in complex mapped+recursive combos.',
    whatIs:
      'A type references itself in its definition. **JSONValue** pattern is canonical. **Recursive conditional types** unwrap nested structures. Compiler has **depth limits** (~50 instantiations) — simplify or use interfaces for mutual recursion. **interface** allows circular references more cleanly than type aliases in some cases.',
    glossary: [
      { term: 'recursive type', longForm: 'self-referential type', plainDefinition: 'Type alias or interface that references itself.', example: 'type Tree<T> = { value: T; children: Tree<T>[] }' },
      { term: 'depth limit', longForm: 'excessively deep', plainDefinition: 'Compiler stops deep instantiation — refactor types.', example: 'TS2589 error' },
      { term: 'mutual recursion', longForm: 'A references B references A', plainDefinition: 'Use interface for cleaner circular defs.', example: 'interface Expr { kind: "add"; nodes: Expr[] }' },
      { term: 'Json', longForm: 'JSONValue type', plainDefinition: 'Standard recursive JSON type pattern.', example: 'type Json = string | number | boolean | null | Json[] | { [key: string]: Json }' },
    ],
    whyMatters:
      'API schemas, AST nodes, and config trees need recursive types. DeepPartial<Json> can blow compiler budget. Interviewers ask JSON type + depth limits. C# recursive records similar but runtime typed.',
    tipTitle: 'Interview trap: infinite expansion',
    tipBody: 'Mapped type over recursive Json without base case triggers TS2589 — add depth parameter or interface trick.',
    steps: [
      { title: 'Define base + recursive arm', body: 'Union with self-reference' },
      { title: 'Prefer interface for trees', body: 'interface Node { children: Node[] }' },
      { title: 'Watch compiler depth', body: 'Simplify conditional recursion' },
      { title: 'Runtime validate', body: 'Types do not validate JSON depth at runtime' },
    ],
    diagramTitle: 'Recursive JSON type',
    diagram:
      'flowchart TD\n  J["Json"] --> P["primitives"]\n  J --> ARR["Json[]"]\n  J --> OBJ["{ [key: string]: Json }"]\n  ARR --> J\n  OBJ --> J',
    snippets: [
      snippet('typescript', 'JSONValue recursive type', 'type JsonPrimitive = string | number | boolean | null;\ntype Json = JsonPrimitive | Json[] | { [key: string]: Json };\n\nfunction parseJson(text: string): Json {\n  return JSON.parse(text) as Json; // still validate at boundary\n}', 'Lines 1–2: standard recursive JSON. Line 5: cast after parse — add runtime validator in production.'),
      snippet('typescript', 'Tree and AST node', 'interface Expr {\n  kind: "lit" | "add";\n  value?: number;\n  left?: Expr;\n  right?: Expr;\n}\n\nfunction evalExpr(e: Expr): number {\n  if (e.kind === "lit") return e.value ?? 0;\n  return evalExpr(e.left!) + evalExpr(e.right!);\n}', 'Interface recursive AST — children optional for leaf nodes.'),
      snippet('typescript', 'Depth-limited DeepPartial trick', 'type DeepPartial<T, D extends number = 5> = D extends 0\n  ? T\n  : T extends object\n    ? { [K in keyof T]?: DeepPartial<T[K], [-1, 0, 1, 2, 3, 4][D]> }\n    : T;', 'Depth counter prevents infinite recursive mapped instantiation.'),
      snippet('typescript', 'Failure mode — TS2589', '// type Bad<T> = { [K in keyof T]: Bad<T[K]> }; // on Json → excessively deep\n// Fix: depth parameter or stop at primitives', 'Unbounded recursive mapped types exceed compiler limits.'),
    ],
    compareRows: [
      ['Pattern', 'type alias recursion', 'interface recursion', 'C# record'],
      ['Depth limit', 'Yes ~50', 'Yes', 'N/A compile'],
      ['JSON typing', 'Json union', 'N/A', 'JsonNode / JsonDocument'],
      ['Runtime check', 'Manual/schema', 'Manual', 'System.Text.Json'],
    ],
    mistakesBody: 'Unbounded DeepPartial on recursive types. Assuming recursive type validates runtime JSON. Mutual recursion with type only — use interface.',
    seniorProse: 'Use zod lazy() for recursive runtime schemas matching recursive types. Compiler performance: flatten types for hot paths. Compare F# recursive types — similar depth issues.',
    seniorRows: [
      ['Json union type', 'Simple API docs', 'No depth/runtime guarantee'],
      ['Zod lazy schema', 'Runtime + inferred type', 'Bundle size'],
      ['Depth-limited utility', 'Compiler friendly', 'Incomplete deep partial'],
    ],
    seniorWarning: 'Cannot write Json recursive type. Unaware of depth limit. No runtime validation mention.',
    interviewTakeaways: [
      'Recursive types reference themselves — Json pattern is canonical.',
      'Compiler depth limit — TS2589 on deep mapped recursion.',
      'interface works well for tree/AST nodes.',
      '60s: Json union. Depth-limited DeepPartial. Validate at runtime. C# JsonDocument for runtime JSON.',
      'Follow-up: zod lazy for recursive schemas.',
    ],
    commonPitfalls: [
      'Weak: infinite DeepPartial without depth cap.',
      'Weak: Json type without runtime validator.',
      'Strong: "Json union recursive. interface for trees. depth param for mapped. zod lazy at boundary."',
    ],
    relatedTopicIds: ['typescript-15-branded-and-opaque-types', 'typescript-12-mapped-types', 'typescript-18-type-complexity-budget'],
    jsTsCorrelations: [
      { language: 'javascript', concept: 'nested JSON', note: 'Runtime JSON any depth — TS recursive type does not limit parse.', futureTopicSlug: 'javascript/types/json-and-serialization' },
      { language: 'typescript', concept: 'JsonNode', note: 'C# JsonNode mutable tree — TS Json type is compile-time only.', futureTopicSlug: 'csharp/types/json' },
    ],
    officialSources: [
      { title: 'TS recursive type aliases', url: 'https://www.typescriptlang.org/docs/handbook/2/types-from-types.html#recursive-types' },
    ],
    animationHint: 'flow',
  },

  'builder-pattern-typing': {
    hook:
      'The **builder pattern** with progressive type safety tracks which fields are set — `Builder<"name" | "email">` only allows `.build()` when all required keys are present. Alternatives: method chaining with `this` return type and conditional types.',
    whatIs:
      'Start with empty builder state type. Each setter **adds** a key to tracked union via generics: `class FormBuilder<Set extends keyof Form = never>`. **build()** only available when `Set` extends `RequiredKeys`. Use **intersection** or **conditional** to enforce compile-time completeness without runtime flags for required fields.',
    glossary: [
      { term: 'progressive builder', longForm: 'type-state builder', plainDefinition: 'Each method returns builder with updated type state.', example: 'withName(): Builder<"name">' },
      { term: 'phantom state', longForm: 'generic state parameter', plainDefinition: 'Type parameter tracks set fields — not stored at runtime.', example: 'FormBuilder<"email" | "name">' },
      { term: 'build guard', longForm: 'exhaustive keys', plainDefinition: 'build() enabled only when all required keys in Set.', example: 'Set extends RequiredKeys ? BuildResult : never' },
      { term: 'fluent interface', longForm: 'method chaining', plainDefinition: 'Returns this for chaining — typing this is key.', example: 'return this as FormBuilder<Set | "name">' },
    ],
    whyMatters:
      'Prevents submitting half-filled forms at compile time. ORM query builders use similar patterns. Interview coding: type-safe SQL builder. C# fluent builders often runtime-check — TS can do compile-time.',
    tipTitle: 'Interview trap: runtime vs compile-time complete',
    tipBody: 'Runtime if (!email) throw is not substitute — goal is caller cannot call build() until types prove completeness.',
    steps: [
      { title: 'Define required keys union', body: 'type Required = "name" | "email"' },
      { title: 'Generic state parameter', body: 'Builder<Set extends keyof T>' },
      { title: 'Setters widen Set', body: 'withName(): Builder<Set | "name">' },
      { title: 'Conditional build()', body: 'Only when Set extends Required' },
    ],
    diagramTitle: 'Builder type state machine',
    diagram:
      'stateDiagram-v2\n  [*] --> Empty\n  Empty --> HasName: withName()\n  HasName --> Complete: withEmail()\n  Complete --> [*]: build()',
    snippets: [
      snippet('typescript', 'Type-state form builder', 'interface UserForm {\n  name: string;\n  email: string;\n  age?: number;\n}\n\ntype Required = "name" | "email";\n\nclass UserBuilder<Set extends keyof UserForm = never> {\n  private data: Partial<UserForm> = {};\n\n  name(value: string): UserBuilder<Set | "name"> {\n    this.data.name = value;\n    return this as UserBuilder<Set | "name">;\n  }\n\n  email(value: string): UserBuilder<Set | "email"> {\n    this.data.email = value;\n    return this as UserBuilder<Set | "email">;\n  }\n\n  build(this: UserBuilder<Required>): UserForm {\n    return this.data as UserForm;\n  }\n}\n\nnew UserBuilder().name("Ada").build(); // error: email missing\nnew UserBuilder().name("Ada").email("a@b.c").build(); // OK', 'Line 19: this type requires Required keys before build.'),
      snippet('typescript', 'Functional builder with generics', 'type Builder<T, Set extends keyof T = never> = {\n  set<K extends keyof T>(key: K, value: T[K]): Builder<T, Set | K>;\n  build: Set extends keyof T ? () => T : never;\n};', 'Functional sketch — build type is never until Set covers T.'),
      snippet('typescript', 'Simple fluent without type-state', 'class Query {\n  private sql = "SELECT * FROM users";\n  where(clause: string): this {\n    this.sql += ` WHERE ${clause}`;\n    return this;\n  }\n  execute(): Promise<Row[]> { /* ... */ return Promise.resolve([]); }\n}', 'Returns this — chaining without compile-time SQL safety.'),
      snippet('typescript', 'Failure mode — build() always available', 'class BadBuilder {\n  build() { return {}; }\n}\n// No compile-time required field tracking', 'Without generic state, builder offers no type safety advantage.'),
    ],
    compareRows: [
      ['Pattern', 'Type-state builder', 'Runtime validation', 'C# fluent'],
      ['Missing field', 'Compile error', 'Throw at build', 'Throw at build'],
      ['Complexity', 'High TS skill', 'Low', 'Medium'],
      ['Runtime cost', 'Partial object', 'Same', 'Same'],
    ],
    mistakesBody: 'Over-engineering simple DTOs. this typing without Required constraint on build. Cast abuse in setters.',
    seniorProse: 'Libraries: io-ts codec chaining. Kysely query builder types SQL. Know when plain object + satisfies beats builder. C# source generators can emit builders — TS uses conditional types.',
    seniorRows: [
      ['Type-state builder', 'Compile-time completeness', 'Hard to maintain'],
      ['Zod .safeParse', 'Runtime + inferred type', 'Not compile-time build order'],
      ['Plain constructor', 'Simple', 'No progressive API'],
    ],
    seniorWarning: 'Cannot sketch generic Set parameter. Says builder is only OOP pattern. No this typing on build.',
    interviewTakeaways: [
      'Track set keys in generic union — build() requires all Required.',
      'this parameter on build() enforces completeness.',
      'Phantom state — zero extra runtime fields for tracking.',
      '60s: UserBuilder<Set>._setters widen Set. build(this: UserBuilder<Required>). C# often runtime-only checks.',
      'Follow-up: compare to Kysely typed query builder.',
    ],
    commonPitfalls: [
      'Weak: builder with build() always callable.',
      'Weak: type-state for trivial 2-field forms.',
      'Strong: "Generic Set tracks keys. this on build for Required. Phantom compile-time only."',
    ],
    relatedTopicIds: ['typescript-15-branded-and-opaque-types', 'typescript-12-conditional-types-basics', 'typescript-09-generic-constraints'],
    jsTsCorrelations: [
      { language: 'javascript', concept: 'fluent chaining', note: 'JS builders work at runtime — TS adds compile-time key tracking.', futureTopicSlug: 'javascript/09-structural-typing-patterns/factory-and-builder-patterns' },
      { language: 'typescript', concept: 'source generators', note: 'C# generators emit builders — TS uses conditional types in source.', futureTopicSlug: 'csharp/generators/source-generators' },
    ],
    officialSources: [
      { title: 'TypeScript this parameters', url: 'https://www.typescriptlang.org/docs/handbook/2/classes.html#this-parameters' },
    ],
    animationHint: 'flow',
  },

  'type-level-programming-limits': {
    hook:
      'Type-level programming can encode business rules in types — but teams hit **readability walls**, **compiler slowdown**, and **on-call confusion**. Senior engineers know when to stop: prefer runtime validation + simple types for most code.',
    whatIs:
      'Advanced patterns — deep conditional types, recursive mapped types, string template metaprogramming — are powerful but costly. **Type complexity budget** is a team convention: max N lines of type logic per feature, ban certain patterns in app code, allow in shared lib. **tsc --extendedDiagnostics** shows check time. Prefer **Zod infer** over 50-line conditional types for API shapes.',
    glossary: [
      { term: 'type complexity budget', longForm: 'team convention', plainDefinition: 'Agreed limits on advanced type gymnastics per PR.', example: 'No conditional types in components/' },
      { term: 'extendedDiagnostics', longForm: 'compiler perf', plainDefinition: 'Flag showing type check time per file.', example: 'tsc --extendedDiagnostics' },
      { term: 'infer hell', longForm: 'nested conditional', plainDefinition: 'Deep infer chains readable only to author.', example: 'T extends ... ? infer U : ...' },
      { term: 'satisfies', longForm: 'pragmatic middle', plainDefinition: 'Check shape without widening — less metaprogramming.', example: 'const cfg = {...} satisfies Config' },
    ],
    whyMatters:
      'One 200-line types.ts can add seconds to CI. Juniors cannot maintain infer chains. Interview flex types impress but fail code review in product teams. Balance with C# — source generators move complexity to build step with readable output.',
    tipTitle: 'Interview trap: clever types in production',
    tipBody: 'Interviewers want you to know advanced types AND when to refuse them — on-call readability wins.',
    steps: [
      { title: 'Solve with runtime first', body: 'Zod + inferred type' },
      { title: 'Extract to named type alias', body: 'Document each step' },
      { title: 'Measure compile time', body: 'extendedDiagnostics on hot files' },
      { title: 'Code review radar', body: 'Reject unmaintainable infer chains' },
    ],
    diagramTitle: 'When to stop typing',
    diagram:
      'flowchart TD\n  NEED["Need type safety"] --> Q{Runtime schema enough?}\n  Q -->|yes| ZOD["Zod infer / manual interface"]\n  Q -->|no| ADV["Conditional/mapped types"]\n  ADV --> LIM{Within budget?}\n  LIM -->|no| ZOD',
    snippets: [
      snippet('typescript', 'Zod instead of 40-line conditional', 'import { z } from "zod";\n\nconst UserSchema = z.object({\n  id: z.string().uuid(),\n  email: z.string().email(),\n});\n\ntype User = z.infer<typeof UserSchema>;\n\nfunction parseUser(raw: unknown): User {\n  return UserSchema.parse(raw);\n}', 'Runtime validation + single source of truth — replaces hand-rolled conditional extract.'),
      snippet('typescript', 'Named aliases for readability', '// Bad: export type ExtractRoute<T> = T extends `/${infer Seg}/${infer Rest}`\n//   ? { seg: Seg } & ExtractRoute<`/${Rest}`> : ...\n\n// Better: split into RouteHead, RouteTail, Document each', 'Decompose complex types — one alias per concept.'),
      snippet('bash', 'Measure typecheck cost', 'npx tsc --noEmit --extendedDiagnostics 2>&1 | head -20\n# Look for Check time and Files: lines', 'Identify files consuming disproportionate check time.'),
      snippet('typescript', 'Failure mode — unmaintainable utility type', '// 80 lines of distributive conditional for API response\n// Junior cannot fix when API adds field — use code gen or Zod', 'Clever types without docs block team velocity.'),
    ],
    compareRows: [
      ['Approach', 'Maintainability', 'Compile cost', 'Runtime safety'],
      ['Zod infer', 'High', 'Low', 'Yes'],
      ['Deep conditionals', 'Low', 'High', 'No'],
      ['C# source generator', 'Medium', 'Build step', 'Yes'],
      ['Plain interface', 'Highest', 'Lowest', 'No'],
    ],
    mistakesBody: 'Conditional types for JSON shapes Zod handles. No type complexity lint in review. Copy-paste Stack Overflow infer chains.',
    seniorProse: 'Establish TYPE_BUDGET in eng docs. Allow advanced types only in @org/types-utils. Use ts-reset, type-fest judiciously. Principal engineer reviews type-heavy PRs.',
    seniorRows: [
      ['Zod + infer', 'Best default for APIs', 'Runtime dep'],
      ['Shared type utils package', 'Reuse clever once', 'Still complex'],
      ['OpenAPI codegen', 'Sync with server', 'Codegen pipeline'],
    ],
    seniorWarning: 'Only shows off complex types — no stop rule. Ignores compile time. Cannot name Zod alternative.',
    interviewTakeaways: [
      'Advanced types have compile-time and readability cost.',
      'Zod infer replaces many conditional API types.',
      'extendedDiagnostics finds slow files.',
      '60s: Type budget per team. Runtime validation at boundaries. Named aliases. C# generators for heavy codegen.',
      'Follow-up: type-fest when appropriate vs not.',
    ],
    commonPitfalls: [
      'Weak: 100-line conditional for API shape.',
      'Weak: no compile time measurement in large repo.',
      'Strong: "Zod first. Type budget in review. Split aliases. Generators/codegen for heavy cases."',
    ],
    relatedTopicIds: ['typescript-18-type-complexity-budget', 'typescript-12-conditional-types-basics', 'typescript-15-advanced-patterns-vs-csharp'],
    jsTsCorrelations: [
      { language: 'javascript', concept: 'runtime validation', note: 'JS always needs runtime checks — TS types optional layer.', futureTopicSlug: 'javascript/09-structural-typing-patterns/runtime-shape-validation' },
      { language: 'typescript', concept: 'source generators', note: 'C# moves complexity to generated readable code.', futureTopicSlug: 'csharp/generators/source-generators' },
    ],
    officialSources: [
      { title: 'TS performance wiki', url: 'https://github.com/microsoft/TypeScript/wiki/Performance' },
    ],
    animationHint: 'timeline',
  },

  'advanced-patterns-vs-csharp': {
    hook:
      'TypeScript encodes domain rules with **conditional types**, **brands**, and **mapped types**; C# uses **source generators**, **records**, and **nominal types**. Senior cross-stack engineers map patterns and pick the right tool per language.',
    whatIs:
      'TS type-level programming is **erasable** — no runtime effect unless paired with validation. C# **source generators** emit code at compile time with full runtime behavior. **Branded types** ↔ thin record wrappers. **DeepPartial** ↔ optional init records. **Builder** ↔ generator-built fluent API. Choose TS types for API contracts; C# generators for repetitive boilerplate with runtime impact.',
    glossary: [
      { term: 'source generator', longForm: 'C# source generator', plainDefinition: 'Roslyn analyzes compile unit and emits additional C# files.', example: '[Generator] class MyGenerator' },
      { term: 'type erasure', longForm: 'TS compile emit', plainDefinition: 'Generics and brands vanish — JS has no T.', example: 'No runtime DeepPartial' },
      { term: 'record', longForm: 'C# record', plainDefinition: 'Immutable nominal type with value equality.', example: 'public record UserId(string Value);' },
      { term: 'T4 / scaffolding', longForm: 'codegen', plainDefinition: 'Both ecosystems use codegen — different pipelines.', example: 'OpenAPI → TS types' },
    ],
    whyMatters:
      'Teams on Angular + .NET backend duplicate DTO logic — align OpenAPI/Protobuf. Misapplying C# nominal thinking to structural TS causes friction. Interviewers ask "how would you do X in TS vs C#".',
    tipTitle: 'Interview trap: TS types as runtime guards',
    tipBody: 'C# nullable and pattern matching run at runtime; TS strictNullChecks is compile-time only — same validation lesson, different enforcement.',
    steps: [
      { title: 'Identify need', body: 'Compile-time only vs runtime behavior' },
      { title: 'TS: types + Zod', body: 'Boundary validation' },
      { title: 'C#: generators/records', body: 'Boilerplate + runtime types' },
      { title: 'Share OpenAPI/Proto', body: 'Single schema, dual codegen' },
    ],
    diagramTitle: 'TS types vs C# generators',
    diagram:
      'flowchart LR\n  subgraph TS\n    TYPES["Conditional types"] --> ERASE["Erased JS"]\n    ZOD["Zod"] --> RT1["Runtime check"]\n  end\n  subgraph CSharp\n    GEN["Source generator"] --> IL["CLR types + code"]\n  end',
    snippets: [
      snippet('typescript', 'TS branded UserId', 'type UserId = string & { __brand: "UserId" };\nfunction UserId(s: string): UserId {\n  if (!s) throw new Error("empty");\n  return s as UserId;\n}', 'Compile-time tag — runtime still string.'),
      snippet('csharp', 'C# record wrapper', 'public readonly record struct UserId(string Value)\n{\n    public static UserId Create(string s) =>\n        string.IsNullOrEmpty(s) ? throw new ArgumentException() : new UserId(s);\n}', 'Nominal runtime type with validation.'),
      snippet('typescript', 'DeepPartial in TS — type only', 'type DeepPartial<T> = { [K in keyof T]?: DeepPartial<T[K]> };\n// No runtime object — use structuredClone or lodash if needed', 'Type utility does not create partial object at runtime.'),
      snippet('typescript', 'OpenAPI shared contract', '// codegen:\n// npx openapi-typescript api.yaml -o src/api/schema.d.ts\n// NSwag for C# controllers — same OpenAPI source', 'Schema-first avoids duplicating TS conditionals and C# hand DTOs.'),
    ],
    compareRows: [
      ['Domain ID safety', 'Branded string', 'record struct', 'record struct'],
      ['DTO partial update', 'DeepPartial<T>', 'Optional records / init', 'init only'],
      ['Boilerplate', 'Conditional types', 'Source generators', 'Generators'],
      ['Runtime enforcement', 'Zod/manual', 'CLR types', 'CLR types'],
    ],
    mistakesBody: 'Expecting DeepPartial to exist at runtime. C# devs avoiding structural typing. Duplicating schemas in TS and C# manually.',
    seniorProse: 'Protobuf + ts-proto + C# grpc.tools. MediatR handlers vs TS service layer — align error types. Angular signals vs RxJS — separate from C# comparison but full-stack interviews touch both.',
    seniorRows: [
      ['OpenAPI codegen', 'DRY cross-stack', 'Pipeline maintenance'],
      ['TS types only', 'Fast iteration', 'No runtime'],
      ['C# generators', 'Runtime + compile', 'Build complexity'],
    ],
    seniorWarning: 'Says TS and C# types work the same at runtime. Cannot map brand to record. No shared schema strategy.',
    interviewTakeaways: [
      'TS advanced patterns erase — pair with runtime validation.',
      'C# source generators emit runtime code.',
      'Branded TS ≈ thin record wrapper in C#.',
      '60s: Structural TS vs nominal C#. OpenAPI shared. Zod at TS boundary. Generators for C# boilerplate.',
      'Follow-up: protobuf vs OpenAPI for cross-stack.',
    ],
    commonPitfalls: [
      'Weak: DeepPartial without runtime clone logic.',
      'Weak: duplicate DTOs in TS and C# by hand.',
      'Strong: "TS compile-only. C# generators + records runtime. OpenAPI single source. Brands ≈ record wrappers."',
    ],
    relatedTopicIds: ['typescript-15-branded-and-opaque-types', 'typescript-15-type-level-programming-limits', 'typescript-02-basic-types-vs-csharp'],
    jsTsCorrelations: [
      { language: 'javascript', concept: 'no static types', note: 'TS patterns compile away to JS — C# patterns remain in IL.', futureTopicSlug: 'javascript/01-what-is-javascript/types-vs-javascript' },
      { language: 'typescript', concept: 'Roslyn source generators', note: 'C# metaprogramming produces real code — TS metaprogramming produces checks only.', futureTopicSlug: 'csharp/generators/roslyn' },
    ],
    officialSources: [
      { title: 'C# source generators', url: 'https://learn.microsoft.com/en-us/dotnet/csharp/roslyn-sdk/source-generators-overview' },
      { title: 'TypeScript handbook — types from types', url: 'https://www.typescriptlang.org/docs/handbook/2/types-from-types.html' },
    ],
    animationHint: 'compare',
  },
};
