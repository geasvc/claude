---
description: Beat C — break a rule into 2-4 examples that prove it (happy / exception / boundary)
argument-hint: "<BR-id>"
---

# /req:example — green cards

Invoke the `requirement-and-rule-mapping` skill.

## Steps

1. Resolve the rule id. If the owner typed a bare `BR-job-011`, resolve it to the `is_current`
   version and say which one you used. **Write `@v` into the file** — a bare id silently re-points
   when current moves.
2. Read the rule's `test_design` and derive **2–4 examples**, covering `happy`, `exception`, and
   `boundary` before adding more of one kind:
   - `state_transition` → one legal move, one illegal move, one at the closing state
   - `decision_table` → one per branch that changes the outcome
   - `BVA` → at the boundary, one either side
   - `EP` → one representative per class
3. Each example needs `given` / `when` / `then`. **`then` carries the verbatim Thai UI or error text
   the user actually sees** — not "shows an error". Omitting this once cost a full QA recalibration
   round on a real project.
4. Set `proves` to an array containing the resolved `@v` id. If an existing example also proves this
   rule version, **add the id to that example's `proves` — do not copy the example.**
5. If a rule cannot be given an example, that is a finding: the statement is too vague to build
   against. Report it, do not invent an example to fill the slot.
6. Write the new examples into spec.json and leave `rollup` alone — fix the counts with the script,
   then report coverage from its output rather than re-reading the file:
   ```
   node "${CLAUDE_PLUGIN_ROOT}/scripts/rollup.mjs" --root . --write
   ```
   **Never recount `rollup` by hand.** This command runs once per rule, so a full-file recount here
   is the single most expensive habit in the plugin — round 1 ran it ~30 times on one module.
   Then regenerate **both** renders — updating one and not the other leaves check 12 red:
   ```
   node "${CLAUDE_PLUGIN_ROOT}/scripts/doc-hash.mjs" --root . [REQ-id]   # docs/requirements/*.md
   node "${CLAUDE_PLUGIN_ROOT}/scripts/wiki.mjs"     --root . --write    # docs/wiki/**
   ```
7. 🛑 **Stop.** Show the examples for review.
