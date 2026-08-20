---
type: Command
title: /req:ask
description: ยิงคำถามทีละ 3 ข้อ — กรอบก่อน แล้วค่อยกฎ
resource: plugins/req/commands/ask.md
tags: [req, phase-1]
timestamp: 2026-08-13T00:00:00+07:00
id: CMD-req-002
lifecycle: built
owner: พี่ปู
spec_hash: sha256:7c8b22655619ab366ca82de64cc43764b344be3939b5e3e9d1a929ab3beabdb9
---

# /req:ask

> หน้านี้ถูก generate จาก `docs/design-registry.json` — **ห้ามแก้ด้วยมือ** แก้ที่ registry แล้ว render ใหม่

## ทำอะไร

คลังคำถาม 2 ชั้น · ชั้น 1 กรอบ 4 หมวด 6 คำถาม ยิงครั้งเดียวต่อโมดูลหลัง capture · ชั้น 2 กฎ 10 หมวด 15 คำถาม ยิงซ้ำได้ต่อ REQ · ทุกข้อมีตัวเลือกยังไม่แน่ใจ ซึ่งกลายเป็นการ์ดแดง

## เกร็ดที่ต้องรู้

- ชั้น 1 ยังเป็นร่าง (provisional) จนกว่าจะงัดกฎที่ลืมได้จริงจากงานลูกค้าจริง

## ของที่มันแตะ

- [PLG-req](../plugins/PLG-req.md) — req
- [CMD-req-006](./CMD-req-006.md) — /req:change

## ของจริงอยู่ที่ไหน

`plugins/req/commands/ask.md`
