# .NET / ASP.NET Core Web API Content Authoring Guide

Use this guide when writing or deepening any module under `data/dotnet/modules/`.

Focus: **ASP.NET Core Web API fundamentals** — not Razor Pages or MVC views. Correlate with C#, JavaScript, and TypeScript where helpful.

## Dual audience model

Every topic serves **two layers**. Beginners read Layer 1 first; senior / FAANG interview prep lives in Layer 2.

| Layer | Audience | Goal |
| --- | --- | --- |
| **Layer 1 — Beginner** | First-time ASP.NET Core readers | Understand terms, request flow, and working examples |
| **Layer 2 — Senior (5yr / FAANG)** | Experienced engineers | Pipeline internals, tradeoffs, production proof, 60-second answers |

**Layer 2 is required** on all topics in **intermediate** (modules 05–09) and **advanced** (modules 10–12).  
**Layer 2 is recommended** on foundation modules 01–04; required on interview-critical topics (middleware order, DI lifetimes, JWT).

---

## Layer 1 rules (beginner — keep always)

1. **Expand abbreviations on first use:** `Hypertext Transfer Protocol (HTTP)`, `JSON Web Token (JWT)`.
2. **Hook:** Max 2 sentences, plain English, no unexplained acronyms.
3. **Titles:** Descriptive + parenthetical expansion. Keep `slug` and `id` unchanged.
4. **Sections:** 4–6 using `blocks[]` (see template below).
5. **Code:** Minimum **3 snippets** per topic with line-by-line `explanation`.
6. **Glossary:** At least one `glossary` block per topic.
7. **Diagram:** At least one `diagram` block (Mermaid) when the concept is flow/structure/pipeline.
8. **JS/TS:** Keep `jsTsCorrelations`; compare Express/Fastify/NestJS patterns where relevant.
9. **Cross-links:** Preserve valid `relatedTopicIds`; link to C# topics when language/runtime concepts apply.

---

## Layer 2 rules (senior / FAANG — intermediate + advanced)

Add a **7th section** (max 7 sections total):

| Section heading | Required blocks |
| --- | --- |
| **Senior interview depth** | `prose` (internals, 1 paragraph), `comparisonTable` (tradeoffs), `callout` variant `warning` (“what gets you rejected”) |

Optional in same section or as extra snippet:
- **How to prove it in production** — Application Insights, OpenTelemetry, `dotnet-counters`, `dotnet-trace`, health probe failures, p95 latency.

### `interviewTakeaways` — exactly **5 bullets**

1. One-line definition  
2. Tradeoff or “when not to use”  
3. Production tip (Redis, JWT rotation, rate limits, EF indexes, etc.)  
4. **60-second interview script** (prefix with `60s:`)  
5. Follow-up hook the interviewer might ask next  

### `commonPitfalls` — at least **3 items**, including:

- One **weak/rejection answer** (“Saying X gets you rejected because…”)  
- One **strong answer** contrast  

### Snippets (senior modules)

| Module tier | Minimum snippets |
| --- | --- |
| Intermediate / advanced (standard) | **4** |
| P0 critical topics (middleware, DI, EF N+1, JWT, async APIs) | **4** + at least **1 diagnostics or failure-mode** snippet |

### `jsTsCorrelations`

- **Minimum 2 entries** per topic on intermediate and advanced modules.
- Compare runtime behavior, not just syntax (e.g. Express middleware vs ASP.NET Core pipeline).

### `officialSources`

- At least one **Microsoft Learn** link.
- Add one **diagnostics / performance** source where applicable.

---

## Topic block template (Layer 1 sections 1–6)

| Section heading | Block types |
| --- | --- |
| What is this? | prose, glossary |
| Why does it matter? | prose, callout |
| How it works step by step | steps, diagram |
| Code walkthrough | snippet × 2–3 |
| Compare with JavaScript/TypeScript | comparisonTable or prose + jsTsCorrelations |
| Common mistakes | callout (warning) |
| **Senior interview depth** | prose, comparisonTable, callout (Layer 2 only) |

---

## Mind map (per module)

- `intro`: beginner summary (2–3 sentences)
- `overviewDiagram`: process/flow Mermaid
- `conceptCards`: one card per topic (min 4), link via `topicSlug`
- `revisionDiagram`: concept map Mermaid with full labels

---

## Interview page (`interview.json`)

Each module should have **8–10 Q&A items** for senior modules, **6–8** for foundation.

Each item: scenario-based question, mechanism + tradeoff + production note, 2 `followUps`, `sixtySeconds` script.

---

## Adding a new topic

1. Add entry to `module.json` `topics[]` with unique `id`, `slug`, `order`, `title`.
2. Create `topics/<slug>.json` following both layers.
3. Update `mindmap.json`, `quick-overview.json`, `interview.json`.
4. Update `data/dotnet/index.json` `topicCount` for that module.
5. Add cross-links from related topics (`relatedTopicIds`).
6. Run `npm run test:content`.

New topic IDs: `dotnet-{module-order}-{slug-with-dashes}`.

---

## Research sources to cite

Prefer official docs:
- [ASP.NET Core overview](https://learn.microsoft.com/en-us/aspnet/core/overview)
- [Minimal APIs](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/minimal-apis)
- [Middleware](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/middleware/)
- [Dependency injection](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/dependency-injection)
- [Authentication and authorization](https://learn.microsoft.com/en-us/aspnet/core/security/)
- [EF Core](https://learn.microsoft.com/en-us/ef/core/)
- [OpenTelemetry in .NET](https://learn.microsoft.com/en-us/dotnet/core/diagnostics/observability-with-otel)

Senior depth topics from community interviews (Reddit r/dotnet, LeetCode discuss):
- Middleware order and captive scoped-in-singleton dependencies
- Thread-pool starvation from sync-over-async in APIs
- EF Core N+1, AsNoTracking, pagination, RowVersion concurrency
- JWT vs session, refresh tokens, policy-based authorization
- Problem Details (RFC 7807), correlation IDs
- Rate limiting, output caching, Polly resilience
- WebApplicationFactory integration testing
- Outbox pattern, background services with scoped DbContext
- gRPC vs REST tradeoffs for internal vs public APIs
