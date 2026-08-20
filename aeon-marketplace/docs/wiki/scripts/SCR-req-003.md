---
type: Script
title: doc-hash.mjs
description: เจ้าของลายนิ้วมือของเอกสารที่ generate
resource: plugins/req/scripts/doc-hash.mjs
tags: [hash]
timestamp: 2026-08-13T00:00:00+07:00
id: SCR-req-003
lifecycle: built
owner: พี่ปู
spec_hash: sha256:dfa972a12a0efa76f8ea4ffc367250743f870ba94c696b171782b0da5407ecce
---

# doc-hash.mjs

> หน้านี้ถูก generate จาก `docs/design-registry.json` — **ห้ามแก้ด้วยมือ** แก้ที่ registry แล้ว render ใหม่

## ทำอะไร

reqDocHash สำหรับเอกสารต่อ requirement · nodeDocHash สำหรับหน้า wiki ต่อโหนด · ขอบเขตของ hash ต้องครอบทุกอย่างที่หน้านั้นเรนเดอร์ ไม่ใช่แค่ตัวโหนด

## ของที่มันแตะ

- [SCR-req-001](./SCR-req-001.md) — verify-rules.mjs
- [SCR-req-005](./SCR-req-005.md) — wiki.mjs
- [SCR-aeon-002](./SCR-aeon-002.md) — wiki-authoring.mjs

## ของจริงอยู่ที่ไหน

`plugins/req/scripts/doc-hash.mjs`
