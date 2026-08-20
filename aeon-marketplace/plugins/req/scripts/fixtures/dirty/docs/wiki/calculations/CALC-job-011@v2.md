---
type: Calculation Contract
title: สัญญาการคำนวณของ BR-job-020@v1
description: fee = amount * rate
resource: ../rules/BR-job-020@v1.md
tags: [job, calculation]
id: CALC-job-011@v2
status: draft
constrains: BR-job-020@v1
is_current: true
numeric_type: decimal
rounding_mode: HALF_UP
golden: []
supersedes: CALC-job-011@v1
spec_hash: sha256:04f9e4f3de38b0445dba67cb913a3c561dc6c9fd508ed28971a4b0aaf577adb0
---

# CALC-job-011@v2

## สูตร

```
fee = amount * rate
```

ผูกกับกฎ [BR-job-020@v1](../rules/BR-job-020@v1.md)

## ตัวแปรเข้า

| ชื่อ | ชนิด | ความหมาย |
|---|---|---|
| `amount` | money(2) |  |
| `rate` | rate(10) |  |

## การปัดเศษ — ส่วนที่ทำให้ตัวเลขต่างกันได้ทั้งที่สูตรเหมือนกัน

| เรื่อง | ค่า |
|---|---|
| ชนิดตัวเลข | decimal |
| วิธีปัด | HALF_UP |
| ปัดตรงไหน | ปัดตอนท้าย |
| เศษที่เหลือ | — |

## พฤติกรรมที่ขอบ

- rate = 0 → fee = 0

## เลขเฉลย

🔴 ยังไม่มีเลขเฉลย — สูตรตกลงแล้วแต่ไม่มีใครลองคำนวณ (`/req:golden CALC-job-011@v2`)

## ประวัติ

| เวอร์ชัน | มีผลตั้งแต่ | เหตุผล |
|---|---|---|
| [CALC-job-011@v1](CALC-job-011@v1.md) ✅ | — | ตั้งต้น |
| **CALC-job-011@v2** (หน้านี้) ✅ | — | ตั้งต้น |
