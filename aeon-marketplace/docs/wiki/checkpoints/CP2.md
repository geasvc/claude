---
type: Checkpoint
title: CP2 — คิวส่งต่อ Phase 2
description: ด่านของคำถามที่ตอบไม่ได้จนกว่าจะเห็น entity
resource: plugins/req/scripts/verify-rules.mjs
tags: [checkpoint]
timestamp: 2026-08-13T00:00:00+07:00
id: CP2
lifecycle: built
owner: พี่ปู
spec_hash: sha256:fe32606da4260a91f19aa8ff039aa9102f486947999df023502605a1f15e5033
---

# CP2 — คิวส่งต่อ Phase 2

> หน้านี้ถูก generate จาก `docs/design-registry.json` — **ห้ามแก้ด้วยมือ** แก้ที่ registry แล้ว render ใหม่

## ทำอะไร

deferred_questions[] ต้องถูกตอบก่อนจบ Phase 2 · จงใจไม่บล็อก CP1 เพราะถ้าบล็อก CP1 จะไปไม่ถึงโดยการออกแบบ

## ของที่มันแตะ

- [SCR-req-001](../scripts/SCR-req-001.md) — verify-rules.mjs
- [CMD-req-007](../commands/CMD-req-007.md) — /req:check

## ของจริงอยู่ที่ไหน

`plugins/req/scripts/verify-rules.mjs`
