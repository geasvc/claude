---
type: Business Rule
title: เมื่อเจ้าหน้าที่เปิดดูใบสมัครที่มี CreditAssessment ต้องเห็นรายการเกณฑ์ที่ผ่านแล
description: เมื่อเจ้าหน้าที่เปิดดูใบสมัครที่มี CreditAssessment ต้องเห็นรายการเกณฑ์ที่ผ่านและไม่ผ่านเป็นรายข้อ พร้อมวงเงินสูงสุดตาม BR-loan-006@v1
resource: ../requirements/REQ-loan-003.md
tags: [loan, policy]
id: BR-loan-011@v1
status: draft
belongs_to: REQ-loan-003
kind: policy
is_current: true
test_design: [EP]
proven_by: []
golden: []
provenance: [SRC-001]
timestamp: 2026-08-20T08:56:00+07:00
spec_hash: sha256:823fa887ea1cdfd2dec24ee5e455f95ce64a92545feac60bd23e126ebd68bc5f
---

# BR-loan-011@v1

## ข้อความของกฎ
เมื่อเจ้าหน้าที่เปิดดูใบสมัครที่มี CreditAssessment ต้องเห็นรายการเกณฑ์ที่ผ่านและไม่ผ่านเป็นรายข้อ พร้อมวงเงินสูงสุดตาม BR-loan-006@v1

## ที่มา

> "**Given** มี CreditAssessment **When** เปิดดูใบสมัคร **Then** เห็นรายการเกณฑ์ที่ผ่าน/ไม่ผ่าน และวงเงินสูงสุดตาม BR-03"
> — [SRC-001](../sources/SRC-001.md) หน้า — §§7 US-04

## พิสูจน์โดย

🔴 ยังไม่มีใครพิสูจน์กฎข้อนี้

## ประวัติ

| เวอร์ชัน | มีผลตั้งแต่ | เหตุผล | change set |
|---|---|---|---|
| **BR-loan-011@v1** (หน้านี้) ✅ | — | ตั้งต้น | — |
