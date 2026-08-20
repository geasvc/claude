---
type: Decision
title: ไฟล์สัญญาของ bundle ชื่อ BUNDLE.md ไม่ใช่ CLAUDE.md
description: เคาะ 2026-08-13 · ใช้กับทั้ง bundle ฝั่งเครื่องมือและ bundle ที่ plugin เขียนลงโปรเจกต์ลูกค้า
resource: plugins/req/scripts/doc-frontmatter.mjs
tags: [adr, naming, safety]
timestamp: 2026-08-13T00:00:00+07:00
id: ADR-aeon-005
lifecycle: built
owner: พี่ปู
spec_hash: sha256:73621b7f220bb5587d55397f76f96411936db4be1a132f9f79b5465b496ae97b
---

# ไฟล์สัญญาของ bundle ชื่อ BUNDLE.md ไม่ใช่ CLAUDE.md

> หน้านี้ถูก generate จาก `docs/design-registry.json` — **ห้ามแก้ด้วยมือ** แก้ที่ registry แล้ว render ใหม่

## ทำอะไร

Claude Code โหลดไฟล์ชื่อ CLAUDE.md ทุกไฟล์ในสายไดเรกทอรีเข้า context ในฐานะ 'คำสั่ง' · หน้าสัญญาของ bundle เป็นไฟล์ที่ generate จากสคริปต์ ปล่อยให้ใช้ชื่อนั้นต่อ = เอาผลลัพธ์ของสคริปต์ไปวางในช่องคำสั่งประจำของทุก session รวมทั้งใน repo ของลูกค้า เพราะ /req:capture เขียน bundle ลงที่นั่น

## เกร็ดที่ต้องรู้

- ชื่อไฟล์เป็นค่าเดียวใน SCAFFOLD_FILES ของ doc-frontmatter.mjs ตัวเรนเดอร์สองตัวจึงเปลี่ยนตามที่เดียว
- เปลี่ยนแล้ววัดซ้ำทุกด่าน ตัวเลขไม่ขยับสักตัว: rules 44/19 · design 11/6 · clean ทั้งสองฝั่งยังเขียว
- หน้าเก่าที่ชื่อ CLAUDE.md กลายเป็นหน้ากำพร้า และตัวเรนเดอร์ไม่ลบให้เอง — คนลบเอง ตามกติกาว่าการลบไฟล์เป็นการตัดสินใจ

## ของที่มันแตะ

- [SCR-req-004](../scripts/SCR-req-004.md) — doc-frontmatter.mjs
- [SCR-req-005](../scripts/SCR-req-005.md) — wiki.mjs
- [SCR-aeon-002](../scripts/SCR-aeon-002.md) — wiki-authoring.mjs
- [STD-doc-001](../standards/STD-doc-001.md) — DOC-STANDARD v1.1

## ของจริงอยู่ที่ไหน

`plugins/req/scripts/doc-frontmatter.mjs`
