---
description: Produce the answer key by RUNNING code, then have a human sign it (golden dataset)
argument-hint: "<BR-id|CALC-id>"
---

# /req:golden — answer key

Invoke the `requirement-and-rule-mapping` skill.

The only **Verify**-type command in Phase 1. Everything else captures what people say; this one
produces numbers and asks whether they are right. A formula everyone agreed to is not the same as
numbers anyone has checked — the EMI whose final instalment turns out to be 9,504.**43** is only
discovered by running it, never by reading the formula again.

## Four rules that are not negotiable

1. **Never compute in your head, and never write a number you did not run.** Write a script, run it,
   show both the script and its output. An arithmetic result a model produced from reasoning is
   indistinguishable from a plausible guess, and this command exists precisely to be the thing that
   is not a guess.
2. **The numbers are a proposal until a human signs.** `verified_by` + `verified_at` stay empty until
   the owner confirms. An unsigned answer key is a legitimate state, not a failure — check 13 warns
   about it rather than blocking, so it can sit there honestly.
3. **When the numbers disagree with the contract, the CONTRACT changes.** Go back to `/req:calc`
   (loop L2). Editing the answer key so it matches the formula destroys the only independent check
   Phase 1 has, and it destroys it silently.
4. **Customer data is input, never rules.** A `sample_data` source supplies real rows to feed in and
   real answers to diff against. A mismatch is not noise to reconcile — it is usually a rule nobody
   told us about, and it is the highest-value finding this whole plugin produces.

## Steps

1. Resolve the argument. A `BR-id` resolves to its `is_current` version — say which. A `CALC-id`
   resolves directly. If the rule has `kind: "calculation"` but no `constrained_by`, **stop and send
   the owner to `/req:calc` first**: there is no contract to compute against, and inventing one here
   would bury an elicitation decision inside a verification command.
2. Resolve the state directory — never type it:
   ```
   node "${CLAUDE_PLUGIN_ROOT}/scripts/state-dir.mjs"
   ```
3. Write the script to `<state-dir>/golden/<CALC-id>.mjs`. It must:
   - implement the contract **field by field** — `numeric_type`, `rounding_mode`, and especially
     `rounding_points`; round where the contract says to round, not where it is convenient
   - do money in **integer minor units** (satang), never float baht, when `numeric_type` is `decimal`
   - carry a header comment naming the CALC it implements, so the file explains itself in six months
   - print rows as JSON so the output can be pasted into `golden_datasets[].rows` without retyping
4. Choose the rows deliberately, in this order:
   - **every row available from a `sample_data` source** — these carry answers the customer already
     believes; record which row each came from in `from_source_row`
   - **every edge named in the contract's `boundary_behavior`** — those are the cases nobody checks
     by hand and the reason the field is required
   - one ordinary case per branch that changes the outcome
5. **Run it.** Show the command and the real output. If it throws, that is a finding about the
   contract, not a script bug to paper over.
6. Diff against the customer's own numbers, row by row. Every difference goes into `mismatches[]`
   **as a recorded disagreement** — then stop and report it. Do not adjust either side. A mismatch
   means one of: a rule nobody stated, a contract field that is wrong, or a customer's number that
   was wrong all along — and which one it is, is the owner's call.
7. Write the `GD-xxx` node with `computed_by` **relative to the state directory**
   (`golden/CALC-job-001@v1.mjs`, never `.aeon/golden/...`) — the directory name is a parameter, and an
   absolute path breaks the moment someone renames it. Set `golden[]` on the rule version. Leave
   `verified_by` / `verified_at` `null`.
8. **Ask the owner to confirm the numbers** — show the table, not the JSON. Only after they say yes,
   fill `verified_by` + `verified_at` and set `status: "validated"`.
9. Fix the derived counts and regenerate the document:
   ```
   node "${CLAUDE_PLUGIN_ROOT}/scripts/rollup.mjs" --root . --write
   node "${CLAUDE_PLUGIN_ROOT}/scripts/doc-hash.mjs" --root . [REQ-id]
   node "${CLAUDE_PLUGIN_ROOT}/scripts/wiki.mjs" --root . --write
   ```
   Round 3 adds no `rollup` counter on purpose — check 13 reads `golden_datasets[]` directly, because
   `rollup` is `additionalProperties: false` and a new key means editing schema, `rollup.mjs` and both
   fixtures in one change (design §9). The counter arrives if and when 13 is promoted to error.
10. **Verify:** `node "${CLAUDE_PLUGIN_ROOT}/scripts/verify-rules.mjs" --root . --cp1` and show the result.
11. 🛑 **Stop.** Report the table, the mismatches, and which rules still have no signed answer key.
