---
type: Script
title: wiki-authoring.mjs
description: ตัวเรนเดอร์ bundle ของตัวเครื่องมือเอง
resource: scripts/wiki-authoring.mjs
tags: [renderer]
timestamp: 2026-08-13T00:00:00+07:00
id: SCR-aeon-002
lifecycle: built
owner: พี่ปู
spec_hash: sha256:22fb06b5a98a0038ae3051ca919e24e1aeb6ab63517efc5939db64b23c6aa6c7
---

# wiki-authoring.mjs

> หน้านี้ถูก generate จาก `docs/design-registry.json` — **ห้ามแก้ด้วยมือ** แก้ที่ registry แล้ว render ใหม่

## ทำอะไร

อ่าน docs/design-registry.json แล้วเขียน docs/wiki/** · hash ต่อโหนดครอบทุกอย่างที่หน้านั้นเรนเดอร์ รวมชื่อของโหนดที่ลิงก์ถึง · รันซ้ำแล้วไม่เขียนอะไรถ้าไม่มีอะไรขยับ

## ของที่มันแตะ

- [SCR-req-003](./SCR-req-003.md) — doc-hash.mjs
- [SCR-aeon-001](./SCR-aeon-001.md) — verify-design.mjs
- [MKT-aeon](../marketplace/MKT-aeon.md) — aeon

## ของจริงอยู่ที่ไหน

`scripts/wiki-authoring.mjs`
