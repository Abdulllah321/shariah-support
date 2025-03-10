"use client";

import { useState, useEffect } from "react";
import { getDownloadURL, ref, uploadBytesResumable, deleteObject } from "firebase/storage";
import { db, storage } from "@/firebase";
import { collection, addDoc, getDocs, deleteDoc, doc, updateDoc } from "firebase/firestore";
import { useDropzone } from "react-dropzone";
import { FiTrash2, FiEdit, FiUpload, FiFilePlus, FiFileText, FiVideo, FiImage } from "react-icons/fi";

export default function ProcessFlowUploader() {
    const [file, setFile] = useState(null);
    const [description, setDescription] = useState("");
    const [uploading, setUploading] = useState(false);
    const [preview, setPreview] = useState(null);
    const [fileType, setFileType] = useState(null);
    const [processFlows, setProcessFlows] = useState([]);
    const [editingId, setEditingId] = useState(null);

    useEffect(() => {
        fetchProcessFlows();
    }, []);

    const fetchProcessFlows = async () => {
        const snapshot = await getDocs(collection(db, "process_flows"));
        setProcessFlows(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    };

    const onDrop = (acceptedFiles) => {
        const selectedFile = acceptedFiles[0];

        if (selectedFile.size > 2 * 1024 * 1024) {
            alert("File size must be under 2MB");
            return;
        }

        setFile(selectedFile);
        setFileType(selectedFile.type);

        if (selectedFile.type.startsWith("image/")) {
            setPreview(URL.createObjectURL(selectedFile));
        } else {
            setPreview(null);
        }
    };

    const { getRootProps, getInputProps } = useDropzone({
        onDrop,
        accept: "image/*, video/*, application/pdf, .docx",
        maxSize: 2 * 1024 * 1024,
    });

    const handleUpload = async () => {
        if (!file || !description) {
            alert("Please select a file and enter a description");
            return;
        }
        setUploading(true);

        const formData = new FormData();
        formData.append("file", file);
        formData.append("upload_preset", process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET);
        formData.append("folder", "process_flows"); // 🔹 یہاں اپنا فولڈر کا نام دیں

        try {
            const response = await fetch(`https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/upload`, {
                method: "POST",
                body: formData,
            });
            const data = await response.json();
            const fileUrl = data.secure_url;

            if (editingId) {
                await updateDoc(doc(db, "process_flows", editingId), { description, fileUrl, fileType });
            } else {
                await addDoc(collection(db, "process_flows"), { description, fileUrl, fileType, createdAt: new Date() });
            }

            setFile(null);
            setPreview(null);
            setDescription("");
            setFileType(null);
            setEditingId(null);
            fetchProcessFlows();
            alert("File uploaded successfully!");
        } catch (error) {
            console.error("Upload failed", error);
            alert("Upload failed");
        }
        setUploading(false);
    };

    const handleDelete = async (id, fileUrl) => {
        if (confirm("Are you sure you want to delete this item?")) {
            await deleteDoc(doc(db, "process_flows", id));
            const fileRef = ref(storage, fileUrl);
            await deleteObject(fileRef);
            fetchProcessFlows();
        }
    };

    const handleEdit = (flow) => {
        setEditingId(flow.id);
        setDescription(flow.description);
        setFileType(flow.fileType);
        setPreview(flow.fileUrl);
    };

    const renderFilePreview = () => {
        if (!file) return null;

        if (fileType.startsWith("image/")) {
            return <img src={preview} alt="Preview" className="w-full max-h-40 object-contain rounded-lg shadow-md" />;
        } else if (fileType.startsWith("video/")) {
            return <FiVideo size={40} className="text-blue-500 mx-auto" />;
        } else if (fileType === "application/pdf") {
            return <FiFileText size={40} className="text-red-500 mx-auto" />;
        } else {
            return <FiFilePlus size={40} className="text-gray-500 mx-auto" />;
        }
    };

    return (
        <div className="p-6 bg-white shadow-2xl rounded-xl border border-gray-200 dark:bg-gray-900 dark:border-gray-800 transition-all duration-300 h-max">
        <h2 className="text-2xl font-bold mb-6 text-teal-600 text-center">Process Flow Manager</h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* File Upload Section */}
          <div>
            <div {...getRootProps()} className="border-2 border-dashed p-6 sm:p-8 text-center rounded-lg cursor-pointer bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 hover:shadow-md transition-all duration-300">
              <input {...getInputProps()} />
              {renderFilePreview()}
              {!preview && (
                <p className="text-gray-500 dark:text-gray-400 flex items-center justify-center gap-2 text-sm sm:text-base">
                  <FiFilePlus size={20} /> Drag & drop a file here, or click to select
                </p>
              )}
            </div>
      
            <textarea
              className="w-full p-3 mt-4 border rounded-lg shadow-sm focus:ring-2 focus:ring-teal-500 focus:outline-none bg-gray-50 dark:bg-gray-800 dark:text-white text-sm sm:text-base"
              placeholder="Enter description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            ></textarea>
      
            <button
              className="w-full mt-4 py-2 sm:py-3 flex items-center justify-center gap-2 bg-teal-600 text-white font-semibold rounded-lg shadow-lg hover:bg-teal-700 transition-all duration-300 disabled:opacity-50 text-sm sm:text-base"
              onClick={handleUpload}
              disabled={uploading}
            >
              {uploading ? "Uploading..." : (
                <>
                  <FiUpload size={20} />
                  {editingId ? "Update" : "Upload"} Process Flow
                </>
              )}
            </button>
          </div>
      
          {/* Process Flows List */}
          <div className="sm:col-span-1 lg:col-span-2 mt-6 sm:mt-0">
            {processFlows.length ? processFlows.map(flow => {
              const fileName = decodeURIComponent(flow.fileUrl.split('/').pop().split('?')[0]);
              const fileExtension = fileName.split('.').pop().toUpperCase();
      
              return (
                <div key={flow.id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-gray-100 dark:bg-gray-800 p-4 rounded-lg shadow-md mt-4">
                  <div className="flex flex-col w-full sm:w-auto">
                    <p className="font-semibold text-gray-800 dark:text-white">{flow.description}</p>
                    <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm">
                      {fileName} <span className="bg-blue-500 text-white px-2 py-1 rounded text-xs">{fileExtension}</span>
                    </p>
                    <a href={flow.fileUrl} target="_blank" rel="noopener noreferrer" className="text-teal-500 text-sm mt-1">View File</a>
                  </div>
                  <div className="flex gap-3 mt-3 sm:mt-0">
                    <button className="text-yellow-500 hover:text-yellow-700" onClick={() => handleEdit(flow)}>
                      <FiEdit size={20} />
                    </button>
                    <button className="text-red-500 hover:text-red-700" onClick={() => handleDelete(flow.id, flow.fileUrl)}>
                      <FiTrash2 size={20} />
                    </button>
                  </div>
                </div>
              );
            }) : (
              <p className="text-center text-gray-500">No process flows found.</p>
            )}
          </div>
        </div>
      </div>
      
    );
}
