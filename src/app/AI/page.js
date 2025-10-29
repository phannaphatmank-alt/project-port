// File: src/app/AI/page.js

// 1. นำเข้า Component Wrapper ที่เราสร้าง
import DynamicLoader from './DynamicLoader'; 
import React from 'react';

// ไม่ต้องใช้ next/dynamic ใน page.js แล้ว!
// เพราะ DynamicLoader.jsx เป็น Client Component และจัดการ dynamic import ด้วย ssr: false ไว้ข้างในแล้ว

export default function AIPage() {
  // Page.js (Server Component) เรียกใช้ DynamicLoader (Client Component)
  return <DynamicLoader />;
}