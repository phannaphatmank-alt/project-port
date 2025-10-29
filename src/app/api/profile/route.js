// File: src/app/api/profile/route.js
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!url || !serviceKey) {
    throw new Error("Missing Supabase environment variables");
  }
  
  return createClient(url, serviceKey, { 
    auth: { persistSession: false } 
  });
}

function getUserIdFromReq(req) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("userId");
  const h = req.headers.get("x-user-id");
  return q || h || null;
}

function toInt8(str) {
  if (!str || !/^\d+$/.test(String(str))) return null;
  return Number(str);
}

// ✅ GET: ดึงข้อมูล Profile ของ User
export async function GET(req) {
  try {
    const userIdStr = getUserIdFromReq(req);
    const idUser = toInt8(userIdStr);
    
    if (idUser === null) {
      return NextResponse.json(
        { error: "Missing or invalid userId" },
        { status: 400 }
      );
    }

    const supa = getAdminClient();
    
    // 🔍 ดึงข้อมูลจากตาราง Profile
    const { data, error } = await supa
      .from("Profile")
      .select("gpa, educationLevel, institution, major, faculty")
      .eq("idUser", idUser)
      .single(); // ใช้ single() เพราะควรมีแค่ 1 profile ต่อ user

    if (error) {
      // ถ้าไม่เจอ profile ให้ return null แทนการ throw error
      if (error.code === 'PGRST116') {
        return NextResponse.json(null, { status: 200 });
      }
      throw error;
    }

    console.log("✅ Profile loaded for user:", idUser);
    
    return NextResponse.json(data, { status: 200 });
    
  } catch (err) {
    console.error("GET /api/profile error:", err);
    return NextResponse.json(
      { error: err.message }, 
      { status: 500 }
    );
  }
}

// ✅ POST: สร้าง/อัปเดต Profile (Optional)
export async function POST(req) {
  try {
    const userIdStr = getUserIdFromReq(req);
    const idUser = toInt8(userIdStr);
    
    if (idUser === null) {
      return NextResponse.json(
        { error: "Missing or invalid userId" },
        { status: 400 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const { gpa, educationLevel, institution, major, faculty } = body || {};

    const supa = getAdminClient();
    
    // ใช้ upsert เพื่อ insert ถ้ายังไม่มี หรือ update ถ้ามีแล้ว
    const { data, error } = await supa
      .from("Profile")
      .upsert([{
        idUser,
        gpa,
        educationLevel,
        institution,
        major,
        faculty,
      }], {
        onConflict: 'idUser' // ถ้ามี unique constraint ที่ idUser
      })
      .select("*")
      .single();

    if (error) throw error;

    return NextResponse.json({ profile: data }, { status: 201 });
    
  } catch (err) {
    console.error("POST /api/profile error:", err);
    return NextResponse.json(
      { error: err.message }, 
      { status: 500 }
    );
  }
}