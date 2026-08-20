---
description: Pin how a rule's numbers are produced — formula, types, rounding, boundaries (Calculation Contract)
argument-hint: "<BR-id>"
---

# /req:calc — calculation contract

Invoke the `requirement-and-rule-mapping` skill.

A rule says WHAT must hold. A calculation contract says HOW the number is produced. Two people can
implement the same correct rule and disagree by satang, and every one of those disagreements traces
back to a field below that nobody wrote down. This command exists because that conversation needs
seven specific answers, not three multiple-choice rounds.

## Steps

1. Resolve the rule id. A bare `BR-job-016` resolves to the `is_current` version — say which one you
   used and **write `@v` into the file**. The contract pins one rule version: change the rule and the
   contract must not silently follow.
2. Check for an existing contract **from both directions** before writing anything:
   - the rule's `constrained_by`, and
   - any node in `calculations[]` whose `constrains` equals the resolved `@v` id

   Either hit → **stop and report it**. Replacing a contract is a change, and `/req:change` (round 4)
   owns that. Both directions matter because neither the schema nor the gate enforces one-CALC-per-
   rule-version yet: a second contract added from the `calculations[]` side passes every check and
   leaves two official answers disagreeing. Until round 4 closes that, this step is the only thing
   standing in the way.
3. Ask for the seven fields **one topic at a time, in this order**, and never fill one in from
   inference. The right-hand column is what goes wrong when the field is left unsaid — quote it when
   the owner asks why you need the answer:

   | field | ask for | what it costs to skip |
   |---|---|---|
   | `formula` | the expression verbatim, as they say it | everyone reconstructs it from memory, differently |
   | `inputs[]` | each name + shape — `money(2)`, `rate(10)`, `int` | mixed types silently truncate |
   | `numeric_type` | `decimal` or `integer` | **float cannot represent 0.1 — money drifts and no downstream care repairs it.** The enum has no `float` member, so a float answer is a finding, not a value |
   | `rounding_mode` | `HALF_UP`, `HALF_EVEN`, … | languages disagree on the default; .NET rounds half to even |
   | `rounding_points` | **where** rounding happens, not only how | per-instalment vs once-at-the-end differ by whole baht |
   | `residual_policy` | who absorbs the remainder | a balance that never closes to zero. **Leave null when the calculation has no remainder** — do not invent one to fill the field |
   | `boundary_behavior[]` | the edge inputs and what happens at each | the divide-by-zero nobody wrote down reaches production |

4. **Never compute a number here.** This command captures the contract; `/req:golden` is where
   numbers get produced by running code and confirmed by a human. A formula the owner confirmed is
   not the same as an answer anyone has checked.
5. Search the existing `deferred_questions` before minting anything. A `DQ` that already answers one
   of these fields (rounding places, `decimal(p,s)`) **must be reused via
   `calculations[].deferred_questions[]`, and the contract must agree with its answer.** A contract
   that contradicts an answered DQ is the worst outcome of this command: two settled answers,
   disagreeing, both looking official.
6. Route the unknowns, using the existing mechanism unchanged:
   - "ยังไม่แน่ใจ / ต้องถามลูกค้า" → `Q-xxx` **red card**, blocks CP1
   - needs an entity first (`decimal(p,s)`, column width) → `DQ-xxx` **spillover**, blocks CP2 only
7. Record where the answers came from. An elicitation session is a `chat` source like any other:
   capture it as `SRC-xxx` with `captured_by: "/req:calc <BR-id@v>"` and cite it in the contract's
   `provenance`. **Do not cite a `sample_data` source here** — a contract is rule-shaped, and real
   customer rows are evidence of correct VALUES, which is `/req:golden`'s job.
8. **Write** `<state-dir>/spec.json` — resolve the directory, never type it:
   ```
   node "${CLAUDE_PLUGIN_ROOT}/scripts/state-dir.mjs"
   ```
   Append the `CALC-xxx` node, set `constrained_by` on the rule version, and leave `rollup` alone:
   ```
   node "${CLAUDE_PLUGIN_ROOT}/scripts/rollup.mjs" --root . --write
   ```
   Round 2 adds no rollup counter on purpose — `rollup` is `additionalProperties: false` and check 9
   compares every key exactly, so a new counter means editing schema, `rollup.mjs` and both fixtures
   in the same change or the gate goes red.
9. **Regenerate** `docs/requirements/REQ-xxx.md` for the owning requirement — the contract has to be
   readable by the person who has to confirm it. Hash from the shared implementation, never by hand,
   and regenerate the wiki bundle in the same breath — a contract that exists in spec.json but not on
   the rule's page is a contract the next agent will not find:
   ```
   node "${CLAUDE_PLUGIN_ROOT}/scripts/doc-hash.mjs" --root . [REQ-id]   # docs/requirements/*.md
   node "${CLAUDE_PLUGIN_ROOT}/scripts/wiki.mjs"     --root . --write    # docs/wiki/**
   ```
10. **Verify:** `node "${CLAUDE_PLUGIN_ROOT}/scripts/verify-rules.mjs" --root . --cp1` and show the result.
11. 🛑 **Stop.** Show the contract as a table for review — field by field, with the red cards and
    spillover it opened. Do not continue into `/req:example` or `/req:golden`.
