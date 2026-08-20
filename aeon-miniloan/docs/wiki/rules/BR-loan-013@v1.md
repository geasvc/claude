---
type: Business Rule
title: เมื่อเบิกจ่ายสำเร็จ ระบบสร้าง LoanAccount สถานะ Active และสร้าง RepaymentSchedul
description: เมื่อเบิกจ่ายสำเร็จ ระบบสร้าง LoanAccount สถานะ Active และสร้าง RepaymentSchedule ตาม BR-loan-016@v1 ทันทีในการกระทำเดียวกัน
resource: ../requirements/REQ-loan-004.md
tags: [loan, invariant]
id: BR-loan-013@v1
status: draft
belongs_to: REQ-loan-004
kind: invariant
is_current: true
test_design: [state_transition]
proven_by: []
golden: []
provenance: [SRC-001, SRC-001]
timestamp: 2026-08-20T08:56:00+07:00
spec_hash: sha256:5e304a3d54ffc2d8c5f658cbf8ae287f05168651233c20e171cc3bfcce62ba8a
---

# BR-loan-013@v1

## ข้อความของกฎ
เมื่อเบิกจ่ายสำเร็จ ระบบสร้าง LoanAccount สถานะ Active และสร้าง RepaymentSchedule ตาม BR-loan-016@v1 ทันทีในการกระทำเดียวกัน

## ที่มา

> "**Given** สร้าง LoanAccount **When** เบิกจ่ายสำเร็จ **Then** ระบบสร้าง RepaymentSchedule ตาม BR-06 ทันที"
> — [SRC-001](../sources/SRC-001.md) หน้า — §§7 US-07

> "`Disburse()` สร้าง **LoanAccount** ใหม่"
> — [SRC-001](../sources/SRC-001.md) หน้า — §§6 วงจรสถานะ

## พิสูจน์โดย

🔴 ยังไม่มีใครพิสูจน์กฎข้อนี้

## ประวัติ

| เวอร์ชัน | มีผลตั้งแต่ | เหตุผล | change set |
|---|---|---|---|
| **BR-loan-013@v1** (หน้านี้) ✅ | — | ตั้งต้น | — |
