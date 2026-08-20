---
type: Command
title: /req:capture
description: ประตูเดียวของ input ดิบทุกชนิดเข้าสู่ spec.json
resource: plugins/req/commands/capture.md
tags: [req, phase-1]
timestamp: 2026-08-13T00:00:00+07:00
id: CMD-req-001
lifecycle: built
owner: พี่ปู
spec_hash: sha256:fb38a1075993955484ccd549a84ef9e6660bb7842a573b70c669f75a3615a37a
---

# /req:capture

> หน้านี้ถูก generate จาก `docs/design-registry.json` — **ห้ามแก้ด้วยมือ** แก้ที่ registry แล้ว render ใหม่

## ทำอะไร

รับข้อความพิมพ์ + ไฟล์แนบหลายไฟล์พร้อมกัน 1 ชิ้น = 1 SRC · อ่านสูตรใน Excel ไม่ใช่แค่ค่าในเซลล์ · ถามเรื่อง PII ก่อนเขียนไฟล์เสมอ · ตัดสินทุกกฎที่ร่างได้ว่าเป็น ใหม่/เดิม/เปลี่ยน/ไม่แน่ใจ ก่อนเขียนอะไรลงไฟล์

## ของที่มันแตะ

- [PLG-req](../plugins/PLG-req.md) — req
- [CMD-req-006](./CMD-req-006.md) — /req:change
- [CMD-req-002](./CMD-req-002.md) — /req:ask

## ของจริงอยู่ที่ไหน

`plugins/req/commands/capture.md`
