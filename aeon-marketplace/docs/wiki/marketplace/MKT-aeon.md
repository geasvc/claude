---
type: Marketplace
title: aeon
description: marketplace ของ plugin สำหรับการพัฒนาระบบ — เก็บ requirement → ออกแบบ → สร้าง → ทดสอบ → ส่งมอบ
resource: .claude-plugin/marketplace.json
tags: [marketplace]
timestamp: 2026-08-13T00:00:00+07:00
id: MKT-aeon
lifecycle: built
owner: พี่ปู
spec_hash: sha256:8d9d2b8e444ab8a95a1b4856c1777f468a3ddb424e7237d05ba37a29cb6358f9
---

# aeon

> หน้านี้ถูก generate จาก `docs/design-registry.json` — **ห้ามแก้ด้วยมือ** แก้ที่ registry แล้ว render ใหม่

## ทำอะไร

ตลาดนี้ยืนอยู่ลำพัง ไม่สืบทอดและไม่ซิงก์กับ repo อื่นใด ตอนนี้มี plugin ตัวเดียวคือ req · ไดเรกทอรีสถานะเริ่มต้นคือ .aeon/ แต่เป็นพารามิเตอร์ ไม่ใช่ค่าคงที่

## ของที่มันแตะ

- [PLG-req](../plugins/PLG-req.md) — req
- [STD-doc-001](../standards/STD-doc-001.md) — DOC-STANDARD v1.1
- [ADR-aeon-001](../adr/ADR-aeon-001.md) — ชื่อ marketplace คือ aeon
- [ADR-aeon-002](../adr/ADR-aeon-002.md) — aeon ยืนอยู่ลำพัง ไม่สืบทอดจากใคร

## ของจริงอยู่ที่ไหน

`.claude-plugin/marketplace.json`
