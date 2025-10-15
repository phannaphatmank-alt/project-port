import React from "react";
import { Icon } from "@iconify/react";

const Navbar = () => {
  const userAvatarUrl = "/image/profile.jpg";

  return (
    <nav className="shadow-md" style={{ backgroundColor: "#426CC2" }}>
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="flex justify-between items-center h-16">
          {/* ซ้าย */}
          <div className="flex items-center text-white">
            <Icon
              icon="game-icons:spell-book"
              className="h-10 w-10 text-[#ffffff]"
              aria-hidden
            />
            <div className="flex items-center p-4 rounded">
              <span className="font-semibold">Portfolio</span>
            </div>
          </div>

          {/* กลาง */}
          <div className="flex space-x-8 text-white">
            <a href="#home" className="hover:text-gray-200">
              HOME
            </a>
            <a href="#myproject" className="hover:text-gray-200">
              MYPROJECT
            </a>
            <a href="#about" className="hover:text-gray-200">
              ABOUT ME
            </a>
            <a href="#ai" className="hover:text-gray-200">
              AI
            </a>
          </div>

          {/* ขวา */}
          <div className="flex items-center">
            <div className="w-9 h-9 rounded-full overflow-hidden border-2 border-white cursor-pointer">
              <img
                src={userAvatarUrl}
                alt="User Avatar"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

// หน้า Home
const Home = () => {
  return (
    <div>
      <Navbar /> {/* เรียกใช้ Navbar */}
      <div className="min-h-screen bg-white text-slate-900">
        <div className="mx-auto max-w-3xl px-4 py-14 md:py-20">
          {/* Logo + Title */}
          <div className="text-center mb-10 md:mb-12">
            <div className="mb-5 flex justify-center">
              <Icon
                icon="game-icons:spell-book"
                className="h-15 w-15 text-[#0B1956]"
                aria-hidden
              />
            </div>
            <h1 className="text-4xl font-extrabold letter-spacing: 0.26px text-[#0B1956]">
              Portfolio
            </h1>

            <p className="mt-3 text-xl md:text-2xl font-semibold text-[#426CC2]">
              Save your projects and improve your skills
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
