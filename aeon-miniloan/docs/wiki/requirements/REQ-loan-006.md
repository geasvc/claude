---
type: Requirement
title: รับชำระรายงวด
description: บันทึกการชำระเข้าบัญชีสินเชื่อทีละงวด และปิดบัญชีเมื่อชำระครบทุกงวด
resource: ../../requirements/REQ-loan-006.md
tags: [loan, requirement]
id: REQ-loan-006
status: draft
actor: Operations
rules: [BR-loan-019, BR-loan-020]
domain_concepts: [UL-loan-004, UL-loan-005, UL-loan-006, UL-loan-008, UL-loan-009, UL-loan-016]
timestamp: 2026-08-20T08:56:00+07:00
spec_hash: sha256:b10b659f20776303057ddbb731874217e345815de9570bd22cc27dbcfb91d6d6
---

# REQ-loan-006

## เป้าหมาย
บันทึกการชำระเข้าบัญชีสินเชื่อทีละงวด และปิดบัญชีเมื่อชำระครบทุกงวด

**actor:** Operations · **ความสำคัญ:** high · **มีหน้าจอ:** ใช่

## คุณค่าทางธุรกิจ
ยอดคงเหลือที่ลูกค้าถามได้ตลอดเวลาต้องตรงกับเงินที่รับเข้ามาจริง — โดยยอมรับว่าเงินจริงเคลื่อนนอกระบบและ Operations เป็นผู้บันทึกผล ซึ่งเป็นเคสยกเว้นที่ตกลงกันแล้ว ไม่ใช่ความไม่สมบูรณ์ของโมดูล

## กฎที่ยังใช้อยู่

| กฎ | ชนิด | ข้อความ | ตัวอย่าง |
|---|---|---|---|
| [BR-loan-019@v1](../rules/BR-loan-019@v1.md) | policy | รับชำระเฉพาะยอดที่ตรงกับค่างวดเต็มจำนวนเท่านั้น งวดนั้นจึงเปลี่ยนเป็น Paid และยอดคงเหลือลดลง · ชำระน้อยกว่ายอดงวด ระบบแจ้งว่าไม่ครบงวดและไม่ปิดงวด (ไม่รับชำระบางส่วน) | 🔴 0 |
| [BR-loan-020@v1](../rules/BR-loan-020@v1.md) | invariant | เมื่อบันทึกการชำระงวดสุดท้ายจนครบทุกงวด บัญชีสินเชื่อเปลี่ยนสถานะจาก Active เป็น Closed | 🔴 0 |

## คำศัพท์ที่ผูกกับ requirement นี้

- [UL-loan-004 · บัญชีสินเชื่อ](../glossary/UL-loan-004.md)
- [UL-loan-005 · ตารางผ่อน](../glossary/UL-loan-005.md)
- [UL-loan-006 · งวดผ่อน](../glossary/UL-loan-006.md)
- [UL-loan-008 · ค่างวด](../glossary/UL-loan-008.md)
- [UL-loan-009 · รายการชำระเงิน](../glossary/UL-loan-009.md)
- [UL-loan-016 · ยอดคงเหลือ](../glossary/UL-loan-016.md)

## ฉบับที่คนอ่าน
[docs/requirements/REQ-loan-006.md](../../requirements/REQ-loan-006.md) — เนื้อความเต็มภาษาไทย
