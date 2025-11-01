// File: src/app/api/course/route.js
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

// ✅ GET: ดึงข้อมูล Courses ของ User (ดึงทั้งหมด ไม่ใช่ single)
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
    
    // 🔍 ดึงข้อมูลจากตาราง course (ไม่ใช้ .single())
    const { data, error } = await supa
      .from("course")
      .select("idCourse, courseCode, courseName, courseDescription, created_at")
      .eq("idUser", idUser)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Supabase query error:", error);
      throw error;
    }

    console.log("✅ Courses loaded for user:", idUser, "| Count:", data?.length || 0);
    
    // ส่งกลับเป็น array (ถ้าไม่มีให้ส่ง [])
    return NextResponse.json(data || [], { status: 200 });
    
  } catch (err) {
    console.error("GET /api/course error:", err);
    return NextResponse.json(
      { error: err.message }, 
      { status: 500 }
    );
  }
}

// ✅ POST: เพิ่ม Course ใหม่
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
    const { courseCode, courseName, courseDescription } = body || {};

    if (!courseCode || !courseName) {
      return NextResponse.json(
        { error: "courseCode and courseName are required" },
        { status: 400 }
      );
    }

    const supa = getAdminClient();
    
    // ✅ Insert เข้าตาราง course พร้อม idUser
    const { data, error } = await supa
      .from("course")
      .insert([{
        courseCode, 
        courseName, 
        courseDescription: courseDescription || null,
        idUser, // ✅ เพิ่ม idUser
      }])
      .select("*")
      .single();

    if (error) throw error;

    console.log("✅ Course created:", data);
    return NextResponse.json({ course: data }, { status: 201 });
    
  } catch (err) {
    console.error("POST /api/course error:", err);
    return NextResponse.json(
      { error: err.message }, 
      { status: 500 }
    );
  }
}