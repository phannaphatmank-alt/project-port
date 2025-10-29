"use client";

/* eslint-disable @next/next/no-img-element */

import { use, useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Icon } from "@iconify/react";
import Navbar from "@/components/Navbar";
import { supabase } from "../../lib/supabaseClient";


/* ---------- Reusable UI ---------- */
const capsuleBg =
  "bg-gradient-to-b from-white to-[#E7EEFF] shadow-[inset_0_3px_16px_rgba(66,108,194,0.22)]";

function InfoBox({ label, value, isEditing, fieldName, handleEditChange, type = "text" }) {
  return (
    <div className="mb-4 flex items-center space-x-4">
      <div
        className={`min-w-[120px] rounded-full px-4 py-2 text-center text-sm font-semibold text-[#0B1956] ${capsuleBg}`}
      >
        {label}:
      </div>
      {isEditing ? (
        <input
          type={type}
          value={value}
          onChange={(e) => handleEditChange(fieldName, e.target.value)}
          className={`flex-grow rounded-full px-5 py-2 outline-none ${capsuleBg}`}
        />
      ) : (
        <div className={`flex-grow rounded-full px-5 py-2 text-[#0B1956] ${capsuleBg}`}>{value || "—"}</div>
      )}
    </div>
  );
}

function DescriptionBox({ value, isEditing, fieldName, handleEditChange }) {
  return (
    <div className="mb-4">
      {isEditing ? (
        <textarea
          value={value}
          onChange={(e) => handleEditChange(fieldName, e.target.value)}
          rows={10}
          className={`w-full rounded-2xl px-5 py-3 outline-none ${capsuleBg}`}
        />
      ) : (
        <div className={`w-full whitespace-pre-wrap rounded-2xl px-5 py-3 text-[#0B1956] ${capsuleBg}`}>
          {value || "—"}
        </div>
      )}
    </div>
  );
}

/* ---------- Ellipsis Menu & Modals ---------- */
function EllipsisMenu({ onAdd, onDelete, onClose }) {
  return (
    <div className="absolute right-2 top-10 z-30 w-48 rounded-lg bg-white p-2 shadow-xl ring-1 ring-gray-200">
      <button
        onClick={() => {
          onAdd?.();
          onClose?.();
        }}
        className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm text-[#0B1956] hover:bg-gray-50"
      >
        <Icon icon="material-symbols:upload-rounded" className="h-4 w-4" />
        Add image(s)
      </button>
      <button
        onClick={() => {
          onDelete?.();
          onClose?.();
        }}
        className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50"
      >
        <Icon icon="heroicons:trash" className="h-4 w-4" />
        Delete image
      </button>
    </div>
  );
}

function CoverPickerModal({ open, images, onConfirm, onCancel }) {
  const [selected, setSelected] = useState(0);
  useEffect(() => {
    if (open) setSelected(0);
  }, [open]);
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100]">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onCancel} />
      <div className="absolute left-1/2 top-1/2 w-[860px] max-w-[92vw] -translate-x-1/2 -translate-y-1/2 rounded-3xl bg-white p-6 shadow-2xl">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-xl font-extrabold text-[#0B1956]">Choose a cover</h3>
          <button onClick={onCancel} className="rounded-full p-2 text-[#0B1956]/70 hover:bg-slate-100">
            <Icon icon="heroicons:x-mark" className="h-5 w-5" />
          </button>
        </div>

        {images.length === 0 ? (
          <div className={`rounded-2xl px-5 py-10 text-center text-[#0B1956]/70 ${capsuleBg}`}>
            No images selected.
          </div>
        ) : (
          <>
            <div className={`mb-4 overflow-hidden rounded-2xl ${capsuleBg}`}>
              <img src={images[selected]?.url} alt="selected-cover" className="max-h-[320px] w-full object-cover" />
            </div>
            <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelected(idx)}
                  className={`relative overflow-hidden rounded-xl ring-2 ${
                    selected === idx ? "ring-[#426CC2]" : "ring-transparent"
                  }`}
                >
                  <img src={img.url} alt={`opt-${idx}`} className="h-28 w-full object-cover" />
                  {selected === idx && (
                    <span className="absolute right-1 top-1 rounded-full bg-[#426CC2] px-2 py-0.5 text-[10px] font-bold text-white">
                      COVER
                    </span>
                  )}
                </button>
              ))}
            </div>
          </>
        )}

        <div className="mt-4 flex justify-center gap-16">
          <button
            onClick={onCancel}
            className="w-40 rounded-full bg-gradient-to-b from-white to-[#e46e63] px-5 py-2 font-semibold  shadow-[inset_0_3px_16px_rgba(0,0,0,0.1)] hover:to-[#d05c51]"
          >
            Cancel
          </button>
          <button
            onClick={() => onConfirm(selected)}
            className="w-40 rounded-full bg-gradient-to-b from-white to-[#6bd09e] px-5 py-2 font-semibold  shadow-[inset_0_3px_16px_rgba(0,0,0,0.1)] hover:to-[#5abd8c]"
          >
            Use this cover
          </button>
        </div>
      </div>
    </div>
  );
}

function DeletePickerModal({ open, images, defaultIndex = 0, onConfirm, onCancel }) {
  const [selected, setSelected] = useState(defaultIndex);
  useEffect(() => {
    if (open) setSelected(defaultIndex);
  }, [open, defaultIndex]);
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100]">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onCancel} />
      <div className="absolute left-1/2 top-1/2 w-[720px] max-w-[92vw] -translate-x-1/2 -translate-y-1/2 rounded-3xl bg-white p-6 shadow-2xl">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-xl font-extrabold text-[#0B1956]">Delete which image?</h3>
          <button onClick={onCancel} className="rounded-full p-2 text-[#0B1956]/70 hover:bg-slate-100">
            <Icon icon="heroicons:x-mark" className="h-5 w-5" />
          </button>
        </div>

        {images.length === 0 ? (
          <div className={`rounded-2xl px-5 py-10 text-center text-[#0B1956]/70 ${capsuleBg}`}>
            No images available.
          </div>
        ) : (
          <>
            <div className={`mb-4 overflow-hidden rounded-2xl ${capsuleBg}`}>
              <img src={images[selected]?.url} alt="selected-delete" className="max-h-[300px] w-full object-cover" />
            </div>
            <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelected(idx)}
                  className={`relative overflow-hidden rounded-xl ring-2 ${
                    selected === idx ? "ring-red-400" : "ring-transparent"
                  }`}
                  title={`Delete img ${idx + 1}`}
                >
                  <img src={img.url} alt={`del-${idx}`} className="h-24 w-full object-cover" />
                  {selected === idx && (
                    <span className="absolute right-1 top-1 rounded-full bg-red-500 px-2 py-0.5 text-[10px] font-bold text-white">
                      SELECTED
                    </span>
                  )}
                </button>
              ))}
            </div>
          </>
        )}

        <div className="mt-4 flex justify-center gap-16">
          <button
            onClick={onCancel}
            className="w-40 rounded-full bg-gradient-to-b from-white to-[#E7EEFF] px-5 py-2 font-semibold text-[#0B1956] shadow-[inset_0_3px_16px_rgba(66,108,194,0.22)]"
          >
            Cancel
          </button>
          <button
            onClick={() => onConfirm(selected)}
            className="w-40 rounded-full bg-gradient-to-b from-white to-[#e46e63] px-5 py-2 font-semibold shadow-[inset_0_3px_16px_rgba(0,0,0,0.1)] hover:to-[#d05c51]"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

/* ---------- Page ---------- */
export default function ProjectDetail({ params }) {
  const router = useRouter();
  const resolvedParams = use(params); const projectId = resolvedParams.id;
  

  const [project, setProject] = useState(null);
  const [isEditing] = useState(true);
  const [editedProject, setEditedProject] = useState(null);
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);

  const [menuOpen, setMenuOpen] = useState(false);
  const fileInputRef = useRef(null);
  const [coverPickerOpen, setCoverPickerOpen] = useState(false);
  const [pendingImages, setPendingImages] = useState([]);

  const [viewIndex, setViewIndex] = useState(0);
  const [deletePickerOpen, setDeletePickerOpen] = useState(false);

  const [user, setUser] = useState(null);

  // ✅ โหลด user จาก localStorage และ fetch ข้อมูล
  useEffect(() => {
    async function initializePage() {
      try {
        // 1. ตรวจสอบ user จาก localStorage
        const storedUser = localStorage.getItem("currentUser");
        
        if (!storedUser) {
          console.log("❌ ไม่พบข้อมูล user ใน localStorage");
          alert("กรุณาเข้าสู่ระบบก่อน");
          router.push("/login");
          return;
        }

        const parsedUser = JSON.parse(storedUser);
        console.log("✅ User loaded from localStorage:", parsedUser);
        
        // ตรวจสอบว่ามี idUser หรือไม่
        if (!parsedUser.idUser) {
          console.log("❌ ไม่พบ idUser");
          alert("ข้อมูล user ไม่ถูกต้อง กรุณาเข้าสู่ระบบใหม่");
          localStorage.removeItem("currentUser");
          router.push("/login");
          return;
        }

        setUser(parsedUser);

        // 2. Fetch project จาก Supabase
        console.log("🔍 Fetching project:", projectId, "for user:", parsedUser.idUser);
        
        const { data, error } = await supabase
          .from("portfolio")
          .select("*")
          .eq("idProject", projectId)
          .eq("idUser", parsedUser.idUser)
          .single();

        if (error) {
          console.error("❌ Error fetching project:", error);
          alert("ไม่พบโปรเจคนี้หรือคุณไม่มีสิทธิ์เข้าถึง");
          router.push("/Home");
          return;
        }

        if (!data) {
          console.log("❌ No project found");
          alert("ไม่พบโปรเจคนี้");
          router.push("/Home");
          return;
        }

        console.log("✅ Project loaded:", data);

        // 3. แปลงข้อมูลให้ตรงกับโค้ดเดิม
        const projectData = {
          id: data.idProject,
          title: data.projectName,
          subtitle: data.Position,
          cover: data.Image || "/images/default.jpg",
          category: data.Category,
          location: data.Location,
          date: data.Date,
          position: data.Position,
          description: data.Description,
        };

        setProject(projectData);
        setEditedProject({ ...projectData });

        // 4. ตั้งค่ารูปภาพ
        const initImages = projectData.cover 
          ? [{ url: projectData.cover, isNew: false }] 
          : [];
        setImages(initImages);
        setViewIndex(0);

      } catch (err) {
        console.error("❌ Unexpected error:", err);
        alert("เกิดข้อผิดพลาด: " + err.message);
        router.push("/Home");
      } finally {
        setLoading(false);
      }
    }

    initializePage();
  }, [projectId, router]);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main className="flex min-h-screen items-center justify-center text-xl text-[#0B1956]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#426CC2] border-t-transparent mx-auto mb-4"></div>
            <p>Loading...</p>
          </div>
        </main>
      </div>
    );
  }

  // Project not found state
  if (!project || !editedProject) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main className="flex min-h-screen items-center justify-center text-xl text-[#0B1956]">
          <div className="text-center">
            <p className="mb-4">Project Not Found</p>
            <Link 
              href="/Home"
              className="text-[#426CC2] hover:underline"
            >
              กลับไปหน้าหลัก
            </Link>
          </div>
        </main>
      </div>
    );
  }

  const handleEditChange = (field, value) =>
    setEditedProject((prev) => ({ ...prev, [field]: value }));

  /* ----- Add images ----- */
  const openAddImages = () => {
    fileInputRef.current?.click();
  };

const bucketName = "avatars"; // ชื่อ bucket จริง

const onFilesSelected = async (e) => {
  const files = Array.from(e.target.files || []);
  if (!files.length) return;

  const previews = files.map((f) => ({ url: URL.createObjectURL(f), file: f, isNew: true }));
  setPendingImages(previews);
  setCoverPickerOpen(true);

  e.target.value = "";
};

const confirmCoverSelection = async (selectedIndex) => {
  if (pendingImages.length === 0) {
    setCoverPickerOpen(false);
    return;
  }

  const next = [...pendingImages];
  const [picked] = next.splice(selectedIndex, 1);

  try {
    if (picked.isNew && picked.file) {
      const filePath = `project/${Date.now()}_${picked.file.name}`; // ใส่ timestamp ป้องกันชื่อซ้ำ
      const { data, error } = await supabase.storage
        .from(avatars)
        .upload(filePath, picked.file, { upsert: true });

      if (error) throw error;

      const { publicUrl } = supabase.storage.from(avatars).getPublicUrl(data.path);
      picked.url = publicUrl;
      picked.isNew = false;
    }

    setImages([picked, ...images]);
    setPendingImages([]);
    setViewIndex(0);
  } catch (err) {
    console.error("❌ Upload failed:", err);
    alert("เกิดข้อผิดพลาดในการอัปโหลดรูป: " + err.message);
  } finally {
    setCoverPickerOpen(false);
  }
};



  /* ----- Delete image ----- */
  const openDeleteModal = () => {
    if (images.length === 0) return;
    setDeletePickerOpen(true);
  };

  const confirmDeleteSelection = (deleteIndex) => {
    if (deleteIndex < 0 || deleteIndex >= images.length) {
      setDeletePickerOpen(false);
      return;
    }
    setImages((prev) => {
      const next = prev.filter((_, i) => i !== deleteIndex);
      if (next.length === 0) return next;
      const newIndex = Math.min(viewIndex, next.length - 1);
      setViewIndex(newIndex);
      return next;
    });
    setDeletePickerOpen(false);
  };

  /* ----- Carousel control ----- */
  const canPrev = images.length > 1;
  const canNext = images.length > 1;
  const prevImage = () => {
    if (!canPrev) return;
    setViewIndex((i) => (i - 1 + images.length) % images.length);
  };
  const nextImage = () => {
    if (!canNext) return;
    setViewIndex((i) => (i + 1) % images.length);
  };

  /* ----- Save / Cancel ----- */
  const handleSave = async () => {
    if (!user || !user.idUser) {
      alert("ไม่พบข้อมูล user กรุณาเข้าสู่ระบบใหม่");
      router.push("/login");
      return;
    }

    try {
      console.log("💾 Saving project:", projectId, "for user:", user.idUser);
      
      const urls = images.map((x) => x.url);
      const updatedData = {
        projectName: editedProject.title,
        Position: editedProject.position,
        Location: editedProject.location,
        Date: editedProject.date,
        Description: editedProject.description,
        Category: editedProject.category,
        Image: urls[0] || "",
      };

      const { error } = await supabase
        .from("portfolio")
        .update(updatedData)
        .eq("idProject", projectId)
        .eq("idUser", user.idUser);

      if (error) {
        console.error("❌ Error updating project:", error);
        alert("บันทึกไม่สำเร็จ: " + error.message);
        return;
      }

      console.log("✅ Project saved successfully");
      alert("บันทึกสำเร็จ!");
      router.push("/Home");
    } catch (err) {
      console.error("❌ Unexpected error:", err);
      alert("เกิดข้อผิดพลาด: " + err.message);
    }
  };

  const handleCancel = () => {
    router.push("/Home");
  };

  const displayDate = (dateString) => {
    if (!dateString) return "—";
    try {
      const [y, m, d] = dateString.split("-");
      return isEditing ? dateString : `${d}/${m}/${y}`;
    } catch {
      return dateString;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="mx-auto max-w-6xl px-4 py-10 text-slate-900">
        {/* Back button */}
        <div className="mb-8">
          <Link href="/Home" className="flex items-center gap-2 text-lg font-semibold text-[#0B1956]">
            <Icon icon="eva:arrow-left-fill" className="h-5 w-5" />
            My Project
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          {/* Left Column */}
          <div>
            <InfoBox
              label="Project Name"
              value={isEditing ? editedProject.title : project.title}
              isEditing={isEditing}
              fieldName="title"
              handleEditChange={handleEditChange}
            />

            {/* รูปหลัก + Carousel + จุดสามจุด */}
            <div className={`relative mb-8 overflow-hidden rounded-2xl ${capsuleBg}`}>
              <img
                src={images[viewIndex]?.url || editedProject.cover || "/images/default.jpg"}
                alt={project.title}
                className="w-full max-h-[380px] rounded-2xl object-cover"
              />

              {/* ปุ่มเลื่อนซ้าย/ขวา */}
              {images.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-white/80 p-2 shadow hover:bg-white"
                  >
                    <Icon icon="heroicons:chevron-left" className="h-5 w-5 text-[#0B1956]" />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-white/80 p-2 shadow hover:bg-white"
                  >
                    <Icon icon="heroicons:chevron-right" className="h-5 w-5 text-[#0B1956]" />
                  </button>

                  {/* dots */}
                  <div className="pointer-events-none absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
                    {images.map((_, idx) => (
                      <span
                        key={idx}
                        className={`h-1.5 w-1.5 rounded-full ${idx === viewIndex ? "bg-[#0B1956]" : "bg-white/70"}`}
                      />
                    ))}
                  </div>
                </>
              )}

              {/* จุดสามจุด */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setMenuOpen((v) => !v);
                }}
                className="absolute right-2 top-2 z-20 rounded-full p-1 text-[#0B1956] hover:bg-white/70"
              >
                <Icon icon="heroicons:ellipsis-vertical-20-solid" className="h-5 w-5" />
              </button>

              {menuOpen && (
                <>
                  <EllipsisMenu
                    onAdd={openAddImages}
                    onDelete={openDeleteModal}
                    onClose={() => setMenuOpen(false)}
                  />
                  <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
                </>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={onFilesSelected}
              />
            </div>

            <InfoBox
              label="Location"
              value={isEditing ? editedProject.location : project.location}
              isEditing={isEditing}
              fieldName="location"
              handleEditChange={handleEditChange}
            />
            <InfoBox
              label="Date"
              value={isEditing ? editedProject.date : displayDate(project.date)}
              isEditing={isEditing}
              fieldName="date"
              handleEditChange={handleEditChange}
              type={isEditing ? "date" : "text"}
            />
            <InfoBox
              label="Position"
              value={isEditing ? editedProject.position : project.position}
              isEditing={isEditing}
              fieldName="position"
              handleEditChange={handleEditChange}
            />
          </div>

          {/* Right Column */}
          <div>
            <div className="mb-4">
              <div className={`inline-block min-w-[120px] rounded-full px-4 py-2 text-center text-sm font-semibold text-[#0B1956] ${capsuleBg}`}>
                Description
              </div>
            </div>

            <DescriptionBox
              value={isEditing ? editedProject.description : project.description}
              isEditing={isEditing}
              fieldName="description"
              handleEditChange={handleEditChange}
            />

            {/* Action Buttons */}
            <div className="mt-8">
              <div className="flex items-center justify-between px-10 py-4">
                <button
                  onClick={handleCancel}
                  className="rounded-full bg-gradient-to-b from-white to-[#e46e63] px-6 py-3 text-sm font-bold shadow-[inset_0_3px_16px_rgba(0,0,0,0.1)] hover:to-[#d05c51]"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="rounded-full bg-gradient-to-b from-white to-[#6bd09e] px-6 py-3 text-sm font-bold shadow-[inset_0_3px_16px_rgba(0,0,0,0.1)] hover:to-[#5abd8c]"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Modals */}
        <CoverPickerModal
          open={coverPickerOpen}
          images={pendingImages}
          onConfirm={confirmCoverSelection}
          onCancel={() => setCoverPickerOpen(false)}
        />

        <DeletePickerModal
          open={deletePickerOpen}
          images={images}
          defaultIndex={viewIndex}
          onConfirm={confirmDeleteSelection}
          onCancel={() => setDeletePickerOpen(false)}
        />
      </main>
    </div>
  );
}