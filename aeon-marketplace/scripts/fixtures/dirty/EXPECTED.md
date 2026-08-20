# dirty fixture — what each file deliberately violates (`verify-design.mjs`)

Broken on purpose so the authoring gate can be proven to check things. A checker that only ever sees
valid input is indistinguishable from a checker that checks nothing — the same reason
`plugins/req/scripts/fixtures/dirty/` exists for `verify-rules.mjs`.

```bash
# expect exit 1
node ../../verify-design.mjs --root .

# and its green twin — expect exit 0, PASS
node ../../verify-design.mjs --root ../clean
```

## The contract

| | error | warn |
|---|---|---|
| `clean/` | **0** | **0** |
| `dirty/` | **12** | **7** |

**These numbers are the contract.** If they move without anyone intending it, a check changed level
or stopped firing — walk it back to the table below before touching anything else.

## Per check

| check | level | count | planted in | how |
|---|---|---|---|---|
| **D1** frontmatter | error | 1 | `docs/wiki/plugins/no-frontmatter.md` | file starts with `#`, no `---` block |
| **D2** type in closed list | error | 1 | `docs/wiki/plugins/PLG-bogus.md` | `type: Widget` — not in §5.1 |
| **D3** id pattern | error | 1 | `docs/wiki/commands/CMD-bad.md` | `id: CMD-bad` — instance type with no `-<nnn>` |
| **D4** hash marker · สาขา "ไม่มี" | error | 1 | `docs/wiki/commands/CMD-demo-002.md` | no `spec_hash`, no HTML comment |
| **D4** hash marker · สาขา "ไม่ตรง" | error | 1 | `docs/wiki/plugins/PLG-demo.md` | hash is well-formed but is not the hash of its registry node |
| **D5** internal links | warn | 1 | `docs/wiki/index.md` | links to `adr/ADR-gone-001.md`, which does not exist |
| **D6** index.md coverage | warn | 2 | `docs/wiki/plugins/index.md` · `docs/wiki/skills/` | index omits a sibling page · directory has no index at all |
| **D7** orphan pages | warn | 1 | `docs/wiki/skills/SKL-orphan.md` | page is valid in itself, but no node in the registry renders it |
| **D8** SKILL.md shape | error | 2 | `plugins/demo/skills/demo-skill/SKILL.md` · `.../long-skill/SKILL.md` | frontmatter carries `type`/`id`/`owner` · 511 lines > 500 |
| **D9** help + USER-GUIDE | error | 2 | `plugins/broken/` | neither `commands/help.md` nor `USER-GUIDE.md` |
| **D10** layer B owner+date | warn | 2 | `CLAUDE.md` · `docs/stale.md` | no owner and no review date in the first 40 lines |
| **D11** help covers commands | error | 1 | `plugins/demo/commands/ghost.md` | command on disk, never mentioned in `help.md` |
| **D12a** Thai where people read | error | 2 | `plugins/demo/commands/help.md` · `plugins/demo/USER-GUIDE.md` | both English-only |
| **D12b** Thai where Claude reads | warn | 1 | `plugins/demo/skills/demo-skill/SKILL.md` | 3 Thai lines outside code and quotes, reported as one list per file |

**Both fixtures now carry `docs/design-registry.json`, and that is what makes D4-equality and D7
measurable at all.** Without a divisor the gate falls back to presence-and-form for D4, skips D7,
and prints LIMIT instead of LIVE — which is still honest, but tests nothing.

> ⚠️ **ห้ามรัน `wiki-authoring.mjs --write` ใส่ `dirty/`** — มันจะซ่อมทุกอย่างที่ปลูกไว้ แล้วตัวเลขข้างบนจะกลายเป็นศูนย์
> โดยไม่มีใครตั้งใจ · `dirty/` มีทะเบียนไว้ให้ด่าน **อ่าน** ไม่ใช่ให้ตัวเรนเดอร์ **เขียน**
> ส่วน `clean/` ตรงข้าม: bundle ของมันถูก render จากทะเบียนจริง ๆ hash จึงเป็น hash ของบางอย่าง ไม่ใช่เลขที่พิมพ์ขึ้นมา

## Two traps this fixture already fell into — left as tests, not fixed

1. **A page that violates D1 was also charged D4.** No frontmatter means no place for a hash, so one
   broken page produced two findings and neither count traced to a single cause. The gate now skips
   D4 on any page D1 already rejected — `no-frontmatter.md` proves it, by producing exactly one.
2. **`plugins/index.md` explained which file it was omitting, and named it.** D6 looks for the
   filename in the index text, so the explanation silenced the violation it was explaining. The
   index now describes the omission without spelling the name, and carries a warning against
   "helpfully" adding it back.

3. **D11 briefly accepted a bare backticked word as "documented".** The looser form was measured
   against the real `req` help file before it shipped: **6 of its 7 commands matched by accident** —
   `` `calc` ``, `` `capture` ``, `` `change` ``, `` `check` ``, `` `example` ``, `` `golden` `` all
   appear inside sentences about something else. Only `/plugin:command` counts now. Proof the strict
   form still bites, run against this fixture:

   ```bash
   # delete EVERY mention of /demo:thing from plugins/demo/commands/help.md -> D11 reports 2, total 12e/6w
   # restore the file                                                       -> back to 11e/6w
   ```

   The first attempt at that probe replaced only the *first* of the two mentions and reported 1, not
   2. The probe was wrong, not the gate — which is the reason to write the expected number down
   before running anything.

## What `clean/` is for

`clean/` is a whole marketplace in miniature — one plugin, one skill, one command, a seven-file
authoring bundle — built so that **every** check has something valid to look at. Green there means
the checks can pass, not merely that they can fail; a gate nobody has ever seen pass is a gate
nobody trusts when it goes red.
