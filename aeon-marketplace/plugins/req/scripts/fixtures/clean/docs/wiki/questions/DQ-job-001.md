---
type: Deferred Question
title: ยอดค่าใช้จ่ายปัดที่ทศนิยมกี่ตำแหน่ง และ decimal(p,s) ใน DB เท่าไหร่
description: ปัด 2 ตำแหน่งแบบ round half up ทุกจุด · decimal(18,2)
resource: ../rules/BR-job-011@v2.md
tags: [job, question, calculation]
id: DQ-job-001
state: answered
raised_by: BR-job-011@v2
answer_phase: domain
timestamp: 2026-08-01T12:30:00+07:00
spec_hash: sha256:07602c53e9b24ebc8a6c21f10953ec118e2be6f6c6b23ea2be1681a26b96bfc3
---

# DQ-job-001

## คำถามที่เลื่อนไป
ยอดค่าใช้จ่ายปัดที่ทศนิยมกี่ตำแหน่ง และ decimal(p,s) ใน DB เท่าไหร่

| เรื่อง | ค่า |
|---|---|
| สถานะ | ✅ answered |
| ตั้งขึ้นจาก | [BR-job-011@v2](../rules/BR-job-011@v2.md) |
| หมวด | calculation |
| ตอบตอนไหน | `/domain:ask` |
| ติดอยู่ที่ | `entity:Job.TotalCost` |

## คำตอบ
ปัด 2 ตำแหน่งแบบ round half up ทุกจุด · decimal(18,2)

ตอบเมื่อ 2026-08-01T12:20+07:00

## ผลที่ตามมา

- `field:Job.TotalCost decimal(18,2)`
