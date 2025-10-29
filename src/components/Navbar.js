"use client";
import { useState, useEffect } from "react";
import { Icon } from "@iconify/react";
import Link from "next/link";
import { supabase } from "../app/lib/supabaseClient";

const Navbar = () => {
  const [userAvatarUrl, setUserAvatarUrl] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("currentUser");

    if (storedUser) {
      const user = JSON.parse(storedUser);

      // ดึงข้อมูล profile จาก Supabase
      fetchUserProfile(user.idUser);
    }
  }, []);

  const fetchUserProfile = async (id) => {
    try {
      const { data, error } = await supabase
        .from("Profile") // ชื่อตาราง Profile
        .select("image")  // คอลัมที่เก็บรูป
        .eq("idUser", idUser)
        .single();        // คาดว่ามี row เดียวต่อ user

      if (error) {
        console.log("Error fetching profile:", error.message);
        return;
      }

      if (data?.image) {
        setUserAvatarUrl(data.image); // ถ้ามีรูป -> ใช้รูป
      }
    } catch (err) {
      console.log("Fetch profile error:", err);
    }
  };

  return (
    <nav className="shadow-md" style={{ backgroundColor: "#426CC2" }}>
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="flex justify-between items-center h-16">
          {/* ซ้าย */}
          <Link href="/Home">
            <div className="flex items-center text-white cursor-pointer">
              <Icon
                icon="game-icons:spell-book"
                className="h-10 w-10 text-[#ffffff]"
                aria-hidden
              />
              <div className="flex items-center p-4 rounded">
                <span className="font-semibold">Portfolio</span>
              </div>
            </div>
          </Link>

          {/* กลาง */}
          <div className="flex space-x-8 text-white">
            <Link href="/Home" className="hover:text-gray-200">HOME</Link>
            <Link href="/all-project" className="hover:text-gray-200">MY PROJECT</Link>
            <Link href="/Profile" className="hover:text-gray-200">ABOUT ME</Link>
            <Link href="/AI" className="hover:text-gray-200">AI</Link>
          </div>

          {/* ขวา */}
          <div className="flex items-center">
            <Link href="/Profile">
              <div className="w-9 h-9 rounded-full overflow-hidden border-2 border-white cursor-pointer flex items-center justify-center bg-gray-300">
                {userAvatarUrl ? (
                  <img
                    src={userAvatarUrl}
                    alt="User Avatar"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Icon icon="mdi:account" className="w-5 h-5 text-white" />
                )}
              </div>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
