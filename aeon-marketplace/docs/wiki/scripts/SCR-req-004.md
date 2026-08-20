---
type: Script
title: doc-frontmatter.mjs
description: นิยามเดียวของกติกาเอกสาร 5 ข้อที่สองด่านใช้ร่วมกัน
resource: plugins/req/scripts/doc-frontmatter.mjs
tags: [shared, gate]
timestamp: 2026-08-13T00:00:00+07:00
id: SCR-req-004
lifecycle: built
owner: พี่ปู
spec_hash: sha256:04b20505f5fb1a28704d574cce95db3a0d46ea29f749c4afffd1f233070dc361
---

# doc-frontmatter.mjs

> หน้านี้ถูก generate จาก `docs/design-registry.json` — **ห้ามแก้ด้วยมือ** แก้ที่ registry แล้ว render ใหม่

## ทำอะไร

ระดับความรุนแรงอยู่ในไฟล์นี้ ไม่ได้อยู่ที่ผู้เรียก — ผู้เรียกตั้งชื่อ finding ใหม่ได้ แต่เปลี่ยนระดับไม่ได้ เพราะกติกาเดียวกันที่ตอบต่างกันสองที่คือของที่ทำให้คนเลิกเชื่อตัวตรวจ

## ของที่มันแตะ

- [SCR-req-001](./SCR-req-001.md) — verify-rules.mjs
- [SCR-aeon-001](./SCR-aeon-001.md) — verify-design.mjs
- [SCH-spec](../schemas/SCH-spec.md) — spec.schema.json

## ของจริงอยู่ที่ไหน

`plugins/req/scripts/doc-frontmatter.mjs`
