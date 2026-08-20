---
description: บทนำ + ภาพรวมระบบ (เอกสารหัวข้อ 1-2) — เขียน context.json แล้วเรนเดอร์เอกสารกับแผนภาพบริบท
argument-hint: "[--state-dir <ชื่อ>]"
---

# /design:overview — บทนำและภาพรวมระบบ

คำสั่งที่สองของ Phase 2 · **ต้องรัน `/design:init` ก่อน** ถ้ายังไม่ได้รัน สคริปต์จะหยุดด้วย exit 2

ผลิตหัวข้อ 1 (บทนำ) กับหัวข้อ 2 (ภาพรวมระบบ) ของเอกสารฉบับลูกค้า ตาม §11

## ของสองอย่างที่ต้องแยกให้ขาด

| งานของคน + โมเดล | งานของสคริปต์ |
|---|---|
| **ตัดสิน**ว่าขอบเขตคืออะไร ข้อจำกัดมีอะไร สมมติอะไรไว้ | **ตรวจ**ว่าเขียนลงไปจริงหรือยัง |
| เขียนลง `context.json` | เรนเดอร์เอกสาร + แผนภาพจากสิ่งที่เขียน |

สคริปต์ **ไม่แต่งเนื้อหาให้** มันตรวจกับเรนเดอร์เท่านั้น — DoD ผูกกับ exit code ไม่ใช่กับการที่โมเดลประกาศว่าเสร็จ (P4)

## ขั้นตอน

1. **อ่านของที่มีอยู่ก่อน** — `spec.json` ของ `req` (requirements + glossary) และ `design.state.json`
   ห้ามเริ่มเขียนก่อนอ่าน (§7.2 กติกา 1)

2. **ร่าง `context.json` กับเจ้าของ** เขียนลงที่ `<state-dir>/design/context.json`
   ยังไม่มีไฟล์ก็สั่งสคริปต์ดูก่อนได้ มันจะพิมพ์รูปร่างตั้งต้นให้:
   ```
   node "${CLAUDE_PLUGIN_ROOT}/scripts/context.mjs" --root .
   ```

   **ห้ามเดาแทนเจ้าของ** ขอบเขตกับข้อสมมติเป็นเรื่องที่ลูกค้าต้องเซ็นรับ ไม่ใช่ของที่เติมให้ดูครบ
   ถ้าไม่รู้ ให้ถาม แล้วบันทึกเป็น `openQuestions` ใน `design.state.json` — อย่าใส่ค่าไปก่อน

   ช่องที่ต้องมี ไม่งั้นด่านแดง:
   - `purpose` — ย่อหน้าเปิดของเอกสาร (OV1)
   - `scope.in` — สิ่งที่อยู่ในขอบเขต **อย่างน้อยหนึ่งข้อ** (OV2) · `scope.out` คือสิ่งที่ **จงใจไม่ทำรอบนี้** ควรเขียนให้ลูกค้าเห็น
   - `constraints[]` + `assumptions[]` — ทุกข้อต้องมี `id` `text` และ `traces[]` ที่ชี้ไป REQ ที่มีจริง (OV3 · OV4 · OV7)
   - `diagram` — `system` + `externals[]` + `flows[]` สำหรับแผนภาพบริบท DFD 0 (OV5) · ปลายทางของ flow ทุกเส้นต้องมีตัวตน (OV6)

3. **ตรวจ** (ยังไม่เขียนอะไร):
   ```
   node "${CLAUDE_PLUGIN_ROOT}/scripts/context.mjs" --root .
   ```
   - **exit 2** — ยังไม่ได้รัน `/design:init` หรือยังไม่มี `context.json` · ยกพาธที่มันบอกมาพูดตรง ๆ
   - **exit 1** — มีไฟล์แต่ไม่ผ่าน DoD · รายงานทีละข้อพร้อม id ที่ผิด **แล้วแก้ `context.json` ไม่ใช่แก้เอกสาร**
   - **exit 0** — ผ่าน

4. **รายงานคำเตือน OV8 ทุกครั้ง ห้ามข้าม** — `users` ว่างเพราะ `req` ไม่มี stakeholder
   §11 หัวข้อ 2 ต้องมีทั้งรายชื่อผู้ใช้และผังผู้เกี่ยวข้อง ตอนนี้ทำไม่ได้ทั้งคู่
   **ยังไม่บล็อกที่นี่ แต่จะเป็น error ตอน `/design:rbac`** (§13.3 A4 · V23) — เจ้าของต้องรู้ตั้งแต่ตอนนี้

5. **หยุดขออนุมัติ 🛑**

6. อนุมัติแล้วค่อยเรนเดอร์:
   ```
   node "${CLAUDE_PLUGIN_ROOT}/scripts/context.mjs" --root . --write
   ```
   ได้ `docs/design/01-introduction.md` กับ `docs/design/02-system-overview.md`

7. บอกคำสั่งถัดไปคือ `/design:function` **ห้ามรันเอง** แล้วหยุด 🛑

## เอกสารที่ออกมา ห้ามแก้ด้วยมือ

ทั้งสองไฟล์ **generate ทั้งไฟล์** และมีหัวเตือนติดอยู่ในตัวไฟล์

> §11.1 เขียนว่าแผนภาพบริบทให้ *"generate แล้วคนมาแก้ต่อได้"* ซึ่ง **ขัดกับ CLAUDE.md §7 กติกา 1** ที่ห้ามแก้ของ generate ด้วยมือ
> เจ้าของเคาะเมื่อ 2026-08-20: **แก้ที่ `context.json` เท่านั้น** แล้ว render ใหม่ — ได้ทั้งสองกติกาพร้อมกัน และรักษา P2 (JSON คือความจริง เอกสารเป็นภาพฉาย)
> เหตุผลที่ห้ามมี marker "แก้ตรงนี้ได้": สุดท้ายจะมีคนแก้นอก marker แล้ว regenerate กินทิ้งเงียบ ๆ พังครั้งเดียวทั้งทีมเลิกเชื่อ regeneration

## As-Is / To-Be — เขียนมือ ไม่ได้มาจากคำสั่งนี้

D6 เคาะเมื่อ 2026-08-20: **Mermaid swimlane เก็บใน `docs/wiki/`**

Mermaid ไม่รองรับ BPMN จึงใช้ `flowchart` ที่มี `subgraph` แทน lane · อยู่ใน git แล้ว diff ได้ ไม่ต้องพึ่งเครื่องมือนอก
แลกกับการที่ได้ notation ไม่เต็มมาตรฐาน BPMN (ไม่มี gateway / event ตามมาตรฐาน)

เก็บใน `wiki/` ไม่ใช่ `docs/design/` เพราะผังกระบวนการยังจริงอยู่หลังเฟสนี้จบ — `docs/` คือสำนวนคดี `wiki/` คือห้องสมุด (§5.2)

## ตรวจตัวสคริปต์เอง

```
node "${CLAUDE_PLUGIN_ROOT}/scripts/context.mjs" --root "${CLAUDE_PLUGIN_ROOT}/scripts/fixtures/context-ok"    # ต้อง exit 0 · 0 error · 1 warn (OV8)
node "${CLAUDE_PLUGIN_ROOT}/scripts/context.mjs" --root "${CLAUDE_PLUGIN_ROOT}/scripts/fixtures/context-bad"   # ต้อง exit 1 · 6 error · 1 warn
node "${CLAUDE_PLUGIN_ROOT}/scripts/context.mjs" --root "${CLAUDE_PLUGIN_ROOT}/scripts/fixtures/clean"         # ต้อง exit 2 (ยังไม่ได้รัน init)
```

สัญญาของแต่ละ fixture อยู่ที่ `scripts/fixtures/EXPECTED.md`
