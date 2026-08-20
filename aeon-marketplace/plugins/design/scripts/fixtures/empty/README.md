# fixture `empty/` — a project where `req` has never run

This directory must exist in a fresh clone, and git does not track empty directories. This file is
here to carry it. Do not add a `.aeon/` here: **the absence is the fixture.**

It proves `/design:init` tells two different failures apart:

| situation | result |
|---|---|
| `spec.json` exists but is wrong | exit 2, `MALFORMED`, says what is wrong (`dirty/`) |
| `spec.json` is not there at all | exit 2, `MISSING`, **names the full path it looked for** (this one) |

An agent that cannot tell those apart goes hunting for a `spec.json` somewhere else on disk instead
of telling the user to run `/req:capture`. The location is declared, never discovered — so the only
correct behaviour when it is absent is to quote the path and stop.
