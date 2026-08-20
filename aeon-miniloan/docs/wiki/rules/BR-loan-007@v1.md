---
type: Business Rule
title: จัดระดับเครดิตจากผลการประเมิน: Band A = ผ่านทุกเกณฑ์และ DTI ≤ 50% · Band B = ผ่า
description: จัดระดับเครดิตจากผลการประเมิน: Band A = ผ่านทุกเกณฑ์และ DTI ≤ 50% · Band B = ผ่านทุกเกณฑ์และ DTI มากกว่า 50% ถึง ≤ 70% · Band C = ผิดเกณฑ์ข้อใดข้อหนึ่ง (คุณสมบัติ BR-loan-004@v1 หรือ DTI BR-loan-005@v1 หรือขอเกินวงเงิน BR-loan-006@v1) ให้ปฏิเสธพร้อมเหตุผล · ที่ DTI = 50% พอดี ได้ Band A
resource: ../requirements/REQ-loan-002.md
tags: [loan, policy]
id: BR-loan-007@v1
status: draft
belongs_to: REQ-loan-002
kind: policy
is_current: true
test_design: [decision_table, BVA]
proven_by: []
golden: []
provenance: [SRC-001, SRC-001, SRC-001]
timestamp: 2026-08-20T08:56:00+07:00
spec_hash: sha256:f32639d7e4c92c0e37be8c22fe29aa6b6997b7c52df74f855ec84728d6e26274
---

# BR-loan-007@v1

## ข้อความของกฎ
จัดระดับเครดิตจากผลการประเมิน: Band A = ผ่านทุกเกณฑ์และ DTI ≤ 50% · Band B = ผ่านทุกเกณฑ์และ DTI มากกว่า 50% ถึง ≤ 70% · Band C = ผิดเกณฑ์ข้อใดข้อหนึ่ง (คุณสมบัติ BR-loan-004@v1 หรือ DTI BR-loan-005@v1 หรือขอเกินวงเงิน BR-loan-006@v1) ให้ปฏิเสธพร้อมเหตุผล · ที่ DTI = 50% พอดี ได้ Band A

## ที่มา

> "Band A: ผ่านทุกเกณฑ์ + DTI ≤ 50% → **อนุมัติอัตโนมัติได้** (ยังต้องให้เจ้าหน้าที่ยืนยัน)"
> — [SRC-001](../sources/SRC-001.md) หน้า — §§5 BR-05 การให้คะแนน

> "Band B: ผ่านเกณฑ์ + DTI 50–70% → **ส่งเจ้าหน้าที่พิจารณา**"
> — [SRC-001](../sources/SRC-001.md) หน้า — §§5 BR-05 การให้คะแนน

> "Band C: ผิดเกณฑ์ข้อใดข้อหนึ่ง → **ปฏิเสธ** พร้อมเหตุผล"
> — [SRC-001](../sources/SRC-001.md) หน้า — §§5 BR-05 การให้คะแนน

## พิสูจน์โดย

🔴 ยังไม่มีใครพิสูจน์กฎข้อนี้

## ประวัติ

| เวอร์ชัน | มีผลตั้งแต่ | เหตุผล | change set |
|---|---|---|---|
| **BR-loan-007@v1** (หน้านี้) ✅ | — | ตั้งต้น | — |
