---
type: Script
title: registry.mjs
description: นิยามเดียวของทะเบียน — โหลด · ตรวจความถูกต้อง · ที่อยู่ของหน้า · ขอบเขตของ hash
resource: scripts/registry.mjs
tags: [shared, renderer, gate]
timestamp: 2026-08-13T00:00:00+07:00
id: SCR-aeon-003
lifecycle: built
owner: พี่ปู
spec_hash: sha256:47ac3cdaec7f6390ffb383082c24a6f1aa013660a57028be55f1b8b822486b18
---

# registry.mjs

> หน้านี้ถูก generate จาก `docs/design-registry.json` — **ห้ามแก้ด้วยมือ** แก้ที่ registry แล้ว render ใหม่

## ทำอะไร

ตัวเรนเดอร์เขียน bundle จากคำตอบชุดนี้ และด่านตรวจ bundle ด้วยคำตอบชุดเดียวกัน — ด่านที่คำนวณ hash ด้วยวิธีของตัวเองคือด่านที่ตรวจเลขคณิตของตัวเอง ไม่ใช่ของตัวเรนเดอร์

## ของที่มันแตะ

- [SCR-aeon-001](./SCR-aeon-001.md) — verify-design.mjs
- [SCR-aeon-002](./SCR-aeon-002.md) — wiki-authoring.mjs
- [SCR-req-003](./SCR-req-003.md) — doc-hash.mjs
- [SCR-req-004](./SCR-req-004.md) — doc-frontmatter.mjs

## ของจริงอยู่ที่ไหน

`scripts/registry.mjs`
