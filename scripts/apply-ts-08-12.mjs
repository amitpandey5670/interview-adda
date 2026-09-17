#!/usr/bin/env node
import { readFileSync, writeFileSync, readdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const batchDir = join(process.cwd(), 'scripts/content-batch/ts-08-12');
const moduleMap = {
  'array-and-tuple-types': '08-collections-and-typed-data',
  'map-set-typed': '08-collections-and-typed-data',
  'satisfies-operator': '08-collections-and-typed-data',
  'readonly-collections': '08-collections-and-typed-data',
  'typed-array-methods': '08-collections-and-typed-data',
  'collections-vs-csharp': '08-collections-and-typed-data',
  'generic-functions-and-classes': '09-generics',
  'generic-constraints': '09-generics',
  'default-type-parameters': '09-generics',
  'generic-utility-wrappers': '09-generics',
  'variance-basics': '09-generics',
  'partial-required-pick-omit': '10-utility-types',
  'record-exclude-extract': '10-utility-types',
  'parameters-returntype': '10-utility-types',
  'composing-utility-types': '10-utility-types',
  'utility-types-vs-csharp': '10-utility-types',
  'typeof-in-instanceof-guards': '11-type-narrowing-guards',
  'user-defined-type-guards': '11-type-narrowing-guards',
  'assertion-functions': '11-type-narrowing-guards',
  'control-flow-analysis': '11-type-narrowing-guards',
  'conditional-types-basics': '12-conditional-mapped-types',
  'mapped-types': '12-conditional-mapped-types',
  'template-literal-types': '12-conditional-mapped-types',
  'distributive-conditionals': '12-conditional-mapped-types',
};

let applied = 0;
for (const file of readdirSync(batchDir).filter((f) => f.endsWith('.json'))) {
  const slug = file.replace(/\.json$/, '');
  const mod = moduleMap[slug];
  if (!mod) {
    console.warn(`Skip unknown slug: ${slug}`);
    continue;
  }
  const target = join(process.cwd(), 'data/typescript/modules', mod, 'topics', file);
  if (!existsSync(target)) {
    console.warn(`Target missing: ${target}`);
    continue;
  }
  writeFileSync(target, readFileSync(join(batchDir, file), 'utf8'));
  applied++;
}
console.log(`Applied ${applied} topic files from batch`);
