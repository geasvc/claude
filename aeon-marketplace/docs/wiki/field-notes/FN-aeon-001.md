---
type: Field Note
title: D11 รุ่นแรกผ่านได้โดยบังเอิญ 6 ใน 7 คำสั่ง
description: วัดเมื่อ 2026-08-13 ตอนสร้าง verify-design.mjs
resource: scripts/fixtures/dirty/EXPECTED.md
tags: [field-note, gate]
timestamp: 2026-08-13T00:00:00+07:00
id: FN-aeon-001
lifecycle: built
owner: พี่ปู
spec_hash: sha256:bcb5535960e3946206d5b9c786c6298400e22e717dfdf0cf650872c6034ff1e9
---

# D11 รุ่นแรกผ่านได้โดยบังเอิญ 6 ใน 7 คำสั่ง

> หน้านี้ถูก generate จาก `docs/design-registry.json` — **ห้ามแก้ด้วยมือ** แก้ที่ registry แล้ว render ใหม่

## ทำอะไร

D11 รุ่นแรกยอมรับ backtick คำเปล่าว่าเป็นการเอ่ยถึงคำสั่ง · วัดกับ help.md ของ req จริงแล้วพบว่า calc capture change check example golden ผ่านทั้งหมดเพราะโผล่ในประโยคเรื่องอื่น เหลือ ask ตัวเดียวที่ไม่ผ่าน · ตัดเงื่อนไขหลวมทิ้ง เหลือรูปแบบ /plugin:command อย่างเดียว

## เกร็ดที่ต้องรู้

- บทเรียน: ตัวตรวจที่ของซึ่งผ่านอยู่แล้วผ่านได้โดยไม่ตั้งใจ ไม่ใช่ตัวตรวจ
- โพรบครั้งแรกที่ใช้พิสูจน์ก็ผิดเอง เพราะแทนข้อความแค่ตัวแรกจากสองตัว — ตัวเลขที่เขียนไว้ก่อนรันคือสิ่งที่จับได้

## ของที่มันแตะ

- [SCR-aeon-001](../scripts/SCR-aeon-001.md) — verify-design.mjs
- [CMD-req-008](../commands/CMD-req-008.md) — /req:help

## ของจริงอยู่ที่ไหน

`scripts/fixtures/dirty/EXPECTED.md`
