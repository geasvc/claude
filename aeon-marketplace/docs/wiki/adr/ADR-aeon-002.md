---
type: Decision
title: aeon ยืนอยู่ลำพัง ไม่สืบทอดจากใคร
description: เคาะ 2026-08-13 · ห้ามอ้างอิง คัดลอก หรือ merge กับ marketplace หรือ plugin ของ repo อื่น
resource: CLAUDE.md
tags: [adr, scope]
timestamp: 2026-08-13T00:00:00+07:00
id: ADR-aeon-002
lifecycle: built
owner: พี่ปู
spec_hash: sha256:175c98b1973f39e6fcfdfdc4a378dec8825934420fe38d98dba0849a1ec70d80
---

# aeon ยืนอยู่ลำพัง ไม่สืบทอดจากใคร

> หน้านี้ถูก generate จาก `docs/design-registry.json` — **ห้ามแก้ด้วยมือ** แก้ที่ registry แล้ว render ใหม่

## ทำอะไร

ทุกคำตอบต้องหาได้จากไฟล์ใน repo นี้เท่านั้น หาไม่เจอแปลว่าไม่มี ให้บันทึกเป็นช่องว่างแล้วถาม ห้ามไปหยิบจาก repo อื่นมาเติม

## เกร็ดที่ต้องรู้

- ผลพลอยได้: verify-design กับ verify-rules อยู่ repo เดียวกัน จึง import โมดูลร่วมได้จริง

## ของที่มันแตะ

- [MKT-aeon](../marketplace/MKT-aeon.md) — aeon
- [SCR-req-004](../scripts/SCR-req-004.md) — doc-frontmatter.mjs

## ของจริงอยู่ที่ไหน

`CLAUDE.md`
