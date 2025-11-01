"use client";

import React, { useRef, useState, useEffect } from "react";
import Link from "next/link";
import { Icon } from "@iconify/react";
import Navbar from "@/components/Navbar";
import { supabase } from "../lib/supabaseClient";
import { User } from "lucide-react";

// Utility pill input styles reused across the form
const pill =
  "w-full rounded-full px-5 py-3 outline-none bg-gradient-to-b from-white to-[#E7EEFF] shadow-[inset_0_3px_16px_rgba(66,108,194,0.22)] text-[#0B1956] placeholder:opacity-70";
const pillSelect =
  "w-full appearance-none rounded-full px-5 py-3 pr-10 outline-none bg-gradient-to-b from-white to-[#E7EEFF] shadow-[inset_0_3px_16px_rgba(66,108,194,0.22)] text-[#0B1956]";

export default function AboutMePage() {
  const [profileUrl, setProfileUrl] = useState("/image/profile.jpg");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState(null);
  const [profileId, setProfileId] = useState(null);

  const [form, setForm] = useState({
    prefix: "Mrs.",
    firstname: "Phannaphat",
    lastname: "Mankhong",
    email: "phannaphat.mank@kmutt.ac.th",
    password: "password123",
    gpa: "",
    eduLevel: "",
    major: "",
    institution: "",
    faculty: "",
  });

  const [courseDraft, setCourseDraft] = useState({
    code: "",
    name: "",
    desc: "",
  });

  const [course, setCourse] = useState([]);

  const avatarInputRef = useRef(null);
  

  useEffect(() => {
    const storedUser = localStorage.getItem("currentUser");
    console.log("Stored user:", storedUser);

    if (!storedUser) {
      alert("กรุณาล็อกอินก่อนใช้งาน");
      window.location.href = "/login";
      return;
    }

    const parsedUser = JSON.parse(storedUser);
    console.log("Parsed user:", parsedUser);
    setUserId(parsedUser.idUser);

    // ดึงข้อมูลจาก Signin table ตาม idUser ที่เก็บไว้
    loadUserData(parsedUser.idUser);
  }, []);

  async function loadUserData(idUser) {
    try {
      // ดึงข้อมูลพื้นฐานจาก Signin table
      const { data: userData, error: userDataError } = await supabase
        .from("Signin")
        .select("Prefix, Firstname, Lastname, Email, password")
        .eq("idUser", idUser)
        .single();

      if (!userDataError && userData) {
        setForm(prev => ({
          ...prev,
          prefix: userData.Prefix || "",
          firstname: userData.Firstname || "",
          lastname: userData.Lastname || "",
          email: userData.Email || "",
          password: userData.password || "",
        }));
      }

      // ดึงข้อมูล Profile table
      const { data: profileData, error: profileError } = await supabase
        .from("Profile")
        .select("*")
        .eq("idUser", idUser)
        .single();

      if (!profileError && profileData) {
        setProfileId(profileData.idProfile);
        setForm(prev => ({
          ...prev,
          gpa: profileData.gpa || "",
          eduLevel: profileData.educationLevel || "",
          institution: profileData.institution || "",
          faculty: profileData.faculty || "",
          major: profileData.major || "",
        }));

        if (profileData.image) {
          setProfileUrl(profileData.image);
        }
      }

      // ดึงข้อมูล course table
      await loadCourse(idUser);

    } catch (error) {
      console.error("Error loading user data:", error);
      alert("เกิดข้อผิดพลาดในการโหลดข้อมูล");
    } finally {
      setLoading(false);
    }
  }

  async function loadCourse(uid) {
    const { data, error } = await supabase
      .from("course")
      .select("*")
      .eq("idUser", uid)
      .order("created_at", { ascending: false });

    if (!error && data) {
      setCourse(data.map(c => ({
        id: c.idCourse,
        code: c.courseCode,
        name: c.courseName,
        desc: c.courseDescription || "",
      })));
    }
  }

  function updateField(key, value) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function updateCourseDraft(key, value) {
    setCourseDraft((c) => ({ ...c, [key]: value }));
  }

async function addCourse(e) {
  e.preventDefault();
  
  console.log("Adding course with userId:", userId); // debug
  
  if (!courseDraft.code || !courseDraft.name) {
    alert("กรุณากรอก Course Code และ Course Name");
    return;
  }

  if (!userId) {
    alert("กรุณา login ก่อนใช้งาน");
    console.error("userId is null or undefined"); // debug
    return;
  }

  try {
    const courseData = {
      idUser: userId,
      courseCode: courseDraft.code,
      courseName: courseDraft.name,
      courseDescription: courseDraft.desc,
    };
    
    console.log("Inserting course data:", courseData); // debug
    
    const { data, error } = await supabase
      .from("course")
      .insert([courseData])
      .select();

    if (error) {
      console.error("Supabase error:", error); // debug
      throw error;
    }

    console.log("Insert success:", data); // debug

    if (data && data[0]) {
      setCourse((prev) => [
        {
          id: data[0].idCourse,
          code: data[0].courseCode,
          name: data[0].courseName,
          desc: data[0].courseDescription || "",
        },
        ...prev,
      ]);
    }

    setCourseDraft({ code: "", name: "", desc: "" });
    alert("เพิ่มวิชาเรียบร้อยแล้ว!");
  } catch (error) {
    console.error("Error adding course:", error);
    alert("เกิดข้อผิดพลาดในการเพิ่มวิชา: " + error.message);
  }
}

  async function handleAvatarChange(e) {
    const f = e.target.files?.[0];
    if (!f) return;

    if (!userId) {
      alert("กรุณา login ก่อนใช้งาน");
      return;
    }

    try {
      const fileExt = f.name.split(".").pop();
      const fileName = `${userId}-${Date.now()}.${fileExt}`;
      const filePath = `profiles/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, f);

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from("avatars")
        .getPublicUrl(filePath);

      const imageUrl = urlData.publicUrl;
      setProfileUrl(imageUrl);

      if (profileId) {
        await supabase
          .from("Profile")
          .update({ image: imageUrl })
          .eq("idProfile", profileId);
      }

      alert("อัพโหลดรูปเรียบร้อยแล้ว!");
    } catch (error) {
      console.error("Error uploading image:", error);
      //alert("เกิดข้อผิดพลาดในการอัพโหลดรูป");
      const url = URL.createObjectURL(f);
      setProfileUrl(url);
    }
  }

  async function onSubmitAll(e) {
    e.preventDefault();

    if (!userId) {
      alert("กรุณา login ก่อนใช้งาน");
      return;
    }

    try {
      if (form.gpa && (parseFloat(form.gpa) < 0 || parseFloat(form.gpa) > 4)) {
        alert("GPA ต้องอยู่ระหว่าง 0.00 - 4.00");
        return;
      }

      // Update Signin table
      const { error: userUpdateError } = await supabase
        .from("Signin")
        .update({
          Prefix: form.prefix,
          Firstname: form.firstname,
          Lastname: form.lastname,
          password: form.password,
        })
        .eq("idUser", userId);

      if (userUpdateError) throw userUpdateError;

      // Update หรือ Insert Profile table
      const profilePayload = {
        idUser: userId,
        gpa: form.gpa ? parseFloat(form.gpa) : null,
        educationLevel: form.eduLevel,
        institution: form.institution,
        faculty: form.faculty,
        major: form.major,
        image: profileUrl,
      };

      if (profileId) {
        const { error: profileError } = await supabase
          .from("Profile")
          .update(profilePayload)
          .eq("idProfile", profileId);

        if (profileError) throw profileError;
      } else {
        const { data, error: profileError } = await supabase
          .from("Profile")
          .insert([profilePayload])
          .select();

        if (profileError) throw profileError;
        if (data && data[0]) {
          setProfileId(data[0].idProfile);
        }
      }

      alert("บันทึกข้อมูลเรียบร้อยแล้ว!");
    } catch (error) {
      console.error("Error saving data:", error);
      alert("เกิดข้อผิดพลาดในการบันทึกข้อมูล: " + error.message);
    }
  }

  function onCancel() {
    if (confirm("คุณต้องการยกเลิกการแก้ไขและโหลดข้อมูลใหม่หรือไม่?")) {
      loadUserData(userId);
    }
  }

  async function deleteCourse(courseId) {
    if (!confirm("คุณต้องการลบวิชานี้หรือไม่?")) return;

    try {
      const { error } = await supabase
        .from("course")
        .delete()
        .eq("idCourse", courseId);

      if (error) throw error;

      setCourse(prev => prev.filter(c => c.id !== courseId));
      alert("ลบวิชาเรียบร้อยแล้ว!");
    } catch (error) {
      console.error("Error deleting course:", error);
      alert("เกิดข้อผิดพลาดในการลบวิชา");
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-[#0B1956] text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 py-6">
        {/* Back + title */}
        <div className="mb-4 flex items-center gap-3 text-[#0B1956]">
          <Link
            href="#"
            className="inline-flex items-center gap-1 rounded-full px-2 py-1 text-sm hover:bg-slate-100"
          >
            <Icon
              icon="eva:arrow-up-fill"
              style={{ transform: "rotate(-90deg)" }}
              width="24"
              height="24"
            />
          </Link>
          <h1 className="text-xl font-bold">AboutMe</h1>
        </div>

        {/* Outer Form Layout */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {/* LEFT COLUMN: Avatar + GPA + Add Course */}
          <div className="space-y-6">
            {/* Avatar card */}
            <div className="relative w-56">
              <div
                className="overflow-hidden rounded-[2.5rem] p-3 shadow-xl"
                style={{
                  backgroundColor: "rgba(255, 255, 255, 0.9)",
                  border: "4px solid rgba(66, 108, 194, 0.15)",
                  boxShadow: "0 0 15px rgba(66, 108, 194, 0.4)",
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={profileUrl}
                  alt="profile"
                  className="h-48 w-48 object-cover rounded-2xl"
                  style={{ margin: "0 auto", display: "block" }}
                />
              </div>

              <input
                ref={avatarInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="hidden"
              />

              <button
                type="button"
                onClick={() => avatarInputRef.current?.click()}
                className="absolute -bottom-1 right-1 grid h-9 w-9 place-items-center rounded-full bg-white text-[#426CC2] shadow-xl ring-2 ring-[#426CC2]/50"
                title="Change photo"
                aria-label="Change photo"
              >
                <Icon icon="flowbite:pen-outline" className="h-5 w-5" />
              </button>
            </div>

            {/* GPA */}
            <div className="max-w-sm">
              <label className="mb-1 block text-sm font-semibold text-[#0B1956]">
                GPA
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                max="4"
                className={pill}
                placeholder="Please enter GPA (0.00 - 4.00)"
                value={form.gpa}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value === "" || (value >= 0 && value <= 4)) {
                    updateField("gpa", value);
                  }
                }}
              />
            </div>

            {/* Add course */}
            <div className="rounded-2xl border border-[#426CC2]/30 p-4">
              <div className="mb-2 flex items-center justify-between">
                <h3 className="font-semibold text-[#0B1956]">Add your Course</h3>
                <button
                  type="button"
                  onClick={addCourse}
                  className="rounded-full px-2 py-1 text-2xl font-bold text-[#426CC2] leading-none"
                  title="Add course"
                >
                  +
                </button>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-semibold text-[#0B1956] mb-1">
                    Course Code
                  </label>
                  <input
                    className={pill}
                    placeholder="Enter course code"
                    value={courseDraft.code}
                    onChange={(e) =>
                      setCourseDraft((c) => ({ ...c, code: e.target.value }))
                    }
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[#0B1956] mb-1">
                    Course Name
                  </label>
                  <input
                    className={pill}
                    placeholder="Enter course name"
                    value={courseDraft.name}
                    onChange={(e) =>
                      setCourseDraft((c) => ({ ...c, name: e.target.value }))
                    }
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[#0B1956] mb-1">
                    Course Description
                  </label>
                  <textarea
                    rows={3}
                    className="w-full rounded-xl px-5 py-3 outline-none bg-gradient-to-b from-white to-[#E7EEFF] shadow-[inset_0_3px_16px_rgba(66,108,194,0.22)] text-[#0B1956]"
                    placeholder="Enter course description"
                    value={courseDraft.desc}
                    onChange={(e) =>
                      setCourseDraft((c) => ({ ...c, desc: e.target.value }))
                    }
                  />
                </div>

                <div className="flex gap-3 pt-1 justify-center">
                  <button
                    type="button"
                    onClick={() => setCourseDraft({ code: "", name: "", desc: "" })}
                    className="rounded-full bg-gradient-to-b from-white to-[#f3c8c6] px-4 py-2 font-semibold text-[#d9534f] shadow-[inset_0_3px_16px_rgba(0,0,0,0.1)]"
                  >
                    ยกเลิก
                  </button>

                  <button
                    type="button"
                    onClick={addCourse}
                    className="rounded-full bg-gradient-to-b from-white to-[#c6efd9] px-4 py-2 font-semibold text-[#5cb85c] shadow-[inset_0_3px_16px_rgba(0,0,0,0.1)]"
                  >
                    บันทึก
                  </button>
                </div>
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN */}
          <div className="md:col-span-2">
            <div className="space-y-5">
              {/* Row 1: Prefix / Firstname / Lastname */}
              <div className="flex gap-5">
                <div className="w-1/4 min-w-[100px]">
                  <label className="block mb-1 text-sm font-semibold text-[#0B1956]">
                    Prefix
                  </label>
                  <div className="relative">
                    <select
                      className={pillSelect}
                      value={form.prefix}
                      onChange={(e) => updateField("prefix", e.target.value)}
                    >
                      <option>Mr.</option>
                      <option>Ms.</option>
                      <option>Mrs.</option>
                    </select>
                    <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[#0B1956]/70">
                      <Icon icon="eva:arrow-up-fill" width="20" className="rotate-180" />
                    </span>
                  </div>
                </div>

                <div className="flex-1">
                  <label className="block mb-1 text-sm font-semibold text-[#0B1956]">
                    Firstname
                  </label>
                  <input
                    className={pill}
                    value={form.firstname}
                    onChange={(e) => updateField("firstname", e.target.value)}
                  />
                </div>

                <div className="flex-1">
                  <label className="block mb-1 text-sm font-semibold text-[#0B1956]">
                    Lastname
                  </label>
                  <input
                    className={pill}
                    value={form.lastname}
                    onChange={(e) => updateField("lastname", e.target.value)}
                  />
                </div>
              </div>

              {/* Row 2: Email / Password */}
              <div className="grid grid-cols-2 gap-5">
                <div>
                  <label className="block mb-1 text-sm font-semibold text-[#0B1956]">
                    E-mail
                  </label>
                  <input
                    className={pill}
                    type="email"
                    value={form.email}
                    onChange={(e) => updateField("email", e.target.value)}
                  />
                </div>

                <div>
                  <label className="block mb-1 text-sm font-semibold text-[#0B1956]">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      className={pill}
                      value={form.password}
                      onChange={(e) => updateField("password", e.target.value)}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#0B1956]/70"
                    >
                      <Icon
                        icon={showPassword ? "carbon:view-off" : "carbon:view"}
                        width="20"
                      />
                    </button>
                  </div>
                </div>
              </div>

              {/* Row 3: Education level / Institution */}
              <div className="grid grid-cols-2 gap-5">
                <div>
                  <label className="block mb-1 text-sm font-semibold text-[#0B1956]">
                    Education level
                  </label>
                  <div className="relative">
                    <select
                      className={pillSelect}
                      value={form.eduLevel}
                      onChange={(e) => updateField("eduLevel", e.target.value)}
                    >
                      <option value="">Select education level</option>
                      <option>Bachelor</option>
                      <option>Master</option>
                      <option>Ph.D.</option>
                    </select>
                    <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[#0B1956]/70">
                      <Icon icon="eva:arrow-up-fill" width="20" className="rotate-180" />
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block mb-1 text-sm font-semibold text-[#0B1956]">
                    Institution Name
                  </label>
                  <input
                    className={pill}
                    type="text"
                    placeholder="Enter institution name"
                    value={form.institution}
                    onChange={(e) => updateField("institution", e.target.value)}
                  />
                </div>
              </div>

              {/* Row 4: Faculty / Major */}
              <div className="grid grid-cols-2 gap-5">
                <div>
                  <label className="block mb-1 text-sm font-semibold text-[#0B1956]">
                    Faculty
                  </label>
                  <input
                    className={pill}
                    type="text"
                    placeholder="Enter faculty"
                    value={form.faculty}
                    onChange={(e) => updateField("faculty", e.target.value)}
                  />
                </div>

                <div>
                  <label className="block mb-1 text-sm font-semibold text-[#0B1956]">
                    Major
                  </label>
                  <input
                    className={pill}
                    type="text"
                    placeholder="Enter major"
                    value={form.major}
                    onChange={(e) => updateField("major", e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* My Course */}
            <div className="mt-6 rounded-2xl border border-[#426CC2]/30 p-4">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="font-semibold text-[#0B1956]">My Course</h3>
                <span className="text-sm text-[#0B1956]/60">
                  {course.length} items
                </span>
              </div>

              <div className="max-h-72 space-y-3 overflow-y-auto pr-1">
                {course.map((c, idx) => (
                  <article
                    key={c.id || idx}
                    className="rounded-full bg-gradient-to-b from-white to-[#E7EEFF] px-5 py-3 shadow-[inset_0_3px_16px_rgba(66,108,194,0.22)] relative group"
                  >
                    <div className="font-semibold text-[#0B1956]">
                      {c.code} {c.name}
                    </div>
                    <div className="text-sm text-[#0B1956]/80">{c.desc}</div>

                    <button
                      type="button"
                      onClick={() => deleteCourse(c.id)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity text-red-500 hover:text-red-700"
                      title="ลบวิชา"
                    >
                      <Icon icon="mdi:delete" width="20" />
                    </button>
                  </article>
                ))}
              </div>
            </div>

            {/* Bottom actions */}
            <div className="mt-8 flex items-center justify-center gap-10">
              <button
                type="button"
                onClick={onCancel}
                className="rounded-full bg-gradient-to-b from-white to-[#f3c8c6] px-8 py-3 text-lg font-extrabold text-[#d9534f] shadow-[inset_0_3px_16px_rgba(0,0,0,0.1)]"
              >
                ยกเลิก
              </button>
              <button
                type="button"
                onClick={onSubmitAll}
                className="rounded-full bg-gradient-to-b from-white to-[#c6efd9] px-8 py-3 text-lg font-extrabold text-[#5cb85c] shadow-[inset_0_3px_16px_rgba(0,0,0,0.1)]"
              >
                บันทึก
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}