---
name: requirement-and-rule-mapping
description: >-
  Phase 1 (Analysis) of aeon. Turns raw requirements — typed text, .docx/.xlsx/.pdf, photos,
  chat screenshots — into a traceable spec.json whose unit of coverage is the business RULE (BR-xxx),
  not the scenario. Captures every source on disk under docs/ with page-level provenance, runs Example
  Mapping as multiple-choice rounds of three with the owner's habitual answers pre-selected, splits
  deterministic extraction from AI interpretation so a misread screenshot never passes as a document,
  and turns "not sure yet" into a red card that blocks CP1. Keeps a customer's data extract as its own
  kind (sample_data) so real records are evidence of correct VALUES, never a source rules get guessed
  from, and settles the PII question before that file is written into git history. Regenerates a
  readable Thai markdown doc for every requirement it touches, and gates on a deterministic 11-check script.
  USE WHEN starting a new module from raw requirements; importing a TOR / price sheet / Line screenshot /
  a spreadsheet of the customer's real records; eliciting business rules; asking what rules still lack
  proof; checking whether Phase 1 can close.
  Triggers - req, capture requirement, example mapping, business rule, BR, red card, การ์ดแดง,
  เก็บ requirement, กฎธุรกิจ, CP1, spec.json, provenance, sample data, ข้อมูลตัวอย่างจากลูกค้า.
  DO NOT USE for modelling entities / data dictionary / API (that is `domain`, Phase 2), designing
  screens (`screen`), planning features (`plan`), writing code (`build`), or E2E tests (`verify`).
---

# req — Requirement and Rule Mapping (Phase 1)

## The one question this phase exists to answer

> **"Which rule has nobody proved yet?"**

Measured from files, never scored by a model: `rules with an example / rules total`, then later
`rules with a green test / rules total`. If you find yourself judging coverage by reading, stop —
run `scripts/verify-rules.mjs`.

## The spine

```
UL-xxx   (ubiquitous language — vocabulary, agreed BEFORE rules are elicited)
REQ-xxx  (requirement = aggregate root)
  └─ BR-xxx@vN  (rule = THE unit of coverage · every version is its own node)
       ├─ EX-xxx   proves the rule  → AC → FE → TC
       └─ Q-xxx    open question = RED CARD, blocks CP1
  └─ NFR-xxx  separate track, never enters Gherkin
DQ-xxx  spillover queue → blocks CP2, NOT CP1
```

A scenario does not grow from a requirement — it grows from a **rule**. Rules that span aggregates
are invisible to scenario-first discovery because no single scenario owns them.

### Vocabulary belongs to Phase 1; the entity model does not

"Domain Model" covers two different things, and only one of them precedes rules:

| layer | what | phase | direction |
|---|---|---|---|
| **Ubiquitous Language** (`glossary[]`) | agreed words — *"งาน" is Job, not Trip* | **here, Phase 1** | must exist **before** rules, or every rule is ambiguous from birth |
| **Domain Model** (entities, relations) | tables, aggregates, FKs | Phase 2 (`domain`) | **grows out of** rules |

Evidence: hand-running Example Mapping on BunTrukHub *produced* `ApprovalPolicy` and
`JobCostAdjustment` — two entities no prior design had. If a complete entity model were a
precondition for asking rule questions, neither would exist. The dependency runs both ways.

So: propose terms in `/req:capture`, add them in `/req:ask` as answers surface new ones, and leave
`becomes_entity: null` — Phase 2 **binds** vocabulary to entities rather than inventing it, exactly
as it fills `BR.enforced_by`. `not_to_confuse_with` is the field that earns its keep: งาน vs
เที่ยววิ่ง is the argument you will have with a client, and writing it down ends it once.

## Hard rules for this skill

1. **Every command ends by stopping for approval.** Never flow into the next step. Read-only commands
   are marked 👁 and must not write files.
2. **Work in the main thread.** Never spawn a subagent from this skill — the whole project exists
   because orchestrated context bootstrap burned ~330k tokens on one CRUD page.
3. **Never guess.** Missing information is a gap: record it and send it upstream. *Extraction you may
   do alone; **partitioning and interpretation must be confirmed**.*
4. **The human owns the rules.** You may propose; you may not commit a rule the owner has not seen.
5. **Reply to the owner in Thai** (address them as พี่ปู). Files written into the project stay as
   specified: identifiers, JSON keys, and code in English; user-facing document text in Thai.

## Commands

| command | what it does |
|---|---|
| `/req:capture [module]` | Beat A — take raw input (typed text + any number of attachments) into `sources[]`, propose glossary terms, draft REQ/BR. With no input: regenerate-only mode |
| `/req:ask [category]` | Beat B — fire 3 questions from the bank with ⭐ pre-selected; repeatable until every relevant category is covered |
| `/req:example <BR-id>` | Beat C — break a rule into 2–4 proving examples (happy / exception / boundary) |
| `/req:check [--cp2]` 👁 | what is still open **and** does CP1 pass — one command, two sections |
| `/req:help` 👁 | every command with real usage examples, **in Thai** |

Not built yet (second pass): `/req:impact`, `/req:lock`.
If the owner asks for one, say it is not built rather than improvising it.

**The command set stops at eight.** `/req:rule` was dropped for good on 2026-08-13: adding a rule is
`/req:ask`, reading one is `docs/wiki/rules/` — a file, not a command — and changing one is
`/req:change`, which must stay the only path to `@v(n+1)`. When a command feels like it is missing,
the answer is usually that an existing one should route to the right one, not that a ninth should
exist (CLAUDE.md §5, gate 4).

**Merged away — do not resurrect:** `/req:new` + `/req:import` → `/req:capture` (input arrives as one
mixed batch). `/req:append` → `/req:capture` (its rules — spec exists, node locked, highest id — are
all self-detectable). `/req:gap` → `/req:check` (same checker output, two angles).

## `/req:capture` — the single door for raw input

One invocation takes typed text **and** any number of attachments. **1 input = 1 `SRC-xxx` node.**

### Where files live — invariant: every source resolves to a path under `docs/`

| situation | action |
|---|---|
| file already under `docs/` | **reference the path. Do not copy.** |
| file outside the project | **copy into `docs/sources/`**, record `imported_from` |
| **image pasted in chat** | **the one case where you write a file** — it has no path and dies with the window. Write `docs/sources/SRC-0NN-<slug>.png` first |
| **an extract of the customer's real records** | `kind: "sample_data"`, and **the PII question is answered before the file is written** — see below |

`docs/` is normally under version control, so evidence lands in git history. Record
`hash_at_import` from the stored file; `/req:check` distinguishes match ✅ / changed ⚠️ / missing ❌.

That same git history is why `sample_data` cannot be treated as just another attachment: real names
and ids committed once are committed forever, and deleting the file later does not remove them. So
`masked` is a required field — the value must come from the owner's answer, `true` or `false`, and the
only unacceptable outcome is having written the file without asking. `masked_note` records what was
masked, or why masking was declined.

### Three cases

1. **No `spec.json` yet** → create the REQ, attach everything to it. *(decide alone)*
2. **`spec.json` exists, input extends one REQ** → propose which, **then confirm**.
3. **Input spans several REQs** → propose the split showing which source/page feeds each, **then confirm**.

> Case 3 is where this fails silently. A 12-page TOR is tempting to auto-partition across modules.
> Splitting is a **business decision, not text extraction** — get it wrong and the requirement is
> wrong at the root, where no checkpoint catches it, because every gate asks *"is it complete?"*
> and none asks *"is it split correctly?"*

### Extraction vs interpretation — never mix them

| | `extracted` | `interpretation` |
|---|---|---|
| produced by | a parser | a model reading an image |
| trust | deterministic | **a guess until confirmed** |
| example | `formula: "=IF(B2>1000, B2*0.93, B2)"` | "the customer wrote: cancel after billing means re-issue" |

There is a second line that matters just as much, and it cuts a different way. A document, a photo, a
chat answer **"what is the rule."** An extract of real records answers **"what is the correct value."**
Reading rules out of the second one produces a rule that explains that extract and nothing else — so
`sample_data` never yields a `BR-xxx` directly. It yields a suspicion, stated with its denominator
(*"47 of 500 rows over 1,000 got 7% off — rule, or coincidence?"*), which goes through the same
confirmation round as everything else, "ยังไม่แน่ใจ" included. Its real value arrives later, when a
calculation contract exists and our computed numbers can be diffed against numbers the customer
already believes. Until then it sits captured and unused, which is the correct state, not a gap.

**Spreadsheets: capture the `formula`, not just the `value`.** Rules hide in formulas. Reading only
values returns `930` when the rule is *"over 1,000 gets 7% off"*. Excel is the most deceptive source.

### Confirmation rounds

Ask only about interpretations that **actually produced a candidate rule** — a transcribed line that
generated nothing needs no question.

| order | ask about | why first |
|---|---|---|
| 1 | which REQ / how to split | nothing else can be judged until this settles |
| 2 | conflicting sources | they block |
| 3 | interpretations that produced a rule | |
| 4 | the rest — **queue it and state the count** | never truncate silently |

Cap at **3 per round**. Every question offers "ยังไม่แน่ใจ / ต้องถามลูกค้า".

`validation.state` is three-valued, not a boolean:

| state | meaning | effect |
|---|---|---|
| `confirmed` | read correctly | usable |
| `corrected` | misread, owner fixed it | use `corrected_to` |
| `deferred` | **owner unsure** | **mint `Q-xxx` → blocks CP1** |

A boolean cannot hold the third answer — `false` would mean both "not asked" and "asked, unsure",
and only the second is a red card. This is what makes `/req:capture` a red-card generator rather
than a file reader.

## `/req:ask` — the most-used command in the suite

Reads `assets/question-bank.json` v0.3.0 — **two tiers**: tier 1 framing (`end_goal` `scope`
`actors` `language`, 6 questions, steps 1–4) runs **once per module** before the first rule
question; tier 2 rules (10 categories, 15 questions, steps 5–7) repeats per requirement.

Rules baked into the data:

- **3 questions per round**, multiple choice, never prose — tier 1 is 6 questions in `order`, so
  two rounds, and `per_round` does not move
- **frame before eliciting rules** — a rule agreed before the module's goal is agreed gets re-argued
  at scope review
- **pre-select the ⭐ default but never skip the asking** — in tier 2 the star is the *owner's design
  habit*, not a domain law (enterprise work often wants the opposite: retry queues, effective dates).
  **Tier 1 has no baked-in star** — it is the reading taken from the input, shown with its `SRC` and
  locator, because an end goal does not repeat across projects the way a habit does.
- **every question offers "not decided yet"** — choosing it is the most valuable outcome, not a
  failure. Never make the answerer feel they should avoid it.
- **close blue cards before breaking out green ones** — otherwise you get examples proving the wrong rule
- **an answer that opens a new rule is normal**, not a setback
- remember which categories have been asked; stop when every relevant one is covered
- **timebox 25 minutes per story**, then stop, summarise, decide

Questions whose answers need entities that do not exist yet (`decimal(p,s)`, natural key,
soft-delete column) go to **`deferred_questions[]`, never into a rule**. They block CP2, not CP1.
That list is tier 2 only — `deferredQuestion.category` is an enum of the ten rule categories, so a
framing question that cannot be answered now is a `Q-xxx` red card or it is nothing.

**Tier 1 writes the frame, never a rule:** `goal` · `business_value` · `actor` · `narrative` ·
`glossary[]` · `questions[]` — nothing else. It requires at least one `SRC` to exist first, because
a framing red card has nowhere else to point (`question.raised_by` = `SRC-xxx` | `BR-xxx@vN`).

**Growing the bank:** add a question only when real client work surfaces it. Every entry must have
already delivered a forgotten rule at least once. Never add questions derived from theory — and
that is why all six tier 1 questions ship `status: "provisional"` with `field_evidence: null`:
their wording came from the pipeline cards, which is a source, not evidence. Promote one at a time
after it earns it in a real session.

## `/req:example` — green cards

2–4 per rule, chosen by the rule's `test_design`. Cover happy, exception, and boundary before adding
more of one kind. An example that proves no rule is noise and the checker rejects it.

**`then` must carry the verbatim Thai UI/error text the user sees** — not "shows an error". Omitting
this once cost a full QA recalibration round on a real project.

## Generated documents

Every command that writes regenerates **two** renders of the requirements it touched:
`docs/requirements/REQ-xxx.md` (for people) and `docs/wiki/**` (for agents).

- **100% generated.** Human prose lives in `spec.json` → `narrative` (or the `narrative_file` sidecar).
- **Never use protected marker blocks.** Someone eventually edits outside the markers, regeneration
  eats it silently, and after one incident nobody trusts regeneration again.
- The REQ header carries `spec-hash:`; each wiki page carries `spec_hash:` in its frontmatter.
  Check #10 and check #12 use them to prove each render still matches the spec.
- **Run the scripts, never hand-write either render** — `scripts/doc-hash.mjs` for the hash,
  `scripts/wiki.mjs --write` for the bundle. A hand-written page differs in bytes while its hash
  stays put, which makes it stale from birth.
- `deliver`'s Word SRS is **another render of the same data**, not a second document. Never build a
  second extraction path. The wiki is the third render, and it obeys the same rule.

See `references/document-template.md` for the layout.

## CP1 — closing Phase 1

CP1 and CP5 define the whole system: **enter with rules answered, exit with rules proved.**

```bash
node ${CLAUDE_PLUGIN_ROOT}/scripts/verify-rules.mjs --root . --cp1
```

Exit `0` green · `1` violations printed · `2` file/parse error. Eleven checks, all deterministic:

| # | check | gate |
|---|---|---|
| 1 | every REQ has actor + goal | CP1 |
| 2 | every `is_current` rule has ≥1 example | CP1 |
| 3 | open red cards = 0 | CP1 |
| 4 | every reference resolves | all |
| 5 | open spillover = 0 | **CP2 only** |
| 6 | status consistency (`superseded` ↔ `superseded_by` ↔ `is_current`) | all |
| 7 | rule refs carry `@v`; exactly one `is_current` per base id | all |
| 8 | sources under `docs/`, present, hash matches | CP1 |
| 9 | `rollup` equals `scripts/rollup.mjs` — including `ready_for_next_step` | all |
| 10 | generated docs exist and are in sync | CP1 |
| 11 | vocabulary: `domain_concepts` resolve, terms are defined and referenced | ⚠️ **warn only** |

Check 11 is deliberately a warning. Blocking CP1 on unconfirmed vocabulary would stall every rule
referencing a term, and there is no evidence yet that it pays — promote it after real use.

**CP1 is approved by the owner, not by the script.** A green run is a precondition for asking, not
the approval itself.

## Schema essentials

**`/req:change` is the only path that creates `@v(n+1)`.** Not for convenience — because a second
path to the same node is the second extraction path this plugin forbids. When any input contradicts
an existing rule, whatever its status (`draft` included), classify it, freeze that REQ, report, and
stop. Freezing means writing nothing for that REQ except the sources and their hashes: `provenance`
lives on the rule node, so writing it moves `reqDocHash` while regeneration is forbidden, and check
10 goes red with nobody allowed to fix it. `effective_from` goes on the version node itself, never
only on the change set — check 14 is warn-level, so walking CHG → node is not guaranteed.

**A number this system did not RUN is not evidence.** `/req:golden` writes a script to
`<state-dir>/golden/<CALC-id>.mjs`, runs it, and stores the output as `golden_datasets[].rows` — and
those rows stay a proposal until `verified_by` + `verified_at` are filled in by a human. Never
compute an expected value by reasoning about the formula; never edit an answer key so it agrees with
a contract. When they disagree, the contract is what changes (design §2.2, loop L2).

**Where spec.json lives is a parameter, not a constant.** Default `.aeon/spec.json`; overridden by
`--state-dir <name>` or `$AEON_STATE_DIR`. Never type the directory name into a command or a
generated document — resolve it with `scripts/state-dir.mjs` (`--path` for the full spec path).
Nothing auto-detects the location: a missing spec is exit 2 naming the path it looked for.

Full schema: `schemas/spec.schema.json` at the **project** root — that is also the path
`/req:check` hands to ajv, so a project consuming this plugin needs its own copy.

- **`meta.schema_version` is `"0.3.0"`**, declared `const`. A wrong value invalidates the entire
  file, not one field, so a new `spec.json` gets it right at creation. Do not relabel an existing
  file to silence a validation error — the mismatch is the finding.

- **Rule versions are separate nodes** (`BR-job-011@v1`, `@v2`) with `supersedes` / `superseded_by`
  edges — never nested arrays. Old features and tests keep pointing at the version they were built
  against, which is how you answer *"the rule was different when this job was created."*
- **References in files must carry `@v`.** A bare `BR-job-011` silently re-points when current moves.
  The owner may omit it when typing; you resolve it to current.
- **`rule_coverage` counts `is_current` only.** Counting superseded versions inflates the denominator
  and makes coverage drop for no reason — which is how people stop believing a metric.
- **`provenance` is an array.** One rule genuinely comes from a TOR clause *and* a Line screenshot
  *and* a meeting answer. `locator` points at page / sheet / cell / region — never just a filename.
- **`domain_concepts` holds `UL-xxx` references, not bare strings.** A concept with no agreed
  definition produces ambiguous rules, which is what `glossary[]` exists to stop.

## References

| file | when to read it |
|---|---|
| `references/capture-flow.md` | running `/req:capture` — full decision tree, per-format extraction |
| `references/question-bank-usage.md` | running `/req:ask` — round mechanics, spillover routing |
| `references/document-template.md` | the generated `.md` layout, section by section |
| `references/checkpoint-cp1.md` | reading checker output, common violations and their fixes |
| `assets/question-bank.json` | the questions themselves |
| `scripts/verify-rules.mjs` | the gate |
| `scripts/doc-hash.mjs` | the only definition of a document's hash — `reqDocHash` per requirement, `nodeDocHash` per wiki page. Call it, never reimplement |
| `scripts/doc-frontmatter.mjs` | the five document rules this gate shares with `verify-design.mjs`, **including their severity** — the two gates may not answer differently |
| `scripts/wiki.mjs` | the only renderer of `docs/wiki/**` — run it, never hand-write a page |
| `scripts/rollup.mjs` | the only definition of `rollup{}` — call it after every write, never recount by hand |
| `scripts/fixtures/{clean,dirty}/` | worked examples — dirty deliberately violates every check |
