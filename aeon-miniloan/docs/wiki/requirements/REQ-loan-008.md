---
type: Requirement
title: แดชบอร์ดภาพรวมสถานะ
description: เห็นจำนวนใบสมัครและบัญชีแยกตามสถานะ เพื่อจัดลำดับงานที่ต้องทำ
resource: ../../requirements/REQ-loan-008.md
tags: [loan, requirement]
id: REQ-loan-008
status: draft
actor: Loan Officer
rules: [BR-loan-023]
domain_concepts: [UL-loan-001, UL-loan-004]
timestamp: 2026-08-20T08:56:00+07:00
spec_hash: sha256:a7eb0c6b75aa5ba811db04b201f28bbcbb8ea2ca4f0dda943bfdff817165069c
---

# REQ-loan-008

## เป้าหมาย
เห็นจำนวนใบสมัครและบัญชีแยกตามสถานะ เพื่อจัดลำดับงานที่ต้องทำ

**actor:** Loan Officer · **ความสำคัญ:** low · **มีหน้าจอ:** ใช่

## คุณค่าทางธุรกิจ
รู้ว่ามีงานค้างกี่ใบและค้างอยู่ขั้นไหน โดยไม่ต้องไล่เปิดทีละใบ

## กฎที่ยังใช้อยู่

| กฎ | ชนิด | ข้อความ | ตัวอย่าง |
|---|---|---|---|
| [BR-loan-023@v1](../rules/BR-loan-023@v1.md) | policy | แดชบอร์ดแสดงจำนวนแยกตามสถานะ Submitted / UnderReview / Approved (ของใบสมัคร) และ Active / Closed (ของบัญชีสินเชื่อ) | 🔴 0 |

## คำศัพท์ที่ผูกกับ requirement นี้

- [UL-loan-001 · ใบสมัครสินเชื่อ](../glossary/UL-loan-001.md)
- [UL-loan-004 · บัญชีสินเชื่อ](../glossary/UL-loan-004.md)

## ฉบับที่คนอ่าน
[docs/requirements/REQ-loan-008.md](../../requirements/REQ-loan-008.md) — เนื้อความเต็มภาษาไทย
