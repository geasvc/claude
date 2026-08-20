---
type: Schema
title: spec.schema.json
description: สัญญาโครงสร้างของ spec.json — เจ้าของรูปแบบ id และ enum ทุกตัว
resource: schemas/spec.schema.json
tags: [schema, contract]
timestamp: 2026-08-13T00:00:00+07:00
id: SCH-spec
lifecycle: built
owner: พี่ปู
spec_hash: sha256:5c2dad75b9077852d6c6cf4ce205530501f9e22eeac6d3998e00db2e7c4e64e5
---

# spec.schema.json

> หน้านี้ถูก generate จาก `docs/design-registry.json` — **ห้ามแก้ด้วยมือ** แก้ที่ registry แล้ว render ใหม่

## ทำอะไร

schema_version เป็น const "0.3.0" · เมื่อ schema ขัดกับมาตรฐานเรื่อง id หรือ enum schema ชนะ และมาตรฐานจดเป็นข้อยกเว้น

## เกร็ดที่ต้องรู้

- doc-frontmatter.mjs ถือสำเนา id pattern ไว้ และมีคำสั่ง --verify-against กันไม่ให้สำเนาหนี

## ของที่มันแตะ

- [SCR-req-004](../scripts/SCR-req-004.md) — doc-frontmatter.mjs
- [STD-doc-001](../standards/STD-doc-001.md) — DOC-STANDARD v1.1

## ของจริงอยู่ที่ไหน

`schemas/spec.schema.json`
