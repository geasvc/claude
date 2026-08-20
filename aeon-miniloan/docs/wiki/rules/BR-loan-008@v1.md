---
type: Business Rule
title: เมื่อใบสมัครถูกยื่น ระบบสร้าง CreditAssessment ที่มีคะแนน ระดับเครดิต (A/B/C) วง
description: เมื่อใบสมัครถูกยื่น ระบบสร้าง CreditAssessment ที่มีคะแนน ระดับเครดิต (A/B/C) วงเงินที่อนุมัติได้ และเหตุผลรายเกณฑ์ · ใบที่ได้ Band A หรือ Band B เปลี่ยนสถานะเป็น UnderReview เหมือนกันทั้งคู่ และให้เจ้าหน้าที่เป็นผู้อนุมัติเสมอ (ไม่มีการอนุมัติอัตโนมัติ)
resource: ../requirements/REQ-loan-002.md
tags: [loan, policy]
id: BR-loan-008@v1
status: draft
belongs_to: REQ-loan-002
kind: policy
is_current: true
test_design: [state_transition, decision_table]
proven_by: []
golden: []
provenance: [SRC-001, SRC-001, SRC-001]
timestamp: 2026-08-20T08:56:00+07:00
spec_hash: sha256:af5b8073cba23833d128c7096c1336402ef1201ca7197de60bd62550c26019b5
---

# BR-loan-008@v1

## ข้อความของกฎ
เมื่อใบสมัครถูกยื่น ระบบสร้าง CreditAssessment ที่มีคะแนน ระดับเครดิต (A/B/C) วงเงินที่อนุมัติได้ และเหตุผลรายเกณฑ์ · ใบที่ได้ Band A หรือ Band B เปลี่ยนสถานะเป็น UnderReview เหมือนกันทั้งคู่ และให้เจ้าหน้าที่เป็นผู้อนุมัติเสมอ (ไม่มีการอนุมัติอัตโนมัติ)

## ที่มา

> "**Given** ใบสมัครถูกยื่น **When** ระบบประเมิน **Then** สร้าง CreditAssessment ที่มีคะแนน, Band (A/B/C), วงเงินที่อนุมัติได้ และเหตุผล"
> — [SRC-001](../sources/SRC-001.md) หน้า — §§7 US-03

> "**Given** ผ่านทุกเกณฑ์และ DTI ≤ 50% **When** ประเมิน **Then** ได้ Band A และสถานะเป็น `UnderReview`"
> — [SRC-001](../sources/SRC-001.md) หน้า — §§7 US-03

> "Workflow อนุมัติแบบ 1 ระดับ (เจ้าหน้าที่พิจารณา 1 คน)"
> — [SRC-001](../sources/SRC-001.md) หน้า — §§2 ขอบเขต

## พิสูจน์โดย

🔴 ยังไม่มีใครพิสูจน์กฎข้อนี้

## ประวัติ

| เวอร์ชัน | มีผลตั้งแต่ | เหตุผล | change set |
|---|---|---|---|
| **BR-loan-008@v1** (หน้านี้) ✅ | — | ตั้งต้น | — |
