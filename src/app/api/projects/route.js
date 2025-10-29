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

function mapRows(rows = []) {
  return rows.map((p) => ({
    id: p.idProject,
    title: p.projectName,
    subtitle: p.Position,
    description: p.Description,
    cover: p.Image,
    category: p.Category,
    location: p.Location,
    date: p.Date,
    created_at: p.created_at,
  }));
}

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

    const { data, error } = await supa
      .from("portfolio")
      .select("*")
      .eq("idUser", idUser)
      .order("created_at", { ascending: false });

    if (error) throw error;

    return NextResponse.json(mapRows(data || []), { status: 200 });
    
  } catch (err) {
    console.error("GET /api/projects error:", err);
    return NextResponse.json(
      { error: err.message }, 
      { status: 500 }
    );
  }
}

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
    const { projectName, Position, Location, Date, Description, Category, Image } = body || {};
    
    if (!projectName) {
      return NextResponse.json(
        { error: "projectName is required" }, 
        { status: 400 }
      );
    }

    const supa = getAdminClient();

    const { data, error } = await supa
      .from("portfolio")
      .insert([{
        projectName,
        Position,
        Location,
        Date,
        Description,
        Category,
        Image,
        idUser,
      }])
      .select("*")
      .single();

    if (error) throw error;

    return NextResponse.json({ project: data }, { status: 201 });
    
  } catch (err) {
    console.error("POST /api/projects error:", err);
    return NextResponse.json(
      { error: err.message }, 
      { status: 500 }
    );
  }
}