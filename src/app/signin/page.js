"use client";
import Link from "next/link";

import { useState } from "react";
import { Icon } from "@iconify/react";

export default function Login() {
  const [show, setShow] = useState(false);

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
        <div className="mx-auto max-w-2xl rounded-3xl border-4 border-blue-0B1956 p-6 md:p-10 shadow-sm text-[#426CC2] ">
          <h2 className="text-center text-lg font-bold tracking-wide text-[#0B1956]">SIGN IN</h2>

          {/* Form */}
          <form className="mt-6 space-y-5">
            {/* Prefix (เปลี่ยนเป็น Dropdown พร้อมไอคอน) */}
<div>
  <label htmlFor="prefix-select" className="mb-2 block text-sm font-semibold text-[#0B1956]">
    Prefix
  </label>
  <div className="rounded-full bg-gradient-to-b from-slate-50 to-slate-100 p-[2px]">
    <div className="relative">
      
      {/* 1. Dropdown/Select element */}
      <select
        id="prefix-select"
        placeholder="Select Your Prefix"
        // w-full, rounded-full, และ shadow ถูกนำมาใส่ใน select
        // appearance-none ใช้เพื่อซ่อนลูกศร Dropdown เริ่มต้นของเบราว์เซอร์
        // pr-12 ใช้เพื่อเว้นที่ว่างด้านขวาสำหรับไอคอน
        className="w-full appearance-none rounded-full pl-5 pr-12 py-3 outline-none
                  bg-gradient-to-b from-white to-[#E7EEFF]
                  shadow-[inset_0_3px_16px_rgba(66,108,194,0.22)]
                  text-[#426CC2] cursor-pointer"
        defaultValue="" 
      >
        <option value="" disabled>
          Select Your Prefix
        </option>
        <option value="MR.">MR.</option>
        <option value="MRs.">MRs.</option>
        <option value="Ms.">Ms.</option>
      </select>
      
      {/* 2. Icon (Absolute Position) */}
      <div className="pointer-events-none absolute inset-y-0 right-6 flex items-center pr-5 text-[#0B1956] transform rotate-180">
        {/*
          ไอคอน eva:arrow-up-fill ถูกนำมาใช้และหมุน 180 องศา (rotate-180)
          เพื่อให้ดูเหมือนเป็นลูกศรลงสำหรับ Dropdown
        */}
        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M11.293 8.707L6 14l1.414 1.414L12 11.414l4.586 4.586L18 14l-5.293-5.293a1 1 0 00-1.414 0z" />
        </svg>
      </div>
    </div>
  </div>
</div>

            {/* Fisrtname */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-[#0B1956]">Fisrtname</label>
              <div className="rounded-full bg-gradient-to-b from-slate-50 to-slate-100 p-[2px]">
                <input
                  type="fisrtname"
                  placeholder="Please Enter Your Fisrtname"
                  className="w-full rounded-full px-5 py-3 outline-none
                  bg-gradient-to-b from-white to-[#E7EEFF]
                  shadow-[inset_0_3px_16px_rgba(66,108,194,0.22)]                  
                  "
                />
                
              </div>
            </div>
            {/* Lastname */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-[#0B1956]">Lastname</label>
              <div className="rounded-full bg-gradient-to-b from-slate-50 to-slate-100 p-[2px]">
                <input
                  type="lastname"
                  placeholder="Please Enter Your Lastname"
                  className="w-full rounded-full px-5 py-3 outline-none
                  bg-gradient-to-b from-white to-[#E7EEFF]
                  shadow-[inset_0_3px_16px_rgba(66,108,194,0.22)]                  
                  "
                />
                
              </div>
            </div>
            {/* E-mail */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-[#0B1956]">E-mail</label>
              <div className="rounded-full bg-gradient-to-b from-slate-50 to-slate-100 p-[2px]">
                <input
                  type="e-mail"
                  placeholder="Please Enter Your E-mail"
                  className="w-full rounded-full px-5 py-3 outline-none
                  bg-gradient-to-b from-white to-[#E7EEFF]
                  shadow-[inset_0_3px_16px_rgba(66,108,194,0.22)]                  
                  "
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
                    className="w-full rounded-full px-5 py-3 outline-none
                    bg-gradient-to-b from-white to-[#E7EEFF]
                    shadow-[inset_0_3px_16px_rgba(66,108,194,0.22)]
                    "
                  />
                  <button
                    type="button"
                    onClick={() => setShow((s) => !s)}
                    className="-ml-15 mr-2 rounded-full p-2 text-slate-600 hover:text-slate-800 focus:outline-none"
                    aria-label={show ? "Hide password" : "Show password"}
                  >
                    {/* eye icon */}
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      className="h-5 w-5"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7Z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            {/* Help / Forgot */}
            <div className="flex items-center justify-between text-sm font-semibold text-slate-700">
              <a href="#" className="hover:underline">Need help?</a>
              
            </div>

            {/* Login Button */}
            <Link
            href="/"
            className="block w-full text-center rounded-full px-5 py-3 outline-none
            bg-gradient-to-b from-white to-[#E7EEFF]
            shadow-[inset_0_3px_16px_rgba(66,108,194,0.22)] font-semibold"
          >
            SIGNIN
          </Link>

          </form>
        </div>
      </div>
    </div>
  );
}