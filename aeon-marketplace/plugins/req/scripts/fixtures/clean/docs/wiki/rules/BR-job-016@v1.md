---
type: Business Rule
title: ยอดรวมของงาน = ค่าบริการพื้นฐาน + ค่าส่วนเพิ่มตามระยะทาง
description: ยอดรวมของงาน = ค่าบริการพื้นฐาน + ค่าส่วนเพิ่มตามระยะทาง
resource: ../requirements/REQ-job-001.md
tags: [job, calculation]
id: BR-job-016@v1
status: draft
belongs_to: REQ-job-001
kind: calculation
is_current: true
test_design: [BVA, decision_table]
constrained_by: CALC-job-001@v1
proven_by: [EX-job-035]
golden: [GD-job-001]
provenance: [SRC-005]
timestamp: 2026-08-01T12:30:00+07:00
spec_hash: sha256:8f14485635857578e674f9976bb0641abd75dede93e82edbc06eb6e4c41626d8
---

# BR-job-016@v1

## ข้อความของกฎ
ยอดรวมของงาน = ค่าบริการพื้นฐาน + ค่าส่วนเพิ่มตามระยะทาง

คำนวณตามสัญญา [CALC-job-001@v1](../calculations/CALC-job-001@v1.md)

## ที่มา

> "ยอดรวมของงาน = ค่าบริการพื้นฐาน + ค่าส่วนเพิ่มตามระยะทาง"
> — [SRC-005](../sources/SRC-005.md) หน้า — §—

## พิสูจน์โดย

- [EX-job-035](../examples/EX-job-035.md) — boundary: ยอดรวมเป็น 450.00 บาท และหน้ารายละเอียดแสดง 'ค่าบริการ 300.00 + ค่าส่วนเพิ่มระยะทาง 150.00 = 450.00'
- [GD-job-001](../golden/GD-job-001.md) — เลขเฉลย 7 แถว · ✅ พี่ปู 2026-08-13

## ประวัติ

| เวอร์ชัน | มีผลตั้งแต่ | เหตุผล | change set |
|---|---|---|---|
| **BR-job-016@v1** (หน้านี้) ✅ | — | ตั้งต้น | — |
