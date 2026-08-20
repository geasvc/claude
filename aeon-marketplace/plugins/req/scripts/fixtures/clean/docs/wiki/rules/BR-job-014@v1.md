---
type: Business Rule
title: แก้เงินหลังออก Bill แล้ว ต้องออก Bill ใหม่ทับของเดิม ห้ามแก้ใบเดิม
description: แก้เงินหลังออก Bill แล้ว ต้องออก Bill ใหม่ทับของเดิม ห้ามแก้ใบเดิม
resource: ../requirements/REQ-job-001.md
tags: [job, invariant]
id: BR-job-014@v1
status: draft
belongs_to: REQ-job-001
kind: invariant
is_current: true
test_design: [decision_table]
proven_by: [EX-job-030]
golden: []
provenance: [SRC-003]
timestamp: 2026-08-01T12:30:00+07:00
spec_hash: sha256:e29a1758015fd91785f889a19f857b87501db14fc55b27a60336ac36b792e1d8
---

# BR-job-014@v1

## ข้อความของกฎ
แก้เงินหลังออก Bill แล้ว ต้องออก Bill ใหม่ทับของเดิม ห้ามแก้ใบเดิม

## ที่มา

> "ถ้าแก้เงินหลังออกบิลไปแล้ว ต้องออกบิลใหม่ทับของเดิม"
> — [SRC-003](../sources/SRC-003.md) หน้า — §— · ✅ confirmed

## พิสูจน์โดย

- [EX-job-030](../examples/EX-job-030.md) — exception: ระบบไม่แก้ B-100 แต่ออก Bill ใหม่ทับ และแสดงข้อความ 'ออกใบแจ้งหนี้ใหม่ทับใบเดิม B-100'

## ประวัติ

| เวอร์ชัน | มีผลตั้งแต่ | เหตุผล | change set |
|---|---|---|---|
| **BR-job-014@v1** (หน้านี้) ✅ | — | ตั้งต้น | — |
