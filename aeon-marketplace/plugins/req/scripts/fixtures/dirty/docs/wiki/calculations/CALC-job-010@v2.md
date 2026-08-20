---
type: Calculation Contract
title: สัญญาการคำนวณของ BR-job-999@v1
description: refund = paid_amount
resource: ../rules/BR-job-999@v1.md
tags: [job, calculation]
id: CALC-job-010@v2
status: draft
constrains: BR-job-999@v1
is_current: true
numeric_type: decimal
rounding_mode: HALF_UP
golden: []
supersedes: CALC-job-010@v1
spec_hash: sha256:bc0ae791386303c0dfda333ddf7f99c5bacd746869de843b0a70fc7bfc8d2f9f
---

# CALC-job-010@v2

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
| ปัดตรงไหน | ปัดทุกงวด |
| เศษที่เหลือ | — |

## พฤติกรรมที่ขอบ

- paid_amount = 0 → refund = 0

## เลขเฉลย

🔴 ยังไม่มีเลขเฉลย — สูตรตกลงแล้วแต่ไม่มีใครลองคำนวณ (`/req:golden CALC-job-010@v2`)

## ประวัติ

| เวอร์ชัน | มีผลตั้งแต่ | เหตุผล |
|---|---|---|
| [CALC-job-010@v1](CALC-job-010@v1.md) | — | ตั้งต้น |
| **CALC-job-010@v2** (หน้านี้) ✅ | — | ลูกค้าเปลี่ยนวิธีคืนเงิน |
