---
description: The only command of a plugin that ships neither help.md nor USER-GUIDE.md (planted D9)
---

# /broken:only

The plugin this command belongs to has no `commands/help.md` and no `USER-GUIDE.md`, which
DOC-STANDARD §3.5 calls not ready to ship. D11 stays quiet here on purpose — there is no help file
to measure coverage against, and reporting "help does not mention this" when help does not exist
would point at the wrong problem.
