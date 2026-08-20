---
type: Example
title: exception — ระบบไม่ถอยสถานะ และแสดงข้อความ 'คุณไม่มีสิทธิ์ถอยสถานะงาน'
description: ระบบไม่ถอยสถานะ และแสดงข้อความ 'คุณไม่มีสิทธิ์ถอยสถานะงาน'
resource: ../rules/BR-job-009@v1.md
tags: [job, example, exception]
id: EX-job-014
status: draft
kind: exception
proves: [BR-job-009@v1]
has_ui: true
timestamp: 2026-08-01T12:30:00+07:00
spec_hash: sha256:13dcdc656c4f8c541c23521fa6f9de4febefe7aeb536157febbfeb26a5400dd8
---

# EX-job-014

## กำหนดให้ (given)
งาน J-001 อยู่ step UNLOAD และผู้ใช้ล็อกอินเป็นคนขับ

## เมื่อ (when)
กดปุ่มถอยกลับไป LOAD

## แล้ว (then)
ระบบไม่ถอยสถานะ และแสดงข้อความ 'คุณไม่มีสิทธิ์ถอยสถานะงาน'

## พิสูจน์กฎ

- [BR-job-009@v1](../rules/BR-job-009@v1.md) ✅ ปัจจุบัน — ถอย step ได้เฉพาะ admin และต้องระบุเหตุผล
