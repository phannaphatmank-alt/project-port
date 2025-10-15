"use client";
import { Icon } from "@iconify/react";

const FixedBottomRightBox = () => {
  return (
    <div
      className="fixed bottom-8 right-8 z-50 cursor-pointer transition-transform hover:scale-105"
      style={{
        width: "80px",
        height: "80px",
        borderRadius: "20px",
        background: "linear-gradient(to bottom, #F9FAFB, #E7EEFF)",
        boxShadow: "inset 0 3px 16px rgba(66,108,194,0.22), 0 3px 12px rgba(66,108,194,0.25)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        animation: "floatAround 4s ease-in-out infinite", // เพิ่มตรงนี้
      }}
    >
      <div
        style={{
          width: "100%",
          height: "100%",
          borderRadius: "20px",
          background: "linear-gradient(to bottom, #FFFFFF, #E7EEFF)",
          boxShadow: "inset 0 3px 8px rgba(66,108,194,0.22)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Icon icon="game-icons:spell-book" className="w-8 h-8 text-[#426CC2]" />
      </div>

      {/* ใส่ CSS Animation Inline */}
      <style jsx>{`
        @keyframes floatAround {
          0% { transform: translate(0, 0) }
          25% { transform: translate(5px, -5px) }
          50% { transform: translate(-5px, 5px) }
          75% { transform: translate(5px, 5px) }
          100% { transform: translate(0, 0) }
        }
      `}</style>
    </div>
  );
};

export default FixedBottomRightBox;
