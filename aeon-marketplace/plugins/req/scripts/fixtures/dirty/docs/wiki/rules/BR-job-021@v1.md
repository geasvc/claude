---
type: Business Rule
title: ยกเลิกแล้วคืนเงินเต็มจำนวน
description: ยกเลิกแล้วคืนเงินเต็มจำนวน
resource: ../requirements/REQ-job-002.md
tags: [job, policy]
id: BR-job-021@v1
status: superseded
belongs_to: REQ-job-002
kind: policy
is_current: true
test_design: []
constrained_by: CALC-job-999@v1
proven_by: [EX-job-040]
golden: []
provenance: [SRC-012]
spec_hash: sha256:f029dc9ba4b6df0883c64aa9c9e631065d80864dda196d01ca566a1011686fb4
---

# BR-job-021@v1

## ข้อความของกฎ
ยกเลิกแล้วคืนเงินเต็มจำนวน

คำนวณตามสัญญา `CALC-job-999@v1`

## ที่มา

> "..."
> — [SRC-012](../sources/SRC-012.md) หน้า 1 §—

## พิสูจน์โดย

- [EX-job-040](../examples/EX-job-040.md) — happy: แสดงข้อความผิดพลาด

## ประวัติ

| เวอร์ชัน | มีผลตั้งแต่ | เหตุผล | change set |
|---|---|---|---|
| **BR-job-021@v1** (หน้านี้) ✅ | — | ตั้งต้น | — |
