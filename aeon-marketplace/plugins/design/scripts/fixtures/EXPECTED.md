# fixtures — what each one is a contract for

These are INPUTS ONLY. No test writes into them; `--write` runs happen in a temp directory, so a
fixture can never drift because a test ran. Numbers below are the actual observed results, not
hopes — CLAUDE.md §3.

| fixture | state dir | invocation | expected |
|---|---|---|---|
| `clean/` | `.aeon` (default) | `init.mjs --root .../clean` | exit **0** · requirements 1 · glossary 1 · openQuestions 1 |
| `dirty/` | `.notaeon` (deliberate) | `init.mjs --root .../dirty --state-dir .notaeon` | exit **2** · 1 MALFORMED (`requirements` is object) · 1 MISSING (`glossary[]`) |
| `empty/` | `.aeon` (default) | `init.mjs --root .../empty` | exit **2** · 1 MISSING (`spec.json`) naming the full path it looked for |

`dirty/` uses `.notaeon` on purpose, exactly as `plugins/req/scripts/fixtures/dirty` does: it proves
the state directory name is a real parameter and not a constant someone typed in three places.

`empty/` exists to prove the difference between "the file is wrong" (exit 2, malformed) and "the file
is not there" (exit 2, missing, naming the path). An agent that cannot tell those apart will go
hunting for a spec.json somewhere else instead of telling the user to run /req:capture.
