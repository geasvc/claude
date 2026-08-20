---
type: Command
title: /req:check
description: 👁 สถานะและด่าน CP1 — อ่านอย่างเดียว
resource: plugins/req/commands/check.md
tags: [req, phase-1, read-only]
timestamp: 2026-08-13T00:00:00+07:00
id: CMD-req-007
lifecycle: built
owner: พี่ปู
spec_hash: sha256:96257782bd9de89d98daed64a2b1e827f33b466bbd6d15e6076c6a9bcc15603f
---

# /req:check

> หน้านี้ถูก generate จาก `docs/design-registry.json` — **ห้ามแก้ด้วยมือ** แก้ที่ registry แล้ว render ใหม่

## ทำอะไร

รายงาน 4 หัวข้อ: บล็อก CP1 · บล็อก CP2 · เตือนไม่บล็อก · สถานะรวม · ห้ามเขียนไฟล์ใด ๆ

## ของที่มันแตะ

- [PLG-req](../plugins/PLG-req.md) — req
- [CP1](../checkpoints/CP1.md) — CP1 — จบ Phase 1 ได้หรือยัง
- [CP2](../checkpoints/CP2.md) — CP2 — คิวส่งต่อ Phase 2
- [SCR-req-001](../scripts/SCR-req-001.md) — verify-rules.mjs

## ของจริงอยู่ที่ไหน

`plugins/req/commands/check.md`
