---
type: Example
title: exception — ยอดรวมยังเป็นค่าเดิม และแสดงป้าย 'มีรายการรออนุมัติ 1 รายการ
description: ยอดรวมยังเป็นค่าเดิม และแสดงป้าย 'มีรายการรออนุมัติ 1 รายการ'
resource: ../rules/BR-job-011@v2.md
tags: [job, example, exception]
id: EX-job-022
status: draft
kind: exception
proves: [BR-job-011@v2]
has_ui: true
timestamp: 2026-08-01T12:30:00+07:00
spec_hash: sha256:19e4dc48e2e10cc60e8293345a774292b8d653c2694bd9100c66724866234894
---

# EX-job-022

## กำหนดให้ (given)
งาน J-002 สถานะ COMPLETE และยังไม่มีใครอนุมัติรายการปรับปรุง

## เมื่อ (when)
เปิดดูยอดรวมค่าใช้จ่ายของงาน

## แล้ว (then)
ยอดรวมยังเป็นค่าเดิม และแสดงป้าย 'มีรายการรออนุมัติ 1 รายการ'

## พิสูจน์กฎ

- [BR-job-011@v2](../rules/BR-job-011@v2.md) ✅ ปัจจุบัน — แก้ค่าใช้จ่ายหลัง COMPLETE ต้องมีคนอนุมัติก่อนจึงมีผล
