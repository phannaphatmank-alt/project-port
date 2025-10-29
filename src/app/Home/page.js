import React from "react";
import { Icon } from "@iconify/react";
import FixedBottomRightBox from "../../components/FixedBottomRightBox";
import Navbar from "../../components/Navbar";
import Banner from "../../components/Banner";
import AddProject from "../AddProject/AddProject"; // Component ที่มี 'My Project' และรายการโปรเจกต์

// หน้า Home
const Home = () => {
  return (
    <div>
      <Navbar /> {/* ส่วน Navbar */}

      {/* *** โครงสร้างหลักของเนื้อหาเพจ ***
        เราจะรวม Banner และ AddProject (My Project) ไว้ใน div เดียวกัน 
        เพื่อให้แสดงผลต่อเนื่องกันทันทีหลัง Navbar
      */}
      <div className="bg-white text-slate-900">
        
        {/* ส่วนที่ครอบ Banner และ Project ทั้งหมด */}
        <div className="mx-auto max-w-7xl px-4 py-6"> 
        
          {/* Banner: ยังคงใช้ max-w-3xl เพื่อให้ Banner อยู่ตรงกลางและมีขนาดเล็กลงตามดีไซน์ */}
          <div className="mx-auto max-w-3xl pb-10"> 
            <Banner />
          </div>

          {/* AddProject: ซึ่งมีหัวข้อ "My Project" และรายการโปรเจกต์อยู่ข้างใน จะแสดงผลต่อจาก Banner ทันที */}
          {/* Note: ผมคาดว่า Component AddProject ของคุณมีโครงสร้างคล้ายกับหน้าจอที่คุณต้องการ */}
          <AddProject />
        </div>
      </div>
     

      {/* กล่องมุมขวาล่าง */}
      <FixedBottomRightBox />
    </div>
  );
};

export default Home;