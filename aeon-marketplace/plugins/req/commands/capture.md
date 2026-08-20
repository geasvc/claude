---
description: Beat A — take raw requirements (typed text + any number of attachments) into spec.json with provenance
argument-hint: "[module] [file...]"
---

# /req:capture — the single door for raw requirement input

Invoke the `requirement-and-rule-mapping` skill and follow `references/capture-flow.md`.
Replaces the old `/req:new` + `/req:import` split — input arrives as one mixed batch, so it is one command.

## Steps

1. **Inventory first.** List every input as a numbered `SRC-xxx` (typed text, each attachment,
   each pasted image) and show the list before doing any work.
2. **Land every file under `docs/`.** Already there → reference the path, do not copy. Outside the
   project → copy into `docs/sources/` and record `imported_from`. **Pasted image → write it to
   `docs/sources/` first** (it has no path and dies with the window). Hash the stored file.
3. **Extract per format.** For `.xlsx` capture the **formula alongside the value** — the rule lives
   in the formula. Anything a model read from an image goes in `interpretation`, never `extracted`.
   A **customer data extract** is `kind: "sample_data"`, not `file` — see the section below, and
   settle its PII question before the file is written.
4. **Propose vocabulary, then draft.** Pull candidate terms out of the input into `glossary[]`
   (`term_th`, `term_en`, `definition`, `aka`, `not_to_confuse_with`) — vocabulary must settle before
   rules, or every rule referencing an ambiguous word is ambiguous too. Watch specifically for one
   Thai word covering two things (งาน = Job or Trip?) and for two words meaning the same thing.
   Then draft candidate REQ / BR / EX with `status: "draft"`. `domain_concepts` holds `UL-xxx`
   references, never bare strings. Leave `becomes_entity: null` — that is Phase 2's job.
   Propose; do not commit rules unseen.

   **Who owns `glossary[]`** — capture and `/req:ask` tier 1 both write it, and the split is fixed so
   it does not get re-argued: **capture proposes terms** (`term_th`, `term_en`, `definition`) from
   the input it just read, and **flags** collisions it noticed. **Tier 1 `language` resolves them** —
   its question is "<คำ ก> กับ <คำ ข> เป็นสิ่งเดียวกันไหม", and its answer is what writes `aka`
   (same thing) or `not_to_confuse_with` (deliberately different). Capture may fill either field only
   when the source states it outright, never as a reading. A collision capture noticed and did not
   resolve is reported at the stop, not guessed at — that is the pair tier 1 is there to settle.
5. **Classify every drafted rule as NEW / SAME / CHANGED / UNSURE** before anything is written —
   see *"Is this a new rule, or the same rule changed?"* below. This is not optional and not a
   judgement call the model gets to make alone.
6. **Confirm in rounds of 3**, in this order:
   1. which REQ / how to split — nothing can be compared to existing rules until the REQ is known
   2. **which drafts are changes to existing rules** — if a rule is a change, the remaining questions
      about it are not asked here at all; they belong to `/req:change`
   3. conflicting sources
   4. interpretations that produced a rule
   5. the rest (state how many are queued)

   Every question offers "ยังไม่แน่ใจ / ต้องถามลูกค้า"; choosing it sets `validation.state: "deferred"`
   and mints a `Q-xxx` red card.
   **Splitting a document across requirements is a business decision — always confirm it.**
7. **Write** `<state-dir>/spec.json` — the state directory is a PARAMETER, default `.aeon`. Never
   type the name: resolve it first and use what it prints.
   ```
   node "${CLAUDE_PLUGIN_ROOT}/scripts/state-dir.mjs"          # prints the directory name
   ```
   Write the new and changed nodes, and leave `rollup` alone.
   Creating the file for the first time: `meta.schema_version` is **`"0.3.0"`**, and it is a `const`
   in the schema, so any other value is rejected whole — there is no partially-valid spec. Never
   change this value on an existing file to make a validation error go away: a version mismatch
   means the file was written against a different contract, and editing the label hides that instead
   of fixing it.
   Fix the counts with the script instead, then read the numbers off its output:
   ```
   node "${CLAUDE_PLUGIN_ROOT}/scripts/rollup.mjs" --root . --write
   ```
   **Never recount `rollup` by hand.** Counting current rules means holding the whole file in
   context, and doing that once per command is what field-test round 1 spent ~449k tokens on.
   The script prints the corrected block — report from that, do not re-read the file to confirm.
8. **Regenerate** `docs/requirements/REQ-xxx.md` for every touched requirement. Get the header's
   `spec-hash` from the shared implementation — **never recompute it by hand**:
   ```
   node "${CLAUDE_PLUGIN_ROOT}/scripts/doc-hash.mjs" --root . [REQ-id]
   ```
   A hand-rolled hash with different key order or spacing makes every document stale from birth.
9. **Regenerate `docs/wiki/**`** — the agent-readable render of the same data. Run the script;
   do not write these pages yourself:
   ```
   node "${CLAUDE_PLUGIN_ROOT}/scripts/wiki.mjs" --root . --write
   ```
   Every page carries a `spec_hash` that check #12 compares against a freshly computed
   `nodeDocHash`. A page written by hand would differ in bytes while the hash stayed put, so the
   bundle would be stale from birth — the same failure `doc-hash.mjs` exists to prevent for
   `REQ-xxx.md`. The script is idempotent: run it twice and the second run writes nothing.
   `log.md` is append-only and is never overwritten by it.
10. **Verify:** `node "${CLAUDE_PLUGIN_ROOT}/scripts/verify-rules.mjs" --root . --cp1` and show the result.
11. 🛑 **Stop.** Summarise what was captured, what is still open, **and what was frozen pending a
    change decision**, then wait for approval. Do not continue into `/req:ask` or `/req:change`.
    Name the next command without running it: if this module has never been framed, that is
    `/req:ask` **tier 1** (2 rounds, once per module) — capture is its precondition, since a framing
    red card can only point at a `SRC` and this is the command that mints them. Also list any term
    collision left unresolved, so the framing round has its pairs ready.

## Is this a new rule, or the same rule changed?

### The silent failure this prevents

The old instruction covered only `locked` and `superseded` nodes. Most rules in real life are `draft`
or `validated`, and for those nothing said what to do — so the default behaviour took over: draft a
new rule from the input.

```
BR-loan-004@v1  "ดอกเบี้ย 25% ต่อปี"   is_current ✅  2 examples
BR-loan-009@v1  "ดอกเบี้ย 23% ต่อปี"   is_current ✅  2 examples   ← drafted from the customer's Line message
```

**Every check passes.** Different `base_id`, so check 7 has nothing to object to. Coverage 100%. No
red cards. And the spec now holds two rules that contradict each other with nothing to say which one
is real — until somebody writes the code. What should have been `@v2` became a separate rule, and the
whole versioning apparatus was stepped around without a single warning.

### Four outcomes per drafted rule — one must be chosen before anything is written

| outcome | means | what capture does |
|---|---|---|
| 🆕 **NEW** | collides with nothing | draft `BR-xxx@v1` as usual |
| ♻️ **SAME** | same thing said again | **do not draft** — add `provenance` to the existing rule. A second source confirming a rule is an asset, not a duplicate. ⚠️ but if that REQ also has a CHANGED item, this waits — see freezing |
| ⚠️ **CHANGED** | contradicts an `is_current` rule | 🛑 **stop, report, ask — write nothing, regenerate nothing** |
| ❓ **UNSURE** | cannot tell refine from contradict | 🛑 stop the same way · "ยังไม่แน่ใจ" → `Q-xxx` red card |

**UNSURE must be a real fourth option.** The common case is not a clean contradiction, it is
*"อายุ 20–60"* becoming *"อายุ 20–60 และต้องไม่เป็นพนักงานสัญญาจ้าง"* — an added condition, or a
different rule entirely. Forced to pick NEW or CHANGED, a model guesses, and guesses wrong about half
the time.

### Signals: what can be measured, and what only a model read

Same discipline as `extracted` vs `interpretation` — **a measurable signal raises the question; it
never settles it.**

| layer | signal | weight |
|---|---|---|
| measurable | **the hash of an existing SRC changed** — check 8 already warns "file changed since import". A TOR revised in place is a change almost by definition | highest, and already in the system |
| measurable | the owner typed a `BR-xxx` id in the input | highest |
| measurable | **`CALC` field diff** — the draft lands on a field of an existing contract (`formula`, `rounding_mode`, a rate, a band) | high · comparing fields beats comparing prose |
| measurable | same `belongs_to` **and** the numeric tokens in `statement` differ | medium |
| model read | the statements contradict in meaning | low — **always confirm**, however confident |

Two traps that make detection silently useless if missed:

1. **`domain_concepts` lives on `requirement`, not on `ruleVersion`.** Comparing "same vocabulary" between
   two rules inside one REQ therefore compares a constant with itself. The only usable structural
   signal at rule level is `belongs_to`.
2. **"25% → 23%" is a `CALC` signal, not a `statement` signal.** When the rate lives in the calculation
   contract, the rule may read *"คิดดอกเบี้ยแบบลดต้นลดดอกตาม CALC-loan-002"* and diffing the prose finds
   nothing at all. **A rule whose numbers live in a CALC can only be caught by the CALC signal.**

**Ask in every case, even when every signal is measurable.** What is measurable is *"the text
differs"*. What has to be known is *"did the customer intend to change the rule, or are they talking
about something else"* — and that is a business decision, exactly like splitting a document across
requirements.

### Freezing — what capture may write when it finds a change

The unit of freezing is **the REQ**, and freezing means **write nothing for it**, not write-then-skip-render.

| thing | written on finding a change? | why |
|---|---|---|
| `sources[]`, the files under `docs/`, hashes | ✅ **write** | evidence is neutral — it does not depend on how the decision goes. And a pasted image dies with the window: not writing it now means losing it |
| `extracted` / `interpretation` for those sources | ✅ write | same reason |
| the **CHANGED** `BR` node | ❌ **never** | `/req:change` is the only path to `@v(n+1)`. Two paths to the same node is the second extraction path the doctrine forbids |
| everything else in that REQ — **including `provenance` for SAME items** | ❌ **hold** | `provenance` sits on the rule node, so writing it moves `reqDocHash` — and regeneration is forbidden, so check 10 goes red while nobody is allowed to fix it |
| `docs/requirements/*.md` and `docs/wiki/**` for that REQ | ❌ **never regenerate** | the point of the whole rule |
| other REQs in the same batch with no CHANGED item | ✅ finish normally | freezing the whole batch over one rule punishes the user for the tool's caution |

Report what is being held, by name:

```
ค้างไว้เพราะ REQ-loan-002 มีรายการที่ต้องตัดสินก่อน:
  · SRC-010 ยืนยัน BR-loan-006@v1 (ไม่ได้ขัดกัน) — จะเพิ่ม provenance ให้หลังเคลียร์
```

Held items get written when `/req:change` finishes, or when the owner answers "not a change" and runs
capture again. **Frozen means the file is untouched**, so `spec-hash` never moves, checks 10 and 12 stay
green, and there is no half-written "pending regeneration" state for anyone to forget about.

### How to report it

Announce before asking, and **put the old and new lines next to each other** — that is what people
decide from:

```
⚠️ เจอ 1 รายการที่น่าจะเป็นการ "เปลี่ยนกฎเดิม" ไม่ใช่กฎใหม่ — ยังไม่เขียนอะไรลงไฟล์

  BR-loan-004@v1  (is_current · มีตัวอย่าง 2 ตัว · ใช้โดย CALC-loan-002@v1)
    เดิม : ดอกเบี้ยลดต้นลดดอก 25% ต่อปี          ← SRC-002 TOR หน้า 3 §5.6
    ใหม่ : ดอกเบี้ยลดต้นลดดอก 23% ต่อปี          ← SRC-009 ไลน์ 13 ส.ค. (คุณเอ)
    สัญญาณ: REQ เดียวกัน · ตัวเลขใน CALC ต่างกัน (วัดได้ ไม่ใช่การตีความ)

  ถ้าเป็นการเปลี่ยนจริง จะกระทบต่อ:
    · CALC-loan-002@v1  สัญญาการคำนวณต้องขึ้นเวอร์ชันตาม
    · GD-loan-003       เลขเฉลย 12 แถวใช้ไม่ได้ ต้องคำนวณใหม่
    · EX-loan-021/022   ต้องตรวจว่ายังพิสูจน์ข้อความใหม่ได้ไหม

  1) ใช่ เป็นการเปลี่ยน → สั่ง /req:change BR-loan-004@v1
  2) ไม่ใช่ เป็นกฎคนละข้อ → ร่างเป็น BR ใหม่ (บอกด้วยว่าต่างกันตรงไหน)
  3) ยังไม่แน่ใจ / ต้องถามลูกค้า → 🛑 การ์ดแดง

  ส่วนที่เหลือของ batch (SRC-010, SRC-011 → REQ-loan-003) ไม่ชนกับกฎไหน ทำต่อให้แล้ว
```

**Capture never runs `/req:change` itself**, even when the answer is 1. It prints the command to type.
Every command stops for approval; there is no exception for an obvious next step. Record the notice
either way — a deferred question that leaves no trace is a question that comes back during coding.

### The limit, stated plainly

**Change detection cannot be a deterministic gate.** No script answers "do these two statements
contradict each other". What the gate does own is everything downstream: once the owner says it is a
change, `/req:change` produces `@v(n+1)` and checks 6, 7 and 14 hold the result to account. Detection
raises the question; the human answers it; the scripts enforce the consequence.

## Sample data — a different kind of input, not a smaller document

An extract of the customer's real records answers **"what is the correct value"**. A TOR, a chat, a
photo answer **"what is the rule"**. Filing the first as a document is the failure this kind exists to
prevent: 500 rows read as a rule source yields a rule that describes that one extract and nothing else.

- Record it as `kind: "sample_data"` with `extracted.schema[]` (the columns, read from the file),
  `extracted.rows[]` (a bounded sample) and `extracted.row_count` (the real total from a parser).
  **State counts from `row_count`, never from `rows.length`** — the sample is not the file.
- **Never draft a `BR-xxx` from it.** What it may produce is a *suspicion* that goes into the
  confirmation round with its denominator attached: *"47 of 500 rows over 1,000 got 7% off — is that
  a rule, or a coincidence?"* Option 3 stays "ยังไม่แน่ใจ / ต้องถามลูกค้า" → `Q-xxx` red card.
- Its real job comes later: these are numbers the customer already believes, so once a calculation
  contract exists, our computed answer gets diffed against theirs. That diff is where missing rules
  surface. Until then the extract sits captured and unused — which is correct, not incomplete.

**PII — ask before writing, not after.** These extracts normally carry real names, ids and phone
numbers, and `docs/` is under git: once written, it is in history forever, and deleting the file later
does not remove it. So before the file lands, offer to mask the personal columns, then record the
owner's answer in `masked` (`true` = masked, `false` = kept verbatim on purpose) and say what was
masked in `masked_note`. The schema requires `masked`, so it cannot be quietly skipped — but the value
must come from an answer, never from an assumption about what the owner would have said.

## Regenerate-only mode — invoked with no new input

`/req:capture` with nothing attached is a **valid, defined flow**: the owner edited `spec.json` by
hand (they own it) and the generated documents are now stale. `/req:gap` and `/req:check` are 👁 and
must not write, so this is the command that repairs it.

Do exactly this, and nothing else: run `scripts/rollup.mjs --write` → regenerate every
`docs/requirements/*.md` whose hash no longer matches → run `scripts/wiki.mjs --write` →
run the checker → report what changed → 🛑 stop.
**Do not draft new rules, do not ask questions, do not touch `sources[]`.**

> **`docs/wiki/**` was added to this list in round 5, and it is a change to what this command
> promises — written here rather than inferred.** Before round 5 "regenerate" meant one directory;
> now it means two renders of the same truth, and a mode that repaired only one of them would leave
> check #12 red while claiming it had repaired the documents.
>
> **The script never deletes.** An orphan page — one whose node was renamed or removed — is reported
> and left where it is. Deleting a file is a decision the owner makes, not a side effect of a
> regeneration they asked for; report it and stop.

## If the project already has a spec.json

Continue id numbering from the highest existing id per prefix. **Never modify a node of any status
in place when the input contradicts it** — not `locked`, not `superseded`, and not `draft` either.
Every one of those is a `/req:change` situation: classify it, freeze the REQ, report, and stop.

The old wording named only `locked` and `superseded`, which left `draft` and `validated` — most rules
in practice — with no instruction at all. That gap is what the classification section above closes.
