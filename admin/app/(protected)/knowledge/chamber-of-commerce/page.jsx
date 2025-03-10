"use client";

import {useState, useEffect} from "react";
import {collection, addDoc, getDocs, deleteDoc, doc, updateDoc} from "firebase/firestore";
import {db} from "@/firebase";

export default function ChamberDocManager() {
    const [chambers, setChambers] = useState([]);
    const [name, setName] = useState("");
    const [chairman, setChairman] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [website, setWebsite] = useState("");
    const [editingId, setEditingId] = useState(null);

    useEffect(() => {
        fetchChambers();
    }, []);

    const fetchChambers = async () => {
        const snapshot = await getDocs(collection(db, "chambers"));
        setChambers(snapshot.docs.map(doc => ({id: doc.id, ...doc.data()})));
    };

    const handleSubmit = async () => {
        if (!name || !chairman || !email || !phone || !website) {
            alert("All fields are required");
            return;
        }

        if (editingId) {
            await updateDoc(doc(db, "chambers", editingId), {name, chairman, email, phone, website});
        } else {
            await addDoc(collection(db, "chambers"), {name, chairman, email, phone, website});
        }

        setName("");
        setChairman("");
        setEmail("");
        setPhone("");
        setWebsite("");
        setEditingId(null);
        fetchChambers();
    };

    const handleDelete = async (id) => {
        if (confirm("Are you sure you want to delete this chamber?")) {
            await deleteDoc(doc(db, "chambers", id));
            fetchChambers();
        }
    };

    const handleEdit = (chamber) => {
        setEditingId(chamber.id);
        setName(chamber.name);
        setChairman(chamber.chairman);
        setEmail(chamber.email);
        setPhone(chamber.phone);
        setWebsite(chamber.website);
    };

    return (
        <div
            className="p-6  w-full rounded-xl h-full transition-all duration-300 h-max">
            <h2 className="text-2xl font-bold mb-6 text-teal-600 text-center">Chamber of Commerce Manager</h2>
            <div className='grid  grid-cols-1 gap-6 bg-white rounded-lg shadow-lg p-4'>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input type="text" placeholder="Chamber Name" value={name} onChange={(e) => setName(e.target.value)}
                           className="w-full p-2 border rounded"/>
                    <input type="text" placeholder="Chairman Name" value={chairman}
                           onChange={(e) => setChairman(e.target.value)} className="w-full p-2 border rounded"/>
                </div>
                <div >
                    <h3 className="text-base mb-2 font-semibold text-center">Contact Information</h3>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)}
                               className="w-full p-2 border rounded mb-2"/>
                        <input type="text" placeholder="Phone" value={phone} onChange={(e) => setPhone(e.target.value)}
                               className="w-full p-2 border rounded mb-2"/>
                        <input type="text" placeholder="Website" value={website}
                               onChange={(e) => setWebsite(e.target.value)} className="w-full p-2 border rounded mb-2"/>
                    </div>
                        <button className="w-full mt-4 py-2 bg-teal-600 text-white font-semibold rounded-lg"
                                onClick={handleSubmit}>{editingId ? "Update" : "Add"} Chamber
                        </button>
                </div>
            </div>
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {chambers.map((chamber) => (
                    <div key={chamber.id} className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200 dark:bg-gray-900 dark:border-gray-800 transition-all duration-300 hover:shadow-xl">
                        {/* Chamber Name & Chairman */}
                        <div className="flex flex-col gap-2">
                            <p className="text-xl font-bold text-gray-800 dark:text-white">{chamber.name}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Chairman: <span className="font-medium">{chamber.chairman}</span></p>
                        </div>

                        {/* Contact Information */}
                        <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg shadow-sm">
                            <h4 className="text-md font-semibold text-gray-700 dark:text-gray-300">📌 Contact Information</h4>
                            <p className="text-sm flex items-center gap-2">
                                📧 <span className="select-all">{chamber.email}</span>
                            </p>
                            <p className="text-sm flex items-center gap-2">
                                📞 <span className="select-all">{chamber.phone}</span>
                            </p>
                            <p className="text-sm flex items-center gap-2">
                                🌍 <a href={chamber.website} target="_blank" rel="noopener noreferrer" className="text-teal-500 select-all hover:underline">{chamber.website}</a>
                            </p>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-3 mt-4">
                            <button className="px-3 py-1 text-yellow-600 font-medium bg-yellow-100 hover:bg-yellow-200 rounded-lg transition-all duration-200" onClick={() => handleEdit(chamber)}>✏️ Edit</button>
                            <button className="px-3 py-1 text-red-600 font-medium bg-red-100 hover:bg-red-200 rounded-lg transition-all duration-200" onClick={() => handleDelete(chamber.id)}>🗑 Delete</button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
