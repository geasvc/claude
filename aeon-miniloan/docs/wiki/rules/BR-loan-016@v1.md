---
type: Business Rule
title: ค่างวดเท่ากันทุกงวดตามสูตร EMI = P × r × (1+r)^n / ((1+r)^n − 1) โดย P คือเงินต้
description: ค่างวดเท่ากันทุกงวดตามสูตร EMI = P × r × (1+r)^n / ((1+r)^n − 1) โดย P คือเงินต้น r คืออัตราดอกเบี้ยต่อเดือน และ n คือจำนวนงวด · ตารางที่สร้างต้องมีครบ n งวด
resource: ../requirements/REQ-loan-005.md
tags: [loan, calculation]
id: BR-loan-016@v1
status: draft
belongs_to: REQ-loan-005
kind: calculation
is_current: true
test_design: [BVA, decision_table]
proven_by: []
golden: []
provenance: [SRC-001, SRC-001]
timestamp: 2026-08-20T08:56:00+07:00
spec_hash: sha256:a5e3229fb07743aed87f8c0aec99c9bfc0685acf3a59da08586f06982e89ba3e
---

# BR-loan-016@v1

## ข้อความของกฎ
ค่างวดเท่ากันทุกงวดตามสูตร EMI = P × r × (1+r)^n / ((1+r)^n − 1) โดย P คือเงินต้น r คืออัตราดอกเบี้ยต่อเดือน และ n คือจำนวนงวด · ตารางที่สร้างต้องมีครบ n งวด

## ที่มา

> "งวดผ่อนเท่ากันทุกงวด (EMI): `EMI = P × r × (1+r)^n / ((1+r)^n − 1)`"
> — [SRC-001](../sources/SRC-001.md) หน้า — §§5 BR-06 การคำนวณงวดผ่อน

> "**Given** เงินต้น P, อัตรา, จำนวนงวด n **When** สร้างตาราง **Then** ได้ n งวด แต่ละงวดมี ยอดต้น/ดอกเบี้ย/ยอดคงเหลือ"
> — [SRC-001](../sources/SRC-001.md) หน้า — §§7 US-08

## พิสูจน์โดย

🔴 ยังไม่มีใครพิสูจน์กฎข้อนี้

## ประวัติ

| เวอร์ชัน | มีผลตั้งแต่ | เหตุผล | change set |
|---|---|---|---|
| **BR-loan-016@v1** (หน้านี้) ✅ | — | ตั้งต้น | — |
