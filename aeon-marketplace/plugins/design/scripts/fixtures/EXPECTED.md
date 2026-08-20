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
