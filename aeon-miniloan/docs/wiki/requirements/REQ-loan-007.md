---
type: Requirement
title: ปิดบัญชีก่อนกำหนด
description: ขอยอดปิดบัญชีก่อนครบกำหนด และปิดบัญชีเมื่อชำระยอดนั้นครบ
resource: ../../requirements/REQ-loan-007.md
tags: [loan, requirement]
id: REQ-loan-007
status: draft
actor: Operations
rules: [BR-loan-021, BR-loan-022]
domain_concepts: [UL-loan-004, UL-loan-009, UL-loan-010, UL-loan-016, UL-loan-018, UL-loan-019, UL-loan-020]
timestamp: 2026-08-20T08:56:00+07:00
spec_hash: sha256:7031fd8cb4b3cc668e736d215c7c617b1facbf3e023f456cfa847eaedfbcc9c7
---

# REQ-loan-007

## เป้าหมาย
ขอยอดปิดบัญชีก่อนครบกำหนด และปิดบัญชีเมื่อชำระยอดนั้นครบ

**actor:** Operations · **ความสำคัญ:** medium · **มีหน้าจอ:** ใช่

## คุณค่าทางธุรกิจ
ผู้กู้จ่ายดอกเบี้ยเฉพาะที่เกิดขึ้นจริงถึงวันปิด ไม่ถูกคิดดอกของงวดที่ยังไม่ถึงกำหนด

## กฎที่ยังใช้อยู่

| กฎ | ชนิด | ข้อความ | ตัวอย่าง |
|---|---|---|---|
| [BR-loan-021@v1](../rules/BR-loan-021@v1.md) | calculation | ยอดปิดบัญชีก่อนกำหนด = เงินต้นคงเหลือ + ดอกเบี้ยค้างจ่ายถึงวันที่ปิด + ค่าธรรมเนียมปิดก่อนกำหนด 1% ของเงินต้นคงเหลือ · ไม่คิดดอกเบี้ยของงวดในอนาคตที่ยังไม่ถึงกำหนด | 🔴 0 |
| [BR-loan-022@v1](../rules/BR-loan-022@v1.md) | invariant | เมื่อชำระยอดปิดบัญชีครบ บัญชีเปลี่ยนสถานะเป็น Closed และงวดที่เหลือในตารางผ่อนถูกยกเลิก | 🔴 0 |

## คำศัพท์ที่ผูกกับ requirement นี้

- [UL-loan-004 · บัญชีสินเชื่อ](../glossary/UL-loan-004.md)
- [UL-loan-009 · รายการชำระเงิน](../glossary/UL-loan-009.md)
- [UL-loan-010 · การปิดบัญชีก่อนกำหนด](../glossary/UL-loan-010.md)
- [UL-loan-016 · ยอดคงเหลือ](../glossary/UL-loan-016.md)
- [UL-loan-018 · ดอกเบี้ยค้างจ่าย](../glossary/UL-loan-018.md)
- [UL-loan-019 · ยอดปิดบัญชี](../glossary/UL-loan-019.md)
- [UL-loan-020 · ดอกเบี้ยรายงวด](../glossary/UL-loan-020.md)

## ฉบับที่คนอ่าน
[docs/requirements/REQ-loan-007.md](../../requirements/REQ-loan-007.md) — เนื้อความเต็มภาษาไทย
