---
type: Business Rule
title: แก้ค่าใช้จ่ายหลัง COMPLETE ต้องมีคนอนุมัติก่อนจึงมีผล
description: แก้ค่าใช้จ่ายหลัง COMPLETE ต้องมีคนอนุมัติก่อนจึงมีผล
resource: ../requirements/REQ-job-001.md
tags: [job, policy]
id: BR-job-011@v2
status: draft
belongs_to: REQ-job-001
kind: policy
is_current: true
effective_from: 2026-08-01
test_design: [decision_table]
proven_by: [EX-job-021, EX-job-022]
golden: []
supersedes: BR-job-011@v1
provenance: [SRC-002]
timestamp: 2026-08-01T12:30:00+07:00
spec_hash: sha256:05611840b7582b053188add7c4d3966f372f0df2795fd71fc7445a6c210bae3c
---

# BR-job-011@v2

## ข้อความของกฎ
แก้ค่าใช้จ่ายหลัง COMPLETE ต้องมีคนอนุมัติก่อนจึงมีผล

## ที่มา

> "ค่าใช้จ่ายที่บันทึกหลังงานปิด (COMPLETE) ต้องผ่านการอนุมัติก่อนจึงมีผล"
> — [SRC-002](../sources/SRC-002.md) หน้า 1 §3.5

## พิสูจน์โดย

- [EX-job-021](../examples/EX-job-021.md) — happy: ระบบสร้างรายการปรับปรุงสถานะ 'รออนุมัติ' และแสดงข้อความ 'ส่งคำขอปรับค่าใช้จ่ายแล้ว รออนุมัติ'
- [EX-job-022](../examples/EX-job-022.md) — exception: ยอดรวมยังเป็นค่าเดิม และแสดงป้าย 'มีรายการรออนุมัติ 1 รายการ'

## แทนที่
[BR-job-011@v1](BR-job-011@v1.md) — *เหตุผล: TOR §3.5 ระบุชัดว่าต้องอนุมัติ — คำบอกเล่าตอนแรกหลวมกว่าเอกสาร*

> เดิม: แก้ค่าใช้จ่ายหลัง COMPLETE ได้เลย

## ประวัติ

| เวอร์ชัน | มีผลตั้งแต่ | เหตุผล | change set |
|---|---|---|---|
| [BR-job-011@v1](BR-job-011@v1.md) ❄️ | — | ตั้งต้น | — |
| **BR-job-011@v2** (หน้านี้) ✅ | 2026-08-01 | TOR §3.5 ระบุชัดว่าต้องอนุมัติ — คำบอกเล่าตอนแรกหลวมกว่าเอกสาร | [CHG-job-001](../changes/CHG-job-001.md) |
