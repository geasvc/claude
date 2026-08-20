# Design Document Plugin — Requirement Specification

> **สถานะ:** Draft v0.1 (สำหรับใช้เป็นโจทย์ในการสร้าง plugin)
> **ผู้เขียนความต้องการ:** User
> **ขอบเขตเอกสารนี้:** ระบุ *ว่าต้องทำอะไร* ไม่ระบุ *ว่าเขียนโค้ดอย่างไร*
> เอกสารนี้ไม่ใช่ SKILL.md และไม่ใช่ตัว plugin — เป็นโจทย์ตั้งต้น

---

## 0. สรุปย่อสำหรับผู้เรียน (Read This First)

Design Plugin คือ **ตัวแปลง requirement ให้กลายเป็นเอกสารสองภาษา**

| ปลายทาง | รูปแบบ | ใครใช้ | ใช้ทำอะไร |
|---|---|---|---|
| Human | เอกสารเรียบเรียง (Markdown → Word/PDF) | ลูกค้า, PM, ผู้บริหาร | ตรวจสอบและเซ็นรับรองขอบเขตงาน |
| AI | Structured JSON + Wiki Markdown | agent ของ plugin ถัดไป | พัฒนา, ทำ mockup, เขียน test |

**หัวใจของงานนี้ไม่ใช่ "เขียนเอกสารสวย" แต่คือ "ทำให้ทุกอย่างสาวกลับได้"**
หน้าจอนี้มาจาก requirement ข้อไหน → ต้องมี unit test อะไร → อยู่ใน scenario ไหน → ถ้า requirement เปลี่ยน อะไรพังบ้าง

**Analogy:** คิดถึง design plugin เหมือน *ล่ามในห้องประชุม* ที่นั่งอยู่ระหว่างลูกค้ากับทีมพัฒนา
- ล่ามที่ดีไม่ได้แปลคำต่อคำ แต่แปลเป็นภาษาที่แต่ละฝั่ง**ตัดสินใจต่อได้**
- ลูกค้าต้องการภาษาที่ "อ่านแล้วเซ็นได้" → เอกสาร narrative
- ทีมพัฒนา (AI agent) ต้องการภาษาที่ "อ่านแล้วสั่งงานต่อได้" → structured data
- และล่ามต้องจำได้ว่าประโยคไหนแปลมาจากประโยคไหน (traceability) มิฉะนั้นเวลามีคนแก้คำพูด จะไม่รู้ว่าต้องแก้ตรงไหนตาม

---

## 1. เป้าหมาย และ Non-Goals

### 1.1 เป้าหมาย (Goals)

| ID | เป้าหมาย | วัดผลอย่างไร |
|---|---|---|
| G1 | รับ output จาก `req` plugin แล้วผลิตเอกสารออกแบบได้โดยไม่ต้องป้อนข้อมูลซ้ำ | ไม่มีข้อมูลใดที่ต้องพิมพ์ใหม่เกิน 1 ครั้ง |
| G2 | ผลิตเอกสารสำหรับลูกค้าตรวจรับได้ครบตามหัวข้อมาตรฐาน SA ไทย | ผ่าน checklist §11 ครบทุกหัวข้อ |
| G3 | ผลิต spec ที่ downstream agent นำไปทำงานต่อได้โดยไม่ต้องเดา | plugin `dev`/`qa` สร้าง task ได้โดยไม่ถามคำถามเพิ่ม |
| G4 | ทุก artifact สาวกลับถึง requirement ต้นทางได้ 100% | validation V1–V2 ผ่าน |
| G5 | ทำงานต่อเนื่องข้าม session ได้ | เริ่ม session ใหม่ด้วยคำสั่งเดียวแล้ว agent รู้ว่าค้างตรงไหน |
| G6 | รองรับ requirement ที่เปลี่ยนกลางทาง โดยรู้ผลกระทบทันที | คำสั่ง change ระบุรายการ artifact ที่ได้รับผลกระทบครบ |
| G7 | ใช้ JSON + Wiki ร่วมกับ plugin อื่นใน marketplace ได้ | schema versioned และ plugin อื่นอ่านได้โดยไม่แก้ design plugin |

### 1.2 Non-Goals (ไม่อยู่ในขอบเขต)

- ไม่ทำ requirement elicitation เอง (เป็นหน้าที่ `req` plugin)
- ไม่เขียนโค้ดระบบจริง (เป็นหน้าที่ `dev` plugin)
- ไม่รัน test จริง (เป็นหน้าที่ `qa` plugin)
- ไม่ทำ deployment / infrastructure design
- ไม่ประมาณ effort / คิดราคา (เป็นหน้าที่ `deliver` plugin)
- ไม่ทำ wireframe, theme, handoff หรือ mockup — ทั้งหมดเป็นของ mockup plugin (ดู §12)

---

## 2. ผู้เกี่ยวข้องและบริบทการใช้งาน

| Actor | ใช้ผ่าน | ต้องการอะไร |
|---|---|---|
| System Analyst (มนุษย์) | คำสั่งใน Claude Code | สั่งสร้างเอกสาร, ตรวจ, แก้ |
| ลูกค้า / Business Owner | ไฟล์ Word/PDF ที่ export ออกมา | อ่านรู้เรื่อง เซ็นรับรองได้ |
| AI Agent (design) | อ่าน/เขียน artifact store | ทำงานทีละ command จนจบ |
| AI Agent (mockup / dev / qa) | อ่าน artifact store แบบ read-only | รับ spec ไปทำงานต่อ |
| ผู้ตรวจสอบ (QA/Audit) | RTM + validation report | ตรวจว่าครบและสอดคล้อง |

---

## 3. ตำแหน่งใน Marketplace และสัญญากับ Plugin อื่น

```
req ──▶ design ──┬──▶ mockup
                 ├──▶ dev
                 ├──▶ qa
                 └──▶ deliver
```

### 3.1 Inbound Contract (design ← req)

design plugin **ต้องไม่** ผูกกับไส้ในของ plugin อื่นโดยตรง แต่ผูกกับ **สัญญาที่มี schema และเลขเวอร์ชันกำกับ**

> **แก้เมื่อ 2026-08-20 (เจ้าของเคาะ)** — เดิมหัวข้อนี้ระบุไฟล์แยกกันห้าไฟล์ **ซึ่งไม่มีอยู่จริงสักไฟล์เดียว** `req` v0.3.0 ผลิตของออกมาชิ้นเดียวคือ `<state-dir>/spec.json` โดยเก็บ requirements · glossary · changes เป็น array อยู่ข้างใน ถ้ายึดตามตัวอักษรเดิม `/design:init` จะหยุดทุกโปรเจกต์จริง 100% — ไม่มีทางสำเร็จได้แม้แต่ครั้งเดียว เจตนาเดิมยังอยู่ครบ เพราะ `spec.json` **ไม่ใช่ไส้ใน** มันมี `$id` ประกาศไว้ (`schemas/spec.schema.json`) และมี `meta.schema_version` ตรึงเวอร์ชัน — ไฟล์ที่มี schema และเลขเวอร์ชันคือสัญญา

| ต้นทาง | ส่วนที่อ่าน | ใช้แทนไฟล์ | จำเป็น |
|---|---|---|---|
| `<state-dir>/spec.json` | `requirements[]` | `requirements.json` | บังคับ |
| ↳ ไฟล์เดียวกัน | `glossary[]` | `glossary.json` | บังคับ |
| ↳ ไฟล์เดียวกัน | `changes[]` | `change-set.json` | เมื่อมีการเปลี่ยน |
| **ไม่มีคนผลิต** | — | `stakeholders.json` | ดูข้างล่าง |
| **ไม่มีคนผลิต** | — | `okr.json` | ดูข้างล่าง |

`req` **ไม่มีแนวคิด stakeholder และ OKR เลย** และ design **ห้ามคิดขึ้นเอง** เพราะ §13.3 A4 กับ V23 บังคับว่า role ทุกตัวใน rbac ต้องมาจาก stakeholder ที่ req บันทึกไว้ → การขาดนี้จึงกลายเป็น **error ตอน `/design:rbac`** ไม่ใช่ตอน init · `/design:init` บันทึกไว้เป็น `Q-STAKEHOLDERS` ที่ `blocks: ["rbac"]` ให้แล้ว เพื่อให้เห็นก่อนถึงคำสั่งนั้น ไม่ใช่ไปเจอตอนนั้น

**กติกา:** ถ้าของบังคับไม่ครบหรือผิดรูป → design ต้องหยุดและรายงานว่าขาดอะไร **พร้อมบอกพาธที่มันหา** · **ห้ามเดาแล้วสร้างต่อ**

**รอยต่อ:** มีโมดูลเดียวที่รู้จักรูปร่างนี้คือ `plugins/design/scripts/req-contract.mjs` ถ้าวันหนึ่ง `req` ปล่อยไฟล์แยกห้าไฟล์ออกมาจริง แก้ที่โมดูลนั้นที่เดียว

### 3.2 Outbound Contract (design → downstream)

| ผู้รับ | ไฟล์ที่ต้องอ่านได้ | ใช้ทำอะไร |
|---|---|---|
| `mockup` | `sitemap.json`, `screens.json`, `rbac.json` | สร้าง wireframe และ mockup |
| `dev` | `functions.json`, `datamodel.json`, `interfaces.json`, `statemachines.json`, `screens.json`, `rbac.json` | แตกเป็น tasks.json (ส่วนของภาพและ theme มาจาก mockup plugin) |
| `qa` | `scenarios.json`, `trace.json`, `nfr.json` | สร้าง test case + verify command |
| `deliver` | `trace.json`, `okr.json`, เอกสาร export | ใช้เป็นเกณฑ์ปิดงาน |

### 3.3 กติกาความเข้ากันได้ (Compatibility Rules)

- ทุกไฟล์ JSON มี `schemaVersion` ที่ระดับบนสุด
- เพิ่ม field ได้ (backward compatible) / ลบหรือเปลี่ยนความหมาย field ต้องขึ้น major version
- ทุก object รองรับ field `extensions` (object เปล่า) เพื่อให้ plugin ที่ยังไม่มีในอนาคตแนบข้อมูลของตัวเองได้โดยไม่ต้องแก้ schema กลาง
- Plugin ที่อ่านไฟล์ต้อง **ทนต่อ field ที่ไม่รู้จัก** (ignore unknown fields)

---

## 4. หลักการออกแบบ (Design Principles)

| # | หลักการ | เหตุผล |
|---|---|---|
| P1 | **JSON = สิ่งที่เครื่องต้องตัดสิน / Markdown = ความรู้ที่คนและ AI ต้องอ่าน** | สถานะ, รายการ, mapping, pass/fail → JSON; เหตุผล, บริบท, ADR, บทนำ → Markdown |
| P2 | **Single Source of Truth คือ JSON — เอกสาร Word คือผลลัพธ์ที่ render ออกมา** | ห้ามแก้ข้อความในเอกสาร export แล้วหวังให้ย้อนกลับเข้า spec |
| P3 | **Traceability เป็น first-class citizen ไม่ใช่ของแถม** | ทุก artifact ต้องมี id และ trace ขึ้นไปหา REQ |
| P4 | **Exit condition มาจาก script ไม่ใช่จากการที่ LLM บอกว่าเสร็จแล้ว** | ป้องกัน agent เคลม "เสร็จ" ทั้งที่ยังขาด |
| P5 | **Idempotent** — รันคำสั่งเดิมซ้ำต้องได้ผลเดิม ไม่สร้างของซ้ำ | agent loop รันซ้ำได้ปลอดภัย |
| P6 | **ห้ามเขียนทับสิ่งที่ลูกค้าอนุมัติแล้ว ยกเว้นมี change-set รองรับ** | รักษาความน่าเชื่อถือของเอกสารที่เซ็นแล้ว |
| P7 | **แตกไฟล์ตาม module/bounded context เมื่อโตขึ้น** | ควบคุม context window ของ agent |
| P8 | **หลีกเลี่ยง abstraction ก่อนเวลา** | ยังไม่ต้องมี CLI wrapper / DB จนกว่าไฟล์ธรรมดาจะเอาไม่อยู่ |
| P9 | **ID เป็นภาษาอังกฤษ / เนื้อหาที่ลูกค้าอ่านเป็นภาษาไทย** | spec ใช้ข้ามระบบได้ เอกสารยังอ่านรู้เรื่อง |

---

## 5. Artifact Model

### 5.1 โครงสร้างที่จัดเก็บ

```
.aeon/
├── index.json                     # สารบัญกลางของ marketplace (ทุก plugin เขียนได้)
├── req/
│   ├── requirements.json
│   ├── glossary.json
│   └── change-set.json
├── design/
│   ├── design.state.json          # ← สถานะการทำงาน (machine)
│   ├── modules/
│   │   ├── index.json             # สารบัญ module
│   │   └── <module>/
│   │       ├── functions.json
│   │       ├── screens.json
│   │       ├── statemachines.json
│   │       └── scenarios.json
│   ├── context.json               # ขอบเขต, สมมติฐาน, ข้อจำกัด
│   ├── nfr.json
│   ├── datamodel.json
│   ├── interfaces.json
│   ├── sitemap.json
│   ├── rbac.json
│   ├── trace.json                 # ← RTM ต้นฉบับ
│   └── validation-report.json     # ผลตรวจล่าสุด
├── wiki/                          # ห้องสมุด — แยกตาม "หัวข้อ" ไม่ใช่ตาม plugin
│   ├── wiki-index.json            # ← agent นำทางผ่านไฟล์นี้เท่านั้น
│   ├── domain/
│   │   ├── loan-aggregate.md
│   │   └── borrower.md
│   ├── rules/
│   │   └── RULE-014-credit-limit.md
│   ├── conventions/
│   │   ├── paging-and-search.md
│   │   └── thai-date-format.md
│   ├── integrations/
│   │   └── INT-002-bank-api.md
│   └── adr/
│       └── ADR-007-json-vs-markdown.md
├── docs/                          # แฟ้มงาน — แยกตาม plugin (ของส่งมอบของแต่ละเฟส)
│   ├── req/
│   │   ├── interview-notes-2026-08-10.md
│   │   └── scope-agreement.md
│   └── design/
│       ├── 01-introduction.md
│       ├── 02-system-overview.md
│       └── impact-report-CS-004.md
│   └── SCR-001.html
└── export/
    └── DesignDocument-v3.docx
```

> **แก้เมื่อ 2026-08-20** — ผังนี้วาง `docs/` กับ `wiki/` ไว้ **ข้างใน** ไดเรกทอรีสถานะ ซึ่งไม่ตรงกับที่ marketplace ทำจริง · `req` เขียน `docs/wiki` ที่ **root ของโปรเจกต์** (`plugins/req/scripts/wiki.mjs`: `WIKI_DIR = "docs/wiki"`) ส่วน `.aeon/` เก็บแค่สถานะ — ในโปรเจกต์จริงมีแค่ `spec.json` ไฟล์เดียว
>
> ถ้ายึดผังนี้ตามตัวอักษร เอกสารของ design จะไปอยู่ที่ที่ไม่มี plugin ไหนมอง และ wiki ของโปรเจกต์เดียวจะถูกผ่าเป็นสองต้นที่ไม่รู้จักกัน · ใช้บรรทัดฐานเดียวกับ §3.1: **เมื่อสเปกกับของจริงขัดกัน ให้ตามของจริงแล้วแก้สเปก**
>
> **ผังจริงที่ใช้:** `<state-dir>/design/*.json` สำหรับสถานะและของที่เครื่องอ่าน · `<root>/docs/design/*.md` สำหรับเอกสารของเฟสนี้ · `<root>/docs/wiki/` คือ wiki ของโปรเจกต์ที่ใช้ร่วมกับ `req` โดยแบ่งความเป็นเจ้าของ**รายไฟล์** · ประกาศไว้ที่เดียวใน `plugins/design/scripts/state-dir.mjs` · หลักการของ §5.2 ไม่เปลี่ยน และนั่นคือส่วนที่สำคัญจริง

### 5.2 wiki/ กับ docs/ ต่างกันอย่างไร

หลัก P1 เดิมแบ่ง JSON ออกจาก Markdown — ตรงนี้ต้องแบ่ง Markdown ออกอีกชั้นหนึ่ง

**คำถามตัดสิน: เนื้อหานี้ยังจริงอยู่ไหมหลังเฟสนี้จบ**

| คำตอบ | เก็บที่ | จัดโครงตาม | ตัวอย่าง |
|---|---|---|---|
| ยังจริงอยู่ ข้ามเฟส ข้ามคน | `wiki/` | **หัวข้อ** | domain model, ADR, convention, business rule, integration contract |
| เป็นของที่เฟสนี้ส่งมอบ ผูกกับการอนุมัติของเฟส | `docs/<plugin>/` | **plugin** | บทนำเอกสารออกแบบ, บันทึกสัมภาษณ์, impact report |

**Analogy:** `docs/` คือแฟ้มคดี (ปิดแฟ้มเมื่อจบคดี), `wiki/` คือห้องสมุดกฎหมาย (ไม่มีใครเป็นเจ้าของแฟ้ม ทุกคดีมาหยิบใช้ และอยู่ยาวกว่าคดีไหน ๆ)

### 5.3 กติกา Front-matter

ทุกไฟล์ทั้งใน `wiki/` และ `docs/` ต้องมี front-matter เพื่อให้ agent เชื่อมโยงได้โดยไม่ต้องอ่านทั้งไฟล์:

```yaml
---
id: WIKI-DOMAIN-LOAN          # คงที่ตลอดชีพ — ลิงก์อ้างด้วย id ไม่ใช่ path
type: domain.aggregate
owner: design                  # plugin เดียวที่เขียนไฟล์นี้ได้
contributors: [dev]            # แนบ section ของตัวเองได้ แต่แก้ของ owner ไม่ได้
readers: ["*"]
scope: project                 # project | global
traces: [REQ-012, ENT-003]
status: approved               # draft | in-review | approved | stale | deprecated
version: 3
updated: 2026-08-18
---
```

`wiki-index.json` = สารบัญที่รวม front-matter ทั้งหมด

### 5.4 กฎบังคับ 5 ข้อ

| # | กฎ | เหตุผล |
|---|---|---|
| W1 | **1 ไฟล์ = 1 เจ้าของ — ใช้กับ JSON ด้วย ไม่ใช่แค่ Markdown** ห้ามมีไฟล์ที่สอง plugin เขียน ต่อให้คนละ field ก็ตาม ถ้าเนื้อหาต้องมาจากสองฝ่าย ให้แตกเป็นสองไฟล์แล้ว join ด้วย id | การ regenerate คือการเขียนทับทั้งไฟล์เสมอ — ของฝั่งอื่นจะหายเงียบ ๆ (ดู §19) |
| W2 | **1 ไฟล์ = 1 สิ่งที่ stale ได้อิสระ** — ถ้าไฟล์รวม 5 aggregate ไว้ พอ REQ เดียวเปลี่ยน จะต้องมาร์ค stale ทั้ง 5 แล้ว agent จะไปรื้อของที่ไม่ควรรื้อ | ควบคุมขอบเขตผลกระทบให้แม่น |
| W3 | **อ้างอิง ไม่คัดลอก** — เอกสารเฟสห้าม paste นิยาม domain ลงไปเอง ให้ลิงก์ `[[WIKI-DOMAIN-LOAN]]` แล้ว inline ตอน export | ถ้าปล่อยให้ก๊อป จะเกิดของจริงสองเวอร์ชันภายในสัปดาห์เดียว |
| W4 | **id คงที่ path เปลี่ยนได้** — ลิงก์อ้างด้วย id เสมอ | พอโปรเจกต์โตจะต้องย้ายโฟลเดอร์ ไม่ควรต้องไล่แก้ลิงก์ทั้งระบบ |
| W5 | **โฟลเดอร์มีไว้ให้มนุษย์กับ git — index มีไว้ให้ AI** — agent นำทางผ่าน `wiki-index.json` เท่านั้น ห้ามเดินต้นไม้โฟลเดอร์เอง | ถ้า agent พึ่งโครงโฟลเดอร์ จะย้ายไฟล์ไม่ได้อีกเลย |

**เกณฑ์แตกไฟล์:** เกิน ~300 บรรทัด หรือมีหัวข้อระดับ H2 เกิน 5 อัน

**การบังคับ:** ใช้ pre-commit hook ตรวจว่า plugin ที่ commit ตรงกับ `owner` ในไฟล์นั้นหรือไม่ — บังคับด้วยโครงสร้าง ไม่ใช่ด้วย prompt (P-หลักเดียวกับ §14)

---

## 6. ID Scheme และ Traceability Model

### 6.1 รูปแบบ ID

| Prefix | ความหมาย | ต้นทาง |
|---|---|---|
| `REQ-###` | Requirement | req plugin |
| `FN-###` | Functional Requirement | design |
| `UC-###` | Use Case | design |
| `NFR-###` | Non-Functional Requirement | design |
| `ENT-###` | Entity / Aggregate | design |
| `STM-###` | State Machine | design |
| `SCR-###` | Screen / หน้าจอ | design |
| `API-###` | API Endpoint | design |
| `INT-###` | External Integration | design |
| `RPT-###` | Report / เอกสารพิมพ์ออก | design |
| `SCN-###` | Test Scenario | design |
| ~~`RULE-###`~~ | Business Rule | **เลิกใช้ 2026-08-20 — ให้อ้าง `BR-xxx@vN` ของ req แทน** |
| `ADR-###` | Architecture Decision Record | design |
| `MCK-###` | Mockup / Wireframe | mockup |
| `SRC-###` | ไฟล์ / คลาส / module ที่พัฒนาจริง | dev |
| `TC-###` | Test Case จริง + คำสั่งรัน | qa |

> สาม prefix ล่างสุดต้องนิยามไว้ตั้งแต่ตอนนี้ แม้ยังไม่มี plugin — ถ้ากราฟจบที่ `SCN` การ cascade ของ change จะหยุดที่ design ไม่ไหลต่อไปถึงโค้ดและเทส (ดู §19)

> **`RULE-###` เลิกใช้แล้ว 2026-08-20 (เจ้าของเคาะ)** — บนโปรเจกต์จริงมันไม่มีอะไรให้ตั้งชื่อ เพราะ `req` ครองกฎธุรกิจอยู่แล้วเป็น `BR-xxx@vN` พร้อมข้อความ ตัวอย่าง `test_design` และที่มา และ `REQ.rules[]` ก็ชี้ไปหาอยู่แล้ว
>
> มินต์ id ของ design ขึ้นมาคู่ขนานเมื่อไหร่ = **มีแหล่งความจริงสองที่สำหรับกฎเดียว** ซึ่ง §5.4 W3 ห้ามตรงตัว และสองฝั่งจะเพี้ยนทันทีที่ `/req:change` ดันกฎขึ้น `@v2` เพราะมีแค่ `req` ที่มีเส้นทางเปลี่ยนเวอร์ชัน
>
> เส้น `FN --governedBy--> RULE` ใน §6.2 จึงชี้ไปที่ `BR-xxx@vN` **ตรง ๆ** และ `/design:function` ปฏิเสธการอ้างกฎที่ไม่ใช่ `is_current` (กฎที่ถูกแทนที่แล้วห้ามกำกับหน้าที่)
>
> กฎที่ design เจอเองแต่ `req` ไม่มี **ก็ไม่มินต์ที่นี่เช่นกัน** เพราะ §1.2 ห้าม design เก็บ requirement เอง ให้ส่งกลับผ่าน back-channel §19.3

### 6.2 กราฟความสัมพันธ์ที่ต้องเก็บใน trace

```
REQ ──satisfies──▶ FN ──realizedBy──▶ UC
                    │                  │
                    ├──displayedOn──▶ SCR ──calls──▶ API
                    │                  └──mockedBy──▶ MCK
                    ├──governedBy──▶ RULE
                    ├──operatesOn──▶ ENT ──hasState──▶ STM
                    └──verifiedBy──▶ SCN ──testedBy──▶ TC
                                      │
SCR / API / FN ──implementedBy──▶ SRC ┘
NFR ──verifiedBy──▶ SCN
```

เก็บเป็น edge list เพื่อ query ได้สองทาง — แต่ **แตกไฟล์ตามผู้เขียน** ตามกฎ W1:

```
design/trace.design.json     owner: design   (REQ→FN→SCR→API→SCN)
dev/trace.dev.json           owner: dev      (FN/SCR/API →implementedBy→ SRC)
qa/trace.qa.json             owner: qa       (SCN →testedBy→ TC)
mockup/trace.mockup.json     owner: mockup   (SCR →mockedBy→ MCK)
```

```json
{
  "schemaVersion": "1.0",
  "owner": "design",
  "edges": [
    { "from": "REQ-012", "rel": "satisfiedBy", "to": "FN-004" },
    { "from": "FN-004",  "rel": "displayedOn", "to": "SCR-007" },
    { "from": "SCR-007", "rel": "calls",       "to": "API-021" },
    { "from": "FN-004",  "rel": "verifiedBy",  "to": "SCN-015" }
  ]
}
```

**กติกา:** ทุก plugin **append edge ของตัวเองเท่านั้น ห้ามแตะ edge ของ plugin อื่น**
script รวมทุกไฟล์เป็นกราฟเดียวตอนอ่าน (merged view) — ไม่มีไฟล์กราฟรวมที่เขียนได้

**คำถามที่ระบบต้องตอบได้ทันที (นี่คือ acceptance test ของ traceability):**
1. หน้าจอ SCR-007 มาจาก requirement ข้อไหน
2. FN-004 ต้องเขียน unit test อะไร และ scenario test อะไร
3. ถ้า REQ-012 เปลี่ยน จะกระทบ artifact ใดบ้าง (ทั้งกราฟ)
4. มี requirement ข้อไหนที่ยังไม่มีหน้าจอ / ไม่มี test รองรับ
5. มีหน้าจอไหนที่ไม่ได้มาจาก requirement ใดเลย (scope creep)
6. SCR-007 ตอนนี้พัฒนาแล้วหรือยัง และเทสผ่านหรือยัง (ต้อง join ข้าม design → dev → qa)

---

## 7. รายการคำสั่ง (Commands)

> ชื่อคำสั่งเป็นข้อเสนอ — ผู้เรียนปรับได้ แต่ต้องคง input/output/DoD

### 7.1 ตารางสรุป

| คำสั่ง | หน้าที่ | Input | Output | Definition of Done |
|---|---|---|---|---|
| `/design:init` | ตั้งต้นโครงการ ตรวจ input จาก req | `req/*.json` | `design.state.json`, โครงโฟลเดอร์ | input ครบ, state file ถูกสร้าง |
| `/design:overview` | บทนำ + ภาพรวมระบบ (หัวข้อ 1–2) | requirements, stakeholders, glossary | `context.json`, `wiki/01,02*.md` | มี scope/assumption/constraint ครบ, มี Context Diagram |
| `/design:function` | ความต้องการเชิงหน้าที่ (หัวข้อ 3) | requirements | `functions.json`, `statemachines.json` | ทุก REQ type=functional ถูก map, ทุก UC มี main+alt+exception |
| `/design:nfr` | ความต้องการที่ไม่ใช่เชิงหน้าที่ (หัวข้อ 4) | requirements | `nfr.json` | ทุก NFR มีตัวเลขวัดได้ |
| `/design:datamodel` | ความต้องการด้านข้อมูล (หัวข้อ 5) | functions, glossary | `datamodel.json` | ทุก entity มี attribute+type+required+rule, มี ERD |
| `/design:interface` | Interface ภายนอก + API (หัวข้อ 6) | functions, datamodel | `interfaces.json` | ทุก integration มี protocol/auth/error handling |
| `/design:rbac` | ตารางกำหนดสิทธิ์ (ดู §13) | functions, datamodel, stakeholders, statemachines | `rbac.json` | ผ่าน V23–V27 |
| `/design:sitemap` | ผังหน้าจอทั้งระบบ (หัวข้อ 8) | functions, rbac | `sitemap.json`, `screens.json` | ทุกหน้าจอ trace ถึง FN, มีสิทธิ์การเข้าถึง |
| `/design:scenario` | RTM + Test Scenario (หัวข้อ 7) | ทุกไฟล์ | `scenarios.json`, `trace.json` | ทุก FN/NFR มี ≥1 scenario พร้อมผลลัพธ์คาดหวัง |
| `/design:change` | รับ change จาก req แล้ววิเคราะห์ผลกระทบ | `change-set.json`, `trace.json` | รายการ artifact ที่กลายเป็น `stale` + CHANGELOG | ทุก artifact ที่กระทบถูกทำเครื่องหมาย |
| `/design:trace` | ค้นหา/ตอบคำถาม traceability | `trace.json` | ผลลัพธ์การ query | ตอบคำถาม 5 ข้อใน §6.2 ได้ |
| `/design:check` | ตรวจความครบถ้วนตามกฎ V1–V15 | ทุกไฟล์ | `validation-report.json` | รายงานผ่าน/ไม่ผ่านรายข้อ |
| `/design:status` | บอกความคืบหน้า + สิ่งที่ค้าง | `design.state.json` | สรุปสถานะ + exit code | ให้ผลแบบ deterministic |
| `/design:export` | Render เอกสารสำหรับลูกค้า | ทุกไฟล์ | `.md` / `.docx` | เอกสารครบทุกหัวข้อ §11 |
| `/design:help` | อธิบายคำสั่ง + ลำดับการใช้งาน | — | ข้อความช่วยเหลือ | ระบุลำดับที่แนะนำและ prerequisite |

### 7.2 กติกาที่ทุกคำสั่งต้องปฏิบัติ

1. อ่าน `design.state.json` ก่อนทำงานเสมอ
2. ตรวจ prerequisite — ถ้ายังไม่ได้รัน command ก่อนหน้า ให้แจ้งและหยุด
3. รันซ้ำได้ (idempotent) — update ของเดิม ไม่สร้าง id ใหม่ซ้ำซ้อน
4. เขียนผลลง JSON ก่อน แล้วค่อย render Markdown
5. อัปเดต `trace.json` ทุกครั้งที่สร้าง artifact ใหม่
6. อัปเดต `design.state.json` เมื่อจบ พร้อม timestamp
7. ไม่แก้ artifact ที่ `status = approved` เว้นแต่มี change-set รองรับ

---

## 8. Session Continuity และ Agent Loop

### 8.1 ปัญหาที่ต้องแก้

Agent เริ่ม session ใหม่แล้วไม่รู้ว่าทำอะไรไปแล้ว จึงทำซ้ำ หรือข้ามขั้น

### 8.2 กลไก

**`design.state.json` — สถานะที่เครื่องอ่าน**

```json
{
  "schemaVersion": "1.0",
  "project": "miniloan",
  "phase": "design",
  "steps": [
    {
      "id": "overview",
      "command": "/design:overview",
      "status": "done",
      "requires": ["init"],
      "artifacts": ["context.json", "wiki/design/01-introduction.md"],
      "attempts": 1,
      "updatedAt": "2026-08-18T09:00:00Z"
    },
    {
      "id": "function",
      "command": "/design:function",
      "status": "in_progress",
      "requires": ["overview"],
      "blocked_by": [],
      "attempts": 2
    }
  ],
  "openQuestions": [
    { "id": "Q-003", "text": "ระบบต้องรองรับหลายสกุลเงินหรือไม่", "blocks": ["datamodel"] }
  ]
}
```

**ค่า status ที่อนุญาต:** `pending | in_progress | done | blocked | stale`

**`aeon-status` / `/design:status` — เงื่อนไขออกจากลูป**

- ต้องเป็น script ที่ให้ผลเหมือนเดิมทุกครั้ง ไม่ใช่ให้ LLM ประเมินเอง
- คืน exit code: `0` = ครบทุกขั้น + validation ผ่าน, `1` = ยังมีงานค้าง, `2` = ติด blocker
- output ต้องระบุ **คำสั่งถัดไปที่ควรรัน** เสมอ

**พฤติกรรมเมื่อเปิด session ใหม่:**
1. อ่าน `design.state.json`
2. อ่าน `wiki-index.json` (ไม่ใช่ทุกไฟล์)
3. รายงานให้ผู้ใช้ว่า "ทำถึงขั้นไหน / ค้างอะไร / ควรทำอะไรต่อ"
4. ห้ามเริ่มสร้างงานใหม่จนกว่าจะรายงานสถานะ

**กันลูปไม่รู้จบ:** ถ้า `attempts > 3` ในขั้นเดียวกัน → เปลี่ยนเป็น `blocked` แล้วรอมนุษย์

---

## 9. Change Management (รับการเปลี่ยนจาก req plugin)

### 9.1 Input

`req/change-set.json` ระบุ diff ระดับ requirement:

```json
{
  "changeSetId": "CS-004",
  "date": "2026-08-18",
  "changes": [
    { "reqId": "REQ-012", "type": "modified", "summary": "เพิ่มเงื่อนไขวงเงินสูงสุด", "from": "v2", "to": "v3" },
    { "reqId": "REQ-031", "type": "added" },
    { "reqId": "REQ-008", "type": "removed" }
  ]
}
```

### 9.2 ขั้นตอนที่ `/design:change` ต้องทำ

1. อ่าน change-set
2. เดินกราฟ `trace.json` หา artifact ปลายทางทั้งหมดที่เชื่อมกับ REQ ที่เปลี่ยน (ทุกระดับ ไม่ใช่แค่ชั้นแรก)
3. ทำเครื่องหมาย artifact เหล่านั้นเป็น `status: stale`
4. เขียน **Impact Report** ให้มนุษย์อ่าน — ระบุจำนวนหน้าจอ/API/scenario ที่กระทบ
5. บันทึกลง `CHANGELOG.md` (Markdown) และตาราง Revision History ในเอกสาร export
6. `/design:status` ต้องไม่คืน exit code 0 ตราบใดที่ยังมี artifact `stale` เหลืออยู่

### 9.3 กรณี removed

ไม่ลบ artifact ทิ้งทันที — เปลี่ยนเป็น `status: deprecated` พร้อมเหตุผล เพื่อให้ประวัติการตรวจสอบยังอยู่

---

## 10. Validation Rules — ตัวตรวจความครบถ้วน

> นี่คือแกนของ `/design:check` และเป็นเนื้อหาสอนที่สำคัญที่สุด
> เทียบเคียงได้กับ defect taxonomy ที่ใช้ในฝั่ง req plugin

| ID | กฎ | ระดับ |
|---|---|---|
| V1 | ทุก `REQ` ต้อง map ไปยัง `FN` หรือ `NFR` อย่างน้อย 1 รายการ (ไม่มี requirement กำพร้า) | Error |
| V2 | ทุก `FN` / `SCR` / `API` ต้อง trace กลับถึง `REQ` (ไม่มี scope creep) | Error |
| V3 | ทุก `UC` ต้องมี actor, precondition, main flow, alternate flow, exception flow | Error |
| V4 | ทุก entity ที่มีสถานะ ต้องมี `STM` และทุก state ต้องมีทางออก (ไม่มี dead state) | Error |
| V5 | ทุก `SCR` ต้องระบุ: บทบาทที่เข้าถึงได้, field + validation, action, ปลายทางหลัง action และ **รายการสถานะที่ต้องรองรับ** (ว่าง กำลังโหลด ผิดพลาด ไม่มีสิทธิ์ ข้อความยาวเกิน) | Error |
| V6 | ทุก `FN` และ `NFR` ต้องมี `SCN` อย่างน้อย 1 รายการ พร้อมผลลัพธ์ที่คาดหวังชัดเจน | Error |
| V7 | ทุก attribute ใน datamodel ต้องมี type, required, และกฎ validation | Error |
| V8 | ทุก `INT` ต้องระบุ ทิศทาง, protocol, การยืนยันตัวตน, พฤติกรรมเมื่อปลายทางล่ม | Error |
| V9 | ทุก `NFR` ต้องมีตัวเลขวัดได้ (ห้ามคำว่า "เร็ว" "เสถียร" ลอย ๆ) | Error |
| V10 | ศัพท์ที่ใช้ในทุก artifact ต้องตรงกับ `glossary.json` (Ubiquitous Language) | Warning |
| V11 | ทุก `SCR` ที่แสดง/แก้ข้อมูล ต้องเชื่อมกับ `ENT` และ `API` | Error |
| V12 | ทุก `RULE` ต้องระบุว่าบังคับใช้ที่ชั้นไหน (UI / API / Domain / DB) | Warning |
| V13 | ไม่มี artifact ใดอยู่ในสถานะ `stale` ค้างอยู่ | Error |
| V14 | ไม่มี `openQuestions` ที่ยัง block ขั้นตอนใดอยู่ | Error |
| V15 | ทุกฟิลด์ที่เป็นข้อมูลส่วนบุคคล ต้องมี classification (PDPA) และระบุระยะเวลาเก็บ | Error |
| V16–V22 | *(ย้ายไปอยู่ที่ mockup plugin เป็น MV1–MV7 — หมายเลขนี้สงวนไว้ ห้ามนำกลับมาใช้)* | — |
| V23 | ทุกบทบาทใน `rbac.json` ต้องมาจาก stakeholder ที่ req บันทึกไว้ | Error |
| V24 | ทุก action ที่เปลี่ยนแปลงข้อมูล ต้องมีรายการสิทธิ์กำกับ | Error |
| V25 | ทุกรายการสิทธิ์ต้องระบุ `scope` ห้ามเว้นว่าง | Error |
| V26 | ทุกรายการสิทธิ์ต้องบังคับใช้ที่ชั้น api หรือ domain อย่างน้อยหนึ่งชั้น (ประกาศแค่ ui ไม่ผ่าน) | Error |
| V27 | ต้องไม่มีบทบาทที่ไม่มีหน้าจอหรือ action ใดให้เข้าถึงเลย และไม่มีหน้าจอที่ไม่มีบทบาทใดเข้าถึงได้ | Warning |

**Output ของ `/design:check`** ต้องเป็น JSON ที่ระบุรายข้อ: `ruleId`, `pass`, `violations[]` (พร้อม id ของ artifact ที่ผิด) เพื่อให้ agent แก้ได้ตรงจุดโดยไม่ต้องอ่านทั้งโปรเจกต์

---

## 11. โครงเอกสารสำหรับมนุษย์ (Export Structure)

| # | หัวข้อ | เนื้อหา | Diagram | สร้างจาก |
|---|---|---|---|---|
| — | ปกและตารางแก้ไข (Revision History) | เวอร์ชัน, วันที่, ผู้อนุมัติ | — | state + changelog |
| 1 | บทนำ | วัตถุประสงค์, ขอบเขต, เอกสารอ้างอิง | — | context.json |
| 1.4 | อภิธานศัพท์ | ตารางศัพท์ | — | glossary.json |
| 2 | ภาพรวมระบบ | มุมมองผลิตภัณฑ์, ผู้ใช้, ข้อจำกัด, สมมติฐาน | System Context Diagram (DFD Level 0), Process Flow As-Is / To-Be, Stakeholder Map | context.json |
| 3 | ความต้องการเชิงหน้าที่ | รายการฟังก์ชันแยกตามโมดูล | Use Case Diagram, Use Case Description, Activity Diagram, DFD L1–2, State Diagram | functions.json, statemachines.json |
| 4 | ความต้องการที่ไม่ใช่เชิงหน้าที่ | Performance, Security, Availability, Usability, PDPA | ตาราง + Workload Chart | nfr.json |
| 5 | ความต้องการด้านข้อมูล | ข้อมูลหลัก, ปริมาณ, การเก็บรักษา | Conceptual ERD, Data Dictionary | datamodel.json |
| 6 | ความต้องการด้าน Interface | หน้าจอ, ระบบภายนอก, ฮาร์ดแวร์ | Integration Diagram, ตาราง API | interfaces.json, screens.json |
| 6.5 | ตารางกำหนดสิทธิ์ | บทบาท × หน้าจอ × การกระทำ × ขอบเขตข้อมูล | ตาราง | rbac.json |
| 7 | ตารางสอบทานความต้องการ | RTM | ตาราง mapping | trace.json |
| 8 | ผังหน้าจอ | รายการหน้าจอทั้งระบบ | Sitemap Tree | sitemap.json |
| 9 | Wireframe / Mockup | แนบจาก mockup plugin ถ้ามี | — | mockup plugin |
| 10 | สถาปัตยกรรมการตัดสินใจ (ภาคผนวก) | ADR ที่เกี่ยวข้อง | — | wiki/adr/ |

### 11.1 กติกาการสร้าง Diagram

| Diagram | สร้างจาก | วิธี |
|---|---|---|
| ERD | datamodel.json | generate อัตโนมัติ (Mermaid `erDiagram`) |
| State Diagram | statemachines.json | generate อัตโนมัติ (Mermaid `stateDiagram-v2`) |
| Use Case Diagram | functions.json | generate อัตโนมัติ |
| Sitemap Tree | sitemap.json | generate อัตโนมัติ |
| Sequence / Integration | interfaces.json | generate อัตโนมัติ |
| Context Diagram (DFD 0) | context.json | generate อัตโนมัติ (Mermaid `flowchart`) · **ปรับแก้ที่ `context.json` เท่านั้น ห้ามแก้ไฟล์ที่ render ออกมา** — ดูข้างล่าง |
| Process Flow As-Is / To-Be | เขียนเอง | Mermaid swimlane (`flowchart` + `subgraph`) เก็บใน `wiki/` — **D6 เคาะแล้ว 2026-08-20** |

> **แก้เมื่อ 2026-08-20 (เจ้าของเคาะ)** — แถวนี้เดิมเขียนว่า "generate + ให้มนุษย์ปรับ" ซึ่ง **ขัดกับ CLAUDE.md §7 กติกา 1** ที่ห้ามแก้เอกสารที่ generate ด้วยมือ และห้ามมี marker block "แก้ตรงนี้ได้" · เหตุผลของกติกานั้นเฉพาะเจาะจงมาก: สุดท้ายจะมีคนแก้ **นอก** marker แล้ว regenerate รอบถัดไปกินทิ้งเงียบ ๆ พังครั้งเดียวทั้งทีมเลิกเชื่อ regeneration ตลอดไป
>
> ทั้งสองกติกาอยู่ด้วยกันได้ถ้าการปรับแก้เกิด **ที่ต้นน้ำ** คือแก้ `context.json` แล้ว render ใหม่ · แบบนี้ยังรักษา P2 ไว้ครบ (JSON คือความจริง เอกสารเป็นแค่ภาพฉาย) · ทุกไฟล์ที่ `scripts/context.mjs` เขียนออกมามีหัวเตือนข้อนี้ติดอยู่ในตัวไฟล์

**D6 เคาะแล้ว: Mermaid swimlane เก็บใน `wiki/`** — Mermaid ไม่รองรับ BPMN โดยตรง จึงใช้ `flowchart` ที่มี `subgraph` หนึ่งอันต่อหนึ่ง lane แทน pool-and-lane · แลกกันโดยรู้ตัว: ได้ notation ที่ไม่เต็มมาตรฐาน BPMN (ไม่มี gateway / event ตามมาตรฐาน) แต่ไดอะแกรมอยู่ในgit ดู diff ได้เหมือนข้อความ และเปิดอ่านได้โดยไม่ต้องมีเครื่องมือนอก · ที่ไม่เลือกแนบไฟล์ `.bpmn` จากภายนอกก็ด้วยเหตุผลกลับกัน — diff ไม่ได้ ต้องมีเครื่องมือถึงจะเปิด และไฟล์ไบนารีที่หลุดจากสเปกจะหลุดโดยไม่มีด่านไหนจับได้

เก็บใน `wiki/` ไม่ใช่ `docs/design/` เพราะผังกระบวนการยังจริงอยู่หลังเฟสนี้จบ (§5.2)

### 11.2 ความสัมพันธ์ระหว่างเอกสารกับ Spec

```
JSON (source of truth) ──render──▶ Markdown ──convert──▶ .docx สำหรับลูกค้า
Wiki Markdown (narrative) ──include──▶ ┘
```

- ส่วนที่เป็นรายการ/ตาราง → render จาก JSON เสมอ
- ส่วนที่เป็นเรียงความ (บทนำ, เหตุผล, ADR) → เขียนใน wiki markdown แล้ว include เข้ามา
- **ห้าม** แก้ไฟล์ export โดยตรง — ถ้าแก้ จะถูกทับในรอบถัดไป

---

## 12. ขอบเขตกับ Mockup Plugin

Wireframe, theme, handoff และ mockup **ไม่ใช่ความรับผิดชอบของ design plugin** — แยกออกเป็น mockup plugin ต่างหาก (ดู Mockup Plugin Requirement Specification)

### 12.1 เส้นแบ่งความรับผิดชอบ

| design เป็นเจ้าของ | mockup เป็นเจ้าของ |
|---|---|
| ผังหน้าจอ (sitemap) | wireframe ของแต่ละหน้า |
| รายละเอียดหน้าจอ — ฟิลด์ กฎตรวจสอบ action ปลายทาง | mockup HTML |
| สิทธิ์การเข้าถึงรายหน้าและราย action | theme token และ component inventory |
| **รายการสถานะที่หน้านั้นต้องรองรับ** (ว่าง กำลังโหลด ผิดพลาด ไม่มีสิทธิ์ ข้อความยาวเกิน) | การนำเข้า handoff และการเสนอ prompt สร้าง theme |
| กฎธุรกิจและผังสถานะที่หน้านั้นอ้างถึง | ชุดส่งมอบภาพให้ dev |

**เหตุผลที่รายการสถานะอยู่ฝั่ง design:** มันเป็นข้อกำหนดเชิงพฤติกรรม ไม่ใช่เรื่องภาพ dev ต้องทำและ qa ต้องทดสอบ ไม่ว่าโปรเจกต์นั้นจะมี mockup หรือไม่

### 12.2 สิ่งที่ design ต้องส่งให้ mockup

`sitemap.json`, `screens.json`, `rbac.json` และ trace ของ design

ถ้าหน้าจอใดยังไม่ผ่าน V5 (ขาดฟิลด์ ขาด action ขาดสิทธิ์) mockup plugin **ต้องไม่สร้างหน้านั้น** — ต้องส่งคำถามกลับผ่าน back-channel

### 12.3 สิ่งที่ design ต้องไม่ทำ

- ไม่กำหนดสี ฟอนต์ หรือค่าสไตล์ใด ๆ
- ไม่สร้างไฟล์ HTML หรือ wireframe
- ไม่นำเข้า handoff
- ไม่เขียนลงพื้นที่ของ mockup plugin

ถ้าผู้ใช้ขอ mockup ระหว่างใช้ design plugin ให้ชี้ไปที่ mockup plugin ไม่ใช่สร้างเอง

---

## 13. Authorization Model — ตารางกำหนดสิทธิ์

### 13.1 ทำไมตารางสองมิติไม่พอ

ตารางแบบ บทบาท × หน้าจอ × การกระทำ ที่คนทำกันทั่วไป จะพังทันทีที่เจองานองค์กรจริง เพราะขาดสี่มิติที่สำคัญกว่า

**Analogy:** บัตรพนักงานที่เปิดประตูได้ ไม่ได้บอกแค่ว่า "เปิดได้/ไม่ได้" — มันต้องบอกด้วยว่าเปิดได้ตึกไหน (ขอบเขต) เปิดได้ช่วงเวลาไหน (เงื่อนไข) เห็นอะไรในห้องนั้นได้บ้าง (ระดับฟิลด์) และถ้าเจ้าตัวลา ใครถือบัตรแทนได้ (การมอบอำนาจ)

| มิติ | คำถามที่ต้องตอบ | ถ้าไม่มีจะเกิดอะไร |
|---|---|---|
| **ขอบเขตข้อมูล (scope)** | อนุมัติได้ *ของใคร* — ทั้งหมด / เฉพาะสาขาตัวเอง / เฉพาะทีม / เฉพาะที่ตัวเองสร้าง | dev เดาเองไม่ได้ ต้องกลับมาถาม หรือทำผิดแล้วรื้อทั้ง query layer |
| **เงื่อนไขตามสถานะ** | แก้ได้เฉพาะตอนสถานะไหน ยกเลิกได้ก่อนขั้นตอนไหน | dev ทำ CRUD ธรรมดา แล้วมาแก้ทีหลังทุกหน้าจอ |
| **ระดับฟิลด์** | ฟิลด์ไหนที่บางบทบาทเห็นไม่ได้ (เงินเดือน เลขบัตรประชาชน) | ข้อมูลส่วนบุคคลรั่วผ่านหน้าจอที่ "เข้าได้อยู่แล้ว" |
| **การรักษาการ / มอบอำนาจ** | ใครทำแทนใครได้ ในช่วงเวลาไหน | มีเกือบทุกงานองค์กรไทย และไม่เคยอยู่ใน requirement ตั้งต้น |

### 13.2 โครงสร้างที่ต้องเก็บ

```json
{
  "schemaVersion": "1.0",
  "defaultEffect": "deny",
  "roles": [
    { "id": "ROLE-approver", "label": "ผู้อนุมัติ", "trace": ["REQ-005"], "inherits": ["ROLE-staff"] }
  ],
  "entries": [
    {
      "id": "ACL-018",
      "role": "ROLE-approver",
      "resource": "SCR-007",
      "action": "approve",
      "scope": "own-branch",
      "condition": { "state": ["submitted"] },
      "enforceAt": ["api", "domain"],
      "trace": ["REQ-012", "FN-004", "STM-002"]
    }
  ],
  "fieldRules": [
    { "entity": "ENT-003", "field": "salary", "visibleTo": ["ROLE-hr"], "classification": "sensitive" }
  ],
  "delegation": { "enabled": true, "scopeInheritance": "delegator" }
}
```

### 13.3 กฎบังคับ

| # | กฎ | เหตุผล |
|---|---|---|
| A1 | **ค่าเริ่มต้นต้องเป็นปฏิเสธ** — สิ่งที่ไม่ได้ประกาศไว้คือห้าม | ถ้าเริ่มจากอนุญาต ช่องโหว่จะเงียบ ไม่มีใครเห็นจนกว่าจะโดน |
| A2 | ทุกรายการต้องระบุ `scope` เสมอ ห้ามเว้นว่าง | ค่าว่างจะถูกตีความเป็น "ทั้งหมด" โดยอัตโนมัติ ซึ่งเป็นค่าที่อันตรายที่สุด |
| A3 | ทุกรายการต้องระบุชั้นที่บังคับใช้ และ **ต้องมี `api` หรือ `domain` อย่างน้อยหนึ่งชั้นเสมอ** | ประกาศแค่ `ui` = ซ่อนปุ่ม ไม่ใช่การคุมสิทธิ์ (เชื่อกับ V12 และ DV16) |
| A4 | บทบาทต้องมาจาก stakeholder จริงที่ req บันทึกไว้ | บทบาทที่คิดขึ้นเองตอนออกแบบ ไม่มีใครในองค์กรลูกค้าเป็นเจ้าของ |
| A5 | สิทธิ์ที่ผูกกับสถานะ ต้องอ้าง state ที่มีอยู่จริงใน `STM` | กันการเขียนเงื่อนไขที่ไปไม่ถึง |
| A6 | ฟิลด์ที่มี classification เป็นข้อมูลส่วนบุคคล ต้องมี `fieldRules` รองรับ | ต่อกับ V15 โดยตรง |

### 13.4 ลำดับการทำงาน

`/design:rbac` ต้องรัน **หลัง** `function` และ `datamodel` (ต้องรู้ก่อนว่ามี action อะไรและ entity อะไร) และ **ก่อน** `sitemap` (เพราะผังหน้าจอต้องรู้ว่าใครเข้าถึงได้)

ถ้ายังไม่มี `rbac.json` คำสั่ง `sitemap` ต้องหยุดและแจ้ง ไม่ใช่สร้างหน้าจอที่ไม่มีสิทธิ์กำกับ

### 13.5 การส่งต่อ

| ผู้รับ | ใช้ทำอะไร |
|---|---|
| `dev` | บังคับ authorization ที่ชั้น api/domain ตามที่ `enforceAt` ระบุ และแปล `scope` เป็นเงื่อนไขใน query |
| `qa` | สร้างเทสทั้งทางบวกและทางลบทุกบทบาท (QV6) และเทสข้าม scope เช่น ผู้จัดการสาขา A เรียกข้อมูลสาขา B |
| ลูกค้า | ตรวจและเซ็นรับตารางสิทธิ์ — เป็นเอกสารที่ลูกค้าต้องอนุมัติ ไม่ใช่ของภายในทีม |

**ข้อที่มักถูกลืม:** ตารางสิทธิ์เป็นสิ่งที่ลูกค้าต้องเซ็นรับ เพราะเป็นเรื่องอำนาจในองค์กร ไม่ใช่เรื่องเทคนิค ถ้าไม่เอาเข้าเอกสารส่งลูกค้า จะไปเถียงกันตอน UAT ว่าใครควรอนุมัติได้

---

## 14. รองรับ Plugin ที่ยังไม่ได้สร้าง

| กลไก | รายละเอียด |
|---|---|
| Schema versioning | ทุกไฟล์มี `schemaVersion` |
| Extension point | ทุก object มี `extensions: {}` ให้ plugin ใหม่แนบข้อมูลได้ |
| Capability declaration | `index.json` ระดับ marketplace ประกาศว่า plugin ใดผลิต/บริโภคไฟล์ใด |
| Read-only contract | plugin ปลายน้ำอ่าน artifact ของ design ได้ แต่เขียนกลับได้เฉพาะ field ที่ระบุไว้ (เช่น qa เขียนได้เฉพาะ `verify` และ `passes`) |
| Structural enforcement | ใช้ pre-commit hook / validation script บังคับ ไม่พึ่ง prompt |
| Wiki เป็นชั้นความจำร่วม | ทุก plugin อ่าน `wiki/` ได้ แต่เขียนได้เฉพาะไฟล์ที่ตัวเองเป็น `owner` (ไม่ใช่แบ่งตามโฟลเดอร์) |
| Wiki สองชั้น | Project wiki (`.aeon/wiki/`) กับ Global wiki (LLMWIKI ส่วนกลางที่ใช้ข้ามโปรเจกต์) |

### 14.1 Wiki สองชั้น

| ชั้น | ขอบเขต | ตัวอย่าง | สิทธิ์เขียนของ agent |
|---|---|---|---|
| Project wiki | `.aeon/wiki/` ในโปรเจกต์ | domain model ของโปรเจกต์นี้, ADR เฉพาะงาน | เขียนได้ตาม `owner` |
| Global wiki | LLMWIKI ส่วนกลาง ใช้ข้ามโปรเจกต์ | pattern การทำ audit trail, convention การตั้งชื่อ API, ADR ที่ใช้ซ้ำได้ | **อ่านอย่างเดียว** เขียนได้เฉพาะเมื่อมนุษย์สั่งชัดเจน |

เหตุผลที่ห้าม agent เขียน global เอง: ความรู้เฉพาะโปรเจกต์จะรั่วไปปนกับความรู้กลาง แล้วโปรเจกต์ถัดไปจะได้คำแนะนำที่ผิดบริบทโดยไม่มีใครรู้ตัว

---

## 15. Non-Functional Requirement ของตัว Plugin เอง

| ID | ข้อกำหนด | เกณฑ์ |
|---|---|---|
| PNFR-1 | ไม่พึ่งพา external API ที่มีค่าใช้จ่ายเพิ่มนอกเหนือจาก Claude | ต้องรันได้ด้วยไฟล์ + script ธรรมดา |
| PNFR-2 | ไม่พึ่งพา infrastructure พิเศษ (ไม่ใช้ graph DB / server) | ทำงานได้บนเครื่องผู้เรียนที่มีแค่ Claude Code |
| PNFR-3 | ควบคุม context — ไม่โหลดทุกไฟล์เข้ามาพร้อมกัน | อ่านผ่าน index ก่อนเสมอ |
| PNFR-4 | สอนได้ — ผู้เรียนเข้าใจโครงสร้างได้ภายใน 1 ชั่วโมง | มี `/design:help` ที่อธิบายลำดับงาน |
| PNFR-5 | ทำงานได้ทั้งภาษาไทยและอังกฤษ | ID เป็นอังกฤษ, เนื้อหาลูกค้าเป็นไทย |
| PNFR-6 | ผลลัพธ์ตรวจสอบได้โดยไม่ต้องเชื่อ LLM | ทุก DoD ผูกกับ script |

---

## 16. ช่องว่างที่ยังต้องตัดสินใจ (Open Decisions)

> ส่วนนี้คือผลการตรวจความครบถ้วน — ข้อที่ต้นฉบับยังไม่ได้ระบุ

| ID | ประเด็น | ทำไมสำคัญ | ข้อเสนอ |
|---|---|---|---|
| D1 | **RBAC / ตารางสิทธิ์** | ~~ยังไม่ตัดสินใจ~~ | **ตัดสินใจแล้ว** → ดู §13: ต้องมีสี่มิติ (ขอบเขตข้อมูล เงื่อนไขตามสถานะ ระดับฟิลด์ การมอบอำนาจ), ค่าเริ่มต้นปฏิเสธ, บังคับที่ api/domain, และเข้าเอกสารส่งลูกค้า |
| D2 | **รายงานและเอกสารพิมพ์ออก (RPT)** | งานองค์กรไทยเกือบทุกงานมี ถ้าไม่ระบุจะตกหล่นเสมอ | เพิ่ม artifact type `RPT-###` ในหัวข้อ 6 |
| D3 | **Master data / ตารางรหัส (dropdown)** | เป็นสาเหตุอันดับต้นของ rework ตอน dev | เพิ่มส่วนใน `datamodel.json` |
| D4 | **Error catalogue / รหัสข้อผิดพลาด** | ใช้ร่วมกันระหว่าง API, UI copy, และ test | เพิ่ม `errors.json` |
| D5 | **การแจ้งเตือน (Email / LINE / Push)** | เป็น requirement ที่ลูกค้าถือว่ามีอยู่แล้ว แต่ไม่เคยเขียน | เพิ่มเป็นหมวดใน `interfaces.json` |
| D6 | **BPMN As-Is / To-Be เก็บอย่างไร** | ~~ยังไม่เคาะ~~ | **เคาะแล้ว 2026-08-20** → §11.1: Mermaid swimlane (`flowchart` + `subgraph`) เก็บใน `wiki/` · ไม่เอาไฟล์ `.bpmn` จากภายนอก — diff ไม่ได้ ต้องมีเครื่องมือถึงเปิดได้ และหลุดจากสเปกโดยไม่มีด่านไหนจับได้ |
| D7 | **ช่องทาง (surface) — web / mobile / api** | ต้นฉบับพูดถึง sitemap ของเว็บอย่างเดียว | เพิ่ม field `surface` ใน `screens.json` แทนที่จะแยกไฟล์ |
| D8 | **การอนุมัติของลูกค้าเก็บที่ไหน** | เป็น gate สำคัญของเฟส และเป็นหลักฐานตอนส่งมอบ | เพิ่ม `approvals.json` (ใครอนุมัติ, เวอร์ชันไหน, เมื่อไร) |
| D9 | **Data migration จากระบบเดิม** | มักโผล่ตอนใกล้ส่งมอบ | เพิ่มหัวข้อในความต้องการด้านข้อมูล |
| D10 | **Convention กลาง** (paging, search, sort, upload, timezone, สกุลเงิน, format วันที่แบบไทย) | ถ้าไม่กำหนดกลาง จะต้องเขียนซ้ำทุกหน้าจอ | เพิ่ม `conventions.md` ใน wiki แล้วอ้างอิงแทนการเขียนซ้ำ |
| D11 | **Audit trail + PDPA field classification** | V15 บังคับแล้ว แต่ต้องระบุที่เก็บ | เพิ่ม field `classification` และ `retention` ในทุก attribute |
| D12 | **Invariant ของ Aggregate (DDD) เก็บตรงไหน** | เป็นข้อมูลที่ dev ต้องใช้ที่สุด แต่ไม่มีที่อยู่ในโครงเดิม | เก็บใน `datamodel.json` ระดับ aggregate + `RULE-###` |
| D13 | **เกณฑ์แตกไฟล์ตาม module เมื่อไร** | ถ้าแตกเร็วไปจะยุ่งยาก ช้าไปจะเกิน context | เสนอเกณฑ์: เกิน ~30 FN หรือไฟล์เกิน ~1500 บรรทัด |
| D14 | **ภาษาของ spec** | เอกสารลูกค้าเป็นไทย แต่ AI ทำงานกับอังกฤษได้ดีกว่า | เสนอ: `id`/`key` อังกฤษ, `label`/`description` ไทย, มีทั้งคู่ในไฟล์เดียว |
| D15 | **Test data / fixture** | qa ต้องใช้ แต่ design ยังไม่ผลิต | ตัดสินใจว่าเป็นหน้าที่ design (ระบุตัวอย่างข้อมูล) หรือ qa (สร้างเอง) |
| D16 | **คำถามที่ตอบไม่ได้ ส่งกลับ req อย่างไร** | ปัจจุบันมีแค่ `openQuestions` ค้างไว้ | ต้องมีช่องทางส่งกลับเป็น `question-set.json` ให้ req รับไปถามลูกค้า |
| D18–D22 | *(ย้ายไปอยู่ที่ mockup plugin เป็น MD1–MD5)* | — | — |
| D17 | **Wiki Layout & Ownership** | ~~ยังไม่ตัดสินใจ~~ | **ตัดสินใจแล้ว** → ดู §5.2–5.4 และ §14.1: `wiki/` แยกตามหัวข้อ + `docs/<plugin>/` แยกตามเฟส, เจ้าของกำหนดด้วย front-matter `owner` ไม่ใช่ด้วยโฟลเดอร์, บังคับด้วย pre-commit hook |

---

## 17. ลำดับการสร้าง (แนะนำสำหรับผู้เรียน)

> อย่าพยายามทำครบทุกคำสั่งในรอบเดียว

**Milestone 1 — โครงกระดูก (ต้องได้ก่อน)**
`init` → `overview` → `function` → `status`
เป้าหมาย: พิสูจน์ว่า state file + prerequisite + traceability ทำงานจริง

**Milestone 2 — ความครบถ้วน**
`datamodel` → `scenario` → `check`
เป้าหมาย: พิสูจน์ว่า validation rule จับของที่ขาดได้จริง

**Milestone 3 — ส่งมอบ**
`sitemap` → `interface` → `nfr` → `export`
เป้าหมาย: ได้เอกสารที่เอาไปให้ลูกค้าอ่านได้จริง

**Milestone 4 — สิทธิ์และการเปลี่ยนแปลง**
`rbac` → `change` → `trace`
*(งานภาพทั้งหมดอยู่ที่ mockup plugin)*

---

## 18. Acceptance Checklist สำหรับตรวจงานผู้เรียน

ผู้เรียนต้องสาธิตให้ดูได้ว่า:

- [ ] เปิด session ใหม่ แล้วสั่ง `/design:status` — agent บอกได้ว่าทำถึงไหน ค้างอะไร ควรทำอะไรต่อ
- [ ] ลบ `requirements.json` แล้วสั่ง `/design:function` — plugin หยุดและรายงาน ไม่เดาสร้างต่อ
- [ ] ถามว่า "SCR-007 มาจาก requirement ไหน" — ตอบได้จาก `trace.json` ไม่ใช่จากการเดา
- [ ] สร้างหน้าจอที่ไม่ trace กลับ REQ ใด แล้วสั่ง `/design:check` — V2 ต้อง fail
- [ ] เขียน NFR ว่า "ระบบต้องเร็ว" แล้วสั่ง `/design:check` — V9 ต้อง fail
- [ ] ป้อน `change-set.json` ที่แก้ REQ หนึ่งข้อ — ระบบระบุ artifact ที่กระทบครบทั้งกราฟ และ `/design:status` ไม่คืน 0
- [ ] รันคำสั่งเดิมซ้ำสองครั้ง — ไม่เกิด id ซ้ำ ไม่เกิดข้อมูลซ้ำ
- [ ] `/design:export` — ได้เอกสารครบทุกหัวข้อใน §11 พร้อม RTM
- [ ] แก้ข้อความในไฟล์ export แล้วรัน export ใหม่ — ข้อความที่แก้หายไป (พิสูจน์ว่า JSON คือ source of truth)
- [ ] อธิบายได้ว่าไฟล์ไหนเป็น JSON ไฟล์ไหนเป็น Markdown และ **เพราะอะไร**
- [ ] อธิบายได้ว่าไฟล์ไหนควรอยู่ `wiki/` ไฟล์ไหนควรอยู่ `docs/design/` และ **เพราะอะไร**
- [ ] ลองให้ agent แก้ไฟล์ที่ `owner` ไม่ใช่ design — pre-commit hook ต้องปฏิเสธ
- [ ] ย้ายไฟล์ wiki ไปอีกโฟลเดอร์แล้วอัปเดต index — ลิงก์จากเอกสารอื่นยังใช้ได้ (พิสูจน์ว่าอ้างด้วย id ไม่ใช่ path)
- [ ] สั่ง `sitemap` ก่อนทำ `rbac` — ต้องหยุดและแจ้ง ไม่สร้างหน้าจอที่ไม่มีสิทธิ์กำกับ
- [ ] เขียนรายการสิทธิ์โดยไม่ใส่ `scope` — V25 ต้อง fail
- [ ] เขียนรายการสิทธิ์ที่บังคับใช้แค่ชั้น ui — V26 ต้อง fail
- [ ] ถามว่าบทบาทนี้ทำอะไรได้บ้าง และเห็นข้อมูลของใครบ้าง — ตอบได้ครบทั้งสี่มิติ

### 18.1 Cold Start Test — บททดสอบสำคัญที่สุด

> ปิด session ทั้งหมด เปิดใหม่โดยมีแค่ไฟล์ในดิสก์ ไม่มีประวัติแชท แล้วถาม 5 คำถาม

| # | คำถาม | ต้องตอบจาก | ถ้าตอบไม่ได้ = รอยรั่ว |
|---|---|---|---|
| 1 | โปรเจกต์นี้ทำถึงไหน ค้างอะไร | `design.state.json` | L4 |
| 2 | `SCR-007` มาจาก requirement ไหน พัฒนาแล้วหรือยัง เทสผ่านหรือยัง | merged trace ข้าม 3 plugin | L1, L2 |
| 3 | ทำไมถึงเลือกออกแบบแบบนี้ | ADR ใน `wiki/adr/` | L4 |
| 4 | ถ้าแก้ `REQ-012` ตอนนี้ กระทบอะไรบ้าง | กราฟถึงระดับ SRC/TC | L2 |
| 5 | มีคำถามอะไรค้างที่ต้องถามลูกค้า | `journal/questions.jsonl` | L3 |

**ตอบครบ 5 ข้อ = เนื้อหาไม่หายจริง** ตอบไม่ได้ข้อไหน ให้ไล่กลับไปดูรอยรั่วที่ระบุใน §19.1

---

## 19. Cross-Plugin Continuity — ทำงานต่อเนื่องโดยเนื้อหาไม่หาย

**Analogy:** เหมือนการผลัดเวรพยาบาล คนไข้ไม่หายไปไหน เวชระเบียนก็อยู่ครบ แต่สิ่งที่หายทุกครั้งคือ *สิ่งที่เวรก่อนสังเกตเห็นแล้วไม่ได้จด*
ระบบส่งต่อที่ดีไม่ได้แปลว่าข้อมูลไม่หาย — มันแปลว่าเราบังคับให้จดก่อนออกเวรได้แค่ไหน

### 19.1 รอยรั่ว 5 จุดที่ต้องอุด

| ID | รอยรั่ว | อาการ | กลไกที่อุด |
|---|---|---|---|
| L1 | สอง plugin เขียนไฟล์เดียวกัน | `qa` เขียนผลลง scenario ที่ `design` เป็นเจ้าของ → design รัน regenerate → **ผลเทสหายทั้งชุดแบบเงียบ** | W1 ขยายให้ครอบ JSON + แยกไฟล์ตามผู้เขียน (§19.2) |
| L2 | กราฟ trace ขาดตอนที่ design | ตอบไม่ได้ว่าโค้ดไฟล์ไหนมาจาก requirement ไหน / change ไม่ cascade ถึง dev-qa | เพิ่ม node `SRC` `TC` `MCK` (§6.1) |
| L3 | ทางเดียว ไม่มีทางกลับ | `dev` พบว่า spec ทำไม่ได้จริง ตัดสินใจอะไรบางอย่าง แล้วความรู้นั้นตายใน session | Back-channel append-only (§19.3) |
| L4 | ของที่เกิดในบทสนทนา | User พิมพ์ว่า "เอาแบบนี้แหละ" agent เข้าใจแต่ไม่ persist → หายทันทีที่ปิด session | กฎ Persist-before-answer (§19.4) |
| L5 | มนุษย์แก้ artifact ที่ generate ได้ | แก้ mockup HTML เอง รอบหน้า regenerate ทับ | ประกาศ generated artifact + header เตือนในไฟล์ |

> L4 คือสาเหตุการสูญหายที่พบบ่อยที่สุดในทางปฏิบัติ และเป็นตัวที่ prompt คุมยากที่สุด

### 19.2 แยกไฟล์ตามผู้เขียน แล้ว join ด้วย id

```
design/scenarios.json           owner: design   ← นิยาม SCN
qa/scenario-results.json        owner: qa       ← ผล pass/fail + คำสั่ง verify
dev/implementation-map.json     owner: dev      ← FN/SCR/API → ไฟล์โค้ดจริง
mockup/mockup-map.json          owner: mockup   ← SCR → ไฟล์ mockup
```

**กฎ:** ห้ามมีไฟล์ JSON ที่สอง plugin เขียน **ต่อให้คนละ field ก็ตาม** เพราะการ regenerate เป็นการเขียนทั้งไฟล์เสมอ

ถ้าเลี่ยงไม่ได้จริง ๆ ค่อยใช้ pre-commit hook คุมระดับ field (อนุญาตให้ qa แก้ได้เฉพาะ `passes`) — แต่ **แยกไฟล์ถูกกว่าและง่ายกว่า** ให้เป็นทางเลือกสุดท้าย

### 19.3 Back-channel แบบ append-only

```
.aeon/journal/
├── decisions.jsonl     # ทุก plugin append ได้ ห้ามลบ ห้ามแก้บรรทัดเดิม
└── questions.jsonl     # คำถามที่ตอบไม่ได้ ส่งกลับต้นน้ำ
```

```jsonl
{"ts":"2026-08-18T10:22:00Z","by":"dev","type":"decision","refs":["FN-004"],"text":"spec ระบุให้คำนวณ realtime แต่ข้อมูลมาแบบ batch จึงคำนวณตอน import แทน","impact":"NFR-002 ต้องทบทวน"}
{"ts":"2026-08-18T10:25:00Z","by":"dev","type":"question","refs":["REQ-012"],"text":"วงเงินสูงสุดนับรวมสัญญาที่ปิดแล้วหรือไม่","blocks":["FN-004"]}
```

ใช้ `.jsonl` เพราะ append ไม่มีทางทับของเดิม และ merge conflict แทบไม่เกิด

**การไหลกลับ:** `questions.jsonl` ที่ `by != req` ต้องถูก `/req:*` หยิบไปถามลูกค้า และ `/design:status` ต้องไม่คืน exit 0 ตราบใดที่ยังมี question ที่มี `blocks` ค้างอยู่

### 19.4 กฎ Persist-before-answer

> agent ห้ามตอบผู้ใช้ว่า "รับทราบ / เข้าใจแล้ว / จะทำตามนั้น" ถ้ายังไม่ได้เขียนลงไฟล์ก่อน

ต้องเป็น **DoD ของทุกคำสั่ง** ไม่ใช่คำแนะนำใน prompt — เพราะเป็นพฤติกรรมที่ LLM ละเมิดเองโดยธรรมชาติ

### 19.5 สิ่งที่จะหายอยู่ดี — ยอมรับและจัดการ

น้ำเสียงและบริบทในบทสนทนา เช่น "ลูกค้าคนนี้แคร์ความเร็วมากกว่าความสวย" — ถ้าไม่ถูกแปลงเป็น `NFR` ที่วัดได้ หรือ `ADR` ที่มีเหตุผล มันหายแน่นอน

**ทางแก้ไม่ใช่การเก็บ log แชทไว้ แต่คือการบังคับให้แปลงเป็น artifact ก่อนจบคำสั่ง**

---

## ภาคผนวก A: อภิธานศัพท์

| คำ | ความหมายในบริบทนี้ |
|---|---|
| Artifact | ไฟล์ผลลัพธ์ที่ plugin ผลิตและมี id อ้างอิงได้ |
| Contract | ข้อตกลงรูปแบบไฟล์ระหว่าง plugin ที่รับรองว่าจะไม่พังโดยไม่บอก |
| DoD (Definition of Done) | เงื่อนไขที่ตรวจได้ด้วย script ว่าขั้นตอนนั้นเสร็จจริง |
| RTM | ตารางสอบทานความต้องการ — mapping REQ ↔ ฟังก์ชัน ↔ test |
| Stale | สถานะของ artifact ที่ requirement ต้นทางเปลี่ยนแล้วแต่ยังไม่ได้ปรับตาม |
| Surface | ช่องทางที่ผู้ใช้เข้าถึงระบบ (web / mobile / api) |
| Ubiquitous Language | ศัพท์ชุดเดียวที่ใช้ตรงกันทั้งเอกสาร โค้ด และการสนทนากับลูกค้า |
| Scope (ขอบเขตข้อมูล) | ขอบเขตของข้อมูลที่บทบาทหนึ่งเข้าถึงได้ เช่น ทั้งหมด / เฉพาะสาขาตน / เฉพาะที่ตนสร้าง |
| Enforcement layer | ชั้นที่บังคับใช้สิทธิ์จริง — ui / api / domain / db |
| Default deny | สิ่งที่ไม่ได้ประกาศอนุญาตไว้ ถือว่าห้ามทั้งหมด |
| Owner (ของไฟล์) | plugin เดียวที่มีสิทธิ์เขียนไฟล์นั้น ระบุใน front-matter ไม่ใช่ระบุด้วยโฟลเดอร์ |
| Project wiki / Global wiki | ความรู้เฉพาะโปรเจกต์ vs ความรู้ที่ใช้ซ้ำข้ามโปรเจกต์ (agent เขียน global เองไม่ได้) |
| Merged view | กราฟ trace ที่ script รวมจากไฟล์ของหลาย plugin ตอนอ่าน — ไม่มีอยู่จริงบนดิสก์ จึงเขียนทับกันไม่ได้ |
| Back-channel | ช่องทาง append-only ให้ plugin ปลายน้ำส่งการตัดสินใจและคำถามกลับต้นน้ำ |
| Cold Start Test | ทดสอบว่าเปิด session ใหม่โดยไม่มีประวัติแชทแล้วยังตอบคำถามสำคัญได้ครบ |
