---
type: Requirement
title: เบิกจ่ายและเปิดบัญชีสินเชื่อ
description: สั่งเบิกจ่ายใบสมัครที่อนุมัติแล้ว เพื่อเริ่มสัญญาและเปิดบัญชีสินเชื่อพร้อมตารางผ่อน
resource: ../../requirements/REQ-loan-004.md
tags: [loan, requirement]
id: REQ-loan-004
status: draft
actor: Loan Officer
rules: [BR-loan-012, BR-loan-013, BR-loan-014]
domain_concepts: [UL-loan-001, UL-loan-004, UL-loan-005]
timestamp: 2026-08-20T08:56:00+07:00
spec_hash: sha256:0ca3072b8baeb383f1efdc284626ac24a8b9aacfaa51fecab88e87f37c9e88d1
---

# REQ-loan-004

## เป้าหมาย
สั่งเบิกจ่ายใบสมัครที่อนุมัติแล้ว เพื่อเริ่มสัญญาและเปิดบัญชีสินเชื่อพร้อมตารางผ่อน

**actor:** Loan Officer · **ความสำคัญ:** high · **มีหน้าจอ:** ใช่

## คุณค่าทางธุรกิจ
จุดเดียวที่ใบสมัครกลายเป็นหนี้จริง จึงต้องบังคับให้เกิดได้เฉพาะจากสถานะที่อนุมัติแล้วเท่านั้น

## กฎที่ยังใช้อยู่

| กฎ | ชนิด | ข้อความ | ตัวอย่าง |
|---|---|---|---|
| [BR-loan-012@v1](../rules/BR-loan-012@v1.md) | invariant | สั่งเบิกจ่ายได้เฉพาะใบสมัครที่อยู่ในสถานะ Approved เท่านั้น แล้วสถานะเปลี่ยนเป็น Disbursed · ใบสมัครที่ยังไม่ Approved ระบบต้องปฏิเสธการเบิกจ่าย | 🔴 0 |
| [BR-loan-013@v1](../rules/BR-loan-013@v1.md) | invariant | เมื่อเบิกจ่ายสำเร็จ ระบบสร้าง LoanAccount สถานะ Active และสร้าง RepaymentSchedule ตาม BR-loan-016@v1 ทันทีในการกระทำเดียวกัน | 🔴 0 |
| [BR-loan-014@v1](../rules/BR-loan-014@v1.md) | invariant | ผู้สมัครหนึ่งคนมีใบสมัครได้หลายใบ แต่ใบสมัครหนึ่งใบที่ Disbursed สร้างบัญชีสินเชื่อได้ 1 บัญชีเท่านั้น | 🔴 0 |

## คำศัพท์ที่ผูกกับ requirement นี้

- [UL-loan-001 · ใบสมัครสินเชื่อ](../glossary/UL-loan-001.md)
- [UL-loan-004 · บัญชีสินเชื่อ](../glossary/UL-loan-004.md)
- [UL-loan-005 · ตารางผ่อน](../glossary/UL-loan-005.md)

## ฉบับที่คนอ่าน
[docs/requirements/REQ-loan-004.md](../../requirements/REQ-loan-004.md) — เนื้อความเต็มภาษาไทย
