# dirty fixture — what each node deliberately violates

This spec is broken on purpose so both gates can be proven to actually check things. A checker that
only ever sees valid input is indistinguishable from a checker that checks nothing.

> **This fixture's state directory is `.notaeon/`, not the default `.aeon/` — on purpose.**
> The directory name is a parameter, and a parameter nobody ever passes a non-default value to is
> indistinguishable from a hardcoded constant. `clean/` exercises the default, `dirty/` exercises
> `--state-dir`, so both paths through the resolver are covered by the numbers below.
> Run it without the flag and you get exit 2 naming `.aeon/spec.json` — the resolver never goes
> looking for a spec.json somewhere else.

```bash
# semantic gate — expect exit 1, all fourteen checks reporting
node ../../verify-rules.mjs --root . --state-dir .notaeon

# structural gate — expect "invalid"
npx --yes ajv-cli@5 validate -s ../../../../../schemas/spec.schema.json \
  -d .notaeon/spec.json --spec=draft2020 --strict=false

# rollup — expect drift, exit 1 (this fixture's rollup{} is wrong on purpose; see check #9)
node ../../rollup.mjs --root . --state-dir .notaeon

# wiki bundle — expect drift, exit 1 (six pages are planted wrong on purpose; see check #12)
# ⚠️ NEVER run this with --write on dirty/: it would repair all six plants at once
node ../../wiki.mjs --root . --state-dir .notaeon
```

Expected results — all four are contracts, not observations:

| gate | expected |
|---|---|
| `verify-rules.mjs` | **44 errors, 19 warnings, exit 1** (`--cp1` → 43/19 · `--cp2` → 30/0) |
| `ajv` | **invalid** |
| `rollup.mjs` | **7 field(s) out of date, exit 1** — last one reported is `ready_for_next_step: file says true · computed false` |
| `wiki.mjs` | **exit 1** — 1 `MISSING` (`examples/EX-job-099.md`), 4 `STALE`, 1 `ORPHAN` (`rules/BR-job-777@v1.md`) |

> **The totals have moved four times, every time deliberately (2026-08-13):**
>
> | round | added | errors | warns |
> |---|---|---|---|
> | 2 · `calculations[]` | `CALC-job-010`, `BR-job-021@v1.constrained_by` — check 4, gate `ALL` | 29 → 31 | 5 → 5 |
> | 3 · `golden_datasets[]` | `GD-job-020` (check 4) · two check-13 warns, gate `CP1` | 31 → 32 | 5 → 7 |
> | 4 · `changes[]` + CALC `@v` | `CHG-job-010`, `CALC-job-010@v2`, `CALC-job-011@v2` — check 4 ×2, check 6 ×2, check 7 ×3, check 14 ×3 | 32 → 39 | 7 → 10 |
> | 5 · `docs/wiki/**` + check 12 | six planted pages — check 12 ก ข ค ง ฉ (error) · ช (warn) · plus eight ⚠️ จ that fall out of refs already broken at the spec level | 39 → 44 | 10 → 19 |
>
> `--cp2` keeps **0 warnings** throughout because checks 12, 13 and 14 are gate `CP1`, like check 11.
> `rollup` has not moved in any round: none of them adds a counter, because `rollup` is
> `additionalProperties: false` and check 9 compares every key exactly (design §9).
>
> **Round 4's CALC-id migration was measured separately from its new checks.** Both fixtures moved
> from `CALC-job-0xx` to `CALC-job-0xx@v1` *before* checks 6/7/14 were extended, and dirty still
> reported 32/7 at that point — so the +7/+3 above is attributable to the new checks, not to the
> rename.
>
> **Round 5 was measured in the same two steps.** The bundle was first rendered whole into both
> fixtures with check 12 already live: `clean` stayed at 0/0 and `dirty` measured **39/17** — the
> error count unmoved, proving that adding 35 files perturbs nothing by itself, and +7 warnings that
> are all ⚠️ จ links pointing at ids the spec already fails to resolve (checks 4 and 7 report the
> same underlying breakage). Only then were the six pages planted: **39/17 → 44/19**.

## Planted violations

| node | violates | check |
|---|---|---|
| `SRC-010` | `path` outside `docs/` | 8 |
| `SRC-011` | file missing on disk — provenance chain broken | 8 |
| `SRC-012` | recorded hash ≠ file on disk (file was edited after import) | 8 ⚠️ warn |
| `SRC-013` | `validation.state: "deferred"` with no `Q-xxx` minted; file also missing | 4, 8 |
| `SRC-014` | `kind: "sample_data"` with no `masked` — a customer data extract written into git history without the PII question being answered | **structural gate only — see below** |
| `REQ-job-002` | empty `actor` and `goal`; `rules[]` names `BR-job-030` which does not exist; provenance cites `SRC-099` which does not exist; no generated `.md` | 1, 4, 10 |
| `BR-job-020@v1` | `is_current` with zero examples — nobody proves it | 2 |
| `BR-job-021@v1` | `status: superseded` but `is_current: true` and no `superseded_by` | 6 |
| `BR-job-022@v1` + `@v2` | both marked `is_current` for the same base id | 7 |
| `BR-job-022@v2` | version 2 with no `supersedes` and no `change_reason` | 6 |
| `EX-job-041` | `proves` a bare `BR-job-022` with no `@v` | 4, 7 |
| `EX-job-099` | `proves` `BR-job-999@v1`, which does not exist | 4 |
| `CALC-job-010` | `constrains` points at `BR-job-999@v1`, which does not exist — a calculation contract pinning nothing | 4 |
| `BR-job-021@v1` | `constrained_by` points at `CALC-job-999`, which does not exist — the back-edge dangles | 4 |
| `CALC-job-011` | `numeric_type: "float"` — money in binary floating point | **structural gate only — same class of gap as `SRC-014`** |
| `GD-job-020` | `proves` points at `BR-job-999@v1`, which does not exist — an answer key for nothing | 4 |
| `BR-job-020@v1` | `kind: "calculation"` with **no** golden dataset — the formula is agreed and nobody has run the numbers | 13 ⚠️ |
| `BR-job-022@v1` + `GD-job-021` | answer key exists but `verified_by` / `verified_at` are `null` — a script's output that no human has signed | 13 ⚠️ |
| `CHG-job-010` | `affects` points at `BR-job-998@v1` and `triggered_by` at `SRC-099`, neither of which exists · no `approved_by` · `invalidates` `GD-job-021` with no verified replacement | 4 ×2, 14 ⚠️ ×2 |
| `CALC-job-010@v1` + `@v2` | a **well-formed** supersession chain that **no change set records** — the one case check 14 exists for. `constrains` on both still dangles at `BR-job-999@v1` | 14 ⚠️ (4 ×1 from `@v2`) |
| `CALC-job-011@v2` | version 2 with no `change_reason` · `supersedes` `@v1` while `@v1.superseded_by` is empty · both versions `is_current` · **both constrain `BR-job-020@v1`** | 6 ×2, 7 ×2 |
| `Q-job-009` | open red card | 3 |
| `DQ-job-005` | open spillover **(CP2 only — must NOT appear under `--cp1`)** | 5, 7 |
| `rollup` | all seven numbers disagree with the file — including `ready_for_next_step: true` on a spec with an open red card | 9 |
| `UL-job-010` | empty `definition`; `not_to_confuse_with` points at `UL-job-999` which does not exist | 11 ⚠️ |
| `UL-job-011` | defined but no requirement references it (orphan vocabulary) | 11 ⚠️ |
| `REQ-job-002` | `domain_concepts` names `UL-job-777`, absent from the glossary | 11 ⚠️ |

### Planted in `docs/wiki/**` (round 5) — one page per sub-check, so a number maps to a page

The bundle here was **generated** by `wiki.mjs --write` and then damaged in six places. Everything
not listed below is a faithful render, which is what makes the six visible.

| page | violates | check |
|---|---|---|
| `questions/Q-job-009.md` | frontmatter block deleted entirely — an OKF page no consumer can read | 12 **ก** |
| `glossary/UL-job-010.md` | `type: Bogus Concept` — outside the closed list of the project bundle | 12 **ข** |
| `examples/EX-job-040.md` | `id: EX-JOB-40` — right type, wrong id shape. Note the hash still matches: (ง) alone would pass this page, which is why (ก)(ข)(ค) exist | 12 **ค** |
| `rules/BR-job-020@v1.md` | `spec_hash` zeroed — the page spec.json moved out from under | 12 **ง** |
| `examples/EX-job-099.md` | **deleted** — a node in the spec with no page at all | 12 **ฉ** (+1 ⚠️ จ, below) |
| `rules/BR-job-777@v1.md` | a page no node produces — what an id rename leaves behind | 12 **ช** ⚠️ |

**The eight ⚠️ จ warnings are consequences, not plants.** Seven come from ids the spec already fails
to resolve (`BR-job-999@v1`, the bare `BR-job-022`, `REQ-job-002`'s missing generated doc, and the two
source files that are not on disk) — the renderer writes an honest link to a file that legitimately is
not there. The eighth is `examples/index.md` pointing at the page deleted for (ฉ): deleting a page
breaks its index row, and **two checks catching one problem from opposite directions is the intended
behaviour**, not double counting. All eight close by fixing the spec, which is the test that a warning
is legitimate: a warning that cannot be closed teaches people to ignore every warning.

> **`SRC-010`'s path is outside `docs/` and its page shows it as text, not a link** — a bundle-relative
> link to `C:\Users\…` is broken by construction, and check 8 already reports the real problem. So
> (จ) does **not** fire for it. A checker inventing a second complaint about a problem another check
> already owns is how error counts stop meaning anything.

## `SRC-014` is caught by ajv and by nothing else — that is a known, undecided gap

`masked` is `required` for `kind: "sample_data"` in the schema, so the structural gate rejects
`SRC-014`. `verify-rules.mjs` says nothing about it: check 8 owns "sources on disk" and finds the file
present with a matching hash, and the design deliberately left the original eleven checks alone.

That matters because the structural gate is **optional** — `commands/check.md` runs ajv only on
request and continues when `npx` is unavailable. So today a data extract can be committed with the
PII question unanswered and the gate everyone actually runs stays green. `SRC-014` exists so that gap
is visible in a file rather than remembered by one person.

Closing it means either folding the rule into check 8 (which the design froze) or making the ajv pass
mandatory. Both are the owner's call, not something to resolve by quietly editing a checker.

**`CALC-job-011` (`numeric_type: "float"`) is the same shape of gap, added in round 2.** The enum in
the schema has no `float` member, so ajv rejects it; `verify-rules.mjs` never looks at the field. Same
consequence: skip the optional structural pass and money-in-float ships green. It is listed here for
the same reason as `SRC-014` — so the hole lives in a file instead of in someone's memory.

**~~Two CALCs may still point at the same rule version and nothing complains.~~ CLOSED in round 4**
— check 7 now reports *"N current calculation contracts constrain this rule version"*, and
`CALC-job-011@v1`/`@v2` in this fixture is the planted case that proves it fires. The round-2 note
that deferred it is kept struck through rather than deleted: a deferral that quietly disappears
leaves nobody able to tell whether it was closed or forgotten.

**`computed_by` is not checked for existence** — `GD-job-020` and `GD-job-021` both point at scripts
that are not on disk, and every gate stays quiet about it. Check 13 as designed asks one question
only: does this calculation rule have a signed answer key. Whether the script that produced it still
exists is a second question, and folding it in would mean check 13 owns two responsibilities and its
name stops describing it. The clean fixture ships a real, runnable
`.aeon/golden/CALC-job-001@v1.mjs` so the doctrine is demonstrated even though it is not yet enforced.
Same class of decision as the `CALC` 1:1 gap above: deferred on purpose, written down here.

**Checks 11, 13 and 14 are warn-level on purpose, and so are check 12's (จ) and (ช).** Every
vocabulary, golden-dataset, change-set, broken-link and orphan-page problem above must appear as ⚠️
and the error count must stay at 44 — if one of them ever raises the error count, someone promoted a
check to blocking without deciding to.

Each has its own reason for not blocking yet, and they are not the same reason:

- **13** — the first calculation rule ever captured would turn CP1 red before anyone had a chance to
  run `/req:golden`. A gate that is red from birth teaches people to stop reading it.
- **14** — any spec written before `/req:change` existed has superseded nodes with no change set,
  and no amount of care can retroactively give them one. Blocking would punish history.
- **12 (จ)** — set by DOC-STANDARD §9, not chosen here: the same rule is D5 on the authoring gate and
  **the two gates are forbidden from levelling it differently**. It moves when both move.
- **12 (ช)** — an orphan page is a leftover, not a lie: the spec is still correct and every other page
  still renders. Deleting the file is the fix, and deleting files is a decision a checker should
  report rather than force. Note `wiki.mjs --write` leaves orphans in place for the same reason.

**Check 12's errors are not warn-first.** (ก)–(ง) and (ฉ) describe a bundle that is either unreadable
or lying about being current — the identical failure check 10 has blocked on since v0.2.0. The
warn-first convention is for checks whose value is unproven; these inherit a case already made.

**Check 14 does not fire on a superseded node with no successor** (`BR-job-021@v1` here): that is
already check 6's error, and reporting it twice under two numbers would make both harder to trust.

## The clean fixture's answer key must equal live script output

`clean/` ships a runnable generator, and that is the point of it:

```bash
node .aeon/golden/CALC-job-001@v1.mjs      # from fixtures/clean
```

**Its stdout must equal `golden_datasets[0].rows` verbatim** — same seven rows, same values, same
order. Nothing enforces this yet (check 13 asks only whether a signed key exists), so it is stated
here as a contract a human or a diff can hold: an answer key that no longer matches the script that
produced it is a hand-edited answer key, which is the one thing `/req:golden` exists to prevent.

Three of those rows (`from_source_row: SRC-004 …`) also match the customer's own numbers in the
sample extract — 300.00 / 420.00 / 450.00. That agreement is the only independent check Phase 1 has.

## Gate isolation

`--cp1` must report 43 errors (19 warnings) and **must not** include check 5.
`--cp2` must report 30 errors (0 warnings), must include check 5, and **must not** include
checks 1, 2, 3, 8, 10, 12.

**`--cp2` staying at 0 warnings is the tripwire that catches a mis-gated check.** Check 12 was added
with every one of its seven sub-checks on gate `CP1`; had any been left on `ALL`, this number would
have moved and the CP2 report would have started carrying noise about a bundle CP2 does not gate.

That separation is the point: spillover questions are designed to be answered in Phase 2, so if they
blocked CP1 the phase could never close.

## Keep this fixture free of annotation keys

Earlier revisions carried `_violates` notes inside the JSON. They read nicely but made the file fail
schema validation on `additionalProperties` before any real violation was reached — so the structural
gate could never be tested. Explanations live here instead.
