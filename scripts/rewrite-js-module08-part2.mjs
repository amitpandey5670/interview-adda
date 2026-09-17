#!/usr/bin/env node
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';

const root = join(process.cwd(), 'data/javascript/modules');
const m08 = '08-collections-and-iterators';

function writeTopic(relPath, topic) {
  writeFileSync(join(root, relPath), `${JSON.stringify(topic, null, 2)}\n`);
}
function writeJson(relPath, data) {
  writeFileSync(join(root, relPath), `${JSON.stringify(data, null, 2)}\n`);
}
function senior(prose, rows, warning) {
  return {
    heading: 'Senior interview depth',
    blocks: [
      { type: 'prose', text: prose },
      { type: 'comparisonTable', title: 'Senior tradeoffs', headers: ['Topic', 'Key insight', 'Interview angle'], rows },
      { type: 'callout', variant: 'warning', title: 'What gets you rejected in interviews', body: warning },
    ],
  };
}

const topics = [
  {
    file: `${m08}/topics/map-set-weak-collections.json`,
    data: {
      id: 'javascript-08-map-set-weak-collections',
      slug: 'map-set-weak-collections',
      title: 'Map, Set, WeakMap, and WeakSet',
      moduleId: 'javascript-08-collections-and-iterators',
      order: 2,
      hook: 'Map and Set preserve insertion order and accept any key type — including objects — using SameValueZero equality. WeakMap and WeakSet hold keys weakly so entries disappear when nothing else references the key object.',
      sections: [
        { heading: 'What is this?', blocks: [
          { type: 'prose', text: '**Map** is key-value with any key type; iteration follows insertion order. **Set** stores unique values (SameValueZero). **WeakMap** keys must be objects; keys are weak references — no enumeration. **WeakSet** holds weak object members. Plain objects coerce keys to strings; Map preserves object identity for keys.' },
          { type: 'glossary', title: 'Key terms', entries: [
            { term: 'Map', longForm: 'Map collection', plainDefinition: 'Key-value store with any key; size property; iterable.', example: 'const m = new Map(); m.set(objKey, "meta");' },
            { term: 'Set', longForm: 'Set collection', plainDefinition: 'Unique values; add/has/delete O(1) average.', example: 'new Set([1, 1, 2]) // {1, 2}' },
            { term: 'WeakMap', longForm: 'WeakMap', plainDefinition: 'Object-keyed map with weak keys; no size or iteration.', example: 'wm.set(domNode, metadata)' },
            { term: 'SameValueZero', longForm: 'SameValueZero equality', plainDefinition: 'Map/Set key equality: NaN equals NaN; +0 equals -0.', example: 'map.set(NaN, 1); map.get(NaN)' },
          ]},
        ]},
        { heading: 'Why does it matter?', blocks: [
          { type: 'prose', text: 'Cache metadata on DOM nodes with WeakMap avoids memory leaks. Set dedupes IDs in O(n). Map beats Object when keys are dynamic or non-string. C# Dictionary requires hashable keys; JS Map uses SameValueZero — object keys by reference.' },
          { type: 'callout', variant: 'tip', title: 'Object vs Map keys', body: 'Object keys are strings/symbols only. Map accepts objects, functions, NaN as keys without string coercion.' },
        ]},
        { heading: 'How it works step by step', blocks: [
          { type: 'steps', title: 'Choosing a collection', items: [
            { title: 'Need unique values', body: 'Set — dedupe array with [...new Set(arr)].' },
            { title: 'Need key-value with object keys', body: 'Map — not plain object.' },
            { title: 'Attach private metadata to object', body: 'WeakMap — GC collects when object gone.' },
            { title: 'Track object membership weakly', body: 'WeakSet — tag objects without retaining.' },
          ]},
          { type: 'diagram', diagram: { type: 'mermaid', title: 'Strong vs weak collections', source: 'flowchart TD\n  M[Map/Set strong refs] --> K[Keys/values retained]\n  W[WeakMap/WeakSet] --> WK[Weak key refs]\n  WK --> GC[GC removes entry when key unreachable]' }},
        ]},
        { heading: 'Code walkthrough', blocks: [
          { type: 'snippet', snippet: { language: 'javascript', label: 'Map with object keys', code: 'const cache = new Map();\nconst user = { id: "u1" };\ncache.set(user, { lastLogin: Date.now() });\nconsole.log(cache.get(user)); // hit by reference\nconsole.log(cache.get({ id: "u1" })); // miss — different object\n\nfor (const [key, val] of cache) {\n  console.log(key.id, val.lastLogin);\n}', explanation: 'Map keys compared by reference for objects — not deep equality.' }},
          { type: 'snippet', snippet: { language: 'javascript', label: 'Set dedupe and NaN', code: 'const ids = [1, 2, 2, 3, NaN, NaN];\nconst unique = [...new Set(ids)];\nconsole.log(unique.length); // 4\n\nconst s = new Set();\ns.add(NaN);\nconsole.log(s.has(NaN)); // true — SameValueZero', explanation: 'Set dedupes including NaN which fails with indexOf.' }},
          { type: 'snippet', snippet: { language: 'javascript', label: 'WeakMap for DOM metadata', code: 'const widgetData = new WeakMap();\n\nfunction initWidget(el) {\n  widgetData.set(el, { clicks: 0 });\n  el.addEventListener("click", () => {\n    const d = widgetData.get(el);\n    d.clicks++;\n  });\n}\n\n// When el removed from DOM and unreferenced, WeakMap entry GCd', explanation: 'WeakMap avoids leaking metadata when DOM node discarded — no manual delete required.' }},
          { type: 'snippet', snippet: { language: 'javascript', label: 'Failure mode — object as hash key', code: 'const obj = {};\nconst key = { id: 1 };\nobj[key] = "value"; // key coerced to "[object Object]"\nobj[{ id: 1 }] = "overwrite"; // same string key!\nconsole.log(Object.keys(obj)); // one key\n\nconst map = new Map();\nmap.set({ id: 1 }, "a");\nmap.set({ id: 1 }, "b"); // two entries — different object refs', explanation: 'Plain object stringifies object keys — collision. Map preserves separate object keys.' }},
        ]},
        { heading: 'Compare with C# and TypeScript', blocks: [
          { type: 'comparisonTable', title: 'Collections compared', headers: ['Type', 'JavaScript', 'C#'], rows: [
            ['Key-value', 'Map', 'Dictionary<TKey,TValue>'],
            ['Unique set', 'Set', 'HashSet<T>'],
            ['Weak keys', 'WeakMap', 'ConditionalWeakTable'],
            ['Key equality', 'SameValueZero', 'EqualityComparer default'],
            ['NaN as key', 'Allowed in Map', 'Dictionary throws'],
          ]},
        ]},
        { heading: 'Common mistakes', blocks: [
          { type: 'callout', variant: 'warning', title: 'Pitfalls to avoid', body: 'Using plain object for object-key cache. Expecting WeakMap size or iteration. Using Map when JSON serialization needed — Map does not JSON.stringify cleanly. Assuming deep equality for object keys in Map.' },
        ]},
        senior('WeakMap is the pattern for **private metadata** and **DOM node state** — no memory leak when node removed. **Map** vs **Object**: Map faster for frequent add/delete; Object better for record shape with known keys. Know **SameValueZero** for NaN keys. **WeakSet** tags objects (e.g. visited nodes in graph walk) without preventing GC.', [['WeakMap', 'No enumeration by design', 'Why no size property'], ['Map vs Object', 'Any key type + order', 'When object keys collide as strings'], ['Set dedupe', 'O(n) vs sort+unique', 'NaN handling']], 'Says WeakMap is iterable. Cannot explain object-as-object-key on plain {} vs Map. Unaware NaN works as Map key.'),
      ],
      interviewTakeaways: ['Map/Set: insertion order, SameValueZero, any key type on Map.', 'WeakMap/WeakSet: weak keys, no iteration, GC-friendly metadata.', 'Plain object stringifies object keys — use Map for object keys.', 'Set dedupes including NaN.', '60s: Map vs Object keys. WeakMap DOM pattern. SameValueZero NaN. Set dedupe. ConditionalWeakTable in C#.'],
      commonPitfalls: ['Weak: "Object and Map are interchangeable." Strong: "Object keys are strings; Map keeps object identity."', 'Weak: "WeakMap can list keys." Strong: "No keys()/size — by design for GC."', 'Strong: "Show obj[key] collision vs two Map entries for different object refs."'],
      relatedTopicIds: ['javascript-08-arrays-and-typed-arrays', 'javascript-08-collection-performance', 'javascript-08-collections-vs-csharp'],
      jsTsCorrelations: [{ language: 'typescript', concept: 'Map types', note: 'Map<K,V> generic in TS; run time SameValueZero unchanged.', futureTopicSlug: 'typescript/builtins/map' }, { language: 'typescript', concept: 'ConditionalWeakTable', note: 'C# ConditionalWeakTable parallels WeakMap for ephemeron keys attached to objects.', futureTopicSlug: 'csharp/collections/conditional-weak-table' }],
      officialSources: [{ title: 'MDN — Map', url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map' }, { title: 'MDN — WeakMap', url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/WeakMap' }, { title: 'javascript.info — Map and Set', url: 'https://javascript.info/map-set' }],
      animationHint: 'stack-heap',
    },
  },
  {
    file: `${m08}/topics/iterators-and-for-of.json`,
    data: {
      id: 'javascript-08-iterators-and-for-of',
      slug: 'iterators-and-for-of',
      title: 'Iterators, Symbol.iterator, and for-of',
      moduleId: 'javascript-08-collections-and-iterators',
      order: 3,
      hook: 'The iterator protocol — next() returning { value, done } — powers for-of, spread, and destructuring. Symbol.iterator is the well-known key collections implement to become iterable.',
      sections: [
        { heading: 'What is this?', blocks: [
          { type: 'prose', text: 'An **iterator** is an object with **next()** returning `{ value, done }`. An **iterable** has `Symbol.iterator` method returning a fresh iterator. **for...of** calls Symbol.iterator internally. **Spread** and **Array.from** consume iterables. Strings, Arrays, Map, Set are iterable; plain objects are not unless you add Symbol.iterator.' },
          { type: 'glossary', title: 'Key terms', entries: [
            { term: 'iterator', longForm: 'iterator protocol', plainDefinition: 'Object with next() producing value/done pairs.', example: 'const it = [1,2][Symbol.iterator](); it.next()' },
            { term: 'iterable', longForm: 'iterable protocol', plainDefinition: 'Object with Symbol.iterator method.', example: 'Array, Map, string' },
            { term: 'Symbol.iterator', longForm: 'well-known symbol', plainDefinition: 'Key for default iterator — not enumerable in for...in.', example: 'obj[Symbol.iterator] = function* () { ... }' },
            { term: 'for...of', longForm: 'for-of loop', plainDefinition: 'Loops values from iterable; works with break/continue.', example: 'for (const x of map.values()) {}' },
          ]},
        ]},
        { heading: 'Why does it matter?', blocks: [
          { type: 'prose', text: 'Custom iterables integrate with language syntax — CSV parser, paginated API, tree walk. for...of vs for...in: of gets values, in gets enumerable keys. C# IEnumerable/GetEnumerator is the parallel; JS uses duck-typed protocol.' },
          { type: 'callout', variant: 'remember', title: 'for...in vs for...of', body: 'for...in on arrays iterates indices as strings plus enumerable props — prefer for...of for array values.' },
        ]},
        { heading: 'How it works step by step', blocks: [
          { type: 'steps', title: 'Consuming an iterable', items: [
            { title: 'Get iterator', body: 'Call Symbol.iterator on iterable.' },
            { title: 'Loop next()', body: 'Until done true, use value.' },
            { title: 'for...of sugar', body: 'Engine performs iterator protocol automatically.' },
            { title: 'Manual break', body: 'return() on iterator optional — generator handles cleanup.' },
          ]},
          { type: 'diagram', diagram: { type: 'mermaid', title: 'Iterator protocol', source: 'sequenceDiagram\n  participant F as for...of\n  participant I as Iterator\n  F->>I: Symbol.iterator()\n  loop until done\n    F->>I: next()\n    I-->>F: value done' }},
        ]},
        { heading: 'Code walkthrough', blocks: [
          { type: 'snippet', snippet: { language: 'javascript', label: 'Manual iterator', code: 'function range(start, end) {\n  let current = start;\n  return {\n    next() {\n      if (current > end) return { done: true };\n      return { value: current++, done: false };\n    },\n    [Symbol.iterator]() { return this; },\n  };\n}\n\nfor (const n of range(1, 3)) console.log(n); // 1 2 3\nconsole.log([...range(1, 3)]);', explanation: 'Iterable returns itself as iterator. Spread and for...of consume same protocol.' }},
          { type: 'snippet', snippet: { language: 'javascript', label: 'Map iteration order', code: 'const map = new Map([["b", 2], ["a", 1]]);\nfor (const [key, val] of map) console.log(key, val); // insertion order\nfor (const key of map.keys()) {}\nfor (const val of map.values()) {}\nfor (const entry of map.entries()) {}', explanation: 'Map iterates insertion order. Destructuring in for...of uses entries by default.' }},
          { type: 'snippet', snippet: { language: 'javascript', label: 'Make object iterable', code: 'const team = {\n  members: ["Ada", "Grace"],\n  [Symbol.iterator]() {\n    let i = 0;\n    const m = this.members;\n    return {\n      next: () => i < m.length\n        ? { value: m[i++], done: false }\n        : { done: true },\n    };\n  },\n};\nfor (const name of team) console.log(name);', explanation: 'Plain objects need explicit Symbol.iterator to work with for...of.' }},
          { type: 'snippet', snippet: { language: 'javascript', label: 'Failure mode — for...in on array', code: 'const arr = [10, 20];\narr.foo = "bad";\n\nfor (const k in arr) console.log(k); // "0", "1", "foo"\nfor (const v of arr) console.log(v);   // 10, 20 only', explanation: 'for...in enumerates all enumerable keys including custom props — not array values alone.' }},
        ]},
        { heading: 'Compare with C# and TypeScript', blocks: [
          { type: 'comparisonTable', title: 'Iteration models', headers: ['Feature', 'JavaScript', 'C#'], rows: [
            ['Protocol', 'Duck-typed next()', 'IEnumerable<T> GetEnumerator()'],
            ['Syntax', 'for...of', 'foreach'],
            ['String chars', 'for...of gives UTF-16 code units', 'foreach char in string'],
            ['Object default', 'Not iterable', 'Not foreach on plain object'],
            ['Early exit', 'break in for...of', 'break in foreach'],
          ]},
        ]},
        { heading: 'Common mistakes', blocks: [
          { type: 'callout', variant: 'warning', title: 'Pitfalls to avoid', body: 'for...in on arrays. Assuming plain object works in for...of. Reusing exhausted iterator without fresh Symbol.iterator call. Not implementing return() on iterators holding resources.' },
        ]},
        senior('**Iterator helpers** (ES2024) add map/filter/take on iterators lazily. **Generators** are easiest way to implement iterables. Know difference **iterable vs iterator** — for...of always gets fresh iterator from Symbol.iterator. **Async iteration** uses Symbol.asyncIterator — module 13 async. Manual **next()** throw propagates to consumer.', [['Iterable vs iterator', 'Symbol.iterator factory', 'Why spread needs iterable'], ['for...in trap', 'Enumerable keys not values', 'Array foo property'], ['Custom protocol', 'Integrate with syntax', 'Paginated API iterable']], 'Cannot define iterator protocol. Uses for...in on arrays in production code. Confuses iterable with iterator object.'),
      ],
      interviewTakeaways: ['Iterator: next() -> {value, done}. Iterable: Symbol.iterator method.', 'for...of consumes iterables; for...in enumerates keys.', 'Map/Set/Array/String are iterable; plain object is not.', 'Spread and Array.from require iterable.', '60s: Protocol steps. for...in vs for...of array trap. Symbol.iterator. C# foreach parallel.'],
      commonPitfalls: ['Weak: "for...in loops array values." Strong: "for...in gives keys; for...of gives values via iterator."', 'Weak: "Objects work in for...of." Strong: "Need Symbol.iterator unless Object.keys manual loop."', 'Strong: "Show arr.foo breaking for...in but not for...of."'],
      relatedTopicIds: ['javascript-08-generators-and-yield', 'javascript-08-arrays-and-typed-arrays', 'javascript-08-map-set-weak-collections'],
      jsTsCorrelations: [{ language: 'typescript', concept: 'Iterable<T>', note: 'TypeScript Iterable and Iterator interfaces type the protocol; compile away at run time.', futureTopicSlug: 'typescript/iterators/iterable' }, { language: 'typescript', concept: 'IEnumerable', note: 'C# foreach desugars to GetEnumerator; JS for...of desugars to Symbol.iterator.', futureTopicSlug: 'csharp/linq/enumerable' }],
      officialSources: [{ title: 'MDN — Iteration protocols', url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Iteration_protocols' }, { title: 'javascript.info — Iterable', url: 'https://javascript.info/iterable' }],
      animationHint: 'flow',
    },
  },
];

for (const { file, data } of topics) writeTopic(file, data);
console.log('Wrote 2 more module 08 topics (3/7 total with part1)');
