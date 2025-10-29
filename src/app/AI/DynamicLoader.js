// File: src/app/AI/DynamicLoader.jsx
"use client"; // <--- ต้องมี

import dynamic from 'next/dynamic';
import React from 'react';

// ใช้ dynamic ภายใน Client Component ซึ่งอนุญาตให้ใช้ ssr: false ได้
const ChatAI = dynamic(() => import('./chatAI'), { 
  ssr: false, 
  loading: () => (
    <div className="flex items-center justify-center h-screen bg-white">
        <p className="text-xl text-[#426CC2] font-semibold">กำลังโหลด AI Assistant...</p>
    </div>
  ), 
});

export default function DynamicLoader() {
    return <ChatAI />;
}
