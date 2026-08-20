---
type: Calculation Contract
title: สัญญาการคำนวณของ BR-job-016@v1
description: total = base_fee + surcharge(distance_km)
resource: ../rules/BR-job-016@v1.md
tags: [job, calculation]
id: CALC-job-001@v1
status: draft
constrains: BR-job-016@v1
is_current: true
effective_from: 2026-08-01
numeric_type: decimal
rounding_mode: HALF_UP
golden: [GD-job-001]
timestamp: 2026-08-01T12:30:00+07:00
spec_hash: sha256:317418a590d1cd517717ff9736401ff2686f074d1a6abd79ec17800ae2191051
---

# CALC-job-001@v1

## สูตร

```
total = base_fee + surcharge(distance_km)
```

ผูกกับกฎ [BR-job-016@v1](../rules/BR-job-016@v1.md)

## ตัวแปรเข้า

| ชื่อ | ชนิด | ความหมาย |
|---|---|---|
| `base_fee` | money(2) | ค่าบริการพื้นฐานต่องาน |
| `distance_km` | int | ระยะทางรวมของงาน หน่วยกิโลเมตร ปัดเป็นจำนวนเต็มก่อนเข้าสูตร |
| `surcharge` | money(2) | ค่าส่วนเพิ่มตามช่วงระยะทาง: <= 40 → 0 · 41-50 → 120 · 51-60 → 150 |

## การปัดเศษ — ส่วนที่ทำให้ตัวเลขต่างกันได้ทั้งที่สูตรเหมือนกัน

| เรื่อง | ค่า |
|---|---|
| ชนิดตัวเลข | decimal |
| วิธีปัด | HALF_UP |
| ปัดตรงไหน | ปัด 2 ตำแหน่งทุกจุดที่เกิดค่าเงิน ไม่ใช่ปัดครั้งเดียวตอนท้าย — ตามคำตอบของ DQ-job-001 |
| เศษที่เหลือ | — |

## พฤติกรรมที่ขอบ

- distance_km = 0 → surcharge = 0 ไม่ใช่ error
- distance_km > 60 → ยังไม่มีช่วงรองรับ ต้องถามลูกค้าก่อนใช้งานจริง (ดู Q ที่จะเกิดเมื่อเจอเคสนี้)
- base_fee = 0 → total = surcharge ล้วน ระบบต้องไม่ปฏิเสธ

## เลขเฉลย

- [GD-job-001](../golden/GD-job-001.md) — 7 แถว · ✅ พี่ปู

## คำถามที่ผูกอยู่

- [DQ-job-001](../questions/DQ-job-001.md)

## ประวัติ

| เวอร์ชัน | มีผลตั้งแต่ | เหตุผล |
|---|---|---|
| **CALC-job-001@v1** (หน้านี้) ✅ | 2026-08-01 | ตั้งต้น |

## หมายเหตุ
ช่วงระยะทางมาจากคำบอกของเจ้าของ ไม่ได้เดาจาก SRC-004 — ข้อมูลตัวอย่าง 500 แถวถูกใช้เป็นเลขเฉลยทาบผลในรอบ /req:golden เท่านั้น
