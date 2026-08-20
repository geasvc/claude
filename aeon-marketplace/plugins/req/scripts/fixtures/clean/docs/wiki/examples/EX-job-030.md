---
type: Example
title: exception — ระบบไม่แก้ B-100 แต่ออก Bill ใหม่ทับ และแสดงข้อความ 'ออกใบแจ
description: ระบบไม่แก้ B-100 แต่ออก Bill ใหม่ทับ และแสดงข้อความ 'ออกใบแจ้งหนี้ใหม่ทับใบเดิม B-100'
resource: ../rules/BR-job-014@v1.md
tags: [job, example, exception]
id: EX-job-030
status: draft
kind: exception
proves: [BR-job-014@v1]
has_ui: true
timestamp: 2026-08-01T12:30:00+07:00
spec_hash: sha256:a5025d1c7b82e34c95a6b6bf5b6e6432fa4ee7b70fc25f3d2d9314d87e041520
---

# EX-job-030

## กำหนดให้ (given)
งาน J-003 ออก Bill B-100 ไปแล้ว

## เมื่อ (when)
admin แก้ค่าขนส่งของงานนั้น

## แล้ว (then)
ระบบไม่แก้ B-100 แต่ออก Bill ใหม่ทับ และแสดงข้อความ 'ออกใบแจ้งหนี้ใหม่ทับใบเดิม B-100'

## พิสูจน์กฎ

- [BR-job-014@v1](../rules/BR-job-014@v1.md) ✅ ปัจจุบัน — แก้เงินหลังออก Bill แล้ว ต้องออก Bill ใหม่ทับของเดิม ห้ามแก้ใบเดิม
