---
type: Business Rule
title: ปฏิเสธใบสมัครที่อยู่ในสถานะ UnderReview หรือได้ Band C ได้โดยต้องระบุเหตุผล แล้ว
description: ปฏิเสธใบสมัครที่อยู่ในสถานะ UnderReview หรือได้ Band C ได้โดยต้องระบุเหตุผล แล้วสถานะเปลี่ยนเป็น Rejected ซึ่งเป็นสถานะสุดท้าย · ใบที่ Rejected แล้ว ถ้าพยายามอนุมัติ ระบบต้องปฏิเสธการกระทำ (invalid transition)
resource: ../requirements/REQ-loan-003.md
tags: [loan, invariant]
id: BR-loan-010@v1
status: draft
belongs_to: REQ-loan-003
kind: invariant
is_current: true
test_design: [state_transition]
proven_by: []
golden: []
provenance: [SRC-001, SRC-001]
timestamp: 2026-08-20T08:56:00+07:00
spec_hash: sha256:80396dd4216eac9e67f38e2a67ccb3de17210d23921d9503c3b2d73dd16bd98f
---

# BR-loan-010@v1

## ข้อความของกฎ
ปฏิเสธใบสมัครที่อยู่ในสถานะ UnderReview หรือได้ Band C ได้โดยต้องระบุเหตุผล แล้วสถานะเปลี่ยนเป็น Rejected ซึ่งเป็นสถานะสุดท้าย · ใบที่ Rejected แล้ว ถ้าพยายามอนุมัติ ระบบต้องปฏิเสธการกระทำ (invalid transition)

## ที่มา

> "**Given** ใบสมัครสถานะ `UnderReview` หรือ Band C **When** กดปฏิเสธพร้อมระบุเหตุผล **Then** สถานะเปลี่ยนเป็น `Rejected` (final)"
> — [SRC-001](../sources/SRC-001.md) หน้า — §§7 US-06

> "**Given** ใบสมัคร `Rejected` แล้ว **When** พยายามอนุมัติ **Then** ระบบปฏิเสธการกระทำ (invalid transition)"
> — [SRC-001](../sources/SRC-001.md) หน้า — §§7 US-06

## พิสูจน์โดย

🔴 ยังไม่มีใครพิสูจน์กฎข้อนี้

## ประวัติ

| เวอร์ชัน | มีผลตั้งแต่ | เหตุผล | change set |
|---|---|---|---|
| **BR-loan-010@v1** (หน้านี้) ✅ | — | ตั้งต้น | — |
