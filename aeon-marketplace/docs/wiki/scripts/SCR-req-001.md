---
type: Script
title: verify-rules.mjs
description: ด่าน deterministic ของฝั่งโปรเจกต์ — 14 ข้อ ไม่มีข้อไหนให้ AI ตัดสิน
resource: plugins/req/scripts/verify-rules.mjs
tags: [gate, deterministic]
timestamp: 2026-08-13T00:00:00+07:00
id: SCR-req-001
lifecycle: built
owner: พี่ปู
spec_hash: sha256:63ef37a78fb3e8afe29f8b5e194ccf2217597f78eefbfafca1fb720a775e01d9
---

# verify-rules.mjs

> หน้านี้ถูก generate จาก `docs/design-registry.json` — **ห้ามแก้ด้วยมือ** แก้ที่ registry แล้ว render ใหม่

## ทำอะไร

exit 0 เขียว · 1 เจอปัญหาพิมพ์ออกมาทุกข้อ · 2 ไฟล์พัง · เตือนอย่างเดียว 3 ข้อคือ 11/13/14 · ข้อ 5 เป็นของ CP2

## ของที่มันแตะ

- [CP1](../checkpoints/CP1.md) — CP1 — จบ Phase 1 ได้หรือยัง
- [CP2](../checkpoints/CP2.md) — CP2 — คิวส่งต่อ Phase 2
- [SCR-req-002](./SCR-req-002.md) — rollup.mjs
- [SCR-req-003](./SCR-req-003.md) — doc-hash.mjs
- [SCR-req-004](./SCR-req-004.md) — doc-frontmatter.mjs
- [SCR-req-005](./SCR-req-005.md) — wiki.mjs

## ของจริงอยู่ที่ไหน

`plugins/req/scripts/verify-rules.mjs`
