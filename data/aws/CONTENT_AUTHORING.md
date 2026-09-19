# AWS Content Authoring Guide

Use this guide when writing or deepening any module under `data/aws/modules/`.

## Dual audience model

Every topic serves **two layers**. Beginners read Layer 1 first; senior / FAANG interview prep lives in Layer 2.

| Layer | Audience | Goal |
| --- | --- | --- |
| **Layer 1 — Beginner** | First-time cloud readers | Understand terms, packet flows, and working CLI examples |
| **Layer 2 — Senior (5yr / FAANG)** | Experienced engineers | Internals, tradeoffs, production proof, 60-second answers |

**Layer 2 is required** on all topics in **intermediate** (modules 08–13) and **advanced** (modules 14–18) modules.  
**Layer 2 is recommended** on foundation modules 01–03; required on 04–07 when the topic is interview-critical (VPC, IAM, multi-tenancy).

---

## Layer 1 rules (beginner — keep always)

1. **Expand abbreviations on first use:** `Virtual Private Cloud (VPC)`, `Availability Zone (AZ)`, `Content Delivery Network (CDN)`.
2. **Hook:** Max 2 sentences, plain English, no unexplained acronyms.
3. **Titles:** Descriptive + parenthetical expansion. Keep `slug` and `id` unchanged.
4. **Sections:** 4–6 using `blocks[]` (see template below).
5. **Snippets:** Minimum **3 snippets** per topic (AWS CLI + CloudFormation YAML primary) with line-by-line `explanation`.
6. **Glossary:** At least one `glossary` block per topic.
7. **Diagram:** At least one `diagram` block (Mermaid) — **required for all networking topics** (packet/request path).
8. **Platform correlations:** Keep `jsTsCorrelations`; compare on-prem datacenter mental models and C#/Node backend patterns.
9. **Cross-links:** Preserve valid `relatedTopicIds`; add links where helpful.

---

## Layer 2 rules (senior / FAANG — intermediate + advanced)

Add a **7th section** (max 7 sections total):

| Section heading | Required blocks |
| --- | --- |
| **Senior interview depth** | `prose` (internals, 1 paragraph), `comparisonTable` (tradeoffs), `callout` variant `warning` (“what gets you rejected”) |

Optional in same section or as extra snippet:
- **How to prove it in production** — VPC Flow Logs, CloudWatch metrics, `aws logs tail`, X-Ray traces, or CLI verification commands.

### `interviewTakeaways` — exactly **5 bullets**

1. One-line definition  
2. Tradeoff or “when not to use”  
3. Production tip (VPC endpoints, SQS DLQ, CloudFront cache keys, etc.)  
4. **60-second interview script** (prefix with `60s:`)  
5. Follow-up hook the interviewer might ask next  

### `commonPitfalls` — at least **3 items**, including:

- One **weak/rejection answer** (“Saying X gets you rejected because…”)  
- One **strong answer** contrast  

### Snippets (senior modules)

| Module tier | Minimum snippets |
| --- | --- |
| Intermediate / advanced (standard) | **4** |
| P0 critical topics (VPC, Lambda VPC, SQS) | **4** + at least **1 diagnostics or failure-mode** snippet |

### `jsTsCorrelations` (platform correlations)

- **Minimum 2 entries** per topic on intermediate and advanced modules.
- Compare on-prem vs cloud behavior, or C#/Node backend patterns (e.g. in-process queue vs SQS, BackgroundService vs Lambda consumer).

### `officialSources`

- At least one **AWS documentation** link.
- Cite Well-Architected, Cloud Foundation, or SaaS Architecture whitepapers where applicable.

---

## Topic block template (Layer 1 sections 1–6)

| Section heading | Block types |
| --- | --- |
| What is this? | prose, glossary |
| Why does it matter? | prose, callout |
| How it works step by step | steps, diagram |
| Code walkthrough | snippet × 2–3 (CLI + CloudFormation) |
| Compare with on-prem / backend | comparisonTable or prose + jsTsCorrelations |
| Common mistakes | callout (warning) |
| **Senior interview depth** | prose, comparisonTable, callout (Layer 2 only) |

---

## Standard block headings (copy-paste)

- Section: `Senior interview depth`
- Table title: `Tradeoffs at senior level`
- Callout title: `What gets you rejected in interviews`
- Prose lead-in: `How to prove it in production`

---

## Mind map (per module)

- `intro`: beginner summary (2–3 sentences)
- `overviewDiagram`: process/flow Mermaid
- `conceptCards`: one card per topic (min 4), link via `topicSlug`
- `revisionDiagram`: concept map Mermaid with full labels

---

## Interview page (`interview.json`)

Each module should have **8–10 Q&A items** for senior modules, **6–8** for foundation.

Each item:
- Scenario-based question (not “what is X?”)
- Answer with mechanism + tradeoff + production note
- 2 `followUps`
- `sixtySeconds` condensed script

---

## Adding a new topic

1. Add entry to `module.json` `topics[]` with unique `id`, `slug`, `order`, `title`.
2. Create `topics/<slug>.json` following both layers.
3. Update `mindmap.json` concept card + diagrams if needed.
4. Update `quick-overview.json`, `interview.json`.
5. Update `data/aws/index.json` `topicCount` for that module.
6. Add cross-links from related topics (`relatedTopicIds`).
7. Run `npm run test:content`.

New topic IDs: `aws-{module-order}-{slug-with-dashes}`.

---

## Quality checklist

- [ ] Schema validates (`npm run test:content`)
- [ ] Layer 1: ≥4 sections, ≥3 snippets, glossary + diagram
- [ ] Layer 2 (if intermediate/advanced): 7th section, 5 takeaways, 2 jsTsCorrelations, ≥4 snippets
- [ ] Mind map: intro, overviewDiagram, conceptCards, revisionDiagram
- [ ] `module.json` titles match topic JSON titles
- [ ] `index.json` topicCount matches file count

---

## Research sources to cite

Prefer official AWS docs:
- [AWS Well-Architected Framework](https://docs.aws.amazon.com/wellarchitected/latest/framework/welcome.html)
- [Establishing Your Cloud Foundation on AWS](https://docs.aws.amazon.com/whitepapers/latest/establishing-your-cloud-foundation-on-aws/welcome.html)
- [SaaS Architecture Fundamentals on AWS](https://docs.aws.amazon.com/whitepapers/latest/saas-architecture-fundamentals/saas-architecture-fundamentals.html)
- [Amazon VPC User Guide](https://docs.aws.amazon.com/vpc/latest/userguide/what-is-amazon-vpc.html)
- [AWS Global Infrastructure](https://aws.amazon.com/about-aws/global-infrastructure/)
