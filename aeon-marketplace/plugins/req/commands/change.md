---
description: Move a rule or calculation contract up a version the legal way, and record why as a change set
argument-hint: "<BR-id|CALC-id>"
---

# /req:change — version bump

Invoke the `requirement-and-rule-mapping` skill.

**This is the only path that creates `@v(n+1)`.** Not a convenience — a constraint. If `/req:capture`
could also bump a version there would be two ways to produce the same node, which is the one thing
this plugin's doctrine forbids outright (*"never build a second extraction path"*). Everything else
that meets a changed rule stops and points here.

Before this command existed the instruction was "report and stop", which in practice meant editing
`spec.json` by hand — the single easiest way to break `@v` discipline.

## Steps

1. Resolve the argument to a version id and **show the old and new statements on adjacent lines**.
   People decide by seeing two lines, not by reading an explanation. Do not proceed until the owner
   has seen both.
2. **Require `change_reason`.** No reason, no version. Check 6 would fail it anyway; catching it at
   the question is cheaper than catching it at the gate, and the answer is better while the
   conversation is still open.
3. Create `@v(n+1)` and close the chain **in both directions**:
   - new node: `supersedes`, `change_reason`, `is_current: true`, **`effective_from`**
   - old node: `superseded_by`, `superseded_at`, `is_current: false`, `status: "superseded"`

   `effective_from` goes **on the version node**, not only on the change set. Check 14 is warn-level,
   so walking CHG → node is not guaranteed to work; if the date lived only on the CHG, *"which
   version applied when this application was created"* would be unanswerable exactly when a customer
   asks it. `effective_from` (when it applies in the world) and `superseded_at` (when the old version
   stopped being current here) are different dates whenever a change is agreed before it takes
   effect — which is the normal case.
4. **Ask about each existing example, one at a time.** This is the step people skip, and skipping it
   produces coverage that proves nothing:

   > `EX-job-021` proves `@v1`: "แก้ได้เลย". The new statement is "ต้องอนุมัติก่อน".
   > 1) still proves it → add `@v2` to that example's `proves`
   > 2) no longer proves it → leave it on `@v1` only. **The new rule now has zero examples and
   >    coverage drops — that is the correct outcome**, not a regression to paper over
   > 3) not sure → 🛑 red card

   Never carry examples forward silently. An example inherited across a contradicting change is a
   green tick with nothing behind it.
5. Report the blast radius **before** writing:
   - the `CALC` pinned to this rule — a rule change usually means the contract versions too, and
     that is a second `/req:change` on the `CALC-id`, not an edit
   - every `GD` computed under the old contract — those numbers are no longer evidence; they go in
     the change set's `invalidates[]` and must be re-run with `/req:golden`
   - `traces_down` (features / tests) if present
6. Write the `CHG-xxx` node: `at`, `requested_by`, `approved_by`, `triggered_by[]`, `reason`,
   `affects[]` (the NEW versions), `invalidates[]`, `effective_from`.

   A change set is a node rather than a log line because **one decision moves several nodes at
   once** — drop an interest rate and the rule, the contract and the answer key all move together.
   Keeping the reason inside each node copies it three times and loses the fact that it was one
   event, which is exactly what the customer is asking about when they say *"what changed on the
   13th, and who asked for it?"*
7. Fix derived counts, regenerate, verify:
   ```
   node "${CLAUDE_PLUGIN_ROOT}/scripts/rollup.mjs" --root . --write
   node "${CLAUDE_PLUGIN_ROOT}/scripts/doc-hash.mjs" --root . [REQ-id]
   node "${CLAUDE_PLUGIN_ROOT}/scripts/wiki.mjs" --root . --write
   node "${CLAUDE_PLUGIN_ROOT}/scripts/verify-rules.mjs" --root . --cp1
   ```
   The wiki step matters most in this command: a rule page renders its whole `## ประวัติ` table, so a
   new `@v` changes **every sibling version's page** plus the new `CHG` page. Regenerating only the
   requirement doc leaves those stale and check 12 red.
   Expect coverage to drop if any example was retired at step 4. **Do not fix that by adding
   examples in this command** — send the owner to `/req:example` as a separate, approved step.
8. 🛑 **Stop.** Show: old → new, the change set, what was invalidated, and the exact next commands
   (`/req:change` on the CALC · `/req:golden` to re-derive · `/req:example` to restore coverage).

## What this command must not do

- **Never edit a version in place.** A superseded node stays readable forever: features and tests
  built against `@v1` still point at `@v1`, and that is how *"the rule was different when this job
  was created"* stays answerable.
- **Never run the follow-ups itself**, however obvious they are. Every command stops for approval;
  a chain that runs three commands from one instruction is exactly the orchestration this plugin
  exists to avoid.
