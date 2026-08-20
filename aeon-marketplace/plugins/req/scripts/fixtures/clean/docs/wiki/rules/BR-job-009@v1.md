---
type: Business Rule
title: ถอย step ได้เฉพาะ admin และต้องระบุเหตุผล
description: ถอย step ได้เฉพาะ admin และต้องระบุเหตุผล
resource: ../requirements/REQ-job-001.md
tags: [job, invariant]
id: BR-job-009@v1
status: draft
belongs_to: REQ-job-001
kind: invariant
is_current: true
test_design: [state_transition]
proven_by: [EX-job-014]
golden: []
provenance: [SRC-002]
timestamp: 2026-08-01T12:30:00+07:00
spec_hash: sha256:d4e255888d0e0ac348a268a05b20dcfa296411425d01c384ec6c53f8403b76d6
---

# BR-job-009@v1

## ข้อความของกฎ
ถอย step ได้เฉพาะ admin และต้องระบุเหตุผล

## ที่มา

> "พนักงานขับรถไม่มีสิทธิ์ย้อนสถานะ"
> — [SRC-002](../sources/SRC-002.md) หน้า 1 §3.2

## พิสูจน์โดย

- [EX-job-014](../examples/EX-job-014.md) — exception: ระบบไม่ถอยสถานะ และแสดงข้อความ 'คุณไม่มีสิทธิ์ถอยสถานะงาน'

## ประวัติ

| เวอร์ชัน | มีผลตั้งแต่ | เหตุผล | change set |
|---|---|---|---|
| **BR-job-009@v1** (หน้านี้) ✅ | — | ตั้งต้น | — |
