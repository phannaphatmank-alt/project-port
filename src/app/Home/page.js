import React from "react";
import { Icon } from "@iconify/react";
import FixedBottomRightBox from "../../components/FixedBottomRightBox";
import Navbar from "../../components/Navbar";
import Banner from "../../components/Banner";

// หน้า Home
const Home = () => {
  return (
    <div>
      <Navbar /> {/* เรียกใช้ Navbar */}

      <div className="min-h-screen bg-white text-slate-900">
        <div className="mx-auto max-w-3xl px-4 py-14 md:py-10">
          <Banner /> {/* เรียกใช้ Banner */}
        </div>
      </div>

      {/* กล่องมุมขวาล่าง */}
      <FixedBottomRightBox />
    </div>
  );
};

export default Home;
