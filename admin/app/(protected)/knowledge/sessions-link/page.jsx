"use client";

import { useState, useEffect } from "react";
import { db } from "@/firebase";
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  updateDoc,
} from "firebase/firestore";
import { FiTrash2, FiEdit, FiExternalLink } from "react-icons/fi";

export default function SessionLinkManager() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [link, setLink] = useState("");
  const [sessionLinks, setSessionLinks] = useState([]);
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetchSessionLinks();
  }, []);

  const fetchSessionLinks = async () => {
    const snapshot = await getDocs(collection(db, "session_links"));
    setSessionLinks(
      snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
    );
  };

  const handleSubmit = async () => {
    if (!title || !link) {
      alert("Title and Link are required!");
      return;
    }

    if (editingId) {
      await updateDoc(doc(db, "session_links", editingId), {
        title,
        description,
        link,
      });
    } else {
      await addDoc(collection(db, "session_links"), {
        title,
        description,
        link,
        createdAt: new Date(),
      });
    }

    setTitle("");
    setDescription("");
    setLink("");
    setEditingId(null);
    fetchSessionLinks();
    alert("Session Link saved successfully!");
  };

  const handleDelete = async (id) => {
    if (confirm("Are you sure you want to delete this item?")) {
      await deleteDoc(doc(db, "session_links", id));
      fetchSessionLinks();
    }
  };

  const handleEdit = (session) => {
    setEditingId(session.id);
    setTitle(session.title);
    setDescription(session.description);
    setLink(session.link);
  };

  const renderLinkPreview = (url) => {
    let embedUrl = url;

    // Handle YouTube Links
    if (url.includes("youtube.com") || url.includes("youtu.be")) {
      embedUrl = `https://www.youtube.com/embed/${
        url.split("v=")[1]?.split("&")[0]
      }`;
    }

    return (
      <iframe
        className="iframe-preview w-full h-full"
        src={embedUrl}
        allowFullScreen
      />
    );
  };

  return (
    <div className="container mx-auto max-w-4xl p-6 sm:p-8 bg-white shadow-2xl rounded-xl border border-gray-200 dark:bg-gray-900 dark:border-gray-800 h-max">
      <h2 className="text-3xl font-bold mb-6 sm:mb-8 text-teal-600 text-center">
        Session Link Manager
      </h2>

      {/* Input Fields */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
        <input
          type="text"
          placeholder="Enter Title (Required)"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="p-3 border rounded-lg shadow-sm focus:ring-2 focus:ring-teal-500 bg-gray-50 dark:bg-gray-800 dark:text-white w-full"
        />

        <input
          type="text"
          placeholder="Enter Link (Required)"
          value={link}
          onChange={(e) => setLink(e.target.value)}
          className="p-3 border rounded-lg shadow-sm focus:ring-2 focus:ring-teal-500 bg-gray-50 dark:bg-gray-800 dark:text-white w-full"
        />
      </div>

      <textarea
        className="w-full p-3 mt-4 border rounded-lg shadow-sm focus:ring-2 focus:ring-teal-500 bg-gray-50 dark:bg-gray-800 dark:text-white"
        placeholder="Enter Description (Optional)"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      ></textarea>

      <button
        className="w-full mt-6 py-2 sm:py-3 flex items-center justify-center gap-2 bg-teal-600 text-white font-semibold rounded-lg shadow-lg hover:bg-teal-700 transition-all duration-300"
        onClick={handleSubmit}
      >
        {editingId ? "Update" : "Add"} Session Link
      </button>

      {/* Session Link Cards */}
      <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
        {sessionLinks.length ? (
          sessionLinks.map((session) => (
            <div
              key={session.id}
              className="bg-gray-100 dark:bg-gray-800 p-4 sm:p-5 rounded-lg shadow-lg flex flex-col"
            >
              <p className="font-semibold text-gray-800 dark:text-white text-lg">
                {session.title}
              </p>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                {session.description}
              </p>

              {/* Link Preview Box */}
              <div className="mt-2 relative w-full h-32 sm:h-40 overflow-hidden rounded-lg border border-gray-300 dark:border-gray-700 shadow-md">
                {renderLinkPreview(session.link)}
              </div>

              {/* Action Buttons */}
              <div className="flex justify-between items-center mt-4">
                <button
                  className="text-yellow-500 hover:text-yellow-700"
                  onClick={() => handleEdit(session)}
                >
                  <FiEdit size={20} />
                </button>
                <a
                  href={session.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-teal-500 text-sm flex items-center gap-2"
                >
                  <FiExternalLink /> Open Link
                </a>
                <button
                  className="text-red-500 hover:text-red-700"
                  onClick={() => handleDelete(session.id)}
                >
                  <FiTrash2 size={20} />
                </button>
              </div>
            </div>
          ))
        ) : (
          <p className="text-center text-gray-500 col-span-2">
            No session links available.
          </p>
        )}
      </div>
    </div>
  );
}
