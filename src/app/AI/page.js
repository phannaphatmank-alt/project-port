"use client";
import React, { useState } from "react";
import { Icon } from "@iconify/react";
import Navbar from "../../components/Navbar";
import Banner from "@/components/Banner";

const ChatAI = () => {
  const [showSuggestions, setShowSuggestions] = useState(false); // toggle suggestion box
  const [inputValue, setInputValue] = useState(""); // input state
  const [chats, setChats] = useState([]); // store chat messages

  const toggleSuggestionBox = () => setShowSuggestions(!showSuggestions);

  const handleSuggestionClick = (text) => {
    setInputValue(text);
    setShowSuggestions(false);
  };

  const sendMessage = () => {
    if (!inputValue) return;

    // Add user message
    setChats([...chats, { sender: "user", text: inputValue }]);
    setInputValue("");

    // Simulate bot response
    setTimeout(() => {
      setChats((prev) => [
        ...prev,
        { sender: "bot", text: `Bot ตอบกลับ: "${inputValue}"` },
      ]);
    }, 500);
  };

  return (
    <div>
      {/* Navbar */}
      <Navbar />

      {/* Main Content */}
      <div className="min-h-screen bg-white text-slate-900">
        <div className="mx-auto max-w-3xl px-4 py-14 md:py-10">
          {/* Banner */}
          <Banner />

          {/* Chat Bubbles */}
            <div className="mb-32 flex flex-col gap-2 max-h-[60vh] overflow-y-auto px-2">
            {chats.map((c, i) => (
                <div
                key={i}
                className={`flex ${c.sender === "user" ? "justify-end" : "justify-start"}`}
                >
                <div
                    className={`px-4 py-3 rounded-2xl max-w-[70%] break-words
                    shadow-[inset_0_3px_16px_rgba(66,108,194,0.22)]
                    bg-gradient-to-b from-white to-[#E7EEFF]
                    ${c.sender === "user" ? "rounded-br-none" : "rounded-bl-none"}
                    `}
                >
                    {c.text}
                </div>
                </div>
            ))}
            </div>

          {/* AI Input */}
          <div className="fixed bottom-8 left-1/2 -translate-x-1/2 w-full max-w-3xl px-4">
            <div className="relative rounded-full bg-gradient-to-b from-slate-50 to-slate-100 p-[2px]">
              <div className="relative flex items-center">
                {/* Input */}
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Analyze your skills based on past projects"
                  className="w-full rounded-full px-5 py-3 pr-28 outline-none
                             bg-gradient-to-b from-white to-[#E7EEFF]
                             shadow-[inset_0_3px_16px_rgba(66,108,194,0.22)]"
                  onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                />

                {/* Icon + */}
                <button className="absolute right-20 p-2 rounded-full hover:bg-blue-50 transition duration-150">
                  <Icon icon="ic:round-add" className="w-6 h-6 text-[#426CC2]" />
                </button>

                {/* Icon AI Idea */}
                <button
                  className="absolute right-12 p-2 rounded-full hover:bg-blue-50 transition duration-150"
                  onClick={toggleSuggestionBox}
                >
                  <Icon icon="hugeicons:ai-idea" className="w-6 h-6 text-[#426CC2]" />
                </button>

                {/* Icon Send */}
                <button
                  className="absolute right-3 p-2 rounded-full hover:bg-blue-50 transition duration-150"
                  onClick={sendMessage}
                >
                  <Icon icon="iconamoon:send" className="w-6 h-6 text-[#426CC2]" />
                </button>

                {/* Suggestion Box */}
                {showSuggestions && (
                  <div className="absolute right-0 bottom-full mb-3 w-72 rounded-2xl overflow-hidden z-50 border border-gray-50
                                  bg-gradient-to-b from-white to-[#E7EEFF] shadow-[inset_0_3px_16px_rgba(66,108,194,0.22)]">
                    <div className="p-4 font-bold text-[#0B1956] border-b border-gray-100 text-center">
                      คำถามแนะนำ
                    </div>
                    <ul>
                      {[
                        "แนะนำสายงานที่เหมาะ",
                        "3 ชิ้นงานเด่น",
                        "กิจกรรมที่ควรเน้นใน Resume",
                        "ทักษะหลักที่โดดเด่น",
                      ].map((q, i) => (
                        <li
                          key={i}
                          onClick={() => handleSuggestionClick(q)}
                          className="px-4 py-2 text-sm text-[#0B1956] cursor-pointer hover:bg-blue-50 hover:text-blue-700 text-center"
                        >
                          {q}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
          {/* End AI Input */}
        </div>
      </div>
    </div>
  );
};

export default ChatAI;
