---
type: Command
title: /req:change
description: ทางเดียวที่จะเกิดกฎเวอร์ชันถัดไป
resource: plugins/req/commands/change.md
tags: [req, phase-1]
timestamp: 2026-08-13T00:00:00+07:00
id: CMD-req-006
lifecycle: built
owner: พี่ปู
spec_hash: sha256:2bba932c2ea0d04631a9570c7d9b3b791d8fbbeee946340a76ea058de8f9f3e5
---

# /req:change

> หน้านี้ถูก generate จาก `docs/design-registry.json` — **ห้ามแก้ด้วยมือ** แก้ที่ registry แล้ว render ใหม่

## ทำอะไร

บังคับกรอกเหตุผล · ถามตัวอย่างทีละตัวว่ายังพิสูจน์ข้อความใหม่ได้ไหม · บอกรัศมีผลกระทบก่อนเขียน · ลง effective_from บนโหนดเวอร์ชันเอง · ผลิต CHG หนึ่งใบต่อการเปลี่ยนหนึ่งครั้ง

## เกร็ดที่ต้องรู้

- สองทางที่ผลิตเวอร์ชันใหม่ได้ = second extraction path ซึ่ง doctrine ห้ามตรง ๆ

## ของที่มันแตะ

- [PLG-req](../plugins/PLG-req.md) — req
- [CMD-req-001](./CMD-req-001.md) — /req:capture
- [CMD-req-005](./CMD-req-005.md) — /req:golden

## ของจริงอยู่ที่ไหน

`plugins/req/commands/change.md`
