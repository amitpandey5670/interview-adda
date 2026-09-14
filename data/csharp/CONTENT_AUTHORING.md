# C# Content Authoring Guide

Use this guide when rewriting any module under `data/csharp/modules/`.

## Audience

Write for a **beginner** first, then add interview depth at the end. Assume the reader knows basic programming but **not** C#, .NET, or senior backend jargon.

## Rules

1. **Expand abbreviations on first use:** `Intermediate Language (IL)`, `Just-In-Time compiler (JIT)`.
2. **Hook:** Max 2 sentences, plain English, no unexplained acronyms.
3. **Titles:** Descriptive + parenthetical expansion. Keep `slug` and `id` unchanged.
4. **Sections:** 4–6 per topic using `blocks[]` (preferred) or legacy `prose` + `snippets`.
5. **Code:** Minimum **3 snippets** per topic with line-by-line `explanation`.
6. **Glossary:** At least one `glossary` block per topic.
7. **Diagram:** At least one `diagram` block (Mermaid) per topic when the concept is flow/structure.
8. **JS/TS:** Keep `jsTsCorrelations`; rewrite notes in plain language.
9. **Cross-links:** Preserve valid `relatedTopicIds`; add links where helpful.

## Topic block template

Use this section order inside `sections[]`:

| Section heading | Block types |
|---|---|
| What is this? | prose, glossary |
| Why does it matter? | prose, callout |
| How it works step by step | steps, diagram |
| Code walkthrough | snippet × 2–3 |
| Compare with JavaScript/TypeScript | comparisonTable or prose |
| Common mistakes | callout (warning) |

## Block examples

```json
{
  "type": "glossary",
  "title": "Key terms",
  "entries": [
    {
      "term": "IL",
      "shortForm": "IL",
      "longForm": "Intermediate Language",
      "plainDefinition": "A CPU-neutral instruction set .NET compilers emit before the runtime turns it into machine code.",
      "example": "Your .cs file becomes IL inside a .dll file."
    }
  ]
}
```

```json
{
  "type": "diagram",
  "diagram": {
    "type": "mermaid",
    "title": "Compilation flow",
    "source": "flowchart LR\n  A[C# source] --> B[Roslyn compiler]\n  B --> C[IL in assembly]\n  C --> D[CLR JIT]\n  D --> E[CPU code]"
  }
}
```

## Mind map (per module)

Replace abbreviation-only trees with:

- `intro`: beginner summary (2–3 sentences)
- `overviewDiagram`: process/flow Mermaid
- `conceptCards`: one card per topic (min 4), link via `topicSlug`
- `revisionDiagram`: concept map Mermaid with full labels

Legacy `nodes`/`edges` are optional.

## Quality checklist (before finishing a module)

- [ ] All topic JSON validates against `topic.schema.json`
- [ ] `npm run test:content` passes
- [ ] Each topic: ≥4 sections, ≥3 snippets, glossary + diagram blocks
- [ ] Mind map has `overviewDiagram` + ≥4 `conceptCards`
- [ ] `module.json` topic titles match topic JSON titles
