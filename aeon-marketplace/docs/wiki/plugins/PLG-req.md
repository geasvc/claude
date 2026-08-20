---
type: Plugin
title: req
description: Phase 1 — เปลี่ยน requirement ดิบให้เป็นกฎที่สาวกลับไปหาต้นทางได้ทุกข้อ
resource: plugins/req/.claude-plugin/plugin.json
tags: [phase-1, requirements]
timestamp: 2026-08-13T00:00:00+07:00
id: PLG-req
lifecycle: built
owner: พี่ปู
spec_hash: sha256:d3bbeaa4824116745033583eb51fc6e3095a217203ddd78f2aca20a6f372fa02
---

# req

> หน้านี้ถูก generate จาก `docs/design-registry.json` — **ห้ามแก้ด้วยมือ** แก้ที่ registry แล้ว render ใหม่

## ทำอะไร

v0.3.0 · 8 คำสั่ง ครบ 8 รอบตามแบบ · ตอบคำถามเดียวตลอดเวลา: กฎข้อไหนยังไม่มีใครพิสูจน์ วัดจากไฟล์ ไม่ใช่ให้ AI ให้คะแนน

## เกร็ดที่ต้องรู้

- ทุกคำสั่งจบด้วยการหยุดรออนุมัติ ไม่มีตัวไหนไหลไปขั้นถัดไปเอง
- ชุดคำสั่งหยุดที่ 8 ตัว — ไม่ยุบเพิ่ม ไม่เพิ่มใหม่ (ADR-aeon-004)

## ของที่มันแตะ

- [SKL-requirement-and-rule-mapping](../skills/SKL-requirement-and-rule-mapping.md) — requirement-and-rule-mapping
- [SCH-spec](../schemas/SCH-spec.md) — spec.schema.json
- [CP1](../checkpoints/CP1.md) — CP1 — จบ Phase 1 ได้หรือยัง
- [CP2](../checkpoints/CP2.md) — CP2 — คิวส่งต่อ Phase 2
- [ADR-aeon-004](../adr/ADR-aeon-004.md) — ชุดคำสั่งของ req หยุดที่ 8 ตัว และ /req:rule ถูกตัดถาวร

## ของจริงอยู่ที่ไหน

`plugins/req/.claude-plugin/plugin.json`
