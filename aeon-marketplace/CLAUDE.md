# CLAUDE.md — marketplace `aeon`

> ชั้น B · **owner:** พี่ปู · **ทบทวนล่าสุด:** 2026-08-13 · ตาม [DOC-STANDARD v1.1](docs/standard/DOC-STANDARD.md)
> **2026-08-14 แก้เฉพาะส่วนที่เกี่ยวกับการแยก repo** (§1 · §3 · §5 ประตู 6) — **ยังไม่ได้ทบทวนทั้งฉบับ** วันทบทวนจึงไม่ขยับ
> เจ้าของเป็นคนประทับวันใหม่เอง เหมือนที่ทำกับ D10 เมื่อ 2026-08-13 (`docs/progress.json` งานข้อ 13 proof ก)
> **ยกเว้น frontmatter** — Claude Code เป็นคนโหลดไฟล์นี้เอง การใส่ YAML frontmatter ของ OKF ไม่มีใครอ่านและเสี่ยงกับ loader

ไฟล์นี้คือ**ประตูเข้า**ของ workspace นี้ตาม [DOC-STANDARD §7](docs/standard/DOC-STANDARD.md)
session ใหม่ (คนหรือ agent) อ่านไฟล์นี้จบแล้วต้องทำงานต่อได้โดยไม่ต้องเดา และไม่ต้องถามว่า "เมื่อวานคุยอะไรกันไว้"

**workspace นี้คืออะไร:** marketplace ของ plugin สำหรับ **การพัฒนาระบบ** — ตั้งแต่เก็บ requirement → ออกแบบ → สร้าง → ทดสอบ → ส่งมอบ
**มาตรฐานกลาง:** [`docs/standard/DOC-STANDARD.md`](docs/standard/DOC-STANDARD.md) v1.1 — **ทุก plugin ในที่นี้ต้องเดินตาม ไม่มีข้อยกเว้นที่ไม่ได้ประกาศ**

> 🧱 **repo นี้เป็น marketplace ล้วน ไม่มีโปรเจกต์ทดสอบปนอยู่** — เคาะและแยกจริงเมื่อ **2026-08-14** (§5 ประตู 6)
> ที่นี่**ต้องไม่มี** `.aeon/spec.json` · `docs/sources/` · `docs/requirements/` (พหูพจน์) · `docs/wiki/` แบบ project bundle
> ถ้าเห็นสิ่งเหล่านี้โผล่ที่นี่ แปลว่ามีคนรัน `/req:*` ผิดที่ ไม่ใช่ว่า repo โตขึ้น
> **การทดสอบ plugin ทำในโปรเจกต์แยกเสมอ** — เปิดอีกโฟลเดอร์ ติดตั้งด้วย `/plugin marketplace add <path ของ repo นี้>` แล้ว `/plugin install req@aeon`

> ✅ ชื่อ `aeon` **เคาะแล้ว 2026-08-13** และผูกลง `.claude-plugin/marketplace.json` เรียบร้อย — เปลี่ยนได้ยากแล้ว
> **marketplace นี้ยืนอยู่ลำพัง** — ไม่สืบทอด ไม่ซิงก์ ไม่อ้างอิง marketplace หรือ plugin ของ repo อื่นใดทั้งสิ้น
> ไดเรกทอรีเก็บสถานะคือ **`.aeon/`** — แต่เป็น **ค่าเริ่มต้น ไม่ใช่ค่าคงที่** เปลี่ยนได้ด้วย `--state-dir` หรือ `$AEON_STATE_DIR` (ดู §5 ประตู 2)
> ติดตั้งด้วย `/plugin install req@aeon`

---

## 1. สร้างอะไรไปแล้ว vs ยังเป็นแค่แบบ

> **2026-08-13 — มี plugin ตัวแรกแล้ว: `req` v0.3.0 (ของ `aeon` เอง ไม่ได้ผูกกับ repo อื่น) ครบทั้ง 8 รอบ (0–7) ตาม design §9**
> **ห้ามสมมติว่าไฟล์ใดมีอยู่จนกว่าจะ `ls` เห็นด้วยตาตัวเอง** — และ **ครบ 8 รอบ ≠ พร้อมส่งมอบ**
> **2026-08-13 — `scripts/verify-design.mjs` เกิดแล้ว** และวัด `req` ได้จริง: **0 error / 2 warn** — เหลือแต่ **D12b ×2 ซึ่งเป็น warn ถาวรโดยประกาศ**
> (D10 ×3 ปิดแล้วเมื่อ 2026-08-13 หลังเจ้าของยืนยันว่าทบทวนเนื้อหาทั้งสามไฟล์แล้ว) · **แปลว่าทุก warn ที่ปิดได้ ถูกปิดหมดแล้วตาม §7 กติกา 3**
> **งานข้อ 6 (`docs/wiki/` ของ repo เอง) ปิดแล้ว 2026-08-13** — ที่ยังไม่เสร็จเหลือ 2 ข้อคือ ข้อ 1 `pending` (เซ็น DOC-STANDARD) และ ข้อ 3 `blocked` (git init · รอเจ้าของสั่ง)
> **ห้ามเชื่อบรรทัดนี้ ให้รันคำสั่งใน §4 เอา** · สถานะจริงอยู่ที่ [`docs/progress.json`](docs/progress.json) ที่เดียว

| ของ | สถานะ | ชั้นเอกสาร |
|---|---|---|
| `docs/standard/DOC-STANDARD.md` | ✅ **มีจริง** — มาตรฐานกลาง v1.1 · ร่างรออนุมัติ ยังไม่มีคนเซ็น | B |
| `docs/requirement/req-skill-design.md` | ✅ **มีจริง แต่เป็นแค่แบบ** — ออกแบบ `req` v0.3 ครบ 8 รอบ · **สร้างจริงแล้วรอบ 0–4** ที่เหลือ (5–7) ยังเป็นกระดาษ | B |
| `docs/requirement/req-skill-create.md` | ✅ **มีจริง** — โจทย์ตั้งต้นของ `req` v0.3 | B |
| `docs/req-pipeline-slides.md` | ✅ **มีจริง** — 11 ขั้นของการเก็บ requirement (วัตถุดิบสไลด์) | B |
| `.claude-plugin/marketplace.json` | ✅ **มีจริง** — marketplace `aeon` v0.1.0 · **2 plugin: `req` v0.3.0 กับ `design` v0.4.0 (ยังสร้างไม่ครบ)** | — |
| `plugins/req/**` | ✅ **มีจริง** — `req` v0.3.0 · **8 คำสั่งครบตามแบบ** (`capture` `ask` `calc` `example` `golden` `change` `check` `help`) | — |
| `plugins/design/**` | ⚠️ **ยังสร้างไม่ครบ 2026-08-20 (S0–S3)** — `design` v0.4.0 · **ใช้ได้จริง 4 คำสั่ง: `help` · `init` · `overview` · `function`** · อีก 11 ตัวตามสเปก §7.1 ยังไม่ได้สร้าง ติดป้ายไว้ใน `help.md` ครบทุกตัวตาม DOC-STANDARD §3.5 · `scripts/` มี `state-dir.mjs` (สำเนาของตัวเอง จงใจ — plugin ติดตั้งแยกกัน เข้าถึงสคริปต์ของ `req` ไม่ได้ · ของที่ใช้ร่วมกันคือ**โปรโตคอล** `$AEON_STATE_DIR` ไม่ใช่โค้ด) · `req-contract.mjs` (รอยต่อเดียวที่รู้จักรูปร่าง `spec.json`) · `init.mjs` · `context.mjs` (ด่าน OV1–OV8 + เอกสารหัวข้อ 1–2 + DFD 0) · `functions.mjs` (ด่าน FU1–FU8 + เอกสารหัวข้อ 3 + แผนภาพ use case/สถานะ + `trace.design.json` ที่ derive เอง) · fixture 7 ชุด · **สเปกถูกแก้ให้ตรงของจริง 4 จุดระหว่างทาง (§3.1 · §5.1 · §11.1 · §6.1 RULE→BR) ทุกจุดเจ้าของเคาะ** · คืบหน้าอ่านที่ `docs/progress.json` task 15 | — |
| `plugins/req/assets/question-bank.json` | ✅ **มีจริง** — v0.3.0 · **2 ชั้น** ชั้น 1 กรอบ (4 หมวด 6 คำถาม · **`provisional` ยังไม่ผ่านสนาม**) · ชั้น 2 กฎ (10 หมวด 15 คำถาม · official) | — |
| `scripts/verify-design.mjs` + fixture | ✅ **มีจริง 2026-08-13** — ด่าน authoring **13 ข้อ ครบ D1–D12b** · import severity จาก `doc-frontmatter.mjs` และ hash จาก `registry.mjs` · fixture `clean/` 0/0 · `dirty/` 12/7 · **D4 เทียบ hash จริง + D7 ทำงานแล้ว** เมื่อมีทะเบียน · ไม่มีทะเบียน = พิมพ์ LIMIT ไม่ใช่ผ่านเงียบ | — |
| `scripts/registry.mjs` | ✅ **มีจริง 2026-08-13** — นิยามเดียวของทะเบียน (โหลด · ตรวจ · ที่อยู่หน้า · ขอบเขต hash) ที่ตัวเรนเดอร์กับด่าน **import ร่วมกัน** ห้ามคำนวณเอง | — |
| `schemas/spec.schema.json` | ✅ **มีจริง** — `schema_version` เป็น `const: "0.3.0"` แล้ว | — |
| `plugins/req/scripts/**` · ตัวตรวจ | ✅ **มีจริง** — `verify-rules.mjs` **14 ข้อ** (1–14 ครบ · #12 เต็มตั้งแต่รอบ 5 · warn-only 3 ข้อคือ 11/13/14 · #5 เป็นของ CP2) · `rollup.mjs` · `doc-hash.mjs` · `doc-frontmatter.mjs` (โมดูลร่วมของสองด่าน) · `wiki.mjs` (renderer) · `state-dir.mjs` + fixture `clean/`+`dirty/` | — |
| wiki bundle ของ **โปรเจกต์** (`<project>/docs/wiki/`) | ✅ **มีจริง 2026-08-13** — renderer + check #12 ครบ · เห็นตัวจริงได้ที่ `plugins/req/scripts/fixtures/clean/docs/wiki/` (37 หน้า) | A (generate ห้ามแก้มือ) |
| `docs/design-registry.json` | ✅ **มีจริง 2026-08-13** — **ความจริงของ bundle ฝั่งเครื่องมือ** · ทุกโหนดต้องมี `resource` ที่มีอยู่จริง ไม่งั้น render ไม่ผ่าน · **จำนวนโหนดโตตามทะเบียน อ่านจาก output ของ `wiki-authoring.mjs` ห้ามพิมพ์ค้างไว้ที่นี่** | B |
| `scripts/wiki-authoring.mjs` | ✅ **มีจริง 2026-08-13** — เรนเดอร์ `docs/wiki/**` จาก registry · idempotent · ไม่ลบหน้ากำพร้า · ไม่แตะ `log.md` | — |
| `docs/wiki/` ของ **repo นี้เอง** (OKF authoring bundle) | ✅ **มีจริง 2026-08-13** — **generate ทั้งหมด ห้ามแก้มือ** · ผ่าน D1–D7 · คนละอันกับ bundle ของโปรเจกต์ข้างบน · **จำนวนไฟล์โตตามทะเบียน อ่านจาก output ไม่ใช่จากตารางนี้** | A (generate ห้ามแก้มือ) |

**ที่นี่ไม่มีโปรเจกต์ตัวอย่าง** — `req` ถูกทดสอบด้วยของสองชั้นที่แยกกันคนละบทบาท:

| ชั้น | อยู่ที่ไหน | ทดสอบอะไร |
|---|---|---|
| **fixture ของด่าน** | `plugins/req/scripts/fixtures/{clean,dirty}` · `scripts/fixtures/{clean,dirty}` | ตัวเลขที่เป็นสัญญา (`44/19` · `12/7`) — **อยู่ใน repo นี้ ห้ามย้ายออก** เพราะเป็นชุดทดสอบของสคริปต์ ไม่ใช่โปรเจกต์ |
| **โปรเจกต์ทดสอบจริง** | **repo อื่น** ที่ติดตั้ง `req@aeon` แล้วรัน `/req:capture` กับ requirement จริง | ว่าคำสั่งเดินได้ทั้งเส้นในสภาพเดียวกับลูกค้า — **ห้ามทำในโฟลเดอร์นี้** |

> ⚠️ **`/req:check` ยังหา `schemas/spec.schema.json` จาก root ของโปรเจกต์ที่รัน** (`plugins/req/commands/check.md` ขั้น 2)
> โปรเจกต์ทดสอบภายนอกจึงต้อง **copy `schemas/spec.schema.json` ไปวางที่ root ของมัน** ด่านโครงสร้าง (ajv) ถึงจะรันได้
> เป็นช่องว่างของดีไซน์ที่รู้แล้วและยังไม่ปิด — ไม่ใช่ผลของการแยก repo · ทางเลือกที่เสนอไว้คือย้าย schema ไป `plugins/req/schemas/` แล้วอ้างด้วย `${CLAUDE_PLUGIN_ROOT}` (ยังไม่เคาะ)

---

## 2. ลำดับความน่าเชื่อของแหล่งอ้างอิง

เมื่อสองแหล่งขัดกัน **อันบนชนะเสมอ** และอันล่างต้องถูกแก้ให้ตรง

1. **[`docs/standard/DOC-STANDARD.md`](docs/standard/DOC-STANDARD.md)** — มาตรฐานเอกสารและโครงสร้าง ทุก plugin ผูกกับมัน
2. **schema จริงของ plugin นั้น** (`schemas/*.schema.json`) — เมื่อ schema ขัดกับมาตรฐานเรื่อง id หรือ enum **schema ชนะ** และมาตรฐานจดเป็นข้อยกเว้น (DOC-STANDARD §5.2)
3. **สัญญาภายนอกที่ Claude Code กำหนด** (`marketplace.json` schema · frontmatter ของ `SKILL.md`) — **ชนะทุกอย่างข้างบน** เพราะเราไม่ได้เป็นเจ้าของ
4. **เอกสารออกแบบใน `docs/`** — เป็นข้อเสนอ ไม่ใช่ของที่มีอยู่จริง
5. **บทสรุปในแชท / สไลด์ / โน้ตนอก repo** — ชั้น D ตาม DOC-STANDARD §2 · **ห้ามใช้อ้างอิงในการตัดสินใจ** ให้เปิดต้นทางเสมอ

**ไม่มีแหล่งอ้างอิงนอก workspace นี้** — `aeon` เป็นของที่สร้างใหม่และยืนอยู่ลำพัง
ทุกคำตอบต้องหาได้จากไฟล์ใน repo นี้เท่านั้น · **ถ้าหาไม่เจอ = มันไม่มี ให้บันทึกเป็นช่องว่างแล้วถาม ห้ามไปหยิบจาก repo อื่นมาเติม**

---

## 3. คำสั่งที่รันได้จริง

> ยังไม่มี `package.json` ไม่มี build ไม่มี test runner — แต่**ตัวตรวจรันได้จริงแล้ว** ตั้งแต่ 2026-08-13

```bash
# ชุดทดสอบตัวตรวจ — ตัวเลขข้างล่างคือผลจริงที่รันเมื่อ 2026-08-13 ไม่ใช่ค่าที่คาดไว้
# clean/ ใช้ไดเรกทอรีสถานะ default (.aeon) · dirty/ ใช้ .notaeon จงใจ เพื่อพิสูจน์ว่าชื่อเป็นพารามิเตอร์จริง
node plugins/req/scripts/verify-rules.mjs --root plugins/req/scripts/fixtures/clean   # exit 0 · PASS
node plugins/req/scripts/verify-rules.mjs --root plugins/req/scripts/fixtures/dirty --state-dir .notaeon   # exit 1 · 44 error / 19 warn
node plugins/req/scripts/verify-rules.mjs --root plugins/req/scripts/fixtures/dirty --state-dir .notaeon --cp1   # 43 error / 19 warn
node plugins/req/scripts/verify-rules.mjs --root plugins/req/scripts/fixtures/dirty --state-dir .notaeon --cp2   # 30 error / 0 warn

# wiki renderer — clean ต้องนิ่ง (รันซ้ำไม่เขียนอะไร) · dirty ปลูกไว้ 6 หน้า ห้ามใส่ --write ที่ dirty
node plugins/req/scripts/wiki.mjs --root plugins/req/scripts/fixtures/clean   # exit 0 · already matches
node plugins/req/scripts/wiki.mjs --root plugins/req/scripts/fixtures/dirty --state-dir .notaeon   # exit 1 · 4 STALE · 1 MISSING · 1 ORPHAN

# id pattern ของ doc-frontmatter.mjs ต้องไม่หนีจาก schema — ตรวจด้วยคำสั่ง ไม่ใช่ด้วยความจำ
node plugins/req/scripts/doc-frontmatter.mjs --verify-against schemas/spec.schema.json   # exit 0 · all match

# คลังคำถาม — ไม่มี check ไหนและไม่มี schema ไหนเป็นเจ้าของไฟล์นี้ คำสั่งนี้คือด่านเดียวที่มี
# ต้องได้ `bank v0.3.0 tier1 4cat/6q tier2 10cat/15q PASS` exit 0
node -e "const b=JSON.parse(require('fs').readFileSync('plugins/req/assets/question-bank.json','utf8')),q=b.categories.flatMap(c=>c.questions.map(x=>({...x,tier:c.tier}))),bad=[],ids=q.map(x=>x.id);if(new Set(ids).size!==ids.length)bad.push('duplicate id');q.forEach(x=>{if(!x.options.some(o=>o.red_card))bad.push(x.id+':no-red-card');if(x.tier===1&&x.options.some(o=>o.default))bad.push(x.id+':tier1-baked-star');if(x.tier===1&&x.field_evidence!==null)bad.push(x.id+':tier1-claims-evidence');if(x.tier===2&&!x.options.some(o=>o.default))bad.push(x.id+':tier2-no-star')});const n=t=>b.categories.filter(c=>c.tier===t).length+'cat/'+q.filter(x=>x.tier===t).length+'q';console.log('bank v'+b.version,'tier1',n(1),'tier2',n(2),bad.length?'FAIL '+bad.join(' '):'PASS');process.exit(bad.length?1:0)"

# ด่านฝั่ง authoring (D1–D12b) — คู่แฝดของ verify-rules · ตัวเลข dirty คือสัญญาใน scripts/fixtures/dirty/EXPECTED.md
# คำสั่งชั่วคราวที่เคยนับ "help ครบทุกคำสั่งไหม" ถูกลบทิ้งแล้วเมื่อ 2026-08-13 — D11 เป็นเจ้าของแทน ห้ามมีสองที่
node scripts/verify-design.mjs --root scripts/fixtures/clean   # exit 0 · PASS
node scripts/verify-design.mjs --root scripts/fixtures/dirty   # exit 1 · 12 error / 7 warn
node scripts/verify-design.mjs --root .                        # exit 0 · 0 error / 2 warn (D12b ×2 · warn ถาวรโดยประกาศ)
node scripts/verify-design.mjs --root /nope                    # exit 2 · NOT-FOUND ไม่ใช่เดา

# bundle ฝั่งเครื่องมือ — ความจริงคือ docs/design-registry.json · docs/wiki/** เป็นแค่ร่างของมัน
# dry-run ต้องบอก "already matches" · ถ้ามีคนแก้หน้าด้วยมือ มันจะขึ้น STALE แล้ว exit 1
# บรรทัดแรกของ output บอกจำนวนโหนด/ไฟล์ — **โตทุกครั้งที่เพิ่มโหนด จึงไม่ใช่สัญญาที่ต้องนิ่งแบบตัวเลข fixture** ห้ามพิมพ์ค้างไว้ที่นี่
node scripts/wiki-authoring.mjs --root .            # exit 0 · already matches
node scripts/wiki-authoring.mjs --root . --write    # เขียนเฉพาะหน้าที่ drift · ไม่ลบหน้ากำพร้า · ไม่แตะ log.md

# hash ต่อโหนดของ wiki (25 โหนดใน clean) · แถวแรกต้องเท่ากับ reqDocHash เป๊ะ = สองด่านไม่ตอบคนละอย่าง
node plugins/req/scripts/doc-hash.mjs --root plugins/req/scripts/fixtures/clean --nodes

# สคริปต์เลขเฉลยของ fixture clean — ต้องรันได้จริงและพิมพ์ 7 แถวออกมา (นี่คือที่มาของตัวเลขในเอกสาร)
# ชื่อไฟล์มี @v เพราะสัญญาที่ปล่อยเลขออกไปแล้วถูกแช่แข็ง — @v2 ได้ไฟล์ใหม่ ไม่ทับของเดิม
node "plugins/req/scripts/fixtures/clean/.aeon/golden/CALC-job-001@v1.mjs"

# rollup — clean ต้องบอกว่าถูกอยู่แล้ว (exit 0) · dirty ต้องเจอ drift 7 field (exit 1) จงใจผิดตาม check #9
node plugins/req/scripts/rollup.mjs --root plugins/req/scripts/fixtures/clean   # exit 0 · already correct
node plugins/req/scripts/rollup.mjs --root plugins/req/scripts/fixtures/dirty --state-dir .notaeon   # exit 1 · 7 field(s) out of date

# ตัว resolver เอง — ต้องได้ .aeon / .custom / CONFIG-ERROR ตามลำดับ
node plugins/req/scripts/state-dir.mjs                                    # .aeon
AEON_STATE_DIR=.custom node plugins/req/scripts/state-dir.mjs             # .custom
node plugins/req/scripts/state-dir.mjs --state-dir foo/bar                # CONFIG-ERROR · exit 2
node plugins/req/scripts/verify-rules.mjs --root plugins/req/scripts/fixtures/dirty   # exit 2 · บอก path ที่หาไม่เจอ ไม่ใช่ไปเดาหาเอง

# ด่านโครงสร้าง (ajv) — ต้องมีเน็ตรอบแรก · clean ต้อง valid · dirty ต้อง invalid
npx --yes ajv-cli@5 validate -s schemas/spec.schema.json \
  -d plugins/req/scripts/fixtures/clean/.aeon/spec.json --spec=draft2020 --strict=false --all-errors

# ด่าน CP1 กับโปรเจกต์จริง — **รันกับ repo ของโปรเจกต์ ไม่ใช่ที่นี่** (ที่นี่ไม่มีและต้องไม่มี spec.json)
# ต้องมี spec.json ก่อน · หาที่อยู่ด้วย state-dir.mjs --path
node plugins/req/scripts/verify-rules.mjs --root <path ของโปรเจกต์ทดสอบ> --cp1
```

**ตัวเลขในตาราง `fixtures/dirty/EXPECTED.md` คือสัญญา** — ถ้ามันขยับโดยไม่มีใครตั้งใจ แปลว่ามีคนเลื่อนระดับ check โดยไม่ได้ตัดสินใจ

> **ตัวเลขขยับ 4 ครั้งเมื่อ 2026-08-13 ทุกครั้งตั้งใจ** — `29/5 → 31/5 → 32/7 → 39/10 → 44/19`
> รอบ 2 · `calculations[]` → error +2 (check #4)
> รอบ 3 · `golden_datasets[]` → error +1 (#4) · warn +2 (#13)
> รอบ 4 · `changes[]` + CALC versioning → error +7 (#4 ×2 · #6 ×2 · #7 ×3) · warn +3 (#14 ×3)
> รอบ 5 · `docs/wiki/**` + check #12 → error +5 (ก ข ค ง ฉ อย่างละ 1) · warn +9 (จ ×8 · ช ×1)
> `--cp2` warn ยังเป็น **0** ตลอด เพราะ #12/#13/#14 เป็น gate `CP1` เหมือน #11 · `rollup` ไม่ขยับสักรอบ
> รายละเอียดต่อโหนดอยู่ในตาราง *"Planted violations"* ของ `EXPECTED.md` — **ตัวเลขที่สาวกลับไปหาโหนดไม่ได้ ไม่ใช่สัญญา**
>
> **รอบ 5 วัดสองจังหวะเหมือนรอบ 4** — render bundle ทั้งก้อนลงทั้งสอง fixture ทั้งที่ #12 เปิดใช้แล้ว
> ได้ `clean` 0/0 และ `dirty` **39/17** (error ไม่ขยับเลย = เพิ่มไฟล์ 35 ไฟล์ไม่กวน check เดิม)
> **แล้วค่อย**ปลูกความผิด 6 หน้า → `44/19` · ส่วนต่างจึงเป็นของ check ใหม่ ไม่ใช่ของการเพิ่มไฟล์

**เมื่อสร้างตัวตรวจตัวแรกของ workspace นี้ ต้องได้รูปแบบเดียวกัน:**
exit `0` เขียว · `1` เจอปัญหาพิมพ์ออกมาทุกข้อ · `2` ไฟล์พัง · **ไม่มีข้อไหนให้ AI ตัดสิน** · มี fixture `clean/` + `dirty/` โดย `dirty/` ผิดครบทุกข้อ

---

## 4. งานถัดไป — รายการที่มีสถานะ ไม่ใช่ร้อยแก้ว

> ✅ **ข้อยกเว้นนี้หมดอายุแล้วและถูกปิดเมื่อ 2026-08-13** — สถานะงานย้ายไป **[`docs/progress.json`](docs/progress.json)** ตาม DOC-STANDARD §7 กติกา 2
> เงื่อนไขที่ประกาศไว้ล่วงหน้า ("เกิน 10 แถว = ถึงเวลาย้าย") ถูกกระตุ้นจริง จึงย้ายตามที่สัญญาไว้ ไม่ใช่ปล่อยให้ข้อยกเว้นชั่วคราวกลายเป็นถาวร

**`docs/progress.json` คือความจริงของสถานะงาน — ที่นี่ไม่เก็บสำเนา** (กติกา "หนึ่งข้อเท็จจริงมีที่อยู่ที่เดียว")
ห้ามพิมพ์สถานะกลับลงมาในตาราง markdown อีก แม้จะดูอ่านง่ายกว่า — สองที่เมื่อไหร่ก็ไม่ตรงกันเมื่อนั้น

```bash
# งานที่ยังไม่เสร็จตอนนี้มีอะไรบ้าง — ตัวเลขมาจากไฟล์ ไม่ใช่จากความทรงจำ
node -e "const t=JSON.parse(require('fs').readFileSync('docs/progress.json','utf8')).tasks.flatMap(x=>[x,...(x.subtasks||[])]);for(const x of t)if(x.status!=='done')console.log(x.status.padEnd(12),x.id.padEnd(4),x.title)"
```

| ระเบียนหนึ่งแถวมีอะไร | ทำไม |
|---|---|
| `status` ∈ `done` `in_progress` `pending` `blocked` | `blocked` ต่างจาก `pending` ตรงที่**มีคนอื่นต้องขยับก่อน** — แยกไว้เพราะสองอย่างนี้ทำต่อไม่เหมือนกัน |
| `proof[]` — คำสั่งที่พิสูจน์ | ติ๊ก `done` โดย `proof` ว่าง = ผิดกติกา ไม่ใช่แค่ไม่สวย |
| `blocked_by[]` | ทั้ง id ของงานอื่น และเงื่อนไขที่เป็นคน (`"เจ้าของสั่ง git init"`) |

**กติกาของรายการนี้** (DOC-STANDARD §7 กติกา 2, ยืมจากบทความ long-running agent):
- **ห้ามลบรายการที่ยังไม่เสร็จเพื่อให้ดูเหมือนเสร็จ** — *"unacceptable to remove or edit tests"*
- **ห้ามติ๊กว่าเสร็จโดยไม่ระบุคำสั่งที่พิสูจน์** — "รันแล้วไม่ error" ไม่ใช่เกณฑ์ผ่าน
- ทำ**ทีละข้อ**ต่อ session · ปิดท้ายด้วยการอัปเดต `docs/progress.json` ไม่ใช่รวบทำหลายข้อแล้วจำไม่ได้ว่าทำอะไรไป
- **`verify-design.mjs` เกิดแล้ว (งานข้อ 5) แต่ยังไม่มี check ข้อไหนอ่านไฟล์นี้** — พิสูจน์: `grep -n progress scripts/verify-design.mjs` เจอแค่คำในข้อความของ D6
  แปลว่ากติกา 3 ข้อข้างบน**ยังบังคับด้วยการรีวิว ไม่ใช่ด้วยเครื่อง** · "มีสคริปต์แล้ว" ≠ "มีคนตรวจไฟล์นี้แล้ว" — อย่าสับสนสองอย่างนี้

---

## 5. ประตูที่เคาะแล้ว — บันทึกคำตอบไว้ ห้ามเปิดถามซ้ำ

ประตู 1–2 · 4–5 ปิดเมื่อ **2026-08-13** · ประตู 6 ปิดเมื่อ **2026-08-14** · ประตู 3 **ยังเปิดอยู่** · เขียนคำตอบไว้เพราะ session ถัดไปจะเจอคำถามเดิมแล้วเผลอตอบใหม่ให้ต่างออกไป

> **ประตู 4 ถูกเปิดถามซ้ำจริงเมื่อ 2026-08-13 และเสียเวลาไปหนึ่งรอบเพราะไม่มีใครจดไว้** — เจ้าของถามว่า
> *"เคยสั่งให้รวม `/req:change` เข้า `/req:capture` ไว้หรือเปล่า"* แล้วค้นทั้ง repo ไม่เจอบันทึกสักที่
> (`.remember/` เหลือแค่ของวันเดียว · §5 มีแค่ 3 ประตู · `progress.json` ไม่มี) นี่คือความพังที่หัวข้อนี้มีไว้กันพอดี
> **กติกาที่ตามมา: การตัดสินใจเรื่องขอบเขตของคำสั่ง ต้องลงที่นี่ทันทีที่เคาะ ไม่ใช่ตอนจบ session**

**ประตู 1 · ชื่อ marketplace = `aeon`** ✅ ผูกลง `.claude-plugin/marketplace.json` แล้ว
(ตัวเลือกที่ทิ้งไป: `sysdev` `devflow` `sdlc`) — คนจะพิมพ์ `/plugin marketplace add` ด้วยชื่อนี้ **เปลี่ยนตอนนี้ = เจ็บ**

**ประตู 2 · `aeon` ยืนอยู่ลำพัง ไม่สืบทอดจากใคร** ✅ **เคาะ 2026-08-13**
`plugins/req/` · `schemas/spec.schema.json` · `docs/**` ทั้งหมดเป็นของ repo นี้ **ไม่มีต้นทาง ไม่มีปลายทาง ไม่มีอะไรให้ซิงก์**
- **ห้ามอ้างอิง / คัดลอก / merge กับ marketplace หรือ plugin ของ repo อื่น** ไม่ว่าจะดูเหมือนเป็นญาติกันแค่ไหน
- เลข `v0.2.0` ที่ยังเห็นในเอกสารออกแบบ = **ร่างรุ่นก่อนของแบบนั้นเอง** ใช้เป็นเส้นฐานเทียบส่วนต่าง ไม่ใช่ของที่ติดตั้งอยู่ที่ไหน
- ไดเรกทอรีสถานะ **ค่าเริ่มต้น `.aeon/`** (เดิม `.scenarioops/` — เปลี่ยนแล้วทั้ง repo 2026-08-13) · ติดตั้งด้วย `/plugin install req@aeon`
  **ชื่อนี้เป็นพารามิเตอร์ ไม่ใช่ค่าคงที่** — ลำดับ: `--spec <path>` > `--state-dir <ชื่อ>` > `$AEON_STATE_DIR` > `.aeon`
  เขียนไว้ที่เดียวใน `plugins/req/scripts/state-dir.mjs` · **ห้ามพิมพ์ `.aeon` ลงสคริปต์ คำสั่ง หรือเอกสารที่ generate อีก** — เรียก resolver เอา
  **จงใจไม่มี auto-detect** ("ไล่หาโฟลเดอร์ที่มี spec.json") เพราะถ้าเปลี่ยนชื่อแล้วมีของเก่าค้าง มันจะอ่านไฟล์ผิดแบบเงียบ ๆ · หาไม่เจอ = exit 2 พร้อมบอก path
- **ผลพลอยได้:** `verify-design.mjs` กับ `verify-rules.mjs` อยู่ repo เดียวกัน → DOC-STANDARD §9 (D1–D5 import โมดูลร่วม `doc-frontmatter.mjs`) ทำได้จริง ไม่ต้องแยก package

**ประตู 3 · workspace อยู่ใต้ git แล้ว** ✅ **ปิดเมื่อ 2026-08-20 (เจ้าของสั่ง)**
เจ้าของสั่ง `git init and commit` แล้วสั่ง push ต่อ · หลักฐานเต็มอยู่ที่ `docs/progress.json` งานข้อ 3 `proof[]`
**repo root คือชั้นเหนือ repo นี้หนึ่งชั้น** (`D:/claude/workshop/miniLoan`) — `aeon-marketplace/` จึงเป็น subdirectory ร่วมกับ `aeon-miniloan/`
ซึ่ง**ไม่ตรงกับที่ `.gitignore` ของ repo นี้เขียนไว้ว่า "repo นี้"** · pattern แบบ `/.claude/...` ยังทำงานถูก (pattern ใน `.gitignore` ย่อยอิงโฟลเดอร์ที่มันอยู่)
แต่ด่านที่หวังให้ `git status` ฟ้องเมื่อมี `/.aeon/` โผล่ที่ root ของ marketplace **หายไป** — เจ้าของรับทราบทางเลือกแยก repo แล้วและยังไม่สั่ง
**ตัวกั้นเดิมที่เคยเขียนว่าเครื่องไม่มี git ไม่เป็นจริงแล้ว** — git อยู่ที่ `D:/Program/PortableGit`
**หมายเหตุ CRLF (แก้ 2026-08-20):** `* -text` แปลว่า git **ห้ามแปลง** ตัวขึ้นบรรทัด ไม่ใช่แปลว่าทุกไฟล์เป็น LF · ตัวเลขจริง `git ls-files --eol` = 342 `i/lf` · **6 `i/crlf`** (`docs/brief/*.md` + `docs/requirement/req-skill-create.md` ซึ่งเป็น CRLF มาก่อน git init) · 1 ไบนารี
ไม่กระทบด่าน เพราะทุก clone ได้ไบต์เดียวกัน (ซึ่งคือสิ่งที่ปกป้อง hash จริง) และไม่มีไฟล์ไหนใน 6 ไฟล์อยู่ใน `docs/wiki/**` ที่ D4 เทียบ hash

**ประตู 4 · ชุดคำสั่งหยุดที่ 8 ตัว — ไม่ยุบเพิ่ม ไม่เพิ่มใหม่** ✅ **เคาะ 2026-08-13**

เจ้าของตั้งโจทย์ว่า **"ไม่ต้องการสร้าง command จำนวนมาก"** และเลือกทางแก้เป็น
**"ไม่ยุบคำสั่ง แต่ให้ `ask`/`capture` พาไปเอง"** — คำสั่งที่มี 8 ตัวคือจำนวนสุดท้าย

| ที่เคยคิดจะทำ | ผลการตัดสิน | เหตุผล |
|---|---|---|
| **`/req:rule`** | ❌ **ตัดออกจากโรดแมปถาวร** | งานทั้ง 3 ของมันมีเจ้าของแล้ว — **เพิ่ม**กฎ = `/req:ask` · **ดู**กฎ = `docs/wiki/rules/` (ไฟล์ ไม่ใช่คำสั่ง · รอบ 5 สร้างแล้ว) · **แก้**กฎ = `/req:change` · เหลือ 0 งาน |
| **ยุบ `/req:calc` เข้า `ask` หรือ `rule`** | ❌ **ไม่ยุบ** | `req-pipeline-slides.md` จัด Calculation Contract เป็น**ขั้น 6 แยกจากขั้น 5** และติดธง 🔵 = *"ขั้นที่เอกสารทั่วไปไม่มี และเป็นเหตุผลว่าทำไม LLM ถึงเขียนโค้ดผิดทั้งที่ requirement ครบ"* · การ์ดใบ 6 ระบุกับดักไว้ตรงตัวว่า *"เขียนแค่ 'ปัดเศษให้สม่ำเสมอ' → ไม่มีความหมาย"* ซึ่งคือสิ่งที่เกิดขึ้นเสมอเมื่อสัญญาการคำนวณกลายเป็นหัวข้อย่อยของกฎ · ลูป **L2 ในสไลด์ 3 ชี้ที่ขั้น 6 ไม่ใช่ขั้น 5** |
| **ยุบ `/req:change` เข้า `capture`** | ❌ **ไม่ยุบ** | `/req:change` ต้องเป็น**ทางเดียว**ที่ผลิต `@v(n+1)` (`capture.md` · `SKILL.md` · schema `status` เขียนตรงกันทั้งสามที่) · สองทางเมื่อไหร่ = *"second extraction path"* ที่ doctrine ห้ามตรง ๆ · แทนที่จะยุบ ให้ **`capture` ตรวจจับแล้วพาไป** ซึ่งทำเสร็จแล้วรอบ 4 (§7.7) |
| **`/req:lock` · `/req:impact`** | ⏸ ยังไม่ตัดสิน | `lock` อาจเป็น flag ของ `change` · `impact` ติด `traces_down` จาก phase ที่ยังไม่มีอยู่แล้ว |

> ✅ **`/req:ask` แก้ร่างของตัวเองได้ และนั่นไม่ใช่ "ทางที่สอง"** — เจ้าของสั่งว่าอยากให้ `ask` แก้กฎได้ด้วย
> เส้นแบ่งที่เคาะ: แก้ทับที่เดิมได้เมื่อกฎนั้น **ครบทั้ง 5 ข้อ** — `status: draft` · `version === 1` ·
> `examples[]` ว่าง · ไม่มี `CALC` ที่ `constrains` มัน · ไม่มี `GD`/`CHG` อ้างถึง
> ขาดข้อใดข้อหนึ่ง → **`ask` ไม่แก้ แต่บอกว่าติดข้อไหนแล้วพาไป `/req:change`**
> 5 เงื่อนไขนี้อ่านจาก `spec.json` ตรง ๆ ไม่มีข้อไหนให้ AI ตัดสิน — และไม่ขยับเวอร์ชัน จึงไม่ชนกติกาข้างบน

> ⚠️ **การตรวจจับว่า "คำตอบนี้ขัดกับกฎเดิมไหม" เป็น gate อัตโนมัติไม่ได้ และจะไม่มีเลข check ใหม่ให้มัน**
> design §7.7 เขียนไว้เองว่า *"สองข้อความนี้ขัดกันไหม ไม่มีสคริปต์ไหนตอบได้"* — มันคือ **รอบยืนยันกับคน**
> AI ตั้งข้อสงสัยได้ คนตัดสิน แล้วการตัดสินนั้นถูกบันทึกเป็นข้อมูล (`CHG` / `Q-xxx` / กฎใหม่) ที่ตัวตรวจจับต่อได้

---

**ประตู 5 · ไฟล์สัญญาของ bundle ชื่อ `BUNDLE.md` ไม่ใช่ `CLAUDE.md`** ✅ **เคาะ 2026-08-13 (เจ้าของสั่ง)**

Claude Code โหลดไฟล์ชื่อ `CLAUDE.md` **ทุกไฟล์ในสายไดเรกทอรี** เข้า context ในฐานะ**คำสั่ง**
หน้าสัญญาของ bundle เป็นไฟล์ที่ **generate จากสคริปต์** — ปล่อยให้ใช้ชื่อนั้นต่อ = เอาผลลัพธ์ของสคริปต์ไปวางในช่องคำสั่งประจำของทุก session
และหนักกว่านั้นคือ `/req:capture` เขียน bundle ลง **repo ของลูกค้า** ด้วย

- ใช้กับ **ทั้งสอง bundle** (ฝั่งเครื่องมือ + ฝั่งโปรเจกต์) · ชื่อไฟล์อยู่ที่เดียวใน `SCAFFOLD_FILES` ของ `doc-frontmatter.mjs`
- เปลี่ยนแล้ววัดซ้ำทุกด่าน **ตัวเลขไม่ขยับสักตัว** — rules `44/19` · design `11/6` · clean ทั้งสองฝั่งเขียว
- รายละเอียดเต็มอยู่ที่ [`docs/wiki/adr/ADR-aeon-005.md`](docs/wiki/adr/ADR-aeon-005.md)

---

**ประตู 6 · marketplace กับโปรเจกต์ทดสอบ แยกคนละ repo ถาวร** ✅ **เคาะ 2026-08-14 (เจ้าของสั่ง)**

เดิมทั้งสองอย่างอยู่ไดเรกทอรีเดียวกัน (`D:\ProjectClaude\AEON-Work\miniLoan`) โดยตั้งใจ เพื่อทดสอบภายในโปรเจกต์
เจ้าของสั่งแยกเมื่อ 2026-08-14 · **repo นี้คือฝั่ง marketplace** · สำเนาเดิมยังอยู่ครบและไม่ถูกลบ

| ทำไมต้องแยก | หลักฐาน |
|---|---|
| **`docs/wiki/` ชนกันจริง** — `wiki-authoring.mjs` (ฝั่งเครื่องมือ) กับ `plugins/req/scripts/wiki.mjs` (ฝั่งโปรเจกต์) import `WIKI_DIR` ตัวเดียวกัน | รันทั้งสองที่เดียวกันแล้ว `index.md` + `BUNDLE.md` ถูกเขียนทับ และหน้าอีกฝั่งขึ้น ORPHAN ยกชุด (ไม่ลบ แต่ exit 1) |
| DOC-STANDARD §3.1 เขียนไว้เองว่าสอง bundle *"คนละ repo จึงไม่ชนกัน"* | เมื่ออยู่ repo เดียวกัน ประโยคนั้นเป็นเท็จ |
| `.aeon/` เป็นของโปรเจกต์ · `schemas/` + `scripts/` เป็นของเครื่องมือ | §3.1 บรรทัด *"เส้นแบ่งคือของนี้ตรวจใคร"* |

**สิ่งที่ตามมาและห้ามลืม:** `docs/requirement/requirements.md` (requirement ของ MiniLoan) **ไม่ได้ย้ายมาที่นี่โดยตั้งใจ** ·
`docs/wiki/log.md` ของ repo นี้ถูก **seed ใหม่** ตอนแยก ประวัติการ render เดิมอยู่กับสำเนาเก่าเท่านั้น (ชั้น C ต่อท้ายอย่างเดียว ย้อนสร้างไม่ได้)

---

## 6. กฎยืน — ห้ามแปล ห้ามตีความใหม่

- **ห้ามสร้าง plugin / skill / ไฟล์ใด ๆ จนกว่าเจ้าของจะสั่ง "ให้เริ่ม" ชัดเจน** — การคุยแผน = เก็บข้อมูล ไม่ใช่การอนุมัติ
- **ทุกคำสั่งจบด้วยการหยุดรออนุมัติ 🛑** ไม่มีคำสั่งไหนไหลไปขั้นถัดไปเอง · คำสั่งอ่านอย่างเดียวติดป้าย 👁 และห้ามเขียนไฟล์
- **ตอบเป็นภาษาไทย** (DOC-STANDARD §3.4) · ไฟล์ที่ Claude อ่านทุก session เป็นอังกฤษ · `help` และ `USER-GUIDE.md` เป็นไทย
- **ห้ามเดา** — ข้อมูลที่ขาดคือช่องว่าง ให้บันทึกแล้วส่งกลับขึ้นไป ไม่ใช่เติมให้ดูครบ
- **ทำงานใน main thread** ห้าม spawn subagent เว้นแต่เจ้าของสั่ง — orchestrator ที่ bootstrap context ซ้ำคือของที่ทั้งแนวคิดนี้ตั้งใจหนี
- **ตัวเลขมาจากสคริปต์** ถ้ามันคำนวณได้ · ห้ามนับด้วยมือแล้วพิมพ์ลงเอกสาร

---

## 7. สิ่งที่ทุก plugin ในที่นี้ต้องมี — ตรวจได้ ไม่ใช่ขอความร่วมมือ

สรุปจาก DOC-STANDARD · **ตัวเลข D คือหมายเลข check ใน `scripts/verify-design.mjs` ซึ่งรันได้จริงแล้วตั้งแต่ 2026-08-13**
สั่ง `node scripts/verify-design.mjs --root .` เมื่อไหร่ก็ได้ · **ห้ามติ๊กว่าผ่านจากการอ่านด้วยตา** (DOC-STANDARD §11 สั่งไว้ตรงตัว)

| ต้องมี | ตรวจโดย | ระดับ |
|---|---|---|
| `commands/help.md` **ภาษาไทย** + `USER-GUIDE.md` | D9 · D12a | ❌ error |
| `help.md` **อธิบายครบทุกคำสั่ง** — ขาดตัวเดียวแดง | D11 | ❌ error |
| `SKILL.md` ≤ 500 บรรทัด · frontmatter มีแค่ `name`/`description` | D8 | ❌ error |
| หน้าใน `docs/wiki/**` มี frontmatter · `type` อยู่ในรายการปิด · id ถูกรูปแบบ · **มี hash ที่ถูกรูป** | D1–D4 | ❌ error |
| ↳ **D4 เทียบ hash กับทะเบียนจริงแล้ว** (ใช้ closure ตัวเดียวกับตัวเรนเดอร์ ผ่าน `registry.mjs`) · ไม่มีทะเบียน → ถอยไปตรวจแค่ "มีและถูกรูป" แล้วพิมพ์ LIMIT | — | — |
| ลิงก์ภายในไปถึงไฟล์จริง · มี `index.md` ครบ | D5 · D6 | ⚠️ warn |
| ไม่มีหน้ากำพร้า (D7) | ✅ **บังคับได้แล้ว 2026-08-13** — `docs/design-registry.json` เป็นตัวหาร · ไม่มีทะเบียน = ไม่รันและพิมพ์ LIMIT | ⚠️ warn |
| เอกสารชั้น B มี `owner` + วันที่ทบทวน | D10 | ⚠️ warn |
| `SKILL.md`/`references/` ไม่มีร้อยแก้วไทย | D12b | ⚠️ warn ถาวร |

**กติกาที่พลาดบ่อยที่สุด 3 ข้อ** (เขียนซ้ำตรงนี้เพราะมันแพง):

1. **เอกสารที่ generate ห้ามแก้ด้วยมือ และห้ามมี marker block "แก้ตรงนี้ได้"** — สุดท้ายจะมีคนแก้นอก marker แล้ว regenerate กินทิ้งเงียบ ๆ พังครั้งเดียวแล้วทั้งทีมเลิกเชื่อ regeneration
2. **สถานะอยู่ใน JSON ความรู้อยู่ใน Markdown** — โมเดลลังเลที่จะแก้ JSON แต่แก้ markdown ได้อย่างสบายใจ ของที่ห้ามเพี้ยนต้องอยู่ในรูปที่โมเดลไม่กล้าแตะ
3. **ห้ามมี warn ที่ปิดไม่ได้** — warn ที่แดงตลอดจะสอนให้คนเลิกอ่าน warn ทั้งหมด แล้วลาก check ที่สำคัญตายไปด้วย
