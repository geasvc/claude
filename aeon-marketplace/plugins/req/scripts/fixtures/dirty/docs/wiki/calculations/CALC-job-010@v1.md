---
type: Calculation Contract
title: สัญญาการคำนวณของ BR-job-999@v1
description: refund = paid_amount
resource: ../rules/BR-job-999@v1.md
tags: [job, calculation]
id: CALC-job-010@v1
status: superseded
constrains: BR-job-999@v1
is_current: false
numeric_type: decimal
rounding_mode: HALF_UP
golden: []
superseded_by: CALC-job-010@v2
spec_hash: sha256:3171b08748ad607b95535a13d3f12ff7da4f5291758e1c61aac1bc59b1e58fb4
---

# CALC-job-010@v1

## สูตร

```
refund = paid_amount
```

ผูกกับกฎ `BR-job-999@v1`

## ตัวแปรเข้า

| ชื่อ | ชนิด | ความหมาย |
|---|---|---|
| `paid_amount` | money(2) |  |

## การปัดเศษ — ส่วนที่ทำให้ตัวเลขต่างกันได้ทั้งที่สูตรเหมือนกัน

| เรื่อง | ค่า |
|---|---|
| ชนิดตัวเลข | decimal |
| วิธีปัด | HALF_UP |
| ปัดตรงไหน | ปัดที่ยอดคืนครั้งเดียว |
| เศษที่เหลือ | — |

## พฤติกรรมที่ขอบ

- paid_amount = 0 → refund = 0

## เลขเฉลย

🔴 ยังไม่มีเลขเฉลย — สูตรตกลงแล้วแต่ไม่มีใครลองคำนวณ (`/req:golden CALC-job-010@v1`)

## ประวัติ

| เวอร์ชัน | มีผลตั้งแต่ | เหตุผล |
|---|---|---|
| **CALC-job-010@v1** (หน้านี้) | — | ตั้งต้น |
| [CALC-job-010@v2](CALC-job-010@v2.md) ✅ | — | ลูกค้าเปลี่ยนวิธีคืนเงิน |
