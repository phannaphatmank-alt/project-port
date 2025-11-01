// File: src/app/AI/ChatAI.jsx (ฉบับแก้ไขสมบูรณ์: แก้ไข Logic การส่งข้อมูล Project ID และ Description)
"use client";

import * as pdfjsLib from "pdfjs-dist";
import React, { useState, useCallback, useMemo, useRef, useEffect } from "react";
import { Icon } from "@iconify/react";
import Navbar from "@/components/Navbar";


// ตั้งค่า worker (รันเฉพาะฝั่งเบราว์เซอร์เท่านั้น) 
if (typeof window !== "undefined") {
  // ตรวจสอบว่าไฟล์ pdf.worker.min.js อยู่ใน /public/ หรือ /public/pdf.worker.min.js
  pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.js"; 
}

// 💥 Helper function: แปลง Date Object ให้เป็นข้อความที่อ่านง่าย
const formatChatTimestamp = (date) => {
  if (!date) return "";
  const now = new Date();
  const diffInMinutes = Math.floor((now - date) / (1000 * 60));
  const diffInHours = Math.floor(diffInMinutes / 60);

  if (diffInMinutes < 1) return "Just now";
  if (diffInMinutes < 60) return `${diffInMinutes} mins ago`;
  if (diffInHours < 24) return `${diffInHours} hours ago`;
  if (diffInHours < 48) return "Yesterday";
  
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};


function stripFormatting(text = "") {
  let cleaned = text.replace(/\*\*/g, "");
  cleaned = cleaned.replace(/(^|[\r\n])[^\S\r\n]*\*/g, '$1');
  return cleaned;
}

function readTextFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsText(file);
  });
}

async function extractPdfText(file) {
  const arrayBuffer = await file.arrayBuffer();
  const task = pdfjsLib.getDocument({ data: arrayBuffer });
  const pdf = await task.promise;

  let text = "";
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    text += content.items.map((it) => it.str).join(" ") + "\n";
  }
  return text.trim();
}

// 💥 แก้ไข: เพิ่ม projects เข้ามาใน Props
const promptGemini = async ({ question, file, selectedProjects = [], projects = [], profile = null , course = []}) => {
  let projectPaths = []; 
  
  // 1. ใช้ ID ใน selectedProjects ไปหา OBJECT โปรเจกต์ที่ถูกเลือก
  const selectedProjectObjects = selectedProjects.map(id => {
      // projects ที่รับมาจาก props จะถูกใช้ที่นี่
      const project = projects.find(p => p.id === id); 
      return project || null; 
  }).filter(obj => obj !== null); 
  
  // 2. จัดรูปแบบข้อมูลโปรเจกต์ที่เลือกทั้งหมด (Title, Subtitle, Description)
  //    เพื่อให้ AI มีข้อมูลเพียงพอสำหรับการวิเคราะห์
  const projectsText = selectedProjectObjects.length
    ? selectedProjectObjects.map((p, i) => {
        // ใช้ p.title ซึ่งถูก map มาจาก projectName ใน API Route แล้ว
        return `
--- Project ${i + 1}: ${p.title} ---
Role/Category: ${p.subtitle} 
Description: ${p.description} 
`; 
    }).join("\n")
    : "(ยังไม่ได้เลือกโปรเจกต์จาก My Project)"; 

      // ✅ 3. เพิ่มข้อมูล Profile
  const profileText = profile 
    ? `
--- ข้อมูลการศึกษา ---
สถาบัน: ${profile.institution || 'ไม่ระบุ'}
คณะ: ${profile.faculty || 'ไม่ระบุ'}
สาขา: ${profile.major || 'ไม่ระบุ'}
ระดับการศึกษา: ${profile.educationLevel || 'ไม่ระบุ'}
GPA: ${profile.gpa || 'ไม่ระบุ'}
`
    : "(ยังไม่มีข้อมูลการศึกษา)";
    const courseText = course && course.length > 0
    ? `
--- รายวิชาที่เรียน (${course.length} วิชา) ---
${course.map((c, i) => `${i + 1}. ${c.courseCode}: ${c.courseName}${c.courseDescription ? `\n   - ${c.courseDescription}` : ''}`).join('\n')}
`
    : "(ยังไม่มีข้อมูลรายวิชา)";
    
  let fileData = "";
  if (file) {
    try {
      if (file.type === "application/pdf") {
        fileData = await extractPdfText(file);
      } else if (file.type.startsWith("text/")) {
        fileData = await readTextFile(file);
      } else {
        fileData = "(ไฟล์ชนิดนี้ยังไม่รองรับ ให้แปลงเป็น PDF หรือ TXT ก่อน)";
      }
    } catch (e) {
      console.error("อ่านไฟล์ไม่สำเร็จ:", e);
      fileData = `(อ่านไฟล์ไม่สำเร็จ: ${e.message || "Unknown error"})`;
    }
  }

const system = `
You are a portfolio/career coach for the user.
Answer ONLY using the user's education background, course taken, projects, and uploaded file content below.
Never mention store opening hours, school semesters, or teacher instructions unless they appear in the data.
Write answers in Thai, concise but practical with bullet points when helpful.
Consider the user's educational background, course studied, and GPA when giving career advice.
Analyze how their coursework aligns with their projects and career goals.
If the needed info is not present, say: "ไม่พบข้อมูลในไฟล์/โปรเจกต์ของคุณ" and ask a focused follow-up question.`;

  const promptText = `${system}

[User's Education Background]
${profileText}

[User's Course]
${courseText}

[User's Projects]
${projectsText}

[Uploaded File]
${fileData || "(no file provided)"}

[User Question]
${question}
`;

  const res = await fetch("/api/gemini", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ 
        prompt: promptText, 
        model: "gemini-2.5-pro",
        projectPaths: projectPaths, 
    }),
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(await res.text());
  }

  const data = await res.json();
  const cleaned = stripFormatting(data?.text ?? "");
  return cleaned;
};


export default function ChatAI() {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [chats, setChats] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [mode, setMode] = useState("upload");
  const [selectedFile, setSelectedFile] = useState(null);
  // selectedProjects เก็บ ID ของโปรเจกต์
  const [selectedProjects, setSelectedProjects] = useState([]); 
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  
  const [dynamicProjects, setDynamicProjects] = useState([]);
  const [projectsLoading, setProjectsLoading] = useState(true);
  const [userProfile, setUserProfile] = useState(null);
  const [userCourse, setUserCourse] = useState([]);
  
  // -----------------------------------------------------------
  // Auto-Resize Logic (เดิม)
  // -----------------------------------------------------------
  const textareaRef = useRef(null);
  const [minTextareaHeight, setMinTextareaHeight] = useState(60); 
  const maxTextareaHeight = 200; 
  const [isExpanded, setIsExpanded] = useState(false); 

  useEffect(() => {
    if (textareaRef.current) {
        textareaRef.current.style.height = 'auto'; 
        const actualMinHeight = textareaRef.current.scrollHeight;
        setMinTextareaHeight(actualMinHeight);
        textareaRef.current.style.height = `${actualMinHeight}px`;
    }
  }, []); 

  
  const adjustTextareaHeight = useCallback(() => {
    if (textareaRef.current && minTextareaHeight > 0) { 
      textareaRef.current.style.height = 'auto';
      
      let newHeight = textareaRef.current.scrollHeight;
      
      if (newHeight < minTextareaHeight) {
          newHeight = minTextareaHeight;
      }
      if (newHeight > maxTextareaHeight) {
          newHeight = maxTextareaHeight;
      }
      
      textareaRef.current.style.height = `${newHeight}px`;

      const isActuallyExpanded = newHeight > minTextareaHeight;
      setIsExpanded(isActuallyExpanded);
    }
  }, [minTextareaHeight, maxTextareaHeight]); 

  useEffect(() => {
    adjustTextareaHeight();
  }, [inputValue, adjustTextareaHeight]);
  // -----------------------------------------------------------
  // END: Auto-Resize Logic
  // -----------------------------------------------------------

  // -----------------------------------------------------------
  // Fetch Projects from Supabase via API Route (เดิม)
  // -----------------------------------------------------------
// ส่วนที่ต้องแก้ไขใน ChatAI.jsx
// แทนที่โค้ดเดิมใน useEffect ที่ fetch projects

// ============================================
// 3. แก้ไข useEffect ให้ fetch ทั้ง Projects และ Profile
// ============================================
useEffect(() => {
  const fetchUserData = async () => {
    try {
      // ✅ ดึง userId จาก localStorage
      const storedUser = localStorage.getItem("currentUser");
      
      if (!storedUser) {
        console.error("❌ User not logged in");
        setDynamicProjects([]);
        setUserProfile(null);
        setUserCourse([]);
        setProjectsLoading(false);
        return;
      }

      const currentUser = JSON.parse(storedUser);
      
      if (!currentUser || !currentUser.idUser) {
        console.error("❌ User ID not found in localStorage");
        setDynamicProjects([]);
        setUserProfile(null);
        setUserCourse([]);
        setProjectsLoading(false);
        return;
      }

      console.log("🔍 Fetching data for user:", currentUser.idUser);

      const headers = {
        "x-user-id": String(currentUser.idUser),
      };

      // ✅ Fetch Projects
      try {
        const projectsRes = await fetch("/api/projects", { headers });
        console.log("📡 Projects response status:", projectsRes.status);

        if (projectsRes.ok) {
          const projectsData = await projectsRes.json();
          console.log("✅ Projects loaded:", projectsData.length);
          setDynamicProjects(projectsData);
        } else {
          const errorText = await projectsRes.text();
          console.error("❌ Failed to fetch projects:", errorText);
          setDynamicProjects([]);
        }
      } catch (err) {
        console.error("❌ Error fetching projects:", err);
        setDynamicProjects([]);
      }

      // ✅ Fetch Profile
      try {
        const profileRes = await fetch("/api/profile", { headers });
        console.log("📡 Profile response status:", profileRes.status);

        if (profileRes.ok) {
          const profileData = await profileRes.json();
          console.log("✅ Profile loaded:", profileData);
          setUserProfile(profileData);
        } else {
          console.warn("⚠️ Profile not found or error loading");
          setUserProfile(null);
        }
      } catch (err) {
        console.warn("⚠️ Error fetching profile:", err);
        setUserProfile(null);
      }

            // ✅ Fetch Course(เพิ่มใหม่)
      try {
        const courseRes = await fetch("/api/course", { headers });
        console.log("📡 Course response status:", courseRes.status);

        if (courseRes.ok) {
          const courseData = await courseRes.json();
          console.log("✅ Course loaded:", courseData.length);
          setUserCourse(courseData);
        } else {
          console.warn("⚠️ Course not found or error loading");
          setUserCourse([]);
        }
      } catch (err) {
        console.warn("⚠️ Error fetching course:", err);
        setUserCourse([]);
      }

      setProjectsLoading(false);

    } catch (err) {
      console.error("❌ Error in fetchUserData:", err);
      setDynamicProjects([]);
      setUserProfile(null);
      setUserCourse([]);
      setProjectsLoading(false);
    }
  };

  fetchUserData();
}, []);
  
  const projects = dynamicProjects; 

  const [chatHistory, setChatHistory] = useState([
    { id: 1, title: "แนะนำสายงานที่เหมาะ", date: new Date(Date.now() - 120 * 60 * 1000), chats: [] }, 
    { id: 2, title: "วิเคราะห์ทักษะจากโปรเจกต์", date: new Date(Date.now() - 26 * 60 * 60 * 1000), chats: [] }, 
    { id: 3, title: "กิจกรรมที่ควรเน้นใน Resume", date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), chats: [] }, 
  ]);
  const [currentChatId, setCurrentChatId] = useState(null);

  const toggleSuggestionBox = useCallback(() => setShowSuggestions(v => !v), []);
  const toggleModal = useCallback(() => setShowModal(v => !v), []);
  const toggleSidebar = useCallback(() => setSidebarOpen(v => !v), []);

  // 💥 แก้ไข: เปลี่ยนจากรับ (title) เป็นรับ (id) ของโปรเจกต์
  const toggleProjectSelect = useCallback((id) => {
    setSelectedProjects((prev) =>
      // 💥 ตรวจสอบและ Toggle ด้วย ID
      prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]
    );
  }, []);

  const handleSuggestionClick = useCallback((text) => {
    setInputValue(text);
    setShowSuggestions(false);
  }, []);
  
  // --- DRAG AND DROP HANDLERS (เดิม) ---
  const handleDragOver = useCallback((e) => {
    e.preventDefault(); 
    setIsDragging(true); 
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragging(false); 
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFile = e.dataTransfer.files[0];
      
      const acceptedExtensions = ['.pdf', '.txt', '.md', '.csv'];
      const fileExtension = droppedFile.name.toLowerCase().substring(droppedFile.name.lastIndexOf('.'));
      
      if (acceptedExtensions.includes(fileExtension) || droppedFile.type.includes('pdf') || droppedFile.type.includes('text')) {
          setSelectedFile(droppedFile);
      } else {
          alert('ไม่รองรับไฟล์ชนิดนี้ กรุณาเลือกไฟล์ PDF, TXT, MD, หรือ CSV');
          setSelectedFile(null);
      }
      
      e.dataTransfer.clearData();
    }
  }, []);
  // --- END DRAG AND DROP HANDLERS ---

  const sendMessage = useCallback(async () => {
    const message = inputValue.trim();
    if (!message || loading) return;

    setChats((prev) => [
      ...prev,
      { sender: "user", text: message, fileName: selectedFile?.name || undefined },
    ]);
    setInputValue("");
    setLoading(true);

    try {
      const answer = await promptGemini({
        question: message,
        file: selectedFile || null,
        selectedProjects,
        projects, // 💥 ส่ง projects (dynamicProjects) เข้าไป
        profile: userProfile,
        course: userCourse,
      });
      setChats((prev) => [...prev, { sender: "bot", text: answer || "No response." }]);
    } catch (err) {
      console.error("Error calling Gemini API:", err);
      setChats((prev) => [...prev, { sender: "bot", text: "ขออภัย เกิดข้อผิดพลาดในการเรียก AI 😢" }]);
    } finally {
      setLoading(false);
    }
  }, [inputValue, loading, selectedFile, selectedProjects, projects, userProfile, userCourse]); // 💥 เพิ่ม projects ใน Dependencies

  const handleAnalyze = useCallback(async () => {
    // 💥 ปรับปรุง: ใช้ selectedProjects (ที่เป็น ID) เพื่อดึง Title มาแสดงใน UI
    const selectedProjectTitles = selectedProjects.map(id => {
        const project = projects.find(p => p.id === id); 
        return project ? project.title : null;
    }).filter(title => title !== null);

    const parts = [];
    // แสดง Title ของโปรเจกต์ที่เลือกในข้อความที่ส่งไปให้ AI
    if (selectedProjectTitles.length) parts.push(`Analyze my selected projects: ${selectedProjectTitles.join(", ")}`);
    if (inputValue.trim()) parts.push(inputValue.trim());
    const finalQuestion = parts.join(" | ") || "Analyze my skills based on the provided information.";

    setShowModal(false);
    setChats((prev) => [
      ...prev,
      { sender: "user", text: finalQuestion, fileName: selectedFile?.name || undefined },
    ]);
    setLoading(true);
    setInputValue("");

    try {
      const answer = await promptGemini({
        question: finalQuestion,
        file: selectedFile || null,
        selectedProjects,
        projects, // 💥 ส่ง projects (dynamicProjects) เข้าไป
        profile: userProfile,
        course: userCourse,
      });
      setChats((prev) => [...prev, { sender: "bot", text: answer || "No response." }]);
    } catch (err) {
      console.error("Error calling Gemini API:", err);
      setChats((prev) => [
        ...prev,
        { sender: "bot", text: "ขออภัย เกิดข้อผิดพลาดในการวิเคราะห์ไฟล์/โปรเจกต์ 😢" },
      ]);
    } finally {
      setLoading(false);
    }
  }, [inputValue, selectedFile, selectedProjects, projects, userProfile, userCourse]); // 💥 เพิ่ม projects ใน Dependencies

  const createNewChat = useCallback(() => {
    if (chats.length > 0) {
      const newChatDate = new Date(); 
      const newChat = {
        id: Date.now(),
        title: stripFormatting(chats[0]?.text?.substring(0, 30) || "New Chat"), 
        date: newChatDate, 
        chats: [...chats],
      };
      setChatHistory((prev) => [newChat, ...prev]);
    }
    setChats([]);
    setSelectedFile(null);
    setSelectedProjects([]);
    setInputValue("");
    setCurrentChatId(null);
  }, [chats]);

  const loadChatHistory = useCallback((chatId) => {
    const chat = chatHistory.find((c) => c.id === chatId);
    if (chat) {
      setChats(chat.chats);
      setCurrentChatId(chatId);
    }
  }, [chatHistory]);

  const deleteChatHistory = useCallback((chatId, e) => {
    e.stopPropagation();
    setChatHistory((prev) => prev.filter((c) => c.id !== chatId));
    if (currentChatId === chatId) {
      setChats([]);
      setCurrentChatId(null);
    }
  }, [currentChatId]);

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter' && !e.shiftKey && !e.ctrlKey) {
        e.preventDefault(); 
        sendMessage(); 
    }
  }, [sendMessage]);


  const iconPositionClass = isExpanded
      ? "!bottom-3" 
      : "top-1/2 -translate-y-1/2"; 
 
  return (
    
    <div className="flex h-screen bg-white">
      {/* Sidebar (โค้ดเดิม) */}
      
      <div
        className={`${sidebarOpen ? "w-64" : "w-0"}transition-all duration-300 bg-gradient-to-b from-slate-50 to-slate-100 border-r border-slate-200 flex flex-col overflow-hidden mt-16`}
      >
        {sidebarOpen && (
          <>
            <div className="p-4 border-b border-slate-200">
              <button
                onClick={createNewChat}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl
                          bg-gradient-to-b from-white to-[#E7EEFF]
                          shadow-[inset_0_3px_16px_rgba(66,108,194,0.22)]
                          hover:shadow-[inset_0_5px_20px_rgba(66,108,194,0.3)]
                          transition-all duration-200 text-[#0B1956] font-semibold"
              >
                <Icon icon="mdi:plus" className="w-5 h-5" />
                New Chat
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-3">
              <div className="text-xs font-semibold text-slate-500 mb-2 px-2">RECENT CHATS</div>
              {chatHistory.map((chat) => (
                <div
                  key={chat.id}
                  onClick={() => loadChatHistory(chat.id)}
                  className={`group relative mb-2 p-3 rounded-lg cursor-pointer transition-all duration-200
                    ${currentChatId === chat.id
                      ? "bg-gradient-to-b from-white to-[#E7EEFF] shadow-[inset_0_3px_16px_rgba(66,108,194,0.22)]"
                      : "hover:bg-white/50"}`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-[#0B1956] truncate">
                        {chat.title}
                      </div>
                      <div className="text-xs text-slate-500 mt-1">{formatChatTimestamp(chat.date)}</div>
                    </div>
                    <button
                      onClick={(e) => deleteChatHistory(chat.id, e)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-red-100 rounded"
                      aria-label="Delete chat"
                    >
                      <Icon icon="mdi:trash-can-outline" className="w-4 h-4 text-red-500" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-4 border-t border-slate-200">
              <div className="text-xs text-slate-500 text-center ">
                Portfolio AI Assistant
              </div>
            </div>
          </>
        )}
      </div>

      {/* Main (โค้ดเดิม) */}
      <div className="flex-1 flex flex-col relative">
       <div className="fixed top-0 left-0 w-full z-50 bg-white shadow-md">
    <Navbar />
  </div>
        <button
          onClick={toggleSidebar}
          className="absolute mt-14 top-4 left-4 z-10 p-2 rounded-lg bg-white shadow-md hover:shadow-lg transition-all"
          aria-label="Toggle sidebar"
        >
          <Icon icon={sidebarOpen ? "mdi:menu-open" : "mdi:menu"} className="w-6 h-6 text-[#426CC2]" />
        </button>

        {/* Chat Area (โค้ดเดิม) */}
        <div className="flex-1 overflow-y-auto px-4 py-6 md:py-8 mt-10">
          <div className={`mx-auto max-w-3xl ${sidebarOpen ? "pl-12" : "pl-16"} transition-all duration-300`}>
            {chats.length === 0 && (
              <div className="text-center py-12 mt-10 ">
                <h1 className="text-4xl font-bold text-[#0B1956] mb-4">Portfolio AI Assistant</h1>
                <p className="text-slate-600 mb-8">วิเคราะห์ทักษะและโปรเจกต์ของคุณด้วย AI</p>
              </div>
            )}

            <div className="flex flex-col gap-4 mb-32">
              {chats.map((c, i) => (
                <div key={i} className={`flex ${c.sender === "user" ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`px-5 py-3 rounded-2xl max-w-[75%] break-words
                      shadow-[inset_0_3px_16px_rgba(66,108,194,0.22)]
                      bg-gradient-to-b from-white to-[#E7EEFF]
                      ${c.sender === "user" ? "rounded-br-md" : "rounded-bl-md"}`}
                  >
                    {c.fileName && (
                      <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-700">
                        <Icon icon="mdi:paperclip" className="w-4 h-4" />
                        <span className="truncate max-w-[200px]">{c.fileName}</span>
                      </div>
                    )}
                    <div className="text-[#0B1956] whitespace-pre-wrap">{c.text}</div> 
                  </div>
                </div>
              ))}

              {loading && (
                <div className="flex justify-start">
                  <div className="px-5 py-3 rounded-2xl rounded-bl-md bg-gradient-to-b from-white to-[#E7EEFF] shadow-[inset_0_3px_16px_rgba(66,108,194,0.22)]">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-[#426CC2] rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                      <div className="w-2 h-2 bg-[#426CC2] rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                      <div className="w-2 h-2 bg-[#426CC2] rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* AI Input */}
        <div
          className="fixed bottom-0 bg-gradient-to-t from-white via-white to-transparent pt-6 pb-8"
          style={{ left: sidebarOpen ? "256px" : "0", right: "0", transition: "left 0.3s" }}
        >
          <div className="mx-auto max-w-3xl px-4">
            <div className="relative rounded-3xl bg-gradient-to-b from-slate-50 to-slate-100 p-[2px]">
              <div className={`relative flex ${isExpanded ? 'items-end' : ''}`}> 
                <textarea
                  ref={textareaRef} 
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Analyze your skills based on past projects"
                  rows={1}
                  onKeyDown={handleKeyDown} 
                  style={{ height: `${minTextareaHeight}px` }} 
                  className="w-full rounded-3xl px-6 py-4 pr-32 outline-none
                             bg-gradient-to-b from-white to-[#E7EEFF]
                             shadow-[inset_0_3px_16px_rgba(66,108,194,0.22)]
                             text-[#0B1956] placeholder:text-slate-400 
                             resize-none overflow-y-auto" 
                  disabled={loading}
                />
                
                <div className={`absolute right-3 flex items-center gap-1 ${iconPositionClass}
                    ${isExpanded ? 'top-auto !transform-none' : ''}
                `}>
                  <button
                    className="p-2 rounded-full hover:bg-blue-50 transition duration-150"
                    onClick={toggleModal}
                    disabled={loading}
                    aria-label="Add file or select project"
                  >
                    <Icon icon="ic:round-add" className="w-6 h-6 text-[#426CC2]" />
                  </button>

                  <button
                    className="p-2 rounded-full hover:bg-blue-50 transition duration-150"
                    onClick={toggleSuggestionBox}
                    disabled={loading}
                    aria-label="Suggestions"
                  >
                    <Icon icon="hugeicons:ai-idea" className="w-6 h-6 text-[#426CC2]" />
                  </button>

                  <button
                    className="p-2 rounded-full hover:bg-blue-50 transition duration-150 bg-blue-100"
                    onClick={sendMessage}
                    disabled={loading}
                    aria-label="Send"
                  >
                    <Icon icon="iconamoon:send" className="w-6 h-6 text-[#426CC2]" />
                  </button>
                </div>

                {showSuggestions && (
                  <div className="absolute right-0 bottom-full mb-3 w-72 rounded-2xl overflow-hidden z-50 border border-gray-50
                                  bg-gradient-to-b from-white to-[#E7EEFF] shadow-[inset_0_3px_16px_rgba(66,108,194,0.22)]">
                    <div className="p-4 font-bold text-[#0B1956] border-b border-gray-100 text-center">คำถามแนะนำ</div>
                    <ul>
                      {["แนะนำสายงานที่เหมาะ", "3 ชิ้นงานเด่น", "กิจกรรมที่ควรเน้นใน Resume", "ทักษะหลักที่โดดเด่น"].map((q, i) => (
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
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/30 backdrop-blur-sm z-50">
          <div className="bg-white w-[600px] max-w-[92vw] rounded-3xl shadow-xl p-6">
            <div className="flex justify-center items-center mb-4 relative">
              <h2 className="text-xl font-bold text-[#0B1956]">Analyze a Project</h2>
              <button onClick={toggleModal} className="absolute right-0" aria-label="Close modal">
                <Icon icon="mdi:close" className="w-6 h-6 text-slate-500 hover:text-slate-700" />
              </button>
            </div>

            <div className="flex justify-center gap-4 mb-6">
              <button
                className={`px-4 py-2 rounded-full ${
                  mode === "upload"
                    ? "bg-gradient-to-b from-white to-[#E7EEFF] shadow-[inset_0_3px_16px_rgba(66,108,194,0.22)]"
                    : "bg-slate-100"
                }`}
                onClick={() => setMode("upload")}
              >
                Upload
              </button>
              <button
                className={`px-4 py-2 rounded-full ${
                  mode === "select"
                    ? "bg-gradient-to-b from-white to-[#E7EEFF] shadow-[inset_0_3px_16px_rgba(66,108,194,0.22)]"
                    : "bg-slate-100"
                }`}
                onClick={() => setMode("select")}
              >
                Select from My Project
              </button>
            </div>

            {mode === "upload" ? (
              <div 
                  className={`border-2 border-dashed rounded-2xl p-10 text-center text-slate-600
                              shadow-[inset_0_3px_16px_rgba(66,108,194,0.22)]
                              ${isDragging 
                                ? 'border-blue-500 bg-blue-50' 
                                : 'border-slate-300 bg-gradient-to-b from-white/70 to-[#E7EEFF]/50'
                              }`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
              >
                <Icon icon="material-symbols:upload-rounded" className="mx-auto mb-2 w-10 h-10 text-[#426CC2]" />
                
                <p className="font-semibold text-[#0B1956]">
                  {isDragging ? 'วางไฟล์ที่นี่เพื่ออัปโหลด' : 'Drag and drop a file here, or'}
                </p>

                <input
                  type="file"
                  id="fileInput"
                  accept=".pdf,.txt,.md,.csv"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) setSelectedFile(file);
                    e.target.value = null; 
                  }}
                />

                <button
                  className="mt-3 px-4 py-2 rounded-full bg-[#E7EEFF] hover:bg-blue-100
                             bg-gradient-to-b from-white/70 to-[#E7EEFF]/50
                             shadow-[inset_0_3px_16px_rgba(66,108,194,0.22)]"
                  onClick={() => document.getElementById("fileInput").click()}
                >
                  Choose file
                </button>

                {selectedFile && (
                  <p className="mt-2 text-sm text-[#0B1956]">
                    Selected file: <span className="font-semibold">{selectedFile.name}</span>
                    <button 
                        onClick={() => setSelectedFile(null)} 
                        className="ml-2 text-red-500 hover:text-red-700"
                        aria-label="Remove file"
                    >
                        <Icon icon="mdi:close-circle-outline" className="inline w-4 h-4" />
                    </button>
                  </p>
                )}
              </div>
            ) : (
              // ส่วน Select Project
              <div className="flex gap-4 overflow-x-auto">
                {projectsLoading ? (
                    // แสดง Loading
                    <div className="w-full text-center py-4 text-slate-500">
                        <Icon icon="mdi:loading" className="w-6 h-6 animate-spin inline-block mr-2" />
                        Loading projects...
                    </div>
                ) : (
                    projects.map((p, i) => { 
                      // 💥 isSelected ต้องตรวจสอบด้วย Project ID
                      const isSelected = selectedProjects.includes(p.id); 
                      return (
                        <div
                          key={p.id || i} // ใช้ p.id เป็น key
                          className={`relative flex-shrink-0 w-48 rounded-2xl overflow-hidden
                                      bg-gradient-to-b from-white to-[#E7EEFF]
                                      shadow-[inset_0_3px_16px_rgba(66,108,194,0.22)]
                                      cursor-pointer transition-transform hover:scale-102`}
                          // 💥 onClick ต้องส่ง Project ID
                          onClick={() => toggleProjectSelect(p.id)} 
                          style={{ border: isSelected ? "2px solid #0B1956" : "2px solid transparent" }}
                        >
                          <img src={p.cover} alt={p.title} className="h-28 w-full object-cover" />
                          <div className="p-2 text-center font-semibold text-[#0B1956]">{p.title}</div>
                          <div className="p-1 text-xs text-[#0B1956] text-center">{p.subtitle}</div>
                        </div>
                      );
                    })
                )}
                
                {/* กรณีไม่มีข้อมูลโปรเจกต์ */}
                {!projectsLoading && projects.length === 0 && (
                    <div className="w-full text-center py-4 text-slate-500">
                        ไม่พบข้อมูลโปรเจกต์ในฐานข้อมูล
                    </div>
                )}
              </div>
            )}

            {/* Modal Footer (เดิม) */}
            <div className="flex justify-between mt-6">
              <button
                onClick={toggleModal}
                className="px-6 py-2 rounded-full bg-gradient-to-b from-white to-red-100 hover:from-red-50 hover:to-red-200 text-red-700 font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleAnalyze}
                disabled={loading || (!selectedFile && selectedProjects.length === 0)}
                className={`px-6 py-2 rounded-full font-semibold transition-all duration-200
                  ${loading || (!selectedFile && selectedProjects.length === 0) 
                    ? "bg-slate-300 text-slate-500 cursor-not-allowed" 
                    : "bg-gradient-to-b from-white to-green-100 hover:from-green-50 hover:to-green-200 text-green-700"
                  }`}
              >
                Analyze with AI
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}