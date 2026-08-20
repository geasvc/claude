---
type: Business Rule
title: เมื่อบันทึกการชำระงวดสุดท้ายจนครบทุกงวด บัญชีสินเชื่อเปลี่ยนสถานะจาก Active เป็น
description: เมื่อบันทึกการชำระงวดสุดท้ายจนครบทุกงวด บัญชีสินเชื่อเปลี่ยนสถานะจาก Active เป็น Closed
resource: ../requirements/REQ-loan-006.md
tags: [loan, invariant]
id: BR-loan-020@v1
status: draft
belongs_to: REQ-loan-006
kind: invariant
is_current: true
test_design: [state_transition]
proven_by: []
golden: []
provenance: [SRC-001, SRC-001]
timestamp: 2026-08-20T08:56:00+07:00
spec_hash: sha256:fa8c5e9a06002c248803ef33a36a39a7167faf8198b6a1dc38ee646a7b597611
---

# BR-loan-020@v1

## ข้อความของกฎ
เมื่อบันทึกการชำระงวดสุดท้ายจนครบทุกงวด บัญชีสินเชื่อเปลี่ยนสถานะจาก Active เป็น Closed

## ที่มา

> "**Given** ชำระครบทุกงวด **When** บันทึกงวดสุดท้าย **Then** บัญชีเปลี่ยนเป็น `Closed`"
> — [SRC-001](../sources/SRC-001.md) หน้า — §§7 US-10

> "ปิดได้เมื่อชำระครบทุกงวด หรือปิดก่อนกำหนดสำเร็จ"
> — [SRC-001](../sources/SRC-001.md) หน้า — §§6 วงจรสถานะ LoanAccount

## พิสูจน์โดย

🔴 ยังไม่มีใครพิสูจน์กฎข้อนี้

## ประวัติ

| เวอร์ชัน | มีผลตั้งแต่ | เหตุผล | change set |
|---|---|---|---|
| **BR-loan-020@v1** (หน้านี้) ✅ | — | ตั้งต้น | — |
