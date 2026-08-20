# CP1 — reading the checker, fixing violations

```bash
node ${CLAUDE_PLUGIN_ROOT}/scripts/verify-rules.mjs --root . --cp1
node ${CLAUDE_PLUGIN_ROOT}/scripts/verify-rules.mjs --root . --cp2     # spillover only
node ${CLAUDE_PLUGIN_ROOT}/scripts/verify-rules.mjs --root . --json    # machine-readable
```

Exit `0` green · `1` violations printed · `2` file/parse error.

Try it against the bundled fixtures before trusting a real run:
`scripts/fixtures/clean` exits 0; `scripts/fixtures/dirty` exits 1 with every check reporting
(44 errors, 19 warnings — `--cp1` 43/19, `--cp2` 30/0). Those numbers are a contract, not an
observation: `fixtures/dirty/EXPECTED.md` maps each one back to the node that causes it, so a total
that moves without a matching entry there means a check changed level without anyone deciding to.

`rollup{}` has its own script — read-only by default, so it is safe to run from a 👁 command:

```bash
node ${CLAUDE_PLUGIN_ROOT}/scripts/rollup.mjs --root .           # show + report drift
node ${CLAUDE_PLUGIN_ROOT}/scripts/rollup.mjs --root . --write   # correct in place
```

## CP1 passes when

- every REQ has actor + goal
- **every `is_current` rule has ≥1 example**
- **zero open red cards**
- every source resolves on disk under `docs/` with a matching hash
- generated documents are in sync
- postconditions are measurable

**A green script is not approval.** CP1 is signed by the owner. Green only means it is worth asking.

## Violations and what they actually mean

| check | message | fix |
|---|---|---|
| 1 | `requirement has no actor/goal` | Missing actor usually means the requirement is a feature wish, not a requirement. Ask who performs it and what they get. |
| 2 | `rule has no example — nobody proves it` | Run `/req:example <BR-id>`. If nobody can write an example, the rule statement is too vague to build against. |
| 3 | `red card still open` | Get the answer, or accept that Phase 1 is not done. **Never close a red card by guessing** — that is the exact failure this gate exists to prevent. |
| 4 | `X -> Y does not resolve` | A dangling reference. Either the target was deleted or the id is typed wrong. Never fix it by deleting the reference without checking which. |
| 4 | `interpretation deferred but no question minted` | `validation.state: "deferred"` must always create a `Q-xxx`. The unsure reading is the red card. |
| 5 | `spillover question still open` | **Does not block CP1.** Answer it in `/domain:ask` during Phase 2. |
| 6 | `superseded but is_current is not false` | A rule cannot be both replaced and current. |
| 6 | `version N but no change_reason` | Every version bump must record why, or you cannot answer why old and new jobs behave differently. |
| 7 | `"BR-xxx" has no @v` | Bare rule ids silently re-point when current moves. Resolve to the version that was intended **at the time the reference was written**, not blindly to current. |
| 7 | `N versions marked is_current` | Exactly one per base id. Two means two rules claim to be the truth. |
| 8 | `path is not under docs/` | Move the file under `docs/` and update `path`. Sources outside the project vanish. |
| 8 | `file not found` | The provenance chain is broken — the rule can no longer be traced to anything. Restore the file or re-capture the source. |
| 8 | `file changed since import` ⚠️ | Warning, not an error. The recorded `quote` may no longer match. Re-read the file and confirm the quotes still hold. |
| 9 | `rollup says X but file computes Y` | Never hand-edit rollup and never recount it by hand. Run `scripts/rollup.mjs --write`. Drift means a command skipped that script — worth noticing, not just fixing. |
| 10 | `doc missing / stale / no spec-hash` | Regenerate with `/req:capture` (no input needed). Never edit the `.md` to make this pass. |
| 11 ⚠️ | `domain_concepts -> UL-xxx is not defined` | Add the term to `glossary[]`. A rule referring to an undefined word is ambiguous even when it reads fine. |
| 11 ⚠️ | `term has no definition` | An empty definition is worse than no term — it looks settled and is not. |
| 11 ⚠️ | `term is defined but no requirement references it` | Either wire it up or drop it. Orphan vocabulary is how glossaries rot into noise. |

## The trap in check 9

`rules_total` counts **`is_current` rules only**. When a rule is superseded, the denominator does
not grow. Counting every version would make coverage fall each time a rule changes, with nothing
actually wrong — and a metric that drops for no reason is a metric people stop believing.

## What the checker deliberately does not do

- **It does not judge whether a rule is well written.** Deterministic checks only — no model scoring.
- **It does not verify status *transitions*.** Only structural consistency of the current file. A
  transition history check needs a previous snapshot; until then, `locked` is enforced by the
  commands that refuse to write, not by the script.
- **It does not check whether the split into requirements is correct.** No gate can. That is why
  `/req:capture` asks before splitting.
- **It does not prove rules.** That is CP5's job (`verify`). Phase 1 exits with rules *answered*;
  Phase 5 exits with rules *proved*.
