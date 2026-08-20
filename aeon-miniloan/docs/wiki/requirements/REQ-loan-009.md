---
type: Requirement
title: แยก Web กับ API และข้อกำหนดที่ไม่ใช่ฟังก์ชัน
description: ให้ business logic ทั้งหมดอยู่หลัง API และ Web เป็นเพียง client ที่เรียกใช้ โดยทั้งสองส่วน deploy และทดสอบแยกกันได้
resource: ../../requirements/REQ-loan-009.md
tags: [loan, requirement]
id: REQ-loan-009
status: draft
actor: ทีมพัฒนา (Web เป็น client ที่เรียกใช้ API)
rules: []
domain_concepts: [UL-loan-011]
timestamp: 2026-08-20T08:56:00+07:00
spec_hash: sha256:6be12ea191cd02f5a79666e215f6774aebabda496e2d56697fcad9c0021221aa
---

# REQ-loan-009

## เป้าหมาย
ให้ business logic ทั้งหมดอยู่หลัง API และ Web เป็นเพียง client ที่เรียกใช้ โดยทั้งสองส่วน deploy และทดสอบแยกกันได้

**actor:** ทีมพัฒนา (Web เป็น client ที่เรียกใช้ API) · **ความสำคัญ:** high · **มีหน้าจอ:** ไม่

## คุณค่าทางธุรกิจ
เปลี่ยนหรือทดสอบแต่ละส่วนได้อิสระ และกฎธุรกิจถูกบังคับที่จุดเดียวเสมอแม้มี client อื่นเข้ามาทีหลัง

## กฎที่ยังใช้อยู่

| กฎ | ชนิด | ข้อความ | ตัวอย่าง |
|---|---|---|---|
| — | | ยังไม่มีกฎที่ is_current | |

## คำศัพท์ที่ผูกกับ requirement นี้

- [UL-loan-011 · จำนวนเงิน](../glossary/UL-loan-011.md)

## NFR

- [NFR-loan-001](../nfr/NFR-loan-001.md) — ทุกความสามารถใน Epic 1–8 ต้องมี API endpoint รองรับ และ business rule ถูกบังคับที่ฝั่ง API เสมอ
- [NFR-loan-002](../nfr/NFR-loan-002.md) — เรียก API ด้วยข้อมูลที่ผิด business rule ต้องถูกปฏิเสธพร้อมรหัส/ข้อความ error ที่ชัดเจน ไม่พึ่งการ validate ของ Web เพียงอย่างเดียว
- [NFR-loan-003](../nfr/NFR-loan-003.md) — Web ไม่ถือกฎธุรกิจ — เมื่อต้องตัดสินใจเชิงธุรกิจ (อนุมัติได้ไหม วงเงินเท่าไร) Web ต้องเรียก API เท่านั้น ไม่คำนวณเอง
- [NFR-loan-004](../nfr/NFR-loan-004.md) — เมื่อ API ปิดให้บริการ Web ต้องแสดงสถานะข้อผิดพลาดอย่างเหมาะสมและไม่ crash
- [NFR-loan-005](../nfr/NFR-loan-005.md) — มีสัญญา API (เช่น OpenAPI) ที่อธิบาย endpoint และ request/response schema และ request/response จริงต้องตรงตาม schema ที่ประกาศไว้
- [NFR-loan-006](../nfr/NFR-loan-006.md) — Web แนบ token จำลองทุก request และ API ตรวจสอบก่อนให้บริการ (auth จริงอยู่นอกขอบเขต)
- [NFR-loan-007](../nfr/NFR-loan-007.md) — จำนวนเงินใช้ชนิดข้อมูลที่แม่นยำ ไม่ใช้ floating point และปัดเศษสม่ำเสมอทั้งระบบ
- [NFR-loan-008](../nfr/NFR-loan-008.md) — ทุกการเปลี่ยนสถานะบันทึกผู้กระทำและเวลา
- [NFR-loan-009](../nfr/NFR-loan-009.md) — ตรวจสอบ input ทั้งฝั่ง Web และฝั่ง API โดย API เป็นด่านสุดท้ายเสมอ และไม่เก็บข้อมูลอ่อนไหวจริง
- [NFR-loan-010](../nfr/NFR-loan-010.md) — API เป็นแบบ stateless สื่อสารด้วยรูปแบบมาตรฐาน (เช่น REST/JSON) · Web กับ API deploy และทดสอบแยกกันได้อิสระ · ตั้งค่า CORS/Origin ให้ Web เรียก API ได้อย่างถูกต้อง

## ฉบับที่คนอ่าน
[docs/requirements/REQ-loan-009.md](../../requirements/REQ-loan-009.md) — เนื้อความเต็มภาษาไทย
