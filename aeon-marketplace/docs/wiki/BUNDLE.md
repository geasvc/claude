---
type: Marketplace
title: bundle contract
---

# bundle นี้อ่านยังไง

> generate จาก `docs/design-registry.json` — ห้ามแก้ด้วยมือ

**หนึ่งโหนด หนึ่งไฟล์ ชื่อไฟล์คือ id** — เริ่มที่ [index.md](index.md) แล้วเดินตามลิงก์
ไม่ต้องอ่านทั้ง bundle เพื่อตอบคำถามบรรทัดเดียว

| อยากรู้ | เปิดที่ |
|---|---|
| ทั้ง bundle มีอะไรบ้าง | [index.md](index.md) |
| เรื่องไหนเคาะไปแล้ว ห้ามเปิดถามซ้ำ | [adr/index.md](adr/index.md) |
| ด่านไหนบล็อกอะไร | [checkpoints/index.md](checkpoints/index.md) |
| คำสั่งไหนเขียนไฟล์ ไหนอ่านอย่างเดียว | [commands/index.md](commands/index.md) |
| ใช้จริงแล้วเจออะไร | [field-notes/index.md](field-notes/index.md) |
| ตลาดนี้คืออะไร ประกอบด้วยอะไร | [marketplace/index.md](marketplace/index.md) |
| plugin ตัวไหนสร้างแล้ว ตัวไหนยังเป็นแบบ | [plugins/index.md](plugins/index.md) |
| สัญญาโครงสร้างของ JSON แต่ละไฟล์คืออะไร | [schemas/index.md](schemas/index.md) |
| ตัวตรวจกับตัวเรนเดอร์ตัวไหนเป็นเจ้าของเรื่องอะไร | [scripts/index.md](scripts/index.md) |
| skill ไหนถือ doctrine ของคำสั่งไหน | [skills/index.md](skills/index.md) |
| มาตรฐานที่ทุกอย่างในนี้ผูกอยู่ | [standards/index.md](standards/index.md) |

**ทุกหน้าเป็นเอกสารชั้น A** — มี `spec_hash` ของโหนดที่มันเรนเดอร์มา แก้ registry แล้วไม่ render ใหม่
ตัวตรวจ `scripts/verify-design.mjs` จะเห็นทันที (D4) · แก้หน้าด้วยมือแล้ว render ใหม่ = งานหาย

**ความจริงอยู่ที่ `docs/design-registry.json`** ไม่ใช่ที่นี่ · ที่นี่คือร่างของมันที่ agent เดินได้
