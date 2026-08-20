---
type: Business Rule
title: ผู้สมัครหนึ่งคนมีใบสมัครได้หลายใบ แต่ใบสมัครหนึ่งใบที่ Disbursed สร้างบัญชีสินเช
description: ผู้สมัครหนึ่งคนมีใบสมัครได้หลายใบ แต่ใบสมัครหนึ่งใบที่ Disbursed สร้างบัญชีสินเชื่อได้ 1 บัญชีเท่านั้น
resource: ../requirements/REQ-loan-004.md
tags: [loan, invariant]
id: BR-loan-014@v1
status: draft
belongs_to: REQ-loan-004
kind: invariant
is_current: true
test_design: [EP]
proven_by: []
golden: []
provenance: [SRC-001]
timestamp: 2026-08-20T08:56:00+07:00
spec_hash: sha256:0da35476dc79823065dee1d846deae62e994d1133735433b2a51ae3cc81483e9
---

# BR-loan-014@v1

## ข้อความของกฎ
ผู้สมัครหนึ่งคนมีใบสมัครได้หลายใบ แต่ใบสมัครหนึ่งใบที่ Disbursed สร้างบัญชีสินเชื่อได้ 1 บัญชีเท่านั้น

## ที่มา

> "1 ผู้สมัครมีได้หลายใบสมัคร แต่ 1 ใบสมัครที่ `Disbursed` สร้าง 1 บัญชี"
> — [SRC-001](../sources/SRC-001.md) หน้า — §§9 สมมติฐานและข้อจำกัด

## พิสูจน์โดย

🔴 ยังไม่มีใครพิสูจน์กฎข้อนี้

## ประวัติ

| เวอร์ชัน | มีผลตั้งแต่ | เหตุผล | change set |
|---|---|---|---|
| **BR-loan-014@v1** (หน้านี้) ✅ | — | ตั้งต้น | — |
