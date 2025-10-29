export const runtime = "nodejs";

import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(req) {
  try {
    // ✅ รับ prompt และ model จาก request body
    const { prompt, model = "gemini-2.5-pro" } = (await req.json()) || {};
    if (!prompt) {
      return new Response(
        JSON.stringify({ error: "Missing prompt in request body" }),
        { status: 400 }
      );
    }

    // ✅ รองรับทั้ง GEMINI_API_KEY และ GOOGLE_API_KEY
    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
    if (!apiKey) {
      return new Response(
        JSON.stringify({
          error:
            "Missing GEMINI_API_KEY or GOOGLE_API_KEY in environment variables",
        }),
        { status: 500 }
      );
    }

    // ✅ เรียกใช้ Gemini model
    const genAI = new GoogleGenerativeAI(apiKey);
    const gemini = genAI.getGenerativeModel({ model });

    const result = await gemini.generateContent({
      contents: [{ parts: [{ text: prompt }] }],
    });

    // ✅ ดึงข้อความตอบกลับ
    const text = result?.response?.text?.() || "";
    return new Response(JSON.stringify({ text }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Gemini API error:", err);
    return new Response(
      JSON.stringify({
        error: err?.message || "Unknown error occurred while calling Gemini API",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}