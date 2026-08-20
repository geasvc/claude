---
type: Decision
title: ชื่อไดเรกทอรีสถานะเป็นพารามิเตอร์ ไม่ใช่ค่าคงที่
description: เคาะ 2026-08-13 · .aeon เป็นแค่ค่าเริ่มต้น
resource: plugins/req/scripts/state-dir.mjs
tags: [adr, config]
timestamp: 2026-08-13T00:00:00+07:00
id: ADR-aeon-003
lifecycle: built
owner: พี่ปู
spec_hash: sha256:03e910e2eea6ec24a13bade5cfd6343c4edd76dab7fbe24f2c77f3fde182125c
---

# ชื่อไดเรกทอรีสถานะเป็นพารามิเตอร์ ไม่ใช่ค่าคงที่

> หน้านี้ถูก generate จาก `docs/design-registry.json` — **ห้ามแก้ด้วยมือ** แก้ที่ registry แล้ว render ใหม่

## ทำอะไร

เขียนไว้ที่เดียวใน state-dir.mjs · ห้ามพิมพ์ .aeon ลงสคริปต์ คำสั่ง หรือเอกสารที่ generate อีก ให้เรียก resolver เอา

## ของที่มันแตะ

- [SCR-req-006](../scripts/SCR-req-006.md) — state-dir.mjs
- [MKT-aeon](../marketplace/MKT-aeon.md) — aeon

## ของจริงอยู่ที่ไหน

`plugins/req/scripts/state-dir.mjs`
