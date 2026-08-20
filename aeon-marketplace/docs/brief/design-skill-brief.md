ต้องการให้ช่วยวางแผนออกแบบ design document plugin โดยจะเป็น การนำ requirement มาแปลงเป็นเอกสาร สำหรับ human และ ai  

รับเอกสารจาก req plugin นำ requirement มาสรุปเป็นเอกสาร สำหรับ
1. Human 
 - เพื่อส่งให้ลูกค้าตรวจสอบ 

2. AI 
 - เพื่อนำไปพัฒนาระบบ และทำ test scenario 
 - เพื่อให้ครอบคลุม ส่งต่อให้ ออกแบบ mockup, web or api or moblie develop , unit test, scenario test

---
โดยจะต้องเชื่อมโยง เช่น หน้าเวปนี้ มาจาก spec อะไร. ต้องทำ unit test อะไร, เกี่ยวกับ scenario อะไร, ui test อะไร
---
ออกแบบให้ ai สามารถนำไปทำงานต่ออย่างไร , สามารถทำงานต่อเนื่องได้ ถึงจะขึ้น session ใหม่. 
---
ต้องสามารถใช้ wiki doc และ json ได้ทั้ง marketplace เพราะต่อไปจะมี 
---

ตัวอย่างการจัด command สำหรับให้ human อ่านและตรวจสอบ

- overview command (แนะนำชื่อได้)
1. บทนำ	วัตถุประสงค์, ขอบเขต, นิยามศัพท์, เอกสารอ้างอิง	— (ใส่ตารางอภิธานศัพท์แทน)
2. ภาพรวมระบบ	มุมมองผลิตภัณฑ์, ผู้ใช้งาน, ข้อจำกัด, สมมติฐาน	System Context Diagram (DFD Level 0), BPMN กระบวนการทำงานปัจจุบัน (As-Is) และที่ออกแบบใหม่ (To-Be), Stakeholder Map
3. รองรับการการ change ที่มาจาก req plugin

-function command (แนะนำชื่อได้)
3. ความต้องการเชิงหน้าที่	รายการฟังก์ชันแยกตามโมดูล	Use Case Diagram, Use Case Description (ตาราง), Activity Diagram ต่อ use case สำคัญ, DFD Level 1–2, State Diagram สำหรับข้อมูลที่มีสถานะ (เช่น ใบคำขอ)
4. ความต้องการที่ไม่ใช่เชิงหน้าที่	Performance, Security, Availability, Usability, Compliance (PDPA)	ส่วนใหญ่เป็นตาราง; อาจใส่ Workload/Concurrent User Chart

- datamodel command (แนะนำชื่อได้)
5. ความต้องการด้านข้อมูล	ข้อมูลหลัก, ปริมาณ, การเก็บรักษา	Conceptual ERD, Data Dictionary เบื้องต้น
6. ความต้องการด้าน Interface	หน้าจอ, ระบบภายนอกที่ต้องเชื่อม, ฮาร์ดแวร์	Wireframe/Mockup ระดับหยาบ, Integration/Interface Diagram, ตารางรายการ API ที่ต้องเชื่อม

- secenario command (แนะนำชื่อได้)
7. ตารางสอบทานความต้องการ	RTM (Requirement Traceability Matrix)	ตาราง mapping TOR ↔ Requirement ID ↔ ฟังก์ชัน

- sitemap command
8. list หน้าจอของเวป
9. matrix กำหนดสิทธิ์ ควรนำไปรวมกับ command อื่น หรือสร้างใหม่

- help command

