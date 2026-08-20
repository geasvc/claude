# QA Plugin — Requirement Specification (Agent Edition)

> **Status:** Draft v0.1
> **Requirement owner:** User
> **Audience:** AI agents. A parallel Thai edition exists for human readers. **All identifiers (G, P, QV, QD, PN) are shared across both editions.**
> **Read alongside:** Design Plugin Spec §3, §6, §19 and Dev Plugin Spec §9, §10, §16
> **Note on scope:** the source brief was headed "qa plugin for screen design", which appears to be carried over from the design plugin document. This specification interprets the scope as **system testing**, consistent with every detail that followed.
> **Keywords:** MUST / MUST NOT / SHOULD / MAY carry RFC-2119 meaning.

---

## 0. Summary

The QA Plugin **proves that what was built matches what the client asked for — with evidence that can be re-verified.**

**Analogy — building inspection.**

- The inspector does not wander and form impressions. They carry a checklist **derived from the drawings**. If the drawing calls for three outlets, the checklist has three items.
- Every inspected point is **photographed as evidence**, and each photo must identify which room, which point, which inspection round — not dumped into one folder to be sorted out later.
- Each round produces **its own inspection record**: how many items passed initially, how many passed after remediation, so rounds can be compared.
- Most importantly: **the inspector is not the builder.** A builder who inspects their own work and declares it sound has produced a worthless record.

That last point is why QA MUST be the sole owner of test results, and why pass/fail verdicts MUST come from executable commands rather than AI judgment.

---

## 1. Goals and Non-Goals

### 1.1 Goals

| ID | Goal | Measure |
|---|---|---|
| G1 | Convert design scenarios into executable test suites | Every scenario has a runnable test case |
| G2 | Answer immediately what a given screen must be tested for, with what data, in which workflow | Answerable without human explanation |
| G3 | Know which requirement, spec, and code each test derives from | Answerable in both directions |
| G4 | Execute tests while capturing categorized visual evidence | Opening the folder reveals what each image shows and from which round |
| G5 | Produce test reports scoped as requested (system / module / screen) | Report includes results and requirement coverage |
| G6 | Provide test history and round-over-round comparison | Answers whether this round improved or regressed |
| G7 | Support multiple stacks and multiple testing tools | .NET / Next.js / Python and user-selected tools |
| G8 | Identify which tests to re-run when requirements change | Produces a subset without re-running everything |
| G9 | Route findings back to dev or design without loss | Every defect has a destination and is trackable |

### 1.2 Non-Goals

- MUST NOT design the system or independently decide what is business-correct — criteria come from design
- MUST NOT modify system code (may modify only the test code it owns)
- MUST NOT decide whether to release — it reports; humans decide
- MUST NOT perform infrastructure-level load testing or deep penetration testing (scoped out initially; see QD10)
- MUST NOT deploy — use the startup path dev provides

---

## 2. Actors

| Actor | Needs |
|---|---|
| QA / tester (human) | Execute, review results, produce reports, ask what a screen requires |
| Developer | Know which test failed, why, and where |
| Client / acceptance reviewer | A readable report with visual evidence showing which requirements now pass |
| AI Agent (qa) | Know what to test, with which tool, and how to bring the system up |
| AI Agent (design / dev) | Receive defects and questions for correction |

---

## 3. Marketplace Position

```
req ──▶ design ──▶ dev ──▶ qa ──▶ deliver
         ▲                  │
         └──── findings ────┘
```

### 3.1 Inbound Contract

| From | Must be readable | Purpose | Required |
|---|---|---|---|
| design | Test scenarios | Origin of every test case | Mandatory |
| design | Screens with fields and validation | UI tests | Mandatory if UI exists |
| design | API contracts | API tests | Mandatory if APIs exist |
| design | State machines | Workflow tests | Mandatory if present |
| design | Permission matrix | Role-based access tests | Mandatory |
| design | NFRs with numeric targets | NFR tests | Mandatory |
| dev | Spec → code file map | Knowing which code a test covers | Mandatory |
| dev | System startup procedure and configuration | Preparing the test environment | Mandatory |
| dev | Data structure and reset procedure | Preparing and resetting test data | Mandatory |
| req | Objectives and agreed key results | Final acceptance criteria | Recommended |

**Hard rule:** if a scenario lacks an explicit expected result, QA **MUST NOT invent the criterion**. It MUST open a question back to design.
A test whose pass criterion was invented by the tester proves only that the system matches the tester's assumption.

### 3.2 Outbound Contract

| Consumer | Must receive |
|---|---|
| `deliver` | Requirement coverage, latest round results, outstanding failures, visual evidence |
| `dev` | Defects with reproduction steps, images, logs, and related code locations |
| `design` | Points where the spec is ambiguous, untestable, or self-contradictory |

---

## 4. Design Principles

| # | Principle | Rationale |
|---|---|---|
| P1 | **Pass/fail verdicts MUST come from executed commands, never from an AI's assessment that something looks fine** | An LLM verdict is an opinion, not a test |
| P2 | **Every test traces three ways — to requirement, to spec, and to code** | A test that cannot justify its own existence eventually gets deleted |
| P3 | **QA is the sole owner of test results; no other plugin may write them** | A builder certifying their own work produces a worthless record |
| P4 | **Tests MUST be repeatable and order-independent** | Unstable tests destroy trust faster than having no tests at all |
| P5 | **Separate gate tests from exploratory tests** | Agentic tools excel at finding the unanticipated but cannot serve as verdicts (§6.3) |
| P6 | **Evidence MUST be captured systematically at the moment it is produced** | An image that cannot identify itself is storage-consuming waste |
| P7 | **Never guess criteria, data, or tooling — ask, then remember** | Inherited from the dev plugin |
| P8 | **One file, one owner — applies to JSON** | QA is the most exposed to this failure; results vanish easily |
| P9 | **The coverage that matters is requirement coverage, not line coverage** | High code coverage with incomplete requirement coverage is self-deception |

---

## 5. Artifacts Owned by QA

| Artifact | Form | Purpose |
|---|---|---|
| Test Tool Profile | JSON | Per-component stack → selected tool + rationale |
| Test Case | JSON | Tests with trace, type, steps, pass criteria, run command |
| Test Data Set | JSON + data files | Initial data per case |
| Test Run | JSON | One execution round — when, what, results, environment |
| Evidence Index | JSON | Registry binding images / video / logs to test cases and runs |
| Finding | JSON | Defects with routing destination |
| Trace (qa) | JSON | Edges appended by qa only |
| Test Report | Markdown → document | Reports scoped as requested |
| QA Journal | JSONL (append-only) | Questions and decisions during testing |
| Test Project | Code | The actual test project — owned by QA, not dev |

**QA MUST NOT write:** design scenarios, dev system code, the dev tech profile.

---

## 6. Test Types and Tool Selection

### 6.1 Test Layers and Ownership

> Decide this before anything else — it is the seam where dev and qa most easily overlap.

| Layer | Tests what | Proposed owner | Source |
|---|---|---|---|
| Unit | Domain logic and invariants | dev (written alongside code) | Business rules from design |
| Integration | Modules communicating, real database access | dev or qa (see QD1) | API contracts |
| API / Contract | Endpoints match the contract | **qa** | Design API contracts |
| UI / E2E | Users can complete real journeys | **qa** | Scenarios + screens |
| Workflow | State transitions follow the machine, on both happy and error paths | **qa** | State machines |
| Permission | Roles can access what the matrix allows and, critically, **cannot access what it forbids** | **qa** | Permission matrix |
| NFR | Response time and throughput against stated numbers | **qa** | Non-functional requirements |
| Exploratory | Finding what nobody anticipated | **qa** (agentic) | No fixed source |

**Commonly omitted:** permission testing MUST prove the *negative* case — not merely that a manager can open a screen, but that an ordinary employee calling the API directly is genuinely rejected. Hiding a button is not access control.

### 6.2 Tool Selection

A condition → tool table analogous to dev's skill routing.

| Condition | Example tool |
|---|---|
| Browser UI testing | Playwright (recommended default) |
| UI testing requiring the user's own browser | An agentic browser-control tool |
| API testing | The stack's native tooling |
| .NET unit / integration | Standard .NET test tooling |
| Python | Standard Python test tooling |
| No condition matches | **Ask the user. Do not guess.** |

Same rules as dev: ask once, persist before replying, never re-ask, user override permitted, every selection records its rationale.

### 6.3 Gate Tests versus Exploratory Tests

**The source brief does not distinguish these. Failing to separate them is guaranteed to cause problems.**

| | Gate test | Exploratory test |
|---|---|---|
| Output | Pass / fail | A list of observations |
| Stability | MUST be identical every run | Inherently unstable |
| Tooling | Scripts with fixed steps | Agents deciding as they go |
| Usable for release decisions | **Yes** | **No** |
| Permitted effect | Updates test case status | Creates findings for human review |

Letting an AI open a browser and conclude "this page works fine" is valuable for surfacing the unanticipated, but cannot serve as a verdict, because two runs may disagree. If such a tool is permitted to set status to "passed", the entire system becomes untrustworthy immediately.

---

## 7. Answering User Questions

The brief requires answering "what does this screen test, what data does it use, which workflows are involved".

This is not a separate feature — it is **a consequence of complete traceability**. With correct linking, these questions answer themselves without special logic.

Questions that MUST be answerable:

1. Which tests exist for this screen, of what type, at what current status?
2. Which test data does this screen require, and what must be prepared first?
3. Which workflow does this screen participate in, and at which step?
4. Which requirement and scenario produced this test, and which code files does it touch?
5. Is this requirement fully tested? If not, what is missing?
6. If this code file changes, which tests must be re-run?
7. How many times has this test failed in the last ten rounds? (flakiness detection)

Question 6 is the ultimate payoff of the entire traceability effort. Question 7 is what prevents a team from sliding into "just run it again, it'll pass".

---

## 8. Execution and Evidence

### 8.1 Execution

- Scope MUST be selectable: whole system / module / screen / single test / previously failing / affected by the latest change
- Before running, the system MUST be brought up using dev's procedure, and readiness MUST be verified before starting
- Data MUST be reset to a known state before each round
- Every run MUST record which code version and which environment it ran against — results that cannot be attributed to a code version cannot be compared across rounds

### 8.2 Visual Evidence

Per the brief: stored under the QA folder, categorized.

**Requirements**

- File name or location alone MUST identify the test, the round, the step, and the outcome, without opening the registry
- MUST be separable by at least: run, module/screen, and outcome (pass/fail)
- Failing tests MUST capture more than passing ones — the state before, the state at failure, logs, and the data state at that moment
- A central registry MUST bind every image to its test case and run

**Two gaps in the source brief that will cause problems**

*First — retention policy.* E2E images consume space rapidly. Running several rounds daily and retaining everything indefinitely makes the repository unusable within weeks. Decide upfront how long passing-round evidence is kept versus failing-round evidence (failures normally warrant longer retention).

*Second — personal data in images.* Testing with realistic data makes every screenshot personal data, already committed to the repository. Decide whether to use purely synthetic data or to mask before capture.

---

## 9. Test History

Each run MUST be a first-class record, not console output that disappears.

Each run MUST record: when it ran, who or what triggered it, the scope, the code version, the environment, per-test results, duration, and captured evidence.

**History MUST answer**

- Compared with the previous round, what improved and what regressed?
- When did this test begin failing, and what changed in the code at that point?
- Which tests are unstable (passing sometimes, failing others, with no code change)?
- Is requirement coverage rising or falling?

**Flakiness MUST have an explicit policy** rather than being handled case by case with "just re-run it". The moment a team adopts that habit, the entire suite loses meaning within a month. Unstable tests MUST be flagged and excluded from gate decisions until repaired.

---

## 10. Test Reporting

Scope MUST be selectable per the brief — system, module, or screen.

**Required contents**

- Counts: passed, failed, not yet tested
- **Coverage against requirements**, not merely the number of passing tests — the report MUST identify requirements with no test at all
- Failures with visual evidence and reproduction steps
- Comparison with the previous round
- Unstable tests, listed separately
- The environment and version tested

**Coverage is the most important figure**, because "200 tests, all green" says nothing if half the requirements are untouched.

Two report levels are required: a client-facing one (does what was requested work yet?) and a team-facing one (what broke and where?).

---

## 11. Findings and Routing

A failing test MUST produce a trackable record, not merely red output.

Each finding MUST carry: the test that found it, the originating requirement and spec, reproduction steps, expected versus actual behavior, evidence, severity, and **its routing destination**.

Three destinations, which MUST be distinguished:

| Type | Meaning | Route to |
|---|---|---|
| Code does not match spec | The spec is right; the build is wrong | dev |
| The spec is defective | Ambiguous, self-contradictory, or untestable | design |
| The requirement changed | Built correctly per spec, but not what the client wants | req |

**This distinction is critical.** Teams routinely route everything to dev, and dev adjusts the code to match QA's interpretation — while the real defect lives in the spec. At delivery the system does not match what the client asked for, despite every test being green.

---

## 12. Regression Selection on Change

When a requirement, spec, or code file changes, the system MUST identify which tests need re-running without running everything.

The mechanism is a reverse walk of the trace graph from the changed artifact to bound test cases.

**Caution:** partial selection is double-edged. An incomplete graph means missing tests that should have run, letting defects through.
Therefore: **when confidence in the graph is insufficient, run the full suite** — and run the full suite on a fixed schedule regardless of whether changes occurred.

---

## 13. Traceability Added by QA

QA owns test case, run, evidence, and finding nodes, and appends edges only.

```
SCN ──testedBy──▶ TC
TC ──covers──▶ SRC            (joins the map dev recorded)
TC ──uses──▶ DATA             (test data set)
TC ──executedIn──▶ RUN        (each execution round)
RUN ──produces──▶ EVIDENCE    (images, video, logs)
TC ──found──▶ FINDING ──routedTo──▶ [dev | design | req]
```

With all four plugins in place, the ultimate query becomes answerable:

> **"For this requirement: how was it designed, which code file implements it, which test verifies it, what is the latest result, and what evidence exists?"**

Answering that in a single response means the whole marketplace is working correctly.

---

## 14. Validation Rules

| ID | Rule | Severity |
|---|---|---|
| QV1 | Every design scenario has at least one test case | Error |
| QV2 | Every test case traces to a scenario and a requirement | Error |
| QV3 | Every test case has an executable run command and an explicit pass criterion | Error |
| QV4 | Every requirement has test coverage, or a recorded reason for exclusion | Error |
| QV5 | Every numeric NFR has a test that actually measures that number | Error |
| QV6 | Every role in the permission matrix has both positive and negative tests | Error |
| QV7 | Every state and transition in the state machines is covered | Error |
| QV8 | Every evidence item binds to a test case and a run; no orphan images | Error |
| QV9 | Every run records the code version and environment | Error |
| QV10 | No test case is marked passed without a backing execution | Error |
| QV11 | Agentic tool output MUST NOT change the pass/fail status of a gate test | Error |
| QV12 | Every finding declares its destination — dev, design, or req | Error |
| QV13 | Unstable tests are flagged and excluded from gate decisions | Warning |
| QV14 | Test data contains no real personal data | Error |
| QV15 | A working procedure exists to reset data to its initial state | Error |
| QV16 | QA has not written files owned by another plugin | Error |
| QV17 | No stale items remain after an upstream change | Error |

QV10 and QV11 protect the entire value of this plugin. If either fails, reports become attractive and meaningless.

---

## 15. Cross-Session and Cross-Plugin Continuity

Inherits the mechanisms in design plugin §19, plus QA-specific concerns.

| Leak | QA-specific symptom | Required mitigation |
|---|---|---|
| Results vanish silently | Another plugin regenerates a file where QA recorded results | One file, one owner — QA holds results in its own files |
| History lost | A new round overwrites the previous round's results | Each run MUST be a new record; never overwrite |
| Orphan evidence | Images persist but nothing identifies them | The registry MUST be written with the image, not afterwards |
| Forgotten exclusions | A future round re-enables a skipped test and it fails again | Every exclusion MUST record a reason and an expiry |
| Findings lost in transit | Verbally reported and forgotten | Findings MUST be first-class records with status |

**Persist-before-answer applies to QA:** MUST NOT report results before writing them. Reported-but-unrecorded results are already lost.

---

## 16. Plugin Constraints

| ID | Requirement |
|---|---|
| PN1 | No additional paid external services |
| PN2 | Runs on a standard learner machine |
| PN3 | Navigate via registry and index; never load all result files — history grows quickly |
| PN4 | Comprehensible within one hour |
| PN5 | Works both on projects with no tests and on projects with existing tests |
| PN6 | MUST NOT cause uncontrolled storage growth |

---

## 17. Open Decisions

| ID | Issue | Why it matters |
|---|---|---|
| QD1 | **Do unit and integration tests belong to dev or qa?** | Identical to DD1 in the dev spec — MUST be decided once for both, or expect duplication and gaps simultaneously |
| QD2 | **Where does test code live, and who may edit it?** | If it shares a repository with the system, dev's access must be explicit |
| QD3 | **Evidence retention policy** | How long, and how differently for passing versus failing rounds |
| QD4 | **Synthetic test data or masked real data?** | Directly affects PDPA compliance and whether screenshots may be committed |
| QD5 | **Who produces test data?** | qa consumes it; dev owns the data structures |
| QD6 | **Flakiness criteria and handling** | Without criteria, everyone chooses to re-run until the suite is meaningless |
| QD7 | **When do tests run automatically?** | On every code change, on demand, or on a schedule |
| QD8 | **What is the release pass threshold?** | 100%, or tolerance for low-severity defects — and who decides |
| QD9 | **Multi-browser and multi-viewport testing** | Undecided now means test count explodes later |
| QD10 | **Scope of security and load testing** | Excluded initially, but enterprise clients routinely ask |
| QD11 | **Accessibility testing** | Increasingly mandated for public-sector work; scope must be decided |
| QD12 | **Testing external integrations** | Real systems or simulated? If simulated, who keeps the simulation faithful? |
| QD13 | **Migration and upgrade testing** | Surfaces near delivery with nobody prepared |
| QD14 | **Language of test cases and reports** | Client reports in Thai; test identifiers in code should be English |
| QD15 | **How is necessary manual testing recorded?** | Some things cannot be automated but must still count toward coverage |

QD1 MUST be decided first, as it affects dev and qa simultaneously.

---

## 18. Build Order

**Milestone 1 — Know what must be tested**
Initialize → convert scenarios into traced test cases → answer what a screen must be tested for
*Proves tests are derived from spec, not invented.*

**Milestone 2 — Execute with evidence**
Select tooling → scaffold the test project → run with categorized capture
*Proves results come from execution, not from an AI's expectation.*

**Milestone 3 — History and reporting**
Record each run → compare rounds → produce scoped reports
*Proves cross-round comparison and coverage reporting, not merely a pass count.*

**Milestone 4 — Connect to the others**
Regression selection from changes → route findings → hand off to deliver

---

## 19. Acceptance Checklist

- [ ] Ask "what does this screen test?" — answered completely, covering tests, data, and workflows, from recorded data
- [ ] Leave a scenario without a test and run check — must be detected
- [ ] Leave a requirement with no test at all and generate a report — the report must state incomplete coverage, not display 100% passing
- [ ] Run tests and inspect the evidence folder — names and locations identify test, round, and outcome
- [ ] Run twice — the second run does not overwrite the first, and the two are comparable
- [ ] Have an agent open a browser and declare the page working — test case status MUST NOT become passed
- [ ] Mark a test passed with no execution behind it — the system must refuse
- [ ] Make one test alternate pass/fail — it must be flagged unstable and excluded from gate decisions
- [ ] Change one requirement — the subset of tests requiring re-run is identified without running everything
- [ ] Encounter a defect caused by an ambiguous spec — it must route to design, not dev
- [ ] Permission testing — a test must prove that an unauthorized role calling the API directly is rejected
- [ ] Switch the stack from .NET to Python — only the tool selection table changes; the core is untouched

### 19.1 Cold Start Test

Close everything. Reopen with only files on disk. Ask:

1. Which tools test this project, who chose them, and why?
2. How many pass, fail, and remain untested?
3. Which test covers this requirement, what is its latest result, and what evidence exists?
4. When did this test begin failing?
5. Which findings are outstanding, and with whom?

### 19.2 Final Test of the Whole Marketplace

Once all four plugins exist, ask a single question:

> For this requirement — what did the client ask for, what was designed, which code file implements it, which test verifies it, what is the latest result, and is there visual evidence?

Answering completely in one response, without manual lookup, means the whole system works.

---

## Appendix: QA-Specific Glossary

| Term | Meaning |
|---|---|
| Scenario | Business-level test intent — produced by design |
| Test Case | Executable steps with pass criteria — owned by QA |
| Run | One execution round with the context of what it ran against and when |
| Evidence | Artifacts produced by a run — images, video, logs |
| Finding | A defect with a destination and a status |
| Gate test | A stable test whose result may determine pass or fail |
| Exploratory test | A search for the unanticipated; produces observations, not verdicts |
| Flaky | A test whose result varies without any code change |
| Requirement coverage | The proportion of requirements with test coverage — distinct from code coverage |
