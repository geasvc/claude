---
type: Checkpoint
title: CP1 — จบ Phase 1 ได้หรือยัง
description: ด่านที่บอกว่าเก็บ requirement ครบพอจะส่งต่อหรือยัง
resource: plugins/req/scripts/verify-rules.mjs
tags: [checkpoint]
timestamp: 2026-08-13T00:00:00+07:00
id: CP1
lifecycle: built
owner: พี่ปู
spec_hash: sha256:03c04190e1a5512d79be2b16384e2eeb1274c8f44feb7e686eedf8951eb70ba1
---

# CP1 — จบ Phase 1 ได้หรือยัง

> หน้านี้ถูก generate จาก `docs/design-registry.json` — **ห้ามแก้ด้วยมือ** แก้ที่ registry แล้ว render ใหม่

## ทำอะไร

การ์ดแดงต้องเป็นศูนย์ · กฎที่ใช้อยู่ทุกข้อต้องมีตัวอย่างพิสูจน์ · เอกสารที่ generate ต้องตรงกับ spec.json · ตัวตรวจเขียวไม่เท่ากับอนุมัติ คนเป็นคนเซ็น

## ของที่มันแตะ

- [SCR-req-001](../scripts/SCR-req-001.md) — verify-rules.mjs
- [CMD-req-007](../commands/CMD-req-007.md) — /req:check

## ของจริงอยู่ที่ไหน

`plugins/req/scripts/verify-rules.mjs`
