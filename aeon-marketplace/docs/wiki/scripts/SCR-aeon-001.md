---
type: Script
title: verify-design.mjs
description: ด่าน deterministic ของฝั่ง authoring — D1–D12b
resource: scripts/verify-design.mjs
tags: [gate, deterministic]
timestamp: 2026-08-13T00:00:00+07:00
id: SCR-aeon-001
lifecycle: built
owner: พี่ปู
spec_hash: sha256:95f1a70cdb0e6f7819f672dbdee2361192d90c4de59f0dc185d28067afff8df0
---

# verify-design.mjs

> หน้านี้ถูก generate จาก `docs/design-registry.json` — **ห้ามแก้ด้วยมือ** แก้ที่ registry แล้ว render ใหม่

## ทำอะไร

คู่แฝดของ verify-rules แต่ถามกับตัวเครื่องมือเองว่าเอกสารยังชี้ถึงกันจริงไหม · D1–D5 import ระดับความรุนแรงมาจากโมดูลร่วม · D7 ยังไม่รัน ประกาศเป็นบรรทัด LIMIT ทุกครั้ง

## ของที่มันแตะ

- [SCR-req-004](./SCR-req-004.md) — doc-frontmatter.mjs
- [STD-doc-001](../standards/STD-doc-001.md) — DOC-STANDARD v1.1
- [SCR-aeon-002](./SCR-aeon-002.md) — wiki-authoring.mjs

## ของจริงอยู่ที่ไหน

`scripts/verify-design.mjs`
