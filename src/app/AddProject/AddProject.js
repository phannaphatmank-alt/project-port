"use client";

import { useState, useRef, useEffect } from "react";
import { Icon } from "@iconify/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "../lib/supabaseClient";
import { uploadProjectImage } from "../lib/uploadProjectImage";

/* ---------- config ---------- */
const DEFAULT_COVER = "/images/default.jpg";

/* ---------- small components ---------- */
function ProjectCard({ cover, title, subtitle, onDelete, id }) {
  const [showConfirm, setShowConfirm] = useState(false);
  const validImage = cover && !cover.startsWith("blob:") ? cover : DEFAULT_COVER;

  return (
    <div className="rounded-2xl bg-gradient-to-b from-white to-[#E7EEFF] shadow-[inset_0_3px_16px_rgba(66,108,194,0.22)] p-2 relative">
      <button
        onClick={() => setShowConfirm(true)}
        className="absolute top-4 right-4 z-30 p-1 rounded-full text-[#426CC2] hover:bg-white/70 transition-all duration-200"
      >
        <Icon icon="heroicons:ellipsis-vertical-20-solid" className="h-5 w-5" />
      </button>

      {showConfirm && (
        <div className="absolute top-10 right-2 z-40 w-48 rounded-lg bg-white shadow-xl p-2 ring-1 ring-gray-200">
          <button
            onClick={() => {
              onDelete();
              setShowConfirm(false);
            }}
            className="flex items-center gap-2 w-full px-3 py-2 text-sm text-left rounded-md text-red-600 hover:bg-red-50"
          >
            <Icon icon="heroicons:trash" className="h-4 w-4" /> Delete Project
          </button>
          <button
            onClick={() => setShowConfirm(false)}
            className="flex items-center gap-2 w-full px-3 py-2 text-sm text-left rounded-md text-gray-700 hover:bg-gray-50"
          >
            <Icon icon="heroicons:x-mark" className="h-4 w-4" /> Cancel
          </button>
        </div>
      )}

      {showConfirm && (
        <div
          className="fixed inset-0 z-20"
          onClick={() => setShowConfirm(false)}
        />
      )}

      <Link
        href={`/projects/${id}`}
        className="block relative z-10 cursor-pointer hover:shadow-lg transition-shadow duration-200"
      >
        <div className="overflow-hidden rounded-xl">


          <img
            src={validImage}
            onError={(e) => (e.currentTarget.src = DEFAULT_COVER)}
            alt={title}
            className="h-48 w-full object-cover"
          />
        </div>
        <div className="px-2 pb-3 pt-2">
          <div className="text-sm font-bold text-[#0B1956]">{title}</div>
          <div className="truncate text-xs text-[#426CC2]">{subtitle}</div>
        </div>
      </Link>
    </div>
  );
}

function AddCard({ onClick }) {
  return (
    <button
      onClick={onClick}
      className="group flex h-full w-full items-center justify-center rounded-2xl bg-gradient-to-b from-white to-[#E7EEFF] p-6 shadow-[inset_0_6px_20px_rgba(66,108,194,0.18)] transition hover:border-[#426CC2]/60"
    >
      <div className="flex flex-col items-center gap-2 text-[#426CC2]">
        <span className="inline-flex h-14 w-14 items-center justify-center rounded-xl border-2 border-current">
          <Icon icon="heroicons:plus" className="h-7 w-7" />
        </span>
        <span className="text-sm font-semibold">Add Project</span>
      </div>
    </button>
  );
}

/* ---------- Modal ---------- */
function Modal({ open, onClose, onCreate }) {
  const [projectName, setProjectName] = useState("");
  const [Position, setPosition] = useState("");
  const [Location, setLocation] = useState("");
  const [Date, setDate] = useState("");
  const [Description, setDescription] = useState("");
  const [Category, setCategory] = useState("");
  const [Image, setImage] = useState([]);
  const [files, SetFiles] = useState([]);
  const inputRef = useRef(null);

  if (!open) return null;

  function handleFile(e) {
    const picked = Array.from(e.target.files || []);
    if (picked.length === 0) return;
    const previews = picked.map((file) => URL.createObjectURL(file));
    setImage((prev) => [...prev, ...previews]);
    SetFiles((prev) => [...prev, ...picked]);
    e.target.value = "";
  }

  async function submit(e) {
    e.preventDefault();

    // ✅ ดึง user ปัจจุบัน
    const currentUser = JSON.parse(localStorage.getItem("currentUser") || "{}");
    const idUser = currentUser?.idUser;

    let imageUrl = DEFAULT_COVER;
    if (files[0]) {
      try {
        imageUrl = await uploadProjectImage(files[0], idUser.idUser); // << ได้ URL จริง
      } catch (err) {
        console.error("Upload failed:", err);
        alert("อัปโหลดรูปไม่สำเร็จ");
        return;
      }
    }

    // ✅ ส่งไปยัง onCreate พร้อม URL ที่อัปโหลด
    const success = await onCreate({
      projectName,
      Position,
      Location,
      Date,
      Description,
      Category,
      Image: imageUrl, // ✅ URL จริง ไม่ใช่ blob
    });

    if (success) {
      setProjectName("");
      setPosition("");
      setLocation("");
      setDate("");
      setDescription("");
      setCategory("");
      setImage([]);
      SetFiles([]);
      onClose();
    }
  }

  return (
    <div className="fixed inset-0 z-50">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="absolute left-1/2 top-1/2 w-[800px] h-[625px] -translate-x-1/2 -translate-y-1/2 rounded-3xl bg-white p-5 md:p-8 shadow-xl overflow-y-auto">
        <div className="mb-4 relative h-10">
          <h3 className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 font-extrabold text-[#0B1956] text-3xl">
            Create a New Project !
          </h3>
          <button
            onClick={onClose}
            className="absolute right-0 top-1/2 -translate-y-1/2 rounded-full p-2 text-[#0B1956]/70 hover:bg-slate-100"
          >
            <Icon icon="heroicons:x-mark" className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={submit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-sm font-semibold text-[#0B1956]">
              Project Name
            </label>
            <input
              className="w-full rounded-full px-5 py-3 outline-none bg-gradient-to-b from-white to-[#E7EEFF] shadow-[inset_0_3px_16px_rgba(66,108,194,0.22)]"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-semibold text-[#0B1956]">
              Position
            </label>
            <input
              className="w-full rounded-full px-5 py-3 outline-none bg-gradient-to-b from-white to-[#E7EEFF] shadow-[inset_0_3px_16px_rgba(66,108,194,0.22)]"
              value={Position}
              onChange={(e) => setPosition(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-semibold text-[#0B1956]">
              Location
            </label>
            <input
              className="w-full rounded-full px-5 py-3 outline-none bg-gradient-to-b from-white to-[#E7EEFF] shadow-[inset_0_3px_16px_rgba(66,108,194,0.22)]"
              value={Location}
              onChange={(e) => setLocation(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-semibold text-[#0B1956]">
              Date
            </label>
            <input
              type="date"
              className="w-full rounded-full px-5 py-3 outline-none bg-gradient-to-b from-white to-[#E7EEFF] shadow-[inset_0_3px_16px_rgba(66,108,194,0.22)]"
              value={Date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>

          <div className="md:col-span-2">
            <label className="mb-1 block text-sm font-semibold text-[#0B1956]">
              Description
            </label>
            <textarea
              rows={4}
              className="w-full rounded-xl px-5 py-3 outline-none bg-gradient-to-b from-white to-[#E7EEFF] shadow-[inset_0_3px_16px_rgba(66,108,194,0.22)]"
              value={Description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-semibold text-[#0B1956]">
              Category
            </label>
            <select
              className="w-full appearance-none rounded-full px-5 py-3 pr-10 outline-none bg-gradient-to-b from-white to-[#E7EEFF] shadow-[inset_0_3px_16px_rgba(66,108,194,0.22)] text-[#0B1956]"
              value={Category}
              onChange={(e) => setCategory(e.target.value)}
              required
            >
              <option value="" disabled>
                Select Category
              </option>
              <option value="Sport">Sport</option>
              <option value="Academic">Academic</option>
              <option value="Exchange">Exchange</option>
            </select>
          </div>

          <div className="relative md:col-span-2">
            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleFile}
              className="hidden"
            />
            <label className="mb-1 block text-sm font-semibold text-[#0B1956]">
              Image
            </label>
            <div className="relative">
              <div className="w-full rounded-full px-5 py-3 outline-none bg-gradient-to-b from-white to-[#E7EEFF] shadow-[inset_0_3px_16px_rgba(66,108,194,0.22)] h-11.5 relative" />
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                className="absolute right-7 top-8 flex h-7 w-7 items-center justify-center rounded-full text-[#0B1956] hover:bg-white/50 transition"
              >
                <Icon
                  icon="material-symbols:upload-rounded"
                  className="h-5 w-5 text-[#0B1956]"
                />
              </button>
            </div>

            {Image.length > 0 && (
              <div className="mt-3 grid grid-cols-5 gap-2">
                {Image.map((url, index) => (
                  <img
                    key={index}
                    src={url}
                    alt={`preview-${index}`}
                    className="h-16 w-full rounded-md object-cover ring-1 ring-[#426CC2]/30"
                  />
                ))}
              </div>
            )}
          </div>

          <div className="md:col-span-2 mt-2 flex justify-center gap-60">
            <button
              type="button"
              onClick={onClose}
              className="rounded-full px-5 py-3 outline-none bg-gradient-to-b from-white to-[#e46e63] shadow-[inset_0_3px_16px_rgba(0,0,0,0.1)] font-bold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-full px-5 py-3 outline-none bg-gradient-to-b from-white to-[#6bd09e] shadow-[inset_0_3px_16px_rgba(0,0,0,0.1)] font-bold"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ---------- main page ---------- */
export default function HomePage() {
  const router = useRouter();
  const [projects, setProjects] = useState([]);
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);

  // ✅ อ่าน user จาก localStorage แทน supabase.auth
  useEffect(() => {
    try {
      const storedUser = localStorage.getItem("currentUser");
      if (storedUser) {
        const userData = JSON.parse(storedUser);
        console.log("✅ User loaded:", userData);
        setUser(userData);
      } else {
        console.log("❌ No user found, redirecting to login");
        router.push("/login");
      }
    } catch (err) {
      console.error("Error parsing user data:", err);
      router.push("/login");
    } finally {
      setLoadingUser(false); // ✅ สำคัญมาก! ต้องทำทุกกรณี
    }
  }, [router]);

  // ✅ โหลดโปรเจคเมื่อมี user
  useEffect(() => {
    if (!loadingUser && user) {
      fetchProjects();
    }
  }, [loadingUser, user]);

  if (loadingUser) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-[#0B1956] font-semibold">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return null; // จะ redirect ไป login
  }

  async function fetchProjects() {
    if (!user) return;
    console.log("🔍 Fetching projects for user:", user.idUser);

    const { data, error } = await supabase
      .from("portfolio")
      .select("*")
      .eq("idUser", user.idUser) // ✅ ใช้ idUser จาก localStorage
      .order("idProject", { ascending: false });

    if (error) {
      console.error("Error fetching projects:", error);
      alert("ไม่สามารถโหลดโปรเจคได้: " + error.message);
    } else {
      console.log("✅ Projects loaded:", data?.length || 0);
      setProjects(data || []);
    }
  }

  async function addProject(p) {
    if (!user) {
      alert("กรุณาเข้าสู่ระบบก่อน");
      router.push("/login");
      return false;
    }

    console.log("➕ Adding project for user:", user.idUser);

    try {
      const { data, error } = await supabase
        .from("portfolio")
        .insert([
          {
            idUser: user.idUser, // ✅ ใช้ idUser จาก localStorage
            projectName: p.projectName,
            Position: p.Position,
            Location: p.Location,
            Date: p.Date,
            Description: p.Description,
            Category: p.Category,
            Image: p.Image,
          },
        ])
        .select();

      if (error) {
        console.error("Error inserting project:", error);
        alert("ไม่สำเร็จ: " + error.message);
        return false;
      } else {
        console.log("✅ Project added successfully!");
        alert("เพิ่มโปรเจคสำเร็จ!");
        fetchProjects();
        return true;
      }
    } catch (err) {
      console.error("Unexpected error:", err);
      alert("เกิดข้อผิดพลาดที่ไม่คาดคิด: " + err.message);
      return false;
    }
  }

  async function deleteProject(id) {
    try {
      const { error } = await supabase
        .from("portfolio")
        .delete()
        .eq("idProject", id);

      if (error) {
        console.error("Error deleting project:", error);
        alert("ลบไม่สำเร็จ: " + error.message);
      } else {
        alert("ลบโปรเจคสำเร็จ!");
        fetchProjects();
      }
    } catch (err) {
      console.error("Unexpected error:", err);
      alert("เกิดข้อผิดพลาดที่ไม่คาดคิด");
    }
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-10 text-slate-900">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-xl font-extrabold text-[#0B1956]">My Project</h2>
        <Link
          href="/all-project"
          className="flex items-center gap-1 text-sm font-semibold text-[#0B1956]"
        >
          see more
          <Icon icon="heroicons:chevron-right" className="h-4 w-4" />
        </Link>
      </div>

      {user && (
        <div className="mb-4 text-sm text-green-600">
          ✓ เข้าสู่ระบบแล้วในชื่อ: {user.firstname} {user.lastname} ({user.email})
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <AddCard onClick={() => setOpen(true)} />
        {projects.map((p) => (
          <ProjectCard
            key={p.idProject}
            id={p.idProject}
            cover={p.Image}
            title={p.projectName}
            subtitle={p.Position}
            onDelete={() => deleteProject(p.idProject)}
          />
        ))}
      </div>

      <Modal open={open} onClose={() => setOpen(false)} onCreate={addProject} />
    </main>
  );
}