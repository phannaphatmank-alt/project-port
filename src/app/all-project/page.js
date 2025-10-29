"use client";

import { useState, useEffect } from "react";
import { supabase } from "../lib/supabaseClient";
import { Icon } from "@iconify/react";
import Link from "next/link";
import Navbar from "@/components/Navbar";

const CATEGORIES = ["All", "Sport", "Academic", "Exchange"];

function ProjectCard({ cover, title, subtitle, id, onDelete }) {
  const [showConfirm, setShowConfirm] = useState(false);

  return (
    <div className="relative rounded-2xl bg-gradient-to-b from-white to-[#E7EEFF] p-2 shadow-[inset_0_3px_16px_rgba(66,108,194,0.22)]">
      <button
        onClick={(e) => { e.preventDefault(); setShowConfirm(true); }}
        className="absolute right-4 top-4 z-30 rounded-full p-1 text-[#426CC2] hover:bg-white/70"
        title="More Options"
      >
        <Icon icon="heroicons:ellipsis-vertical-20-solid" className="h-5 w-5" />
      </button>

      {showConfirm && (
        <div className="absolute right-2 top-10 z-40 w-48 rounded-lg bg-white p-2 shadow-xl ring-1 ring-gray-200">
          <button
            onClick={(e) => {
              e.preventDefault();
              if (window.confirm("Are you sure you want to delete this project?")) onDelete?.(id);
              setShowConfirm(false);
            }}
            className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50"
          >
            <Icon icon="heroicons:trash" className="h-4 w-4" />
            Delete Project
          </button>
          <button
            onClick={(e) => { e.preventDefault(); setShowConfirm(false); }}
            className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
          >
            <Icon icon="heroicons:x-mark" className="h-4 w-4" />
            Cancel
          </button>
        </div>
      )}

      {showConfirm && <div className="fixed inset-0 z-20" onClick={() => setShowConfirm(false)} />}

      <Link href={`/projects/${id}`} className="relative z-10 block cursor-pointer transition-shadow hover:shadow-lg">
        <div className="overflow-hidden rounded-xl">
          <img src={cover || "/images/default.jpg"} alt={title} className="h-48 w-full object-cover" />
        </div>
        <div className="px-2 pb-3 pt-2">
          <div className="text-sm font-bold text-[#0B1956]">{title}</div>
          <div className="truncate text-xs text-[#426CC2]">{subtitle}</div>
        </div>
      </Link>
    </div>
  );
}

function FilterTab({ label, isActive, onClick }) {
  return (
    <button
      onClick={() => onClick(label)}
      className={`rounded-full px-5 py-2 text-sm font-semibold transition-all duration-200 
        ${isActive ? 'bg-[#426CC2] text-white shadow-md' : 'bg-white text-[#426CC2] hover:bg-[#E7EEFF] shadow-inner'}`
      }
    >
      {label}
    </button>
  );
}

export default function AllProject() {
  const [projects, setProjects] = useState([]);
  const [activeCategory, setActiveCategory] = useState("All");
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState(null);

  useEffect(() => {
    // 🔹 ดึง idUser จาก localStorage
    const userDataString = localStorage.getItem("currentUser");
    
    if (!userDataString) {
      console.error("No user logged in");
      setLoading(false);
      return;
    }

    try {
      const userData = JSON.parse(userDataString);
      const userId = userData.idUser;
      
      if (!userId) {
        console.error("User ID not found in localStorage");
        setLoading(false);
        return;
      }

      setCurrentUserId(userId);
      fetchProjects(userId);
    } catch (error) {
      console.error("Error parsing user data:", error);
      setLoading(false);
    }
  }, []);

  const fetchProjects = async (userId) => {
    setLoading(true);
    
    // 🔹 เพิ่ม .eq("idUser", userId) เพื่อดึงเฉพาะโปรเจคของ user ที่ล็อกอิน
    const { data, error } = await supabase
      .from("portfolio")
      .select("*")
      .eq("idUser", userId);
    
    if (error) {
      console.error("Error fetching projects:", error);
      setProjects([]);
    } else {
      setProjects(data || []);
    }
    setLoading(false);
  };

  const deleteProject = async (id) => {
    if (!window.confirm("Are you sure you want to delete this project?")) return;
    
    const { error } = await supabase
      .from("portfolio")
      .delete()
      .eq("idProject", id);
    
    if (error) {
      alert("Delete failed: " + error.message);
    } else {
      setProjects((prev) => prev.filter((p) => p.idProject !== id));
    }
  };

  const filteredProjects = projects.filter((p) =>
    activeCategory === "All" ? true : p.Category === activeCategory
  );

  // 🔹 กรณีไม่มี user ล็อกอิน
  if (!currentUserId && !loading) {
    return (
      <div>
        <Navbar />
        <main className="mx-auto max-w-6xl px-4 py-10 text-slate-900">
          <div className="text-center text-xl font-semibold text-red-600">
            Please log in to view your projects.
          </div>
        </main>
      </div>
    );
  }

  return (
    <div>
      <Navbar />
      <main className="mx-auto max-w-6xl px-4 py-10 text-slate-900">
        <div className="mb-10 flex flex-wrap items-center justify-between gap-4">
          <h1 className="text-2xl font-extrabold tracking-[0.26px] text-[#0B1956]">My Projects</h1>
          <div className="flex gap-3 justify-center">
            {CATEGORIES.map((cat) => (
              <FilterTab key={cat} label={cat} isActive={activeCategory === cat} onClick={setActiveCategory} />
            ))}
          </div>
        </div>

        {loading ? (
          <div className="text-center text-xl text-[#426CC2]">Loading projects...</div>
        ) : filteredProjects.length === 0 ? (
          <div className="text-center text-xl font-semibold text-[#426CC2]/70">No projects found in this category.</div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {filteredProjects.map((p) => (
              <ProjectCard
                key={p.idProject}
                id={p.idProject}
                cover={p.Image}
                title={p.projectName}
                subtitle={p.Position}
                onDelete={deleteProject}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}