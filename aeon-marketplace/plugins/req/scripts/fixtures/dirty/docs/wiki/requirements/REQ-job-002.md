---
type: Requirement
title: การยกเลิกงานขนส่ง
resource: ../../requirements/REQ-job-002.md
tags: [job, requirement]
id: REQ-job-002
status: draft
rules: [BR-job-020, BR-job-021, BR-job-022, BR-job-030]
domain_concepts: [UL-job-010, UL-job-777]
spec_hash: sha256:0cb98b6e7aec6a23ade38042f970d0eb6101c6a55c92d7c02ac797299c3424bd
---

# REQ-job-002

## เป้าหมาย


**actor:** — · **ความสำคัญ:** — · **มีหน้าจอ:** ใช่

## กฎที่ยังใช้อยู่

| กฎ | ชนิด | ข้อความ | ตัวอย่าง |
|---|---|---|---|
| [BR-job-020@v1](../rules/BR-job-020@v1.md) | calculation | ยกเลิกงานได้เฉพาะก่อนสถานะ LOAD แล้วคืนเงินตามสัดส่วนที่วิ่งไปแล้ว | 🔴 0 |
| [BR-job-021@v1](../rules/BR-job-021@v1.md) | policy | ยกเลิกแล้วคืนเงินเต็มจำนวน | 1 |
| [BR-job-022@v1](../rules/BR-job-022@v1.md) | calculation | ค่าปรับยกเลิกคิด 10% ของยอดงาน | 1 |
| [BR-job-022@v2](../rules/BR-job-022@v2.md) | invariant | งานที่ยกเลิกแล้วเปิดใหม่ได้ถ้า admin อนุมัติ | 1 |

## คำศัพท์ที่ผูกกับ requirement นี้

- [UL-job-010 · การยกเลิก](../glossary/UL-job-010.md)

## ฉบับที่คนอ่าน
[docs/requirements/REQ-job-002.md](../../requirements/REQ-job-002.md) — เนื้อความเต็มภาษาไทย
