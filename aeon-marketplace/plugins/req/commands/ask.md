---
description: Beat B — fire 3 questions from the bank, pre-selected; framing first, then rules
argument-hint: "[category]"
---

# /req:ask — frame the module, then elicit rules, three at a time

Invoke the `requirement-and-rule-mapping` skill and follow `references/question-bank-usage.md`.
The most-used command in the suite; designed to be run repeatedly.

## Steps

1. Load `${CLAUDE_PLUGIN_ROOT}/assets/question-bank.json`.
2. Pick the tier, then the category:
   - **Tier 1 (framing) has not run for this module yet → run it first**, in `order`, two rounds.
     See "Tier 1 — framing" below. An argument naming a tier 1 category forces that tier.
   - Otherwise tier 2: the argument if given, else a category not yet covered for this requirement.
   - If every relevant category is covered, **say so and stop** — do not invent questions.
3. Ask **exactly 3** questions, multiple choice, with the ⭐ option shown pre-selected. Every
   question keeps its "ยังไม่แน่ใจ / ต้องถามลูกค้า" option.
   **Pre-select the star, never skip the asking.** What the star *means* differs by tier:
   tier 2 `default: true` is the owner's design habit, not a domain law; tier 1 has no baked-in
   star — it is the reading taken from the captured input, shown with its `SRC` id and locator.
4. **Tier 2 only — classify each answer before converting it** — new rule, or a change to one that exists? Use the
   four outcomes defined in `commands/capture.md` ("Four outcomes per drafted rule"): 🆕 NEW ·
   ♻️ SAME · ⚠️ CHANGED · ❓ UNSURE. That section is the single home of the classification; read it
   there rather than working from a copy. See "Answers that land on a rule that already exists" below
   for the two signals that differ on this path.
5. Convert answers — **tier 2**; for tier 1 use the landing table under "Tier 1 — framing" instead.
   The "ยังไม่แน่ใจ" line is the one that applies to both tiers:
   - 🆕 NEW → a new `BR-xxx@v1`, `status: "draft"`, provenance pointing at this session
   - ♻️ SAME → **do not draft a second rule** — add provenance to the existing one
   - ⚠️ CHANGED / ❓ UNSURE → 🛑 **write nothing for that rule**, report, and route (below)
   - "ยังไม่แน่ใจ" → a **`Q-xxx` red card** (blocks CP1) — this is the most valuable outcome
   - an answer that raises a new rule → normal, capture it and continue
6. **Tier 2 only** — route the question's `spillover` entries into **`deferred_questions[]`** with
   `raised_by` carrying `@v`. Never fold them into a rule. They block CP2, not CP1. Tier 1 questions
   carry no `spillover`, and the schema closes that list to them anyway (see below).
6b. **Add glossary terms as answers surface them.** An answer that names something the vocabulary
   does not yet cover ("ต้องมีคนอนุมัติ" → *approver*, *approval policy*) is how `ApprovalPolicy`
   appeared in the BunTrukHub field test. Add it to `glossary[]` with `becomes_entity: null` and
   reference it from the requirement's `domain_concepts`. Rule questions birth vocabulary —
   that is expected, not a sign the vocabulary pass failed.
7. Write the new nodes into spec.json and leave `rollup` alone — fix the counts with the script,
   then report from its output rather than re-reading the file:
   ```
   node "${CLAUDE_PLUGIN_ROOT}/scripts/rollup.mjs" --root . --write
   ```
   **Never recount `rollup` by hand** — it drags the whole file into context on every round.
   Then regenerate **both** renders — a command that updates one and not the other leaves check 12
   red with nothing in the report explaining why:
   ```
   node "${CLAUDE_PLUGIN_ROOT}/scripts/doc-hash.mjs" --root . [REQ-id]   # docs/requirements/*.md
   node "${CLAUDE_PLUGIN_ROOT}/scripts/wiki.mjs"     --root . --write    # docs/wiki/**
   ```
8. 🛑 **Stop.** Report: rules added, **rules corrected in place**, red cards opened, spillover queued,
   **anything routed to `/req:change`**, categories still uncovered. After a tier 1 round, also
   report what framing wrote (goal · scope exclusions · actors · terms) and **any rule-shaped answer
   held for its tier 2 category**. Ask whether to run another round — do not auto-continue.

## Tier 1 — framing, once per module

Four categories — `end_goal` `scope` `actors` `language` — pipeline steps 1–4, **6 questions in
`order`, two rounds of three**. `per_round` is still 3; nothing in `ask_rules` moved. Tier 1 runs
once per module, not once per requirement, and stops being offered after it has run.

**Precondition: `sources[]` must not be empty.** A framing red card has to point somewhere, and the
schema lets `question.raised_by` be a `SRC-xxx` or a `BR-xxx@vN` — nothing else. Framing runs before
any rule exists, so `SRC` is the only target left. No source → say so and stop:

```
ยังไม่มีอินพุตให้ตั้งกรอบ — /req:ask ชั้น 1 ต้องมี SRC อย่างน้อยหนึ่งอันไว้อ้างที่มา
สั่ง /req:capture <module> ก่อน
```

**The star is a reading, not a habit.** A rule-policy habit repeats across projects; an end goal does
not. So tier 1 questions carry no `default: true`. Pre-select the option the captured input supports
and show where it came from — `⭐ b (จาก SRC-002 หน้า 1 §3.2: "…")`. If the input is silent on that
question, ask with **no star** and say so. This is the same confirmation round `/req:capture` runs on
its interpretations, aimed at the frame instead of at a rule.

**Where framing answers land** — every field already exists; tier 1 adds no schema:

| category | writes |
|---|---|
| `end_goal` | `requirements[].goal` · `requirements[].business_value` |
| `scope` | in scope = a `REQ` exists for it · out of scope → `requirements[].narrative` + the round report · disputed → `Q-xxx` |
| `actors` | `requirements[].actor` · a newly named actor also becomes a `glossary[]` term |
| `language` | `glossary[]` — `term_th` · `aka` (answer a) · `not_to_confuse_with` (answer b) · `status: "draft"` · provenance → the `SRC` the pair came from |

**Tier 1 never writes `rules[]`** — nor `calculations[]`, `examples[]`, `golden_datasets[]`,
`changes[]`. Framing is steps 1–4; rules start at step 5. `QB-actor-02` ("what can this actor *not*
do") produces a rule-shaped answer on purpose: record it in the requirement, report it at the stop as
`หมวด permission ชั้น 2 ค้างอยู่ 1 ข้อ`, and let the tier 2 `permission` round draft the `BR` with
provenance pointing at the same source. Drafting it here would put rule creation on two paths.

**Tier 1 never writes `deferred_questions[]` either, and that one is the schema's call, not a
preference** — `deferredQuestion.category` is an enum of the ten tier 2 categories. A framing
question that cannot be answered now is a `Q-xxx` red card (blocks CP1) or it is nothing.

**Coverage is session-tracked**, exactly like tier 2. The readable hints — `REQ.goal` / `REQ.actor`
filled (check 1 errors when they are not), `business_value` filled, `glossary[]` non-empty (check 11,
warn) — are hints for picking the next round, **not a gate**. `scope` has no field to read at all:
there is no queryable out-of-scope list in `spec.json`, which is recorded as
`tiers.1.declared_gap` in the bank and is a decision for a later round, not a thing to invent here.

**The whole tier is `status: "provisional"`.** Its wording came from the pipeline cards
(`derived_from`), and that is *not* the evidence the bank's growth rule demands — teaching material
and a fictional teaching project cannot promote a question. A tier 1 question becomes official when
it has surfaced a forgotten rule on real client work: fill `field_evidence`, drop `status`. Say
"ชั้น 1 ยังเป็นร่าง" once per module when running it, so nobody mistakes it for field-tested.

## Answers that land on a rule that already exists

The silent failure `/req:capture` guards against arrives through this door too, and here it is easier
to walk into: the owner answers a question about approvals, the bank asks it again from a different
angle three rounds later, the answer comes back slightly different, and a second `BR-xxx@v1` gets
drafted next to the first. Different `base_id`, so check 7 has nothing to object to; coverage still
100%; two rules now contradict each other and nothing says which is real.

**Two signals differ from the capture path.** Capture's strongest signals are document-shaped — a
changed `SRC` hash, an id the owner typed — and neither exists here. What this path has instead:

| signal | weight |
|---|---|
| an existing rule under the same `belongs_to` covers the same **tier 2** question-bank category | **highest** — those ten categories are the closest thing to a topic key the spec has (tier 1 categories produce no rules, so they are not signals here) |
| this session already drafted a rule from an earlier round of the same category | highest, and it is the common case |
| the statements differ only in a numeric token | medium — and remember a rule whose numbers live in a `CALC` will show no prose difference at all |
| the statements contradict in meaning | low — **always confirm**, however confident |

**A signal raises the question; it never settles it.** Whether the owner meant to change the rule or
is talking about something else is a business decision, and no script can read it — which is why this
is a confirmation round and not a check with a number.

### Correcting a draft this command created

Not every correction is a version bump. An answer that fixes a rule **this session drafted and nobody
has built on yet** is the owner correcting themselves, not a change of policy. Edit it in place.

Allowed **only when all five hold** — read them off `spec.json`, do not judge:

```
status === "draft"           nobody has validated or locked it
version === 1                it has never superseded anything
examples[] is empty          no example proves it yet
no CALC constrains it        no calculation contract is pinned to this version
no GD or CHG references it   no answer key and no change set point at it
```

All five → overwrite `statement`, keep the same `@v1`, add the new answer to `provenance`. No `CHG`,
no `change_reason`, no version move — nothing downstream existed to protect.

**Any one missing → do not edit.** Say which condition failed and route:

```
BR-job-020@v1 แก้ทับที่เดิมไม่ได้ — ติดเงื่อนไข: มี EX-job-040 พิสูจน์อยู่ · มี CALC-job-010@v1 ผูก
  เดิม : ยอดส่วนเพิ่มคิดตามช่วงระยะทาง
  ใหม่ : ยอดส่วนเพิ่มคิดตามช่วงระยะทาง และคิดเพิ่มถ้าเป็นงานเร่งด่วน

  ถ้าเป็นการเปลี่ยนกฎจริง → สั่ง /req:change BR-job-020@v1
  ถ้าเป็นกฎคนละข้อ       → บอกว่าต่างกันตรงไหน แล้วผมจะร่างเป็น BR ใหม่
  ยังไม่แน่ใจ             → 🛑 การ์ดแดง
```

**`/req:ask` never runs `/req:change` itself**, and never produces `@v(n+1)`. Two commands able to
move a rule's version is the second extraction path the doctrine forbids; this one prints the command
to type and stops. Log the prompt either way — a question deferred and then forgotten is a question
that comes back during implementation.

## Guardrails

- **Framing before rules** — tier 1 runs once per module before the first rule question. A rule
  elicited before anyone agreed what the module is for gets re-argued during scope review.
- **Blue cards before green cards** — finish eliciting rules before `/req:example`.
- **Timebox 25 minutes per story**, then stop, summarise, decide.
- Do not add questions to the bank from theory. New entries only when real client work surfaces them.
