---
type: Requirement
title: การเดินสถานะงานขนส่ง
description: เดินงานจาก INIT ถึง COMPLETE ตาม workflow ที่กำหนด และย้อนกลับได้ภายใต้กติกา
resource: ../../requirements/REQ-job-001.md
tags: [job, requirement]
id: REQ-job-001
status: draft
actor: คนขับ / admin
rules: [BR-job-009, BR-job-011, BR-job-014, BR-job-016]
domain_concepts: [UL-job-001, UL-job-002, UL-job-003]
timestamp: 2026-08-01T12:30:00+07:00
spec_hash: sha256:24c747002ee4c7cbfc550f347e5ab2d0b8cdaa8fcb696358a0c04a5e729e5b59
---

# REQ-job-001

## เป้าหมาย
เดินงานจาก INIT ถึง COMPLETE ตาม workflow ที่กำหนด และย้อนกลับได้ภายใต้กติกา

**actor:** คนขับ / admin · **ความสำคัญ:** high · **มีหน้าจอ:** ใช่

## คุณค่าทางธุรกิจ
ลดงานตามเอกสารด้วยมือ และตอบลูกค้าได้ว่างานอยู่ขั้นไหน

## กฎที่ยังใช้อยู่

| กฎ | ชนิด | ข้อความ | ตัวอย่าง |
|---|---|---|---|
| [BR-job-009@v1](../rules/BR-job-009@v1.md) | invariant | ถอย step ได้เฉพาะ admin และต้องระบุเหตุผล | 1 |
| [BR-job-011@v2](../rules/BR-job-011@v2.md) | policy | แก้ค่าใช้จ่ายหลัง COMPLETE ต้องมีคนอนุมัติก่อนจึงมีผล | 2 |
| [BR-job-014@v1](../rules/BR-job-014@v1.md) | invariant | แก้เงินหลังออก Bill แล้ว ต้องออก Bill ใหม่ทับของเดิม ห้ามแก้ใบเดิม | 1 |
| [BR-job-016@v1](../rules/BR-job-016@v1.md) | calculation | ยอดรวมของงาน = ค่าบริการพื้นฐาน + ค่าส่วนเพิ่มตามระยะทาง | 1 |

## คำศัพท์ที่ผูกกับ requirement นี้

- [UL-job-001 · งาน](../glossary/UL-job-001.md)
- [UL-job-002 · เที่ยววิ่ง](../glossary/UL-job-002.md)
- [UL-job-003 · การปรับค่าใช้จ่าย](../glossary/UL-job-003.md)

## NFR

- [NFR-job-001](../nfr/NFR-job-001.md) — หน้ารายการงานต้องโหลดภายใน 2 วินาทีที่ 5,000 งาน

## ฉบับที่คนอ่าน
[docs/requirements/REQ-job-001.md](../../requirements/REQ-job-001.md) — เนื้อความเต็มภาษาไทย
