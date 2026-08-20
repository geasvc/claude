---
type: Command
title: /req:calc
description: ตรึงวิธีคิดเลขของกฎเป็นสัญญาการคำนวณ
resource: plugins/req/commands/calc.md
tags: [req, phase-1]
timestamp: 2026-08-13T00:00:00+07:00
id: CMD-req-003
lifecycle: built
owner: พี่ปู
spec_hash: sha256:398d6cd597c622cac1426920ab0fbd10a7fdcd34ff3c1a5e92612f49c7555fbd
---

# /req:calc

> หน้านี้ถูก generate จาก `docs/design-registry.json` — **ห้ามแก้ด้วยมือ** แก้ที่ registry แล้ว render ใหม่

## ทำอะไร

ถาม 7 หัวข้อ: สูตร · input+ชนิด · ชนิดตัวเลข (ห้าม float) · วิธีปัด · ปัดตรงไหน · เศษที่เหลือ · ขอบเขต — ช่อง ปัดตรงไหน ช่องเดียวเปลี่ยนยอดจริงหลักบาท

## ของที่มันแตะ

- [PLG-req](../plugins/PLG-req.md) — req
- [CMD-req-005](./CMD-req-005.md) — /req:golden

## ของจริงอยู่ที่ไหน

`plugins/req/commands/calc.md`
