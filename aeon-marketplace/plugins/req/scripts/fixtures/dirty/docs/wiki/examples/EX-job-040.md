---
type: Example
title: happy — แสดงข้อความผิดพลาด
description: แสดงข้อความผิดพลาด
resource: ../rules/BR-job-021@v1.md
tags: [job, example, happy]
id: EX-JOB-40
status: draft
kind: happy
proves: [BR-job-021@v1]
has_ui: false
spec_hash: sha256:e5eb01f61a2c1bd3d5c8439d15134337a40fa3df468eb20771bac750a68584c6
---

# EX-job-040

## กำหนดให้ (given)
งาน J-010 อยู่สถานะ ASSIGN

## เมื่อ (when)
กดยกเลิกงาน

## แล้ว (then)
แสดงข้อความผิดพลาด

## พิสูจน์กฎ

- [BR-job-021@v1](../rules/BR-job-021@v1.md) ✅ ปัจจุบัน — ยกเลิกแล้วคืนเงินเต็มจำนวน
