# Design Plugin — Requirement Specification (Agent Edition)

> **Status:** Draft v0.1
> **Requirement owner:** User
> **Audience:** AI agents. A parallel Thai edition exists for human readers. **All identifiers (G, P, W, V, D, L) are shared across both editions** — V17 here is V17 there.
> **Scope:** WHAT must be true. Not HOW to implement.
> **Keywords:** MUST / MUST NOT / SHOULD / MAY carry RFC-2119 meaning.

---

## 0. Summary

The Design Plugin converts requirements into two parallel deliverables:

| Target | Form | Consumer | Purpose |
|---|---|---|---|
| Human | Narrative document (Markdown → Word/PDF) | Client, PM | Review and sign off on scope |
| AI | Structured JSON + Wiki Markdown | Downstream plugin agents | Build, mock up, test |

**Analogy — the interpreter.** The plugin sits between the client and the build team like an interpreter in a meeting. A good interpreter does not translate word for word; they translate into a form each side can *act on*. The client needs language they can sign. The build team needs language they can execute. And the interpreter must remember which sentence came from which — otherwise, when one side revises a statement, nobody knows what else must change.

**The core deliverable is not a well-written document. It is total traceability.**

---

## 1. Goals and Non-Goals

### 1.1 Goals

| ID | Goal | Measure |
|---|---|---|
| G1 | Consume `req` plugin output without re-entering data | No datum is typed more than once |
| G2 | Produce a client-facing document covering all standard SA sections | Passes the §11 checklist in full |
| G3 | Produce specs downstream agents can act on without guessing | `dev` / `qa` generate tasks with zero clarifying questions |
| G4 | Every artifact traces back to a requirement | V1–V2 pass |
| G5 | Work continues across sessions | One command restores full working context |
| G6 | Requirement changes surface their blast radius immediately | Change command lists every affected artifact |
| G7 | JSON + Wiki are shared across the marketplace | Schemas versioned; other plugins read them without modifying this plugin |

### 1.2 Non-Goals

- MUST NOT perform requirement elicitation (owned by `req`)
- MUST NOT write production system code (owned by `dev`)
- MUST NOT execute test suites (owned by `qa`)
- MUST NOT handle deployment or infrastructure
- MUST NOT produce wireframes, themes, handoffs, or mockups — all owned by the mockup plugin (§12)

---

## 2. Actors

| Actor | Interface | Needs |
|---|---|---|
| System Analyst (human) | Commands | Generate, inspect, revise documents |
| Client / Business Owner | Exported Word/PDF | Readable, signable scope |
| AI Agent (design) | Artifact store (read/write) | Execute one command at a time to completion |
| AI Agent (mockup / dev / qa) | Artifact store (read-only for design-owned files) | Receive specs and continue |
| Auditor / QA | RTM + validation report | Verify completeness and consistency |

---

## 3. Marketplace Position and Contracts

```
req ──▶ design ──┬──▶ mockup
                 ├──▶ dev
                 ├──▶ qa
                 └──▶ deliver
```

### 3.1 Inbound Contract (design ← req)

The plugin MUST bind to contract files, never to `req`'s internal structures.

| File | Contents | Required |
|---|---|---|
| `requirements.json` | REQ-xxx with type, priority, acceptance criteria | Mandatory |
| `glossary.json` | Domain terms and definitions (Ubiquitous Language) | Mandatory |
| `stakeholders.json` | Actors and roles | Recommended |
| `okr.json` | Objectives and Key Results (downstream test oracle) | Recommended |
| `change-set.json` | Requirement diffs | When changes occur |

**Hard rule:** If a mandatory file is missing or malformed, the plugin MUST halt and report exactly what is absent. It MUST NOT infer the missing content and proceed.

### 3.2 Outbound Contract (design → downstream)

| Consumer | Must be able to read | Purpose |
|---|---|---|
| `mockup` | `sitemap.json`, `screens.json`, `rbac.json` | Build wireframes and mockups |
| `dev` | `functions.json`, `datamodel.json`, `interfaces.json`, `statemachines.json`, `screens.json`, `rbac.json` | Derive tasks (visual assets and theme come from the mockup plugin) |
| `qa` | `scenarios.json`, trace, `nfr.json` | Derive test cases and verify commands |
| `deliver` | trace, `okr.json`, exported document | Closure criteria |

### 3.3 Compatibility Rules

- Every JSON file MUST carry a top-level `schemaVersion`.
- Adding a field is backward compatible. Removing a field or changing its meaning REQUIRES a major version bump.
- Every object MUST support an `extensions` object so future plugins can attach data without altering the shared schema.
- Readers MUST tolerate unknown fields (ignore, do not error).

---

## 4. Design Principles

| # | Principle | Rationale |
|---|---|---|
| P1 | **JSON for state machines must decide; Markdown for knowledge humans and AI must read** | State, lists, mappings, pass/fail → JSON. Rationale, context, ADRs, prose → Markdown |
| P2 | **JSON is the single source of truth; the Word document is a rendering** | Edits made to an exported document MUST NOT be expected to flow back |
| P3 | **Traceability is a first-class citizen, not a byproduct** | Every artifact carries an ID and traces up to a REQ |
| P4 | **Exit conditions come from scripts, never from an LLM declaring completion** | Prevents false "done" |
| P5 | **Idempotent** — re-running a command produces the same result and creates no duplicates | Agent loops must be safe to retry |
| P6 | **Never overwrite client-approved content without a backing change-set** | Preserves the integrity of signed documents |
| P7 | **Split files by module / bounded context as the project grows** | Controls agent context window |
| P8 | **Avoid premature abstraction** | No CLI wrapper, no database, until plain files prove insufficient |
| P9 | **IDs in English; client-facing content in Thai** | Specs cross systems; documents stay readable |

---

## 5. Artifact Model

### 5.1 Storage Layout

```
.aeon/
├── index.json                     # marketplace table of contents
├── req/
│   ├── requirements.json
│   ├── glossary.json
│   └── change-set.json
├── design/
│   ├── design.state.json          # execution state (machine)
│   ├── modules/
│   │   ├── index.json
│   │   └── <module>/
│   │       ├── functions.json
│   │       ├── screens.json
│   │       ├── statemachines.json
│   │       └── scenarios.json
│   ├── context.json               # scope, assumptions, constraints
│   ├── nfr.json
│   ├── datamodel.json
│   ├── interfaces.json
│   ├── sitemap.json
│   ├── rbac.json
│   ├── trace.design.json
│   └── validation-report.json
├── wiki/                          # library — organized BY TOPIC, not by plugin
│   ├── wiki-index.json            # agents navigate via this file only
│   ├── domain/
│   ├── rules/
│   ├── conventions/
│   ├── integrations/
│   └── adr/
├── docs/                          # phase deliverables — organized BY PLUGIN
│   ├── req/
│   └── design/
└── export/
```

### 5.2 `wiki/` versus `docs/`

P1 splits JSON from Markdown. Markdown must be split once more.

**Decision question: will this content still be true after this phase ends?**

| Answer | Location | Organized by | Examples |
|---|---|---|---|
| Yes — spans phases and people | `wiki/` | **Topic** | Domain model, ADRs, conventions, business rules, integration contracts |
| No — it is this phase's deliverable, tied to phase approval | `docs/<plugin>/` | **Plugin** | Document introduction, interview notes, impact reports |

**Analogy:** `docs/` is a case file — closed when the case ends. `wiki/` is the law library — nobody owns a shelf, every case draws from it, and it outlives every case.

### 5.3 Front-matter

Every file in `wiki/` and `docs/` MUST carry front-matter so agents can resolve relationships without reading file bodies.

```yaml
---
id: WIKI-DOMAIN-LOAN          # stable for life — links reference id, never path
type: domain.aggregate
owner: design                  # the only plugin permitted to write this file
contributors: [dev]            # may append their own section; may not edit owner content
readers: ["*"]
scope: project                 # project | global
traces: [REQ-012, ENT-003]
status: approved               # draft | in-review | approved | stale | deprecated
version: 3
updated: 2026-08-18
---
```

`wiki-index.json` aggregates all front-matter.

### 5.4 Mandatory Rules

| # | Rule | Rationale |
|---|---|---|
| W1 | **One file, one owner — applies to JSON as well as Markdown.** No file may be written by two plugins, even if they touch different fields. If content must come from two parties, split into two files joined by ID. | Regeneration always rewrites the whole file; the other party's data disappears silently (§19) |
| W2 | **One file, one independently-stale unit.** A file bundling five aggregates forces all five stale when one REQ changes, and the agent will rework things it should not touch. | Keeps blast radius precise |
| W3 | **Reference, do not copy.** Phase documents MUST NOT paste domain definitions inline; they link by ID and inline only at export time. | Copying produces two competing sources of truth within a week |
| W4 | **IDs are stable; paths are not.** All links resolve by ID. | Folders will be reorganized as the project grows |
| W5 | **Folders are for humans and git; the index is for agents.** Agents MUST navigate via `wiki-index.json` and MUST NOT walk the directory tree. | Directory-dependent agents make files unmovable |

**Split threshold:** exceeding ~300 lines or more than five H2 sections.

**Enforcement:** a pre-commit hook verifies the committing plugin matches the file's declared `owner`. Structural enforcement, not prompt instruction.

---

## 6. ID Scheme and Traceability

### 6.1 ID Prefixes

| Prefix | Meaning | Owner |
|---|---|---|
| `REQ-###` | Requirement | req |
| `FN-###` | Functional requirement | design |
| `UC-###` | Use case | design |
| `NFR-###` | Non-functional requirement | design |
| `ENT-###` | Entity / Aggregate | design |
| `STM-###` | State machine | design |
| `SCR-###` | Screen | design |
| `API-###` | API endpoint | design |
| `INT-###` | External integration | design |
| `RPT-###` | Report / printable document | design |
| `SCN-###` | Test scenario | design |
| `RULE-###` | Business rule | design |
| `ADR-###` | Architecture decision record | design |
| `MCK-###` | Mockup / wireframe | mockup |
| `SRC-###` | Source file / class / module | dev |
| `TC-###` | Executable test case | qa |

The last three MUST be defined now even though their plugins do not yet exist. If the graph terminates at `SCN`, change propagation stops at design and never reaches code or tests.

### 6.2 Relationship Graph

```
REQ ──satisfies──▶ FN ──realizedBy──▶ UC
                    │                  │
                    ├──displayedOn──▶ SCR ──calls──▶ API
                    │                  └──mockedBy──▶ MCK
                    ├──governedBy──▶ RULE
                    ├──operatesOn──▶ ENT ──hasState──▶ STM
                    └──verifiedBy──▶ SCN ──testedBy──▶ TC
                                      │
SCR / API / FN ──implementedBy──▶ SRC ┘
NFR ──verifiedBy──▶ SCN
```

Stored as an edge list, **split by author** per W1:

```
design/trace.design.json     owner: design
dev/trace.dev.json           owner: dev
qa/trace.qa.json             owner: qa
mockup/trace.mockup.json     owner: mockup
```

```json
{
  "schemaVersion": "1.0",
  "owner": "design",
  "edges": [
    { "from": "REQ-012", "rel": "satisfiedBy", "to": "FN-004" },
    { "from": "FN-004",  "rel": "displayedOn", "to": "SCR-007" },
    { "from": "SCR-007", "rel": "calls",       "to": "API-021" },
    { "from": "FN-004",  "rel": "verifiedBy",  "to": "SCN-015" }
  ]
}
```

Each plugin appends only its own edges and MUST NOT modify another plugin's edges. A script merges all files into a single read-time view; no writable merged graph file exists.

**Queries the system MUST answer immediately** (this is the acceptance test for traceability):

1. Which requirement produced screen SCR-007?
2. Which unit tests and scenarios must exist for FN-004?
3. If REQ-012 changes, what is affected across the entire graph?
4. Which requirements have no screen or no test?
5. Which screens trace to no requirement at all (scope creep)?
6. Is SCR-007 built yet, and do its tests pass? (requires joining design → dev → qa)

---

## 7. Commands

> Names are proposals. Inputs, outputs, and DoD are not.

### 7.1 Command Table

| Command | Purpose | Input | Output | Definition of Done |
|---|---|---|---|---|
| `/design:init` | Bootstrap; validate req inputs | `req/*.json` | `design.state.json`, folder skeleton | Inputs complete; state file created |
| `/design:overview` | Introduction + system overview (§11 sections 1–2) | requirements, stakeholders, glossary | `context.json`, narrative docs | Scope, assumptions, constraints present; context diagram produced |
| `/design:function` | Functional requirements (section 3) | requirements | `functions.json`, `statemachines.json` | Every functional REQ mapped; every UC has main + alternate + exception flows |
| `/design:nfr` | Non-functional requirements (section 4) | requirements | `nfr.json` | Every NFR carries a measurable number |
| `/design:datamodel` | Data requirements (section 5) | functions, glossary | `datamodel.json` | Every attribute has type, required flag, validation rule; ERD generated |
| `/design:interface` | External interfaces and APIs (section 6) | functions, datamodel | `interfaces.json` | Every integration declares protocol, auth, failure behavior |
| `/design:rbac` | Permission matrix (see §13) | functions, datamodel, stakeholders, statemachines | `rbac.json` | V23–V27 pass |
| `/design:sitemap` | Screen inventory (section 8) | functions, rbac | `sitemap.json`, `screens.json` | Every screen traces to an FN and declares access rights |
| `/design:scenario` | RTM + test scenarios (section 7) | all files | `scenarios.json`, trace | Every FN and NFR has ≥1 scenario with an explicit expected result |
| `/design:change` | Ingest change-set; compute impact | `change-set.json`, trace | Stale list + changelog | Every affected artifact marked |
| `/design:trace` | Query the traceability graph | trace files | Query results | Answers all six §6.2 questions |
| `/design:check` | Run validation rules V1–V22 | all files | `validation-report.json` | Per-rule pass/fail with offending IDs |
| `/design:status` | Report progress and blockers | `design.state.json` | Status + exit code | Deterministic |
| `/design:export` | Render the client document | all files | `.md` / `.docx` | All §11 sections present |
| `/design:help` | Explain commands and ordering | — | Help text | States prerequisites and recommended order |

### 7.2 Rules Binding on Every Command

1. MUST read `design.state.json` before doing anything.
2. MUST check prerequisites; if a preceding command has not run, report and halt.
3. MUST be idempotent — update existing records, never duplicate IDs.
4. MUST write JSON first, then render Markdown.
5. MUST update trace whenever a new artifact is created.
6. MUST update `design.state.json` on completion with a timestamp.
7. MUST NOT modify artifacts with `status: approved` unless a change-set authorizes it.

---

## 8. Session Continuity and the Agent Loop

### 8.1 Problem

A new session begins with no memory of prior work, causing duplicated or skipped steps.

### 8.2 Mechanism

**`design.state.json` — machine-readable state**

```json
{
  "schemaVersion": "1.0",
  "project": "miniloan",
  "phase": "design",
  "steps": [
    {
      "id": "overview",
      "command": "/design:overview",
      "status": "done",
      "requires": ["init"],
      "artifacts": ["context.json", "docs/design/01-introduction.md"],
      "attempts": 1,
      "updatedAt": "2026-08-18T09:00:00Z"
    },
    {
      "id": "function",
      "command": "/design:function",
      "status": "in_progress",
      "requires": ["overview"],
      "blocked_by": [],
      "attempts": 2
    }
  ],
  "openQuestions": [
    { "id": "Q-003", "text": "Must the system support multiple currencies?", "blocks": ["datamodel"] }
  ]
}
```

Permitted `status` values: `pending | in_progress | done | blocked | stale`.

**Status script — the loop exit condition**

- MUST be deterministic; MUST NOT rely on LLM self-assessment.
- Exit codes: `0` = all steps complete and validation passes; `1` = work remains; `2` = blocked.
- Output MUST always name the next command to run.

**Behavior on session start**

1. Read `design.state.json`.
2. Read `wiki-index.json` — not every file.
3. Report to the user: what is done, what is blocked, what comes next.
4. MUST NOT begin new work before reporting status.

**Loop guard:** when `attempts` exceeds 3 on the same step, set `blocked` and wait for a human.

---

## 9. Change Management

### 9.1 Input

```json
{
  "changeSetId": "CS-004",
  "date": "2026-08-18",
  "changes": [
    { "reqId": "REQ-012", "type": "modified", "summary": "added maximum credit limit condition", "from": "v2", "to": "v3" },
    { "reqId": "REQ-031", "type": "added" },
    { "reqId": "REQ-008", "type": "removed" }
  ]
}
```

### 9.2 Required Behavior of `/design:change`

1. Read the change-set.
2. Walk the merged trace graph to find **all** downstream artifacts at every depth, not just first-degree neighbors.
3. Mark them `status: stale`.
4. Produce a human-readable impact report quantifying affected screens, APIs, scenarios.
5. Append to `CHANGELOG.md` and the document's revision history table.
6. The status command MUST NOT return exit code 0 while any artifact remains stale.

### 9.3 Removals

Do not delete. Set `status: deprecated` with a reason, preserving the audit trail.

---

## 10. Validation Rules

Consumed by `/design:check`. Output MUST be per-rule with offending artifact IDs so agents can repair precisely without re-reading the project.

| ID | Rule | Severity |
|---|---|---|
| V1 | Every `REQ` maps to at least one `FN` or `NFR` (no orphan requirements) | Error |
| V2 | Every `FN` / `SCR` / `API` traces back to a `REQ` (no scope creep) | Error |
| V3 | Every `UC` has actor, precondition, main flow, alternate flow, exception flow | Error |
| V4 | Every stateful entity has an `STM`, and every state has an exit path (no dead states) | Error |
| V5 | Every `SCR` declares permitted roles, fields with validation, actions, post-action destination, and **the states it must support** (empty, loading, error, unauthorized, overflow) | Error |
| V6 | Every `FN` and `NFR` has ≥1 `SCN` with an unambiguous expected result | Error |
| V7 | Every datamodel attribute has type, required flag, and validation rule | Error |
| V8 | Every `INT` declares direction, protocol, authentication, and failure behavior | Error |
| V9 | Every `NFR` carries a measurable number (bare adjectives like "fast" are rejected) | Error |
| V10 | Terminology matches `glossary.json` across all artifacts | Warning |
| V11 | Every data-bearing `SCR` links to an `ENT` and an `API` | Error |
| V12 | Every `RULE` declares its enforcement layer (UI / API / Domain / DB) | Warning |
| V13 | No artifact remains in `stale` state | Error |
| V14 | No `openQuestions` currently block a step | Error |
| V15 | Every personal-data field has a classification and retention period (PDPA) | Error |
| V16–V22 | *(Moved to the mockup plugin as MV1–MV7. These numbers are retired and MUST NOT be reused.)* | — |
| V23 | Every role in `rbac.json` originates from a stakeholder recorded by req | Error |
| V24 | Every state-changing action has a governing permission entry | Error |
| V25 | Every permission entry declares `scope`; blank is rejected | Error |
| V26 | Every permission entry enforces at `api` or `domain`; `ui`-only declarations fail | Error |
| V27 | No role has zero accessible screens or actions, and no screen is accessible to zero roles | Warning |

---

## 11. Human Document Structure

| # | Section | Contents | Diagrams | Source |
|---|---|---|---|---|
| — | Cover + revision history | Version, date, approver | — | state + changelog |
| 1 | Introduction | Purpose, scope, references | — | context.json |
| 1.4 | Glossary | Term table | — | glossary.json |
| 2 | System overview | Product view, users, constraints, assumptions | Context diagram (DFD 0), As-Is / To-Be process flows, stakeholder map | context.json |
| 3 | Functional requirements | Functions by module | Use case diagram + descriptions, activity diagrams, DFD L1–2, state diagrams | functions.json, statemachines.json |
| 4 | Non-functional requirements | Performance, security, availability, usability, PDPA | Tables + workload chart | nfr.json |
| 5 | Data requirements | Master data, volume, retention | Conceptual ERD, data dictionary | datamodel.json |
| 6 | Interface requirements | Screens, external systems, hardware | Integration diagram, API table | interfaces.json, screens.json |
| 6.5 | Permission matrix | Role × screen × action × data scope | Table | rbac.json |
| 7 | Requirements traceability matrix | RTM | Mapping table | trace |
| 8 | Sitemap | Screen inventory | Sitemap tree | sitemap.json |
| 9 | Wireframes / mockups | Attached from the mockup plugin if present | — | mockup plugin |
| 10 | Appendix: decisions | Relevant ADRs | — | wiki/adr/ |

### 11.1 Diagram Generation Rules

| Diagram | Source | Method |
|---|---|---|
| ERD | datamodel.json | Auto-generate (Mermaid `erDiagram`) |
| State diagram | statemachines.json | Auto-generate (Mermaid `stateDiagram-v2`) |
| Use case diagram | functions.json | Auto-generate |
| Sitemap tree | sitemap.json | Auto-generate |
| Sequence / integration | interfaces.json | Auto-generate |
| Context diagram (DFD 0) | context.json | Generate, then allow human refinement |
| As-Is / To-Be process flow | Hand-authored | Human-authored, stored in wiki |

Mermaid does not support BPMN natively. Either use swimlane flowcharts or attach externally produced BPMN files (see D6).

### 11.2 Document–Spec Relationship

```
JSON (source of truth) ──render──▶ Markdown ──convert──▶ .docx for the client
Wiki Markdown (narrative) ──include──▶ ┘
```

- Lists and tables MUST always be rendered from JSON.
- Prose sections (introduction, rationale, ADRs) are authored in wiki Markdown and included.
- Exported files MUST NOT be edited directly; edits are overwritten on the next render.

---

## 12. Boundary with the Mockup Plugin

Wireframes, themes, handoffs, and mockups are **not the design plugin's responsibility**. They belong to a separate mockup plugin (see the Mockup Plugin Requirement Specification).

### 12.1 Division of Responsibility

| Design owns | Mockup owns |
|---|---|
| Sitemap | Wireframes per screen |
| Screen detail — fields, validation, actions, destinations | Mockup HTML |
| Screen- and action-level permissions | Theme tokens and component inventory |
| **The list of states each screen must support** (empty, loading, error, unauthorized, overflow) | Handoff ingestion and theme-prompt proposal |
| Business rules and state machines the screen references | The visual delivery package for dev |

**Why the state list stays with design:** it is a behavioral requirement, not a visual one. dev must implement it and qa must test it whether or not the project ever produces mockups.

### 12.2 What Design Must Supply to Mockup

`sitemap.json`, `screens.json`, `rbac.json`, and the design trace.

If a screen has not passed V5 (missing fields, actions, or permissions), the mockup plugin **MUST NOT generate it**; it MUST raise a question through the back-channel.

### 12.3 What Design Must Not Do

- MUST NOT define colors, fonts, or any style value
- MUST NOT produce HTML or wireframe files
- MUST NOT ingest handoffs
- MUST NOT write into the mockup plugin's space

If the user requests a mockup while using the design plugin, direct them to the mockup plugin rather than producing one.

---

## 13. Authorization Model

### 13.1 Why a Two-Dimensional Matrix Is Insufficient

The conventional role × screen × action table collapses on contact with real organizational work, because it omits four more important dimensions.

**Analogy:** an employee badge does not merely say "opens / does not open". It must also encode which building (scope), during which hours (condition), what is visible once inside (field level), and who may carry it when the holder is on leave (delegation).

| Dimension | Question it must answer | Consequence of omission |
|---|---|---|
| **Data scope** | Approve *whose* records — all / own branch / own team / own creations | dev cannot infer this; it either asks back or gets it wrong and rewrites the query layer |
| **State-dependent conditions** | Editable in which states; cancellable before which step | dev builds plain CRUD and retrofits every screen later |
| **Field level** | Which fields certain roles must not see (salary, national ID) | Personal data leaks through screens the role is already permitted to open |
| **Delegation / acting-on-behalf** | Who may act for whom, during which period | Present in nearly every Thai enterprise engagement; never in the original requirements |

### 13.2 Required Structure

```json
{
  "schemaVersion": "1.0",
  "defaultEffect": "deny",
  "roles": [
    { "id": "ROLE-approver", "label": "ผู้อนุมัติ", "trace": ["REQ-005"], "inherits": ["ROLE-staff"] }
  ],
  "entries": [
    {
      "id": "ACL-018",
      "role": "ROLE-approver",
      "resource": "SCR-007",
      "action": "approve",
      "scope": "own-branch",
      "condition": { "state": ["submitted"] },
      "enforceAt": ["api", "domain"],
      "trace": ["REQ-012", "FN-004", "STM-002"]
    }
  ],
  "fieldRules": [
    { "entity": "ENT-003", "field": "salary", "visibleTo": ["ROLE-hr"], "classification": "sensitive" }
  ],
  "delegation": { "enabled": true, "scopeInheritance": "delegator" }
}
```

### 13.3 Binding Rules

| # | Rule | Rationale |
|---|---|---|
| A1 | **Default effect MUST be deny** — anything not declared is forbidden | Starting from allow produces silent holes nobody sees until they are exploited |
| A2 | Every entry MUST declare `scope`; blank is not permitted | A blank value is read as "all", the most dangerous possible default |
| A3 | Every entry MUST declare its enforcement layers, and **MUST include at least one of `api` or `domain`** | Declaring only `ui` hides a button; it is not access control (couples to V12 and dev DV16) |
| A4 | Roles MUST originate from stakeholders recorded by req | Roles invented during design have no owner in the client organization |
| A5 | State-dependent permissions MUST reference states that exist in an `STM` | Prevents unreachable conditions |
| A6 | Fields classified as personal data MUST have a corresponding `fieldRules` entry | Couples directly to V15 |

### 13.4 Execution Order

`/design:rbac` MUST run **after** `function` and `datamodel` (actions and entities must already exist) and **before** `sitemap` (screen inventory must know who may access what).

If `rbac.json` is absent, the sitemap command MUST halt and report. It MUST NOT create screens with no permission binding.

### 13.5 Downstream Use

| Consumer | Purpose |
|---|---|
| `dev` | Enforce authorization at the layers named in `enforceAt`, and translate `scope` into query-level conditions |
| `qa` | Generate positive and negative tests for every role (QV6) plus cross-scope tests — e.g. branch A's manager requesting branch B's data |
| Client | Review and sign off the permission matrix — this is a client-approved document, not an internal artifact |

**Commonly overlooked:** the permission matrix is a document the client must sign, because it encodes organizational authority rather than technical detail. Excluding it from the client document guarantees an argument during UAT about who should be able to approve.

---

## 14. Supporting Plugins That Do Not Exist Yet

| Mechanism | Detail |
|---|---|
| Schema versioning | Every file carries `schemaVersion` |
| Extension point | Every object exposes `extensions: {}` |
| Capability declaration | Marketplace `index.json` declares which plugin produces and consumes which files |
| Read-only contract | Downstream plugins read design artifacts; they write back only to explicitly designated fields |
| Structural enforcement | Pre-commit hooks, not prompt instructions |
| Shared memory layer | Every plugin reads `wiki/`; each writes only files it owns |
| Two-tier wiki | Project wiki plus a global cross-project wiki |

### 14.1 Two-Tier Wiki

| Tier | Scope | Examples | Agent write access |
|---|---|---|---|
| Project wiki | `.aeon/wiki/` | This project's domain model, project-specific ADRs | Permitted per `owner` |
| Global wiki | Shared cross-project store | Audit-trail patterns, API naming conventions, reusable ADRs | **Read-only.** Writes require explicit human instruction |

Rationale: project-specific knowledge leaking into the global tier causes the next project to receive advice that is wrong for its context, silently.

---

## 15. Non-Functional Requirements of the Plugin Itself

| ID | Requirement | Criterion |
|---|---|---|
| PNFR-1 | No external paid API dependencies | Runs with plain files and scripts |
| PNFR-2 | No special infrastructure (no graph DB, no server) | Runs on a standard learner machine |
| PNFR-3 | Context-bounded — never load every file at once | Always navigate via index first |
| PNFR-4 | Teachable — comprehensible within one hour | `/design:help` explains the workflow order |
| PNFR-5 | Bilingual — Thai for client content, English for IDs | Both present in the same file |
| PNFR-6 | Results verifiable without trusting the LLM | Every DoD binds to a script |

---

## 16. Open Decisions

| ID | Issue | Why it matters | Proposal |
|---|---|---|---|
| D1 | **RBAC / permission matrix** | ~~Undecided~~ | **Decided** → §13: four dimensions required (data scope, state conditions, field level, delegation), default deny, enforced at api/domain, included in the client document |
| D2 | **Reports and printable documents (RPT)** | Present in nearly every Thai enterprise engagement; always omitted | Add artifact type `RPT-###` under section 6 |
| D3 | **Master data / code tables (dropdowns)** | A leading cause of rework during dev | Add a datamodel section |
| D4 | **Error catalogue / error codes** | Shared by API, UI copy, and tests | Add `errors.json` |
| D5 | **Notifications (email / LINE / push)** | Clients assume these exist but never write them down | Add a category under `interfaces.json` |
| D6 | **How to store BPMN As-Is / To-Be** | Mermaid lacks BPMN support | Choose swimlane flowcharts or externally attached files |
| D7 | **Surfaces — web / mobile / api** | The source brief covers web sitemaps only | Add a `surface` field to screens rather than splitting files |
| D8 | **Where client approval is recorded** | A phase gate and delivery evidence | Add `approvals.json` — who approved, which version, when |
| D9 | **Data migration from legacy systems** | Surfaces late, near delivery | Add a data requirements section |
| D10 | **Cross-cutting conventions** (paging, search, sort, upload, timezone, currency, Thai date formats) | Without a central definition these get rewritten per screen, inconsistently | Add `conventions.md` in wiki and reference it |
| D11 | **Audit trail + PDPA field classification** | V15 requires it; storage location undefined | Add `classification` and `retention` to every attribute |
| D12 | **Where DDD aggregate invariants live** | The data dev needs most; no home in the original structure | Store at aggregate level in datamodel plus `RULE-###` |
| D13 | **When to split files by module** | Splitting too early adds friction; too late exceeds context | Proposed threshold: >30 FN or >1500 lines |
| D14 | **Spec language** | Client documents are Thai; agents work better in English | Proposed: English `id`/`key`, Thai `label`/`description`, both in one file |
| D15 | **Test data / fixtures** | qa needs them; design does not currently produce them | Decide whether design specifies sample data or qa generates it |
| D16 | **How unanswerable questions return to req** | Currently they only accumulate in `openQuestions` | Requires a `question-set.json` channel back to req |
| D18–D22 | *(Moved to the mockup plugin as MD1–MD5)* | — | — |
| D17 | **Wiki layout and ownership** | ~~Undecided~~ | **Decided** → §5.2–5.4, §14.1: `wiki/` by topic, `docs/<plugin>/` by phase, ownership via front-matter `owner`, enforced by pre-commit hook |

---

## 17. Build Order

**Milestone 1 — Skeleton**
`init` → `overview` → `function` → `status`
*Proves state file, prerequisites, and traceability actually work.*

**Milestone 2 — Completeness**
`datamodel` → `scenario` → `check`
*Proves validation rules genuinely catch what is missing.*

**Milestone 3 — Delivery**
`sitemap` → `interface` → `nfr` → `export`
*Proves the output is a document a client can actually read.*

**Milestone 4 — Authorization and change**
`rbac` → `change` → `trace`
*(All visual work belongs to the mockup plugin.)*

---

## 18. Acceptance Checklist

- [ ] Open a fresh session and run the status command — the agent reports progress, blockers, and the next step
- [ ] Delete `requirements.json` and run the function command — the plugin halts and reports; it does not infer and continue
- [ ] Ask which requirement produced SCR-007 — answered from trace data, not inference
- [ ] Create a screen tracing to no REQ, then run check — V2 must fail
- [ ] Write an NFR reading "the system must be fast", then run check — V9 must fail
- [ ] Supply a change-set modifying one REQ — every affected artifact across the graph is identified and status does not return 0
- [ ] Run the same command twice — no duplicate IDs, no duplicated content
- [ ] Export — all §11 sections present including the RTM
- [ ] Edit text in the exported file and re-export — the edit disappears (proving JSON is the source of truth)
- [ ] Explain which files are JSON, which are Markdown, and **why**
- [ ] Explain which files belong in `wiki/`, which in `docs/design/`, and **why**
- [ ] Have an agent edit a file whose `owner` is not design — the pre-commit hook must reject it
- [ ] Move a wiki file to another folder and update the index — links from other documents still resolve (proving ID-based linking)
- [ ] Run the sitemap command before the rbac command — it must halt rather than create unbound screens
- [ ] Write a permission entry omitting `scope` — V25 must fail
- [ ] Write a permission entry enforced only at the `ui` layer — V26 must fail
- [ ] Ask what a given role may do and whose data it may see — answered across all four dimensions

### 18.1 Cold Start Test

> Close every session. Reopen with nothing but files on disk and no chat history. Ask five questions.

| # | Question | Must be answered from | Failure indicates |
|---|---|---|---|
| 1 | What is done, what is blocked? | `design.state.json` | L4 |
| 2 | Which requirement produced SCR-007, is it built, do its tests pass? | Merged trace across three plugins | L1, L2 |
| 3 | Why was this designed this way? | ADRs in `wiki/adr/` | L4 |
| 4 | If REQ-012 changes now, what is affected? | Graph reaching SRC and TC | L2 |
| 5 | What open questions await the client? | `journal/questions.jsonl` | L3 |

**Five out of five means nothing was lost.** Any failure points to the corresponding leak in §19.1.

---

## 19. Cross-Plugin Continuity

**Analogy — the nursing shift handover.** The patient does not disappear and the chart is intact. What is lost at every handover is *what the previous shift noticed but did not write down*. A good handover process does not mean information survives; it means we successfully forced people to record it before leaving.

### 19.1 Five Leaks

| ID | Leak | Symptom | Mitigation |
|---|---|---|---|
| L1 | Two plugins writing one file | `qa` records results into a scenario file owned by `design`; design regenerates → **the entire test result set vanishes silently** | W1 extended to JSON + split by author (§19.2) |
| L2 | Trace graph terminates at design | Cannot answer which code came from which requirement; change propagation never reaches dev or qa | Add `SRC`, `TC`, `MCK` nodes (§6.1) |
| L3 | One-way flow with no return path | `dev` discovers the spec is unbuildable, decides something, and the knowledge dies in that session | Append-only back-channel (§19.3) |
| L4 | Conversational content | The user says "yes, do it that way", the agent understands but persists nothing → lost when the session closes | Persist-before-answer (§19.4) |
| L5 | Humans editing generated artifacts | Someone edits mockup HTML; the next regeneration overwrites it | Declare generated artifacts and warn in-file |

L4 is the most common loss in practice and the hardest for prompting alone to prevent.

### 19.2 Split by Author, Join by ID

```
design/scenarios.json           owner: design   ← scenario definitions
qa/scenario-results.json        owner: qa       ← pass/fail + verify commands
dev/implementation-map.json     owner: dev      ← FN/SCR/API → real code files
mockup/mockup-map.json          owner: mockup   ← SCR → mockup files
```

**Rule:** no JSON file may be written by two plugins, **even for disjoint fields**, because regeneration always rewrites the whole file.

If unavoidable, fall back to a pre-commit hook restricting field-level writes (e.g. qa may modify only `passes`) — but splitting files is simpler and safer, so treat field-level locking as a last resort.

### 19.3 Append-Only Back-Channel

```
.aeon/journal/
├── decisions.jsonl     # any plugin may append; nothing may be deleted or edited
└── questions.jsonl     # unanswerable questions routed upstream
```

```jsonl
{"ts":"2026-08-18T10:22:00Z","by":"dev","type":"decision","refs":["FN-004"],"text":"spec requires realtime calculation but source data arrives in batch; computed at import instead","impact":"NFR-002 needs review"}
{"ts":"2026-08-18T10:25:00Z","by":"dev","type":"question","refs":["REQ-012"],"text":"does the credit limit include closed contracts?","blocks":["FN-004"]}
```

JSONL is used because appends can never overwrite prior entries and merge conflicts are rare.

**Return flow:** questions authored by a plugin other than `req` MUST be picked up by req commands for client clarification, and the design status command MUST NOT return 0 while any question with a non-empty `blocks` array remains open.

### 19.4 Persist-Before-Answer

> An agent MUST NOT reply "understood" / "noted" / "I'll do that" before writing the corresponding record to disk.

This MUST be a DoD on every command, not a prompt suggestion, because it is a behavior LLMs violate by default.

### 19.5 What Will Be Lost Anyway

Tone and conversational context — "this client cares more about speed than polish" — is lost unless converted into a measurable `NFR` or a reasoned `ADR`.

**The remedy is not retaining chat logs. It is forcing conversion into an artifact before the command completes.**

---

## Appendix A: Glossary

| Term | Meaning in this context |
|---|---|
| Artifact | A produced file with a referenceable ID |
| Contract | An inter-plugin file format guarantee that will not break without notice |
| DoD (Definition of Done) | A script-verifiable condition that a step is genuinely complete |
| RTM | Requirements traceability matrix — REQ ↔ function ↔ test |
| Stale | An artifact whose upstream requirement changed but which has not been revised |
| Surface | The channel through which users reach the system (web / mobile / api) |
| Ubiquitous Language | One vocabulary shared across documents, code, and client conversation |
| Owner (of a file) | The single plugin permitted to write it, declared in front-matter rather than by folder |
| Project wiki / Global wiki | Project-specific knowledge versus cross-project reusable knowledge (agents cannot write the global tier) |
| Merged view | A trace graph assembled at read time from several plugins' files — it has no on-disk existence and therefore cannot be overwritten |
| Back-channel | The append-only path by which downstream plugins send decisions and questions upstream |
| Cold Start Test | Verifying that a fresh session with no chat history can still answer the critical questions |
| Scope (data scope) | The extent of data a role may reach — all / own branch / own creations |
| Enforcement layer | Where a permission is actually enforced — ui / api / domain / db |
| Default deny | Anything not explicitly permitted is forbidden |
