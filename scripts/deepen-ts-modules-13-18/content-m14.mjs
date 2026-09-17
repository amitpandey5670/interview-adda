import { snippet } from './build-topic.mjs';

export const m14Topics = {
  'module-resolution-modes': {
    hook:
      '`moduleResolution` controls how TypeScript resolves import paths — `node10`, `node16`/`nodenext`, and `bundler` behave differently with package.json `exports`, `.mjs`, and `type: module`. Wrong mode causes "cannot find module" in CI while IDE works.',
    whatIs:
      '**moduleResolution** tells the compiler which algorithm to follow. **node10** (legacy) ignores `exports` field. **node16/nodenext** enforce Node ESM rules: require vs import, file extensions, `package.json` `"type"`. **bundler** (TS 5.0+) assumes a bundler resolves paths — allows extensionless imports like Vite/webpack. Pair with **`module`: `nodenext`** for Node libraries and **`module`: `ESNext` + bundler** for Vite apps.',
    glossary: [
      { term: 'nodenext', longForm: 'moduleResolution nodenext', plainDefinition: 'Node16+ resolution with ESM/CJS interop rules.', example: '"moduleResolution": "nodenext"' },
      { term: 'bundler', longForm: 'bundler resolution', plainDefinition: 'TS 5+ mode for tools that rewrite imports — relaxed extension rules.', example: '"moduleResolution": "bundler"' },
      { term: 'package exports', longForm: 'package.json exports', plainDefinition: 'Conditional exports map import paths to files — nodenext respects them.', example: '"exports": { ".": "./dist/index.js" }' },
      { term: 'ESM', longForm: 'ECMAScript modules', plainDefinition: 'import/export syntax — .mjs or type:module required in Node.', example: 'import { x } from "./file.js"' },
    ],
    whyMatters:
      'Publishing npm packages with wrong moduleResolution breaks consumers. Monorepos mix CJS and ESM — nodenext catches `require(esm)` errors at compile time. Bundler mode in libraries can hide issues that fail in pure Node. Interviewers ask node16 vs bundler tradeoffs.',
    tipTitle: 'Interview trap: extensionless imports in Node',
    tipBody:
      'With nodenext, you must write `import "./file.js"` even when source is `file.ts` — TypeScript maps to emitted .js path.',
    steps: [
      { title: 'Pick target runtime', body: 'Node library → nodenext. Vite app → bundler.' },
      { title: 'Align module + resolution', body: 'module nodenext requires moduleResolution nodenext.' },
      { title: 'Check package.json type', body: '"type": "module" vs CommonJS affects resolution.' },
      { title: 'Verify exports field', body: 'Subpath imports must match exports map.' },
    ],
    diagramTitle: 'Module resolution modes',
    diagram:
      'flowchart TD\n  IMP["import from pkg"] --> MODE{moduleResolution}\n  MODE -->|nodenext| NODE["package.json exports + extensions"]\n  MODE -->|bundler| BUN["bundler rewrites paths"]\n  MODE -->|node10| LEG["legacy node_modules"]',
    snippets: [
      snippet('typescript', 'nodenext requires .js extension in import', '// tsconfig: module nodenext, moduleResolution nodenext\nimport { helper } from "./utils.js"; // points to utils.ts emit\n\n// Error under nodenext:\n// import { helper } from "./utils";', 'Line 2: .js extension required for relative ESM imports in Node resolution.'),
      snippet('json', 'package.json exports for library', '{\n  "name": "my-lib",\n  "type": "module",\n  "exports": {\n    ".": {\n      "types": "./dist/index.d.ts",\n      "import": "./dist/index.js"\n    }\n  }\n}', 'Lines 4–8: types + import conditions — nodenext resolves @types via exports.'),
      snippet('json', 'Vite app tsconfig with bundler', '{\n  "compilerOptions": {\n    "module": "ESNext",\n    "moduleResolution": "bundler",\n    "allowImportingTsExtensions": true,\n    "noEmit": true\n  }\n}', 'bundler mode matches Vite/esbuild resolution — extensionless TS imports OK.'),
      snippet('typescript', 'Failure mode — node10 misses exports', '// With moduleResolution node10, this may resolve wrong file:\nimport { feature } from "my-lib/internal"; // bypasses exports guard\n// nodenext: error — subpath not in exports', 'Line 2: legacy resolution ignores exports restrictions.'),
    ],
    compareRows: [
      ['Mode', 'Best for', 'Extensions', 'exports field'],
      ['nodenext', 'Node libraries', 'Required .js', 'Enforced'],
      ['bundler', 'Vite/webpack apps', 'Optional', 'Respected'],
      ['node10', 'Legacy only', 'Loose', 'Ignored'],
    ],
    mistakesBody: 'Using bundler in publishable library — hides Node issues. Missing .js extensions with nodenext. Mismatched module and moduleResolution settings.',
    seniorProse: 'Dual package hazard: shipping CJS + ESM requires careful exports. TypeScript 5.0 bundler mode documents that resolution is delegated. Compare to C# assembly references — deterministic at compile time; TS resolution depends on package.json at consume time.',
    seniorRows: [
      ['nodenext for libs', 'Matches Node behavior', 'Verbose imports'],
      ['bundler for apps', 'DX with Vite', 'Not for published packages'],
      ['custom paths + nodenext', 'Aliases via paths', 'paths do not rewrite emit'],
    ],
    seniorWarning: 'Cannot explain nodenext vs bundler. Says paths replaces proper exports. Unaware of .js extension requirement.',
    interviewTakeaways: [
      'nodenext enforces Node ESM/CJS rules and package exports.',
      'bundler mode for Vite/webpack — not for npm libraries.',
      'Relative imports need .js extension under nodenext.',
      '60s: moduleResolution picks algorithm. nodenext for Node packages. bundler for apps. exports field matters. C# uses assemblies not package.json.',
      'Follow-up: dual CJS/ESM publishing.',
    ],
    commonPitfalls: [
      'Weak: bundler resolution in published npm package.',
      'Weak: import "./foo" without .js under nodenext.',
      'Strong: "nodenext for Node libs with exports + .js extensions. bundler for Vite apps. node10 legacy only."',
    ],
    relatedTopicIds: ['typescript-14-path-mapping', 'typescript-14-typing-javascript-libraries', 'typescript-17-isolated-modules-verbatim'],
    jsTsCorrelations: [
      { language: 'javascript', concept: 'ESM in Node', note: 'Runtime module format — TypeScript nodenext models Node rules.', futureTopicSlug: 'javascript/16-modules-bundling-tooling/esm-vs-commonjs' },
      { language: 'typescript', concept: 'Assembly references', note: 'C# resolves at compile time to DLL — TS resolves via package.json at typecheck.', futureTopicSlug: 'csharp/assemblies/references' },
    ],
    officialSources: [
      { title: 'TS module resolution', url: 'https://www.typescriptlang.org/docs/handbook/modules/reference.html#module-resolution' },
      { title: 'TS 5.0 bundler resolution', url: 'https://www.typescriptlang.org/docs/handbook/release-notes/typescript-5-0.html#bundler-module-resolution-mode' },
    ],
    animationHint: 'flow',
  },

  'path-mapping': {
    hook:
      '`paths` and `baseUrl` in tsconfig create import aliases like `@app/components` — but they only affect TypeScript, not Node at runtime unless a bundler or tool rewrites them. Senior engineers know paths ≠ runtime resolution.',
    whatIs:
      '**baseUrl** sets the root for non-relative imports. **paths** maps patterns to locations: `"@/*": ["src/*"]`. TypeScript uses this for typechecking and editor resolution. **Emit does not rewrite imports** — Node still sees `@/foo`. Bundlers (Vite tsconfig paths) and `tsc-alias` rewrite at build. **Project references** often replace deep paths in monorepos.',
    glossary: [
      { term: 'paths', longForm: 'tsconfig paths', plainDefinition: 'Compile-time alias mapping — imports unchanged in emit by default.', example: '"@/*": ["./src/*"]' },
      { term: 'baseUrl', longForm: 'compilerOptions.baseUrl', plainDefinition: 'Base directory for module resolution.', example: '"baseUrl": "./src"' },
      { term: 'tsc-alias', longForm: 'post-build rewrite', plainDefinition: 'Tool rewrites path aliases in emitted JS for Node.', example: 'tsc && tsc-alias' },
      { term: 'subpath imports', longForm: 'package.json imports', plainDefinition: 'Node-native alias via imports field — runtime aware.', example: '"imports": { "#internal/*": "./src/*" }' },
    ],
    whyMatters:
      'CI fails when paths work in IDE but not in Node. Monorepo packages need consistent aliases across packages. package.json `imports` (#paths) is Node 20+ native alternative. C# uses namespaces — not path-based.',
    tipTitle: 'Interview trap: paths rewrite emit',
    tipBody: 'TypeScript never rewrites path aliases in output JS — bundler or tsc-alias must, or use Node subpath imports.',
    steps: [
      { title: 'Define paths in tsconfig', body: 'Map @app/* to src/*' },
      { title: 'Configure bundler', body: 'Vite resolve.alias mirrors paths' },
      { title: 'Or use package imports', body: 'Node #internal/* for runtime-native aliases' },
      { title: 'Project references', body: 'Monorepo packages reference each other by package name' },
    ],
    diagramTitle: 'paths compile vs runtime',
    diagram:
      'flowchart LR\n  SRC["import from @app/x"] --> TSC["TypeScript resolves"]\n  TSC --> EMIT["Emit: still @app/x"]\n  EMIT --> BUN["Bundler rewrites"]\n  EMIT --> NODE["Node fails without rewrite"]',
    snippets: [
      snippet('json', 'tsconfig paths', '{\n  "compilerOptions": {\n    "baseUrl": ".",\n    "paths": {\n      "@app/*": ["src/app/*"],\n      "@shared/*": ["src/shared/*"]\n    }\n  }\n}', 'Lines 4–6: compile-time aliases for imports like @app/components/Button.'),
      snippet('typescript', 'Import using path alias', 'import { Button } from "@app/components/Button";\nimport { formatDate } from "@shared/utils/date";', 'TypeScript resolves to src/ paths — emit unchanged.'),
      snippet('typescript', 'Vite mirrors paths', '// vite.config.ts\nimport { resolve } from "path";\nexport default {\n  resolve: {\n    alias: { "@app": resolve(__dirname, "src/app") }\n  }\n};', 'Bundler must match tsconfig paths for runtime.'),
      snippet('typescript', 'Failure mode — paths without bundler in Node', '// emitted main.js still contains:\n// require("@app/foo") → MODULE_NOT_FOUND at runtime', 'paths alone insufficient for Node execution — need tsc-alias or package imports.'),
    ],
    compareRows: [
      ['Mechanism', 'paths', 'package imports', 'C# using'],
      ['Runtime', 'Needs rewrite', 'Native Node 20+', 'Compile + runtime'],
      ['Scope', 'Per tsconfig', 'Per package.json', 'Per assembly'],
      ['Monorepo', 'Per package tsconfig', 'Per package', 'Project references'],
    ],
    mistakesBody: 'Assuming paths work in Node without bundler. Duplicate mismatched aliases in Vite vs tsconfig. Using paths instead of package name in monorepo libs.',
    seniorProse: 'Nx and Turborepo generate consistent paths. Prefer publishing workspace packages with real names (@org/lib) over deep paths. ESLint import/resolver-typescript reads paths for lint rules.',
    seniorRows: [
      ['tsconfig paths + Vite', 'Great DX in apps', 'Two configs to sync'],
      ['package.json imports', 'Runtime native', 'Node version requirement'],
      ['Relative imports only', 'No tooling', 'Fragile deep paths'],
    ],
    seniorWarning: 'Says paths rewrites emit. Cannot explain Node MODULE_NOT_FOUND with aliases. No monorepo package strategy.',
    interviewTakeaways: [
      'paths is compile-time only — emit keeps alias strings.',
      'Bundlers or tsc-alias rewrite for Node.',
      'package.json imports (#) is runtime-native alternative.',
      '60s: paths for DX. Sync with Vite alias. Monorepos use package names + project references. C# namespaces differ.',
      'Follow-up: project references vs paths in monorepo.',
    ],
    commonPitfalls: [
      'Weak: paths work in tsc output on Node without extra tooling.',
      'Weak: mismatched Vite alias and tsconfig paths.',
      'Strong: "paths = typecheck only. Bundler/tsc-alias for emit. Prefer @org/pkg in monorepos."',
    ],
    relatedTopicIds: ['typescript-14-module-resolution-modes', 'typescript-17-project-references', 'typescript-14-typing-javascript-libraries'],
    jsTsCorrelations: [
      { language: 'javascript', concept: 'import maps', note: 'Browser import maps are runtime — closer to bundler resolution than tsconfig paths.', futureTopicSlug: 'javascript/16-modules-bundling-tooling/module-resolution' },
      { language: 'typescript', concept: 'namespaces', note: 'C# using aliases namespaces — not filesystem paths.', futureTopicSlug: 'csharp/namespaces/using-directives' },
    ],
    officialSources: [
      { title: 'TS paths mapping', url: 'https://www.typescriptlang.org/docs/handbook/modules/reference.html#paths' },
    ],
    animationHint: 'flow',
  },

  'ambient-declarations': {
    hook:
      '**Ambient declarations** (`declare`) tell TypeScript about globals, modules, and assets without emitting JS — `declare global`, `declare const process`, and `.d.ts` files are how you type `window`, jQuery plugins, and env vars.',
    whatIs:
      '**declare** introduces types that exist at runtime but are not defined in your TS source. **declare global** augments the global scope inside a module. **declare module "*.css"`** types non-TS imports. Ambient `.d.ts` files have no emit — they are type-only. Use **`export {}`** to make a file a module before `declare global`.',
    glossary: [
      { term: 'ambient', longForm: 'ambient declaration', plainDefinition: 'Type-only declaration — no JS output.', example: 'declare const API_URL: string;' },
      { term: 'declare global', longForm: 'global augmentation', plainDefinition: 'Add properties to global scope from a module file.', example: 'declare global { interface Window { myApp: App } }' },
      { term: 'triple-slash', longForm: '/// <reference', plainDefinition: 'Legacy directive to include .d.ts — prefer imports.', example: '/// <reference types="node" />' },
      { term: 'DefinitelyTyped', longForm: '@types packages', plainDefinition: 'Community ambient types for untyped JS libraries.', example: 'npm i -D @types/lodash' },
    ],
    whyMatters:
      'Without ambient types, `process.env` and `window.gtag` are errors. Vite `import.meta.env` needs interface augmentation. Global pollution must be intentional — declare global documents extensions. C# has extern aliases — different mechanism.',
    tipTitle: 'Interview trap: declare vs const',
    tipBody: 'declare const x: string describes existing binding — no runtime assignment. const x: string creates a value.',
    steps: [
      { title: 'Identify runtime global', body: 'window, process, custom script tag variable' },
      { title: 'Write .d.ts or declare global', body: 'Type-only, no emit' },
      { title: 'Ensure module context', body: 'export {} before declare global in .ts files' },
      { title: 'Reference in tsconfig', body: 'include types or files array' },
    ],
    diagramTitle: 'Ambient vs value declarations',
    diagram:
      'flowchart TD\n  D["declare const X"] --> TC["Typecheck only"]\n  C["const X = 1"] --> EMIT["Emits JS value"]\n  TC --> RUN["Runtime must provide X"]',
    snippets: [
      snippet('typescript', 'declare global augmentation', 'export {};\n\ndeclare global {\n  interface Window {\n    dataLayer: Array<Record<string, unknown>>;\n  }\n}\n\nwindow.dataLayer.push({ event: "pageview" });', 'Line 1: export {} makes file a module. Lines 3–6: extend Window. Line 8: typed usage.'),
      snippet('typescript', 'Ambient module for CSS modules', 'declare module "*.module.css" {\n  const classes: { readonly [key: string]: string };\n  export default classes;\n}', 'Line 1: wildcard module declaration for non-TS assets.'),
      snippet('typescript', 'process.env typing', 'declare namespace NodeJS {\n  interface ProcessEnv {\n    DATABASE_URL: string;\n    NODE_ENV: "development" | "production" | "test";\n  }\n}', 'Augment ProcessEnv — @types/node pattern for required env vars.'),
      snippet('typescript', 'Failure mode — declare global without export', '// global.d.ts in script mode — declare global may fail\n// Fix: add export {} or use .d.ts file', 'Module vs script context determines if global augmentation works.'),
    ],
    compareRows: [
      ['declare', 'Type-only, no emit', 'N/A', 'extern / P/Invoke declarations'],
      ['const', 'Value + emit', 'Creates binding', 'Normal field'],
      ['.d.ts', 'Ambient types file', 'N/A', 'Reference assembly'],
      ['@types/*', 'npm ambient package', 'N/A', 'NuGet package'],
    ],
    mistakesBody: 'Using declare for values you should define. Forgetting export {} before declare global. Duplicate conflicting ambient declarations.',
    seniorProse: 'Prefer module augmentation over global when possible. Vite client types use interface ImportMetaEnv. strict env typing catches missing CI secrets at compile time. Review @types version lockstep with library version.',
    seniorRows: [
      ['declare global', 'Third-party script globals', 'Pollutes global namespace'],
      ['Zod env parse', 'Runtime + inferred type', 'Extra dependency'],
      ['Module augmentation', 'Scoped extension', 'Requires module graph'],
    ],
    seniorWarning: 'Confuses declare with runtime definition. Cannot write declare global. Unaware .d.ts emits nothing.',
    interviewTakeaways: [
      'declare is type-only — no JS emit.',
      'declare global needs module context (export {}).',
      'Wildcard declare module for assets.',
      '60s: Ambient types describe existing runtime. .d.ts no emit. @types from DefinitelyTyped. C# uses references not ambient.',
      'Follow-up: triple-slash vs import types.',
    ],
    commonPitfalls: [
      'Weak: declare const for values you should implement.',
      'Weak: declare global in script file without export {}.',
      'Strong: "declare = types only. global augmentation for window/process. Wildcard modules for CSS."',
    ],
    relatedTopicIds: ['typescript-14-typing-javascript-libraries', 'typescript-14-declare-module-augmentation', 'typescript-05-declaration-merging'],
    jsTsCorrelations: [
      { language: 'javascript', concept: 'global variables', note: 'JS globals exist at runtime — declare tells TS their shape.', futureTopicSlug: 'javascript/17-browser-node-runtimes/global-objects-window-process' },
      { language: 'typescript', concept: 'Reference assembly', note: 'C# metadata references — TS ambient .d.ts is compile-time only.', futureTopicSlug: 'csharp/assemblies/metadata' },
    ],
    officialSources: [
      { title: 'TS ambient declarations', url: 'https://www.typescriptlang.org/docs/handbook/2/modules.html#ambient-modules' },
      { title: 'TS declare global', url: 'https://www.typescriptlang.org/docs/handbook/declaration-merging.html#global-augmentation' },
    ],
    animationHint: 'flow',
  },

  'typing-javascript-libraries': {
    hook:
      'Untyped JavaScript libraries need **@types/*** packages or hand-written **.d.ts** files. Senior engineers author declaration files, use `allowJs` + `checkJs`, and know when to contribute to DefinitelyTyped versus inline `declare module`.',
    whatIs:
      'TypeScript reads **.d.ts** for JS libraries. **@types/lodash** from DefinitelyTyped provides community types. For internal JS, add **index.d.ts** alongside .js or enable **allowJs** with JSDoc `@param`. **`declare module "pkg" { export ... }`** wraps untyped npm packages. **`satisfies` and JSDoc `@template`** bridge gradual typing.',
    glossary: [
      { term: 'DefinitelyTyped', longForm: '@types scope', plainDefinition: 'Repository of ambient types published to npm @types/*.', example: 'npm i -D @types/react' },
      { term: 'declaration file', longForm: '.d.ts', plainDefinition: 'Type-only description of JS module API.', example: 'export function debounce(fn: Function): Function;' },
      { term: 'allowJs', longForm: 'checkJs', plainDefinition: 'Typecheck JavaScript files with // @ts-check or allowJs.', example: '"allowJs": true, "checkJs": true' },
      { term: 'types field', longForm: 'package.json types', plainDefinition: 'Entry point for .d.ts in published package.', example: '"types": "./dist/index.d.ts"' },
    ],
    whyMatters:
      'Wrong @types version causes false errors. Hand-written .d.ts for internal SDKs is common in enterprises. Publishing TS libraries requires .d.ts in npm package. any-typed legacy JS leaks into TS consumers.',
    tipTitle: 'Interview trap: @types vs types in package',
    tipBody: 'Modern packages ship their own .d.ts via types/export types field — @types package may be stub or unnecessary.',
    steps: [
      { title: 'Check if types bundled', body: 'package.json types or exports.types' },
      { title: 'Install @types if separate', body: 'npm i -D @types/package' },
      { title: 'Or author declare module', body: 'Minimal .d.ts for missing types' },
      { title: 'Gradual migrate with JSDoc', body: 'allowJs + @ts-check on legacy files' },
    ],
    diagramTitle: 'Typing JS library flow',
    diagram:
      'flowchart TD\n  LIB["JS library"] --> Q{Has .d.ts?}\n  Q -->|bundled| USE["Use package types"]\n  Q -->|@types| DT["Install @types/pkg"]\n  Q -->|none| AUTH["Author declare module"]',
    snippets: [
      snippet('typescript', 'Hand-written declare module', 'declare module "legacy-analytics" {\n  export function track(event: string, props?: Record<string, unknown>): void;\n  export const version: string;\n}\n\nimport { track } from "legacy-analytics";\ntrack("signup", { plan: "pro" });', 'Lines 1–5: ambient module for untyped npm package. Lines 7–8: typed import.'),
      snippet('typescript', 'JSDoc typing in .js file', '// @ts-check\n/**\n * @param {string} id\n * @returns {Promise<{ name: string }>}\n */\nexport async function loadUser(id) {\n  return fetch(`/users/${id}`).then(r => r.json());\n}', 'allowJs + @ts-check types JS without converting to .ts.'),
      snippet('json', 'Publishing types with package', '{\n  "name": "my-sdk",\n  "types": "./dist/index.d.ts",\n  "exports": {\n    ".": {\n      "types": "./dist/index.d.ts",\n      "import": "./dist/index.js"\n    }\n  }\n}', 'Consumers get types from package directly — no @types needed.'),
      snippet('typescript', 'Failure mode — outdated @types', '// @types/foo@1.0 types old API\nimport { newMethod } from "foo"; // error: newMethod not in types\n// Fix: update @types or use package bundled types', 'Version skew between JS lib and @types causes phantom errors.'),
    ],
    compareRows: [
      ['Source', 'Bundled .d.ts', '@types/*', 'Hand declare module'],
      ['Maintenance', 'Library author', 'Community DT', 'Your team'],
      ['JS without TS', 'JSDoc + checkJs', 'Same', 'N/A'],
      ['C# equivalent', 'NuGet with XML docs', 'N/A', 'P/Invoke declarations'],
    ],
    mistakesBody: 'Using any for untyped imports. Stale @types version. declare module too loose — defeats type safety.',
    seniorProse: 'dtslint and attw (Are The Types Wrong) validate published types. contribution to DT for popular libs. For internal JS, prefer JSDoc migration path over big-bang .ts conversion. api-extractor for rolling up .d.ts.',
    seniorRows: [
      ['Bundled types', 'Single version source', 'Author must maintain'],
      ['@types', 'Fast for popular libs', 'Version skew risk'],
      ['declare module shim', 'Quick unblock', 'No runtime validation'],
    ],
    seniorWarning: 'Installs @types when package bundles types. Cannot write minimal declare module. Ignores exports.types.',
    interviewTakeaways: [
      'Check package.json types/exports before @types.',
      'declare module for untyped packages.',
      'allowJs + JSDoc for gradual JS typing.',
      '60s: .d.ts describes JS API. @types from DT. Hand-author shims. Publish types in npm package. C# XML docs differ.',
      'Follow-up: Are The Types Wrong (attw) tool.',
    ],
    commonPitfalls: [
      'Weak: import untyped lib as any.',
      'Weak: @types version mismatch with library.',
      'Strong: "Check bundled types first. declare module shim. JSDoc migration. attw for publish validation."',
    ],
    relatedTopicIds: ['typescript-14-ambient-declarations', 'typescript-14-declare-module-augmentation', 'typescript-14-module-resolution-modes'],
    jsTsCorrelations: [
      { language: 'javascript', concept: 'untyped exports', note: 'JS modules have no static types — .d.ts is external layer.', futureTopicSlug: 'javascript/16-modules-bundling-tooling/esm-vs-commonjs' },
      { language: 'typescript', concept: 'NuGet XML documentation', note: 'C# ships metadata in DLL — TS ships separate .d.ts files.', futureTopicSlug: 'csharp/documentation/xml-docs' },
    ],
    officialSources: [
      { title: 'DefinitelyTyped', url: 'https://github.com/DefinitelyTyped/DefinitelyTyped' },
      { title: 'TS publishing handbook', url: 'https://www.typescriptlang.org/docs/handbook/declaration-files/publishing.html' },
    ],
    animationHint: 'flow',
  },

  'declare-module-augmentation': {
    hook:
      '**Module augmentation** extends existing module types — add fields to Express `Request`, augment `jest` matchers, or patch third-party interfaces without forking. `declare module "express-serve-static-core" { interface Request { userId: string } }` is production pattern.',
    whatIs:
      '**declare module "name" { ... }** inside a TS file merges with existing module declaration. Works on **interfaces** (declaration merging) not type aliases. **Global augmentation** uses `declare global`. Augmentation file must be included in compilation (import side-effect or types in tsconfig). Cannot augment modules you have not imported/referenced.',
    glossary: [
      { term: 'module augmentation', longForm: 'declare module merge', plainDefinition: 'Add exports or extend interfaces in existing module.', example: 'declare module "express" { interface Request { id: string } }' },
      { term: 'declaration merging', longForm: 'interface merge', plainDefinition: 'Multiple declarations of same interface merge — not for type aliases.', example: 'interface User { a: string } + interface User { b: number }' },
      { term: 'side-effect import', longForm: 'import "./augmentations"', plainDefinition: 'Import augmentation file for merge to apply.', example: 'import "./types/express.d.ts"' },
      { term: 'namespace merge', longForm: 'namespace + function', plainDefinition: 'Older pattern — prefer module augmentation.', example: 'declare namespace Express {}' },
    ],
    whyMatters:
      'Auth middleware adds req.user — augmentation types it for downstream handlers. Plugin ecosystems (Jest, Vitest) extend matchers via augmentation. Wrong module string — zero effect, silent. C# extension methods differ — runtime vs compile-time merge.',
    tipTitle: 'Interview trap: augment type alias',
    tipBody: 'type User = { id: string } cannot be augmented — only interface and namespace support declaration merging.',
    steps: [
      { title: 'Import base module', body: 'Ensures module exists in graph' },
      { title: 'declare module "exact-name"', body: 'Match package resolution string' },
      { title: 'Extend interface inside', body: 'Add properties to exported interfaces' },
      { title: 'Side-effect import augmentation file', body: 'In app entry or types entry' },
    ],
    diagramTitle: 'Module augmentation merge',
    diagram:
      'flowchart LR\n  ORIG["@types/express Request"] --> AUG["your augment.d.ts"]\n  AUG --> MERGED["Merged Request type"]\n  MERGED --> APP["Handlers see userId"]',
    snippets: [
      snippet('typescript', 'Express Request augmentation', 'import "express-serve-static-core";\n\ndeclare module "express-serve-static-core" {\n  interface Request {\n    userId?: string;\n  }\n}\n\n// handler.ts\nimport { Request } from "express";\nfunction handler(req: Request) {\n  console.log(req.userId); // typed\n}', 'Line 1: import activates module. Lines 3–7: merge userId into Request.'),
      snippet('typescript', 'Jest matcher augmentation', 'declare global {\n  namespace jest {\n    interface Matchers<R> {\n      toBeWithinRange(min: number, max: number): R;\n    }\n  }\n}\n\nexpect(5).toBeWithinRange(1, 10);', 'Extend jest.Matchers for custom matcher types.'),
      snippet('typescript', 'Augment own package consumers', '// in my-lib: types-augment.d.ts\nexport interface PluginConfig { debug?: boolean; }\ndeclare module "my-lib" {\n  interface Config extends PluginConfig {}\n}', 'Library ships augmentation for consumer extensions.'),
      snippet('typescript', 'Failure mode — wrong module string', 'declare module "Express" { // wrong case/name\n  interface Request { x: string }\n}\n// No merge — must match resolved module id "express"', 'Module string must match import resolution exactly.'),
    ],
    compareRows: [
      ['Augmentation', 'interface merge in module', 'N/A', 'partial class / extension methods'],
      ['Runtime effect', 'None — types only', 'N/A', 'Extension methods execute'],
      ['type alias', 'Cannot augment', 'N/A', 'Cannot extend'],
      ['Discovery', 'Must import/reference', 'N/A', 'Using directive'],
    ],
    mistakesBody: 'Wrong module name in declare module. Trying to augment type aliases. Forgetting side-effect import of augmentation file.',
    seniorProse: 'NestJS decorators rely on reflect-metadata + augmentation patterns. Prefer generic context types over augmenting Express in large teams — less magic. Test augmentation with type tests (expectTypeOf).',
    seniorRows: [
      ['Module augmentation', 'Ecosystem standard (Express)', 'Hidden magic, wrong string fails silently'],
      ['Explicit wrapper type', 'Clear ownership', 'More boilerplate'],
      ['Generic handler<TContext>', 'Type-safe context', 'Refactor all handlers'],
    ],
    seniorWarning: 'Cannot write Express Request augmentation. Tries to augment type alias. Unaware module string must match.',
    interviewTakeaways: [
      'declare module merges interfaces — not type aliases.',
      'Module string must match import resolution id.',
      'Import side-effect to include augmentation.',
      '60s: Augment third-party interfaces. Express Request pattern. declaration merging. C# extension methods are runtime.',
      'Follow-up: global vs module augmentation.',
    ],
    commonPitfalls: [
      'Weak: declare module "Express" wrong casing — no merge.',
      'Weak: augment type alias instead of interface.',
      'Strong: "declare module exact name. interface merge only. side-effect import. Express userId pattern."',
    ],
    relatedTopicIds: ['typescript-14-ambient-declarations', 'typescript-05-declaration-merging', 'typescript-16-reflect-metadata'],
    jsTsCorrelations: [
      { language: 'javascript', concept: 'runtime property add', note: 'JS adds req.user at runtime — augmentation types it for TS.', futureTopicSlug: 'javascript/09-structural-typing-patterns/duck-typing' },
      { language: 'typescript', concept: 'extension methods', note: 'C# extensions are syntactic sugar with runtime dispatch — TS merge is compile-time only.', futureTopicSlug: 'csharp/classes/extension-methods' },
    ],
    officialSources: [
      { title: 'TS module augmentation', url: 'https://www.typescriptlang.org/docs/handbook/declaration-merging.html#module-augmentation' },
    ],
    animationHint: 'flow',
    scenarioTag: 'auth-token',
  },
};
