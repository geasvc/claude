# `/req:capture` — full flow

## Step 0 — inventory the input before touching anything

List what arrived. One `SRC-xxx` per item, numbered in arrival order.

```
SRC-001  chat    ข้อความที่พิมพ์มา (245 ตัวอักษร)
SRC-002  file    docs/tor/TOR-2026.docx        (อยู่ใน docs/ แล้ว → อ้าง path)
SRC-003  file    C:/Users/.../ราคา.xlsx        (นอกโปรเจกต์ → copy เข้า docs/sources/)
SRC-004  image   pasted                        (ไม่มี path → เขียนไฟล์ก่อน)
SRC-005  sample_data  ข้อมูลสินเชื่อจริง 500 แถว   (ข้อมูลลูกค้า → ถาม PII ก่อนเขียนไฟล์)
```

Show this list before doing any work. The owner catches a wrong attachment here in one second and
after extraction in twenty minutes.

## Step 1 — land every file under `docs/`

| situation | action | records |
|---|---|---|
| already under `docs/` | reference it | `path` |
| outside the project | copy into `docs/sources/` | `path` + `imported_from` |
| pasted image | write `docs/sources/SRC-0NN-<slug>.<ext>` | `path`, `imported_from: null` |
| customer data extract | **ask the PII question first**, then copy into `docs/sources/` | `path` + `masked` (+ `masked_note`) |

Then hash **the stored file** (not the original):

```bash
node -e "const{createHash}=require('crypto'),{readFileSync}=require('fs');console.log('sha256:'+createHash('sha256').update(readFileSync(process.argv[1])).digest('hex'))" <path>
```

Never record a path outside `docs/` — check #8 rejects it.

## Step 2 — extract, per format

| format | extract into | watch for |
|---|---|---|
| `.txt` `.md` | `extracted.text` | — |
| `.docx` | `extracted.text` + `pages` | headings carry section numbers → good `locator` values |
| **`.xlsx`** | `extracted.sheets[].cells[]` with **`formula` AND `value`** | **the rule is in the formula.** A cell showing `930` may be `=IF(B2>1000, B2*0.93, B2)` — that is a pricing rule, and value-only extraction loses it |
| `.pdf` (text) | `extracted.text` + `pages` | |
| `.pdf` (scanned) | needs OCR → this is `interpretation`, not `extracted` | |
| image | `interpretation.transcript` | never `extracted` — a model read it |
| FB post / comment | call the existing user skill `req-miner`. Do not reimplement it | |
| **customer data extract** (`kind: "sample_data"`) | `extracted.schema[]` + `extracted.rows[]` (a sample) + `extracted.row_count` (the real total) | **it is evidence of values, not a source of rules** — never draft a `BR` from it, only a suspicion carrying its denominator |

If extracted text runs longer than roughly a page, write `docs/sources/SRC-0NN.extracted.txt` and
point `extracted.sidecar` at it, keeping only the relevant excerpt inline.

**The dividing line:** if a parser produced it, it is `extracted` and trustworthy. If a model read
it, it is `interpretation` and a guess until confirmed. Never let a value cross from the second
column into the first.

## Step 3 — draft, do not commit

Derive candidate REQ / BR / EX. Mark everything `status: "draft"`. You may propose rules; you may
not commit rules the owner has not seen (schema invariant 1).

## Step 4 — confirmation rounds, three at a time

**Only ask about interpretations that produced a candidate rule.** A transcribed line that generated
nothing needs no confirmation. Five files can otherwise mint forty questions.

Order matters:

| round | topic | why here |
|---|---|---|
| 1 | which REQ does this belong to / how does it split | nothing downstream can be judged first |
| 2 | conflicting sources | they block |
| 3 | interpretations that produced a rule | |
| 4+ | the remainder | **always state how many are queued** |

### Question shapes

**Splitting (case 3):**
```
TOR ฉบับนี้ครอบ 2 เรื่อง ผมเสนอแบ่งแบบนี้
  REQ-job-001  การเดินสถานะงาน      ← หน้า 3-5 (§3.2, §3.4)
  REQ-bill-001 การออกใบแจ้งหนี้      ← หน้า 8-9 (§5.1)
1) แบ่งแบบนี้ถูก   2) รวมเป็น REQ เดียว   3) แบ่งคนละแบบ (บอกได้เลย)
```

**Interpretation of an image (trigger A):**
```
รูป SRC-004 ผมอ่านได้ว่า "ถ้าแก้เงินหลังออกบิลไปแล้ว ต้องออกบิลใหม่ทับของเดิม"
→ เป็นกฎ: แก้เงินหลังออก Bill ต้อง re-issue ห้ามแก้ใบเดิม
1) ถูก   2) อ่านผิด — ที่ถูกคือ...   3) ยังไม่แน่ใจ ต้องถามลูกค้า
```

**Spreadsheet formula (trigger B) — ask about the reading, not the formula:**
```
ชีต "ค่าขนส่ง" เซลล์ D2 = IF(B2>1000, B2*0.93, B2)
→ กฎ: ยอดเกิน 1,000 บาท ลด 7%
1) ใช่   2) ไม่ใช่ — ที่ถูกคือ...   3) ยังไม่แน่ใจ
```

**Conflict (trigger C):**
```
TOR หน้า 4 บอก: admin ถอยสถานะได้
Line 30 ก.ค. บอก: ถอยไม่ได้ ต้องยกเลิกแล้วสร้างใหม่
1) เชื่อ TOR   2) เชื่อ Line (ใหม่กว่า)   3) คนละกรณี — อธิบาย   4) ต้องถามลูกค้า
```

Answer 3 (or the last option) always means **`validation.state: "deferred"` → mint a `Q-xxx`**.
Record which source lost in the conflict; do not delete it.

## Step 5 — write, regenerate, stop

1. write `<state-dir>/spec.json` — new and changed nodes only, leave `rollup` untouched.
   `<state-dir>` is a parameter (default `.aeon`); get it from
   `node scripts/state-dir.mjs` rather than typing it.
   On a brand new file `meta` is `{ module, schema_version: "0.3.0", scale, status: "draft",
   created_at, updated_at }` — `schema_version` is a `const` in the schema, so a wrong value fails
   the whole file rather than one field
2. `node scripts/rollup.mjs --root . --write` — never recount those numbers by hand.
   Counting current rules means holding the whole file in context; the script prints the corrected
   block, so report from its output instead of re-reading the file
3. regenerate `docs/requirements/REQ-xxx.md` for every touched requirement
4. run `verify-rules.mjs --cp1` and show the result
5. **stop** — summarise what was captured, what is still open, and wait for approval

## Appending to an existing spec

Until `/req:append` exists, `/req:capture` on a project that already has a `spec.json` must:

- continue id numbering from the highest existing id per prefix
- **never modify a `locked` or `superseded` node** — if the input contradicts one, that is a
  `/req:change` situation: report it and stop rather than editing
- attach new sources to existing REQs only after confirming (case 2)
