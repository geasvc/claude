# NFR — ข้อกำหนดที่ไม่ใช่ฟังก์ชัน

> สารบัญนี้ถูก generate จาก `spec.json` — **ห้ามแก้ด้วยมือ** · 10 หน้า

| NFR | ชนิด | ข้อกำหนด | พิสูจน์ด้วย |
|---|---|---|---|
| [NFR-loan-001](NFR-loan-001.md) | other | ทุกความสามารถใน Epic 1–8 ต้องมี API endpoint รองรับ และ business rule ถูกบังคับที่ฝั่ง API เสมอ | api_contract_test |
| [NFR-loan-002](NFR-loan-002.md) | security | เรียก API ด้วยข้อมูลที่ผิด business rule ต้องถูกปฏิเสธพร้อมรหัส/ข้อความ error ที่ชัดเจน ไม่พึ่งการ validate ของ Web เพียงอย่างเดียว | api_negative_test |
| [NFR-loan-003](NFR-loan-003.md) | other | Web ไม่ถือกฎธุรกิจ — เมื่อต้องตัดสินใจเชิงธุรกิจ (อนุมัติได้ไหม วงเงินเท่าไร) Web ต้องเรียก API เท่านั้น ไม่คำนวณเอง | code_review |
| [NFR-loan-004](NFR-loan-004.md) | availability | เมื่อ API ปิดให้บริการ Web ต้องแสดงสถานะข้อผิดพลาดอย่างเหมาะสมและไม่ crash | fault_injection_test |
| [NFR-loan-005](NFR-loan-005.md) | other | มีสัญญา API (เช่น OpenAPI) ที่อธิบาย endpoint และ request/response schema และ request/response จริงต้องตรงตาม schema ที่ประกาศไว้ | schema_validation |
| [NFR-loan-006](NFR-loan-006.md) | security | Web แนบ token จำลองทุก request และ API ตรวจสอบก่อนให้บริการ (auth จริงอยู่นอกขอบเขต) | api_auth_test |
| [NFR-loan-007](NFR-loan-007.md) | compliance | จำนวนเงินใช้ชนิดข้อมูลที่แม่นยำ ไม่ใช้ floating point และปัดเศษสม่ำเสมอทั้งระบบ | calculation_contract |
| [NFR-loan-008](NFR-loan-008.md) | compliance | ทุกการเปลี่ยนสถานะบันทึกผู้กระทำและเวลา | audit_log_test |
| [NFR-loan-009](NFR-loan-009.md) | security | ตรวจสอบ input ทั้งฝั่ง Web และฝั่ง API โดย API เป็นด่านสุดท้ายเสมอ และไม่เก็บข้อมูลอ่อนไหวจริง | api_negative_test |
| [NFR-loan-010](NFR-loan-010.md) | other | API เป็นแบบ stateless สื่อสารด้วยรูปแบบมาตรฐาน (เช่น REST/JSON) · Web กับ API deploy และทดสอบแยกกันได้อิสระ · ตั้งค่า CORS/Origin ให้ Web เรียก API ได้อย่างถูกต้อง | deployment_test |
