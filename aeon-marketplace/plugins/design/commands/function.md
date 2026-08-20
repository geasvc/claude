---
description: ความต้องการเชิงหน้าที่ (เอกสารหัวข้อ 3) — FN + UC + เครื่องสถานะ + กราฟสาวกลับ
argument-hint: "[--state-dir <ชื่อ>]"
---

# /design:function — ความต้องการเชิงหน้าที่

คำสั่งที่สามของ Phase 2 · **ต้องรัน `/design:overview` ให้เสร็จก่อน** ไม่งั้นหยุดด้วย exit 2

ผลิตหัวข้อ 3 ของเอกสารลูกค้า: หน้าที่ของระบบ (FN) · use case (UC) · เครื่องสถานะ (STM) · แผนภาพทั้งสองแบบ

## กฎธุรกิจ — **อ้าง ไม่ใช่สร้างใหม่**

`req` มีกฎธุรกิจอยู่แล้วเป็น `BR-xxx@vN` พร้อมข้อความ ตัวอย่าง และที่มา **`design` ห้ามมินต์ `RULE-###` ขึ้นมาคู่ขนาน**

> §6.1 เดิมให้ `RULE-###` เป็นของ design แต่บนโปรเจกต์จริงมันไม่มีอะไรให้ตั้งชื่อ — `req` ครองกฎอยู่แล้ว
> สร้างคู่ขนานเมื่อไหร่ = มีแหล่งความจริงสองที่ภายในสัปดาห์เดียว (§5.4 W3 ห้ามตรงตัว)
> และจะเพี้ยนทันทีที่ `/req:change` ดันกฎขึ้น `@v2` เพราะมีแค่ฝั่งเดียวที่มีเส้นทางเปลี่ยนเวอร์ชัน
> **เจ้าของเคาะ 2026-08-20: อ้าง `BR-xxx@vN` ตรง ๆ · เลิกใช้ `RULE-###`**

**ถ้าระหว่างออกแบบเจอกฎที่ `req` ไม่มี — ห้ามเขียนเองที่นี่** ส่งกลับผ่าน back-channel (§19.3) เพราะ §1.2 ห้าม `design` เก็บ requirement เอง

## ขั้นตอน

1. **อ่านก่อน** — `spec.json` (requirements · rules) และ `design.state.json`

2. **ร่างสองไฟล์กับเจ้าของ** ที่ `<state-dir>/design/`
   - `functions.json` — FN แต่ละตัวมี `traces[]` (ชี้ REQ) · `governedBy[]` (ชี้ `BR-xxx@vN`) · `operatesOn[]` · `useCases[]`
   - `statemachines.json` — STM แต่ละตัวมี `entity` · `initial` · `states[]` · `transitions[]`

   ยังไม่มีไฟล์ก็รันดูก่อน มันพิมพ์รูปร่างตั้งต้นให้:
   ```
   node "${CLAUDE_PLUGIN_ROOT}/scripts/functions.mjs" --root .
   ```

   **UC ทุกตัวต้องมีครบ 5 อย่าง** ไม่งั้น FU4 แดง — `actor` · `preconditions` · `mainFlow` · `alternateFlows` · `exceptionFlows`

   > **ทางเลือกกับทางยกเว้นที่ไม่มีใครเขียน คือพฤติกรรมที่ไม่มีใครสร้างและไม่มีใครทดสอบ**
   > นี่คือเหตุผลที่ V3 กับ DoD บังคับทั้งคู่ ไม่ใช่แค่ทางหลัก

3. **REQ ที่ไม่ได้ทำเป็นหน้าที่ ต้องประกาศ ไม่ใช่เงียบ**
   ใส่ใน `notFunctional[]` พร้อม `reason` ที่เขียนจริง — FU1 แดงทั้งกรณีลืม และกรณีใส่เหตุผลว่าง
   **การไม่ทำต้องเป็นการตัดสินใจที่มีคนรับผิดชอบ ไม่ใช่ของที่หายไประหว่างทาง**

4. **ตรวจ** (ยังไม่เขียนอะไร):
   ```
   node "${CLAUDE_PLUGIN_ROOT}/scripts/functions.mjs" --root .
   ```
   - **exit 2** — `overview` ยังไม่เสร็จ หรือยังไม่มีไฟล์ · ยกพาธที่มันบอกมาพูดตรง ๆ
   - **exit 1** — ไม่ผ่าน · รายงานทีละข้อพร้อม id **แล้วแก้ JSON ไม่ใช่แก้เอกสาร**
   - **exit 0** — ผ่าน

   | ด่าน | ตรวจอะไร |
   |---|---|
   | FU1 | ทุก REQ ถูก map เป็น FN หรือประกาศ `notFunctional` พร้อมเหตุผล |
   | FU2 | ทุก FN สาวกลับถึง REQ ที่มีจริง (V2 — กัน scope creep) |
   | FU3 | ทุก FN มี UC อย่างน้อยหนึ่งตัว |
   | FU4 | ทุก UC ครบ 5 อย่าง (V3 + DoD) |
   | FU5 | ทุก `governedBy` ชี้ BR ที่มีจริงและ **`is_current`** — กฎที่ถูกแทนที่แล้วห้ามกำกับหน้าที่ |
   | FU6 | ทุก STM มีสถานะ มีทางเปลี่ยน และสถานะเริ่มต้นมีอยู่จริง |
   | FU7 | **ไม่มีสถานะตัน** — สถานะที่ไม่ใช่สถานะจบต้องมีทางออก (V4) |
   | FU8 | id ไม่ซ้ำและถูกรูปแบบ |

5. **หยุดขออนุมัติ 🛑**

6. เขียนจริง:
   ```
   node "${CLAUDE_PLUGIN_ROOT}/scripts/functions.mjs" --root . --write
   ```
   ได้ `trace.design.json` + `docs/design/03-functional-requirements.md`

7. บอกคำสั่งถัดไปคือ `/design:nfr` หรือ `/design:datamodel` **ห้ามรันเอง** แล้วหยุด 🛑

## กราฟสาวกลับ — generate ไม่ใช่เขียนมือ

`trace.design.json` ถูก**คำนวณจาก** `functions.json` + `statemachines.json` ทุกครั้ง

> §7.2 กติกา 5 บังคับให้อัปเดต trace ทุกครั้งที่สร้างของใหม่ · การให้โมเดลไล่จำ edge list ให้ตรงกับสองไฟล์ด้วยมือ คือการสั่งให้ edge list ผิด
> พอ generate แล้ว **กราฟขัดกับของที่มันบรรยายไม่ได้เลย**

ชื่อไฟล์เป็น `trace.design.json` ไม่ใช่ `trace.json` เพราะ §6.2 แยกกราฟ**ตามคนเขียน** — `qa` กับ `dev` ต่อ edge ของตัวเองได้โดยไม่มี regeneration ไหนกินทิ้ง (§19.2 รอยรั่ว L1)
(§5.1 ยังวาด `trace.json` ไฟล์เดียว · §6.2 เป็นการตัดสินใจทีหลังและมีเหตุผลกำกับ จึงชนะ)

## เอกสารที่ออกมา ห้ามแก้ด้วยมือ

แก้ที่ JSON แล้ว render ใหม่ · ไฟล์มีหัวเตือนติดอยู่ในตัว

**แผนภาพสร้างเองทั้งคู่** — use case เป็น `flowchart` (Mermaid ไม่มี use case diagram แท้) · สถานะเป็น `stateDiagram-v2`

> **id ของโหนดถูกแจกให้ไม่ชนกันโดยตั้งใจ** — การล้างอักขระที่ไม่ใช่ ASCII ทิ้งจะทำให้ชื่อไทยสองชื่อที่ยาวเท่ากันกลายเป็น id เดียวกัน แล้วแผนภาพจะ**ยุบ actor สองตัวเป็นตัวเดียวเงียบ ๆ** · ชื่อ actor กับชื่อสถานะเป็นภาษาไทยทุกโปรเจกต์ที่นี่ นี่จึงเป็นกรณีปกติ ไม่ใช่กรณีพิเศษ

## ตรวจตัวสคริปต์เอง

```
node "${CLAUDE_PLUGIN_ROOT}/scripts/functions.mjs" --root "${CLAUDE_PLUGIN_ROOT}/scripts/fixtures/function-ok"    # ต้อง exit 0 · 0 error
node "${CLAUDE_PLUGIN_ROOT}/scripts/functions.mjs" --root "${CLAUDE_PLUGIN_ROOT}/scripts/fixtures/function-bad"   # ต้อง exit 1 · 8 error (FU1-FU8 ข้อละครั้ง)
node "${CLAUDE_PLUGIN_ROOT}/scripts/functions.mjs" --root "${CLAUDE_PLUGIN_ROOT}/scripts/fixtures/context-ok"     # ต้อง exit 2 (overview ยังไม่เสร็จ)
```

สัญญาของแต่ละ fixture อยู่ที่ `scripts/fixtures/EXPECTED.md`
