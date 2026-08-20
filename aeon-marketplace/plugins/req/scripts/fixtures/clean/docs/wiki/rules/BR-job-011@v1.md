---
type: Business Rule
title: แก้ค่าใช้จ่ายหลัง COMPLETE ได้เลย
description: แก้ค่าใช้จ่ายหลัง COMPLETE ได้เลย
resource: ../requirements/REQ-job-001.md
tags: [job, policy]
id: BR-job-011@v1
status: superseded
belongs_to: REQ-job-001
kind: policy
is_current: false
test_design: [decision_table]
proven_by: [EX-job-021]
golden: []
superseded_by: BR-job-011@v2
provenance: [SRC-001]
timestamp: 2026-08-01T12:30:00+07:00
spec_hash: sha256:d3077dd00b9c0cdf723242b37c384f56b98bbd538ffb42673f4fdc25352a83a1
---

# BR-job-011@v1

## ข้อความของกฎ
แก้ค่าใช้จ่ายหลัง COMPLETE ได้เลย

## ที่มา

> "ค่าใช้จ่ายที่แก้หลังงานปิด"
> — [SRC-001](../sources/SRC-001.md) หน้า — §—

## พิสูจน์โดย

- [EX-job-021](../examples/EX-job-021.md) — happy: ระบบสร้างรายการปรับปรุงสถานะ 'รออนุมัติ' และแสดงข้อความ 'ส่งคำขอปรับค่าใช้จ่ายแล้ว รออนุมัติ'

## ประวัติ

| เวอร์ชัน | มีผลตั้งแต่ | เหตุผล | change set |
|---|---|---|---|
| **BR-job-011@v1** (หน้านี้) ❄️ | — | ตั้งต้น | — |
| [BR-job-011@v2](BR-job-011@v2.md) ✅ | 2026-08-01 | TOR §3.5 ระบุชัดว่าต้องอนุมัติ — คำบอกเล่าตอนแรกหลวมกว่าเอกสาร | [CHG-job-001](../changes/CHG-job-001.md) |
