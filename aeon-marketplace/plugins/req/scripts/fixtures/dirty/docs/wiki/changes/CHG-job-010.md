---
type: Change Set
title: เปลี่ยนวิธีคิดค่าปรับ
description: กระทบ 1 โหนด · มีผล —
resource: ../rules/BR-job-998@v1.md
tags: [job, change]
id: CHG-job-010
requested_by: ลูกค้า
affects: [BR-job-998@v1]
invalidates: [GD-job-021]
triggered_by: [SRC-099]
spec_hash: sha256:460373972ad3aef1130d6c0ac974c9e4da575d5a1b2407c60b8f166105e3c6c8
---

# CHG-job-010

## ทำไมถึงเปลี่ยน
เปลี่ยนวิธีคิดค่าปรับ

| เรื่อง | ค่า |
|---|---|
| ใครขอ | ลูกค้า |
| ใครอนุมัติ | 🔴 ยังไม่มีใครเซ็น |
| มีผลตั้งแต่ | — |
| เอกสารที่ทำให้เปลี่ยน | `SRC-099` |

## เปลี่ยนอะไร

| โหนด | จาก | เป็น |
|---|---|---|
| `BR-job-998@v1` | — (ของใหม่) |  |

## ต้องทำต่อ

- 🔴 [GD-job-021](../golden/GD-job-021.md) ใช้ไม่ได้แล้ว — ต้องคำนวณเลขเฉลยใหม่ (`/req:golden`)

