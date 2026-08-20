---
description: (read-only) What is still open, and does CP1 pass — the single status command
argument-hint: "[--cp2]"
---

# /req:check 👁 — สถานะ + ด่าน CP1

Read-only. **Writes nothing — not even a regenerated document.** If a document is stale, report it;
regenerating belongs to `/req:capture`.

Absorbed the former `/req:gap`: both read the same checker output, so they are one command with two
sections rather than two commands with one answer.

Invoke the `requirement-and-rule-mapping` skill and follow `references/checkpoint-cp1.md`.

## Steps

1. Run:
   ```
   node "${CLAUDE_PLUGIN_ROOT}/scripts/verify-rules.mjs" --root . --cp1
   ```
   With `--cp2`, run the CP2 gate instead (spillover queue). If the spec does not exist the checker
   exits 2 and prints the exact path it looked for — quote that path, say so, and suggest
   `/req:capture`. Do not go hunting for a spec.json somewhere else: the location is declared
   (`--state-dir` > `$AEON_STATE_DIR` > `.aeon`), never discovered.
2. **Optional structural pass** — only if asked, or if the output looks structurally odd (the checker
   covers meaning; the schema covers shape). Needs network on first run:
   ```
   npx --yes ajv-cli@5 validate -s schemas/spec.schema.json \
     -d "$(node "${CLAUDE_PLUGIN_ROOT}/scripts/state-dir.mjs" --root . --path)" \
     --spec=draft2020 --strict=false --all-errors
   ```
   If npx is unavailable, say so and continue — not a hard dependency of the gate.
3. Report in Thai, in this order:

   **🛑 บล็อก CP1 — ต้องปิดก่อนจบ Phase 1**
   - open `Q-xxx` red cards — quote each, and name the source or rule that raised it
   - `is_current` rules with no example — the direct answer to *"which rule has nobody proved yet?"*
   - broken sources: missing files, paths outside `docs/`, hash mismatches
   - stale or missing generated documents

   **⏭ บล็อก CP2 — ปกติ ไม่ต้องรีบ**
   - open `DQ-xxx` with `blocked_until` and which command will answer them

   **⚠️ เตือน ไม่บล็อก**
   - check #11 vocabulary: undefined terms, unreferenced terms, dangling `not_to_confuse_with`
   - source files changed since import

   **📊 สถานะ**
   - rules(current) · with example · coverage % · red cards · spillover
   - `rules_with_green_test` stays 0 until `verify` runs — say so, or 0 reads as a failure

4. Translate each violation into Thai with the fix from the reference table. Especially:
   - **red card open** → get the answer. **Never close one by guessing.**
   - **rule with no example** → `/req:example <BR-id>`, or the statement is too vague to build against
   - **hash mismatch** ⚠️ → the recorded quote may no longer match the file; re-read it
   - **stale document** → `/req:capture` with no new input regenerates it; never edit the `.md`
5. Suggest the single next command, **without running it**. Then state plainly: **a green script is
   not approval — CP1 is signed by พี่ปู.** Ask whether Phase 1 is approved, and **stop**.

Do not soften the report. A rule with no example is not "mostly fine".

## Sanity-checking the checker itself

```
node "${CLAUDE_PLUGIN_ROOT}/scripts/verify-rules.mjs" --root "${CLAUDE_PLUGIN_ROOT}/scripts/fixtures/clean"   # expect 0
node "${CLAUDE_PLUGIN_ROOT}/scripts/verify-rules.mjs" --root "${CLAUDE_PLUGIN_ROOT}/scripts/fixtures/dirty"   # expect 1
```
