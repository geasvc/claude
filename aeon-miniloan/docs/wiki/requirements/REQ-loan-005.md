---
type: Requirement
title: ตารางผ่อนแบบลดต้นลดดอก
description: สร้างตารางผ่อนที่ค่างวดเท่ากันทุกงวด แยกเงินต้นกับดอกเบี้ยรายงวด และปิดยอดคงเหลือที่ 0 พอดี
resource: ../../requirements/REQ-loan-005.md
tags: [loan, requirement]
id: REQ-loan-005
status: draft
actor: System
rules: [BR-loan-015, BR-loan-016, BR-loan-017, BR-loan-018]
domain_concepts: [UL-loan-004, UL-loan-005, UL-loan-006, UL-loan-007, UL-loan-008, UL-loan-011, UL-loan-016, UL-loan-020]
timestamp: 2026-08-20T08:56:00+07:00
spec_hash: sha256:176c7dfabb5d6807890a21fdff1f066ca1110f790a5b6495058478be72603a61
---

# REQ-loan-005

## เป้าหมาย
สร้างตารางผ่อนที่ค่างวดเท่ากันทุกงวด แยกเงินต้นกับดอกเบี้ยรายงวด และปิดยอดคงเหลือที่ 0 พอดี

**actor:** System · **ความสำคัญ:** high · **มีหน้าจอ:** ไม่

## คุณค่าทางธุรกิจ
ตัวเลขที่ผู้กู้เห็นและตัวเลขที่ระบบใช้ตัดหนี้เป็นชุดเดียวกัน ผิดหนึ่งสตางค์คือผิดทั้งสัญญา

## กฎที่ยังใช้อยู่

| กฎ | ชนิด | ข้อความ | ตัวอย่าง |
|---|---|---|---|
| [BR-loan-015@v1](../rules/BR-loan-015@v1.md) | policy | อัตราดอกเบี้ยเป็นแบบลดต้นลดดอก 25% ต่อปี และอัตราต่อเดือน r = อัตราต่อปี ÷ 12 | 🔴 0 |
| [BR-loan-016@v1](../rules/BR-loan-016@v1.md) | calculation | ค่างวดเท่ากันทุกงวดตามสูตร EMI = P × r × (1+r)^n / ((1+r)^n − 1) โดย P คือเงินต้น r คืออัตราดอกเบี้ยต่อเดือน และ n คือจำนวนงวด · ตารางที่สร้างต้องมีครบ n งวด | 🔴 0 |
| [BR-loan-017@v1](../rules/BR-loan-017@v1.md) | calculation | แต่ละงวดแยกเป็นดอกเบี้ย (ยอดคงเหลือ × r) และเงินต้น (EMI − ดอกเบี้ย) · ผลรวมเงินต้นทุกงวดต้องเท่ากับเงินต้นตั้งต้นพอดี โดยงวดสุดท้ายเป็นตัวรับเศษ · ยอดคงเหลือหลังงวดสุดท้ายต้องเท่ากับ 0 | 🔴 0 |
| [BR-loan-018@v1](../rules/BR-loan-018@v1.md) | policy | วันครบกำหนดชำระของแต่ละงวดเป็นรายเดือนนับจากวันเบิกจ่าย | 🔴 0 |

## คำศัพท์ที่ผูกกับ requirement นี้

- [UL-loan-004 · บัญชีสินเชื่อ](../glossary/UL-loan-004.md)
- [UL-loan-005 · ตารางผ่อน](../glossary/UL-loan-005.md)
- [UL-loan-006 · งวดผ่อน](../glossary/UL-loan-006.md)
- [UL-loan-007 · จำนวนงวด](../glossary/UL-loan-007.md)
- [UL-loan-008 · ค่างวด](../glossary/UL-loan-008.md)
- [UL-loan-011 · จำนวนเงิน](../glossary/UL-loan-011.md)
- [UL-loan-016 · ยอดคงเหลือ](../glossary/UL-loan-016.md)
- [UL-loan-020 · ดอกเบี้ยรายงวด](../glossary/UL-loan-020.md)

## ฉบับที่คนอ่าน
[docs/requirements/REQ-loan-005.md](../../requirements/REQ-loan-005.md) — เนื้อความเต็มภาษาไทย
