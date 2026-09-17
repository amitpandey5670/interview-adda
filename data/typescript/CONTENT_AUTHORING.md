# TypeScript Content Authoring Guide

Use this guide when writing or deepening any module under `data/typescript/modules/`.

## Dual audience model

Every topic serves **two layers**. Beginners read Layer 1 first; senior / FAANG interview prep lives in Layer 2.

| Layer | Audience | Goal |
| --- | --- | --- |
| **Layer 1 — Beginner** | First-time readers | Understand terms, flow, and working examples |
| **Layer 2 — Senior (5yr / FAANG)** | Experienced engineers | Internals, tradeoffs, production proof, 60-second answers |

**Layer 2 is required** on all topics in **intermediate** (modules 08–13) and **advanced** (modules 14–18) modules.
**Layer 2 is recommended** on foundation modules 01–03; required on 04–07 when the topic is interview-critical.

---

## Layer 1 rules (beginner — keep always)

1. **Expand abbreviations on first use**
2. **Hook:** Max 2 sentences, plain English, no unexplained acronyms
3. **Sections:** 4–6 using `blocks[]`
4. **Code:** Minimum **3 snippets** per topic with line-by-line `explanation`
5. **Glossary:** At least one `glossary` block per topic
6. **Diagram:** At least one `diagram` block (Mermaid) when the concept is flow/structure/memory
7. **Cross-language:** Keep `jsTsCorrelations`; compare JavaScript and C# runtime behavior
8. **Cross-links:** Preserve valid `relatedTopicIds`

---

## Layer 2 rules (senior / FAANG — intermediate + advanced)

Add a **7th section**:

| Section heading | Required blocks |
| --- | --- |
| **Senior interview depth** | `prose` (internals), `comparisonTable` (tradeoffs), `callout` variant `warning` (“what gets you rejected”) |

### `interviewTakeaways` — exactly **5 bullets** (include `60s:` script)

### `commonPitfalls` — at least **3 items** (weak vs strong answer)

### Snippets: **4+** on intermediate/advanced; **1 diagnostics/failure-mode** snippet on P0 topics

---

## Senior topics from community research (Reddit / LeetCode discussions)

- unknown at API boundaries + narrowing guards
- Discriminated unions and exhaustiveness checking
- Conditional types with infer (Awaited, ReturnType patterns)
- Mapped types with key remapping (as clause)
- Distributive conditional pitfalls
- strictNullChecks vs C# NRT (compile-time only)
- Branded/opaque types for domain safety
- Module resolution (nodenext, bundler) and .d.ts authoring

---

## Research sources

- [TypeScript handbook](https://www.typescriptlang.org/docs/handbook/intro.html)
- [TypeScript release notes](https://www.typescriptlang.org/docs/handbook/release-notes/overview.html)
- [Basarat TypeScript deep dive](https://basarat.gitbook.io/typescript/)

New topic IDs: `typescript-{module-order}-{slug-with-dashes}`.
