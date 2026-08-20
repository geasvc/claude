---
type: Business Rule
title: เมื่อชำระยอดปิดบัญชีครบ บัญชีเปลี่ยนสถานะเป็น Closed และงวดที่เหลือในตารางผ่อนถู
description: เมื่อชำระยอดปิดบัญชีครบ บัญชีเปลี่ยนสถานะเป็น Closed และงวดที่เหลือในตารางผ่อนถูกยกเลิก
resource: ../requirements/REQ-loan-007.md
tags: [loan, invariant]
id: BR-loan-022@v1
status: draft
belongs_to: REQ-loan-007
kind: invariant
is_current: true
test_design: [state_transition]
proven_by: []
golden: []
provenance: [SRC-001]
timestamp: 2026-08-20T08:56:00+07:00
spec_hash: sha256:c7ea484940b1b52fbf3be7b0d9e5060a85f0fa5da2cce473651726cd6cda468b
---

# BR-loan-022@v1

## ข้อความของกฎ
เมื่อชำระยอดปิดบัญชีครบ บัญชีเปลี่ยนสถานะเป็น Closed และงวดที่เหลือในตารางผ่อนถูกยกเลิก

## ที่มา

> "**Given** ชำระยอดปิดบัญชีครบ **When** บันทึก **Then** บัญชีเปลี่ยนเป็น `Closed` และงวดที่เหลือถูกยกเลิก"
> — [SRC-001](../sources/SRC-001.md) หน้า — §§7 US-11

## พิสูจน์โดย

🔴 ยังไม่มีใครพิสูจน์กฎข้อนี้

## ประวัติ

| เวอร์ชัน | มีผลตั้งแต่ | เหตุผล | change set |
|---|---|---|---|
| **BR-loan-022@v1** (หน้านี้) ✅ | — | ตั้งต้น | — |
