# `/req:ask` — running the question bank

Data: `assets/question-bank.json` v0.3.0 — **two tiers**:

| tier | when | categories | questions | status |
|---|---|---|---|---|
| **1 · framing** | once per module, after `/req:capture`, before the first rule question | `end_goal` `scope` `actors` `language` (pipeline steps 1–4) | 6, in `order`, two rounds of three | **provisional** |
| **2 · rules** | every round, per requirement | the ten original categories (steps 5–7) | 15 | official |

Every **tier 2** entry earned its place by surfacing a rule someone had forgotten on real client
work. **Tier 1 has not earned that yet and says so** — see "Tier 1 is a draft on purpose" below.

## Why a bank works here at all

Requirements never repeat across projects, so a question bank cannot help with them. **Rules do
repeat — roughly 80% across domains.** Permission, reversal, freeze points, approval, rounding,
versioning, data scope, retries: they appear in every business system. Only the *answers* differ,
not the *questions*. That asymmetry is the entire justification for this command.

The real job is not eliciting the unknown. In a solo consultancy the owner usually knows the answer
already — it has simply never been written down as data. This command is a **tacit-knowledge press**,
run before the AI starts guessing.

## Round mechanics

```
/req:ask                 → tier 1 if the module has not been framed, else a tier 2
                           category not yet covered
/req:ask calculation     → force a category (either tier)
```

Per round:

1. **Exactly 3 questions.** Not four.
2. **Multiple choice.** The owner picks fast and accurately; prose answers are slow and lossy.
3. **Pre-select the ⭐ default**, shown as already chosen — confirming is one keystroke.
4. **Always include "ยังไม่แน่ใจ / ต้องถามลูกค้า."** Never phrase the round so this feels like failure.
5. After each round: write, regenerate docs, **stop for approval**. Repeat until categories are covered.
6. **Timebox 25 minutes per story.** Then stop, summarise, decide.

Track which categories have been asked in this session and skip them. Stop on your own when every
category relevant to the requirement has been covered — do not keep asking to look thorough.

## What the ⭐ default is, and is not

It is the **owner's design habit**, recorded from a real session: consistently
*simple / direct / fail-loudly* (round at every step, fail fast, hit the constraint, see only your
own) over *clever / flexible / swallow-the-error*.

It is **not a domain law.** Enterprise work often wants the opposite — a retry queue instead of
failing loudly, effective dates instead of new-work-only. So:

> **Pre-select the star. Never skip the question.**

## Tier 1 — framing

Rules repeat across projects, which is what makes a rule bank possible. **Framing questions repeat
too** — every project has an end goal, an out-of-scope list, an actor nobody wrote down, and two
words that mean the same thing. Only the answers are project-specific. That is why framing belongs
in the bank and not in a checklist someone keeps in their head.

Six questions, `order` 1–6, two rounds of three — `per_round` is untouched:

| round | questions | the round answers |
|---|---|---|
| A | `QB-goal-01` · `QB-bound-01` · `QB-bound-02` | what counts as done, and how far this round goes |
| B | `QB-actor-01` · `QB-actor-02` · `QB-lang-01` | who touches it, and what things are called |

`QB-bound-02` is loop **L4** (*scope → goal*) asked deliberately instead of waited for, which is why
the order is fixed: you cannot ask whether cutting something still lands the goal until the thing
being cut has been named.

**Precondition — `sources[]` must not be empty.** `question.raised_by` accepts a `SRC-xxx` or a
`BR-xxx@vN`, check 4 resolves it, and framing runs before any rule exists. So a framing red card can
only point at a source. No source → say so and stop; `/req:capture` first.

**The tier 1 star is a reading, not a habit.** A design habit repeats across projects; an end goal
does not. Tier 1 questions carry no `default: true` — pre-select what the captured input supports and
show it: `⭐ b (จาก SRC-002 หน้า 1 §3.2: "…")`. Input silent → no star, and say so.

**What framing writes** — all existing fields; tier 1 adds nothing to the schema:
`end_goal` → `requirements[].goal` + `business_value` · `scope` → in scope is which `REQ` exist, an
exclusion goes to `requirements[].narrative` and the report, a disputed one becomes `Q-xxx` ·
`actors` → `requirements[].actor` (+ a `glossary[]` term for a newly named actor) · `language` →
`glossary[]` with `aka` / `not_to_confuse_with` and provenance pointing at the source.

**What framing may not write:** `rules[]` `calculations[]` `examples[]` `golden_datasets[]`
`changes[]` — framing is steps 1–4, rules start at step 5. A rule-shaped answer (`QB-actor-02` is
built to produce one) is recorded in the requirement and handed to the tier 2 `permission` round,
which drafts the `BR` citing the same source. And **`deferred_questions[]` is closed to tier 1 by
the schema**, not by taste: `deferredQuestion.category` is an enum of the ten tier 2 categories.

**Coverage is session-tracked, like tier 2.** `REQ.goal` / `REQ.actor` / `business_value` filled and
a non-empty `glossary[]` are hints for choosing the next round — never a gate. `scope` cannot be
read at all: there is no queryable out-of-scope field in `spec.json`. That gap is written down in
the bank (`tiers.1.declared_gap`) rather than patched by inventing `meta.out_of_scope[]`, which
would touch `meta` (`additionalProperties: false`), both fixtures, possibly `rollup` and check 9,
the renderer, and `EXPECTED.md` — a round of its own.

### Tier 1 is a draft on purpose

The bank's growth rule is that a question must already have surfaced a forgotten rule **on real
client work**. Tier 1 has not. Its wording came from the pipeline cards and their traps
(`derived_from`), and `field_evidence` is `null` on every one of the six — teaching material and a
fictional teaching project cannot promote a question, and calling them evidence is exactly the
laundering the rule exists to stop. So the tier ships `status: "provisional"`: usable, announced as
a draft once per module, promoted one question at a time by filling `field_evidence` and dropping
`status` after it earns it. Design §4 planned it this way — *"สร้างเป็นร่างก่อน แล้วเลื่อนเป็นทางการหลังใช้จริงรอบแรก"*.

## What each answer produces

| answer | result |
|---|---|
| a normal option | a new `BR-xxx@v1`, `status: "draft"`, provenance pointing at this session |
| "ยังไม่แน่ใจ / ต้องถามลูกค้า" | a **`Q-xxx` red card** — the most valuable outcome, and it blocks CP1 |
| an answer that opens a new question | **normal, not a setback** — e.g. "แก้ได้ถ้ามีคนอนุมัติ" immediately raises "ใครอนุมัติ" |

## Framing before blue cards, blue cards before green cards

Frame the module (tier 1) before eliciting rules, for the same reason blue comes before green: a
rule agreed before anyone agreed what the module is for gets re-argued the moment scope is reviewed.

Finish eliciting rules (blue) before breaking any of them into examples (green). Examples written
against a rule that later changes prove the wrong thing, and the wasted work is silent.

## Spillover — questions that cannot be answered yet

Some answers raise follow-ups that require entities that do not exist during Phase 1:

- `calculation` → how many decimal places? `decimal(p,s)`? round per step or at the end?
- `temporal` → can an existing version be edited? does the master need soft-delete? version history screen?
- `data_scope` → do supervisors see subordinates' data? after transfer, does the old owner still see it?
- `integration` → transaction boundary: rollback or half-written when the external call fails?
- `idempotency` → what is the natural key? what is the exact Thai error text?

These are listed as `spillover` on the question in the bank. Write them to
**`deferred_questions[]`**, never into a rule:

```jsonc
{ "id": "DQ-job-001",
  "question": "ยอดค่าใช้จ่ายปัดกี่ตำแหน่ง และ decimal(p,s) เท่าไหร่",
  "raised_by": "BR-job-011@v2",        // must carry @v
  "category": "calculation",
  "blocked_until": "entity:Job.TotalCost",
  "answer_phase": "domain",
  "state": "open" }
```

**They block CP2, not CP1.** Mixing them into `questions[]` would make CP1 unreachable by design,
since they are meant to be answered in Phase 2.

## Deriving starting blue cards from existing knowledge

Faster than starting from zero: read the codebase or brain notes and propose rules for the owner to
review. **Mark every derived rule as unconfirmed** and treat it exactly like an interpretation —
provenance points at where it came from, and the owner confirms before it counts.

## Growing the bank

Add a question **only when real client work surfaces it.** Every entry must already have delivered
a forgotten rule at least once. Never add questions reasoned out from theory — that is how question
banks bloat into checklists nobody finishes.

**Promoting a provisional question** is the same rule read forwards: the six tier 1 questions were
written before they had earned anything, so each carries `field_evidence: null` and
`status: "provisional"` until a real session proves it. When one does, write down *where* in
`field_evidence` and delete its `status`. Never promote from "it felt useful" — that is the theory
route with extra steps.

Known gaps recorded in the bank's `known_gaps`: notifications · file import/export (partial-row
failure) · subscription expiry · deletion (soft/hard, with dependents) · multi-language and
currency · State Machine (step 7) still has no category of its own, hiding inside `reversal` and
`freeze_point`.
