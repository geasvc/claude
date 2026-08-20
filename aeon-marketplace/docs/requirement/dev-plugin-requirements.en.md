# Dev Plugin — Requirement Specification (Agent Edition)

> **Status:** Draft v0.1
> **Requirement owner:** User
> **Audience:** AI agents. A parallel Thai edition exists for human readers. **All identifiers (G, P, DV, DD, PN) are shared across both editions.**
> **Read alongside:** Design Plugin Spec §3, §6, §19
> **Keywords:** MUST / MUST NOT / SHOULD / MAY carry RFC-2119 meaning.

---

## 0. Summary

The Dev Plugin converts design specifications into running code **while preserving traceability back to the original requirements**.

**Analogy — the site foreman.** A foreman receives drawings from the architect and must:

- Determine which trades the job requires — electrical, plumbing, concrete (this is skill selection)
- Lay out the site before work begins — where materials go (this is file structure)
- Run utilities before construction (this is database, cache, queue, Docker)
- Break work into *inspectable* work orders — not "build the bathroom" but "install this fixture, verified by a pressure test"
- Ensure every work order points back to a drawing page, so that when the architect revises, everyone knows what must be torn out

**The objective is not "AI can write code" — it already can. The objective is that the code it writes is traceable and resumable.**

---

## 1. Goals and Non-Goals

### 1.1 Goals

| ID | Goal | Measure |
|---|---|---|
| G1 | Consume design specs without re-asking what design already answered | No question whose answer exists in a design artifact |
| G2 | Support multiple frameworks within one project (.NET / Vue / Next.js / others) | A project with a .NET API and a Next.js web app works in one structure |
| G3 | Select the correct skill for the stack without guessing | Every skill selection has a recorded justification |
| G4 | Declare and enforce file structure | Files on disk match the declared layout |
| G5 | Every code file traces to its originating requirement | Can answer which REQ produced a given class |
| G6 | Full dependency set runs under Docker for testing | `compose up` brings the system up completely |
| G7 | Work continues across sessions | Reopening reveals which task was in progress |
| G8 | Hand off to QA without information loss | qa knows what to test, in which file, with which command |

### 1.2 Non-Goals

- MUST NOT elicit requirements (owned by `req`)
- MUST NOT design the system — if the spec is incomplete, ask back; do not design the gap
- MUST NOT run full test suites or judge quality (owned by `qa`); dev runs only task-level verification
- MUST NOT deploy to production
- MUST NOT perform UI/UX design — consume mockups and convert them
- MUST NOT manage real infrastructure (VPS, DNS, TLS) — scope ends at Docker Compose for testing

---

## 2. Actors

| Actor | Needs |
|---|---|
| Developer (human) | Assign work, review work, edit code without being overwritten |
| AI Agent (dev) | Know the current task, the correct skill, and where files belong |
| AI Agent (qa) | Know which code satisfies which scenario and how to run tests |
| AI Agent (design) | Receive feedback where the spec proved unbuildable |
| Reviewer / client | See whether a requested feature is built and where it lives |

---

## 3. Marketplace Position and Contracts

```
req ──▶ design ──┬──▶ mockup ──┐
                 │             ▼
                 └───────────▶ dev ──▶ qa ──▶ deliver
                 ▲                      │
                 └──── back-channel ────┘
```

### 3.1 Inbound Contract

| Must be readable | Purpose | Required |
|---|---|---|
| Functions and use cases | Task decomposition | Mandatory |
| Data model + aggregate invariants | Entities and migrations | Mandatory |
| Screens with fields and actions | UI construction | Mandatory if UI exists |
| API contracts and external integrations | Endpoints and clients | Mandatory if APIs exist |
| State machines | Enforcing transitions in the domain | Mandatory if present |
| Permission matrix | Authorization enforcement | Mandatory |
| Test scenarios | Guidance for verification commands | Mandatory |
| Mockups + theme tokens + component inventory | UI implementation (see design spec §12.7) | If present |
| Design trace graph | Basis for appending dev edges | Mandatory |

**Hard rule:** if a mandatory input is missing, the plugin MUST halt and open a question back to design. It MUST NOT design the gap itself.
Code written from an agent-invented spec is debt nobody knows exists.

### 3.2 Outbound Contract

| Consumer | Must receive |
|---|---|
| `qa` | Mapping from scenario ↔ code file ↔ test command; how to bring the system up under Docker; seed data structure |
| `deliver` | Progress against requirements; what is built, what is not, what was built differently from spec |
| `design` | Questions and decisions arising during implementation (back-channel) |

### 3.3 Compatibility Rules

Identical to the design plugin: `schemaVersion` on every file; additive changes only without a major bump; an `extensions` object on every record; readers tolerate unknown fields.

---

## 4. Design Principles

| # | Principle | Rationale |
|---|---|---|
| P1 | **JSON for machine-decided state; Markdown for human- and AI-readable knowledge** | Inherited from the design plugin |
| P2 | **Code is the source of truth for behavior; the spec is the source of truth for intent** | Unlike design where JSON reigns, here code and spec can diverge — drift detection is therefore mandatory |
| P3 | **Never overwrite code a human edited** | The hardest requirement in this plugin (§7.3) |
| P4 | **Never guess the stack, the skill, or the spec — ask, then remember** | Projects differ; one wrong guess forces a full restructure |
| P5 | **Completion is determined by an executed command, never by an agent's claim** | Inherited |
| P6 | **Ask once, remember for the life of the project** | Re-asking the stack every session makes the plugin unusable in practice |
| P7 | **One file, one owner — applies to JSON** | dev MUST NOT write files owned by design or qa |
| P8 | **Avoid premature abstraction** | Use existing skills before building a template engine |
| P9 | **Every code file gets its trace edge at creation time, not retroactively** | Retroactive tracing does not happen |

---

## 5. Artifacts Owned by Dev

> Ownership and purpose only; paths are an implementation concern.

| Artifact | Form | Purpose |
|---|---|---|
| Tech Profile | JSON | Stack, framework, versions, server, database, supplementary dependencies |
| Skill Routing Map | JSON | Condition → required skill |
| Layout Contract | JSON + Markdown | Declared folder structure and its rationale |
| Task List | JSON | Tasks derived from spec with trace / dod / verify / status |
| Implementation Map | JSON | Design artifact → real code files (`SRC-###`) |
| Trace (dev) | JSON | Edges appended by dev only |
| Runtime Dependency Map | JSON | Dependency → Docker service + environment variables |
| Dev Journal | JSONL (append-only) | Decisions and questions arising during implementation |
| Dev Notes / ADR | Markdown in wiki | Architectural rationale humans must read |

**Dev MUST NOT write:** design artifacts (specs, scenarios), qa artifacts (test results), the global wiki.

---

## 6. Tech Profile and Skill Routing

### 6.1 The Tech Profile Is Per-Component, Not Per-Project

**Failure to prevent now:** a single project may hold several stacks — a .NET API, a Next.js web app, a MAUI mobile client. A single-valued per-project profile must be torn out the moment the second real project appears.

```json
{
  "schemaVersion": "1.0",
  "components": [
    {
      "id": "CMP-api",
      "kind": "api",
      "language": "csharp",
      "framework": "aspnetcore",
      "version": "8.0",
      "orm": "efcore",
      "skills": ["dotnet-dev"],
      "confirmedBy": "user",
      "confirmedAt": "2026-08-18T09:00:00Z"
    },
    {
      "id": "CMP-web",
      "kind": "web",
      "framework": "nextjs",
      "version": "15",
      "skills": ["vercel-best-practice", "frontend-design"],
      "confirmedBy": "user"
    }
  ],
  "runtime": {
    "database": { "engine": "postgresql", "version": "16" },
    "cache": { "engine": "redis" },
    "queue": { "engine": "rabbitmq" },
    "others": []
  }
}
```

### 6.2 Acquisition Rules

1. Initialization MUST ask the user. It MUST NOT scan code and infer silently.
2. If code already exists, the plugin SHOULD inspect it and **propose** a profile, then wait for confirmation.
3. Every component MUST carry `confirmedBy`. Unconfirmed components MUST NOT be used for work.
4. On confirmation, **persist before replying**, then never ask again.
5. Stack changes mid-project are permitted only through a dedicated command, and MUST be recorded in the journal with rationale.

### 6.3 Skill Routing

A condition → skill table that MUST be editable and MUST have explicit precedence.

| Condition | Skill |
|---|---|
| Component is .NET / ASP.NET Core | `dotnet-dev` |
| Component is Next.js | The Next.js / Vercel best-practice skill |
| Work touches UI, HTML, or components | `frontend-design` |
| Work produces client documents | The document-generation skill |
| No condition matches | **Ask the user. Do not guess. Do not proceed unaided.** |

**Binding rules**

- Routing MUST evaluate **both the component and the nature of the work**, because one task may require two skills (e.g. a Razor page in .NET requires both `dotnet-dev` and `frontend-design`).
- Every skill selection MUST record which condition triggered it, so past output can be explained.
- If a required skill is not installed, the plugin MUST report and halt. It MUST NOT proceed while implying the skill was used.
- The user may override at any time, and overrides MUST be remembered.

---

## 7. File Structure and Layout Contract

### 7.1 Layout Is Declared, Not Emergent

Before the first file is created, a declared layout MUST exist specifying at minimum:

- Where each component lives
- How layers are divided within a component (e.g. domain / application / infrastructure / presentation)
- How design bounded contexts or modules map to folders
- Where shared code between components lives
- Where tests live
- Where Docker files live

**The layout MUST be derived from the design's bounded contexts, not invented.** When the folder structure diverges from the domain structure, readers can never locate an entity.

### 7.2 Docker Layout (as specified)

- Compose files live in a `docker` folder at repository root.
- Dockerfiles live under each component's project (web / api), not consolidated at root.

**Caveat that MUST be stated in the spec up front:** although Dockerfiles sit under each project, the build context frequently must be the repository root because of shared code. Compose therefore MUST specify `context` and `dockerfile` as distinct values rather than pointing both at one location. Without this note, learners hit build failures and "fix" them by breaking the agreed layout.

### 7.3 Drift Detection and Coexistence with Human-Written Code

**This is the hardest part of this plugin and the failure mode that causes immediate user abandonment.**

| Problem | Required capability |
|---|---|
| Agent creates duplicate files in the wrong place | Compare real layout against declared layout and report the difference |
| Agent overwrites human-edited code | Distinguish generated content from human-authored content, and protect the latter |
| Files moved or deleted, leaving trace edges dangling | Verify recorded paths still exist; flag for review when they do not |

**Minimum v1 requirement:** before overwriting any existing file, compare it against the previous generated state. If it differs, a human has edited it — halt and ask. Do not overwrite.

---

## 8. Runtime Dependencies and Docker

### 8.1 Determining What the System Depends On

Read design's external integrations plus user-supplied information, and produce a complete list: which database, which cache, which message queue, which storage, and any additional services.

**Not stated in the source brief but mandatory:** every dependency MUST arrive with a **configuration contract** — environment variable names, default values, which values are secret.
Without this, Compose only works on the authoring machine and fails everywhere else.

### 8.2 Requirements for the Generated Compose

- MUST bring the whole system up with a single command
- MUST verify each service is genuinely ready, not merely that a container started (starting the API before the database is ready is the classic failure)
- MUST separate secrets from committable files, and provide an example file others can follow
- MUST provide a way to reset data to a known initial state, because QA depends on it
- Dependencies declared in the tech profile and services present in Compose MUST match **bidirectionally** — missing or extra is a failure

---

## 9. Task Decomposition and the Agent Loop

### 9.1 Tasks Must Be Inspectable, Not Descriptive

Every task MUST carry: the work to be done, a trace to design artifacts, an explicit definition of done (named tests that must pass), **a command that produces a real result**, status, attempt count, and blockers.

```json
{
  "id": "TSK-014",
  "title": "Enforce credit limit rule on loan application creation",
  "component": "CMP-api",
  "trace": ["REQ-012", "FN-004", "RULE-014"],
  "dod": ["LoanApplicationTests.RejectsWhenExceedsCreditLimit"],
  "verify": "dotnet test --filter FullyQualifiedName~LoanApplicationTests",
  "status": "in_progress",
  "attempts": 1,
  "blocked_by": []
}
```

**Rule:** a task without an executable `verify` MUST NOT be transitioned to done, regardless of how correct the code appears.

### 9.2 Loop Exit Conditions

- Progress MUST be determined by a deterministic script, never by agent self-assessment.
- The system MUST always be able to name the next task.
- Exceeding the attempt threshold on one task MUST transition it to blocked and wait for a human. Do not continue looping.
- Skipping a blocked task to work on another MUST NOT happen silently; it MUST be reported.

---

## 10. Traceability Added by Dev

Dev owns `SRC-###` nodes (files, classes, modules) and appends edges only. It MUST NOT modify design or qa edges.

```
FN / SCR / API / RULE ──implementedBy──▶ SRC
SRC ──belongsTo──▶ CMP (component)
TSK ──produces──▶ SRC
```

**Queries that MUST be answerable once dev exists**

1. Which requirement produced this class?
2. Is this requirement built, and in which file?
3. If this requirement changes, how many files must change?
4. Which code files trace to no spec at all?
5. Which specs have no code yet?

Question 4 is the detector for work performed beyond the spec — the usual cause of silent scope growth.

---

## 11. Ingesting Changes from Design

When design reports a change, dev MUST:

1. Walk the graph to find tasks and code files bound to the changed artifacts
2. Mark them stale, recording why
3. Report the impact quantitatively so a human can decide — how many tasks, how many files
4. **MUST NOT auto-modify code immediately.** A human must approve whether to follow the change or push back
5. Treat work as incomplete while any stale item remains

---

## 12. Validation Rules

| ID | Rule | Severity |
|---|---|---|
| DV1 | Every function / screen / API in the spec has code, or a recorded reason why not | Error |
| DV2 | Every primary code file traces to a spec (no orphan code) | Error |
| DV3 | Every tech profile component is user-confirmed, not agent-inferred | Error |
| DV4 | Every unit of work records which skill was used and which condition selected it | Error |
| DV5 | The real folder structure matches the declared layout | Error |
| DV6 | Every task has an executable verification command | Error |
| DV7 | Tech profile dependencies and Docker services match bidirectionally | Error |
| DV8 | No secrets embedded in code; every configuration value has a followable example | Error |
| DV9 | Docker files reside in their agreed locations | Error |
| DV10 | Implemented APIs match the design contract (names, parameters, response shapes) | Error |
| DV11 | Domain invariants are enforced in the domain layer, not only in the UI | Error |
| DV12 | No task is marked done while its verification command fails | Error |
| DV13 | No stale items remain | Error |
| DV14 | The system builds, and Docker brings up every service | Error |
| DV15 | Dev has not written files owned by another plugin | Error |
| DV16 | Every permission-controlled screen enforces authorization server-side, not by hiding buttons | Error |

DV11 and DV16 are the two most frequent AI failures, because both "appear to work" under manual testing.

---

## 13. Cross-Session and Cross-Plugin Continuity

Inherits all mechanisms from design plugin §19, plus dev-specific concerns.

| Leak | Dev-specific symptom | Required mitigation |
|---|---|---|
| Re-asking the stack | New session asks which .NET version again | Tech profile MUST be read before any work begins |
| Forgetting rationale | Next round reverts to an approach already tried and rejected | Every deviation from spec MUST record its reason |
| Human-edited code lost | Agent regenerates over it | MUST compare before overwriting |
| QA results lost | Dev regenerates a file where qa recorded results | One file, one owner |
| Implementation knowledge dies in-session | Dev finds the spec unbuildable, works around it, nobody learns | Back-channel to design |

**Persist-before-answer applies to dev:** MUST NOT reply "understood, I'll use PostgreSQL" before writing that to disk.

---

## 14. Supporting Stacks and Plugins That Do Not Exist Yet

| Mechanism | Detail |
|---|---|
| New framework | Added by extending the routing table; no core changes |
| New skill | Declare a condition and it becomes usable |
| New plugin | Every artifact reserves space for attached data without touching the shared schema |
| Write-permission enforcement | Commit-time hooks, not prompt instructions |

**Design quality test:** adding Vue support MUST require touching only the routing table and tech profile. If task decomposition or the trace system must change, the design is over-coupled to specific frameworks.

---

## 15. Plugin Constraints

| ID | Requirement |
|---|---|
| PN1 | No additional paid external services beyond those already in use |
| PN2 | No special infrastructure; runs on a standard learner machine |
| PN3 | Bounded context consumption — navigate via index; never sweep the whole repository |
| PN4 | Comprehensible within one hour |
| PN5 | Works both on greenfield projects and on projects with existing code |
| PN6 | Every completion condition binds to an executable command |

PN5 matters more than it appears: most real work is continuation of an existing codebase, not a fresh start.

---

## 16. Open Decisions

| ID | Issue | Why it matters |
|---|---|---|
| DD1 | **Who writes unit tests — dev or qa?** | design produces scenarios, qa produces test cases; unit tests belong to neither by default. Undecided means both duplication and gaps |
| DD2 | **Who owns database migrations?** | Agents generating migrations freely will collide as soon as two people work in parallel |
| DD3 | **How much is generated versus hand-written?** | Generate everything and human work is overwritten; generate nothing and the plugin adds no value |
| DD4 | **Can multiple people or agents work simultaneously?** | Determines how task lists and trace files collide, and whether branching is required |
| DD5 | **Who creates seed and test data?** | QA needs it, but it requires data-structure knowledge held by dev |
| DD6 | **Coding standards, formatting, linting** | Without them each round produces a different style and diffs become unreadable |
| DD7 | **Is authentication/authorization dev's responsibility or does it need its own home?** | It is cross-cutting and spread across every component |
| DD8 | **API versioning** | Deciding late means overwriting existing endpoints and breaking consumers |
| DD9 | **Logging and observability** | Absent from the brief, but QA and root-cause analysis require it |
| DD10 | **Error handling and error codes** | Must match design's catalogue, which design has not yet decided either |
| DD11 | **Monorepo or multiple repositories** | Directly affects folder layout and Docker build context |
| DD12 | **Which performance criteria dev is accountable for** | Design specifies numbers; nobody has assigned who measures them and when |
| DD13 | **What happens when a required skill is unavailable?** | Halt, or proceed without it and warn |
| DD14 | **Where does code shared between components live?** | Affects both layout and build context |
| DD15 | **File upload and storage handling** | Reliably surfaces mid-project |

DD1 and DD3 SHOULD be decided before the others, as both determine the shape of the entire task list.

---

## 17. Build Order

**Milestone 1 — Know the project**
Initialize → ask and remember the tech profile → route skills correctly → report status
*Proves the plugin asks once, remembers, and never guesses.*

**Milestone 2 — Decompose and execute**
Declare layout → derive tasks from spec → execute tasks with verification
*Proves completion is determined by commands, not by agent claims.*

**Milestone 3 — Bring the system up**
Resolve dependencies → generate Docker → bring everything up
*Proves it runs on someone else's machine, not only the author's.*

**Milestone 4 — Connect to the others**
Complete trace edges → ingest design changes → hand off to qa → send feedback upstream

---

## 18. Acceptance Checklist

- [ ] Start a new project — the plugin asks about the stack rather than guessing
- [ ] Answer the stack question, close, reopen — it does not ask again
- [ ] Assign work touching a web page — the frontend skill is invoked alongside the backend skill
- [ ] Assign work on a stack absent from the routing table — the plugin halts and asks rather than improvising
- [ ] Hand-edit a code file, then re-run the same task — the edit survives
- [ ] Move a file away from the declared layout and run check — the drift is detected
- [ ] Ask which requirement produced a given class — answered from recorded data, not inferred by reading code
- [ ] Add Redis to the tech profile but omit it from Docker — validation must fail
- [ ] Bring the system up with a single command on a machine that has never run it — everything comes up
- [ ] Change one upstream requirement — affected tasks and files are identified, and code is not auto-modified
- [ ] Mark a task done while its verification command fails — the system must refuse
- [ ] Add support for one new framework — only the routing table changes; the core is untouched

### 18.1 Cold Start Test

Close everything. Reopen with only files on disk. Ask:

1. Which stacks does this project use, and who confirmed them?
2. Which task is in progress, and what is blocked?
3. Is this feature built, in which file, from which requirement?
4. Why was this implemented differently from the spec?
5. Which questions must go back to design or the client?

Five out of five with no additional explanation means the plugin is usable in practice.

---

## Appendix: Dev-Specific Glossary

| Term | Meaning |
|---|---|
| Component | A unit with its own stack — API, Web, Mobile. One project may hold several |
| Tech Profile | The record of what each component uses and when the user confirmed it |
| Skill Routing | The rules mapping conditions to required skills |
| Layout Contract | A pre-declared folder structure used to validate reality |
| Drift | Divergence between what exists and what was declared |
| Verify | A command whose execution establishes whether the work is genuinely done |
| Back-channel | The path carrying decisions and questions back upstream |
