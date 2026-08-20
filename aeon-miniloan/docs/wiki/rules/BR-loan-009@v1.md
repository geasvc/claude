---
type: Business Rule
title: อนุมัติได้เฉพาะใบสมัครที่อยู่ในสถานะ UnderReview เท่านั้น เมื่ออนุมัติแล้วสถานะเ
description: อนุมัติได้เฉพาะใบสมัครที่อยู่ในสถานะ UnderReview เท่านั้น เมื่ออนุมัติแล้วสถานะเปลี่ยนเป็น Approved พร้อมบันทึกผู้อนุมัติและเวลา
resource: ../requirements/REQ-loan-003.md
tags: [loan, invariant]
id: BR-loan-009@v1
status: draft
belongs_to: REQ-loan-003
kind: invariant
is_current: true
test_design: [state_transition]
proven_by: []
golden: []
provenance: [SRC-001]
timestamp: 2026-08-20T08:56:00+07:00
spec_hash: sha256:5eb49b4f5d9aedaf654780257c67049e173a05911354d8c1784a4cdfc6785b28
---

# BR-loan-009@v1

## ข้อความของกฎ
อนุมัติได้เฉพาะใบสมัครที่อยู่ในสถานะ UnderReview เท่านั้น เมื่ออนุมัติแล้วสถานะเปลี่ยนเป็น Approved พร้อมบันทึกผู้อนุมัติและเวลา

## ที่มา

> "**Given** ใบสมัครสถานะ `UnderReview` **When** เจ้าหน้าที่กดอนุมัติ **Then** สถานะเปลี่ยนเป็น `Approved` พร้อมบันทึกผู้อนุมัติและเวลา"
> — [SRC-001](../sources/SRC-001.md) หน้า — §§7 US-05

## พิสูจน์โดย

🔴 ยังไม่มีใครพิสูจน์กฎข้อนี้

## ประวัติ

| เวอร์ชัน | มีผลตั้งแต่ | เหตุผล | change set |
|---|---|---|---|
| **BR-loan-009@v1** (หน้านี้) ✅ | — | ตั้งต้น | — |
