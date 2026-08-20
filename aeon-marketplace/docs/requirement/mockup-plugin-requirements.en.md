# Mockup Plugin — Requirement Specification (Agent Edition)

> **Status:** Draft v0.1
> **Requirement owner:** User
> **Audience:** AI agents. A parallel Thai edition exists for human readers. **All identifiers (G, MP, MV, MD, PN) are shared across both editions.**
> **Read alongside:** Design Plugin Spec (§12 boundary, §6 traceability, §19 continuity)
> **Provenance:** This content previously lived in design plugin §12 with rules V16–V22 and decisions D18–D22. Those numbers are now retired on the design side and MUST NOT be reused.
> **Keywords:** MUST / MUST NOT / SHOULD / MAY carry RFC-2119 meaning.

---

## 0. Summary

The Mockup Plugin **turns a screen inventory into pictures people can reason about, while keeping every picture bound to the spec.**

**Analogy — one house.**

- The **wireframe** is the floor plan: where rooms sit, which way doors open, how many windows. The plan says nothing about wall color.
- The **theme** is the finish specification: colors, materials, typography, spacing.
- The **mockup** is the rendered view = plan + finish.

These two layers MUST stay strictly separate, because **the plan must match the spec while the finish may change at any time.** Mixing them means a brand color change forces full re-verification that every field is still present.

**The objective is not attractive screens. It is that every picture can state which requirement produced it, and how far implementation and testing have progressed.**

---

## 1. Goals and Non-Goals

### 1.1 Goals

| ID | Goal | Measure |
|---|---|---|
| G1 | Ingest a design-tool handoff | Import yields usable tokens and a component inventory |
| G2 | When no handoff exists, ask first and propose a usable prompt | The proposed prompt contains this project's specifics, not generic text |
| G3 | Generate wireframes from the sitemap without touching styling | Wireframes contain no embedded color, font, or size values |
| G4 | Generate HTML from the sitemap using handoff or theme styling | Mockups reference tokens exclusively |
| G5 | Inspect the sitemap and generate a chosen subset | Coverage is reported accurately |
| G6 | Answer which req, which design artifacts, which code, and which tests relate to a page | All four answered in one response |
| G7 | Hand off to dev with normative and reference items distinguished | The package is fully labeled |
| G8 | Provide a help command explaining the workflow | A new user can start without reading the spec |

### 1.2 Non-Goals

- MUST NOT define what fields a screen has or who may access it — that comes from design
- MUST NOT invent a design system or brand — that comes from a handoff or theme template
- MUST NOT produce production code — mockups are visual references
- MUST NOT automatically produce every viewport size (see MD4)
- MUST NOT judge whether a design is aesthetically good

---

## 2. Actors

| Actor | Needs |
|---|---|
| System Analyst / Designer (human) | Generate, select screens, review with the client |
| Client | See the system before it is built, to confirm intent |
| AI Agent (mockup) | Know which screens to build, with which theme, and how to attach trace edges |
| AI Agent (dev) | Know what must be followed exactly versus what is guidance |
| AI Agent (qa) | Know which states each screen must support, as a test set |

---

## 3. Marketplace Position

```
req ──▶ design ──▶ mockup ──▶ dev ──▶ qa ──▶ deliver
         ▲           │
         └── back-channel ──┘
```

### 3.1 Inbound Contract (mockup ← design)

| Must be readable | Purpose | Required |
|---|---|---|
| Sitemap | Which screens exist and their hierarchy | Mandatory |
| Screen detail — fields, validation, actions, destinations | Wireframe content | Mandatory |
| Permission matrix | Which screens need an "unauthorized" state and which fields are hidden from which roles | Mandatory |
| Declared required states per screen | Rendering each state | Mandatory |
| State machines | Understanding screen ordering within a process | Recommended |
| Design trace | Basis for appending mockup edges | Mandatory |

**Hard rule:** if a screen has not passed design's V5 (missing fields, actions, permissions, or state list), the plugin **MUST NOT generate it**. It MUST raise a question through the back-channel.
An attractive picture generated from an incomplete spec is read by the client as agreed, and becomes a commitment nobody intended.

### 3.2 Outbound Contract

| Consumer | Must receive |
|---|---|
| `dev` | Theme tokens, component inventory, mockups, state lists, and the SCR ↔ MCK ↔ REQ map, each labeled normative or reference |
| `qa` | The required-state list per screen, as a UI test set |
| `design` | Points where screen specs are too incomplete to render (back-channel) |

### 3.3 Compatibility Rules

Identical to the other plugins: `schemaVersion` on every file; additive changes only without a major bump; an `extensions` object on every record; readers tolerate unknown fields.

---

## 4. Design Principles

| # | Principle | Rationale |
|---|---|---|
| MP1 | **Strictly separate structure from appearance** | Structure must match the spec; appearance may change at any time |
| MP2 | **Never invent styling** — with no theme, only wireframes are permitted | AI-invented mockups are read by clients as agreed design |
| MP3 | **A mockup is a visual reference, not the source of truth for behavior** | Prevents dev pasting HTML that binds to nothing |
| MP4 | **Ask once, remember for the life of the project** | Inherited from the dev plugin |
| MP5 | **One file, one owner — applies to JSON** | Inherited |
| MP6 | **Every picture gets its trace edge at creation time** | Retroactive tracing does not happen |
| MP7 | **Store the theme separately from mockups from day one** | Themes are cross-project reusable; mockups are always bound to one project's sitemap |
| MP8 | **Avoid premature abstraction** | Do not support multiple output formats until someone asks |

---

## 5. Artifacts Owned by Mockup

| Artifact | Form | Purpose |
|---|---|---|
| Theme | JSON | Design tokens, component inventory, layout rules |
| Theme Decision Log | JSON | Which path the user chose, when, and why |
| Wireframe | Structure files | Unstyled screen structure |
| Mockup | HTML | Wireframe + theme |
| Coverage Map | JSON | Fidelity level of each screen |
| Mockup Map | JSON | SCR ↔ MCK ↔ REQ |
| Trace (mockup) | JSON | Edges appended by mockup only |
| Handoff Package | JSON + files | The dev delivery package with normative/reference labels |
| Mockup Journal | JSONL (append-only) | Questions and decisions |

**Mockup MUST NOT write:** design specs, dev code, qa results.

---

## 6. Theme and Handoff

### 6.1 Resolution Order

When a command requires styling, resolve in this order. Skipping ahead to self-authored styling is prohibited.

1. **A design-tool handoff exists** → import, normalize into tokens, use it.
2. **No handoff** → **MUST ask the user first** whether to produce one with a design tool, and **MUST offer a ready-to-use prompt** (§6.2).
3. **User declines** → offer an existing theme template, or accept a brief written direction.
4. **User has not decided** → only wireframe level is permitted. The agent **MUST NOT** invent colors and fonts to produce HTML provisionally.

The outcome MUST be persisted before replying (persist-before-answer) and MUST NOT be asked again.

### 6.2 The Theme Prompt Must Be Assembled from the Spec

This is what makes the capability worth more than a canned prompt.

The proposed prompt MUST be assembled from data already present in design artifacts, at minimum:

- Business domain and user population
- Real usage conditions — e.g. desktop all day, or mobile while travelling
- **The component list this system actually requires**, derived from all screens: filterable paginated tables, multi-step forms, how many status badges, transaction confirmation dialogs
- Known constraints — Thai script support, high-glare readability, high-contrast mode
- Explicit exclusions

**Payoff:** the returned theme contains every component the system actually needs, rather than an attractive theme missing the exact table variant required.

### 6.3 Handoff Ingestion

Extract and retain:

- **Design tokens** — color, typography, spacing, radius, shadow, and all interaction states
- **Component inventory** — reusable components with their states
- **Layout rules** — grid system, max widths, breakpoints

Validate on import:

| Check | Reason |
|---|---|
| Does the handoff cover every component the system requires? | Gaps must surface now, not at screen 20 |
| Which sitemap screens does the handoff not cover? | MUST be reported, never silently inferred |
| Are there components no screen uses? | Either the sitemap is missing screens or the handoff overshot |
| Are all interaction states present (default, hover, active, disabled, error)? | Missing states get invented by dev, differently on every screen |

**When a handoff changes,** mockups built on the previous theme MUST be marked stale using the same mechanism as requirement changes.

---

## 7. Wireframes

### 7.1 Requirements

- MUST be generated from the sitemap only; screens MUST NOT be invented
- Every field and action declared for the screen MUST appear
- **MUST contain no style values whatsoever** — no color, font, size, or CSS
- MUST reflect the ordering and grouping the spec declares
- MUST indicate which sections are visible only to specific roles

### 7.2 Why This Is Enforced Strictly

The wireframe is what gets reviewed with the client to confirm **data completeness and ordering**. Once styling enters, the conversation shifts instantly from "are the fields complete?" to "I don't like that color", and the more important question goes unexamined.

---

## 8. Mockup HTML

### 8.1 Requirements

- MUST be generated from wireframe plus theme only
- **MUST reference tokens exclusively; no ad-hoc style values**
- Every component used MUST exist in the component inventory
- Displayed data is fictional and MUST be marked as such

### 8.2 States to Render

Design declares which states each screen must support. Mockup renders them.

Commonly required:

- Empty state (first use)
- Loading
- Load failure
- Data volume requiring pagination
- Text overflow — long Thai personal names, longer company names
- Users lacking permission to see part of the screen
- Forms with multiple simultaneous validation errors
- In-flight submission (double-submit prevention)

**Caution:** rendering only the happy path leaves dev unaware these states exist and leaves qa with nothing to test.

---

## 9. Coverage and Selective Generation

### 9.1 Fidelity Levels

| Level | Produces | Used for |
|---|---|---|
| L0 | Named in the sitemap, nothing produced | Verifying screen coverage |
| L1 — Wireframe | Structure, fields, buttons, ordering; no styling | Client review of data completeness and flow |
| L2 — Mockup | L1 + theme | Client visualization and dev reference |

**Not every screen needs L2.** Ten near-identical CRUD screens need one representative at L2; the rest stay at L1.

### 9.2 Required Capabilities

- Inspect the sitemap and report each screen's level, including untouched screens
- Generate a chosen subset — by screen, by module, or by priority
- Report coverage: how many sitemap screens exist at which level
- Detect newly added sitemap screens that have no visual yet

---

## 10. Traceability — Knowing Where a Page Came From

### 10.1 Edges Owned by Mockup

```
SCR ──mockedBy──▶ MCK
MCK ──usesComponent──▶ COMPONENT (from theme)
MCK ──rendersState──▶ STATE
```

Mockup **appends only its own edges** and MUST NOT modify edges owned by design, dev, or qa.

### 10.2 The Four-Way Question

For any given page, the plugin MUST answer:

| Direction | Question | Read from |
|---|---|---|
| **req** | Which client requirement produced this page? | Design trace, walked up to REQ |
| **design** | What fields, rules, permissions, and process position does it have? | screens, rbac, statemachines |
| **code** | Is it built, and in which file? | Dev trace (SRC) |
| **qa** | Which tests cover it, and what is the latest result? | QA trace (TC + RUN) |

**Critical:** the plugin **reads** dev and qa data to answer, but **MUST NOT write** to their files. Graph assembly happens at read time (merged view); no writable merged graph file exists.

If dev or qa do not yet exist in the project, the answer MUST be "no data yet" — never a guess and never silence.

---

## 11. Handoff to Dev

**Governing principle: a mockup is a visual reference, not the source of truth for behavior.**

Without this declaration, dev pastes HTML into a framework and produces screens that look correct but bind to no data, enforce no validation, apply no authorization, and cannot be extended.

| Item | Status | Meaning for dev |
|---|---|---|
| Design tokens | **Normative** | No self-authored colors or spacing; reference tokens |
| Component inventory | **Normative** | The same component must be used across all screens |
| Declared required states per screen | **Normative** | A work list, not a nice-to-have |
| SCR ↔ MCK ↔ REQ map | **Normative** | Used to extend the trace graph without re-deriving pairings |
| Mockup HTML structure | **Reference** | Consult for ordering and layout; do not copy verbatim |
| Sample copy and sample data | **Reference** | Fictional; MUST NOT become real defaults |

> Note: field lists, validation rules, and permissions belong to **design**, not mockup. dev MUST read them from design directly; mockup MUST NOT duplicate them (rule W3 — reference, do not copy).

**Decide upfront:** once real screens exist they become authoritative and mockups begin to drift. Either maintain them continuously or deprecate them on completion (see MD5).

---

## 12. Commands

| Command | Purpose | Input | Output | Definition of Done |
|---|---|---|---|---|
| `/mock:init` | Bootstrap; verify design readiness | Design artifacts | State file | Sitemap and screens pass V5 |
| `/mock:theme` | Import handoff, validate coverage, or propose a prompt | Handoff (if any), screens | Theme + decision log | A confirmed theme exists, or the user's chosen path is recorded |
| `/mock:wireframe` | Generate screen structure | sitemap, screens, rbac | Wireframe per screen | MV1, MV3 pass |
| `/mock:html` | Generate mockups using the theme | wireframe, theme | Mockup per screen | MV2, MV4, MV5 pass |
| `/mock:coverage` | Inspect the sitemap and report coverage | sitemap, coverage map | Report | Every screen has a recorded level |
| `/mock:trace` | Answer the four-way question (req / design / code / qa) | Merged trace | Query results | Fully answers §10.2 |
| `/mock:check` | Run rules MV1–MV10 | All files | Per-rule report | Names offending IDs |
| `/mock:sync` | Ingest design or handoff changes | change-set | Stale list | All affected items marked |
| `/mock:handoff` | Assemble the dev delivery package | All files | Labeled package | MV7 passes |
| `/mock:status` | Report progress | State file | Status + exit code | Deterministic |
| `/mock:help` | Explain commands and ordering | — | Help text | States order, prerequisites, and what this plugin does not do |

### 12.1 Requirements for `/mock:help`

The brief calls out a help command explicitly, so its contents are specified:

- Recommended order: `init` → `theme` → `wireframe` → `html` → `handoff`
- Each command's prerequisites and the consequence of skipping them
- **What this plugin does not do, and which plugin to use instead** — the most important element, because users routinely request design-owned changes ("add a field to this screen"); complying would create two competing sources of truth immediately
- Common command examples
- A brief current project status

---

## 13. Validation Rules

| ID | Rule | Severity | Formerly |
|---|---|---|---|
| MV1 | Wireframes contain no style values whatsoever (color, font, size) | Error | V16 |
| MV2 | Mockups reference theme tokens only | Error | V17 |
| MV3 | Every field and action declared for a screen appears in its wireframe | Error | V18 |
| MV4 | Every L2 screen renders every state design declared for it | Error | V19 |
| MV5 | Every component used exists in the component inventory | Error | V20 |
| MV6 | Every sitemap screen has a recorded fidelity level (including "not started") | Warning | V21 |
| MV7 | The delivery package labels every item as normative or reference | Error | V22 |
| MV8 | Every `MCK` traces back to an `SCR` and a `REQ` | Error | New |
| MV9 | No stale mockups remain after a handoff or spec change | Error | New |
| MV10 | No screen is generated that does not exist in the sitemap | Error | New |

---

## 14. Cross-Session and Cross-Plugin Continuity

Inherits all mechanisms from design plugin §19, plus mockup-specific concerns.

| Leak | Mockup-specific symptom | Required mitigation |
|---|---|---|
| Re-asking about the theme | A new session asks again whether to use a handoff | The theme decision log MUST be read before any work |
| Human-edited HTML overwritten | Regeneration discards manual refinements | MUST compare before overwriting |
| Picture persists after the spec changed | The client reviews an outdated image and misunderstands | MUST mark stale and display it visibly on the artifact |
| Unknown which spec version a picture reflects | Arguments during UAT | Every mockup MUST record the spec version it was generated from |

**Persist-before-answer applies:** MUST NOT reply "understood, I'll use this theme" before writing it.

---

## 15. Plugin Constraints

| ID | Requirement |
|---|---|
| PN1 | No additional paid external services |
| PN2 | Runs on a standard learner machine |
| PN3 | Navigate via index; never load every screen at once |
| PN4 | Comprehensible within one hour |
| PN5 | Output MUST open in an ordinary browser with nothing installed |
| PN6 | Bounded storage — HTML and image files grow quickly |

---

## 16. Open Decisions

| ID | Issue | Why it matters | Formerly |
|---|---|---|---|
| MD1 | **Accepted handoff format** | Without a minimum shape, some tools work and others do not | D18 |
| MD2 | **Is a theme project-bound or cross-project?** | Determines project storage versus global wiki | D19 |
| MD3 | **Which screens warrant L2, and who decides** | No criterion means either wasted effort or insufficient client clarity | D20 |
| MD4 | **Must multiple viewport sizes be covered?** | Directly coupled to design's D7 (surfaces) | D21 |
| MD5 | **Do mockups persist or retire once built?** | Otherwise they become stale documents people still consult | D22 |
| MD6 | **HTML only, or other output formats?** | Producing React/Vue components makes this dev's work instead | New |
| MD7 | **How far may humans edit mockups directly?** | Free editing produces drift against the spec | New |
| MD8 | **Where does sample data in mockups come from?** | Realistic data makes committed mockups personal data | New |

MD8 is the same question as QD4 in the qa plugin and SHOULD be decided once for both.

---

## 17. Build Order

**Milestone 1 — Know which screens to build**
`init` → `coverage` → `wireframe`
*Proves generation is sitemap-driven and wireframes carry no styling.*

**Milestone 2 — Theme handling**
`theme` → `html`
*Proves the plugin does not invent styling, and that the proposed prompt is spec-derived.*

**Milestone 3 — Connect to the others**
`trace` → `sync` → `handoff`
*Proves the four-way question is answerable and the package distinguishes normative from reference.*

---

## 18. Acceptance Checklist

- [ ] Request a mockup with no handoff present — the plugin asks first and proposes a prompt containing this project's actual details, not a generic one
- [ ] Leave the theme question unanswered and continue — only wireframe level is produced; no invented colors or fonts
- [ ] Inspect a generated wireframe — contains no embedded color or font values
- [ ] Import a handoff missing components the system requires — the gap is reported, not silently filled
- [ ] Generate three screens out of twenty — succeeds, and coverage is reported accurately
- [ ] Change the handoff and run check — existing mockups are marked stale
- [ ] Ask for a screen that does not exist in the sitemap — must refuse
- [ ] Ask to add a field to a screen — must redirect to the design plugin rather than complying
- [ ] Point at a screen whose spec is incomplete — must not generate, and must raise a question
- [ ] Ask which req, design, code, and tests relate to a page — all four answered, or explicitly reported as not yet available
- [ ] Hand-edit an HTML file and regenerate — the edit survives
- [ ] Inspect the delivery package — normative and reference items are clearly distinguished
- [ ] Run `help` — states the workflow order and what is out of scope for this plugin

### 18.1 Cold Start Test

Close everything. Reopen with only files on disk. Ask:

1. Where did this project's theme come from, who decided, and when?
2. How many screens are done, at which levels, and what remains?
3. Which requirement produced this page, and how far have implementation and testing progressed?
4. Which pictures are stale because the spec changed?
5. What questions are pending with design?

---

## Appendix: Glossary

| Term | Meaning |
|---|---|
| Handoff | Output from a design tool serving as the source of styling |
| Design token | A named style primitive referenced by name rather than raw value |
| Component inventory | The set of reusable components with their states |
| Wireframe | Unstyled screen structure — verifies data completeness and ordering |
| Mockup | A wireframe with the theme applied |
| Fidelity level | A screen's level of elaboration — L0 / L1 / L2 |
| Normative / Reference | Delivery-package labels marking what must be followed exactly versus what is guidance |
| Merged view | A graph assembled from several plugins at read time; it has no on-disk existence |
