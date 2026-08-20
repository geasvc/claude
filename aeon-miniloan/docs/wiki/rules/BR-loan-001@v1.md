---
type: Business Rule
title: บันทึกร่างใบสมัครได้แม้ข้อมูลยังกรอกไม่ครบ โดยยังไม่ตรวจ business rule เต็มชุด แ
description: บันทึกร่างใบสมัครได้แม้ข้อมูลยังกรอกไม่ครบ โดยยังไม่ตรวจ business rule เต็มชุด และใบสมัครอยู่ในสถานะ Draft
resource: ../requirements/REQ-loan-001.md
tags: [loan, policy]
id: BR-loan-001@v1
status: draft
belongs_to: REQ-loan-001
kind: policy
is_current: true
test_design: [EP]
proven_by: []
golden: []
provenance: [SRC-001]
timestamp: 2026-08-20T08:56:00+07:00
spec_hash: sha256:0ed65d357f72b07ecf1a330c1b032bf6652377298f0b61fdcdbc945bd4ae5d2e
---

# BR-loan-001@v1

## ข้อความของกฎ
บันทึกร่างใบสมัครได้แม้ข้อมูลยังกรอกไม่ครบ โดยยังไม่ตรวจ business rule เต็มชุด และใบสมัครอยู่ในสถานะ Draft

## ที่มา

> "**Given** ยังกรอกไม่ครบ **When** บันทึกร่าง **Then** อนุญาตให้บันทึกได้ (ยังไม่ตรวจ business rule เต็ม)"
> — [SRC-001](../sources/SRC-001.md) หน้า — §§7 US-01

## พิสูจน์โดย

🔴 ยังไม่มีใครพิสูจน์กฎข้อนี้

## ประวัติ

| เวอร์ชัน | มีผลตั้งแต่ | เหตุผล | change set |
|---|---|---|---|
| **BR-loan-001@v1** (หน้านี้) ✅ | — | ตั้งต้น | — |
