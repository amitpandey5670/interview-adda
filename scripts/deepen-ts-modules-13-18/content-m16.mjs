import { snippet } from './build-topic.mjs';

export const m16Topics = {
  'stage-3-decorators': {
    hook:
      '**Stage 3 decorators** (TC39 standard, TS 5.0+) replace experimental decorators with a new signature: `(value, context) => value`. They work on methods, fields, accessors, and classes — with `context.kind`, `context.name`, and `addInitializer` for setup.',
    whatIs:
      'Enable with **`"experimentalDecorators": false`** and target ES2022+. Decorator is a function receiving **target value** and **DecoratorContext**. **Class decorators** receive constructor. **Method decorators** can replace method. **Auto-accessors** (`accessor x`) work with decorators. **Decorator factories** return the decorator: `(opts) => (val, ctx) => val`. No `reflect-metadata` required for basic use — context provides metadata.',
    glossary: [
      { term: 'Stage 3', longForm: 'ECMAScript decorators', plainDefinition: 'Standard decorator proposal implemented in TS 5.0+.', example: 'function logged(value, context) { ... }' },
      { term: 'DecoratorContext', longForm: 'context object', plainDefinition: 'kind, name, static, private, metadata accessor.', example: 'context.kind === "method"' },
      { term: 'decorator factory', longForm: 'parameterized decorator', plainDefinition: 'Function returning decorator — configuration pattern.', example: 'Logged("api")' },
      { term: 'addInitializer', longForm: 'class field init', plainDefinition: 'Register callback run after instance constructed.', example: 'context.addInitializer(() => {})' },
    ],
    whyMatters:
      'Angular 19+ moving toward standard decorators. Libraries must support both legacy and stage 3 during migration. Interviewers ask signature difference and whether decorators run at class definition time.',
    tipTitle: 'Interview trap: legacy vs stage 3 signature',
    tipBody: 'Legacy: (target, propertyKey, descriptor). Stage 3: (value, context) — completely different API.',
    steps: [
      { title: 'Enable TS 5+ config', body: 'experimentalDecorators false, target ES2022' },
      { title: 'Write decorator function', body: '(value, context) => replacement or value' },
      { title: 'Use factory for options', body: 'export const Log = (tag) => (fn, ctx) => fn' },
      { title: 'Test emit', body: 'Decorators are stage 3 syntax in output' },
    ],
    diagramTitle: 'Stage 3 decorator application',
    diagram:
      'flowchart TD\n  CLASS["class definition"] --> DEC["@decorator applied"]\n  DEC --> CTX["DecoratorContext"]\n  CTX --> OUT["Replaced value or initializer"]',
    snippets: [
      snippet('typescript', 'Method decorator with context', 'function logged<T extends (...args: unknown[]) => unknown>(\n  fn: T,\n  context: ClassMethodDecoratorContext,\n): T {\n  const name = String(context.name);\n  return function (this: unknown, ...args: unknown[]) {\n    console.log(`call ${name}`);\n    return fn.apply(this, args);\n  } as T;\n}\n\nclass Api {\n  @logged\n  fetch() { return "data"; }\n}', 'Lines 1–9: stage 3 method decorator wraps function. context.name for logging.'),
      snippet('typescript', 'Decorator factory', 'function Validate(min: number) {\n  return function <T>(value: T, context: ClassFieldDecoratorContext): T {\n    context.addInitializer(function () {\n      const v = (this as Record<string, unknown>)[context.name as string];\n      if (typeof v === "number" && v < min) throw new Error("too small");\n    });\n    return value;\n  };\n}\n\nclass Config {\n  @Validate(0) accessor timeout = 100;\n}', 'Factory returns field decorator using addInitializer for validation.'),
      snippet('typescript', 'Class decorator', 'function sealed<T extends { new (...args: unknown[]): object }>(\n  ctor: T,\n  context: ClassDecoratorContext,\n) {\n  context.addInitializer(() => console.log(`init ${context.name}`));\n  return ctor;\n}\n\n@sealed\nclass Service {}', 'Class decorator receives constructor and context.'),
      snippet('typescript', 'Failure mode — mixing legacy and stage 3', '// experimentalDecorators: true uses OLD signature\n// @logged with stage 3 body → type errors\n// Pick one mode per project', 'Migration requires unified tsconfig and dependency support.'),
    ],
    compareRows: [
      ['API', '(value, context)', 'N/A', 'Attributes / source generators'],
      ['Timing', 'Class definition', 'N/A', 'Compile / runtime'],
      ['Metadata', 'context.metadata', 'N/A', 'Reflection (limited)'],
      ['Frameworks', 'Angular 19+ path', 'N/A', 'Minimal built-in'],
    ],
    mistakesBody: 'Using legacy decorator signature with stage 3 enabled. Forgetting addInitializer runs after fields init. Decorator on wrong target kind.',
    seniorProse: 'Read TC39 decorator spec for context fields. Babel and esbuild support stage 3. Compare C# attributes — attached metadata, different execution model. Plan migration from experimentalDecorators in NestJS/Angular codebases.',
    seniorRows: [
      ['Stage 3 native', 'Standards track', 'Ecosystem still migrating'],
      ['Legacy experimental', 'Angular/Nest today', 'Deprecated path'],
      ['Plain functions/HOFs', 'No magic', 'No declarative syntax'],
    ],
    seniorWarning: 'Same signature for legacy and stage 3. Says decorators are TypeScript-only. Cannot write method decorator.',
    interviewTakeaways: [
      'Stage 3: (value, context) — not legacy 3-arg form.',
      'Decorator factories for configuration.',
      'addInitializer for post-construct setup.',
      '60s: TS 5 standard decorators. context.kind/name. Factories return decorator. Legacy different API. C# attributes differ.',
      'Follow-up: Angular migration timeline.',
    ],
    commonPitfalls: [
      'Weak: legacy signature with experimentalDecorators false.',
      'Weak: decorator logic assuming runtime types from TS.',
      'Strong: "(value, context) API. factories for opts. addInitializer. Migrate off experimental."',
    ],
    relatedTopicIds: ['typescript-16-legacy-decorators', 'typescript-16-reflect-metadata', 'typescript-16-decorators-in-frameworks'],
    jsTsCorrelations: [
      { language: 'javascript', concept: 'decorators proposal', note: 'Stage 3 decorators are JS language feature — TS types context.', futureTopicSlug: 'javascript/classes/decorators' },
      { language: 'typescript', concept: 'C# attributes', note: 'Attributes attach metadata — different from JS decorator replacement model.', futureTopicSlug: 'csharp/attributes/custom-attributes' },
    ],
    officialSources: [
      { title: 'TS 5.0 decorators', url: 'https://www.typescriptlang.org/docs/handbook/release-notes/typescript-5-0.html#decorators' },
      { title: 'TC39 decorators', url: 'https://github.com/tc39/proposal-decorators' },
    ],
    animationHint: 'flow',
  },

  'legacy-decorators': {
    hook:
      '**Legacy (experimental) decorators** use the old 3-argument signature and require `"experimentalDecorators": true`. Angular, NestJS, and class-validator still depend on them — migration to Stage 3 is ongoing.',
    whatIs:
      '**experimentalDecorators: true** enables TypeScript\'s pre-standard implementation. Method decorator: `(target, propertyKey, descriptor) => PropertyDescriptor`. **Parameter decorators** only allowed in legacy mode. **`emitDecoratorMetadata`** pairs with **reflect-metadata** for design:type. **useDefineForClassFields** affects field decorator timing. Stage 3 is the future — legacy is maintenance mode.',
    glossary: [
      { term: 'experimentalDecorators', longForm: 'tsconfig flag', plainDefinition: 'Enables legacy decorator implementation.', example: '"experimentalDecorators": true' },
      { term: 'PropertyDescriptor', longForm: 'method descriptor', plainDefinition: 'value, writable, enumerable, configurable — modify to wrap method.', example: 'descriptor.value = wrapped' },
      { term: 'parameter decorator', longForm: '@Param()', plainDefinition: 'Legacy-only — records parameter index for DI.', example: 'NestJS @Body() param' },
      { term: 'emitDecoratorMetadata', longForm: 'design:type emit', plainDefinition: 'Emits type metadata for reflect-metadata — Angular DI.', example: '"emitDecoratorMetadata": true' },
    ],
    whyMatters:
      'Most production Angular apps use legacy decorators today. Wrong tsconfig breaks Nest DI. Interviews ask migration strategy and descriptor vs value model.',
    tipTitle: 'Interview trap: parameter decorators in stage 3',
    tipBody: 'Stage 3 has no parameter decorators — NestJS/Angular DI relies on legacy until frameworks migrate.',
    steps: [
      { title: 'Enable experimentalDecorators', body: 'true in tsconfig' },
      { title: 'Pair emitDecoratorMetadata', body: 'If using reflect-metadata' },
      { title: 'Import reflect-metadata', body: 'Once at app entry' },
      { title: 'Plan stage 3 migration', body: 'Track framework version support' },
    ],
    diagramTitle: 'Legacy method decorator',
    diagram:
      'flowchart LR\n  M["@Log method"] --> D["descriptor.value"]\n  D --> WRAP["wrapped function"]\n  WRAP --> RT["runtime calls wrap"]',
    snippets: [
      snippet('typescript', 'Legacy method decorator', 'function Log(\n  target: object,\n  propertyKey: string | symbol,\n  descriptor: PropertyDescriptor,\n) {\n  const original = descriptor.value as (...args: unknown[]) => unknown;\n  descriptor.value = function (...args: unknown[]) {\n    console.log(`Calling ${String(propertyKey)}`);\n    return original.apply(this, args);\n  };\n}\n\nclass Greeter {\n  @Log\n  greet() { return "hi"; }\n}', 'Classic 3-arg decorator mutates descriptor.value.'),
      snippet('typescript', 'Parameter decorator (legacy only)', 'function Inject(token: string) {\n  return function (target: object, propertyKey: string | symbol | undefined, parameterIndex: number) {\n    // register parameterIndex -> token in metadata\n  };\n}\n\nclass Service {\n  constructor(@Inject("CONFIG") private config: unknown) {}\n}', 'Parameter decorators only in experimental mode — DI frameworks use this.'),
      snippet('json', 'tsconfig for Angular/Nest legacy stack', '{\n  "compilerOptions": {\n    "experimentalDecorators": true,\n    "emitDecoratorMetadata": true,\n    "target": "ES2022",\n    "useDefineForClassFields": false\n  }\n}', 'useDefineForClassFields false often required for Angular field decorators.'),
      snippet('typescript', 'Failure mode — stage 3 decorator on legacy project', '// experimentalDecorators: true\n// @sealed class — stage 3 signature fails compile', 'Mixed modes impossible — one decorator system per project.'),
    ],
    compareRows: [
      ['Signature', '3-arg legacy', 'N/A', 'Attribute classes'],
      ['Parameter dec', 'Supported', 'Not in stage 3', 'Parameter attributes rare'],
      ['Metadata', 'emitDecoratorMetadata', 'context.metadata', 'Reflection'],
      ['Status', 'Maintenance', 'Standard', 'Mature'],
    ],
    mistakesBody: 'useDefineForClassFields true breaking Angular @Input fields. Missing reflect-metadata import. Attempting stage 3 decorators with experimentalDecorators true.',
    seniorProse: 'Angular 19+ incremental migration docs. codemods for decorator signature. Test DI after tsconfig changes. C# attributes compile to metadata — similar goals, different pipeline.',
    seniorRows: [
      ['Stay legacy until framework ready', 'Stable production', 'Technical debt'],
      ['Migrate to stage 3', 'Standards aligned', 'Breaking framework upgrades'],
      ['Avoid decorators', 'Simple TS', 'Lose framework ergonomics'],
    ],
    seniorWarning: 'Cannot explain 3-arg signature. Ignores reflect-metadata. Thinks parameter decorators exist in stage 3.',
    interviewTakeaways: [
      'experimentalDecorators true = legacy 3-arg API.',
      'emitDecoratorMetadata + reflect-metadata for DI types.',
      'Parameter decorators legacy-only.',
      '60s: Legacy for Angular/Nest today. descriptor mutation. Plan stage 3 migration. C# attributes different mechanism.',
      'Follow-up: useDefineForClassFields impact.',
    ],
    commonPitfalls: [
      'Weak: stage 3 decorators in Nest project without migration.',
      'Weak: missing reflect-metadata with emitDecoratorMetadata.',
      'Strong: "legacy 3-arg + emitDecoratorMetadata. parameter decorators DI. migrate when framework supports stage 3."',
    ],
    relatedTopicIds: ['typescript-16-stage-3-decorators', 'typescript-16-reflect-metadata', 'typescript-16-decorators-in-frameworks'],
    jsTsCorrelations: [
      { language: 'javascript', concept: 'Babel legacy decorators', note: 'Babel plugin for old decorator proposal — matches TS experimental.', futureTopicSlug: 'javascript/tooling/babel-decorators' },
      { language: 'typescript', concept: 'DI containers', note: 'C# built-in DI uses constructor injection with attributes — Nest mirrors via decorators.', futureTopicSlug: 'csharp/di/dependency-injection' },
    ],
    officialSources: [
      { title: 'TS legacy decorators', url: 'https://www.typescriptlang.org/docs/handbook/decorators.html' },
    ],
    animationHint: 'timeline',
  },

  'reflect-metadata': {
    hook:
      '**reflect-metadata** polyfill stores design-time type information emitted by `emitDecoratorMetadata` — `design:type`, `design:paramtypes`, `design:returntype`. Angular and NestJS dependency injection read these keys at runtime.',
    whatIs:
      'Import **`import "reflect-metadata"`** once before decorated classes load. TypeScript with **emitDecoratorMetadata: true** emits `__metadata("design:paramtypes", [String, Number])` etc. **Reflect.getMetadata("design:type", target, key)** retrieves types — only for emitted decorations, not all TS types. Limited to what compiler can emit — generics become Object or Array.',
    glossary: [
      { term: 'reflect-metadata', longForm: 'metadata polyfill', plainDefinition: 'npm package implementing Reflect metadata API.', example: 'import "reflect-metadata"' },
      { term: 'design:paramtypes', longForm: 'parameter types metadata', plainDefinition: 'Runtime array of constructor functions for parameters.', example: 'Reflect.getMetadata("design:paramtypes", target)' },
      { term: 'emitDecoratorMetadata', longForm: 'compiler emit', plainDefinition: 'Causes TS to emit metadata calls for decorated declarations.', example: 'tsconfig compilerOptions' },
      { term: 'design:type', longForm: 'property type metadata', plainDefinition: 'Emitted type for property — erasure limits accuracy.', example: 'Often Object for interfaces' },
    ],
    whyMatters:
      'NestJS `@Injectable()` resolves constructor deps via paramtypes. Interfaces erase — use `@Inject()` token. Security: metadata is not validation. Stage 3 `context.metadata` may reduce reflect-metadata need over time.',
    tipTitle: 'Interview trap: interface in constructor',
    tipBody: 'constructor(private repo: IUserRepo) emits Object or undefined for interface — must use @Inject(USER_REPO) token.',
    steps: [
      { title: 'Enable emitDecoratorMetadata', body: 'tsconfig true' },
      { title: 'Import reflect-metadata', body: 'main.ts first line' },
      { title: 'Decorate class/method', body: 'Metadata emitted at definition' },
      { title: 'Read with Reflect.getMetadata', body: 'Framework DI container does this' },
    ],
    diagramTitle: 'Metadata emit pipeline',
    diagram:
      'flowchart LR\n  TS["@Injectable class"] --> EMIT["emitDecoratorMetadata"]\n  EMIT --> META["__metadata design:paramtypes"]\n  META --> RM["reflect-metadata store"]\n  RM --> DI["Nest/Angular DI"]',
    snippets: [
      snippet('typescript', 'Reading design:paramtypes', 'import "reflect-metadata";\n\nclass Repo {}\nclass Service {\n  constructor(private repo: Repo) {}\n}\n\nReflect.decorate([Injectable], Service);\nconst types = Reflect.getMetadata("design:paramtypes", Service) as unknown[];\nconsole.log(types); // [Repo]', 'Demonstrates metadata keys — frameworks automate this.'),
      snippet('typescript', 'Interface erasure — use token', 'const USER_REPO = Symbol("USER_REPO");\n\ninterface UserRepo { find(id: string): Promise<User>; }\n\nclass UserService {\n  constructor(@Inject(USER_REPO) private repo: UserRepo) {}\n}', 'Interface paramtypes useless — injection token required.'),
      snippet('typescript', 'Injectable decorator sketch', 'function Injectable() {\n  return function <T extends { new (...args: unknown[]): object }>(ctor: T) {\n    return ctor;\n  };\n}', 'Marker decorator — DI container scans metadata on ctor.'),
      snippet('typescript', 'Failure mode — forgot reflect-metadata', '// Runtime: Reflect.getMetadata is not a function\n// Fix: import "reflect-metadata" at entry', 'Polyfill must load before any decorated class.'),
    ],
    compareRows: [
      ['Metadata source', 'emitDecoratorMetadata', 'N/A', 'Reflection / attributes'],
      ['Interface types', 'Erased — tokens', 'N/A', 'Runtime types for classes'],
      ['Generics', 'Lost at emit', 'N/A', 'Retained for closed generics'],
      ['Stage 3 future', 'context.metadata', 'N/A', 'N/A'],
    ],
    mistakesBody: 'Relying on paramtypes for interface injection. Missing reflect-metadata import. Expecting generic type parameters in metadata.',
    seniorProse: 'Angular standalone inject() reduces some decorator metadata needs. NestJS custom providers explicit tokens. For new code, prefer explicit constructor injection typing without magic metadata where possible.',
    seniorRows: [
      ['reflect-metadata DI', 'Framework standard', 'Erasure limits, magic'],
      ['Manual @Inject tokens', 'Explicit, interfaces work', 'Verbose'],
      ['Constructor injection without decorators', 'Plain TS', 'No auto-wiring'],
    ],
    seniorWarning: 'Thinks interfaces appear in paramtypes. No reflect-metadata import knowledge. Confuses with stage 3 context.metadata.',
    interviewTakeaways: [
      'emitDecoratorMetadata emits design:* keys.',
      'import reflect-metadata before decorated classes.',
      'Interfaces erase — use injection tokens.',
      '60s: Metadata for Nest/Angular DI. paramtypes is constructors. Interfaces need @Inject. Generics lost. Stage 3 evolving.',
      'Follow-up: Symbol tokens vs string tokens.',
    ],
    commonPitfalls: [
      'Weak: inject interface without token.',
      'Weak: missing reflect-metadata import.',
      'Strong: "emitDecoratorMetadata + polyfill. paramtypes = ctor fns. interfaces erased. @Inject token."',
    ],
    relatedTopicIds: ['typescript-16-legacy-decorators', 'typescript-16-decorators-in-frameworks', 'typescript-14-declare-module-augmentation'],
    jsTsCorrelations: [
      { language: 'javascript', concept: 'runtime reflection', note: 'JS has no native type metadata — polyfill adds Reflect.getMetadata.', futureTopicSlug: 'javascript/classes/metadata' },
      { language: 'typescript', concept: 'System.Reflection', note: 'C# full reflection — TS metadata limited to decorator emit.', futureTopicSlug: 'csharp/reflection/overview' },
    ],
    officialSources: [
      { title: 'reflect-metadata', url: 'https://github.com/rbuckton/reflect-metadata' },
      { title: 'TS decorator metadata', url: 'https://www.typescriptlang.org/docs/handbook/decorators.html#metadata' },
    ],
    animationHint: 'stack-heap',
  },

  'decorators-in-frameworks': {
    hook:
      '**Angular**, **NestJS**, and **class-validator** built ecosystems on legacy decorators — `@Component`, `@Injectable`, `@Controller`, `@IsEmail()`. Senior full-stack interviews connect decorator metadata to DI, validation pipes, and migration to Stage 3.',
    whatIs:
      '**Angular**: `@Component` metadata → compiler generates Ivy definitions. **NestJS**: `@Module`, `@Controller`, `@Get` wire Express/Fastify routes and DI container. **class-validator**: property decorators register validation metadata read by `class-validator` at runtime. All rely on **experimentalDecorators** + often **emitDecoratorMetadata**. Validation decorators are runtime — unlike pure type decorators.',
    glossary: [
      { term: '@Component', longForm: 'Angular component', plainDefinition: 'Decorator attaching template, selector, styles metadata.', example: '@Component({ selector: "app-root", template: `...` })' },
      { term: '@Injectable', longForm: 'Nest/Angular DI', plainDefinition: 'Marks class for dependency injection container.', example: '@Injectable() export class UserService' },
      { term: 'class-validator', longForm: 'validation decorators', plainDefinition: '@IsString, @MinLength store rules on prototype.', example: '@IsEmail() email: string' },
      { term: 'ValidationPipe', longForm: 'NestJS pipe', plainDefinition: 'Uses class-transformer + class-validator on DTOs.', example: 'app.useGlobalPipes(new ValidationPipe())' },
    ],
    whyMatters:
      'Angular job interviews ask decorator + DI flow. NestJS DTO validation is decorator-driven. Misconfigured tsconfig breaks entire app. Understanding separates config copy-paste from architecture.',
    tipTitle: 'Interview trap: decorators validate types',
    tipBody: 'class-validator runs at runtime — TS types do not. DTO needs both decorators and TypeScript properties.',
    steps: [
      { title: 'Configure tsconfig', body: 'experimentalDecorators, emitDecoratorMetadata, useDefineForClassFields' },
      { title: 'Import reflect-metadata', body: 'Nest main.ts' },
      { title: 'Define decorated DTO', body: 'class-validator decorators' },
      { title: 'Wire framework', body: 'ValidationPipe / Angular bootstrap' },
    ],
    diagramTitle: 'NestJS request with decorators',
    diagram:
      'flowchart TD\n  REQ["HTTP POST /users"] --> VP["ValidationPipe"]\n  VP --> CV["class-validator reads @IsEmail"]\n  CV --> CTRL["@Controller handler"]\n  CTRL --> SVC["@Injectable Service"]',
    snippets: [
      snippet('typescript', 'NestJS DTO with class-validator', 'import { IsEmail, IsString, MinLength } from "class-validator";\n\nexport class CreateUserDto {\n  @IsString()\n  @MinLength(2)\n  name!: string;\n\n  @IsEmail()\n  email!: string;\n}\n\n@Post()\ncreate(@Body() dto: CreateUserDto) {\n  return this.users.create(dto);\n}', 'Decorators register validation — ValidationPipe enforces at runtime.'),
      snippet('typescript', 'Angular component decorator', '@Component({\n  selector: "user-card",\n  standalone: true,\n  template: `<p>{{ user.name }}</p>`,\n  imports: [CommonModule],\n})\nexport class UserCard {\n  @Input({ required: true }) user!: User;\n}', 'Component decorator + Input property decorator — legacy API.'),
      snippet('typescript', 'Nest Injectable and Controller', '@Injectable()\nexport class UsersService {\n  findAll() { return []; }\n}\n\n@Controller("users")\nexport class UsersController {\n  constructor(private readonly users: UsersService) {}\n\n  @Get()\n  list() { return this.users.findAll(); }\n}', 'DI via constructor — metadata wires UsersService.'),
      snippet('typescript', 'Failure mode — DTO without decorators', 'export class CreateUserDto {\n  name!: string;\n  email!: string;\n}\n// ValidationPipe whitelist/forbid — no runtime validation without decorators', 'TypeScript types alone do not validate HTTP body.'),
    ],
    compareRows: [
      ['Angular', '@Component metadata', 'Compile-time + runtime', 'Attributes + Roslyn'],
      ['NestJS', 'DI + routing decorators', 'Runtime metadata', 'ASP.NET attributes'],
      ['class-validator', 'Runtime validation', 'Runtime', 'DataAnnotations'],
      ['Stage 3 migration', 'In progress', 'N/A', 'N/A'],
    ],
    mistakesBody: 'DTO without validation decorators. Wrong useDefineForClassFields for @Input. Assuming decorators replace TypeScript checking.',
    seniorProse: 'Angular signals + inject() reduce some decorator needs. Compare ASP.NET [Required] — similar runtime validation. For greenfield, consider zod DTOs in Nest without class-validator — tradeoff discussion for interviews.',
    seniorRows: [
      ['class-validator DTOs', 'Nest ecosystem standard', 'Decorator boilerplate'],
      ['Zod validation pipe', 'TS-inferred types', 'Custom pipe integration'],
      ['Manual validation in handler', 'Explicit', 'Repetitive'],
    ],
    seniorWarning: 'Says @IsEmail is compile-time. Cannot explain Nest DI metadata. No tsconfig awareness.',
    interviewTakeaways: [
      'Framework decorators need experimentalDecorators + reflect-metadata.',
      'class-validator is runtime — not TS types.',
      'Nest DI uses constructor paramtypes + tokens.',
      '60s: Angular @Component Ivy. Nest @Module DI graph. class-validator metadata. DTO needs decorators. ASP.NET DataAnnotations parallel.',
      'Follow-up: Zod vs class-validator in Nest.',
    ],
    commonPitfalls: [
      'Weak: DTO typed but no validation decorators.',
      'Weak: interface injection in Nest constructor.',
      'Strong: "Decorators = framework wiring + runtime validation. reflect-metadata for DI. TS types ≠ class-validator."',
    ],
    relatedTopicIds: ['typescript-16-legacy-decorators', 'typescript-16-reflect-metadata', 'typescript-16-stage-3-decorators'],
    jsTsCorrelations: [
      { language: 'javascript', concept: 'Angular runtime', note: 'Decorators compile to JS metadata objects — same Ivy output from TS.', futureTopicSlug: 'angular/decorators/component' },
      { language: 'typescript', concept: 'ASP.NET DataAnnotations', note: '[Required] on C# models parallels class-validator decorators.', futureTopicSlug: 'csharp/validation/data-annotations' },
    ],
    officialSources: [
      { title: 'Angular components', url: 'https://angular.dev/guide/components' },
      { title: 'NestJS validation', url: 'https://docs.nestjs.com/techniques/validation' },
      { title: 'class-validator', url: 'https://github.com/typestack/class-validator' },
    ],
    animationHint: 'flow',
    scenarioTag: 'auth-token',
  },
};
