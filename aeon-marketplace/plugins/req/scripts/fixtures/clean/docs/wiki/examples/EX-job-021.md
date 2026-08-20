---
type: Example
title: happy — ระบบสร้างรายการปรับปรุงสถานะ 'รออนุมัติ' และแสดงข้อความ 'ส่ง
description: ระบบสร้างรายการปรับปรุงสถานะ 'รออนุมัติ' และแสดงข้อความ 'ส่งคำขอปรับค่าใช้จ่ายแล้ว รออนุมัติ'
resource: ../rules/BR-job-011@v1.md
tags: [job, example, happy]
id: EX-job-021
status: draft
kind: happy
proves: [BR-job-011@v1, BR-job-011@v2]
has_ui: true
timestamp: 2026-08-01T12:30:00+07:00
spec_hash: sha256:76726ef4c01658e4efddfe25d2e02c9fa962db2c1d7089e6431f79466140d8a6
---

# EX-job-021

## กำหนดให้ (given)
งาน J-002 สถานะ COMPLETE และผู้ใช้เป็น admin

## เมื่อ (when)
บันทึกค่าใช้จ่ายเพิ่ม 500 บาท

## แล้ว (then)
ระบบสร้างรายการปรับปรุงสถานะ 'รออนุมัติ' และแสดงข้อความ 'ส่งคำขอปรับค่าใช้จ่ายแล้ว รออนุมัติ'

## พิสูจน์กฎ

- [BR-job-011@v1](../rules/BR-job-011@v1.md) ❄️ — แก้ค่าใช้จ่ายหลัง COMPLETE ได้เลย
- [BR-job-011@v2](../rules/BR-job-011@v2.md) ✅ ปัจจุบัน — แก้ค่าใช้จ่ายหลัง COMPLETE ต้องมีคนอนุมัติก่อนจึงมีผล
