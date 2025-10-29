"use client";
import Link from "next/link";
import { useState } from "react";
import { Icon } from "@iconify/react";
import { supabase } from "../lib/supabaseClient";
import { useRouter } from "next/navigation"; // ต้อง import

export default function Login() {
  const router = useRouter();

  const [Signin, setSignin] = useState(false);
  const [Prefix, setPrefix] = useState("");
  const [Firstname, setFirstname] = useState("");
  const [Lastname, setLastname] = useState("");
  const [Email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { data, error } = await supabase.from("Signin").insert([
      {
        Prefix,
        Firstname,
        Lastname,
        Email,
        password: password, // ต้องตรงกับ column ใน Supabase
      },
    ]);

    if (error) {
      console.error("Error inserting user:", error);
      alert("Signup failed!");
    } else {
      console.log("User inserted:", data);
      alert("Signup successful!");
      // ล้างฟิลด์
      setPrefix("");
      setFirstname("");
      setLastname("");
      setEmail("");
      setPassword("");
      router.push("/login");
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
          <h1 className="text-5xl font-extrabold letter-spacing: 0.26px text-[#0B1956]">Portfolio</h1>
          <p className="mt-3 text-xl md:text-2xl font-semibold text-[#426CC2]">
            Save your projects and improve your skills
          </p>
        </div>

        {/* Card */}
        <div className="mx-auto max-w-2xl rounded-3xl border-4 border-blue-0B1956 p-6 md:p-10 shadow-sm text-[#426CC2]">
          <h2 className="text-center text-lg font-bold tracking-wide text-[#0B1956]">SIGN IN</h2>

          {/* Form */}
          <form onSubmit={handleSubmit} className="mt-6 space-y-5">
            {/* Prefix */}
            <div>
              <label htmlFor="prefix-select" className="mb-2 block text-sm font-semibold text-[#0B1956]">
                Prefix
              </label>
              <div className="rounded-full bg-gradient-to-b from-slate-50 to-slate-100 p-[2px]">
                <div className="relative">
                  <select
                    id="prefix-select"
                    value={Prefix}
                    onChange={(e) => setPrefix(e.target.value)}
                    className="w-full appearance-none rounded-full pl-5 pr-12 py-3 outline-none
                      bg-gradient-to-b from-white to-[#E7EEFF]
                      shadow-[inset_0_3px_16px_rgba(66,108,194,0.22)]
                      text-[#426CC2] cursor-pointer"
                    required
                  >
                    <option value="" disabled>Select Your Prefix</option>
                    <option value="MR.">MR.</option>
                    <option value="MRs.">MRs.</option>
                    <option value="Ms.">Ms.</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-6 flex items-center pr-5 text-[#0B1956] transform rotate-180">
                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M11.293 8.707L6 14l1.414 1.414L12 11.414l4.586 4.586L18 14l-5.293-5.293a1 1 0 00-1.414 0z" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Firstname */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-[#0B1956]">Firstname</label>
              <div className="rounded-full bg-gradient-to-b from-slate-50 to-slate-100 p-[2px]">
                <input
                  type="text"
                  placeholder="Please Enter Your Firstname"
                  value={Firstname}
                  onChange={(e) => setFirstname(e.target.value)}
                  className="w-full rounded-full px-5 py-3 outline-none
                  bg-gradient-to-b from-white to-[#E7EEFF]
                  shadow-[inset_0_3px_16px_rgba(66,108,194,0.22)]"
                  required
                />
              </div>
            </div>

            {/* Lastname */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-[#0B1956]">Lastname</label>
              <div className="rounded-full bg-gradient-to-b from-slate-50 to-slate-100 p-[2px]">
                <input
                  type="text"
                  placeholder="Please Enter Your Lastname"
                  value={Lastname}
                  onChange={(e) => setLastname(e.target.value)}
                  className="w-full rounded-full px-5 py-3 outline-none
                  bg-gradient-to-b from-white to-[#E7EEFF]
                  shadow-[inset_0_3px_16px_rgba(66,108,194,0.22)]"
                  required
                />
              </div>
            </div>

            {/* Email */}
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
                    type={Signin ? "text" : "password"}
                    placeholder="Please Enter Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-full px-5 py-3 outline-none
                    bg-gradient-to-b from-white to-[#E7EEFF]
                    shadow-[inset_0_3px_16px_rgba(66,108,194,0.22)]"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setSignin((s) => !s)}
                    className="-ml-15 mr-2 rounded-full p-2 text-slate-600 hover:text-slate-800 focus:outline-none"
                  >
                    <Icon icon={Signin ? "carbon:view-off" : "carbon:view"} className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Help / Forgot */}
            <div className="flex items-center justify-between text-sm font-semibold text-slate-700">
              <a href="#" className="hover:underline">Need help?</a>
            </div>

            {/* Submit Button */}
            <button
              href="/"
              type="submit"
              className="block w-full text-center rounded-full px-5 py-3 outline-none
              bg-gradient-to-b from-white to-[#E7EEFF]
              shadow-[inset_0_3px_16px_rgba(66,108,194,0.22)] font-semibold"
            >
              SIGN IN
            </button>
            

          </form>
        </div>
      </div>
    </div>
  );
}
