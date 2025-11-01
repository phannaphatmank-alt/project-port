//file:uploadProjectImage
import { supabase } from "../lib/supabaseClient";

/** อัปโหลดภาพไป Supabase Storage แล้วคืน public URL */
export async function uploadProjectImage(file, idUser) {
  if (!file) throw new Error("No file");
  if (!idUser) throw new Error("Missing idUser");

  // ทำชื่อไฟล์ให้ปลอดภัย (ตัดวรรณยุกต์/ช่องว่าง/อักขระพิเศษ)
  const safeName = file.name
    .normalize("NFKD").replace(/[\u0300-\u036f]/g, "") // ลบเครื่องหมายกำกับเสียง
    .replace(/[^\w.-]+/g, "")                         // แทนที่อักขระแปลกๆ ด้วย 
    .toLowerCase();

  const filePath = `projects/${idUser}/${Date.now()}_${safeName}`;

  // ✅ อัปโหลดไฟล์เข้า bucket
const { error: upErr } = await supabase
    .storage
    .from("avatars")           // ใช้ bucket ชื่อ avatars
    .upload(filePath, file, {
      upsert: true,
      contentType: file.type || "image/*",
    });

  if (upErr) throw upErr;

  // bucket เป็น Public อยู่แล้ว → ใช้ URL แบบ public ได้เลย
  const { data } = supabase.storage.from("avatars").getPublicUrl(filePath);
  return data.publicUrl; // URL นี้ต้องเอาไปเซฟใน DB
}