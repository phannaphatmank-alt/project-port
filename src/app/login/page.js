"use client";
import Link from "next/link";
import { useState } from "react";
import { Icon } from "@iconify/react";
import { useRouter } from "next/navigation";
import { supabase } from "../lib/supabaseClient"; // ✅ ใช้ client เดิมที่ตั้งค่าไว้

export default function Login() {
  const router = useRouter();

  const [show, setShow] = useState(false);
  const [Email, setEmail] = useState("");
  const [Password, setPassword] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      // ✅ ดึงข้อมูลจากตาราง Signin
      const { data, error } = await supabase
        .from("Signin")
        .select("*")
        .eq("Email", Email)
        .eq("password", Password);

      if (error) {
        console.error("Login error:", error);
        alert("❌ เกิดข้อผิดพลาดในการเข้าสู่ระบบ");
        return;
      }

      if (data && data.length > 0) {
        // ✅ พบผู้ใช้แล้ว
        const user = data[0];

        // 🔹 แก้ไขส่วนนี้: เก็บ user_id, email, firstname, lastname ลง localStorage
        localStorage.setItem("currentUser", JSON.stringify({
          idUser: user.idUser, // ใช้ id หรือ user_id ตาม table ของคุณ
          email: user.Email,
          firstname: user.Firstname,
          lastname: user.Lastname
        }));

        // ✅ ไปหน้า Home
        router.push("/Home"); 
      } else {
        // ❌ ไม่พบผู้ใช้
        alert("อีเมลหรือรหัสผ่านไม่ถูกต้อง");
      }
    } catch (err) {
      console.error("Unexpected error:", err);
      alert("เกิดข้อผิดพลาดที่ไม่คาดคิด");
    }
  };

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <div className="mx-auto max-w-3xl px-4 py-14 md:py-20">
        {/* Logo + Title */}
        <div className="text-center mb-10 md:mb-12">
          <div className="mb-5 flex justify-center">
            <Icon icon="game-icons:spell-book" className="h-20 w-20 text-[#0B1956]" aria-hidden />
          </div>
          <h1 className="text-5xl font-extrabold text-[#0B1956]">Portfolio</h1>
          <p className="mt-3 text-xl md:text-2xl font-semibold text-[#426CC2]">
            Save your projects and improve your skills
          </p>
        </div>

        {/* Card */}
        <div className="mx-auto max-w-2xl rounded-3xl border-4 border-[#0B1956] p-6 md:p-10 shadow-sm text-[#426CC2]">
          <h2 className="text-center text-lg font-bold tracking-wide text-[#0B1956]">LOGIN</h2>

          {/* Form */}
          <form className="mt-6 space-y-5" onSubmit={handleLogin}>
            {/* E-mail */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-[#0B1956]">E-mail</label>
              <div className="rounded-full bg-gradient-to-b from-slate-50 to-slate-100 p-[2px]">
                <input
                  type="email"
                  placeholder="Please Enter Your E-mail"
                  value={Email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-full px-5 py-3 outline-none
                    bg-gradient-to-b from-white to-[#E7EEFF]
                    shadow-[inset_0_3px_16px_rgba(66,108,194,0.22)]"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-[#0B1956]">Password</label>
              <div className="rounded-full bg-gradient-to-b from-slate-50 to-slate-100 p-[2px]">
                <div className="flex items-center">
                  <input
                    type={show ? "text" : "password"}
                    placeholder="Please Enter Password"
                    value={Password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-full px-5 py-3 outline-none
                      bg-gradient-to-b from-white to-[#E7EEFF]
                      shadow-[inset_0_3px_16px_rgba(66,108,194,0.22)]"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShow((s) => !s)}
                    className="-ml-15 mr-2 rounded-full p-2 text-slate-600 hover:text-slate-800 focus:outline-none"
                    aria-label={show ? "Hide password" : "Show password"}
                  >
                    <Icon icon={show ? "carbon:view-off" : "carbon:view"} className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Help / Forgot */}
            <div className="flex items-center justify-between text-sm font-semibold text-slate-700">
              <a href="#" className="hover:underline">Need help?</a>
              <a href="#" className="hover:underline">Forgot Password?</a>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              className="block w-full text-center rounded-full px-5 py-3 outline-none
                bg-gradient-to-b from-white to-[#E7EEFF]
                shadow-[inset_0_3px_16px_rgba(66,108,194,0.22)] font-semibold"
            >
              LOGIN
            </button>

            {/* Create New */}
            <p className="text-center text-sm text-[#0B1956]">
              Just recently came new?{" "}
              <Link href="/signin" className="font-semibold text-[#426CC2] hover:underline">
                Create New
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
