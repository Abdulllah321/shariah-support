"use client";
import { useState, useEffect } from "react";
import { db } from "@/firebase";
import { collection, addDoc, updateDoc, deleteDoc, doc, onSnapshot } from "firebase/firestore";
import { Button, Drawer, TextInput, Label, Textarea } from "flowbite-react";
import { HiPlus, HiPencil, HiTrash, HiX, HiBuildingOffice, HiUpload } from "react-icons/hi";

export default function MadarisCRUD() {
    const [madaris, setMadaris] = useState([]);
    const [madrasaData, setMadrasaData] = useState({ name: "", location: "", description: "", order: "" });
    const [editId, setEditId] = useState(null);
    const [showDrawer, setShowDrawer] = useState(false);
    const [bulkJson, setBulkJson] = useState("[]");

    const madarisCollection = collection(db, "madaris");

    useEffect(() => {
        const unsubscribe = onSnapshot(madarisCollection, (snapshot) => {
            setMadaris(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })).sort((a, b) => a.order - b.order));
        });
        return () => unsubscribe();
    }, []);

    const handleSave = async () => {
        if (!madrasaData.name || !madrasaData.location || !madrasaData.description || !madrasaData.order) return;

        if (editId) {
            const madrasaDoc = doc(db, "madaris", editId);
            await updateDoc(madrasaDoc, madrasaData);
        } else {
            await addDoc(madarisCollection, madrasaData);
        }

        setMadrasaData({ name: "", location: "", description: "", order: "" });
        setEditId(null);
        setShowDrawer(false);
    };

    const deleteMadrasa = async (id) => {
        await deleteDoc(doc(db, "madaris", id));
    };

    const handleBulkUpload = async () => {
        try {
            const data = JSON.parse(bulkJson);
            if (!Array.isArray(data)) throw new Error("Invalid JSON format");

            for (const item of data) {
                if (item.name && item.location && item.description && item.order) {
                    await addDoc(madarisCollection, item);
                }
            }
            setBulkJson("[]");
            alert("Bulk upload successful");
        } catch (error) {
            alert("Invalid JSON input");
        }
    };

    return (
        <div className="p-5 w-full min-h-screen">
            <h1 className="text-3xl font-bold text-teal-700 mb-4">Madaris Management</h1>

            <div className="flex space-x-2">
                <Button className={'bg-teal-700'} onClick={() => { setShowDrawer(true); setEditId(null); }}>
                    <HiPlus className="mr-2" /> Add New Madrasa
                </Button>
                {/*<Button className={'bg-teal-500'} onClick={handleBulkUpload}>*/}
                {/*    <HiUpload className="mr-2" /> Bulk Upload*/}
                {/*</Button>*/}
            </div>

            {/*<Textarea*/}
            {/*    className="mt-4 w-full h-40 border border-gray-300 rounded-md p-2"*/}
            {/*    placeholder="Paste JSON array here..."*/}
            {/*    value={bulkJson}*/}
            {/*    onChange={(e) => setBulkJson(e.target.value)}*/}
            {/*/>*/}

            <div className="overflow-x-auto mt-5">
                <table className="w-full text-sm text-left text-gray-500 bg-white shadow-md rounded-md">
                    <thead className="text-xs uppercase bg-teal-600 text-white">
                    <tr>
                        <th className="px-6 py-3">Order</th>
                        <th className="px-6 py-3">Name</th>
                        <th className="px-6 py-3">Location</th>
                        <th className="px-6 py-3">Description</th>
                        <th className="px-6 py-3">Actions</th>
                    </tr>
                    </thead>
                    <tbody>
                    {madaris.map((madrasa) => (
                        <tr key={madrasa.id} className="border-b hover:bg-gray-100">
                            <td className="px-6 py-3">{madrasa.order}</td>
                            <td className="px-6 py-3">{madrasa.name}</td>
                            <td className="px-6 py-3">{madrasa.location}</td>
                            <td className="px-6 py-3">{madrasa.description}</td>
                            <td className="px-6 py-3 flex space-x-2">
                                <Button className={'bg-yellow-400'} size="xs" onClick={() => { setMadrasaData(madrasa); setEditId(madrasa.id); setShowDrawer(true); }}>
                                    <HiPencil className="mr-1" /> Edit
                                </Button>
                                <Button className={'bg-red-600'} size="xs" onClick={() => deleteMadrasa(madrasa.id)}>
                                    <HiTrash className="mr-1" /> Delete
                                </Button>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>

            <Drawer open={showDrawer} onClose={() => setShowDrawer(false)} size="lg" position="right">
                <Drawer.Header title={editId ? "Edit Madrasa" : "Add New Madrasa"} titleIcon={HiBuildingOffice} />
                <Drawer.Items>
                    {Object.keys(madrasaData).map((key) => (
                        <div key={key} className="mb-6">
                            <Label htmlFor={key} className="mb-2 block capitalize">
                                {key.replace(/([A-Z])/g, " $1")}
                            </Label>
                            <TextInput
                                id={key}
                                placeholder={`Enter ${key}`}
                                value={madrasaData[key]}
                                onChange={(e) => setMadrasaData({ ...madrasaData, [key]: e.target.value })}
                            />
                        </div>
                    ))}
                    <Button onClick={handleSave} className="w-full bg-teal-600 text-white">
                        {editId ? "Update Madrasa" : "Add Madrasa"}
                    </Button>
                </Drawer.Items>
            </Drawer>
        </div>
    );
}
