---
type: Script
title: state-dir.mjs
description: นิยามเดียวของที่อยู่ spec.json และของการแยกอาร์กิวเมนต์
resource: plugins/req/scripts/state-dir.mjs
tags: [config]
timestamp: 2026-08-13T00:00:00+07:00
id: SCR-req-006
lifecycle: built
owner: พี่ปู
spec_hash: sha256:b74b252d6061c34f54a0398f67bd994f67bb7b769750669032f7e6dd63bdd077
---

# state-dir.mjs

> หน้านี้ถูก generate จาก `docs/design-registry.json` — **ห้ามแก้ด้วยมือ** แก้ที่ registry แล้ว render ใหม่

## ทำอะไร

ลำดับ --spec > --state-dir > $AEON_STATE_DIR > .aeon · จงใจไม่มี auto-detect เพราะที่อยู่ที่เปลี่ยนตามไฟล์ที่บังเอิญมีอยู่ คือ drift ที่ทั้ง repo นี้ตั้งใจกัน

## ของที่มันแตะ

- [ADR-aeon-003](../adr/ADR-aeon-003.md) — ชื่อไดเรกทอรีสถานะเป็นพารามิเตอร์ ไม่ใช่ค่าคงที่

## ของจริงอยู่ที่ไหน

`plugins/req/scripts/state-dir.mjs`
