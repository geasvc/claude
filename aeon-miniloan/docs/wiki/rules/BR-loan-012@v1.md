---
type: Business Rule
title: สั่งเบิกจ่ายได้เฉพาะใบสมัครที่อยู่ในสถานะ Approved เท่านั้น แล้วสถานะเปลี่ยนเป็น
description: สั่งเบิกจ่ายได้เฉพาะใบสมัครที่อยู่ในสถานะ Approved เท่านั้น แล้วสถานะเปลี่ยนเป็น Disbursed · ใบสมัครที่ยังไม่ Approved ระบบต้องปฏิเสธการเบิกจ่าย
resource: ../requirements/REQ-loan-004.md
tags: [loan, invariant]
id: BR-loan-012@v1
status: draft
belongs_to: REQ-loan-004
kind: invariant
is_current: true
test_design: [state_transition]
proven_by: []
golden: []
provenance: [SRC-001, SRC-001]
timestamp: 2026-08-20T08:56:00+07:00
spec_hash: sha256:9d809fe98ac94403821d15f43dc148a0a6675bc1feb622a2240d83be757c5a71
---

# BR-loan-012@v1

## ข้อความของกฎ
สั่งเบิกจ่ายได้เฉพาะใบสมัครที่อยู่ในสถานะ Approved เท่านั้น แล้วสถานะเปลี่ยนเป็น Disbursed · ใบสมัครที่ยังไม่ Approved ระบบต้องปฏิเสธการเบิกจ่าย

## ที่มา

> "**Given** ใบสมัครสถานะ `Approved` **When** สั่งเบิกจ่าย **Then** สถานะเปลี่ยนเป็น `Disbursed` และสร้าง LoanAccount สถานะ `Active`"
> — [SRC-001](../sources/SRC-001.md) หน้า — §§7 US-07

> "**Given** ใบสมัครยังไม่ `Approved` **When** สั่งเบิกจ่าย **Then** ระบบปฏิเสธ"
> — [SRC-001](../sources/SRC-001.md) หน้า — §§7 US-07

## พิสูจน์โดย

🔴 ยังไม่มีใครพิสูจน์กฎข้อนี้

## ประวัติ

| เวอร์ชัน | มีผลตั้งแต่ | เหตุผล | change set |
|---|---|---|---|
| **BR-loan-012@v1** (หน้านี้) ✅ | — | ตั้งต้น | — |
