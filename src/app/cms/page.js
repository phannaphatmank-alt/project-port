"use client";

import { useState, useEffect } from "react";
import { supabase } from "../lib/supabaseClient";

export default function CMS() {
  const [portfolio, setPortfolio] = useState([]);
  const [projectName, setProjectName] = useState("");
  const [position, setPosition] = useState("");
  const [location, setLocation] = useState("");
  const [date, setDate] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");

  useEffect(() => {
    fetchPosts();
  }, []);

  async function fetchPosts() {
    const { data, error } = await supabase
      .from("portfolio")
      .select("*")
      .order("idProject", { ascending: false });

    if (error) {
      console.error("Error fetching portfolio:", error);
    } else {
      setPortfolio(data);
    }
  }

  return (
    <>
      <h1>Post Management</h1>

      <form
        onSubmit={async (e) => {
          e.preventDefault();

          const { data, error } = await supabase.from("portfolio").insert([
            {
              projectName,
              Position: position,
              Location: location,
              Date: date,
              Description: description,
              Category: category,
            },
          ]);

          if (error) {
            console.error("Error inserting data:", error);
          } else {
            console.log("Data inserted:", data);
            setProjectName("");
            setPosition("");
            setLocation("");
            setDate("");
            setDescription("");
            setCategory("");
            fetchPosts();
          }
        }}
        style={{ marginBottom: "30px" }}
      >
        <input
          type="text"
          placeholder="Project Name"
          value={projectName}
          onChange={(e) => setProjectName(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Position"
          value={position}
          onChange={(e) => setPosition(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Location"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          required
        />
        <input
          type="date"
          placeholder="Date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required
        />
        <textarea
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          required
        />
        <button type="submit">Add Project</button>
      </form>

      <div>
        {portfolio.map((item) => (
          <div
            key={item.idProject}
            style={{
              marginBottom: "20px",
              border: "1px solid #ccc",
              padding: "10px",
              borderRadius: "8px",
            }}
          >
            <div><strong>Project Name:</strong> {item.projectName}</div>
            <div><strong>Position:</strong> {item.Position}</div>
            <div><strong>Location:</strong> {item.Location}</div>
            <div><strong>Date:</strong> {item.Date}</div>
            <div><strong>Description:</strong> {item.Description}</div>
            <div><strong>Category:</strong> {item.Category}</div>
          </div>
        ))}
      </div>
    </>
  );
}
