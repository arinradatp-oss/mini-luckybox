ช่วยเขียนไฟล์ app/page.js สำหรับ Next.js App Router (JavaScript)
เป็นหน้าแรกของระบบสุ่มกล่องเครื่องประดับ แสดงรายการสินค้าในคลังจากตาราง products ใน Supabase

ต้องการฟีเจอร์:
1. ดึงรายการสินค้าทั้งหมดมาแสดงเป็นตาราง (คอลัมน์: SKU, ชื่อสินค้า, หมวด, ตัวคูณราคา,
   น้ำหนักโอกาสสุ่ม, คงเหลือ, หน่วย)
2. ฟอร์มเพิ่มสินค้าใหม่ (sku, name, category, price_multiplier, draw_weight, stock, unit)
   อยู่ด้านบนตาราง โดย category ให้เป็น dropdown เลือกจาก rope, bead, silver, gold
3. ปุ่มแก้ไขและลบสินค้าในแต่ละแถว (แก้ไขแบบ inline หรือ popup ก็ได้ เลือกวิธีที่โค้ดสั้นและเข้าใจง่าย)
4. ใช้ Supabase client จาก lib/supabaseClient.js ที่มีอยู่แล้ว
5. เป็น Client Component ("use client" บรรทัดแรก)
6. ใช้ useState และ useEffect จัดการข้อมูล ไม่ต้องใช้ library เพิ่มเติม
7. ใส่ style พื้นฐานให้อ่านง่าย

ขอโค้ดแบบเต็มไฟล์ พร้อม comment สั้นๆ อธิบายส่วนสำคัญ
