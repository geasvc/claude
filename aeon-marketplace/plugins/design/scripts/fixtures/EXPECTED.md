# fixtures — what each one is a contract for

These are INPUTS ONLY. No test writes into them; `--write` runs happen in a temp directory, so a
fixture can never drift because a test ran. Numbers below are the actual observed results, not
hopes — CLAUDE.md §3.

| fixture | state dir | invocation | expected |
|---|---|---|---|
| `clean/` | `.aeon` (default) | `init.mjs --root .../clean` | exit **0** · requirements 1 · glossary 1 · openQuestions 1 |
| `dirty/` | `.notaeon` (deliberate) | `init.mjs --root .../dirty --state-dir .notaeon` | exit **2** · 1 MALFORMED (`requirements` is object) · 1 MISSING (`glossary[]`) |
| `empty/` | `.aeon` (default) | `init.mjs --root .../empty` | exit **2** · 1 MISSING (`spec.json`) naming the full path it looked for |
| `context-ok/` | `.aeon` | `context.mjs --root .../context-ok` | exit **0** · **0 error, 1 warning** (OV8 only) |
| `context-bad/` | `.aeon` | `context.mjs --root .../context-bad` | exit **1** · **6 error, 1 warning** — OV1, OV2, OV4, OV6, OV7 ×2, and OV8 as the warning |
| `clean/` | `.aeon` | `context.mjs --root .../clean` | exit **2** — `init` has not run, so there is no `design.state.json` |
| `function-ok/` | `.aeon` | `functions.mjs --root .../function-ok` | exit **0** · **0 error, 0 warning** · FN 1 · UC 2 · STM 1 · notFunctional 1 · **8 trace edges** |
| `function-bad/` | `.aeon` | `functions.mjs --root .../function-bad` | exit **1** · **8 error, 0 warning** — FU1 through FU8, each firing exactly once |
| `context-ok/` | `.aeon` | `functions.mjs --root .../context-ok` | exit **2** — `overview` is not `done` in `design.state.json` |
| `status-work/` | `.aeon` | `status.mjs --root .../status-work` | exit **1** — work remains and `function` is runnable |
| `status-blocked/` | `.aeon` | `status.mjs --root .../status-blocked` | exit **2** — `overview` has `attempts: 4`, tripping the §8.2 loop guard, and every other step waits on it |
| `status-done/` | `.aeon` | `status.mjs --root .../status-done` | exit **0** — the only state that may return 0 |
| `status-stale/` | `.aeon` | `status.mjs --root .../status-stale` | exit **1** — every step says `done` except one marked `stale` |
| `status-question/` | `.aeon` | `status.mjs --root .../status-question` | exit **2** — every step says `done`, but a question with a non-empty `blocks[]` is open |

The last two exist to defend the two rules that make exit 0 harder than counting steps:
§9.2 rule 6 (no 0 while an artifact is stale) and §19.3 (no 0 while a blocking question is open).
If someone later simplifies `status.mjs` into "all steps done means 0", `status-stale/` and
`status-question/` go red immediately — which is the whole point of keeping them. A green light that
is not true is worse than a red one, because a red light makes people look and a false green makes
them ship.

`status-blocked/` is the only fixture asserting exit **2**, and it does so for the honest reason:
nothing is runnable. Note that `status-work/` ALSO carries a blocked step (`rbac`, waiting on
`Q-STAKEHOLDERS`) and still exits **1** — because three other steps can run. That pair is the
contract that exit 2 means "the loop cannot move", not "something somewhere is blocked".

`function-ok/` carries two deliberate traps that a naive implementation passes and a correct one
survives:

- **two Thai actor names of EQUAL length** (`ผู้สมัคร` and `เจ้าหนี้`, both 8 characters). Stripping
  non-ASCII to build Mermaid node ids turns both into the same row of underscores, and the use case
  diagram then merges two actors into one node — silently, with every check green. The generator
  asserts the two names are the same length, so the trap cannot be defused by editing the fixture.
- **Thai state ids** in the state machine, which hit the same path in `stateDiagram-v2`.

`function-bad/` keeps one distinct cause per check so the count of 8 is a contract rather than a
coincidence: duplicate `FN-fx-001` (FU8), `REQ-fx-002` neither mapped nor declared not-functional
(FU1), a trace to a REQ that does not exist (FU2), a function with no use cases (FU3), a use case
with an empty `exceptionFlows` (FU4), `governedBy` pointing at `BR-fx-002@v1` which is superseded
rather than absent (FU5), an `initial` state missing from `states[]` (FU6), and `Stuck`, which is
neither final nor has anything leaving it (FU7).

The two `context-*` fixtures carry a `design.state.json` on purpose. For `context.mjs` that file is an
INPUT, not an output: §7.2 rule 2 says a command must halt when a preceding command has not run, and
`clean/` above is what proves that halt actually fires.

`context-bad/` is built so that every blocking check has exactly one cause, which is what makes the
count a contract rather than a coincidence: `purpose` empty (OV1), `scope.in` empty (OV2),
`assumptions` empty (OV4), a flow whose `from` is `EXT999` and was never declared (OV6), one
constraint with no `traces[]` and one tracing to a REQ that does not exist (OV7 twice). `constraints`
is deliberately NON-empty so OV3 stays green — a fixture where everything fails cannot prove that the
checks are independent.

`dirty/` uses `.notaeon` on purpose, exactly as `plugins/req/scripts/fixtures/dirty` does: it proves
the state directory name is a real parameter and not a constant someone typed in three places.

`empty/` exists to prove the difference between "the file is wrong" (exit 2, malformed) and "the file
is not there" (exit 2, missing, naming the path). An agent that cannot tell those apart will go
hunting for a spec.json somewhere else instead of telling the user to run /req:capture.
