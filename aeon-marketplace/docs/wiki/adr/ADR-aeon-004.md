---
type: Decision
title: ชุดคำสั่งของ req หยุดที่ 8 ตัว และ /req:rule ถูกตัดถาวร
description: เคาะ 2026-08-13 · ไม่ยุบเพิ่ม ไม่เพิ่มใหม่
resource: CLAUDE.md
tags: [adr, scope]
timestamp: 2026-08-13T00:00:00+07:00
id: ADR-aeon-004
lifecycle: built
owner: พี่ปู
spec_hash: sha256:9aa648a63936eac7e9cf38d36cfe3c94547a87c79bac146274e194474e1b2342
---

# ชุดคำสั่งของ req หยุดที่ 8 ตัว และ /req:rule ถูกตัดถาวร

> หน้านี้ถูก generate จาก `docs/design-registry.json` — **ห้ามแก้ด้วยมือ** แก้ที่ registry แล้ว render ใหม่

## ทำอะไร

งานทั้ง 3 ของ /req:rule มีเจ้าของแล้ว — เพิ่มกฎคือ /req:ask · ดูกฎคือเปิดไฟล์ใน wiki · แก้กฎคือ /req:change · ส่วน calc ไม่ยุบเข้า ask เพราะสัญญาการคำนวณเป็นขั้นแยกที่มีกับดักของตัวเอง

## ของที่มันแตะ

- [PLG-req](../plugins/PLG-req.md) — req
- [CMD-req-002](../commands/CMD-req-002.md) — /req:ask
- [CMD-req-003](../commands/CMD-req-003.md) — /req:calc
- [CMD-req-006](../commands/CMD-req-006.md) — /req:change

## ของจริงอยู่ที่ไหน

`CLAUDE.md`
